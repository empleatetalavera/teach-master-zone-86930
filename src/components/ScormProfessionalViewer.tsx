import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, FileText, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  GraduationCap, Lightbulb, FileQuestion, Download, Home, 
  ClipboardList, Play, Headphones, Video, Send, X, MessageCircle,
  BarChart3, BookMarked, HelpCircle, Check
} from "lucide-react";

interface ScormProfessionalViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  enrollmentId?: string;
}

interface ContentSlide {
  id: string;
  type: 'intro' | 'content' | 'quiz' | 'summary' | 'exercise';
  title: string;
  content: string;
  keyTerms?: string[];
  quiz?: QuizQuestion;
  section?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
}

interface IndexItem {
  id: string;
  title: string;
  subItems?: { id: string; title: string; completed?: boolean }[];
  completed?: boolean;
}

// Sidebar menu items
const SIDEBAR_MENU = [
  { id: 'glossary', icon: BookOpen, label: 'Glosario', color: 'text-red-500' },
  { id: 'downloads', icon: Download, label: 'Descargas', color: 'text-pink-500' },
  { id: 'exercises', icon: ClipboardList, label: 'Ejercicios', color: 'text-yellow-500' },
  { id: 'test', icon: FileQuestion, label: 'Test', color: 'text-green-500' },
  { id: 'progress', icon: BarChart3, label: 'Progreso', color: 'text-blue-500' },
  { id: 'audio', icon: Headphones, label: 'Audioteca', color: 'text-purple-500' },
  { id: 'video', icon: Video, label: 'Videoteca', color: 'text-indigo-500' },
];

// Tab items for top navigation
const TOP_TABS = [
  { id: 'glossary', label: 'Glosario' },
  { id: 'downloads', label: 'Descargas' },
  { id: 'exercises', label: 'Ejercicios' },
  { id: 'test', label: 'Test' },
];

// Manual PDFs available for download
const MANUAL_PDFS: Record<string, { title: string; files: { name: string; url: string }[] }> = {
  'UF0517': {
    title: 'UF0517 - Organización Empresarial y RR.HH.',
    files: [
      { name: 'UD1 - Organización de Entidades', url: '/documents/manuales/UF0517_UD1_organizacion_entidades.pdf' },
      { name: 'UD2 - Recursos Humanos', url: '/documents/manuales/UF0517_UD2_recursos_humanos.pdf' },
    ]
  },
  'UF0518': {
    title: 'UF0518 - Gestión Auxiliar de la Correspondencia',
    files: [
      { name: 'UD1 - Tratamiento de Correspondencia', url: '/documents/manuales/UF0518_UD1_correspondencia.pdf' },
    ]
  },
  'UF0519': {
    title: 'UF0519 - Gestión Auxiliar de Documentación Económico-Administrativa',
    files: [
      { name: 'UD1 - Documentación Administrativa', url: '/documents/manuales/UF0519_UD1_documentacion_administrativa.pdf' },
      { name: 'UD2 - Tesorería', url: '/documents/manuales/UF0519_UD2_tesoreria.pdf' },
      { name: 'UD3 - Existencias', url: '/documents/manuales/UF0519_UD3_existencias.pdf' },
    ]
  }
};

