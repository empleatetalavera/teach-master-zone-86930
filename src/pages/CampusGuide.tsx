import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCenterBranding } from "@/hooks/useCenterBranding";
import { generateCampusGuidePDF } from "@/lib/generateCampusGuidePDF";
import { useState } from "react";

export default function CampusGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const centerSlug = searchParams.get("center");
  const { branding, loading } = useCenterBranding(centerSlug);
  const [generating, setGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      await generateCampusGuidePDF({
        centerName: branding.centerName,
        centerLogo: branding.centerLogo,
        primaryColor: branding.primaryColor,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print-hidden header */}
      <div className="print:hidden sticky top-0 z-50 bg-background border-b p-4">
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            {branding.centerLogo && (
              <img src={branding.centerLogo} alt={branding.centerName} className="h-10 object-contain" />
            )}
            <span className="font-semibold text-lg hidden md:block">{branding.centerName}</span>
          </div>
          <Button onClick={handleDownloadPDF} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {generating ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </div>

      {/* PDF Preview Message */}
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Guía del Campus Virtual
          </h1>
          <p className="text-muted-foreground mb-6">
            Manual de Usuario para el Alumno - Campus Empleate
          </p>
          <p className="text-sm text-slate-600 mb-8">
            Este documento contiene toda la información necesaria para navegar y utilizar 
            el Campus Virtual, incluyendo requisitos técnicos, acceso a la plataforma, 
            estructura del curso, evaluaciones y comunicación con el tutor.
          </p>
          <Button size="lg" onClick={handleDownloadPDF} disabled={generating}>
            {generating ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            {generating ? 'Generando PDF...' : 'Descargar Guía en PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}
