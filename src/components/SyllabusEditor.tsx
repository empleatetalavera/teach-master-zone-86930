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
import {
  Plus, Trash2, Save, Loader2, GripVertical, Eye, Edit2, FileText,
  HelpCircle, CheckSquare, Table2, BookOpen, X, Copy, ArrowUp, ArrowDown, Upload
} from "lucide-react";

interface SyllabusEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
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
      };
      setSlides(prev => [...prev, typedData]);
      setSelectedSlide(typedData);
      toast({ title: "Slide añadido" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo añadir el slide", variant: "destructive" });
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

      const typedData = {
        ...data,
        table_data: data.table_data as { headers: string[]; rows: string[][] } | null,
        quiz_data: data.quiz_data as { question: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation: string; hint?: string } | null,
        checklist_items: data.checklist_items as { id: string; text: string }[] | null,
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
