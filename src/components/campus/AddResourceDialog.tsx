import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Loader2, Clock } from "lucide-react";

export type ResourceContentType =
  | "intro_video"
  | "objectives_pdf"
  | "concept_map"
  | "support_doc"
  | "support_video"
  | "support_audio"
  | "biblioteca"
  | "web_link";

interface AddResourceDialogProps {
  trigger: React.ReactNode;
  contentType: ResourceContentType;
  moduleId: string;
  courseId?: string;
  formativeUnitId?: string | null;
  defaultTitle?: string;
  acceptFile?: string;
  onCreated?: () => void;
}

const LABELS: Record<ResourceContentType, string> = {
  intro_video: "Vídeo de presentación",
  objectives_pdf: "Objetivos",
  concept_map: "Mapa conceptual",
  support_doc: "Documento de apoyo",
  support_video: "Vídeo de apoyo",
  support_audio: "Audio de apoyo",
  biblioteca: "Entrada de biblioteca",
  web_link: "Enlace web",
};

const VIDEO_TYPES: ResourceContentType[] = ["intro_video", "support_video"];
const LINK_ONLY_TYPES: ResourceContentType[] = ["web_link"];

export function AddResourceDialog({
  trigger,
  contentType,
  moduleId,
  courseId,
  formativeUnitId,
  defaultTitle,
  acceptFile,
  onCreated,
}: AddResourceDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [studyTime, setStudyTime] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const isVideo = VIDEO_TYPES.includes(contentType);
  const isLinkOnly = LINK_ONLY_TYPES.includes(contentType);
  const showCommentField = ["biblioteca", "web_link", "support_doc"].includes(contentType);

  const reset = () => {
    setTitle(defaultTitle || "");
    setDescription("");
    setComment("");
    setStudyTime("");
    setExternalUrl("");
    setFile(null);
  };

  const getUploadBasePath = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw authError || new Error("Debes iniciar sesión para subir archivos.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("training_center_id")
      .eq("id", authData.user.id)
      .single();
    if (profileError) throw profileError;
    if (!profile?.training_center_id) throw new Error("Tu usuario no tiene centro formativo asignado.");

    if (courseId) return `${profile.training_center_id}/${courseId}/${moduleId}`;

    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("course_id")
      .eq("id", moduleId)
      .single();
    if (moduleError) throw moduleError;

    return `${profile.training_center_id}/${moduleData.course_id}/${moduleId}`;
  };

  const save = async (mode: "file" | "link") => {
    if (!title.trim()) {
      toast({ title: "Falta título", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      let file_path: string | null = null;
      let file_name: string | null = null;
      let file_size: number | null = null;
      let external: string | null = null;

      if (mode === "file") {
        if (!file) { toast({ title: "Selecciona un archivo", variant: "destructive" }); setBusy(false); return; }
        const ext = file.name.split(".").pop();
        const basePath = await getUploadBasePath();
        const path = `${basePath}/${contentType}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("module-content")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        file_path = path;
        file_name = file.name;
        file_size = file.size;
      } else {
        if (!externalUrl.trim()) { toast({ title: "Falta URL", variant: "destructive" }); setBusy(false); return; }
        external = externalUrl.trim();
      }

      const studyTimeNum = studyTime.trim() ? parseInt(studyTime, 10) : null;

      const { error } = await (supabase as any).from("module_content").insert({
        module_id: moduleId,
        formative_unit_id: formativeUnitId ?? null,
        content_type: contentType,
        title: title.trim(),
        description: description.trim() || null,
        comment: showCommentField && comment.trim() ? comment.trim() : null,
        study_time_minutes: isVideo && studyTimeNum && !isNaN(studyTimeNum) ? studyTimeNum : null,
        file_path,
        file_name,
        file_size,
        external_url: external,
        is_active: true,
      });
      if (error) throw error;

      toast({ title: "Recurso añadido", description: LABELS[contentType] });
      reset();
      setOpen(false);
      onCreated?.();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "No se pudo guardar", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir {LABELS[contentType]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={defaultTitle} />
          </div>
          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {showCommentField && (
            <div>
              <Label>Comentario {contentType === "biblioteca" ? "bibliográfico" : "del recurso"}</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder={
                  contentType === "biblioteca"
                    ? "Indica el contexto pedagógico y por qué este recurso es relevante…"
                    : "Comentario explicativo del recurso, contexto de uso…"
                }
              />
            </div>
          )}
          {isVideo && (
            <div>
              <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Tiempo estimado de estudio (minutos)</Label>
              <Input
                type="number"
                min={1}
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                placeholder="p. ej. 15"
              />
            </div>
          )}

          {isLinkOnly ? (
            <div className="space-y-2">
              <Label>URL del enlace web</Label>
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
              />
              <DialogFooter>
                <Button onClick={() => save("link")} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                  Guardar enlace
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <Tabs defaultValue="file">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="file"><Upload className="h-3.5 w-3.5 mr-1.5" />Archivo</TabsTrigger>
                <TabsTrigger value="link"><LinkIcon className="h-3.5 w-3.5 mr-1.5" />Enlace</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="space-y-2">
                <Input type="file" accept={acceptFile} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <DialogFooter>
                  <Button onClick={() => save("file")} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Subir
                  </Button>
                </DialogFooter>
              </TabsContent>
              <TabsContent value="link" className="space-y-2">
                <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." />
                <DialogFooter>
                  <Button onClick={() => save("link")} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                    Guardar enlace
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
