<?php
/**
 * SEPE SOAP Proxy for Empleate Talavera
 * 
 * Subir a aulaempleatetalavera.es/sepe-proxy/
 * 
 * URL para SEPE: https://aulaempleatetalavera.es/sepe-proxy/centro/cif/B45878253
 * URL WSDL: https://aulaempleatetalavera.es/sepe-proxy/centro/cif/B45878253?wsdl
 */

// Configuración
$SUPABASE_URL = 'https://fkxbgifvwivlvpwxdzdb.supabase.co';
$EDGE_FUNCTION = '/functions/v1/sepe-tracking';

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, SOAPAction, Authorization');

// Manejar preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener la URI solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$queryString = $_SERVER['QUERY_STRING'] ?? '';

// Construir URL destino
$targetUrl = $SUPABASE_URL . $EDGE_FUNCTION;

// Extraer CIF de la URL (formato: /sepe-proxy/centro/cif/XXXXXXXXX)
if (preg_match('/\/centro\/cif\/([A-Z0-9]+)/i', $requestUri, $matches)) {
    $targetUrl .= '/centro/cif/' . $matches[1];
}

// Añadir query string si existe
if (!empty($queryString)) {
    $targetUrl .= '?' . $queryString;
}

// Log para debugging
error_log("SEPE Proxy EmpleateTalavera - Target URL: " . $targetUrl);
error_log("SEPE Proxy EmpleateTalavera - Method: " . $_SERVER['REQUEST_METHOD']);

// Obtener headers de la solicitud original
$headers = [];
foreach (getallheaders() as $name => $value) {
    $lowerName = strtolower($name);
    if (!in_array($lowerName, ['host', 'connection', 'content-length'])) {
        $headers[] = $name . ': ' . $value;
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

// Configurar método y body
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawBody = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
    error_log("SEPE Proxy EmpleateTalavera - Body length: " . strlen($rawBody));
}

// Ejecutar solicitud
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

// Manejar errores de cURL
if ($error) {
    error_log("SEPE Proxy EmpleateTalavera - cURL Error: " . $error);
    header('Content-Type: text/xml; charset=utf-8');
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <soap:Fault>
            <faultcode>Server</faultcode>
            <faultstring>Error de conexión con el servicio: ' . htmlspecialchars($error) . '</faultstring>
        </soap:Fault>
    </soap:Body>
</soap:Envelope>';
    exit();
}

// Establecer código de respuesta y content-type
http_response_code($httpCode);
if ($contentType) {
    header('Content-Type: ' . $contentType);
} else {
    header('Content-Type: text/xml; charset=utf-8');
}

// Reemplazar URLs de Supabase por URLs del proxy en la respuesta WSDL
if (strpos($queryString, 'wsdl') !== false || strpos($queryString, 'WSDL') !== false) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $proxyBaseUrl = $protocol . '://' . $_SERVER['HTTP_HOST'] . '/sepe-proxy';
    
    $response = str_replace(
        $SUPABASE_URL . $EDGE_FUNCTION,
        $proxyBaseUrl,
        $response
    );
}

// Log respuesta
error_log("SEPE Proxy EmpleateTalavera - Response code: " . $httpCode);
error_log("SEPE Proxy EmpleateTalavera - Response length: " . strlen($response));

// Enviar respuesta
echo $response;
