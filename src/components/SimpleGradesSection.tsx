import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, ClipboardCheck, GraduationCap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SimpleGradesSectionProps {
  courseId: string;
  enrollmentId?: string;
  modules?: any[];
}

interface EvalGrade {
  id: string;
  title: string;
  unitTitle: string;
  score: number | null;
  status: string;
  completedAt: string | null;
  attemptNumber: number;
  passingScore: number;
}

export function SimpleGradesSection({ courseId, enrollmentId, modules = [] }: SimpleGradesSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unitTestGrades, setUnitTestGrades] = useState<EvalGrade[]>([]);
  const [finalEvalGrades, setFinalEvalGrades] = useState<EvalGrade[]>([]);
  const [averageGrade, setAverageGrade] = useState<number | null>(null);

  useEffect(() => {
    if (user && courseId) {
      loadGrades();
    }
  }, [user, courseId]);

  const loadGrades = async () => {
    try {
      setLoading(true);

      // Load all evaluations for this course
      const { data: evaluations } = await supabase
        .from("evaluations")
        .select("id, title, formative_unit_id, module_id, passing_score")
        .eq("course_id", courseId)
        .eq("is_active", true);

      if (!evaluations || evaluations.length === 0) {
        setLoading(false);
        return;
      }

      // Load formative units for naming
      const { data: units } = await supabase
        .from("formative_units")
        .select("id, title, module_id")
        .in("module_id", modules.map(m => m.id));

      const unitMap = new Map((units || []).map(u => [u.id, u.title]));

      // Load best attempts for each evaluation
      const { data: attempts } = await supabase
        .from("evaluation_attempts")
        .select("*")
        .eq("user_id", user!.id)
        .in("evaluation_id", evaluations.map(e => e.id))
        .order("score", { ascending: false });

      // Group: best attempt per evaluation
      const bestAttempts = new Map<string, any>();
      (attempts || []).forEach(a => {
        if (!bestAttempts.has(a.evaluation_id) || (a.score || 0) > (bestAttempts.get(a.evaluation_id)?.score || 0)) {
          bestAttempts.set(a.evaluation_id, a);
        }
      });

      const unitTests: EvalGrade[] = [];
      const finalEvals: EvalGrade[] = [];

      evaluations.forEach(ev => {
        const attempt = bestAttempts.get(ev.id);
        const isFinal = !ev.formative_unit_id && !ev.module_id;
        const titleLower = ev.title.toLowerCase();
        const isFinalByName = titleLower.includes('final') || titleLower.includes('evaluación final');

        const grade: EvalGrade = {
          id: ev.id,
          title: ev.title,
          unitTitle: ev.formative_unit_id ? (unitMap.get(ev.formative_unit_id) || '') : '',
          score: attempt?.score ?? null,
          status: attempt?.status || 'pending',
          completedAt: attempt?.completed_at || null,
          attemptNumber: attempt?.attempt_number || 0,
          passingScore: ev.passing_score,
        };

        if (isFinal || isFinalByName) {
          finalEvals.push(grade);
        } else {
          unitTests.push(grade);
        }
      });

      setUnitTestGrades(unitTests);
      setFinalEvalGrades(finalEvals);

      // Calculate average from completed tests
      const completedScores = [...unitTests, ...finalEvals]
        .filter(g => g.score !== null)
        .map(g => g.score!);
      
      if (completedScores.length > 0) {
        setAverageGrade(Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length));
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null, passingScore: number) => {
    if (score === null) return "text-muted-foreground";
    if (score >= passingScore) return "text-green-600";
    return "text-red-600";
  };

  const getStatusBadge = (score: number | null, passingScore: number) => {
    if (score === null) return <Badge variant="secondary">Pendiente</Badge>;
    if (score >= passingScore) return <Badge className="bg-green-600">Aprobado</Badge>;
    return <Badge variant="destructive">No aprobado</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalTests = unitTestGrades.length + finalEvalGrades.length;
  const completedTests = [...unitTestGrades, ...finalEvalGrades].filter(g => g.score !== null).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averageGrade !== null ? (averageGrade >= 50 ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'}`}>
              {averageGrade !== null ? `${averageGrade}%` : '--'}
            </div>
            <Progress value={averageGrade || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completados</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests} / {totalTests}</div>
            <p className="text-xs text-muted-foreground mt-2">Tests de evaluación realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {averageGrade !== null ? (
              averageGrade >= 50 
                ? <Badge className="bg-green-600 text-lg px-3 py-1">Apto</Badge>
                : <Badge variant="destructive" className="text-lg px-3 py-1">No Apto</Badge>
            ) : (
              <Badge variant="secondary" className="text-lg px-3 py-1">Sin Evaluar</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unit Test Grades */}
      {unitTestGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tests de Evaluación por Unidad</CardTitle>
            <CardDescription>Calificaciones de los tests de cada unidad formativa</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Unidad Formativa</TableHead>
                  <TableHead className="text-center">Intentos</TableHead>
                  <TableHead className="text-right">Calificación</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitTestGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{grade.unitTitle}</TableCell>
                    <TableCell className="text-center">{grade.attemptNumber || '--'}</TableCell>
                    <TableCell className={`text-right font-bold ${getScoreColor(grade.score, grade.passingScore)}`}>
                      {grade.score !== null ? `${grade.score}%` : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(grade.score, grade.passingScore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Final Evaluation */}
      {finalEvalGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluación Final</CardTitle>
            <CardDescription>Calificación del test final del curso</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluación</TableHead>
                  <TableHead className="text-center">Intentos</TableHead>
                  <TableHead className="text-right">Calificación</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalEvalGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.title}</TableCell>
                    <TableCell className="text-center">{grade.attemptNumber || '--'}</TableCell>
                    <TableCell className={`text-right font-bold ${getScoreColor(grade.score, grade.passingScore)}`}>
                      {grade.score !== null ? `${grade.score}%` : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(grade.score, grade.passingScore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {unitTestGrades.length === 0 && finalEvalGrades.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aún no hay evaluaciones configuradas para este curso</p>
            <p className="text-sm mt-2">Las calificaciones aparecerán aquí cuando completes los tests</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
