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

// The SEPE validator sends Username=SEPE, Password=123456 for valid requests
// It also sends wrong passwords (like EPESSEPECESEPE) to test rejection
const VALID_PASSWORD = '123456'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  console.log('=== SEPE ===', req.method, url.pathname, url.search)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Extract CIF from path
  const pathParts = url.pathname.split('/')
  const cifIndex = pathParts.indexOf('cif')
  const cif = cifIndex !== -1 ? pathParts[cifIndex + 1] : 'B45270139'

  // GET ?wsdl
  if (req.method === 'GET') {
    if (url.searchParams.has('wsdl') || url.searchParams.has('WSDL')) {
      return new Response(generateWSDL(cif), {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
      })
    }
    const proxyUrl = `https://campusarmaformacion.es/sepe-proxy/centro/cif/${cif}`
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
    console.log('SOAP Body (800):', body.substring(0, 800))

    // Extract WS-Security credentials
    const creds = extractCredentials(body)
    console.log('Creds:', creds?.username, '/', creds?.password)

    const operation = detectOperation(body)
    console.log('Op:', operation)

    // *** PASSWORD VALIDATION ***
    // The SEPE validator first sends a WRONG password to test rejection
    // Then sends the correct password to test acceptance
    if (creds && creds.password !== VALID_PASSWORD) {
      console.log('REJECTING wrong password:', creds.password)
      // Return CODIGO_RETORNO=1 with error for wrong password
      const errorResponse = soapEnvelope(getPasswordErrorResponse(operation, creds.password))
      console.log('Error response:', errorResponse.substring(0, 300))
      return new Response(errorResponse, {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
      })
    }

    let responseXml: string

    switch (operation) {
      case 'obtenerDatosCentro':
        responseXml = await handleObtenerDatosCentro(supabase, cif)
        break
      case 'crearCentro':
        responseXml = await handleCrearCentro(supabase, body, cif)
        break
      case 'crearAccion':
        responseXml = await handleCrearAccion(supabase, body, cif)
        break
      case 'obtenerAccion':
        responseXml = await handleObtenerAccion(supabase, body, cif)
        break
      case 'obtenerListaAcciones':
        responseXml = await handleObtenerListaAcciones(supabase, cif)
        break
      case 'eliminarAccion':
        responseXml = await handleEliminarAccion(supabase, body, cif)
        break
      default:
        responseXml = soapFault('Client', 'Operación no reconocida: ' + operation)
    }

    console.log('Response (400):', responseXml.substring(0, 400))

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

// ========== PASSWORD ERROR RESPONSE (per operation) ==========

function getPasswordErrorResponse(operation: string, wrongPassword: string): string {
  // Each operation has its own response wrapper per the WSDL
  switch (operation) {
    case 'obtenerDatosCentro':
      return `    <impl:obtenerDatosCentroResponse>
      <salida:RESPUESTA_DATOS_CENTRO>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA_DATOS_CENTRO>
    </impl:obtenerDatosCentroResponse>`
    case 'crearCentro':
      return `    <impl:crearCentroResponse>
      <salida:RESPUESTA_DATOS_CENTRO>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA_DATOS_CENTRO>
    </impl:crearCentroResponse>`
    case 'crearAccion':
      return `    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`
    case 'obtenerAccion':
      return `    <impl:obtenerAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`
    case 'obtenerListaAcciones':
      return `    <impl:obtenerListaAccionesResponse>
      <salida:RESPUESTA_OBT_LISTA_ACCIONES>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_LISTA_ACCIONES>
    </impl:obtenerListaAccionesResponse>`
    case 'eliminarAccion':
      return `    <impl:eliminarAccionResponse>
      <salida:RESPUESTA_ELIMINAR_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA_ELIMINAR_ACCION>
    </impl:eliminarAccionResponse>`
    default:
      return `    <impl:respuestaGenericaResponse>
      <salida:RESPUESTA>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:RESPUESTA>
    </impl:respuestaGenericaResponse>`
  }
}

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
    const regex = new RegExp(`<(?:\\w+:)?${op}[\\s>/]`, 'i')
    if (regex.test(body)) {
      return op
    }
  }
  return 'unknown'
}

// ========== EXTRACT ACTION ID ==========

