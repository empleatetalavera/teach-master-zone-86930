import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BookOpen, Clock, Users, Settings, Eye } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  is_active: boolean;
  created_at: string;
  _count?: {
    enrollments: number;
    modules: number;
  };
}

export default function AdminCourses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data: coursesData, error } = await supabase
        .from("courses")
        .select(`
          *,
          enrollments:enrollments(count),
          modules:modules(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include counts
      const transformedCourses = coursesData.map((course: any) => ({
        ...course,
        _count: {
          enrollments: course.enrollments?.[0]?.count || 0,
          modules: course.modules?.[0]?.count || 0,
        },
      }));

      setCourses(transformedCourses);
    } catch (error: any) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return level;
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
          <h1 className="text-3xl font-bold">Certificados de Profesionalidad</h1>
          <p className="text-muted-foreground">
            Gestiona los certificados de profesionalidad de la plataforma
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/admin/courses/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Certificado de Profesionalidad
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos por título, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Certificados</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Certificados Activos</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {courses.filter((c) => c.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Estudiantes</CardDescription>
            <CardTitle className="text-3xl text-secondary">
              {courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Módulos</CardDescription>
            <CardTitle className="text-3xl">
              {courses.reduce((sum, c) => sum + (c._count?.modules || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Courses List */}
      <div className="grid gap-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron cursos con ese criterio"
                  : "No hay cursos creados. Crea tu primer curso."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {getLevelLabel(course.level)}
                      </Badge>
                      {course.category && (
                        <Badge variant="outline">{course.category}</Badge>
                      )}
                      {!course.is_active && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_hours || 0} horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{course._count?.modules || 0} módulos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course._count?.enrollments || 0} estudiantes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/admin/course-settings/${course.id}`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
