<?php
require_once __DIR__ . '/../config/database.php';

class UserModel {
    private $db;
    
    public function __construct() {
        $this->db = getDbConnection();
    }
    
    /**
     * Get all users
     */
    public function getAllUsers() {
        $query = "SELECT id, username, name, email, created_at, updated_at FROM users";
        $stmt = $this->db->query($query);
        return $stmt->fetchAll();
    }
    
    /**
     * Get user by ID
     */
    public function getUserById($id) {
        $query = "SELECT id, username, name, email, created_at, updated_at FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Get user by username
     */
    public function getUserByUsername($username) {
        $query = "SELECT * FROM users WHERE username = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$username]);
        return $stmt->fetch();
    }
    
    /**
     * Create user
     */
    public function createUser($data) {
        // Check if username already exists
        $checkQuery = "SELECT COUNT(*) as count FROM users WHERE username = ?";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->execute([$data['username']]);
        $result = $checkStmt->fetch();
        
        if ($result['count'] > 0) {
            return false; // Username already exists
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $query = "
            INSERT INTO users (username, password, name, email)
            VALUES (?, ?, ?, ?)
        ";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $data['username'],
            $hashedPassword,
            $data['name'],
            $data['email'] ?? null
        ]);
        
        if ($success) {
            return $this->getUserById($this->db->lastInsertId());
        }
        
        return false;
    }
    
    /**
     * Update user
     */
    public function updateUser($id, $data) {
        // If username is being updated, check if new username already exists
        if (isset($data['username'])) {
            $checkQuery = "SELECT COUNT(*) as count FROM users WHERE username = ? AND id != ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$data['username'], $id]);
            $result = $checkStmt->fetch();
            
            if ($result['count'] > 0) {
                return false; // Username already exists
            }
        }
        
        // Build update query dynamically based on what fields are being updated
        $updateFields = [];
        $params = [];
        
        if (isset($data['username'])) {
            $updateFields[] = "username = ?";
            $params[] = $data['username'];
        }
        
        if (isset($data['password'])) {
            $updateFields[] = "password = ?";
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (isset($data['name'])) {
            $updateFields[] = "name = ?";
            $params[] = $data['name'];
        }
        
        if (isset($data['email'])) {
            $updateFields[] = "email = ?";
            $params[] = $data['email'];
        }
        
        $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
        
        // If no fields to update, return false
        if (empty($updateFields)) {
            return false;
        }
        
        $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $params[] = $id;
        
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute($params);
        
        if ($success) {
            return $this->getUserById($id);
        }
        
        return false;
    }
    
    /**
     * Delete user
     */
    public function deleteUser($id) {
        $query = "DELETE FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$id]);
    }
    
    /**
     * Authenticate user
     */
    public function authenticateUser($username, $password) {
        $user = $this->getUserByUsername($username);
        
        if (!$user) {
            return false;
        }
        
        if (password_verify($password, $user['password'])) {
            // Remove password from user data before returning
            unset($user['password']);
            return $user;
        }
        
        return false;
    }
} 