import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Download,
  Calendar,
  CheckCircle,
  Trophy,
  FileSpreadsheet,
  Lock,
  Clock,
  BookOpen,
  ClipboardList,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getCurrentBranding } from "@/lib/branding";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CourseForCert {
  id: string;
  course_id: string;
  enrollment_id: string;
  completed_at: string | null;
  progress_percentage: number;
  courses: {
    title: string;
    description: string;
    category: string;
    level: string;
    duration_hours: number;
    course_code: string | null;
    start_date: string | null;
    end_date: string | null;
    modality: string | null;
    training_center_id: string | null;
    course_type: string | null;
  };
}

interface CompletionStatus {
  contentComplete: boolean;
  contentPercent: number;
  activitiesComplete: boolean;
  activitiesDone: number;
  activitiesTotal: number;
  examsComplete: boolean;
  examsPassed: number;
  examsTotal: number;
  surveysComplete: boolean;
  timeRequirementMet: boolean;
  timeSpentMinutes: number;
  timeRequiredMinutes: number;
  allRequirementsMet: boolean;
}

interface IssuedCertificate {
  id: string;
  verification_code: string;
  student_name: string;
  student_dni: string | null;
  course_title: string;
  course_hours: number;
  issue_date: string;
  course_id: string;
}

const StudentCertificates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<CourseForCert[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<string, CompletionStatus>>({});
  const [issuedCerts, setIssuedCerts] = useState<Record<string, IssuedCertificate>>({});
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const branding = getCurrentBranding();
  const [centerDataMap, setCenterDataMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get all enrollments
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select(`
          id, course_id, completed_at, progress_percentage,
          courses (title, description, category, level, duration_hours, course_code, start_date, end_date, modality, training_center_id, course_type)
        `)
        .eq("user_id", user!.id)
        .order("enrolled_at", { ascending: false });

      const enrolls = (enrollmentData || []) as any[];
      setEnrollments(enrolls.map((e: any) => ({ ...e, enrollment_id: e.id })));

      // Load center data for each unique training_center_id
      const centerIds = [...new Set(enrolls.map((e: any) => e.courses?.training_center_id).filter(Boolean))] as string[];
      if (centerIds.length > 0) {
        const { data: centers } = await supabase
          .from('training_centers')
          .select('id, name, cif, address, city, contact_email, contact_phone, logo_url, representative_name, representative_position')
          .in('id', centerIds);
        const cMap: Record<string, any> = {};
        (centers || []).forEach((c: any) => { cMap[c.id] = c; });
        setCenterDataMap(cMap);
      }

      // Check completion status for each enrollment
      const statusMap: Record<string, CompletionStatus> = {};
      for (const enrollment of enrolls) {
        statusMap[enrollment.course_id] = await checkCompletion(enrollment.id, enrollment.course_id, enrollment.courses.duration_hours);
      }
      setCompletionMap(statusMap);

      // Load already issued certificates
      const { data: certs } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user!.id);

      const certMap: Record<string, IssuedCertificate> = {};
      (certs || []).forEach((c: any) => {
        certMap[c.course_id] = c;
      });
      setIssuedCerts(certMap);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletion = async (
    enrollmentId: string,
    courseId: string,
    durationHours: number
  ): Promise<CompletionStatus> => {
    // 1. Content progress (100% required)
    const { data: moduleProgress } = await supabase
      .from("module_progress")
      .select("completed")
      .eq("enrollment_id", enrollmentId);

    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .eq("is_active", true);

    const totalModules = modules?.length || 1;
    const completedModules = moduleProgress?.filter((m) => m.completed).length || 0;
    const contentPercent = Math.round((completedModules / totalModules) * 100);

    // 2. Activities (all must be submitted & graded)
    const { data: activities } = await supabase
      .from("development_activities")
      .select("id")
      .eq("course_id", courseId)
      .eq("is_active", true);

    const { data: submissions } = await supabase
      .from("activity_submissions")
      .select("activity_id, status")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "graded");

    const activitiesTotal = activities?.length || 0;
    const activitiesDone = submissions?.length || 0;

    // 3. Exams (all must be passed with ≥70%)
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("id, passing_score")
      .eq("course_id", courseId)
      .eq("is_active", true);

    const { data: attempts } = await supabase
      .from("evaluation_attempts")
      .select("evaluation_id, score, status")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "completed");

    const examsTotal = evaluations?.length || 0;
    let examsPassed = 0;
    evaluations?.forEach((ev) => {
      const best = attempts
        ?.filter((a) => a.evaluation_id === ev.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
      if (best && (best.score || 0) >= (ev.passing_score || 70)) examsPassed++;
    });

    // 4. Time on platform (90% of total hours)
    const { data: sessions } = await supabase
      .from("content_interactions")
      .select("time_spent_seconds")
      .eq("enrollment_id", enrollmentId);

    const timeSpentMinutes = Math.round(
      (sessions || []).reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / 60
    );
    const timeRequiredMinutes = Math.round(durationHours * 60 * 0.9);

    // 5. Surveys - check if quality survey notification was read (simplified check)
    const surveysComplete = true; // Will be enhanced when survey system is built

    const contentComplete = contentPercent >= 100;
    const activitiesComplete = activitiesTotal === 0 || activitiesDone >= activitiesTotal;
    const examsComplete = examsTotal === 0 || examsPassed >= examsTotal;
    const timeRequirementMet = timeSpentMinutes >= timeRequiredMinutes;

    return {
      contentComplete,
      contentPercent,
      activitiesComplete,
      activitiesDone,
      activitiesTotal,
      examsComplete,
      examsPassed,
      examsTotal,
      surveysComplete,
      timeRequirementMet,
      timeSpentMinutes,
      timeRequiredMinutes,
      allRequirementsMet:
        contentComplete && activitiesComplete && examsComplete && timeRequirementMet && surveysComplete,
    };
  };

  const generateVerificationCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "CSV-";
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const issueCertificate = async (enrollment: CourseForCert): Promise<IssuedCertificate> => {
    // Check if already issued
    if (issuedCerts[enrollment.course_id]) {
      return issuedCerts[enrollment.course_id];
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, dni_nie")
      .eq("id", user!.id)
      .single();

    const verificationCode = generateVerificationCode();

    const { data: cert, error } = await supabase
      .from("certificates")
      .insert({
        user_id: user!.id,
        course_id: enrollment.course_id,
        enrollment_id: enrollment.enrollment_id,
        verification_code: verificationCode,
        student_name: profile?.full_name || "Estudiante",
        student_dni: profile?.dni_nie || null,
        course_title: enrollment.courses.title,
        course_hours: enrollment.courses.duration_hours,
      })
      .select()
      .single();

    if (error) throw error;

    const issued = cert as IssuedCertificate;
    setIssuedCerts((prev) => ({ ...prev, [enrollment.course_id]: issued }));
    return issued;
  };

  const handleDownload = async (enrollment: CourseForCert) => {
    try {
      setGeneratingPdf(enrollment.course_id);
      toast.info("Generando diploma...");

      const cert = await issueCertificate(enrollment);
      await generatePDF(enrollment, cert);

      toast.success("Diploma generado correctamente");
    } catch (error: any) {
      console.error("Error:", error);
      if (error?.code === "23505") {
        // Duplicate - certificate already exists, reload
        await loadData();
        const existing = issuedCerts[enrollment.course_id];
        if (existing) await generatePDF(enrollment, existing);
      } else {
        toast.error("Error al generar el diploma");
      }
    } finally {
      setGeneratingPdf(null);
    }
  };

  const loadImageAsDataUrl = async (src: string): Promise<string | null> => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 3000);
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  };

  const generatePDF = async (enrollment: CourseForCert, cert: IssuedCertificate) => {
    const centerId = enrollment.courses.training_center_id;
    const cd = centerId ? centerDataMap[centerId] : null;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // ===== PAGE 1: DIPLOMA =====
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    // Top-left logo (center logo)
    const logoSrc = cd?.logo_url || branding.centerLogo;
    const logoData = await loadImageAsDataUrl(logoSrc);
    if (logoData) pdf.addImage(logoData, "PNG", 18, 15, 50, 25);

    // Top-right CFC/SNS logo (only for CFC courses)
    if (enrollment.courses.course_type !== 'propio') {
      const cfcLogo = await loadImageAsDataUrl("/branding/cfc-sns-logo.png");
      if (cfcLogo) pdf.addImage(cfcLogo, "PNG", W - 55, 15, 35, 25);
    }

    // Student name
    let y = 55;
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("D./Dña.", W / 2 - 40, y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 100, 180);
    pdf.text(cert.student_name.toUpperCase(), W / 2 + 5, y);

    // "Ha asistido al Curso"
    y += 14;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Ha asistido al Curso", W / 2, y, { align: "center" });

    // Course title
    y += 14;
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(0, 100, 180);
    const titleLines = pdf.splitTextToSize(`"${enrollment.courses.title}"`, W - 60);
    pdf.text(titleLines, W / 2, y, { align: "center" });

    // Expedition number
    y += titleLines.length * 8 + 8;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(60, 60, 60);
    const expediente = enrollment.courses.course_code || "(Número de expediente/ Registro de Acreditación)";
    pdf.text(expediente, W / 2, y, { align: "center" });

    // Accreditation text (only for CFC courses)
    if (enrollment.courses.course_type !== 'propio') {
      y += 12;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(40, 40, 40);
      const accrText = "Actividad Acreditada por la Comisión de Formación Continuada de Castilla-La Mancha del Sistema de Acreditación de la Formación Continuada de las profesiones sanitarias en el Sistema Nacional de Salud con XX,X créditos";
      const accrLines = pdf.splitTextToSize(accrText, W - 50);
      pdf.text(accrLines, W / 2, y, { align: "center" });
      // Bold key parts
      y += accrLines.length * 5;
    }

    // Location and dates
    y += 8;
    const modality = enrollment.courses.modality || "a distancia";
    const startDate = enrollment.courses.start_date
      ? format(new Date(enrollment.courses.start_date), "dd/MM/yyyy")
      : "fecha de inicio";
    const endDate = enrollment.courses.end_date
      ? format(new Date(enrollment.courses.end_date), "dd/MM/yyyy")
      : "fecha de finalización";
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(60, 60, 60);
    const locationText = `Celebrado en "${modality}", del "${startDate}" a "${endDate}"`;
    pdf.text(locationText, W / 2, y, { align: "center" });

    // Issue date and place
    y += 10;
    const issueDate = format(new Date(cert.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es });
    pdf.text(`${cd?.city || 'Talavera de la Reina'}, ${issueDate}`, W / 2, y, { align: "center" });

    // Watermark (center background text - light)
    const centerNameUp = (cd?.name || branding.centerName || "").toUpperCase();
    pdf.setFontSize(60);
    pdf.setTextColor(240, 240, 240);
    pdf.setFont("helvetica", "bold");
    pdf.text(centerNameUp, W / 2, H / 2 + 15, { align: "center" });

    // Signature area - left (director)
    const sigY = H - 45;
    pdf.setDrawColor(60, 60, 60);
    pdf.setLineWidth(0.3);
    pdf.line(30, sigY, 110, sigY);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Fdo. ${cd?.representative_name || 'Responsable del Centro'}`, 70, sigY + 5, { align: "center" });
    pdf.text(`${cd?.representative_position || 'Director/a'} ${cd?.name || branding.centerName}`, 70, sigY + 10, { align: "center" });

    // Signature area - right (student)
    pdf.line(W - 110, sigY, W - 30, sigY);
    pdf.text("Alumno", W - 70, sigY + 5, { align: "center" });

    // Company stamp area (bottom left)
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(cd?.name || branding.centerName, 30, H - 25);
    pdf.text(`CIF: ${cd?.cif || ''}`, 30, H - 21);
    pdf.text(`${cd?.address || ''}, ${cd?.city || ''}`, 30, H - 17);
    pdf.text(`${cd?.contact_phone || ''} | ${cd?.contact_email || ''}`, 30, H - 13);

    // Footer
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${cd?.name || branding.centerName} - Documento oficial`, W / 2, H - 6, { align: "center" });

    // QR Code (bottom right, discrete)
    try {
      const verifyUrl = `${window.location.origin}/verificar-diploma/${cert.verification_code}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 150, margin: 1,
        color: { dark: "#1a365d", light: "#ffffff" },
      });
      pdf.addImage(qrDataUrl, "PNG", W - 48, H - 40, 20, 20);
      pdf.setFontSize(6);
      pdf.setTextColor(120, 120, 120);
      pdf.text("Verificar diploma", W - 38, H - 18, { align: "center" });
    } catch { /* skip */ }

    // CSV code
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(26, 54, 93);
    pdf.text(`CSV: ${cert.verification_code}`, W - 48, H - 12);

    // ===== PAGE 2: MODULES / CONTENIDO =====
    // Fetch modules for this course
    const { data: modules } = await supabase
      .from("modules")
      .select("title, description, duration_minutes, order_index")
      .eq("course_id", enrollment.course_id)
      .eq("is_active", true)
      .order("order_index");

    if (modules && modules.length > 0) {
      pdf.addPage("a4", "landscape");

      // Header
      if (logoData) pdf.addImage(logoData, "PNG", 18, 12, 40, 20);

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 54, 93);
      pdf.text("CONTENIDO DE LA ACCIÓN FORMATIVA", W / 2, 25, { align: "center" });

      pdf.setDrawColor(180, 160, 100);
      pdf.setLineWidth(0.8);
      pdf.line(40, 30, W - 40, 30);

      // Course info
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(40, 40, 40);
      pdf.text(enrollment.courses.title, W / 2, 40, { align: "center" });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Duración total: ${enrollment.courses.duration_hours} horas`, W / 2, 48, { align: "center" });

      // Modules table
      let tableY = 58;
      // Header row
      pdf.setFillColor(26, 54, 93);
      pdf.rect(25, tableY, W - 50, 8, "F");
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("Nº", 30, tableY + 6);
      pdf.text("Módulo / Unidad Formativa", 45, tableY + 6);
      pdf.text("Horas", W - 45, tableY + 6);
      tableY += 8;

      pdf.setFont("helvetica", "normal");
      modules.forEach((mod, idx) => {
        const isEven = idx % 2 === 0;
        if (isEven) {
          pdf.setFillColor(245, 245, 250);
          pdf.rect(25, tableY, W - 50, 10, "F");
        }

        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(9);
        pdf.text(`${idx + 1}`, 32, tableY + 7);

        const modTitle = pdf.splitTextToSize(mod.title, W - 120);
        pdf.text(modTitle[0], 45, tableY + 7);

        const hours = mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : "-";
        pdf.text(`${hours}`, W - 42, tableY + 7);

        tableY += 10;

        // Add page if needed
        if (tableY > H - 30) {
          pdf.addPage("a4", "landscape");
          tableY = 20;
        }
      });

      // Student info footer on page 2
      tableY += 10;
      pdf.setDrawColor(180, 160, 100);
      pdf.setLineWidth(0.5);
      pdf.line(25, tableY, W - 25, tableY);
      tableY += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Alumno/a: ${cert.student_name}`, 30, tableY);
      if (cert.student_dni) pdf.text(`DNI/NIE: ${cert.student_dni}`, W / 2, tableY);
      pdf.text(`CSV: ${cert.verification_code}`, W - 80, tableY);
    }

    pdf.save(`diploma_${enrollment.courses.title.replace(/\s+/g, "_").substring(0, 40)}.pdf`);
  };

  const exportToCSV = () => {
    const csvData = [
      ["Curso", "Duración", "Estado", "Código Verificación", "Fecha Emisión"],
      ...enrollments.map((e) => {
        const cert = issuedCerts[e.course_id];
        const status = completionMap[e.course_id];
        return [
          e.courses.title,
          `${e.courses.duration_hours}h`,
          status?.allRequirementsMet ? "Disponible" : "Bloqueado",
          cert?.verification_code || "-",
          cert ? format(new Date(cert.issue_date), "dd/MM/yyyy") : "-",
        ];
      }),
    ];
    const blob = new Blob(["\ufeff" + csvData.map((r) => r.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `diplomas_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
    toast.success("CSV exportado");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const issuedCount = Object.keys(issuedCerts).length;
  const totalHours = Object.values(issuedCerts).reduce((s, c) => s + (c.course_hours || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Diplomas</h1>
          <p className="text-muted-foreground">
            Descarga tus diplomas acreditativos con código seguro de verificación
          </p>
        </div>
        {enrollments.length > 0 && (
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Diplomas Emitidos</p>
          <p className="text-3xl font-bold">{issuedCount}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Horas Certificadas</p>
          <p className="text-3xl font-bold">{totalHours}h</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Verificación</p>
          <p className="text-sm font-medium">
            Cada diploma incluye un código CSV y QR para comprobar su autenticidad
          </p>
        </Card>
      </div>

      {/* Enrollment list */}
      <div className="space-y-4">
        {enrollments.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tienes cursos matriculados</h3>
            <p className="text-muted-foreground">Matricúlate en un curso para obtener tu diploma</p>
          </Card>
        ) : (
          enrollments.map((enrollment) => {
            const status = completionMap[enrollment.course_id];
            const cert = issuedCerts[enrollment.course_id];
            const unlocked = status?.allRequirementsMet;

            return (
              <Card
                key={enrollment.enrollment_id}
                className={`p-6 transition-all ${unlocked ? "border-green-500/30 hover:shadow-lg" : "opacity-80"}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        unlocked
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-muted"
                      }`}
                    >
                      {unlocked ? (
                        <Award className="w-7 h-7 text-green-600" />
                      ) : (
                        <Lock className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">{enrollment.courses.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.courses.duration_hours} horas •{" "}
                          {enrollment.courses.category || "Formación"}
                        </p>
                      </div>

                      {/* Requirements checklist */}
                      {status && (
                        <div className="grid sm:grid-cols-2 gap-2">
                          <RequirementItem
                            icon={<BookOpen className="h-4 w-4" />}
                            label={`Contenido: ${status.contentPercent}%`}
                            met={status.contentComplete}
                          />
                          <RequirementItem
                            icon={<ClipboardList className="h-4 w-4" />}
                            label={`Actividades: ${status.activitiesDone}/${status.activitiesTotal}`}
                            met={status.activitiesComplete}
                          />
                          <RequirementItem
                            icon={<CheckCircle className="h-4 w-4" />}
                            label={`Exámenes: ${status.examsPassed}/${status.examsTotal}`}
                            met={status.examsComplete}
                          />
                          <RequirementItem
                            icon={<Clock className="h-4 w-4" />}
                            label={`Tiempo: ${status.timeSpentMinutes}/${status.timeRequiredMinutes} min`}
                            met={status.timeRequirementMet}
                          />
                        </div>
                      )}

                      {cert && (
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">CSV:</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {cert.verification_code}
                          </Badge>
                          <span className="text-muted-foreground">•</span>
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(cert.issue_date), "dd/MM/yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download button */}
                  <div>
                    <Button
                      onClick={() => handleDownload(enrollment)}
                      disabled={!unlocked || generatingPdf === enrollment.course_id}
                      className="gap-2"
                      variant={unlocked ? "default" : "secondary"}
                    >
                      {generatingPdf === enrollment.course_id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : unlocked ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {unlocked ? "Descargar Diploma" : "Bloqueado"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const RequirementItem = ({
  icon,
  label,
  met,
}: {
  icon: React.ReactNode;
  label: string;
  met: boolean;
}) => (
  <div className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
    {met ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
    {icon}
    <span>{label}</span>
  </div>
);

export default StudentCertificates;
