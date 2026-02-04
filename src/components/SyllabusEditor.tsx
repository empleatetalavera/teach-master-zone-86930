import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { PDFToSyllabusImporter } from "@/components/PDFToSyllabusImporter";
import { generateUF0517UD1Slides } from "@/components/scorm/UF0517UD1SlidesGenerator";
import { generateUF0517UD2Slides } from "@/components/scorm/UF0517UD2SlidesGenerator";
import { generateUF0519ComprehensiveSlides } from "@/components/scorm/UF0519SlidesGenerator";
import { getSSCE0110SlidesByModule } from "@/components/scorm/SSCE0110SlidesGenerator";
import {
  Plus, Trash2, Save, Loader2, GripVertical, Eye, Edit2, FileText,
  HelpCircle, CheckSquare, Table2, BookOpen, X, Copy, ArrowUp, ArrowDown, Upload,
  Image, Target, MousePointerClick, AlertCircle, Info, Lightbulb, AlertTriangle, Sparkles
} from "lucide-react";

interface SyllabusEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
}

interface ImageData {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

interface ButtonData {
  id: string;
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline';
}

interface HighlightBoxData {
  id: string;
  type: 'info' | 'warning' | 'tip' | 'important';
  title: string;
  content: string;
}

interface SlideData {
  id: string;
  formative_unit_id: string;
  slide_type: string;
  title: string;
  section_title: string | null;
  content: string | null;
  key_terms: string[] | null;
  order_index: number;
  is_active: boolean;
  table_data: { headers: string[]; rows: string[][] } | null;
  quiz_data: { question: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation: string; hint?: string } | null;
  checklist_items: { id: string; text: string }[] | null;
  images: ImageData[] | null;
  objectives: string[] | null;
  buttons: ButtonData[] | null;
  highlight_boxes: HighlightBoxData[] | null;
}

const SLIDE_TYPES = [
  { value: 'intro', label: 'Introducción', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { value: 'content', label: 'Contenido', icon: FileText, color: 'bg-green-100 text-green-700' },
  { value: 'quiz', label: 'Test/Quiz', icon: HelpCircle, color: 'bg-purple-100 text-purple-700' },
  { value: 'table', label: 'Tabla', icon: Table2, color: 'bg-orange-100 text-orange-700' },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare, color: 'bg-pink-100 text-pink-700' },
  { value: 'summary', label: 'Resumen', icon: BookOpen, color: 'bg-teal-100 text-teal-700' },
  { value: 'exercise', label: 'Ejercicio', icon: Edit2, color: 'bg-amber-100 text-amber-700' },
];

export function SyllabusEditor({ open, onOpenChange, unitId, unitTitle }: SyllabusEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<SlideData | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPDFImporter, setShowPDFImporter] = useState(false);

  useEffect(() => {
    if (open && unitId) {
      loadSlides();
    }
  }, [open, unitId]);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("unit_syllabus_slides")
        .select("*")
        .eq("formative_unit_id", unitId)
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      
      // Type assertion for the data
      const typedData = (data || []).map(item => ({
        ...item,
        table_data: item.table_data as { headers: string[]; rows: string[][] } | null,
        quiz_data: item.quiz_data as { question: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation: string; hint?: string } | null,
        checklist_items: item.checklist_items as { id: string; text: string }[] | null,
        images: (Array.isArray(item.images) ? item.images : []) as unknown as ImageData[],
        objectives: (Array.isArray(item.objectives) ? item.objectives : []) as unknown as string[],
        buttons: (Array.isArray(item.buttons) ? item.buttons : []) as unknown as ButtonData[],
        highlight_boxes: (Array.isArray(item.highlight_boxes) ? item.highlight_boxes : []) as unknown as HighlightBoxData[],
      }));
      
