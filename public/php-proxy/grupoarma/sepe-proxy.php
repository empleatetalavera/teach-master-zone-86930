<?php
/**
 * SEPE SOAP Proxy para Grupo Arma Formación
 * 
 * Subir a: campusarmaformacion.es/sepe-proxy/
 * 
 * URL para SEPE: https://campusarmaformacion.es/sepe-proxy/centro/cif/B45270139
 * URL WSDL: https://campusarmaformacion.es/sepe-proxy/centro/cif/B45270139?wsdl
 */

// Configuración
$SUPABASE_URL = 'https://fkxbgifvwivlvpwxdzdb.supabase.co';
$EDGE_FUNCTION = '/functions/v1/sepe-tracking';
$CENTER_CIF = 'B45270139';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZreGJnaWZ2d2l2bHZwd3hkemRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzExNjMsImV4cCI6MjA3Nzk0NzE2M30.aWNvmRgijK9VQTQD6Qn1lg1a-LKynzfDMssK3qYhuQM';

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, SOAPAction, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = $_SERVER['REQUEST_URI'];
$queryString = $_SERVER['QUERY_STRING'] ?? '';

// Construir URL destino
$targetUrl = $SUPABASE_URL . $EDGE_FUNCTION;

if (preg_match('/\/centro\/cif\/([A-Z0-9]+)/i', $requestUri, $matches)) {
    $targetUrl .= '/centro/cif/' . $matches[1];
} else {
    $targetUrl .= '/centro/cif/' . $CENTER_CIF;
}

if (!empty($queryString)) {
    $targetUrl .= '?' . $queryString;
}

error_log("SEPE Proxy - Target: " . $targetUrl . " Method: " . $_SERVER['REQUEST_METHOD']);

// Construir headers - SOLO los necesarios, sin reenviar accept-encoding del cliente
$headers = [];
$headers[] = 'Content-Type: text/xml; charset=utf-8';
$headers[] = 'Accept: application/soap+xml, text/xml, application/xml';
$headers[] = 'apikey: ' . $SUPABASE_ANON_KEY;
$headers[] = 'Authorization: Bearer ' . $SUPABASE_ANON_KEY;

// Reenviar SOAPAction si existe
foreach (getallheaders() as $name => $value) {
    $lowerName = strtolower($name);
    if ($lowerName === 'soapaction') {
        $headers[] = 'SOAPAction: ' . $value;
    }
}

// Configurar cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
// IMPORTANTE: Manejar descompresión gzip automáticamente
curl_setopt($ch, CURLOPT_ENCODING, '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawBody = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
    error_log("SEPE Proxy - Body: " . substr($rawBody, 0, 500));
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    error_log("SEPE Proxy - cURL Error: " . $error);
    header('Content-Type: text/xml; charset=utf-8');
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <soap:Fault>
            <faultcode>Server</faultcode>
            <faultstring>Error: ' . htmlspecialchars($error, ENT_XML1, 'UTF-8') . '</faultstring>
        </soap:Fault>
    </soap:Body>
</soap:Envelope>';
    exit();
}

// Forzar Content-Type XML UTF-8
http_response_code($httpCode);
header('Content-Type: text/xml; charset=utf-8');

// Asegurar encoding UTF-8 correcto
if (!mb_check_encoding($response, 'UTF-8')) {
    $response = mb_convert_encoding($response, 'UTF-8', 'auto');
}

error_log("SEPE Proxy - Response code: " . $httpCode . " Length: " . strlen($response));
error_log("SEPE Proxy - Response (first 300): " . substr($response, 0, 300));

echo $response;
