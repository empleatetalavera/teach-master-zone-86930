import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  thumbnail_url: string;
  enrollment: {
    progress_percentage: number;
    enrolled_at: string;
    last_accessed_at: string;
    completed_at: string | null;
  };
  total_modules: number;
  completed_modules: number;
  total_time_spent: number;
}

export default function StudentCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [stats, setStats] = useState({
    activeCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    avgProgress: 0,
  });

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      // Get enrollments with course data
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          course:courses (*)
        `)
        .eq("user_id", user!.id);

      if (error) throw error;

      // Filter out enrollments where course is null (cross-center / RLS-blocked)
      const validEnrollments = (enrollments || []).filter((e: any) => e.course);

      // Process each enrollment to get progress details
      const coursesWithProgress = await Promise.all(
        validEnrollments.map(async (enrollment: any) => {
          const course = enrollment.course;

          // Get total modules
          const { count: totalModules } = await supabase
            .from("modules")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id);

          // Get completed modules
          const { count: completedModules } = await supabase
            .from("module_progress")
            .select("*", { count: "exact", head: true })
            .eq("enrollment_id", enrollment.id)
            .eq("completed", true);

          // Get total time spent
          const { data: interactions } = await supabase
            .from("content_interactions")
            .select("time_spent_seconds")
            .eq("enrollment_id", enrollment.id);

          const totalTimeSpent = interactions?.reduce(
            (sum, i) => sum + (i.time_spent_seconds || 0),
            0
          ) || 0;

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            duration_hours: course.duration_hours,
            thumbnail_url: course.thumbnail_url,
            enrollment: {
              progress_percentage: enrollment.progress_percentage || 0,
              enrolled_at: enrollment.enrolled_at,
              last_accessed_at: enrollment.last_accessed_at,
              completed_at: enrollment.completed_at,
            },
            total_modules: totalModules || 0,
            completed_modules: completedModules || 0,
            total_time_spent: Math.floor(totalTimeSpent / 60), // Convert to minutes
          };
        })
      );

      setCourses(coursesWithProgress);

      // Calculate stats
      const activeCourses = coursesWithProgress.filter(c => !c.enrollment.completed_at).length;
      const completedCourses = coursesWithProgress.filter(c => c.enrollment.completed_at).length;
      const totalHours = coursesWithProgress.reduce((sum, c) => sum + (c.total_time_spent / 60), 0);
      const avgProgress = coursesWithProgress.length > 0
        ? coursesWithProgress.reduce((sum, c) => sum + c.enrollment.progress_percentage, 0) / coursesWithProgress.length
        : 0;

      setStats({
        activeCourses,
        completedCourses,
        totalHours: Math.floor(totalHours),
        avgProgress: Math.floor(avgProgress),
      });
    } catch (error: any) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-500",
      intermediate: "bg-yellow-500",
      advanced: "bg-red-500",
    };
    return colors[level] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mis Cursos</h1>
        <p className="text-muted-foreground">Gestiona tu formación y sigue tu progreso</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Cursos Activos</p>
          <p className="text-3xl font-bold">{stats.activeCourses}</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Completados</p>
          <p className="text-3xl font-bold">{stats.completedCourses}</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Horas Cursadas</p>
          <p className="text-3xl font-bold">{stats.totalHours}</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Progreso Promedio</p>
          <p className="text-3xl font-bold">{stats.avgProgress}%</p>
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes cursos activos</h3>
            <p className="text-muted-foreground mb-4">
              Explora nuestro catálogo y comienza tu formación
            </p>
            <Button onClick={() => navigate("/")}>Ver cursos disponibles</Button>
          </Card>
        ) : (
          courses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-all cursor-pointer border-border/50"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {getLevelLabel(course.level)}
                      </Badge>
                      {course.category && (
                        <Badge variant="outline">{course.category}</Badge>
                      )}
                      {course.enrollment.completed_at && (
                        <Badge className="bg-green-500">Completado</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-1">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {course.completed_modules}/{course.total_modules} módulos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.total_time_spent} minutos invertidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{course.enrollment.progress_percentage}% completado</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso del curso</span>
                    <span className="font-medium">
                      {course.enrollment.progress_percentage}%
                    </span>
                  </div>
                  <Progress value={course.enrollment.progress_percentage} className="h-2" />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course.id}`);
                    }}
                  >
                    {course.enrollment.completed_at ? "Revisar" : "Continuar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
