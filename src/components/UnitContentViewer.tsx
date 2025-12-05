import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, FileText, Headphones, Layers, FileQuestion, Presentation,
  X, ExternalLink, Download, CheckCircle2, Loader2, Play, Plus, Upload, Trash2
} from "lucide-react";

interface UnitContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  contentType: 'video' | 'document' | 'audio' | 'scorm' | 'exercise' | 'presentation';
  enrollmentId?: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_url: string | null;
  file_path: string | null;
  duration_minutes: number | null;
  content_type: string;
  order_index?: number;
  progress?: number;
  completed?: boolean;
}

const contentTypeConfig = {
  video: { icon: Video, label: "Video", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
  document: { icon: FileText, label: "Documento", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  audio: { icon: Headphones, label: "Audio", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  scorm: { icon: Layers, label: "Contenido Interactivo", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  exercise: { icon: FileQuestion, label: "Ejercicio", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  presentation: { icon: Presentation, label: "Presentación", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" }
};

export function UnitContentViewer({ 
  open, 
  onOpenChange, 
  unitId, 
  unitTitle,
  contentType,
  enrollmentId
}: UnitContentViewerProps) {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New content form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin';

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
      const { data: contentData, error } = await supabase
        .from("unit_interactive_content")
        .select("*")
        .eq("formative_unit_id", unitId)
        .eq("content_type", contentType)
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;

      if (user && enrollmentId && contentData && contentData.length > 0) {
        const contentIds = contentData.map(c => c.id);
        const { data: progressData } = await supabase
          .from("unit_content_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("enrollment_id", enrollmentId)
          .in("content_id", contentIds);

        const contentWithProgress = contentData.map(item => {
          const progress = progressData?.find(p => p.content_id === item.id);
          return {
            ...item,
            progress: progress?.progress_percentage || 0,
            completed: progress?.completed || false
          };
        });

        setContent(contentWithProgress);
      } else {
        setContent(contentData || []);
      }
    } catch (error: any) {
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

  const handleAddContent = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      let fileUrl = newUrl;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${unitId}/${contentType}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course-content')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('course-content')
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }

      const maxOrder = content.length > 0 ? Math.max(...content.map(c => c.order_index || 0)) : 0;

      const { error } = await supabase
        .from("unit_interactive_content")
        .insert({
          formative_unit_id: unitId,
          content_type: contentType,
          title: newTitle,
          description: newDescription || null,
          content_url: fileUrl || null,
          duration_minutes: newDuration ? parseInt(newDuration) : null,
          order_index: maxOrder + 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Contenido añadido",
        description: `${config.label} añadido correctamente`,
      });

      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewUrl("");
      setNewDuration("");
      setSelectedFile(null);
      setShowAddForm(false);
      
      // Reload content
      loadContent();
    } catch (error: any) {
      console.error("Error adding content:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el contenido",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from("unit_interactive_content")
        .update({ is_active: false })
        .eq("id", contentId);

      if (error) throw error;

      toast({
        title: "Contenido eliminado",
        description: "El contenido ha sido eliminado",
      });

      loadContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido",
        variant: "destructive"
      });
    }
  };

  const handlePlayContent = (item: ContentItem) => {
    setSelectedContent(item);
    setPlaying(true);
    
    if (user && enrollmentId) {
      updateProgress(item.id, 10);
    }
  };

  const handleMarkComplete = async (item: ContentItem) => {
    if (!user || !enrollmentId) return;

    try {
      await updateProgress(item.id, 100, true);
      
      setContent(prev => prev.map(c => 
        c.id === item.id ? { ...c, progress: 100, completed: true } : c
      ));

      toast({
        title: "¡Completado!",
        description: `Has completado "${item.title}"`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo marcar como completado",
        variant: "destructive"
      });
    }
  };

  const updateProgress = async (contentId: string, progress: number, completed = false) => {
    if (!user || !enrollmentId) return;

    const { error } = await supabase
      .from("unit_content_progress")
      .upsert({
        user_id: user.id,
        content_id: contentId,
        enrollment_id: enrollmentId,
        progress_percentage: progress,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: "user_id,content_id,enrollment_id"
      });

    if (error) {
      console.error("Error updating progress:", error);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'video': return "video/*";
      case 'audio': return "audio/*";
      case 'document': return ".pdf,.doc,.docx";
      case 'presentation': return ".ppt,.pptx,.pdf";
      case 'scorm': return ".zip";
      case 'exercise': return ".pdf,.doc,.docx,.html";
      default: return "*";
    }
  };

  const renderContentPlayer = () => {
    if (!selectedContent) return null;

    const url = selectedContent.content_url || selectedContent.file_path;

    if (contentType === 'video') {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {url ? (
            url.includes('youtube') || url.includes('vimeo') ? (
              <iframe 
                src={url} 
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            ) : (
              <video controls className="w-full h-full">
                <source src={url} />
                Tu navegador no soporta el elemento de video.
              </video>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <p>URL de video no disponible</p>
            </div>
          )}
        </div>
      );
    }

    if (contentType === 'document' || contentType === 'presentation') {
      return (
        <div className="h-[70vh] bg-muted rounded-lg overflow-hidden">
          {url ? (
            <iframe 
              src={url.includes('docs.google.com') ? url : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Documento no disponible</p>
            </div>
          )}
        </div>
      );
    }

    if (contentType === 'audio') {
      return (
        <div className="p-8 bg-muted rounded-lg">
          {url ? (
            <audio controls className="w-full">
              <source src={url} />
              Tu navegador no soporta el elemento de audio.
            </audio>
          ) : (
            <p className="text-center text-muted-foreground">Audio no disponible</p>
          )}
        </div>
      );
    }

    if (contentType === 'scorm') {
      return (
        <div className="h-[70vh] bg-muted rounded-lg overflow-hidden">
          {url ? (
            <iframe 
              src={url}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Contenido interactivo no disponible</p>
            </div>
          )}
        </div>
      );
    }

    if (contentType === 'exercise') {
      return (
        <div className="p-8 bg-muted rounded-lg text-center">
          {url ? (
            <Button onClick={() => window.open(url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Ejercicio
            </Button>
          ) : (
            <p className="text-muted-foreground">Ejercicio no disponible</p>
          )}
        </div>
      );
    }

    return null;
  };

  const renderAddForm = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Añadir {config.label}</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Título del ${config.label.toLowerCase()}`}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descripción opcional"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duración (minutos)</Label>
          <Input
            id="duration"
            type="number"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            placeholder="Ej: 15"
          />
        </div>

        <div>
          <Label>URL del contenido</Label>
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={contentType === 'video' ? "https://youtube.com/... o URL directa" : "URL del contenido"}
          />
        </div>

        <div className="relative">
          <Label>O subir archivo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedFileTypes()}
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full mt-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {selectedFile ? selectedFile.name : "Seleccionar archivo"}
          </Button>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleAddContent} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Añadir
          </Button>
          <Button variant="outline" onClick={() => setShowAddForm(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-1.5 ${config.bgColor} rounded`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            {config.label} - {unitTitle}
          </DialogTitle>
          <DialogDescription>
            Contenido interactivo de la unidad formativa
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : playing && selectedContent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{selectedContent.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPlaying(false)}>
                <X className="h-4 w-4 mr-1" />
                Cerrar
              </Button>
            </div>
            
            {renderContentPlayer()}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Progress value={selectedContent.progress || 0} className="w-32" />
                <span className="text-sm text-muted-foreground">
                  {selectedContent.progress || 0}%
                </span>
              </div>
              {!selectedContent.completed && (
                <Button onClick={() => handleMarkComplete(selectedContent)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como completado
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add button for teachers/admins */}
            {isTeacherOrAdmin && !showAddForm && (
              <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Añadir {config.label}
              </Button>
            )}

            {/* Add form */}
            {showAddForm && renderAddForm()}

            {/* Content list */}
            {content.length === 0 && !showAddForm ? (
              <div className="text-center py-12">
                <Icon className={`h-16 w-16 mx-auto mb-4 ${config.color} opacity-50`} />
                <p className="text-lg font-medium mb-2">No hay contenido disponible</p>
                <p className="text-sm text-muted-foreground">
                  {isTeacherOrAdmin 
                    ? `Añade ${config.label.toLowerCase()} usando el botón de arriba`
                    : `El tutor aún no ha añadido ${config.label.toLowerCase()} a esta unidad`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {content.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 ${config.bgColor} rounded`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                        )}
                        {item.duration_minutes && (
                          <p className="text-xs text-muted-foreground">{item.duration_minutes} min</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completado
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress || 0} className="w-20" />
                          <span className="text-xs text-muted-foreground">{item.progress || 0}%</span>
                        </div>
                      )}
                      <Button onClick={() => handlePlayContent(item)}>
                        <Play className="h-4 w-4 mr-1" />
                        {item.completed ? "Ver" : "Iniciar"}
                      </Button>
                      {isTeacherOrAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteContent(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}