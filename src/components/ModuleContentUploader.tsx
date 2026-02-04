import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, ExternalLink, Loader2, Layers, Image, MapIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModuleContentUploaderProps {
  moduleId: string;
  moduleTitle: string;
  conceptMapUrl?: string | null;
  contentPdfUrl?: string | null;
  onUpdate: () => void;
  isAdmin?: boolean;
}

export const ModuleContentUploader: React.FC<ModuleContentUploaderProps> = ({
  moduleId,
  moduleTitle,
  conceptMapUrl,
  contentPdfUrl,
  onUpdate,
  isAdmin = false
}) => {
  const [uploadingMap, setUploadingMap] = useState(false);
  const [uploadingContent, setUploadingContent] = useState(false);
  const mapInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const handleUpload = async (file: File, type: 'concept_map' | 'content_pdf') => {
    const isMap = type === 'concept_map';
    isMap ? setUploadingMap(true) : setUploadingContent(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${moduleId}/${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('module-content')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('module-content')
        .getPublicUrl(fileName);

      const updateField = isMap ? 'concept_map_url' : 'content';
      const { error: updateError } = await supabase
        .from('modules')
        .update({ [updateField]: publicUrl })
        .eq('id', moduleId);

      if (updateError) throw updateError;

      toast.success(isMap ? 'Mapa conceptual subido correctamente' : 'Contenido PDF subido correctamente');
      onUpdate();
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast.error(`Error al subir el archivo: ${error.message}`);
    } finally {
      isMap ? setUploadingMap(false) : setUploadingContent(false);
    }
  };

  const handleDelete = async (type: 'concept_map' | 'content_pdf') => {
    const url = type === 'concept_map' ? conceptMapUrl : contentPdfUrl;
    if (!url) return;

    try {
      // Extract file path from URL
      const urlParts = url.split('/module-content/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('module-content').remove([filePath]);
      }

      const updateField = type === 'concept_map' ? 'concept_map_url' : 'content';
      const { error } = await supabase
        .from('modules')
        .update({ [updateField]: null })
        .eq('id', moduleId);

      if (error) throw error;

      toast.success(type === 'concept_map' ? 'Mapa conceptual eliminado' : 'Contenido eliminado');
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'concept_map' | 'content_pdf') => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = type === 'concept_map' 
        ? ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        : ['application/pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(type === 'concept_map' 
          ? 'Solo se permiten archivos PDF o imágenes (PNG, JPG, WebP)' 
          : 'Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 20MB');
        return;
      }
      handleUpload(file, type);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Gestión de Contenidos del Módulo
          <Badge variant="secondary" className="text-xs">Admin</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Concept Map Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-purple-600" />
            Mapa Conceptual (PDF/Imagen)
          </label>
          {conceptMapUrl ? (
            <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
              <Layers className="h-4 w-4 text-purple-600" />
              <span className="text-sm flex-1 truncate">Mapa conceptual subido</span>
              <Badge variant="secondary" className="text-xs">
                {conceptMapUrl.includes('.pdf') ? 'PDF' : 'Imagen'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(conceptMapUrl, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete('concept_map')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={mapInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => handleFileChange(e, 'concept_map')}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => mapInputRef.current?.click()}
                disabled={uploadingMap}
              >
                {uploadingMap ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Subir Mapa Conceptual
              </Button>
            </>
          )}
        </div>

        {/* Content PDF Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            PDF de Contenido del Módulo
          </label>
          {contentPdfUrl && contentPdfUrl.startsWith('http') ? (
            <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm flex-1 truncate">Contenido PDF subido</span>
              <Badge variant="secondary" className="text-xs">PDF</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(contentPdfUrl, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete('content_pdf')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={contentInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'content_pdf')}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => contentInputRef.current?.click()}
                disabled={uploadingContent}
              >
                {uploadingContent ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Subir PDF de Contenido
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Estos archivos reemplazarán el contenido auto-generado para personalizar tu módulo.
        </p>
      </CardContent>
    </Card>
  );
};
