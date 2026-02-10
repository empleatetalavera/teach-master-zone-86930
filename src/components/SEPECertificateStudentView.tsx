import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Clock, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface SEPECertificateStudentViewProps {
  courseId: string;
  enrollmentId: string;
}

export function SEPECertificateStudentView({ courseId, enrollmentId }: SEPECertificateStudentViewProps) {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadCerts();
  }, [user, courseId]);

  const loadCerts = async () => {
    try {
      const { data } = await supabase
        .from("sepe_certificates")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", courseId);
      setCerts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("sepe-certificates").download(filePath);
    if (error) { toast.error("Error al descargar"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  const theoryCert = certs.find(c => c.certificate_type === 'theory');
  const practiceCert = certs.find(c => c.certificate_type === 'practice');

  if (loading) return null;
  if (certs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="font-medium">Títulos SEPE pendientes</p>
          <p className="text-sm mt-1">Tu centro de formación subirá tus títulos oficiales una vez el SEPE los haya expedido.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Títulos Oficiales SEPE
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Descarga los títulos oficiales expedidos por el SEPE
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CertCard
          label="Título de Teoría"
          cert={theoryCert}
          onDownload={() => theoryCert && handleDownload(theoryCert.file_path, theoryCert.file_name)}
        />
        <CertCard
          label="Título de Prácticas"
          cert={practiceCert}
          onDownload={() => practiceCert && handleDownload(practiceCert.file_path, practiceCert.file_name)}
        />
      </CardContent>
    </Card>
  );
}

function CertCard({ label, cert, onDownload }: { label: string; cert: any; onDownload: () => void }) {
  if (!cert) {
    return (
      <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
        <Clock className="h-6 w-6 mx-auto mb-1 opacity-40" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs">Pendiente de expedición</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-green-600" />
        <p className="font-medium text-sm">{label}</p>
        <Badge className="bg-green-600 text-xs ml-auto">Disponible</Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{cert.file_name}</p>
      <Button size="sm" className="w-full gap-1" onClick={onDownload}>
        <Download className="h-4 w-4" /> Descargar
      </Button>
    </div>
  );
}
