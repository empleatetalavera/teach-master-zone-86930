<?php
/**
 * SEPE SOAP Proxy para Grupo Arma Formación
 * 
 * URL para SEPE: https://campusarmaformacion.es/sepe-proxy/centro/cif/B45270139
 * URL WSDL: https://campusarmaformacion.es/sepe-proxy/centro/cif/B45270139?wsdl
 */

$SUPABASE_URL = 'https://fkxbgifvwivlvpwxdzdb.supabase.co';
$EDGE_FUNCTION = '/functions/v1/sepe-tracking';
$CENTER_CIF = 'B45270139';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZreGJnaWZ2d2l2bHZwd3hkemRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzExNjMsImV4cCI6MjA3Nzk0NzE2M30.aWNvmRgijK9VQTQD6Qn1lg1a-LKynzfDMssK3qYhuQM';
$PROXY_BASE_URL = 'https://campusarmaformacion.es/sepe-proxy/centro/cif/' . $CENTER_CIF;

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, SOAPAction, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = $_SERVER['REQUEST_URI'];
$queryString = $_SERVER['QUERY_STRING'] ?? '';

// GET ?wsdl → Servir WSDL oficial con nuestra URL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && (stripos($queryString, 'wsdl') !== false)) {
    header('Content-Type: text/xml; charset=utf-8');
    
    // Leer el WSDL oficial del SEPE (embebido)
    $wsdl = getOfficialWSDL();
    
    // Reemplazar soap:address con nuestra URL
    $wsdl = str_replace(
        'http://agintradesa.sepe.es:80/ProvCentTFWS/services/ProveedorCentroEndPoint',
        $PROXY_BASE_URL,
        $wsdl
    );
    
    echo $wsdl;
    exit();
}

// GET sin ?wsdl → Info del servicio
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: text/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>
<service>
  <name>ProveedorCentroTFWS</name>
  <status>ACTIVE</status>
  <wsdl>' . $PROXY_BASE_URL . '?wsdl</wsdl>
</service>';
    exit();
}

// POST → Reenviar al edge function
$targetUrl = $SUPABASE_URL . $EDGE_FUNCTION;

if (preg_match('/\/centro\/cif\/([A-Z0-9]+)/i', $requestUri, $matches)) {
    $targetUrl .= '/centro/cif/' . $matches[1];
} else {
    $targetUrl .= '/centro/cif/' . $CENTER_CIF;
}

error_log("SEPE Proxy POST - Target: " . $targetUrl);

$headers = [];
$headers[] = 'Content-Type: text/xml; charset=utf-8';
$headers[] = 'Accept: application/soap+xml, text/xml, application/xml';
$headers[] = 'apikey: ' . $SUPABASE_ANON_KEY;
$headers[] = 'Authorization: Bearer ' . $SUPABASE_ANON_KEY;

foreach (getallheaders() as $name => $value) {
    if (strtolower($name) === 'soapaction') {
        $headers[] = 'SOAPAction: ' . $value;
    }
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_ENCODING, '');

$rawBody = file_get_contents('php://input');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
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

http_response_code($httpCode);
header('Content-Type: text/xml; charset=utf-8');

if (!mb_check_encoding($response, 'UTF-8')) {
    $response = mb_convert_encoding($response, 'UTF-8', 'auto');
}

echo $response;

/**
 * WSDL oficial del SEPE embebido directamente
 * Fuente: https://www.sepe.es/SiteSepe/contenidos/personas/formacion/centros_formacion/pdf/ProveedorCentroTFWS_20140619.wsdl
 */
