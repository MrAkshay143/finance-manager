<?php
/**
 * Database Backup API
 * Creates a backup of the user's database
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

try {
    // Get user database path
    $dbPath = __DIR__ . '/../../database/users/' . $session['username'] . '.db';
    
    // Check if database exists
    if (!file_exists($dbPath)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User database not found'
        ]);
        exit;
    }
    
    // Create backup folder if it doesn't exist
    $backupDir = __DIR__ . '/../../database/backups/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0777, true);
    }
    
    // Generate backup filename with timestamp
    $timestamp = date('Y-m-d_H-i-s');
    $backupPath = $backupDir . $session['username'] . '_' . $timestamp . '.db';
    
    // Copy the database file
    if (copy($dbPath, $backupPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'Backup created successfully',
            'filename' => basename($backupPath),
            'timestamp' => $timestamp,
            'download_url' => '/api/backup/download?file=' . basename($backupPath)
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create backup'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 