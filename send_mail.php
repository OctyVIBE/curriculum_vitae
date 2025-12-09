<?php
// send_mail.php

// Configuration
$recaptcha_secret = '6LfpQSYsAAAAAOTruXlOmqYa5ig3Re3Q_zH3Gtgk';
$recipient_email = 'sandro@octyvibe.be';

// Response header
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$user_email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
$action = $input['action'] ?? '';
$token = $input['token'] ?? '';

// Basic Validation
if (!filter_var($user_email, FILTER_VALIDATE_EMAIL) || empty($action) || empty($token)) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// 1. Verify reCAPTCHA with Google
$verify_url = 'https://www.google.com/recaptcha/api/siteverify';
$data = [
    'secret' => $recaptcha_secret,
    'response' => $token
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $verify_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Uncomment if SSL issues on localhost

$verify_response = curl_exec($ch);
$curl_error = curl_error($ch);
curl_close($ch);

if ($verify_response === false) {
    error_log("cURL Error: " . $curl_error);
    echo json_encode(['success' => false, 'message' => 'Captcha connection failed: ' . $curl_error]);
    exit;
}

$response_keys = json_decode($verify_response, true);

if (!$response_keys['success']) {
    // Log the error codes for debugging
    $error_codes = isset($response_keys['error-codes']) ? implode(', ', $response_keys['error-codes']) : 'Unknown error';
    error_log("reCAPTCHA Failed: " . $error_codes);
    echo json_encode(['success' => false, 'message' => 'Captcha verification failed: ' . $error_codes]);
    exit;
}

// 2. Send Email to Sandro
$subject = "Nouvelle action sur le CV Interactif ($action)";
$message = "Un utilisateur a effectué une action sur votre CV.\n\n";
$message .= "Action : " . htmlspecialchars($action) . "\n";
$message .= "Email utilisateur : " . $user_email . "\n";
$message .= "Date : " . date('Y-m-d H:i:s') . "\n";

$headers = 'From: no-reply@octyvibe.be' . "\r\n" .
    'Reply-To: ' . $user_email . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

$mail_sent = mail($recipient_email, $subject, $message, $headers);

if ($mail_sent) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Email sending failed']);
}
?>