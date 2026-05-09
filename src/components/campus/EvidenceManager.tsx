import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FolderUp, FileText, Trash2, Eye, Download, Loader2, Paperclip, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB por evidencia
const ACCEPT = "application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,video/*,audio/*";

interface ModuleOption { id: string; title: string; }
interface UnitOption { id: string; title: string; module_id: string; }

interface Evidence {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string | null;
  unit_id: string | null;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
}

interface EvidenceManagerProps {
  courseId: string;
  userRole?: string;
}

export function EvidenceManager({ courseId, userRole }: EvidenceManagerProps) {
  const { toast } = useToast();
  const isStaff = userRole === "teacher" || userRole === "admin" || userRole === "super_admin" || userRole === "auditor";

  const [userId, setUserId] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState<string>("none");
  const [unitId, setUnitId] = useState<string>("none");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [previewType, setPreviewType] = useState<string>("");

  const filteredUnits = useMemo(
    () => (moduleId === "none" ? [] : units.filter((u) => u.module_id === moduleId)),
    [moduleId, units]
  );

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUserId(u.user?.id || null);
      const { data: mods } = await supabase
        .from("modules")
        .select("id, title")
        .eq("course_id", courseId)
        .order("order_index");
      setModules((mods as any) || []);

      const moduleIds = (mods || []).map((m: any) => m.id);
      if (moduleIds.length > 0) {
        const { data: us } = await supabase
          .from("formative_units")
          .select("id, title, module_id")
          .in("module_id", moduleIds)
          .order("order_index");
        setUnits((us as any) || []);
      }
      await loadEvidences();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadEvidences = async () => {
    const { data, error } = await supabase
      .from("student_evidences")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setEvidences((data as any) || []);
  };

  const onFileSelect = (f: File | null) => {
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) {
      toast({
        title: "Archivo demasiado grande",
        description: `Máximo ${MAX_BYTES / 1024 / 1024} MB por evidencia.`,
        variant: "destructive",
      });
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!userId || !file || !title.trim()) {
      toast({ title: "Datos incompletos", description: "Indica un título y selecciona un archivo.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/evidences/${courseId}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from("student-documents")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("student_evidences").insert({
        user_id: userId,
        course_id: courseId,
        module_id: moduleId === "none" ? null : moduleId,
        unit_id: unitId === "none" ? null : unitId,
        title: title.trim(),
        description: description.trim() || null,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || null,
      });
      if (dbErr) throw dbErr;

      toast({ title: "Evidencia subida", description: file.name });
      setTitle("");
      setDescription("");
      setModuleId("none");
      setUnitId("none");
      setFile(null);
      await loadEvidences();
    } catch (e: any) {
      toast({ title: "Error al subir", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openSignedBlob = async (path: string, fileName: string, type: string | null, mode: "preview" | "download") => {
    try {
      const { data, error } = await supabase.storage
        .from("student-documents")
        .createSignedUrl(path, 60 * 10);
      if (error || !data?.signedUrl) throw error || new Error("Sin URL");
      const res = await fetch(data.signedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (mode === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      } else {
        setPreviewUrl(url);
        setPreviewName(fileName);
        setPreviewType(type || "");
      }
    } catch (e: any) {
      toast({ title: "No se pudo abrir", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (ev: Evidence) => {
    if (!confirm(`¿Eliminar evidencia "${ev.title}"?`)) return;
    try {
      await supabase.storage.from("student-documents").remove([ev.file_path]);
      const { error } = await supabase.from("student_evidences").delete().eq("id", ev.id);
      if (error) throw error;
      toast({ title: "Evidencia eliminada" });
      await loadEvidences();
    } catch (e: any) {
      toast({ title: "Error al eliminar", description: e.message, variant: "destructive" });
    }
  };

  const moduleTitle = (id: string | null) => modules.find((m) => m.id === id)?.title || "—";
  const unitTitle = (id: string | null) => units.find((u) => u.id === id)?.title || "—";

  const formatSize = (b: number | null) => {
    if (!b) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  };

  const isPreviewable = (type: string) => type.startsWith("image/") || type.startsWith("video/") || type === "application/pdf" || type.startsWith("audio/");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderUp className="h-5 w-5 text-primary" />
            Subir nueva evidencia
          </CardTitle>
          <CardDescription>
            Adjunta documentos, imágenes o vídeos como evidencias de las actividades evaluables. Puedes
            asociarlos a un módulo y/o a una unidad formativa concreta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ev-title">Título *</Label>
              <Input
                id="ev-title"
                placeholder="Ej.: Caso práctico UF1 - Resolución"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-module">Módulo (opcional)</Label>
              <Select
                value={moduleId}
                onValueChange={(v) => {
                  setModuleId(v);
                  setUnitId("none");
                }}
              >
                <SelectTrigger id="ev-module">
                  <SelectValue placeholder="Todo el curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todo el curso</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-unit">Unidad formativa (opcional)</Label>
              <Select value={unitId} onValueChange={setUnitId} disabled={moduleId === "none"}>
                <SelectTrigger id="ev-unit">
                  <SelectValue placeholder={moduleId === "none" ? "Selecciona primero un módulo" : "Sin unidad concreta"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin unidad concreta</SelectItem>
                  {filteredUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-file">Archivo * (máx. 50 MB)</Label>
              <Input
                id="ev-file"
                type="file"
                accept={ACCEPT}
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              />
              {file && (
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({formatSize(file.size)})</span>
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-desc">Descripción (opcional)</Label>
            <Textarea
              id="ev-desc"
              placeholder="Breve descripción del contenido o de la actividad evaluable a la que corresponde."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleUpload} disabled={uploading || !file || !title.trim()}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FolderUp className="h-4 w-4 mr-2" />}
            Subir evidencia
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isStaff ? "Evidencias del alumnado" : "Mis evidencias"}
            <Badge variant="secondary" className="ml-2">{evidences.length}</Badge>
          </CardTitle>
          <CardDescription>
            {isStaff
              ? "Listado de evidencias subidas por los/as alumnos/as de este curso."
              : "Aquí encontrarás todas las evidencias que has subido. Puedes previsualizarlas, descargarlas o eliminarlas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando…
            </div>
          ) : evidences.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FolderUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aún no se han subido evidencias para este curso.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {evidences.map((ev) => {
                const own = ev.user_id === userId;
                return (
                  <div
                    key={ev.id}
                    className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10 flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{ev.title}</span>
                        {ev.module_id && (
                          <Badge variant="outline" className="text-[10px]">{moduleTitle(ev.module_id)}</Badge>
                        )}
                        {ev.unit_id && (
                          <Badge variant="secondary" className="text-[10px]">{unitTitle(ev.unit_id)}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {ev.file_name} · {formatSize(ev.file_size)} · {new Date(ev.created_at).toLocaleString("es-ES")}
                      </p>
                      {ev.description && (
                        <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{ev.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isPreviewable(ev.file_type || "") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSignedBlob(ev.file_path, ev.file_name, ev.file_type, "preview")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSignedBlob(ev.file_path, ev.file_name, ev.file_type, "download")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {(own || userRole === "admin" || userRole === "super_admin") && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ev)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!previewUrl}
        onOpenChange={(o) => {
          if (!o) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate">{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && previewType.startsWith("image/") && (
            <img src={previewUrl} alt={previewName} className="max-h-[70vh] w-full object-contain" />
          )}
          {previewUrl && previewType.startsWith("video/") && (
            <video src={previewUrl} controls className="w-full max-h-[70vh]" />
          )}
          {previewUrl && previewType.startsWith("audio/") && (
            <audio src={previewUrl} controls className="w-full" />
          )}
          {previewUrl && previewType === "application/pdf" && (
            <iframe src={previewUrl} className="w-full h-[70vh]" title={previewName} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EvidenceManager;
