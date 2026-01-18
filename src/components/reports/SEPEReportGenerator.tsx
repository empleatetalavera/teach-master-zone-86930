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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MessageSquare,
  Mail,
  Archive,
  LogIn,
  Award,
  ClipboardCheck,
  UserCheck,
  UserX,
  UserPlus,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInDays } from "date-fns";
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
  category: string;
}

const SEPE_REPORT_TYPES: SEPEReportType[] = [
  // Acceso y Participación
  {
    id: "accesos",
    name: "Informe de Accesos",
    description: "Número y porcentaje de accesos a la plataforma, áreas visitadas, fechas y horas",
    icon: LogIn,
    category: "Acceso y Participación",
  },
  {
    id: "archivador",
    name: "Informe Archivador",
    description: "Historial de documentos subidos y recursos utilizados por el alumnado",
    icon: Archive,
    category: "Acceso y Participación",
  },
  {
    id: "foros",
    name: "Informe Foros",
    description: "Participación en foros: temas creados, respuestas y aportaciones",
    icon: MessageSquare,
    category: "Acceso y Participación",
  },
  {
    id: "mails",
    name: "Informe Mails",
    description: "Mensajes enviados y recibidos a través de las herramientas de comunicación",
    icon: Mail,
    category: "Acceso y Participación",
  },
  // Tiempos
  {
    id: "tiempos-invertidos",
    name: "Informe Tiempos Invertidos",
    description: "Tiempo medio por módulo/unidad formativa y de la acción formativa en conjunto",
    icon: Clock,
    category: "Tiempos",
  },
  // Calificaciones
  {
    id: "calificaciones-aprendizaje",
    name: "Calificaciones durante el Aprendizaje",
    description: "Resultados de trabajos, actividades y pruebas clasificados por módulos/UF",
    icon: BookOpen,
    category: "Calificaciones",
  },
  {
    id: "prueba-final",
    name: "Informe Prueba Final",
    description: "Resultados de evaluación final de módulo/UF, número y porcentaje de aptos",
    icon: GraduationCap,
    category: "Calificaciones",
  },
  {
    id: "evaluacion",
    name: "Informe de Evaluación",
    description: "Puntuación final ponderada (30% aprendizaje + 70% prueba final) por convocatoria",
    icon: ClipboardCheck,
    category: "Calificaciones",
  },
  // Alumnado
  {
    id: "alumnos-aptos",
    name: "Informe Alumnos Aptos (Formación)",
    description: "Número y porcentaje de alumnos que superan cada módulo y la acción formativa",
    icon: UserCheck,
    category: "Alumnado",
  },
  {
    id: "alumnos-aptos-practicas",
    name: "Informe Alumnos Aptos (Prácticas)",
    description: "Alumnos que superan el módulo de formación práctica en centros de trabajo",
    icon: Briefcase,
    category: "Alumnado",
  },
  {
    id: "detallado-alumnos",
    name: "Informe Detallado Alumnos",
    description: "Perfil del alumnado: sexo, edad, nivel formativo, situación laboral, etc.",
    icon: Users,
    category: "Alumnado",
  },
  {
    id: "alta-baja-alumnos",
    name: "Informe Alta/Baja Alumnos",
    description: "Altas, modificaciones y bajas por módulo/acción formativa con fechas",
    icon: UserPlus,
    category: "Alumnado",
  },
  {
    id: "alumnos-iniciados-abandonos",
    name: "Alumnos Iniciados, Completados y Abandonos",
    description: "Número y porcentaje de alumnos que inician, completan y abandonan con causas",
    icon: TrendingUp,
    category: "Alumnado",
  },
];

// Group reports by category
const groupedReports = SEPE_REPORT_TYPES.reduce((acc, report) => {
  if (!acc[report.category]) {
    acc[report.category] = [];
  }
  acc[report.category].push(report);
  return acc;
}, {} as Record<string, SEPEReportType[]>);

