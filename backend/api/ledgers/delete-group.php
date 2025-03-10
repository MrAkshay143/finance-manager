<?php
/**
 * Delete Ledger Group API
 * Deletes a single ledger group by ID
 * Can optionally reassign ledgers or delete transactions
 */

// Include database functions
include_once __DIR__ . '/../../database/db.php';

// Set content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

// Check if reassign_to parameter is provided
$reassignTo = isset($_GET['reassign_to']) && is_numeric($_GET['reassign_to']) ? (int)$_GET['reassign_to'] : null;

// Check if delete_transactions parameter is provided
$deleteTransactions = isset($_GET['delete_transactions']) && $_GET['delete_transactions'] == 1;

try {
    // Connect to user's database
    $db = getUserConnection($session['username']);
    
    // Start transaction for data integrity
    $db->begin_transaction();
    
    // Check if the group exists
    $checkStmt = $db->prepare("SELECT id, name FROM ledger_groups WHERE id = ?");
    $checkStmt->bind_param('i', $groupId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        $db->rollback();
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ledger group not found'
        ]);
        exit;
    }
    
    $groupInfo = $checkResult->fetch_assoc();
    
    // Check if the group has any ledgers
    $ledgerCheckStmt = $db->prepare("
        SELECT id, name 
        FROM ledgers 
        WHERE group_id = ?
    ");
    
    $ledgerCheckStmt->bind_param('i', $groupId);
    $ledgerCheckStmt->execute();
    $ledgerCheckResult = $ledgerCheckStmt->get_result();
    $affectedLedgers = [];
    
    while ($ledger = $ledgerCheckResult->fetch_assoc()) {
        $affectedLedgers[] = $ledger;
    }
    
    if (count($affectedLedgers) > 0) {
        // There are ledgers associated with this group
        if ($reassignTo === null && !$deleteTransactions) {
            // If no action specified, return error with affected ledgers
            $db->rollback();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete group that has ledgers. Choose to reassign or delete them.',
                'affected_ledgers' => $affectedLedgers
            ]);
            exit;
        }
        
        // If reassignTo is specified, verify the target group exists
        if ($reassignTo !== null) {
            $reassignCheckStmt = $db->prepare("SELECT id, name, type FROM ledger_groups WHERE id = ?");
            $reassignCheckStmt->bind_param('i', $reassignTo);
            $reassignCheckStmt->execute();
            $reassignCheckResult = $reassignCheckStmt->get_result();
            
            if ($reassignCheckResult->num_rows === 0) {
                $db->rollback();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Target reassignment group does not exist'
                ]);
                exit;
            }
            
            $targetGroup = $reassignCheckResult->fetch_assoc();
            
            // Update all associated ledgers to the new group
            $updateLedgersStmt = $db->prepare("
                UPDATE ledgers 
                SET group_id = ?, updated_at = NOW()
                WHERE group_id = ?
            ");
            
            $updateLedgersStmt->bind_param('ii', $reassignTo, $groupId);
            $updateLedgersStmt->execute();
        } else if ($deleteTransactions) {
            // Get all ledger IDs to delete
            $ledgerIds = array_column($affectedLedgers, 'id');
            $ledgerIdsStr = implode(',', $ledgerIds);
            
            // Delete all transactions associated with these ledgers
            if (!empty($ledgerIds)) {
                $deleteTransactionsStmt = $db->prepare("
                    DELETE FROM transactions 
                    WHERE debit_ledger_id IN ($ledgerIdsStr) OR credit_ledger_id IN ($ledgerIdsStr)
                ");
                $deleteTransactionsStmt->execute();
            }
            
            // Delete all ledgers in this group
            $deleteLedgersStmt = $db->prepare("DELETE FROM ledgers WHERE group_id = ?");
            $deleteLedgersStmt->bind_param('i', $groupId);
            $deleteLedgersStmt->execute();
        }
    }
    
    // Now delete the group
    $deleteStmt = $db->prepare("DELETE FROM ledger_groups WHERE id = ?");
    $deleteStmt->bind_param('i', $groupId);
    $result = $deleteStmt->execute();
    
    if ($result) {
        $db->commit();
        
        $responseMessage = 'Ledger group deleted successfully';
        if ($reassignTo !== null) {
            $responseMessage .= '. Associated ledgers reassigned to "' . $targetGroup['name'] . '"';
        } else if ($deleteTransactions) {
            $responseMessage .= '. Associated ledgers and transactions were deleted';
        }
        
        echo json_encode([
            'success' => true,
            'message' => $responseMessage
        ]);
    } else {
        $db->rollback();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete ledger group: ' . $db->error
        ]);
    }
    
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 