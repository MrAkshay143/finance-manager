<?php
/**
 * Ledger Groups API
 * Get all ledger groups
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
        // Get all ledger groups
        $stmt = $db->prepare("
            SELECT * FROM ledger_groups
            ORDER BY class, name
        ");
        $stmt->execute();
        $groups = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'message' => 'Ledger groups retrieved successfully',
            'data' => $groups
        ]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new ledger group
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['type']) || !isset($data['class'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Name, type, and class are required'
            ]);
            exit;
        }
        
        // Validate class
        $allowedClasses = ['asset', 'liability', 'equity', 'income', 'expense'];
        if (!in_array($data['class'], $allowedClasses)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid class. Must be one of: ' . implode(', ', $allowedClasses)
            ]);
            exit;
        }
        
        // Begin transaction
        $db->beginTransaction();
        
        // Insert new group
        $stmt = $db->prepare("
            INSERT INTO ledger_groups (name, type, class, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $data['name'],
            $data['type'],
            $data['class']
        ]);
        
        $groupId = $db->lastInsertId();
        
        // Commit transaction
        $db->commit();
        
        // Get the new group
        $stmt = $db->prepare("SELECT * FROM ledger_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Ledger group created successfully',
            'data' => $group
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
    
    error_log('Ledger groups API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
} 