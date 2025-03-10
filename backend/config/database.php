<?php
/**
 * Database Configuration
 */
define('DB_TYPE', 'sqlite');
define('DB_PATH', __DIR__ . '/../database/finance_manager.db');

/**
 * Database Connection
 */
function getDbConnection() {
    try {
        $db = new PDO('sqlite:' . DB_PATH);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $db;
    } catch (PDOException $e) {
        die('Database connection failed: ' . $e->getMessage());
    }
} 