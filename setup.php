<?php
/**
 * Setup Script for Finance Manager
 * 
 * This script initializes the database and creates a default admin user.
 * Run this script from the command line: php setup.php
 */

// Check if running from command line
if (php_sapi_name() !== 'cli') {
    echo "This script must be run from the command line";
    exit(1);
}

echo "Setting up Finance Manager...\n";

// Create database directory if it doesn't exist
$dbDir = __DIR__ . '/backend/database';
if (!is_dir($dbDir)) {
    echo "Creating database directory...\n";
    if (!mkdir($dbDir, 0777, true)) {
        echo "Failed to create database directory: $dbDir\n";
        exit(1);
    }
    chmod($dbDir, 0777);
}

// Include database initialization file
$initFile = __DIR__ . '/backend/database/init.php';
if (!file_exists($initFile)) {
    echo "Database initialization file not found: $initFile\n";
    exit(1);
}

require_once $initFile;

// Initialize database
echo "Initializing database...\n";
try {
    initDatabase();
    echo "Database initialized successfully.\n";
    
    // Create default admin user
    require_once __DIR__ . '/backend/models/UserModel.php';
    $userModel = new UserModel();
    
    // Check if admin user already exists
    $adminUser = $userModel->getUserByUsername('admin');
    
    if (!$adminUser) {
        $result = $userModel->createUser([
            'username' => 'admin',
            'password' => 'admin123',
            'name' => 'Administrator',
            'email' => 'admin@example.com'
        ]);
        
        if ($result) {
            echo "Default admin user created successfully.\n";
            echo "Username: admin\n";
            echo "Password: admin123\n";
        } else {
            echo "Failed to create default admin user.\n";
        }
    } else {
        echo "Admin user already exists.\n";
    }
    
    echo "\nSetup completed successfully!\n";
    echo "You can now start the development servers:\n";
    echo "1. PHP server: php -S localhost:8000 -t backend\n";
    echo "2. Frontend: cd frontend && npm run dev\n";
    
} catch (Exception $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
    exit(1);
} 