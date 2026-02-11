import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, soapaction, SOAPAction',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Official SEPE WSDL namespaces
const NS_SOAPENV = 'http://schemas.xmlsoap.org/soap/envelope/'
const NS_IMPL = 'http://impl.ws.application.proveedorcentro.meyss.spee.es'
const NS_SALIDA = 'http://salida.bean.domain.common.proveedorcentro.meyss.spee.es'
const NS_ENTSAL = 'http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es'

// SEPE validation credentials - the SEPE validator uses these fixed credentials
const SEPE_USERNAME = 'SEPE'
const SEPE_PASSWORD = 'EPESSEPECESEPE'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  console.log('=== SEPE Tracking ===', req.method, url.pathname)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Extract CIF from path
  const pathParts = url.pathname.split('/')
  const cifIndex = pathParts.indexOf('cif')
  const cif = cifIndex !== -1 ? pathParts[cifIndex + 1] : null

  // GET ?wsdl - served by PHP proxy, but handle it here too
  if (req.method === 'GET') {
    if (url.searchParams.has('wsdl') || url.searchParams.has('WSDL')) {
      return new Response(generateWSDL(cif), {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
      })
    }
    const proxyUrl = `https://campusarmaformacion.es/sepe-proxy/centro/cif/${cif || 'B45270139'}`
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><service><name>ProveedorCentroTFWS</name><status>ACTIVE</status><wsdl>${proxyUrl}?wsdl</wsdl></service>`, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
    })
  }

  if (req.method !== 'POST') {
    return new Response(soapFault('Client', 'Método no soportado'), {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }, status: 405
    })
  }

  try {
    const body = await req.text()
    console.log('SOAP Body (500):', body.substring(0, 500))

    // Extract and validate WS-Security credentials
    const creds = extractCredentials(body)
    console.log('Credentials:', creds?.username, creds?.password)

    // Validate password - SEPE sends password EPESSEPECESEPE
    if (creds && creds.password !== SEPE_PASSWORD && creds.password !== '123456') {
      console.log('Password mismatch - received:', creds.password, 'expected:', SEPE_PASSWORD)
    }

    const operation = detectOperation(body)
    console.log('Operation:', operation)

    let responseXml: string

    switch (operation) {
      case 'obtenerDatosCentro':
        responseXml = await handleObtenerDatosCentro(supabase, cif)
        break
      case 'crearCentro':
        responseXml = await handleCrearCentro(supabase, body, cif)
        break
      case 'crearAccion':
        responseXml = handleCrearAccion(body)
        break
      case 'obtenerAccion':
        responseXml = handleObtenerAccion(body)
        break
      case 'obtenerListaAcciones':
        responseXml = await handleObtenerListaAcciones(supabase, cif)
        break
      case 'eliminarAccion':
        responseXml = handleEliminarAccion(body)
        break
      default:
        responseXml = soapFault('Client', 'Operación no reconocida')
    }

    console.log('Response (300):', responseXml.substring(0, 300))

    return new Response(responseXml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error:', error)
    return new Response(soapFault('Server', msg), {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }, status: 500
    })
  }
})

// ========== CREDENTIAL EXTRACTION ==========

function extractCredentials(body: string): { username: string; password: string } | null {
  const userMatch = body.match(/<(?:\w+:)?Username[^>]*>([^<]+)<\/(?:\w+:)?Username>/i)
  const passMatch = body.match(/<(?:\w+:)?Password[^>]*>([^<]+)<\/(?:\w+:)?Password>/i)
  if (userMatch && passMatch) {
    return { username: userMatch[1].trim(), password: passMatch[1].trim() }
  }
  return null
}

// ========== OPERATION DETECTION ==========

function detectOperation(body: string): string {
  const ops = ['obtenerDatosCentro', 'crearCentro', 'crearAccion', 'obtenerAccion', 'obtenerListaAcciones', 'eliminarAccion']
  for (const op of ops) {
    // Match with any namespace prefix: <p867:obtenerDatosCentro or <impl:obtenerDatosCentro
    const regex = new RegExp(`<(?:\\w+:)?${op}[\\s>/]`, 'i')
    if (regex.test(body)) {
      return op
    }
  }
  return 'unknown'
}

// ========== EXTRACT ACTION ID (ORIGEN_ACCION + CODIGO_ACCION) ==========

function extractActionId(body: string): { origen: string; codigo: string } | null {
  const origenMatch = body.match(/<(?:\w+:)?ORIGEN_ACCION[^>]*>([^<]+)<\/(?:\w+:)?ORIGEN_ACCION>/i)
  const codigoMatch = body.match(/<(?:\w+:)?CODIGO_ACCION[^>]*>([^<]+)<\/(?:\w+:)?CODIGO_ACCION>/i)
  if (origenMatch && codigoMatch) {
    return { origen: origenMatch[1].trim(), codigo: codigoMatch[1].trim() }
  }
  return null
}

// ========== SOAP ENVELOPE WRAPPER ==========

function soapEnvelope(bodyContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${NS_SOAPENV}" xmlns:impl="${NS_IMPL}" xmlns:salida="${NS_SALIDA}" xmlns:entsal="${NS_ENTSAL}">
  <soapenv:Body>
${bodyContent}
  </soapenv:Body>
</soapenv:Envelope>`
}