export default function SEPEReportGenerator() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("accesos");
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
    const secs = Math.floor(seconds % 60);
    
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

    try {
      // Get user profile and training center info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, training_center_id")
        .eq("id", user?.id)
        .maybeSingle();

      let centerName = "Centro de Formación";
      if (profileData?.training_center_id) {
        const { data: centerData } = await supabase
          .from("training_centers")
          .select("name")
          .eq("id", profileData.training_center_id)
          .maybeSingle();
        if (centerData?.name) {
          centerName = centerData.name;
        }
      }

      const generatorName = profileData?.full_name || user?.email || "Usuario";

      const doc = new jsPDF();
      const course = courses.find((c) => c.id === filters.courseId);
      const reportType = SEPE_REPORT_TYPES.find((r) => r.id === selectedReport);
      const generationDate = format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es });

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(reportType?.name || "Informe SEPE", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Centro: ${centerName}`, 14, 30);
      doc.text(`Curso: ${course?.title || "N/A"}`, 14, 36);
      doc.text(`Código Grupo: ${filters.groupCode || "N/A"}`, 14, 42);
      doc.text(`Generado por: ${generatorName}`, 14, 48);
      doc.text(`Fecha: ${generationDate}`, 14, 54);
      
      if (filters.startDate || filters.endDate) {
        doc.text(`Período: ${filters.startDate || 'Inicio'} - ${filters.endDate || 'Fin'}`, 14, 60);
      }

      let yPosition = filters.startDate || filters.endDate ? 70 : 64;

      // Generate specific report based on selection
      switch (selectedReport) {
        case "accesos":
          await generateAccessReport(doc, yPosition);
          break;
        case "archivador":
          await generateArchiveReport(doc, yPosition);
          break;
        case "foros":
          await generateForumReport(doc, yPosition);
          break;
        case "mails":
          await generateMailsReport(doc, yPosition);
          break;
        case "tiempos-invertidos":
          await generateTimeReport(doc, yPosition);
          break;
        case "calificaciones-aprendizaje":
          await generateLearningGradesReport(doc, yPosition);
          break;
        case "prueba-final":
          await generateFinalExamReport(doc, yPosition);
          break;
        case "evaluacion":
          await generateEvaluationReport(doc, yPosition);
          break;
        case "alumnos-aptos":
          await generatePassedStudentsReport(doc, yPosition);
          break;
        case "alumnos-aptos-practicas":
          await generatePracticePassedReport(doc, yPosition);
          break;
        case "detallado-alumnos":
          await generateDetailedStudentsReport(doc, yPosition);
          break;
        case "alta-baja-alumnos":
          await generateEnrollmentChangesReport(doc, yPosition);
          break;
        case "alumnos-iniciados-abandonos":
          await generateCompletionReport(doc, yPosition);
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
          `${centerName} | ${generatorName} - ${generationDate}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Save PDF
      const fileName = `${(reportType?.name || "Informe").replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
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

  // ========== REPORT GENERATORS ==========

  // 1. Informe de Accesos
  const generateAccessReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, enrolled_at, last_accessed_at")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    const { data: sessions } = await supabase
      .from("user_sessions")
      .select("user_id, started_at, ended_at, duration_seconds, session_type, course_id")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    const totalStudents = enrollments.length;

    // Calculate access stats per user
    const userAccess: Record<string, { 
      totalAccesses: number; 
      totalTime: number; 
      lastAccess: string | null;
      areas: Set<string>;
    }> = {};

    sessions?.forEach((s) => {
      if (!userAccess[s.user_id]) {
        userAccess[s.user_id] = { totalAccesses: 0, totalTime: 0, lastAccess: null, areas: new Set() };
      }
      userAccess[s.user_id].totalAccesses++;
      userAccess[s.user_id].totalTime += s.duration_seconds || 0;
      if (!userAccess[s.user_id].lastAccess || s.started_at > userAccess[s.user_id].lastAccess!) {
        userAccess[s.user_id].lastAccess = s.started_at;
      }
      if (s.session_type) userAccess[s.user_id].areas.add(s.session_type);
    });

    // Count students who have accessed
    const studentsWithAccess = Object.keys(userAccess).length;
    const accessPercentage = totalStudents > 0 ? ((studentsWithAccess / totalStudents) * 100).toFixed(1) : "0";

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE ACCESOS", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de alumnos matriculados: ${totalStudents}`, 14, startY + 10);
    doc.text(`Alumnos que han accedido: ${studentsWithAccess} (${accessPercentage}%)`, 14, startY + 17);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const access = userAccess[e.user_id] || { totalAccesses: 0, totalTime: 0, lastAccess: null, areas: new Set() };
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        access.totalAccesses.toString(),
        formatDuration(access.totalTime),
        access.lastAccess ? format(new Date(access.lastAccess), "dd/MM/yyyy HH:mm") : "-",
        Array.from(access.areas).join(", ") || "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 25,
      head: [["DNI", "Nombre", "Nº Accesos", "Tiempo Total", "Último Acceso", "Áreas Visitadas"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
      },
    });
  };

  // 2. Informe Archivador
  const generateArchiveReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);
    const enrollmentIds = enrollments.map((e) => e.id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get activity submissions (documents uploaded by students)
    const { data: submissions } = await supabase
      .from("activity_submissions")
      .select("enrollment_id, file_name, submitted_at, user_id")
      .in("enrollment_id", enrollmentIds)
      .not("file_name", "is", null);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Count documents per user
    const userDocs: Record<string, { count: number; lastUpload: string | null; files: string[] }> = {};
    submissions?.forEach((s) => {
      if (!userDocs[s.user_id]) {
        userDocs[s.user_id] = { count: 0, lastUpload: null, files: [] };
      }
      userDocs[s.user_id].count++;
      if (s.file_name) userDocs[s.user_id].files.push(s.file_name);
      if (!userDocs[s.user_id].lastUpload || (s.submitted_at && s.submitted_at > userDocs[s.user_id].lastUpload!)) {
        userDocs[s.user_id].lastUpload = s.submitted_at;
      }
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME ARCHIVADOR - DOCUMENTOS SUBIDOS", 14, startY);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const docs = userDocs[e.user_id] || { count: 0, lastUpload: null, files: [] };
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        docs.count.toString(),
        docs.lastUpload ? format(new Date(docs.lastUpload), "dd/MM/yyyy") : "-",
        docs.files.slice(0, 3).join(", ") + (docs.files.length > 3 ? "..." : "") || "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 10,
      head: [["DNI", "Nombre", "Documentos", "Última Subida", "Archivos"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });
  };

  // 3. Informe Foros
  const generateForumReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get forum topics created by these users
    const { data: topics } = await supabase
      .from("forum_topics")
      .select("id, created_by, created_at, title")
      .eq("course_id", filters.courseId)
      .in("created_by", userIds);

    // Get forum replies by these users
    const { data: replies } = await supabase
      .from("forum_replies")
      .select("id, created_by, created_at, topic_id")
      .in("created_by", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Calculate participation per user
    const userForum: Record<string, { topics: number; replies: number; lastActivity: string | null }> = {};
    
    topics?.forEach((t) => {
      if (!userForum[t.created_by]) userForum[t.created_by] = { topics: 0, replies: 0, lastActivity: null };
      userForum[t.created_by].topics++;
      if (!userForum[t.created_by].lastActivity || t.created_at > userForum[t.created_by].lastActivity!) {
        userForum[t.created_by].lastActivity = t.created_at;
      }
    });

    replies?.forEach((r) => {
      if (!userForum[r.created_by]) userForum[r.created_by] = { topics: 0, replies: 0, lastActivity: null };
      userForum[r.created_by].replies++;
      if (!userForum[r.created_by].lastActivity || r.created_at > userForum[r.created_by].lastActivity!) {
        userForum[r.created_by].lastActivity = r.created_at;
      }
    });

    const totalParticipants = Object.keys(userForum).length;
    const participationRate = enrollments.length > 0 ? ((totalParticipants / enrollments.length) * 100).toFixed(1) : "0";

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE PARTICIPACIÓN EN FOROS", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de alumnos: ${enrollments.length}`, 14, startY + 10);
    doc.text(`Alumnos participantes: ${totalParticipants} (${participationRate}%)`, 14, startY + 17);
    doc.text(`Total de temas creados: ${topics?.length || 0}`, 14, startY + 24);
    doc.text(`Total de respuestas: ${replies?.length || 0}`, 14, startY + 31);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const forum = userForum[e.user_id] || { topics: 0, replies: 0, lastActivity: null };
      const totalContributions = forum.topics + forum.replies;
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        forum.topics.toString(),
        forum.replies.toString(),
        totalContributions.toString(),
        forum.lastActivity ? format(new Date(forum.lastActivity), "dd/MM/yyyy") : "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 40,
      head: [["DNI", "Nombre", "Temas Creados", "Respuestas", "Total Aportaciones", "Última Actividad"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
    });
  };

  // 4. Informe Mails
  const generateMailsReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get communications (messages) for this course
    const { data: sentMessages } = await supabase
      .from("communications")
      .select("id, sender_id, created_at, communication_type")
      .eq("course_id", filters.courseId)
      .in("sender_id", userIds);

    const { data: receivedMessages } = await supabase
      .from("communications")
      .select("id, receiver_id, created_at, is_read")
      .eq("course_id", filters.courseId)
      .in("receiver_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Calculate message stats per user
    const userMails: Record<string, { sent: number; received: number; read: number; lastSent: string | null }> = {};
    
    sentMessages?.forEach((m) => {
      if (!userMails[m.sender_id]) userMails[m.sender_id] = { sent: 0, received: 0, read: 0, lastSent: null };
      userMails[m.sender_id].sent++;
      if (!userMails[m.sender_id].lastSent || m.created_at > userMails[m.sender_id].lastSent!) {
        userMails[m.sender_id].lastSent = m.created_at;
      }
    });

    receivedMessages?.forEach((m) => {
      if (!m.receiver_id) return;
      if (!userMails[m.receiver_id]) userMails[m.receiver_id] = { sent: 0, received: 0, read: 0, lastSent: null };
      userMails[m.receiver_id].received++;
      if (m.is_read) userMails[m.receiver_id].read++;
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE MENSAJERÍA Y COMUNICACIONES", 14, startY);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const mails = userMails[e.user_id] || { sent: 0, received: 0, read: 0, lastSent: null };
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        mails.sent.toString(),
        mails.received.toString(),
        mails.read.toString(),
        mails.lastSent ? format(new Date(mails.lastSent), "dd/MM/yyyy") : "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 10,
      head: [["DNI", "Nombre", "Enviados", "Recibidos", "Leídos", "Último Envío"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });
  };

  // 5. Informe Tiempos Invertidos
  const generateTimeReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, progress_percentage")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get modules for the course
    const { data: modules } = await supabase
      .from("modules")
      .select("id, title")
      .eq("course_id", filters.courseId)
      .order("order_index");

    // Get content interactions for time data
    const { data: interactions } = await supabase
      .from("content_interactions")
      .select("user_id, time_spent_seconds, module_id")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    const moduleMap = new Map(modules?.map((m) => [m.id, m.title]) || []);

    // Calculate time per user per module
    const timeByUserModule: Record<string, Record<string, number>> = {};
    const timeByUser: Record<string, number> = {};

    interactions?.forEach((i) => {
      if (!timeByUserModule[i.user_id]) timeByUserModule[i.user_id] = {};
      timeByUserModule[i.user_id][i.module_id] = (timeByUserModule[i.user_id][i.module_id] || 0) + i.time_spent_seconds;
      timeByUser[i.user_id] = (timeByUser[i.user_id] || 0) + i.time_spent_seconds;
    });

    // Calculate averages
    const totalTime = Object.values(timeByUser).reduce((a, b) => a + b, 0);
    const avgTime = enrollments.length > 0 ? totalTime / enrollments.length : 0;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE TIEMPOS INVERTIDOS", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tiempo total de la acción formativa: ${formatDuration(totalTime)}`, 14, startY + 10);
    doc.text(`Tiempo medio por alumno: ${formatDuration(Math.round(avgTime))}`, 14, startY + 17);

    // Main student time table
    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const userTime = timeByUser[e.user_id] || 0;
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        "ALUMNO/A",
        formatDuration(userTime),
        `${e.progress_percentage || 0}%`,
      ];
    }).sort((a, b) => parseInt(b[3]) - parseInt(a[3]));

    autoTable(doc, {
      startY: startY + 25,
      head: [["DNI", "Nombre", "Perfil", "Tiempo Total", "Progreso"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });

    // Time per module summary
    if (modules?.length) {
      const summaryY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Tiempo medio por Módulo/Unidad Formativa", 14, summaryY);

      const moduleTimeData = modules.map((m) => {
        const totalModuleTime = Object.values(timeByUserModule).reduce((sum, userModules) => {
          return sum + (userModules[m.id] || 0);
        }, 0);
        const avgModuleTime = enrollments.length > 0 ? totalModuleTime / enrollments.length : 0;
        return [m.title.substring(0, 50), formatDuration(Math.round(avgModuleTime))];
      });

      autoTable(doc, {
        startY: summaryY + 5,
        head: [["Módulo/UF", "Tiempo Medio"]],
        body: moduleTimeData,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
      });
    }
  };

  // 6. Calificaciones durante el Aprendizaje
  const generateLearningGradesReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);
    const enrollmentIds = enrollments.map((e) => e.id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get activity submissions
    const { data: submissions } = await supabase
      .from("activity_submissions")
      .select("enrollment_id, user_id, score, status, activity_id")
      .in("enrollment_id", enrollmentIds);

    // Get evaluations (non-final)
    const { data: attempts } = await supabase
      .from("evaluation_attempts")
      .select("user_id, score, status, evaluation_id")
      .in("user_id", userIds)
      .eq("status", "completed");

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Calculate grades per user
    const userGrades: Record<string, { 
      activityScores: number[]; 
      evalScores: number[];
      avgActivity: number;
      avgEval: number;
    }> = {};

    submissions?.forEach((s) => {
      if (s.score !== null && s.status === 'graded') {
        if (!userGrades[s.user_id]) userGrades[s.user_id] = { activityScores: [], evalScores: [], avgActivity: 0, avgEval: 0 };
        userGrades[s.user_id].activityScores.push(s.score);
      }
    });

    attempts?.forEach((a) => {
      if (a.score !== null) {
        if (!userGrades[a.user_id]) userGrades[a.user_id] = { activityScores: [], evalScores: [], avgActivity: 0, avgEval: 0 };
        userGrades[a.user_id].evalScores.push(a.score);
      }
    });

    // Calculate averages
    Object.keys(userGrades).forEach((userId) => {
      const g = userGrades[userId];
      g.avgActivity = g.activityScores.length > 0 ? g.activityScores.reduce((a, b) => a + b, 0) / g.activityScores.length : 0;
      g.avgEval = g.evalScores.length > 0 ? g.evalScores.reduce((a, b) => a + b, 0) / g.evalScores.length : 0;
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CALIFICACIONES DURANTE EL PROCESO DE APRENDIZAJE", 14, startY);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const grades = userGrades[e.user_id] || { activityScores: [], evalScores: [], avgActivity: 0, avgEval: 0 };
      const overallAvg = (grades.avgActivity + grades.avgEval) / 2;
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        grades.activityScores.length.toString(),
        grades.avgActivity.toFixed(1) + "%",
        grades.evalScores.length.toString(),
        grades.avgEval.toFixed(1) + "%",
        overallAvg.toFixed(1) + "%",
      ];
    });

    autoTable(doc, {
      startY: startY + 10,
      head: [["DNI", "Nombre", "Actividades", "Media Act.", "Pruebas", "Media Pruebas", "Media Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
    });
  };

  // 7. Informe Prueba Final
  const generateFinalExamReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get final evaluations for this course
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("id, title, module_id, passing_score")
      .eq("course_id", filters.courseId);

    // Get all attempts
    const { data: attempts } = await supabase
      .from("evaluation_attempts")
      .select("user_id, evaluation_id, score, status, attempt_number, completed_at")
      .in("user_id", userIds)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    const evalMap = new Map(evaluations?.map((e) => [e.id, e]) || []);

    // Get best scores per user per evaluation
    const userBestScores: Record<string, Record<string, { score: number; passed: boolean; convocatoria: number }>> = {};
    
    attempts?.forEach((a) => {
      const eval_ = evalMap.get(a.evaluation_id);
      if (!eval_ || a.score === null) return;
      
      if (!userBestScores[a.user_id]) userBestScores[a.user_id] = {};
      
      const current = userBestScores[a.user_id][a.evaluation_id];
      if (!current || a.score > current.score) {
        userBestScores[a.user_id][a.evaluation_id] = {
          score: a.score,
          passed: a.score >= eval_.passing_score,
          convocatoria: a.attempt_number,
        };
      }
    });

    // Calculate pass statistics
    let totalPassed = 0;
    enrollments.forEach((e) => {
      const userScores = userBestScores[e.user_id];
      if (userScores) {
        const allPassed = evaluations?.every((eval_) => userScores[eval_.id]?.passed) || false;
        if (allPassed) totalPassed++;
      }
    });

    const passRate = enrollments.length > 0 ? ((totalPassed / enrollments.length) * 100).toFixed(1) : "0";

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME PRUEBA FINAL DE MÓDULO", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de alumnos: ${enrollments.length}`, 14, startY + 10);
    doc.text(`Alumnos que superan la prueba final: ${totalPassed} (${passRate}%)`, 14, startY + 17);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const userScores = userBestScores[e.user_id] || {};
      const scores = Object.values(userScores);
      const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
      const allPassed = evaluations?.every((eval_) => userScores[eval_.id]?.passed) || false;
      
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        avgScore.toFixed(1) + "%",
        allPassed ? "APTO" : "NO APTO",
        scores.length > 0 ? Math.max(...scores.map(s => s.convocatoria)).toString() + "ª" : "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 25,
      head: [["DNI", "Nombre", "Puntuación", "Estado", "Convocatoria"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });
  };

  // 8. Informe de Evaluación (30% + 70%)
  const generateEvaluationReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);
    const enrollmentIds = enrollments.map((e) => e.id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get activity grades (30%)
    const { data: submissions } = await supabase
      .from("activity_submissions")
      .select("user_id, score, status")
      .in("enrollment_id", enrollmentIds)
      .eq("status", "graded");

    // Get evaluation grades (70%)
    const { data: attempts } = await supabase
      .from("evaluation_attempts")
      .select("user_id, score, status")
      .in("user_id", userIds)
      .eq("status", "completed");

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Calculate weighted grades
    const userGrades: Record<string, { 
      learningAvg: number; 
      finalAvg: number; 
      weightedTotal: number;
      passed: boolean;
      convocatoria: number;
    }> = {};

    // Learning grades (30%)
    const learningScores: Record<string, number[]> = {};
    submissions?.forEach((s) => {
      if (s.score !== null) {
        if (!learningScores[s.user_id]) learningScores[s.user_id] = [];
        learningScores[s.user_id].push(s.score);
      }
    });

    // Final grades (70%)
    const finalScores: Record<string, number[]> = {};
    attempts?.forEach((a) => {
      if (a.score !== null) {
        if (!finalScores[a.user_id]) finalScores[a.user_id] = [];
        finalScores[a.user_id].push(a.score);
      }
    });

    enrollments.forEach((e) => {
      const learning = learningScores[e.user_id] || [];
      const final = finalScores[e.user_id] || [];
      
      const learningAvg = learning.length > 0 ? learning.reduce((a, b) => a + b, 0) / learning.length : 0;
      const finalAvg = final.length > 0 ? final.reduce((a, b) => a + b, 0) / final.length : 0;
      
      // Weighted: 30% learning + 70% final
      const weightedTotal = (learningAvg * 0.3) + (finalAvg * 0.7);
      
      userGrades[e.user_id] = {
        learningAvg,
        finalAvg,
        weightedTotal,
        passed: finalAvg >= 50 && weightedTotal >= 50, // Must pass final with ≥5 and have weighted ≥5
        convocatoria: final.length > 0 ? 1 : 0,
      };
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE EVALUACIÓN - PUNTUACIÓN FINAL PONDERADA", 14, startY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Ponderación: 30% Evaluación durante el aprendizaje + 70% Prueba final", 14, startY + 10);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const grades = userGrades[e.user_id] || { learningAvg: 0, finalAvg: 0, weightedTotal: 0, passed: false, convocatoria: 0 };
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        grades.learningAvg.toFixed(1) + "%",
        grades.finalAvg.toFixed(1) + "%",
        grades.weightedTotal.toFixed(1) + "%",
        grades.passed ? "APTO" : "NO APTO",
        grades.convocatoria > 0 ? grades.convocatoria + "ª" : "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 18,
      head: [["DNI", "Nombre", "Aprendizaje (30%)", "Final (70%)", "Puntuación Final", "Estado", "Convocatoria"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
    });
  };

  // 9. Informe Alumnos Aptos (Formación)
  const generatePassedStudentsReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, progress_percentage, completed_at")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    // Get modules
    const { data: modules } = await supabase
      .from("modules")
      .select("id, title")
      .eq("course_id", filters.courseId)
      .order("order_index");

    // Get module progress
    const enrollmentIds = enrollments.map((e) => e.id);
    const { data: moduleProgress } = await supabase
      .from("module_progress")
      .select("enrollment_id, module_id, completed")
      .in("enrollment_id", enrollmentIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    const enrollmentMap = new Map(enrollments.map((e) => [e.id, e.user_id]));

    // Calculate module completion per user
    const userModules: Record<string, Record<string, boolean>> = {};
    moduleProgress?.forEach((mp) => {
      const userId = enrollmentMap.get(mp.enrollment_id);
      if (userId) {
        if (!userModules[userId]) userModules[userId] = {};
        userModules[userId][mp.module_id] = mp.completed || false;
      }
    });

    // Statistics per module
    const moduleStats = modules?.map((m) => {
      const passed = Object.values(userModules).filter((um) => um[m.id]).length;
      return { 
        title: m.title, 
        passed, 
        percentage: enrollments.length > 0 ? ((passed / enrollments.length) * 100).toFixed(1) : "0" 
      };
    }) || [];

    // Total course completion
    const completedCourse = enrollments.filter((e) => e.completed_at || e.progress_percentage === 100).length;
    const courseCompletionRate = enrollments.length > 0 ? ((completedCourse / enrollments.length) * 100).toFixed(1) : "0";

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME ALUMNOS APTOS - FORMACIÓN", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de alumnos: ${enrollments.length}`, 14, startY + 10);
    doc.text(`Alumnos que completan la acción formativa: ${completedCourse} (${courseCompletionRate}%)`, 14, startY + 17);

    // Module breakdown table
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Superación por Módulo", 14, startY + 30);

    const moduleTableData = moduleStats.map((m) => [
      m.title.substring(0, 60),
      m.passed.toString(),
      m.percentage + "%",
    ]);

    autoTable(doc, {
      startY: startY + 35,
      head: [["Módulo", "Alumnos Aptos", "Porcentaje"]],
      body: moduleTableData,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });

    // Individual student status
    const studentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Estado Individual del Alumnado", 14, studentY);

    const studentTableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      const modulesCompleted = Object.values(userModules[e.user_id] || {}).filter(Boolean).length;
      const totalModules = modules?.length || 0;
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        `${modulesCompleted}/${totalModules}`,
        e.completed_at ? "APTO" : "EN CURSO",
      ];
    });

    autoTable(doc, {
      startY: studentY + 5,
      head: [["DNI", "Nombre", "Módulos Superados", "Estado"]],
      body: studentTableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });
  };

  // 10. Informe Alumnos Aptos (Prácticas)
  const generatePracticePassedReport = async (doc: jsPDF, startY: number) => {
    // This would typically come from a dedicated practices/internships table
    // For now, we'll show a placeholder structure
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME ALUMNOS APTOS - MÓDULO DE PRÁCTICAS (FCT)", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Este informe incluye el seguimiento del módulo de formación práctica en centros de trabajo.", 14, startY + 10);

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, completed_at")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY + 25);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // For now, show enrollment data (in a real system this would come from an internships table)
    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        "-", // Company
        "-", // Hours
        e.completed_at ? "APTO" : "PENDIENTE",
      ];
    });

    autoTable(doc, {
      startY: startY + 20,
      head: [["DNI", "Nombre", "Centro de Trabajo", "Horas Realizadas", "Estado"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });

    const noteY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Nota: El módulo de prácticas requiere configuración específica del convenio con empresas.", 14, noteY);
  };

  // 11. Informe Detallado Alumnos (Perfil)
  const generateDetailedStudentsReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, enrolled_at")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie, phone, address, province, city")
      .in("id", userIds);

    // Get employment data from separate table
    const { data: employmentData } = await supabase
      .from("student_employment_data")
      .select("user_id, employment_status, education_level")
      .in("user_id", userIds);

    const employmentMap = new Map(employmentData?.map((e) => [e.user_id, e]) || []);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DETALLADO DEL PERFIL DEL ALUMNADO", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de alumnos: ${enrollments.length}`, 14, startY + 10);

    const tableData = profiles?.map((p) => {
      const employment = employmentMap.get(p.id);
      return [
        p.dni_nie || "-",
        p.full_name || "Sin nombre",
        "-", // Gender not in profiles
        "-", // Age not in profiles
        employment?.education_level || "-",
        employment?.employment_status || "-",
        p.province || p.city || "-",
      ];
    }) || [];

    autoTable(doc, {
      startY: startY + 18,
      head: [["DNI", "Nombre", "Sexo", "Edad", "Nivel Formativo", "Situación Laboral", "Provincia"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 12 },
        3: { cellWidth: 12 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
      },
    });
  };

  // 12. Informe Alta/Baja Alumnos
  const generateEnrollmentChangesReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, enrolled_at, completed_at")
      .eq("course_id", filters.courseId)
      .order("enrolled_at", { ascending: true });

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE ALTAS, MODIFICACIONES Y BAJAS", 14, startY);

    const tableData = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      return [
        profile?.dni_nie || "",
        profile?.full_name || "Sin nombre",
        "ALTA",
        e.enrolled_at ? format(new Date(e.enrolled_at), "dd/MM/yyyy") : "-",
        e.completed_at ? "Completado" : "Activo",
      ];
    });

    autoTable(doc, {
      startY: startY + 10,
      head: [["DNI", "Nombre", "Tipo", "Fecha", "Estado Actual"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });

    // Summary
    const summaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen", 14, summaryY);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de altas: ${enrollments.length}`, 14, summaryY + 7);
    doc.text(`Alumnos activos: ${enrollments.filter((e) => !e.completed_at).length}`, 14, summaryY + 14);
    doc.text(`Alumnos que completaron: ${enrollments.filter((e) => e.completed_at).length}`, 14, summaryY + 21);
  };

  // 13. Informe Alumnos Iniciados, Completados y Abandonos
  const generateCompletionReport = async (doc: jsPDF, startY: number) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, user_id, enrolled_at, completed_at, progress_percentage, last_accessed_at")
      .eq("course_id", filters.courseId);

    if (!enrollments?.length) {
      doc.text("No hay datos de alumnos para este curso", 14, startY);
      return;
    }

    const userIds = enrollments.map((e) => e.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, dni_nie")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Classify students
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let initiated = 0;
    let completed = 0;
    let abandoned = 0;
    let active = 0;

    const studentStatus = enrollments.map((e) => {
      const profile = profileMap.get(e.user_id);
      let status = "Iniciado";
      let cause = "-";
      
      initiated++;

      if (e.completed_at || e.progress_percentage === 100) {
        status = "Completado";
        completed++;
      } else if (e.last_accessed_at && new Date(e.last_accessed_at) < thirtyDaysAgo && (e.progress_percentage || 0) < 100) {
        status = "Abandono";
        abandoned++;
        cause = "Inactividad >30 días";
      } else {
        status = "Activo";
        active++;
      }

      return {
        dni: profile?.dni_nie || "",
        name: profile?.full_name || "Sin nombre",
        status,
        progress: e.progress_percentage || 0,
        lastAccess: e.last_accessed_at,
        cause,
      };
    });

    const total = enrollments.length;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE ALUMNOS INICIADOS, COMPLETADOS Y ABANDONOS", 14, startY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total matriculados: ${total}`, 14, startY + 10);
    doc.text(`Alumnos que inician: ${initiated} (100%)`, 14, startY + 17);
    doc.text(`Alumnos que completan: ${completed} (${((completed / total) * 100).toFixed(1)}%)`, 14, startY + 24);
    doc.text(`Alumnos activos: ${active} (${((active / total) * 100).toFixed(1)}%)`, 14, startY + 31);
    doc.text(`Alumnos que abandonan: ${abandoned} (${((abandoned / total) * 100).toFixed(1)}%)`, 14, startY + 38);

    const tableData = studentStatus.map((s) => [
      s.dni,
      s.name,
      s.status,
      s.progress + "%",
      s.lastAccess ? format(new Date(s.lastAccess), "dd/MM/yyyy") : "-",
      s.cause,
    ]);

    autoTable(doc, {
      startY: startY + 48,
      head: [["DNI", "Nombre", "Estado", "Progreso", "Último Acceso", "Causa Baja"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection - Grouped by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Tipo de Informe</CardTitle>
          <CardDescription>
            Elige el tipo de informe SEPE que deseas generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {Object.entries(groupedReports).map(([category, reports]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {reports.map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedReport === type.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary" 
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedReport(type.id)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-start gap-3">
                          <type.icon
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              selectedReport === type.id ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm truncate">{type.name}</CardTitle>
                              {selectedReport === type.id && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-xs mt-1 line-clamp-2">
                              {type.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuración del Informe
          </CardTitle>
          <CardDescription>
            Selecciona los filtros para generar el informe
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
            <Button onClick={generatePDF} disabled={loading || !filters.courseId} size="lg">
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
