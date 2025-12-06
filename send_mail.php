<?php
// send_mail.php

// Configuration
$recaptcha_secret = '6LeVQSMsAAAAANXuC-Yx7bHiXANE7UcECDLiNK4j';
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

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$verify_response = file_get_contents($verify_url, false, $context);
$response_keys = json_decode($verify_response, true);

if (!$response_keys['success']) {
    echo json_encode(['success' => false, 'message' => 'Captcha verification failed']);
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