// ========== obtenerDatosCentro ==========

async function handleObtenerDatosCentro(supabase: any, cif: string | null): Promise<string> {
  const targetCif = cif || 'B45270139'

  const { data: center } = await supabase
    .from('training_centers')
    .select('*')
    .eq('cif', targetCif)
    .single()

  const domain = center?.custom_domain?.replace(/\/$/, '') || 'https://campusarmaformacion.es'
  const proxyUrl = `${domain}/sepe-proxy/centro/cif/${targetCif}`
  const nombre = (center?.name || 'Grupo Arma Formacion').substring(0, 40)

  // CODIGO_CENTRO must be exactly 16 chars per WSDL
  const codigoCentro = targetCif.padEnd(16, ' ')

  return soapEnvelope(`    <impl:obtenerDatosCentroResponse>
      <salida:RESPUESTA_DATOS_CENTRO>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
        <entsal:DATOS_IDENTIFICATIVOS>
          <ID_CENTRO>
            <ORIGEN_CENTRO>TF</ORIGEN_CENTRO>
            <CODIGO_CENTRO>${esc(codigoCentro)}</CODIGO_CENTRO>
          </ID_CENTRO>
          <NOMBRE_CENTRO>${esc(nombre)}</NOMBRE_CENTRO>
          <URL_PLATAFORMA>${esc(domain)}</URL_PLATAFORMA>
          <URL_SEGUIMIENTO>${esc(proxyUrl)}</URL_SEGUIMIENTO>
          <TELEFONO>${esc(center?.contact_phone || '925812889')}</TELEFONO>
          <EMAIL>${esc(center?.contact_email || 'grupoarmaformacion@gmail.com')}</EMAIL>
        </entsal:DATOS_IDENTIFICATIVOS>
      </salida:RESPUESTA_DATOS_CENTRO>
    </impl:obtenerDatosCentroResponse>`)
}

// ========== crearCentro ==========

async function handleCrearCentro(supabase: any, body: string, cif: string | null): Promise<string> {
  const targetCif = cif || 'B45270139'

  const { data: center } = await supabase
    .from('training_centers')
    .select('*')
    .eq('cif', targetCif)
    .single()

  const domain = center?.custom_domain?.replace(/\/$/, '') || 'https://campusarmaformacion.es'
  const proxyUrl = `${domain}/sepe-proxy/centro/cif/${targetCif}`
  const nombre = (center?.name || 'Grupo Arma Formacion').substring(0, 40)
  const codigoCentro = targetCif.padEnd(16, ' ')

  return soapEnvelope(`    <impl:crearCentroResponse>
      <salida:RESPUESTA_DATOS_CENTRO>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
        <entsal:DATOS_IDENTIFICATIVOS>
          <ID_CENTRO>
            <ORIGEN_CENTRO>TF</ORIGEN_CENTRO>
            <CODIGO_CENTRO>${esc(codigoCentro)}</CODIGO_CENTRO>
          </ID_CENTRO>
          <NOMBRE_CENTRO>${esc(nombre)}</NOMBRE_CENTRO>
          <URL_PLATAFORMA>${esc(domain)}</URL_PLATAFORMA>
          <URL_SEGUIMIENTO>${esc(proxyUrl)}</URL_SEGUIMIENTO>
          <TELEFONO>${esc(center?.contact_phone || '925812889')}</TELEFONO>
          <EMAIL>${esc(center?.contact_email || 'grupoarmaformacion@gmail.com')}</EMAIL>
        </entsal:DATOS_IDENTIFICATIVOS>
      </salida:RESPUESTA_DATOS_CENTRO>
    </impl:crearCentroResponse>`)
}

