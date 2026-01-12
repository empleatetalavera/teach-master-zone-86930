import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, FileText, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  Printer, ZoomIn, ZoomOut, GraduationCap, Target, Lightbulb, HelpCircle,
  Play, CheckCheck, XCircle, ArrowRight, Sparkles, Brain, BookMarked,
  Award, Clock, BarChart3, Volume2, Presentation, FileQuestion, Layers,
  ChevronDown, Star, TrendingUp, ThumbsUp, ThumbsDown, RotateCcw
} from "lucide-react";

interface ScormContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  enrollmentId?: string;
}

interface Slide {
  id: string;
  type: 'intro' | 'content' | 'objectives' | 'quiz' | 'summary' | 'practice';
  title: string;
  content?: string;
  objectives?: string[];
  keyPoints?: string[];
  quiz?: QuizQuestion;
  tips?: string[];
  image?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
}

interface ParsedContent {
  title: string;
  slides: Slide[];
  totalQuestions: number;
}

// Content paths for SCORM modules
const SCORM_CONTENT_PATHS: Record<string, string[]> = {
  "UF0517": [
    "/scorm-content/MF0969_1/UF0517/UD1_organizacion_entidades.md",
    "/scorm-content/MF0969_1/UF0517/UD2_organizacion_recursos_humanos.md"
  ],
  "UF0518": [
    "/scorm-content/MF0969_1/UF0518/UD1_tratamiento_correspondencia.md"
  ],
  "UF0519": [
    "/scorm-content/MF0969_1/UF0519/UD1_documentacion_administrativa.md",
    "/scorm-content/MF0969_1/UF0519/UD2_tesoreria.md",
    "/scorm-content/MF0969_1/UF0519/UD3_existencias.md"
  ]
};