      setSlides(typedData);
      if (typedData.length > 0) {
        setSelectedSlide(typedData[0]);
      }
    } catch (error) {
      console.error("Error loading slides:", error);
      toast({ title: "Error", description: "No se pudieron cargar los slides", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = async () => {
    const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) : 0;

    try {
      const { data, error } = await supabase
        .from("unit_syllabus_slides")
        .insert({
          formative_unit_id: unitId,
          slide_type: 'content',
          title: `Slide ${slides.length + 1}`,
          section_title: 'Nueva sección',
          content: '# Título\n\nEscribe aquí el contenido en **Markdown**.',
          key_terms: [],
          order_index: maxOrder + 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData: SlideData = {
        ...data,
        table_data: data.table_data as { headers: string[]; rows: string[][] } | null,
        quiz_data: data.quiz_data as { question: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation: string; hint?: string } | null,
        checklist_items: data.checklist_items as { id: string; text: string }[] | null,
        images: (Array.isArray(data.images) ? data.images : []) as unknown as ImageData[],
        objectives: (Array.isArray(data.objectives) ? data.objectives : []) as unknown as string[],
        buttons: (Array.isArray(data.buttons) ? data.buttons : []) as unknown as ButtonData[],
        highlight_boxes: (Array.isArray(data.highlight_boxes) ? data.highlight_boxes : []) as unknown as HighlightBoxData[],
      };
      setSlides(prev => [...prev, typedData]);
      setSelectedSlide(typedData);
      toast({ title: "Slide añadido" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo añadir el slide", variant: "destructive" });
    }
  };

  // Determine which template to use based on unit title
  const getTemplateSlides = () => {
    const title = unitTitle.toLowerCase();
    
    // SSCE0110 - Docencia de la Formación Profesional para el Empleo
    if (title.includes('mf1442') || title.includes('programación didáctica')) {
      return getSSCE0110SlidesByModule('MF1442');
    }
    if (title.includes('mf1443') || title.includes('materiales') || title.includes('recursos didácticos')) {
      return getSSCE0110SlidesByModule('MF1443');
    }
    if (title.includes('mf1444') || title.includes('impartición') || title.includes('tutorización')) {
      return getSSCE0110SlidesByModule('MF1444');
    }
    if (title.includes('mf1445') || title.includes('evaluación del proceso')) {
      return getSSCE0110SlidesByModule('MF1445');
    }
    if (title.includes('mf1446') || title.includes('orientación laboral') || title.includes('calidad')) {
      return getSSCE0110SlidesByModule('MF1446');
    }
    
    // UF1645 / UF1646 (Unidades dentro de MF1444)
    if (title.includes('uf1645') || title.includes('uf1646')) {
      return getSSCE0110SlidesByModule('MF1444');
    }
    
    // UF0517 - UD1: Organización de entidades
    if (title.includes('uf0517') && (title.includes('organiza') || title.includes('empresa'))) {
      return generateUF0517UD1Slides();
    }
    
    // UF0517 - UD2: Recursos Humanos (check if it's UD2 based on content)
    if (title.includes('recursos humanos')) {
      return generateUF0517UD2Slides();
    }
    
    // UF0519 - Documentación económico-administrativa
    if (title.includes('uf0519') || title.includes('económico') || title.includes('documentación')) {
      return generateUF0519ComprehensiveSlides();
    }
    
    return null;
  };

  const handleGenerateFromTemplate = async () => {
    const templateSlides = getTemplateSlides();
    
    if (!templateSlides || templateSlides.length === 0) {
      toast({ 
        title: "Sin plantilla disponible", 
        description: "No hay plantilla predefinida para esta unidad. Usa 'Importar PDF' para generar contenido.",
        variant: "destructive" 
      });
      return;
    }

    if (slides.length > 0) {
      if (!confirm(`Ya existen ${slides.length} slides. ¿Deseas añadir ${templateSlides.length} slides más desde la plantilla?`)) {
        return;
      }
    }

    setGenerating(true);
    try {
      const startIndex = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) + 1 : 0;
      
      // Insert slides in batches of 10 for better performance
      const batchSize = 10;
      let insertedCount = 0;
      
      for (let i = 0; i < templateSlides.length; i += batchSize) {
        const batch = templateSlides.slice(i, i + batchSize);
        const slidesToInsert = batch.map((slide, idx) => {
          // Cast to string to avoid TypeScript comparison issues with extended types
          const slideType = String(slide.type);
          return {
            formative_unit_id: unitId,
            slide_type: slideType === 'flashcards' ? 'content' : slideType,
            title: slide.title || `Slide ${startIndex + i + idx + 1}`,
            section_title: slide.section || null,
            content: slide.content || null,
            key_terms: slide.keyTerms || [],
            order_index: startIndex + i + idx,
            is_active: true,
            table_data: slide.tableData || null,
            quiz_data: slide.quiz ? {
              question: slide.quiz.question,
              options: slide.quiz.options,
              explanation: slide.quiz.explanation,
              hint: slide.quiz.hint
            } : null,
            checklist_items: slide.checklistItems || null,
          };
        });

        const { error } = await supabase
          .from('unit_syllabus_slides')
          .insert(slidesToInsert);

        if (error) throw error;
        insertedCount += batch.length;
      }

      toast({ 
        title: "Plantilla generada",
        description: `Se añadieron ${insertedCount} slides desde la plantilla.`
      });
      
      // Reload slides
      await loadSlides();
    } catch (error) {
      console.error("Error generating from template:", error);
      toast({ 
        title: "Error", 
        description: "No se pudieron generar los slides desde la plantilla",
        variant: "destructive" 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSlide = async () => {
    if (!selectedSlide) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("unit_syllabus_slides")
        .update({
          title: selectedSlide.title,
          section_title: selectedSlide.section_title,
          slide_type: selectedSlide.slide_type,
          content: selectedSlide.content,
          key_terms: selectedSlide.key_terms,
          table_data: selectedSlide.table_data ? JSON.parse(JSON.stringify(selectedSlide.table_data)) : null,
          quiz_data: selectedSlide.quiz_data ? JSON.parse(JSON.stringify(selectedSlide.quiz_data)) : null,
          checklist_items: selectedSlide.checklist_items ? JSON.parse(JSON.stringify(selectedSlide.checklist_items)) : null,
          images: selectedSlide.images ? JSON.parse(JSON.stringify(selectedSlide.images)) : [],
          objectives: selectedSlide.objectives || [],
          buttons: selectedSlide.buttons ? JSON.parse(JSON.stringify(selectedSlide.buttons)) : [],
          highlight_boxes: selectedSlide.highlight_boxes ? JSON.parse(JSON.stringify(selectedSlide.highlight_boxes)) : [],
        })
        .eq("id", selectedSlide.id);

      if (error) throw error;

      setSlides(prev => prev.map(s => s.id === selectedSlide.id ? selectedSlide : s));
      toast({ title: "Slide guardado" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    try {
      const { error } = await supabase
        .from("unit_syllabus_slides")
        .update({ is_active: false })
        .eq("id", slideId);

      if (error) throw error;

      const newSlides = slides.filter(s => s.id !== slideId);
      setSlides(newSlides);
      if (selectedSlide?.id === slideId) {
        setSelectedSlide(newSlides[0] || null);
      }
      toast({ title: "Slide eliminado" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleMoveSlide = async (slideId: string, direction: 'up' | 'down') => {
    const index = slides.findIndex(s => s.id === slideId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    
    // Update order_index
    newSlides.forEach((slide, idx) => {
      slide.order_index = idx + 1;
    });

    setSlides(newSlides);

    // Save to database
    try {
      await Promise.all(newSlides.map(slide =>
        supabase.from("unit_syllabus_slides").update({ order_index: slide.order_index }).eq("id", slide.id)
      ));
    } catch (error) {
      toast({ title: "Error al reordenar", variant: "destructive" });
    }
  };

  const handleDuplicateSlide = async (slide: SlideData) => {
    const maxOrder = Math.max(...slides.map(s => s.order_index));
    
    const newSlide: Partial<SlideData> = {
      formative_unit_id: unitId,
      slide_type: slide.slide_type,
      title: `${slide.title} (copia)`,
      section_title: slide.section_title,
      content: slide.content,
      key_terms: slide.key_terms,
      order_index: maxOrder + 1,
      is_active: true,
      table_data: slide.table_data,
      quiz_data: slide.quiz_data,
      checklist_items: slide.checklist_items,
    };

    try {
      const { data, error } = await supabase
        .from("unit_syllabus_slides")
        .insert({
          formative_unit_id: unitId,
          slide_type: slide.slide_type,
          title: `${slide.title} (copia)`,
          section_title: slide.section_title,
          content: slide.content,
          key_terms: slide.key_terms,
          order_index: maxOrder + 1,
          is_active: true,
          table_data: slide.table_data ? JSON.parse(JSON.stringify(slide.table_data)) : null,
          quiz_data: slide.quiz_data ? JSON.parse(JSON.stringify(slide.quiz_data)) : null,
          checklist_items: slide.checklist_items ? JSON.parse(JSON.stringify(slide.checklist_items)) : null,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData: SlideData = {
        ...data,
        table_data: data.table_data as { headers: string[]; rows: string[][] } | null,
        quiz_data: data.quiz_data as { question: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation: string; hint?: string } | null,
        checklist_items: data.checklist_items as { id: string; text: string }[] | null,
        images: (Array.isArray(data.images) ? data.images : []) as unknown as ImageData[],
        objectives: (Array.isArray(data.objectives) ? data.objectives : []) as unknown as string[],
        buttons: (Array.isArray(data.buttons) ? data.buttons : []) as unknown as ButtonData[],
        highlight_boxes: (Array.isArray(data.highlight_boxes) ? data.highlight_boxes : []) as unknown as HighlightBoxData[],
      };

      setSlides(prev => [...prev, typedData]);
      toast({ title: "Slide duplicado" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const updateSelectedSlide = (updates: Partial<SlideData>) => {
    if (!selectedSlide) return;
    setSelectedSlide({ ...selectedSlide, ...updates });
  };

  const addQuizOption = () => {
    if (!selectedSlide) return;
    const currentOptions = selectedSlide.quiz_data?.options || [];
    const newOption = { id: crypto.randomUUID(), text: '', isCorrect: false };
    updateSelectedSlide({
      quiz_data: {
        ...selectedSlide.quiz_data!,
        question: selectedSlide.quiz_data?.question || '',
        explanation: selectedSlide.quiz_data?.explanation || '',
        options: [...currentOptions, newOption]
      }
    });
  };

  const updateQuizOption = (optionId: string, updates: Partial<{ text: string; isCorrect: boolean }>) => {
    if (!selectedSlide?.quiz_data) return;
    const newOptions = selectedSlide.quiz_data.options.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );
    updateSelectedSlide({ quiz_data: { ...selectedSlide.quiz_data, options: newOptions } });
  };

  const removeQuizOption = (optionId: string) => {
    if (!selectedSlide?.quiz_data) return;
    const newOptions = selectedSlide.quiz_data.options.filter(opt => opt.id !== optionId);
    updateSelectedSlide({ quiz_data: { ...selectedSlide.quiz_data, options: newOptions } });
  };

  const getSlideTypeConfig = (type: string) => SLIDE_TYPES.find(t => t.value === type) || SLIDE_TYPES[1];

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Editor de Temario
              </DialogTitle>
              <DialogDescription className="mt-1">{unitTitle}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {slides.length === 0 && getTemplateSlides() && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleGenerateFromTemplate}
                  disabled={generating}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Generar Plantilla
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowPDFImporter(true)}>
                <Upload className="h-4 w-4 mr-1" />
                Importar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4 mr-1" />
                {previewMode ? 'Editar' : 'Vista previa'}
              </Button>
              <Button size="sm" onClick={handleAddSlide}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir Slide
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Lista de slides */}
          <div className="w-64 border-r bg-muted/30 overflow-hidden flex flex-col">
            <div className="p-3 border-b">
              <h3 className="font-medium text-sm">Slides ({slides.length})</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {slides.map((slide, idx) => {
                  const config = getSlideTypeConfig(slide.slide_type);
                  return (
                    <div
                      key={slide.id}
                      className={`group p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedSlide?.id === slide.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedSlide(slide)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-mono opacity-50">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{slide.title}</p>
                          <Badge variant="secondary" className={`text-[10px] mt-1 ${selectedSlide?.id === slide.id ? '' : config.color}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); handleMoveSlide(slide.id, 'up'); }}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); handleMoveSlide(slide.id, 'down'); }}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {slides.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>Sin slides</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAddSlide}>
                      <Plus className="h-4 w-4 mr-1" /> Crear primer slide
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Editor */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedSlide ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedSlide.slide_type}
                      onValueChange={(value) => updateSelectedSlide({ slide_type: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SLIDE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicateSlide(selectedSlide)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteSlide(selectedSlide.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSaveSlide} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                      Guardar
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-3xl">
                    {/* Basic fields */}
                    <div className="grid gap-4">
                      <div>
                        <Label>Título del Slide</Label>
                        <Input
                          value={selectedSlide.title}
                          onChange={(e) => updateSelectedSlide({ title: e.target.value })}
                          placeholder="Título del slide"
                        />
                      </div>
                      <div>
                        <Label>Sección (para índice)</Label>
                        <Input
                          value={selectedSlide.section_title || ''}
                          onChange={(e) => updateSelectedSlide({ section_title: e.target.value })}
                          placeholder="Nombre de la sección"
                        />
                      </div>
                    </div>

                    {/* Content based on slide type */}
                    {(selectedSlide.slide_type === 'intro' || selectedSlide.slide_type === 'content' || selectedSlide.slide_type === 'summary' || selectedSlide.slide_type === 'exercise') && (
                      <div>
                        <Label>Contenido (Markdown)</Label>
                        <Textarea
                          value={selectedSlide.content || ''}
                          onChange={(e) => updateSelectedSlide({ content: e.target.value })}
                          placeholder="Escribe el contenido en Markdown..."
                          className="min-h-[300px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Soporta Markdown: **negrita**, *cursiva*, # títulos, - listas, | tablas |
                        </p>
                      </div>
                    )}

                    {/* Quiz editor */}
                    {selectedSlide.slide_type === 'quiz' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Pregunta</Label>
                          <Textarea
                            value={selectedSlide.quiz_data?.question || ''}
                            onChange={(e) => updateSelectedSlide({ 
                              quiz_data: { ...selectedSlide.quiz_data!, question: e.target.value } 
                            })}
                            placeholder="Escribe la pregunta..."
                          />
                        </div>
                        
                        <div>
                          <Label className="flex items-center justify-between">
                            Opciones de respuesta
                            <Button variant="outline" size="sm" onClick={addQuizOption}>
                              <Plus className="h-3 w-3 mr-1" /> Añadir
                            </Button>
                          </Label>
                          <div className="space-y-2 mt-2">
                            {(selectedSlide.quiz_data?.options || []).map((option, idx) => (
                              <div key={option.id} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="correct-option"
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const newOptions = selectedSlide.quiz_data!.options.map(o => ({
                                      ...o,
                                      isCorrect: o.id === option.id
                                    }));
                                    updateSelectedSlide({ quiz_data: { ...selectedSlide.quiz_data!, options: newOptions } });
                                  }}
                                  className="h-4 w-4"
                                />
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateQuizOption(option.id, { text: e.target.value })}
                                  placeholder={`Opción ${idx + 1}`}
                                  className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeQuizOption(option.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Explicación (se muestra tras responder)</Label>
                          <Textarea
                            value={selectedSlide.quiz_data?.explanation || ''}
                            onChange={(e) => updateSelectedSlide({ 
                              quiz_data: { ...selectedSlide.quiz_data!, explanation: e.target.value } 
                            })}
                            placeholder="Explicación de la respuesta correcta..."
                          />
                        </div>

                        <div>
                          <Label>Pista (opcional)</Label>
                          <Input
                            value={selectedSlide.quiz_data?.hint || ''}
                            onChange={(e) => updateSelectedSlide({ 
                              quiz_data: { ...selectedSlide.quiz_data!, hint: e.target.value } 
                            })}
                            placeholder="Pista para ayudar al estudiante..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Table editor */}
                    {selectedSlide.slide_type === 'table' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Descripción (Markdown)</Label>
                          <Textarea
                            value={selectedSlide.content || ''}
                            onChange={(e) => updateSelectedSlide({ content: e.target.value })}
                            placeholder="Texto introductorio de la tabla..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <Label>Tabla (formato: cabecera1|cabecera2|... por línea, luego filas separadas por línea)</Label>
                          <Textarea
                            value={selectedSlide.table_data ? 
                              [selectedSlide.table_data.headers.join('|'), ...selectedSlide.table_data.rows.map(r => r.join('|'))].join('\n') 
                              : ''}
                            onChange={(e) => {
                              const lines = e.target.value.split('\n').filter(l => l.trim());
                              if (lines.length > 0) {
                                const headers = lines[0].split('|').map(h => h.trim());
                                const rows = lines.slice(1).map(line => line.split('|').map(c => c.trim()));
                                updateSelectedSlide({ table_data: { headers, rows } });
                              }
                            }}
                            placeholder="Columna1|Columna2|Columna3&#10;Dato1|Dato2|Dato3&#10;Dato4|Dato5|Dato6"
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Key terms */}
                    <div>
                      <Label>Términos clave (separados por coma)</Label>
                      <Input
                        value={(selectedSlide.key_terms || []).join(', ')}
                        onChange={(e) => updateSelectedSlide({ 
                          key_terms: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                        })}
                        placeholder="Término 1, Término 2, Término 3"
                      />
                    </div>

                    {/* Objectives Section */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="objectives">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Objetivos ({(selectedSlide.objectives || []).length})
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {(selectedSlide.objectives || []).map((obj, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground">{idx + 1}.</span>
                                <Input
                                  value={obj}
                                  onChange={(e) => {
                                    const newObjectives = [...(selectedSlide.objectives || [])];
                                    newObjectives[idx] = e.target.value;
                                    updateSelectedSlide({ objectives: newObjectives });
                                  }}
                                  placeholder="Objetivo de aprendizaje"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newObjectives = (selectedSlide.objectives || []).filter((_, i) => i !== idx);
                                    updateSelectedSlide({ objectives: newObjectives });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateSelectedSlide({ objectives: [...(selectedSlide.objectives || []), ''] })}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Añadir objetivo
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Images Section */}
                      <AccordionItem value="images">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Imágenes ({(selectedSlide.images || []).length})
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {(selectedSlide.images || []).map((img, idx) => (
                              <Card key={img.id} className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Imagen {idx + 1}</Label>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        const newImages = (selectedSlide.images || []).filter(i => i.id !== img.id);
                                        updateSelectedSlide({ images: newImages });
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={img.url}
                                    onChange={(e) => {
                                      const newImages = (selectedSlide.images || []).map(i =>
                                        i.id === img.id ? { ...i, url: e.target.value } : i
                                      );
                                      updateSelectedSlide({ images: newImages });
                                    }}
                                    placeholder="URL de la imagen"
                                  />
                                  <Input
                                    value={img.alt}
                                    onChange={(e) => {
                                      const newImages = (selectedSlide.images || []).map(i =>
                                        i.id === img.id ? { ...i, alt: e.target.value } : i
                                      );
                                      updateSelectedSlide({ images: newImages });
                                    }}
                                    placeholder="Texto alternativo"
                                  />
                                  <Input
                                    value={img.caption || ''}
                                    onChange={(e) => {
                                      const newImages = (selectedSlide.images || []).map(i =>
                                        i.id === img.id ? { ...i, caption: e.target.value } : i
                                      );
                                      updateSelectedSlide({ images: newImages });
                                    }}
                                    placeholder="Pie de foto (opcional)"
                                  />
                                </div>
                              </Card>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newImage: ImageData = { id: crypto.randomUUID(), url: '', alt: '', caption: '' };
                                updateSelectedSlide({ images: [...(selectedSlide.images || []), newImage] });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Añadir imagen
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Buttons Section */}
                      <AccordionItem value="buttons">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="h-4 w-4" />
                            Botones ({(selectedSlide.buttons || []).length})
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {(selectedSlide.buttons || []).map((btn, idx) => (
                              <Card key={btn.id} className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Botón {idx + 1}</Label>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        const newButtons = (selectedSlide.buttons || []).filter(b => b.id !== btn.id);
                                        updateSelectedSlide({ buttons: newButtons });
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={btn.label}
                                    onChange={(e) => {
                                      const newButtons = (selectedSlide.buttons || []).map(b =>
                                        b.id === btn.id ? { ...b, label: e.target.value } : b
                                      );
                                      updateSelectedSlide({ buttons: newButtons });
                                    }}
                                    placeholder="Texto del botón"
                                  />
                                  <Input
                                    value={btn.url}
                                    onChange={(e) => {
                                      const newButtons = (selectedSlide.buttons || []).map(b =>
                                        b.id === btn.id ? { ...b, url: e.target.value } : b
                                      );
                                      updateSelectedSlide({ buttons: newButtons });
                                    }}
                                    placeholder="URL de destino"
                                  />
                                  <Select
                                    value={btn.variant}
                                    onValueChange={(value: 'primary' | 'secondary' | 'outline') => {
                                      const newButtons = (selectedSlide.buttons || []).map(b =>
                                        b.id === btn.id ? { ...b, variant: value } : b
                                      );
                                      updateSelectedSlide({ buttons: newButtons });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Estilo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="primary">Primario</SelectItem>
                                      <SelectItem value="secondary">Secundario</SelectItem>
                                      <SelectItem value="outline">Contorno</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </Card>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newButton: ButtonData = { id: crypto.randomUUID(), label: '', url: '', variant: 'primary' };
                                updateSelectedSlide({ buttons: [...(selectedSlide.buttons || []), newButton] });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Añadir botón
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Highlight Boxes Section */}
                      <AccordionItem value="highlight_boxes">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Cajas destacadas ({(selectedSlide.highlight_boxes || []).length})
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {(selectedSlide.highlight_boxes || []).map((box, idx) => (
                              <Card key={box.id} className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs flex items-center gap-1">
                                      {box.type === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                                      {box.type === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                                      {box.type === 'tip' && <Lightbulb className="h-3 w-3 text-green-500" />}
                                      {box.type === 'important' && <AlertCircle className="h-3 w-3 text-red-500" />}
                                      Caja {idx + 1}
                                    </Label>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        const newBoxes = (selectedSlide.highlight_boxes || []).filter(b => b.id !== box.id);
                                        updateSelectedSlide({ highlight_boxes: newBoxes });
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <Select
                                    value={box.type}
                                    onValueChange={(value: 'info' | 'warning' | 'tip' | 'important') => {
                                      const newBoxes = (selectedSlide.highlight_boxes || []).map(b =>
                                        b.id === box.id ? { ...b, type: value } : b
                                      );
                                      updateSelectedSlide({ highlight_boxes: newBoxes });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="info">
                                        <div className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" /> Información</div>
                                      </SelectItem>
                                      <SelectItem value="warning">
                                        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Advertencia</div>
                                      </SelectItem>
                                      <SelectItem value="tip">
                                        <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-green-500" /> Consejo</div>
                                      </SelectItem>
                                      <SelectItem value="important">
                                        <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> Importante</div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={box.title}
                                    onChange={(e) => {
                                      const newBoxes = (selectedSlide.highlight_boxes || []).map(b =>
                                        b.id === box.id ? { ...b, title: e.target.value } : b
                                      );
                                      updateSelectedSlide({ highlight_boxes: newBoxes });
                                    }}
                                    placeholder="Título de la caja"
                                  />
                                  <Textarea
                                    value={box.content}
                                    onChange={(e) => {
                                      const newBoxes = (selectedSlide.highlight_boxes || []).map(b =>
                                        b.id === box.id ? { ...b, content: e.target.value } : b
                                      );
                                      updateSelectedSlide({ highlight_boxes: newBoxes });
                                    }}
                                    placeholder="Contenido de la caja..."
                                    className="min-h-[80px]"
                                  />
                                </div>
                              </Card>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newBox: HighlightBoxData = { id: crypto.randomUUID(), type: 'info', title: '', content: '' };
                                updateSelectedSlide({ highlight_boxes: [...(selectedSlide.highlight_boxes || []), newBox] });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Añadir caja destacada
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un slide para editarlo</p>
                  <p className="text-sm mt-2">o crea uno nuevo con el botón "Añadir Slide"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* PDF Importer Modal */}
      <PDFToSyllabusImporter
        open={showPDFImporter}
        onOpenChange={setShowPDFImporter}
        unitId={unitId}
        unitTitle={unitTitle}
        onImportComplete={loadSlides}
      />
    </Dialog>
  );
}
