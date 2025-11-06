import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Clock, MessageSquare, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QualityAuditViewProps {
  courseId: string;
}

export function QualityAuditView({ courseId }: QualityAuditViewProps) {
  const [loading, setLoading] = useState(true);
  const [enrollmentStats, setEnrollmentStats] = useState<any>(null);
  const [timeStats, setTimeStats] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    loadAuditData();
  }, [courseId]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      // Load enrollment statistics
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('id, user_id, progress_percentage, enrolled_at, completed_at, last_accessed_at')
        .eq('course_id', courseId);

      if (enrollError) throw enrollError;

      // Calculate stats
      const totalStudents = enrollments?.length || 0;
      const completedCount = enrollments?.filter(e => e.completed_at)?.length || 0;
      const avgProgress = enrollments?.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / (totalStudents || 1);
      
      setEnrollmentStats({
        total: totalStudents,
        completed: completedCount,
        avgProgress: avgProgress.toFixed(1),
        active: enrollments?.filter(e => {
          if (!e.last_accessed_at) return false;
          const daysSinceAccess = Math.floor((Date.now() - new Date(e.last_accessed_at).getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceAccess <= 7;
        }).length || 0
      });

      // Load time tracking data
      const { data: timeData, error: timeError } = await supabase
        .from('content_interactions')
        .select('user_id, time_spent_seconds, created_at, module_id')
        .in('enrollment_id', enrollments?.map(e => e.id) || [])
        .order('created_at', { ascending: false })
        .limit(100);

      if (timeError) throw timeError;

      // Aggregate time by student
      const timeByStudent = timeData?.reduce((acc: any, interaction: any) => {
        if (!acc[interaction.user_id]) {
          acc[interaction.user_id] = 0;
        }
        acc[interaction.user_id] += interaction.time_spent_seconds || 0;
        return acc;
      }, {});

      const timeStatsArray = Object.entries(timeByStudent || {}).map(([userId, seconds]: [string, any]) => ({
        userId,
        hours: (seconds / 3600).toFixed(1),
        seconds
      }));

      setTimeStats(timeStatsArray);

      // Load AI feedback/conversations
      const { data: conversations, error: convError } = await supabase
        .from('ai_conversations')
        .select('user_id, user_message, assistant_response, was_helpful, created_at, context_course_id')
        .eq('context_course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (convError) throw convError;
      setFeedbackData(conversations || []);

      // Load activity submissions quality
      const { data: submissions, error: subError } = await supabase
        .from('activity_submissions')
        .select('user_id, score, status, submitted_at, graded_at, activity_id')
        .in('enrollment_id', enrollments?.map(e => e.id) || []);

      if (subError) throw subError;
      setActivityData(submissions || []);

    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const helpfulFeedback = feedbackData.filter(f => f.was_helpful === true).length;
  const totalRatedFeedback = feedbackData.filter(f => f.was_helpful !== null).length;
  const satisfactionRate = totalRatedFeedback > 0 ? ((helpfulFeedback / totalRatedFeedback) * 100).toFixed(1) : 'N/A';

  const avgScore = activityData.length > 0
    ? (activityData.reduce((acc, a) => acc + (a.score || 0), 0) / activityData.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Auditoría de Calidad Formativa</h2>
          <p className="text-muted-foreground">Panel de evaluación para la Junta de Comunidades de Castilla-La Mancha</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumnos Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {enrollmentStats?.active || 0} activos últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Medio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentStats?.avgProgress || 0}%</div>
            <Progress value={parseFloat(enrollmentStats?.avgProgress || '0')} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción IA</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfactionRate}{satisfactionRate !== 'N/A' ? '%' : ''}</div>
            <p className="text-xs text-muted-foreground">
              {helpfulFeedback}/{totalRatedFeedback} interacciones útiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Media</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}{avgScore !== 'N/A' ? '/100' : ''}</div>
            <p className="text-xs text-muted-foreground">
              {activityData.filter(a => a.status === 'graded').length} actividades calificadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="time" className="space-y-4">
        <TabsList>
          <TabsTrigger value="time">Tiempos Invertidos</TabsTrigger>
          <TabsTrigger value="feedback">Retroalimentación IA</TabsTrigger>
          <TabsTrigger value="quality">Calidad Actividades</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiempos de Estudio por Alumno</CardTitle>
              <CardDescription>Horas invertidas en el curso por cada estudiante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay datos de tiempo disponibles
                  </p>
                ) : (
                  timeStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">Usuario {stat.userId.slice(0, 8)}...</span>
                      </div>
                      <Badge variant="secondary">{stat.hours}h</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interacciones con Asistente IA</CardTitle>
              <CardDescription>Últimas conversaciones y valoraciones de utilidad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay retroalimentación disponible
                  </p>
                ) : (
                  feedbackData.slice(0, 10).map((conv, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.created_at).toLocaleDateString('es-ES')}
                        </span>
                        {conv.was_helpful !== null && (
                          <Badge variant={conv.was_helpful ? "default" : "destructive"}>
                            {conv.was_helpful ? "Útil" : "No útil"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1">Pregunta: {conv.user_message.slice(0, 100)}...</p>
                      <p className="text-xs text-muted-foreground">Respuesta: {conv.assistant_response.slice(0, 150)}...</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluación de Actividades</CardTitle>
              <CardDescription>Calificaciones y estado de entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay actividades calificadas
                  </p>
                ) : (
                  activityData.slice(0, 15).map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">Usuario {activity.user_id.slice(0, 8)}...</span>
                        <Badge variant={
                          activity.status === 'graded' ? 'default' :
                          activity.status === 'submitted' ? 'secondary' : 'outline'
                        }>
                          {activity.status === 'graded' ? 'Calificado' : 
                           activity.status === 'submitted' ? 'Entregado' : activity.status}
                        </Badge>
                      </div>
                      {activity.score !== null && (
                        <div className="flex items-center gap-2">
                          <Progress value={activity.score} className="w-20" />
                          <span className="text-sm font-bold min-w-[3ch]">{activity.score}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
