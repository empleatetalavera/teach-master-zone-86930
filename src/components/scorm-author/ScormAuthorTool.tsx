import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slide, SlideType, ScormProject, ScormSettings } from "./types";
import { SlideTypeSelector } from "./SlideTypeSelector";
import { SlideEditor } from "./SlideEditor";
import { SlidePreview } from "./SlidePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Download, 
  Save, 
  FileUp, 
  Sparkles,
  Play,
  Settings,
  ChevronLeft,
  ChevronRight,
  Type,
  FileText,
  HelpCircle,
  Video,
  Image,
  MousePointer2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Generate simple ID
const generateId = () => Math.random().toString(36).substring(2, 11);

interface SortableSlideItemProps {
  slide: Slide;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableSlideItem({ slide, isSelected, onSelect, onDelete }: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSlideIcon = () => {
    switch (slide.type) {
      case 'title': return <Type className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'hotspot': return <MousePointer2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/10 shadow-sm' 
          : 'border-transparent hover:border-muted-foreground/30 hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab hover:text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-shrink-0 w-16 h-10 bg-muted rounded overflow-hidden flex items-center justify-center">
        {getSlideIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{slide.title || 'Sin título'}</p>
        <p className="text-xs text-muted-foreground capitalize">{slide.type}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface ScormAuthorToolProps {
  moduleId?: string;
  formativeUnitId?: string;
  initialSlides?: Slide[];
  onSave?: (project: ScormProject) => void;
  onExportScorm?: (project: ScormProject) => void;
  onGenerateFromPDF?: (file: File) => Promise<Slide[]>;
}

export function ScormAuthorTool({ 
  moduleId, 
  formativeUnitId, 
  initialSlides = [],
  onSave,
  onExportScorm,
  onGenerateFromPDF
}: ScormAuthorToolProps) {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(
    initialSlides.length > 0 ? initialSlides[0].id : null
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [projectTitle, setProjectTitle] = useState("Nuevo Contenido SCORM");
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedSlide = slides.find(s => s.id === selectedSlideId) || null;

  const createSlide = (type: SlideType): Slide => {
    const baseSlide = {
      id: generateId(),
      type,
      title: `Nuevo ${type}`,
      order: slides.length,
    };

    switch (type) {
      case 'title':
        return { ...baseSlide, type: 'title', subtitle: '', author: '' };
      case 'content':
        return { ...baseSlide, type: 'content', content: '', layout: 'single' };
      case 'quiz':
        return { 
          ...baseSlide, 
          type: 'quiz', 
          question: '',
          question_type: 'multiple-choice',
          options: [
            { id: generateId(), text: 'Opción A', isCorrect: true },
            { id: generateId(), text: 'Opción B', isCorrect: false },
            { id: generateId(), text: 'Opción C', isCorrect: false },
            { id: generateId(), text: 'Opción D', isCorrect: false },
          ],
          explanation: '',
          points: 1,
          max_attempts: 2,
          shuffle_options: true
        };
      case 'video':
        return { ...baseSlide, type: 'video', video_url: '', video_type: 'youtube', autoplay: false, controls: true };
      case 'image':
        return { ...baseSlide, type: 'image', image_url: '', alt_text: '', zoom_enabled: true };
      case 'hotspot':
        return { ...baseSlide, type: 'hotspot', image_url: '', hotspots: [], instruction: '' };
      case 'dragdrop':
        return { ...baseSlide, type: 'dragdrop', instruction: '', items: [], zones: [], feedback_correct: '¡Correcto!', feedback_incorrect: 'Inténtalo de nuevo' };
      case 'accordion':
        return { ...baseSlide, type: 'accordion', items: [], allow_multiple_open: false };
      case 'tabs':
        return { ...baseSlide, type: 'tabs', tabs: [] };
      case 'timeline':
        return { ...baseSlide, type: 'timeline', events: [], orientation: 'horizontal' };
      case 'summary':
        return { ...baseSlide, type: 'summary', key_points: [] };
      default:
        return baseSlide as Slide;
    }
  };

  const handleAddSlide = (type: SlideType) => {
    const newSlide = createSlide(type);
    setSlides([...slides, newSlide]);
    setSelectedSlideId(newSlide.id);
    setShowAddSlide(false);
    toast({ title: "Slide añadido", description: `Se ha creado un nuevo slide de tipo ${type}` });
  };

  const handleDeleteSlide = (slideId: string) => {
    const newSlides = slides.filter(s => s.id !== slideId);
    setSlides(newSlides);
    if (selectedSlideId === slideId) {
      setSelectedSlideId(newSlides.length > 0 ? newSlides[0].id : null);
    }
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    setSlides(slides.map(s => s.id === updatedSlide.id ? updatedSlide : s));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order: idx
        }));
      });
    }
  };

