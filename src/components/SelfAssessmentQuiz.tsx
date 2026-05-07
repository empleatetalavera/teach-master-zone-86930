import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, FileQuestion, ChevronLeft, ChevronRight, RotateCcw, Lightbulb, AlertCircle } from "lucide-react";

interface SelfAssessmentQuestion {
  id: string;
  question_text: string;
  case_study: string | null;
  options: { id: string; text: string }[];
  correct_option_id: string;
  explanation: string | null;
}

interface SelfAssessmentQuizProps {
  courseId: string;
  formativeUnitId: string;
  formativeUnitTitle: string;
}

export function SelfAssessmentQuiz({ courseId, formativeUnitId, formativeUnitTitle }: SelfAssessmentQuizProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<SelfAssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [savedAttempt, setSavedAttempt] = useState<{ score: number; correct: number; total: number; completed_at: string } | null>(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => { loadQuestions(); }, [courseId, formativeUnitId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("self_assessment_questions")
        .select("*")
        .eq("course_id", courseId)
        .eq("formative_unit_id", formativeUnitId)
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;

      const parsed = (data || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        case_study: q.case_study,
        options: Array.isArray(q.options) ? q.options as { id: string; text: string }[] : [],
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
      }));

      setQuestions(parsed);
    } catch (error) {
      console.error("Error loading self-assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const toggleExplanation = (questionId: string) => {
    setShowExplanation(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option_id) correct++;
    });
    return { correct, total: questions.length, percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0 };
  };

  const reset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setShowExplanation({});
    setStarted(false);
  };

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2 mb-4" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  if (!started) {
    return (
      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-amber-600" />
            Autoevaluación: {formativeUnitTitle}
          </CardTitle>
          <CardDescription>
            {questions.length} preguntas · No computable en la nota final
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Este ejercicio de autoevaluación es orientativo y <strong>no se contabiliza</strong> en la evaluación final.
              Sirve para comprobar tu nivel de comprensión de la unidad.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setStarted(true)} className="w-full gap-2">
            <FileQuestion className="h-4 w-4" />
            Comenzar Autoevaluación
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const { correct, total, percentage } = calculateScore();
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado de la Autoevaluación</CardTitle>
          <CardDescription>No computable en la nota final</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary">{percentage}%</p>
            <p className="text-sm text-muted-foreground mt-1">{correct} de {total} respuestas correctas</p>
            <Progress value={percentage} className="mt-3" />
          </div>

          {/* Review answers */}
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3 pr-2">
              {questions.map((q, i) => {
                const isCorrect = answers[q.id] === q.correct_option_id;
                return (
                  <div key={q.id} className={`p-3 border rounded-lg ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                      <div>
                        <p className="text-xs font-medium">Pregunta {i + 1}: {q.question_text}</p>
                        {!isCorrect && (
                          <p className="text-xs text-green-700 mt-1">
                            Respuesta correcta: {q.options.find(o => o.id === q.correct_option_id)?.text}
                          </p>
                        )}
                        {q.explanation && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs mt-1 p-0" onClick={() => toggleExplanation(q.id)}>
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {showExplanation[q.id] ? "Ocultar" : "Ver explicación"}
                          </Button>
                        )}
                        {showExplanation[q.id] && q.explanation && (
                          <p className="text-xs text-muted-foreground mt-1 p-2 bg-white/80 rounded">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Button onClick={reset} variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Repetir Autoevaluación
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Autoevaluación</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1} / {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Case study */}
        {currentQ.case_study && (
          <Alert className="bg-blue-50/50 border-blue-200">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <strong>Supuesto práctico:</strong> {currentQ.case_study}
            </AlertDescription>
          </Alert>
        )}

        <p className="text-sm font-medium">{currentQ.question_text}</p>

        <RadioGroup
          value={answers[currentQ.id] || ""}
          onValueChange={(v) => handleAnswer(currentQ.id, v)}
        >
          {currentQ.options.map(opt => (
            <div key={opt.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50">
              <RadioGroupItem value={opt.id} id={`${currentQ.id}-${opt.id}`} />
              <Label htmlFor={`${currentQ.id}-${opt.id}`} className="text-sm cursor-pointer flex-1">{opt.text}</Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(i => i - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          {currentIndex === questions.length - 1 ? (
            <Button size="sm" onClick={() => setShowResult(true)} disabled={Object.keys(answers).length < questions.length}>
              Ver Resultado
            </Button>
          ) : (
            <Button size="sm" onClick={() => setCurrentIndex(i => i + 1)}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
