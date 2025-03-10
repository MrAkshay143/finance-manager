<?php
/**
 * Finance Manager API
 * Main entry point for API requests
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 204 No Content');
    exit;
}

// Set default content type
header('Content-Type: application/json');

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Log the request for debugging
error_log("Request path: " . $path);

// For the root API endpoint
if ($path == '/api' || $path == '/api/') {
    echo json_encode([
        'name' => 'Finance Manager API',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
    exit;
}

// Check if this is an API request
if (strpos($path, '/api/') === 0) {
    // Remove the '/api/' prefix
    $endpoint = substr($path, 5);
    
    // Split into segments
    $segments = explode('/', $endpoint);
    
    if (count($segments) >= 1 && !empty($segments[0])) {
        $resource = $segments[0];
        
        // Handle auth endpoints
        if ($resource === 'auth' && count($segments) >= 2) {
            $action = $segments[1];
            $authFile = __DIR__ . "/api/auth/{$action}.php";
            
            if (file_exists($authFile)) {
                include_once $authFile;
                exit;
            }
        }
    }
    
    // API endpoint not found
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'API endpoint not found'
    ]);
    exit;
}

// Return 404 for other requests
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'Not found'
]); 