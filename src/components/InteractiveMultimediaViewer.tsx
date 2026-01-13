import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, Book, FileText, ListOrdered, ChevronRight, ChevronLeft,
  X, Plus, Upload, Trash2, Loader2, Edit2, Save, Info, Video, Headphones,
  Presentation, Layers, FileQuestion, GripVertical, Eye, CheckCircle2,
  Lightbulb, AlertCircle, Play, ExternalLink
} from "lucide-react";

interface InteractiveMultimediaViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  moduleTitle?: string;
  contentType: 'video' | 'document' | 'audio' | 'scorm' | 'exercise' | 'presentation';
  enrollmentId?: string;
}

interface ContentSection {
  id: string;
  title: string;
  content: string;
  order_index: number;
  content_type: string;
  media_url?: string;
  highlight_type?: 'info' | 'warning' | 'tip' | 'important';
  buttons?: { label: string; url?: string; style?: 'primary' | 'secondary' }[];
  completed?: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_url: string | null;
  content_type: string;
  order_index: number;
  sections: ContentSection[];
  progress?: number;
  completed?: boolean;
}

const contentTypeConfig = {
  video: { icon: Video, label: "Video", color: "text-red-600", bgColor: "bg-red-100" },
  document: { icon: FileText, label: "Documento", color: "text-blue-600", bgColor: "bg-blue-100" },
  audio: { icon: Headphones, label: "Audio", color: "text-purple-600", bgColor: "bg-purple-100" },
  scorm: { icon: Layers, label: "Contenido Interactivo", color: "text-green-600", bgColor: "bg-green-100" },
  exercise: { icon: FileQuestion, label: "Ejercicio", color: "text-amber-600", bgColor: "bg-amber-100" },
  presentation: { icon: Presentation, label: "Presentación", color: "text-orange-600", bgColor: "bg-orange-100" }
};

