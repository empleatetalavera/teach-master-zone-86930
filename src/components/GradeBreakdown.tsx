import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, CheckCircle2, Clock, FileText, ClipboardList, 
  TrendingUp, Loader2, BookOpen, AlertCircle, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface GradeBreakdownProps {
  courseId: string;
  enrollmentId: string;
  enableBreakdown?: boolean;
}

interface ActivityGrade {
  id: string;
  title: string;
  type: 'activity' | 'evaluation';
  max_score: number;
  score: number | null;
  status: string;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  module_title?: string;
  unit_title?: string;
}

export function GradeBreakdown({ courseId, enrollmentId, enableBreakdown = true }: GradeBreakdownProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<ActivityGrade[]>([]);
  const [showDetails, setShowDetails] = useState(enableBreakdown);

  useEffect(() => {
    if (courseId && user) {
      loadGrades();
    }
  }, [courseId, user]);

  const loadGrades = async () => {
    setLoading(true);
    try {
      // Load activity submissions
      const { data: submissions, error: subError } = await supabase
        .from("activity_submissions")
        .select(`
          id,
          score,
          status,
          feedback,
          submitted_at,
          graded_at,
          development_activities (
            id,
            title,
            max_score,
            formative_unit_id,
            formative_units (
              title,
              module_id,
              modules (title)
            )
          )
        `)
        .eq("enrollment_id", enrollmentId)
        .eq("user_id", user!.id);

      if (subError) throw subError;

      // Load evaluation attempts
      const { data: attempts, error: attError } = await supabase
        .from("evaluation_attempts")
        .select(`
          id,
          score,
          status,
          completed_at,
          evaluations (
            id,
            title,
            passing_score,
            formative_unit_id,
            formative_units (
              title,
              module_id,
              modules (title)
            )
          )
        `)
        .eq("enrollment_id", enrollmentId)
        .eq("user_id", user!.id);

      if (attError) throw attError;

      // Transform data
      const allGrades: ActivityGrade[] = [];

      // Add activity grades
      submissions?.forEach((sub: any) => {
        if (sub.development_activities) {
          allGrades.push({
            id: sub.id,
            title: sub.development_activities.title,
            type: 'activity',
            max_score: sub.development_activities.max_score || 100,
            score: sub.score,
            status: sub.status,
            feedback: sub.feedback,
            submitted_at: sub.submitted_at,
            graded_at: sub.graded_at,
            module_title: sub.development_activities.formative_units?.modules?.title,
            unit_title: sub.development_activities.formative_units?.title
          });
        }
      });

      // Add evaluation grades
      attempts?.forEach((att: any) => {
        if (att.evaluations) {
          allGrades.push({
            id: att.id,
            title: att.evaluations.title,
            type: 'evaluation',
            max_score: 100,
            score: att.score,
            status: att.status,
            feedback: null,
            submitted_at: att.completed_at,
            graded_at: att.completed_at,
            module_title: att.evaluations.formative_units?.modules?.title,
            unit_title: att.evaluations.formative_units?.title
          });
        }
      });

      setGrades(allGrades);
    } catch (error: any) {
      console.error("Error loading grades:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las calificaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate averages
  const gradedItems = grades.filter(g => g.score !== null);
  const averageScore = gradedItems.length > 0 
    ? gradedItems.reduce((sum, g) => sum + (g.score! / g.max_score * 100), 0) / gradedItems.length
    : 0;

  const activityAverage = grades.filter(g => g.type === 'activity' && g.score !== null);
  const evaluationAverage = grades.filter(g => g.type === 'evaluation' && g.score !== null);

  const getScoreColor = (score: number | null, maxScore: number) => {
    if (score === null) return 'text-muted-foreground';
    const percent = (score / maxScore) * 100;
    if (percent >= 80) return 'text-green-600';
    if (percent >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string, score: number | null, maxScore: number) => {
    if (status === 'graded' || status === 'completed') {
      const percent = score !== null ? (score / maxScore) * 100 : 0;
      if (percent >= 50) {
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Aprobado</Badge>;
      }
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Suspenso</Badge>;
    }
    if (status === 'submitted') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
    }
    return <Badge variant="outline">Sin enviar</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Resumen de Calificaciones
              </CardTitle>
              <CardDescription>
                Desglose de tu progreso y calificaciones
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-details"
                checked={showDetails}
                onCheckedChange={setShowDetails}
              />
              <Label htmlFor="show-details">Ver desglose</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Overall Average */}
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-4xl font-bold text-primary">
                {averageScore.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Media General</p>
              <Progress value={averageScore} className="mt-2" />
            </div>

            {/* Activities Average */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">
                {activityAverage.length > 0 
                  ? (activityAverage.reduce((sum, g) => sum + (g.score! / g.max_score * 100), 0) / activityAverage.length).toFixed(1)
                  : '—'
                }%
              </p>
              <p className="text-sm text-muted-foreground">Media Actividades</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activityAverage.length} de {grades.filter(g => g.type === 'activity').length} calificadas
              </p>
            </div>

            {/* Evaluations Average */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">
                {evaluationAverage.length > 0 
                  ? (evaluationAverage.reduce((sum, g) => sum + (g.score! / g.max_score * 100), 0) / evaluationAverage.length).toFixed(1)
                  : '—'
                }%
              </p>
              <p className="text-sm text-muted-foreground">Media Tests</p>
              <p className="text-xs text-muted-foreground mt-1">
                {evaluationAverage.length} de {grades.filter(g => g.type === 'evaluation').length} calificados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Desglose Detallado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {grades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aún no tienes calificaciones registradas</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {/* Group by module */}
                {Array.from(new Set(grades.map(g => g.module_title || 'Sin módulo'))).map(moduleTitle => {
                  const moduleGrades = grades.filter(g => (g.module_title || 'Sin módulo') === moduleTitle);
                  
                  return (
                    <AccordionItem key={moduleTitle} value={moduleTitle} className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium">{moduleTitle}</span>
                          <Badge variant="outline">{moduleGrades.length} items</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {moduleGrades.map(grade => (
                            <div 
                              key={grade.id}
                              className="p-4 border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {grade.type === 'activity' ? (
                                    <ClipboardList className="h-4 w-4 text-amber-600" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-blue-600" />
                                  )}
                                  <div>
                                    <p className="font-medium">{grade.title}</p>
                                    {grade.unit_title && (
                                      <p className="text-xs text-muted-foreground">
                                        {grade.unit_title}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {getStatusBadge(grade.status, grade.score, grade.max_score)}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Calificación</p>
                                  <p className={`text-2xl font-bold ${getScoreColor(grade.score, grade.max_score)}`}>
                                    {grade.score !== null ? `${grade.score}/${grade.max_score}` : '—'}
                                  </p>
                                  {grade.score !== null && (
                                    <Progress 
                                      value={(grade.score / grade.max_score) * 100} 
                                      className="mt-1 h-1.5" 
                                    />
                                  )}
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                  {grade.submitted_at && (
                                    <p>Enviado: {format(new Date(grade.submitted_at), "d MMM yyyy", { locale: es })}</p>
                                  )}
                                  {grade.graded_at && (
                                    <p>Calificado: {format(new Date(grade.graded_at), "d MMM yyyy", { locale: es })}</p>
                                  )}
                                </div>
                              </div>

                              {/* Feedback */}
                              {grade.feedback && (
                                <div className="mt-3 p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="h-3 w-3 text-primary" />
                                    <span className="text-xs font-medium">Retroalimentación del tutor</span>
                                  </div>
                                  <p className="text-sm">{grade.feedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}