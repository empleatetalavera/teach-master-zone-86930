import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Monitor, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface PreAssessmentTestProps {
  moduleId: string;
  moduleTitle: string;
  onComplete?: (results: AssessmentResults) => void;
}

interface Question {
  id: string;
  text: string;
  category: 'digital' | 'knowledge';
  options: { value: string; label: string; score: number }[];
}

interface AssessmentResults {
  digitalCompetence: {
    score: number;
    level: 'básico' | 'intermedio' | 'avanzado';
    recommendations: string[];
  };
  priorKnowledge: {
    score: number;
    level: 'inicial' | 'medio' | 'alto';
    recommendations: string[];
  };
  completedAt: string;
}

const digitalCompetenceQuestions: Question[] = [
  {
    id: 'dc1',
    text: '¿Con qué frecuencia utiliza un ordenador para tareas diarias?',
    category: 'digital',
    options: [
      { value: 'a', label: 'Nunca o raramente', score: 0 },
      { value: 'b', label: 'Ocasionalmente (1-2 veces por semana)', score: 1 },
      { value: 'c', label: 'Frecuentemente (casi todos los días)', score: 2 },
      { value: 'd', label: 'Constantemente (varias horas al día)', score: 3 }
    ]
  },
  {
    id: 'dc2',
    text: '¿Cómo calificaría su nivel de manejo de procesadores de texto (Word, Google Docs)?',
    category: 'digital',
    options: [
      { value: 'a', label: 'No sé usarlos', score: 0 },
      { value: 'b', label: 'Puedo escribir textos básicos', score: 1 },
      { value: 'c', label: 'Manejo formato, tablas y estilos', score: 2 },
      { value: 'd', label: 'Domino funciones avanzadas (macros, combinación de correspondencia)', score: 3 }
    ]
  },
  {
    id: 'dc3',
    text: '¿Tiene experiencia con hojas de cálculo (Excel, Google Sheets)?',
    category: 'digital',
    options: [
      { value: 'a', label: 'Ninguna experiencia', score: 0 },
      { value: 'b', label: 'Puedo introducir datos y hacer cálculos simples', score: 1 },
      { value: 'c', label: 'Uso fórmulas, filtros y gráficos', score: 2 },
      { value: 'd', label: 'Domino tablas dinámicas y funciones avanzadas', score: 3 }
    ]
  },
  {
    id: 'dc4',
    text: '¿Cómo gestiona su correo electrónico habitualmente?',
    category: 'digital',
    options: [
      { value: 'a', label: 'No uso correo electrónico regularmente', score: 0 },
      { value: 'b', label: 'Envío y recibo correos básicos', score: 1 },
      { value: 'c', label: 'Uso carpetas, etiquetas y archivos adjuntos', score: 2 },
      { value: 'd', label: 'Gestiono múltiples cuentas, calendarios y reglas automáticas', score: 3 }
    ]
  },
  {
    id: 'dc5',
    text: '¿Ha realizado formación online anteriormente?',
    category: 'digital',
    options: [
      { value: 'a', label: 'Nunca', score: 0 },
      { value: 'b', label: 'Una vez', score: 1 },
      { value: 'c', label: 'Varias veces', score: 2 },
      { value: 'd', label: 'Regularmente (más de 5 cursos)', score: 3 }
    ]
  }
];

