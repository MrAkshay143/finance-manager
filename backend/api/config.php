<?php
/**
 * API Configuration
 */

// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Send JSON Response
 * 
 * @param int $statusCode HTTP status code
 * @param bool $success Success status
 * @param string $message Response message
 * @param array $data Response data
 */
function sendResponse($statusCode, $success, $message = '', $data = []) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Get JSON Request Body
 * 
 * @return array Decoded JSON request body
 */
function getRequestBody() {
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?: [];
} 