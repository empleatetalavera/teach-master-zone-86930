import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Save, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Search,
  Filter,
  CircleDot,
  AlertCircle,
  FileDown,
  MessageSquare
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface Submission {
  id: string;
  submission_text: string | null;
  file_path: string | null;
  file_name: string | null;
  submitted_at: string;
  status: string;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  user_id: string;
  activity_id: string;
  profiles?: {
    full_name: string | null;
  };
  development_activities?: {
    title: string;
    description: string | null;
    due_date: string | null;
    max_score: number | null;
  };
}

interface TeacherActivityCorrectionPanelProps {
  courseId: string;
}

export function TeacherActivityCorrectionPanel({ courseId }: TeacherActivityCorrectionPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [grading, setGrading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [courseId]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchUser, filterStatus]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_submissions')
        .select(`
          *,
          development_activities:activity_id (title, description, due_date, max_score, course_id)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Filter by course
      const courseSubmissions = data?.filter(s => 
        s.development_activities?.course_id === courseId
      ) || [];

      // Fetch profiles separately
      const userIds = courseSubmissions.map(s => s.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Merge profiles with submissions
      const submissionsWithProfiles = courseSubmissions.map(submission => ({
        ...submission,
        profiles: profilesData?.find(p => p.id === submission.user_id) || { full_name: null }
      }));

      setSubmissions(submissionsWithProfiles as Submission[]);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las entregas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (searchUser) {
      filtered = filtered.filter(s => 
        s.profiles?.full_name?.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    setFilteredSubmissions(filtered);
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || "");
    setFeedback(submission.feedback || "");
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > (selectedSubmission.development_activities?.max_score || 10)) {
      toast({
        title: "Error",
        description: `La calificación debe ser un número entre 0 y ${selectedSubmission.development_activities?.max_score || 10}`,
        variant: "destructive",
      });
      return;
    }

    setGrading(true);
    try {
      const { error } = await supabase
        .from('activity_submissions')
        .update({
          score: numericScore,
          feedback: feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Actividad calificada",
        description: "La calificación y observaciones se han guardado correctamente. El alumno recibirá una notificación.",
      });

      // Refresh and reset
      loadSubmissions();
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
    } catch (error: any) {
      console.error('Error grading submission:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };

  const isLateSubmission = (submission: Submission) => {
    if (!submission.development_activities?.due_date || !submission.submitted_at) return false;
    return new Date(submission.submitted_at) > new Date(submission.development_activities.due_date);
  };

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando actividades...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con título y descripción */}
      <Card className="bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            SEGUIMIENTO DE EJERCICIOS Y TAREAS
          </CardTitle>
          <CardDescription>
            Este módulo permite realizar el seguimiento de las diversas tareas, su estado, sus adjuntos.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="py-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Acción formativa</Label>
              <Input value="Curso actual" disabled className="mt-1" />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="-- Todo --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Todo --</SelectItem>
                  <SelectItem value="submitted">Pendiente de corregir</SelectItem>
                  <SelectItem value="graded">Corregidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => { setSearchUser(""); setFilterStatus("all"); }}>
                Limpiar
              </Button>
              <Button onClick={filterSubmissions}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Filtros avanzados */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary">
                <Filter className="h-4 w-4 mr-2" />
                {isAdvancedOpen ? "Ocultar" : "Mostrar"} filtros avanzados
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Usuario (alumno)</Label>
                  <Input 
                    value={searchUser} 
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Buscar por nombre de alumno"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Título de la tarea</Label>
                  <Input placeholder="Buscar por título" className="mt-1" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes de corregir</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Corregidas</p>
                <p className="text-2xl font-bold text-green-600">{gradedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de tareas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se han encontrado tareas pendientes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead>Usuario</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Fecha resolución</TableHead>
                    <TableHead>Fecha calificación</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow 
                      key={submission.id}
                      className={`cursor-pointer hover:bg-slate-50 ${selectedSubmission?.id === submission.id ? 'bg-primary/10' : ''}`}
                      onClick={() => handleSelectSubmission(submission)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {submission.profiles?.full_name || 'Sin nombre'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-primary hover:underline">
                          {submission.development_activities?.title || 'Actividad'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {new Date(submission.submitted_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          <CircleDot 
                            className={`h-4 w-4 ${isLateSubmission(submission) ? 'text-red-500' : 'text-green-500'}`} 
                            fill={isLateSubmission(submission) ? '#ef4444' : '#22c55e'}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.graded_at ? new Date(submission.graded_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </TableCell>
                      <TableCell>
                        {submission.score !== null ? (
                          <Badge variant="outline" className="font-mono">
                            {submission.score} / {submission.development_activities?.max_score || 10}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {submission.feedback ? (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground line-clamp-2" title={submission.feedback}>
                              {submission.feedback}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de corrección */}
      {selectedSubmission && (
        <Card className="border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Seguimiento de tareas - Corrección
            </CardTitle>
            <CardDescription>
              Corrigiendo actividad de: <strong>{selectedSubmission.profiles?.full_name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Enunciado de la tarea */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tarea:</Label>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-primary mb-2">ACTIVIDADES A REALIZAR</h4>
                <p className="text-sm text-slate-700">
                  {selectedSubmission.development_activities?.description || 'Sin descripción'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>Enunciado de la tarea que el alumno debe realizar</span>
              </div>
            </div>

            <Separator />

            {/* Información de la tarea */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Fecha límite:</Label>
                <p className="font-medium">
                  {selectedSubmission.development_activities?.due_date 
                    ? new Date(selectedSubmission.development_activities.due_date).toLocaleDateString('es-ES')
                    : 'Sin fecha límite'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Título:</Label>
                <p className="font-medium">{selectedSubmission.development_activities?.title}</p>
              </div>
            </div>

            <Separator />

            {/* Tarea Grupal indicator */}
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled className="h-4 w-4" />
              <span className="text-muted-foreground">Tarea Grupal</span>
            </div>

            {/* Solucionario - Archivo con propuesta de solución y sistema de corrección */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                Solucionario:
              </Label>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  Archivo con propuesta de solución y sistema de corrección
                </p>
                <Button variant="outline" size="sm" className="mt-2 text-orange-700 border-orange-300 hover:bg-orange-100">
                  <FileDown className="h-4 w-4 mr-2" />
                  Descargar solucionario (si disponible)
                </Button>
              </div>
            </div>

            <Separator />

            {/* Respuesta del alumno */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resolución:</Label>
              <p className="text-xs text-muted-foreground mb-2">Respuesta tarea enviada por el alumno</p>
              <div className="p-4 bg-slate-50 rounded-lg border min-h-[100px]">
                {selectedSubmission.submission_text || 'Sin texto de respuesta'}
              </div>
              {selectedSubmission.file_path && (
                <Button variant="outline" size="sm" className="mt-2">
                  <FileDown className="h-4 w-4 mr-2" />
                  Descargar archivo adjunto: {selectedSubmission.file_name}
                </Button>
              )}
            </div>

            <Separator />

            {/* Área de calificación - Espacio para indicar calificación y observaciones */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 mb-2">
                Espacio para indicar la calificación y las observaciones de la corrección
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="score">Calificación (0-{selectedSubmission.development_activities?.max_score || 10}):</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max={selectedSubmission.development_activities?.max_score || 10}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Introduce la calificación"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Observaciones de la corrección:</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escribe aquí tus observaciones y comentarios para el alumno..."
                  rows={4}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Feedback indicator */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                Feedback:
              </Label>
              <p className="text-xs text-muted-foreground">
                Indicación de que la actividad se ha corregido y se ha informado al alumno sobre la valoración de su actividad.
              </p>
              <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                El alumno recibirá las observaciones por correo electrónico una vez guardes la calificación.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleGradeSubmission} 
                disabled={grading || !score}
                className="flex-1"
              >
                {grading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar calificación
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubmission(null)}
              >
                Cancelar
              </Button>
            </div>

            {/* Indicador de actividad corregida */}
            {selectedSubmission.status === 'graded' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  ✓ Actividad corregida - El alumno ha sido informado sobre la valoración de su actividad.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leyenda */}
      <Card className="bg-slate-50">
        <CardContent className="py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-green-500" fill="#22c55e" />
              <span>Resolución de actividad entregada dentro de plazo</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-red-500" fill="#ef4444" />
              <span>Resolución de actividad entregada fuera de plazo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
