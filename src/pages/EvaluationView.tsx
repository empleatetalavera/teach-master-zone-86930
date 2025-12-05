import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Clock, CheckCircle2, AlertCircle, Play } from "lucide-react";

interface Evaluation {
  id: string;
  title: string;
  description: string | null;
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
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (evaluationId && user) {
      loadEvaluation();
    }
  }, [evaluationId, user]);

  const loadEvaluation = async () => {
    try {
      const [evalResult, attemptsResult] = await Promise.all([
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
          .order("attempt_number", { ascending: false })
      ]);

      if (evalResult.error) throw evalResult.error;
      setEvaluation(evalResult.data);
      setAttempts(attemptsResult.data || []);
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

    // Check if max attempts reached
    if (evaluation.max_attempts && attempts.length >= evaluation.max_attempts) {
      toast({
        title: "Límite de intentos alcanzado",
        description: `Has alcanzado el máximo de ${evaluation.max_attempts} intentos`,
        variant: "destructive"
      });
      return;
    }

    setStarting(true);
    try {
      // Get enrollment
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .single();

      if (!enrollment) {
        throw new Error("No estás inscrito en este curso");
      }

      // Create new attempt
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

      toast({
        title: "Evaluación iniciada",
        description: "Buena suerte con tu evaluación",
      });

      // Reload attempts
      loadEvaluation();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setStarting(false);
    }
  };

  const bestScore = attempts.length > 0 
    ? Math.max(...attempts.filter(a => a.score !== null).map(a => a.score!))
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
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al curso
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{evaluation.title}</CardTitle>
                {evaluation.description && (
                  <CardDescription className="mt-2">{evaluation.description}</CardDescription>
                )}
              </div>
              {hasPassed ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aprobado
                </Badge>
              ) : attempts.length > 0 ? (
                <Badge variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  No aprobado
                </Badge>
              ) : (
                <Badge variant="secondary">Pendiente</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{evaluation.passing_score}%</p>
                <p className="text-sm text-muted-foreground">Nota mínima</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {evaluation.max_attempts || "∞"}
                </p>
                <p className="text-sm text-muted-foreground">Intentos máx.</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {evaluation.time_limit_minutes || "∞"}
                </p>
                <p className="text-sm text-muted-foreground">Minutos</p>
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

            <Button 
              onClick={handleStartEvaluation}
              disabled={starting || (evaluation.max_attempts !== null && attempts.length >= evaluation.max_attempts)}
              className="w-full"
              size="lg"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {attempts.length === 0 ? "Comenzar Evaluación" : "Nuevo Intento"}
            </Button>

            {evaluation.max_attempts && (
              <p className="text-sm text-center text-muted-foreground">
                Intentos realizados: {attempts.length} / {evaluation.max_attempts}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previous Attempts */}
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
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold">{attempt.attempt_number}</span>
                      </div>
                      <div>
                        <p className="font-medium">Intento #{attempt.attempt_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.completed_at 
                            ? new Date(attempt.completed_at).toLocaleDateString("es-ES")
                            : "En progreso"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.score !== null ? (
                        <>
                          <Progress value={attempt.score} className="w-24" />
                          <span className={`font-bold ${attempt.score >= evaluation.passing_score ? 'text-green-500' : 'text-red-500'}`}>
                            {attempt.score}%
                          </span>
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
