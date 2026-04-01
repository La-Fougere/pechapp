<?php
declare(strict_types=1);

date_default_timezone_set('Europe/Paris');
header('Content-Type: application/json; charset=utf-8');

const MAX_FILE_BYTES = 10485760; // 10 MB
const MAX_TOTAL_BYTES = 32212254720; // 30 GB
const MIN_FORM_SECONDS = 2;
const RATE_WINDOW_SECONDS = 3600;
const RATE_MAX_FILES = 5000;

$allowedSpecies = [
  'dicentrarchus_labrax',
  'diplodus_annularis',
  'diplodus_puntazzo',
  'diplodus_sargus',
  'diplodus_vulgaris',
  'engraulis_encrasicolus',
  'mycteroperca_rubra',
  'lithognathus_mormyrus',
  'merluccius_merluccius',
  'mullus_surmuletus',
  'pagellus_acarne',
  'pagellus_bogaraveo',
  'pagellus_erythrinus',
  'pagrus_pagrus',
  'polyprion_americanus',
  'sardina_pilchardus',
  'scomber_scombrus',
  'solea_vulgaris',
  'sparus_aurata',
  'trachurus_trachurus',
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
  exit;
}

$species = isset($_POST['species']) ? strtolower(trim((string) $_POST['species'])) : '';
if ($species === '' || !in_array($species, $allowedSpecies, true)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid_species']);
  exit;
}

$honeypot = isset($_POST['website']) ? trim((string) $_POST['website']) : '';
if ($honeypot !== '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid_request']);
  exit;
}

$formStartedRaw = isset($_POST['form_started']) ? (int) $_POST['form_started'] : 0;
if ($formStartedRaw > 0) {
  $formStarted = $formStartedRaw > 1000000000000 ? (int) ($formStartedRaw / 1000) : $formStartedRaw;
  if (time() - $formStarted < MIN_FORM_SECONDS) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'too_fast']);
    exit;
  }
}

if (!isset($_FILES['photos'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'no_files']);
  exit;
}

$baseDir = '/home2/sc2mees1620/photos/donations';
if (!is_dir($baseDir)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'storage_unavailable']);
  exit;
}

$lockHandle = fopen($baseDir . '/.upload_lock', 'c');
if (!$lockHandle || !flock($lockHandle, LOCK_EX | LOCK_NB)) {
  http_response_code(429);
  echo json_encode(['ok' => false, 'error' => 'server_busy']);
  exit;
}

$speciesDir = $baseDir . '/' . $species;
if (!is_dir($speciesDir) && !mkdir($speciesDir, 0775, true)) {
  flock($lockHandle, LOCK_UN);
  fclose($lockHandle);
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'cannot_create_species_dir']);
  exit;
}

$hashDir = $baseDir . '/.hashes';
if (!is_dir($hashDir)) {
  mkdir($hashDir, 0775, true);
}

$rateDir = $baseDir . '/.ratelimit';
if (!is_dir($rateDir)) {
  mkdir($rateDir, 0775, true);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateKey = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $ip);
$rateFile = $rateDir . '/' . $rateKey . '.json';

$fileNames = $_FILES['photos']['name'];
$fileSizes = $_FILES['photos']['size'];
$fileTmpNames = $_FILES['photos']['tmp_name'];
$fileErrors = $_FILES['photos']['error'];

if (!is_array($fileNames)) {
  $fileNames = [$fileNames];
  $fileSizes = [$fileSizes];
  $fileTmpNames = [$fileTmpNames];
  $fileErrors = [$fileErrors];
}

$totalSize = array_sum($fileSizes);
if ($totalSize > MAX_TOTAL_BYTES) {
  flock($lockHandle, LOCK_UN);
  fclose($lockHandle);
  http_response_code(413);
  echo json_encode(['ok' => false, 'error' => 'total_too_large']);
  exit;
}

$rateData = ['ts' => time(), 'count' => 0];
if (is_readable($rateFile)) {
  $decoded = json_decode((string) file_get_contents($rateFile), true);
  if (is_array($decoded) && isset($decoded['ts'], $decoded['count'])) {
    $rateData = $decoded;
  }
}

if (time() - (int) $rateData['ts'] > RATE_WINDOW_SECONDS) {
  $rateData = ['ts' => time(), 'count' => 0];
}

$incomingCount = count($fileNames);
if ($rateData['count'] + $incomingCount > RATE_MAX_FILES) {
  flock($lockHandle, LOCK_UN);
  fclose($lockHandle);
  http_response_code(429);
  echo json_encode(['ok' => false, 'error' => 'rate_limited']);
  exit;
}

$rateData['count'] += $incomingCount;
file_put_contents($rateFile, json_encode($rateData));

$finfo = new finfo(FILEINFO_MIME_TYPE);
$newFiles = [];
$duplicates = 0;
$rejected = 0;

