import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BookMarked, Award, Clock, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Enrollment {
  id: string;
  progress_percentage: number;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
    duration_hours: number | null;
  };
  current_module?: {
    title: string;
  };
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user?.id) return;

      try {
        // Fetch student's enrollments with course data
        const { data: enrollmentsData, error } = await supabase
          .from('enrollments')
          .select(`
            id,
            progress_percentage,
            completed_at,
            course:courses (
              id,
              title,
              duration_hours
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading enrollments:', error);
          return;
        }

        // Transform data and filter out null courses
        const validEnrollments = (enrollmentsData || [])
          .filter(e => e.course !== null)
          .map(e => ({
            ...e,
            course: e.course as { id: string; title: string; duration_hours: number | null }
          }));

        setEnrollments(validEnrollments);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user?.id]);

  // Calculate real stats
  const activeCourses = enrollments.filter(e => !e.completed_at).length;
  const completedCourses = enrollments.filter(e => e.completed_at).length;
  const totalHours = enrollments.reduce((sum, e) => sum + (e.course?.duration_hours || 0), 0);
  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
    : 0;

  const stats = [
    {
      title: "Cursos Activos",
      value: activeCourses.toString(),
      icon: BookMarked,
      color: "from-primary to-primary-glow"
    },
    {
      title: "Certificados",
      value: completedCourses.toString(),
      icon: Award,
      color: "from-secondary to-secondary"
    },
    {
      title: "Horas Cursadas",
      value: totalHours.toString(),
      icon: Clock,
      color: "from-accent to-accent"
    },
    {
      title: "Progreso Promedio",
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: "from-primary to-secondary"
    }
  ];

  const inProgressCourses = enrollments.filter(e => !e.completed_at);
  const completedEnrollments = enrollments.filter(e => e.completed_at);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mi Panel de Estudiante</h1>
          <p className="text-muted-foreground">Continúa tu formación y alcanza tus objetivos</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="w-12 h-12 rounded-lg mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mi Panel de Estudiante</h1>
        <p className="text-muted-foreground">Continúa tu formación y alcanza tus objetivos</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Continúa Donde lo Dejaste</h3>
        {inProgressCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No tienes cursos activos en este momento</p>
            <Button onClick={() => navigate('/dashboard/student/courses')}>
              Ver cursos disponibles
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {inProgressCourses.map((enrollment) => (
              <Card key={enrollment.id} className="p-6 border-border/50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{enrollment.course.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.course.duration_hours ? `${enrollment.course.duration_hours} horas` : 'Curso en progreso'}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/dashboard/course/${enrollment.course.id}`)}
                  >
                    Continuar
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                  </div>
                  <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Próximas Evaluaciones</h3>
          {enrollments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No tienes evaluaciones pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Las evaluaciones aparecerán aquí cuando estés matriculado en cursos con exámenes programados.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mis Certificados</h3>
          {completedEnrollments.length === 0 ? (
            <div className="text-center py-6">
              <Award className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Completa tus cursos para obtener certificados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{enrollment.course.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completado {new Date(enrollment.completed_at!).toLocaleDateString('es-ES', { month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Award className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
