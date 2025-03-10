<?php
/**
 * Auth Check API
 * Verifies if user is authenticated
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

try {
    // Check if session token cookie exists
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
    
    // Check if session exists and is valid
    if (!$session) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired session'
        ]);
        exit;
    }
    
    // Get user data
    $db = getMainConnection();
    $stmt = $db->prepare("SELECT id, username, name, email, user_type, currency, verified, created_at FROM users WHERE id = ?");
    $stmt->execute([$session['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Delete invalid session
        deleteSession($_COOKIE['session_token']);
        
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    // Return user data
    echo json_encode([
        'success' => true,
        'message' => 'Authenticated',
        'data' => [
            'user' => $user,
            'expires_at' => $session['expires_at']
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Auth check error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during authentication check: ' . $e->getMessage()
    ]);
    exit;
} 