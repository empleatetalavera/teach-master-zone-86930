import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Download, Trash2, Loader2, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface Annex {
  id: string;
  annex_type: string;
  file_name: string;
  file_path: string;
  file_size?: number;
}

interface CourseAnnexesUploaderProps {
  courseId: string;
  isEditable?: boolean;
}

const annexConfig = [
  {
    type: "anexo_iii",
    title: "Anexo III",
    subtitle: "Planificación Didáctica",
    description: "Secuenciación temporal de módulos y unidades formativas",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600"
  },
  {
    type: "anexo_iv",
    title: "Anexo IV",
    subtitle: "Programación Didáctica",
    description: "Contenidos, objetivos y criterios de evaluación por unidad formativa",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600"
  },
  {
    type: "anexo_v",
    title: "Anexo V",
    subtitle: "Guía de Aprendizaje",
    description: "Instrucciones metodológicas y orientaciones para el alumno",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-600"
  }
];

export function CourseAnnexesUploader({ courseId, isEditable = false }: CourseAnnexesUploaderProps) {
  const [annexes, setAnnexes] = useState<Annex[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnexes();
  }, [courseId]);

  const fetchAnnexes = async () => {
    try {
      const { data, error } = await supabase
        .from("course_annexes")
        .select("*")
        .eq("course_id", courseId);

      if (error) throw error;
      setAnnexes(data || []);
    } catch (error) {
      console.error("Error fetching annexes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (annexType: string, file: File) => {
    if (!file || !user) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos PDF",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(annexType);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${annexType}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("course-annexes")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("course-annexes")
        .getPublicUrl(fileName);

      // Check if annex already exists
      const existingAnnex = annexes.find(a => a.annex_type === annexType);

      if (existingAnnex) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("course_annexes")
          .update({
            file_name: file.name,
            file_path: urlData.publicUrl,
            file_size: file.size,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingAnnex.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("course_annexes")
          .insert({
            course_id: courseId,
            annex_type: annexType,
            file_name: file.name,
            file_path: urlData.publicUrl,
            file_size: file.size,
            uploaded_by: user.id
          });

        if (insertError) throw insertError;
      }

      await fetchAnnexes();

      toast({
        title: "Archivo subido",
        description: `${annexConfig.find(a => a.type === annexType)?.title} subido correctamente`
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error al subir",
        description: error.message || "No se pudo subir el archivo",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (annexType: string) => {
    const annex = annexes.find(a => a.annex_type === annexType);
    if (!annex) return;

    setDeleting(annexType);

    try {
      // Delete from storage
      const fileName = `${courseId}/${annexType}.pdf`;
      await supabase.storage.from("course-annexes").remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from("course_annexes")
        .delete()
        .eq("id", annex.id);

      if (error) throw error;

      await fetchAnnexes();

      toast({
        title: "Archivo eliminado",
        description: `${annexConfig.find(a => a.type === annexType)?.title} eliminado correctamente`
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el archivo",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const getAnnexByType = (type: string) => annexes.find(a => a.annex_type === type);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">9. Documentación Oficial - Anexos III, IV y V</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {annexConfig.map((config) => {
          const annex = getAnnexByType(config.type);
          const isUploading = uploading === config.type;
          const isDeleting = deleting === config.type;

          return (
            <div
              key={config.type}
              className="border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                  <FileText className={`h-5 w-5 ${config.textColor}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{config.title}</h4>
                  <p className="text-xs text-muted-foreground">{config.subtitle}</p>
                </div>
                {annex && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {config.description}
              </p>

              {annex ? (
                <div className="space-y-2">
                  <a
                    href={annex.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Download className="h-3 w-3" />
                    <span className="truncate">{annex.file_name}</span>
                  </a>

                  {isEditable && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => fileInputRefs.current[config.type]?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Upload className="h-3 w-3 mr-1" />
                        )}
                        Reemplazar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDelete(config.type)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {isEditable ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => fileInputRefs.current[config.type]?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" />
                          Subir PDF
                        </>
                      )}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Documento no disponible
                    </p>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                ref={(el) => (fileInputRefs.current[config.type] = el)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUpload(config.type, file);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Estos documentos están disponibles según la Orden TMS/369/2019 para acreditación de especialidades formativas
        </p>
      </div>
    </section>
  );
}
