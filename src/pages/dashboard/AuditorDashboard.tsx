import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, BookOpen, Users, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CourseStats {
  id: string;
  title: string;
  total_students: number;
  active_students: number;
  avg_progress: number;
  total_hours: number;
  completion_rate: number;
}

const AuditorDashboard = () => {
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgCompletion: 0,
    totalHours: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      setLoading(true);

      // Get all active courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, is_active")
        .eq("is_active", true);

      if (coursesError) throw coursesError;

      // Get enrollment and progress data for each course
      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          // Get enrollments
          const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select("id, user_id, progress_percentage, completed_at")
            .eq("course_id", course.id);

          if (enrollError) throw enrollError;

          // Get session time data
          const { data: sessions, error: sessionsError } = await supabase
            .from("user_sessions")
            .select("duration_seconds")
            .eq("course_id", course.id)
            .not("duration_seconds", "is", null);

          const totalHours = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
          const totalStudents = enrollments?.length || 0;
          const activeStudents = enrollments?.filter((e) => !e.completed_at).length || 0;
          const completedStudents = enrollments?.filter((e) => e.completed_at).length || 0;
          const avgProgress =
            totalStudents > 0
              ? enrollments!.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / totalStudents
              : 0;

          return {
            id: course.id,
            title: course.title,
            total_students: totalStudents,
            active_students: activeStudents,
            avg_progress: Math.round(avgProgress),
            total_hours: Math.round(totalHours / 3600), // Convert to hours
            completion_rate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
          };
        })
      );

      setCourses(coursesWithStats);

      // Calculate overall stats
      const totalStudents = coursesWithStats.reduce((acc, c) => acc + c.total_students, 0);
      const totalHours = coursesWithStats.reduce((acc, c) => acc + c.total_hours, 0);
      const avgCompletion =
        coursesWithStats.length > 0
          ? coursesWithStats.reduce((acc, c) => acc + c.completion_rate, 0) / coursesWithStats.length
          : 0;

      setStats({
        totalCourses: coursesWithStats.length,
        totalStudents,
        avgCompletion: Math.round(avgCompletion),
        totalHours,
      });
    } catch (error: any) {
      console.error("Error loading audit data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de auditoría",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" />
            Panel de Auditoría de Calidad
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de control y seguimiento para SEPE / Junta de Comunidades
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cursos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">En seguimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tasa de Finalización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
            <p className="text-xs text-muted-foreground mt-1">Promedio global</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Tiempo invertido</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos en Auditoría</CardTitle>
          <CardDescription>
            Haz clic en un curso para ver el análisis detallado de calidad y trazabilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay cursos disponibles para auditoría
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.total_students} alumnos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.total_hours}h invertidas
                      </span>
                      <span>Progreso medio: {course.avg_progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        course.completion_rate >= 75
                          ? "default"
                          : course.completion_rate >= 50
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {course.completion_rate}% finalización
                    </Badge>
                    <Badge variant="outline">{course.active_students} activos</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Información de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            ✓ Acceso completo a trazabilidad de actividades de alumnos
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Seguimiento de tiempos invertidos en cada módulo
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Registro de comunicaciones docente-alumno
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Métricas de calidad y cumplimiento normativo
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Retroalimentación y evaluaciones detalladas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditorDashboard;
