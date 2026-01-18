import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCenterBranding } from "@/hooks/useCenterBranding";
import CampusVirtualGuide from "@/components/CampusVirtualGuide";

export default function CampusGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const centerSlug = searchParams.get("center");
  const { branding, loading } = useCenterBranding(centerSlug);

  const handlePrint = () => {
    window.print();
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
          <Button onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Interactive Campus Virtual Guide */}
      <CampusVirtualGuide />
    </div>
  );
}
