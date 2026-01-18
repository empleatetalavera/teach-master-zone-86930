import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  HelpCircle,
  Users,
  Plus, 
  ArrowLeft, 
  Send,
  Pin,
  Lock,
  Eye,
  User,
  Clock,
  Newspaper,
  AlertCircle,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface ForumTopic {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  content: string;
  created_by: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  created_at: string;
  author_name?: string;
  replies_count?: number;
  forum_type?: 'debate' | 'consultas';
}

interface ForumReply {
  id: string;
  topic_id: string;
  content: string;
  created_by: string;
  is_solution: boolean;
  created_at: string;
  author_name?: string;
}

interface UnitForumProps {
  courseId: string;
  formativeUnitId: string;
  formativeUnitTitle: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

export function UnitForum({ 
  courseId, 
  formativeUnitId, 
  formativeUnitTitle,
  isTeacher = false,
  isAdmin = false
}: UnitForumProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'debate' | 'consultas'>('consultas');
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  
  // New topic form
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Reply form
  const [newReplyContent, setNewReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const canModerate = isTeacher || isAdmin;

  useEffect(() => {
    loadTopics();
  }, [courseId, formativeUnitId, activeTab]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      // For now, we'll filter topics by course and use metadata to identify forum type
      // In a real implementation, you'd add a forum_type column to the forum_topics table
      const { data: topicsData, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("course_id", courseId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter topics that match the unit (using title prefix as a workaround)
      // In production, you'd filter by formative_unit_id if the column exists
      const unitTopics = (topicsData || []).filter(topic => {
        const prefix = activeTab === 'debate' ? `[DEBATE-${formativeUnitId}]` : `[DUDAS-${formativeUnitId}]`;
        return topic.title.startsWith(prefix) || topic.module_id === formativeUnitId;
      });

      // Get author names and reply counts
      const topicsWithDetails = await Promise.all(
        unitTopics.map(async (topic) => {
          const [profileResult, repliesResult] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", topic.created_by).single(),
            supabase.from("forum_replies").select("id", { count: "exact" }).eq("topic_id", topic.id)
          ]);

          return {
            ...topic,
            author_name: profileResult.data?.full_name || "Usuario",
            replies_count: repliesResult.count || 0,
            // Clean up title for display
            title: topic.title.replace(/^\[(DEBATE|DUDAS)-[^\]]+\]\s*/, '')
          };
        })
      );

      setTopics(topicsWithDetails);
    } catch (error: any) {
      console.error("Error loading forum topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (topicId: string) => {
    setRepliesLoading(true);
    try {
      const { data: repliesData, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const repliesWithAuthors = await Promise.all(
        (repliesData || []).map(async (reply) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", reply.created_by)
            .single();

          return {
            ...reply,
            author_name: profileData?.full_name || "Usuario"
          };
        })
      );

      setReplies(repliesWithAuthors);

      // Increment views
      await supabase
        .from("forum_topics")
        .update({ views_count: (selectedTopic?.views_count || 0) + 1 })
        .eq("id", topicId);

    } catch (error: any) {
      console.error("Error loading replies:", error);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

    setCreating(true);
    try {
      // Prefix title with forum type identifier
      const prefix = activeTab === 'debate' ? `[DEBATE-${formativeUnitId}]` : `[DUDAS-${formativeUnitId}]`;
      
      const { error } = await supabase.from("forum_topics").insert({
        course_id: courseId,
        module_id: formativeUnitId,
        title: `${prefix} ${newTopicTitle.trim()}`,
        content: newTopicContent.trim(),
        created_by: user.id,
        is_pinned: false,
        is_locked: false,
        views_count: 0
      });

      if (error) throw error;

      toast({
        title: activeTab === 'debate' ? "Tema de debate creado" : "Consulta creada",
        description: "Tu publicación ha sido añadida al foro"
      });

      setNewTopicOpen(false);
      setNewTopicTitle("");
      setNewTopicContent("");
      loadTopics();
    } catch (error: any) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el tema",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReplyContent.trim() || !selectedTopic || !user) return;

    setSubmittingReply(true);
    try {
      const { error } = await supabase.from("forum_replies").insert({
        topic_id: selectedTopic.id,
        content: newReplyContent.trim(),
        created_by: user.id,
        is_solution: false
      });

      if (error) throw error;

      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada"
      });

      setNewReplyContent("");
      loadReplies(selectedTopic.id);
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const openTopic = (topic: ForumTopic) => {
    setSelectedTopic(topic);
    loadReplies(topic.id);
  };

  const closeTopic = () => {
    setSelectedTopic(null);
    setReplies([]);
    setNewReplyContent("");
  };

  // Topic detail view
  if (selectedTopic) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <Button variant="ghost" size="sm" onClick={closeTopic} className="w-fit -ml-2 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al foro
          </Button>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {selectedTopic.is_pinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" />
                Fijado
              </Badge>
            )}
            {selectedTopic.is_locked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Cerrado
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{selectedTopic.title}</CardTitle>
          <CardDescription className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {selectedTopic.author_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(selectedTopic.created_at), "d MMM yyyy, HH:mm", { locale: es })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {selectedTopic.views_count} vistas
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="whitespace-pre-wrap text-sm">{selectedTopic.content}</p>
          </div>

          <Separator />

          {/* Replies */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Respuestas ({replies.length})
            </h4>

            {repliesLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p>Aún no hay respuestas</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[250px]">
                <div className="space-y-3 pr-2">
                  {replies.map((reply) => (
                    <div key={reply.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{reply.author_name}</span>
                        <span>•</span>
                        <span>{format(new Date(reply.created_at), "d MMM yyyy, HH:mm", { locale: es })}</span>
                        {reply.is_solution && (
                          <Badge variant="default" className="ml-auto text-xs">Solución</Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Reply form */}
            {!selectedTopic.is_locked && (
              <div className="flex gap-2 mt-4">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={newReplyContent}
                  onChange={(e) => setNewReplyContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button 
                  onClick={handleSubmitReply}
                  disabled={submittingReply || !newReplyContent.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 border rounded-lg p-4 bg-slate-50">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-5 w-5 text-red-500" />
        <h5 className="font-semibold text-slate-700">Foros de la Unidad Didáctica</h5>
      </div>

      {/* Info for teachers */}
      {canModerate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-blue-700">
              <p className="font-medium mb-1">Como tutor-formador:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>En el <strong>Foro de debate</strong>: controla y anima para que la participación sea adecuada por parte de todos los alumnos.</li>
                <li>En el <strong>Foro de dudas/consultas</strong>: recuerda las fechas de entrega de las actividades, facilita orientaciones y resuelve las dudas.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'debate' | 'consultas')}>
        <TabsList className="grid w-full grid-cols-2 mb-3">
          <TabsTrigger value="consultas" className="gap-2 text-xs">
            <HelpCircle className="h-4 w-4" />
            Dudas/Consultas
          </TabsTrigger>
          <TabsTrigger value="debate" className="gap-2 text-xs">
            <Newspaper className="h-4 w-4" />
            Foro de Debate
          </TabsTrigger>
        </TabsList>

        {/* Forum description */}
        <div className="text-xs text-muted-foreground mb-3 p-2 bg-white rounded border">
          {activeTab === 'consultas' ? (
            <p>
              <strong>Foro de dudas/consultas:</strong> Plantea tus dudas sobre el contenido o sobre 
              el manejo del Campus Virtual. El tutor-formador te atenderá y orientará en el desarrollo 
              de las actividades.
            </p>
          ) : (
            <p>
              <strong>Foro de debate:</strong> Espacio para debatir sobre noticias o temas de actualidad 
              relacionados con la unidad didáctica. ¡Participa activamente con tus aportaciones!
            </p>
          )}
        </div>

        <TabsContent value="consultas" className="mt-0">
          <ForumContent 
            topics={topics}
            loading={loading}
            onOpenTopic={openTopic}
            onNewTopic={() => setNewTopicOpen(true)}
            forumType="consultas"
          />
        </TabsContent>

        <TabsContent value="debate" className="mt-0">
          <ForumContent 
            topics={topics}
            loading={loading}
            onOpenTopic={openTopic}
            onNewTopic={() => setNewTopicOpen(true)}
            forumType="debate"
          />
        </TabsContent>
      </Tabs>

      {/* New topic dialog */}
      <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
        <DialogContent className="bg-background border shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'debate' ? 'Nuevo tema de debate' : 'Nueva consulta'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'debate' 
                ? 'Inicia un nuevo tema de debate sobre la unidad didáctica'
                : 'Plantea tu duda o consulta sobre el contenido'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input 
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder={activeTab === 'debate' ? 'Tema del debate...' : 'Resumen de tu consulta...'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido</label>
              <Textarea 
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                placeholder={activeTab === 'debate' 
                  ? 'Desarrolla tu tema de debate...' 
                  : 'Describe tu duda o consulta en detalle...'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleCreateTopic} disabled={creating}>
              {creating ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for forum content
function ForumContent({ 
  topics, 
  loading, 
  onOpenTopic,
  onNewTopic,
  forumType
}: { 
  topics: ForumTopic[];
  loading: boolean;
  onOpenTopic: (topic: ForumTopic) => void;
  onNewTopic: () => void;
  forumType: 'debate' | 'consultas';
}) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-12 bg-muted rounded"></div>
        <div className="h-12 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onNewTopic}
        className="w-full gap-2 mb-2"
      >
        <Plus className="h-4 w-4" />
        {forumType === 'debate' ? 'Nuevo tema de debate' : 'Nueva consulta'}
      </Button>

      {topics.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay temas en este foro todavía</p>
          <p className="text-xs">¡Sé el primero en participar!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[200px]">
          <div className="space-y-2 pr-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onOpenTopic(topic)}
                className="w-full text-left p-3 border rounded-lg hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {topic.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                      {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      <span className="font-medium text-sm truncate">{topic.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{topic.author_name}</span>
                      <span>{format(new Date(topic.created_at), "d MMM", { locale: es })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {topic.replies_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {topic.views_count}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
