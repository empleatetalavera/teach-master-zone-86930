import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

interface Evaluation {
  id: string;
  title: string;
  passing_score: number;
  time_limit_minutes: number | null;
  course_id: string;
}

export default function TakeEvaluation() {
  const { courseId, evaluationId, attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState<number>(Date.now());

  // Cargar evaluación y preguntas
  useEffect(() => {
    if (evaluationId && user && attemptId) {
      loadEvaluationAndQuestions();
    }
  }, [evaluationId, user, attemptId]);

  // Configurar temporizador si hay límite de tiempo
  useEffect(() => {
    if (evaluation?.time_limit_minutes && timeRemaining === null) {
      setTimeRemaining(evaluation.time_limit_minutes * 60);
    }
  }, [evaluation]);

  // Countdown del temporizador
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true); // auto-enviar al acabar el tiempo
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const loadEvaluationAndQuestions = async () => {
    try {
      // Verificar que el intento es válido y pertenece al usuario
      const { data: attempt, error: attemptError } = await supabase
        .from("evaluation_attempts")
        .select("id, status, evaluation_id, user_id")
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;
      if (!attempt) throw new Error("Intento no encontrado");
      if (attempt.user_id !== user?.id) throw new Error("Este intento no te pertenece");
      if (attempt.status !== 'in_progress') {
        toast({
          title: "Intento ya finalizado",
          description: "Esta evaluación ya fue completada",
        });
        navigate(`/course/${courseId}/evaluation/${evaluationId}`);
        return;
      }

      // Cargar la evaluación y las preguntas en paralelo
      const [evalResult, questionsResult] = await Promise.all([
        supabase
          .from("evaluations")
          .select("id, title, passing_score, time_limit_minutes, course_id")
          .eq("id", evaluationId)
          .single(),
        supabase
          .from("evaluation_questions")
          .select("*")
          .eq("evaluation_id", evaluationId)
          .eq("is_active", true)
          .order("order_index", { ascending: true })
      ]);

      if (evalResult.error) throw evalResult.error;
      if (questionsResult.error) throw questionsResult.error;

      if (!questionsResult.data || questionsResult.data.length === 0) {
        toast({
          title: "Sin preguntas",
          description: "Esta evaluación aún no tiene preguntas configuradas. Avisa a tu tutor.",
          variant: "destructive"
        });
        navigate(`/course/${courseId}/evaluation/${evaluationId}`);
        return;
      }

      setEvaluation(evalResult.data);
      setQuestions(questionsResult.data as unknown as Question[]);
    } catch (error: any) {
      console.error("Error loading evaluation:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la evaluación",
        variant: "destructive"
      });
      navigate(`/course/${courseId}/evaluation/${evaluationId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async (autoSubmit: boolean = false) => {
    if (submitting) return;
    
    // Si no es auto-submit, comprobar que ha respondido todas
    if (!autoSubmit) {
      const unanswered = questions.filter((q) => !answers[q.id]);
      if (unanswered.length > 0) {
        const confirmSubmit = window.confirm(
          `Tienes ${unanswered.length} pregunta(s) sin responder. ¿Quieres enviar la evaluación de todas formas? Las preguntas sin responder se considerarán incorrectas.`
        );
        if (!confirmSubmit) return;
      }
    }

    setSubmitting(true);
    try {
      // Calcular puntuación
      let totalPoints = 0;
      let earnedPoints = 0;
      const detailedAnswers: any[] = [];

      questions.forEach((q) => {
        totalPoints += q.points;
        const studentAnswer = answers[q.id] || null;
        const isCorrect = studentAnswer === q.correct_answer;
        if (isCorrect) earnedPoints += q.points;
        detailedAnswers.push({
          question_id: q.id,
          question_text: q.question_text,
          student_answer: studentAnswer,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          points: isCorrect ? q.points : 0,
        });
      });

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      // Actualizar el intento con respuestas, nota y estado
      const { error: updateError } = await supabase
        .from("evaluation_attempts")
        .update({
          status: 'completed',
          score: score,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          answers: detailedAnswers,
        })
        .eq("id", attemptId);

      if (updateError) throw updateError;

      const passed = score >= (evaluation?.passing_score || 50);
      
      toast({
        title: passed ? "¡Evaluación aprobada!" : "Evaluación finalizada",
        description: `Tu calificación: ${score}%${passed ? " — ¡Enhorabuena!" : ""}`,
        variant: passed ? "default" : "destructive"
      });

      // Volver a la pantalla de la evaluación
      navigate(`/course/${courseId}/evaluation/${evaluationId}`);
    } catch (error: any) {
      console.error("Error submitting evaluation:", error);
      toast({
        title: "Error al enviar",
        description: error.message || "No se pudo enviar la evaluación. Inténtalo de nuevo.",
        variant: "destructive"
      });
      setSubmitting(false);
    }
  }, [submitting, questions, answers, attemptId, evaluation, navigate, courseId, evaluationId, startTime, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!evaluation || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Evaluación no disponible</CardTitle>
            <CardDescription>
              No se pudieron cargar las preguntas
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

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        
        {/* Cabecera con info de la evaluación */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl truncate">
                  {evaluation.title}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Pregunta {currentQuestionIndex + 1} de {questions.length}
                  {" — "}
                  {answeredCount} respondida{answeredCount !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeRemaining < 60 ? 'bg-destructive text-destructive-foreground' : 'bg-muted'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            <Progress value={progressPercentage} className="mt-3 h-2" />
          </CardHeader>
        </Card>

        {/* Pregunta actual */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.question_type === 'true_false' ? (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="true" id={`${currentQuestion.id}-true`} />
                  <Label
                    htmlFor={`${currentQuestion.id}-true`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    Verdadero
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="false" id={`${currentQuestion.id}-false`} />
                  <Label
                    htmlFor={`${currentQuestion.id}-false`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    Falso
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={`${currentQuestion.id}-${option.id}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`${currentQuestion.id}-${option.id}`}
                      className="flex-1 cursor-pointer text-base leading-relaxed"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {!isLastQuestion ? (
            <Button
              onClick={goToNext}
              className="w-full sm:flex-1"
              disabled={!answers[currentQuestion.id]}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full sm:flex-1"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Finalizar evaluación
                </>
              )}
            </Button>
          )}
        </div>

        {/* Aviso si quedan preguntas sin responder */}
        {isLastQuestion && answeredCount < questions.length && (
          <Card className="mt-4 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="flex gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">
                  Tienes {questions.length - answeredCount} pregunta{questions.length - answeredCount !== 1 ? 's' : ''} sin responder
                </p>
                <p className="text-muted-foreground mt-1">
                  Puedes volver atrás con "Anterior" para revisarlas, o finalizar y se contarán como incorrectas.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