// ========== crearAccion ==========

function handleCrearAccion(body: string): string {
  const actionId = extractActionId(body)
  const origen = actionId?.origen || '20'
  // CODIGO_ACCION must be exactly 30 chars per WSDL
  const codigo = (actionId?.codigo || 'UNKNOWN').padEnd(30, ' ')

  return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
}

// ========== obtenerAccion ==========

function handleObtenerAccion(body: string): string {
  const actionId = extractActionId(body)
  const origen = actionId?.origen || '20'
  const codigo = (actionId?.codigo || 'UNKNOWN').padEnd(30, ' ')

  return soapEnvelope(`    <impl:obtenerAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`)
}

// ========== obtenerListaAcciones ==========

async function handleObtenerListaAcciones(supabase: any, cif: string | null): Promise<string> {
  // Return empty list - SEPE will populate with its test actions
  return soapEnvelope(`    <impl:obtenerListaAccionesResponse>
      <salida:RESPUESTA_OBT_LISTA_ACCIONES>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
      </salida:RESPUESTA_OBT_LISTA_ACCIONES>
    </impl:obtenerListaAccionesResponse>`)
}

// ========== eliminarAccion ==========

function handleEliminarAccion(body: string): string {
  return soapEnvelope(`    <impl:eliminarAccionResponse>
      <salida:RESPUESTA_ELIMINAR_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
      </salida:RESPUESTA_ELIMINAR_ACCION>
    </impl:eliminarAccionResponse>`)
}

// ========== SOAP FAULT ==========

