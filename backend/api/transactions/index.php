<?php
/**
 * Transactions API
 * Get all transactions or create a new one
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
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
        $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
        
        // Build query
        $query = "
            SELECT t.*, 
                dl.name as debit_ledger_name, 
                cl.name as credit_ledger_name,
                dlg.type as debit_ledger_type,
                clg.type as credit_ledger_type
            FROM transactions t
            JOIN ledgers dl ON t.debit_ledger_id = dl.id
            JOIN ledgers cl ON t.credit_ledger_id = cl.id
            JOIN ledger_groups dlg ON dl.group_id = dlg.id
            JOIN ledger_groups clg ON cl.group_id = clg.id
            WHERE 1=1
        ";
        
        $params = [];
        
        // Add date filters if provided
        if ($startDate) {
            $query .= " AND t.transaction_date >= ?";
            $params[] = $startDate;
        }
        
        if ($endDate) {
            $query .= " AND t.transaction_date <= ?";
            $params[] = $endDate;
        }
        
        // Add ordering and limits
        $query .= " ORDER BY t.transaction_date DESC, t.id DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        // Execute query
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $transactions = $stmt->fetchAll();
        
        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) as total FROM transactions";
        $countParams = [];
        
        if ($startDate) {
            $countQuery .= " WHERE transaction_date >= ?";
            $countParams[] = $startDate;
        }
        
        if ($endDate) {
            $countQuery .= ($startDate ? " AND" : " WHERE") . " transaction_date <= ?";
            $countParams[] = $endDate;
        }
        
        $countStmt = $db->prepare($countQuery);
        $countStmt->execute($countParams);
        $totalCount = $countStmt->fetch()['total'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions,
            'meta' => [
                'total' => $totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new transaction
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // Validate required fields
        if (!isset($data['transaction_date']) || 
            !isset($data['transaction_type']) || 
            !isset($data['amount']) || 
            !isset($data['debit_ledger_id']) || 
            !isset($data['credit_ledger_id'])) {
            
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields: transaction_date, transaction_type, amount, debit_ledger_id, credit_ledger_id'
            ]);
            exit;
        }
        
        // Validate amount
        if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Amount must be a positive number'
            ]);
            exit;
        }
        
        // Begin transaction
        $db->beginTransaction();
        
        // Check if ledgers exist
        $stmt = $db->prepare("
            SELECT 
                (SELECT COUNT(*) FROM ledgers WHERE id = ?) as debit_exists,
                (SELECT COUNT(*) FROM ledgers WHERE id = ?) as credit_exists
        ");
        $stmt->execute([$data['debit_ledger_id'], $data['credit_ledger_id']]);
        $result = $stmt->fetch();
        
        if ($result['debit_exists'] == 0 || $result['credit_exists'] == 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'One or both ledgers do not exist'
            ]);
            exit;
        }
        
        // Insert transaction
        $stmt = $db->prepare("
            INSERT INTO transactions (
                transaction_date, 
                transaction_type, 
                amount, 
                narration, 
                debit_ledger_id, 
                credit_ledger_id, 
                reference_number, 
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $data['transaction_date'],
            $data['transaction_type'],
            $data['amount'],
            isset($data['narration']) ? $data['narration'] : null,
            $data['debit_ledger_id'],
            $data['credit_ledger_id'],
            isset($data['reference_number']) ? $data['reference_number'] : null
        ]);
        
        $transactionId = $db->lastInsertId();
        
        // Update ledger balances
        $stmt = $db->prepare("
            UPDATE ledgers 
            SET current_balance = current_balance + ? 
            WHERE id = ?
        ");
        $stmt->execute([$data['amount'], $data['debit_ledger_id']]);
        
        $stmt = $db->prepare("
            UPDATE ledgers 
            SET current_balance = current_balance - ? 
            WHERE id = ?
        ");
        $stmt->execute([$data['amount'], $data['credit_ledger_id']]);
        
        // Commit transaction
        $db->commit();
        
        // Get the new transaction with ledger info
        $stmt = $db->prepare("
            SELECT t.*, 
                dl.name as debit_ledger_name, 
                cl.name as credit_ledger_name,
                dlg.type as debit_ledger_type,
                clg.type as credit_ledger_type
            FROM transactions t
            JOIN ledgers dl ON t.debit_ledger_id = dl.id
            JOIN ledgers cl ON t.credit_ledger_id = cl.id
            JOIN ledger_groups dlg ON dl.group_id = dlg.id
            JOIN ledger_groups clg ON cl.group_id = clg.id
            WHERE t.id = ?
        ");
        $stmt->execute([$transactionId]);
        $transaction = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => $transaction
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
    
    error_log('Transactions API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
} 