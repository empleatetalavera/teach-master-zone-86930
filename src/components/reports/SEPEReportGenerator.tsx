import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Clock,
  GraduationCap,
  Users,
  BarChart3,
  Loader2,
  BookOpen,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";


interface Course {
  id: string;
  title: string;
  category: string;
}

interface Student {
  id: string;
  full_name: string;
  dni_nie: string;
  email?: string;
}

interface SEPEReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const SEPE_REPORT_TYPES: SEPEReportType[] = [
  {
    id: "tiempo-tutorizacion",
    name: "Tiempo Invertido (Tutorización)",
    description: "Tiempo dedicado por alumno en tutorización y seguimiento",
    icon: Clock,
  },
  {
    id: "tiempo-imparticion",
    name: "Tiempo Invertido (Impartición)",
    description: "Tiempo dedicado por alumno en contenidos formativos",
    icon: BookOpen,
  },
  {
    id: "calificaciones",
    name: "Calificaciones Individualizadas",
    description: "Informe detallado de notas con intentos por alumno",
    icon: GraduationCap,
  },
  {
    id: "seguimiento",
    name: "Seguimiento Individualizado",
    description: "Métricas completas de seguimiento por alumno",
    icon: Users,
  },
  {
    id: "tiempos-resumen",
    name: "Tiempos Invertidos (Resumen)",
    description: "Resumen de tiempos con estadísticas generales",
    icon: BarChart3,
  },
];

