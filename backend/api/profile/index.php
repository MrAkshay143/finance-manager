<?php
/**
 * Profile API
 * Get and update user profile
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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

// Connect to main database
$db = getDbConnection();

// Handle GET request - fetch user profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get user by username
        $stmt = $db->prepare("SELECT id, username, name, email, created_at, updated_at FROM users WHERE username = ?");
        $stmt->bind_param('s', $session['username']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            exit;
        }
        
        $user = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'data' => $user
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
}
// Handle PUT request - update user profile
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        // Get request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid request data'
            ]);
            exit;
        }
        
        // Check if changing password
        $changePassword = isset($data['current_password']) && isset($data['new_password']);
        
        // If changing password, verify current password
        if ($changePassword) {
            $stmt = $db->prepare("SELECT password FROM users WHERE username = ?");
            $stmt->bind_param('s', $session['username']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                exit;
            }
            
            $user = $result->fetch_assoc();
            
            // Verify current password
            if (!password_verify($data['current_password'], $user['password'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ]);
                exit;
            }
        }
        
        // Update fields
        $updateFields = [];
        $updateParams = [];
        $paramTypes = '';
        
        // Name
        if (isset($data['name']) && !empty($data['name'])) {
            $updateFields[] = "name = ?";
            $updateParams[] = $data['name'];
            $paramTypes .= 's';
        }
        
        // Email
        if (isset($data['email']) && !empty($data['email'])) {
            $updateFields[] = "email = ?";
            $updateParams[] = $data['email'];
            $paramTypes .= 's';
        }
        
        // Password
        if ($changePassword) {
            $updateFields[] = "password = ?";
            $updateParams[] = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $paramTypes .= 's';
        }
        
        // Updated at
        $updateFields[] = "updated_at = NOW()";
        
        // Add username to parameters
        $updateParams[] = $session['username'];
        $paramTypes .= 's';
        
        // Build and execute update query
        $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE username = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param($paramTypes, ...$updateParams);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'No changes were made'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
} 