const priorKnowledgeQuestions: Question[] = [
  {
    id: 'pk1',
    text: '¿Conoce la estructura organizativa típica de una empresa u organización?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'No tengo conocimientos al respecto', score: 0 },
      { value: 'b', label: 'Tengo nociones básicas', score: 1 },
      { value: 'c', label: 'Conozco bien los departamentos y funciones', score: 2 },
      { value: 'd', label: 'Tengo experiencia laboral en entornos organizativos', score: 3 }
    ]
  },
  {
    id: 'pk2',
    text: '¿Ha trabajado alguna vez en tareas administrativas de oficina?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Nunca', score: 0 },
      { value: 'b', label: 'Ocasionalmente o como apoyo', score: 1 },
      { value: 'c', label: 'Sí, durante un periodo considerable', score: 2 },
      { value: 'd', label: 'Sí, es mi ámbito profesional habitual', score: 3 }
    ]
  },
  {
    id: 'pk3',
    text: '¿Conoce los tipos de documentos administrativos básicos (facturas, albaranes, nóminas)?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'No los conozco', score: 0 },
      { value: 'b', label: 'He oído hablar de ellos pero no los he manejado', score: 1 },
      { value: 'c', label: 'Los conozco y he trabajado con algunos', score: 2 },
      { value: 'd', label: 'Los domino y trabajo con ellos habitualmente', score: 3 }
    ]
  },
  {
    id: 'pk4',
    text: '¿Tiene conocimientos sobre gestión de correspondencia y archivo?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Ninguno', score: 0 },
      { value: 'b', label: 'Conocimientos básicos teóricos', score: 1 },
      { value: 'c', label: 'He gestionado correspondencia y archivos', score: 2 },
      { value: 'd', label: 'Tengo amplia experiencia en estos procesos', score: 3 }
    ]
  },
  {
    id: 'pk5',
    text: '¿Conoce conceptos básicos de tesorería y control de existencias?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'No los conozco', score: 0 },
      { value: 'b', label: 'Tengo nociones muy básicas', score: 1 },
      { value: 'c', label: 'Conozco los conceptos principales', score: 2 },
      { value: 'd', label: 'Tengo experiencia práctica en estas áreas', score: 3 }
    ]
  }
];

