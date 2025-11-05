import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Filter,
  BarChart3,
  Users,
  GraduationCap,
  Clock,
  Loader2
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeacherReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("student-tracking");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    courseId: "",
    startDate: "",
    endDate: "",
    studentName: "",
  });

  const reportTypes = [
    {
      id: "student-tracking",
      name: "Seguimiento de Alumnos",
      icon: Users,
      description: "Informe detallado de accesos y progreso"
    },
    {
      id: "course-completion",
      name: "Finalización de Cursos",
      icon: GraduationCap,
      description: "Tasas de finalización y certificados"
    },
    {
      id: "time-analysis",
      name: "Análisis de Tiempo",
      icon: Clock,
      description: "Tiempo invertido por módulo y alumno"
    },
    {
      id: "performance",
      name: "Rendimiento Académico",
      icon: BarChart3,
      description: "Calificaciones y evaluaciones"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
        <p className="text-muted-foreground mt-2">
          Genera informes detallados sobre el progreso y actividad de tus estudiantes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              reportType === type.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setReportType(type.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <type.icon className={`h-8 w-8 ${
                  reportType === type.id ? 'text-primary' : 'text-muted-foreground'
                }`} />
                {reportType === type.id && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <CardTitle className="text-base mt-2">{type.name}</CardTitle>
              <CardDescription className="text-sm">{type.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="filters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="filters">Filtros</TabsTrigger>
          <TabsTrigger value="options">Opciones</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
              <CardDescription>
                Configura los criterios para generar el informe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="actionCode">Código de acción</Label>
                  <Input id="actionCode" placeholder="Código..." />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="actionCodeEmpty" />
                    <label
                      htmlFor="actionCodeEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupCode">Código de grupo</Label>
                  <Input id="groupCode" placeholder="excel" />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="groupCodeEmpty" />
                    <label
                      htmlFor="groupCodeEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionName">Nombre de acción</Label>
                  <Input id="actionName" placeholder="Nombre..." />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="actionNameEmpty" />
                    <label
                      htmlFor="actionNameEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupName">Nombre de grupo</Label>
                  <Input id="groupName" placeholder="Nombre..." />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="groupNameEmpty" />
                    <label
                      htmlFor="groupNameEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingAction">Acción formativa</Label>
                  <Select>
                    <SelectTrigger id="trainingAction">
                      <SelectValue placeholder="INTRODUZCA ARRIBA CÓDIGO O NOMBRE DE ACCIÓN PARA CARGAR ESTA LISTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel2016">Iniciación a Excel 2016</SelectItem>
                      <SelectItem value="javascript">JavaScript Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select>
                    <SelectTrigger id="group">
                      <SelectValue placeholder="-- TODOS --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="excel">Demo Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moduleCode">Código de módulo</Label>
                  <Input id="moduleCode" placeholder="Código..." />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="moduleCodeEmpty" />
                    <label
                      htmlFor="moduleCodeEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitCode">Código de unidad</Label>
                  <Input id="unitCode" placeholder="Código..." />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="unitCodeEmpty" />
                    <label
                      htmlFor="unitCodeEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moduleName">Nombre de módulo</Label>
                  <Select>
                    <SelectTrigger id="moduleName">
                      <SelectValue placeholder="INTRODUZCA ARRIBA CÓDIGO O NOMBRE DE MÓDULO PARA CARGAR ESTA LISTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intro">Introducción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitName">Nombre de unidad</Label>
                  <Input id="unitName" placeholder="Nombre..." />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="unitNameEmpty" />
                    <label
                      htmlFor="unitNameEmpty"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vacío
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingModule">Módulo formativo</Label>
                  <Select>
                    <SelectTrigger id="trainingModule">
                      <SelectValue placeholder="INTRODUZCA ARRIBA CÓDIGO O NOMBRE DE MÓDULO PARA CARGAR ESTA LISTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel Básico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingUnit">Unidad formativa</Label>
                  <Select>
                    <SelectTrigger id="trainingUnit">
                      <SelectValue placeholder="INTRODUZCA ARRIBA CÓDIGO O NOMBRE DE UNIDAD PARA CARGAR ESTA LISTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ud1">UD1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input id="nif" placeholder="NIF..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Nombre..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName1">Apellido 1</Label>
                  <Input id="lastName1" placeholder="Primer apellido..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName2">Apellido 2</Label>
                  <Input id="lastName2" placeholder="Segundo apellido..." />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDateFrom">F. Inicio desde</Label>
                  <Input id="startDateFrom" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDateFrom">F. Fin desde</Label>
                  <Input id="endDateFrom" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDateTo">F. Inicio hasta</Label>
                  <Input id="startDateTo" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDateTo">F. Fin hasta</Label>
                  <Input id="endDateTo" type="date" />
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" className="w-full md:w-auto" onClick={generateReport} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Informe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opciones del Informe</CardTitle>
              <CardDescription>
                Personaliza el contenido y formato del informe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Criterio Apto Actividades</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir evaluación de actividades
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="actTrue" />
                      <label htmlFor="actTrue" className="text-sm">Verdadero</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="actFalse" defaultChecked />
                      <label htmlFor="actFalse" className="text-sm">Falso</label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Criterio Apto Test</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir resultados de test
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="testTrue" />
                      <label htmlFor="testTrue" className="text-sm">Verdadero</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="testFalse" defaultChecked />
                      <label htmlFor="testFalse" className="text-sm">Falso</label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Incluir Alumnos de Baja</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar alumnos dados de baja
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bajaTrue" defaultChecked />
                      <label htmlFor="bajaTrue" className="text-sm">Verdadero</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bajaFalse" />
                      <label htmlFor="bajaFalse" className="text-sm">Falso</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financing">Tipo financiación</Label>
                  <Select>
                    <SelectTrigger id="financing">
                      <SelectValue placeholder="-- TODOS --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sepe">SEPE</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button size="lg" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Results */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Informe</CardTitle>
            <CardDescription>
              {reportData.length} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Tiempo Invertido</TableHead>
                  <TableHead>Último Acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.student_name}</TableCell>
                    <TableCell>{row.course_title}</TableCell>
                    <TableCell>{row.progress}%</TableCell>
                    <TableCell>{row.time_spent} min</TableCell>
                    <TableCell>{new Date(row.last_access).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  async function generateReport() {
    setLoading(true);
    try {
      if (reportType === "student-tracking") {
        const { data: enrollments, error } = await supabase
          .from("enrollments")
          .select(`
            *,
            course:courses(title),
            user:profiles!enrollments_user_id_fkey(full_name)
          `);

        if (error) throw error;

        const processedData = await Promise.all(
          enrollments.map(async (enrollment: any) => {
            const { data: interactions } = await supabase
              .from("content_interactions")
              .select("time_spent_seconds")
              .eq("enrollment_id", enrollment.id);

            const totalTime = interactions?.reduce(
              (sum, i) => sum + (i.time_spent_seconds || 0),
              0
            ) || 0;

            return {
              student_name: enrollment.user?.full_name || "Sin nombre",
              course_title: enrollment.course?.title || "Sin título",
              progress: enrollment.progress_percentage || 0,
              time_spent: Math.floor(totalTime / 60),
              last_access: enrollment.last_accessed_at || enrollment.enrolled_at,
            };
          })
        );

        setReportData(processedData);
      } else if (reportType === "time-analysis") {
        const { data: sessions, error } = await supabase
          .from("user_sessions")
          .select(`
            *,
            user:profiles!user_sessions_user_id_fkey(full_name),
            course:courses(title)
          `)
          .not("course_id", "is", null);

        if (error) throw error;

        const processedData = sessions.map((session: any) => ({
          student_name: session.user?.full_name || "Sin nombre",
          course_title: session.course?.title || "Sin título",
          progress: 0,
          time_spent: Math.floor((session.duration_seconds || 0) / 60),
          last_access: session.ended_at || session.started_at,
        }));

        setReportData(processedData);
      }

      toast({
        title: "Informe generado",
        description: "El informe se ha generado correctamente",
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
}