foreach ($fileNames as $index => $name) {
  $error = $fileErrors[$index] ?? UPLOAD_ERR_NO_FILE;
  if ($error !== UPLOAD_ERR_OK) {
    $rejected += 1;
    continue;
  }

  $size = (int) ($fileSizes[$index] ?? 0);
  if ($size <= 0 || $size > MAX_FILE_BYTES) {
    $rejected += 1;
    continue;
  }

  $tmpName = $fileTmpNames[$index] ?? '';
  if ($tmpName === '' || !is_uploaded_file($tmpName)) {
    $rejected += 1;
    continue;
  }

  $mime = $finfo->file($tmpName);
  if ($mime !== 'image/jpeg' && $mime !== 'image/png') {
    $rejected += 1;
    continue;
  }

  $hash = hash_file('sha256', $tmpName);
  $hashBucket = substr($hash, 0, 2);
  $hashBucketDir = $hashDir . '/' . $hashBucket;
  if (!is_dir($hashBucketDir)) {
    mkdir($hashBucketDir, 0775, true);
  }
  $hashPath = $hashBucketDir . '/' . $hash . '.txt';
  $hashHandle = @fopen($hashPath, 'x');
  if ($hashHandle === false) {
    $duplicates += 1;
    continue;
  }
  fclose($hashHandle);

  $newFiles[] = [
    'tmp' => $tmpName,
    'hash' => $hash,
    'hash_path' => $hashPath,
    'mime' => $mime,
  ];
}

$saved = 0;
if (count($newFiles) > 0) {
  $dateSuffix = (new DateTime('now', new DateTimeZone('Europe/Paris')))->format('d_m_y');

  foreach ($newFiles as $fileInfo) {
    $extension = $fileInfo['mime'] === 'image/png' ? 'png' : 'jpg';
    $tempName = $species . '_pending_' . bin2hex(random_bytes(4)) . '_' . $dateSuffix . '.' . $extension;
    $destination = $speciesDir . '/' . $tempName;

    if (move_uploaded_file($fileInfo['tmp'], $destination)) {
      $saved += 1;
      file_put_contents($fileInfo['hash_path'], $species . '/' . $tempName);
    } else {
      $rejected += 1;
      @unlink($fileInfo['hash_path']);
    }
  }
}

function reindex_species(string $speciesDir, string $species): bool {
  $files = [];
  $iterator = new DirectoryIterator($speciesDir);
  foreach ($iterator as $fileinfo) {
    if ($fileinfo->isDot() || !$fileinfo->isFile()) {
      continue;
    }
    $name = $fileinfo->getFilename();
    if ($name === '.index' || str_starts_with($name, '.tmp_')) {
      continue;
    }
    $ext = strtolower($fileinfo->getExtension());
    if ($ext === 'jpeg') {
      $ext = 'jpg';
    }
    if ($ext !== 'jpg' && $ext !== 'png') {
      continue;
    }
    $files[] = [
      'path' => $fileinfo->getPathname(),
      'mtime' => $fileinfo->getMTime(),
      'ext' => $ext,
    ];
  }

  usort($files, function ($a, $b) {
    if ($a['mtime'] === $b['mtime']) {
      return strcmp($a['path'], $b['path']);
    }
    return $a['mtime'] <=> $b['mtime'];
  });

  $tmpItems = [];
  foreach ($files as $file) {
    $tmp = $speciesDir . '/.tmp_' . bin2hex(random_bytes(6)) . '.' . $file['ext'];
    if (!rename($file['path'], $tmp)) {
      foreach ($tmpItems as $item) {
        @rename($item['tmp'], $item['orig']);
      }
      return false;
    }
    $tmpItems[] = [
      'tmp' => $tmp,
      'orig' => $file['path'],
      'mtime' => $file['mtime'],
      'ext' => $file['ext'],
    ];
  }

  $index = 0;
  foreach ($tmpItems as $item) {
    $index += 1;
    $indexStr = str_pad((string) $index, 7, '0', STR_PAD_LEFT);
    $dateSuffix = (new DateTime('@' . $item['mtime']))->setTimezone(new DateTimeZone('Europe/Paris'))->format('d_m_y');
    $finalName = $species . '_' . $indexStr . '_' . $dateSuffix . '.' . $item['ext'];
    $finalPath = $speciesDir . '/' . $finalName;
    if (!rename($item['tmp'], $finalPath)) {
      return false;
    }
  }

  $indexFile = $speciesDir . '/.index';
  file_put_contents($indexFile, (string) $index);
  return true;
}

if (!reindex_species($speciesDir, $species)) {
  flock($lockHandle, LOCK_UN);
  fclose($lockHandle);
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'reindex_failed']);
  exit;
}

flock($lockHandle, LOCK_UN);
fclose($lockHandle);

echo json_encode([
  'ok' => true,
  'saved' => $saved,
  'duplicates' => $duplicates,
  'rejected' => $rejected,
]);
