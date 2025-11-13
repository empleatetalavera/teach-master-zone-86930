import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FileText, FileSearch, Save, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlagiarismReport } from "@/components/PlagiarismReport";

interface Submission {
  id: string;
  submission_text: string | null;
  submitted_at: string;
  status: string;
  score: number | null;
  feedback: string | null;
  user_id: string;
  activity_id: string;
  profiles: {
    full_name: string | null;
  };
  development_activities: {
    title: string;
    description: string | null;
  };
}

export default function TeacherActivityGrading() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [grading, setGrading] = useState(false);
  
  // Plagiarism check states
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismReport, setPlagiarismReport] = useState<any>(null);
  const [showPlagiarismReport, setShowPlagiarismReport] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_submissions')
        .select(`
          *,
          development_activities:activity_id (title, description)
        `)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data?.map(s => s.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      // Merge profiles with submissions
      const submissionsWithProfiles = data?.map(submission => ({
        ...submission,
        profiles: profilesData?.find(p => p.id === submission.user_id) || { full_name: null }
      }));
      
      setSubmissions(submissionsWithProfiles as Submission[]);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las entregas pendientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || "");
    setFeedback(submission.feedback || "");
    setPlagiarismReport(null);
  };

  const handleCheckPlagiarism = async () => {
    if (!selectedSubmission?.submission_text) {
      toast({
        title: "Error",
        description: "No hay contenido para analizar",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckingPlagiarism(true);
      setShowPlagiarismReport(true);
      
      const { data, error } = await supabase.functions.invoke('check-plagiarism', {
        body: { 
          content: selectedSubmission.submission_text,
          title: selectedSubmission.development_activities.title
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setPlagiarismReport(data.report);
      
      toast({
        title: "Análisis completado",
        description: "El informe de originalidad está listo",
      });
    } catch (error: any) {
      console.error('Error checking plagiarism:', error);
      toast({
        title: "Error al analizar",
        description: error.message || "No se pudo completar el análisis de plagio",
        variant: "destructive",
      });
      setShowPlagiarismReport(false);
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      toast({
        title: "Error",
        description: "La calificación debe ser un número entre 0 y 100",
        variant: "destructive",
      });
      return;
    }

    try {
      setGrading(true);
      const { error } = await supabase
        .from('activity_submissions')
        .update({
          status: 'graded',
          score: numericScore,
          feedback: feedback || null,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Calificación guardada",
        description: "La actividad ha sido calificada exitosamente",
      });

      // Reload submissions and clear selection
      await loadSubmissions();
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
      setPlagiarismReport(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/teacher")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calificar Actividades</h1>
            <p className="text-muted-foreground mt-2">
              Revisa y califica las entregas de tus estudiantes
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {submissions.length} pendientes
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Entregas Pendientes</CardTitle>
            <CardDescription>
              Selecciona una entrega para revisar y calificar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando entregas...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-muted-foreground">¡Excelente! No hay entregas pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectSubmission(submission)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {submission.profiles?.full_name || 'Estudiante'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {submission.development_activities.title}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Entregado
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Entregado: {new Date(submission.submitted_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grading Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Revisar y Calificar</CardTitle>
            <CardDescription>
              {selectedSubmission 
                ? `Calificando: ${selectedSubmission.development_activities.title}`
                : 'Selecciona una entrega para comenzar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSubmission ? (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Estudiante</Label>
                  <p className="text-base">{selectedSubmission.profiles?.full_name || 'Sin nombre'}</p>
                </div>

                {/* Activity Description */}
                {selectedSubmission.development_activities.description && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Descripción de la Actividad</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubmission.development_activities.description}
                    </p>
                  </div>
                )}

                {/* Submission Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Contenido Entregado</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCheckPlagiarism}
                      disabled={checkingPlagiarism || !selectedSubmission.submission_text}
                      className="gap-2"
                    >
                      <FileSearch className="h-4 w-4" />
                      {checkingPlagiarism ? 'Analizando...' : 'Verificar Originalidad'}
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSubmission.submission_text || 'Sin contenido de texto'}
                    </p>
                  </div>
                </div>

                {/* Grading Form */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="score">Calificación (0-100)</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="Ej: 85"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Retroalimentación</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Escribe comentarios para el estudiante..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleGradeSubmission}
                    disabled={grading || !score}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {grading ? 'Guardando...' : 'Guardar Calificación'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona una entrega de la lista para comenzar a calificar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plagiarism Report Modal */}
      <PlagiarismReport
        open={showPlagiarismReport}
        onOpenChange={setShowPlagiarismReport}
        report={plagiarismReport}
        loading={checkingPlagiarism}
      />
    </div>
  );
}
