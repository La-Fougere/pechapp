<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
$message = is_array($payload) && isset($payload['message'])
  ? trim((string) $payload['message'])
  : '';

if ($message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'message_required']);
  exit;
}

$webhook = 'https://discord.com/api/webhooks/1488831567630434425/DyOXqu13X1oZcoqXylKAVi_YIgCzuYUNbWaux6q2gPn0HEXXCin1DKo_c6lHJcSyysp1';

$ch = curl_init($webhook);
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => json_encode(['content' => $message]),
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 8,
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
  http_response_code(502);
  echo json_encode([
    'ok' => false,
    'error' => 'webhook_failed',
    'status' => $status,
    'details' => $curlError ?: null,
  ]);
  exit;
}

echo json_encode(['ok' => true]);
