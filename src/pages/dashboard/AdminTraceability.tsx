import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Users, BookOpen, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SessionStats {
  totalSessions: number;
  averageDuration: number;
  activeUsers: number;
  totalTimeSpent: number;
}

interface RecentSession {
  id: string;
  user_id: string;
  session_type: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  profile_name?: string;
}

interface ContentInteraction {
  id: string;
  user_id: string;
  interaction_type: string;
  time_spent_seconds: number;
  completed: boolean;
  created_at: string;
  profile_name?: string;
  module_title?: string;
}

export default function AdminTraceability() {
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    averageDuration: 0,
    activeUsers: 0,
    totalTimeSpent: 0,
  });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [contentInteractions, setContentInteractions] = useState<ContentInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load session statistics
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (sessions) {
      const uniqueUsers = new Set(sessions.map(s => s.user_id)).size;
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

      setSessionStats({
        totalSessions: sessions.length,
        averageDuration: Math.round(avgDuration),
        activeUsers: uniqueUsers,
        totalTimeSpent: totalDuration,
      });
    }

    // Load recent sessions
    const { data: recentSessionsData } = await supabase
      .from('user_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (recentSessionsData) {
      // Fetch profiles separately to avoid foreign key issues
      const userIds = recentSessionsData.map(s => s.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);
      
      const sessionsWithNames = recentSessionsData.map(session => ({
        ...session,
        profile_name: profilesMap.get(session.user_id),
      }));
      
      setRecentSessions(sessionsWithNames);
    }

    // Load content interactions
    const { data: interactionsData } = await supabase
      .from('content_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (interactionsData) {
      // Fetch profiles and modules separately
      const userIds = interactionsData.map(i => i.user_id);
      const moduleIds = interactionsData.map(i => i.module_id);
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const { data: modulesData } = await supabase
        .from('modules')
        .select('id, title')
        .in('id', moduleIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);
      const modulesMap = new Map(modulesData?.map(m => [m.id, m.title]) || []);
      
      const interactionsWithNames = interactionsData.map(interaction => ({
        ...interaction,
        profile_name: profilesMap.get(interaction.user_id),
        module_title: modulesMap.get(interaction.module_id),
      }));
      
      setContentInteractions(interactionsWithNames);
    }

    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getSessionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-500',
      logout: 'bg-red-500',
      course_view: 'bg-blue-500',
      module_view: 'bg-purple-500',
      evaluation: 'bg-orange-500',
      communication: 'bg-cyan-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de trazabilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trazabilidad SEPE</h1>
        <p className="text-muted-foreground">
          Registro completo de actividad para auditorías Fundae
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Registros de actividad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Media</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(sessionStats.averageDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Por sesión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(sessionStats.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Tiempo de formación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sesiones de Usuario</TabsTrigger>
          <TabsTrigger value="interactions">Interacciones con Contenido</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Sesiones</CardTitle>
              <CardDescription>
                Historial completo de accesos y actividad de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.profile_name || 'Usuario sin nombre'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSessionTypeBadge(session.session_type)}>
                          {session.session_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(session.started_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {session.ended_at 
                          ? format(new Date(session.ended_at), 'dd MMM yyyy HH:mm', { locale: es })
                          : 'En curso'}
                      </TableCell>
                      <TableCell>
                        {session.duration_seconds ? formatDuration(session.duration_seconds) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interacciones con Contenido</CardTitle>
              <CardDescription>
                Seguimiento de visualización y completado de módulos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Tiempo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentInteractions.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell className="font-medium">
                        {interaction.profile_name || 'Usuario sin nombre'}
                      </TableCell>
                      <TableCell>
                        {interaction.module_title || 'Módulo desconocido'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {interaction.interaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDuration(interaction.time_spent_seconds)}
                      </TableCell>
                      <TableCell>
                        {interaction.completed ? (
                          <Badge className="bg-green-500">Completado</Badge>
                        ) : (
                          <Badge variant="secondary">En progreso</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(interaction.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
