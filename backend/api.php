<?php
/**
 * Main API Router
 * This file serves as the entry point for the Finance Manager API
 */

// Include database functions
include_once __DIR__ . '/database/db.php';

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

// Get API info
echo json_encode([
    'name' => 'Finance Manager API',
    'version' => '1.0.0',
    'author' => 'Akshay Mondal',
    'status' => 'running',
    'documentation' => 'See API documentation for available endpoints',
    'endpoints' => [
        'auth' => [
            'login' => 'POST - Authenticate user',
            'register' => 'POST - Register new user',
            'check' => 'GET - Check authentication status',
            'logout' => 'POST - Log out user'
        ],
        'ledgers' => [
            'index' => 'GET - Get all ledgers, POST - Create new ledger',
            'groups' => 'GET - Get all ledger groups, POST - Create new group'
        ],
        'transactions' => [
            'index' => 'GET - Get all transactions, POST - Create new transaction'
        ],
        'reports' => [
            'balance-sheet' => 'GET - Get balance sheet data',
            'income-statement' => 'GET - Get income statement data'
        ]
    ]
]); 