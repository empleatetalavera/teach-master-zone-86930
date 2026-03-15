import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SingleDocumentUploaderProps {
  courseId: string;
  documentUrl?: string | null;
  documentType: 'guide' | 'program' | 'tutor-guide';
  onUpdate: () => void;
  isAdmin?: boolean;
}

export const SingleDocumentUploader: React.FC<SingleDocumentUploaderProps> = ({
  courseId,
  documentUrl,
  documentType,
  onUpdate,
  isAdmin = false
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getDocumentConfig = () => {
    switch (documentType) {
      case 'guide':
        return { label: 'Guía del Alumno', fileName: 'guia-alumno', dbField: 'student_guide_pdf_url' };
      case 'tutor-guide':
        return { label: 'Guía del Tutor', fileName: 'guia-tutor', dbField: 'tutor_guide_pdf_url' };
      case 'program':
      default:
        return { label: 'Programa Formativo', fileName: 'programa-formativo', dbField: 'training_program_pdf_url' };
    }
  };

  const { label: documentLabel, fileName, dbField } = getDocumentConfig();

  const handleUpload = async (file: File) => {
    setUploading(true);
    console.log('[SingleDocumentUploader] Starting upload:', { fileName: file.name, fileSize: file.size, courseId, dbField });

    try {
      const fileExt = file.name.split('.').pop();
      const storagePath = `${courseId}/${fileName}-${Date.now()}.${fileExt}`;
      
      console.log('[SingleDocumentUploader] Uploading to storage path:', storagePath);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('course-documents')
        .upload(storagePath, file, { upsert: true });

      console.log('[SingleDocumentUploader] Upload result:', { uploadError, uploadData });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-documents')
        .getPublicUrl(storagePath);

      console.log('[SingleDocumentUploader] Updating course with:', { dbField, publicUrl, courseId });
      const { error: updateError, data: updateData, count } = await supabase
        .from('courses')
        .update({ [dbField]: publicUrl })
        .eq('id', courseId)
        .select();

      console.log('[SingleDocumentUploader] Update result:', { updateError, updateData, count });
      if (updateError) throw updateError;
      if (!updateData || updateData.length === 0) {
        console.error('[SingleDocumentUploader] Update returned no rows - likely RLS policy blocking update');
        throw new Error('No se pudo actualizar el curso. Verifica que tienes permisos de administrador.');
      }

      toast.success(`${documentLabel} subido correctamente`);
      onUpdate();
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast.error(`Error al subir el archivo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentUrl) return;

    try {
      // Extract file path from URL
      const urlParts = documentUrl.split('/course-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('course-documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('courses')
        .update({ [dbField]: null })
        .eq('id', courseId);

      if (error) throw error;

      toast.success(`${documentLabel} eliminado`);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 20MB');
        return;
      }
      handleUpload(file);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Subir PDF personalizado</span>
        <Badge variant="secondary" className="text-xs">Admin</Badge>
      </div>
      
      {documentUrl ? (
        <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm flex-1 truncate">{documentLabel} subido</span>
          <Badge variant="secondary" className="text-xs">PDF</Badge>
          {documentType === 'guide' ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                toast.info('La guía neutra se descarga desde el botón principal "Descargar Guía del Alumno (PDF)".');
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={async () => {
                try {
                  const response = await fetch(documentUrl!);
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = `${documentLabel}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                } catch {
                  const link = document.createElement('a');
                  link.href = documentUrl!;
                  link.download = `${documentLabel}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Subir {documentLabel}
          </Button>
        </>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        {documentType === 'guide'
          ? 'La descarga de alumnos usa siempre la guía neutra autogenerada.'
          : 'Este PDF reemplazará el contenido auto-generado para adaptarlo a tu certificado profesional.'}
      </p>
    </div>
  );
};
