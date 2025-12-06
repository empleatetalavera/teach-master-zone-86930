import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Eye, 
  Calendar,
  Search,
  Loader2,
  ClipboardList,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface CourseWithEnrollments {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  category: string | null;
  level: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  enrollments_count: number;
}

export default function TeacherCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch courses where user is tutor
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["teacher-assigned-courses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get courses where user is tutor
      const { data: coursesData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Get enrollment counts for each course
      const coursesWithCounts: CourseWithEnrollments[] = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id);
          
          return {
            ...course,
            enrollments_count: count || 0
          };
        })
      );
      
      return coursesWithCounts;
    },
    enabled: !!user
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Cursos Asignados</h1>
        <p className="text-muted-foreground mt-2">
          Cursos donde eres tutor/profesor asignado
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No tienes cursos asignados</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "No se encontraron cursos con ese criterio" 
              : "El administrador debe asignarte como tutor de un curso"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden"
              >
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-primary" />
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                {course.description && (
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours ? `${course.duration_hours}h` : '-'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollments_count} alumnos</span>
                  </div>
                  {course.category && (
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                  )}
                </div>

                {(course.start_date || course.end_date) && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {course.start_date && new Date(course.start_date).toLocaleDateString('es-ES')}
                    {course.start_date && course.end_date && ' - '}
                    {course.end_date && new Date(course.end_date).toLocaleDateString('es-ES')}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Curso
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/teacher/students?course=${course.id}`)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Alumnos
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/teacher/grade-activities?course=${course.id}`)}
                  >
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Evaluar
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/teacher/reports?course=${course.id}`)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Informes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}