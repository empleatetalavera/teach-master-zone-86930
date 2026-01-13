import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, FileText, Video, Headphones, Layers, Plus, Trash2, 
  CheckCircle2, Circle, Loader2, X, ExternalLink, Download
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ContentItem {
  id: string;
  type: 'interactive' | 'document' | 'video' | 'audio';
  title: string;
  url: string;
  completed: boolean;
  progress: number;
}

interface UnitContentManagerProps {
  unitId: string;
  unitTitle: string;
  contentType: 'interactive' | 'document' | 'video' | 'audio';
  isEditable?: boolean;
  enrollmentId?: string;
  onClose?: () => void;
}

export function UnitContentManager({ 
  unitId, 
  unitTitle, 
  contentType, 
  isEditable = false,
  enrollmentId,
  onClose 
}: UnitContentManagerProps) {
  const { user, userRole } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canEdit = isEditable && (userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher');

  const contentTypeConfig = {
    interactive: { 
      icon: Layers, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      label: 'Contenido Interactivo',
      accept: '.zip,.html,.scorm'
    },
    document: { 
      icon: FileText, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      label: 'Documentos de Apoyo',
      accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
    },
    video: { 
      icon: Video, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      label: 'Vídeos de Apoyo',
      accept: '.mp4,.webm,.mov,.avi'
    },
    audio: { 
      icon: Headphones, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      label: 'Audio de Apoyo',
      accept: '.mp3,.wav,.ogg,.m4a'
    }
  };

  const config = contentTypeConfig[contentType];
  const Icon = config.icon;

  useEffect(() => {
    loadContents();
  }, [unitId, contentType]);

  const loadContents = async () => {
    try {
      setLoading(true);
      // Mock data for now - would come from database
      const mockContents: ContentItem[] = [
        {
          id: '1',
          type: contentType,
          title: `${config.label} - Parte 1`,
          url: '/placeholder.pdf',
          completed: false,
          progress: 0
        }
      ];
      setContents(mockContents);
    } catch (error) {
      console.error('Error loading contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !newContentTitle) {
      toast.error('Por favor, introduce un título y selecciona un archivo');
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${unitId}/${contentType}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('unit-content')
        .upload(fileName, selectedFile);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('unit-content')
        .getPublicUrl(fileName);

      const newContent: ContentItem = {
        id: Date.now().toString(),
        type: contentType,
        title: newContentTitle,
        url: urlData.publicUrl,
        completed: false,
        progress: 0
      };

      setContents([...contents, newContent]);
      setShowUploadDialog(false);
      setNewContentTitle('');
      setSelectedFile(null);
      toast.success('Contenido subido correctamente');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      setContents(contents.filter(c => c.id !== contentId));
      toast.success('Contenido eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const toggleCompletion = async (contentId: string) => {
    setContents(contents.map(c => 
      c.id === contentId 
        ? { ...c, completed: !c.completed, progress: !c.completed ? 100 : 0 }
        : c
    ));
    toast.success('Progreso actualizado');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${config.bgColor} rounded-lg`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{config.label}</CardTitle>
              <CardDescription>{unitTitle}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Añadir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir {config.label}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Título del contenido</Label>
                      <Input
                        value={newContentTitle}
                        onChange={(e) => setNewContentTitle(e.target.value)}
                        placeholder="Ej: Introducción al tema"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Archivo</Label>
                      <Input
                        type="file"
                        accept={config.accept}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: {config.accept}
                      </p>
                    </div>
                    <Button 
                      onClick={handleFileUpload} 
                      disabled={uploading || !selectedFile || !newContentTitle}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir contenido
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {contents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay contenido disponible</p>
            {canEdit && (
              <p className="text-sm mt-2">
                Haz clic en "Añadir" para subir {config.label.toLowerCase()}
              </p>
            )}
          </div>
        ) : (
          contents.map((content) => (
            <div 
              key={content.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <Checkbox
                checked={content.completed}
                onCheckedChange={() => toggleCompletion(content.id)}
                className="h-5 w-5"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                  <span className={`text-sm font-medium truncate ${content.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {content.title}
                  </span>
                  {content.completed && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Completado
                    </Badge>
                  )}
                </div>
                <div className="mt-1">
                  <Progress value={content.progress} className="h-1" />
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={content.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={content.url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteContent(content.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Progress Summary */}
        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso total:</span>
            <span className="font-medium">
              {contents.filter(c => c.completed).length} / {contents.length} completados
            </span>
          </div>
          <Progress 
            value={contents.length > 0 ? (contents.filter(c => c.completed).length / contents.length) * 100 : 0} 
            className="h-2 mt-2" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
