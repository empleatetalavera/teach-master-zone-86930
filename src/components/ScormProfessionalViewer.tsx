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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, FileText, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  GraduationCap, Lightbulb, FileQuestion, Download, Home, 
  ClipboardList, Play, Headphones, Video, Send, X, MessageCircle,
  BarChart3, BookMarked, HelpCircle, Check, Building2, Users, 
  Briefcase, FileSpreadsheet, Mail, Package, Calculator, CreditCard,
  Palette, Sparkles, Edit2
} from "lucide-react";
import { SyllabusEditor } from "@/components/SyllabusEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateUF0519ComprehensiveSlides } from "./scorm/UF0519SlidesGenerator";
import { ContentSlide, IndexItem, QuizQuestion, ExtendedContentSlide } from "./scorm/types";

interface ScormProfessionalViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  enrollmentId?: string;
}

// Types imported from ./scorm/types - no local duplicates needed

// Theme definitions - iSpring/Canva style
const CONTENT_THEMES = [
  { 
    id: 'modern-blue', 
    name: '🌊 Océano Moderno', 
    headerBg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    contentBg: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-500',
    border: 'border-blue-200',
    highlight: 'bg-blue-100',
  },
  { 
    id: 'forest-green', 
    name: '🌲 Bosque Profesional', 
    headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    contentBg: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-500',
    border: 'border-emerald-200',
    highlight: 'bg-emerald-100',
  },
  { 
    id: 'sunset-warm', 
    name: '🌅 Atardecer Cálido', 
    headerBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
    contentBg: 'bg-gradient-to-br from-orange-50 via-white to-rose-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-500',
    border: 'border-orange-200',
    highlight: 'bg-orange-100',
  },
  { 
    id: 'royal-purple', 
    name: '👑 Púrpura Elegante', 
    headerBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
    contentBg: 'bg-gradient-to-br from-purple-50 via-white to-pink-50',
    cardBg: 'bg-white/90 backdrop-blur',
    accent: 'text-purple-600',
    accentBg: 'bg-purple-500',
    border: 'border-purple-200',
    highlight: 'bg-purple-100',
  },
  { 
    id: 'slate-minimal', 
    name: '🖤 Minimalista Oscuro', 
    headerBg: 'bg-gradient-to-r from-slate-800 to-slate-600',
    contentBg: 'bg-gradient-to-br from-slate-100 via-white to-gray-100',
    cardBg: 'bg-white/95 backdrop-blur',
    accent: 'text-slate-700',
    accentBg: 'bg-slate-700',
    border: 'border-slate-300',
    highlight: 'bg-slate-200',
  },
  { 
    id: 'corporate-sepe', 
    name: '🏛️ Corporativo SEPE', 
    headerBg: 'bg-gradient-to-r from-primary to-primary/80',
    contentBg: 'bg-slate-50',
    cardBg: 'bg-white',
    accent: 'text-primary',
    accentBg: 'bg-primary',
    border: 'border-primary',
    highlight: 'bg-primary/10',
  },
  { 
    id: 'ispring-teal', 
    name: '✨ iSpring Profesional', 
    headerBg: 'bg-gradient-to-r from-teal-600 to-teal-500',
    contentBg: 'bg-white',
    cardBg: 'bg-white',
    accent: 'text-teal-600',
    accentBg: 'bg-teal-600',
    border: 'border-teal-500',
    highlight: 'bg-teal-50',
  },
];

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

// COMPREHENSIVE SLIDE CONTENT - 60+ SLIDES WITH ALL PDF CONTENT
const generateComprehensiveSlides = (unitTitle: string): ContentSlide[] => {
  const ufCode = unitTitle.includes('0517') ? 'UF0517' : 
                 unitTitle.includes('0518') ? 'UF0518' : 
                 unitTitle.includes('0519') ? 'UF0519' : 
                 unitTitle.toLowerCase().includes('organiza') ? 'UF0517' :
                 unitTitle.toLowerCase().includes('correspond') ? 'UF0518' : 
                 unitTitle.toLowerCase().includes('document') ? 'UF0519' : 'UF0517';

  // UF0517 - ORGANIZACIÓN EMPRESARIAL Y DE RECURSOS HUMANOS
  if (ufCode === 'UF0517') {
    return generateUF0517Slides();
  }
  
  // UF0518 - GESTIÓN DE CORRESPONDENCIA
  if (ufCode === 'UF0518') {
    return generateUF0518Slides();
  }
  
  // UF0519 - DOCUMENTACIÓN ADMINISTRATIVA - 68 slides completas
  return generateUF0519ComprehensiveSlides() as ContentSlide[];
};

