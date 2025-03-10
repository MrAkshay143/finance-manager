<?php
require_once __DIR__ . '/../config/database.php';

class LedgerModel {
    private $db;
    
    public function __construct() {
        $this->db = getDbConnection();
    }
    
    /**
     * Get all ledger groups
     */
    public function getAllLedgerGroups() {
        $stmt = $this->db->query("SELECT * FROM ledger_groups ORDER BY name");
        return $stmt->fetchAll();
    }
    
    /**
     * Get ledger group by ID
     */
    public function getLedgerGroupById($id) {
        $stmt = $this->db->prepare("SELECT * FROM ledger_groups WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Get ledger group by type
     */
    public function getLedgerGroupByType($type) {
        $stmt = $this->db->prepare("SELECT * FROM ledger_groups WHERE type = ?");
        $stmt->execute([$type]);
        return $stmt->fetch();
    }
    
    /**
     * Get all ledgers
     */
    public function getAllLedgers() {
        $query = "
            SELECT l.*, lg.name as group_name, lg.type as group_type 
            FROM ledgers l
            JOIN ledger_groups lg ON l.group_id = lg.id
            ORDER BY l.name
        ";
        $stmt = $this->db->query($query);
        return $stmt->fetchAll();
    }
    
    /**
     * Get ledgers by group type
     */
    public function getLedgersByGroupType($type) {
        $query = "
            SELECT l.*, lg.name as group_name, lg.type as group_type 
            FROM ledgers l
            JOIN ledger_groups lg ON l.group_id = lg.id
            WHERE lg.type = ?
            ORDER BY l.name
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$type]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get ledgers by group ID
     */
    public function getLedgersByGroupId($groupId) {
        $query = "
            SELECT l.*, lg.name as group_name, lg.type as group_type 
            FROM ledgers l
            JOIN ledger_groups lg ON l.group_id = lg.id
            WHERE l.group_id = ?
            ORDER BY l.name
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$groupId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get ledger by ID
     */
    public function getLedgerById($id) {
        $query = "
            SELECT l.*, lg.name as group_name, lg.type as group_type 
            FROM ledgers l
            JOIN ledger_groups lg ON l.group_id = lg.id
            WHERE l.id = ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Create ledger
     */
    public function createLedger($data) {
        $query = "
            INSERT INTO ledgers (name, group_id, opening_balance, current_balance, account_number, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $data['name'],
            $data['group_id'],
            $data['opening_balance'] ?? 0,
            $data['opening_balance'] ?? 0,
            $data['account_number'] ?? null,
            $data['notes'] ?? null
        ]);
        
        if ($success) {
            return $this->getLedgerById($this->db->lastInsertId());
        }
        
        return false;
    }
    
    /**
     * Update ledger
     */
    public function updateLedger($id, $data) {
        $query = "
            UPDATE ledgers 
            SET name = ?, group_id = ?, opening_balance = ?, current_balance = ?, account_number = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $data['name'],
            $data['group_id'],
            $data['opening_balance'] ?? 0,
            $data['current_balance'] ?? $data['opening_balance'] ?? 0,
            $data['account_number'] ?? null,
            $data['notes'] ?? null,
            $id
        ]);
        
        if ($success) {
            return $this->getLedgerById($id);
        }
        
        return false;
    }
    
    /**
     * Delete ledger
     */
    public function deleteLedger($id) {
        // Check if ledger is used in any transactions
        $checkQuery = "
            SELECT COUNT(*) as count FROM transactions 
            WHERE debit_ledger_id = ? OR credit_ledger_id = ?
        ";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->execute([$id, $id]);
        $result = $checkStmt->fetch();
        
        if ($result['count'] > 0) {
            return false; // Ledger is in use
        }
        
        $query = "DELETE FROM ledgers WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$id]);
    }
    
    /**
     * Get summary of ledgers by group type
     */
    public function getLedgerSummaryByType() {
        $query = "
            SELECT 
                lg.type, 
                lg.name as group_name, 
                COUNT(l.id) as ledger_count,
                SUM(l.current_balance) as total_balance
            FROM ledger_groups lg
            LEFT JOIN ledgers l ON lg.id = l.group_id
            GROUP BY lg.id
            ORDER BY lg.name
        ";
        $stmt = $this->db->query($query);
        return $stmt->fetchAll();
    }
    
    /**
     * Get net worth calculation
     */
    public function getNetWorth() {
        $query = "
            SELECT 
                SUM(CASE WHEN lg.type IN ('bank', 'cash', 'debtor') THEN l.current_balance ELSE 0 END) as assets,
                SUM(CASE WHEN lg.type = 'credit-card' THEN ABS(l.current_balance) ELSE 0 END) as liabilities
            FROM ledgers l
            JOIN ledger_groups lg ON l.group_id = lg.id
        ";
        $stmt = $this->db->query($query);
        $result = $stmt->fetch();
        
        return [
            'assets' => (float)$result['assets'],
            'liabilities' => (float)$result['liabilities'],
            'net_worth' => (float)$result['assets'] - (float)$result['liabilities']
        ];
    }
} 