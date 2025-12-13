import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, soapaction',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'text/xml; charset=utf-8'
}

interface TrackingData {
  alumno: {
    dni: string
    nombre: string
    apellidos: string
  }
  curso: {
    codigo: string
    nombre: string
    fechaInicio: string
    fechaFin: string
  }
  seguimiento: {
    tiempoConexion: number
    porcentajeAvance: number
    ultimaConexion: string
    evaluacionesRealizadas: number
    actividadesCompletadas: number
    mensajesTutor: number
    participacionForo: number
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const cifIndex = pathParts.indexOf('cif')
  const cif = cifIndex !== -1 ? pathParts[cifIndex + 1] : null

  console.log('SEPE Tracking request for CIF:', cif)
  console.log('Request method:', req.method)
  console.log('Request path:', url.pathname)
  console.log('Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries())))

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get settings for this center
  let settingsData: any = null
  let centerData: any = null

  if (cif) {
    // Get center
    const { data: center, error: centerError } = await supabase
      .from('training_centers')
      .select('id, name')
      .eq('cif', cif)
      .single()

    if (centerError || !center) {
      console.log('Center not found for CIF:', cif)
      return new Response(
        generateSOAPFault('SOAP-ENV:Client', 'Centro no encontrado', `No se encontró un centro con CIF: ${cif}`),
        { headers: corsHeaders, status: 404 }
      )
    }

    centerData = center

    // Get SiOnline settings
    const { data: settings } = await supabase
      .from('sionline_settings')
      .select('*')
      .eq('training_center_id', center.id)
      .single()

    if (!settings || !settings.enabled || settings.estado !== 'activo') {
      console.log('Service not active for center:', center.name)
      return new Response(
        generateSOAPFault('SOAP-ENV:Client', 'Servicio no activo', 'El servicio de seguimiento no está activo para este centro'),
        { headers: corsHeaders, status: 403 }
      )
    }

    settingsData = settings

    // Validate credentials if provided in Authorization header (HTTP Basic Auth)
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.slice(6)
      try {
        const credentials = atob(base64Credentials)
        // Format: username:password - we only use password as the credential
        const [, password] = credentials.split(':')
        
        if (settings.credenciales_seguimiento && password !== settings.credenciales_seguimiento) {
          console.log('Invalid credentials provided')
          return new Response(
            generateSOAPFault('SOAP-ENV:Client', 'Credenciales inválidas', 'Las credenciales proporcionadas no son válidas'),
            { headers: { ...corsHeaders, 'WWW-Authenticate': 'Basic realm="SEPE Tracking"' }, status: 401 }
          )
        }
        console.log('Credentials validated successfully')
      } catch (e) {
        console.log('Error decoding credentials:', e)
      }
    }

    console.log('Valid access for center:', center.name)
  }

  // Handle GET request - return WSDL or validation response
  if (req.method === 'GET') {
    // Check for wsdl query parameter
    if (url.searchParams.has('wsdl') || url.searchParams.has('WSDL')) {
      const wsdl = generateWSDL(cif || 'CENTRO')
      return new Response(wsdl, { 
        headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' } 
      })
    }

    // Return a simple validation response for SEPE's autovalidation
    const validationResponse = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://talentcloudsolution.com/sepe/seguimiento">
  <soap:Body>
    <tns:ValidacionResponse>
      <tns:resultado>
        <codigo>OK</codigo>
        <mensaje>Servicio de seguimiento operativo</mensaje>
        <centro>${escapeXml(centerData?.name || 'N/A')}</centro>
        <cif>${escapeXml(cif || 'N/A')}</cif>
        <fechaValidacion>${new Date().toISOString()}</fechaValidacion>
        <estado>ACTIVO</estado>
      </tns:resultado>
    </tns:ValidacionResponse>
  </soap:Body>
</soap:Envelope>`
    
    return new Response(validationResponse, { 
      headers: { ...corsHeaders, 'Content-Type': 'text/xml; charset=utf-8' } 
    })
  }

  // Handle POST request - SOAP operations
  if (req.method === 'POST') {
    try {
      const body = await req.text()
      console.log('SOAP Request body:', body.substring(0, 500))

      // Check for validation request
      if (body.includes('Validar') || body.includes('validar') || body.includes('Test') || body.includes('test')) {
        const validationResponse = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://talentcloudsolution.com/sepe/seguimiento">
  <soap:Body>
    <tns:ValidacionResponse>
      <tns:resultado>
        <codigo>OK</codigo>
        <mensaje>Servicio de seguimiento operativo</mensaje>
        <centro>${escapeXml(centerData?.name || 'N/A')}</centro>
        <cif>${escapeXml(cif || 'N/A')}</cif>
        <fechaValidacion>${new Date().toISOString()}</fechaValidacion>
        <estado>ACTIVO</estado>
      </tns:resultado>
    </tns:ValidacionResponse>
  </soap:Body>
</soap:Envelope>`
        return new Response(validationResponse, { headers: corsHeaders })
      }

      // Validate credentials from SOAP body if present
      if (settingsData?.credenciales_seguimiento) {
        const credMatch = body.match(/<credenciales[^>]*>([^<]+)<\/credenciales>|<clave[^>]*>([^<]+)<\/clave>|<password[^>]*>([^<]+)<\/password>/i)
        if (credMatch) {
          const providedCred = credMatch[1] || credMatch[2] || credMatch[3]
          if (providedCred !== settingsData.credenciales_seguimiento) {
            console.log('Invalid SOAP credentials')
            return new Response(
              generateSOAPFault('SOAP-ENV:Client', 'Credenciales inválidas', 'Las credenciales proporcionadas no son válidas'),
              { headers: corsHeaders, status: 401 }
            )
          }
          console.log('SOAP credentials validated')
        }
      }

      // Parse SOAP action from header or body
      const soapAction = req.headers.get('soapaction') || ''
      console.log('SOAP Action:', soapAction)

      // Get tracking data from database
      const trackingData = await getTrackingData(supabase, cif)
      
      // Generate appropriate SOAP response based on action
      let soapResponse: string
      
      if (soapAction.includes('ObtenerSeguimiento') || body.includes('ObtenerSeguimiento')) {
        soapResponse = generateTrackingResponse(trackingData)
      } else if (soapAction.includes('ObtenerAlumnos') || body.includes('ObtenerAlumnos')) {
        soapResponse = generateStudentsResponse(trackingData)
      } else if (soapAction.includes('ObtenerConexiones') || body.includes('ObtenerConexiones')) {
        soapResponse = generateConnectionsResponse(trackingData)
      } else {
        // Default: return full tracking data
        soapResponse = generateTrackingResponse(trackingData)
      }

      return new Response(soapResponse, { headers: corsHeaders })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Error processing SOAP request:', error)
      return new Response(
        generateSOAPFault('SOAP-ENV:Server', 'Error interno', errorMessage),
        { headers: corsHeaders, status: 500 }
      )
    }
  }

  return new Response(
    generateSOAPFault('SOAP-ENV:Client', 'Método no soportado', 'Use GET para WSDL o POST para operaciones SOAP'),
    { headers: corsHeaders, status: 405 }
  )
})