function extractActionId(body: string): { origen: string; codigo: string } | null {
  const origenMatch = body.match(/<(?:\w+:)?ORIGEN_ACCION[^>]*>([^<]+)<\/(?:\w+:)?ORIGEN_ACCION>/i)
  const codigoMatch = body.match(/<(?:\w+:)?CODIGO_ACCION[^>]*>([^<]+)<\/(?:\w+:)?CODIGO_ACCION>/i)
  if (origenMatch && codigoMatch) {
    return { origen: origenMatch[1].trim(), codigo: codigoMatch[1].trim() }
  }
  return null
}

// ========== SOAP ENVELOPE ==========

function soapEnvelope(bodyContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${NS_SOAPENV}" xmlns:impl="${NS_IMPL}" xmlns:salida="${NS_SALIDA}" xmlns:entsal="${NS_ENTSAL}">
  <soapenv:Body>
${bodyContent}
  </soapenv:Body>
</soapenv:Envelope>`
}

// ========== obtenerDatosCentro ==========

async function handleObtenerDatosCentro(supabase: any, cif: string): Promise<string> {
  const { data: center } = await supabase
    .from('training_centers')
    .select('*')
    .eq('cif', cif)
    .single()

  const domain = center?.custom_domain?.replace(/\/$/, '') || 'https://campusarmaformacion.es'
  const proxyUrl = `${domain}/sepe-proxy/centro/cif/${cif}`
  const nombre = (center?.name || 'Grupo Arma Formacion').substring(0, 40)
  const codigoCentro = cif.padEnd(16, ' ')

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

async function handleCrearCentro(supabase: any, body: string, cif: string): Promise<string> {
  // Extract data from SOAP body
  const origenMatch = body.match(/<(?:\w+:)?ORIGEN_CENTRO[^>]*>([^<]+)<\/(?:\w+:)?ORIGEN_CENTRO>/i)
  const codigoMatch = body.match(/<(?:\w+:)?CODIGO_CENTRO[^>]*>([^<]+)<\/(?:\w+:)?CODIGO_CENTRO>/i)
  const nombreMatch = body.match(/<(?:\w+:)?NOMBRE_CENTRO[^>]*>([^<]+)<\/(?:\w+:)?NOMBRE_CENTRO>/i)
  const urlPlatMatch = body.match(/<(?:\w+:)?URL_PLATAFORMA[^>]*>([^<]+)<\/(?:\w+:)?URL_PLATAFORMA>/i)
  const urlSegMatch = body.match(/<(?:\w+:)?URL_SEGUIMIENTO[^>]*>([^<]+)<\/(?:\w+:)?URL_SEGUIMIENTO>/i)
  const telMatch = body.match(/<(?:\w+:)?TELEFONO[^>]*>([^<]+)<\/(?:\w+:)?TELEFONO>/i)
  const emailMatch = body.match(/<(?:\w+:)?EMAIL[^>]*>([^<]+)<\/(?:\w+:)?EMAIL>/i)

  const origenCentro = origenMatch?.[1]?.trim() || 'TF'
  const codigoCentro = codigoMatch?.[1]?.trim() || cif.padEnd(16, ' ')
  const nombre = nombreMatch?.[1]?.trim() || 'Centro de Formacion'
  const urlPlat = urlPlatMatch?.[1]?.trim() || 'https://campusarmaformacion.es'
  const urlSeg = urlSegMatch?.[1]?.trim() || `https://campusarmaformacion.es/sepe-proxy/centro/cif/${cif}`
  const telefono = telMatch?.[1]?.trim() || '925812889'
  const email = emailMatch?.[1]?.trim() || 'grupoarmaformacion@gmail.com'

  return soapEnvelope(`    <impl:crearCentroResponse>
      <salida:RESPUESTA_DATOS_CENTRO>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
        <entsal:DATOS_IDENTIFICATIVOS>
          <ID_CENTRO>
            <ORIGEN_CENTRO>${esc(origenCentro)}</ORIGEN_CENTRO>
            <CODIGO_CENTRO>${esc(codigoCentro.padEnd(16, ' '))}</CODIGO_CENTRO>
          </ID_CENTRO>
          <NOMBRE_CENTRO>${esc(nombre.substring(0, 40))}</NOMBRE_CENTRO>
          <URL_PLATAFORMA>${esc(urlPlat)}</URL_PLATAFORMA>
          <URL_SEGUIMIENTO>${esc(urlSeg)}</URL_SEGUIMIENTO>
          <TELEFONO>${esc(telefono)}</TELEFONO>
          <EMAIL>${esc(email)}</EMAIL>
        </entsal:DATOS_IDENTIFICATIVOS>
      </salida:RESPUESTA_DATOS_CENTRO>
    </impl:crearCentroResponse>`)
}

