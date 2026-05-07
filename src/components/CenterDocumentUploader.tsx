import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CenterDocumentUploaderProps {
  centerId: string;
  documentUrl?: string | null;
  dbField: string;
  bucket?: string;
  label: string;
  fileNamePrefix: string;
  onUpdate: () => void;
}

export const CenterDocumentUploader: React.FC<CenterDocumentUploaderProps> = ({
  centerId,
  documentUrl,
  dbField,
  bucket = "course-documents",
  label,
  fileNamePrefix,
  onUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `centers/${centerId}/${fileNamePrefix}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const { error, data } = await supabase
        .from("training_centers")
        .update({ [dbField]: publicUrl })
        .eq("id", centerId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("No se pudo actualizar el centro (permisos).");

      toast.success(`${label} subido correctamente`);
      onUpdate();
    } catch (e: any) {
      toast.error(`Error al subir: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentUrl) return;
    try {
      const parts = documentUrl.split(`/${bucket}/`);
      if (parts.length > 1) {
        await supabase.storage.from(bucket).remove([parts[1]]);
      }
      const { error } = await supabase
        .from("training_centers")
        .update({ [dbField]: null })
        .eq("id", centerId);
      if (error) throw error;
      toast.success(`${label} eliminado`);
      onUpdate();
    } catch (e: any) {
      toast.error(`Error al eliminar: ${e.message}`);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        }}
      />
      {documentUrl ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm truncate">{label}</span>
            <Badge variant="secondary" className="shrink-0">PDF</Badge>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(documentUrl, "_blank", "noopener")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Subir {label} (PDF)
        </Button>
      )}
    </div>
  );
};

export default CenterDocumentUploader;
