import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, ClipboardCheck, Calendar, BarChart3, ArrowRight, BookMarked, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    pendingActivities: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      
      try {
        // Get courses where user is tutor
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("id")
          .eq("tutor_id", user.id)
          .eq("is_active", true);

        if (coursesError) throw coursesError;

        const courseIds = courses?.map(c => c.id) || [];

        // Get enrolled students count for these courses
        let studentsCount = 0;
        if (courseIds.length > 0) {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .in("course_id", courseIds);
          studentsCount = count || 0;
        }

        // Get pending activity submissions
        let pendingCount = 0;
        if (courseIds.length > 0) {
          const { count } = await supabase
            .from("activity_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "submitted");
          pendingCount = count || 0;
        }

        setStats({
          courses: courses?.length || 0,
          students: studentsCount,
          pendingActivities: pendingCount,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Mis Cursos",
      value: stats.courses.toString(),
      icon: BookOpen,
      color: "from-primary to-primary-glow"
    },
    {
      title: "Alumnos Activos",
      value: stats.students.toString(),
      icon: Users,
      color: "from-secondary to-secondary"
    },
    {
      title: "Actividades Pendientes",
      value: stats.pendingActivities.toString(),
      icon: ClipboardCheck,
      color: "from-accent to-accent"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Panel del Tutor</h1>
        <p className="text-muted-foreground">Gestiona tus cursos asignados y alumnos</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
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

      {/* Quick Access Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h2 className="text-xl font-semibold mb-6">Acceso Rápido</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 px-4 flex flex-col items-start gap-3 hover:bg-primary/10 hover:border-primary transition-all group"
            onClick={() => navigate("/dashboard/teacher/courses")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm mb-1">Mis Cursos</p>
              <p className="text-xs text-muted-foreground">Ver cursos asignados</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-4 flex flex-col items-start gap-3 hover:bg-secondary/10 hover:border-secondary transition-all group"
            onClick={() => navigate("/dashboard/teacher/students")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm mb-1">Alumnos</p>
              <p className="text-xs text-muted-foreground">Contactar y seguimiento</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-4 flex flex-col items-start gap-3 hover:bg-accent/10 hover:border-accent transition-all group"
            onClick={() => navigate("/dashboard/teacher/grade-activities")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm mb-1">Evaluar</p>
              <p className="text-xs text-muted-foreground">Actividades pendientes</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-4 flex flex-col items-start gap-3 hover:bg-primary/10 hover:border-primary transition-all group"
            onClick={() => navigate("/dashboard/teacher/calendar")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm mb-1">Cronograma</p>
              <p className="text-xs text-muted-foreground">Calendario del curso</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-4 flex flex-col items-start gap-3 hover:bg-secondary/10 hover:border-secondary transition-all group"
            onClick={() => navigate("/campus-guide?role=teacher")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                <BookMarked className="w-5 h-5 text-primary-foreground" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm mb-1">Guía del Tutor</p>
              <p className="text-xs text-muted-foreground">Manual de uso</p>
            </div>
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informes Disponibles</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/dashboard/teacher/reports")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Progreso de Alumnos
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/dashboard/teacher/reports")}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Informe de Evaluaciones
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/dashboard/teacher/reports")}
            >
              <Users className="w-4 h-4 mr-2" />
              Actividad de Estudiantes
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recursos del Tutor</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/campus-guide?role=teacher")}
            >
              <BookMarked className="w-4 h-4 mr-2" />
              Guía del Tutor SEPE
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/dashboard/teacher/grade-activities")}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              SafeAssign - Verificar Originalidad
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;