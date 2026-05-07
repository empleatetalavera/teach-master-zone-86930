import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ScormResultsSection from "@/components/scorm/ScormResultsSection";
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Evaluation {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number;
  course_id: string;
  courses: {
    title: string;
  };
}

interface EvaluationAttempt {
  id: string;
  evaluation_id: string;
  attempt_number: number;
  status: string;
  score: number | null;
  started_at: string;
  completed_at: string | null;
  evaluations: {
    title: string;
    passing_score: number;
  };
}

const StudentEvaluations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [attempts, setAttempts] = useState<EvaluationAttempt[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    passed: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user?.id);

      if (enrollmentsError) throw enrollmentsError;

      const courseIds = enrollments?.map(e => e.course_id) || [];

      // Get evaluations for enrolled courses
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select(`
          *,
          courses (
            title
          )
        `)
        .in("course_id", courseIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (evaluationsError) throw evaluationsError;

      // Get user's attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("evaluation_attempts")
        .select(`
          *,
          evaluations (
            title,
            passing_score
          )
        `)
        .eq("user_id", user?.id)
        .order("started_at", { ascending: false });

      if (attemptsError) throw attemptsError;

      setEvaluations(evaluationsData || []);
      setAttempts(attemptsData || []);

      // Calculate statistics
      const completedAttempts = attemptsData?.filter(a => a.status === "completed") || [];
      const passedAttempts = completedAttempts.filter(
        a => a.score && a.score >= a.evaluations.passing_score
      );
      const avgScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
        : 0;

      setStats({
        total: evaluationsData?.length || 0,
        completed: completedAttempts.length,
        passed: passedAttempts.length,
        averageScore: Math.round(avgScore)
      });

    } catch (error) {
      console.error("Error loading evaluations:", error);
      toast.error("Error al cargar las evaluaciones");
    } finally {
      setLoading(false);
    }
  };

  const getAttemptsForEvaluation = (evaluationId: string) => {
    return attempts.filter(a => a.evaluation_id === evaluationId);
  };

  const getStatusBadge = (status: string, score: number | null, passingScore: number) => {
    if (status === "completed") {
      const passed = score !== null && score >= passingScore;
      return (
        <Badge variant={passed ? "default" : "destructive"} className="gap-1">
          {passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {passed ? "Aprobado" : "No Aprobado"}
        </Badge>
      );
    } else if (status === "in_progress") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          En Progreso
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        No Iniciado
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mis Evaluaciones</h1>
        <p className="text-muted-foreground">Gestiona tus exámenes y revisa tus calificaciones</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Evaluaciones</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Completadas</p>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Aprobadas</p>
          <p className="text-3xl font-bold">{stats.passed}</p>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Promedio</p>
          <p className="text-3xl font-bold">{stats.averageScore}%</p>
        </Card>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {evaluations.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay evaluaciones disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Las evaluaciones aparecerán aquí cuando estén disponibles en tus cursos
            </p>
            <Button onClick={() => navigate("/dashboard/student/courses")}>
              Ver Mis Cursos
            </Button>
          </Card>
        ) : (
          evaluations.map((evaluation) => {
            const evalAttempts = getAttemptsForEvaluation(evaluation.id);
            const lastAttempt = evalAttempts[0];
            const attemptsUsed = evalAttempts.length;
            const canAttempt = attemptsUsed < evaluation.max_attempts;

            return (
              <Card key={evaluation.id} className="p-6 border-border/50 hover:shadow-lg transition-all">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{evaluation.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {evaluation.courses?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.description}
                      </p>
                    </div>
                    {lastAttempt && getStatusBadge(
                      lastAttempt.status,
                      lastAttempt.score,
                      evaluation.passing_score
                    )}
                  </div>

                  {/* Evaluation Details */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tiempo:</span>
                      <span className="font-medium">{evaluation.time_limit_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Puntaje mínimo:</span>
                      <span className="font-medium">{evaluation.passing_score}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Intentos:</span>
                      <span className="font-medium">
                        {attemptsUsed}/{evaluation.max_attempts}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {attemptsUsed > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Intentos utilizados</span>
                        <span className="font-medium">
                          {Math.round((attemptsUsed / evaluation.max_attempts) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(attemptsUsed / evaluation.max_attempts) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Last Attempt Info */}
                  {lastAttempt && lastAttempt.score !== null && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium mb-1">Último intento</p>
                          <p className="text-sm text-muted-foreground">
                            Calificación: <span className="font-medium">{lastAttempt.score}%</span>
                          </p>
                        </div>
                        {lastAttempt.score >= evaluation.passing_score && (
                          <Award className="h-8 w-8 text-primary" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {canAttempt ? (
                      <Button className="gap-2">
                        <Play className="h-4 w-4" />
                        {attemptsUsed === 0 ? "Iniciar Evaluación" : "Nuevo Intento"}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Intentos agotados
                      </Button>
                    )}
                    {evalAttempts.length > 0 && (
                      <Button variant="outline">
                        Ver Historial ({evalAttempts.length})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentEvaluations;
