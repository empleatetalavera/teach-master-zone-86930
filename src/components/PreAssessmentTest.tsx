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
  Info,
  XCircle
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
  options: { value: string; label: string; isCorrect?: boolean }[];
  correctAnswer?: string;
  explanation?: string;
}

interface AssessmentResults {
  digitalCompetence: {
    score: number;
    level: 'básico' | 'intermedio' | 'avanzado';
    recommendations: string[];
  };
  priorKnowledge: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    level: 'inicial' | 'medio' | 'alto';
    recommendations: string[];
  };
  completedAt: string;
}

// Digital competence questions (diagnostic, no right/wrong)
const digitalCompetenceQuestions: Question[] = [
  {
    id: 'dc1',
    text: '¿Con qué frecuencia utiliza un ordenador para tareas diarias?',
    category: 'digital',
    options: [
      { value: 'a', label: 'Nunca o raramente' },
      { value: 'b', label: 'Ocasionalmente (1-2 veces por semana)' },
      { value: 'c', label: 'Frecuentemente (casi todos los días)' },
      { value: 'd', label: 'Constantemente (varias horas al día)' }
    ]
  },
  {
    id: 'dc2',
    text: '¿Cómo calificaría su nivel de manejo de procesadores de texto (Word, Google Docs)?',
    category: 'digital',
    options: [
      { value: 'a', label: 'No sé usarlos' },
      { value: 'b', label: 'Puedo escribir textos básicos' },
      { value: 'c', label: 'Manejo formato, tablas y estilos' },
      { value: 'd', label: 'Domino funciones avanzadas (macros, combinación de correspondencia)' }
    ]
  },
  {
    id: 'dc3',
    text: '¿Tiene experiencia con hojas de cálculo (Excel, Google Sheets)?',
    category: 'digital',
    options: [
      { value: 'a', label: 'Ninguna experiencia' },
      { value: 'b', label: 'Puedo introducir datos y hacer cálculos simples' },
      { value: 'c', label: 'Uso fórmulas, filtros y gráficos' },
      { value: 'd', label: 'Domino tablas dinámicas y funciones avanzadas' }
    ]
  },
  {
    id: 'dc4',
    text: '¿Cómo gestiona su correo electrónico habitualmente?',
    category: 'digital',
    options: [
      { value: 'a', label: 'No uso correo electrónico regularmente' },
      { value: 'b', label: 'Envío y recibo correos básicos' },
      { value: 'c', label: 'Uso carpetas, etiquetas y archivos adjuntos' },
      { value: 'd', label: 'Gestiono múltiples cuentas, calendarios y reglas automáticas' }
    ]
  },
  {
    id: 'dc5',
    text: '¿Ha realizado formación online anteriormente?',
    category: 'digital',
    options: [
      { value: 'a', label: 'Nunca' },
      { value: 'b', label: 'Una vez' },
      { value: 'c', label: 'Varias veces' },
      { value: 'd', label: 'Regularmente (más de 5 cursos)' }
    ]
  }
];

