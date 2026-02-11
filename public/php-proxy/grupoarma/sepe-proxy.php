<?php
/**
 * SEPE SOAP Proxy para Grupo Arma Formación
 * 
 * Subir a: campusarmaformacion.es/sepe-proxy/
 * 
 * URL para SEPE: https://campusarmaformacion.es/sepe-proxy/centro/cif/B45270139
 * URL WSDL: https://campusarmaformacion.es/sepe-proxy/centro/cif/B45270139?wsdl
 * 
 * Datos del centro:
 * - CIF: B45270139
 * - Nombre: Grupo Arma Formación
 * - Dominio campus: https://campusarmaformacion.es
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
} else {
    // Si no viene CIF en la URL, usar el del centro
    $targetUrl .= '/centro/cif/' . $CENTER_CIF;
}

// Añadir query string si existe
if (!empty($queryString)) {
    $targetUrl .= '?' . $queryString;
}

// Log para debugging
error_log("SEPE Proxy GrupoArma - Target URL: " . $targetUrl);
error_log("SEPE Proxy GrupoArma - Method: " . $_SERVER['REQUEST_METHOD']);

// Obtener headers de la solicitud original
$headers = [];
foreach (getallheaders() as $name => $value) {
    $lowerName = strtolower($name);
    if (!in_array($lowerName, ['host', 'connection', 'content-length'])) {
        $headers[] = $name . ': ' . $value;
    }
}

// Añadir header apikey de Supabase (requerido para edge functions)
$headers[] = 'apikey: ' . $SUPABASE_ANON_KEY;
$headers[] = 'Authorization: Bearer ' . $SUPABASE_ANON_KEY;

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
    error_log("SEPE Proxy GrupoArma - Body length: " . strlen($rawBody));
}

// Ejecutar solicitud
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

// Manejar errores de cURL
if ($error) {
    error_log("SEPE Proxy GrupoArma - cURL Error: " . $error);
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
    $proxyBaseUrl = 'https://campusarmaformacion.es/sepe-proxy';
    $response = str_replace(
        $SUPABASE_URL . $EDGE_FUNCTION,
        $proxyBaseUrl,
        $response
    );
}

// También reemplazar URL_PLATAFORMA en las respuestas SOAP
$response = str_replace(
    'https://talentcloudsolution.com',
    'https://campusarmaformacion.es',
    $response
);

// Log respuesta
error_log("SEPE Proxy GrupoArma - Response code: " . $httpCode);
error_log("SEPE Proxy GrupoArma - Response length: " . strlen($response));

// Enviar respuesta
echo $response;