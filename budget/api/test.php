<?php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== PDF Conversion Test ===\n\n";

// Create a tiny 1-page PDF in memory
$pdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n206\n%%EOF";

$tmpFile = tempnam(sys_get_temp_dir(), 'test_') . '.pdf';
file_put_contents($tmpFile, $pdfContent);
echo "Test PDF created: " . filesize($tmpFile) . " bytes\n\n";

try {
    $im = new Imagick();
    echo "Imagick created OK\n";

    $im->setResolution(72, 72);
    echo "Resolution set OK\n";

    $im->readImage($tmpFile);
    echo "PDF read OK - pages: " . $im->getNumberImages() . "\n";

    $im->setImageFormat('png');
    echo "Format set to PNG OK\n";

    $im->setImageBackgroundColor('white');
    $im->setImageAlphaChannel(Imagick::ALPHACHANNEL_REMOVE);
    echo "Background set OK\n";

    $blob = $im->getImageBlob();
    echo "PNG blob size: " . strlen($blob) . " bytes\n";
    echo "\n=== SUCCESS - Imagick can convert PDF to PNG ===\n";

    $im->clear();
    $im->destroy();
} catch (Exception $e) {
    echo "\n=== ERROR ===\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}

unlink($tmpFile);