// Prior knowledge questions - 20 questions with auto-correction
const priorKnowledgeQuestions: Question[] = [
  {
    id: 'pk1',
    text: '¿Cuál es la función principal del departamento de Recursos Humanos en una empresa?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Gestionar las ventas y el marketing' },
      { value: 'b', label: 'Gestionar el personal, contratación, formación y nóminas', isCorrect: true },
      { value: 'c', label: 'Controlar la producción de bienes' },
      { value: 'd', label: 'Gestionar las relaciones con proveedores' }
    ],
    correctAnswer: 'b',
    explanation: 'El departamento de RRHH se encarga de la gestión del personal: selección, contratación, formación, nóminas y relaciones laborales.'
  },
  {
    id: 'pk2',
    text: '¿Qué documento mercantil acredita la entrega de mercancías?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Factura' },
      { value: 'b', label: 'Presupuesto' },
      { value: 'c', label: 'Albarán', isCorrect: true },
      { value: 'd', label: 'Recibo' }
    ],
    correctAnswer: 'c',
    explanation: 'El albarán es el documento que acredita la entrega de mercancías y debe ser firmado por el receptor.'
  },
  {
    id: 'pk3',
    text: '¿Cuál de los siguientes NO es un tipo de organigrama empresarial?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Organigrama vertical' },
      { value: 'b', label: 'Organigrama horizontal' },
      { value: 'c', label: 'Organigrama circular' },
      { value: 'd', label: 'Organigrama diagonal', isCorrect: true }
    ],
    correctAnswer: 'd',
    explanation: 'Los tipos de organigramas más comunes son: vertical, horizontal, circular y mixto. El organigrama diagonal no existe.'
  },
  {
    id: 'pk4',
    text: '¿Qué significa CIF en el contexto empresarial español?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Código de Inversión Fiscal' },
      { value: 'b', label: 'Código de Identificación Fiscal', isCorrect: true },
      { value: 'c', label: 'Certificado de Inscripción Financiera' },
      { value: 'd', label: 'Control de Ingresos Fiscales' }
    ],
    correctAnswer: 'b',
    explanation: 'El CIF (ahora NIF para empresas) es el Código de Identificación Fiscal que identifica a las personas jurídicas.'
  },
  {
    id: 'pk5',
    text: '¿Cuál es el plazo máximo para conservar los documentos mercantiles según la normativa española?',
    category: 'knowledge',
    options: [
      { value: 'a', label: '4 años' },
      { value: 'b', label: '5 años' },
      { value: 'c', label: '6 años', isCorrect: true },
      { value: 'd', label: '10 años' }
    ],
    correctAnswer: 'c',
    explanation: 'El Código de Comercio establece que los libros, correspondencia y documentos mercantiles deben conservarse durante 6 años.'
  },
  {
    id: 'pk6',
    text: '¿Qué documento se utiliza para solicitar formalmente la compra de materiales a un proveedor?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Factura' },
      { value: 'b', label: 'Pedido', isCorrect: true },
      { value: 'c', label: 'Albarán' },
      { value: 'd', label: 'Recibo' }
    ],
    correctAnswer: 'b',
    explanation: 'El pedido es el documento mediante el cual se solicita formalmente la adquisición de bienes o servicios a un proveedor.'
  },
  {
    id: 'pk7',
    text: '¿Qué es el IVA?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Impuesto sobre la Venta de Artículos' },
      { value: 'b', label: 'Impuesto sobre el Valor Añadido', isCorrect: true },
      { value: 'c', label: 'Índice de Ventas Anuales' },
      { value: 'd', label: 'Impuesto de Valoración Administrativa' }
    ],
    correctAnswer: 'b',
    explanation: 'El IVA (Impuesto sobre el Valor Añadido) es un impuesto indirecto que grava el consumo de bienes y servicios.'
  },
  {
    id: 'pk8',
    text: '¿Cuál es el tipo general de IVA en España actualmente?',
    category: 'knowledge',
    options: [
      { value: 'a', label: '4%' },
      { value: 'b', label: '10%' },
      { value: 'c', label: '21%', isCorrect: true },
      { value: 'd', label: '18%' }
    ],
    correctAnswer: 'c',
    explanation: 'El tipo general de IVA en España es del 21%. Existen tipos reducidos del 10% y superreducido del 4%.'
  },
  {
    id: 'pk9',
    text: '¿Qué es un archivo de gestión o activo?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Documentos que ya no se utilizan' },
      { value: 'b', label: 'Documentos de uso frecuente y consulta habitual', isCorrect: true },
      { value: 'c', label: 'Documentos históricos de más de 50 años' },
      { value: 'd', label: 'Documentos que deben destruirse' }
    ],
    correctAnswer: 'b',
    explanation: 'El archivo de gestión o activo contiene documentación de uso frecuente, necesaria para la actividad diaria.'
  },
  {
    id: 'pk10',
    text: '¿Qué sistema de clasificación documental ordena los documentos por temas o materias?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Sistema alfabético' },
      { value: 'b', label: 'Sistema numérico' },
      { value: 'c', label: 'Sistema cronológico' },
      { value: 'd', label: 'Sistema por materias o asuntos', isCorrect: true }
    ],
    correctAnswer: 'd',
    explanation: 'El sistema por materias o asuntos clasifica la documentación según el tema o contenido de los documentos.'
  },
  {
    id: 'pk11',
    text: '¿Qué es la tesorería de una empresa?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'El departamento que gestiona las ventas' },
      { value: 'b', label: 'El área que controla los cobros, pagos y la liquidez', isCorrect: true },
      { value: 'c', label: 'El almacén de productos' },
      { value: 'd', label: 'El servicio de atención al cliente' }
    ],
    correctAnswer: 'b',
    explanation: 'La tesorería es el área que gestiona los flujos de dinero: cobros, pagos y control de la liquidez empresarial.'
  },
  {
    id: 'pk12',
    text: '¿Qué documento justifica el pago realizado por una compra o servicio?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Presupuesto' },
      { value: 'b', label: 'Albarán' },
      { value: 'c', label: 'Recibo', isCorrect: true },
      { value: 'd', label: 'Pedido' }
    ],
    correctAnswer: 'c',
    explanation: 'El recibo es el documento que acredita haber realizado un pago y sirve como justificante del mismo.'
  },
  {
    id: 'pk13',
    text: '¿Qué es el inventario en una empresa?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'La lista de empleados' },
      { value: 'b', label: 'El registro de todos los bienes, mercancías y existencias', isCorrect: true },
      { value: 'c', label: 'El listado de clientes' },
      { value: 'd', label: 'El catálogo de proveedores' }
    ],
    correctAnswer: 'b',
    explanation: 'El inventario es el registro detallado de todos los bienes, mercancías y existencias que posee la empresa.'
  },
  {
    id: 'pk14',
    text: '¿Cuál de los siguientes es un método de valoración de existencias?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'FIFO (First In, First Out)', isCorrect: true },
      { value: 'b', label: 'FIDO (First In, Daily Out)' },
      { value: 'c', label: 'PIPO (Price In, Price Out)' },
      { value: 'd', label: 'SISO (Stock In, Stock Out)' }
    ],
    correctAnswer: 'a',
    explanation: 'FIFO (First In, First Out) es un método de valoración donde las primeras existencias en entrar son las primeras en salir.'
  },
  {
    id: 'pk15',
    text: '¿Qué es la nómina de un trabajador?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'El contrato de trabajo' },
      { value: 'b', label: 'El documento que detalla el salario y las deducciones', isCorrect: true },
      { value: 'c', label: 'El horario laboral' },
      { value: 'd', label: 'La descripción del puesto de trabajo' }
    ],
    correctAnswer: 'b',
    explanation: 'La nómina es el documento que detalla las percepciones salariales y las deducciones aplicadas al trabajador.'
  },
  {
    id: 'pk16',
    text: '¿Qué organismo gestiona las prestaciones por desempleo en España?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'La Seguridad Social' },
      { value: 'b', label: 'El SEPE (Servicio Público de Empleo Estatal)', isCorrect: true },
      { value: 'c', label: 'Hacienda' },
      { value: 'd', label: 'El Ayuntamiento' }
    ],
    correctAnswer: 'b',
    explanation: 'El SEPE (Servicio Público de Empleo Estatal) es el organismo que gestiona las prestaciones por desempleo.'
  },
  {
    id: 'pk17',
    text: '¿Qué es un libro registro de correspondencia?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Un libro donde se anotan las ventas' },
      { value: 'b', label: 'Un registro de entrada y salida de comunicaciones escritas', isCorrect: true },
      { value: 'c', label: 'Un directorio de contactos' },
      { value: 'd', label: 'Un archivo de facturas' }
    ],
    correctAnswer: 'b',
    explanation: 'El libro registro de correspondencia documenta todas las comunicaciones escritas que entran y salen de la empresa.'
  },
  {
    id: 'pk18',
    text: '¿Qué significa "acuse de recibo" en la gestión de correspondencia?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Rechazar una carta' },
      { value: 'b', label: 'Confirmar la recepción de un documento', isCorrect: true },
      { value: 'c', label: 'Enviar una carta certificada' },
      { value: 'd', label: 'Archivar un documento' }
    ],
    correctAnswer: 'b',
    explanation: 'El acuse de recibo es la confirmación formal de que se ha recibido un documento o comunicación.'
  },
  {
    id: 'pk19',
    text: '¿Cuál es la diferencia principal entre un presupuesto y una factura?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'No hay diferencia, son lo mismo' },
      { value: 'b', label: 'El presupuesto es una propuesta, la factura documenta una venta realizada', isCorrect: true },
      { value: 'c', label: 'La factura es gratuita, el presupuesto no' },
      { value: 'd', label: 'El presupuesto incluye IVA, la factura no' }
    ],
    correctAnswer: 'b',
    explanation: 'El presupuesto es una propuesta de precio antes de la venta; la factura documenta una transacción ya realizada.'
  },
  {
    id: 'pk20',
    text: '¿Qué elementos debe contener obligatoriamente una factura?',
    category: 'knowledge',
    options: [
      { value: 'a', label: 'Solo el importe total' },
      { value: 'b', label: 'Datos del emisor, receptor, fecha, descripción, base imponible e IVA', isCorrect: true },
      { value: 'c', label: 'Solo el nombre del cliente' },
      { value: 'd', label: 'Solo la fecha y el importe' }
    ],
    correctAnswer: 'b',
    explanation: 'Una factura debe incluir: datos del emisor y receptor, número y fecha, descripción, base imponible, tipo de IVA y total.'
  }
];

