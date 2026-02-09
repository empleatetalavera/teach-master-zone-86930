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
}: CourseCertificateDownloadProps) {
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
        const verificationCode = generateVerificationCode();
        const { data: newCert, error } = await supabase.from("certificates").insert({
          user_id: user!.id,
          course_id: courseId,
          enrollment_id: (await supabase.from("enrollments").select("id").eq("user_id", user!.id).eq("course_id", courseId).single()).data!.id,
          verification_code: verificationCode,
          student_name: profile?.full_name || "Estudiante",
          student_dni: profile?.dni_nie || null,
          course_title: courseTitle,
          course_hours: durationHours,
        }).select().single();
        if (error) {
          if (error.code === "23505") {
            const { data: existing } = await supabase.from("certificates").select("*").eq("user_id", user!.id).eq("course_id", courseId).single();
            cert = existing as IssuedCertificate;
          } else throw error;
        } else {
          cert = newCert as IssuedCertificate;
        }
        setIssuedCert(cert);
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

    // PAGE 1: DIPLOMA (matching uploaded template exactly)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    // Watermark - large faded logo in center-right
    const watermarkData = await loadImageAsDataUrl("/branding/grupo-arma-watermark.jpg");
    if (watermarkData) {
      pdf.saveGraphicsState();
      pdf.setGState(new (pdf as any).GState({ opacity: 0.08 }));
      pdf.addImage(watermarkData, "JPEG", W * 0.25, H * 0.15, W * 0.55, H * 0.7);
      pdf.restoreGraphicsState();
    }

    // Top-left: Center logo (Grupo Arma)
    const logoData = await loadImageAsDataUrl(branding.centerLogo);
    if (logoData) pdf.addImage(logoData, "PNG", 15, 10, 55, 28);

    // Top-right: CFC SNS logo
    const cfcBadge = await loadImageAsDataUrl("/branding/cfc-clm-badge.png");
    if (cfcBadge) pdf.addImage(cfcBadge, "PNG", W - 45, 10, 30, 35);

    // Student name
    let y = 55;
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    const nameText = `D./Dña. "${cert.student_name.toUpperCase()}"`;
    pdf.text(nameText, W / 2, y, { align: "center" });

    // "Ha asistido al Curso"
    y += 12;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text("Ha asistido al Curso", W / 2, y, { align: "center" });

    // Course title - large, bold, blue
    y += 14;
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(0, 100, 180);
    const titleLines = pdf.splitTextToSize(`"${courseTitle}"`, W - 80);
    pdf.text(titleLines, W / 2, y, { align: "center" });

    // Expediente
    y += titleLines.length * 8 + 10;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(40, 40, 40);
    const expediente = courseCode || "(Número de expediente/ Registro de Acreditación)";
    pdf.text(expediente, W / 2, y, { align: "center" });

    // Accreditation text
    y += 12;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    const part1 = "Actividad ";
    const part1b = "Acreditada por la Comisión de Formación Continuada de Castilla- La Mancha del Sistema de Acreditación de la Formación";
    const part2 = "Continuada de las profesiones sanitarias";
    const part2b = " en el Sistema Nacional de Salud con ";
    const credits = "XX,X";
    const part2c = " créditos";
    
    // Line 1
    pdf.setFont("helvetica", "normal");
    pdf.text(part1, W / 2 - pdf.getTextWidth(part1 + part1b) / 2, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(part1b, W / 2 - pdf.getTextWidth(part1 + part1b) / 2 + pdf.getTextWidth(part1), y);
    
    // Line 2
    y += 6;
    const line2Full = part2 + part2b + credits + part2c;
    const line2X = W / 2 - pdf.getTextWidth(line2Full) / 2;
    pdf.setFont("helvetica", "bold");
    pdf.text(part2, line2X, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(part2b, line2X + pdf.getTextWidth(part2), y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 100, 180);
    pdf.text(credits, line2X + pdf.getTextWidth(part2 + part2b), y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text(part2c, line2X + pdf.getTextWidth(part2 + part2b + credits), y);

    // Celebration line
    y += 14;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(40, 40, 40);
    const mod = modality || "a distancia en su caso";
    const sd = startDate ? format(new Date(startDate), "dd/MM/yyyy") : "fecha de inicio";
    const ed = endDate ? format(new Date(endDate), "dd/MM/yyyy") : "fecha de finalización";
    
    const celebText = `Celebrado en "`;
    const celebMod = mod;
    const celebMid = `", del "`;
    const celebEnd = `"`;
    
    pdf.setFont("helvetica", "normal");
    const fullCeleb = celebText + celebMod + celebMid + sd + `" a "` + ed + celebEnd;
    const celebX = W / 2 - pdf.getTextWidth(fullCeleb) / 2;
    pdf.text(celebText, celebX, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(celebMod, celebX + pdf.getTextWidth(celebText), y);
    pdf.setFont("helvetica", "normal");
    pdf.text(celebMid, celebX + pdf.getTextWidth(celebText + celebMod), y);
    pdf.setFont("helvetica", "bold");
    pdf.text(sd, celebX + pdf.getTextWidth(celebText + celebMod + celebMid), y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`" a "`, celebX + pdf.getTextWidth(celebText + celebMod + celebMid + sd), y);
    pdf.setFont("helvetica", "bold");
    pdf.text(ed, celebX + pdf.getTextWidth(celebText + celebMod + celebMid + sd + `" a "`), y);
    pdf.setFont("helvetica", "normal");
    pdf.text(celebEnd, celebX + pdf.getTextWidth(celebText + celebMod + celebMid + sd + `" a "` + ed), y);

    // Place and date of issue
    y += 12;
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(40, 40, 40);
    const issueDate = format(new Date(cert.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es });
    const placeDate = `"Talavera de la Reina", "${issueDate}"`;
    const placeDateX = W / 2 - pdf.getTextWidth(placeDate) / 2;
    pdf.setFont("helvetica", "normal");
    pdf.text(`"`, placeDateX, y);
    pdf.setFont("helvetica", "bold");
    pdf.text("Talavera de la Reina", placeDateX + pdf.getTextWidth(`"`), y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`", "`, placeDateX + pdf.getTextWidth(`"Talavera de la Reina`), y);
    pdf.setFont("helvetica", "bold");
    pdf.text(issueDate, placeDateX + pdf.getTextWidth(`"Talavera de la Reina", "`), y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`"`, placeDateX + pdf.getTextWidth(`"Talavera de la Reina", "` + issueDate), y);

    // "Responsable de la entidad proveedora"
    y += 12;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 100, 180);
    pdf.text("Responsable de la entidad proveedora o en quien delegue", W / 2, y, { align: "center" });

    // Bottom section: stamp + signatures
    const bottomY = H - 45;

    // Stamp image (bottom-left)
    const stampData = await loadImageAsDataUrl("/branding/grupo-arma-stamp.jpg");
    if (stampData) pdf.addImage(stampData, "JPEG", 20, bottomY - 5, 55, 28);

    // Left signature line
    pdf.setDrawColor(100, 100, 100);
    pdf.line(20, bottomY + 25, 90, bottomY + 25);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text("Fdo. M.ª del Coral Gómez Corrochano", 55, bottomY + 30, { align: "center" });
    pdf.setFont("helvetica", "bold");
    pdf.text("Directora Grupo Arma Formación", 55, bottomY + 35, { align: "center" });

    // Center: "Alumno" signature line
    const centerSigX = W / 2;
    pdf.line(centerSigX - 35, bottomY + 25, centerSigX + 35, bottomY + 25);
    pdf.setFont("helvetica", "normal");
    pdf.text("Alumno", centerSigX, bottomY + 30, { align: "center" });

    // Footer: Registro Mercantil text
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "italic");
    pdf.text(
      "Inscrita en el Registro Mercantil de Toledo, al Tomo 334, Folio 196, Sección General del Libro de Sociedades, Hoja número TO-2073, inscripción 1ª.",
      W / 2, H - 5, { align: "center" }
    );

    // QR Code + verification (bottom-left corner, small)
    const verifyUrl = `${window.location.origin}/verificar-diploma/${cert.verification_code}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 });
    pdf.addImage(qrDataUrl, "PNG", W - 45, bottomY + 10, 18, 18);
    pdf.setFontSize(5);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`CSV: ${cert.verification_code}`, W - 36, bottomY + 30, { align: "center" });

    // PAGE 2: MODULES
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, W, H, "F");

    if (logoData) pdf.addImage(logoData, "PNG", 18, 10, 40, 20);

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 100, 180);
    pdf.text("Contenido del Curso", W / 2, 25, { align: "center" });

    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont("helvetica", "normal");
    pdf.text(`"${courseTitle}"`, W / 2, 33, { align: "center" });

    // Fetch modules
    const { data: courseModules } = await supabase.from("modules").select("title, duration_minutes").eq("course_id", courseId).eq("is_active", true).order("order_index");

    let my = 45;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(0, 100, 180);
    pdf.rect(20, my, W - 40, 8, "F");
    pdf.text("Módulo / Unidad Formativa", 25, my + 5.5);
    pdf.text("Horas", W - 35, my + 5.5, { align: "center" });

    my += 10;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);

    (courseModules || []).forEach((mod, i) => {
      if (my > H - 30) {
        pdf.addPage();
        my = 20;
      }
      const bgColor = i % 2 === 0 ? 245 : 255;
      pdf.setFillColor(bgColor, bgColor, bgColor);
      pdf.rect(20, my, W - 40, 7, "F");
      pdf.setFontSize(8);
      const title = pdf.splitTextToSize(mod.title, W - 80);
      pdf.text(title[0], 25, my + 5);
      const hours = mod.duration_minutes ? (mod.duration_minutes / 60).toFixed(1) : "—";
      pdf.text(hours, W - 35, my + 5, { align: "center" });
      my += 7;
    });

    my += 10;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Duración total: ${durationHours} horas`, W / 2, my, { align: "center" });

    // Footer
    pdf.setFontSize(6);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Verificación: ${verifyUrl}`, W / 2, H - 8, { align: "center" });

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
