import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, FileText, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  GraduationCap, Lightbulb, FileQuestion, Download, Home, 
  ClipboardList, Play, Headphones, Video, Send, X, MessageCircle,
  BarChart3, BookMarked, HelpCircle, Check, Building2, Users, 
  Briefcase, FileSpreadsheet, Mail, Package, Calculator, CreditCard,
  Palette, Sparkles, Edit2, Menu
} from "lucide-react";
import { SyllabusEditor } from "@/components/SyllabusEditor";
import { SelfAssessmentQuiz } from "@/components/SelfAssessmentQuiz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentSlide, IndexItem, QuizQuestion, ExtendedContentSlide } from "./scorm/types";

interface ScormProfessionalViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  enrollmentId?: string;
  courseId?: string;
}

// Types imported from ./scorm/types - no local duplicates needed

// Theme definitions - iSpring/Canva style
const CONTENT_THEMES = [
  { 
    id: 'modern-blue', 
    name: '🌊 Océano Moderno', 
    headerBg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    contentBg: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-500',
    border: 'border-blue-200',
    highlight: 'bg-blue-100',
  },
  { 
    id: 'forest-green', 
    name: '🌲 Bosque Profesional', 
    headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    contentBg: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-500',
    border: 'border-emerald-200',
    highlight: 'bg-emerald-100',
  },
  { 
    id: 'sunset-warm', 
    name: '🌅 Atardecer Cálido', 
    headerBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
    contentBg: 'bg-gradient-to-br from-orange-50 via-white to-rose-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-500',
    border: 'border-orange-200',
    highlight: 'bg-orange-100',
  },
  { 
    id: 'royal-purple', 
    name: '👑 Púrpura Elegante', 
    headerBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
    contentBg: 'bg-gradient-to-br from-purple-50 via-white to-pink-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-purple-600',
    accentBg: 'bg-purple-500',
    border: 'border-purple-200',
    highlight: 'bg-purple-100',
  },
  { 
    id: 'slate-minimal', 
    name: '🖤 Minimalista Oscuro', 
    headerBg: 'bg-gradient-to-r from-slate-800 to-slate-600',
    contentBg: 'bg-gradient-to-br from-slate-100 via-white to-gray-100',
    cardBg: 'bg-white/95 backdrop-blur',
    accent: 'text-slate-700',
    accentBg: 'bg-slate-700',
    border: 'border-slate-300',
    highlight: 'bg-slate-200',
  },
  { 
    id: 'corporate-sepe', 
    name: '🏛️ Corporativo SEPE', 
    headerBg: 'bg-gradient-to-r from-primary to-primary/80',
    contentBg: 'bg-slate-50',
    cardBg: 'bg-white',
    accent: 'text-primary',
    accentBg: 'bg-primary',
    border: 'border-primary',
    highlight: 'bg-primary/10',
  },
  { 
    id: 'ispring-teal', 
    name: '✨ iSpring Profesional', 
    headerBg: 'bg-gradient-to-r from-teal-600 to-teal-500',
    contentBg: 'bg-white',
    cardBg: 'bg-white',
    accent: 'text-teal-600',
    accentBg: 'bg-teal-600',
    border: 'border-teal-500',
    highlight: 'bg-teal-50',
  },
];

// Sidebar menu items
const SIDEBAR_MENU = [
  { id: 'glossary', icon: BookOpen, label: 'Glosario', color: 'text-red-500' },
  { id: 'downloads', icon: Download, label: 'Descargas', color: 'text-pink-500' },
  { id: 'exercises', icon: ClipboardList, label: 'Ejercicios', color: 'text-yellow-500' },
  { id: 'test', icon: FileQuestion, label: 'Test', color: 'text-green-500' },
  { id: 'progress', icon: BarChart3, label: 'Progreso', color: 'text-blue-500' },
  { id: 'audio', icon: Headphones, label: 'Audioteca', color: 'text-purple-500' },
  { id: 'video', icon: Video, label: 'Videoteca', color: 'text-indigo-500' },
];

