import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, FileDown, BookOpen, CheckCircle2, Upload, Trash2, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CertificateDocumentsSectionProps {
  courseId: string;
  fichaCertificadoUrl?: string | null;
  boeUrl?: string | null;
  isEditable?: boolean;
  onUpdate: () => void;
}

export const CertificateDocumentsSection: React.FC<CertificateDocumentsSectionProps> = ({
  courseId,
  fichaCertificadoUrl,
  boeUrl,
  isEditable = false,
  onUpdate
}) => {
  const [uploadingFicha, setUploadingFicha] = useState(false);
  const [uploadingBoe, setUploadingBoe] = useState(false);
  const fichaInputRef = useRef<HTMLInputElement>(null);
  const boeInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'ficha' | 'boe') => {
    const setUploading = type === 'ficha' ? setUploadingFicha : setUploadingBoe;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${type === 'ficha' ? 'ficha-certificado' : 'boe-oficial'}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-documents')
        .getPublicUrl(fileName);

      const updateField = type === 'ficha' 
        ? { ficha_certificado_url: publicUrl }
        : { boe_url: publicUrl };

      const { error: updateError } = await supabase
        .from('courses')
        .update(updateField)
        .eq('id', courseId);

      if (updateError) throw updateError;

      toast.success(`${type === 'ficha' ? 'Ficha del Certificado' : 'BOE'} subido correctamente`);
      onUpdate();
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast.error(`Error al subir el archivo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type: 'ficha' | 'boe') => {
    const url = type === 'ficha' ? fichaCertificadoUrl : boeUrl;
    if (!url) return;

    try {
      // Extract file path from URL
      const urlParts = url.split('/course-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('course-documents').remove([filePath]);
      }

      const updateField = type === 'ficha' 
        ? { ficha_certificado_url: null }
        : { boe_url: null };

      const { error } = await supabase
        .from('courses')
        .update(updateField)
        .eq('id', courseId);

      if (error) throw error;

      toast.success(`${type === 'ficha' ? 'Ficha del Certificado' : 'BOE'} eliminado`);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ficha' | 'boe') => {
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
      handleUpload(file, type);
    }
  };

  // Render document card for a single document
  const renderDocumentCard = (
    type: 'ficha' | 'boe',
    url: string | null | undefined,
    title: string,
    subtitle: string,
    Icon: typeof FileText
  ) => {
    const hasDocument = !!url;
    const isUploading = type === 'ficha' ? uploadingFicha : uploadingBoe;
    const inputRef = type === 'ficha' ? fichaInputRef : boeInputRef;

    return (
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Icon className="h-5 w-5" />
          {type === 'ficha' ? 'Ficha del Certificado' : 'Boletín Oficial del Estado (BOE)'}
        </h4>
        
        <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center relative">
          {isEditable && hasDocument && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(type)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-2xl mb-4">
            <Icon className="h-16 w-16 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-1">{title}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">{subtitle}</p>
          
          {hasDocument ? (
            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          ) : (
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
              <AlertCircle className="h-3 w-3 mr-1" />
              No disponible
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        {hasDocument ? (
          <Button asChild variant="default" className="w-full bg-amber-600 hover:bg-amber-700">
            <a 
              href={url!} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Ver / Descargar {type === 'ficha' ? 'Ficha' : 'BOE'}
            </a>
          </Button>
        ) : isEditable ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, type)}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Subir {type === 'ficha' ? 'Ficha' : 'BOE'}
            </Button>
          </>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <AlertCircle className="h-4 w-4 mr-2" />
            Documento no configurado
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg">
            <FileText className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Documentos Oficiales del Certificado
              {isEditable && (
                <Badge variant="secondary" className="text-xs">Editable</Badge>
              )}
            </CardTitle>
            <CardDescription>Ficha del certificado de profesionalidad y BOE oficial</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {renderDocumentCard(
            'ficha',
            fichaCertificadoUrl,
            'Ficha del Certificado',
            'Documento PDF oficial',
            FileText
          )}
          {renderDocumentCard(
            'boe',
            boeUrl,
            'BOE Oficial',
            'Documento normativo',
            BookOpen
          )}
        </div>
      </CardContent>
    </Card>
  );
};