// Interactive quiz questions for each UF
const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  "UF0517": [
    {
      id: "q1",
      question: "¿Cuál es el principal órgano de gobierno en una Sociedad Anónima (S.A.)?",
      options: [
        { id: "a", text: "El administrador único", isCorrect: false },
        { id: "b", text: "La Junta General de Accionistas", isCorrect: true },
        { id: "c", text: "El director financiero", isCorrect: false },
        { id: "d", text: "El consejo consultivo", isCorrect: false }
      ],
      explanation: "La Junta General de Accionistas es el órgano supremo de decisión en una S.A., donde los socios ejercen su derecho a voto.",
      hint: "Piensa en quién toma las decisiones más importantes en una empresa donde hay acciones..."
    },
    {
      id: "q2",
      question: "¿Qué tipo de organigrama muestra las relaciones funcionales entre departamentos?",
      options: [
        { id: "a", text: "Organigrama vertical", isCorrect: false },
        { id: "b", text: "Organigrama horizontal", isCorrect: false },
        { id: "c", text: "Organigrama funcional", isCorrect: true },
        { id: "d", text: "Organigrama circular", isCorrect: false }
      ],
      explanation: "El organigrama funcional representa la estructura organizativa según las funciones y responsabilidades de cada área.",
      hint: "El nombre del organigrama coincide con lo que representa..."
    },
    {
      id: "q3",
      question: "¿Cuál es la diferencia principal entre una S.L. y una S.A.?",
      options: [
        { id: "a", text: "El número mínimo de socios", isCorrect: false },
        { id: "b", text: "El capital social mínimo requerido", isCorrect: true },
        { id: "c", text: "La responsabilidad de los socios", isCorrect: false },
        { id: "d", text: "El tipo de actividad económica", isCorrect: false }
      ],
      explanation: "La S.L. requiere un capital mínimo de 3.000€ mientras que la S.A. requiere 60.000€ de capital social mínimo.",
      hint: "Piensa en los requisitos económicos para constituir cada tipo de sociedad..."
    },
    {
      id: "q4",
      question: "¿Qué departamento se encarga de la selección de personal en una empresa?",
      options: [
        { id: "a", text: "Departamento de Marketing", isCorrect: false },
        { id: "b", text: "Departamento de Finanzas", isCorrect: false },
        { id: "c", text: "Departamento de Recursos Humanos", isCorrect: true },
        { id: "d", text: "Departamento de Producción", isCorrect: false }
      ],
      explanation: "El Departamento de Recursos Humanos (RRHH) gestiona todo lo relacionado con el personal, incluyendo selección, contratación y formación.",
      hint: "El nombre del departamento hace referencia a las personas como recurso de la empresa..."
    },
    {
      id: "q5",
      question: "¿Cuál es la función principal de un organigrama empresarial?",
      options: [
        { id: "a", text: "Calcular los beneficios de la empresa", isCorrect: false },
        { id: "b", text: "Representar gráficamente la estructura organizativa", isCorrect: true },
        { id: "c", text: "Planificar las campañas de marketing", isCorrect: false },
        { id: "d", text: "Gestionar el inventario", isCorrect: false }
      ],
      explanation: "El organigrama es una representación gráfica que muestra la estructura jerárquica y funcional de una organización.",
      hint: "Piensa en 'organizar' + 'grama' (escritura/dibujo)..."
    }
  ],
  "UF0518": [
    {
      id: "q1",
      question: "¿Cuál es el primer paso en el tratamiento de la correspondencia entrante?",
      options: [
        { id: "a", text: "Archivar los documentos", isCorrect: false },
        { id: "b", text: "Recepción y registro", isCorrect: true },
        { id: "c", text: "Distribución a departamentos", isCorrect: false },
        { id: "d", text: "Responder inmediatamente", isCorrect: false }
      ],
      explanation: "La recepción y registro es el primer paso para controlar y documentar toda la correspondencia que llega a la empresa.",
      hint: "Antes de hacer cualquier cosa con un documento, primero hay que..."
    },
    {
      id: "q2",
      question: "¿Qué información debe incluirse obligatoriamente en el registro de correspondencia?",
      options: [
        { id: "a", text: "Solo la fecha de recepción", isCorrect: false },
        { id: "b", text: "Fecha, remitente, asunto y destinatario", isCorrect: true },
        { id: "c", text: "Solo el nombre del remitente", isCorrect: false },
        { id: "d", text: "El contenido completo del documento", isCorrect: false }
      ],
      explanation: "El registro debe incluir datos esenciales que permitan identificar y localizar cualquier documento posteriormente.",
      hint: "Piensa en qué datos necesitarías para encontrar un documento específico..."
    },
    {
      id: "q3",
      question: "¿Qué es el 'acuse de recibo' en la gestión de correspondencia?",
      options: [
        { id: "a", text: "Un tipo de sobre certificado", isCorrect: false },
        { id: "b", text: "Un documento que confirma la recepción de correspondencia", isCorrect: true },
        { id: "c", text: "Una carta de queja", isCorrect: false },
        { id: "d", text: "Un formulario de envío", isCorrect: false }
      ],
      explanation: "El acuse de recibo es un documento o notificación que confirma que el destinatario ha recibido la correspondencia enviada.",
      hint: "¿Cómo demuestras que has recibido algo importante?"
    }
  ],
  "UF0519": [
    {
      id: "q1",
      question: "¿Qué documento mercantil refleja una operación de compraventa?",
      options: [
        { id: "a", text: "El albarán", isCorrect: false },
        { id: "b", text: "La factura", isCorrect: true },
        { id: "c", text: "El cheque", isCorrect: false },
        { id: "d", text: "El recibo", isCorrect: false }
      ],
      explanation: "La factura es el documento que justifica legalmente una operación de compraventa, incluyendo todos los datos fiscales necesarios.",
      hint: "Es el documento más importante en una compra que incluye el IVA..."
    },
    {
      id: "q2",
      question: "¿Qué es la tesorería de una empresa?",
      options: [
        { id: "a", text: "El departamento de ventas", isCorrect: false },
        { id: "b", text: "La gestión del dinero disponible (efectivo y bancos)", isCorrect: true },
        { id: "c", text: "El almacén de productos", isCorrect: false },
        { id: "d", text: "El departamento de contratación", isCorrect: false }
      ],
      explanation: "La tesorería gestiona todos los recursos líquidos de la empresa: caja, bancos, cobros y pagos.",
      hint: "Piensa en dónde se guarda el 'tesoro' de la empresa..."
    },
    {
      id: "q3",
      question: "¿Qué método de valoración de existencias aplica el precio más reciente?",
      options: [
        { id: "a", text: "FIFO (First In, First Out)", isCorrect: false },
        { id: "b", text: "LIFO (Last In, First Out)", isCorrect: true },
        { id: "c", text: "Precio Medio Ponderado", isCorrect: false },
        { id: "d", text: "Coste estándar", isCorrect: false }
      ],
      explanation: "LIFO valora las salidas al precio de las últimas entradas, aunque en España no está permitido fiscalmente.",
      hint: "Last In = Último en entrar, First Out = Primero en salir..."
    },
    {
      id: "q4",
      question: "¿Cuál es la función principal del libro de caja?",
      options: [
        { id: "a", text: "Registrar las ventas a crédito", isCorrect: false },
        { id: "b", text: "Controlar los movimientos de efectivo", isCorrect: true },
        { id: "c", text: "Calcular los impuestos", isCorrect: false },
        { id: "d", text: "Gestionar el inventario", isCorrect: false }
      ],
      explanation: "El libro de caja registra todas las entradas y salidas de dinero en efectivo de la empresa.",
      hint: "Si es un libro de 'caja', ¿qué tipo de dinero controlará?"
    },
    {
      id: "q5",
      question: "¿Qué documento acompaña a la mercancía en su transporte?",
      options: [
        { id: "a", text: "La factura proforma", isCorrect: false },
        { id: "b", text: "El albarán de entrega", isCorrect: true },
        { id: "c", text: "El presupuesto", isCorrect: false },
        { id: "d", text: "La nota de pedido", isCorrect: false }
      ],
      explanation: "El albarán es el documento que justifica la entrega física de la mercancía y precede a la factura.",
      hint: "Es lo que firmas cuando recibes un paquete para confirmar la entrega..."
    }
  ]
};