// Tab items for top navigation
const TOP_TABS = [
  { id: 'glossary', label: 'Glosario' },
  { id: 'downloads', label: 'Descargas' },
  { id: 'exercises', label: 'Ejercicios' },
  { id: 'test', label: 'Test' },
];

// All slide content is now loaded dynamically from the database (unit_syllabus_slides table)
// No hardcoded content - each course generates its own slides via AI from uploaded PDFs

// Generate index from slides
const generateIndex = (slides: ContentSlide[]): IndexItem[] => {
  const sections: Record<string, IndexItem> = {};
  
  slides.forEach((slide, index) => {
    const section = slide.section || 'General';
    if (!sections[section]) {
      sections[section] = {
        id: `section-${Object.keys(sections).length + 1}`,
        title: section,
        subItems: []
      };
    }
    sections[section].subItems?.push({
      id: slide.id,
      title: slide.title,
      completed: false
    });
  });

  return Object.values(sections);
};

export default function ScormProfessionalViewer({
  open,
  onOpenChange,
  unitId,
  unitTitle,
  enrollmentId,
  courseId,
}: ScormProfessionalViewerProps) {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  // Editor state
  const [syllabusEditorOpen, setSyllabusEditorOpen] = useState(false);
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin';
  
  const [slides, setSlides] = useState<ContentSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarOpen, setSidebarOpen] = useState(typeof window === 'undefined' ? true : window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [selectedTheme, setSelectedTheme] = useState(CONTENT_THEMES[6]); // Default: iSpring Teal
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '¡Hola soy Hugo! 👋 ¿En qué puedo ayudarte con el temario?' }
  ]);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  
  // Checklist state
  const [checklistState, setChecklistState] = useState<Record<string, Record<string, boolean>>>({});

  // Load slides from database
  useEffect(() => {
    const loadSlidesFromDatabase = async () => {
      if (!open || !unitId) {
        console.log("[ScormProfessionalViewer] Skipping load - open:", open, "unitId:", unitId);
        return;
      }
      
      console.log("[ScormProfessionalViewer] Loading slides for unitId:", unitId);
      setLoadingSlides(true);
      try {
        const { data, error } = await supabase
          .from("unit_syllabus_slides")
          .select("*")
          .eq("formative_unit_id", unitId)
          .eq("is_active", true)
          .order("order_index");

        console.log("[ScormProfessionalViewer] Query result - data:", data?.length, "error:", error);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform database slides to ContentSlide format
          const dbSlides: ContentSlide[] = data.map((item: any) => ({
            id: item.id,
            type: item.slide_type as ContentSlide['type'],
            title: item.title || '',
            content: item.content || '',
            keyTerms: item.key_terms || [],
            section: item.section_title || undefined,
            tableData: item.table_data as { headers: string[]; rows: string[][] } | undefined,
            checklistItems: item.checklist_items as { id: string; text: string }[] | undefined,
            quiz: item.quiz_data ? {
              id: `quiz-${item.id}`,
              question: (item.quiz_data as any).question || '',
              options: (item.quiz_data as any).options || [],
              explanation: (item.quiz_data as any).explanation || '',
              hint: (item.quiz_data as any).hint
            } : undefined
          }));
          setSlides(dbSlides);
        } else {
          // No slides exist for this unit - show empty state placeholder
          setSlides([{
            id: 'empty-placeholder',
            type: 'intro',
            title: unitTitle || 'Sin contenido',
            content: `# 📚 Contenido pendiente de generar\n\nEsta unidad formativa aún no tiene contenido interactivo generado.\n\n**Para crear el contenido:**\n1. Accede al **Modo Edición** del curso\n2. Abre el **Editor SCORM Avanzado** de esta unidad\n3. Usa la **Plantilla BOE** o genera contenido desde un **PDF**\n4. Guarda el proyecto para que aparezca aquí\n\nEl contenido se generará específicamente para esta unidad formativa del certificado.`
          }]);
        }
      } catch (error) {
        console.error("Error loading slides from database:", error);
        setSlides([{
          id: 'error-placeholder',
          type: 'intro',
          title: unitTitle || 'Error',
          content: `# ⚠️ Error al cargar el contenido\n\nNo se pudo cargar el contenido interactivo de esta unidad.\n\nPor favor, inténtalo de nuevo más tarde o contacta con tu tutor.`
        }]);
      } finally {
        setLoadingSlides(false);
      }
    };

    loadSlidesFromDatabase();
  }, [open, unitId, unitTitle]);

  const currentSlide = slides[currentSlideIndex];
  const progress = slides.length > 0 ? ((completedSlides.size + 1) / slides.length) * 100 : 0;
  const indexItems = generateIndex(slides);

  // Load manual PDFs dynamically from database
  const [manualFiles, setManualFiles] = useState<{ name: string; filePath: string }[]>([]);
  useEffect(() => {
    const loadManuals = async () => {
      if (!open || !unitId) return;
      try {
        let { data } = await supabase
          .from('module_content')
          .select('title, file_path, file_name')
          .eq('content_type', 'manual_pdf')
          .eq('formative_unit_id', unitId)
          .eq('is_active', true);
        
        if (!data || data.length === 0) {
          const { data: unitData } = await supabase
            .from('formative_units')
            .select('module_id')
            .eq('id', unitId)
            .single();
          
          if (unitData?.module_id) {
            const { data: modulePdfs } = await supabase
              .from('module_content')
              .select('title, file_path, file_name')
              .eq('module_id', unitData.module_id)
              .eq('content_type', 'manual_pdf')
              .is('formative_unit_id', null)
              .eq('is_active', true);
            data = modulePdfs;
          }
        }

        setManualFiles((data || []).map((d: any) => ({
          name: d.title || d.file_name || 'Manual PDF',
          filePath: d.file_path
        })));
      } catch (err) {
        console.error('Error loading manuals:', err);
      }
    };
    loadManuals();
  }, [open, unitId]);


  const downloadManualPdf = async (filePath: string, fileName: string) => {
    try {
      const { data: signedData } = await supabase.storage
        .from('module-content')
        .createSignedUrl(filePath, 3600);

      if (!signedData?.signedUrl) throw new Error('No se pudo generar el enlace del manual');

      const response = await fetch(signedData.signedUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${fileName || 'manual'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error('Error downloading manual PDF:', err);
      toast({
        title: 'Error al abrir manual',
        description: 'No se pudo descargar el manual. Reintenta en unos segundos.',
        variant: 'destructive'
      });
    }
  };

  // Mark slide as completed when navigating
  useEffect(() => {
    if (currentSlideIndex > 0) {
      setCompletedSlides(prev => new Set([...prev, currentSlideIndex - 1]));
    }
  }, [currentSlideIndex]);

  // Save progress to database
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || !enrollmentId || slides.length === 0) return;
      
      try {
        await supabase.from('module_progress').upsert({
          enrollment_id: enrollmentId,
          module_id: unitId,
          completed: completedSlides.size >= slides.length - 1,
          last_position: currentSlideIndex.toString(),
          time_spent_minutes: Math.floor(completedSlides.size * 2)
        }, { onConflict: 'enrollment_id,module_id' });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    const debounce = setTimeout(saveProgress, 2000);
    return () => clearTimeout(debounce);
  }, [completedSlides, currentSlideIndex, user, enrollmentId, unitId, slides.length]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCompletedSlides(prev => new Set([...prev, currentSlideIndex]));
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleQuizAnswer = (slideId: string, optionId: string, isCorrect: boolean) => {
    if (quizResults[slideId] !== undefined) return;
    
    setQuizAnswers(prev => ({ ...prev, [slideId]: optionId }));
    setQuizResults(prev => ({ ...prev, [slideId]: isCorrect }));
    
    toast({
      title: isCorrect ? "✅ ¡Correcto!" : "❌ Respuesta incorrecta",
      description: isCorrect ? "¡Excelente trabajo! Sigue así." : "Lee la explicación para entender mejor.",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const handleChecklistToggle = (slideId: string, itemId: string) => {
    setChecklistState(prev => ({
      ...prev,
      [slideId]: {
        ...prev[slideId],
        [itemId]: !prev[slideId]?.[itemId]
      }
    }));
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatMessage }]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Gracias por tu pregunta. Estoy aquí para ayudarte con cualquier duda sobre el contenido del curso. ¿Hay algún concepto específico que te gustaría que te explicara?' 
      }]);
    }, 1000);
  };

  const goToSlide = (slideId: string) => {
    const index = slides.findIndex(s => s.id === slideId);
    if (index !== -1) {
      setCurrentSlideIndex(index);
      setActiveTab('content');
    }
  };

  if (!open) return null;

  if (loadingSlides) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando contenido interactivo...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (slides.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin contenido disponible</h3>
            <p className="text-muted-foreground text-sm">
              Esta unidad aún no tiene contenido interactivo. Un administrador puede añadirlo desde el editor de temario.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-[100dvh] max-w-none sm:max-w-[95vw] sm:h-[95vh] flex flex-col p-0 gap-0 overflow-hidden rounded-none sm:rounded-lg">
        {/* Top header bar with theme */}
        <div className={`${selectedTheme.headerBg} text-white`}>
          {/* Unit title bar with theme selector */}
          <div className="px-3 sm:px-4 py-2 flex items-center justify-between border-b border-white/20 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 lg:hidden bg-white/20 hover:bg-white/30 text-white shrink-0"
                onClick={() => setSidebarOpen(o => !o)}
                aria-label="Abrir menú"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">{unitTitle}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Edit button for admins/teachers */}
              {isTeacherOrAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 bg-white/20 hover:bg-white/30 text-white border-white/30 border hidden sm:inline-flex"
                  onClick={() => setSyllabusEditorOpen(true)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              <Palette className="h-4 w-4 hidden sm:block" />
              <Select 
                value={selectedTheme.id} 
                onValueChange={(value) => {
                  const theme = CONTENT_THEMES.find(t => t.id === value);
                  if (theme) setSelectedTheme(theme);
                }}
              >
                <SelectTrigger className="h-8 w-[140px] sm:w-[180px] bg-white/20 border-white/30 text-white text-xs">
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_THEMES.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id} className="text-sm">
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tabs navigation - scrollable horizontally on small screens */}
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 py-2 px-3 overflow-x-auto">
            {TOP_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium transition-all hover:opacity-100 whitespace-nowrap ${
                  activeTab === tab.id ? 'opacity-100 border-b-2 border-white pb-1' : 'opacity-70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content area with theme */}
        <div className={`flex-1 flex overflow-hidden relative ${selectedTheme.contentBg} dark:from-slate-900 dark:to-slate-800`}>
          {/* Mobile overlay backdrop */}
          {sidebarOpen && isMobile && (
            <div
              className="absolute inset-0 bg-black/40 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          {/* Left Sidebar - overlay on mobile, push on desktop */}
          <div className={`${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'} ${isMobile ? 'absolute inset-y-0 left-0 z-30 w-72' : 'relative'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-r border-border flex flex-col`}>
            {/* Sidebar header with home icon */}
            <div className="p-4 border-b flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('content')}
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Home className="h-5 w-5" />
              </button>
              <span className="font-medium text-sm">Navegación</span>
            </div>

            {/* Menu items */}
            <div className="p-3 space-y-1">
              {SIDEBAR_MENU.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Index section */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-t border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">📑 Índice del Temario</span>
                  <Badge variant="secondary" className="text-xs">
                    {slides.length} páginas
                  </Badge>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {indexItems.map((section) => (
                    <div key={section.id} className="space-y-0.5">
                      <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-primary bg-primary/5 rounded">
                        <BookOpen className="h-3 w-3" />
                        <span>{section.title}</span>
                      </div>
                      {section.subItems?.map((item, idx) => {
                        const slideIndex = slides.findIndex(s => s.id === item.id);
                        const isCompleted = completedSlides.has(slideIndex);
                        const isCurrent = slideIndex === currentSlideIndex;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => goToSlide(item.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
                              isCurrent 
                                ? 'bg-primary text-primary-foreground font-medium' 
                                : isCompleted
                                  ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100'
                                  : 'hover:bg-muted/50'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                            )}
                            <span className="truncate text-left">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content header */}
            <div className="bg-white dark:bg-slate-800 border-b px-6 py-4">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                {currentSlide?.type === 'quiz' ? (
                  <FileQuestion className="h-4 w-4" />
                ) : currentSlide?.type === 'checklist' ? (
                  <ClipboardList className="h-4 w-4" />
                ) : currentSlide?.type === 'table' ? (
                  <FileSpreadsheet className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{currentSlide?.section || 'Contenido'}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {currentSlide?.title || 'Contenido del Curso'}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Progress value={progress} className="flex-1 h-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Content body */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-4xl mx-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activeTab === 'test' ? (
                  /* TEST FINAL DE LA UNIDAD - Subsanación SEPE: evaluación accesible y con calificación persistente */
                  <div className="space-y-4">
                    <Card className="border-2 border-primary/30 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileQuestion className="h-6 w-6 text-primary" />
                          Test Final de la Unidad
                        </CardTitle>
                        <CardDescription>
                          Realiza el test de evaluación de esta unidad formativa. Tu calificación quedará registrada y podrás consultarla, así como tu tutor y el centro.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    {courseId ? (
                      <SelfAssessmentQuiz
                        courseId={courseId}
                        formativeUnitId={unitId}
                        formativeUnitTitle={unitTitle}
                      />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No se ha podido cargar el contexto del curso. Recarga la página e inténtalo de nuevo.
                      </div>
                    )}
                  </div>
                ) : activeTab === 'content' ? (
                  <>
                    {/* QUIZ SLIDE */}
                    {currentSlide?.type === 'quiz' && currentSlide.quiz ? (
                      <Card className="border-2 border-primary/20">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileQuestion className="h-5 w-5 text-primary" />
                            📝 Pregunta de Autoevaluación
                          </CardTitle>
                          <CardDescription className="text-base font-medium text-foreground mt-2">
                            {currentSlide.quiz.question}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                          {currentSlide.quiz.options.map((option) => {
                            const isSelected = quizAnswers[currentSlide.id] === option.id;
                            const hasAnswered = quizResults[currentSlide.id] !== undefined;
                            const isCorrectOption = option.isCorrect;
                            
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleQuizAnswer(currentSlide.id, option.id, option.isCorrect)}
                                disabled={hasAnswered}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                                  hasAnswered
                                    ? isCorrectOption
                                      ? 'bg-green-50 border-green-500 dark:bg-green-900/30'
                                      : isSelected
                                        ? 'bg-red-50 border-red-500 dark:bg-red-900/30'
                                        : 'opacity-50 border-muted'
                                    : 'hover:border-primary hover:bg-primary/5 border-muted hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    hasAnswered && isCorrectOption
                                      ? 'bg-green-500 text-white'
                                      : hasAnswered && isSelected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-muted'
                                  }`}>
                                    {option.id.toUpperCase()}
                                  </span>
                                  <span className="flex-1 text-base">{option.text}</span>
                                  {hasAnswered && isCorrectOption && (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {/* Hint button */}
                          {currentSlide.quiz.hint && !quizResults[currentSlide.id] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowHint(prev => ({ ...prev, [currentSlide.id]: !prev[currentSlide.id] }))}
                              className="mt-4"
                            >
                              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                              {showHint[currentSlide.id] ? 'Ocultar pista' : '💡 Ver pista'}
                            </Button>
                          )}

                          {showHint[currentSlide.id] && currentSlide.quiz.hint && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-sm border-2 border-yellow-300">
                              <span className="font-bold">💡 Pista:</span> {currentSlide.quiz.hint}
                            </div>
                          )}

                          {/* Explanation */}
                          {quizResults[currentSlide.id] !== undefined && (
                            <div className={`p-4 rounded-xl mt-4 ${
                              quizResults[currentSlide.id]
                                ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-300'
                                : 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300'
                            }`}>
                              <p className="font-bold mb-2 text-base">
                                {quizResults[currentSlide.id] ? '✅ ¡Correcto!' : '📖 Explicación:'}
                              </p>
                              <p className="text-sm">{currentSlide.quiz.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : currentSlide?.type === 'table' && currentSlide.tableData ? (
                      /* TABLE SLIDE */
                      <div className="space-y-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentSlide.content}
                          </ReactMarkdown>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                            <thead>
                              <tr className="bg-primary text-primary-foreground">
                                {currentSlide.tableData.headers.map((header, idx) => (
                                  <th key={idx} className="px-4 py-3 text-left font-bold text-sm border-b border-primary-foreground/20">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentSlide.tableData.rows.map((row, rowIdx) => (
                                <tr 
                                  key={rowIdx} 
                                  className={`${rowIdx % 2 === 0 ? 'bg-muted/30' : 'bg-white dark:bg-slate-800'} hover:bg-primary/5 transition-colors`}
                                >
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-4 py-3 text-sm border-b border-muted">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {currentSlide.keyTerms && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="text-sm font-medium text-muted-foreground">Términos clave:</span>
                            {currentSlide.keyTerms.map((term, idx) => (
                              <Badge key={idx} variant="secondary">{term}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : currentSlide?.type === 'checklist' && currentSlide.checklistItems ? (
                      /* CHECKLIST SLIDE */
                      <Card className="border-2 border-primary/20">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                          <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Lista de Verificación
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {currentSlide.content}
                            </ReactMarkdown>
                          </div>
                          <div className="space-y-3">
                            {currentSlide.checklistItems.map((item) => {
                              const isChecked = checklistState[currentSlide.id]?.[item.id] || false;
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                    isChecked 
                                      ? 'bg-green-50 border-green-300 dark:bg-green-900/30' 
                                      : 'bg-muted/30 border-muted hover:border-primary'
                                  }`}
                                  onClick={() => handleChecklistToggle(currentSlide.id, item.id)}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => handleChecklistToggle(currentSlide.id, item.id)}
                                    className="h-5 w-5"
                                  />
                                  <span className={`flex-1 ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.text}
                                  </span>
                                  {isChecked && <Check className="h-5 w-5 text-green-500" />}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              ✅ Completados: {Object.values(checklistState[currentSlide?.id] || {}).filter(Boolean).length} / {currentSlide.checklistItems.length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : currentSlide?.type === 'intro' ? (
                      /* INTRO/COVER SLIDE - iSpring/Canva Style */
                      <div className="relative min-h-[500px] rounded-2xl overflow-hidden bg-white">
                        {/* Main layout - split design */}
                        <div className="flex h-full">
                          {/* Left side - Decorative collage */}
                          <div className="w-1/2 relative">
                            {/* Diagonal grid of images and teal blocks */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="grid grid-cols-3 gap-2 transform rotate-12 scale-125 -translate-x-8 -translate-y-8">
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/80 rounded-xl overflow-hidden">
                                  <img 
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300" 
                                    alt="Team collaboration" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/70 rounded-xl overflow-hidden">
                                  <img 
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300" 
                                    alt="Office work" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/60 rounded-xl overflow-hidden">
                                  <img 
                                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300" 
                                    alt="Business meeting" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/50 rounded-xl" />
                                <div className="h-32 bg-primary rounded-xl" />
                              </div>
                            </div>
                          </div>

                          {/* Right side - Content */}
                          <div className="w-1/2 flex flex-col justify-between p-8 z-10">
                            {/* Center logo placeholder */}
                            <div className="flex justify-center">
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-primary">
                                  <Building2 className="h-8 w-8" />
                                  <span className="text-2xl font-bold">CENTRO DE FORMACIÓN</span>
                                </div>
                              </div>
                            </div>

                            {/* Title section */}
                            <div className="text-center space-y-4">
                              <h1 className="text-4xl font-black text-slate-800 leading-tight">
                                {currentSlide.title.replace(/^.*? - /, '').toUpperCase()}
                              </h1>
                              <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
                            </div>

                            {/* SEPE logo placeholder */}
                            <div className="flex justify-center">
                              <div className="flex items-center gap-4 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="text-xs text-slate-600">
                                  <span className="font-semibold">MINISTERIO DE TRABAJO</span>
                                  <br />
                                  <span>Y ECONOMÍA SOCIAL</span>
                                </div>
                                <div className="text-amber-600 font-bold text-lg">SEPE</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* REGULAR CONTENT SLIDE - iSpring/Canva Professional Style */
                      <div className="relative">
                        {/* Professional card with teal border */}
                        <div className="bg-white rounded-2xl border-4 border-primary shadow-xl overflow-hidden">
                          {/* Content area */}
                          <div className="p-8">
                            {/* Process headings with section letters (A, B, C...) */}
                            <div className="prose prose-lg max-w-none 
                              prose-headings:font-black prose-headings:text-slate-800
                              prose-h1:text-3xl prose-h1:mb-6
                              prose-h2:text-xl prose-h2:mb-4
                              prose-h3:text-lg prose-h3:font-bold prose-h3:text-slate-700
                              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
                              prose-ul:space-y-1
                              prose-li:text-primary prose-li:font-medium
                              prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                              prose-strong:text-slate-800
                              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                              prose-table:border-collapse
                              prose-td:border prose-td:border-slate-200 prose-td:p-3
                              prose-th:border prose-th:border-slate-200 prose-th:p-3 prose-th:bg-primary/10 prose-th:font-bold
                            ">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Custom list items with teal color
                                  li: ({ children }) => (
                                    <li className="text-primary font-medium">
                                      {children}
                                    </li>
                                  ),
                                  // Links in teal with colon styling
                                  a: ({ children, href }) => (
                                    <a href={href} className="text-primary font-semibold hover:underline">
                                      {children}
                                    </a>
                                  ),
                                  // Headers with proper styling
                                  h1: ({ children }) => (
                                    <h1 className="text-3xl font-black text-slate-800 mb-6">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <div className="flex items-start gap-3 mb-4">
                                      <div className="w-4 h-4 bg-primary rounded mt-1 flex-shrink-0" />
                                      <h2 className="text-xl font-black text-slate-800 m-0">
                                        {children}
                                      </h2>
                                    </div>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-lg font-bold text-slate-700 mb-3">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({ children }) => (
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                      {children}
                                    </p>
                                  ),
                                  // Styled blockquotes
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary bg-primary/5 py-3 px-4 rounded-r-lg my-4 not-italic">
                                      {children}
                                    </blockquote>
                                  ),
                                }}
                              >
                                {currentSlide?.content || ''}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>

                        {/* Key terms bar at bottom */}
                        {currentSlide?.keyTerms && currentSlide.keyTerms.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 px-2">
                            <span className="text-sm font-semibold text-slate-500">🔑 Términos clave:</span>
                            {currentSlide.keyTerms.map((term, idx) => (
                              <Badge 
                                key={idx} 
                                className="bg-primary/10 text-primary border border-primary/20 font-medium"
                              >
                                {term}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : activeTab === 'downloads' ? (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-transparent dark:from-pink-900/20">
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-pink-500" />
                        📥 Descargas Disponibles
                      </CardTitle>
                      <CardDescription>
                        Descarga los manuales oficiales del curso en formato PDF
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {manualFiles.length > 0 ? manualFiles.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => downloadManualPdf(file.filePath, file.name)}
                          className="flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-muted/50 hover:border-primary transition-all group w-full text-left"
                        >
                          <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium group-hover:text-primary transition-colors">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Formato PDF - Haz clic para descargar</p>
                          </div>
                          <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                          <p className="font-medium">No hay manuales disponibles</p>
                          <p className="text-sm">Aún no se han subido PDFs para esta unidad.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : activeTab === 'progress' ? (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        📊 Tu Progreso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Contenido completado</span>
                          <span className="font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-4" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl text-center">
                          <p className="text-3xl font-bold text-green-600">{completedSlides.size}</p>
                          <p className="text-sm text-green-700 dark:text-green-400">Páginas completadas</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl text-center">
                          <p className="text-3xl font-bold text-orange-600">{slides.length - completedSlides.size}</p>
                          <p className="text-sm text-orange-700 dark:text-orange-400">Páginas restantes</p>
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-sm font-medium mb-2">📚 Tiempo estimado restante:</p>
                        <p className="text-2xl font-bold text-primary">
                          ~{Math.ceil((slides.length - completedSlides.size) * 3)} minutos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : activeTab === 'glossary' ? (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-red-500" />
                        📖 Glosario de Términos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {(() => {
                        // Build glossary dynamically from slide key terms
                        const allTerms = slides
                          .filter(s => s.keyTerms && s.keyTerms.length > 0)
                          .flatMap(s => s.keyTerms || []);
                        const uniqueTerms = [...new Set(allTerms)];
                        
                        if (uniqueTerms.length === 0) {
                          return (
                            <div className="text-center py-8 text-muted-foreground">
                              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                              <p className="font-medium">Glosario vacío</p>
                              <p className="text-sm">Los términos clave aparecerán cuando se genere contenido para esta unidad.</p>
                            </div>
                          );
                        }
                        
                        return uniqueTerms.slice(0, 20).map((term, idx) => (
                          <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <p className="font-bold text-primary">{term}</p>
                          </div>
                        ));
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2">
                    <CardContent className="py-12 text-center">
                      <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Sección en desarrollo</p>
                      <p className="text-muted-foreground">
                        Esta funcionalidad estará disponible próximamente.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            {/* Bottom navigation - iSpring style with colored bar */}
            <div className="relative">
              {/* Colored progress bar at the very bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-primary to-purple-500" />
              
              <div className="bg-white dark:bg-slate-800 border-t px-6 py-4 pb-5 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentSlideIndex === 0}
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Página</span>
                  <Input
                    type="number"
                    min={1}
                    max={slides.length}
                    value={currentSlideIndex + 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) - 1;
                      if (val >= 0 && val < slides.length) {
                        setCurrentSlideIndex(val);
                      }
                    }}
                    className="w-16 text-center font-bold border-2 border-primary/30 focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">de <strong className="text-primary">{slides.length}</strong></span>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Assistant Widget */}
          <div className={`${chatOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-l flex flex-col`}>
            {chatOpen && (
              <>
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Hugo 🤖</p>
                      <p className="text-xs text-muted-foreground">Tu asistente</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe tu pregunta..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendChat} disabled={!chatMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chat toggle button */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-24 right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          )}
        </div>
      </DialogContent>
      
      {/* Syllabus Editor Modal */}
      <SyllabusEditor
        open={syllabusEditorOpen}
        onOpenChange={(isOpen) => {
          setSyllabusEditorOpen(isOpen);
          // Reload slides when editor closes
          if (!isOpen) {
            // Trigger a reload by setting loadingSlides
            setLoadingSlides(true);
          }
        }}
        unitId={unitId}
        unitTitle={unitTitle}
      />
    </Dialog>
  );
}
