import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  FileText, 
  Calendar,
  CheckCircle,
  Trophy,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { getCurrentBranding } from "@/lib/branding";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Certificate {
  id: string;
  course_id: string;
  enrollment_id: string;
  completed_at: string;
  final_score: number;
  courses: {
    title: string;
    description: string;
    category: string;
    level: string;
    duration_hours: number;
    objectives: string;
    specific_objectives: any;
  };
  modules?: Array<{
    title: string;
    description: string;
    duration_minutes: number;
  }>;
}

const StudentCertificates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const branding = getCurrentBranding();

  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    try {
      setLoading(true);

      // Get completed enrollments with course details
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          completed_at,
          progress_percentage,
          courses (
            title,
            description,
            category,
            level,
            duration_hours,
            objectives,
            specific_objectives
          )
        `)
        .eq("user_id", user?.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Get modules for each course
      const certsWithModules = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: modules } = await supabase
            .from("modules")
            .select("title, description, duration_minutes")
            .eq("course_id", enrollment.course_id)
            .eq("is_active", true)
            .order("order_index");

          // Calculate final score from evaluation attempts
          const { data: attempts } = await supabase
            .from("evaluation_attempts")
            .select("score")
            .eq("enrollment_id", enrollment.id)
            .eq("status", "completed");

          const avgScore = attempts && attempts.length > 0
            ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
            : 100;

          return {
            ...enrollment,
            enrollment_id: enrollment.id,
            modules: modules || [],
            final_score: Math.round(avgScore)
          };
        })
      );

      setCertificates(certsWithModules);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Error al cargar los certificados");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (certificateId: string) => {
    try {
      const verificationUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = [
        ["Fecha Emisión", "Curso", "Categoría", "Nivel", "Duración (horas)", "Calificación", "Estado"],
        ...certificates.map(cert => [
          format(new Date(cert.completed_at), "dd/MM/yyyy", { locale: es }),
          cert.courses.title,
          cert.courses.category || "N/A",
          cert.courses.level || "N/A",
          cert.courses.duration_hours?.toString() || "0",
          `${cert.final_score}%`,
          "Completado"
        ])
      ];

      const csvContent = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `certificados_${format(new Date(), "yyyyMMdd")}.csv`;
      link.click();

      toast.success("CSV exportado correctamente");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Error al exportar CSV");
    }
  };

  const generatePDF = async (certificate: Certificate) => {
    try {
      setGeneratingPdf(true);
      toast.info("Generando certificado...");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Background with gradient effect
      pdf.setFillColor(250, 250, 250);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Border
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(2);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Inner decorative border
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

      // Logo del centro de formación
      try {
        const logoImg = new Image();
        logoImg.src = branding.centerLogo;
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
        });
        const canvas = document.createElement("canvas");
        canvas.width = logoImg.width;
        canvas.height = logoImg.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(logoImg, 0, 0);
        const logoDataUrl = canvas.toDataURL("image/png");
        pdf.addImage(logoDataUrl, "PNG", 20, 20, 40, 20);
      } catch (error) {
        console.error("Error loading logo:", error);
      }

      // Logos SEPE
      try {
        const sepeImg = new Image();
        sepeImg.src = "/branding/sepe-logo.png";
        await new Promise((resolve) => {
          sepeImg.onload = resolve;
          sepeImg.onerror = resolve;
        });
        const canvas = document.createElement("canvas");
        canvas.width = sepeImg.width;
        canvas.height = sepeImg.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(sepeImg, 0, 0);
        const sepeDataUrl = canvas.toDataURL("image/png");
        pdf.addImage(sepeDataUrl, "PNG", pageWidth - 60, 20, 40, 20);
      } catch (error) {
        console.error("Error loading SEPE logo:", error);
      }

      // Title
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(52, 73, 94);
      pdf.text("CERTIFICADO DE FINALIZACIÓN", pageWidth / 2, 60, { align: "center" });

      // Subtitle
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.centerName, pageWidth / 2, 70, { align: "center" });
      
      // Certificate statement
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      pdf.text("Certifica que", pageWidth / 2, 85, { align: "center" });

      // Student name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();

      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(profile?.full_name || "Estudiante", pageWidth / 2, 100, { align: "center" });

      // Course completion text
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      pdf.text("ha completado satisfactoriamente el programa formativo", pageWidth / 2, 112, { align: "center" });

      // Course title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(52, 73, 94);
      const courseTitle = pdf.splitTextToSize(certificate.courses.title, pageWidth - 80);
      pdf.text(courseTitle, pageWidth / 2, 125, { align: "center" });

      // Course details
      let yPos = 140;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);

      if (certificate.courses.category) {
        pdf.text(`Categoría: ${certificate.courses.category}`, 40, yPos);
        yPos += 6;
      }

      if (certificate.courses.level) {
        pdf.text(`Nivel: ${certificate.courses.level}`, 40, yPos);
        yPos += 6;
      }

      pdf.text(`Duración: ${certificate.courses.duration_hours} horas`, 40, yPos);
      yPos += 6;
      pdf.text(`Calificación Final: ${certificate.final_score}%`, 40, yPos);
      yPos += 10;

      // Unidades de competencia (Módulos)
      if (certificate.modules && certificate.modules.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("Unidades de Competencia:", 40, yPos);
        yPos += 6;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        certificate.modules.slice(0, 4).forEach((module, index) => {
          const moduleText = `• ${module.title} (${module.duration_minutes} min)`;
          pdf.text(moduleText, 45, yPos);
          yPos += 5;
        });

        if (certificate.modules.length > 4) {
          pdf.text(`... y ${certificate.modules.length - 4} módulos más`, 45, yPos);
        }
      }

      // Date and location
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const dateText = `Fecha de emisión: ${format(new Date(certificate.completed_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}`;
      pdf.text(dateText, pageWidth / 2, pageHeight - 40, { align: "center" });

      // Generate QR Code
      const qrCode = await generateQRCode(certificate.enrollment_id);
      if (qrCode) {
        pdf.addImage(qrCode, "PNG", pageWidth - 50, pageHeight - 60, 30, 30);
        pdf.setFontSize(8);
        pdf.text("Verificar certificado", pageWidth - 35, pageHeight - 25, { align: "center" });
      }

      // Signature line
      pdf.setLineWidth(0.5);
      pdf.line(40, pageHeight - 30, 100, pageHeight - 30);
      pdf.setFontSize(9);
      pdf.text("Director/a del Centro", 70, pageHeight - 24, { align: "center" });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(branding.footer || "", pageWidth / 2, pageHeight - 15, { align: "center" });

      // Save PDF
      pdf.save(`certificado_${certificate.courses.title.replace(/\s+/g, "_")}.pdf`);
      toast.success("Certificado generado correctamente");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el certificado");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const levels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      "beginner": { label: "Básico", variant: "secondary" },
      "intermediate": { label: "Intermedio", variant: "default" },
      "advanced": { label: "Avanzado", variant: "outline" }
    };
    return levels[level] || { label: level, variant: "outline" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Certificados</h1>
          <p className="text-muted-foreground">Descarga y gestiona tus certificados de finalización</p>
        </div>
        {certificates.length > 0 && (
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Certificados</p>
          <p className="text-3xl font-bold">{certificates.length}</p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Horas Certificadas</p>
          <p className="text-3xl font-bold">
            {certificates.reduce((sum, cert) => sum + (cert.courses.duration_hours || 0), 0)}h
          </p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Calificación Media</p>
          <p className="text-3xl font-bold">
            {certificates.length > 0
              ? Math.round(certificates.reduce((sum, cert) => sum + cert.final_score, 0) / certificates.length)
              : 0}%
          </p>
        </Card>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tienes certificados aún</h3>
            <p className="text-muted-foreground mb-4">
              Completa tus cursos para obtener certificados oficiales
            </p>
          </Card>
        ) : (
          certificates.map((certificate) => {
            const levelBadge = getLevelBadge(certificate.courses.level || "");
            
            return (
              <Card key={certificate.id} className="p-6 border-border/50 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-6">
                  {/* Certificate Icon */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-8 h-8 text-primary-foreground" />
                    </div>

                    {/* Certificate Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{certificate.courses.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {certificate.courses.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {certificate.courses.category && (
                          <Badge variant="secondary">
                            {certificate.courses.category}
                          </Badge>
                        )}
                        <Badge variant={levelBadge.variant}>
                          {levelBadge.label}
                        </Badge>
                        <Badge variant="outline">
                          {certificate.courses.duration_hours}h
                        </Badge>
                        <Badge className="bg-green-500">
                          Calificación: {certificate.final_score}%
                        </Badge>
                      </div>

                      {/* Modules/Units */}
                      {certificate.modules && certificate.modules.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Unidades de Competencia:</p>
                          <div className="space-y-1">
                            {certificate.modules.slice(0, 3).map((module, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                {module.title}
                              </div>
                            ))}
                            {certificate.modules.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{certificate.modules.length - 3} unidades más
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Emitido el {format(new Date(certificate.completed_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => generatePDF(certificate)}
                      disabled={generatingPdf}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Hidden certificate template for rendering */}
      <div ref={certificateRef} style={{ position: "absolute", left: "-9999px" }} />
    </div>
  );
};

export default StudentCertificates;
