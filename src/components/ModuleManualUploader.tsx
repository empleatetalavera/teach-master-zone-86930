import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, FileText, Trash2, Eye, Link2, Plus, Loader2, 
  ExternalLink, BookOpen, Download, Sparkles, X
} from "lucide-react";

interface ModuleContent {
  id: string;
  module_id: string;
  content_type: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  embed_url: string | null;
  external_url: string | null;
  order_index: number;
}

interface ModuleManualUploaderProps {
  moduleId: string;
  moduleTitle: string;
  formativeUnitId?: string;
  courseId?: string;
}

export function ModuleManualUploader({ moduleId, moduleTitle, formativeUnitId, courseId }: ModuleManualUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [manuals, setManuals] = useState<ModuleContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewManualId, setPreviewManualId] = useState<string | null>(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatingFullContent, setGeneratingFullContent] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    embed_url: "",
    external_url: ""
  });

  useEffect(() => {
    loadManuals();
  }, [moduleId, formativeUnitId]);

  const loadManuals = async () => {
    try {
      let query = supabase
        .from("module_content")
        .select("*")
        .eq("module_id", moduleId)
        .eq("content_type", "manual_pdf")
        .order("order_index");

      if (formativeUnitId) {
        query = query.eq("formative_unit_id", formativeUnitId);
      } else {
        query = query.is("formative_unit_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setManuals(data || []);
    } catch (error) {
      console.error("Error loading manuals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Error", description: "Solo se permiten archivos PDF", variant: "destructive" });
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      toast({ title: "Error", description: "El archivo no debe superar 250MB", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: file.name.replace(".pdf", "") }));
    }
  };

  const handleUpload = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      let filePath = null;
      let fileName = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const uniqueFileName = `${moduleId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("module-content")
          .upload(uniqueFileName, selectedFile);

        if (uploadError) throw uploadError;

        filePath = uniqueFileName;
        fileName = selectedFile.name;
      }

      const maxOrder = manuals.length > 0 ? Math.max(...manuals.map(m => m.order_index)) : 0;

      const { error: insertError } = await supabase
        .from("module_content")
        .insert({
          module_id: moduleId,
          content_type: "manual_pdf",
          title: formData.title,
          description: formData.description || null,
          file_path: filePath,
          file_name: fileName,
          embed_url: formData.embed_url || null,
          external_url: formData.external_url || null,
          order_index: maxOrder + 1,
          formative_unit_id: formativeUnitId || null
        } as any);

      if (insertError) throw insertError;

      toast({ title: "Éxito", description: "Manual añadido correctamente" });
      setDialogOpen(false);
      resetForm();
      loadManuals();
    } catch (error: any) {
      console.error("Error uploading manual:", error);
      toast({ title: "Error", description: "Error al subir el manual", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (manual: ModuleContent) => {
    if (!confirm("¿Estás seguro de eliminar este manual?")) return;

    try {
      if (manual.file_path) {
        await supabase.storage.from("module-content").remove([manual.file_path]);
      }

      const { error } = await supabase
        .from("module_content")
        .delete()
        .eq("id", manual.id);

      if (error) throw error;

      if (previewManualId === manual.id) {
        setPreviewUrl(null);
        setPreviewManualId(null);
      }

      toast({ title: "Éxito", description: "Manual eliminado" });
      loadManuals();
    } catch (error) {
      toast({ title: "Error", description: "Error al eliminar el manual", variant: "destructive" });
    }
  };

  const getFileUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from("module-content")
        .createSignedUrl(filePath, 3600);
      if (!data?.signedUrl) return null;
      
      // Fetch as blob to avoid ERR_BLOCKED_BY_CLIENT
      const response = await fetch(data.signedUrl);
      if (!response.ok) return null;
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  };

  const handlePreviewPdf = async (manual: ModuleContent) => {
    if (previewManualId === manual.id) {
      setPreviewUrl(null);
      setPreviewManualId(null);
      return;
    }

    if (manual.embed_url) {
      setPreviewUrl(manual.embed_url);
      setPreviewManualId(manual.id);
      return;
    }
    if (manual.external_url) {
      setPreviewUrl(manual.external_url);
      setPreviewManualId(manual.id);
      return;
    }
    if (manual.file_path) {
      const url = await getFileUrl(manual.file_path);
      if (url) {
        setPreviewUrl(url);
        setPreviewManualId(manual.id);
      } else {
        toast({ title: "Error", description: "No se pudo obtener el archivo", variant: "destructive" });
      }
    }
  };

  const handleDownload = async (manual: ModuleContent) => {
    if (!manual.file_path) {
      toast({ title: "Info", description: "Este manual es un enlace externo", variant: "default" });
      return;
    }

    const url = await getFileUrl(manual.file_path);
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = manual.file_name || "manual.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!courseId || !formativeUnitId) {
      toast({ title: "Error", description: "Faltan datos del curso o unidad", variant: "destructive" });
      return;
    }

    setGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-unit-questions", {
        body: {
          courseId,
          formativeUnitId,
          formativeUnitTitle: moduleTitle,
          numberOfQuestions: 15,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      toast({
        title: "¡Preguntas generadas!",
        description: `Se han creado ${data.questionCount} preguntas de autoevaluación para esta unidad.`,
      });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast({ title: "Error", description: "Error al generar preguntas", variant: "destructive" });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({ title: "", description: "", embed_url: "", external_url: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Manuales y Documentación PDF
        </h4>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Plus className="h-3 w-3" />
              Añadir Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Añadir Manual PDF</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Manual del Módulo MF1442_3"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción breve del contenido"
                />
              </div>
              <div className="space-y-2">
                <Label>Archivo PDF (opcional si usas enlace externo)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    selectedFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Arrastra o haz clic para subir</p>
                      <p className="text-xs text-muted-foreground">PDF hasta 250MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Link2 className="h-3 w-3" />URL de Calameo/Issuu</Label>
                <Input value={formData.embed_url} onChange={(e) => setFormData(prev => ({ ...prev, embed_url: e.target.value }))} placeholder="https://www.calameo.com/read/..." />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />URL externa del PDF</Label>
                <Input value={formData.external_url} onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {manuals.length === 0 ? (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 text-center border border-dashed">
          No hay manuales añadidos. Sube el manual PDF para que los estudiantes puedan visualizarlo.
        </div>
      ) : (
        <div className="space-y-2">
          {manuals.map((manual) => (
            <div key={manual.id}>
              <Card className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{manual.title}</p>
                      {manual.description && <p className="text-xs text-muted-foreground">{manual.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {manual.file_path && <span className="text-xs text-muted-foreground">📎 Archivo subido</span>}
                        {manual.embed_url && <span className="text-xs text-blue-600">🔗 Calameo/Issuu</span>}
                        {manual.external_url && !manual.embed_url && <span className="text-xs text-green-600">🌐 Enlace externo</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreviewPdf(manual)} title="Previsualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {manual.file_path && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(manual)} title="Descargar">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(manual)} title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Inline PDF Preview */}
              {previewManualId === manual.id && previewUrl && (
                <div className="mt-2 border rounded-lg overflow-hidden relative">
                  <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
                    <span className="text-xs font-medium">Previsualización: {manual.title}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setPreviewUrl(null); setPreviewManualId(null); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <iframe
                    src={previewUrl}
                    className="w-full h-[500px]"
                    title={`Preview ${manual.title}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate Questions Button */}
      {manuals.length > 0 && formativeUnitId && courseId && (
        <div className="pt-2 border-t">
          <Button
            onClick={handleGenerateQuestions}
            disabled={generatingQuestions}
            variant="outline"
            className="w-full gap-2 border-amber-300 hover:bg-amber-50 text-amber-700"
          >
            {generatingQuestions ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generatingQuestions ? "Generando 15 preguntas con IA..." : "Generar 15 preguntas de autoevaluación con IA"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Genera automáticamente un test de 15 preguntas basado en el contenido de esta unidad
          </p>
        </div>
      )}
    </div>
  );
}
