<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../models/LedgerModel.php';

// Initialize Ledger Model
$ledgerModel = new LedgerModel();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the endpoint path
$path = isset($_GET['path']) ? $_GET['path'] : '';
$pathParts = explode('/', trim($path, '/'));

// Determine action based on path and method
if ($method === 'GET') {
    if (empty($pathParts[0])) {
        // GET /ledgers - Get all ledgers
        $ledgers = $ledgerModel->getAllLedgers();
        sendResponse(200, true, 'Ledgers retrieved successfully', $ledgers);
    } else if ($pathParts[0] === 'groups') {
        if (isset($pathParts[1])) {
            // GET /ledgers/groups/{id} - Get ledger group by ID
            $groupId = $pathParts[1];
            $group = $ledgerModel->getLedgerGroupById($groupId);
            
            if (!$group) {
                sendResponse(404, false, 'Ledger group not found');
            }
            
            sendResponse(200, true, 'Ledger group retrieved successfully', $group);
        } else {
            // GET /ledgers/groups - Get all ledger groups
            $groups = $ledgerModel->getAllLedgerGroups();
            sendResponse(200, true, 'Ledger groups retrieved successfully', $groups);
        }
    } else if ($pathParts[0] === 'summary') {
        // GET /ledgers/summary - Get ledger summary by type
        $summary = $ledgerModel->getLedgerSummaryByType();
        sendResponse(200, true, 'Ledger summary retrieved successfully', $summary);
    } else if ($pathParts[0] === 'networth') {
        // GET /ledgers/networth - Get net worth calculation
        $netWorth = $ledgerModel->getNetWorth();
        sendResponse(200, true, 'Net worth retrieved successfully', $netWorth);
    } else if ($pathParts[0] === 'by-type') {
        if (isset($pathParts[1])) {
            // GET /ledgers/by-type/{type} - Get ledgers by group type
            $type = $pathParts[1];
            $ledgers = $ledgerModel->getLedgersByGroupType($type);
            sendResponse(200, true, 'Ledgers retrieved successfully', $ledgers);
        } else {
            sendResponse(400, false, 'Group type is required');
        }
    } else if ($pathParts[0] === 'by-group') {
        if (isset($pathParts[1])) {
            // GET /ledgers/by-group/{groupId} - Get ledgers by group ID
            $groupId = $pathParts[1];
            $ledgers = $ledgerModel->getLedgersByGroupId($groupId);
            sendResponse(200, true, 'Ledgers retrieved successfully', $ledgers);
        } else {
            sendResponse(400, false, 'Group ID is required');
        }
    } else {
        // GET /ledgers/{id} - Get ledger by ID
        $ledgerId = $pathParts[0];
        $ledger = $ledgerModel->getLedgerById($ledgerId);
        
        if (!$ledger) {
            sendResponse(404, false, 'Ledger not found');
        }
        
        sendResponse(200, true, 'Ledger retrieved successfully', $ledger);
    }
} else if ($method === 'POST') {
    if (empty($pathParts[0])) {
        // POST /ledgers - Create a new ledger
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['group_id'])) {
            sendResponse(400, false, 'Name and group_id are required');
        }
        
        $ledger = $ledgerModel->createLedger($data);
        
        if (!$ledger) {
            sendResponse(500, false, 'Failed to create ledger');
        }
        
        sendResponse(201, true, 'Ledger created successfully', $ledger);
    } else {
        sendResponse(404, false, 'Endpoint not found');
    }
} else if ($method === 'PUT') {
    if (!empty($pathParts[0])) {
        // PUT /ledgers/{id} - Update a ledger
        $ledgerId = $pathParts[0];
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['group_id'])) {
            sendResponse(400, false, 'Name and group_id are required');
        }
        
        $ledger = $ledgerModel->updateLedger($ledgerId, $data);
        
        if (!$ledger) {
            sendResponse(500, false, 'Failed to update ledger');
        }
        
        sendResponse(200, true, 'Ledger updated successfully', $ledger);
    } else {
        sendResponse(400, false, 'Ledger ID is required');
    }
} else if ($method === 'DELETE') {
    if (!empty($pathParts[0])) {
        // DELETE /ledgers/{id} - Delete a ledger
        $ledgerId = $pathParts[0];
        $success = $ledgerModel->deleteLedger($ledgerId);
        
        if (!$success) {
            sendResponse(500, false, 'Failed to delete ledger. It may be in use in transactions.');
        }
        
        sendResponse(200, true, 'Ledger deleted successfully');
    } else {
        sendResponse(400, false, 'Ledger ID is required');
    }
} else {
    sendResponse(405, false, 'Method not allowed');
} 