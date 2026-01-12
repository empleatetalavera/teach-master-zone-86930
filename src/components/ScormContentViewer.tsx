import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, FileText, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  Download, Printer, ZoomIn, ZoomOut, List, GraduationCap, Target,
  HelpCircle, Book, ClipboardCheck
} from "lucide-react";

interface ScormContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  enrollmentId?: string;
}

interface ContentSection {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
}

interface ScormModule {
  id: string;
  title: string;
  description: string;
  sections: ContentSection[];
  objectives?: string[];
  summary?: string;
  selfAssessment?: {
    question: string;
    answer: string;
  }[];
  glossary?: {
    term: string;
    definition: string;
  }[];
}

// Content paths for SCORM modules
const SCORM_CONTENT_PATHS: Record<string, string[]> = {
  "UF0517": [
    "/scorm-content/MF0969_1/UF0517/UD1_organizacion_entidades.md",
    "/scorm-content/MF0969_1/UF0517/UD2_organizacion_recursos_humanos.md"
  ],
  "UF0518": [
    "/scorm-content/MF0969_1/UF0518/UD1_tratamiento_correspondencia.md"
  ],
  "UF0519": [
    "/scorm-content/MF0969_1/UF0519/UD1_documentacion_administrativa.md",
    "/scorm-content/MF0969_1/UF0519/UD2_tesoreria.md",
    "/scorm-content/MF0969_1/UF0519/UD3_existencias.md"
  ]
};