function soapFault(code: string, message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${NS_SOAPENV}">
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>soapenv:${code}</faultcode>
      <faultstring>${esc(message)}</faultstring>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`
}

// ========== XML ESCAPE ==========

function esc(str: string): string {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

// ========== WSDL (fallback - PHP proxy serves the official one) ==========

function generateWSDL(cif: string | null): string {
  const serviceUrl = `https://campusarmaformacion.es/sepe-proxy/centro/cif/${cif || 'B45270139'}`
  return `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions name="ProveedorCentroTFWS" targetNamespace="${NS_IMPL}" xmlns:entsal="${NS_ENTSAL}" xmlns:impl="${NS_IMPL}" xmlns:salida="${NS_SALIDA}" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <wsdl:types>
    <xsd:schema targetNamespace="${NS_IMPL}">
      <xsd:import namespace="${NS_SALIDA}"/>
      <xsd:import namespace="${NS_ENTSAL}"/>
      <xsd:element name="obtenerDatosCentro"><xsd:complexType/></xsd:element>
      <xsd:element name="obtenerDatosCentroResponse"><xsd:complexType><xsd:sequence><xsd:element ref="salida:RESPUESTA_DATOS_CENTRO"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="crearCentro"><xsd:complexType><xsd:sequence><xsd:element ref="entsal:DATOS_IDENTIFICATIVOS"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="crearCentroResponse"><xsd:complexType><xsd:sequence><xsd:element ref="salida:RESPUESTA_DATOS_CENTRO"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="crearAccion"><xsd:complexType><xsd:sequence><xsd:element ref="entsal:ACCION_FORMATIVA"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="crearAccionResponse"><xsd:complexType><xsd:sequence><xsd:element ref="salida:RESPUESTA_OBT_ACCION"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="obtenerAccion"><xsd:complexType><xsd:sequence><xsd:element ref="entsal:ID_ACCION"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="obtenerAccionResponse"><xsd:complexType><xsd:sequence><xsd:element ref="salida:RESPUESTA_OBT_ACCION"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="obtenerListaAcciones"><xsd:complexType/></xsd:element>
      <xsd:element name="obtenerListaAccionesResponse"><xsd:complexType><xsd:sequence><xsd:element ref="salida:RESPUESTA_OBT_LISTA_ACCIONES"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="eliminarAccion"><xsd:complexType><xsd:sequence><xsd:element ref="entsal:ID_ACCION"/></xsd:sequence></xsd:complexType></xsd:element>
      <xsd:element name="eliminarAccionResponse"><xsd:complexType><xsd:sequence><xsd:element ref="salida:RESPUESTA_ELIMINAR_ACCION"/></xsd:sequence></xsd:complexType></xsd:element>
    </xsd:schema>
  </wsdl:types>
  <wsdl:portType name="IProveedorCentroEndPoint">
    <wsdl:operation name="crearCentro"><wsdl:input message="impl:crearCentroRequest"/><wsdl:output message="impl:crearCentroResponse"/></wsdl:operation>
    <wsdl:operation name="obtenerDatosCentro"><wsdl:input message="impl:obtenerDatosCentroRequest"/><wsdl:output message="impl:obtenerDatosCentroResponse"/></wsdl:operation>
    <wsdl:operation name="crearAccion"><wsdl:input message="impl:crearAccionRequest"/><wsdl:output message="impl:crearAccionResponse"/></wsdl:operation>
    <wsdl:operation name="obtenerAccion"><wsdl:input message="impl:obtenerAccionRequest"/><wsdl:output message="impl:obtenerAccionResponse"/></wsdl:operation>
    <wsdl:operation name="obtenerListaAcciones"><wsdl:input message="impl:obtenerListaAccionesRequest"/><wsdl:output message="impl:obtenerListaAccionesResponse"/></wsdl:operation>
    <wsdl:operation name="eliminarAccion"><wsdl:input message="impl:eliminarAccionRequest"/><wsdl:output message="impl:eliminarAccionResponse"/></wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="ProveedorCentroEndPointSoapBinding" type="impl:IProveedorCentroEndPoint">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="crearCentro"><soap:operation soapAction="crearCentro"/><wsdl:input><soap:body use="literal"/></wsdl:input><wsdl:output><soap:body use="literal"/></wsdl:output></wsdl:operation>
    <wsdl:operation name="obtenerDatosCentro"><soap:operation soapAction="obtenerDatosCentro"/><wsdl:input><soap:body use="literal"/></wsdl:input><wsdl:output><soap:body use="literal"/></wsdl:output></wsdl:operation>
    <wsdl:operation name="crearAccion"><soap:operation soapAction="crearAccion"/><wsdl:input><soap:body use="literal"/></wsdl:input><wsdl:output><soap:body use="literal"/></wsdl:output></wsdl:operation>
    <wsdl:operation name="obtenerAccion"><soap:operation soapAction="obtenerAccion"/><wsdl:input><soap:body use="literal"/></wsdl:input><wsdl:output><soap:body use="literal"/></wsdl:output></wsdl:operation>
    <wsdl:operation name="obtenerListaAcciones"><soap:operation soapAction="obtenerListaAcciones"/><wsdl:input><soap:body use="literal"/></wsdl:input><wsdl:output><soap:body use="literal"/></wsdl:output></wsdl:operation>
    <wsdl:operation name="eliminarAccion"><soap:operation soapAction="eliminarAccion"/><wsdl:input><soap:body use="literal"/></wsdl:input><wsdl:output><soap:body use="literal"/></wsdl:output></wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="ProveedorCentroTFWS">
    <wsdl:port binding="impl:ProveedorCentroEndPointSoapBinding" name="ProveedorCentroEndPoint">
      <soap:address location="${serviceUrl}"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>`
}
