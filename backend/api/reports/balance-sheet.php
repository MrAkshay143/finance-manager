<?php
/**
 * Balance Sheet Report API
 * Returns data for balance sheet report
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
    
    // Get date parameter (optional)
    $asOfDate = isset($_GET['as_of_date']) ? $_GET['as_of_date'] : date('Y-m-d');
    
    // Get assets
    $assetsQuery = "
        SELECT l.*, g.name as group_name
        FROM ledgers l
        JOIN ledger_groups g ON l.group_id = g.id
        WHERE g.class = 'asset'
        ORDER BY g.name, l.name
    ";
    $assetsStmt = $db->prepare($assetsQuery);
    $assetsStmt->execute();
    $assets = $assetsStmt->fetchAll();
    
    // Get liabilities
    $liabilitiesQuery = "
        SELECT l.*, g.name as group_name
        FROM ledgers l
        JOIN ledger_groups g ON l.group_id = g.id
        WHERE g.class = 'liability'
        ORDER BY g.name, l.name
    ";
    $liabilitiesStmt = $db->prepare($liabilitiesQuery);
    $liabilitiesStmt->execute();
    $liabilities = $liabilitiesStmt->fetchAll();
    
    // Get equity (using a simple calculation for now)
    $equityQuery = "
        SELECT 
            (SELECT SUM(current_balance) FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id WHERE g.class = 'asset') -
            (SELECT SUM(current_balance) FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id WHERE g.class = 'liability')
        AS equity_value
    ";
    $equityStmt = $db->prepare($equityQuery);
    $equityStmt->execute();
    $equity = $equityStmt->fetch();
    
    // Calculate totals
    $totalAssets = array_reduce($assets, function($carry, $item) {
        return $carry + $item['current_balance'];
    }, 0);
    
    $totalLiabilities = array_reduce($liabilities, function($carry, $item) {
        return $carry + $item['current_balance'];
    }, 0);
    
    $totalEquity = $equity['equity_value'] ?? 0;
    
    echo json_encode([
        'success' => true,
        'message' => 'Balance sheet data retrieved successfully',
        'data' => [
            'as_of_date' => $asOfDate,
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $totalEquity,
            'totals' => [
                'assets' => $totalAssets,
                'liabilities' => $totalLiabilities,
                'equity' => $totalEquity
            ]
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Balance sheet report error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
} 