// UF0517 - 25+ slides on organizational structure and HR
const generateUF0517Slides = (): ContentSlide[] => [
  {
    id: "uf0517-01",
    type: "intro",
    title: "UF0517 - Introducción",
    section: "1. Introducción",
    content: `# 🏢 Organización Empresarial y de Recursos Humanos

Bienvenido a esta **Unidad Formativa** que te proporcionará los conocimientos fundamentales sobre:

- La estructura y organización de las empresas
- Los diferentes tipos de entidades públicas y privadas  
- La gestión de los recursos humanos
- El trabajo en equipo y la coordinación

## 🎯 Objetivos de Aprendizaje

Al finalizar esta unidad serás capaz de:

1. Comprender la estructura organizativa de las empresas
2. Identificar los diferentes tipos de organizaciones
3. Conocer los principios de la gestión administrativa
4. Aplicar técnicas de organización del trabajo en equipo

> **⏱️ Duración estimada:** 30 horas de formación`,
    keyTerms: ["Organización", "Empresa", "Recursos Humanos"]
  },
  {
    id: "uf0517-02",
    type: "content",
    title: "1.1 ¿Qué es una Empresa?",
    section: "1. Funciones de las Empresas",
    content: `# 🏭 Concepto de Empresa

La **empresa** es una unidad económica de producción que combina diferentes factores productivos con el objetivo de producir bienes o prestar servicios destinados a satisfacer las necesidades del mercado.

## ✅ Características Fundamentales

| Característica | Descripción |
|----------------|-------------|
| 📊 **Unidad económica** | Agrupa recursos humanos, materiales y financieros |
| 🎯 **Unidad de decisión** | Existe un centro de decisión que planifica y controla |
| 💰 **Unidad financiera** | Dispone de un patrimonio propio |
| ⚙️ **Unidad técnica** | Aplica tecnología específica en sus procesos |

## 🧩 Elementos de la Empresa

1. **Elementos materiales**: Edificios, maquinaria, mobiliario
2. **Elementos humanos**: Trabajadores, directivos, socios
3. **Elementos financieros**: Capital, inversiones, préstamos
4. **Elementos inmateriales**: Marca, patentes, know-how`,
    keyTerms: ["Empresa", "Unidad económica", "Factores productivos"]
  },
  {
    id: "uf0517-03",
    type: "table",
    title: "1.2 Clasificación por Tamaño",
    section: "1. Funciones de las Empresas",
    content: `# 📏 Clasificación de Empresas según su Tamaño

Las empresas se clasifican según criterios de la Unión Europea:`,
    tableData: {
      headers: ["Tipo de Empresa", "Nº Trabajadores", "Facturación Anual", "Balance General"],
      rows: [
        ["🏠 Microempresa", "1 - 9", "< 2 millones €", "< 2 millones €"],
        ["🏪 Pequeña empresa", "10 - 49", "< 10 millones €", "< 10 millones €"],
        ["🏢 Mediana empresa", "50 - 249", "< 50 millones €", "< 43 millones €"],
        ["🏰 Gran empresa", "250+", "> 50 millones €", "> 43 millones €"]
      ]
    },
    keyTerms: ["PYME", "Microempresa", "Gran empresa"]
  },
  {
    id: "uf0517-04",
    type: "content",
    title: "1.3 Las PYMES en España",
    section: "1. Funciones de las Empresas",
    content: `# 🇪🇸 Importancia de las PYMES

> **📊 Dato clave:** Las PYMES representan más del **99%** del tejido empresarial español y generan aproximadamente el **66%** del empleo privado.

## ✅ Ventajas de las PYMES

- 🔄 Mayor **flexibilidad** y adaptabilidad al cambio
- 👥 **Cercanía** al cliente y trato personalizado
- ⚡ Toma de **decisiones más ágil**
- 💡 Mayor capacidad de **innovación** en nichos
- 🤝 Ambiente laboral más **familiar**

## ⚠️ Desventajas de las PYMES

- 💳 Menor capacidad **financiera**
- 📉 Dificultad para acceder a **créditos**
- 📊 Menor poder de **negociación** con proveedores
- 🌍 Limitaciones para la **internacionalización**
- 👨‍💼 Dependencia del **empresario fundador**`,
    keyTerms: ["PYMES", "Tejido empresarial", "Flexibilidad"]
  },
  {
    id: "uf0517-05",
    type: "quiz",
    title: "📝 Autoevaluación: Tamaño de Empresas",
    section: "1. Funciones de las Empresas",
    content: "Comprueba tus conocimientos sobre la clasificación de empresas.",
    quiz: {
      id: "quiz-uf0517-01",
      question: "¿Cuántos trabajadores tiene como máximo una microempresa según la clasificación europea?",
      options: [
        { id: "a", text: "5 trabajadores", isCorrect: false },
        { id: "b", text: "9 trabajadores", isCorrect: true },
        { id: "c", text: "49 trabajadores", isCorrect: false },
        { id: "d", text: "99 trabajadores", isCorrect: false }
      ],
      explanation: "Una microempresa tiene entre 1 y 9 trabajadores según la clasificación oficial de la Unión Europea. Las pequeñas empresas van de 10 a 49 trabajadores.",
      hint: "Piensa en el tipo de empresa más pequeño, como una tienda de barrio."
    }
  },
  {
    id: "uf0517-06",
    type: "table",
    title: "1.4 Sectores de Actividad Económica",
    section: "1. Funciones de las Empresas",
    content: `# 🌍 Los Tres Sectores Económicos`,
    tableData: {
      headers: ["Sector", "Descripción", "Ejemplos"],
      rows: [
        ["🌾 PRIMARIO", "Extracción de recursos naturales", "Agricultura, ganadería, pesca, minería"],
        ["🏭 SECUNDARIO", "Transformación de materias primas", "Industria manufacturera, construcción, energía"],
        ["🛒 TERCIARIO", "Prestación de servicios", "Comercio, transporte, turismo, finanzas, sanidad"]
      ]
    },
    keyTerms: ["Sector primario", "Sector secundario", "Sector terciario"]
  },
  {
    id: "uf0517-07",
    type: "content",
    title: "1.5 Evolución de los Sectores",
    section: "1. Funciones de las Empresas",
    content: `# 📈 Tendencia Histórica de los Sectores

## Evolución en Economías Desarrolladas

| Época | Sector Dominante | Característica |
|-------|------------------|----------------|
| Pre-industrial | Primario | Economía agraria |
| S. XIX - XX | Secundario | Revolución Industrial |
| Actualidad | Terciario | Economía de servicios |

> **📊 En España actualmente:**
> - Sector Primario: ~3% del PIB
> - Sector Secundario: ~23% del PIB  
> - Sector Terciario: ~74% del PIB

## 🔮 Sector Cuaternario (Emergente)

Algunos economistas identifican un **cuarto sector** relacionado con:
- 💻 Tecnologías de la información
- 🔬 Investigación y desarrollo (I+D)
- 🎓 Servicios de alto valor añadido
- 🧠 Economía del conocimiento`,
    keyTerms: ["PIB", "Sector cuaternario", "Economía de servicios"]
  },
  {
    id: "uf0517-08",
    type: "table",
    title: "1.6 Clasificación por Titularidad",
    section: "1. Funciones de las Empresas",
    content: `# 🏛️ Empresas según la Titularidad del Capital`,
    tableData: {
      headers: ["Tipo", "Propietario", "Objetivo Principal", "Ejemplos"],
      rows: [
        ["🏛️ Pública", "Estado (total o mayoritario)", "Servicio público", "RENFE, Correos, RTVE"],
        ["🏢 Privada", "Particulares", "Beneficio económico", "Inditex, Mercadona, Telefónica"],
        ["🤝 Mixta", "Estado + Particulares", "Combinado", "Empresas participadas"]
      ]
    },
    keyTerms: ["Empresa pública", "Empresa privada", "Empresa mixta"]
  },
  {
    id: "uf0517-09",
    type: "table",
    title: "1.7 Formas Jurídicas de Empresa",
    section: "1. Funciones de las Empresas",
    content: `# ⚖️ Principales Formas Jurídicas

Elegir la forma jurídica adecuada es fundamental para cualquier emprendedor:`,
    tableData: {
      headers: ["Forma Jurídica", "Capital Mínimo", "Responsabilidad", "Socios Mínimos"],
      rows: [
        ["👤 Empresario Individual", "No existe", "Ilimitada (patrimonio personal)", "1"],
        ["🏢 Sociedad Limitada (SL)", "3.000 €", "Limitada al capital aportado", "1+"],
        ["🏛️ Sociedad Anónima (SA)", "60.000 €", "Limitada al capital aportado", "1+"],
        ["👷 Sociedad Laboral", "3.000 € (SLL) / 60.000 € (SAL)", "Limitada", "3+ (mayoría trabajadores)"],
        ["🤝 Cooperativa", "Variable según estatutos", "Limitada", "3+ (1er grado)"]
      ]
    },
    keyTerms: ["Sociedad Limitada", "Sociedad Anónima", "Cooperativa"]
  },
  {
    id: "uf0517-10",
    type: "quiz",
    title: "📝 Autoevaluación: Formas Jurídicas",
    section: "1. Funciones de las Empresas",
    content: "Evalúa tu comprensión sobre las formas jurídicas empresariales.",
    quiz: {
      id: "quiz-uf0517-02",
      question: "¿Cuál es el capital social mínimo para constituir una Sociedad de Responsabilidad Limitada (SL)?",
      options: [
        { id: "a", text: "1.000 €", isCorrect: false },
        { id: "b", text: "3.000 €", isCorrect: true },
        { id: "c", text: "60.000 €", isCorrect: false },
        { id: "d", text: "No existe mínimo", isCorrect: false }
      ],
      explanation: "El capital social mínimo de una SL es de 3.000 €, mientras que para una SA es de 60.000 €. La SL es la forma más común para PYMES.",
      hint: "Es una cantidad accesible para pequeños emprendedores."
    }
  },
  {
    id: "uf0517-11",
    type: "content",
    title: "2.1 Niveles Jerárquicos",
    section: "2. Estructura de la Empresa",
    content: `# 📊 Niveles Jerárquicos en la Empresa

La **jerarquía** establece los diferentes niveles de autoridad y responsabilidad dentro de la organización.

## 👔 Nivel Estratégico (Alta Dirección)

- **Quiénes:** Consejo de Administración, Director General/CEO, Directores de Área
- **Funciones:** Toma de decisiones estratégicas a largo plazo (3-5 años)
- **Visión:** Global de la empresa y su entorno

## 👨‍💼 Nivel Táctico (Mandos Intermedios)

- **Quiénes:** Jefes de Departamento, Coordinadores, Supervisores
- **Funciones:** Implementación de estrategias y gestión de equipos
- **Visión:** Departamental o de área (1-3 años)

## 👷 Nivel Operativo (Base)

- **Quiénes:** Trabajadores especializados, Personal administrativo, Operarios
- **Funciones:** Ejecución de tareas diarias
- **Visión:** Corto plazo (día a día)`,
    keyTerms: ["Jerarquía", "Alta Dirección", "Mandos Intermedios"]
  },
  {
    id: "uf0517-12",
    type: "checklist",
    title: "2.2 Principios de la Jerarquía",
    section: "2. Estructura de la Empresa",
    content: `# ✅ Principios Fundamentales de la Organización

Marca los principios que comprendes correctamente:`,
    checklistItems: [
      { id: "p1", text: "Unidad de mando: Cada empleado depende de un solo superior", checked: false },
      { id: "p2", text: "Cadena de mando: Línea clara de autoridad de arriba abajo", checked: false },
      { id: "p3", text: "Tramo de control: Número óptimo de subordinados por superior", checked: false },
      { id: "p4", text: "Delegación: Transferencia de autoridad para realizar tareas", checked: false },
      { id: "p5", text: "Especialización: División del trabajo según competencias", checked: false },
      { id: "p6", text: "Coordinación: Las partes trabajan de forma integrada", checked: false }
    ]
  },
  {
    id: "uf0517-13",
    type: "quiz",
    title: "📝 Autoevaluación: Principios Organizativos",
    section: "2. Estructura de la Empresa",
    content: "Evalúa tu comprensión sobre la estructura organizativa.",
    quiz: {
      id: "quiz-uf0517-03",
      question: "¿Qué principio establece que cada empleado debe recibir órdenes de un único superior?",
      options: [
        { id: "a", text: "Tramo de control", isCorrect: false },
        { id: "b", text: "Unidad de mando", isCorrect: true },
        { id: "c", text: "Cadena de mando", isCorrect: false },
        { id: "d", text: "Delegación de autoridad", isCorrect: false }
      ],
      explanation: "El principio de UNIDAD DE MANDO establece que cada trabajador debe recibir órdenes de un único superior para evitar confusiones y conflictos de autoridad.",
      hint: "Se refiere a la relación directa entre un jefe y su subordinado."
    }
  },
  {
    id: "uf0517-14",
    type: "content",
    title: "2.3 El Organigrama",
    section: "2. Estructura de la Empresa",
    content: `# 📋 El Organigrama Empresarial

El **organigrama** es la representación gráfica de la estructura organizativa de una empresa.

## 📊 ¿Qué muestra un organigrama?

1. **Unidades organizativas**: Departamentos, secciones, puestos
2. **Relaciones de autoridad**: Líneas de mando
3. **Niveles jerárquicos**: Posición relativa en la estructura
4. **Canales de comunicación**: Flujos formales de información
5. **División del trabajo**: Agrupación de funciones

## 🎯 Tipos de Organigramas

| Tipo | Descripción |
|------|-------------|
| **Vertical** | De arriba (dirección) hacia abajo (operativo) |
| **Horizontal** | De izquierda a derecha |
| **Circular** | La dirección en el centro, departamentos alrededor |
| **Mixto** | Combinación de varios tipos |`,
    keyTerms: ["Organigrama", "Estructura organizativa", "Departamentos"]
  },
  {
    id: "uf0517-15",
    type: "table",
    title: "2.4 Departamentos Funcionales",
    section: "2. Estructura de la Empresa",
    content: `# 🏢 Los Departamentos de la Empresa`,
    tableData: {
      headers: ["Departamento", "Funciones Principales", "Personal Típico"],
      rows: [
        ["📊 Dirección General", "Planificación estratégica, toma de decisiones", "CEO, Director General"],
        ["📋 Administración", "Gestión documental, contabilidad, facturación", "Administrativos, contables"],
        ["👥 Recursos Humanos", "Selección, formación, nóminas, PRL", "Técnicos RRHH"],
        ["💰 Financiero", "Tesorería, inversiones, presupuestos", "Controller, tesorero"],
        ["🛒 Comercial/Ventas", "Ventas, marketing, atención cliente", "Comerciales, marketing"],
        ["🏭 Producción", "Fabricación, calidad, logística", "Jefes de producción, operarios"]
      ]
    },
    keyTerms: ["Departamentos", "Administración", "Recursos Humanos"]
  },
  {
    id: "uf0517-16",
    type: "content",
    title: "3.1 La Función Administrativa",
    section: "3. El Proceso Administrativo",
    content: `# ⚙️ El Proceso Administrativo

La **función administrativa** comprende cuatro fases fundamentales que forman un ciclo continuo:

## 📋 1. PLANIFICACIÓN

- Establecer **objetivos** claros y medibles
- Definir **estrategias** para alcanzarlos
- Elaborar **presupuestos** y cronogramas
- Anticipar posibles **contingencias**

## 🗂️ 2. ORGANIZACIÓN

- **División del trabajo** en tareas
- **Asignación** de responsabilidades
- Establecer **relaciones** de autoridad
- Coordinar **recursos** necesarios

## 🎯 3. DIRECCIÓN

- **Liderazgo** y motivación del equipo
- **Comunicación** efectiva
- **Toma de decisiones** operativas
- **Supervisión** del trabajo

## ✅ 4. CONTROL

- **Medir** resultados obtenidos
- **Comparar** con objetivos planificados
- **Detectar** desviaciones
- **Aplicar** acciones correctoras`,
    keyTerms: ["Planificación", "Organización", "Dirección", "Control"]
  },
  {
    id: "uf0517-17",
    type: "quiz",
    title: "📝 Autoevaluación: Proceso Administrativo",
    section: "3. El Proceso Administrativo",
    content: "Evalúa tu comprensión sobre el proceso administrativo.",
    quiz: {
      id: "quiz-uf0517-04",
      question: "¿Cuál de las siguientes NO es una fase del proceso administrativo clásico?",
      options: [
        { id: "a", text: "Planificación", isCorrect: false },
        { id: "b", text: "Organización", isCorrect: false },
        { id: "c", text: "Innovación", isCorrect: true },
        { id: "d", text: "Control", isCorrect: false }
      ],
      explanation: "Las 4 fases del proceso administrativo clásico son: Planificación, Organización, Dirección y Control (PODC). La innovación, aunque importante, no es una de las fases clásicas.",
      hint: "Recuerda el acrónimo PODC."
    }
  },
  {
    id: "uf0517-18",
    type: "content",
    title: "4.1 El Trabajo en Grupo",
    section: "4. Los Grupos de Trabajo",
    content: `# 👥 El Trabajo en Grupo

Un **grupo** es un conjunto de dos o más personas que interactúan entre sí, comparten objetivos comunes y se perciben como una unidad.

## 🔑 Características de un Grupo

| Elemento | Descripción |
|----------|-------------|
| **Interacción** | Los miembros se relacionan entre sí |
| **Interdependencia** | Las acciones de unos afectan a otros |
| **Identidad compartida** | Sentimiento de pertenencia |
| **Objetivos comunes** | Metas que el grupo persigue |
| **Normas** | Reglas de comportamiento aceptadas |
| **Roles** | Funciones diferenciadas de cada miembro |

## 🎭 Tipos de Roles en el Grupo

- **Rol asignado**: Establecido formalmente por la organización
- **Rol asumido**: El que la persona desarrolla realmente
- **Rol percibido**: Cómo cree que debe comportarse
- **Rol esperado**: Lo que otros esperan de esa persona`,
    keyTerms: ["Grupo", "Interacción", "Roles"]
  },
  {
    id: "uf0517-19",
    type: "table",
    title: "4.2 Clasificación de Grupos",
    section: "4. Los Grupos de Trabajo",
    content: `# 📊 Tipos de Grupos en las Organizaciones`,
    tableData: {
      headers: ["Criterio", "Tipo", "Características", "Ejemplo"],
      rows: [
        ["Por origen", "Formal", "Creado por la organización", "Departamento, comité"],
        ["Por origen", "Informal", "Surge espontáneamente", "Grupo de amigos"],
        ["Por duración", "Permanente", "Duración indefinida", "Secciones, áreas"],
        ["Por duración", "Temporal", "Para tarea específica", "Equipo de proyecto"],
        ["Por tamaño", "Pequeño (2-12)", "Comunicación directa", "Equipo de trabajo"],
        ["Por tamaño", "Grande (25+)", "Alta estructuración", "Departamento grande"]
      ]
    },
    keyTerms: ["Grupo formal", "Grupo informal", "Equipo de trabajo"]
  },
  {
    id: "uf0517-20",
    type: "content",
    title: "4.3 Fases del Desarrollo Grupal",
    section: "4. Los Grupos de Trabajo",
    content: `# 📈 Etapas del Desarrollo de un Grupo (Modelo de Tuckman)

## 1️⃣ FORMACIÓN (Forming)
- Los miembros se conocen
- Incertidumbre sobre el funcionamiento
- Dependencia del líder
- Ambiente de cortesía inicial

## 2️⃣ CONFLICTO (Storming)
- Surgen diferencias de opinión
- Luchas por el liderazgo
- Resistencia a las normas
- Momento crítico para el grupo

## 3️⃣ NORMALIZACIÓN (Norming)
- Se establecen normas aceptadas
- Desarrollo de la cohesión
- Roles clarificados
- Ambiente de cooperación

## 4️⃣ DESEMPEÑO (Performing)
- Máxima productividad
- Trabajo colaborativo fluido
- Resolución efectiva de problemas
- Satisfacción de los miembros

## 5️⃣ DISOLUCIÓN (Adjourning)
- Finalización del proyecto
- Celebración de logros
- Cierre emocional`,
    keyTerms: ["Tuckman", "Formación", "Conflicto", "Desempeño"]
  },
  {
    id: "uf0517-21",
    type: "quiz",
    title: "📝 Autoevaluación: Trabajo en Equipo",
    section: "4. Los Grupos de Trabajo",
    content: "Evalúa tu comprensión sobre el trabajo en equipo.",
    quiz: {
      id: "quiz-uf0517-05",
      question: "Según el modelo de Tuckman, ¿en qué fase del desarrollo grupal surgen los conflictos y las luchas de poder?",
      options: [
        { id: "a", text: "Formación (Forming)", isCorrect: false },
        { id: "b", text: "Conflicto (Storming)", isCorrect: true },
        { id: "c", text: "Normalización (Norming)", isCorrect: false },
        { id: "d", text: "Desempeño (Performing)", isCorrect: false }
      ],
      explanation: "La fase de STORMING (Conflicto) es cuando surgen los desacuerdos, luchas por el liderazgo y resistencias. Es una fase natural y necesaria para que el grupo madure.",
      hint: "La palabra en inglés significa 'tormenta'."
    }
  },
  {
    id: "uf0517-22",
    type: "checklist",
    title: "4.4 Factores de Cohesión Grupal",
    section: "4. Los Grupos de Trabajo",
    content: `# 🤝 ¿Qué Aumenta la Cohesión del Grupo?

Marca los factores que favorecen la cohesión grupal:`,
    checklistItems: [
      { id: "c1", text: "Éxito del grupo en sus objetivos", checked: false },
      { id: "c2", text: "Amenaza externa percibida (une al grupo)", checked: false },
      { id: "c3", text: "Tamaño reducido del grupo", checked: false },
      { id: "c4", text: "Interacción frecuente entre miembros", checked: false },
      { id: "c5", text: "Aceptación de los objetivos por todos", checked: false },
      { id: "c6", text: "Similitud de valores entre miembros", checked: false },
      { id: "c7", text: "Competencia interna entre miembros", checked: false }
    ]
  },
  {
    id: "uf0517-23",
    type: "table",
    title: "5.1 Técnicas de Gestión del Tiempo",
    section: "5. Organización del Trabajo",
    content: `# ⏰ Herramientas para la Organización del Trabajo`,
    tableData: {
      headers: ["Técnica", "Descripción", "Cuándo Usar"],
      rows: [
        ["📊 Matriz Eisenhower", "Clasificar por urgencia/importancia", "Priorización diaria"],
        ["🍅 Técnica Pomodoro", "Bloques de 25 min + 5 descanso", "Tareas que requieren concentración"],
        ["⚡ Regla 2 minutos", "Si tarda <2 min, hacerlo ya", "Evitar acumulación"],
        ["📦 Batching", "Agrupar tareas similares", "Emails, llamadas, revisiones"],
        ["📋 GTD (Getting Things Done)", "Capturar, procesar, organizar", "Gestión integral de tareas"]
      ]
    },
    keyTerms: ["Gestión del tiempo", "Productividad", "Eisenhower"]
  },
  {
    id: "uf0517-24",
    type: "content",
    title: "5.2 Indicadores de Calidad",
    section: "5. Organización del Trabajo",
    content: `# 📊 Indicadores en el Apoyo Administrativo

Los **indicadores** permiten medir el grado de cumplimiento de los objetivos.

## 📈 Tipos de Indicadores

| Tipo | Qué Mide | Ejemplo |
|------|----------|---------|
| **Eficacia** | Logro de resultados | % documentos archivados correctamente |
| **Eficiencia** | Recursos vs resultados | Documentos procesados por hora |
| **Productividad** | Producción/recursos | Expedientes por persona/día |
| **Calidad** | Satisfacción, ausencia de errores | % reclamaciones por errores |

## 🎯 Indicadores Típicos

| Área | Indicador | Objetivo |
|------|-----------|----------|
| 📁 Archivo | Documentos localizados a la primera | > 95% |
| 📞 Teléfono | Llamadas atendidas en < 3 tonos | > 90% |
| ✉️ Correspondencia | Distribución en < 2 horas | > 98% |
| 📄 Reprografía | Documentos sin errores | > 99% |`,
    keyTerms: ["Indicadores", "Eficacia", "Eficiencia", "Calidad"]
  },
  {
    id: "uf0517-25",
    type: "summary",
    title: "📚 Resumen UF0517",
    section: "Resumen Final",
    content: `# ✅ Resumen de la Unidad Formativa UF0517

## 🎯 Conceptos Clave Aprendidos

✅ **La empresa** como unidad económica de producción con elementos materiales, humanos y financieros

✅ **Clasificación de empresas** por tamaño (micro, pequeña, mediana, grande), sector (primario, secundario, terciario) y titularidad (pública, privada, mixta)

✅ **Formas jurídicas**: Empresario individual, SL (3.000€), SA (60.000€), Cooperativas

✅ **Estructura organizativa**: Niveles estratégico, táctico y operativo

✅ **Proceso administrativo**: Planificación → Organización → Dirección → Control

✅ **Trabajo en grupo**: Fases de Tuckman (Forming, Storming, Norming, Performing)

✅ **Gestión del tiempo**: Matriz Eisenhower, Pomodoro, GTD

## 📋 Próximos Pasos

1. Completa las **actividades prácticas**
2. Realiza el **test de evaluación final**
3. Descarga el **manual PDF** como referencia

> **🎉 ¡Enhorabuena!** Has completado la Unidad Formativa UF0517.`
  }
];