function getOfficialWSDL() {
    return '<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions name="ProveedorCentroTFWS" targetNamespace="http://impl.ws.application.proveedorcentro.meyss.spee.es" xmlns:entrada="http://entrada.bean.domain.common.proveedorcentro.meyss.spee.es" xmlns:entsal="http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es" xmlns:impl="http://impl.ws.application.proveedorcentro.meyss.spee.es" xmlns:salida="http://salida.bean.domain.common.proveedorcentro.meyss.spee.es" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:sp="http://docs.oasis-open.org/ws-sx/ws-securitypolicy/200702" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <wsdl:types>
    <xsd:schema targetNamespace="http://impl.ws.application.proveedorcentro.meyss.spee.es" xmlns="http://impl.ws.application.proveedorcentro.meyss.spee.es">
      <xsd:import namespace="http://salida.bean.domain.common.proveedorcentro.meyss.spee.es"/>
      <xsd:import namespace="http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es"/>
      <xsd:element name="crearCentro">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="entsal:DATOS_IDENTIFICATIVOS"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="crearCentroResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="salida:RESPUESTA_DATOS_CENTRO"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="obtenerDatosCentro">
        <xsd:complexType/>
      </xsd:element>
      <xsd:element name="obtenerDatosCentroResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="salida:RESPUESTA_DATOS_CENTRO"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="crearAccion">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="entsal:ACCION_FORMATIVA"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="crearAccionResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="salida:RESPUESTA_OBT_ACCION"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="obtenerAccion">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="entsal:ID_ACCION"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="obtenerAccionResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="salida:RESPUESTA_OBT_ACCION"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="obtenerListaAcciones">
        <xsd:complexType/>
      </xsd:element>
      <xsd:element name="obtenerListaAccionesResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="salida:RESPUESTA_OBT_LISTA_ACCIONES"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="eliminarAccion">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="entsal:ID_ACCION"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="eliminarAccionResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" ref="salida:RESPUESTA_ELIMINAR_ACCION"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
    <xsd:schema targetNamespace="http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es" xmlns="http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es">
      <xsd:simpleType name="tipo_fecha">
        <xsd:restriction base="xsd:string">
          <xsd:pattern value="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="tipo_si_no">
        <xsd:restriction base="xsd:string">
          <xsd:enumeration value="SI"/>
          <xsd:enumeration value="NO"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="tipo_documento">
        <xsd:restriction base="xsd:string">
          <xsd:enumeration value="D"/>
          <xsd:enumeration value="E"/>
          <xsd:enumeration value="U"/>
          <xsd:enumeration value="W"/>
          <xsd:enumeration value="G"/>
          <xsd:enumeration value="H"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="codigo_retorno">
        <xsd:restriction base="xsd:int">
          <xsd:minInclusive value="-2"/>
          <xsd:maxInclusive value="2"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="origen">
        <xsd:restriction base="xsd:string">
          <xsd:minLength value="2"/>
          <xsd:maxLength value="2"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="codigo_centro">
        <xsd:restriction base="xsd:string">
          <xsd:length value="16"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="string_40">
        <xsd:restriction base="xsd:string">
          <xsd:minLength value="1"/>
          <xsd:maxLength value="40"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="url">
        <xsd:restriction base="xsd:string">
          <xsd:minLength value="1"/>
          <xsd:maxLength value="400"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="telefono">
        <xsd:restriction base="xsd:string">
          <xsd:maxLength value="15"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:simpleType name="email">
        <xsd:restriction base="xsd:string">
          <xsd:minLength value="1"/>
          <xsd:maxLength value="250"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:element name="DATOS_IDENTIFICATIVOS">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="ID_CENTRO" nillable="false">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_CENTRO" nillable="false" type="origen"/>
                  <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_CENTRO" nillable="false" type="codigo_centro"/>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="NOMBRE_CENTRO" nillable="false" type="string_40"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="URL_PLATAFORMA" nillable="false" type="url"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="URL_SEGUIMIENTO" nillable="false" type="url"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="TELEFONO" nillable="false" type="telefono"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="EMAIL" nillable="false" type="email"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ID_ACCION">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_ACCION" nillable="false">
              <xsd:simpleType>
                <xsd:restriction base="xsd:string">
                  <xsd:length value="2"/>
                </xsd:restriction>
              </xsd:simpleType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_ACCION" nillable="false">
              <xsd:simpleType>
                <xsd:restriction base="xsd:string">
                  <xsd:length value="30"/>
                </xsd:restriction>
              </xsd:simpleType>
            </xsd:element>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
    <xsd:schema targetNamespace="http://salida.bean.domain.common.proveedorcentro.meyss.spee.es" xmlns="http://salida.bean.domain.common.proveedorcentro.meyss.spee.es">
      <xsd:import namespace="http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es"/>
      <xsd:simpleType name="mensaje_error">
        <xsd:restriction base="xsd:string">
          <xsd:length value="250"/>
        </xsd:restriction>
      </xsd:simpleType>
      <xsd:element name="RESPUESTA_DATOS_CENTRO">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_RETORNO" nillable="false" type="entsal:codigo_retorno"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="ETIQUETA_ERROR" nillable="true" type="mensaje_error"/>
            <xsd:element maxOccurs="1" ref="entsal:DATOS_IDENTIFICATIVOS"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="RESPUESTA_OBT_ACCION">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_RETORNO" nillable="false" type="entsal:codigo_retorno"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="ETIQUETA_ERROR" nillable="true" type="mensaje_error"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="RESPUESTA_OBT_LISTA_ACCIONES">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_RETORNO" nillable="false" type="entsal:codigo_retorno"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="ETIQUETA_ERROR" nillable="true" type="mensaje_error"/>
            <xsd:element maxOccurs="unbounded" minOccurs="0" ref="entsal:ID_ACCION"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="RESPUESTA_ELIMINAR_ACCION">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_RETORNO" nillable="false" type="entsal:codigo_retorno"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="ETIQUETA_ERROR" nillable="true" type="mensaje_error"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>
  <wsdl:message name="obtenerDatosCentroMessageRequest">
    <wsdl:part element="impl:obtenerDatosCentro" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="crearAccionMessageResponse">
    <wsdl:part element="impl:crearAccionResponse" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="eliminarAccionMessageResponse">
    <wsdl:part element="impl:eliminarAccionResponse" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="obtenerListaAccionesMessageResponse">
    <wsdl:part element="impl:obtenerListaAccionesResponse" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="crearCentroMessageResponse">
    <wsdl:part element="impl:crearCentroResponse" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="crearCentroMessageRequest">
    <wsdl:part element="impl:crearCentro" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="crearAccionMessageRequest">
    <wsdl:part element="impl:crearAccion" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="obtenerAccionMessageRequest">
    <wsdl:part element="impl:obtenerAccion" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="obtenerDatosCentroMessageResponse">
    <wsdl:part element="impl:obtenerDatosCentroResponse" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="obtenerListaAccionesMessageRequest">
    <wsdl:part element="impl:obtenerListaAcciones" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="eliminarAccionMessageRequest">
    <wsdl:part element="impl:eliminarAccion" name="parameters"/>
  </wsdl:message>
  <wsdl:message name="obtenerAccionMessageResponse">
    <wsdl:part element="impl:obtenerAccionResponse" name="parameters"/>
  </wsdl:message>
  <wsdl:portType name="IProveedorCentroEndPoint">
    <wsdl:operation name="crearCentro">
      <wsdl:input message="impl:crearCentroMessageRequest" name="crearCentroInput"/>
      <wsdl:output message="impl:crearCentroMessageResponse" name="crearCentroOutput"/>
    </wsdl:operation>
    <wsdl:operation name="obtenerDatosCentro">
      <wsdl:input message="impl:obtenerDatosCentroMessageRequest" name="obtenerDatosCentroInput"/>
      <wsdl:output message="impl:obtenerDatosCentroMessageResponse" name="obtenerDatosCentroOutput"/>
    </wsdl:operation>
    <wsdl:operation name="crearAccion">
      <wsdl:input message="impl:crearAccionMessageRequest" name="crearAccionInput"/>
      <wsdl:output message="impl:crearAccionMessageResponse" name="crearAccionOutput"/>
    </wsdl:operation>
    <wsdl:operation name="obtenerAccion">
      <wsdl:input message="impl:obtenerAccionMessageRequest" name="obtenerAccionInput"/>
      <wsdl:output message="impl:obtenerAccionMessageResponse" name="obtenerAccionOutput"/>
    </wsdl:operation>
    <wsdl:operation name="obtenerListaAcciones">
      <wsdl:input message="impl:obtenerListaAccionesMessageRequest" name="obtenerListaAccionesInput"/>
      <wsdl:output message="impl:obtenerListaAccionesMessageResponse" name="obtenerListaAccionesOutput"/>
    </wsdl:operation>
    <wsdl:operation name="eliminarAccion">
      <wsdl:input message="impl:eliminarAccionMessageRequest" name="eliminarAccionInput"/>
      <wsdl:output message="impl:eliminarAccionMessageResponse" name="eliminarAccionOutput"/>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="ProveedorCentroEndPointSoapBinding" type="impl:IProveedorCentroEndPoint">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="crearCentro">
      <soap:operation soapAction="crearCentro"/>
      <wsdl:input name="crearCentroInput"><soap:body use="literal"/></wsdl:input>
      <wsdl:output name="crearCentroOutput"><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="obtenerDatosCentro">
      <soap:operation soapAction="obtenerDatosCentro"/>
      <wsdl:input name="obtenerDatosCentroInput"><soap:body use="literal"/></wsdl:input>
      <wsdl:output name="obtenerDatosCentroOutput"><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="crearAccion">
      <soap:operation soapAction="crearAccion"/>
      <wsdl:input name="crearAccionInput"><soap:body use="literal"/></wsdl:input>
      <wsdl:output name="crearAccionOutput"><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="obtenerAccion">
      <soap:operation soapAction="obtenerAccion"/>
      <wsdl:input name="obtenerAccionInput"><soap:body use="literal"/></wsdl:input>
      <wsdl:output name="obtenerAccionOutput"><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="obtenerListaAcciones">
      <soap:operation soapAction="obtenerListaAcciones"/>
      <wsdl:input name="obtenerListaAccionesInput"><soap:body use="literal"/></wsdl:input>
      <wsdl:output name="obtenerListaAccionesOutput"><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="eliminarAccion">
      <soap:operation soapAction="eliminarAccion"/>
      <wsdl:input name="eliminarAccionInput"><soap:body use="literal"/></wsdl:input>
      <wsdl:output name="eliminarAccionOutput"><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="ProveedorCentroTFWS">
    <wsdl:port binding="impl:ProveedorCentroEndPointSoapBinding" name="ProveedorCentroEndPoint">
      <soap:address location="http://agintradesa.sepe.es:80/ProvCentTFWS/services/ProveedorCentroEndPoint"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>';
}
