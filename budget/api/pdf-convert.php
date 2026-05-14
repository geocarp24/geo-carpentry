<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('max_execution_time', 120);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'POST required']);
    exit;
}

if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
    $code = isset($_FILES['pdf']) ? $_FILES['pdf']['error'] : 'no file';
    echo json_encode(['error' => 'Upload failed, code: ' . $code]);
    exit;
}

if (!class_exists('Imagick')) {
    echo json_encode(['error' => 'Imagick not available']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/plans/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        echo json_encode(['error' => 'Cannot create uploads directory']);
        exit;
    }
}

if (!is_writable($uploadDir)) {
    echo json_encode(['error' => 'Uploads directory not writable']);
    exit;
}

$page = isset($_POST['page']) ? max(0, (int)$_POST['page']) : 0;

try {
    $tmpFile = $_FILES['pdf']['tmp_name'];
    $hash = substr(md5(uniqid('p', true)), 0, 10);

    // Step 1: Read only the requested page
    $im = new Imagick();
    $im->setResolution(100, 100);
    $im->readImage($tmpFile . '[' . $page . ']');

    // Step 2: Create white canvas same size as the page
    $width = $im->getImageWidth();
    $height = $im->getImageHeight();

    $canvas = new Imagick();
    $canvas->newImage($width, $height, new ImagickPixel('white'));
    $canvas->setImageFormat('jpeg');

    // Step 3: Composite PDF page onto white canvas
    $canvas->compositeImage($im, Imagick::COMPOSITE_OVER, 0, 0);

    // Step 4: Save as JPEG (no alpha channel issues)
    $canvas->setImageCompressionQuality(85);
    $filename = $hash . '_p' . ($page + 1) . '.jpg';
    $fullPath = $uploadDir . $filename;
    $canvas->writeImage($fullPath);

    $canvas->clear();
    $canvas->destroy();
    $im->clear();
    $im->destroy();

    $fileSize = file_exists($fullPath) ? filesize($fullPath) : 0;

    if ($fileSize < 100) {
        echo json_encode(['error' => 'Generated image is empty (' . $fileSize . ' bytes). Width=' . $width . ' Height=' . $height]);
        exit;
    }

    // Count total pages (fast, no rendering)
    $counter = new Imagick();
    $counter->pingImage($tmpFile);
    $totalPages = $counter->getNumberImages();
    $counter->clear();
    $counter->destroy();

    echo json_encode([
        'pages' => ['uploads/plans/' . $filename],
        'currentPage' => $page + 1,
        'totalPages' => $totalPages,
        'debug' => 'size=' . $fileSize . ' w=' . $width . ' h=' . $height
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
