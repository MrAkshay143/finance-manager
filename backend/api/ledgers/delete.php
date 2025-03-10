<?php
/**
 * Delete Ledger API
 * Deletes a single ledger by ID
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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
    
    // Check if the ledger exists
    $checkStmt = $db->prepare("SELECT id FROM ledgers WHERE id = ?");
    $checkStmt->bind_param('i', $ledgerId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ledger not found'
        ]);
        exit;
    }
    
    // Check if the ledger has any transactions
    $transactionCheckStmt = $db->prepare("
        SELECT COUNT(*) as transaction_count 
        FROM transactions 
        WHERE debit_ledger_id = ? OR credit_ledger_id = ?
    ");
    
    $transactionCheckStmt->bind_param('ii', $ledgerId, $ledgerId);
    $transactionCheckStmt->execute();
    $transactionCheckResult = $transactionCheckStmt->get_result();
    $transactionCount = $transactionCheckResult->fetch_assoc()['transaction_count'];
    
    if ($transactionCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete ledger that has transactions. Delete all associated transactions first.'
        ]);
        exit;
    }
    
    // Check if the ledger has a non-zero balance
    $balanceCheckStmt = $db->prepare("
        SELECT opening_balance 
        FROM ledgers 
        WHERE id = ? AND opening_balance != 0
    ");
    
    $balanceCheckStmt->bind_param('i', $ledgerId);
    $balanceCheckStmt->execute();
    $balanceCheckResult = $balanceCheckStmt->get_result();
    
    if ($balanceCheckResult->num_rows > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete ledger with non-zero balance.'
        ]);
        exit;
    }
    
    // Delete the ledger
    $deleteStmt = $db->prepare("DELETE FROM ledgers WHERE id = ?");
    $deleteStmt->bind_param('i', $ledgerId);
    $result = $deleteStmt->execute();
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Ledger deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete ledger: ' . $db->error
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 