export const PreAssessmentTest: React.FC<PreAssessmentTestProps> = ({
  moduleId,
  moduleTitle,
  onComplete
}) => {
  const [currentSection, setCurrentSection] = useState<'intro' | 'digital' | 'knowledge' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<AssessmentResults | null>(null);

  const allQuestions = currentSection === 'digital' ? digitalCompetenceQuestions : priorKnowledgeQuestions;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const calculateResults = (): AssessmentResults => {
    // Calculate digital competence score
    let digitalScore = 0;
    digitalCompetenceQuestions.forEach(q => {
      const answer = answers[q.id];
      const option = q.options.find(o => o.value === answer);
      if (option) digitalScore += option.score;
    });
    const maxDigitalScore = digitalCompetenceQuestions.length * 3;
    const digitalPercentage = (digitalScore / maxDigitalScore) * 100;

    // Calculate prior knowledge score
    let knowledgeScore = 0;
    priorKnowledgeQuestions.forEach(q => {
      const answer = answers[q.id];
      const option = q.options.find(o => o.value === answer);
      if (option) knowledgeScore += option.score;
    });
    const maxKnowledgeScore = priorKnowledgeQuestions.length * 3;
    const knowledgePercentage = (knowledgeScore / maxKnowledgeScore) * 100;

    // Determine levels and recommendations
    const digitalLevel = digitalPercentage < 40 ? 'básico' : digitalPercentage < 70 ? 'intermedio' : 'avanzado';
    const knowledgeLevel = knowledgePercentage < 40 ? 'inicial' : knowledgePercentage < 70 ? 'medio' : 'alto';

    const digitalRecommendations: string[] = [];
    const knowledgeRecommendations: string[] = [];

    if (digitalLevel === 'básico') {
      digitalRecommendations.push('Se recomienda familiarizarse con el uso básico del ordenador antes de comenzar.');
      digitalRecommendations.push('Practique la navegación por internet y el uso del correo electrónico.');
      digitalRecommendations.push('No dude en contactar con el tutor si tiene dificultades técnicas.');
    } else if (digitalLevel === 'intermedio') {
      digitalRecommendations.push('Su nivel digital es adecuado para el curso.');
      digitalRecommendations.push('Aproveche para mejorar sus habilidades con herramientas ofimáticas.');
    }

    if (knowledgeLevel === 'inicial') {
      knowledgeRecommendations.push('Preste especial atención a los contenidos introductorios de cada unidad.');
      knowledgeRecommendations.push('Realice todas las actividades prácticas propuestas.');
      knowledgeRecommendations.push('No dude en consultar al tutor cualquier duda desde el principio.');
    } else if (knowledgeLevel === 'medio') {
      knowledgeRecommendations.push('Tiene una base que le ayudará en el aprendizaje.');
      knowledgeRecommendations.push('Enfóquese en profundizar los conocimientos que ya posee.');
    } else {
      knowledgeRecommendations.push('Su experiencia previa será muy valiosa.');
      knowledgeRecommendations.push('Puede servir de apoyo a otros compañeros en los foros.');
    }

    return {
      digitalCompetence: {
        score: digitalPercentage,
        level: digitalLevel,
        recommendations: digitalRecommendations
      },
      priorKnowledge: {
        score: knowledgePercentage,
        level: knowledgeLevel,
        recommendations: knowledgeRecommendations
      },
      completedAt: new Date().toISOString()
    };
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to next section or results
      if (currentSection === 'digital') {
        setCurrentSection('knowledge');
        setCurrentQuestionIndex(0);
      } else if (currentSection === 'knowledge') {
        const calculatedResults = calculateResults();
        setResults(calculatedResults);
        setCurrentSection('results');
        onComplete?.(calculatedResults);
        toast.success('Test de diagnóstico completado');
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSection === 'knowledge') {
      setCurrentSection('digital');
      setCurrentQuestionIndex(digitalCompetenceQuestions.length - 1);
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'básico':
      case 'inicial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'intermedio':
      case 'medio':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'avanzado':
      case 'alto':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (currentSection === 'intro') {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Test de Conocimientos Previos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Diagnóstico Inicial - {moduleTitle}</p>
                <p>
                  Antes de comenzar el módulo formativo, es necesario realizar un breve diagnóstico 
                  que nos permitirá adaptar el proceso formativo a su situación de partida.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Parte 1: Competencia Digital</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Evaluación de su nivel de alfabetización tecnológica y manejo de herramientas digitales.
              </p>
              <Badge variant="outline" className="mt-2">5 preguntas</Badge>
            </div>

            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Parte 2: Conocimientos Previos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Diagnóstico sobre su situación de partida respecto a los contenidos del módulo.
              </p>
              <Badge variant="outline" className="mt-2">5 preguntas</Badge>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              <strong>Tiempo estimado:</strong> 5-10 minutos<br />
              <strong>Nota:</strong> No hay respuestas correctas o incorrectas. Este test solo sirve 
              para conocer su punto de partida y poder ofrecerle recomendaciones personalizadas.
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => setCurrentSection('digital')}
          >
            Comenzar Diagnóstico
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentSection === 'results' && results) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Resultados del Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Digital Competence Results */}
          <div className="bg-background border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Competencia Digital</h4>
              </div>
              <Badge className={getLevelBadgeColor(results.digitalCompetence.level)}>
                Nivel {results.digitalCompetence.level}
              </Badge>
            </div>
            <Progress value={results.digitalCompetence.score} className="h-2 mb-3" />
            <div className="space-y-2">
              {results.digitalCompetence.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Knowledge Results */}
          <div className="bg-background border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Conocimientos Previos</h4>
              </div>
              <Badge className={getLevelBadgeColor(results.priorKnowledge.level)}>
                Nivel {results.priorKnowledge.level}
              </Badge>
            </div>
            <Progress value={results.priorKnowledge.score} className="h-2 mb-3" />
            <div className="space-y-2">
              {results.priorKnowledge.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
            <p className="font-medium mb-1">✓ Diagnóstico completado</p>
            <p>
              Estos resultados han sido registrados y servirán para personalizar su experiencia 
              formativa. Puede continuar con el contenido del módulo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question view
  const sectionTitle = currentSection === 'digital' ? 'Competencia Digital' : 'Conocimientos Previos';
  const sectionIcon = currentSection === 'digital' ? <Monitor className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />;
  const overallProgress = currentSection === 'digital' 
    ? ((currentQuestionIndex + 1) / (totalQuestions * 2)) * 100
    : (((totalQuestions + currentQuestionIndex + 1)) / (totalQuestions * 2)) * 100;

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {sectionIcon}
            <span className="text-primary">{sectionTitle}</span>
          </CardTitle>
          <Badge variant="outline">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </Badge>
        </div>
        <Progress value={overallProgress} className="h-1.5 mt-3" />
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-background border rounded-lg p-5">
          <p className="text-base font-medium mb-4">{currentQuestion.text}</p>
          
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div 
                key={option.value}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                  answers[currentQuestion.id] === option.value ? 'bg-primary/5 border-primary' : ''
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={`${currentQuestion.id}-${option.value}`} />
                <Label 
                  htmlFor={`${currentQuestion.id}-${option.value}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentSection === 'digital' && currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            {currentSection === 'knowledge' && currentQuestionIndex === totalQuestions - 1 
              ? 'Ver Resultados' 
              : 'Siguiente'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