  const handleSave = () => {
    const project: ScormProject = {
      id: generateId(),
      title: projectTitle,
      version: '1.0',
      scorm_version: '2004',
      language: 'es',
      slides,
      settings: {
        passing_score: 70,
        max_attempts: 3,
        show_progress: true,
        allow_navigation: true,
        completion_threshold: 80,
        theme: {
          primary_color: 'hsl(var(--primary))',
          secondary_color: 'hsl(var(--secondary))',
          font_family: 'Inter',
          header_style: 'full'
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      module_id: moduleId,
      formative_unit_id: formativeUnitId
    };
    
    onSave?.(project);
    toast({ title: "Proyecto guardado", description: "Los cambios se han guardado correctamente" });
  };

  const handleExport = () => {
    const project: ScormProject = {
      id: generateId(),
      title: projectTitle,
      version: '1.0',
      scorm_version: '2004',
      language: 'es',
      slides,
      settings: {
        passing_score: 70,
        max_attempts: 3,
        show_progress: true,
        allow_navigation: true,
        completion_threshold: 80,
        theme: {
          primary_color: 'hsl(var(--primary))',
          secondary_color: 'hsl(var(--secondary))',
          font_family: 'Inter',
          header_style: 'full'
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      module_id: moduleId,
      formative_unit_id: formativeUnitId
    };
    
    onExportScorm?.(project);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onGenerateFromPDF) return;

    setIsGenerating(true);
    try {
      const generatedSlides = await onGenerateFromPDF(file);
      setSlides([...slides, ...generatedSlides]);
      toast({ 
        title: "Contenido generado", 
        description: `Se han generado ${generatedSlides.length} slides desde el PDF` 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo generar el contenido desde el PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview mode
  if (previewMode) {
    const currentSlide = slides[previewIndex];
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="border-b p-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setPreviewMode(false)}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Volver al editor
            </Button>
            <Badge variant="secondary">
              Slide {previewIndex + 1} de {slides.length}
            </Badge>
          </div>
          <h2 className="font-semibold">{projectTitle}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={previewIndex === 0}
              onClick={() => setPreviewIndex(previewIndex - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={previewIndex === slides.length - 1}
              onClick={() => setPreviewIndex(previewIndex + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-8 flex items-center justify-center bg-muted/30">
          <div className="w-full max-w-4xl aspect-video">
            {currentSlide && <SlidePreview slide={currentSlide} isInteractive />}
          </div>
        </div>
        <div className="border-t p-2 bg-card flex justify-center gap-1 overflow-x-auto">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setPreviewIndex(idx)}
              className={`w-16 h-10 rounded border flex-shrink-0 text-xs flex items-center justify-center transition-all ${
                idx === previewIndex 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-64 font-semibold"
            placeholder="Título del proyecto"
          />
          <Badge variant="secondary">{slides.length} slides</Badge>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isGenerating}
            />
            <Button variant="outline" asChild disabled={isGenerating}>
              <span>
                {isGenerating ? (
                  <>Generando...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Generar desde PDF
                  </>
                )}
              </span>
            </Button>
          </label>
          <Button variant="outline" onClick={() => setPreviewMode(true)} disabled={slides.length === 0}>
            <Play className="w-4 h-4 mr-2" /> Vista previa
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={slides.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Exportar SCORM
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Slide list */}
        <div className="w-64 border-r flex flex-col bg-muted/30">
          <div className="p-3 border-b">
            <Dialog open={showAddSlide} onOpenChange={setShowAddSlide}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Añadir slide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Añadir nuevo slide</DialogTitle>
                </DialogHeader>
                <SlideTypeSelector onSelect={handleAddSlide} />
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1 p-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={slides.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {slides.map((slide) => (
                    <SortableSlideItem
                      key={slide.id}
                      slide={slide}
                      isSelected={selectedSlideId === slide.id}
                      onSelect={() => setSelectedSlideId(slide.id)}
                      onDelete={() => handleDeleteSlide(slide.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {slides.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay slides</p>
                <p className="text-xs">Añade tu primer slide para empezar</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex">
          {selectedSlide ? (
            <>
              {/* Slide editor */}
              <div className="w-96 border-r overflow-auto">
                <SlideEditor
                  slide={selectedSlide}
                  onUpdate={handleUpdateSlide}
                />
              </div>

              {/* Preview */}
              <div className="flex-1 p-6 bg-muted/20 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-muted-foreground">Vista previa</h3>
                    <Badge variant="outline">{selectedSlide.type}</Badge>
                  </div>
                  <div className="aspect-video shadow-lg rounded-lg overflow-hidden">
                    <SlidePreview slide={selectedSlide} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Selecciona un slide para editarlo</p>
                <p className="text-sm">o añade uno nuevo para empezar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