export function ScormContentViewer({ 
  open, 
  onOpenChange, 
  unitId, 
  unitTitle,
  enrollmentId
}: ScormContentViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState("slides");
  const [ufCode, setUfCode] = useState("");

  useEffect(() => {
    if (open && unitTitle) {
      loadScormContent();
    }
  }, [open, unitTitle]);

  const getUfCode = (title: string): string => {
    if (title.includes("UF0517") || title.toLowerCase().includes("organización empresarial")) {
      return "UF0517";
    } else if (title.includes("UF0518") || title.toLowerCase().includes("correspondencia")) {
      return "UF0518";
    } else if (title.includes("UF0519") || title.toLowerCase().includes("documentación económico")) {
      return "UF0519";
    }
    return "";
  };

  const loadScormContent = async () => {
    setLoading(true);
    setCurrentSlide(0);
    setQuizAnswers({});
    setShowResults({});
    setShowHint({});
    setScore(0);
    
    try {
      const code = getUfCode(unitTitle);
      setUfCode(code);
      
      const paths = SCORM_CONTENT_PATHS[code] || [];
      const quizQuestions = QUIZ_QUESTIONS[code] || [];
      
      // Generate interactive slides
      const generatedSlides: Slide[] = [];
      
      // Intro slide
      generatedSlides.push({
        id: 'intro',
        type: 'intro',
        title: unitTitle,
        content: getIntroContent(code)
      });

      // Objectives slide
      generatedSlides.push({
        id: 'objectives',
        type: 'objectives',
        title: 'Objetivos de Aprendizaje',
        objectives: getObjectives(code)
      });

      // Content slides from markdown files
      let slideIndex = 0;
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const text = await response.text();
            const contentSlides = parseMarkdownToSlides(text, slideIndex);
            generatedSlides.push(...contentSlides);
            slideIndex += contentSlides.length;
          }
        } catch (e) {
          console.error(`Error loading ${path}:`, e);
        }
      }

      // Quiz slides
      quizQuestions.forEach((quiz, index) => {
        generatedSlides.push({
          id: `quiz-${index}`,
          type: 'quiz',
          title: `Pregunta ${index + 1} de ${quizQuestions.length}`,
          quiz
        });
      });

      // Summary slide
      generatedSlides.push({
        id: 'summary',
        type: 'summary',
        title: 'Resumen y Conclusiones',
        keyPoints: getKeyPoints(code),
        tips: getTips(code)
      });

      setSlides(generatedSlides);
      
      // Load progress if user is enrolled
      if (user && enrollmentId) {
        await loadProgress();
      }
    } catch (error: any) {
      console.error("Error loading SCORM content:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el contenido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdownToSlides = (markdown: string, startIndex: number): Slide[] => {
    const slides: Slide[] = [];
    const sections = markdown.split(/^## /gm).filter(Boolean);
    
    sections.forEach((section, index) => {
      const lines = section.split('\n');
      const title = lines[0]?.trim() || `Sección ${startIndex + index + 1}`;
      const content = lines.slice(1).join('\n').trim();
      
      if (content.length > 50) {
        slides.push({
          id: `content-${startIndex}-${index}`,
          type: 'content',
          title,
          content
        });
      }
    });
    
    return slides.slice(0, 8); // Limit content slides
  };

  const getIntroContent = (code: string): string => {
    const intros: Record<string, string> = {
      "UF0517": "Bienvenido a esta unidad formativa donde aprenderás sobre la organización de entidades empresariales y la gestión de recursos humanos. Exploraremos los diferentes tipos de empresas, sus estructuras organizativas y cómo funcionan los departamentos.",
      "UF0518": "En esta unidad formativa descubrirás cómo gestionar la correspondencia y la información empresarial de forma eficiente. Aprenderás técnicas de archivo, clasificación y distribución de documentos.",
      "UF0519": "Esta unidad te enseñará los fundamentos de la documentación económico-administrativa, tesorería y gestión de existencias. Conocerás los documentos mercantiles más importantes y cómo gestionarlos."
    };
    return intros[code] || "Bienvenido a esta unidad formativa.";
  };

  const getObjectives = (code: string): string[] => {
    const objectives: Record<string, string[]> = {
      "UF0517": [
        "Identificar los diferentes tipos de entidades empresariales",
        "Comprender la estructura organizativa de una empresa",
        "Conocer las funciones de los principales departamentos",
        "Interpretar organigramas empresariales",
        "Distinguir las responsabilidades de cada área funcional"
      ],
      "UF0518": [
        "Aplicar técnicas de recepción y registro de correspondencia",
        "Gestionar eficientemente la distribución de documentos",
        "Utilizar sistemas de clasificación y archivo",
        "Manejar herramientas digitales de gestión documental",
        "Cumplir con la normativa de protección de datos"
      ],
      "UF0519": [
        "Identificar los principales documentos mercantiles",
        "Gestionar la tesorería básica de una empresa",
        "Aplicar métodos de valoración de existencias",
        "Realizar operaciones de cobro y pago",
        "Mantener el control de inventarios"
      ]
    };
    return objectives[code] || [];
  };

  const getKeyPoints = (code: string): string[] => {
    const keyPoints: Record<string, string[]> = {
      "UF0517": [
        "Las empresas pueden ser personas físicas (autónomos) o jurídicas (sociedades)",
        "La S.L. requiere 3.000€ de capital mínimo, la S.A. requiere 60.000€",
        "El organigrama representa visualmente la estructura de la empresa",
        "Los departamentos principales son: Dirección, RRHH, Finanzas, Comercial y Producción",
        "La comunicación fluye vertical y horizontalmente en la organización"
      ],
      "UF0518": [
        "Toda correspondencia debe registrarse con fecha, remitente y asunto",
        "El archivo puede ser alfabético, numérico, cronológico o temático",
        "Los documentos confidenciales requieren tratamiento especial",
        "El correo electrónico tiene validez legal con firma digital",
        "La digitalización facilita el acceso y conservación de documentos"
      ],
      "UF0519": [
        "La factura es el documento fundamental en operaciones de compraventa",
        "El albarán justifica la entrega física de mercancías",
        "Los métodos de valoración son FIFO, LIFO y Precio Medio Ponderado",
        "El libro de caja registra movimientos de efectivo",
        "El arqueo de caja verifica el saldo real vs. contable"
      ]
    };
    return keyPoints[code] || [];
  };

  const getTips = (code: string): string[] => {
    const tips: Record<string, string[]> = {
      "UF0517": [
        "💡 Memoriza las diferencias entre S.L. y S.A., es muy preguntado",
        "📊 Practica leyendo e interpretando organigramas reales",
        "🎯 Relaciona cada departamento con sus funciones principales"
      ],
      "UF0518": [
        "💡 El registro de entrada es obligatorio, nunca lo omitas",
        "📁 Un buen sistema de archivo ahorra tiempo y evita problemas",
        "🔐 Protege siempre los datos personales según la LOPD"
      ],
      "UF0519": [
        "💡 Diferencia bien entre albarán y factura",
        "📊 En España, LIFO no está permitido fiscalmente",
        "🎯 El arqueo de caja debe hacerse regularmente"
      ]
    };
    return tips[code] || [];
  };

  const loadProgress = async () => {
    if (!user || !enrollmentId) return;
    
    try {
      const { data } = await supabase
        .from("unit_content_progress")
        .select("progress_percentage")
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .eq("content_id", unitId)
        .maybeSingle();

      if (data) {
        setProgress(data.progress_percentage || 0);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const saveProgress = async (newProgress: number) => {
    if (!user || !enrollmentId) return;

    try {
      await supabase
        .from("unit_content_progress")
        .upsert({
          user_id: user.id,
          content_id: unitId,
          enrollment_id: enrollmentId,
          progress_percentage: newProgress,
          completed: newProgress >= 100,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null
        }, {
          onConflict: "user_id,content_id,enrollment_id"
        });

      setProgress(newProgress);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleSlideChange = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      const newProgress = Math.round(((index + 1) / slides.length) * 100);
      if (newProgress > progress) {
        saveProgress(newProgress);
      }
    }
  };

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleCheckAnswer = (questionId: string, quiz: QuizQuestion) => {
    setShowResults(prev => ({ ...prev, [questionId]: true }));
    const selectedAnswer = quizAnswers[questionId];
    const correctOption = quiz.options.find(o => o.isCorrect);
    if (selectedAnswer === correctOption?.id) {
      setScore(prev => prev + 1);
    }
  };

  const handleShowHint = (questionId: string) => {
    setShowHint(prev => ({ ...prev, [questionId]: true }));
  };

  const handleRetryQuiz = (questionId: string) => {
    setQuizAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
    setShowResults(prev => {
      const newResults = { ...prev };
      delete newResults[questionId];
      return newResults;
    });
    setShowHint(prev => {
      const newHints = { ...prev };
      delete newHints[questionId];
      return newHints;
    });
  };

  const currentSlideData = slides[currentSlide];
  const quizSlides = slides.filter(s => s.type === 'quiz');
  const totalQuestions = quizSlides.length;
  const answeredQuestions = Object.keys(showResults).length;

  const handlePrint = () => {
    window.print();
  };

  const renderSlideContent = () => {
    if (!currentSlideData) return null;

    switch (currentSlideData.type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative p-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-2xl">
                <GraduationCap className="h-20 w-20 text-primary-foreground" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentSlideData.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {currentSlideData.content}
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">~45 min</span>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <FileQuestion className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">{totalQuestions} preguntas</span>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">{slides.length} slides</span>
                </div>
              </Card>
            </div>

            <Button 
              size="lg" 
              className="mt-6 gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              onClick={() => handleSlideChange(1)}
            >
              <Play className="h-5 w-5" />
              Comenzar Aprendizaje
            </Button>
          </div>
        );

      case 'objectives':
        return (
          <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl">
                <Target className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold">{currentSlideData.title}</h2>
              <p className="text-muted-foreground">Al finalizar esta unidad serás capaz de:</p>
            </div>

            <div className="grid gap-4">
              {currentSlideData.objectives?.map((objective, index) => (
                <Card 
                  key={index}
                  className="p-4 bg-gradient-to-r from-background to-muted/30 border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <p className="text-lg pt-1.5">{objective}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{currentSlideData.title}</h2>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none
                    prose-headings:text-foreground
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-4
                    prose-h4:text-lg prose-h4:font-medium
                    prose-p:text-foreground/80 prose-p:leading-relaxed
                    prose-li:text-foreground/80
                    prose-strong:text-primary prose-strong:font-semibold
                    prose-table:border prose-table:border-border prose-table:rounded-lg prose-table:overflow-hidden
                    prose-th:bg-primary/10 prose-th:p-3 prose-th:text-left
                    prose-td:p-3 prose-td:border-t prose-td:border-border
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                    prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-ul:space-y-2 prose-ol:space-y-2
                  "
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentSlideData.content || ''}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Accordion for additional info */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tips" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Consejos y Recomendaciones</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 py-2">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                      <p className="text-sm">Toma notas de los conceptos clave mientras avanzas en el contenido.</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm">Relaciona los nuevos conceptos con situaciones de la vida real.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'quiz':
        const quiz = currentSlideData.quiz!;
        const selectedAnswer = quizAnswers[quiz.id];
        const isAnswered = showResults[quiz.id];
        const correctOption = quiz.options.find(o => o.isCorrect);
        const isCorrect = selectedAnswer === correctOption?.id;
        const hintShown = showHint[quiz.id];

        return (
          <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                <HelpCircle className="h-4 w-4 mr-2" />
                {currentSlideData.title}
              </Badge>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Puntuación: {score}/{answeredQuestions}
              </div>
            </div>

            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <FileQuestion className="h-5 w-5 text-primary-foreground" />
                  </div>
                  {quiz.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {quiz.options.map((option) => {
                  let optionClass = "border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]";
                  
                  if (isAnswered) {
                    if (option.isCorrect) {
                      optionClass += " border-green-500 bg-green-50 dark:bg-green-950/30";
                    } else if (selectedAnswer === option.id && !option.isCorrect) {
                      optionClass += " border-red-500 bg-red-50 dark:bg-red-950/30";
                    } else {
                      optionClass += " opacity-50";
                    }
                  } else if (selectedAnswer === option.id) {
                    optionClass += " border-primary bg-primary/10 ring-2 ring-primary/20";
                  } else {
                    optionClass += " border-muted hover:border-primary/50 hover:bg-muted/50";
                  }

                  return (
                    <Card
                      key={option.id}
                      className={optionClass}
                      onClick={() => !isAnswered && handleQuizAnswer(quiz.id, option.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isAnswered && option.isCorrect 
                            ? 'bg-green-500 text-white' 
                            : isAnswered && selectedAnswer === option.id && !option.isCorrect
                              ? 'bg-red-500 text-white'
                              : selectedAnswer === option.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                        }`}>
                          {option.id.toUpperCase()}
                        </div>
                        <span className="flex-1 text-lg">{option.text}</span>
                        {isAnswered && option.isCorrect && (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        )}
                        {isAnswered && selectedAnswer === option.id && !option.isCorrect && (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
              <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                {!isAnswered && (
                  <div className="flex gap-3 w-full">
                    {!hintShown && quiz.hint && (
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => handleShowHint(quiz.id)}
                      >
                        <Lightbulb className="h-4 w-4" />
                        Ver Pista
                      </Button>
                    )}
                    <Button 
                      className="flex-1 gap-2 bg-gradient-to-r from-primary to-purple-600"
                      disabled={!selectedAnswer}
                      onClick={() => handleCheckAnswer(quiz.id, quiz)}
                    >
                      <CheckCheck className="h-4 w-4" />
                      Comprobar Respuesta
                    </Button>
                  </div>
                )}

                {hintShown && !isAnswered && (
                  <Card className="w-full p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">{quiz.hint}</p>
                    </div>
                  </Card>
                )}

                {isAnswered && (
                  <>
                    <Card className={`w-full p-4 ${isCorrect ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'}`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <>
                            <ThumbsUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-200">¡Correcto!</p>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{quiz.explanation}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-200">Incorrecto</p>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{quiz.explanation}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => handleRetryQuiz(quiz.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Intentar de Nuevo
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        );

      case 'summary':
        return (
          <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl">
                <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold">{currentSlideData.title}</h2>
            </div>

            {/* Score summary */}
            {totalQuestions > 0 && (
              <Card className="p-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tu puntuación</p>
                      <p className="text-2xl font-bold">{score} de {totalQuestions} preguntas correctas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-primary">
                      {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Key points */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Puntos Clave a Recordar
              </h3>
              <div className="grid gap-3">
                {currentSlideData.keyPoints?.map((point, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-primary bg-gradient-to-r from-background to-muted/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p>{point}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Consejos para el Examen
              </h3>
              <div className="grid gap-3">
                {currentSlideData.tips?.map((tip, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-sm">{tip}</p>
                  </Card>
                ))}
              </div>
            </div>

            {progress < 100 && (
              <Button 
                size="lg" 
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => saveProgress(100)}
              >
                <CheckCircle2 className="h-5 w-5" />
                Marcar Unidad como Completada
              </Button>
            )}

            {progress >= 100 && (
              <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-3 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-8 w-8" />
                  <span className="text-xl font-semibold">¡Unidad Completada!</span>
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[95vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 via-purple-500/5 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg">
                  <Presentation className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl">{unitTitle}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <BookMarked className="h-4 w-4" />
                    Módulo Interactivo SEPE
                    <Badge variant="outline" className="ml-2 bg-background">
                      Slide {currentSlide + 1} de {slides.length}
                    </Badge>
                  </DialogDescription>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.max(12, f - 2))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">{fontSize}px</span>
                <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.min(24, f + 2))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progreso del módulo</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Slide navigation dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-primary rounded-full' 
                      : index < currentSlide 
                        ? 'w-2 h-2 bg-primary/50 rounded-full hover:bg-primary/70' 
                        : 'w-2 h-2 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50'
                  }`}
                  title={slide.title}
                />
              ))}
            </div>
          </DialogHeader>

          {/* Main content area */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
                  </div>
                  <p className="text-muted-foreground">Preparando contenido interactivo...</p>
                </div>
              </div>
            ) : (
              renderSlideContent()
            )}
          </ScrollArea>

          {/* Footer with navigation */}
          <div className="px-6 py-4 border-t bg-gradient-to-r from-muted/50 to-muted/30 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handleSlideChange(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-4">
              {currentSlideData?.type === 'quiz' && (
                <Badge variant="secondary" className="gap-1">
                  <HelpCircle className="h-3 w-3" />
                  Test Interactivo
                </Badge>
              )}
              {currentSlideData?.type === 'content' && (
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  Contenido Teórico
                </Badge>
              )}
            </div>

            <Button
              onClick={() => handleSlideChange(currentSlide + 1)}
              disabled={currentSlide === slides.length - 1}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