// UF0518 - 20+ slides on correspondence and mail management
const generateUF0518Slides = (): ContentSlide[] => [
  {
    id: "uf0518-01",
    type: "intro",
    title: "UF0518 - Introducción",
    section: "1. Introducción",
    content: `# ✉️ Gestión Auxiliar de la Correspondencia

Bienvenido a esta **Unidad Formativa** sobre la gestión de comunicaciones escritas y paquetería en la empresa.

## 🎯 Objetivos de Aprendizaje

- Comprender los tipos de comunicación escrita empresarial
- Dominar la recepción y clasificación de correspondencia
- Conocer los medios de envío y sus características
- Aplicar normativas de seguridad y confidencialidad

> **⏱️ Duración estimada:** 30 horas de formación`,
    keyTerms: ["Correspondencia", "Comunicación escrita", "Paquetería"]
  },
  {
    id: "uf0518-02",
    type: "content",
    title: "1.1 La Comunicación Escrita",
    section: "1. Comunicación Escrita",
    content: `# 📝 Importancia de la Comunicación Escrita

La comunicación escrita es **fundamental** para el funcionamiento de cualquier organización.

## ✅ Características

| Característica | Descripción |
|----------------|-------------|
| 📌 **Permanencia** | Queda registro duradero del mensaje |
| 🤔 **Reflexión** | Permite elaborar el contenido con cuidado |
| 🌍 **Alcance** | Puede llegar a múltiples destinatarios |
| 👔 **Formalidad** | Apropiada para comunicaciones oficiales |
| ⚖️ **Verificabilidad** | Sirve como prueba documental |

## 🎯 Funciones

1. **Informativa**: Transmitir datos, hechos, decisiones
2. **Directiva**: Dar instrucciones u órdenes
3. **Persuasiva**: Convencer, influir
4. **Coordinación**: Sincronizar actividades
5. **Testimonial**: Dejar constancia de hechos`,
    keyTerms: ["Comunicación escrita", "Formalidad", "Documentación"]
  },
  {
    id: "uf0518-03",
    type: "table",
    title: "1.2 Tipos de Cartas Comerciales",
    section: "1. Comunicación Escrita",
    content: `# 📧 Clasificación de Cartas Comerciales`,
    tableData: {
      headers: ["Tipo de Carta", "Finalidad", "Ejemplo de Uso"],
      rows: [
        ["📋 Presentación", "Dar a conocer empresa o productos", "Apertura de negocio"],
        ["💼 Oferta", "Proponer productos/servicios", "Respuesta a solicitud"],
        ["📦 Pedido", "Solicitar mercancías o servicios", "Compra a proveedor"],
        ["⚠️ Reclamación", "Protestar por incumplimientos", "Error en entrega"],
        ["💰 Cobro", "Reclamar pagos pendientes", "Factura impagada"],
        ["🙏 Agradecimiento", "Agradecer colaboración", "Tras cerrar un trato"],
        ["😔 Disculpa", "Pedir perdón por errores", "Error en servicio"]
      ]
    },
    keyTerms: ["Carta comercial", "Pedido", "Reclamación"]
  },
  {
    id: "uf0518-04",
    type: "content",
    title: "1.3 Estructura de la Carta Comercial",
    section: "1. Comunicación Escrita",
    content: `# 📄 Partes de una Carta Comercial

## 1️⃣ ENCABEZADO

- **Membrete**: Logo, denominación social, dirección, CIF
- **Fecha y lugar**: Madrid, 15 de enero de 2024
- **Datos destinatario**: Nombre, cargo, dirección

## 2️⃣ CUERPO

- **Referencia/Asunto**: Breve descripción del tema
- **Saludo**: "Estimado/a Sr./Sra. [Apellido]:"
- **Introducción**: Motivo de la carta
- **Desarrollo**: Información detallada
- **Cierre**: Conclusión, petición

## 3️⃣ PIE

- **Despedida**: "Atentamente," / "Reciba un cordial saludo,"
- **Firma**: Manuscrita o digital
- **Nombre y cargo** del firmante
- **Anexos**: Indicación de documentos adjuntos`,
    keyTerms: ["Membrete", "Saludo", "Despedida"]
  },
  {
    id: "uf0518-05",
    type: "quiz",
    title: "📝 Autoevaluación: Cartas Comerciales",
    section: "1. Comunicación Escrita",
    content: "Comprueba tus conocimientos sobre las cartas comerciales.",
    quiz: {
      id: "quiz-uf0518-01",
      question: "¿Qué tipo de carta comercial se utiliza para protestar por un incumplimiento de contrato?",
      options: [
        { id: "a", text: "Carta de pedido", isCorrect: false },
        { id: "b", text: "Carta de reclamación", isCorrect: true },
        { id: "c", text: "Carta de cobro", isCorrect: false },
        { id: "d", text: "Carta de presentación", isCorrect: false }
      ],
      explanation: "La carta de RECLAMACIÓN se utiliza para protestar por incumplimientos, errores o problemas con productos/servicios. La carta de cobro es específica para pagos pendientes.",
      hint: "Piensa en qué harías si recibes un producto defectuoso."
    }
  },
  {
    id: "uf0518-06",
    type: "table",
    title: "2.1 Recepción de Correspondencia",
    section: "2. Gestión de la Recepción",
    content: `# 📬 Proceso de Recepción de Correspondencia`,
    tableData: {
      headers: ["Paso", "Acción", "Responsable"],
      rows: [
        ["1", "Recoger correspondencia del cartero/mensajería", "Auxiliar"],
        ["2", "Verificar que la dirección corresponde a la empresa", "Auxiliar"],
        ["3", "Abrir correspondencia (excepto personal/confidencial)", "Auxiliar"],
        ["4", "Fechar con sello de entrada", "Auxiliar"],
        ["5", "Registrar en Libro de Entrada", "Auxiliar"],
        ["6", "Clasificar por departamentos", "Auxiliar"],
        ["7", "Distribuir antes de las 10:00", "Auxiliar"],
        ["8", "Archivar copia de correspondencia importante", "Auxiliar"]
      ]
    },
    keyTerms: ["Recepción", "Registro", "Clasificación"]
  },
  {
    id: "uf0518-07",
    type: "content",
    title: "2.2 Clasificación de Correspondencia",
    section: "2. Gestión de la Recepción",
    content: `# 📊 Criterios de Clasificación

## 📦 Por Tipo de Envío

- ✉️ Cartas ordinarias
- 📮 Cartas certificadas
- 📋 Burofax y notificaciones
- 📦 Paquetes y mercancías
- 📰 Publicidad y propaganda

## 👤 Por Destinatario

| Tipo | Tratamiento |
|------|-------------|
| **Institucional** | Dirigida a la empresa, se abre |
| **Departamental** | Se entrega al departamento |
| **Personal** | NO se abre, entrega directa |
| **Confidencial** | Entrega en mano al destinatario |

## ⚡ Por Urgencia

- 🔴 **Urgente**: Tratamiento inmediato
- 🟡 **Normal**: Proceso ordinario
- 🟢 **Sin urgencia**: Puede esperar`,
    keyTerms: ["Clasificación", "Urgente", "Confidencial"]
  },
  {
    id: "uf0518-08",
    type: "table",
    title: "3.1 Medios de Envío",
    section: "3. Envío de Correspondencia",
    content: `# 🚚 Medios para el Envío de Correspondencia`,
    tableData: {
      headers: ["Medio", "Ventajas", "Inconvenientes", "Uso Típico"],
      rows: [
        ["📮 Correos (ordinario)", "Económico, cobertura total", "Lento, sin seguimiento", "Envíos no urgentes"],
        ["📬 Correo certificado", "Acuse de recibo, seguimiento", "Más caro", "Documentos importantes"],
        ["📋 Burofax", "Valor legal, urgente", "Costoso", "Requerimientos legales"],
        ["🚛 Mensajería privada", "Rapidez, seguimiento", "Coste variable", "Urgente, paquetería"],
        ["📧 Correo electrónico", "Instantáneo, gratuito", "Sin valor legal directo", "Comunicación diaria"],
        ["📠 Fax", "Inmediato, copia", "En desuso", "Algunos trámites oficiales"]
      ]
    },
    keyTerms: ["Correos", "Burofax", "Mensajería"]
  },
  {
    id: "uf0518-09",
    type: "quiz",
    title: "📝 Autoevaluación: Medios de Envío",
    section: "3. Envío de Correspondencia",
    content: "Evalúa tu conocimiento sobre los medios de envío.",
    quiz: {
      id: "quiz-uf0518-02",
      question: "¿Qué medio de envío tiene valor legal probatorio y se utiliza para requerimientos oficiales?",
      options: [
        { id: "a", text: "Correo ordinario", isCorrect: false },
        { id: "b", text: "Correo electrónico", isCorrect: false },
        { id: "c", text: "Burofax", isCorrect: true },
        { id: "d", text: "Mensajería privada", isCorrect: false }
      ],
      explanation: "El BUROFAX tiene valor legal probatorio y se utiliza para comunicaciones que requieren constancia fehaciente como despidos, requerimientos de pago o resolución de contratos.",
      hint: "Es el más caro pero tiene validez en un juicio."
    }
  },
  {
    id: "uf0518-10",
    type: "checklist",
    title: "3.2 Preparación de Envíos",
    section: "3. Envío de Correspondencia",
    content: `# ✅ Lista de Verificación para Preparar Envíos

Comprueba que cumples todos los pasos:`,
    checklistItems: [
      { id: "e1", text: "Verificar que el documento está completo y firmado", checked: false },
      { id: "e2", text: "Comprobar la dirección del destinatario", checked: false },
      { id: "e3", text: "Incluir remite (datos del remitente)", checked: false },
      { id: "e4", text: "Seleccionar el tipo de envío adecuado", checked: false },
      { id: "e5", text: "Franquear correctamente (sellos/etiquetas)", checked: false },
      { id: "e6", text: "Registrar en el Libro de Salida", checked: false },
      { id: "e7", text: "Guardar copia del documento enviado", checked: false },
      { id: "e8", text: "Anotar acuse de recibo cuando se reciba", checked: false }
    ]
  },
  {
    id: "uf0518-11",
    type: "content",
    title: "4.1 Normativa de Confidencialidad",
    section: "4. Seguridad y Confidencialidad",
    content: `# 🔒 Protección de Datos en la Correspondencia

## ⚖️ Marco Legal

- **LOPD-GDD** (Ley Orgánica 3/2018): Protección de datos personales
- **RGPD** (Reglamento UE 2016/679): Normativa europea
- **Código Penal**: Delitos de revelación de secretos

## 🛡️ Principios de Protección

| Principio | Descripción |
|-----------|-------------|
| **Confidencialidad** | Solo acceden personas autorizadas |
| **Integridad** | Los datos no se alteran |
| **Disponibilidad** | Accesibles cuando se necesitan |
| **Proporcionalidad** | Solo datos necesarios |

## ⚠️ Obligaciones del Empleado

1. No revelar información confidencial
2. No copiar documentos sin autorización
3. Destruir documentos de forma segura
4. Informar de brechas de seguridad
5. Respetar el secreto profesional`,
    keyTerms: ["LOPD", "RGPD", "Confidencialidad"]
  },
  {
    id: "uf0518-12",
    type: "content",
    title: "5.1 El Archivo de Correspondencia",
    section: "5. Archivo y Conservación",
    content: `# 🗄️ Sistemas de Archivo

## 📁 Métodos de Clasificación

| Sistema | Descripción | Uso |
|---------|-------------|-----|
| **Alfabético** | Por nombre/razón social | Clientes, proveedores |
| **Numérico** | Por número asignado | Expedientes, facturas |
| **Cronológico** | Por fecha | Correspondencia diaria |
| **Geográfico** | Por zona/localidad | Comercial por territorios |
| **Por materias** | Por tema/asunto | Documentación técnica |

## ⏰ Plazos de Conservación

| Tipo de Documento | Plazo Mínimo |
|-------------------|--------------|
| Documentos contables | 6 años |
| Documentos fiscales | 4 años |
| Documentos laborales | 4 años |
| Correspondencia comercial | 6 años |
| Documentos con garantías | Hasta fin de garantía + 1 año |`,
    keyTerms: ["Archivo", "Clasificación", "Conservación"]
  },
  {
    id: "uf0518-13",
    type: "summary",
    title: "📚 Resumen UF0518",
    section: "Resumen Final",
    content: `# ✅ Resumen de la Unidad Formativa UF0518

## 🎯 Conceptos Clave Aprendidos

✅ **Comunicación escrita**: Funciones informativa, directiva, persuasiva, coordinación y testimonial

✅ **Cartas comerciales**: Estructura (membrete, cuerpo, pie) y tipos (pedido, reclamación, cobro...)

✅ **Recepción de correspondencia**: Proceso de 8 pasos desde recogida hasta archivo

✅ **Clasificación**: Por tipo de envío, destinatario y urgencia

✅ **Medios de envío**: Correos, certificado, burofax, mensajería, email

✅ **Normativa**: LOPD-GDD, RGPD, confidencialidad

✅ **Archivo**: Sistemas alfabético, numérico, cronológico; plazos de conservación

> **🎉 ¡Enhorabuena!** Has completado la Unidad Formativa UF0518.`
  }
];

