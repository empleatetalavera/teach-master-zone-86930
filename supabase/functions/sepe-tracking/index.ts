import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, soapaction, SOAPAction',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const NS_SOAPENV = 'http://schemas.xmlsoap.org/soap/envelope/'
const NS_IMPL = 'http://impl.ws.application.proveedorcentro.meyss.spee.es'
const NS_SALIDA = 'http://salida.bean.domain.common.proveedorcentro.meyss.spee.es'
const NS_ENTSAL = 'http://entsal.bean.domain.common.proveedorcentro.meyss.spee.es'

const DEFAULT_VALID_PASSWORD = '123456'

async function resolveCenterTrackingPassword(supabase: any, centerId?: string): Promise<string> {
  if (!centerId) return DEFAULT_VALID_PASSWORD

  const { data, error } = await supabase
    .from('sionline_settings')
    .select('credenciales_seguimiento, enabled')
    .eq('training_center_id', centerId)
    .eq('enabled', true)
    .maybeSingle()

  if (error) {
    console.warn('Could not resolve center tracking credentials, using default password')
    return DEFAULT_VALID_PASSWORD
  }

  const credential = data?.credenciales_seguimiento?.trim()
  return credential || DEFAULT_VALID_PASSWORD
}

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

  // Resolve center data
  const { data: center } = await supabase
    .from('training_centers')
    .select('*')
    .eq('cif', cif)
    .maybeSingle()

  const centerDomain = center?.custom_domain?.replace(/\/$/, '') || center?.campus_url?.replace(/\/$/, '') || 'https://campusarmaformacion.es'
  const proxyUrl = `${centerDomain}/sepe-proxy/centro/cif/${cif}`

  // GET ?wsdl
  if (req.method === 'GET') {
    if (url.searchParams.has('wsdl') || url.searchParams.has('WSDL')) {
      return new Response(generateFullWSDL(proxyUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
      })
    }
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
    console.log('SOAP Body (1000):', body.substring(0, 1000))

    const creds = extractCredentials(body)
    console.log('Creds:', creds?.username, '/', creds?.password)

    const operation = detectOperation(body)
    console.log('Op:', operation)

    // PASSWORD VALIDATION
    if (creds && creds.password !== VALID_PASSWORD) {
      console.log('REJECTING wrong password:', creds.password)
      const errorResponse = soapEnvelope(getPasswordErrorResponse(operation, creds.password))
      return new Response(errorResponse, {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' }
      })
    }

    let responseXml: string

    switch (operation) {
      case 'obtenerDatosCentro':
        responseXml = handleObtenerDatosCentro(center, cif, centerDomain, proxyUrl)
        break
      case 'crearCentro':
        responseXml = handleCrearCentro(body, cif, center, centerDomain, proxyUrl)
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

    console.log('Response (500):', responseXml.substring(0, 500))

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

// ========== PASSWORD ERROR RESPONSE ==========

function getPasswordErrorResponse(operation: string, wrongPassword: string): string {
  const responses: Record<string, { wrapper: string; inner: string }> = {
    'obtenerDatosCentro': { wrapper: 'obtenerDatosCentroResponse', inner: 'RESPUESTA_DATOS_CENTRO' },
    'crearCentro': { wrapper: 'crearCentroResponse', inner: 'RESPUESTA_DATOS_CENTRO' },
    'crearAccion': { wrapper: 'crearAccionResponse', inner: 'RESPUESTA_OBT_ACCION' },
    'obtenerAccion': { wrapper: 'obtenerAccionResponse', inner: 'RESPUESTA_OBT_ACCION' },
    'obtenerListaAcciones': { wrapper: 'obtenerListaAccionesResponse', inner: 'RESPUESTA_OBT_LISTA_ACCIONES' },
    'eliminarAccion': { wrapper: 'eliminarAccionResponse', inner: 'RESPUESTA_ELIMINAR_ACCION' },
  }
  const r = responses[operation] || { wrapper: 'respuestaGenericaResponse', inner: 'RESPUESTA' }
  return `    <impl:${r.wrapper}>
      <salida:${r.inner}>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>password incorrecto '${esc(wrongPassword)}'</ETIQUETA_ERROR>
      </salida:${r.inner}>
    </impl:${r.wrapper}>`
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

// ========== EXTRACT ACTION DATA ==========

function extractActionId(body: string): { origen: string; codigo: string } | null {
  const origenMatch = body.match(/<(?:\w+:)?ORIGEN_ACCION[^>]*>([^<]+)<\/(?:\w+:)?ORIGEN_ACCION>/i)
  const codigoMatch = body.match(/<(?:\w+:)?CODIGO_ACCION[^>]*>([^<]+)<\/(?:\w+:)?CODIGO_ACCION>/i)
  if (origenMatch && codigoMatch) {
    return { origen: origenMatch[1].trim(), codigo: codigoMatch[1].trim() }
  }
  return null
}

// Extract the full ACCION_FORMATIVA XML from the SOAP request body
function extractAccionFormativaXml(body: string): string | null {
  // Try to find ACCION_FORMATIVA element (with or without namespace prefix)
  const match = body.match(/<(?:\w+:)?ACCION_FORMATIVA[^>]*>([\s\S]*?)<\/(?:\w+:)?ACCION_FORMATIVA>/i)
  if (match) {
    return match[0]
  }
  return null
}

// Build a minimal ACCION_FORMATIVA XML for responses when we don't have the full data
function buildMinimalAccionFormativa(origen: string, codigo: string): string {
  const today = new Date()
  const startDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
  const endDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear() + 1}`

  return `<entsal:ACCION_FORMATIVA>
            <ID_ACCION>
              <ORIGEN_ACCION>${esc(origen.padEnd(2, ' '))}</ORIGEN_ACCION>
              <CODIGO_ACCION>${esc(codigo.padEnd(30, ' '))}</CODIGO_ACCION>
            </ID_ACCION>
            <SITUACION>AC</SITUACION>
            <ID_ESPECIALIDAD_PRINCIPAL>
              <ORIGEN_ESPECIALIDAD>SF</ORIGEN_ESPECIALIDAD>
              <AREA_PROFESIONAL>ADG0</AREA_PROFESIONAL>
              <CODIGO_ESPECIALIDAD>ADGG0408      </CODIGO_ESPECIALIDAD>
            </ID_ESPECIALIDAD_PRINCIPAL>
            <DURACION>600</DURACION>
            <FECHA_INICIO>${startDate}</FECHA_INICIO>
            <FECHA_FIN>${endDate}</FECHA_FIN>
            <IND_ITINERARIO_COMPLETO>SI</IND_ITINERARIO_COMPLETO>
            <TIPO_FINANCIACION>PU</TIPO_FINANCIACION>
            <NUMERO_ASISTENTES>25</NUMERO_ASISTENTES>
            <DESCRIPCION_ACCION>
              <DENOMINACION_ACCION>Accion Formativa de Prueba</DENOMINACION_ACCION>
              <INFORMACION_GENERAL>Accion formativa de validacion</INFORMACION_GENERAL>
              <HORARIOS>24 horas 7 dias</HORARIOS>
              <REQUISITOS>Ninguno</REQUISITOS>
              <CONTACTO_ACCION>Telefono de contacto</CONTACTO_ACCION>
            </DESCRIPCION_ACCION>
            <ESPECIALIDADES_ACCION/>
            <PARTICIPANTES/>
          </entsal:ACCION_FORMATIVA>`
}

// Normalize stored XML to use entsal: namespace prefix for responses
function normalizeAccionXml(xml: string): string {
  // If it already has entsal: prefix, return as-is
  if (xml.includes('entsal:ACCION_FORMATIVA')) {
    return xml
  }
  // Add entsal: prefix to the root ACCION_FORMATIVA element
  return xml
    .replace(/<ACCION_FORMATIVA/, '<entsal:ACCION_FORMATIVA')
    .replace(/<\/ACCION_FORMATIVA>/, '</entsal:ACCION_FORMATIVA>')
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

function handleObtenerDatosCentro(center: any, cif: string, domain: string, proxyUrl: string): string {
  const nombre = (center?.name || 'Centro de Formacion').substring(0, 40)
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
          <EMAIL>${esc(center?.contact_email || 'info@centro.es')}</EMAIL>
        </entsal:DATOS_IDENTIFICATIVOS>
      </salida:RESPUESTA_DATOS_CENTRO>
    </impl:obtenerDatosCentroResponse>`)
}

// ========== crearCentro ==========

function handleCrearCentro(body: string, cif: string, center: any, domain: string, proxyUrl: string): string {
  const origenMatch = body.match(/<(?:\w+:)?ORIGEN_CENTRO[^>]*>([^<]+)<\/(?:\w+:)?ORIGEN_CENTRO>/i)
  const codigoMatch = body.match(/<(?:\w+:)?CODIGO_CENTRO[^>]*>([^<]+)<\/(?:\w+:)?CODIGO_CENTRO>/i)
  const nombreMatch = body.match(/<(?:\w+:)?NOMBRE_CENTRO[^>]*>([^<]+)<\/(?:\w+:)?NOMBRE_CENTRO>/i)
  const urlPlatMatch = body.match(/<(?:\w+:)?URL_PLATAFORMA[^>]*>([^<]+)<\/(?:\w+:)?URL_PLATAFORMA>/i)
  const urlSegMatch = body.match(/<(?:\w+:)?URL_SEGUIMIENTO[^>]*>([^<]+)<\/(?:\w+:)?URL_SEGUIMIENTO>/i)
  const telMatch = body.match(/<(?:\w+:)?TELEFONO[^>]*>([^<]+)<\/(?:\w+:)?TELEFONO>/i)
  const emailMatch = body.match(/<(?:\w+:)?EMAIL[^>]*>([^<]+)<\/(?:\w+:)?EMAIL>/i)

  const origenCentro = origenMatch?.[1]?.trim() || 'TF'
  const codigoCentro = codigoMatch?.[1]?.trim() || cif.padEnd(16, ' ')
  const nombre = nombreMatch?.[1]?.trim() || (center?.name || 'Centro de Formacion')
  const urlPlat = urlPlatMatch?.[1]?.trim() || domain
  const urlSeg = urlSegMatch?.[1]?.trim() || proxyUrl
  const telefono = telMatch?.[1]?.trim() || (center?.contact_phone || '925812889')
  const email = emailMatch?.[1]?.trim() || (center?.contact_email || 'info@centro.es')

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
        <ETIQUETA_ERROR>No se han proporcionado datos de la accion</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
  }

  console.log('crearAccion:', actionId.origen, actionId.codigo)

  // Extract the full ACCION_FORMATIVA XML from the request
  const accionXml = extractAccionFormativaXml(body)
  console.log('ACCION_FORMATIVA extracted:', accionXml ? 'YES (' + accionXml.length + ' chars)' : 'NO')

  // Check if action already exists
  const { data: existing } = await supabase
    .from('sepe_acciones')
    .select('id, accion_xml')
    .eq('center_cif', cif)
    .eq('origen_accion', actionId.origen)
    .eq('codigo_accion', actionId.codigo)
    .maybeSingle()

  if (existing) {
    console.log('Action already exists!')
    // Return error with CODIGO_RETORNO=1 (already exists)
    const storedXml = existing.accion_xml ? normalizeAccionXml(existing.accion_xml) : buildMinimalAccionFormativa(actionId.origen, actionId.codigo)
    return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>La accion formativa ya existe</ETIQUETA_ERROR>
        ${storedXml}
      </salida:RESPUESTA_OBT_ACCION>
    </impl:crearAccionResponse>`)
  }

  // Insert new action with full XML
  const { error } = await supabase
    .from('sepe_acciones')
    .insert({
      center_cif: cif,
      origen_accion: actionId.origen,
      codigo_accion: actionId.codigo,
      accion_xml: accionXml || null,
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

  // Success - return CODIGO_RETORNO=0 WITH the ACCION_FORMATIVA data
  const responseAccionXml = accionXml ? normalizeAccionXml(accionXml) : buildMinimalAccionFormativa(actionId.origen, actionId.codigo)

  return soapEnvelope(`    <impl:crearAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
        ${responseAccionXml}
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
        <ETIQUETA_ERROR>No se ha proporcionado identificador de accion</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`)
  }

  console.log('obtenerAccion:', actionId.origen, actionId.codigo)

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
        <ETIQUETA_ERROR>La accion formativa no existe</ETIQUETA_ERROR>
      </salida:RESPUESTA_OBT_ACCION>
    </impl:obtenerAccionResponse>`)
  }

  // Return stored ACCION_FORMATIVA XML or build minimal one
  const accionXml = existing.accion_xml ? normalizeAccionXml(existing.accion_xml) : buildMinimalAccionFormativa(actionId.origen, actionId.codigo)

  return soapEnvelope(`    <impl:obtenerAccionResponse>
      <salida:RESPUESTA_OBT_ACCION>
        <CODIGO_RETORNO>0</CODIGO_RETORNO>
        <ETIQUETA_ERROR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
        ${accionXml}
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
  console.log('obtenerListaAcciones: found', lista.length, 'actions for CIF', cif)

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
        <ETIQUETA_ERROR>No se ha proporcionado identificador de accion</ETIQUETA_ERROR>
      </salida:RESPUESTA_ELIMINAR_ACCION>
    </impl:eliminarAccionResponse>`)
  }

  console.log('eliminarAccion:', actionId.origen, actionId.codigo)

  // First check if it exists
  const { data: existing } = await supabase
    .from('sepe_acciones')
    .select('id')
    .eq('center_cif', cif)
    .eq('origen_accion', actionId.origen)
    .eq('codigo_accion', actionId.codigo)
    .maybeSingle()

  if (!existing) {
    return soapEnvelope(`    <impl:eliminarAccionResponse>
      <salida:RESPUESTA_ELIMINAR_ACCION>
        <CODIGO_RETORNO>1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>La accion formativa no existe</ETIQUETA_ERROR>
      </salida:RESPUESTA_ELIMINAR_ACCION>
    </impl:eliminarAccionResponse>`)
  }

  const { error } = await supabase
    .from('sepe_acciones')
    .delete()
    .eq('center_cif', cif)
    .eq('origen_accion', actionId.origen)
    .eq('codigo_accion', actionId.codigo)

  if (error) {
    console.error('Delete error:', error)
    return soapEnvelope(`    <impl:eliminarAccionResponse>
      <salida:RESPUESTA_ELIMINAR_ACCION>
        <CODIGO_RETORNO>-1</CODIGO_RETORNO>
        <ETIQUETA_ERROR>${esc(error.message)}</ETIQUETA_ERROR>
      </salida:RESPUESTA_ELIMINAR_ACCION>
    </impl:eliminarAccionResponse>`)
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

// ========== FULL OFFICIAL WSDL ==========

function generateFullWSDL(serviceUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions name="ProveedorCentroTFWS" targetNamespace="${NS_IMPL}" xmlns:entrada="http://entrada.bean.domain.common.proveedorcentro.meyss.spee.es" xmlns:entsal="${NS_ENTSAL}" xmlns:impl="${NS_IMPL}" xmlns:salida="${NS_SALIDA}" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:sp="http://docs.oasis-open.org/ws-sx/ws-securitypolicy/200702" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <wsdl:types>
    <xsd:schema targetNamespace="${NS_IMPL}" xmlns="${NS_IMPL}">
      <xsd:import namespace="${NS_SALIDA}"/>
      <xsd:import namespace="${NS_ENTSAL}"/>
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
    <xsd:schema targetNamespace="${NS_ENTSAL}" xmlns="${NS_ENTSAL}">
      <xsd:simpleType name="tipo_fecha">
        <xsd:restriction base="xsd:string">
          <xsd:pattern value="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\\d{4}"/>
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
      <xsd:element name="ACCION_FORMATIVA">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element maxOccurs="1" minOccurs="1" name="ID_ACCION" nillable="false">
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
            <xsd:element maxOccurs="1" minOccurs="1" name="SITUACION" nillable="false">
              <xsd:simpleType>
                <xsd:restriction base="xsd:string">
                  <xsd:length value="2"/>
                </xsd:restriction>
              </xsd:simpleType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="ID_ESPECIALIDAD_PRINCIPAL" nillable="false">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_ESPECIALIDAD" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:length value="2"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                  <xsd:element maxOccurs="1" minOccurs="1" name="AREA_PROFESIONAL" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:length value="4"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                  <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_ESPECIALIDAD" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:length value="14"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="DURACION" nillable="false" type="xsd:int"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="FECHA_INICIO" nillable="false" type="tipo_fecha"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="FECHA_FIN" nillable="false" type="tipo_fecha"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="IND_ITINERARIO_COMPLETO" nillable="false" type="tipo_si_no"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="TIPO_FINANCIACION" nillable="false">
              <xsd:simpleType>
                <xsd:restriction base="xsd:string">
                  <xsd:length value="2"/>
                </xsd:restriction>
              </xsd:simpleType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_ASISTENTES" nillable="false" type="xsd:int"/>
            <xsd:element maxOccurs="1" minOccurs="1" name="DESCRIPCION_ACCION" nillable="false">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element maxOccurs="1" minOccurs="1" name="DENOMINACION_ACCION" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:minLength value="1"/>
                        <xsd:maxLength value="250"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                  <xsd:element maxOccurs="1" minOccurs="1" name="INFORMACION_GENERAL" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:minLength value="0"/>
                        <xsd:maxLength value="650"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                  <xsd:element maxOccurs="1" minOccurs="1" name="HORARIOS" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:minLength value="0"/>
                        <xsd:maxLength value="650"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                  <xsd:element maxOccurs="1" minOccurs="1" name="REQUISITOS" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:minLength value="0"/>
                        <xsd:maxLength value="650"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                  <xsd:element maxOccurs="1" minOccurs="1" name="CONTACTO_ACCION" nillable="false">
                    <xsd:simpleType>
                      <xsd:restriction base="xsd:string">
                        <xsd:minLength value="0"/>
                        <xsd:maxLength value="650"/>
                      </xsd:restriction>
                    </xsd:simpleType>
                  </xsd:element>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="ESPECIALIDADES_ACCION">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element maxOccurs="unbounded" minOccurs="0" name="ESPECIALIDAD">
                    <xsd:complexType>
                      <xsd:sequence>
                        <xsd:element maxOccurs="1" minOccurs="1" name="ID_ESPECIALIDAD" nillable="false">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_ESPECIALIDAD" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="2"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="1" name="AREA_PROFESIONAL" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="4"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_ESPECIALIDAD" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="14"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="CENTRO_IMPARTICION" nillable="false">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_CENTRO" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="2"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_CENTRO" nillable="false" type="codigo_centro"/>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="FECHA_INICIO" nillable="false" type="tipo_fecha"/>
                        <xsd:element maxOccurs="1" minOccurs="1" name="FECHA_FIN" nillable="false" type="tipo_fecha"/>
                        <xsd:element maxOccurs="1" minOccurs="1" name="MODALIDAD_IMPARTICION" nillable="false">
                          <xsd:simpleType>
                            <xsd:restriction base="xsd:string">
                              <xsd:length value="2"/>
                            </xsd:restriction>
                          </xsd:simpleType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="DATOS_DURACION" nillable="false">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="1" minOccurs="1" name="HORAS_PRESENCIAL" nillable="false" type="xsd:int"/>
                              <xsd:element maxOccurs="1" minOccurs="1" name="HORAS_TELEFORMACION" nillable="false" type="xsd:int"/>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="CENTROS_SESIONES_PRESENCIALES">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="unbounded" minOccurs="0" name="CENTRO_PRESENCIAL" nillable="false">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_CENTRO" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:length value="2"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_CENTRO" nillable="false" type="codigo_centro"/>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="TUTORES_FORMADORES">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="unbounded" minOccurs="0" name="TUTOR_FORMADOR" nillable="false">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="ID_TUTOR" nillable="false">
                                      <xsd:complexType>
                                        <xsd:sequence>
                                          <xsd:element maxOccurs="1" minOccurs="1" name="TIPO_DOCUMENTO" nillable="false" type="tipo_documento"/>
                                          <xsd:element maxOccurs="1" minOccurs="1" name="NUM_DOCUMENTO" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:string">
                                                <xsd:length value="10"/>
                                              </xsd:restriction>
                                            </xsd:simpleType>
                                          </xsd:element>
                                          <xsd:element maxOccurs="1" minOccurs="1" name="LETRA_NIF" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:string">
                                                <xsd:length value="1"/>
                                              </xsd:restriction>
                                            </xsd:simpleType>
                                          </xsd:element>
                                        </xsd:sequence>
                                      </xsd:complexType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="ACREDITACION_TUTOR" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:maxLength value="200"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="EXPERIENCIA_PROFESIONAL" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="COMPETENCIA_DOCENTE" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:maxLength value="2"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="EXPERIENCIA_MODALIDAD_TELEFORMACION" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="FORMACION_MODALIDAD_TELEFORMACION" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:maxLength value="2"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="USO" nillable="false">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="1" minOccurs="0" name="HORARIO_MANANA">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUM_PARTICIPANTES" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_ACCESOS" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="DURACION_TOTAL" nillable="false" type="xsd:int"/>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="0" name="HORARIO_TARDE">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUM_PARTICIPANTES" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_ACCESOS" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="DURACION_TOTAL" nillable="false" type="xsd:int"/>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="0" name="HORARIO_NOCHE">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUM_PARTICIPANTES" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_ACCESOS" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="DURACION_TOTAL" nillable="false" type="xsd:int"/>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="0" name="SEGUIMIENTO_EVALUACION">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUM_PARTICIPANTES" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_ACTIVIDADES_APRENDIZAJE" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_INTENTOS" nillable="false" type="xsd:int"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUMERO_ACTIVIDADES_EVALUACION" nillable="false" type="xsd:int"/>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                      </xsd:sequence>
                    </xsd:complexType>
                  </xsd:element>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
            <xsd:element maxOccurs="1" minOccurs="1" name="PARTICIPANTES">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element maxOccurs="unbounded" minOccurs="0" name="PARTICIPANTE">
                    <xsd:complexType>
                      <xsd:sequence>
                        <xsd:element maxOccurs="1" minOccurs="1" name="ID_PARTICIPANTE" nillable="false">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="1" minOccurs="1" name="TIPO_DOCUMENTO" nillable="false" type="tipo_documento"/>
                              <xsd:element maxOccurs="1" minOccurs="1" name="NUM_DOCUMENTO" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="10"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="1" name="LETRA_NIF" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="1"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="INDICADOR_COMPETENCIAS_CLAVE" nillable="false">
                          <xsd:simpleType>
                            <xsd:restriction base="xsd:string">
                              <xsd:length value="2"/>
                            </xsd:restriction>
                          </xsd:simpleType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="CONTRATO_FORMACION">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="1" minOccurs="0" name="ID_CONTRATO_CFA" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:pattern value="^[A-Za-z]\\d{13}$"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="0" name="CIF_EMPRESA" nillable="false">
                                <xsd:simpleType>
                                  <xsd:restriction base="xsd:string">
                                    <xsd:length value="9"/>
                                  </xsd:restriction>
                                </xsd:simpleType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="0" name="ID_TUTOR_EMPRESA" nillable="false">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="TIPO_DOCUMENTO" nillable="false" type="tipo_documento"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUM_DOCUMENTO" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:length value="10"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="LETRA_NIF" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:length value="1"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                              <xsd:element maxOccurs="1" minOccurs="0" name="ID_TUTOR_FORMACION" nillable="false">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="TIPO_DOCUMENTO" nillable="false" type="tipo_documento"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="NUM_DOCUMENTO" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:length value="10"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="LETRA_NIF" nillable="false">
                                      <xsd:simpleType>
                                        <xsd:restriction base="xsd:string">
                                          <xsd:length value="1"/>
                                        </xsd:restriction>
                                      </xsd:simpleType>
                                    </xsd:element>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                        <xsd:element maxOccurs="1" minOccurs="1" name="ESPECIALIDADES_PARTICIPANTE">
                          <xsd:complexType>
                            <xsd:sequence>
                              <xsd:element maxOccurs="unbounded" minOccurs="1" name="ESPECIALIDAD" nillable="false">
                                <xsd:complexType>
                                  <xsd:sequence>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="ID_ESPECIALIDAD" nillable="false">
                                      <xsd:complexType>
                                        <xsd:sequence>
                                          <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_ESPECIALIDAD" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:string">
                                                <xsd:length value="2"/>
                                              </xsd:restriction>
                                            </xsd:simpleType>
                                          </xsd:element>
                                          <xsd:element maxOccurs="1" minOccurs="1" name="AREA_PROFESIONAL" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:string">
                                                <xsd:length value="4"/>
                                              </xsd:restriction>
                                            </xsd:simpleType>
                                          </xsd:element>
                                          <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_ESPECIALIDAD" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:string">
                                                <xsd:length value="14"/>
                                              </xsd:restriction>
                                            </xsd:simpleType>
                                          </xsd:element>
                                        </xsd:sequence>
                                      </xsd:complexType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="0" name="FECHA_ALTA" nillable="false" type="tipo_fecha"/>
                                    <xsd:element maxOccurs="1" minOccurs="0" name="FECHA_BAJA" nillable="false" type="tipo_fecha"/>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="TUTORIAS_PRESENCIALES">
                                      <xsd:complexType>
                                        <xsd:sequence>
                                          <xsd:element maxOccurs="unbounded" minOccurs="0" name="TUTORIA_PRESENCIAL" nillable="false">
                                            <xsd:complexType>
                                              <xsd:sequence>
                                                <xsd:element maxOccurs="1" minOccurs="1" name="CENTRO_PRESENCIAL_TUTORIA" nillable="false">
                                                  <xsd:complexType>
                                                    <xsd:sequence>
                                                      <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_CENTRO" nillable="false">
                                                        <xsd:simpleType>
                                                          <xsd:restriction base="xsd:string">
                                                            <xsd:length value="2"/>
                                                          </xsd:restriction>
                                                        </xsd:simpleType>
                                                      </xsd:element>
                                                      <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_CENTRO" nillable="false" type="codigo_centro"/>
                                                    </xsd:sequence>
                                                  </xsd:complexType>
                                                </xsd:element>
                                                <xsd:element maxOccurs="1" minOccurs="1" name="FECHA_INICIO" nillable="false" type="tipo_fecha"/>
                                                <xsd:element maxOccurs="1" minOccurs="1" name="FECHA_FIN" nillable="false" type="tipo_fecha"/>
                                              </xsd:sequence>
                                            </xsd:complexType>
                                          </xsd:element>
                                        </xsd:sequence>
                                      </xsd:complexType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="EVALUACION_FINAL">
                                      <xsd:complexType>
                                        <xsd:sequence>
                                          <xsd:element maxOccurs="1" minOccurs="0" name="CENTRO_PRESENCIAL_EVALUACION" nillable="false">
                                            <xsd:complexType>
                                              <xsd:sequence>
                                                <xsd:element maxOccurs="1" minOccurs="1" name="ORIGEN_CENTRO" nillable="false">
                                                  <xsd:simpleType>
                                                    <xsd:restriction base="xsd:string">
                                                      <xsd:length value="2"/>
                                                    </xsd:restriction>
                                                  </xsd:simpleType>
                                                </xsd:element>
                                                <xsd:element maxOccurs="1" minOccurs="1" name="CODIGO_CENTRO" nillable="false" type="codigo_centro"/>
                                              </xsd:sequence>
                                            </xsd:complexType>
                                          </xsd:element>
                                          <xsd:element maxOccurs="1" minOccurs="0" name="FECHA_INICIO" nillable="false" type="tipo_fecha"/>
                                          <xsd:element maxOccurs="1" minOccurs="0" name="FECHA_FIN" nillable="false" type="tipo_fecha"/>
                                        </xsd:sequence>
                                      </xsd:complexType>
                                    </xsd:element>
                                    <xsd:element maxOccurs="1" minOccurs="1" name="RESULTADOS">
                                      <xsd:complexType>
                                        <xsd:sequence>
                                          <xsd:element maxOccurs="1" minOccurs="0" name="RESULTADO_FINAL" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:string">
                                                <xsd:length value="1"/>
                                              </xsd:restriction>
                                            </xsd:simpleType>
                                          </xsd:element>
                                          <xsd:element maxOccurs="1" minOccurs="0" name="CALIFICACION_FINAL" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:int"/>
                                            </xsd:simpleType>
                                          </xsd:element>
                                          <xsd:element maxOccurs="1" minOccurs="0" name="PUNTUACION_FINAL" nillable="false">
                                            <xsd:simpleType>
                                              <xsd:restriction base="xsd:int"/>
                                            </xsd:simpleType>
                                          </xsd:element>
                                        </xsd:sequence>
                                      </xsd:complexType>
                                    </xsd:element>
                                  </xsd:sequence>
                                </xsd:complexType>
                              </xsd:element>
                            </xsd:sequence>
                          </xsd:complexType>
                        </xsd:element>
                      </xsd:sequence>
                    </xsd:complexType>
                  </xsd:element>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
    <xsd:schema targetNamespace="${NS_SALIDA}" xmlns="${NS_SALIDA}">
      <xsd:import namespace="${NS_ENTSAL}"/>
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
            <xsd:element maxOccurs="1" ref="entsal:ACCION_FORMATIVA"/>
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
      <soap:address location="${serviceUrl}"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>`
}
