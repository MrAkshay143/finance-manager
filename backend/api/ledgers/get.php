<?php
/**
 * Get Ledger API
 * Fetches a single ledger by ID
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

// Check if ID parameter is provided
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Ledger ID is required'
    ]);
    exit;
}

$ledgerId = (int)$_GET['id'];

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    // Get ledger by ID with joined group info
    $query = "
        SELECT 
            l.*,
            g.name as group_name,
            g.type as group_type
        FROM 
            ledgers l
        LEFT JOIN 
            ledger_groups g ON l.group_id = g.id
        WHERE 
            l.id = ?
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $ledgerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ledger not found'
        ]);
        exit;
    }
    
    $ledger = $result->fetch_assoc();
    
    // Return the ledger data
    echo json_encode([
        'success' => true,
        'data' => $ledger
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 