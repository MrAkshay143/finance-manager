<?php
require_once __DIR__ . '/../config/database.php';

class TransactionModel {
    private $db;
    
    public function __construct() {
        $this->db = getDbConnection();
    }
    
    /**
     * Get all transactions
     */
    public function getAllTransactions($limit = 100, $offset = 0) {
        $query = "
            SELECT 
                t.*,
                tt.name as transaction_type,
                d.name as debit_ledger_name,
                c.name as credit_ledger_name,
                dg.type as debit_ledger_type,
                cg.type as credit_ledger_type
            FROM transactions t
            JOIN transaction_types tt ON t.type_id = tt.id
            JOIN ledgers d ON t.debit_ledger_id = d.id
            JOIN ledgers c ON t.credit_ledger_id = c.id
            JOIN ledger_groups dg ON d.group_id = dg.id
            JOIN ledger_groups cg ON c.group_id = cg.id
            ORDER BY t.transaction_date DESC, t.id DESC
            LIMIT ? OFFSET ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get transactions by date range
     */
    public function getTransactionsByDateRange($startDate, $endDate, $limit = 100, $offset = 0) {
        $query = "
            SELECT 
                t.*,
                tt.name as transaction_type,
                d.name as debit_ledger_name,
                c.name as credit_ledger_name,
                dg.type as debit_ledger_type,
                cg.type as credit_ledger_type
            FROM transactions t
            JOIN transaction_types tt ON t.type_id = tt.id
            JOIN ledgers d ON t.debit_ledger_id = d.id
            JOIN ledgers c ON t.credit_ledger_id = c.id
            JOIN ledger_groups dg ON d.group_id = dg.id
            JOIN ledger_groups cg ON c.group_id = cg.id
            WHERE t.transaction_date BETWEEN ? AND ?
            ORDER BY t.transaction_date DESC, t.id DESC
            LIMIT ? OFFSET ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$startDate, $endDate, $limit, $offset]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get transactions by ledger ID
     */
    public function getTransactionsByLedgerId($ledgerId, $limit = 100, $offset = 0) {
        $query = "
            SELECT 
                t.*,
                tt.name as transaction_type,
                d.name as debit_ledger_name,
                c.name as credit_ledger_name,
                dg.type as debit_ledger_type,
                cg.type as credit_ledger_type
            FROM transactions t
            JOIN transaction_types tt ON t.type_id = tt.id
            JOIN ledgers d ON t.debit_ledger_id = d.id
            JOIN ledgers c ON t.credit_ledger_id = c.id
            JOIN ledger_groups dg ON d.group_id = dg.id
            JOIN ledger_groups cg ON c.group_id = cg.id
            WHERE t.debit_ledger_id = ? OR t.credit_ledger_id = ?
            ORDER BY t.transaction_date DESC, t.id DESC
            LIMIT ? OFFSET ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$ledgerId, $ledgerId, $limit, $offset]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get transaction by ID
     */
    public function getTransactionById($id) {
        $query = "
            SELECT 
                t.*,
                tt.name as transaction_type,
                d.name as debit_ledger_name,
                c.name as credit_ledger_name,
                dg.type as debit_ledger_type,
                cg.type as credit_ledger_type
            FROM transactions t
            JOIN transaction_types tt ON t.type_id = tt.id
            JOIN ledgers d ON t.debit_ledger_id = d.id
            JOIN ledgers c ON t.credit_ledger_id = c.id
            JOIN ledger_groups dg ON d.group_id = dg.id
            JOIN ledger_groups cg ON c.group_id = cg.id
            WHERE t.id = ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Get transaction types
     */
    public function getTransactionTypes() {
        $query = "SELECT * FROM transaction_types ORDER BY name";
        $stmt = $this->db->query($query);
        return $stmt->fetchAll();
    }
    
    /**
     * Create transaction
     */
    public function createTransaction($data) {
        try {
            $this->db->beginTransaction();
            
            // Insert transaction
            $query = "
                INSERT INTO transactions (
                    transaction_date, 
                    type_id,
                    debit_ledger_id, 
                    credit_ledger_id, 
                    amount, 
                    narration, 
                    reference
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ";
            $stmt = $this->db->prepare($query);
            $success = $stmt->execute([
                $data['transaction_date'],
                $data['type_id'],
                $data['debit_ledger_id'],
                $data['credit_ledger_id'],
                $data['amount'],
                $data['narration'] ?? null,
                $data['reference'] ?? null
            ]);
            
            if (!$success) {
                $this->db->rollBack();
                return false;
            }
            
            $transactionId = $this->db->lastInsertId();
            
            // Update ledger balances
            $updateDebitQuery = "
                UPDATE ledgers
                SET current_balance = current_balance + ?
                WHERE id = ?
            ";
            $updateCreditQuery = "
                UPDATE ledgers
                SET current_balance = current_balance - ?
                WHERE id = ?
            ";
            
            $stmtDebit = $this->db->prepare($updateDebitQuery);
            $stmtCredit = $this->db->prepare($updateCreditQuery);
            
            $successDebit = $stmtDebit->execute([
                $data['amount'],
                $data['debit_ledger_id']
            ]);
            
            $successCredit = $stmtCredit->execute([
                $data['amount'],
                $data['credit_ledger_id']
            ]);
            
            if (!$successDebit || !$successCredit) {
                $this->db->rollBack();
                return false;
            }
            
            $this->db->commit();
            return $this->getTransactionById($transactionId);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }
    
    /**
     * Update transaction
     */
    public function updateTransaction($id, $data) {
        try {
            $this->db->beginTransaction();
            
            // Get original transaction to reverse ledger impacts
            $originalTransaction = $this->getTransactionById($id);
            if (!$originalTransaction) {
                return false;
            }
            
            // Reverse original ledger updates
            $reverseDebitQuery = "
                UPDATE ledgers
                SET current_balance = current_balance - ?
                WHERE id = ?
            ";
            $reverseCreditQuery = "
                UPDATE ledgers
                SET current_balance = current_balance + ?
                WHERE id = ?
            ";
            
            $stmtReverseDebit = $this->db->prepare($reverseDebitQuery);
            $stmtReverseCredit = $this->db->prepare($reverseCreditQuery);
            
            $stmtReverseDebit->execute([
                $originalTransaction['amount'],
                $originalTransaction['debit_ledger_id']
            ]);
            
            $stmtReverseCredit->execute([
                $originalTransaction['amount'],
                $originalTransaction['credit_ledger_id']
            ]);
            
            // Update transaction
            $updateQuery = "
                UPDATE transactions
                SET 
                    transaction_date = ?,
                    type_id = ?,
                    debit_ledger_id = ?,
                    credit_ledger_id = ?,
                    amount = ?,
                    narration = ?,
                    reference = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ";
            
            $stmtUpdate = $this->db->prepare($updateQuery);
            $successUpdate = $stmtUpdate->execute([
                $data['transaction_date'],
                $data['type_id'],
                $data['debit_ledger_id'],
                $data['credit_ledger_id'],
                $data['amount'],
                $data['narration'] ?? null,
                $data['reference'] ?? null,
                $id
            ]);
            
            if (!$successUpdate) {
                $this->db->rollBack();
                return false;
            }
            
            // Apply new ledger updates
            $updateDebitQuery = "
                UPDATE ledgers
                SET current_balance = current_balance + ?
                WHERE id = ?
            ";
            $updateCreditQuery = "
                UPDATE ledgers
                SET current_balance = current_balance - ?
                WHERE id = ?
            ";
            
            $stmtDebit = $this->db->prepare($updateDebitQuery);
            $stmtCredit = $this->db->prepare($updateCreditQuery);
            
            $stmtDebit->execute([
                $data['amount'],
                $data['debit_ledger_id']
            ]);
            
            $stmtCredit->execute([
                $data['amount'],
                $data['credit_ledger_id']
            ]);
            
            $this->db->commit();
            return $this->getTransactionById($id);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }
    
    /**
     * Delete transaction
     */
    public function deleteTransaction($id) {
        try {
            $this->db->beginTransaction();
            
            // Get transaction to reverse ledger impacts
            $transaction = $this->getTransactionById($id);
            if (!$transaction) {
                return false;
            }
            
            // Reverse ledger updates
            $reverseDebitQuery = "
                UPDATE ledgers
                SET current_balance = current_balance - ?
                WHERE id = ?
            ";
            $reverseCreditQuery = "
                UPDATE ledgers
                SET current_balance = current_balance + ?
                WHERE id = ?
            ";
            
            $stmtReverseDebit = $this->db->prepare($reverseDebitQuery);
            $stmtReverseCredit = $this->db->prepare($reverseCreditQuery);
            
            $stmtReverseDebit->execute([
                $transaction['amount'],
                $transaction['debit_ledger_id']
            ]);
            
            $stmtReverseCredit->execute([
                $transaction['amount'],
                $transaction['credit_ledger_id']
            ]);
            
            // Delete transaction
            $deleteQuery = "DELETE FROM transactions WHERE id = ?";
            $stmtDelete = $this->db->prepare($deleteQuery);
            $successDelete = $stmtDelete->execute([$id]);
            
            if (!$successDelete) {
                $this->db->rollBack();
                return false;
            }
            
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }
    
    /**
     * Get recent transactions
     */
    public function getRecentTransactions($limit = 10) {
        return $this->getAllTransactions($limit, 0);
    }
    
    /**
     * Get monthly totals for income and expenses
     */
    public function getMonthlyTotals($year = null, $month = null) {
        if (!$year) {
            $year = date('Y');
        }
        
        if (!$month) {
            $month = date('m');
        }
        
        $startDate = "$year-$month-01";
        $endDate = date('Y-m-t', strtotime($startDate));
        
        $query = "
            SELECT 
                SUM(CASE 
                    WHEN cg.type = 'income' THEN t.amount 
                    ELSE 0 
                END) as total_income,
                SUM(CASE 
                    WHEN dg.type = 'expense' THEN t.amount 
                    ELSE 0 
                END) as total_expenses
            FROM transactions t
            JOIN ledgers d ON t.debit_ledger_id = d.id
            JOIN ledgers c ON t.credit_ledger_id = c.id
            JOIN ledger_groups dg ON d.group_id = dg.id
            JOIN ledger_groups cg ON c.group_id = cg.id
            WHERE t.transaction_date BETWEEN ? AND ?
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$startDate, $endDate]);
        return $stmt->fetch();
    }
} 