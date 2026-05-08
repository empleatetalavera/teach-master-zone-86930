import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Lightbulb, Clock, Calendar, Award } from "lucide-react";

interface AnswerDetail {
  question_id: string;
  question_text?: string;
  student_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  points: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: Array<{ id: string; text: string }>;
  correct_answer: string;
  explanation: string | null;
  points: number;
  order_index: number;
}

interface Attempt {
  id: string;
  evaluation_id: string;
  user_id: string;
  attempt_number: number;
  status: string;
  score: number | null;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
  answers: AnswerDetail[] | null;
}

interface Evaluation {
  id: string;
  title: string;
  passing_score: number;
  course_id: string;
}

export default function ReviewAttempt() {
  const { courseId, evaluationId, attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (attemptId && evaluationId && user) {
      loadReview();
    }
  }, [attemptId, evaluationId, user]);

  const loadReview = async () => {
    try {
      // Cargar el intento
      const { data: attemptData, error: attemptError } = await supabase
        .from("evaluation_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;
      if (!attemptData) throw new Error("Intento no encontrado");

      // Permisos: el propio alumno o tutor/admin (las RLS ya lo filtran)
      if (attemptData.status !== 'completed') {
        toast({
          title: "Intento no completado",
          description: "Solo se pueden revisar evaluaciones finalizadas",
        });
        navigate(`/course/${courseId}/evaluation/${evaluationId}`);
        return;
      }

      setAttempt(attemptData as unknown as Attempt);

      // Cargar la evaluación
      const { data: evalData, error: evalError } = await supabase
        .from("evaluations")
        .select("id, title, passing_score, course_id")
        .eq("id", evaluationId)
        .single();

      if (evalError) throw evalError;
      setEvaluation(evalData);

      // Cargar las preguntas (para tener las opciones y explicaciones)
      const { data: questionsData, error: questionsError } = await supabase
        .from("evaluation_questions")
        .select("*")
        .eq("evaluation_id", evaluationId)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions((questionsData || []) as unknown as Question[]);
    } catch (error: any) {
      console.error("Error loading review:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la revisión",
        variant: "destructive"
      });
      navigate(`/course/${courseId}/evaluation/${evaluationId}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt || !evaluation || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Revisión no disponible</CardTitle>
            <CardDescription>
              No se pudo cargar la información de este intento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/course/${courseId}/evaluation/${evaluationId}`)}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passed = (attempt.score ?? 0) >= evaluation.passing_score;
  const correctCount = (attempt.answers || []).filter(a => a.is_correct).length;
  const totalQuestions = questions.length;
  const answersByQuestionId = new Map(
    (attempt.answers || []).map(a => [a.question_id, a])
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4">

        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${courseId}/evaluation/${evaluationId}`)}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la evaluación
        </Button>

        {/* Resumen del intento */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl">
                  Revisión: {evaluation.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  Intento #{attempt.attempt_number}
                </CardDescription>
              </div>
              {passed ? (
                <Badge className="bg-green-500 self-start text-base px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aprobado
                </Badge>
              ) : (
                <Badge variant="destructive" className="self-start text-base px-3 py-1">
                  <XCircle className="h-4 w-4 mr-1" />
                  No aprobado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Award className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{attempt.score ?? 0}%</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{correctCount}/{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Acertadas</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-base font-bold">{formatDuration(attempt.time_spent_seconds)}</p>
                <p className="text-xs text-muted-foreground">Tiempo</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-bold leading-tight">{formatDate(attempt.completed_at)}</p>
                <p className="text-xs text-muted-foreground mt-1">Finalizado</p>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Nota mínima requerida</span>
                <span className="font-medium">{evaluation.passing_score}%</span>
              </div>
              <Progress value={attempt.score ?? 0} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Lista de preguntas con respuestas */}
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          Detalle de las preguntas
        </h2>

        <div className="space-y-4">
          {questions.map((question, idx) => {
            const studentAnswer = answersByQuestionId.get(question.id);
            const studentChoice = studentAnswer?.student_answer ?? null;
            const isCorrect = studentAnswer?.is_correct ?? false;
            const wasNotAnswered = !studentChoice;

            return (
              <Card
                key={question.id}
                className={`border-l-4 ${
                  isCorrect 
                    ? 'border-l-green-500' 
                    : wasNotAnswered 
                    ? 'border-l-yellow-500'
                    : 'border-l-red-500'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">
                          Pregunta {idx + 1}
                        </Badge>
                        {isCorrect ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Correcta
                          </Badge>
                        ) : wasNotAnswered ? (
                          <Badge className="bg-yellow-500">
                            Sin responder
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Incorrecta
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base sm:text-lg leading-relaxed">
                        {question.question_text}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Opciones */}
                  {question.question_type === 'true_false' ? (
                    <div className="space-y-2">
                      {['true', 'false'].map((opt) => {
                        const isStudent = studentChoice === opt;
                        const isCorrectOpt = question.correct_answer === opt;
                        return (
                          <div
                            key={opt}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectOpt
                                ? 'border-green-500 bg-green-500/10'
                                : isStudent
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                              {isStudent && !isCorrectOpt && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                              <span className="capitalize">{opt === 'true' ? 'Verdadero' : 'Falso'}</span>
                              {isStudent && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  Tu respuesta
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isStudent = studentChoice === option.id;
                        const isCorrectOpt = question.correct_answer === option.id;
                        return (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectOpt
                                ? 'border-green-500 bg-green-500/10'
                                : isStudent
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {isCorrectOpt && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              )}
                              {isStudent && !isCorrectOpt && (
                                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              )}
                              {!isCorrectOpt && !isStudent && (
                                <span className="h-4 w-4 shrink-0" />
                              )}
                              <span className="flex-1 text-sm sm:text-base">
                                <span className="font-medium uppercase mr-2">{option.id})</span>
                                {option.text}
                              </span>
                              {isStudent && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  Tu respuesta
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explicación (siempre visible si existe) */}
                  {question.explanation && (
                    <div className="flex gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Explicación:</p>
                        <p className="text-muted-foreground">{question.explanation}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Acciones finales */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(`/course/${courseId}/evaluation/${evaluationId}`)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la evaluación
          </Button>
          <Button
            onClick={() => navigate(`/course/${courseId}`)}
            className="w-full sm:flex-1"
          >
            Continuar con el curso
          </Button>
        </div>
      </div>
    </div>
  );
}
