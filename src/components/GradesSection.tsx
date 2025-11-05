import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, TrendingUp, Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GradesSectionProps {
  courseId: string;
  enrollmentId?: string;
}

export function GradesSection({ courseId, enrollmentId }: GradesSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [evaluationGrades, setEvaluationGrades] = useState<any[]>([]);
  const [activityGrades, setActivityGrades] = useState<any[]>([]);
  const [averageGrade, setAverageGrade] = useState(0);

  useEffect(() => {
    if (user && courseId) {
      loadGrades();
    }
  }, [user, courseId]);

  const loadGrades = async () => {
    try {
      setLoading(true);

      // Load evaluation grades
      const { data: evaluations } = await supabase
        .from("evaluation_attempts")
        .select(`
          *,
          evaluation:evaluations(title)
        `)
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      // Filter by course evaluations
      const { data: courseEvaluations } = await supabase
        .from("evaluations")
        .select("id")
        .eq("course_id", courseId);

      const courseEvalIds = new Set(courseEvaluations?.map(e => e.id) || []);
      const filteredEvaluations = evaluations?.filter(e => 
        courseEvalIds.has(e.evaluation_id)
      ) || [];

      setEvaluationGrades(filteredEvaluations);

      // Load activity grades
      const { data: activities } = await supabase
        .from("activity_submissions")
        .select(`
          *,
          activity:development_activities(title)
        `)
        .eq("user_id", user!.id)
        .eq("status", "graded")
        .order("graded_at", { ascending: false });

      // Filter by course activities
      const { data: courseActivities } = await supabase
        .from("development_activities")
        .select("id")
        .eq("course_id", courseId);

      const courseActivityIds = new Set(courseActivities?.map(a => a.id) || []);
      const filteredActivities = activities?.filter(a => 
        courseActivityIds.has(a.activity_id)
      ) || [];

      setActivityGrades(filteredActivities);

      // Calculate average
      const allGrades = [
        ...filteredEvaluations.map(e => e.score || 0),
        ...filteredActivities.map(a => a.score || 0)
      ];

      if (allGrades.length > 0) {
        const avg = allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
        setAverageGrade(Math.round(avg));
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-600">Excelente</Badge>;
    if (score >= 70) return <Badge className="bg-blue-600">Bueno</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-600">Aprobado</Badge>;
    return <Badge variant="destructive">No aprobado</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGradeColor(averageGrade)}`}>
              {averageGrade}%
            </div>
            <Progress value={averageGrade} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationGrades.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Evaluaciones completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityGrades.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Actividades calificadas
            </p>
          </CardContent>
        </Card>
      </div>

      {evaluationGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Calificaciones de Evaluaciones</CardTitle>
            <CardDescription>Historial de tus evaluaciones completadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluación</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Intento</TableHead>
                  <TableHead className="text-right">Calificación</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluationGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">
                      {grade.evaluation?.title || "Evaluación"}
                    </TableCell>
                    <TableCell>
                      {new Date(grade.completed_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </TableCell>
                    <TableCell>Intento {grade.attempt_number}</TableCell>
                    <TableCell className={`text-right font-bold ${getGradeColor(grade.score)}`}>
                      {grade.score}%
                    </TableCell>
                    <TableCell className="text-right">
                      {getGradeBadge(grade.score)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activityGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Calificaciones de Actividades</CardTitle>
            <CardDescription>Historial de tus actividades calificadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Fecha de Entrega</TableHead>
                  <TableHead>Fecha de Calificación</TableHead>
                  <TableHead className="text-right">Calificación</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">
                      {grade.activity?.title || "Actividad"}
                    </TableCell>
                    <TableCell>
                      {new Date(grade.submitted_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      {grade.graded_at && new Date(grade.graded_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${getGradeColor(grade.score)}`}>
                      {grade.score}%
                    </TableCell>
                    <TableCell className="text-right">
                      {getGradeBadge(grade.score)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {evaluationGrades.length === 0 && activityGrades.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aún no tienes calificaciones registradas</p>
            <p className="text-sm mt-2">Completa evaluaciones y actividades para ver tus notas aquí</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
