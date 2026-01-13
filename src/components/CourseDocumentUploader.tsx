import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, ExternalLink, Loader2, BookOpen, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseDocumentUploaderProps {
  courseId: string;
  studentGuidePdfUrl?: string | null;
  trainingProgramPdfUrl?: string | null;
  onUpdate: () => void;
  isAdmin?: boolean;
}

export const CourseDocumentUploader: React.FC<CourseDocumentUploaderProps> = ({
  courseId,
  studentGuidePdfUrl,
  trainingProgramPdfUrl,
  onUpdate,
  isAdmin = false
}) => {
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const [uploadingProgram, setUploadingProgram] = useState(false);
  const guideInputRef = useRef<HTMLInputElement>(null);
  const programInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'guide' | 'program') => {
    const setUploading = type === 'guide' ? setUploadingGuide : setUploadingProgram;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${type === 'guide' ? 'guia-alumno' : 'programa-formativo'}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-documents')
        .getPublicUrl(fileName);

      const updateField = type === 'guide' 
        ? { student_guide_pdf_url: publicUrl }
        : { training_program_pdf_url: publicUrl };

      const { error: updateError } = await supabase
        .from('courses')
        .update(updateField)
        .eq('id', courseId);

      if (updateError) throw updateError;

      toast.success(`${type === 'guide' ? 'Guía del Alumno' : 'Programa Formativo'} subido correctamente`);
      onUpdate();
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast.error(`Error al subir el archivo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type: 'guide' | 'program') => {
    const url = type === 'guide' ? studentGuidePdfUrl : trainingProgramPdfUrl;
    if (!url) return;

    try {
      // Extract file path from URL
      const urlParts = url.split('/course-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('course-documents').remove([filePath]);
      }

      const updateField = type === 'guide' 
        ? { student_guide_pdf_url: null }
        : { training_program_pdf_url: null };

      const { error } = await supabase
        .from('courses')
        .update(updateField)
        .eq('id', courseId);

      if (error) throw error;

      toast.success(`${type === 'guide' ? 'Guía del Alumno' : 'Programa Formativo'} eliminado`);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'guide' | 'program') => {
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

  if (!isAdmin) return null;

  return (
    <Card className="border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Documentos del Curso (Admin)
        </CardTitle>
        <CardDescription className="text-xs">
          Sube los PDFs personalizados de la Guía del Alumno y Programa Formativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guía del Alumno */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guía del Alumno (PDF)
          </Label>
          {studentGuidePdfUrl ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm flex-1 truncate">Guía del Alumno subida</span>
              <Badge variant="secondary" className="text-xs">PDF</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(studentGuidePdfUrl, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete('guide')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={guideInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'guide')}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => guideInputRef.current?.click()}
                disabled={uploadingGuide}
              >
                {uploadingGuide ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Subir Guía del Alumno
              </Button>
            </>
          )}
        </div>

        {/* Programa Formativo */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Programa Formativo (PDF)
          </Label>
          {trainingProgramPdfUrl ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm flex-1 truncate">Programa Formativo subido</span>
              <Badge variant="secondary" className="text-xs">PDF</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(trainingProgramPdfUrl, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete('program')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={programInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'program')}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => programInputRef.current?.click()}
                disabled={uploadingProgram}
              >
                {uploadingProgram ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Subir Programa Formativo
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
