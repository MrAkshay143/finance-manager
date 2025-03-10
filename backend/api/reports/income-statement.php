<?php
/**
 * Income Statement Report API
 * Returns data for income statement report
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

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    // Get date parameters
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01'); // First day of current month
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d'); // Today
    
    // Get income accounts
    $incomeQuery = "
        SELECT l.*, g.name as group_name, 
        (
            SELECT SUM(amount) 
            FROM transactions t 
            WHERE (t.credit_ledger_id = l.id OR t.debit_ledger_id = l.id) 
                AND t.transaction_date BETWEEN ? AND ?
        ) as period_activity
        FROM ledgers l
        JOIN ledger_groups g ON l.group_id = g.id
        WHERE g.class = 'income'
        ORDER BY g.name, l.name
    ";
    $incomeStmt = $db->prepare($incomeQuery);
    $incomeStmt->execute([$startDate, $endDate]);
    $income = $incomeStmt->fetchAll();
    
    // Get expense accounts
    $expenseQuery = "
        SELECT l.*, g.name as group_name, 
        (
            SELECT SUM(amount) 
            FROM transactions t 
            WHERE (t.credit_ledger_id = l.id OR t.debit_ledger_id = l.id) 
                AND t.transaction_date BETWEEN ? AND ?
        ) as period_activity
        FROM ledgers l
        JOIN ledger_groups g ON l.group_id = g.id
        WHERE g.class = 'expense'
        ORDER BY g.name, l.name
    ";
    $expenseStmt = $db->prepare($expenseQuery);
    $expenseStmt->execute([$startDate, $endDate]);
    $expenses = $expenseStmt->fetchAll();
    
    // Calculate totals
    $totalIncome = array_reduce($income, function($carry, $item) {
        return $carry + ($item['period_activity'] ?: 0);
    }, 0);
    
    $totalExpenses = array_reduce($expenses, function($carry, $item) {
        return $carry + ($item['period_activity'] ?: 0);
    }, 0);
    
    $netIncome = $totalIncome - $totalExpenses;
    
    echo json_encode([
        'success' => true,
        'message' => 'Income statement data retrieved successfully',
        'data' => [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'income' => $income,
            'expenses' => $expenses,
            'totals' => [
                'income' => $totalIncome,
                'expenses' => $totalExpenses,
                'net_income' => $netIncome
            ]
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Income statement report error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
} 