export const PreAssessmentTest: React.FC<PreAssessmentTestProps> = ({
  moduleId,
  moduleTitle,
  onComplete
}) => {
  const [currentSection, setCurrentSection] = useState<'intro' | 'digital' | 'knowledge' | 'review' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const allQuestions = currentSection === 'digital' ? digitalCompetenceQuestions : priorKnowledgeQuestions;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    
    // Auto-show explanation for knowledge questions after answering
    if (currentSection === 'knowledge' && currentQuestion.correctAnswer) {
      setShowExplanation(true);
    }
  };

  const isAnswerCorrect = (questionId: string) => {
    const question = priorKnowledgeQuestions.find(q => q.id === questionId);
    if (!question) return false;
    return answers[questionId] === question.correctAnswer;
  };

  const calculateResults = (): AssessmentResults => {
    // Calculate digital competence score (based on progression a=0, b=1, c=2, d=3)
    let digitalScore = 0;
    digitalCompetenceQuestions.forEach(q => {
      const answer = answers[q.id];
      const scoreMap: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      digitalScore += scoreMap[answer] || 0;
    });
    const maxDigitalScore = digitalCompetenceQuestions.length * 3;
    const digitalPercentage = (digitalScore / maxDigitalScore) * 100;

    // Calculate prior knowledge score (correct answers)
    let correctAnswers = 0;
    priorKnowledgeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const knowledgePercentage = (correctAnswers / priorKnowledgeQuestions.length) * 100;

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
    } else {
      digitalRecommendations.push('Excelente nivel de competencia digital.');
      digitalRecommendations.push('Podrá aprovechar al máximo las herramientas del campus virtual.');
    }

    if (knowledgeLevel === 'inicial') {
      knowledgeRecommendations.push(`Ha acertado ${correctAnswers} de ${priorKnowledgeQuestions.length} preguntas.`);
      knowledgeRecommendations.push('Preste especial atención a los contenidos introductorios de cada unidad.');
      knowledgeRecommendations.push('Realice todas las actividades prácticas propuestas.');
      knowledgeRecommendations.push('No dude en consultar al tutor cualquier duda desde el principio.');
    } else if (knowledgeLevel === 'medio') {
      knowledgeRecommendations.push(`Ha acertado ${correctAnswers} de ${priorKnowledgeQuestions.length} preguntas.`);
      knowledgeRecommendations.push('Tiene una base sólida que le ayudará en el aprendizaje.');
      knowledgeRecommendations.push('Enfóquese en profundizar los conocimientos que ya posee.');
    } else {
      knowledgeRecommendations.push(`¡Excelente! Ha acertado ${correctAnswers} de ${priorKnowledgeQuestions.length} preguntas.`);
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
        correctAnswers,
        totalQuestions: priorKnowledgeQuestions.length,
        level: knowledgeLevel,
        recommendations: knowledgeRecommendations
      },
      completedAt: new Date().toISOString()
    };
  };

  const handleNext = () => {
    setShowExplanation(false);
    
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
        toast.success('Test de conocimientos previos completado');
      }
    }
  };

  const handlePrev = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSection === 'knowledge') {
      setCurrentSection('digital');
      setCurrentQuestionIndex(digitalCompetenceQuestions.length - 1);
    }
  };

  const goToQuestion = (index: number, section: 'digital' | 'knowledge') => {
    setCurrentSection(section);
    setCurrentQuestionIndex(index);
    setReviewMode(false);
    setShowExplanation(false);
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
                  Antes de comenzar el módulo formativo, es necesario realizar un diagnóstico 
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
              <Badge variant="outline" className="mt-2">{digitalCompetenceQuestions.length} preguntas</Badge>
            </div>

            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Parte 2: Conocimientos Previos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Test tipo test autocorregible sobre contenidos del módulo formativo.
              </p>
              <Badge variant="outline" className="mt-2">{priorKnowledgeQuestions.length} preguntas</Badge>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              <strong>Tiempo estimado:</strong> 15-20 minutos<br />
              <strong>Nota:</strong> En la Parte 1 no hay respuestas correctas o incorrectas (diagnóstico). 
              En la Parte 2, las preguntas se autocorrigen y verá la explicación de cada respuesta.
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => setCurrentSection('digital')}
          >
            Comenzar Test
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
            Resultados del Test de Conocimientos Previos
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
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {results.priorKnowledge.correctAnswers}/{results.priorKnowledge.totalQuestions} correctas
                </Badge>
                <Badge className={getLevelBadgeColor(results.priorKnowledge.level)}>
                  Nivel {results.priorKnowledge.level}
                </Badge>
              </div>
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

          {/* Review answers button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setReviewMode(true);
              setCurrentSection('knowledge');
              setCurrentQuestionIndex(0);
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Revisar respuestas del test
          </Button>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
            <p className="font-medium mb-1">✓ Test completado</p>
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
  
  const totalAllQuestions = digitalCompetenceQuestions.length + priorKnowledgeQuestions.length;
  const currentOverallIndex = currentSection === 'digital' 
    ? currentQuestionIndex + 1 
    : digitalCompetenceQuestions.length + currentQuestionIndex + 1;
  const overallProgress = (currentOverallIndex / totalAllQuestions) * 100;

  const isKnowledgeQuestion = currentSection === 'knowledge' && currentQuestion.correctAnswer;
  const hasAnswered = answers[currentQuestion?.id];
  const currentAnswerCorrect = hasAnswered && isKnowledgeQuestion && isAnswerCorrect(currentQuestion.id);

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {sectionIcon}
            <span className="text-primary">{sectionTitle}</span>
            {reviewMode && <Badge variant="secondary">Modo revisión</Badge>}
          </CardTitle>
          <Badge variant="outline">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </Badge>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso total</span>
            <span>{currentOverallIndex} de {totalAllQuestions}</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="font-medium text-foreground">{currentQuestion.text}</p>
        </div>

        <RadioGroup
          value={answers[currentQuestion.id] || ''}
          onValueChange={handleAnswer}
          className="space-y-3"
          disabled={reviewMode}
        >
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            const isCorrectOption = option.value === currentQuestion.correctAnswer;
            const showFeedback = isKnowledgeQuestion && (showExplanation || reviewMode) && hasAnswered;
            
            let optionClass = "flex items-center space-x-3 p-4 border rounded-lg transition-colors cursor-pointer hover:bg-muted/50";
            
            if (showFeedback) {
              if (isCorrectOption) {
                optionClass = "flex items-center space-x-3 p-4 border rounded-lg bg-emerald-50 border-emerald-300";
              } else if (isSelected && !isCorrectOption) {
                optionClass = "flex items-center space-x-3 p-4 border rounded-lg bg-red-50 border-red-300";
              }
            } else if (isSelected) {
              optionClass = "flex items-center space-x-3 p-4 border rounded-lg bg-primary/5 border-primary";
            }
            
            return (
              <div key={option.value} className={optionClass}>
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer flex items-center justify-between">
                  <span>{option.label}</span>
                  {showFeedback && isCorrectOption && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  )}
                  {showFeedback && isSelected && !isCorrectOption && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Explanation for knowledge questions */}
        {isKnowledgeQuestion && (showExplanation || reviewMode) && hasAnswered && currentQuestion.explanation && (
          <div className={`rounded-lg p-4 ${currentAnswerCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex gap-2">
              {currentAnswerCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium text-sm ${currentAnswerCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {currentAnswerCorrect ? '¡Correcto!' : 'Incorrecto'}
                </p>
                <p className={`text-sm ${currentAnswerCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentSection === 'digital' && currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {reviewMode ? (
            <Button
              onClick={() => {
                if (currentQuestionIndex < totalQuestions - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                } else {
                  setCurrentSection('results');
                  setReviewMode(false);
                }
              }}
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Siguiente' : 'Ver resultados'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion?.id]}
            >
              {currentSection === 'knowledge' && currentQuestionIndex === totalQuestions - 1 
                ? 'Finalizar test' 
                : 'Siguiente'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question navigation dots for knowledge section */}
        {currentSection === 'knowledge' && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Navegación rápida:</p>
            <div className="flex flex-wrap gap-1">
              {priorKnowledgeQuestions.map((q, idx) => {
                const answered = answers[q.id];
                const correct = answered && q.correctAnswer === answers[q.id];
                const incorrect = answered && q.correctAnswer !== answers[q.id];
                
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx, 'knowledge')}
                    className={`w-8 h-8 text-xs rounded-md border transition-colors ${
                      idx === currentQuestionIndex
                        ? 'bg-primary text-primary-foreground border-primary'
                        : correct
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : incorrect
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : answered
                        ? 'bg-muted border-border'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
