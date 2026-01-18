import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, GraduationCap, Send, ArrowLeft, Pin, Lock, Trash2, CheckCircle2, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TutorForumProps {
  courseId: string;
  moduleId?: string;
  courseTitle: string;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  author_name?: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  forum_type: 'module' | 'certificate';
}

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  author_name?: string;
  is_solution: boolean;
}

export function TutorForum({ courseId, moduleId, courseTitle }: TutorForumProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'module' | 'certificate'>('module');
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  // Form states
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [courseId, activeTab]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      // Get topics for tutors - we'll use a metadata field to distinguish forum types
      // For now, we use module_id presence to determine module vs certificate forum
      let query = supabase
        .from("forum_topics")
        .select("*")
        .eq("course_id", courseId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      // Module forum: topics with module_id set
      // Certificate forum: topics without module_id (course-level)
      if (activeTab === 'module') {
        query = query.not('module_id', 'is', null);
      } else {
        query = query.is('module_id', null);
      }

      const { data: topicsData, error } = await query;

      if (error) throw error;

      // Get author names and reply counts
      const topicsWithDetails = await Promise.all(
        (topicsData || []).map(async (topic) => {
          const [profileResult, repliesResult] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", topic.created_by).single(),
            supabase.from("forum_replies").select("id", { count: "exact" }).eq("topic_id", topic.id)
          ]);

          return {
            ...topic,
            author_name: profileResult.data?.full_name || "Tutor",
            replies_count: repliesResult.count || 0,
            forum_type: activeTab
          } as ForumTopic;
        })
      );

      setTopics(topicsWithDetails);
    } catch (error) {
      console.error("Error loading tutor forum topics:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los temas del foro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (topicId: string) => {
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const repliesWithAuthors = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", reply.created_by)
            .single();

          return {
            ...reply,
            author_name: profile?.full_name || "Tutor"
          } as ForumReply;
        })
      );

      setReplies(repliesWithAuthors);

      // Update views count
      await supabase
        .from("forum_topics")
        .update({ views_count: (selectedTopic?.views_count || 0) + 1 })
        .eq("id", topicId);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

    setIsCreating(true);
    try {
      const { error } = await supabase.from("forum_topics").insert({
        course_id: courseId,
        module_id: activeTab === 'module' ? moduleId : null,
        title: newTopicTitle.trim(),
        content: newTopicContent.trim(),
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Tema creado",
        description: "Tu tema ha sido publicado en el foro de tutores"
      });

      setNewTopicTitle("");
      setNewTopicContent("");
      setShowNewTopicForm(false);
      loadTopics();
    } catch (error) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el tema",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim() || !selectedTopic || !user) return;

    setIsCreating(true);
    try {
      const { error } = await supabase.from("forum_replies").insert({
        topic_id: selectedTopic.id,
        content: newReply.trim(),
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada"
      });

      setNewReply("");
      loadReplies(selectedTopic.id);
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTopic = (topic: ForumTopic) => {
    setSelectedTopic(topic);
    loadReplies(topic.id);
  };

  if (selectedTopic) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedTopic(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {selectedTopic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                {selectedTopic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                <CardTitle className="text-lg">{selectedTopic.title}</CardTitle>
              </div>
              <CardDescription>
                Por {selectedTopic.author_name} · {format(new Date(selectedTopic.created_at), "d MMM yyyy, HH:mm", { locale: es })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Original post */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{selectedTopic.content}</p>
          </div>

          {/* Replies */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Respuestas ({replies.length})
            </h4>

            {loadingReplies ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : replies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay respuestas aún. ¡Sé el primero en responder!
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{reply.author_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(reply.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                            </p>
                          </div>
                        </div>
                        {reply.is_solution && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Solución
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Reply form */}
          {!selectedTopic.is_locked && (
            <div className="space-y-2 pt-4 border-t">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleSubmitReply} 
                disabled={!newReply.trim() || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Respuesta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Foros de Tutores-Formadores
        </CardTitle>
        <CardDescription>
          Espacio de comunicación exclusivo para tutores-formadores del certificado de profesionalidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'module' | 'certificate')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="module" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Foro por Módulo</span>
              <span className="sm:hidden">Módulo</span>
            </TabsTrigger>
            <TabsTrigger value="certificate" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Foro del Certificado</span>
              <span className="sm:hidden">Certificado</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="module" className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong>Foro de Tutores por Módulo Formativo:</strong> Comunícate con el resto de tutores-formadores que imparten formación en cada módulo formativo. Comparte recursos, dudas metodológicas y coordinación de contenidos.
              </p>
            </div>

            {/* New topic form */}
            {showNewTopicForm ? (
              <div className="border rounded-lg p-4 space-y-3">
                <Input
                  placeholder="Título del tema"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Contenido del tema..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateTopic} disabled={!newTopicTitle.trim() || !newTopicContent.trim() || isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Publicar Tema
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewTopicForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowNewTopicForm(true)} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nuevo Tema en Foro de Módulo
              </Button>
            )}

            {/* Topics list */}
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay temas en este foro aún</p>
                <p className="text-sm">Sé el primero en iniciar una conversación</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectTopic(topic)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                          {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          <h4 className="font-medium text-sm">{topic.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Por {topic.author_name} · {format(new Date(topic.created_at), "d MMM yyyy", { locale: es })}
                        </p>
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
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificate" className="space-y-4">
            <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
              <p className="text-sm text-muted-foreground">
                <strong>Foro General del Certificado de Profesionalidad:</strong> Comunícate con todos los tutores-formadores que imparten la formación del certificado "{courseTitle}". Espacio para coordinación general, metodología y buenas prácticas.
              </p>
            </div>

            {/* New topic form */}
            {showNewTopicForm ? (
              <div className="border rounded-lg p-4 space-y-3">
                <Input
                  placeholder="Título del tema"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Contenido del tema..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateTopic} disabled={!newTopicTitle.trim() || !newTopicContent.trim() || isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Publicar Tema
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewTopicForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowNewTopicForm(true)} className="w-full" variant="secondary">
                <GraduationCap className="h-4 w-4 mr-2" />
                Nuevo Tema en Foro del Certificado
              </Button>
            )}

            {/* Topics list */}
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay temas en este foro aún</p>
                <p className="text-sm">Sé el primero en iniciar una conversación</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectTopic(topic)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                          {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          <h4 className="font-medium text-sm">{topic.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Por {topic.author_name} · {format(new Date(topic.created_at), "d MMM yyyy", { locale: es })}
                        </p>
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
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
