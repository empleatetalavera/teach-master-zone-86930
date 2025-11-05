import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Lightbulb, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InteractiveContentProps {
  moduleId: string;
}

// Ejemplo de contenido interactivo - en producción esto vendría de la base de datos
const sampleQuizzes = [
  {
    id: "1",
    question: "¿Cuál es el concepto principal de este módulo?",
    options: [
      "Opción A - Concepto básico",
      "Opción B - Concepto intermedio",
      "Opción C - Concepto avanzado",
      "Opción D - Ninguna de las anteriores"
    ],
    correctAnswer: 1,
    explanation: "El concepto intermedio es el correcto porque abarca los fundamentos necesarios."
  },
  {
    id: "2",
    question: "¿Qué herramienta es más adecuada para este caso?",
    options: [
      "Herramienta 1",
      "Herramienta 2",
      "Herramienta 3",
      "Todas las anteriores"
    ],
    correctAnswer: 2,
    explanation: "La Herramienta 3 ofrece las características específicas necesarias."
  }
];

export function InteractiveContent({ moduleId }: InteractiveContentProps) {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const quiz = sampleQuizzes[currentQuiz];

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    if (selectedAnswer === quiz.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuiz < sampleQuizzes.length - 1) {
      setCurrentQuiz(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const progress = ((currentQuiz + 1) / sampleQuizzes.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Contenido Interactivo
        </CardTitle>
        <CardDescription>
          Refuerza tu aprendizaje con ejercicios prácticos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="simulation">Simulación</TabsTrigger>
            <TabsTrigger value="practice">Práctica</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pregunta {currentQuiz + 1} de {sampleQuizzes.length}
                </span>
                <Badge variant="outline">
                  {correctAnswers} correctas
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-lg">{quiz.question}</h3>

              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                disabled={showResult}
              >
                {quiz.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      showResult
                        ? index === quiz.correctAnswer
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : index === selectedAnswer
                          ? "border-red-500 bg-red-50 dark:bg-red-950"
                          : ""
                        : "hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showResult && index === quiz.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {showResult && index === selectedAnswer && index !== quiz.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                ))}
              </RadioGroup>

              {showResult && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedAnswer === quiz.correctAnswer ? "¡Correcto!" : "Incorrecto"}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                    {quiz.explanation}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!showResult ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full"
                  >
                    Comprobar Respuesta
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuiz === sampleQuizzes.length - 1}
                    className="w-full"
                  >
                    {currentQuiz === sampleQuizzes.length - 1
                      ? "Quiz Completado"
                      : "Siguiente Pregunta"}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 space-y-4">
                  <PlayCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Simulación Interactiva</h3>
                    <p className="text-sm text-muted-foreground">
                      Experimenta con casos prácticos en un entorno simulado
                    </p>
                  </div>
                  <Button>Iniciar Simulación</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Ejercicios Prácticos</h3>
                    <p className="text-sm text-muted-foreground">
                      Aplica lo aprendido con ejercicios guiados paso a paso
                    </p>
                  </div>
                  <Button>Comenzar Ejercicios</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