// Sample content slides (abbreviated - real content would be imported from data files)
const generateSlides = (unitTitle: string): ContentSlide[] => {
  const ufCode = unitTitle.includes('0517') ? 'UF0517' : 
                 unitTitle.includes('0518') ? 'UF0518' : 
                 unitTitle.includes('0519') ? 'UF0519' : 
                 unitTitle.toLowerCase().includes('organiza') ? 'UF0517' :
                 unitTitle.toLowerCase().includes('correspond') ? 'UF0518' : 'UF0519';

  const slides: ContentSlide[] = [
    {
      id: "slide-01",
      type: "intro",
      title: `${ufCode} - Introducción`,
      section: "1. Introducción",
      content: `# Bienvenido a la Unidad Formativa

Esta unidad formativa te proporcionará los conocimientos fundamentales sobre la organización empresarial y la gestión administrativa.

## Objetivos de Aprendizaje

- Comprender la estructura organizativa de las empresas
- Identificar los diferentes tipos de organizaciones
- Conocer los principios de la gestión administrativa
- Aplicar técnicas de organización del trabajo

> **Duración estimada:** 30 horas`,
      keyTerms: ["Organización", "Empresa", "Administración"]
    },
    {
      id: "slide-02",
      type: "content",
      title: "1.1 Concepto de Empresa",
      section: "1. Organización y Planificación",
      content: `# ¿Qué es una Empresa?

La **empresa** es una unidad económica de producción que combina diferentes factores productivos con el objetivo de producir bienes o prestar servicios.

## Características Fundamentales

| Característica | Descripción |
|----------------|-------------|
| **Unidad económica** | Agrupa recursos humanos, materiales y financieros |
| **Unidad de decisión** | Existe un centro de decisión que planifica |
| **Unidad financiera** | Dispone de un patrimonio propio |
| **Unidad técnica** | Aplica tecnología específica |

## Elementos de la Empresa

1. **Elementos materiales**: Edificios, maquinaria
2. **Elementos humanos**: Trabajadores, directivos
3. **Elementos financieros**: Capital, inversiones
4. **Elementos inmateriales**: Marca, patentes`,
      keyTerms: ["Empresa", "Unidad económica", "Factores productivos"]
    },
    {
      id: "slide-03",
      type: "content",
      title: "1.2 Clasificación de Empresas",
      section: "1. Organización y Planificación",
      content: `# Clasificación de Empresas según su Tamaño

| Tipo | Nº Trabajadores | Facturación Anual |
|------|-----------------|-------------------|
| **Microempresa** | 1-9 | < 2 millones € |
| **Pequeña empresa** | 10-49 | < 10 millones € |
| **Mediana empresa** | 50-249 | < 50 millones € |
| **Gran empresa** | 250+ | > 50 millones € |

## Las PYMES en España

> **Dato importante:** Las PYMES representan más del **99%** del tejido empresarial español.

### Ventajas:
- Mayor flexibilidad y adaptabilidad
- Cercanía al cliente
- Toma de decisiones más ágil

### Desventajas:
- Menor capacidad financiera
- Dificultad para acceder a créditos`,
      keyTerms: ["PYME", "Microempresa", "Clasificación"]
    },
    {
      id: "slide-04",
      type: "quiz",
      title: "Autoevaluación: Empresas",
      section: "1. Organización y Planificación",
      content: "Comprueba tus conocimientos sobre la clasificación de empresas.",
      quiz: {
        id: "quiz-01",
        question: "¿Cuántos trabajadores tiene como máximo una microempresa?",
        options: [
          { id: "a", text: "5 trabajadores", isCorrect: false },
          { id: "b", text: "9 trabajadores", isCorrect: true },
          { id: "c", text: "49 trabajadores", isCorrect: false },
          { id: "d", text: "99 trabajadores", isCorrect: false }
        ],
        explanation: "Una microempresa tiene entre 1 y 9 trabajadores según la clasificación europea.",
        hint: "Piensa en el tipo de empresa más pequeño."
      }
    },
    {
      id: "slide-05",
      type: "content",
      title: "1.3 Sectores Económicos",
      section: "1. Organización y Planificación",
      content: `# Los Sectores Económicos

## Sector Primario 🌾
Actividades relacionadas con la extracción de recursos naturales:
- Agricultura, ganadería, pesca, minería

## Sector Secundario 🏭
Transformación de materias primas:
- Industria manufacturera, construcción

## Sector Terciario 🛒
Prestación de servicios:
- Comercio, transporte, turismo, finanzas

> **Tendencia:** El sector servicios representa más del 70% del PIB en economías desarrolladas.`,
      keyTerms: ["Sector primario", "Sector secundario", "Sector terciario"]
    },
    // Add more slides as needed...
    {
      id: "slide-06",
      type: "content",
      title: "2.1 Estructura Organizativa",
      section: "2. Estructura de la Empresa",
      content: `# Niveles Jerárquicos en la Empresa

## Nivel Estratégico (Alta Dirección) 👔
- Consejo de Administración, Director General
- Toma de decisiones estratégicas a largo plazo

## Nivel Táctico (Mandos Intermedios) 👨‍💼
- Jefes de Departamento, Coordinadores
- Implementación de estrategias

## Nivel Operativo (Base) 👷
- Trabajadores, Personal administrativo
- Ejecución de tareas diarias

## Principios de la Jerarquía
1. **Unidad de mando**: Cada empleado depende de un solo superior
2. **Cadena de mando**: Línea clara de autoridad
3. **Tramo de control**: Número óptimo de subordinados`,
      keyTerms: ["Jerarquía", "Estructura", "Organigrama"]
    },
    {
      id: "slide-07",
      type: "quiz",
      title: "Autoevaluación: Estructura",
      section: "2. Estructura de la Empresa",
      content: "Evalúa tu comprensión sobre la estructura organizativa.",
      quiz: {
        id: "quiz-02",
        question: "¿Qué principio establece que cada empleado debe depender de un solo superior?",
        options: [
          { id: "a", text: "Tramo de control", isCorrect: false },
          { id: "b", text: "Unidad de mando", isCorrect: true },
          { id: "c", text: "Cadena de mando", isCorrect: false },
          { id: "d", text: "Delegación", isCorrect: false }
        ],
        explanation: "El principio de unidad de mando establece que cada trabajador debe recibir órdenes de un único superior.",
        hint: "Se refiere a la relación directa entre superior y subordinado."
      }
    },
    {
      id: "slide-08",
      type: "content",
      title: "3.1 Función Administrativa",
      section: "3. Gestión Administrativa",
      content: `# El Proceso Administrativo

## Las 4 Funciones del Proceso Administrativo

### 1. PLANIFICACIÓN 📋
- Establecer objetivos
- Definir estrategias
- Elaborar presupuestos

### 2. ORGANIZACIÓN 🗂️
- División del trabajo
- Asignación de tareas
- Establecer jerarquías

### 3. DIRECCIÓN 🎯
- Liderazgo
- Comunicación
- Motivación

### 4. CONTROL ✅
- Medir resultados
- Detectar desviaciones
- Aplicar correcciones`,
      keyTerms: ["Planificación", "Organización", "Dirección", "Control"]
    },
    {
      id: "slide-09",
      type: "content",
      title: "3.2 Departamentos de la Empresa",
      section: "3. Gestión Administrativa",
      content: `# Estructura Departamental

## Departamentos Funcionales Básicos

### 📊 Dirección General
- Planificación estratégica
- Toma de decisiones de alto nivel

### 📋 Administración
- Gestión documental
- Contabilidad general
- Facturación y cobros

### 👥 Recursos Humanos
- Selección de personal
- Formación y desarrollo
- Nóminas y contratos

### 💰 Financiero
- Control presupuestario
- Tesorería
- Inversiones

### 🛒 Comercial
- Ventas y marketing
- Atención al cliente`,
      keyTerms: ["Departamentos", "Administración", "Recursos Humanos"]
    },
    {
      id: "slide-10",
      type: "summary",
      title: "Resumen de la Unidad",
      section: "Resumen",
      content: `# Resumen de la Unidad Formativa

## Conceptos Clave Aprendidos

✅ **La empresa** como unidad económica de producción

✅ **Clasificación de empresas** por tamaño, sector y titularidad

✅ **Estructura organizativa** y niveles jerárquicos

✅ **Proceso administrativo**: planificación, organización, dirección y control

✅ **Departamentos funcionales** y su coordinación

## Próximos Pasos

- Completa las actividades prácticas
- Realiza el test de evaluación final
- Consulta el material complementario

> **¡Enhorabuena!** Has completado esta unidad formativa.`
    }
  ];

  return slides;
};

