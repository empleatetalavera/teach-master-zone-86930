import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddResourceDialog, ResourceContentType } from "./AddResourceDialog";
import { PlayCircle, FileText, MessageSquare, FileQuestion, Plus, ExternalLink, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  moduleId: string;
  formativeUnitId?: string | null;
  formativeUnitTitle?: string;
  courseId: string;
  isAdmin: boolean;
  scope?: "unit" | "module";
}

interface ContentRow {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
  content_type: string;
}

interface EvalRow {
  id: string;
  title: string;
  evaluation_type: string;
}

export function UFIntroductionSection({ moduleId, formativeUnitId, formativeUnitTitle, courseId, isAdmin, scope = "unit" }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [evals, setEvals] = useState<EvalRow[]>([]);
  const isModuleScope = scope === "module" || !formativeUnitId;

  const load = useCallback(async () => {
    let cQuery = (supabase as any)
      .from("module_content")
      .select("id,title,description,file_path,external_url,content_type")
      .in("content_type", ["intro_video", "objectives_pdf"]);
    let eQuery = (supabase as any)
      .from("evaluations")
      .select("id,title,evaluation_type")
      .eq("evaluation_type", "diagnostic")
      .eq("is_active", true);

    if (isModuleScope) {
      cQuery = cQuery.eq("module_id", moduleId).is("formative_unit_id", null);
      eQuery = eQuery.eq("module_id", moduleId).is("formative_unit_id", null);
    } else {
      cQuery = cQuery.eq("formative_unit_id", formativeUnitId);
      eQuery = eQuery.eq("formative_unit_id", formativeUnitId);
    }

    const { data: c } = await cQuery;
    setContents((c ?? []) as ContentRow[]);
    const { data: e } = await eQuery;
    setEvals((e ?? []) as EvalRow[]);
  }, [moduleId, formativeUnitId, isModuleScope]);

  useEffect(() => { load(); }, [load]);

  const introVideo = contents.find(c => c.content_type === "intro_video");
  const objectivesPdf = contents.find(c => c.content_type === "objectives_pdf");
  const diagnostic = evals[0];

  const openResource = async (row: ContentRow) => {
    try {
      if (row.external_url) {
        window.open(row.external_url, "_blank", "noopener,noreferrer");
        return;
      }
      if (!row.file_path) {
        toast({ title: "Sin contenido" });
        return;
      }
      const { data, error } = await supabase.storage.from("module-content").createSignedUrl(row.file_path, 3600);
      if (error) throw error;
      const blob = await (await fetch(data.signedUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      toast({ title: "Error abriendo recurso", description: e?.message, variant: "destructive" });
    }
  };

  const Item = ({
    icon, iconBg, iconColor, title, subtitle, action, addType, accept,
  }: {
    icon: React.ReactNode; iconBg: string; iconColor: string;
    title: string; subtitle: string; action?: React.ReactNode;
    addType?: ResourceContentType; accept?: string;
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:shadow-sm transition-shadow">
      <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {action}
        {isAdmin && addType && (
          <AddResourceDialog
            trigger={<Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />{action ? "Editar" : "Subir"}</Button>}
            contentType={addType}
            moduleId={moduleId}
            formativeUnitId={isModuleScope ? null : formativeUnitId}
            defaultTitle={title}
            acceptFile={accept}
            onCreated={load}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="border border-blue-200/60 dark:border-blue-900/40 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#1e5fa8] to-[#2873c7] text-white px-4 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
        <span>A) INTRODUCCIÓN A LA UNIDAD FORMATIVA</span>
        <Badge className="bg-white/15 text-white border-0 text-[10px]">Cuestionario previo y objetivos</Badge>
      </div>
      <div className="p-3 space-y-2 bg-blue-50/30 dark:bg-blue-950/10">
        <Item
          icon={<PlayCircle className="h-4 w-4" />}
          iconBg="bg-rose-100 dark:bg-rose-900/30" iconColor="text-rose-600"
          title={introVideo?.title || "Vídeo de presentación"}
          subtitle={introVideo ? "Presentación de la UF" : "Pendiente de configurar"}
          action={introVideo ? (
            <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={() => openResource(introVideo)}>
              <PlayCircle className="h-3 w-3" />Reproducir
            </Button>
          ) : undefined}
          addType="intro_video"
          accept="video/*"
        />
        <Item
          icon={<FileText className="h-4 w-4" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600"
          title={objectivesPdf?.title || "Objetivos y Contenidos (PDF)"}
          subtitle={objectivesPdf ? "Documento descargable" : "Pendiente de configurar"}
          action={objectivesPdf ? (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => openResource(objectivesPdf)}>
              <ExternalLink className="h-3 w-3" />Abrir
            </Button>
          ) : undefined}
          addType="objectives_pdf"
          accept="application/pdf"
        />
        <Item
          icon={<MessageSquare className="h-4 w-4" />}
          iconBg="bg-fuchsia-100 dark:bg-fuchsia-900/30" iconColor="text-fuchsia-600"
          title="Sesión Inicial"
          subtitle="Chat de bienvenida con el tutor"
          action={
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate(`/course/${courseId}?tab=tutorias`)}>
              <MessageSquare className="h-3 w-3" />Entrar
            </Button>
          }
        />
        <Item
          icon={<FileQuestion className="h-4 w-4" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600"
          title={diagnostic?.title || "Cuestionario de conocimientos previos"}
          subtitle={diagnostic ? "Evaluación diagnóstica" : "Pendiente de configurar"}
          action={diagnostic ? (
            <Button variant="default" size="sm" className="h-7 text-xs gap-1 bg-amber-600 hover:bg-amber-700" onClick={() => navigate(`/course/${courseId}/evaluation/${diagnostic.id}`)}>
              <PlayCircle className="h-3 w-3" />Realizar
            </Button>
          ) : isAdmin ? (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast({ title: "Crear cuestionario diagnóstico", description: "Crea una evaluación marcada como tipo 'diagnostic' en el gestor de evaluaciones." })}>
              <Pencil className="h-3 w-3" />Configurar
            </Button>
          ) : undefined}
        />
      </div>
    </div>
  );
}