async function getTrackingData(supabase: any, cif: string | null): Promise<TrackingData[]> {
  if (!cif) return []

  // Get center
  const { data: center } = await supabase
    .from('training_centers')
    .select('id')
    .eq('cif', cif)
    .single()

  if (!center) return []

  // Get enrollments with student and course data
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      progress_percentage,
      last_accessed_at,
      enrolled_at,
      user_id,
      course_id,
      courses!inner (
        id,
        title,
        start_date,
        end_date,
        training_center_id
      )
    `)
    .eq('courses.training_center_id', center.id)

  if (!enrollments || enrollments.length === 0) return []

  const trackingData: TrackingData[] = []

  for (const enrollment of enrollments) {
    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, dni_nie')
      .eq('id', enrollment.user_id)
      .single()

    // Get content interactions for time spent
    const { data: interactions } = await supabase
      .from('content_interactions')
      .select('time_spent_seconds')
      .eq('enrollment_id', enrollment.id)

    const totalTimeSeconds = interactions?.reduce((acc: number, i: any) => acc + (i.time_spent_seconds || 0), 0) || 0

    // Get evaluation attempts
    const { data: evaluations } = await supabase
      .from('evaluation_attempts')
      .select('id')
      .eq('enrollment_id', enrollment.id)
      .eq('status', 'completed')

    // Get activity submissions
    const { data: activities } = await supabase
      .from('activity_submissions')
      .select('id')
      .eq('enrollment_id', enrollment.id)
      .in('status', ['submitted', 'graded'])

    // Get communications
    const { data: messages } = await supabase
      .from('communications')
      .select('id')
      .or(`sender_id.eq.${enrollment.user_id},receiver_id.eq.${enrollment.user_id}`)
      .eq('course_id', enrollment.course_id)

    // Parse name
    const fullName = profile?.full_name || 'Sin nombre'
    const nameParts = fullName.split(' ')
    const nombre = nameParts[0] || ''
    const apellidos = nameParts.slice(1).join(' ') || ''

    trackingData.push({
      alumno: {
        dni: profile?.dni_nie || 'N/A',
        nombre,
        apellidos
      },
      curso: {
        codigo: enrollment.courses?.id?.substring(0, 8).toUpperCase() || 'N/A',
        nombre: enrollment.courses?.title || 'Sin título',
        fechaInicio: enrollment.courses?.start_date || enrollment.enrolled_at,
        fechaFin: enrollment.courses?.end_date || ''
      },
      seguimiento: {
        tiempoConexion: Math.round(totalTimeSeconds / 60), // Convert to minutes
        porcentajeAvance: enrollment.progress_percentage || 0,
        ultimaConexion: enrollment.last_accessed_at || enrollment.enrolled_at,
        evaluacionesRealizadas: evaluations?.length || 0,
        actividadesCompletadas: activities?.length || 0,
        mensajesTutor: messages?.length || 0,
        participacionForo: 0 // Would need forum posts table
      }
    })
  }

  return trackingData
}

function generateWSDL(cif: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://talentcloudsolution.com/sepe/seguimiento"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="SeguimientoSEPE"
             targetNamespace="http://talentcloudsolution.com/sepe/seguimiento">
  
  <types>
    <xsd:schema targetNamespace="http://talentcloudsolution.com/sepe/seguimiento">
      <xsd:element name="ValidarRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="cif" type="xsd:string"/>
            <xsd:element name="credenciales" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ValidarResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="codigo" type="xsd:string"/>
            <xsd:element name="mensaje" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ObtenerSeguimientoRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="cif" type="xsd:string"/>
            <xsd:element name="credenciales" type="xsd:string" minOccurs="0"/>
            <xsd:element name="dniAlumno" type="xsd:string" minOccurs="0"/>
            <xsd:element name="codigoCurso" type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ObtenerSeguimientoResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="resultado" type="tns:ResultadoSeguimiento"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:complexType name="ResultadoSeguimiento">
        <xsd:sequence>
          <xsd:element name="registros" type="tns:RegistroSeguimiento" maxOccurs="unbounded"/>
        </xsd:sequence>
      </xsd:complexType>
      <xsd:complexType name="RegistroSeguimiento">
        <xsd:sequence>
          <xsd:element name="alumno" type="tns:DatosAlumno"/>
          <xsd:element name="curso" type="tns:DatosCurso"/>
          <xsd:element name="seguimiento" type="tns:DatosSeguimiento"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <message name="ValidarInput">
    <part name="parameters" element="tns:ValidarRequest"/>
  </message>
  <message name="ValidarOutput">
    <part name="parameters" element="tns:ValidarResponse"/>
  </message>
  <message name="ObtenerSeguimientoInput">
    <part name="parameters" element="tns:ObtenerSeguimientoRequest"/>
  </message>
  <message name="ObtenerSeguimientoOutput">
    <part name="parameters" element="tns:ObtenerSeguimientoResponse"/>
  </message>

  <portType name="SeguimientoPortType">
    <operation name="Validar">
      <input message="tns:ValidarInput"/>
      <output message="tns:ValidarOutput"/>
    </operation>
    <operation name="ObtenerSeguimiento">
      <input message="tns:ObtenerSeguimientoInput"/>
      <output message="tns:ObtenerSeguimientoOutput"/>
    </operation>
  </portType>

  <binding name="SeguimientoBinding" type="tns:SeguimientoPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="Validar">
      <soap:operation soapAction="http://talentcloudsolution.com/sepe/Validar"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="ObtenerSeguimiento">
      <soap:operation soapAction="http://talentcloudsolution.com/sepe/ObtenerSeguimiento"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="SeguimientoSEPEService">
    <port name="SeguimientoPort" binding="tns:SeguimientoBinding">
      <soap:address location="https://fkxbgifvwivlvpwxdzdb.supabase.co/functions/v1/sepe-tracking/centro/cif/${cif}"/>
    </port>
  </service>
</definitions>`
}

