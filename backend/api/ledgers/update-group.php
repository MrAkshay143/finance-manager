<?php
/**
 * Update Ledger Group API
 * Updates a single ledger group by ID
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

// Check if ID parameter is provided
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Group ID is required'
    ]);
    exit;
}

$groupId = (int)$_GET['id'];

// Get JSON request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

// Validate request data
if (!$data) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Required fields
$requiredFields = ['name', 'type'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Field '{$field}' is required"
        ]);
        exit;
    }
}

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    // Check if the group exists
    $checkStmt = $db->prepare("SELECT id FROM ledger_groups WHERE id = ?");
    $checkStmt->bind_param('i', $groupId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ledger group not found'
        ]);
        exit;
    }
    
    // Check if name is unique
    $nameCheckStmt = $db->prepare("SELECT id FROM ledger_groups WHERE name = ? AND id != ?");
    $nameCheckStmt->bind_param('si', $data['name'], $groupId);
    $nameCheckStmt->execute();
    $nameCheckResult = $nameCheckStmt->get_result();
    
    if ($nameCheckResult->num_rows > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'A ledger group with this name already exists'
        ]);
        exit;
    }
    
    // Update the group
    $updateQuery = "
        UPDATE ledger_groups 
        SET 
            name = ?,
            type = ?,
            description = ?,
            updated_at = NOW()
        WHERE id = ?
    ";
    
    $stmt = $db->prepare($updateQuery);
    
    $name = $data['name'];
    $type = $data['type'];
    $description = isset($data['description']) ? $data['description'] : '';
    
    $stmt->bind_param(
        'sssi',
        $name,
        $type,
        $description,
        $groupId
    );
    
    $result = $stmt->execute();
    
    if ($result) {
        // Get the updated group
        $getUpdatedStmt = $db->prepare("SELECT * FROM ledger_groups WHERE id = ?");
        $getUpdatedStmt->bind_param('i', $groupId);
        $getUpdatedStmt->execute();
        $getUpdatedResult = $getUpdatedStmt->get_result();
        $updatedGroup = $getUpdatedResult->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Ledger group updated successfully',
            'data' => $updatedGroup
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update ledger group: ' . $db->error
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 