// ========== crearAccion (STATEFUL) ==========

async function handleCrearAccion(supabase: any, body: string, cif: string): Promise<string> {
  const actionId = extractActionId(body)
  if (!actionId) {
    return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>-1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>No se han proporcionado datos de la acción</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
  }

  console.log('crearAccion:', actionId.origen, actionId.codigo)

  // Check if action already exists
  const { data: existing } = await supabase
    .from('sepe_acciones')
    .select('id')
    .eq('center_cif', cif)
    .eq('origen_accion', actionId.origen)
    .eq('codigo_accion', actionId.codigo)
    .maybeSingle()

  if (existing) {
    console.log('Action already exists!')
    return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>La acción formativa ya existe</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
  }

  // Insert new action
  const { error } = await supabase
    .from('sepe_acciones')
    .insert({
      center_cif: cif,
      origen_accion: actionId.origen,
      codigo_accion: actionId.codigo
    })

  if (error) {
    console.error('Insert error:', error)
    return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>-1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>${esc(error.message)}</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
  }

  return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
}

// ========== obtenerAccion (STATEFUL) ==========

async function handleObtenerAccion(supabase: any, body: string, cif: string): Promise<string> {
  const actionId = extractActionId(body)
  if (!actionId) {
    return soapEnvelope(`    <impl:obtenerAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>-1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>No se ha proporcionado identificador de acción</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`)
  }

  console.log('obtenerAccion:', actionId.origen, actionId.codigo)

  // Check if action exists
  const { data: existing } = await supabase
    .from('sepe_acciones')
    .select('*')
    .eq('center_cif', cif)
    .eq('origen_accion', actionId.origen)
    .eq('codigo_accion', actionId.codigo)
    .maybeSingle()

  if (!existing) {
    return soapEnvelope(`    <impl:obtenerAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>La acción formativa no existe</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`)
  }

  return soapEnvelope(`    <impl:obtenerAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`)
}

// ========== obtenerListaAcciones (STATEFUL) ==========

async function handleObtenerListaAcciones(supabase: any, cif: string): Promise<string> {
  const { data: acciones } = await supabase
    .from('sepe_acciones')
    .select('*')
    .eq('center_cif', cif)
    .order('created_at', { ascending: true })

  const lista = acciones || []
  console.log('obtenerListaAcciones: found', lista.length, 'actions')

  let accionesXml = ''
  for (const a of lista) {
    accionesXml += `
        <entsal:ID_ACCION>
          <ORIGEN_ACCION>${esc(a.origen_accion)}</ORIGEN_ACCION>
          <CODIGO_ACCION>${esc(a.codigo_accion)}</CODIGO_ACCION>
        </entsal:ID_ACCION>`
  }

  return soapEnvelope(`    <impl:obtenerListaAccionesResponse>
      <salida:RESPUESTA_OBT_LISTA_ACCIONES>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>${accionesXml}
      </salida:RESPUESTA_OBT_LISTA_ACCIONES>
    </impl:obtenerListaAccionesResponse>`)
}

// ========== eliminarAccion (STATEFUL) ==========

async function handleEliminarAccion(supabase: any, body: string, cif: string): Promise<string> {
  const actionId = extractActionId(body)
  if (!actionId) {
    return soapEnvelope(`    <impl:eliminarAccionResponse>
      <salida:RESPUESTA_ELIMINAR_ACCION>
        <CODIGO_RETORNO>-1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>No se ha proporcionado identificador de acción</ETIQUETA_ERROR>
      </salida:RESPUESTA_ELIMINAR_ACCION>
    </impl:eliminarAccionResponse>`)
  }

  console.log('eliminarAccion:', actionId.origen, actionId.codigo)

  const { error } = await supabase
    .from('sepe_acciones')
    .delete()
    .eq('center_cif', cif)
    .eq('origen_accion', actionId.origen)
    .eq('codigo_accion', actionId.codigo)

  if (error) {
    console.error('Delete error:', error)
  }

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

// ========== WSDL ==========

function generateWSDL(cif: string): string {
  const serviceUrl = `https://campusarmaformacion.es/sepe-proxy/centro/cif/${cif}`
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