function generateTrackingResponse(data: TrackingData[]): string {
  const registros = data.map(d => `
      <registro>
        <alumno>
          <dni>${escapeXml(d.alumno.dni)}</dni>
          <nombre>${escapeXml(d.alumno.nombre)}</nombre>
          <apellidos>${escapeXml(d.alumno.apellidos)}</apellidos>
        </alumno>
        <curso>
          <codigo>${escapeXml(d.curso.codigo)}</codigo>
          <nombre>${escapeXml(d.curso.nombre)}</nombre>
          <fechaInicio>${d.curso.fechaInicio || ''}</fechaInicio>
          <fechaFin>${d.curso.fechaFin || ''}</fechaFin>
        </curso>
        <seguimiento>
          <tiempoConexionMinutos>${d.seguimiento.tiempoConexion}</tiempoConexionMinutos>
          <porcentajeAvance>${d.seguimiento.porcentajeAvance}</porcentajeAvance>
          <ultimaConexion>${d.seguimiento.ultimaConexion || ''}</ultimaConexion>
          <evaluacionesRealizadas>${d.seguimiento.evaluacionesRealizadas}</evaluacionesRealizadas>
          <actividadesCompletadas>${d.seguimiento.actividadesCompletadas}</actividadesCompletadas>
          <mensajesTutor>${d.seguimiento.mensajesTutor}</mensajesTutor>
          <participacionForo>${d.seguimiento.participacionForo}</participacionForo>
        </seguimiento>
      </registro>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://talentcloudsolution.com/sepe/seguimiento">
  <soap:Body>
    <tns:ObtenerSeguimientoResponse>
      <tns:resultado>
        <totalRegistros>${data.length}</totalRegistros>
        <fechaConsulta>${new Date().toISOString()}</fechaConsulta>
        <registros>${registros}
        </registros>
      </tns:resultado>
    </tns:ObtenerSeguimientoResponse>
  </soap:Body>
</soap:Envelope>`
}

function generateStudentsResponse(data: TrackingData[]): string {
  const alumnos = data.map(d => `
      <alumno>
        <dni>${escapeXml(d.alumno.dni)}</dni>
        <nombre>${escapeXml(d.alumno.nombre)}</nombre>
        <apellidos>${escapeXml(d.alumno.apellidos)}</apellidos>
        <cursosMatriculados>1</cursosMatriculados>
      </alumno>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://talentcloudsolution.com/sepe/seguimiento">
  <soap:Body>
    <tns:ObtenerAlumnosResponse>
      <tns:resultado>
        <totalAlumnos>${data.length}</totalAlumnos>
        <alumnos>${alumnos}
        </alumnos>
      </tns:resultado>
    </tns:ObtenerAlumnosResponse>
  </soap:Body>
</soap:Envelope>`
}

function generateConnectionsResponse(data: TrackingData[]): string {
  const conexiones = data.map(d => `
      <conexion>
        <dniAlumno>${escapeXml(d.alumno.dni)}</dniAlumno>
        <codigoCurso>${escapeXml(d.curso.codigo)}</codigoCurso>
        <tiempoMinutos>${d.seguimiento.tiempoConexion}</tiempoMinutos>
        <ultimaConexion>${d.seguimiento.ultimaConexion || ''}</ultimaConexion>
      </conexion>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://talentcloudsolution.com/sepe/seguimiento">
  <soap:Body>
    <tns:ObtenerConexionesResponse>
      <tns:resultado>
        <totalConexiones>${data.length}</totalConexiones>
        <conexiones>${conexiones}
        </conexiones>
      </tns:resultado>
    </tns:ObtenerConexionesResponse>
  </soap:Body>
</soap:Envelope>`
}

function generateSOAPFault(code: string, reason: string, detail: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>${code}</faultcode>
      <faultstring>${escapeXml(reason)}</faultstring>
      <detail>${escapeXml(detail)}</detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
