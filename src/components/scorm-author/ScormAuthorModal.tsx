import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScormAuthorTool, ScormProject, Slide, generateScormPackage } from "@/components/scorm-author";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ScormAuthorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId?: string;
  formativeUnitId?: string;
  unitTitle?: string;
  existingSlides?: Slide[];
  onSaveComplete?: () => void;
}

export function ScormAuthorModal({
  open,
  onOpenChange,
  moduleId,
  formativeUnitId,
  unitTitle,
  existingSlides = [],
  onSaveComplete
}: ScormAuthorModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (project: ScormProject) => {
    if (!formativeUnitId) {
      toast({
        title: "Error",
        description: "No se ha seleccionado una unidad formativa",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Delete existing slides for this unit
      await supabase
        .from('unit_syllabus_slides')
        .delete()
        .eq('formative_unit_id', formativeUnitId);

      // Insert new slides
      const slidesToInsert = project.slides.map((slide, index) => ({
        formative_unit_id: formativeUnitId,
        slide_type: slide.type,
        title: slide.title,
        content: slide.type === 'content' ? (slide as any).content : null,
        quiz_data: slide.type === 'quiz' ? {
          question: (slide as any).question,
          options: (slide as any).options,
          explanation: (slide as any).explanation,
          hint: (slide as any).hint,
        } : null,
        table_data: null,
        checklist_items: null,
        key_terms: [],
        section_title: unitTitle || '',
        order_index: index,
        metadata: slide
      }));

      const { error } = await supabase
        .from('unit_syllabus_slides')
        .insert(slidesToInsert);

      if (error) throw error;

      toast({
        title: "Contenido guardado",
        description: `Se han guardado ${project.slides.length} slides correctamente`
      });

      onSaveComplete?.();
    } catch (error) {
      console.error('Error saving SCORM content:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el contenido",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportScorm = async (project: ScormProject) => {
    try {
      toast({
        title: "Generando paquete SCORM...",
        description: "Esto puede tardar unos segundos"
      });

      const blob = await generateScormPackage(project);
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '_')}_SCORM2004.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Paquete SCORM generado",
        description: "El archivo se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error exporting SCORM:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el paquete SCORM",
        variant: "destructive"
      });
    }
  };

  const handleGenerateFromPDF = async (file: File): Promise<Slide[]> => {
    // Read PDF content
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Call AI to generate slides
    const { data, error } = await supabase.functions.invoke('generate-scorm-from-pdf', {
      body: {
        pdfBase64: base64,
        fileName: file.name,
        unitTitle: unitTitle || 'Contenido SCORM',
        generateQuizzes: true,
        generateExercises: true
      }
    });

    if (error) throw error;

    // Convert AI response to Slide format
    const slides: Slide[] = (data.slides || []).map((s: any, idx: number) => {
      const baseSlide = {
        id: Math.random().toString(36).substring(2, 11),
        title: s.title || `Slide ${idx + 1}`,
        order: idx,
      };

      switch (s.slide_type) {
        case 'intro':
        case 'title':
          return {
            ...baseSlide,
            type: 'title' as const,
            subtitle: s.content?.substring(0, 100) || '',
          };
        case 'quiz':
          return {
            ...baseSlide,
            type: 'quiz' as const,
            question: s.quiz_data?.question || '',
            question_type: 'multiple-choice' as const,
            options: s.quiz_data?.options || [],
            explanation: s.quiz_data?.explanation || '',
            hint: s.quiz_data?.hint || '',
            points: 1,
            max_attempts: 2,
            shuffle_options: true
          };
        case 'summary':
          return {
            ...baseSlide,
            type: 'summary' as const,
            key_points: s.key_terms || [],
            next_steps: ''
          };
        default:
          return {
            ...baseSlide,
            type: 'content' as const,
            content: s.content || '',
            layout: 'single' as const
          };
      }
    });

    return slides;
  };

  // Convert existing syllabus slides to Slide format
  const convertToSlides = (): Slide[] => {
    return existingSlides.map((slide: any, idx) => {
      const metadata = slide.metadata || {};
      
      if (metadata.type) {
        return { ...metadata, id: slide.id, order: idx };
      }

      // Fallback conversion from old format
      const baseSlide = {
        id: slide.id,
        title: slide.title || `Slide ${idx + 1}`,
        order: idx,
      };

      switch (slide.slide_type) {
        case 'intro':
          return {
            ...baseSlide,
            type: 'title' as const,
            subtitle: slide.content?.substring(0, 100) || '',
          };
        case 'quiz':
          return {
            ...baseSlide,
            type: 'quiz' as const,
            question: slide.quiz_data?.question || '',
            question_type: 'multiple-choice' as const,
            options: slide.quiz_data?.options || [],
            explanation: slide.quiz_data?.explanation || '',
            hint: slide.quiz_data?.hint || '',
            points: 1,
            max_attempts: 2,
            shuffle_options: true
          };
        case 'summary':
          return {
            ...baseSlide,
            type: 'summary' as const,
            key_points: slide.key_terms || [],
            next_steps: ''
          };
        default:
          return {
            ...baseSlide,
            type: 'content' as const,
            content: slide.content || '',
            layout: 'single' as const
          };
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>Editor SCORM Avanzado</DialogTitle>
        </DialogHeader>
        <ScormAuthorTool
          moduleId={moduleId}
          formativeUnitId={formativeUnitId}
          initialSlides={convertToSlides()}
          onSave={handleSave}
          onExportScorm={handleExportScorm}
          onGenerateFromPDF={handleGenerateFromPDF}
        />
      </DialogContent>
    </Dialog>
  );
}
