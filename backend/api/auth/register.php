<?php
/**
 * Register API
 * Creates a new user account
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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get request data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Log received data for debugging
error_log('Received registration data: ' . $json);

// Validate required fields
if (!isset($data['username']) || !isset($data['password']) || !isset($data['name'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Username, password, and name are required'
    ]);
    exit;
}

// Validate username (alphanumeric only)
if (!preg_match('/^[a-zA-Z0-9_]+$/', $data['username'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Username must contain only letters, numbers, and underscores'
    ]);
    exit;
}

// Validate password length
if (strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 6 characters long'
    ]);
    exit;
}

// Extract and sanitize data
$username = trim($data['username']);
$password = $data['password'];
$name = trim($data['name']);
$email = isset($data['email']) ? trim($data['email']) : null;
$userType = isset($data['userType']) ? trim($data['userType']) : 'user';
$currency = isset($data['currency']) ? trim($data['currency']) : 'USD';

// Validate user type
$allowedUserTypes = ['user', 'business', 'accountant'];
if (!in_array($userType, $allowedUserTypes)) {
    $userType = 'user'; // Default to user if invalid type
}

try {
    // Get database connection
    $db = getMainConnection();
    
    // Begin transaction
    $db->beginTransaction();
    
    // Check if username already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Username already exists'
        ]);
        exit;
    }
    
    // Check if email already exists (if provided)
    if ($email) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Email already exists'
            ]);
            exit;
        }
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate verification token
    $verificationToken = bin2hex(random_bytes(16));
    $verified = $email ? 0 : 1; // Auto-verify if no email provided
    
    // Insert new user
    $stmt = $db->prepare("
        INSERT INTO users (username, password, name, email, user_type, currency, verification_token, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ");
    $stmt->execute([$username, $hashedPassword, $name, $email, $userType, $currency, $verificationToken, $verified]);
    
    // Get new user ID
    $userId = $db->lastInsertId();
    
    // Create user database
    $userDb = getUserConnection($username);
    
    // Commit transaction
    $db->commit();
    
    // Update credentials file
    updateCredentialsFile();
    
    // If email provided, send verification email (mock for now)
    if ($email) {
        $verificationUrl = "http://{$_SERVER['HTTP_HOST']}/api/auth/verify.php?token=$verificationToken";
        error_log("Verification URL for $email: $verificationUrl");
    }
    
    // Return success
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'data' => [
            'userId' => $userId,
            'username' => $username,
            'name' => $name,
            'email' => $email,
            'userType' => $userType,
            'verified' => (bool)$verified
        ]
    ]);
    
} catch (Exception $e) {
    // Roll back transaction if in progress
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    error_log('Registration error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during registration: ' . $e->getMessage()
    ]);
    exit;
} 