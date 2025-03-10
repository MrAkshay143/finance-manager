<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Initialize Database
 * - Creates tables if they don't exist
 * - Preloads ledger data
 */
function initDatabase() {
    $db = getDbConnection();
    
    // Create Tables
    createTables($db);
    
    // Preload Data
    preloadLedgerGroups($db);
    preloadLedgers($db);
    preloadTransactionTypes($db);
    
    echo "Database initialized successfully.\n";
}

/**
 * Create Database Tables
 */
function createTables($db) {
    // Users Table
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Ledger Groups Table
    $db->exec("CREATE TABLE IF NOT EXISTS ledger_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Ledgers Table
    $db->exec("CREATE TABLE IF NOT EXISTS ledgers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        group_id INTEGER NOT NULL,
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        account_number TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES ledger_groups(id)
    )");
    
    // Transaction Types Table
    $db->exec("CREATE TABLE IF NOT EXISTS transaction_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Transactions Table
    $db->exec("CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_date DATE NOT NULL,
        type_id INTEGER NOT NULL,
        debit_ledger_id INTEGER NOT NULL,
        credit_ledger_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        narration TEXT,
        reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES transaction_types(id),
        FOREIGN KEY (debit_ledger_id) REFERENCES ledgers(id),
        FOREIGN KEY (credit_ledger_id) REFERENCES ledgers(id)
    )");
}

/**
 * Preload Ledger Groups
 */
function preloadLedgerGroups($db) {
    $groups = [
        ['name' => 'Bank Accounts', 'type' => 'bank', 'description' => 'All bank accounts'],
        ['name' => 'Credit Cards', 'type' => 'credit-card', 'description' => 'All credit cards'],
        ['name' => 'Debtors', 'type' => 'debtor', 'description' => 'People who owe money'],
        ['name' => 'Cash', 'type' => 'cash', 'description' => 'Cash accounts'],
        ['name' => 'Income', 'type' => 'income', 'description' => 'Income categories'],
        ['name' => 'Expenses', 'type' => 'expense', 'description' => 'Expense categories']
    ];
    
    $stmt = $db->prepare("INSERT OR IGNORE INTO ledger_groups (name, type, description) VALUES (?, ?, ?)");
    
    foreach ($groups as $group) {
        $stmt->execute([$group['name'], $group['type'], $group['description']]);
    }
}

/**
 * Preload Ledgers
 */
function preloadLedgers($db) {
    // Get group IDs
    $groupQuery = $db->query("SELECT id, type FROM ledger_groups");
    $groups = [];
    while ($row = $groupQuery->fetch()) {
        $groups[$row['type']] = $row['id'];
    }
    
    // Bank accounts
    $bankAccounts = [
        ['name' => 'HDFC Bank', 'group_id' => $groups['bank'], 'opening_balance' => 25000],
        ['name' => 'ICICI Bank', 'group_id' => $groups['bank'], 'opening_balance' => 18500],
        ['name' => 'IDFC Bank', 'group_id' => $groups['bank'], 'opening_balance' => 12000],
        ['name' => 'Punjab Bank', 'group_id' => $groups['bank'], 'opening_balance' => 8000],
        ['name' => 'FI Bank', 'group_id' => $groups['bank'], 'opening_balance' => 5000],
        ['name' => 'Induslnd Bank', 'group_id' => $groups['bank'], 'opening_balance' => 7500]
    ];
    
    // Credit Cards
    $creditCards = [
        ['name' => 'ICICI 4004', 'group_id' => $groups['credit-card'], 'account_number' => '****4004', 'opening_balance' => -5000],
        ['name' => 'ICICI Coral 7001', 'group_id' => $groups['credit-card'], 'account_number' => '****7001', 'opening_balance' => -3500],
        ['name' => 'HDFC Millennia 3499', 'group_id' => $groups['credit-card'], 'account_number' => '****3499', 'opening_balance' => -12000],
        ['name' => 'HDFC Swiggy 6709', 'group_id' => $groups['credit-card'], 'account_number' => '****6709', 'opening_balance' => -2500],
        ['name' => 'HDFC Tata Neu Plus 7498', 'group_id' => $groups['credit-card'], 'account_number' => '****7498', 'opening_balance' => -4500],
        ['name' => 'HDFC Rupay 2136', 'group_id' => $groups['credit-card'], 'account_number' => '****2136', 'opening_balance' => -1800],
        ['name' => 'Axis Flipkart 7745', 'group_id' => $groups['credit-card'], 'account_number' => '****7745', 'opening_balance' => -3200],
        ['name' => 'Axis Airtel 5198', 'group_id' => $groups['credit-card'], 'account_number' => '****5198', 'opening_balance' => -2100],
        ['name' => 'Axis Zone 7940', 'group_id' => $groups['credit-card'], 'account_number' => '****7940', 'opening_balance' => -1500],
        ['name' => 'SBI SimplySave 2989', 'group_id' => $groups['credit-card'], 'account_number' => '****2989', 'opening_balance' => -3800],
        ['name' => 'SBI SimplyClick 6734', 'group_id' => $groups['credit-card'], 'account_number' => '****6734', 'opening_balance' => -2700],
        ['name' => 'Kotak Myntra 5004', 'group_id' => $groups['credit-card'], 'account_number' => '****5004', 'opening_balance' => -1900],
        ['name' => 'PNB 0246', 'group_id' => $groups['credit-card'], 'account_number' => '****0246', 'opening_balance' => -1200],
        ['name' => 'IDFC 1290', 'group_id' => $groups['credit-card'], 'account_number' => '****1290', 'opening_balance' => -2500]
    ];
    
    // Debtors
    $debtors = [
        ['name' => 'Neeraj Kumar Gautam', 'group_id' => $groups['debtor'], 'opening_balance' => 2000],
        ['name' => 'Manoj Mahato', 'group_id' => $groups['debtor'], 'opening_balance' => 1500],
        ['name' => 'Mukesh Tiwari', 'group_id' => $groups['debtor'], 'opening_balance' => 3000],
        ['name' => 'Krishnapada Bauri', 'group_id' => $groups['debtor'], 'opening_balance' => 1000],
        ['name' => 'Ajay Gupta', 'group_id' => $groups['debtor'], 'opening_balance' => 2500],
        ['name' => 'Ajay Pratap', 'group_id' => $groups['debtor'], 'opening_balance' => 1200],
        ['name' => 'Vivek Kumar', 'group_id' => $groups['debtor'], 'opening_balance' => 3500],
        ['name' => 'Ranjeet Kumar', 'group_id' => $groups['debtor'], 'opening_balance' => 2200],
        ['name' => 'Ranjeet Verma', 'group_id' => $groups['debtor'], 'opening_balance' => 1800],
        ['name' => 'Jitendra Singh', 'group_id' => $groups['debtor'], 'opening_balance' => 4000],
        ['name' => 'Saurabh Singh', 'group_id' => $groups['debtor'], 'opening_balance' => 2800],
        ['name' => 'Abhay Pratap Singh', 'group_id' => $groups['debtor'], 'opening_balance' => 3200],
        ['name' => 'Ashish Choudhary', 'group_id' => $groups['debtor'], 'opening_balance' => 1700],
        ['name' => 'Kanchan Modak', 'group_id' => $groups['debtor'], 'opening_balance' => 2300],
        ['name' => 'Shampa Kar', 'group_id' => $groups['debtor'], 'opening_balance' => 1900],
        ['name' => 'Souvik Mandal', 'group_id' => $groups['debtor'], 'opening_balance' => 2700],
        ['name' => 'Aveek Mandal', 'group_id' => $groups['debtor'], 'opening_balance' => 3100]
    ];
    
    // Cash
    $cash = [
        ['name' => 'Cash in Akshay', 'group_id' => $groups['cash'], 'opening_balance' => 15000]
    ];
    
    // Income Categories
    $incomeCategories = [
        ['name' => 'Salary', 'group_id' => $groups['income'], 'opening_balance' => 0],
        ['name' => 'Freelance', 'group_id' => $groups['income'], 'opening_balance' => 0],
        ['name' => 'Interest Income', 'group_id' => $groups['income'], 'opening_balance' => 0],
        ['name' => 'Dividend', 'group_id' => $groups['income'], 'opening_balance' => 0],
        ['name' => 'Rental Income', 'group_id' => $groups['income'], 'opening_balance' => 0]
    ];
    
    // Expense Categories
    $expenseCategories = [
        ['name' => 'Rent', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Groceries', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Utilities', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Entertainment', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Dining', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Transportation', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Shopping', 'group_id' => $groups['expense'], 'opening_balance' => 0],
        ['name' => 'Healthcare', 'group_id' => $groups['expense'], 'opening_balance' => 0]
    ];
    
    // Combine all ledgers
    $allLedgers = array_merge($bankAccounts, $creditCards, $debtors, $cash, $incomeCategories, $expenseCategories);
    
    // Insert ledgers
    $stmt = $db->prepare("INSERT OR IGNORE INTO ledgers (name, group_id, opening_balance, current_balance, account_number) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($allLedgers as $ledger) {
        $accountNumber = isset($ledger['account_number']) ? $ledger['account_number'] : null;
        $stmt->execute([
            $ledger['name'], 
            $ledger['group_id'], 
            $ledger['opening_balance'], 
            $ledger['opening_balance'], 
            $accountNumber
        ]);
    }
}

/**
 * Preload Transaction Types
 */
function preloadTransactionTypes($db) {
    $types = [
        ['name' => 'Receipt', 'description' => 'Money received'],
        ['name' => 'Payment', 'description' => 'Money paid out'],
        ['name' => 'Contra', 'description' => 'Transfers between accounts'],
        ['name' => 'Journal', 'description' => 'Accounting adjustments']
    ];
    
    $stmt = $db->prepare("INSERT OR IGNORE INTO transaction_types (name, description) VALUES (?, ?)");
    
    foreach ($types as $type) {
        $stmt->execute([$type['name'], $type['description']]);
    }
}

// Call init function when this script is executed directly
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    initDatabase();
} 