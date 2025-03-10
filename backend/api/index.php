<?php
/**
 * API Router
 * 
 * This file routes API requests to the appropriate handler.
 */

// Parse the requested API endpoint
$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if present (adjust this if your API is not at the root)
$basePath = '/api';
if (strpos($requestPath, $basePath) === 0) {
    $requestPath = substr($requestPath, strlen($basePath));
}

// Split path into segments
$segments = explode('/', trim($requestPath, '/'));

// First segment is the API resource
$resource = $segments[0] ?? '';

// Remove the resource from segments to get the path to pass to the handler
array_shift($segments);
$path = implode('/', $segments);

// Set path in query string for handlers to use
$_GET['path'] = $path;

// Route to appropriate handler
switch ($resource) {
    case 'ledgers':
        require_once __DIR__ . '/ledgers.php';
        break;
    
    case 'transactions':
        require_once __DIR__ . '/transactions.php';
        break;
    
    case 'auth':
        require_once __DIR__ . '/auth.php';
        break;
    
    case 'setup':
        // Special route to initialize database
        require_once __DIR__ . '/../database/init.php';
        
        // Create a default admin user
        require_once __DIR__ . '/../models/UserModel.php';
        $userModel = new UserModel();
        
        // Check if the admin user already exists
        $adminUser = $userModel->getUserByUsername('admin');
        
        if (!$adminUser) {
            // Create a default admin user
            $userModel->createUser([
                'username' => 'admin',
                'password' => 'admin123', // This should be changed immediately
                'name' => 'Administrator',
                'email' => 'admin@example.com'
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Database initialized and admin user created successfully',
                'data' => [
                    'username' => 'admin',
                    'password' => 'admin123'
                ]
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'Database re-initialized successfully. Admin user already exists.',
                'data' => null
            ]);
        }
        break;
    
    default:
        // Return 404 for unknown resources
        header("HTTP/1.1 404 Not Found");
        echo json_encode([
            'success' => false,
            'message' => 'API resource not found',
            'data' => null
        ]);
        break;
} 