export function ScormContentViewer({ 
  open, 
  onOpenChange, 
  unitId, 
  unitTitle,
  enrollmentId
}: ScormContentViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>("");
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [showToc, setShowToc] = useState(true);
  const [headings, setHeadings] = useState<{text: string, level: number, id: string}[]>([]);

  useEffect(() => {
    if (open && unitTitle) {
      loadScormContent();
    }
  }, [open, unitTitle]);

  const loadScormContent = async () => {
    setLoading(true);
    try {
      // Determine which UF this is based on title
      let ufCode = "";
      if (unitTitle.includes("UF0517") || unitTitle.toLowerCase().includes("organización empresarial")) {
        ufCode = "UF0517";
      } else if (unitTitle.includes("UF0518") || unitTitle.toLowerCase().includes("correspondencia")) {
        ufCode = "UF0518";
      } else if (unitTitle.includes("UF0519") || unitTitle.toLowerCase().includes("documentación económico")) {
        ufCode = "UF0519";
      }

      const paths = SCORM_CONTENT_PATHS[ufCode] || [];
      
      if (paths.length === 0) {
        // Try to load from database
        const { data: unitData } = await supabase
          .from("formative_units")
          .select("content, description")
          .eq("id", unitId)
          .single();

        if (unitData?.content) {
          setContent(unitData.content);
          extractHeadings(unitData.content);
        }
      } else {
        // Load all sections from files
        const loadedSections: string[] = [];
        for (const path of paths) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              const text = await response.text();
              loadedSections.push(text);
            }
          } catch (e) {
            console.error(`Error loading ${path}:`, e);
          }
        }
        
        setSections(loadedSections);
        if (loadedSections.length > 0) {
          setContent(loadedSections[0]);
          extractHeadings(loadedSections[0]);
        }
      }

      // Load progress if user is enrolled
      if (user && enrollmentId) {
        await loadProgress();
      }
    } catch (error: any) {
      console.error("Error loading SCORM content:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el contenido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const extractHeadings = (markdown: string) => {
    const lines = markdown.split('\n');
    const extracted: {text: string, level: number, id: string}[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = `heading-${index}`;
        extracted.push({ text, level, id });
      }
    });
    
    setHeadings(extracted);
  };

  const loadProgress = async () => {
    if (!user || !enrollmentId) return;
    
    try {
      const { data } = await supabase
        .from("unit_content_progress")
        .select("progress_percentage")
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .eq("content_id", unitId)
        .single();

      if (data) {
        setProgress(data.progress_percentage || 0);
      }
    } catch (error) {
      // No progress yet, that's fine
    }
  };

  const saveProgress = async (newProgress: number) => {
    if (!user || !enrollmentId) return;

    try {
      await supabase
        .from("unit_content_progress")
        .upsert({
          user_id: user.id,
          content_id: unitId,
          enrollment_id: enrollmentId,
          progress_percentage: newProgress,
          completed: newProgress >= 100,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null
        }, {
          onConflict: "user_id,content_id,enrollment_id"
        });

      setProgress(newProgress);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleSectionChange = (index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSection(index);
      setContent(sections[index]);
      extractHeadings(sections[index]);
      
      // Calculate progress based on sections completed
      const newProgress = Math.round(((index + 1) / sections.length) * 100);
      saveProgress(newProgress);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[95vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">{unitTitle}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <BookOpen className="h-4 w-4" />
                    Contenido formativo SEPE
                    {sections.length > 1 && (
                      <Badge variant="outline" className="ml-2">
                        Unidad {currentSection + 1} de {sections.length}
                      </Badge>
                    )}
                  </DialogDescription>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.max(12, f - 2))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">{fontSize}px</span>
                <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.min(24, f + 2))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowToc(!showToc)}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progreso del contenido</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          {/* Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Table of Contents Sidebar */}
            {showToc && headings.length > 0 && (
              <div className="w-72 border-r bg-muted/30 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <List className="h-4 w-4" />
                    Índice de Contenidos
                  </h3>
                  <nav className="space-y-1">
                    {headings.map((heading, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors ${
                          heading.level === 1 ? 'font-semibold' :
                          heading.level === 2 ? 'pl-4' :
                          heading.level === 3 ? 'pl-6 text-muted-foreground' :
                          'pl-8 text-muted-foreground text-xs'
                        }`}
                      >
                        {heading.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Content Area */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Cargando contenido formativo...</p>
                  </div>
                </div>
              ) : content ? (
                <div 
                  className="p-8 max-w-4xl mx-auto"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <article className="prose prose-slate dark:prose-invert max-w-none
                    prose-headings:scroll-mt-20
                    prose-h1:text-3xl prose-h1:font-bold prose-h1:text-primary prose-h1:border-b prose-h1:pb-3 prose-h1:mb-6
                    prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-medium prose-h3:text-foreground/90
                    prose-h4:text-lg prose-h4:font-medium
                    prose-p:text-foreground/80 prose-p:leading-relaxed
                    prose-li:text-foreground/80
                    prose-strong:text-foreground
                    prose-table:border prose-table:border-border
                    prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-border
                    prose-td:p-3 prose-td:border prose-td:border-border
                    prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                    prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-muted prose-pre:border
                    prose-hr:border-border
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  ">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children, ...props}) => {
                          const id = `heading-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`;
                          return <h1 id={id} {...props}>{children}</h1>;
                        },
                        h2: ({children, ...props}) => {
                          const id = `heading-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`;
                          return <h2 id={id} {...props}>{children}</h2>;
                        },
                        h3: ({children, ...props}) => {
                          const id = `heading-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`;
                          return <h3 id={id} {...props}>{children}</h3>;
                        },
                        table: ({children}) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full">{children}</table>
                          </div>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="flex gap-3 items-start">
                            <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>{children}</div>
                          </blockquote>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </article>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="font-semibold">Sin contenido disponible</h3>
                      <p className="text-sm text-muted-foreground">
                        El contenido de esta unidad aún no ha sido cargado
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer with navigation */}
          {sections.length > 1 && (
            <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => handleSectionChange(currentSection - 1)}
                disabled={currentSection === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Unidad Anterior
              </Button>

              <div className="flex items-center gap-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSectionChange(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSection 
                        ? 'bg-primary' 
                        : index < currentSection 
                          ? 'bg-primary/50' 
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={() => handleSectionChange(currentSection + 1)}
                disabled={currentSection === sections.length - 1}
              >
                Siguiente Unidad
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Mark as complete button */}
          {progress < 100 && (
            <div className="px-6 py-3 border-t bg-background">
              <Button 
                className="w-full" 
                onClick={() => saveProgress(100)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar contenido como completado
              </Button>
            </div>
          )}

          {progress >= 100 && (
            <div className="px-6 py-3 border-t bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">¡Contenido completado!</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
