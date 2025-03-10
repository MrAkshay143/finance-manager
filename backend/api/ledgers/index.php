<?php
/**
 * Ledgers API
 * Get all ledgers or ledgers by group
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if user is authenticated
if (!isset($_COOKIE['session_token'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not authenticated'
    ]);
    exit;
}

// Get session data
$session = getSession($_COOKIE['session_token']);
if (!$session) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or expired session'
    ]);
    exit;
}

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get query parameters
        $type = isset($_GET['type']) ? $_GET['type'] : 'all';
        
        if ($type === 'all') {
            // Get all ledgers with group info
            $stmt = $db->prepare("
                SELECT l.*, g.name as group_name, g.type as group_type, g.class as group_class
                FROM ledgers l
                JOIN ledger_groups g ON l.group_id = g.id
                ORDER BY g.name, l.name
            ");
            $stmt->execute();
        } else {
            // Get ledgers by group type
            $stmt = $db->prepare("
                SELECT l.*, g.name as group_name, g.type as group_type, g.class as group_class
                FROM ledgers l
                JOIN ledger_groups g ON l.group_id = g.id
                WHERE g.type = ?
                ORDER BY g.name, l.name
            ");
            $stmt->execute([$type]);
        }
        
        $ledgers = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'message' => 'Ledgers retrieved successfully',
            'data' => $ledgers
        ]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new ledger
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['group_id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Name and group_id are required'
            ]);
            exit;
        }
        
        // Begin transaction
        $db->beginTransaction();
        
        // Check if group exists
        $stmt = $db->prepare("SELECT id FROM ledger_groups WHERE id = ?");
        $stmt->execute([$data['group_id']]);
        
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Group not found'
            ]);
            exit;
        }
        
        // Insert new ledger
        $stmt = $db->prepare("
            INSERT INTO ledgers (name, account_number, group_id, opening_balance, current_balance, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $data['name'],
            isset($data['account_number']) ? $data['account_number'] : null,
            $data['group_id'],
            isset($data['opening_balance']) ? $data['opening_balance'] : 0,
            isset($data['opening_balance']) ? $data['opening_balance'] : 0
        ]);
        
        $ledgerId = $db->lastInsertId();
        
        // Commit transaction
        $db->commit();
        
        // Get the new ledger
        $stmt = $db->prepare("
            SELECT l.*, g.name as group_name, g.type as group_type, g.class as group_class
            FROM ledgers l
            JOIN ledger_groups g ON l.group_id = g.id
            WHERE l.id = ?
        ");
        $stmt->execute([$ledgerId]);
        $ledger = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Ledger created successfully',
            'data' => $ledger
        ]);
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
    }
} catch (Exception $e) {
    // Rollback transaction if in progress
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    error_log('Ledgers API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
} 