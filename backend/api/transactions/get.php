<?php
/**
 * Get Transaction API
 * Fetches a single transaction by ID
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
        'message' => 'Transaction ID is required'
    ]);
    exit;
}

$transactionId = (int)$_GET['id'];

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    // Get transaction by ID with joined ledger info
    $query = "
        SELECT 
            t.*,
            dl.name as debit_ledger_name,
            cl.name as credit_ledger_name,
            dl.group_id as debit_group_id,
            cl.group_id as credit_group_id,
            dlg.name as debit_group_name,
            clg.name as credit_group_name
        FROM 
            transactions t
        LEFT JOIN 
            ledgers dl ON t.debit_ledger_id = dl.id
        LEFT JOIN 
            ledgers cl ON t.credit_ledger_id = cl.id
        LEFT JOIN 
            ledger_groups dlg ON dl.group_id = dlg.id
        LEFT JOIN 
            ledger_groups clg ON cl.group_id = clg.id
        WHERE 
            t.id = ?
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $transactionId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Transaction not found'
        ]);
        exit;
    }
    
    $transaction = $result->fetch_assoc();
    
    // Return the transaction data
    echo json_encode([
        'success' => true,
        'data' => $transaction
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 