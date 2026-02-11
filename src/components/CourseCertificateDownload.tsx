import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Download,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  ClipboardList,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getCurrentBranding } from "@/lib/branding";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CourseCertificateDownloadProps {
  courseId: string;
  courseTitle: string;
  durationHours: number;
  courseCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  modality?: string | null;
  trainingCenterId?: string | null;
  courseType?: string | null;
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
  _enrolledAt?: string | null;
  _completedAt?: string | null;
}

function RequirementItem({ icon, label, met }: { icon: React.ReactNode; label: string; met: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${met ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-muted/50 border-border"}`}>
      <div className={met ? "text-green-600" : "text-muted-foreground"}>{icon}</div>
      <span className={`text-sm flex-1 ${met ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}`}>{label}</span>
      {met ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
    </div>
  );
}

export function CourseCertificateDownload({
  courseId,
  courseTitle,
  durationHours,
  courseCode,
  startDate,
  endDate,
  modality,
  trainingCenterId,
  courseType,
}: CourseCertificateDownloadProps) {
  const isPropio = courseType === 'propio';
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CompletionStatus | null>(null);
  const [issuedCert, setIssuedCert] = useState<IssuedCertificate | null>(null);
  const [generating, setGenerating] = useState(false);
  const branding = getCurrentBranding();
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';

  useEffect(() => {
    if (user && courseId) loadStatus();
  }, [user, courseId]);

  const handleDemoDownload = async () => {
    try {
      setGenerating(true);
      toast.info("Generando diploma de muestra...");
      const demoCert: IssuedCertificate = {
        id: "demo",
        verification_code: "DEMO-PREVIEW",
        student_name: "NOMBRE DEL ALUMNO (MUESTRA)",
        student_dni: "00000000X",
        course_title: courseTitle,
        course_hours: durationHours,
        issue_date: new Date().toISOString(),
        course_id: courseId,
      };
      await generatePDF(demoCert);
      toast.success("Diploma de muestra generado");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar el diploma de muestra");
    } finally {
      setGenerating(false);
    }
  };

  const loadStatus = async () => {
    try {
      setLoading(true);

      // Get enrollment
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user!.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (!enrollment) {
        setLoading(false);
        return;
      }

      // Check completion
      const completionStatus = await checkCompletion(enrollment.id, courseId, durationHours);
      setStatus(completionStatus);

      // Check if certificate already issued
      const { data: cert } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (cert) setIssuedCert(cert as IssuedCertificate);
    } catch (error) {
      console.error("Error loading certificate status:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletion = async (enrollmentId: string, cId: string, hours: number): Promise<CompletionStatus> => {
    const { data: moduleProgress } = await supabase.from("module_progress").select("completed").eq("enrollment_id", enrollmentId);
    const { data: modules } = await supabase.from("modules").select("id").eq("course_id", cId).eq("is_active", true);
    const totalModules = modules?.length || 1;
    const completedModules = moduleProgress?.filter((m) => m.completed).length || 0;
    const contentPercent = Math.round((completedModules / totalModules) * 100);

    const { data: activities } = await supabase.from("development_activities").select("id").eq("course_id", cId).eq("is_active", true);
    const { data: submissions } = await supabase.from("activity_submissions").select("activity_id, status").eq("enrollment_id", enrollmentId).eq("status", "graded");
    const activitiesTotal = activities?.length || 0;
    const activitiesDone = submissions?.length || 0;

    const { data: evaluations } = await supabase.from("evaluations").select("id, passing_score").eq("course_id", cId).eq("is_active", true);
    const { data: attempts } = await supabase.from("evaluation_attempts").select("evaluation_id, score, status").eq("enrollment_id", enrollmentId).eq("status", "completed");
    const examsTotal = evaluations?.length || 0;
    let examsPassed = 0;
    evaluations?.forEach((ev) => {
      const best = attempts?.filter((a) => a.evaluation_id === ev.id).sort((a, b) => (b.score || 0) - (a.score || 0))[0];
      if (best && (best.score || 0) >= (ev.passing_score || 70)) examsPassed++;
    });

    const { data: sessions } = await supabase.from("content_interactions").select("time_spent_seconds").eq("enrollment_id", enrollmentId);
    const timeSpentMinutes = Math.round((sessions || []).reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / 60);
    const timeRequiredMinutes = Math.round(hours * 60 * 0.9);

    const contentComplete = contentPercent >= 100;
    const activitiesComplete = activitiesTotal === 0 || activitiesDone >= activitiesTotal;
    const examsComplete = examsTotal === 0 || examsPassed >= examsTotal;
    const timeRequirementMet = timeSpentMinutes >= timeRequiredMinutes;

    return {
      contentComplete, contentPercent, activitiesComplete, activitiesDone, activitiesTotal,
      examsComplete, examsPassed, examsTotal, timeRequirementMet, timeSpentMinutes, timeRequiredMinutes,
      allRequirementsMet: contentComplete && activitiesComplete && examsComplete && timeRequirementMet,
    };
  };

  const generateVerificationCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "CSV-";
    for (let i = 0; i < 10; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const loadImageAsDataUrl = async (src: string): Promise<string | null> => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; setTimeout(reject, 3000); });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch { return null; }
  };

  const handleDownload = async () => {
    if (!status?.allRequirementsMet) return;
    try {
      setGenerating(true);
      toast.info("Generando diploma...");

      let cert = issuedCert;
      if (!cert) {
        const { data: profile } = await supabase.from("profiles").select("full_name, dni_nie").eq("id", user!.id).single();
        const { data: enrollment } = await supabase.from("enrollments").select("id, enrolled_at, completed_at").eq("user_id", user!.id).eq("course_id", courseId).single();
        const verificationCode = generateVerificationCode();
        const { data: newCert, error } = await supabase.from("certificates").insert({
          user_id: user!.id,
          course_id: courseId,
          enrollment_id: enrollment!.id,
          verification_code: verificationCode,
          student_name: profile?.full_name || "Estudiante",
          student_dni: profile?.dni_nie || null,
          course_title: courseTitle,
          course_hours: durationHours,
        }).select().single();
        if (error) {
          if (error.code === "23505") {
            const { data: existing } = await supabase.from("certificates").select("*").eq("user_id", user!.id).eq("course_id", courseId).single();
            cert = { ...(existing as IssuedCertificate), _enrolledAt: enrollment?.enrolled_at, _completedAt: enrollment?.completed_at };
          } else throw error;
        } else {
          cert = { ...(newCert as IssuedCertificate), _enrolledAt: enrollment?.enrolled_at, _completedAt: enrollment?.completed_at };
        }
        setIssuedCert(cert);
      } else {
        // Fetch enrollment dates for existing cert
        const { data: enrollment } = await supabase.from("enrollments").select("enrolled_at, completed_at").eq("user_id", user!.id).eq("course_id", courseId).maybeSingle();
        cert = { ...cert, _enrolledAt: enrollment?.enrolled_at, _completedAt: enrollment?.completed_at };
      }

      await generatePDF(cert!);
      toast.success("Diploma generado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar el diploma");
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = async (cert: IssuedCertificate) => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // PAGE 1: DIPLOMA — exact replica of Grupo Arma CFC template
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    // Watermark - large faded Grupo Arma logo covering center-right area
    const watermarkData = await loadImageAsDataUrl("/branding/grupo-arma-watermark.jpg");
    if (watermarkData) {
      pdf.saveGraphicsState();
      pdf.setGState(new (pdf as any).GState({ opacity: 0.12 }));
      // Position: covers roughly right 60% of page, vertically centered
      pdf.addImage(watermarkData, "JPEG", W * 0.22, H * 0.18, W * 0.65, H * 0.68);
      pdf.restoreGraphicsState();
    }

    // Top-left: Grupo Arma Formación logo (birrete azul)
    const logoData = await loadImageAsDataUrl("/branding/grupo-arma-logo.png");
    if (logoData) pdf.addImage(logoData, "JPEG", 12, 8, 45, 22);

    // Student name - centered
    let y = 48;
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text(`D./Dña. `, W / 2 - pdf.getTextWidth(`D./Dña. "${cert.student_name}"`) / 2, y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 100, 180);
    pdf.text(`"${cert.student_name}"`, W / 2 - pdf.getTextWidth(`D./Dña. "${cert.student_name}"`) / 2 + pdf.getTextWidth("D./Dña. "), y);

    // "Ha asistido al Curso"
    y += 12;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text("Ha asistido al Curso", W / 2, y, { align: "center" });

    // Course title - large, bold italic, blue, in quotes
    y += 14;
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(0, 100, 180);
    const titleLines = pdf.splitTextToSize(`\u201C${courseTitle}\u201D`, W - 80);
    pdf.text(titleLines, W / 2, y, { align: "center" });

    // Expediente / Registro de Acreditación
    y += titleLines.length * 8 + 10;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(40, 40, 40);
    const expediente = courseCode || "(Número de expediente/ Registro de Acreditación)";
    pdf.text(expediente, W / 2, y, { align: "center" });

    // Accreditation text - two lines with mixed bold (only for CFC courses)
    if (!isPropio) {
      y += 14;
      pdf.setFontSize(10);
      // Line 1
      const a1 = "Actividad ";
      const a1b = "Acreditada por la Comisión de Formación Continuada de Castilla- La Mancha del Sistema de Acreditación de la Formación";
      const line1W = pdf.getTextWidth(a1 + a1b);
      const line1X = W / 2 - line1W / 2;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(40, 40, 40);
      pdf.text(a1, line1X, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(a1b, line1X + pdf.getTextWidth(a1), y);

      // Line 2
      y += 6;
      const a2 = "Continuada de las profesiones sanitarias";
      const a2b = " en el Sistema Nacional de Salud con ";
      const a2c = "XX,X";
      const a2d = " créditos";
      const line2Full = a2 + a2b + a2c + a2d;
      const line2X = W / 2 - pdf.getTextWidth(line2Full) / 2;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(40, 40, 40);
      pdf.text(a2, line2X, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(a2b, line2X + pdf.getTextWidth(a2), y);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 100, 180);
      pdf.text(a2c, line2X + pdf.getTextWidth(a2 + a2b), y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(40, 40, 40);
      pdf.text(a2d, line2X + pdf.getTextWidth(a2 + a2b + a2c), y);
    }

    // "Celebrado en..." line with bold dynamic parts
    y += 14;
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    const mod = "Mixta";
    const sd = cert._enrolledAt ? format(new Date(cert._enrolledAt), "dd/MM/yyyy") : (startDate ? format(new Date(startDate), "dd/MM/yyyy") : "fecha de inicio");
    const ed = cert._completedAt ? format(new Date(cert._completedAt), "dd/MM/yyyy") : (endDate ? format(new Date(endDate), "dd/MM/yyyy") : "fecha de finalización");

    const c1 = `Celebrado en \u201C`;
    const c2 = mod;
    const c3 = `\u201D, del \u201C`;
    const c4 = sd;
    const c5 = `\u201D a \u201C`;
    const c6 = ed;
    const c7 = `\u201D`;
    const celebFull = c1 + c2 + c3 + c4 + c5 + c6 + c7;
    const celebX = W / 2 - pdf.getTextWidth(celebFull) / 2;

    pdf.setFont("helvetica", "normal");
    pdf.text(c1, celebX, y);
    let cx = celebX + pdf.getTextWidth(c1);
    pdf.setFont("helvetica", "bold");
    pdf.text(c2, cx, y); cx += pdf.getTextWidth(c2);
    pdf.setFont("helvetica", "normal");
    pdf.text(c3, cx, y); cx += pdf.getTextWidth(c3);
    pdf.setFont("helvetica", "bold");
    pdf.text(c4, cx, y); cx += pdf.getTextWidth(c4);
    pdf.setFont("helvetica", "normal");
    pdf.text(c5, cx, y); cx += pdf.getTextWidth(c5);
    pdf.setFont("helvetica", "bold");
    pdf.text(c6, cx, y); cx += pdf.getTextWidth(c6);
    pdf.setFont("helvetica", "normal");
    pdf.text(c7, cx, y);

    // "Lugar", "Fecha de expedición"
    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    const issueDate = format(new Date(cert.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es });
    const p1 = `\u201C`;
    const p2 = "Talavera de la Reina";
    const p3 = `\u201D, \u201C`;
    const p4 = issueDate;
    const p5 = `\u201D`;
    const placeFull = p1 + p2 + p3 + p4 + p5;
    const placeX = W / 2 - pdf.getTextWidth(placeFull) / 2;
    pdf.text(p1, placeX, y);
    let px = placeX + pdf.getTextWidth(p1);
    pdf.setFont("helvetica", "bold");
    pdf.text(p2, px, y); px += pdf.getTextWidth(p2);
    pdf.setFont("helvetica", "normal");
    pdf.text(p3, px, y); px += pdf.getTextWidth(p3);
    pdf.setFont("helvetica", "bold");
    pdf.text(p4, px, y); px += pdf.getTextWidth(p4);
    pdf.setFont("helvetica", "normal");
    pdf.text(p5, px, y);

    // "Responsable de la entidad proveedora o en quien delegue"
    y += 14;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 100, 180);
    pdf.text("Responsable de la entidad proveedora o en quien delegue", W / 2, y, { align: "center" });

    // ===== BOTTOM SECTION =====
    const bottomY = H - 50;

    // Bottom-left: Digital signature badge (official seal style)
    const sigX = 18;
    const sigY = bottomY - 6;
    const sigW = 72;
    const sigH = 32;
    
    // Outer border - double line effect
    pdf.setDrawColor(0, 70, 140);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(sigX, sigY, sigW, sigH, 2, 2, "S");
    pdf.setLineWidth(0.3);
    pdf.roundedRect(sigX + 1.5, sigY + 1.5, sigW - 3, sigH - 3, 1.5, 1.5, "S");
    
    // Header bar
    pdf.setFillColor(0, 80, 160);
    pdf.rect(sigX + 1.5, sigY + 1.5, sigW - 3, 7, "F");
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("FIRMADO DIGITALMENTE", sigX + sigW / 2, sigY + 6, { align: "center" });
    
    // Signer info
    pdf.setFontSize(6);
    pdf.setTextColor(30, 30, 30);
    pdf.setFont("helvetica", "bold");
    pdf.text("Fdo: M.ª del Coral Gómez Corrochano", sigX + sigW / 2, sigY + 13, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.5);
    pdf.text("Directora - Grupo Arma Formación S.L.", sigX + sigW / 2, sigY + 17, { align: "center" });
    
    // Timestamp
    pdf.setFontSize(5);
    pdf.setTextColor(80, 80, 80);
    const sigTimestamp = format(new Date(), "dd/MM/yyyy HH:mm:ss");
    pdf.text(`Fecha: ${sigTimestamp} UTC`, sigX + sigW / 2, sigY + 21.5, { align: "center" });
    pdf.text(`CSV: ${cert.verification_code}`, sigX + sigW / 2, sigY + 25, { align: "center" });
    
    // Small lock icon indicator
    pdf.setFillColor(0, 150, 80);
    pdf.circle(sigX + 5, sigY + 28.5, 1.5, "F");
    pdf.setFontSize(4.5);
    pdf.setTextColor(0, 120, 60);
    pdf.text("Documento válido", sigX + 8, sigY + 29.5);

    if (!isPropio) {
      const cfcBadge = await loadImageAsDataUrl("/branding/cfc-sns-badge.png");
      if (cfcBadge) pdf.addImage(cfcBadge, "PNG", W - 48, bottomY - 8, 32, 38);
    }

    // Center: "Alumno" signature line
    const centerSigX = W / 2 + 10;
    pdf.setDrawColor(100, 100, 100);
    pdf.line(centerSigX - 35, bottomY + 26, centerSigX + 35, bottomY + 26);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Alumno", centerSigX, bottomY + 31, { align: "center" });

    // Footer: Registro Mercantil
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "italic");
    pdf.text(
      "Inscrita en el Registro Mercantil de Toledo, al Tomo 334, Folio 196, Sección General del Libro de Sociedades, Hoja número TO-2073, inscripción 1ª.",
      W / 2, H - 5, { align: "center" }
    );

    // QR Code + CSV verification
    const verifyUrl = `${window.location.origin}/verificar-diploma/${cert.verification_code}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 });
    pdf.addImage(qrDataUrl, "PNG", centerSigX + 45, bottomY + 10, 16, 16);
    pdf.setFontSize(5);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`CSV: ${cert.verification_code}`, centerSigX + 53, bottomY + 28, { align: "center" });

    // PAGE 2: REVERSO - Secretaría Técnica + Contenidos
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    // Watermark on reverso
    if (watermarkData) {
      pdf.saveGraphicsState();
      pdf.setGState(new (pdf as any).GState({ opacity: 0.08 }));
      pdf.addImage(watermarkData, "JPEG", W * 0.22, H * 0.18, W * 0.65, H * 0.68);
      pdf.restoreGraphicsState();
    }

    // CFC-CLM logo removed per request

    // Title block
    let ry = 32;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 80, 150);
    if (isPropio) {
      pdf.text("CONTENIDO DEL CURSO", W / 2, ry, { align: "center" });
      ry += 5.5;
    } else {
      pdf.text("SECRETARÍA TÉCNICA DE FORMACIÓN CONTINUADA", W / 2, ry, { align: "center" });
      ry += 5.5;
      pdf.text("DE LAS PROFESIONES SANITARIAS DE CASTILLA-LA MANCHA", W / 2, ry, { align: "center" });
    }

    // Separator
    ry += 6;
    pdf.setDrawColor(0, 100, 180);
    pdf.setLineWidth(0.4);
    pdf.line(30, ry, W - 30, ry);

    // Course details - compact two-column layout
    ry += 7;
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);

    const reversoSd = cert._enrolledAt ? format(new Date(cert._enrolledAt), "dd/MM/yyyy") : (startDate ? format(new Date(startDate), "dd/MM/yyyy") : "—");
    const reversoEd = cert._completedAt ? format(new Date(cert._completedAt), "dd/MM/yyyy") : (endDate ? format(new Date(endDate), "dd/MM/yyyy") : "—");

    const leftFields = [
      { label: "Expediente:", value: courseCode || "—" },
      { label: "Denominación:", value: courseTitle },
      { label: "Duración:", value: `${durationHours} horas` },
      { label: "Modalidad:", value: "Mixta" },
    ];
    const rightFields = [
      { label: "Fecha inicio:", value: reversoSd },
      { label: "Fecha fin:", value: reversoEd },
      { label: "Alumno/a:", value: cert.student_name },
      { label: "DNI/NIE:", value: cert.student_dni || "—" },
    ];

    let fieldY = ry;
    leftFields.forEach(({ label, value }) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(label, 30, fieldY);
      pdf.setFont("helvetica", "normal");
      const valText = pdf.splitTextToSize(value, 95);
      pdf.text(valText[0], 30 + pdf.getTextWidth(label) + 2, fieldY);
      fieldY += 5.5;
    });

    fieldY = ry;
    rightFields.forEach(({ label, value }) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(label, W / 2 + 10, fieldY);
      pdf.setFont("helvetica", "normal");
      pdf.text(value, W / 2 + 10 + pdf.getTextWidth(label) + 2, fieldY);
      fieldY += 5.5;
    });

    // Modules table
    ry = fieldY + 6;
    const { data: courseModules } = await supabase.from("modules").select("title, duration_minutes").eq("course_id", courseId).eq("is_active", true).order("order_index");

    // Table header
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(0, 80, 150);
    pdf.rect(25, ry, W - 50, 6, "F");
    pdf.text("Módulo / Unidad Formativa", 28, ry + 4.2);
    pdf.text("Horas", W - 38, ry + 4.2, { align: "center" });

    ry += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);

    (courseModules || []).forEach((m, i) => {
      if (ry > H - 25) {
        pdf.addPage();
        ry = 15;
      }
      const bgColor = i % 2 === 0 ? 245 : 255;
      pdf.setFillColor(bgColor, bgColor, bgColor);
      pdf.rect(25, ry, W - 50, 5.5, "F");
      pdf.setFontSize(7);
      const title = pdf.splitTextToSize(m.title, W - 90);
      pdf.text(title[0], 28, ry + 4);
      const hours = m.duration_minutes ? (m.duration_minutes / 60).toFixed(1) : "—";
      pdf.text(hours, W - 38, ry + 4, { align: "center" });
      ry += 5.5;
    });

    ry += 4;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Duración total: ${durationHours} horas`, W / 2, ry, { align: "center" });

    // Legal text
    ry += 8;
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100);
    const legalText = isPropio
      ? "Este documento acredita la realización y superación de la actividad formativa indicada."
      : "Este documento acredita la realización y superación de la actividad formativa indicada, acreditada por la Comisión de Formación Continuada de las Profesiones Sanitarias de Castilla-La Mancha.";
    const legalLines = pdf.splitTextToSize(legalText, W - 60);
    pdf.text(legalLines, W / 2, ry, { align: "center" });

    // Logos footer
    if (logoData) pdf.addImage(logoData, "PNG", 18, H - 20, 30, 14);
    if (!isPropio) {
      const cfcSnsBadge2 = await loadImageAsDataUrl("/branding/cfc-sns-badge.png");
      if (cfcSnsBadge2) pdf.addImage(cfcSnsBadge2, "PNG", W - 42, H - 22, 24, 18);
    }

    // Footer
    pdf.setFontSize(5);
    pdf.setTextColor(130, 130, 130);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Verificación: ${verifyUrl}`, W / 2, H - 4, { align: "center" });

    pdf.save(`Diploma_${courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    if (isAdmin) {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-xl">Diploma del Curso (Vista previa)</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Como administrador, puedes descargar una muestra del diploma para revisar el formato.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={handleDemoDownload} disabled={generating}>
              {generating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Download className="h-5 w-5 mr-2" />}
              Descargar Diploma de Muestra
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No se encontró matrícula para este curso.</p>
        </CardContent>
      </Card>
    );
  }

  const reqsMet = [status.contentComplete, status.activitiesComplete, status.examsComplete, status.timeRequirementMet].filter(Boolean).length;
  const totalReqs = 4;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl">Diploma del Curso</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Descarga tu diploma una vez completes todos los requisitos
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso de requisitos</span>
              <span className="font-medium">{reqsMet}/{totalReqs} completados</span>
            </div>
            <Progress value={(reqsMet / totalReqs) * 100} className="h-3" />
          </div>

          {/* Requirements list */}
          <div className="space-y-3">
            <RequirementItem
              icon={<BookOpen className="h-5 w-5" />}
              label={`Contenido completado: ${status.contentPercent}% (requiere 100%)`}
              met={status.contentComplete}
            />
            <RequirementItem
              icon={<ClipboardList className="h-5 w-5" />}
              label={`Actividades: ${status.activitiesDone}/${status.activitiesTotal} corregidas`}
              met={status.activitiesComplete}
            />
            <RequirementItem
              icon={<CheckCircle className="h-5 w-5" />}
              label={`Exámenes aprobados: ${status.examsPassed}/${status.examsTotal}`}
              met={status.examsComplete}
            />
            <RequirementItem
              icon={<Clock className="h-5 w-5" />}
              label={`Tiempo: ${status.timeSpentMinutes}/${status.timeRequiredMinutes} min (90% requerido)`}
              met={status.timeRequirementMet}
            />
          </div>

          {/* Download button */}
          {status.allRequirementsMet ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleDownload}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {issuedCert ? "Descargar Diploma" : "Generar y Descargar Diploma"}
            </Button>
          ) : (
            <div className="p-4 rounded-lg bg-muted text-center">
              <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Completa todos los requisitos para poder descargar tu diploma
              </p>
            </div>
          )}

          {/* Admin demo download */}
          {isAdmin && !status.allRequirementsMet && (
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={handleDemoDownload}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Download className="h-5 w-5 mr-2" />}
              Descargar Diploma de Muestra (Admin)
            </Button>
          )}

          {/* Already issued info */}
          {issuedCert && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <span className="text-green-700 dark:text-green-400 font-medium">Diploma emitido</span>
                <span className="text-green-600 dark:text-green-500 ml-2">
                  CSV: {issuedCert.verification_code}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
