import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, TrendingUp, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationStats {
  totalConversations: number;
  averageResponseTime: number;
  conversationsByRole: { role: string; count: number }[];
  topCourses: { course_title: string; count: number }[];
}

interface CommonQuestion {
  question: string;
  count: number;
  category?: string;
}

interface RecentConversation {
  id: string;
  user_message: string;
  assistant_response: string;
  created_at: string;
  user_role: string;
  context_page: string;
  course?: { title: string };
  module?: { title: string };
}

export default function AdminAIAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [commonQuestions, setCommonQuestions] = useState<CommonQuestion[]>([]);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load all conversations
      const { data: conversations, error } = await supabase
        .from("ai_conversations")
        .select(`
          *,
          course:context_course_id(title),
          module:context_module_id(title)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate statistics
      const totalConversations = conversations?.length || 0;
      
      const averageResponseTime = conversations?.reduce((acc, conv) => 
        acc + (conv.response_time_ms || 0), 0
      ) / totalConversations || 0;

      const roleCount = conversations?.reduce((acc, conv) => {
        const role = conv.user_role || "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const conversationsByRole = Object.entries(roleCount || {}).map(([role, count]) => ({
        role,
        count,
      }));

      // Count conversations by course
      const courseCount = conversations?.reduce((acc, conv) => {
        if (conv.course?.title) {
          acc[conv.course.title] = (acc[conv.course.title] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topCourses = Object.entries(courseCount || {})
        .map(([course_title, count]) => ({ course_title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalConversations,
        averageResponseTime: Math.round(averageResponseTime),
        conversationsByRole,
        topCourses,
      });

      // Analyze common questions (simplified - group similar questions)
      const questionWords = conversations?.map(conv => 
        conv.user_message.toLowerCase().split(' ').filter(w => w.length > 4)
      ).flat() || [];

      const wordCount = questionWords.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commonWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([question, count]) => ({ question, count }));

      setCommonQuestions(commonWords);
      setRecentConversations(conversations as any || []);

    } catch (error: any) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis del Asistente AI</h1>
        <p className="text-muted-foreground">
          Monitorea las interacciones y mejora el contenido basándote en las consultas de los estudiantes
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Interacciones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Respuesta Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Rendimiento del asistente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Más Consultados</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.topCourses.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cursos con dudas frecuentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencias</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.conversationsByRole.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tipos de usuarios activos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Preguntas Comunes</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="conversations">Conversaciones Recientes</TabsTrigger>
          <TabsTrigger value="roles">Por Rol</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Palabras Clave Más Frecuentes</CardTitle>
              <CardDescription>
                Términos que aparecen con mayor frecuencia en las preguntas de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonQuestions.map((q, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">{q.question}</span>
                    </div>
                    <Badge variant="secondary">{q.count} veces</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cursos con Más Consultas</CardTitle>
              <CardDescription>
                Identifica qué cursos generan más dudas para mejorar su contenido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.topCourses.map((course, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{course.course_title}</span>
                    </div>
                    <Badge>{course.count} consultas</Badge>
                  </div>
                ))}
                {stats?.topCourses.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay datos de cursos consultados aún
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones Recientes</CardTitle>
              <CardDescription>
                Últimas 100 interacciones con el asistente AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {recentConversations.map((conv) => (
                    <div key={conv.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{conv.user_role}</Badge>
                            {conv.course && (
                              <Badge variant="secondary">{conv.course.title}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conv.created_at).toLocaleString("es-ES")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium mb-1">Pregunta:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {conv.user_message}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Respuesta:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded line-clamp-3">
                            {conv.assistant_response}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones por Rol</CardTitle>
              <CardDescription>
                Distribución de consultas según el tipo de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.conversationsByRole.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="capitalize font-medium">{item.role}</div>
                    </div>
                    <Badge>{item.count} conversaciones</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
