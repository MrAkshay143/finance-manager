<?php
/**
 * Database Connection Manager
 * Provides database connections and management for multiple users
 */

// Base directories
define('DB_DIR', __DIR__);
define('USERS_DB_DIR', DB_DIR . '/users');
define('SESSION_DIR', DB_DIR . '/../sessions');

// Create necessary directories if they don't exist
if (!file_exists(USERS_DB_DIR)) {
    mkdir(USERS_DB_DIR, 0777, true);
}
if (!file_exists(SESSION_DIR)) {
    mkdir(SESSION_DIR, 0777, true);
}

/**
 * Get main database connection (for user management)
 */
function getMainConnection() {
    $mainDbFile = DB_DIR . '/main.db';
    $initRequired = !file_exists($mainDbFile);
    
    try {
        $db = new PDO('sqlite:' . $mainDbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        if ($initRequired) {
            initMainDatabase($db);
        }
        
        return $db;
    } catch (PDOException $e) {
        error_log('Main database connection error: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Get user-specific database connection
 */
function getUserConnection($username) {
    $userDbFile = USERS_DB_DIR . '/' . sanitizeFilename($username) . '.db';
    $initRequired = !file_exists($userDbFile);
    
    try {
        $db = new PDO('sqlite:' . $userDbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        if ($initRequired) {
            initUserDatabase($db);
        }
        
        return $db;
    } catch (PDOException $e) {
        error_log('User database connection error: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Initialize main database schema
 */
function initMainDatabase($db) {
    try {
        $db->beginTransaction();
        
        // Create users table
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                user_type TEXT DEFAULT 'user',
                currency TEXT DEFAULT 'USD',
                verification_token TEXT,
                verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Check if admin user exists
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result['count'] == 0) {
            // Create default admin user
            $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $db->prepare("
                INSERT INTO users (username, password, name, email, user_type, verified, currency)
                VALUES ('admin', ?, 'Administrator', 'admin@example.com', 'admin', 1, 'INR')
            ");
            $stmt->execute([$hashedPassword]);
            
            // Update credentials.json as well
            updateCredentialsFile();
        }
        
        $db->commit();
        return true;
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log('Main database initialization error: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Initialize user database schema
 */
function initUserDatabase($db) {
    try {
        $db->beginTransaction();
        
        // Create ledger_groups table
        $db->exec("
            CREATE TABLE IF NOT EXISTS ledger_groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                class TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Create ledgers table
        $db->exec("
            CREATE TABLE IF NOT EXISTS ledgers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                account_number TEXT,
                group_id INTEGER NOT NULL,
                opening_balance REAL DEFAULT 0,
                current_balance REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES ledger_groups(id) ON DELETE CASCADE
            )
        ");
        
        // Create transactions table
        $db->exec("
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_date DATETIME NOT NULL,
                transaction_type TEXT NOT NULL,
                amount REAL NOT NULL,
                narration TEXT,
                debit_ledger_id INTEGER NOT NULL,
                credit_ledger_id INTEGER NOT NULL,
                reference_number TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (debit_ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
                FOREIGN KEY (credit_ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE
            )
        ");
        
        // Create default ledger groups
        $groups = [
            ['Cash', 'cash', 'asset'],
            ['Bank Accounts', 'bank', 'asset'],
            ['Credit Cards', 'credit-card', 'liability'],
            ['Loans', 'loan', 'liability'],
            ['Income', 'income', 'income'],
            ['Expenses', 'expense', 'expense']
        ];
        
        foreach ($groups as $group) {
            $stmt = $db->prepare("
                INSERT INTO ledger_groups (name, type, class)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$group[0], $group[1], $group[2]]);
            
            $groupId = $db->lastInsertId();
            
            // Add default ledgers based on group
            if ($group[1] === 'cash') {
                $stmt = $db->prepare("
                    INSERT INTO ledgers (name, group_id, opening_balance, current_balance)
                    VALUES ('Cash on Hand', ?, 1000, 1000)
                ");
                $stmt->execute([$groupId]);
            } elseif ($group[1] === 'bank') {
                $stmt = $db->prepare("
                    INSERT INTO ledgers (name, group_id, opening_balance, current_balance)
                    VALUES ('Checking Account', ?, 5000, 5000)
                ");
                $stmt->execute([$groupId]);
            } elseif ($group[1] === 'income') {
                $stmt = $db->prepare("
                    INSERT INTO ledgers (name, group_id, opening_balance, current_balance)
                    VALUES ('Salary', ?, 0, 0)
                ");
                $stmt->execute([$groupId]);
            } elseif ($group[1] === 'expense') {
                $expenseLedgers = ['Groceries', 'Utilities', 'Transportation'];
                foreach ($expenseLedgers as $ledger) {
                    $stmt = $db->prepare("
                        INSERT INTO ledgers (name, group_id, opening_balance, current_balance)
                        VALUES (?, ?, 0, 0)
                    ");
                    $stmt->execute([$ledger, $groupId]);
                }
            }
        }
        
        $db->commit();
        return true;
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log('User database initialization error: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Update or create credentials.json file with users from database
 */
function updateCredentialsFile() {
    try {
        $db = getMainConnection();
        $stmt = $db->prepare("SELECT id, username, password, name, email, user_type, currency, verified, created_at FROM users");
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        $credentials = [
            'users' => $users
        ];
        
        file_put_contents(DB_DIR . '/credentials.json', json_encode($credentials, JSON_PRETTY_PRINT));
        return true;
    } catch (PDOException $e) {
        error_log('Updating credentials file error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Create a new session for user
 */
function createSession($userId, $username) {
    $sessionToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    $sessionData = [
        'user_id' => $userId,
        'username' => $username,
        'token' => $sessionToken,
        'created_at' => date('Y-m-d H:i:s'),
        'expires_at' => $expiresAt,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    $sessionFile = SESSION_DIR . '/' . $sessionToken . '.json';
    file_put_contents($sessionFile, json_encode($sessionData, JSON_PRETTY_PRINT));
    
    return [
        'token' => $sessionToken,
        'expires_at' => $expiresAt
    ];
}

/**
 * Get session data
 */
function getSession($token) {
    $sessionFile = SESSION_DIR . '/' . $token . '.json';
    
    if (!file_exists($sessionFile)) {
        return null;
    }
    
    $sessionData = json_decode(file_get_contents($sessionFile), true);
    
    // Check if session has expired
    if (strtotime($sessionData['expires_at']) < time()) {
        deleteSession($token);
        return null;
    }
    
    return $sessionData;
}

/**
 * Delete session
 */
function deleteSession($token) {
    $sessionFile = SESSION_DIR . '/' . $token . '.json';
    
    if (file_exists($sessionFile)) {
        unlink($sessionFile);
        return true;
    }
    
    return false;
}

/**
 * Sanitize a filename to prevent directory traversal
 */
function sanitizeFilename($filename) {
    // Remove any character that isn't a-z, A-Z, 0-9, or underscore
    return preg_replace('/[^a-zA-Z0-9_]/', '', $filename);
}

/**
 * Clean up expired sessions
 */
function cleanupSessions() {
    $now = time();
    $sessionFiles = glob(SESSION_DIR . '/*.json');
    
    foreach ($sessionFiles as $file) {
        $sessionData = json_decode(file_get_contents($file), true);
        
        if (strtotime($sessionData['expires_at']) < $now) {
            unlink($file);
        }
    }
}

// Run session cleanup on each request (with 5% probability to avoid doing it too often)
if (mt_rand(1, 100) <= 5) {
    cleanupSessions();
} 