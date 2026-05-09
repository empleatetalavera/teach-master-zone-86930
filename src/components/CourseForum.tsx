import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Lock, 
  Eye, 
  ArrowLeft, 
  Send, 
  CheckCircle,
  MoreVertical,
  Trash2,
  PinOff,
  Unlock,
  User,
  Clock,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  updated_at: string;
  author_name?: string;
  replies_count?: number;
}

interface ForumReply {
  id: string;
  topic_id: string;
  parent_reply_id?: string;
  content: string;
  created_by: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

interface CourseForumProps {
  courseId: string;
  isAdmin?: boolean;
  isEditable?: boolean;
}

export function CourseForum({ courseId, isAdmin = false, isEditable = false }: CourseForumProps) {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reply form
  const [newReplyContent, setNewReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [courseId]);

  const loadTopics = async () => {
    try {
      // Get topics with reply count
      const { data: topicsData, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_tutor_only", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

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
            author_name: profileResult.data?.full_name || "Usuario",
            replies_count: repliesResult.count || 0
          };
        })
      );

      setTopics(topicsWithDetails);
    } catch (error: any) {
      console.error("Error loading topics:", error);
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
    setRepliesLoading(true);
    try {
      const { data: repliesData, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get author names
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

      // Increment views count
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
      const { error } = await supabase.from("forum_topics").insert({
        course_id: courseId,
        title: newTopicTitle.trim(),
        content: newTopicContent.trim(),
        created_by: user.id,
        is_pinned: false,
        is_locked: false,
        views_count: 0
      });

      if (error) throw error;

      toast({
        title: "Tema creado",
        description: "Tu tema ha sido publicado en el foro"
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

  const handleTogglePin = async (topic: ForumTopic) => {
    try {
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_pinned: !topic.is_pinned })
        .eq("id", topic.id);

      if (error) throw error;

      toast({
        title: topic.is_pinned ? "Tema desanclado" : "Tema anclado",
        description: topic.is_pinned ? "El tema ya no está fijado" : "El tema ahora aparecerá primero"
      });

      loadTopics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema",
        variant: "destructive"
      });
    }
  };

  const handleToggleLock = async (topic: ForumTopic) => {
    try {
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_locked: !topic.is_locked })
        .eq("id", topic.id);

      if (error) throw error;

      toast({
        title: topic.is_locked ? "Tema desbloqueado" : "Tema bloqueado",
        description: topic.is_locked ? "Ahora se pueden añadir respuestas" : "Ya no se pueden añadir respuestas"
      });

      loadTopics();
      if (selectedTopic?.id === topic.id) {
        setSelectedTopic({ ...selectedTopic, is_locked: !topic.is_locked });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      // First delete all replies
      await supabase.from("forum_replies").delete().eq("topic_id", topicId);
      
      // Then delete the topic
      const { error } = await supabase.from("forum_topics").delete().eq("id", topicId);

      if (error) throw error;

      toast({
        title: "Tema eliminado",
        description: "El tema y sus respuestas han sido eliminados"
      });

      if (selectedTopic?.id === topicId) {
        setSelectedTopic(null);
      }
      loadTopics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tema",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsSolution = async (replyId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("forum_replies")
        .update({ is_solution: !currentValue })
        .eq("id", replyId);

      if (error) throw error;

      toast({
        title: currentValue ? "Solución desmarcada" : "Respuesta marcada como solución",
      });

      if (selectedTopic) {
        loadReplies(selectedTopic.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la respuesta",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase.from("forum_replies").delete().eq("id", replyId);

      if (error) throw error;

      toast({
        title: "Respuesta eliminada",
      });

      if (selectedTopic) {
        loadReplies(selectedTopic.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la respuesta",
        variant: "destructive"
      });
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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Topic detail view
  if (selectedTopic) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Button variant="ghost" size="sm" onClick={closeTopic} className="mb-2 -ml-2">
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
                    Bloqueado
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{selectedTopic.title}</CardTitle>
              <CardDescription className="flex items-center gap-3 mt-2">
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
            </div>
            {(isAdmin || isEditable) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                  <DropdownMenuItem onClick={() => handleTogglePin(selectedTopic)}>
                    {selectedTopic.is_pinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                    {selectedTopic.is_pinned ? "Desanclar" : "Fijar tema"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleLock(selectedTopic)}>
                    {selectedTopic.is_locked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {selectedTopic.is_locked ? "Desbloquear" : "Bloquear"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteTopic(selectedTopic.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar tema
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original post */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="whitespace-pre-wrap">{selectedTopic.content}</p>
          </div>

          <Separator />

          {/* Replies */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Respuestas ({replies.length})
            </h3>

            {repliesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-lg">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aún no hay respuestas</p>
                <p className="text-sm">Sé el primero en responder</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4 pr-4">
                  {replies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className={`p-4 border rounded-lg ${reply.is_solution ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {reply.author_name?.substring(0, 2).toUpperCase() || "US"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reply.author_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(reply.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                            </p>
                          </div>
                          {reply.is_solution && (
                            <Badge className="bg-green-500 text-white gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Solución
                            </Badge>
                          )}
                        </div>
                        {(isAdmin || isEditable || reply.created_by === user?.id) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                              {(isAdmin || isEditable) && (
                                <DropdownMenuItem onClick={() => handleMarkAsSolution(reply.id, reply.is_solution)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {reply.is_solution ? "Desmarcar solución" : "Marcar como solución"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReply(reply.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-sm mt-2">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Reply form */}
          {!selectedTopic.is_locked ? (
            <div className="space-y-3 pt-4 border-t">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleSubmitReply}
                disabled={!newReplyContent.trim() || submittingReply}
                className="w-full sm:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {submittingReply ? "Enviando..." : "Enviar respuesta"}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
              <Lock className="h-5 w-5 mx-auto mb-2" />
              <p>Este tema está bloqueado y no admite nuevas respuestas</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Topics list view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Foro de discusión</CardTitle>
            <CardDescription>Participa en las conversaciones del curso</CardDescription>
          </div>
          <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo tema
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear nuevo tema</DialogTitle>
                <DialogDescription>
                  Inicia una nueva discusión en el foro del curso
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título del tema</label>
                  <Input
                    placeholder="Ej: ¿Cómo resolver el ejercicio 3?"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contenido</label>
                  <Textarea
                    placeholder="Describe tu pregunta o tema de discusión..."
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateTopic}
                  disabled={!newTopicTitle.trim() || !newTopicContent.trim() || creating}
                >
                  {creating ? "Creando..." : "Publicar tema"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por tema, palabra clave o autor…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {(() => {
          const s = searchQuery.trim().toLowerCase();
          const visibleTopics = !s ? topics : topics.filter((t: any) =>
            t.title?.toLowerCase().includes(s) ||
            t.content?.toLowerCase().includes(s) ||
            t.author_name?.toLowerCase().includes(s)
          );
          return visibleTopics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{s ? "Sin resultados" : "No hay temas en el foro"}</p>
            <p className="text-sm mt-1">{s ? "Prueba con otra palabra clave" : "Sé el primero en crear un tema de discusión"}</p>
            {!s && (
              <Button className="mt-4" onClick={() => setNewTopicOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer tema
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTopics.map((topic) => (
              <div 
                key={topic.id} 
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => openTopic(topic)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {topic.is_pinned && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Pin className="h-3 w-3" />
                          Fijado
                        </Badge>
                      )}
                      {topic.is_locked && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Lock className="h-3 w-3" />
                          Cerrado
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {topic.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {topic.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {topic.author_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(topic.created_at), "d MMM yyyy", { locale: es })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {topic.replies_count} respuestas
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {topic.views_count} vistas
                      </span>
                    </div>
                  </div>
                  {(isAdmin || isEditable) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePin(topic); }}>
                          {topic.is_pinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                          {topic.is_pinned ? "Desanclar" : "Fijar tema"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleLock(topic); }}>
                          {topic.is_locked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                          {topic.is_locked ? "Desbloquear" : "Bloquear"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar tema
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        })()}
      </CardContent>
    </Card>
  );
}