// UF0519 - 20+ slides on administrative documentation
const generateUF0519Slides = (): ContentSlide[] => [
  {
    id: "uf0519-01",
    type: "intro",
    title: "UF0519 - Introducción",
    section: "1. Introducción",
    content: `# 📋 Gestión Auxiliar de Documentación Económico-Administrativa

Bienvenido a esta **Unidad Formativa** sobre documentos administrativos y gestión económica básica.

## 🎯 Objetivos de Aprendizaje

- Conocer los documentos administrativos esenciales
- Dominar la documentación de compraventa (pedido, albarán, factura)
- Comprender la gestión de tesorería y cobros/pagos
- Manejar la documentación de personal (nóminas)

> **⏱️ Duración estimada:** 30 horas de formación`,
    keyTerms: ["Documentación", "Compraventa", "Tesorería"]
  },
  {
    id: "uf0519-02",
    type: "table",
    title: "1.1 Elementos del Documento Administrativo",
    section: "1. Documentos Administrativos",
    content: `# 📄 Estructura de los Documentos Administrativos`,
    tableData: {
      headers: ["Elemento", "Descripción", "Ejemplos"],
      rows: [
        ["📌 Membrete", "Identificación del emisor", "Logo, nombre, CIF, dirección"],
        ["📅 Fecha", "Momento de emisión", "Día, mes, año"],
        ["👤 Destinatario", "A quién va dirigido", "Nombre, cargo, dirección"],
        ["📝 Cuerpo", "Contenido principal", "Texto, datos, información"],
        ["✍️ Firma", "Validación del documento", "Firma manual o digital"],
        ["🔢 Registro", "Identificación única", "Número de referencia"]
      ]
    },
    keyTerms: ["Membrete", "Registro", "Firma"]
  },
  {
    id: "uf0519-03",
    type: "content",
    title: "2.1 El Pedido",
    section: "2. Documentos de Compraventa",
    content: `# 📦 El Pedido

El **pedido** es el documento mediante el cual el comprador solicita al vendedor el suministro de determinados bienes o servicios.

## 📋 Elementos del Pedido

| Elemento | Descripción |
|----------|-------------|
| **Datos comprador** | Nombre, dirección, CIF, contacto |
| **Datos vendedor** | Nombre, dirección, CIF |
| **Nº de pedido** | Referencia única |
| **Fecha** | Fecha de emisión |
| **Productos/servicios** | Descripción detallada |
| **Cantidades** | Unidades de cada producto |
| **Condiciones entrega** | Lugar, fecha, forma |
| **Condiciones pago** | Forma y plazo acordados |

## 📝 Tipos de Pedidos

1. **Verbal**: Por teléfono o en persona
2. **Escrito**: Mediante carta o formulario
3. **Electrónico**: Email o plataforma online
4. **Programado**: Entregas periódicas acordadas
5. **Urgente**: Necesidad de entrega inmediata`,
    keyTerms: ["Pedido", "Comprador", "Condiciones"]
  },
  {
    id: "uf0519-04",
    type: "content",
    title: "2.2 El Albarán",
    section: "2. Documentos de Compraventa",
    content: `# 📋 El Albarán o Nota de Entrega

El **albarán** acompaña a la mercancía y justifica la recepción de los bienes.

## 📊 Elementos del Albarán

| Elemento | Descripción |
|----------|-------------|
| **Datos vendedor** | Identificación completa |
| **Datos comprador** | Identificación y dirección entrega |
| **Nº de albarán** | Referencia única |
| **Fecha entrega** | Día de entrega efectiva |
| **Ref. pedido** | Número del pedido correspondiente |
| **Productos** | Detalle de bienes entregados |
| **Cantidades** | Unidades entregadas |
| **Firma receptor** | Conformidad de recepción |

## 🎯 Funciones del Albarán

1. **Control**: Verificar que se entrega lo pedido
2. **Probatoria**: Acreditar la entrega
3. **Contable**: Base para la facturación
4. **Reclamación**: Documento para incidencias`,
    keyTerms: ["Albarán", "Nota de entrega", "Conformidad"]
  },
  {
    id: "uf0519-05",
    type: "table",
    title: "2.3 La Factura - Elementos",
    section: "2. Documentos de Compraventa",
    content: `# 🧾 Elementos Obligatorios de la Factura`,
    tableData: {
      headers: ["Elemento", "Descripción", "Obligatorio"],
      rows: [
        ["🔢 Número de factura", "Numeración correlativa", "Sí"],
        ["📅 Fecha de emisión", "Fecha de expedición", "Sí"],
        ["🏢 Datos emisor", "Nombre, NIF, dirección", "Sí"],
        ["👤 Datos destinatario", "Nombre, NIF, dirección", "Sí"],
        ["📝 Descripción", "Detalle de bienes/servicios", "Sí"],
        ["💶 Base imponible", "Importe antes de impuestos", "Sí"],
        ["📊 Tipo IVA", "Porcentaje aplicable (4%, 10%, 21%)", "Sí"],
        ["💰 Cuota IVA", "Importe del impuesto", "Sí"],
        ["💵 Importe total", "Cantidad total a pagar", "Sí"]
      ]
    },
    keyTerms: ["Factura", "Base imponible", "IVA"]
  },
  {
    id: "uf0519-06",
    type: "table",
    title: "2.4 Tipos de Facturas",
    section: "2. Documentos de Compraventa",
    content: `# 📑 Clasificación de Facturas`,
    tableData: {
      headers: ["Tipo", "Descripción", "Uso"],
      rows: [
        ["📄 Ordinaria", "Documento completo estándar", "Operaciones habituales"],
        ["🧾 Simplificada (ticket)", "Menos requisitos formales", "Operaciones < 400€"],
        ["🔧 Rectificativa", "Corrige errores de otra factura", "Errores, devoluciones"],
        ["📋 Recapitulativa", "Agrupa varias operaciones", "Operaciones frecuentes"],
        ["📝 Proforma", "Documento previo sin validez fiscal", "Presupuestos, aduanas"],
        ["💻 Electrónica", "Formato digital con firma", "Empresas digitalizadas"]
      ]
    },
    keyTerms: ["Factura ordinaria", "Factura rectificativa", "Factura electrónica"]
  },
  {
    id: "uf0519-07",
    type: "quiz",
    title: "📝 Autoevaluación: Documentos Compraventa",
    section: "2. Documentos de Compraventa",
    content: "Evalúa tu conocimiento sobre los documentos de compraventa.",
    quiz: {
      id: "quiz-uf0519-01",
      question: "¿Qué documento acompaña a la mercancía y justifica su recepción por el comprador?",
      options: [
        { id: "a", text: "El pedido", isCorrect: false },
        { id: "b", text: "La factura", isCorrect: false },
        { id: "c", text: "El albarán", isCorrect: true },
        { id: "d", text: "El recibo", isCorrect: false }
      ],
      explanation: "El ALBARÁN (o nota de entrega) acompaña a la mercancía y acredita su recepción. La factura se emite después para el cobro, y el recibo acredita el pago.",
      hint: "Es el documento que el transportista te hace firmar."
    }
  },
  {
    id: "uf0519-08",
    type: "content",
    title: "3.1 La Nómina - Estructura",
    section: "3. Documentos de Personal",
    content: `# 💼 La Nómina

La **nómina** refleja la retribución del trabajador, incluyendo todos los conceptos salariales y deducciones.

## 📊 Estructura de la Nómina

### 1️⃣ ENCABEZAMIENTO
- Datos de la empresa (nombre, CIF, domicilio)
- Datos del trabajador (nombre, NIF, categoría, antigüedad)
- Período de liquidación

### 2️⃣ DEVENGOS (Ingresos)
- **Salario base**: Retribución fija
- **Complementos**: Antigüedad, nocturnidad, peligrosidad
- **Horas extraordinarias**: Retribución adicional
- **Pagas extras**: Gratificaciones extraordinarias

### 3️⃣ DEDUCCIONES
- **Seguridad Social** (6,35% aprox.)
- **IRPF** (variable según salario)
- **Anticipos** recibidos
- Otras deducciones

### 4️⃣ LÍQUIDO A PERCIBIR
\`\`\`
LÍQUIDO = Total Devengos - Total Deducciones
\`\`\``,
    keyTerms: ["Nómina", "Devengos", "Deducciones", "IRPF"]
  },
  {
    id: "uf0519-09",
    type: "table",
    title: "3.2 Conceptos de la Nómina",
    section: "3. Documentos de Personal",
    content: `# 💰 Detalle de Conceptos Salariales`,
    tableData: {
      headers: ["Concepto", "Tipo", "Descripción"],
      rows: [
        ["💵 Salario base", "Devengo", "Retribución fija por tiempo trabajado"],
        ["📅 Antigüedad", "Devengo", "Complemento por años en la empresa"],
        ["🌙 Nocturnidad", "Devengo", "Trabajo en horario nocturno"],
        ["⚠️ Peligrosidad", "Devengo", "Trabajos de riesgo"],
        ["⏰ Horas extras", "Devengo", "Horas adicionales a la jornada"],
        ["🏥 Seguridad Social", "Deducción", "Cotización obligatoria (~6,35%)"],
        ["📊 IRPF", "Deducción", "Retención a cuenta del impuesto"],
        ["💳 Anticipos", "Deducción", "Cantidades ya adelantadas"]
      ]
    },
    keyTerms: ["Salario base", "Complementos", "Cotización"]
  },
  {
    id: "uf0519-10",
    type: "quiz",
    title: "📝 Autoevaluación: La Nómina",
    section: "3. Documentos de Personal",
    content: "Comprueba tus conocimientos sobre la nómina.",
    quiz: {
      id: "quiz-uf0519-02",
      question: "¿Qué porcentaje aproximado de cotización a la Seguridad Social se deduce al trabajador?",
      options: [
        { id: "a", text: "3%", isCorrect: false },
        { id: "b", text: "6,35%", isCorrect: true },
        { id: "c", text: "12%", isCorrect: false },
        { id: "d", text: "21%", isCorrect: false }
      ],
      explanation: "La cotización a la Seguridad Social que se deduce al trabajador es aproximadamente del 6,35%. La empresa paga una cotización adicional de aproximadamente el 30%.",
      hint: "Es un porcentaje bajo que se descuenta de tu salario bruto."
    }
  },
  {
    id: "uf0519-11",
    type: "content",
    title: "4.1 La Tesorería",
    section: "4. Gestión de Tesorería",
    content: `# 💰 Gestión de Tesorería

La **tesorería** es el área encargada de gestionar los flujos de dinero de la empresa: cobros y pagos.

## 📊 Funciones de Tesorería

| Función | Descripción |
|---------|-------------|
| 💵 **Gestión de cobros** | Seguimiento de facturas por cobrar |
| 💳 **Gestión de pagos** | Programación de pagos a proveedores |
| 🏦 **Relación bancaria** | Operaciones con entidades financieras |
| 📈 **Previsiones** | Planificación de flujos de caja |
| 📋 **Conciliación** | Verificación de movimientos |

## ⚖️ Principio de Equilibrio

> **Objetivo**: Mantener liquidez suficiente para atender pagos sin mantener excesos improductivos.

- **Déficit de tesorería** → Necesidad de financiación
- **Exceso de tesorería** → Oportunidad de inversión`,
    keyTerms: ["Tesorería", "Liquidez", "Flujo de caja"]
  },
  {
    id: "uf0519-12",
    type: "table",
    title: "4.2 Medios de Pago",
    section: "4. Gestión de Tesorería",
    content: `# 💳 Medios de Pago Empresariales`,
    tableData: {
      headers: ["Medio", "Descripción", "Ventajas", "Riesgos"],
      rows: [
        ["💵 Efectivo", "Pago en moneda", "Inmediato, sin comisiones", "Riesgo robo, sin rastro"],
        ["🏦 Transferencia", "Orden bancaria de pago", "Seguro, con rastro", "Comisiones posibles"],
        ["📝 Cheque", "Documento de pago", "Diferido, negociable", "Puede no tener fondos"],
        ["💳 Tarjeta", "Pago con TPV", "Cómodo, instantáneo", "Comisiones comercio"],
        ["📋 Pagaré", "Promesa de pago futuro", "Aplaza el pago", "Riesgo impago"],
        ["🔄 Domiciliación", "Cargo automático en cuenta", "Automatizado", "Requiere autorización"]
      ]
    },
    keyTerms: ["Transferencia", "Cheque", "Pagaré", "Domiciliación"]
  },
  {
    id: "uf0519-13",
    type: "content",
    title: "4.3 El Libro de Caja",
    section: "4. Gestión de Tesorería",
    content: `# 📒 El Libro de Caja

El **Libro de Caja** registra todos los movimientos de dinero en efectivo de la empresa.

## 📊 Estructura del Libro de Caja

| Fecha | Concepto | Entrada | Salida | Saldo |
|-------|----------|---------|--------|-------|
| 01/01 | Saldo inicial | - | - | 500,00 € |
| 02/01 | Cobro cliente | 150,00 € | - | 650,00 € |
| 03/01 | Compra material | - | 45,00 € | 605,00 € |
| 05/01 | Pago mensajería | - | 12,50 € | 592,50 € |

## ✅ Buenas Prácticas

1. **Registrar inmediatamente** cada movimiento
2. **Guardar justificantes** de todos los movimientos
3. **Arqueo diario**: contar efectivo y comparar con saldo
4. **Investigar diferencias** si el arqueo no cuadra
5. **Firma del responsable** en cada hoja`,
    keyTerms: ["Libro de caja", "Arqueo", "Saldo"]
  },
  {
    id: "uf0519-14",
    type: "checklist",
    title: "4.4 Proceso de Conciliación Bancaria",
    section: "4. Gestión de Tesorería",
    content: `# 🏦 Pasos para Conciliar con el Banco

Verifica que sigues todos los pasos:`,
    checklistItems: [
      { id: "b1", text: "Obtener extracto bancario del período", checked: false },
      { id: "b2", text: "Obtener libro de banco de la empresa", checked: false },
      { id: "b3", text: "Comparar saldos iniciales", checked: false },
      { id: "b4", text: "Puntear movimientos que coinciden", checked: false },
      { id: "b5", text: "Identificar partidas pendientes (en tránsito)", checked: false },
      { id: "b6", text: "Identificar errores o movimientos no registrados", checked: false },
      { id: "b7", text: "Cuadrar diferencias con partidas pendientes", checked: false },
      { id: "b8", text: "Documentar y archivar la conciliación", checked: false }
    ]
  },
  {
    id: "uf0519-15",
    type: "content",
    title: "5.1 Gestión de Existencias",
    section: "5. Control de Existencias",
    content: `# 📦 Control de Inventarios

Las **existencias** son los bienes que la empresa almacena para su venta o utilización en el proceso productivo.

## 📊 Tipos de Existencias

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Mercaderías** | Bienes para reventa sin transformar | Productos en tienda |
| **Materias primas** | Para transformar en producción | Acero, madera, tela |
| **Productos en curso** | Fabricación no terminada | Coches a medio montar |
| **Productos terminados** | Listos para la venta | Muebles acabados |
| **Envases y embalajes** | Para contener productos | Cajas, botellas |
| **Material de oficina** | Consumibles administrativos | Papel, bolígrafos |

## 📈 Valoración de Existencias

Métodos permitidos por la normativa contable:

- **PMP (Precio Medio Ponderado)**: Media de precios de compra
- **FIFO (First In, First Out)**: Sale lo primero que entró`,
    keyTerms: ["Existencias", "Inventario", "PMP", "FIFO"]
  },
  {
    id: "uf0519-16",
    type: "table",
    title: "5.2 Documentos de Control de Stock",
    section: "5. Control de Existencias",
    content: `# 📋 Documentos para el Control de Existencias`,
    tableData: {
      headers: ["Documento", "Función", "Información"],
      rows: [
        ["📥 Entrada de almacén", "Registrar recepción de mercancías", "Fecha, proveedor, productos, cantidades"],
        ["📤 Salida de almacén", "Registrar entrega de materiales", "Fecha, destino, productos, cantidades"],
        ["📋 Ficha de almacén", "Control individual por producto", "Entradas, salidas, stock actual"],
        ["📊 Inventario", "Recuento físico de existencias", "Listado completo valorado"],
        ["📉 Parte de mermas", "Registrar pérdidas o deterioros", "Causa, cantidad, valor perdido"]
      ]
    },
    keyTerms: ["Entrada de almacén", "Ficha de almacén", "Inventario"]
  },
  {
    id: "uf0519-17",
    type: "quiz",
    title: "📝 Autoevaluación: Existencias",
    section: "5. Control de Existencias",
    content: "Evalúa tu conocimiento sobre el control de existencias.",
    quiz: {
      id: "quiz-uf0519-03",
      question: "¿Qué método de valoración de existencias asume que sale primero lo que primero entró?",
      options: [
        { id: "a", text: "PMP (Precio Medio Ponderado)", isCorrect: false },
        { id: "b", text: "FIFO (First In, First Out)", isCorrect: true },
        { id: "c", text: "LIFO (Last In, First Out)", isCorrect: false },
        { id: "d", text: "Precio de reposición", isCorrect: false }
      ],
      explanation: "FIFO (First In, First Out) significa 'primero en entrar, primero en salir'. Es uno de los métodos permitidos junto con el PMP. El LIFO no está permitido en España.",
      hint: "Piensa en una cola de supermercado: el primero que llega es el primero en ser atendido."
    }
  },
  {
    id: "uf0519-18",
    type: "summary",
    title: "📚 Resumen UF0519",
    section: "Resumen Final",
    content: `# ✅ Resumen de la Unidad Formativa UF0519

## 🎯 Conceptos Clave Aprendidos

✅ **Documentos administrativos**: Estructura (membrete, fecha, cuerpo, firma, registro)

✅ **Ciclo de compraventa**:
- **Pedido** → **Albarán** → **Factura** → **Recibo/Pago**

✅ **Tipos de factura**: Ordinaria, simplificada, rectificativa, recapitulativa, proforma, electrónica

✅ **La nómina**: Devengos (salario, complementos) - Deducciones (SS, IRPF) = Líquido

✅ **Tesorería**: Gestión de cobros, pagos, libro de caja, conciliación bancaria

✅ **Medios de pago**: Efectivo, transferencia, cheque, tarjeta, pagaré, domiciliación

✅ **Control de existencias**: Tipos, documentos (entradas, salidas, fichas), valoración (PMP, FIFO)

> **🎉 ¡Enhorabuena!** Has completado la Unidad Formativa UF0519.`
  }
];

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
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  // Editor state
  const [syllabusEditorOpen, setSyllabusEditorOpen] = useState(false);
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin';
  
  const [slides, setSlides] = useState<ContentSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(CONTENT_THEMES[6]); // Default: iSpring Teal
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '¡Hola soy Hugo! 👋 ¿En qué puedo ayudarte con el temario?' }
  ]);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  
  // Checklist state
  const [checklistState, setChecklistState] = useState<Record<string, Record<string, boolean>>>({});

  // Load slides from database
  useEffect(() => {
    const loadSlidesFromDatabase = async () => {
      if (!open || !unitId) {
        console.log("[ScormProfessionalViewer] Skipping load - open:", open, "unitId:", unitId);
        return;
      }
      
      console.log("[ScormProfessionalViewer] Loading slides for unitId:", unitId);
      setLoadingSlides(true);
      try {
        const { data, error } = await supabase
          .from("unit_syllabus_slides")
          .select("*")
          .eq("formative_unit_id", unitId)
          .eq("is_active", true)
          .order("order_index");

        console.log("[ScormProfessionalViewer] Query result - data:", data?.length, "error:", error);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform database slides to ContentSlide format
          const dbSlides: ContentSlide[] = data.map((item: any) => ({
            id: item.id,
            type: item.slide_type as ContentSlide['type'],
            title: item.title || '',
            content: item.content || '',
            keyTerms: item.key_terms || [],
            section: item.section_title || undefined,
            tableData: item.table_data as { headers: string[]; rows: string[][] } | undefined,
            checklistItems: item.checklist_items as { id: string; text: string }[] | undefined,
            quiz: item.quiz_data ? {
              id: `quiz-${item.id}`,
              question: (item.quiz_data as any).question || '',
              options: (item.quiz_data as any).options || [],
              explanation: (item.quiz_data as any).explanation || '',
              hint: (item.quiz_data as any).hint
            } : undefined
          }));
          setSlides(dbSlides);
        } else {
          // Fallback to generated content if no database slides exist
          setSlides(generateComprehensiveSlides(unitTitle));
        }
      } catch (error) {
        console.error("Error loading slides from database:", error);
        // Fallback to generated content on error
        setSlides(generateComprehensiveSlides(unitTitle));
      } finally {
        setLoadingSlides(false);
      }
    };

    loadSlidesFromDatabase();
  }, [open, unitId, unitTitle]);

  const currentSlide = slides[currentSlideIndex];
  const progress = slides.length > 0 ? ((completedSlides.size + 1) / slides.length) * 100 : 0;
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
      if (!user || !enrollmentId || slides.length === 0) return;
      
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
      title: isCorrect ? "✅ ¡Correcto!" : "❌ Respuesta incorrecta",
      description: isCorrect ? "¡Excelente trabajo! Sigue así." : "Lee la explicación para entender mejor.",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const handleChecklistToggle = (slideId: string, itemId: string) => {
    setChecklistState(prev => ({
      ...prev,
      [slideId]: {
        ...prev[slideId],
        [itemId]: !prev[slideId]?.[itemId]
      }
    }));
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatMessage }]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Gracias por tu pregunta. Estoy aquí para ayudarte con cualquier duda sobre el contenido del curso. ¿Hay algún concepto específico que te gustaría que te explicara?' 
      }]);
    }, 1000);
  };

  const goToSlide = (slideId: string) => {
    const index = slides.findIndex(s => s.id === slideId);
    if (index !== -1) {
      setCurrentSlideIndex(index);
      setActiveTab('content');
    }
  };

  if (!open) return null;

  if (loadingSlides) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando contenido interactivo...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (slides.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin contenido disponible</h3>
            <p className="text-muted-foreground text-sm">
              Esta unidad aún no tiene contenido interactivo. Un administrador puede añadirlo desde el editor de temario.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Top header bar with theme */}
        <div className={`${selectedTheme.headerBg} text-white`}>
          {/* Unit title bar with theme selector */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{unitTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Edit button for admins/teachers */}
              {isTeacherOrAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 bg-white/20 hover:bg-white/30 text-white border-white/30 border"
                  onClick={() => setSyllabusEditorOpen(true)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              <Palette className="h-4 w-4" />
              <Select 
                value={selectedTheme.id} 
                onValueChange={(value) => {
                  const theme = CONTENT_THEMES.find(t => t.id === value);
                  if (theme) setSelectedTheme(theme);
                }}
              >
                <SelectTrigger className="h-8 w-[180px] bg-white/20 border-white/30 text-white text-xs">
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_THEMES.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id} className="text-sm">
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

        {/* Main content area with theme */}
        <div className={`flex-1 flex overflow-hidden ${selectedTheme.contentBg} dark:from-slate-900 dark:to-slate-800`}>
          {/* Left Sidebar */}
          <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-r border-border flex flex-col`}>
            {/* Sidebar header with home icon */}
            <div className="p-4 border-b flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('content')}
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Home className="h-5 w-5" />
              </button>
              <span className="font-medium text-sm">Navegación</span>
            </div>

            {/* Menu items */}
            <div className="p-3 space-y-1">
              {SIDEBAR_MENU.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary font-medium' 
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
                  <span className="font-semibold text-sm">📑 Índice del Temario</span>
                  <Badge variant="secondary" className="text-xs">
                    {slides.length} páginas
                  </Badge>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {indexItems.map((section) => (
                    <div key={section.id} className="space-y-0.5">
                      <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-primary bg-primary/5 rounded">
                        <BookOpen className="h-3 w-3" />
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
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
                              isCurrent 
                                ? 'bg-primary text-primary-foreground font-medium' 
                                : isCompleted
                                  ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100'
                                  : 'hover:bg-muted/50'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                            )}
                            <span className="truncate text-left">{item.title}</span>
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
                {currentSlide?.type === 'quiz' ? (
                  <FileQuestion className="h-4 w-4" />
                ) : currentSlide?.type === 'checklist' ? (
                  <ClipboardList className="h-4 w-4" />
                ) : currentSlide?.type === 'table' ? (
                  <FileSpreadsheet className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{currentSlide?.section || 'Contenido'}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {currentSlide?.title || 'Contenido del Curso'}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Progress value={progress} className="flex-1 h-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
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
                    {/* QUIZ SLIDE */}
                    {currentSlide?.type === 'quiz' && currentSlide.quiz ? (
                      <Card className="border-2 border-primary/20">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileQuestion className="h-5 w-5 text-primary" />
                            📝 Pregunta de Autoevaluación
                          </CardTitle>
                          <CardDescription className="text-base font-medium text-foreground mt-2">
                            {currentSlide.quiz.question}
                          </CardDescription>
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
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                                  hasAnswered
                                    ? isCorrectOption
                                      ? 'bg-green-50 border-green-500 dark:bg-green-900/30'
                                      : isSelected
                                        ? 'bg-red-50 border-red-500 dark:bg-red-900/30'
                                        : 'opacity-50 border-muted'
                                    : 'hover:border-primary hover:bg-primary/5 border-muted hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    hasAnswered && isCorrectOption
                                      ? 'bg-green-500 text-white'
                                      : hasAnswered && isSelected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-muted'
                                  }`}>
                                    {option.id.toUpperCase()}
                                  </span>
                                  <span className="flex-1 text-base">{option.text}</span>
                                  {hasAnswered && isCorrectOption && (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {/* Hint button */}
                          {currentSlide.quiz.hint && !quizResults[currentSlide.id] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowHint(prev => ({ ...prev, [currentSlide.id]: !prev[currentSlide.id] }))}
                              className="mt-4"
                            >
                              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                              {showHint[currentSlide.id] ? 'Ocultar pista' : '💡 Ver pista'}
                            </Button>
                          )}

                          {showHint[currentSlide.id] && currentSlide.quiz.hint && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-sm border-2 border-yellow-300">
                              <span className="font-bold">💡 Pista:</span> {currentSlide.quiz.hint}
                            </div>
                          )}

                          {/* Explanation */}
                          {quizResults[currentSlide.id] !== undefined && (
                            <div className={`p-4 rounded-xl mt-4 ${
                              quizResults[currentSlide.id]
                                ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-300'
                                : 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300'
                            }`}>
                              <p className="font-bold mb-2 text-base">
                                {quizResults[currentSlide.id] ? '✅ ¡Correcto!' : '📖 Explicación:'}
                              </p>
                              <p className="text-sm">{currentSlide.quiz.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : currentSlide?.type === 'table' && currentSlide.tableData ? (
                      /* TABLE SLIDE */
                      <div className="space-y-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentSlide.content}
                          </ReactMarkdown>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                            <thead>
                              <tr className="bg-primary text-primary-foreground">
                                {currentSlide.tableData.headers.map((header, idx) => (
                                  <th key={idx} className="px-4 py-3 text-left font-bold text-sm border-b border-primary-foreground/20">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentSlide.tableData.rows.map((row, rowIdx) => (
                                <tr 
                                  key={rowIdx} 
                                  className={`${rowIdx % 2 === 0 ? 'bg-muted/30' : 'bg-white dark:bg-slate-800'} hover:bg-primary/5 transition-colors`}
                                >
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-4 py-3 text-sm border-b border-muted">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {currentSlide.keyTerms && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="text-sm font-medium text-muted-foreground">Términos clave:</span>
                            {currentSlide.keyTerms.map((term, idx) => (
                              <Badge key={idx} variant="secondary">{term}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : currentSlide?.type === 'checklist' && currentSlide.checklistItems ? (
                      /* CHECKLIST SLIDE */
                      <Card className="border-2 border-primary/20">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                          <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Lista de Verificación
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {currentSlide.content}
                            </ReactMarkdown>
                          </div>
                          <div className="space-y-3">
                            {currentSlide.checklistItems.map((item) => {
                              const isChecked = checklistState[currentSlide.id]?.[item.id] || false;
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                    isChecked 
                                      ? 'bg-green-50 border-green-300 dark:bg-green-900/30' 
                                      : 'bg-muted/30 border-muted hover:border-primary'
                                  }`}
                                  onClick={() => handleChecklistToggle(currentSlide.id, item.id)}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => handleChecklistToggle(currentSlide.id, item.id)}
                                    className="h-5 w-5"
                                  />
                                  <span className={`flex-1 ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.text}
                                  </span>
                                  {isChecked && <Check className="h-5 w-5 text-green-500" />}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              ✅ Completados: {Object.values(checklistState[currentSlide?.id] || {}).filter(Boolean).length} / {currentSlide.checklistItems.length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : currentSlide?.type === 'intro' ? (
                      /* INTRO/COVER SLIDE - iSpring/Canva Style */
                      <div className="relative min-h-[500px] rounded-2xl overflow-hidden bg-white">
                        {/* Main layout - split design */}
                        <div className="flex h-full">
                          {/* Left side - Decorative collage */}
                          <div className="w-1/2 relative">
                            {/* Diagonal grid of images and teal blocks */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="grid grid-cols-3 gap-2 transform rotate-12 scale-125 -translate-x-8 -translate-y-8">
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/80 rounded-xl overflow-hidden">
                                  <img 
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300" 
                                    alt="Team collaboration" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/70 rounded-xl overflow-hidden">
                                  <img 
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300" 
                                    alt="Office work" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/60 rounded-xl overflow-hidden">
                                  <img 
                                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300" 
                                    alt="Business meeting" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="h-32 bg-primary rounded-xl" />
                                <div className="h-32 bg-primary/50 rounded-xl" />
                                <div className="h-32 bg-primary rounded-xl" />
                              </div>
                            </div>
                          </div>

                          {/* Right side - Content */}
                          <div className="w-1/2 flex flex-col justify-between p-8 z-10">
                            {/* Center logo placeholder */}
                            <div className="flex justify-center">
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-primary">
                                  <Building2 className="h-8 w-8" />
                                  <span className="text-2xl font-bold">CENTRO DE FORMACIÓN</span>
                                </div>
                              </div>
                            </div>

                            {/* Title section */}
                            <div className="text-center space-y-4">
                              <h1 className="text-4xl font-black text-slate-800 leading-tight">
                                {currentSlide.title.replace(/^.*? - /, '').toUpperCase()}
                              </h1>
                              <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
                            </div>

                            {/* SEPE logo placeholder */}
                            <div className="flex justify-center">
                              <div className="flex items-center gap-4 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="text-xs text-slate-600">
                                  <span className="font-semibold">MINISTERIO DE TRABAJO</span>
                                  <br />
                                  <span>Y ECONOMÍA SOCIAL</span>
                                </div>
                                <div className="text-amber-600 font-bold text-lg">SEPE</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* REGULAR CONTENT SLIDE - iSpring/Canva Professional Style */
                      <div className="relative">
                        {/* Professional card with teal border */}
                        <div className="bg-white rounded-2xl border-4 border-primary shadow-xl overflow-hidden">
                          {/* Content area */}
                          <div className="p-8">
                            {/* Process headings with section letters (A, B, C...) */}
                            <div className="prose prose-lg max-w-none 
                              prose-headings:font-black prose-headings:text-slate-800
                              prose-h1:text-3xl prose-h1:mb-6
                              prose-h2:text-xl prose-h2:mb-4
                              prose-h3:text-lg prose-h3:font-bold prose-h3:text-slate-700
                              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
                              prose-ul:space-y-1
                              prose-li:text-primary prose-li:font-medium
                              prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                              prose-strong:text-slate-800
                              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                              prose-table:border-collapse
                              prose-td:border prose-td:border-slate-200 prose-td:p-3
                              prose-th:border prose-th:border-slate-200 prose-th:p-3 prose-th:bg-primary/10 prose-th:font-bold
                            ">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Custom list items with teal color
                                  li: ({ children }) => (
                                    <li className="text-primary font-medium">
                                      {children}
                                    </li>
                                  ),
                                  // Links in teal with colon styling
                                  a: ({ children, href }) => (
                                    <a href={href} className="text-primary font-semibold hover:underline">
                                      {children}
                                    </a>
                                  ),
                                  // Headers with proper styling
                                  h1: ({ children }) => (
                                    <h1 className="text-3xl font-black text-slate-800 mb-6">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <div className="flex items-start gap-3 mb-4">
                                      <div className="w-4 h-4 bg-primary rounded mt-1 flex-shrink-0" />
                                      <h2 className="text-xl font-black text-slate-800 m-0">
                                        {children}
                                      </h2>
                                    </div>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-lg font-bold text-slate-700 mb-3">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({ children }) => (
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                      {children}
                                    </p>
                                  ),
                                  // Styled blockquotes
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary bg-primary/5 py-3 px-4 rounded-r-lg my-4 not-italic">
                                      {children}
                                    </blockquote>
                                  ),
                                }}
                              >
                                {currentSlide?.content || ''}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>

                        {/* Key terms bar at bottom */}
                        {currentSlide?.keyTerms && currentSlide.keyTerms.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 px-2">
                            <span className="text-sm font-semibold text-slate-500">🔑 Términos clave:</span>
                            {currentSlide.keyTerms.map((term, idx) => (
                              <Badge 
                                key={idx} 
                                className="bg-primary/10 text-primary border border-primary/20 font-medium"
                              >
                                {term}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : activeTab === 'downloads' && manualInfo ? (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-transparent dark:from-pink-900/20">
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-pink-500" />
                        📥 Descargas Disponibles
                      </CardTitle>
                      <CardDescription>
                        Descarga los manuales oficiales del curso en formato PDF
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {manualInfo.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          download
                          className="flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-muted/50 hover:border-primary transition-all group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium group-hover:text-primary transition-colors">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Formato PDF - Descarga directa</p>
                          </div>
                          <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                ) : activeTab === 'progress' ? (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        📊 Tu Progreso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Contenido completado</span>
                          <span className="font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-4" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl text-center">
                          <p className="text-3xl font-bold text-green-600">{completedSlides.size}</p>
                          <p className="text-sm text-green-700 dark:text-green-400">Páginas completadas</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl text-center">
                          <p className="text-3xl font-bold text-orange-600">{slides.length - completedSlides.size}</p>
                          <p className="text-sm text-orange-700 dark:text-orange-400">Páginas restantes</p>
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-sm font-medium mb-2">📚 Tiempo estimado restante:</p>
                        <p className="text-2xl font-bold text-primary">
                          ~{Math.ceil((slides.length - completedSlides.size) * 3)} minutos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : activeTab === 'glossary' ? (
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-red-500" />
                        📖 Glosario de Términos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {[
                        { term: "Empresa", def: "Unidad económica de producción que combina factores productivos." },
                        { term: "PYME", def: "Pequeña y Mediana Empresa (menos de 250 trabajadores)." },
                        { term: "Organigrama", def: "Representación gráfica de la estructura organizativa." },
                        { term: "Factura", def: "Documento mercantil que refleja una operación de compraventa." },
                        { term: "Albarán", def: "Documento que acompaña a la mercancía y justifica su recepción." },
                        { term: "Nómina", def: "Documento que refleja la retribución del trabajador." },
                        { term: "IVA", def: "Impuesto sobre el Valor Añadido (4%, 10% o 21%)." },
                        { term: "IRPF", def: "Impuesto sobre la Renta de las Personas Físicas." },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <p className="font-bold text-primary">{item.term}</p>
                          <p className="text-sm text-muted-foreground">{item.def}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2">
                    <CardContent className="py-12 text-center">
                      <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Sección en desarrollo</p>
                      <p className="text-muted-foreground">
                        Esta funcionalidad estará disponible próximamente.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            {/* Bottom navigation - iSpring style with colored bar */}
            <div className="relative">
              {/* Colored progress bar at the very bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-primary to-purple-500" />
              
              <div className="bg-white dark:bg-slate-800 border-t px-6 py-4 pb-5 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentSlideIndex === 0}
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-3">
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
                    className="w-16 text-center font-bold border-2 border-primary/30 focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">de <strong className="text-primary">{slides.length}</strong></span>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Assistant Widget */}
          <div className={`${chatOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-l flex flex-col`}>
            {chatOpen && (
              <>
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Hugo 🤖</p>
                      <p className="text-xs text-muted-foreground">Tu asistente</p>
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
                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
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
                      placeholder="Escribe tu pregunta..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendChat} disabled={!chatMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chat toggle button */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-24 right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          )}
        </div>
      </DialogContent>
      
      {/* Syllabus Editor Modal */}
      <SyllabusEditor
        open={syllabusEditorOpen}
        onOpenChange={(isOpen) => {
          setSyllabusEditorOpen(isOpen);
          // Reload slides when editor closes
          if (!isOpen) {
            // Trigger a reload by setting loadingSlides
            setLoadingSlides(true);
          }
        }}
        unitId={unitId}
        unitTitle={unitTitle}
      />
    </Dialog>
  );
}
