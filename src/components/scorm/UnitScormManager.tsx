import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileArchive, Loader2, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  moduleId: string;
  unitId: string;
  unitTitle: string;
}

const MAX_SIZE = 250 * 1024 * 1024; // 250MB

export function UnitScormManager({ moduleId, unitId, unitTitle }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const queryKey = ["unit-scorm", unitId];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_scorm_content")
        .select("id, scorm_package_id, scorm_packages(id, title, file_name, file_size)")
        .eq("module_id", moduleId)
        .eq("formative_unit_id", unitId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("scorm-packages")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: pkg, error: pkgErr } = await supabase
        .from("scorm_packages")
        .insert({
          title: file.name.replace(/\.zip$/i, ""),
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          scorm_version: "1.2",
          uploaded_by: user.id,
          is_active: true,
        })
        .select()
        .single();
      if (pkgErr) throw pkgErr;

      const { error: linkErr } = await supabase
        .from("module_scorm_content")
        .insert({
          module_id: moduleId,
          formative_unit_id: unitId,
          scorm_package_id: pkg.id,
          order_index: (items.length ?? 0) + 1,
        });
      if (linkErr) throw linkErr;
    },
    onSuccess: () => {
      toast({ title: "SCORM subido", description: `Asociado a ${unitTitle}` });
      queryClient.invalidateQueries({ queryKey });
      setUploading(false);
    },
    onError: (e: any) => {
      toast({ title: "Error al subir SCORM", description: e.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from("module_scorm_content").delete().eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "SCORM eliminado de la unidad" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: any) => {
      toast({ title: "Error al eliminar", description: e.message, variant: "destructive" });
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast({ title: "Formato inválido", description: "Solo ZIP", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "Demasiado grande", description: "Máx 250MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    uploadMutation.mutate(file);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
        <Play className="h-5 w-5 text-purple-600" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold text-foreground text-sm">Paquetes SCORM</h5>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? "Subiendo..." : "Subir SCORM"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin paquetes SCORM en esta unidad</p>
        ) : (
          <div className="space-y-1">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-muted/50 rounded p-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileArchive className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.scorm_packages?.title ?? item.scorm_packages?.file_name}</span>
                  {item.scorm_packages?.file_size && (
                    <Badge variant="outline" className="text-[10px]">
                      {(item.scorm_packages.file_size / 1024 / 1024).toFixed(1)} MB
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UnitScormManager;