export function InteractiveMultimediaViewer({
  open,
  onOpenChange,
  unitId,
  unitTitle,
  moduleTitle,
  contentType,
  enrollmentId
}: InteractiveMultimediaViewerProps) {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentDesc, setNewContentDesc] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");
  const [newSectionHighlight, setNewSectionHighlight] = useState<'info' | 'warning' | 'tip' | 'important' | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const config = contentTypeConfig[contentType];
  const Icon = config.icon;

  useEffect(() => {
    if (open && unitId) {
      loadContent();
    }
  }, [open, unitId, contentType]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("unit_interactive_content")
        .select("*")
        .eq("formative_unit_id", unitId)
        .eq("content_type", contentType)
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;

      // Parse sections from metadata or create default
      const contentWithSections = (data || []).map(item => {
        const metadata = item.metadata as { sections?: ContentSection[] } | null;
        return {
          ...item,
          sections: metadata?.sections || generateDefaultSections(item)
        };
      });

      setContent(contentWithSections);
      setCurrentIndex(0);
      setCurrentSectionIndex(0);
    } catch (error) {
      console.error("Error loading content:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el contenido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultSections = (item: any): ContentSection[] => {
    return [{
      id: '1',
      title: item.title || 'Introducción',
      content: item.description || 'Contenido del módulo. El administrador puede editar esta sección.',
      order_index: 1,
      content_type: 'text'
    }];
  };

  const handleAddContent = async () => {
    if (!newContentTitle.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${unitId}/${contentType}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-content')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('course-content')
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }

      const maxOrder = content.length > 0 ? Math.max(...content.map(c => c.order_index || 0)) : 0;

      const defaultSections = [{
        id: crypto.randomUUID(),
        title: 'Introducción',
        content: 'Edita este contenido para añadir información relevante.',
        order_index: 1,
        content_type: 'text'
      }];

      const { error } = await supabase
        .from("unit_interactive_content")
        .insert({
          formative_unit_id: unitId,
          content_type: contentType,
          title: newContentTitle,
          description: newContentDesc || null,
          content_url: fileUrl,
          order_index: maxOrder + 1,
          is_active: true,
          metadata: JSON.parse(JSON.stringify({ sections: defaultSections }))
        });

      if (error) throw error;

      toast({ title: "Contenido añadido", description: `${config.label} añadido correctamente` });
      setNewContentTitle("");
      setNewContentDesc("");
      setSelectedFile(null);
      setShowAddContent(false);
      loadContent();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo añadir el contenido", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !content[currentIndex]) return;

    const currentContent = content[currentIndex];
    const newSection: ContentSection = {
      id: crypto.randomUUID(),
      title: newSectionTitle,
      content: newSectionContent,
      order_index: currentContent.sections.length + 1,
      content_type: 'text',
      highlight_type: newSectionHighlight || undefined
    };

    const updatedSections = [...currentContent.sections, newSection];

    try {
      const { error } = await supabase
        .from("unit_interactive_content")
        .update({
          metadata: JSON.parse(JSON.stringify({ sections: updatedSections }))
        })
        .eq("id", currentContent.id);

      if (error) throw error;

      setContent(prev => prev.map((item, idx) => 
        idx === currentIndex ? { ...item, sections: updatedSections } : item
      ));

      toast({ title: "Sección añadida" });
      setNewSectionTitle("");
      setNewSectionContent("");
      setNewSectionHighlight('');
      setShowAddSection(false);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo añadir la sección", variant: "destructive" });
    }
  };

  const handleUpdateSection = async (sectionId: string, updates: Partial<ContentSection>) => {
    if (!content[currentIndex]) return;

    const currentContent = content[currentIndex];
    const updatedSections = currentContent.sections.map(s =>
      s.id === sectionId ? { ...s, ...updates } : s
    );

    try {
      const { error } = await supabase
        .from("unit_interactive_content")
        .update({
          metadata: JSON.parse(JSON.stringify({ sections: updatedSections }))
        })
        .eq("id", currentContent.id);

      if (error) throw error;

      setContent(prev => prev.map((item, idx) => 
        idx === currentIndex ? { ...item, sections: updatedSections } : item
      ));
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la sección", variant: "destructive" });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!content[currentIndex]) return;

    const currentContent = content[currentIndex];
    const updatedSections = currentContent.sections.filter(s => s.id !== sectionId);

    try {
      const { error } = await supabase
        .from("unit_interactive_content")
        .update({
          metadata: JSON.parse(JSON.stringify({ sections: updatedSections }))
        })
        .eq("id", currentContent.id);

      if (error) throw error;

      setContent(prev => prev.map((item, idx) => 
        idx === currentIndex ? { ...item, sections: updatedSections } : item
      ));

      toast({ title: "Sección eliminada" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la sección", variant: "destructive" });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from("unit_interactive_content")
        .update({ is_active: false })
        .eq("id", contentId);

      if (error) throw error;
      toast({ title: "Contenido eliminado" });
      loadContent();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  const currentContent = content[currentIndex];
  const currentSection = currentContent?.sections?.[currentSectionIndex];
  const totalPages = content.reduce((acc, c) => acc + (c.sections?.length || 0), 0);
  const currentPage = content.slice(0, currentIndex).reduce((acc, c) => acc + (c.sections?.length || 0), 0) + currentSectionIndex + 1;

  const goToNext = () => {
    if (currentContent && currentSectionIndex < currentContent.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else if (currentIndex < content.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSectionIndex(0);
    }
  };

  const goToPrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevContent = content[currentIndex - 1];
      setCurrentSectionIndex((prevContent?.sections?.length || 1) - 1);
    }
  };

  const renderHighlightBox = (section: ContentSection) => {
    const highlightStyles = {
      info: 'bg-blue-50 border-l-4 border-blue-500 text-blue-800',
      warning: 'bg-amber-50 border-l-4 border-amber-500 text-amber-800',
      tip: 'bg-green-50 border-l-4 border-green-500 text-green-800',
      important: 'bg-rose-50 border-l-4 border-rose-500 text-rose-800'
    };

    const icons = {
      info: <Info className="h-5 w-5" />,
      warning: <AlertCircle className="h-5 w-5" />,
      tip: <Lightbulb className="h-5 w-5" />,
      important: <AlertCircle className="h-5 w-5" />
    };

    if (section.highlight_type) {
      return (
        <div className={`p-4 rounded-md ${highlightStyles[section.highlight_type]} my-4`}>
          <div className="flex items-start gap-3">
            {icons[section.highlight_type]}
            <div className="flex-1">
              <p className="font-medium mb-1">{section.title}</p>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Index */}
          <div className={`bg-slate-50 border-r transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 ${config.bgColor} rounded`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <span className="font-semibold text-sm">{config.label}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{unitTitle}</p>
            </div>

            {/* Navigation Buttons */}
            <div className="p-2 space-y-1 border-b">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                <Download className="h-3.5 w-3.5 mr-2" />
                Descargas
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                <Book className="h-3.5 w-3.5 mr-2" />
                Glosario
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                <FileText className="h-3.5 w-3.5 mr-2" />
                Programa
              </Button>
            </div>

            {/* Index */}
            <ScrollArea className="h-[calc(100%-200px)]">
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">ÍNDICE</div>
                <Accordion type="multiple" className="space-y-1">
                  {content.map((item, idx) => (
                    <AccordionItem key={item.id} value={item.id} className="border-0">
                      <AccordionTrigger className={`text-xs px-2 py-1.5 rounded hover:bg-slate-100 hover:no-underline ${currentIndex === idx ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{idx + 1}. {item.title}</span>
                          {item.completed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="ml-4 space-y-0.5">
                          {item.sections?.map((section, sIdx) => (
                            <button
                              key={section.id}
                              onClick={() => {
                                setCurrentIndex(idx);
                                setCurrentSectionIndex(sIdx);
                              }}
                              className={`w-full text-left text-xs py-1 px-2 rounded hover:bg-slate-100 flex items-center gap-2 ${currentIndex === idx && currentSectionIndex === sIdx ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                            >
                              <span className="w-4 h-4 flex items-center justify-center text-[10px] rounded-full bg-slate-200">
                                {idx + 1}.{sIdx + 1}
                              </span>
                              <span className="truncate">{section.title}</span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 text-xs"
                    onClick={() => setShowAddContent(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Añadir Contenido
                  </Button>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-sm rounded-r-md p-1 hover:bg-slate-50"
            style={{ left: sidebarCollapsed ? 0 : '256px' }}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Progress value={(currentPage / totalPages) * 100} className="w-32 h-2" />
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? <Save className="h-4 w-4 mr-1" /> : <Edit2 className="h-4 w-4 mr-1" />}
                    {editMode ? 'Guardar' : 'Editar'}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Main Content */}
              <ScrollArea className="flex-1 p-6">
                {content.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`p-4 ${config.bgColor} rounded-full mb-4`}>
                      <Icon className={`h-12 w-12 ${config.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No hay contenido disponible</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {isAdmin ? 'Añade contenido multimedia para esta unidad' : 'El contenido aún no ha sido añadido'}
                    </p>
                    {isAdmin && (
                      <Button onClick={() => setShowAddContent(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir {config.label}
                      </Button>
                    )}
                  </div>
                ) : currentContent && currentSection ? (
                  <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="mb-6">
                      <Badge variant="outline" className="mb-2">{moduleTitle || 'Módulo'}</Badge>
                      <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        {currentContent.title}
                      </h1>
                      {currentContent.description && (
                        <p className="text-muted-foreground">{currentContent.description}</p>
                      )}
                    </div>

                    {/* Section Title */}
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 flex items-center justify-center text-sm rounded-full bg-primary text-primary-foreground">
                        {currentSectionIndex + 1}
                      </span>
                      {editMode ? (
                        <Input
                          value={currentSection.title}
                          onChange={(e) => handleUpdateSection(currentSection.id, { title: e.target.value })}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        currentSection.title
                      )}
                    </h2>

                    {/* Highlight Box if exists */}
                    {currentSection.highlight_type && renderHighlightBox(currentSection)}

                    {/* Section Content */}
                    {editMode ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Contenido</Label>
                          <Textarea
                            value={currentSection.content}
                            onChange={(e) => handleUpdateSection(currentSection.id, { content: e.target.value })}
                            className="min-h-[200px]"
                          />
                        </div>
                        <div>
                          <Label>Tipo de destacado</Label>
                          <select
                            value={currentSection.highlight_type || ''}
                            onChange={(e) => handleUpdateSection(currentSection.id, { 
                              highlight_type: e.target.value as any || undefined 
                            })}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Sin destacado</option>
                            <option value="info">Información (azul)</option>
                            <option value="warning">Advertencia (amarillo)</option>
                            <option value="tip">Consejo (verde)</option>
                            <option value="important">Importante (rojo)</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteSection(currentSection.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar Sección
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none">
                        {!currentSection.highlight_type && (
                          <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
                        )}

                        {/* Action Buttons */}
                        {currentSection.buttons && currentSection.buttons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-6">
                            {currentSection.buttons.map((btn, i) => (
                              <Button
                                key={i}
                                variant={btn.style === 'secondary' ? 'outline' : 'default'}
                                onClick={() => btn.url && window.open(btn.url, '_blank')}
                              >
                                {btn.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Media Content */}
                        {currentSection.media_url && (
                          <div className="mt-6 rounded-lg overflow-hidden border">
                            {contentType === 'video' && (
                              <video controls className="w-full">
                                <source src={currentSection.media_url} />
                              </video>
                            )}
                            {contentType === 'audio' && (
                              <audio controls className="w-full p-4">
                                <source src={currentSection.media_url} />
                              </audio>
                            )}
                            {(contentType === 'document' || contentType === 'presentation') && (
                              <iframe src={currentSection.media_url} className="w-full h-[500px]" />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin: Add Section */}
                    {isAdmin && editMode && (
                      <div className="mt-6 pt-6 border-t">
                        {showAddSection ? (
                          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                            <Input
                              placeholder="Título de la sección"
                              value={newSectionTitle}
                              onChange={(e) => setNewSectionTitle(e.target.value)}
                            />
                            <Textarea
                              placeholder="Contenido de la sección (soporta HTML)"
                              value={newSectionContent}
                              onChange={(e) => setNewSectionContent(e.target.value)}
                            />
                            <select
                              value={newSectionHighlight}
                              onChange={(e) => setNewSectionHighlight(e.target.value as any)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="">Sin destacado</option>
                              <option value="info">Información</option>
                              <option value="warning">Advertencia</option>
                              <option value="tip">Consejo</option>
                              <option value="important">Importante</option>
                            </select>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddSection}>Añadir</Button>
                              <Button size="sm" variant="ghost" onClick={() => setShowAddSection(false)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" onClick={() => setShowAddSection(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Añadir Sección
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </ScrollArea>

              {/* Right Sidebar - Tips */}
              <div className="w-72 bg-slate-50 border-l p-4 hidden lg:block">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-sm text-primary">Información</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En el Contenido Interactivo encontrarás toda la información necesaria para descargar los programas informáticos que necesitas trabajar en la Unidad o Módulo Formativo.
                  </p>
                </div>

                {isAdmin && currentContent && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleDeleteContent(currentContent.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2 text-destructive" />
                      Eliminar Contenido
                    </Button>
                  </div>
                )}

                {/* Additional Resources */}
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3">RECURSOS</h4>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Abrir en nueva ventana
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t bg-white">
              <Button
                variant="outline"
                onClick={goToPrev}
                disabled={currentIndex === 0 && currentSectionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {content.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setCurrentSectionIndex(0);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${currentIndex === idx ? 'bg-primary' : 'bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>

              <Button
                onClick={goToNext}
                disabled={currentIndex === content.length - 1 && currentSectionIndex === (currentContent?.sections?.length || 1) - 1}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add Content Modal */}
        {showAddContent && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Añadir {config.label}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddContent(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={newContentTitle}
                    onChange={(e) => setNewContentTitle(e.target.value)}
                    placeholder={`Título del ${config.label.toLowerCase()}`}
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={newContentDesc}
                    onChange={(e) => setNewContentDesc(e.target.value)}
                    placeholder="Descripción opcional"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Archivo multimedia (opcional)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? selectedFile.name : "Seleccionar archivo"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddContent} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Añadir
                </Button>
                <Button variant="outline" onClick={() => setShowAddContent(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
