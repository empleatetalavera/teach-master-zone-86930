import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Clock, CheckCircle2, AlertCircle, Play, Eye } from "lucide-react";

interface Evaluation {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  evaluation_criteria: string | null;
  due_date: string | null;
  passing_score: number;
  max_attempts: number | null;
  time_limit_minutes: number | null;
  course_id: string;
}

interface EvaluationAttempt {
  id: string;
  score: number | null;
  status: string;
  completed_at: string | null;
  attempt_number: number;
}

export default function EvaluationView() {
  const { courseId, evaluationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [attempts, setAttempts] = useState<EvaluationAttempt[]>([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (evaluationId && user) {
      loadEvaluation();
    }
  }, [evaluationId, user]);

  const loadEvaluation = async () => {
    try {
      const [evalResult, attemptsResult, questionsResult] = await Promise.all([
        supabase
          .from("evaluations")
          .select("*")
          .eq("id", evaluationId)
          .single(),
        supabase
          .from("evaluation_attempts")
          .select("*")
          .eq("evaluation_id", evaluationId)
          .eq("user_id", user!.id)
          .order("attempt_number", { ascending: false }),
        supabase
          .from("evaluation_questions")
          .select("id", { count: 'exact', head: true })
          .eq("evaluation_id", evaluationId)
          .eq("is_active", true)
      ]);

      if (evalResult.error) throw evalResult.error;
      setEvaluation(evalResult.data);
      setAttempts(attemptsResult.data || []);
      setQuestionsCount(questionsResult.count || 0);
    } catch (error: any) {
      console.error("Error loading evaluation:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la evaluación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async () => {
    if (!evaluation || !user) return;

    if (questionsCount === 0) {
      toast({
        title: "Evaluación sin preguntas",
        description: "Esta evaluación aún no tiene preguntas configuradas. Avisa a tu tutor.",
        variant: "destructive"
      });
      return;
    }

    const completedAttempts = attempts.filter((a) => a.status === 'completed').length;
    if (evaluation.max_attempts && completedAttempts >= evaluation.max_attempts) {
      toast({
        title: "Límite de intentos alcanzado",
        description: `Has alcanzado el máximo de ${evaluation.max_attempts} intentos`,
        variant: "destructive"
      });
      return;
    }

    setStarting(true);
    try {
      const inProgressAttempt = attempts.find((a) => a.status === 'in_progress');
      
      let attemptIdToUse: string;

      if (inProgressAttempt) {
        attemptIdToUse = inProgressAttempt.id;
        toast({
          title: "Continuando intento",
          description: "Retomamos donde lo dejaste",
        });
      } else {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("course_id", courseId)
          .eq("user_id", user.id)
          .single();

        if (!enrollment) {
          throw new Error("No estás matriculado en este curso");
        }

        const { data: newAttempt, error } = await supabase
          .from("evaluation_attempts")
          .insert({
            evaluation_id: evaluationId,
            user_id: user.id,
            enrollment_id: enrollment.id,
            attempt_number: attempts.length + 1,
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        attemptIdToUse = newAttempt.id;

        toast({
          title: "Evaluación iniciada",
          description: "Buena suerte con tu evaluación",
        });
      }

      navigate(`/course/${courseId}/evaluation/${evaluationId}/take/${attemptIdToUse}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setStarting(false);
    }
  };

  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const inProgressAttempt = attempts.find((a) => a.status === 'in_progress');
  
  const bestScore = completedAttempts.length > 0
    ? Math.max(...completedAttempts.filter(a => a.score !== null).map(a => a.score!))
    : null;

  const hasPassed = bestScore !== null && bestScore >= (evaluation?.passing_score || 50);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Evaluación no encontrada</CardTitle>
            <CardDescription>
              La evaluación que buscas no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const buttonLabel = inProgressAttempt
    ? "Continuar evaluación"
    : completedAttempts.length === 0
    ? "Comenzar Evaluación"
    : "Nuevo Intento";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${courseId}`)}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al curso
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl">{evaluation.title}</CardTitle>
                {evaluation.description && (
                  <CardDescription className="mt-2 text-sm sm:text-base">
                    {evaluation.description}
                  </CardDescription>
                )}
              </div>
              {hasPassed ? (
                <Badge className="bg-green-500 self-start">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aprobado
                </Badge>
              ) : completedAttempts.length > 0 ? (
                <Badge variant="destructive" className="self-start">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  No aprobado
                </Badge>
              ) : (
                <Badge variant="secondary" className="self-start">Pendiente</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-primary">{evaluation.passing_score}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Nota mínima</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {evaluation.max_attempts || "∞"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Intentos máx.</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {evaluation.time_limit_minutes || "∞"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Minutos</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {questionsCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Preguntas</p>
              </div>
            </div>

            {bestScore !== null && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Mejor calificación</p>
                <div className="flex items-center gap-4">
                  <Progress value={bestScore} className="flex-1" />
                  <span className="text-lg font-bold">{bestScore}%</span>
                </div>
              </div>
            )}

            {questionsCount === 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="flex gap-3 pt-6">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Esta evaluación aún no tiene preguntas</p>
                    <p className="text-muted-foreground mt-1">
                      Tu tutor todavía no ha configurado las preguntas. Vuelve más tarde.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleStartEvaluation}
              disabled={
                starting || 
                questionsCount === 0 ||
                (evaluation.max_attempts !== null && completedAttempts.length >= evaluation.max_attempts)
              }
              className="w-full"
              size="lg"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {buttonLabel}
            </Button>

            {evaluation.max_attempts && (
              <p className="text-sm text-center text-muted-foreground">
                Intentos completados: {completedAttempts.length} / {evaluation.max_attempts}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Historial de intentos */}
        {attempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Intentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.map((attempt) => (
                  <div 
                    key={attempt.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-bold">{attempt.attempt_number}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">Intento #{attempt.attempt_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.completed_at 
                            ? new Date(attempt.completed_at).toLocaleDateString("es-ES", {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : "En progreso"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {attempt.score !== null ? (
                        <>
                          <Progress value={attempt.score} className="w-20 sm:w-24" />
                          <span className={`font-bold ${attempt.score >= evaluation.passing_score ? 'text-green-500' : 'text-red-500'}`}>
                            {attempt.score}%
                          </span>
                          {attempt.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/course/${courseId}/evaluation/${evaluationId}/review/${attempt.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Revisar
                            </Button>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          En curso
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
