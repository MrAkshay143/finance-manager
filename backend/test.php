<?php
// Set content type to JSON
header('Content-Type: application/json');

// Return a simple response
echo json_encode([
    'status' => 'success',
    'message' => 'PHP is working correctly',
    'timestamp' => date('Y-m-d H:i:s')
]); 