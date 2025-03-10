<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../models/TransactionModel.php';

// Initialize Transaction Model
$transactionModel = new TransactionModel();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the endpoint path
$path = isset($_GET['path']) ? $_GET['path'] : '';
$pathParts = explode('/', trim($path, '/'));

// Determine action based on path and method
if ($method === 'GET') {
    if (empty($pathParts[0])) {
        // GET /transactions - Get all transactions with optional pagination
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        // Check for date range filters
        if (isset($_GET['start_date']) && isset($_GET['end_date'])) {
            $startDate = $_GET['start_date'];
            $endDate = $_GET['end_date'];
            $transactions = $transactionModel->getTransactionsByDateRange($startDate, $endDate, $limit, $offset);
        } else {
            $transactions = $transactionModel->getAllTransactions($limit, $offset);
        }
        
        sendResponse(200, true, 'Transactions retrieved successfully', $transactions);
    } else if ($pathParts[0] === 'types') {
        // GET /transactions/types - Get transaction types
        $types = $transactionModel->getTransactionTypes();
        sendResponse(200, true, 'Transaction types retrieved successfully', $types);
    } else if ($pathParts[0] === 'ledger') {
        if (isset($pathParts[1])) {
            // GET /transactions/ledger/{id} - Get transactions by ledger ID
            $ledgerId = $pathParts[1];
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            
            $transactions = $transactionModel->getTransactionsByLedgerId($ledgerId, $limit, $offset);
            sendResponse(200, true, 'Transactions retrieved successfully', $transactions);
        } else {
            sendResponse(400, false, 'Ledger ID is required');
        }
    } else if ($pathParts[0] === 'recent') {
        // GET /transactions/recent - Get recent transactions
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $transactions = $transactionModel->getRecentTransactions($limit);
        sendResponse(200, true, 'Recent transactions retrieved successfully', $transactions);
    } else if ($pathParts[0] === 'monthly-totals') {
        // GET /transactions/monthly-totals - Get monthly totals
        $year = isset($_GET['year']) ? $_GET['year'] : null;
        $month = isset($_GET['month']) ? $_GET['month'] : null;
        
        $totals = $transactionModel->getMonthlyTotals($year, $month);
        sendResponse(200, true, 'Monthly totals retrieved successfully', $totals);
    } else {
        // GET /transactions/{id} - Get transaction by ID
        $transactionId = $pathParts[0];
        $transaction = $transactionModel->getTransactionById($transactionId);
        
        if (!$transaction) {
            sendResponse(404, false, 'Transaction not found');
        }
        
        sendResponse(200, true, 'Transaction retrieved successfully', $transaction);
    }
} else if ($method === 'POST') {
    if (empty($pathParts[0])) {
        // POST /transactions - Create a new transaction
        $data = getRequestBody();
        
        // Validate required fields
        if (
            !isset($data['transaction_date']) || 
            !isset($data['type_id']) || 
            !isset($data['debit_ledger_id']) || 
            !isset($data['credit_ledger_id']) || 
            !isset($data['amount'])
        ) {
            sendResponse(400, false, 'Missing required fields for transaction');
        }
        
        // Validate amount is positive
        if ($data['amount'] <= 0) {
            sendResponse(400, false, 'Amount must be positive');
        }
        
        $transaction = $transactionModel->createTransaction($data);
        
        if (!$transaction) {
            sendResponse(500, false, 'Failed to create transaction');
        }
        
        sendResponse(201, true, 'Transaction created successfully', $transaction);
    } else {
        sendResponse(404, false, 'Endpoint not found');
    }
} else if ($method === 'PUT') {
    if (!empty($pathParts[0])) {
        // PUT /transactions/{id} - Update a transaction
        $transactionId = $pathParts[0];
        $data = getRequestBody();
        
        // Validate required fields
        if (
            !isset($data['transaction_date']) || 
            !isset($data['type_id']) || 
            !isset($data['debit_ledger_id']) || 
            !isset($data['credit_ledger_id']) || 
            !isset($data['amount'])
        ) {
            sendResponse(400, false, 'Missing required fields for transaction');
        }
        
        // Validate amount is positive
        if ($data['amount'] <= 0) {
            sendResponse(400, false, 'Amount must be positive');
        }
        
        $transaction = $transactionModel->updateTransaction($transactionId, $data);
        
        if (!$transaction) {
            sendResponse(500, false, 'Failed to update transaction');
        }
        
        sendResponse(200, true, 'Transaction updated successfully', $transaction);
    } else {
        sendResponse(400, false, 'Transaction ID is required');
    }
} else if ($method === 'DELETE') {
    if (!empty($pathParts[0])) {
        // DELETE /transactions/{id} - Delete a transaction
        $transactionId = $pathParts[0];
        $success = $transactionModel->deleteTransaction($transactionId);
        
        if (!$success) {
            sendResponse(500, false, 'Failed to delete transaction');
        }
        
        sendResponse(200, true, 'Transaction deleted successfully');
    } else {
        sendResponse(400, false, 'Transaction ID is required');
    }
} else {
    sendResponse(405, false, 'Method not allowed');
} 