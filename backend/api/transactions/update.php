<?php
/**
 * Update Transaction API
 * Updates a single transaction by ID
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

// Get JSON request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

// Validate request data
if (!$data) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Required fields
$requiredFields = ['transaction_date', 'amount', 'debit_ledger_id', 'credit_ledger_id', 'transaction_type'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Field '{$field}' is required"
        ]);
        exit;
    }
}

// Ensure amount is a valid number
if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Amount must be a positive number'
    ]);
    exit;
}

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    // Check if the transaction exists
    $checkStmt = $db->prepare("SELECT id FROM transactions WHERE id = ?");
    $checkStmt->bind_param('i', $transactionId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Transaction not found'
        ]);
        exit;
    }
    
    // Check if debit and credit ledgers exist
    $ledgerCheckStmt = $db->prepare("
        SELECT 
            (SELECT COUNT(*) FROM ledgers WHERE id = ?) as debit_exists,
            (SELECT COUNT(*) FROM ledgers WHERE id = ?) as credit_exists
    ");
    
    $debitLedgerId = (int)$data['debit_ledger_id'];
    $creditLedgerId = (int)$data['credit_ledger_id'];
    
    $ledgerCheckStmt->bind_param('ii', $debitLedgerId, $creditLedgerId);
    $ledgerCheckStmt->execute();
    $ledgerCheckResult = $ledgerCheckStmt->get_result();
    $ledgerCheck = $ledgerCheckResult->fetch_assoc();
    
    if ($ledgerCheck['debit_exists'] == 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Debit ledger does not exist'
        ]);
        exit;
    }
    
    if ($ledgerCheck['credit_exists'] == 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Credit ledger does not exist'
        ]);
        exit;
    }
    
    if ($debitLedgerId === $creditLedgerId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Debit and credit ledgers cannot be the same'
        ]);
        exit;
    }
    
    // Update the transaction
    $updateQuery = "
        UPDATE transactions 
        SET 
            transaction_date = ?,
            transaction_type = ?,
            amount = ?,
            narration = ?,
            reference_number = ?,
            debit_ledger_id = ?,
            credit_ledger_id = ?,
            updated_at = NOW()
        WHERE id = ?
    ";
    
    $stmt = $db->prepare($updateQuery);
    
    $transactionDate = $data['transaction_date'];
    $transactionType = $data['transaction_type'];
    $amount = (float)$data['amount'];
    $narration = isset($data['narration']) ? $data['narration'] : '';
    $referenceNumber = isset($data['reference_number']) ? $data['reference_number'] : '';
    
    $stmt->bind_param(
        'ssdssiii',
        $transactionDate,
        $transactionType,
        $amount,
        $narration,
        $referenceNumber,
        $debitLedgerId,
        $creditLedgerId,
        $transactionId
    );
    
    $result = $stmt->execute();
    
    if ($result) {
        // Get the updated transaction
        $getUpdatedStmt = $db->prepare("
            SELECT 
                t.*,
                dl.name as debit_ledger_name,
                cl.name as credit_ledger_name
            FROM 
                transactions t
            LEFT JOIN 
                ledgers dl ON t.debit_ledger_id = dl.id
            LEFT JOIN 
                ledgers cl ON t.credit_ledger_id = cl.id
            WHERE 
                t.id = ?
        ");
        
        $getUpdatedStmt->bind_param('i', $transactionId);
        $getUpdatedStmt->execute();
        $getUpdatedResult = $getUpdatedStmt->get_result();
        $updatedTransaction = $getUpdatedResult->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Transaction updated successfully',
            'data' => $updatedTransaction
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update transaction: ' . $db->error
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 