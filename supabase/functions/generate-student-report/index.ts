import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  studentId: string;
  courseId: string;
  reportType: 'complete' | 'progress' | 'attendance';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('No autorizado');
    }

    // Verify user is teacher or admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['admin', 'teacher'].includes(userRole.role)) {
      throw new Error('No tiene permisos para generar informes');
    }

    const { studentId, courseId, reportType }: ReportRequest = await req.json();

    // Fetch student data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    // Fetch course data
    const { data: course } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    // Fetch enrollment
    const { data: enrollment } = await supabaseClient
      .from('enrollments')
      .select('*')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .single();

    // Fetch connection time (sessions)
    const { data: sessions } = await supabaseClient
      .from('user_sessions')
      .select('*')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .order('started_at', { ascending: false });

    const totalConnectionMinutes = sessions?.reduce((acc, session) => {
      return acc + (session.duration_seconds || 0);
    }, 0) / 60;

    // Fetch module progress
    const { data: moduleProgress } = await supabaseClient
      .from('module_progress')
      .select('*, modules(title)')
      .eq('enrollment_id', enrollment?.id);

    // Fetch evaluations
    const { data: evaluationAttempts } = await supabaseClient
      .from('evaluation_attempts')
      .select('*, evaluations(title, passing_score)')
      .eq('user_id', studentId)
      .eq('enrollment_id', enrollment?.id);

    // Fetch activity submissions
    const { data: submissions } = await supabaseClient
      .from('activity_submissions')
      .select('*, development_activities(title, max_score)')
      .eq('user_id', studentId)
      .eq('enrollment_id', enrollment?.id);

    // Fetch teacher contacts (seguimiento)
    const { data: contacts } = await supabaseClient
      .from('teacher_student_contacts')
      .select('*, profiles!teacher_id(full_name)')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    // Generate HTML for PDF
    const html = generateReportHTML({
      profile,
      course,
      enrollment,
      totalConnectionMinutes,
      moduleProgress,
      evaluationAttempts,
      submissions,
      contacts,
      sessions,
      reportType
    });

    console.log('Report generated successfully for student:', studentId);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateReportHTML(data: any): string {
  const {
    profile,
    course,
    enrollment,
    totalConnectionMinutes,
    moduleProgress,
    evaluationAttempts,
    submissions,
    contacts,
    sessions,
    reportType
  } = data;

  const totalHours = Math.floor(totalConnectionMinutes / 60);
  const remainingMinutes = Math.floor(totalConnectionMinutes % 60);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Seguimiento - ${profile?.full_name || 'Alumno'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      color: #333;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .logo-section {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1e40af;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      color: #64748b;
      font-size: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-card {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .info-label {
      font-weight: bold;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      color: #1e293b;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    tr:hover {
      background: #f8fafc;
    }
    .progress-bar {
      background: #e2e8f0;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      background: linear-gradient(90deg, #2563eb, #3b82f6);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .page-break { page-break-after: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Informe de Seguimiento Académico</h1>
    <p class="subtitle">Campus Virtual - Plataforma SEPE</p>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-label">Alumno</div>
      <div class="info-value">${profile?.full_name || 'Sin nombre'}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Curso</div>
      <div class="info-value">${course?.title || 'Sin título'}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Fecha de inscripción</div>
      <div class="info-value">${new Date(enrollment?.enrolled_at).toLocaleDateString('es-ES')}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Fecha del informe</div>
      <div class="info-value">${new Date().toLocaleDateString('es-ES')}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${enrollment?.progress_percentage || 0}%</div>
      <div class="stat-label">Progreso</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${totalHours}h ${remainingMinutes}m</div>
      <div class="stat-label">Tiempo total</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${sessions?.length || 0}</div>
      <div class="stat-label">Sesiones</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${contacts?.length || 0}</div>
      <div class="stat-label">Seguimientos</div>
    </div>
  </div>

  ${reportType !== 'attendance' ? `
  <div class="section">
    <h2 class="section-title">Progreso por Módulos</h2>
    <table>
      <thead>
        <tr>
          <th>Módulo</th>
          <th style="width: 200px;">Progreso</th>
          <th style="width: 150px;">Tiempo dedicado</th>
          <th style="width: 100px;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${moduleProgress?.map((mp: any) => `
          <tr>
            <td>${mp.modules?.title || 'Sin título'}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${mp.completed ? 100 : 50}%">
                  ${mp.completed ? '100%' : '50%'}
                </div>
              </div>
            </td>
            <td>${mp.time_spent_minutes || 0} minutos</td>
            <td>
              <span class="badge ${mp.completed ? 'badge-success' : 'badge-warning'}">
                ${mp.completed ? 'Completado' : 'En progreso'}
              </span>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="text-align: center;">No hay datos de progreso</td></tr>'}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${reportType === 'complete' ? `
  <div class="section page-break">
    <h2 class="section-title">Evaluaciones</h2>
    <table>
      <thead>
        <tr>
          <th>Evaluación</th>
          <th style="width: 120px;">Intento</th>
          <th style="width: 100px;">Nota</th>
          <th style="width: 100px;">Mín. Aprobado</th>
          <th style="width: 120px;">Estado</th>
          <th style="width: 150px;">Fecha</th>
        </tr>
      </thead>
      <tbody>
        ${evaluationAttempts?.map((attempt: any) => {
          const passed = (attempt.score || 0) >= (attempt.evaluations?.passing_score || 50);
          return `
            <tr>
              <td>${attempt.evaluations?.title || 'Sin título'}</td>
              <td>${attempt.attempt_number}</td>
              <td><strong>${attempt.score?.toFixed(2) || '0.00'}</strong></td>
              <td>${attempt.evaluations?.passing_score || 50}</td>
              <td>
                <span class="badge ${passed ? 'badge-success' : 'badge-danger'}">
                  ${passed ? 'Aprobado' : 'Suspenso'}
                </span>
              </td>
              <td>${new Date(attempt.completed_at).toLocaleDateString('es-ES')}</td>
            </tr>
          `;
        }).join('') || '<tr><td colspan="6" style="text-align: center;">No hay evaluaciones</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Actividades de Desarrollo</h2>
    <table>
      <thead>
        <tr>
          <th>Actividad</th>
          <th style="width: 100px;">Calificación</th>
          <th style="width: 100px;">Máximo</th>
          <th style="width: 120px;">Estado</th>
          <th style="width: 150px;">Fecha entrega</th>
        </tr>
      </thead>
      <tbody>
        ${submissions?.map((sub: any) => `
          <tr>
            <td>${sub.development_activities?.title || 'Sin título'}</td>
            <td><strong>${sub.score?.toFixed(2) || '-'}</strong></td>
            <td>${sub.development_activities?.max_score || 100}</td>
            <td>
              <span class="badge ${sub.status === 'graded' ? 'badge-success' : 'badge-info'}">
                ${sub.status === 'graded' ? 'Calificado' : sub.status === 'submitted' ? 'Entregado' : 'Pendiente'}
              </span>
            </td>
            <td>${new Date(sub.submitted_at).toLocaleDateString('es-ES')}</td>
          </tr>
        `).join('') || '<tr><td colspan="5" style="text-align: center;">No hay actividades</td></tr>'}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="section ${reportType === 'attendance' ? '' : 'page-break'}">
    <h2 class="section-title">Historial de Conexiones</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha y hora</th>
          <th style="width: 120px;">Duración</th>
          <th style="width: 150px;">Tipo de sesión</th>
        </tr>
      </thead>
      <tbody>
        ${sessions?.slice(0, 20).map((session: any) => `
          <tr>
            <td>${new Date(session.started_at).toLocaleString('es-ES')}</td>
            <td>${Math.floor((session.duration_seconds || 0) / 60)} minutos</td>
            <td>
              <span class="badge badge-info">
                ${session.session_type === 'course_view' ? 'Visualización' : 'Módulo'}
              </span>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="3" style="text-align: center;">No hay sesiones registradas</td></tr>'}
      </tbody>
    </table>
  </div>

  ${reportType === 'complete' ? `
  <div class="section page-break">
    <h2 class="section-title">Seguimiento del Profesor</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Profesor</th>
          <th style="width: 120px;">Tipo</th>
          <th>Asunto</th>
          <th style="width: 100px;">Duración</th>
        </tr>
      </thead>
      <tbody>
        ${contacts?.map((contact: any) => `
          <tr>
            <td>${new Date(contact.created_at).toLocaleDateString('es-ES')}</td>
            <td>${contact.profiles?.full_name || 'Profesor'}</td>
            <td>
              <span class="badge badge-info">${contact.contact_type}</span>
            </td>
            <td>${contact.subject}</td>
            <td>${contact.duration_minutes ? `${contact.duration_minutes} min` : '-'}</td>
          </tr>
        `).join('') || '<tr><td colspan="5" style="text-align: center;">No hay registros de seguimiento</td></tr>'}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>Campus Virtual - Plataforma de Formación SEPE</strong></p>
    <p>Documento generado el ${new Date().toLocaleString('es-ES')}</p>
    <p>Este informe contiene información confidencial del alumno</p>
  </div>

  <script>
    // Auto-print on load
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
}
