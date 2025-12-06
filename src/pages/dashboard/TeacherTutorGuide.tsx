import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, BookOpen, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface Course {
  id: string;
  title: string;
  category: string | null;
  duration_hours: number | null;
  course_type: string | null;
}

const TeacherTutorGuide = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title, category, duration_hours, course_type')
          .eq('tutor_id', user.id)
          .eq('is_active', true)
          .order('title');

        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Guía del Tutor-Formador</h1>
        <p className="text-muted-foreground">
          Selecciona un curso para ver su guía del tutor específica
        </p>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tienes cursos asignados</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Cuando se te asignen cursos como tutor, podrás acceder a sus guías desde aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/dashboard/teacher/courses/${course.id}/tutor-guide`}
              className="block"
            >
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <BookMarked className="h-5 w-5 text-primary" />
                    </div>
                    {course.course_type && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {course.course_type}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3 line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {course.category || "Sin categoría"} • {course.duration_hours || 0} horas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-sm text-primary font-medium">
                    Ver guía del tutor
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">¿Qué es la Guía del Tutor?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            La Guía del Tutor-Formador es un documento oficial que contiene toda la información 
            necesaria para el desarrollo óptimo de cada curso que impartes.
          </p>
          <p>
            Cada guía incluye: datos de la acción formativa, estructura del curso (módulos y 
            unidades formativas), sistema de evaluación, procedimientos de seguimiento del 
            aprendizaje, sistema tutorial y gestión administrativa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTutorGuide;
