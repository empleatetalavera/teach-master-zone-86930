import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Filter, 
  Eye,
  Mail,
  FileText,
  Loader2,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  dni: string;
  phone: string;
  courseName: string;
  courseId: string;
  progress: number;
  lastAccess: string | null;
  enrolledAt: string;
}

export default function TeacherStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    dni: "",
    course: "",
  });

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, students]);

  const loadStudents = async () => {
    try {
      console.log("Loading students for teacher:", user!.id);
      
      // Get courses where this teacher is the tutor
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("tutor_id", user!.id);

      console.log("Courses found:", courses, "Error:", coursesError);

      if (!courses || courses.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const courseIds = courses.map(c => c.id);
      const courseMap = new Map(courses.map(c => [c.id, c.title]));

      // Get enrollments for these courses
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          user_id,
          course_id,
          progress_percentage,
          last_accessed_at,
          enrolled_at
        `)
        .in("course_id", courseIds);

      if (error) throw error;

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Get profiles for enrolled students
      const studentIds = [...new Set(enrollments.map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, dni_nie, phone")
        .in("id", studentIds);

      // Get emails from auth (we'll need to use the user_id to get emails)
      // Since we can't query auth.users directly, we'll use a different approach
      // We'll need to get emails from a separate query or accept that we don't have them
      
      // For now, let's join with a users query if possible, or just show "N/A"
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Transform data
      const studentData: Student[] = enrollments.map(enrollment => {
        const profile = profileMap.get(enrollment.user_id);
        return {
          id: enrollment.user_id,
          name: profile?.full_name || "Sin nombre",
          email: "N/A", // Email requires different approach
          dni: profile?.dni_nie || "",
          phone: profile?.phone || "",
          courseName: courseMap.get(enrollment.course_id) || "Sin curso",
          courseId: enrollment.course_id,
          progress: enrollment.progress_percentage || 0,
          lastAccess: enrollment.last_accessed_at,
          enrolledAt: enrollment.enrolled_at,
        };
      });

      setStudents(studentData);
      setFilteredStudents(studentData);
    } catch (error: any) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...students];

    if (filters.name) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.dni) {
      result = result.filter(s => 
        s.dni.toLowerCase().includes(filters.dni.toLowerCase())
      );
    }

    if (filters.course) {
      result = result.filter(s => 
        s.courseName.toLowerCase().includes(filters.course.toLowerCase())
      );
    }

    setFilteredStudents(result);
  };

  const handleViewDetail = (studentId: string, courseId: string) => {
    navigate(`/dashboard/teacher/students/${studentId}?course=${courseId}`);
  };

  const handleExportReport = () => {
    const csvContent = [
      ["Nombre", "DNI", "Teléfono", "Curso", "Progreso", "Último Acceso"].join(","),
      ...filteredStudents.map(s => [
        s.name,
        s.dni,
        s.phone,
        s.courseName,
        `${s.progress}%`,
        s.lastAccess ? new Date(s.lastAccess).toLocaleString("es-ES") : "Nunca"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ReporteSeguimientoAlumnos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      dni: "",
      course: "",
    });
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Seguimiento de Alumnos
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitoriza el progreso y actividad de tus estudiantes
          </p>
        </div>
        <Button onClick={handleExportReport} variant="outline" disabled={filteredStudents.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra por nombre, NIF o curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre del alumno"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">NIF/DNI</Label>
              <Input
                id="dni"
                placeholder="Número de identificación"
                value={filters.dni}
                onChange={(e) => setFilters({ ...filters, dni: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Curso</Label>
              <Input
                id="course"
                placeholder="Nombre del curso"
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguimiento de Alumnos</CardTitle>
          <CardDescription>
            {filteredStudents.length} estudiantes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {students.length === 0 
                  ? "No hay estudiantes matriculados en tus cursos"
                  : "No se encontraron estudiantes con los filtros aplicados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={`${student.id}-${student.courseId}-${index}`}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.dni || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{student.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.courseName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[100px] bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[40px]">
                            {student.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.lastAccess 
                          ? new Date(student.lastAccess).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewDetail(student.id, student.courseId)}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Enviar mensaje">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Generar informe">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}