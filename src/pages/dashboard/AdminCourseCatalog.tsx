import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, Search, ChevronRight, Building2, Award, GraduationCap, BookMarked, HeartPulse } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseAssignmentPanel from "@/components/CourseAssignmentPanel";

interface Course {
  id: string;
  title: string;
  category: string | null;
  course_type: string | null;
  duration_hours: number | null;
  is_active: boolean;
}

interface AssignmentCount {
  course_id: string;
  count: number;
}

export default function AdminCourseCatalog() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignmentCounts, setAssignmentCounts] = useState<AssignmentCount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [totalCenters, setTotalCenters] = useState(0);
  const [activeTab, setActiveTab] = useState("especialidades");

  useEffect(() => {
    if (userRole === 'super_admin') {
      loadData();
    }
  }, [userRole]);

  const loadData = async () => {
    try {
      const [coursesRes, assignmentsRes, centersRes] = await Promise.all([
        supabase.from("courses").select("id, title, category, course_type, duration_hours, is_active").order("title"),
        supabase.from("course_center_assignments").select("course_id").eq("is_active", true),
        supabase.from("training_centers").select("id", { count: "exact", head: true }).eq("is_active", true)
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setCourses(coursesRes.data || []);
      setTotalCenters(centersRes.count || 0);

      // Count assignments per course
      const counts: Record<string, number> = {};
      assignmentsRes.data?.forEach(a => {
        counts[a.course_id] = (counts[a.course_id] || 0) + 1;
      });
      
      setAssignmentCounts(
        Object.entries(counts).map(([course_id, count]) => ({ course_id, count }))
      );
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssignedCount = (courseId: string): number => {
    return assignmentCounts.find(a => a.course_id === courseId)?.count || 0;
  };

  // Filter by course type
  const especialidades = courses.filter(c => c.course_type === 'sepe_especialidad');
  const certificados = courses.filter(c => c.course_type === 'certificado_profesionalidad');
  const cursosCFC = courses.filter(c => c.course_type === 'cfc');
  const cursosJCCM = courses.filter(c => c.course_type === 'jccm_sociosanitario');

  // Apply search filter
  const filterBySearch = (list: Course[]) => list.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEspecialidades = filterBySearch(especialidades);
  const filteredCertificados = filterBySearch(certificados);
  const filteredCFC = filterBySearch(cursosCFC);
  const filteredJCCM = filterBySearch(cursosJCCM);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setPanelOpen(true);
  };

  const handleAssignmentChange = () => {
    loadData();
  };

  if (userRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Esta sección solo está disponible para super administradores
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalAssignments = assignmentCounts.reduce((sum, a) => sum + a.count, 0);

  const CourseTable = ({ courseList }: { courseList: Course[] }) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead className="text-center">Centros Asignados</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseList.map((course) => {
              const assignedCount = getAssignedCount(course.id);
              return (
                <TableRow 
                  key={course.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCourseClick(course)}
                >
                  <TableCell className="font-medium max-w-[400px]">
                    <div className="truncate">{course.title}</div>
                  </TableCell>
                  <TableCell>
                    {course.category ? (
                      <Badge variant="outline">{course.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{course.duration_hours ? `${course.duration_hours}h` : "-"}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={assignedCount > 0 ? "default" : "secondary"}>
                        {assignedCount} / {totalCenters}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
            {courseList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No se encontraron cursos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Catálogo de Cursos SEPE
        </h1>
        <p className="text-muted-foreground">
          Asigna cursos a los centros de formación para facturación de licencias
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Especialidades Formativas</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-500" />
              {especialidades.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Certificados de Profesionalidad</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-500" />
              {certificados.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cursos CFC</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-green-500" />
              {cursosCFC.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>JCCM Sociosanitario</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-rose-500" />
              {cursosJCCM.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Centros Activos</CardDescription>
            <CardTitle className="text-3xl">{totalCenters}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Licencias Activas</CardDescription>
            <CardTitle className="text-3xl">{totalAssignments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="especialidades" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Especialidades ({especialidades.length})
          </TabsTrigger>
          <TabsTrigger value="certificados" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificados ({certificados.length})
          </TabsTrigger>
          <TabsTrigger value="cfc" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            CFC ({cursosCFC.length})
          </TabsTrigger>
          <TabsTrigger value="jccm" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            JCCM ({cursosJCCM.length})
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <TabsContent value="especialidades" className="mt-4">
          <CourseTable courseList={filteredEspecialidades} />
        </TabsContent>

        <TabsContent value="certificados" className="mt-4">
          <CourseTable courseList={filteredCertificados} />
        </TabsContent>

        <TabsContent value="cfc" className="mt-4">
          <CourseTable courseList={filteredCFC} />
        </TabsContent>

        <TabsContent value="jccm" className="mt-4">
          <CourseTable courseList={filteredJCCM} />
        </TabsContent>
      </Tabs>

      {/* Assignment Panel */}
      <CourseAssignmentPanel
        course={selectedCourse}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onAssignmentChange={handleAssignmentChange}
      />
    </div>
  );
}