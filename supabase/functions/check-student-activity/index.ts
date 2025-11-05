import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentActivity {
  student_id: string;
  student_name: string;
  course_id: string;
  course_title: string;
  last_access: string;
  days_inactive: number;
  progress: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Checking student activity...');

    // Get all teachers with their alert settings
    const { data: teachers, error: teachersError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'teacher');

    if (teachersError) throw teachersError;

    for (const teacher of teachers) {
      // Get teacher's alert settings or use defaults
      const { data: settings } = await supabaseClient
        .from('alert_settings')
        .select('*')
        .eq('user_id', teacher.user_id)
        .maybeSingle();

      const inactiveDaysThreshold = settings?.inactive_days_threshold || 7;
      const lowProgressThreshold = settings?.low_progress_threshold || 30;

      // Get all enrollments with student info
      const { data: enrollments, error: enrollmentsError } = await supabaseClient
        .from('enrollments')
        .select(`
          id,
          user_id,
          course_id,
          last_accessed_at,
          enrolled_at,
          progress_percentage,
          courses (title),
          profiles!enrollments_user_id_fkey (full_name)
        `);

      if (enrollmentsError) throw enrollmentsError;

      const now = new Date();
      const inactiveStudents: StudentActivity[] = [];
      const lowPerformanceStudents: StudentActivity[] = [];

      for (const enrollment of enrollments) {
        const lastAccess = enrollment.last_accessed_at 
          ? new Date(enrollment.last_accessed_at)
          : new Date(enrollment.enrolled_at);
        
        const daysDiff = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24));

        // Check for inactive students
        if (daysDiff >= inactiveDaysThreshold) {
          inactiveStudents.push({
            student_id: enrollment.user_id,
            student_name: (enrollment.profiles as any)?.full_name || 'Estudiante sin nombre',
            course_id: enrollment.course_id,
            course_title: (enrollment.courses as any)?.title || 'Curso sin título',
            last_access: lastAccess.toISOString(),
            days_inactive: daysDiff,
            progress: enrollment.progress_percentage || 0,
          });
        }

        // Check for low performance (enrolled for more than 7 days but low progress)
        const enrolledDays = Math.floor((now.getTime() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24));
        if (enrolledDays > 7 && (enrollment.progress_percentage || 0) < lowProgressThreshold) {
          lowPerformanceStudents.push({
            student_id: enrollment.user_id,
            student_name: (enrollment.profiles as any)?.full_name || 'Estudiante sin nombre',
            course_id: enrollment.course_id,
            course_title: (enrollment.courses as any)?.title || 'Curso sin título',
            last_access: lastAccess.toISOString(),
            days_inactive: daysDiff,
            progress: enrollment.progress_percentage || 0,
          });
        }
      }

      // Create notifications for inactive students
      for (const student of inactiveStudents) {
        // Check if notification already exists for this student/course combo in last 24h
        const { data: existingNotif } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', teacher.user_id)
          .eq('related_user_id', student.student_id)
          .eq('related_course_id', student.course_id)
          .eq('type', 'student_inactive')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingNotif) {
          await supabaseClient.from('notifications').insert({
            user_id: teacher.user_id,
            type: 'student_inactive',
            title: 'Estudiante Inactivo',
            message: `${student.student_name} no ha accedido al curso "${student.course_title}" en ${student.days_inactive} días`,
            priority: student.days_inactive > 14 ? 'high' : 'normal',
            related_user_id: student.student_id,
            related_course_id: student.course_id,
            metadata: {
              days_inactive: student.days_inactive,
              last_access: student.last_access,
              progress: student.progress,
            },
          });
        }
      }

      // Create notifications for low performance students
      for (const student of lowPerformanceStudents) {
        const { data: existingNotif } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', teacher.user_id)
          .eq('related_user_id', student.student_id)
          .eq('related_course_id', student.course_id)
          .eq('type', 'low_performance')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingNotif) {
          await supabaseClient.from('notifications').insert({
            user_id: teacher.user_id,
            type: 'low_performance',
            title: 'Bajo Rendimiento',
            message: `${student.student_name} tiene un progreso del ${student.progress}% en "${student.course_title}"`,
            priority: student.progress < 10 ? 'high' : 'normal',
            related_user_id: student.student_id,
            related_course_id: student.course_id,
            metadata: {
              progress: student.progress,
              days_inactive: student.days_inactive,
            },
          });
        }
      }

      console.log(`Teacher ${teacher.user_id}: ${inactiveStudents.length} inactive, ${lowPerformanceStudents.length} low performance`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Student activity check completed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error checking student activity:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