// Generate index from slides
const generateIndex = (slides: ContentSlide[]): IndexItem[] => {
  const sections: Record<string, IndexItem> = {};
  
  slides.forEach((slide, index) => {
    const section = slide.section || 'General';
    if (!sections[section]) {
      sections[section] = {
        id: `section-${Object.keys(sections).length + 1}`,
        title: section,
        subItems: []
      };
    }
    sections[section].subItems?.push({
      id: slide.id,
      title: slide.title,
      completed: false
    });
  });

  return Object.values(sections);
};

export default function ScormProfessionalViewer({
  open,
  onOpenChange,
  unitId,
  unitTitle,
  enrollmentId
}: ScormProfessionalViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [slides] = useState<ContentSlide[]>(() => generateSlides(unitTitle));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '¡Hola soy Hugo, ¿En qué puedo ayudarte?' }
  ]);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const currentSlide = slides[currentSlideIndex];
  const progress = ((completedSlides.size + 1) / slides.length) * 100;
  const indexItems = generateIndex(slides);

  // Determine UF code for PDF downloads
  const getUFCode = (): string => {
    if (unitTitle.includes('0517') || unitTitle.toLowerCase().includes('organiza')) return 'UF0517';
    if (unitTitle.includes('0518') || unitTitle.toLowerCase().includes('correspond')) return 'UF0518';
    if (unitTitle.includes('0519') || unitTitle.toLowerCase().includes('document')) return 'UF0519';
    return 'UF0517';
  };

  const ufCode = getUFCode();
  const manualInfo = MANUAL_PDFS[ufCode];

  // Mark slide as completed when navigating
  useEffect(() => {
    if (currentSlideIndex > 0) {
      setCompletedSlides(prev => new Set([...prev, currentSlideIndex - 1]));
    }
  }, [currentSlideIndex]);

  // Save progress to database
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || !enrollmentId) return;
      
      try {
        await supabase.from('module_progress').upsert({
          enrollment_id: enrollmentId,
          module_id: unitId,
          completed: completedSlides.size >= slides.length - 1,
          last_position: currentSlideIndex.toString(),
          time_spent_minutes: Math.floor(completedSlides.size * 2)
        }, { onConflict: 'enrollment_id,module_id' });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    const debounce = setTimeout(saveProgress, 2000);
    return () => clearTimeout(debounce);
  }, [completedSlides, currentSlideIndex, user, enrollmentId, unitId, slides.length]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCompletedSlides(prev => new Set([...prev, currentSlideIndex]));
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleQuizAnswer = (slideId: string, optionId: string, isCorrect: boolean) => {
    if (quizResults[slideId] !== undefined) return;
    
    setQuizAnswers(prev => ({ ...prev, [slideId]: optionId }));
    setQuizResults(prev => ({ ...prev, [slideId]: isCorrect }));
    
    toast({
      title: isCorrect ? "¡Correcto!" : "Respuesta incorrecta",
      description: isCorrect ? "Excelente trabajo." : "Lee la explicación para entender mejor.",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatMessage }]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Gracias por tu pregunta. Estoy aquí para ayudarte con cualquier duda sobre el contenido del curso. ¿En qué más puedo asistirte?' 
      }]);
    }, 1000);
  };

  const goToSlide = (slideId: string) => {
    const index = slides.findIndex(s => s.id === slideId);
    if (index !== -1) {
      setCurrentSlideIndex(index);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Top header bar - turquoise/teal color */}
        <div className="bg-primary text-primary-foreground">
          {/* Unit title bar */}
          <div className="px-4 py-2 text-center border-b border-primary-foreground/20 text-sm">
            {unitTitle}
          </div>
          
          {/* Tabs navigation */}
          <div className="flex items-center justify-center gap-8 py-2">
            {TOP_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium transition-all hover:opacity-100 ${
                  activeTab === tab.id ? 'opacity-100 border-b-2 border-white pb-1' : 'opacity-70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800">
          {/* Left Sidebar */}
          <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-r border-border flex flex-col`}>
            {/* Sidebar header with home icon */}
            <div className="p-4 border-b">
              <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Home className="h-5 w-5" />
              </button>
            </div>

            {/* Menu items */}
            <div className="p-3 space-y-1">
              {SIDEBAR_MENU.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === item.id 
                      ? 'bg-muted font-medium' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Index section */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-t border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Índice</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {indexItems.map((section) => (
                    <div key={section.id} className="space-y-0.5">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        <span>{section.title}</span>
                      </div>
                      {section.subItems?.map((item, idx) => {
                        const slideIndex = slides.findIndex(s => s.id === item.id);
                        const isCompleted = completedSlides.has(slideIndex);
                        const isCurrent = slideIndex === currentSlideIndex;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => goToSlide(item.id)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors ${
                              isCurrent 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <span className="truncate flex-1 text-left">{item.title}</span>
                            {isCompleted && (
                              <Check className="h-3 w-3 text-green-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content header */}
            <div className="bg-white dark:bg-slate-800 border-b px-6 py-4">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                <Play className="h-4 w-4" />
                <span>UNIDAD DIDÁCTICA {currentSlide?.section?.split('.')[0] || '1'}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {currentSlide?.title || 'Contenido'}
              </h1>
            </div>

            {/* Content body */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-4xl mx-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activeTab === 'content' || activeTab === 'test' ? (
                  <>
                    {currentSlide?.type === 'quiz' && currentSlide.quiz ? (
                      <Card className="border-2">
                        <CardHeader className="bg-muted/30">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileQuestion className="h-5 w-5 text-primary" />
                            {currentSlide.quiz.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                          {currentSlide.quiz.options.map((option) => {
                            const isSelected = quizAnswers[currentSlide.id] === option.id;
                            const hasAnswered = quizResults[currentSlide.id] !== undefined;
                            const isCorrectOption = option.isCorrect;
                            
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleQuizAnswer(currentSlide.id, option.id, option.isCorrect)}
                                disabled={hasAnswered}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                  hasAnswered
                                    ? isCorrectOption
                                      ? 'bg-green-50 border-green-500 dark:bg-green-900/30'
                                      : isSelected
                                        ? 'bg-red-50 border-red-500 dark:bg-red-900/30'
                                        : 'opacity-50 border-muted'
                                    : 'hover:border-primary hover:bg-primary/5 border-muted'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                                    {option.id.toUpperCase()}
                                  </span>
                                  <span className="flex-1">{option.text}</span>
                                  {hasAnswered && isCorrectOption && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {/* Hint button */}
                          {currentSlide.quiz.hint && !quizResults[currentSlide.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowHint(prev => ({ ...prev, [currentSlide.id]: !prev[currentSlide.id] }))}
                              className="mt-2"
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              {showHint[currentSlide.id] ? 'Ocultar pista' : 'Ver pista'}
                            </Button>
                          )}

                          {showHint[currentSlide.id] && currentSlide.quiz.hint && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-sm border border-yellow-200">
                              <span className="font-medium">💡 Pista:</span> {currentSlide.quiz.hint}
                            </div>
                          )}

                          {/* Explanation */}
                          {quizResults[currentSlide.id] !== undefined && (
                            <div className={`p-4 rounded-lg ${
                              quizResults[currentSlide.id]
                                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200'
                                : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200'
                            }`}>
                              <p className="font-medium mb-1">
                                {quizResults[currentSlide.id] ? '✅ ¡Correcto!' : '📖 Explicación:'}
                              </p>
                              <p className="text-sm">{currentSlide.quiz.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {currentSlide?.content || ''}
                        </ReactMarkdown>
                      </div>
                    )}
                  </>
                ) : activeTab === 'downloads' && manualInfo ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Descargas Disponibles
                      </CardTitle>
                      <CardDescription>
                        Descarga los manuales oficiales del curso en formato PDF
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {manualInfo.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          download
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="h-6 w-6 text-red-500" />
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">PDF</p>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                ) : activeTab === 'progress' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Tu Progreso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Contenido completado</span>
                          <span className="font-bold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{completedSlides.size}</p>
                          <p className="text-xs text-muted-foreground">Páginas completadas</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{slides.length - completedSlides.size}</p>
                          <p className="text-xs text-muted-foreground">Páginas restantes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Esta sección estará disponible próximamente
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            {/* Bottom navigation */}
            <div className="bg-white dark:bg-slate-800 border-t px-6 py-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver a la página anterior
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Página</span>
                <Input
                  type="number"
                  min={1}
                  max={slides.length}
                  value={currentSlideIndex + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) - 1;
                    if (val >= 0 && val < slides.length) {
                      setCurrentSlideIndex(val);
                    }
                  }}
                  className="w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">de {slides.length}</span>
              </div>

              <Button
                onClick={handleNext}
                disabled={currentSlideIndex === slides.length - 1}
                className="gap-2"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Assistant Widget */}
          <div className={`${chatOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-l flex flex-col`}>
            {chatOpen && (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">¡Hola soy Hugo</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe algo..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendChat}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Floating chat button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
