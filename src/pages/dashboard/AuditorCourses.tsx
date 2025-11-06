import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ShieldCheck, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  student_count: number;
  avg_progress: number;
}

const AuditorCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);

      // Get all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description, category, duration_hours")
        .eq("is_active", true)
        .order("title");

      if (coursesError) throw coursesError;

      // Get enrollment counts and progress for each course
      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select("progress_percentage")
            .eq("course_id", course.id);

          if (enrollError) throw enrollError;

          const studentCount = enrollments?.length || 0;
          const avgProgress =
            studentCount > 0
              ? enrollments!.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / studentCount
              : 0;

          return {
            ...course,
            student_count: studentCount,
            avg_progress: Math.round(avgProgress),
          };
        })
      );

      setCourses(coursesWithStats);
      setFilteredCourses(coursesWithStats);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          Cursos Disponibles
        </h1>
        <p className="text-muted-foreground mt-2">
          Accede a cualquier curso para realizar auditoría de calidad
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Cursos</CardTitle>
          <CardDescription>
            Filtra cursos por título o categoría
          </CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No se encontraron cursos" : "No hay cursos disponibles"}
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {course.description || "Sin descripción"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {course.category && (
                        <Badge variant="secondary">{course.category}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {course.duration_hours}h
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {course.student_count} alumnos
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {course.avg_progress}% progreso medio
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/course/${course.id}`)}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Auditar Curso
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditorCourses;
