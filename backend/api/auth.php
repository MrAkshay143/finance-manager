<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../models/UserModel.php';

// Initialize User Model
$userModel = new UserModel();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the endpoint path
$path = isset($_GET['path']) ? $_GET['path'] : '';
$pathParts = explode('/', trim($path, '/'));

// Determine action based on path and method
if ($method === 'POST') {
    if (empty($pathParts[0]) || $pathParts[0] === 'login') {
        // POST /auth or POST /auth/login - Login
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['username']) || !isset($data['password'])) {
            sendResponse(400, false, 'Username and password are required');
        }
        
        $user = $userModel->authenticateUser($data['username'], $data['password']);
        
        if (!$user) {
            sendResponse(401, false, 'Invalid username or password');
        }
        
        // Generate a session token
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        sendResponse(200, true, 'Login successful', [
            'user' => $user,
            'session_id' => session_id()
        ]);
    } else if ($pathParts[0] === 'register') {
        // POST /auth/register - Register new user
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['username']) || !isset($data['password']) || !isset($data['name'])) {
            sendResponse(400, false, 'Username, password, and name are required');
        }
        
        $user = $userModel->createUser($data);
        
        if (!$user) {
            sendResponse(409, false, 'Username already exists or registration failed');
        }
        
        sendResponse(201, true, 'User registered successfully', $user);
    } else if ($pathParts[0] === 'logout') {
        // POST /auth/logout - Logout
        session_start();
        session_destroy();
        
        sendResponse(200, true, 'Logout successful');
    } else {
        sendResponse(404, false, 'Endpoint not found');
    }
} else if ($method === 'GET') {
    if (empty($pathParts[0]) || $pathParts[0] === 'check') {
        // GET /auth or GET /auth/check - Check if user is logged in
        session_start();
        
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Not authenticated');
        }
        
        $user = $userModel->getUserById($_SESSION['user_id']);
        
        if (!$user) {
            // Session exists but user doesn't - clear session
            session_destroy();
            sendResponse(401, false, 'Invalid session');
        }
        
        sendResponse(200, true, 'Authenticated', [
            'user' => $user,
            'session_id' => session_id()
        ]);
    } else {
        sendResponse(404, false, 'Endpoint not found');
    }
} else {
    sendResponse(405, false, 'Method not allowed');
} 