export default function SEPEReportGenerator() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("tiempo-tutorizacion");
  const [filters, setFilters] = useState({
    courseId: "",
    studentId: "",
    groupCode: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user, userRole]);

  useEffect(() => {
    if (filters.courseId) {
      loadStudents(filters.courseId);
    }
  }, [filters.courseId]);

  const loadCourses = async () => {
    if (!user) return;

    let query = supabase
      .from("courses")
      .select("id, title, category")
      .eq("is_active", true)
      .order("title");

    // For teachers, only show their assigned courses
    if (userRole === 'teacher') {
      query = query.eq("tutor_id", user.id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error loading courses:", error);
      return;
    }
    
    if (data) setCourses(data);
  };

  const loadStudents = async (courseId: string) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", courseId);

    if (enrollments && enrollments.length > 0) {
      const userIds = enrollments.map((e) => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, dni_nie")
        .in("id", userIds);

      if (profiles) {
        setStudents(profiles.map(p => ({
          id: p.id,
          full_name: p.full_name || "Sin nombre",
          dni_nie: p.dni_nie || "",
        })));
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const generatePDF = async () => {
    if (!filters.courseId) {
      toast({
        title: "Error",
        description: "Selecciona un curso para generar el informe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("Generating PDF for course:", filters.courseId, "Report type:", selectedReport);

    try {
      const doc = new jsPDF();
      const course = courses.find((c) => c.id === filters.courseId);
      const reportType = SEPE_REPORT_TYPES.find((r) => r.id === selectedReport);

      console.log("Course found:", course?.title, "Report type:", reportType?.name);

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(reportType?.name || "Informe SEPE", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Curso: ${course?.title || "N/A"}`, 14, 30);
      doc.text(`Código Grupo: ${filters.groupCode || "N/A"}`, 14, 36);
      doc.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 14, 42);

      let yPosition = 50;

      switch (selectedReport) {
        case "tiempo-tutorizacion":
        case "tiempo-imparticion":
          await generateTimeReport(doc, yPosition);
          break;
        case "calificaciones":
          await generateGradesReport(doc, yPosition);
          break;
        case "seguimiento":
          await generateTrackingReport(doc, yPosition);
          break;
        case "tiempos-resumen":
          await generateTimeSummaryReport(doc, yPosition);
          break;
        default:
          doc.text("Selecciona un tipo de informe válido", 14, yPosition);
      }

      // Footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          `Generado por TalentCloud - ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Save PDF
      const fileName = `${(reportType?.name || "Informe").replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
      console.log("Saving PDF as:", fileName);
      doc.save(fileName);

      toast({
        title: "Informe generado",
        description: `El informe ${fileName} se ha descargado correctamente`,
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error al generar informe",
        description: error?.message || "No se pudo generar el informe PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeReport = async (doc: jsPDF, startY: number) => {
    // Get enrollments with time data
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        progress_percentage,
        enrolled_at,
        last_accessed_at
      `)
      .eq("course_id", filters.courseId);

    if (!enrollments || enrollments.length === 0) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    // Get profiles
    const userIds = enrollments.map((e) => e.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get content interactions for time data
    const { data: interactions } = await supabase
      .from("content_interactions")
      .select("user_id, time_spent_seconds, module_id")
      .in("user_id", userIds);

    // Calculate time per user
    const timeByUser: Record<string, number> = {};
    interactions?.forEach((i) => {
      timeByUser[i.user_id] = (timeByUser[i.user_id] || 0) + i.time_spent_seconds;
    });

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Prepare table data
    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const totalSeconds = timeByUser[e.user_id] || 0;
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        "ALUMNO/A",
        formatDuration(totalSeconds),
      ];
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Listado de Alumnos", 14, startY);

    autoTable(doc, {
      startY: startY + 5,
      head: [["NIF", "Nombre Completo", "Perfil", "Tiempo Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
      },
    });

    // Summary
    const totalTime = Object.values(timeByUser).reduce((a, b) => a + b, 0);
    const avgTime = enrollments.length > 0 ? totalTime / enrollments.length : 0;

    const summaryY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen", 14, summaryY);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de alumnos: ${enrollments.length}`, 14, summaryY + 7);
    doc.text(`Tiempo total invertido: ${formatDuration(totalTime)}`, 14, summaryY + 14);
    doc.text(`Tiempo medio por alumno: ${formatDuration(Math.round(avgTime))}`, 14, summaryY + 21);
  };

  const generateGradesReport = async (doc: jsPDF, startY: number) => {
    // Get evaluation attempts
    const { data: attempts } = await supabase
      .from("evaluation_attempts")
      .select(`
        id,
        user_id,
        evaluation_id,
        score,
        status,
        attempt_number,
        completed_at,
        created_at
      `)
      .order("created_at", { ascending: false });

    // Filter by course enrollments
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", filters.courseId);

    const enrolledUserIds = new Set(enrollments?.map((e) => e.user_id) || []);
    const filteredAttempts = attempts?.filter((a) => enrolledUserIds.has(a.user_id)) || [];

    // Get profiles
    const userIds = [...new Set(filteredAttempts.map((a) => a.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get evaluations
    const evalIds = [...new Set(filteredAttempts.map((a) => a.evaluation_id))];
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("id, title")
      .in("id", evalIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    const evalMap = new Map(evaluations?.map((e) => [e.id, e.title]) || []);

    // Group by user
    const userAttempts: Record<string, typeof filteredAttempts> = {};
    filteredAttempts.forEach((a) => {
      if (!userAttempts[a.user_id]) userAttempts[a.user_id] = [];
      userAttempts[a.user_id].push(a);
    });

    let currentY = startY;

    for (const userId of Object.keys(userAttempts)) {
      const profile = profileMap.get(userId);
      const attempts = userAttempts[userId];

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Alumno: ${profile?.full_name || "Sin nombre"}`, 14, currentY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`DNI: ${profile?.dni_nie || "N/A"}`, 14, currentY + 6);

      const tableData = attempts.map((a) => [
        a.completed_at ? format(new Date(a.completed_at), "dd/MM/yyyy") : "-",
        evalMap.get(a.evaluation_id) || "Evaluación",
        `Intento ${a.attempt_number}`,
        a.score !== null ? `${a.score}%` : "-",
        a.status === "completed" ? "Completado" : a.status,
      ]);

      autoTable(doc, {
        startY: currentY + 10,
        head: [["Fecha", "Evaluación", "Intento", "Calificación", "Estado"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 7,
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
  };

  const generateTrackingReport = async (doc: jsPDF, startY: number) => {
    // Get enrollments
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        progress_percentage,
        enrolled_at,
        last_accessed_at,
        completed_at
      `)
      .eq("course_id", filters.courseId);

    if (!enrollments || enrollments.length === 0) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get content interactions
    const { data: interactions } = await supabase
      .from("content_interactions")
      .select("user_id, time_spent_seconds, completed")
      .in("user_id", userIds);

    // Get evaluation attempts
    const { data: attempts } = await supabase
      .from("evaluation_attempts")
      .select("user_id, status, score")
      .in("user_id", userIds);

    // Get user sessions
    const { data: sessions } = await supabase
      .from("user_sessions")
      .select("user_id, started_at")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Calculate metrics per user
    const userMetrics: Record<string, any> = {};
    enrollments.forEach((e) => {
      userMetrics[e.user_id] = {
        enrollment: e,
        totalTime: 0,
        completedModules: 0,
        totalTests: 0,
        passedTests: 0,
        accesses: 0,
      };
    });

    interactions?.forEach((i) => {
      if (userMetrics[i.user_id]) {
        userMetrics[i.user_id].totalTime += i.time_spent_seconds;
        if (i.completed) userMetrics[i.user_id].completedModules++;
      }
    });

    attempts?.forEach((a) => {
      if (userMetrics[a.user_id]) {
        userMetrics[a.user_id].totalTests++;
        if (a.status === "completed" && a.score && a.score >= 50) {
          userMetrics[a.user_id].passedTests++;
        }
      }
    });

    sessions?.forEach((s) => {
      if (userMetrics[s.user_id]) {
        userMetrics[s.user_id].accesses++;
      }
    });

    let currentY = startY;

    for (const userId of Object.keys(userMetrics)) {
      const profile = profileMap.get(userId);
      const metrics = userMetrics[userId];
      const enrollment = metrics.enrollment;

      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      // Student header
      doc.setFillColor(240, 240, 240);
      doc.rect(14, currentY - 5, 180, 12, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(profile?.full_name?.toUpperCase() || "SIN NOMBRE", 16, currentY + 3);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`DNI: ${profile?.dni_nie || "N/A"}`, 140, currentY + 3);

      currentY += 15;

      // Student details table
      const detailsData = [
        ["Fecha Inicio", enrollment.enrolled_at ? format(new Date(enrollment.enrolled_at), "dd/MM/yyyy") : "-"],
        ["Último Acceso", enrollment.last_accessed_at ? format(new Date(enrollment.last_accessed_at), "dd/MM/yyyy HH:mm") : "-"],
        ["Tiempo Total", formatDuration(metrics.totalTime)],
        ["Total Accesos", metrics.accesses.toString()],
        ["Progreso", `${enrollment.progress_percentage || 0}%`],
        ["Tests Realizados", `${metrics.passedTests}/${metrics.totalTests}`],
      ];

      autoTable(doc, {
        startY: currentY,
        body: detailsData,
        theme: "plain",
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: "bold" },
          1: { cellWidth: 50 },
        },
      });

      // Progress bar
      const progressY = (doc as any).lastAutoTable.finalY + 5;
      const progress = enrollment.progress_percentage || 0;
      doc.setDrawColor(200, 200, 200);
      doc.rect(14, progressY, 100, 6);
      doc.setFillColor(34, 197, 94);
      doc.rect(14, progressY, progress, 6, "F");
      doc.setFontSize(8);
      doc.text(`Ritmo: ${progress}%`, 120, progressY + 5);

      currentY = progressY + 20;
    }
  };

  const generateTimeSummaryReport = async (doc: jsPDF, startY: number) => {
    // Similar to time report but with summary statistics
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments || enrollments.length === 0) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get content interactions
    const { data: interactions } = await supabase
      .from("content_interactions")
      .select("user_id, time_spent_seconds")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Calculate time per user
    const timeByUser: Record<string, number> = {};
    interactions?.forEach((i) => {
      timeByUser[i.user_id] = (timeByUser[i.user_id] || 0) + i.time_spent_seconds;
    });

    // Table data
    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const totalSeconds = timeByUser[e.user_id] || 0;
      return {
        name: profile?.full_name || "Sin nombre",
        dni: profile?.dni_nie || "",
        time: totalSeconds,
      };
    }).sort((a, b) => b.time - a.time); // Sort by time descending

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TIEMPO INVERTIDO", 14, startY);

    autoTable(doc, {
      startY: startY + 10,
      head: [["NIF", "Nombre", "Apellidos", "Perfil", "Tiempo Total"]],
      body: tableData.map((d) => {
        const nameParts = d.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        return [d.dni, firstName, lastName, "ALUMNO/A", formatDuration(d.time)];
      }),
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
    });

    // Summary chart area (simplified bar representation)
    const summaryY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total de tiempos invertidos", 14, summaryY);

    // Draw simple bar chart
    const maxTime = Math.max(...tableData.map((d) => d.time), 1);
    const barHeight = 8;
    let chartY = summaryY + 10;

    tableData.slice(0, 10).forEach((d, index) => {
      const barWidth = (d.time / maxTime) * 100;
      const nameParts = d.name.split(" ");
      const shortName = nameParts[0] || "Alumno";

      doc.setFillColor(59, 130, 246);
      doc.rect(50, chartY + index * (barHeight + 3), barWidth, barHeight, "F");
      doc.setFontSize(7);
      doc.text(shortName.substring(0, 15), 14, chartY + index * (barHeight + 3) + 6);
      doc.text(formatDuration(d.time), 155, chartY + index * (barHeight + 3) + 6);
    });

    // Total summary
    const totalY = chartY + Math.min(tableData.length, 10) * (barHeight + 3) + 15;
    const totalTime = tableData.reduce((sum, d) => sum + d.time, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Tiempo total del grupo: ${formatDuration(totalTime)}`, 14, totalY);
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {SEPE_REPORT_TYPES.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedReport === type.id ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedReport(type.id)}
          >
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <type.icon
                  className={`h-6 w-6 ${
                    selectedReport === type.id ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {selectedReport === type.id && (
                  <Badge variant="default" className="text-xs">
                    Seleccionado
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm mt-2">{type.name}</CardTitle>
              <CardDescription className="text-xs">{type.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuración del Informe
          </CardTitle>
          <CardDescription>
            Selecciona los filtros para generar el informe SEPE
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="course">Acción Formativa *</Label>
              <Select
                value={filters.courseId}
                onValueChange={(value) => setFilters({ ...filters, courseId: value })}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupCode">Código de Grupo</Label>
              <Input
                id="groupCode"
                placeholder="Ej: FP/2024/045/035"
                value={filters.groupCode}
                onChange={(e) => setFilters({ ...filters, groupCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Alumno (opcional)</Label>
              <Select
                value={filters.studentId}
                onValueChange={(value) => setFilters({ ...filters, studentId: value })}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="-- TODOS --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- TODOS --</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} {student.dni_nie && `(${student.dni_nie})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={generatePDF} disabled={loading || !filters.courseId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
