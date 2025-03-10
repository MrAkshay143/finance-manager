<?php
/**
 * Update Ledger API
 * Updates a single ledger by ID
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
        'message' => 'Ledger ID is required'
    ]);
    exit;
}

$ledgerId = (int)$_GET['id'];

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
$requiredFields = ['name', 'group_id'];
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
    
    // Check if the ledger exists
    $checkStmt = $db->prepare("SELECT id FROM ledgers WHERE id = ?");
    $checkStmt->bind_param('i', $ledgerId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ledger not found'
        ]);
        exit;
    }
    
    // Check if the group exists
    $groupId = (int)$data['group_id'];
    $groupCheckStmt = $db->prepare("SELECT id FROM ledger_groups WHERE id = ?");
    $groupCheckStmt->bind_param('i', $groupId);
    $groupCheckStmt->execute();
    $groupCheckResult = $groupCheckStmt->get_result();
    
    if ($groupCheckResult->num_rows === 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Ledger group does not exist'
        ]);
        exit;
    }
    
    // Update the ledger
    $updateQuery = "
        UPDATE ledgers 
        SET 
            name = ?,
            group_id = ?,
            account_number = ?,
            notes = ?,
            updated_at = NOW()
        WHERE id = ?
    ";
    
    $stmt = $db->prepare($updateQuery);
    
    $name = $data['name'];
    $accountNumber = isset($data['account_number']) ? $data['account_number'] : '';
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    $stmt->bind_param(
        'sissi',
        $name,
        $groupId,
        $accountNumber,
        $notes,
        $ledgerId
    );
    
    $result = $stmt->execute();
    
    if ($result) {
        // Get the updated ledger
        $getUpdatedStmt = $db->prepare("
            SELECT 
                l.*,
                g.name as group_name,
                g.type as group_type
            FROM 
                ledgers l
            LEFT JOIN 
                ledger_groups g ON l.group_id = g.id
            WHERE 
                l.id = ?
        ");
        
        $getUpdatedStmt->bind_param('i', $ledgerId);
        $getUpdatedStmt->execute();
        $getUpdatedResult = $getUpdatedStmt->get_result();
        $updatedLedger = $getUpdatedResult->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Ledger updated successfully',
            'data' => $updatedLedger
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update ledger: ' . $db->error
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 