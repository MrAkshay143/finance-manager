<?php
/**
 * Database Backup Download API
 * Downloads a backup of the user's database
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Check if user is authenticated
if (!isset($_COOKIE['session_token'])) {
    header('Content-Type: application/json');
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
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or expired session'
    ]);
    exit;
}

// Check if file parameter is provided
if (!isset($_GET['file'])) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'File parameter is required'
    ]);
    exit;
}

$filename = $_GET['file'];

// Validate filename (only allow files with username prefix for security)
if (!preg_match('/^' . preg_quote($session['username']) . '_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.db$/', $filename)) {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid backup file'
    ]);
    exit;
}

// Get file path
$filePath = __DIR__ . '/../../database/backups/' . $filename;

// Check if file exists
if (!file_exists($filePath)) {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Backup file not found'
    ]);
    exit;
}

// Set headers for file download
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));

// Clear output buffer
ob_clean();
flush();

// Output file
readfile($filePath);
exit; 