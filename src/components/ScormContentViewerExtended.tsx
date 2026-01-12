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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, FileText, CheckCircle2, Loader2, ChevronLeft, ChevronRight,
  Printer, ZoomIn, ZoomOut, GraduationCap, Target, Lightbulb, HelpCircle,
  Play, CheckCheck, XCircle, ArrowRight, Sparkles, Brain, BookMarked,
  Award, Clock, BarChart3, Volume2, Presentation, FileQuestion, Layers,
  ChevronDown, Star, TrendingUp, ThumbsUp, ThumbsDown, RotateCcw, Video,
  Headphones, Network, Eye, MapPin, Shuffle, SquarePlay, Download, FileDown,
  Building2, Users, FileSpreadsheet, Briefcase, Mail, Package, Wallet,
  CreditCard, Receipt, Archive, Calculator, ClipboardList
} from "lucide-react";

interface ScormContentViewerExtendedProps {
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
  exerciseData?: ExerciseData;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
}

interface ExerciseData {
  type: 'match' | 'order' | 'fill';
  instructions: string;
  items: { left: string; right: string }[];
}

// =============================================================================
// COMPLETE CONTENT FROM ALL PDFs - 70+ SLIDES
// =============================================================================

const UF0517_CONTENT: ContentSlide[] = [
  // UD1 - La organización de entidades públicas y privadas (20 slides)
  {
    id: "uf0517-01",
    type: "intro",
    title: "UF0517 - Organización Empresarial y de Recursos Humanos",
    content: `# Bienvenido a la Unidad Formativa UF0517

Esta unidad formativa aborda la **organización empresarial y la gestión de recursos humanos**, proporcionando los conocimientos fundamentales sobre cómo se estructuran y funcionan las organizaciones.

## ¿Qué aprenderás?

- **Funciones de las empresas** y su clasificación
- **La función administrativa** y sus objetivos
- **Estructura organizativa** y departamentos
- **Los organigramas** y su interpretación
- **Trabajo en equipo** y coordinación
- **Organización de recursos humanos**

> **Duración estimada:** 30 horas
> **Nivel:** Básico-Intermedio`,
    keyTerms: ["Organización", "Empresa", "Recursos Humanos", "Estructura"]
  },
  {
    id: "uf0517-02",
    type: "content",
    title: "1.1 Introducción al Concepto de Empresa",
    content: `# ¿Qué es una Empresa?

La **empresa** es una unidad económica de producción que combina diferentes factores productivos (trabajo, capital, tecnología y materias primas) con el objetivo de producir bienes o prestar servicios destinados a satisfacer las necesidades del mercado, obteniendo un beneficio económico.

## Características Fundamentales de la Empresa

| Característica | Descripción |
|----------------|-------------|
| **Unidad económica** | Agrupa recursos humanos, materiales y financieros |
| **Unidad de decisión** | Existe un centro de decisión que planifica y controla |
| **Unidad financiera** | Dispone de un patrimonio propio |
| **Unidad técnica** | Aplica tecnología específica en sus procesos |

## Elementos de la Empresa

1. **Elementos materiales**: Edificios, maquinaria, materias primas
2. **Elementos humanos**: Trabajadores, directivos, empresarios
3. **Elementos financieros**: Capital, créditos, inversiones
4. **Elementos inmateriales**: Marca, patentes, know-how`,
    keyTerms: ["Empresa", "Unidad económica", "Factores productivos"]
  },
  {
    id: "uf0517-03",
    type: "content",
    title: "1.2 Clasificación de Empresas por Tamaño",
    content: `# Clasificación de Empresas según su Tamaño

Las empresas se clasifican según su número de trabajadores y facturación anual:

| Tipo | Nº Trabajadores | Facturación Anual |
|------|-----------------|-------------------|
| **Microempresa** | 1-9 | < 2 millones € |
| **Pequeña empresa** | 10-49 | < 10 millones € |
| **Mediana empresa** | 50-249 | < 50 millones € |
| **Gran empresa** | 250+ | > 50 millones € |

## Las PYMES en España

> **Dato importante:** Las PYMES (Pequeñas y Medianas Empresas) representan más del **99%** del tejido empresarial español y generan aproximadamente el **66%** del empleo privado.

### Ventajas de las PYMES:
- Mayor flexibilidad y adaptabilidad
- Cercanía al cliente
- Menor burocracia interna
- Toma de decisiones más ágil

### Desventajas de las PYMES:
- Menor capacidad financiera
- Dificultad para acceder a créditos
- Menor poder de negociación con proveedores`,
    keyTerms: ["PYME", "Microempresa", "Facturación", "Trabajadores"]
  },
  {
    id: "uf0517-04",
    type: "content",
    title: "1.3 Clasificación por Sector de Actividad",
    content: `# Los Sectores Económicos

## Sector Primario
Comprende las actividades económicas relacionadas con la **extracción de recursos naturales**:

- 🌾 Empresas agrícolas
- 🐄 Empresas ganaderas
- 🐟 Empresas pesqueras
- ⛏️ Minería y explotación forestal

## Sector Secundario
Incluye las actividades de **transformación de materias primas**:

- 🏭 Industria manufacturera
- 🏗️ Construcción
- ⚡ Producción de energía
- 🔧 Industria metalúrgica

## Sector Terciario (Servicios)
El sector más amplio, dedicado a la **prestación de servicios**:

- 🛒 Servicios comerciales
- 🚚 Transporte y comunicaciones
- 🏨 Turismo y hostelería
- 🏦 Servicios financieros
- 💼 Servicios profesionales

> **Tendencia:** En las economías desarrolladas, el sector terciario representa más del 70% del PIB.`,
    keyTerms: ["Sector primario", "Sector secundario", "Sector terciario", "PIB"]
  },
  {
    id: "uf0517-05",
    type: "content",
    title: "1.4 Clasificación por Titularidad del Capital",
    content: `# Tipos de Empresas según la Propiedad del Capital

## Empresas Públicas 🏛️
- El capital pertenece **total o mayoritariamente al Estado**
- Objetivo: servicio público, no necesariamente lucro
- Ejemplos: RENFE, Correos, RTVE

## Empresas Privadas 🏢
- Capital propiedad de **particulares**
- Objetivo principal: obtener beneficio económico
- Representan la mayoría del tejido empresarial

## Empresas Mixtas 🤝
- **Participación conjunta** de capital público y privado
- Reguladas por normativa específica
- Ejemplo: Autopistas de peaje con participación estatal

## Criterios de Decisión

| Aspecto | Empresa Pública | Empresa Privada |
|---------|-----------------|-----------------|
| Objetivo | Servicio público | Beneficio |
| Financiación | Presupuestos públicos | Capital privado |
| Control | Administración pública | Propietarios |
| Gestión | Puede ser más lenta | Más ágil |`,
    keyTerms: ["Empresa pública", "Empresa privada", "Empresa mixta", "Capital"]
  },
  {
    id: "uf0517-06",
    type: "content",
    title: "1.5 Formas Jurídicas: Empresario Individual",
    content: `# El Empresario Individual (Autónomo)

El **empresario individual** o autónomo es una persona física que realiza una actividad económica en nombre propio.

## Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Capital mínimo** | No requiere capital mínimo |
| **Responsabilidad** | **Ilimitada** con todo su patrimonio personal |
| **Tributación** | Por IRPF (Impuesto sobre la Renta) |
| **Trámites** | Constitución sencilla |
| **Nombre comercial** | Puede ser el nombre del empresario |

## ⚠️ Responsabilidad Ilimitada

> La responsabilidad ilimitada significa que el empresario responde de las deudas con **todos sus bienes presentes y futuros**, incluso los personales (vivienda, vehículos, ahorros...).

## Trámites de Alta como Autónomo

1. Alta en Hacienda (modelo 036/037)
2. Alta en la Seguridad Social (RETA)
3. Licencia de actividad (si procede)
4. Comunicación de apertura del centro de trabajo`,
    keyTerms: ["Autónomo", "Responsabilidad ilimitada", "IRPF", "RETA"]
  },
  {
    id: "uf0517-07",
    type: "content",
    title: "1.6 Sociedades Mercantiles",
    content: `# Principales Formas Societarias

## Sociedad de Responsabilidad Limitada (S.L.) 📋

| Característica | Valor |
|----------------|-------|
| Capital mínimo | **3.000 €** |
| División | Participaciones sociales |
| Responsabilidad | Limitada al capital aportado |
| Socios mínimos | 1 (S.L. Unipersonal) |
| Órgano de gobierno | Junta General + Administrador/es |

## Sociedad Anónima (S.A.) 📈

| Característica | Valor |
|----------------|-------|
| Capital mínimo | **60.000 €** |
| División | Acciones (transmisibles libremente) |
| Responsabilidad | Limitada al capital |
| Socios mínimos | 1 (S.A. Unipersonal) |
| Órgano máximo | Junta General de Accionistas |

## Cooperativa 🤝

| Característica | Valor |
|----------------|-------|
| Capital | Variable |
| Socios mínimos | 3 (primer grado) |
| Gestión | Democrática (un socio = un voto) |
| Objetivo | Beneficio de los socios |`,
    keyTerms: ["S.L.", "S.A.", "Cooperativa", "Capital mínimo"]
  },
  {
    id: "uf0517-08",
    type: "quiz",
    title: "Autoevaluación: Clasificación de Empresas",
    content: "Comprueba tus conocimientos sobre la clasificación de empresas.",
    quiz: {
      id: "quiz-uf0517-01",
      question: "¿Cuál es el capital mínimo para constituir una Sociedad Limitada (S.L.)?",
      options: [
        { id: "a", text: "1.000 €", isCorrect: false },
        { id: "b", text: "3.000 €", isCorrect: true },
        { id: "c", text: "60.000 €", isCorrect: false },
        { id: "d", text: "No tiene capital mínimo", isCorrect: false }
      ],
      explanation: "La Sociedad Limitada requiere un capital mínimo de 3.000 €, mientras que la Sociedad Anónima requiere 60.000 €.",
      hint: "Piensa en la forma societaria más común para pequeñas y medianas empresas."
    }
  },
  {
    id: "uf0517-09",
    type: "content",
    title: "1.7 La Jerarquía Empresarial",
    content: `# Niveles Jerárquicos en la Empresa

La jerarquía establece los diferentes **niveles de autoridad y responsabilidad** dentro de la organización.

## Nivel Estratégico (Alta Dirección) 👔

- Consejo de Administración
- Director General / CEO
- Directores de Área
- **Función:** Toma de decisiones estratégicas a largo plazo

## Nivel Táctico (Mandos Intermedios) 👨‍💼

- Jefes de Departamento
- Coordinadores de Área
- Supervisores
- **Función:** Implementación de estrategias y gestión de equipos

## Nivel Operativo (Base) 👷

- Trabajadores especializados
- Personal administrativo
- Operarios
- **Función:** Ejecución de tareas diarias

## Principios de la Jerarquía

1. **Unidad de mando**: Cada empleado depende de un solo superior
2. **Cadena de mando**: Línea clara de autoridad de arriba abajo
3. **Tramo de control**: Número de subordinados por superior
4. **Delegación**: Transferencia de autoridad para realizar tareas`,
    keyTerms: ["Jerarquía", "Alta dirección", "Mandos intermedios", "Nivel operativo"]
  },
  {
    id: "uf0517-10",
    type: "content",
    title: "2.1 La Función Administrativa",
    content: `# El Proceso Administrativo

La **función administrativa** es el conjunto de actividades y procesos sistemáticos que permiten planificar, organizar, dirigir y controlar los recursos de una organización.

## Las 4 Funciones del Proceso Administrativo

### 1. PLANIFICACIÓN 📋
Determinar qué se quiere conseguir y cómo hacerlo.
- Establecer objetivos
- Definir estrategias
- Elaborar presupuestos

### 2. ORGANIZACIÓN 🗂️
Estructurar recursos y actividades para lograr los objetivos.
- División del trabajo
- Asignación de tareas
- Establecer jerarquías

### 3. DIRECCIÓN 🎯
Guiar y motivar al personal para la consecución de objetivos.
- Liderazgo
- Comunicación
- Toma de decisiones

### 4. CONTROL ✅
Verificar que las actividades se desarrollan según lo planificado.
- Medir resultados
- Detectar desviaciones
- Aplicar correcciones`,
    keyTerms: ["Planificación", "Organización", "Dirección", "Control"]
  },
  {
    id: "uf0517-11",
    type: "content",
    title: "2.2 Objetivos de la Función Administrativa",
    content: `# Objetivos de la Gestión Administrativa

## Objetivos Generales

### 1. Optimización de Recursos 📊
- Uso eficiente de recursos humanos, materiales y financieros
- Minimización de desperdicios y costes innecesarios
- Maximización de la productividad

### 2. Coordinación Organizacional 🔗
- Armonización de actividades entre departamentos
- Sincronización de procesos
- Eliminación de duplicidades

### 3. Facilitación de la Comunicación 📨
- Fluidez de información interna
- Gestión documental eficaz
- Canales de comunicación claros

### 4. Apoyo a la Toma de Decisiones 💡
- Suministro de información relevante
- Análisis de datos
- Elaboración de informes

## Objetivos Específicos por Área

| Área | Objetivos |
|------|-----------|
| Gestión documental | Archivo, clasificación, conservación |
| Comunicaciones | Correspondencia, atención telefónica |
| Gestión de personal | Registro, control horario, nóminas |
| Gestión económica | Facturación, cobros, pagos |`,
    keyTerms: ["Optimización", "Coordinación", "Comunicación", "Decisiones"]
  },
  {
    id: "uf0517-12",
    type: "content",
    title: "3.1 La Estructura de la Empresa",
    content: `# Principios de Organización Empresarial

La organización empresarial es el sistema de relaciones formales e informales que definen cómo se coordinan las actividades y se asignan las responsabilidades.

## Principios Fundamentales

### Principio de Unidad de Objetivo 🎯
Toda la estructura organizativa debe orientarse hacia la consecución de los objetivos empresariales.

### Principio de Eficiencia ⚡
La organización debe diseñarse para alcanzar objetivos con el mínimo coste posible.

### Principio de Tramo de Control 👥
Límite al número de subordinados que un superior puede supervisar eficazmente.

### Principio de Jerarquía 📊
Línea clara de autoridad desde la cúspide hasta la base.

### Principio de Delegación 🤝
La autoridad debe delegarse hasta el punto más bajo posible, manteniendo el control.

### Principio de Especialización 🎓
El trabajo debe dividirse permitiendo que cada persona se especialice.

### Principio de Coordinación 🔄
Las diferentes partes deben trabajar de forma integrada.`,
    keyTerms: ["Organización", "Eficiencia", "Delegación", "Coordinación"]
  },
  {
    id: "uf0517-13",
    type: "content",
    title: "3.2 Organización Formal e Informal",
    content: `# Tipos de Organización en la Empresa

## Organización Formal 📋

Es la estructura **oficial, planificada y explícitamente definida** por la dirección.

### Características:
- Definida por la dirección
- Reflejada en el organigrama
- Establece responsabilidades claras
- Determina canales de comunicación oficiales
- Estructura de autoridad documentada

### Elementos:
- Puestos de trabajo
- Departamentos
- Niveles jerárquicos
- Procedimientos escritos
- Normativa interna

---

## Organización Informal 🗣️

Es el conjunto de **relaciones no oficiales** que surgen espontáneamente.

### Características:
- Surge de forma espontánea
- Basada en relaciones personales
- No aparece en documentos oficiales
- Tiene sus propios líderes informales

### Aspectos Positivos ✅
- Satisface necesidades sociales
- Facilita comunicación rápida
- Mejora el clima laboral

### Aspectos Negativos ❌
- Puede generar rumores
- Resistencia al cambio
- Conflictos con la autoridad formal`,
    keyTerms: ["Organización formal", "Organización informal", "Organigrama"]
  },
  {
    id: "uf0517-14",
    type: "content",
    title: "4.1 Los Departamentos de la Empresa",
    content: `# Estructura Departamental

Un **departamento** es una unidad organizativa que agrupa actividades y funciones relacionadas bajo la dirección de un responsable.

## Departamentos Funcionales Básicos

### 📊 Departamento de Dirección General
- Planificación estratégica
- Toma de decisiones de alto nivel
- Representación de la empresa

### 📋 Departamento de Administración
- Gestión documental
- Contabilidad general
- Facturación y cobros

### 👥 Departamento de Recursos Humanos
- Selección de personal
- Formación y desarrollo
- Gestión de nóminas
- Prevención de riesgos

### 📈 Departamento Comercial/Marketing
- Investigación de mercado
- Gestión de ventas
- Atención al cliente
- Publicidad

### ⚙️ Departamento de Producción
- Planificación de la producción
- Control de calidad
- Gestión de stocks

### 💰 Departamento Financiero
- Gestión de tesorería
- Inversiones y financiación
- Control presupuestario`,
    keyTerms: ["Departamento", "RRHH", "Comercial", "Finanzas"]
  },
  {
    id: "uf0517-15",
    type: "content",
    title: "5.1 Los Organigramas",
    content: `# El Organigrama Empresarial

El **organigrama** es la representación gráfica de la estructura organizativa de una empresa, mostrando departamentos, puestos y relaciones jerárquicas.

## Elementos que Muestra un Organigrama

1. **Unidades organizativas**: Departamentos, secciones, puestos
2. **Relaciones de autoridad**: Líneas de mando
3. **Niveles jerárquicos**: Posición relativa en la estructura
4. **Canales de comunicación**: Flujos formales de información
5. **División del trabajo**: Agrupación de funciones

## Tipos de Organigramas

### Por su Forma:
| Tipo | Descripción |
|------|-------------|
| **Vertical** | De arriba abajo (el más común) |
| **Horizontal** | De izquierda a derecha |
| **Circular** | En círculos concéntricos |
| **Mixto** | Combinación de los anteriores |

### Por su Contenido:
- **Estructural**: Solo muestra unidades organizativas
- **Funcional**: Incluye las funciones de cada unidad
- **Personal**: Incluye nombres de los responsables

## Requisitos de un Buen Organigrama
✅ Claridad y simplicidad
✅ Actualización permanente
✅ Fácil comprensión`,
    keyTerms: ["Organigrama", "Vertical", "Horizontal", "Estructura"]
  },
  {
    id: "uf0517-16",
    type: "quiz",
    title: "Autoevaluación: Estructura Organizativa",
    content: "Comprueba tus conocimientos sobre la estructura de la empresa.",
    quiz: {
      id: "quiz-uf0517-02",
      question: "¿Cuál de las siguientes NO es una función del proceso administrativo?",
      options: [
        { id: "a", text: "Planificación", isCorrect: false },
        { id: "b", text: "Organización", isCorrect: false },
        { id: "c", text: "Comercialización", isCorrect: true },
        { id: "d", text: "Control", isCorrect: false }
      ],
      explanation: "Las cuatro funciones del proceso administrativo son: Planificación, Organización, Dirección y Control. La comercialización es una función empresarial, pero no forma parte del proceso administrativo.",
      hint: "Recuerda las 4 funciones: PODC (Planificar, Organizar, Dirigir, Controlar)"
    }
  },
  {
    id: "uf0517-17",
    type: "content",
    title: "6.1 Los Grupos de Trabajo",
    content: `# Concepto de Grupo

Un **grupo** es un conjunto de dos o más personas que interactúan entre sí, comparten objetivos comunes y se perciben como una unidad diferenciada.

## Características Definitorias

1. **Interacción**: Los miembros se relacionan entre sí
2. **Interdependencia**: Las acciones de unos afectan a otros
3. **Identidad compartida**: Sentimiento de pertenencia
4. **Objetivos comunes**: Metas que el grupo persigue
5. **Normas**: Reglas de comportamiento aceptadas
6. **Roles**: Funciones diferenciadas de los miembros

## Elementos del Grupo

### Los Miembros 👥
Cada miembro aporta:
- Conocimientos y habilidades
- Personalidad y actitudes
- Motivaciones y expectativas

### Las Normas 📜
- Pueden ser formales (escritas) o informales
- Establecen lo aceptable y lo inaceptable
- Su incumplimiento conlleva sanciones

### Los Roles 🎭
- **Rol asignado**: Establecido formalmente
- **Rol asumido**: El que la persona desarrolla realmente
- **Rol percibido**: Cómo cree la persona que debe comportarse

### La Cohesión 🤝
Grado de atracción hacia el grupo y deseo de permanencia.`,
    keyTerms: ["Grupo", "Rol", "Normas", "Cohesión"]
  },
  {
    id: "uf0517-18",
    type: "content",
    title: "6.2 Diferencia entre Grupo y Equipo",
    content: `# Grupo vs. Equipo de Trabajo

## Comparativa

| Característica | Grupo | Equipo |
|---------------|-------|--------|
| **Liderazgo** | Individual | Compartido |
| **Responsabilidad** | Individual | Conjunta |
| **Objetivo** | Individual o común | Siempre común |
| **Resultados** | Individuales | Colectivos |
| **Sinergia** | Neutra o negativa | Positiva |
| **Habilidades** | Aleatorias | Complementarias |

## Características del Equipo de Alto Rendimiento

✅ **Objetivos claros y compartidos**
✅ **Roles bien definidos**
✅ **Comunicación abierta y frecuente**
✅ **Confianza mutua**
✅ **Complementariedad de habilidades**
✅ **Liderazgo efectivo**
✅ **Resolución constructiva de conflictos**
✅ **Celebración de logros**

## Clasificación de Grupos

### Por su Origen:
- **Grupos formales**: Creados por la organización
- **Grupos informales**: Surgen espontáneamente

### Por su Duración:
- **Permanentes**: Duración indefinida
- **Temporales**: Para tareas específicas

### Por su Tamaño:
- **Pequeños**: 2-12 miembros
- **Medianos**: 12-25 miembros
- **Grandes**: Más de 25 miembros`,
    keyTerms: ["Equipo", "Alto rendimiento", "Sinergia", "Complementariedad"]
  },
  {
    id: "uf0517-19",
    type: "content",
    title: "7.1 Criterios de Organización Administrativa",
    content: `# Organización del Trabajo Administrativo

## Criterios de Organización

### Criterio de Especialización 🎯
Asignar tareas similares a personas específicas para desarrollar competencia y rapidez.

### Criterio de Polivalencia 🔄
Preparar al personal para realizar diversas tareas, garantizando cobertura ante ausencias.

### Criterio de Priorización ⚡
Establecer orden de importancia de las tareas.

## Matriz de Eisenhower

| | URGENTE | NO URGENTE |
|---|---------|------------|
| **IMPORTANTE** | ⚡ Hacer inmediatamente | 📅 Planificar |
| **NO IMPORTANTE** | 🤝 Delegar | ❌ Eliminar/Posponer |

## Indicadores de Calidad

| Área | Indicador | Objetivo |
|------|-----------|----------|
| Archivo | Documentos localizados a la primera | > 95% |
| Teléfono | Llamadas atendidas en < 3 tonos | > 90% |
| Correspondencia | Distribución en < 2 horas | > 98% |
| Reprografía | Documentos sin errores | > 99% |

## Técnicas de Gestión del Tiempo

- **Técnica Pomodoro**: Bloques de 25 min + descanso 5 min
- **Regla de los 2 minutos**: Si tarda menos de 2 min, hacerlo ya
- **Batching**: Agrupar tareas similares`,
    keyTerms: ["Eisenhower", "Pomodoro", "Priorización", "Indicadores"]
  },
  {
    id: "uf0517-20",
    type: "exercise",
    title: "Ejercicio: Identificar Tipos de Empresas",
    content: "Relaciona cada empresa con su clasificación correcta.",
    exerciseData: {
      type: "match",
      instructions: "Relaciona cada empresa con su tipo correspondiente:",
      items: [
        { left: "Panadería con 3 empleados", right: "Microempresa" },
        { left: "Fábrica con 150 trabajadores", right: "Mediana empresa" },
        { left: "Correos (propiedad estatal)", right: "Empresa pública" },
        { left: "Médico con consulta propia", right: "Empresario individual" }
      ]
    }
  }
];

const UF0518_CONTENT: ContentSlide[] = [
  // UD1 - Tratamiento de la correspondencia (25 slides)
  {
    id: "uf0518-01",
    type: "intro",
    title: "UF0518 - Gestión Auxiliar de la Correspondencia",
    content: `# Bienvenido a la Unidad Formativa UF0518

Esta unidad formativa se centra en la **gestión de la correspondencia y paquetería** en la empresa, abordando todos los aspectos del tratamiento documental escrito.

## ¿Qué aprenderás?

- **Comunicación escrita empresarial** y sus tipos
- **Recepción y distribución** de correspondencia
- **Preparación y envío** de documentos
- **Normativa de seguridad** y confidencialidad
- **Archivo** de comunicaciones
- **Internet** como medio de comunicación

> **Duración estimada:** 30 horas
> **Nivel:** Básico`,
    keyTerms: ["Correspondencia", "Comunicación escrita", "Archivo", "Confidencialidad"]
  },
  {
    id: "uf0518-02",
    type: "content",
    title: "1.1 La Comunicación Escrita Empresarial",
    content: `# Importancia de la Comunicación Escrita

La comunicación escrita es fundamental para cualquier organización. Constituye el medio principal de transmisión de información formal.

## Características de la Comunicación Escrita

| Característica | Descripción |
|----------------|-------------|
| **Permanencia** | Queda registro duradero del mensaje |
| **Reflexión** | Permite elaborar el contenido con cuidado |
| **Alcance** | Puede llegar a múltiples destinatarios |
| **Formalidad** | Apropiada para comunicaciones oficiales |
| **Verificabilidad** | Sirve como prueba documental |

## Funciones de la Comunicación Escrita

### 📋 Función Informativa
Transmitir datos, hechos, decisiones y conocimientos.

### 📌 Función Directiva
Dar instrucciones, órdenes o indicaciones de actuación.

### 💬 Función Persuasiva
Convencer, influir o modificar actitudes.

### 🔗 Función de Coordinación
Sincronizar actividades entre personas o departamentos.

### 📄 Función Testimonial
Dejar constancia de hechos, acuerdos o situaciones.`,
    keyTerms: ["Comunicación escrita", "Permanencia", "Formalidad"]
  },
  {
    id: "uf0518-03",
    type: "content",
    title: "1.2 Elementos de la Comunicación",
    content: `# Los Elementos del Proceso Comunicativo

## El Emisor 📤
Persona, departamento u organización que **genera el mensaje**.

**Responsabilidades:**
- Claridad en la expresión
- Adecuación al destinatario
- Corrección formal

## El Receptor 📥
Quien **recibe e interpreta** el mensaje.

**Tipos de destinatarios:**
- Internos: Compañeros, superiores, subordinados
- Externos: Clientes, proveedores, administraciones

## El Mensaje 💬
El **contenido** de la comunicación.

**Características del buen mensaje:**
- Claridad - Concisión - Corrección - Coherencia - Completitud

## El Canal 📡
**Medio físico o digital** de transmisión.

| Tradicionales | Digitales |
|---------------|-----------|
| Correo postal | Email |
| Mensajería | Intranet |
| Fax | Apps corporativas |
| Tablón de anuncios | Gestión documental |

## El Feedback 🔄
**Respuesta del receptor** que confirma la recepción y comprensión.`,
    keyTerms: ["Emisor", "Receptor", "Mensaje", "Canal", "Feedback"]
  },
  {
    id: "uf0518-04",
    type: "content",
    title: "1.3 La Carta Comercial - Estructura",
    content: `# Estructura de la Carta Comercial

La **carta comercial** es el principal vehículo de comunicación formal entre empresas.

## Partes de la Carta

### 1️⃣ INICIO
| Elemento | Descripción |
|----------|-------------|
| **Membrete** | Logo, nombre, dirección, CIF de la empresa |
| **Destinatario** | Datos de la persona/empresa receptora |
| **Referencia/Asunto** | Tema de la carta |
| **Fecha** | Lugar y fecha de emisión |

### 2️⃣ CONTENIDO
| Elemento | Descripción |
|----------|-------------|
| **Saludo** | "Estimado/a Sr./Sra.:" |
| **Cuerpo** | Introducción + Desarrollo + Cierre |

### 3️⃣ FINAL
| Elemento | Descripción |
|----------|-------------|
| **Despedida** | "Atentamente,", "Un cordial saludo," |
| **Antefirma** | Cargo del firmante |
| **Firma** | Rúbrica manuscrita o digital |
| **Anexos** | Si hay documentos adjuntos |

## Tipos de Cartas Comerciales

- 📋 Carta de presentación
- 💰 Carta de oferta
- 📦 Carta de pedido
- ⚠️ Carta de reclamación
- 💵 Carta de cobro
- 🙏 Carta de agradecimiento`,
    keyTerms: ["Carta comercial", "Membrete", "Saludo", "Despedida"]
  },
  {
    id: "uf0518-05",
    type: "content",
    title: "1.4 Documentos Administrativos",
    content: `# Documentos de Comunicación Administrativa

## La Instancia o Solicitud 📝
Documento para **solicitar algo a una Administración Pública**.

**Estructura:**
1. **Encabezamiento**: Datos del solicitante
2. **EXPONE**: Hechos que fundamentan la solicitud
3. **SOLICITA**: Petición concreta
4. **Lugar, fecha y firma**
5. **Órgano al que se dirige**

---

## El Certificado 📋
Documento que **acredita hechos, situaciones o circunstancias**.

**Estructura:**
1. Identificación del certificante
2. "CERTIFICA/CERTIFICO"
3. Contenido certificado
4. Finalidad del certificado
5. Lugar, fecha, firma y sello

---

## El Oficio 📨
Comunicación oficial entre **organismos públicos**.

---

## La Notificación 📬
Comunicación oficial para dar a conocer una **resolución administrativa**.

**Debe incluir:**
- Texto íntegro de la resolución
- Indicación de recursos posibles
- Plazos de recurso`,
    keyTerms: ["Instancia", "Certificado", "Oficio", "Notificación"]
  },
  {
    id: "uf0518-06",
    type: "content",
    title: "1.5 Comunicaciones Internas",
    content: `# Documentos de Comunicación Interna

## El Memorando o Memorándum 📝

Comunicación **breve entre personas de la misma organización**.

\`\`\`
MEMORANDO

DE: [Remitente]
PARA: [Destinatario]
FECHA: [Día/mes/año]
ASUNTO: [Tema]

[Contenido breve y directo]

[Firma]
\`\`\`

---

## La Circular 📢

Comunicación dirigida **simultáneamente a múltiples destinatarios**.

**Características:**
- Mismo texto para todos
- Numeración correlativa
- Temas de interés general
- Puede ser informativa o normativa

---

## El Informe 📊

Documento que **expone información y análisis** sobre un tema.

**Tipos:**
- **Informativo**: Solo presenta datos
- **Analítico**: Incluye análisis y conclusiones
- **Propositivo**: Plantea recomendaciones

---

## El Acta 📄

Documento que recoge los **asuntos tratados en una reunión**.

**Contenido mínimo:**
- Fecha, hora y lugar
- Asistentes y ausentes
- Orden del día
- Acuerdos adoptados
- Firmas`,
    keyTerms: ["Memorando", "Circular", "Informe", "Acta"]
  },
  {
    id: "uf0518-07",
    type: "content",
    title: "1.6 Normas de Redacción Empresarial",
    content: `# Estilo de Redacción Empresarial

## Normas Básicas de Redacción

### ✍️ CLARIDAD
- Frases cortas (15-25 palabras)
- Una idea por oración
- Vocabulario preciso
- Evitar ambigüedades

### 📏 CONCISIÓN
- Eliminar redundancias
- Evitar circunloquios
- Ir al grano
- Sin palabras vacías

### ✅ CORRECCIÓN
- Revisar ortografía y gramática
- Verificar datos y cifras
- Comprobar nombres y referencias

### 🎯 ADECUACIÓN
- Tono apropiado al destinatario
- Vocabulario comprensible
- Formalidad según contexto

## Errores Frecuentes a Evitar

| Incorrecto | Correcto |
|------------|----------|
| "En base a" | "Según" / "Basándose en" |
| "A nivel de" | "En" / "Respecto a" |
| "Subir arriba" | "Subir" |
| "Prever con antelación" | "Prever" |
| "Lapso de tiempo" | "Lapso" |`,
    keyTerms: ["Claridad", "Concisión", "Corrección", "Redacción"]
  },
  {
    id: "uf0518-08",
    type: "quiz",
    title: "Autoevaluación: Comunicación Escrita",
    content: "Comprueba tus conocimientos sobre documentos empresariales.",
    quiz: {
      id: "quiz-uf0518-01",
      question: "¿Qué documento se utiliza para solicitar algo a una Administración Pública?",
      options: [
        { id: "a", text: "Memorando", isCorrect: false },
        { id: "b", text: "Circular", isCorrect: false },
        { id: "c", text: "Instancia o Solicitud", isCorrect: true },
        { id: "d", text: "Carta comercial", isCorrect: false }
      ],
      explanation: "La instancia o solicitud es el documento formal mediante el cual un ciudadano se dirige a una Administración Pública para solicitar algo, siguiendo la estructura EXPONE-SOLICITA.",
      hint: "Piensa en el documento con estructura 'Expone' y 'Solicita'."
    }
  },
  {
    id: "uf0518-09",
    type: "content",
    title: "2.1 Gestión de la Recepción de Correspondencia",
    content: `# Proceso de Recepción de Correspondencia

## Fuentes de Entrada 📥

- 📮 Cartero (Correos)
- 🚚 Servicios de mensajería
- 👤 Entrega personal
- 📬 Buzón de la empresa
- 📦 Valija interna (entre sedes)

## Acciones Iniciales

1. **Recoger** correspondencia
2. **Verificar** que está dirigida a la empresa
3. **Comprobar** integridad de los envíos
4. **Separar** correspondencia urgente

## Criterios de Clasificación

### Por Tipo de Envío:
- Cartas ordinarias
- Cartas certificadas
- Burofax y notificaciones
- Paquetes y mercancías
- Publicidad

### Por Destinatario:
- Correspondencia institucional
- Correspondencia departamental
- Correspondencia personal
- Correspondencia confidencial

### Por Urgencia:
| Nivel | Tratamiento |
|-------|-------------|
| ⚡ Urgente | Inmediato |
| 📋 Normal | Proceso ordinario |
| ⏳ Sin urgencia | Puede esperar |`,
    keyTerms: ["Recepción", "Clasificación", "Urgencia", "Correspondencia"]
  },
  {
    id: "uf0518-10",
    type: "content",
    title: "2.2 Registro de Correspondencia Entrante",
    content: `# El Registro de Entrada

El **registro de entrada** es el control documental de toda la correspondencia recibida.

## Datos del Libro de Registro de Entrada

| Campo | Descripción |
|-------|-------------|
| **Nº de registro** | Número correlativo |
| **Fecha de entrada** | Día de recepción |
| **Remitente** | Quien envía |
| **Asunto** | Resumen del contenido |
| **Tipo de documento** | Carta, paquete, etc. |
| **Destino** | Departamento destinatario |
| **Observaciones** | Incidencias, urgencia |

## Proceso de Registro

\`\`\`
Recepción → Apertura → Sellado → Registro → Clasificación → Distribución
\`\`\`

## El Sello de Entrada

Todo documento debe sellarse con:
- 📅 Fecha de entrada
- 🔢 Número de registro
- 🏢 Identificación de la empresa

## Tipos de Registro

| Tradicional | Informatizado |
|-------------|---------------|
| Libro físico encuadernado | Base de datos digital |
| Anotación manual | Registro automático |
| Consulta presencial | Búsquedas instantáneas |
| Sello de caucho | Código de barras/QR |`,
    keyTerms: ["Registro", "Libro de entrada", "Sello", "Clasificación"]
  },
  {
    id: "uf0518-11",
    type: "content",
    title: "2.3 Distribución Interna de Correspondencia",
    content: `# La Distribución de Correspondencia

## Proceso de Distribución

1. **Separación** por departamentos
2. **Preparación** de las rutas de reparto
3. **Entrega** con acuse de recibo (si procede)
4. **Registro** de incidencias

## Criterios de Distribución

### Por Prioridad:
1. 🔴 **Urgente**: Entrega inmediata
2. 🟡 **Importante**: En las primeras horas
3. 🟢 **Ordinario**: En reparto habitual

### Por Tipo:
- **Personal**: Solo al destinatario
- **Confidencial**: Sobre cerrado
- **Departamental**: Al responsable del área
- **General**: Tablón de anuncios o circular

## Hoja de Entrega de Correspondencia

| Fecha | Nº Reg. | Departamento | Receptor | Firma |
|-------|---------|--------------|----------|-------|
| 15/01 | 234 | Comercial | Ana López | ✓ |
| 15/01 | 235 | RRHH | Carlos Ruiz | ✓ |
| 15/01 | 236 | Dirección | Mª García | ✓ |

## Incidencias Comunes

- ❌ Destinatario ausente → Dejar con firma de sustituto
- ❌ Departamento inexistente → Consultar con responsable
- ❌ Correspondencia dañada → Levantar acta de incidencias`,
    keyTerms: ["Distribución", "Entrega", "Prioridad", "Incidencias"]
  },
  {
    id: "uf0518-12",
    type: "content",
    title: "3.1 Preparación de la Correspondencia Saliente",
    content: `# Proceso de Preparación de Correspondencia

## Etapas del Proceso

### 1. Elaboración del Documento 📝
- Redacción del contenido
- Revisión ortográfica y de estilo
- Verificación de datos

### 2. Aprobación y Firma ✍️
- Revisión por el responsable
- Firma manuscrita o digital
- Autorización de envío

### 3. Preparación del Envío 📦
- Obtención de copias necesarias
- Preparación de anexos
- Elección del sobre/embalaje adecuado

## Número de Copias

| Copia | Destino |
|-------|---------|
| **Original** | Destinatario |
| **1ª Copia** | Archivo del expediente |
| **2ª Copia** | Departamento emisor |
| **3ª Copia** | Control de correspondencia (opcional) |

## Tipos de Firma

### Firma Manuscrita
- Del propio firmante
- P.O. (Por Orden)
- P.A. (Por Ausencia)
- P.P. (Por Poder)

### Firma Electrónica
- Simple: Email identificado
- Avanzada: Vinculada al firmante
- Reconocida: Con certificado cualificado`,
    keyTerms: ["Preparación", "Firma", "Copias", "Firma electrónica"]
  },
  {
    id: "uf0518-13",
    type: "content",
    title: "3.2 Embalaje y Empaquetado",
    content: `# Materiales y Técnicas de Embalaje

## Tipos de Sobres 📧

| Tipo | Uso |
|------|-----|
| **Americano** | Cartas estándar |
| **Bolsa** | Documentos sin doblar |
| **Acolchado** | Material frágil |
| **Con ventana** | Dirección visible |
| **Retorno pagado** | Respuestas prepagadas |

## Materiales de Embalaje 📦

### Para Documentos:
- Sobres normales y acolchados
- Carpetas de cartón
- Tubos para planos

### Para Paquetes:
- Cajas de cartón
- Plástico de burbujas
- Papel kraft
- Chips de relleno

### Materiales de Protección:
- Film de embalaje
- Cinta adhesiva
- Precintos de seguridad

## Etiquetado Correcto

**Información obligatoria:**
- 📍 Dirección completa del destinatario
- 📍 Dirección del remitente
- 📋 Referencia del envío
- ⚠️ Indicaciones especiales (FRÁGIL, URGENTE)

## Procedimiento de Empaquetado

1. **Seleccionar** embalaje adecuado al contenido
2. **Proteger** el contenido con material de relleno
3. **Cerrar** de forma segura
4. **Etiquetar** con todos los datos necesarios
5. **Verificar** antes de enviar`,
    keyTerms: ["Embalaje", "Sobre", "Etiquetado", "Protección"]
  },
  {
    id: "uf0518-14",
    type: "content",
    title: "4.1 Gestión de Salida de Correspondencia",
    content: `# El Proceso de Salida

## Verificaciones Previas al Envío

✅ Documento correcto y completo
✅ Firma autorizada
✅ Dirección verificada
✅ Anexos incluidos
✅ Sobre/embalaje adecuado
✅ Franqueo correcto

## El Registro de Salida

| Campo | Descripción |
|-------|-------------|
| **Nº de registro** | Correlativo de salida |
| **Fecha** | De expedición |
| **Destinatario** | Nombre y dirección |
| **Asunto** | Resumen del contenido |
| **Tipo de envío** | Ordinario, certificado, etc. |
| **Departamento origen** | Quien lo envía |
| **Observaciones** | Urgencia, seguimiento |

## Pesaje y Franqueo

### Métodos de Franqueo:
- 📫 Sellos postales
- 📋 Máquina franqueadora
- 💳 Franqueo concertado
- 🖥️ Franqueo digital (prepagado online)

### Tarifas (factores):
- Peso del envío
- Dimensiones
- Destino (nacional/internacional)
- Tipo de servicio (urgente, certificado)`,
    keyTerms: ["Registro de salida", "Franqueo", "Verificación", "Expedición"]
  },
  {
    id: "uf0518-15",
    type: "content",
    title: "4.2 Medios de Envío de Correspondencia",
    content: `# Servicios Postales y de Mensajería

## Servicios de Correos 📮

### Correspondencia Básica:
| Servicio | Plazo | Características |
|----------|-------|-----------------|
| **Carta ordinaria** | 2-3 días | Sin seguimiento |
| **Carta certificada** | 24-48h | Con seguimiento |
| **Carta urgente** | 24h | Entrega garantizada |
| **Burofax** | 24h | Valor probatorio |

### Paquetería:
- Paq Standard (3-4 días)
- Paq Premium (24-48h)
- Paq Retorno (con devolución)

### Servicios Especiales:
- Acuse de recibo
- Reembolso
- Valor declarado
- Entrega exclusiva al destinatario

## Empresas de Mensajería Privada 🚚

| Empresa | Especialidad |
|---------|--------------|
| **SEUR** | Urgente nacional |
| **MRW** | Paquetería |
| **UPS** | Internacional |
| **DHL** | Express global |
| **FedEx** | Documentos urgentes |

## El Correo Electrónico 📧

**Ventajas:**
- Instantáneo y económico
- Documentos adjuntos
- Registro automático

**Buenas prácticas:**
- Asunto claro y descriptivo
- Firma corporativa
- Adjuntos en formatos estándar`,
    keyTerms: ["Correos", "Mensajería", "Certificado", "Email"]
  },
  {
    id: "uf0518-16",
    type: "quiz",
    title: "Autoevaluación: Gestión de Correspondencia",
    content: "Comprueba tus conocimientos sobre envío de correspondencia.",
    quiz: {
      id: "quiz-uf0518-02",
      question: "¿Qué servicio postal tiene valor probatorio legal para comunicaciones oficiales?",
      options: [
        { id: "a", text: "Carta ordinaria", isCorrect: false },
        { id: "b", text: "Carta certificada", isCorrect: false },
        { id: "c", text: "Burofax", isCorrect: true },
        { id: "d", text: "Correo electrónico", isCorrect: false }
      ],
      explanation: "El Burofax es un servicio de Correos con valor probatorio legal que certifica tanto el contenido como la fecha de envío y recepción, siendo admisible como prueba en procedimientos judiciales.",
      hint: "Es el servicio más utilizado para comunicaciones legales importantes."
    }
  },
  {
    id: "uf0518-17",
    type: "content",
    title: "5.1 Seguridad y Confidencialidad",
    content: `# Normativa de Protección de Datos

## Marco Legal

### RGPD (Reglamento General de Protección de Datos)
Normativa europea que regula el tratamiento de datos personales.

### LOPDGDD (Ley Orgánica de Protección de Datos)
Adaptación española del RGPD.

## Obligaciones en el Manejo de Correspondencia

### 🔒 Confidencialidad
- No revelar contenido a terceros
- Manejo discreto de información sensible
- Destrucción segura de documentos

### 📋 Deber de Secreto
- Aplicable a todo el personal
- Persiste tras finalizar la relación laboral
- Sanciones por incumplimiento

## Medidas de Seguridad

| Tipo | Medidas |
|------|---------|
| **Físicas** | Armarios con llave, acceso restringido |
| **Organizativas** | Protocolos, formación, auditorías |
| **Técnicas** | Cifrado, contraseñas, copias de seguridad |

## Conservación de Documentos

| Tipo de Documento | Plazo Mínimo |
|-------------------|--------------|
| Documentos contables | 6 años |
| Documentos fiscales | 4 años |
| Documentos laborales | 4 años |
| Contratos | Variable según tipo |

## Destrucción Segura

- 🔥 Destructoras de papel (nivel P-4 mínimo)
- 📋 Certificados de destrucción
- 🏢 Empresas especializadas para grandes volúmenes`,
    keyTerms: ["RGPD", "LOPDGDD", "Confidencialidad", "Destrucción"]
  },
  {
    id: "uf0518-18",
    type: "content",
    title: "6.1 El Archivo de Correspondencia",
    content: `# Gestión del Archivo Documental

## Concepto de Archivo

El **archivo** es el conjunto ordenado de documentos que una organización produce o recibe en el ejercicio de sus funciones.

## Fases del Archivo

### 1. Archivo de Gestión (Activo) 📂
- Documentos de uso frecuente
- Ubicación: En el departamento
- Permanencia: 1-5 años

### 2. Archivo Intermedio 📦
- Consulta esporádica
- Ubicación: Archivo central
- Permanencia: 5-25 años

### 3. Archivo Histórico 🏛️
- Conservación permanente
- Valor histórico o legal
- Acceso restringido

## Operaciones de Archivo

1. **Clasificación**: Ordenar por categorías
2. **Ordenación**: Dentro de cada categoría
3. **Instalación**: Ubicación física
4. **Descripción**: Inventarios y catálogos
5. **Conservación**: Mantenimiento
6. **Consulta**: Acceso y préstamo

## Sistemas de Clasificación

| Sistema | Uso |
|---------|-----|
| **Alfabético** | Por nombre o razón social |
| **Numérico** | Por número correlativo |
| **Cronológico** | Por fechas |
| **Geográfico** | Por ubicación |
| **Por materias** | Por temas |
| **Mixto** | Combinación de sistemas |`,
    keyTerms: ["Archivo", "Clasificación", "Conservación", "Ordenación"]
  },
  {
    id: "uf0518-19",
    type: "content",
    title: "7.1 Internet como Medio de Comunicación",
    content: `# Comunicación Digital en la Empresa

## El Correo Electrónico Corporativo

### Estructura de un Email Profesional:

\`\`\`
Para: destinatario@empresa.com
CC: copias@empresa.com
CCO: copias ocultas
Asunto: [Claro y descriptivo]

Saludo formal,

Cuerpo del mensaje [Claro, conciso, estructurado]

Despedida,
[Firma corporativa]
\`\`\`

### Buenas Prácticas:

✅ Asunto descriptivo
✅ Contenido estructurado
✅ Ortografía cuidada
✅ Firma corporativa completa
✅ Adjuntos en formatos estándar (PDF)
✅ Tamaño razonable de adjuntos

❌ Evitar mayúsculas (se interpreta como gritar)
❌ Evitar fondos o colores llamativos
❌ No reenviar cadenas
❌ No usar abreviaturas informales

## Otros Canales Digitales

| Canal | Uso Empresarial |
|-------|-----------------|
| **Intranet** | Comunicación interna |
| **Web corporativa** | Información pública |
| **Redes sociales** | Marketing y RRPP |
| **Mensajería instantánea** | Comunicación ágil |
| **Videoconferencia** | Reuniones remotas |`,
    keyTerms: ["Email", "Intranet", "Comunicación digital", "Firma"]
  },
  {
    id: "uf0518-20",
    type: "exercise",
    title: "Ejercicio: Clasificar Documentos",
    content: "Relaciona cada documento con su tipo de comunicación.",
    exerciseData: {
      type: "match",
      instructions: "Clasifica cada documento según su categoría:",
      items: [
        { left: "Memorándum", right: "Comunicación interna" },
        { left: "Carta comercial", right: "Comunicación externa" },
        { left: "Instancia", right: "Documento administrativo" },
        { left: "Acta de reunión", right: "Comunicación interna" }
      ]
    }
  }
];

const UF0519_CONTENT: ContentSlide[] = [
  // UD1 - Documentación administrativa (10 slides)
  // UD2 - Tesorería (10 slides)  
  // UD3 - Existencias (10 slides)
  {
    id: "uf0519-01",
    type: "intro",
    title: "UF0519 - Gestión Auxiliar de la Documentación Económico-Administrativa",
    content: `# Bienvenido a la Unidad Formativa UF0519

Esta unidad formativa aborda la **gestión de documentos económico-administrativos**, desde la documentación mercantil hasta el control de existencias.

## ¿Qué aprenderás?

### UD1 - Documentación Administrativa
- Documentos en la **gestión de compraventa**
- **Facturas, albaranes y pedidos**
- Documentos de **personal y nóminas**

### UD2 - Gestión de Tesorería
- **Medios de cobro y pago**
- Libro auxiliar de **caja y bancos**
- **Arqueo y conciliación**

### UD3 - Control de Existencias
- Material y equipos de **oficina**
- Gestión de **almacén**
- **Inventarios y control de stock**

> **Duración estimada:** 30 horas`,
    keyTerms: ["Documentación", "Tesorería", "Existencias", "Factura"]
  },
  {
    id: "uf0519-02",
    type: "content",
    title: "1.1 Los Documentos Administrativos",
    content: `# Documentos en la Gestión Empresarial

## Definición
Un **documento administrativo** es cualquier soporte material que contiene información relativa a las actividades de una organización.

## Funciones de los Documentos

| Función | Descripción |
|---------|-------------|
| **Probatoria** | Constituyen prueba de hechos |
| **Informativa** | Transmiten datos entre las partes |
| **De control** | Permiten seguimiento de operaciones |
| **Jurídica** | Generan derechos y obligaciones |
| **Contable** | Base para registros contables |

## Características

- ✅ **Autenticidad**: Verificables como genuinos
- ✅ **Integridad**: Completos, sin alteraciones
- ✅ **Fiabilidad**: Reflejan fielmente los hechos
- ✅ **Disponibilidad**: Localizables cuando se necesiten
- ✅ **Confidencialidad**: Protegidos de accesos no autorizados

## Clasificación

### Por Origen:
- **Internos**: Generados dentro de la organización
- **Externos**: Intercambiados con otras entidades

### Por Función:
- Documentos comerciales
- Documentos contables
- Documentos laborales
- Documentos oficiales`,
    keyTerms: ["Documento", "Autenticidad", "Integridad", "Clasificación"]
  },
  {
    id: "uf0519-03",
    type: "content",
    title: "1.2 El Pedido",
    content: `# El Documento de Pedido

El **pedido** es el documento mediante el cual el comprador solicita al vendedor el suministro de determinados bienes o servicios.

## Elementos del Pedido

| Elemento | Descripción |
|----------|-------------|
| **Datos del comprador** | Nombre, dirección, CIF |
| **Datos del vendedor** | Nombre, dirección, CIF |
| **Número de pedido** | Referencia única |
| **Fecha** | De emisión del pedido |
| **Descripción productos** | Detalle de lo solicitado |
| **Cantidades** | Unidades de cada producto |
| **Precios unitarios** | Si se conocen |
| **Condiciones entrega** | Lugar, fecha, forma |
| **Condiciones pago** | Forma y plazo |

## Clases de Pedidos

1. 📞 **Pedido verbal**: Por teléfono o en persona
2. ✍️ **Pedido escrito**: Carta, formulario o impreso
3. 💻 **Pedido electrónico**: Email o plataforma online
4. 📅 **Pedido programado**: Entregas periódicas acordadas
5. ⚡ **Pedido urgente**: Entrega inmediata

## Proceso del Pedido

\`\`\`
Emisión → Recepción → Comprobación → Confirmación → Preparación → Expedición
\`\`\``,
    keyTerms: ["Pedido", "Proveedor", "Comprador", "Condiciones"]
  },
  {
    id: "uf0519-04",
    type: "content",
    title: "1.3 El Albarán",
    content: `# El Albarán o Nota de Entrega

El **albarán** es el documento que acompaña a la mercancía y justifica la recepción de los bienes por el comprador.

## Elementos del Albarán

| Elemento | Descripción |
|----------|-------------|
| **Datos del vendedor** | Identificación completa |
| **Datos del comprador** | Identificación y dirección entrega |
| **Número de albarán** | Referencia única |
| **Fecha de entrega** | Día de entrega efectiva |
| **Referencia del pedido** | Número del pedido original |
| **Descripción productos** | Bienes entregados |
| **Cantidades** | Unidades entregadas |
| **Firma del receptor** | Conformidad de recepción |

## Funciones del Albarán

1. 📋 **Función de control**: Verificar que se entrega lo pedido
2. ⚖️ **Función probatoria**: Acreditar la entrega
3. 💰 **Función contable**: Base para la factura
4. ⚠️ **Función de reclamación**: Documento para incidencias

## Proceso de Verificación

Al recibir la mercancía:
1. ✅ Contar las unidades recibidas
2. ✅ Verificar estado de la mercancía
3. ✅ Comparar con el albarán
4. ✅ Comparar con el pedido original
5. ✅ Firmar si todo es correcto
6. ⚠️ Anotar incidencias si las hay`,
    keyTerms: ["Albarán", "Entrega", "Conformidad", "Verificación"]
  },
  {
    id: "uf0519-05",
    type: "content",
    title: "1.4 La Factura",
    content: `# La Factura Mercantil

La **factura** es el documento que refleja toda la información de una operación de compraventa y genera obligaciones de pago.

## Elementos Obligatorios

| Elemento | Descripción |
|----------|-------------|
| **Número de factura** | Numeración correlativa |
| **Fecha de emisión** | Fecha de expedición |
| **Datos del emisor** | Nombre, dirección, NIF/CIF |
| **Datos del destinatario** | Nombre, dirección, NIF/CIF |
| **Descripción operaciones** | Detalle de bienes/servicios |
| **Base imponible** | Importe antes de impuestos |
| **Tipo de IVA** | Porcentaje aplicable |
| **Cuota de IVA** | Importe del impuesto |
| **Importe total** | Cantidad total a pagar |

## Tipos de Facturas

| Tipo | Características |
|------|-----------------|
| **Ordinaria** | Documento completo estándar |
| **Simplificada** | Para operaciones menores (ticket) |
| **Rectificativa** | Corrige errores de otra factura |
| **Recapitulativa** | Agrupa varias operaciones |
| **Proforma** | Sin validez fiscal, presupuesto |
| **Electrónica** | Formato digital con firma electrónica |

## Cálculo de la Factura

\`\`\`
Base Imponible (BI) = Cantidad × Precio unitario - Descuentos
Cuota IVA = BI × Tipo IVA (21%, 10%, 4%)
TOTAL = Base Imponible + Cuota IVA
\`\`\``,
    keyTerms: ["Factura", "Base imponible", "IVA", "Rectificativa"]
  },
  {
    id: "uf0519-06",
    type: "quiz",
    title: "Autoevaluación: Documentos Mercantiles",
    content: "Comprueba tus conocimientos sobre documentos de compraventa.",
    quiz: {
      id: "quiz-uf0519-01",
      question: "¿Qué documento acompaña a la mercancía y justifica su recepción?",
      options: [
        { id: "a", text: "Pedido", isCorrect: false },
        { id: "b", text: "Factura", isCorrect: false },
        { id: "c", text: "Albarán", isCorrect: true },
        { id: "d", text: "Recibo", isCorrect: false }
      ],
      explanation: "El albarán o nota de entrega es el documento que acompaña a la mercancía y sirve como justificante de que el comprador ha recibido los bienes.",
      hint: "Es el documento que firma el receptor al recibir la mercancía."
    }
  },
  {
    id: "uf0519-07",
    type: "content",
    title: "1.5 La Nómina",
    content: `# El Recibo de Salarios (Nómina)

La **nómina** refleja la retribución del trabajador, incluyendo todos los conceptos salariales y deducciones.

## Estructura de la Nómina

### 1️⃣ Encabezamiento
- Datos de la empresa
- Datos del trabajador
- Período de liquidación
- Categoría profesional

### 2️⃣ Devengos (Lo que se gana)

| Concepto | Descripción |
|----------|-------------|
| **Salario base** | Retribución fija |
| **Complementos** | Antigüedad, peligrosidad... |
| **Horas extras** | Horas adicionales |
| **Pagas extras** | Gratificaciones |

### 3️⃣ Deducciones (Lo que se resta)

| Concepto | Porcentaje aprox. |
|----------|-------------------|
| **Seguridad Social** | ~6,35% |
| **IRPF** | Variable según salario |
| **Anticipos** | Cantidades adelantadas |

### 4️⃣ Líquido a Percibir

\`\`\`
LÍQUIDO = Total Devengos - Total Deducciones
\`\`\`

## Conservación
Las nóminas deben conservarse **mínimo 4 años** (se recomienda indefinidamente).`,
    keyTerms: ["Nómina", "Devengos", "Deducciones", "Salario", "IRPF"]
  },
  {
    id: "uf0519-08",
    type: "content",
    title: "2.1 Operaciones de Tesorería",
    content: `# La Gestión de Tesorería

La **tesorería** comprende las actividades relacionadas con la gestión del dinero efectivo y los medios de pago de una empresa.

## Objetivo Principal
Garantizar que la empresa disponga de **liquidez suficiente** para hacer frente a sus compromisos de pago.

## Tipos de Operaciones

| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| **Cobros** | Entrada de dinero | Ventas, cobro facturas |
| **Pagos** | Salida de dinero | Compras, nóminas, impuestos |
| **Transferencias** | Movimientos internos | De caja a banco |

## Funciones del Departamento

1. 💰 **Gestión de cobros**: Seguimiento de clientes
2. 💳 **Gestión de pagos**: Programación a proveedores
3. 📊 **Control de saldos**: Vigilancia de disponibilidades
4. 📈 **Previsión**: Anticipación de necesidades
5. 🏦 **Relaciones bancarias**: Negociación de condiciones
6. ⚠️ **Gestión de riesgos**: Control de morosidad

## Características de las Operaciones

- ⚡ **Inmediatez**: Afectan inmediatamente a la liquidez
- 📄 **Control documental**: Cada operación documentada
- 📝 **Registro contable**: Todo se registra
- 🔄 **Conciliación**: Registros = Extractos bancarios`,
    keyTerms: ["Tesorería", "Liquidez", "Cobros", "Pagos"]
  },
  {
    id: "uf0519-09",
    type: "content",
    title: "2.2 El Cheque",
    content: `# El Cheque Bancario

El **cheque** es un documento por el que una persona (librador) ordena a un banco (librado) pagar una cantidad a otra persona (tenedor).

## Requisitos del Cheque

| Requisito | Descripción |
|-----------|-------------|
| **Denominación** | La palabra "cheque" |
| **Orden de pago** | Mandato incondicional |
| **Cantidad** | En cifras y letras |
| **Nombre del librado** | Entidad bancaria |
| **Lugar de pago** | Sucursal bancaria |
| **Fecha y lugar** | De emisión |
| **Firma** | Del librador |

## Tipos de Cheques

| Tipo | Características |
|------|-----------------|
| **Al portador** | Pagadero a quien lo presente |
| **Nominativo** | A nombre de una persona |
| **A la orden** | Transmisible por endoso |
| **Cruzado** | Solo puede abonarse en cuenta |
| **Conformado** | El banco garantiza los fondos |
| **Bancario** | Emitido por el propio banco |

## Plazos de Presentación

| Lugar de emisión | Plazo |
|------------------|-------|
| **Mismo lugar** | 15 días |
| **Distinto lugar** | 20 días |

## En caso de Impago
- Reclamación judicial
- Intereses de demora
- Acción ejecutiva`,
    keyTerms: ["Cheque", "Librador", "Librado", "Tenedor", "Endoso"]
  },
  {
    id: "uf0519-10",
    type: "content",
    title: "2.3 La Letra de Cambio y el Pagaré",
    content: `# Documentos de Pago a Crédito

## El Pagaré 📄

Documento por el que una persona **se compromete a pagar** una cantidad en una fecha determinada.

| Elemento | Descripción |
|----------|-------------|
| **Denominación** | "Pagaré" |
| **Promesa de pago** | Compromiso incondicional |
| **Vencimiento** | Fecha de pago |
| **Beneficiario** | A quién debe pagarse |
| **Firma del emisor** | Del obligado al pago |

---

## La Letra de Cambio 📜

Documento por el que una persona (librador) **ordena a otra** (librado) pagar a un tercero (tomador).

### Partes Intervinientes:

\`\`\`
LIBRADOR ────────────→ LIBRADO
(Emite la letra)       (Ordenado a pagar)
        ↓                    ↓
        └───→ TOMADOR ←──────┘
             (Beneficiario)
\`\`\`

## Comparativa

| Aspecto | Cheque | Pagaré | Letra |
|---------|--------|--------|-------|
| Naturaleza | Orden de pago | Promesa | Orden |
| Vencimiento | A la vista | Fecha fija | Fecha fija |
| Uso principal | Pago inmediato | Aplazado | Aplazado |

## Conceptos Adicionales

- **Aval**: Garantía de pago por un tercero
- **Endoso**: Transmisión a otro beneficiario
- **Protesto**: Acta notarial de impago`,
    keyTerms: ["Pagaré", "Letra de cambio", "Librador", "Aval", "Endoso"]
  },
  {
    id: "uf0519-11",
    type: "content",
    title: "2.4 El Libro de Caja",
    content: `# El Libro Auxiliar de Caja

El **libro de caja** registra todos los movimientos de dinero en efectivo de la empresa.

## Elementos del Libro

| Campo | Descripción |
|-------|-------------|
| **Fecha** | Del movimiento |
| **Concepto** | Descripción de la operación |
| **Documento** | Referencia del justificante |
| **Entrada (Debe)** | Cobros en efectivo |
| **Salida (Haber)** | Pagos en efectivo |
| **Saldo** | Disponible tras cada operación |

## Modelo de Libro de Caja

\`\`\`
═══════════════════════════════════════════════════════
              LIBRO AUXILIAR DE CAJA
                 Mes: Enero 2024
═══════════════════════════════════════════════════════
Fecha  │ Concepto          │ Doc.     │ Entrada │ Salida │ Saldo
═══════╪═══════════════════╪══════════╪═════════╪════════╪═══════
01/01  │ Saldo inicial     │          │         │        │ 500,00
02/01  │ Venta contado     │ T.45     │  125,00 │        │ 625,00
03/01  │ Compra material   │ R.12     │         │  45,00 │ 580,00
05/01  │ Ingreso banco     │ Resg.    │         │ 400,00 │ 180,00
═══════════════════════════════════════════════════════
\`\`\`

## El Arqueo de Caja

Verificación del **dinero físico existente** en caja.

### Proceso:
1. 💵 Contar billetes y monedas
2. 📊 Comparar con saldo contable
3. ⚠️ Detectar diferencias
4. ✍️ Firmar el documento de arqueo`,
    keyTerms: ["Libro de caja", "Arqueo", "Entrada", "Salida", "Saldo"]
  },
  {
    id: "uf0519-12",
    type: "content",
    title: "2.5 El Libro de Bancos y Conciliación",
    content: `# El Libro Auxiliar de Bancos

Registra los movimientos de las cuentas bancarias de la empresa.

## Estructura Similar al Libro de Caja

| Campo | Descripción |
|-------|-------------|
| **Fecha** | Del movimiento |
| **Concepto** | Descripción |
| **Nº documento** | Cheque, transferencia, etc. |
| **Debe** | Ingresos (aumentos) |
| **Haber** | Salidas (disminuciones) |
| **Saldo** | Disponible |

---

## La Conciliación Bancaria 🔄

Proceso de **verificar que los registros de la empresa coinciden con el extracto bancario**.

### Causas de Diferencias

| Tipo | Descripción |
|------|-------------|
| **Cheques pendientes** | Emitidos pero no cobrados |
| **Ingresos en tránsito** | No reflejados aún |
| **Comisiones bancarias** | No registradas |
| **Errores** | De la empresa o del banco |
| **Transferencias** | En proceso |

### Proceso de Conciliación

1. 📄 Obtener extracto bancario
2. 📊 Comparar con libro auxiliar
3. ✅ Marcar partidas coincidentes
4. ⚠️ Identificar diferencias
5. 🔍 Investigar causas
6. ✍️ Realizar ajustes necesarios

> **Frecuencia recomendada**: Mensual o semanal`,
    keyTerms: ["Libro de bancos", "Conciliación", "Extracto", "Diferencias"]
  },
  {
    id: "uf0519-13",
    type: "quiz",
    title: "Autoevaluación: Tesorería",
    content: "Comprueba tus conocimientos sobre gestión de tesorería.",
    quiz: {
      id: "quiz-uf0519-02",
      question: "¿Qué proceso verifica que los registros de la empresa coinciden con el extracto bancario?",
      options: [
        { id: "a", text: "Arqueo de caja", isCorrect: false },
        { id: "b", text: "Conciliación bancaria", isCorrect: true },
        { id: "c", text: "Inventario", isCorrect: false },
        { id: "d", text: "Balance contable", isCorrect: false }
      ],
      explanation: "La conciliación bancaria es el proceso de comparar los registros contables de la empresa con el extracto bancario para verificar que coinciden e identificar las causas de las diferencias.",
      hint: "Es el proceso de 'cuadrar' lo que tenemos en nuestros libros con lo que dice el banco."
    }
  },
  {
    id: "uf0519-14",
    type: "content",
    title: "3.1 Material de Oficina",
    content: `# Gestión del Material de Oficina

## Tipos de Material

### Material Fungible (Consumible) 📎
Se consume con el uso y debe reponerse.

| Categoría | Ejemplos |
|-----------|----------|
| **Papel** | Folios A4, A3, sobres, etiquetas |
| **Escritura** | Bolígrafos, lápices, rotuladores |
| **Corrección** | Correctores, cinta correctora |
| **Clasificación** | Carpetas, archivadores, separadores |
| **Sujeción** | Grapas, clips, chinchetas |
| **Otros** | Pegamento, celo, post-it, tijeras |

### Material No Fungible (Inventariable) 🖥️
Vida útil prolongada, no se consume con el uso.

| Categoría | Ejemplos |
|-----------|----------|
| **Mobiliario** | Mesas, sillas, armarios |
| **Equipos informáticos** | Ordenadores, impresoras |
| **Comunicación** | Teléfonos, centralitas |
| **Reproducción** | Fotocopiadoras, encuadernadoras |
| **Pequeño material** | Grapadoras, perforadoras |

## Consumibles de Equipos

| Equipo | Consumibles |
|--------|-------------|
| Impresora láser | Tóner, kit mantenimiento |
| Impresora inyección | Cartuchos de tinta |
| Fotocopiadora | Tóner, tambor, papel |`,
    keyTerms: ["Material fungible", "Material inventariable", "Consumibles"]
  },
  {
    id: "uf0519-15",
    type: "content",
    title: "3.2 El Aprovisionamiento",
    content: `# La Función de Aprovisionamiento

El **aprovisionamiento** asegura la disponibilidad de materiales necesarios, en el momento oportuno, en cantidad adecuada y al menor coste.

## Objetivos

1. 📦 **Continuidad del suministro**: Evitar roturas de stock
2. 💰 **Optimización de costes**: Minimizar gastos
3. ✅ **Calidad**: Garantizar materiales adecuados
4. 🔄 **Flexibilidad**: Adaptación a cambios
5. 📊 **Control**: Seguimiento de pedidos

## Fases del Proceso

\`\`\`
Detección de necesidad → Búsqueda proveedores → Selección → 
→ Negociación → Pedido → Recepción → Almacenamiento
\`\`\`

## Funciones del Almacén

| Función | Descripción |
|---------|-------------|
| **Recepción** | Verificar y registrar entradas |
| **Conservación** | Mantener en buen estado |
| **Custodia** | Proteger de deterioros/robos |
| **Control** | Registrar movimientos |
| **Expedición** | Preparar y entregar |

## Tipos de Existencias

| Tipo | Descripción |
|------|-------------|
| **De consumo** | Se incorporan al proceso |
| **De reposición** | Piezas de recambio |
| **De seguridad** | Stock mínimo de reserva |
| **En tránsito** | Pedido no recibido aún |`,
    keyTerms: ["Aprovisionamiento", "Almacén", "Stock", "Proveedor"]
  },
  {
    id: "uf0519-16",
    type: "content",
    title: "3.3 La Ficha de Almacén",
    content: `# Gestión de Fichas de Almacén

La **ficha de almacén** registra los movimientos de cada artículo.

## Contenido de la Ficha

| Campo | Descripción |
|-------|-------------|
| **Código** | Identificación única |
| **Descripción** | Nombre y características |
| **Unidad** | Unidades, cajas, etc. |
| **Ubicación** | Lugar en el almacén |
| **Stock mínimo** | Activa el pedido |
| **Stock máximo** | Límite de almacenamiento |
| **Proveedor** | Datos del suministrador |

## Modelo de Ficha

\`\`\`
═══════════════════════════════════════════════════════
                FICHA DE ALMACÉN
═══════════════════════════════════════════════════════
Código: MAT-001       Descripción: Papel A4 (paq. 500h)
Unidad: Paquete       Ubicación: Estantería A - Balda 2
Stock mínimo: 10      Stock máximo: 50
═══════════════════════════════════════════════════════
Fecha │ Concepto    │ Doc.    │ Ent. │ Sal. │ Exist.
══════╪═════════════╪═════════╪══════╪══════╪════════
01/01 │ Saldo inic. │         │      │      │   25
05/01 │ Compra      │ Alb.123 │  20  │      │   45
08/01 │ Consumo     │ Vale 45 │      │   5  │   40
═══════════════════════════════════════════════════════
\`\`\`

## Proceso de Entrada
1. Recepción física
2. Verificación cantidad/estado
3. Comparación con albarán
4. Registro en ficha
5. Ubicación en almacén`,
    keyTerms: ["Ficha de almacén", "Entrada", "Salida", "Existencias"]
  },
  {
    id: "uf0519-17",
    type: "content",
    title: "3.4 Métodos de Valoración: FIFO y PMP",
    content: `# Criterios de Valoración de Existencias

Cuando un artículo tiene **diferentes precios de entrada**, es necesario aplicar un criterio de valoración para las salidas.

## Método FIFO
**"First In, First Out"** (Primera entrada, primera salida)

Las salidas se valoran al precio de las **unidades más antiguas**.

| Ventajas | Inconvenientes |
|----------|----------------|
| Refleja flujo real | Beneficios altos en inflación |
| Valoración actualizada | Más complejo de gestionar |

---

## Método PMP
**Precio Medio Ponderado**

Se calcula un **precio medio** después de cada entrada.

\`\`\`
PMP = (Existencias × Precio anterior + Entradas × Precio entrada)
      ─────────────────────────────────────────────────────────────
                    (Existencias + Entradas)
\`\`\`

| Ventajas | Inconvenientes |
|----------|----------------|
| Sencillo de aplicar | No refleja flujo real |
| Suaviza variaciones | Menor control |

---

## Ejemplo Comparativo

**Datos**: 20 uds. a 3,00€ + Entrada 10 uds. a 3,60€
**Salida**: 15 unidades

| Método | Valoración salida |
|--------|-------------------|
| **FIFO** | 15 × 3,00€ = **45,00€** |
| **PMP** | PMP = 3,20€ → 15 × 3,20€ = **48,00€** |`,
    keyTerms: ["FIFO", "PMP", "Valoración", "Precio medio"]
  },
  {
    id: "uf0519-18",
    type: "content",
    title: "3.5 El Inventario",
    content: `# Control de Existencias: El Inventario

El **inventario** es el recuento físico de todas las existencias de la empresa.

## Tipos de Inventario

| Tipo | Frecuencia | Descripción |
|------|------------|-------------|
| **Periódico** | Anual | Recuento total |
| **Rotativo** | Continuo | Por grupos de artículos |
| **Permanente** | Diario | Registro continuo |

## Proceso del Inventario

1. 📋 **Planificación**: Fechas, equipos, zonas
2. 🏷️ **Preparación**: Ordenar almacén, etiquetas
3. 📦 **Recuento físico**: Contar unidades
4. 📊 **Comparación**: Con registros contables
5. ⚠️ **Investigación**: Causas de diferencias
6. ✅ **Ajustes**: Regularizar inventario

## Estructura del Documento

\`\`\`
═══════════════════════════════════════════════════════
              INVENTARIO DE EXISTENCIAS
              Fecha: 31/12/2024
═══════════════════════════════════════════════════════
Código │ Descripción        │ Uds.Libro │ Uds.Real │ Dif.
═══════╪════════════════════╪═══════════╪══════════╪═════
MAT-01 │ Papel A4           │    40     │    38    │  -2
MAT-15 │ Bolígrafos caja    │    12     │    12    │   0
CON-05 │ Tóner HP           │     5     │     4    │  -1
═══════════════════════════════════════════════════════
\`\`\`

## Causas de Diferencias

- 📉 **Mermas**: Deterioro, caducidad
- ❌ **Errores de registro**: Entradas/salidas
- 🔒 **Hurtos**: Robos internos o externos
- 📦 **Roturas**: Daños en manipulación`,
    keyTerms: ["Inventario", "Recuento", "Diferencias", "Ajuste"]
  },
  {
    id: "uf0519-19",
    type: "exercise",
    title: "Ejercicio: Valoración de Existencias",
    content: "Ordena los pasos del proceso de inventario.",
    exerciseData: {
      type: "order",
      instructions: "Ordena las fases del proceso de inventario:",
      items: [
        { left: "1", right: "Planificación" },
        { left: "2", right: "Preparación del almacén" },
        { left: "3", right: "Recuento físico" },
        { left: "4", right: "Comparación con registros" }
      ]
    }
  },
  {
    id: "uf0519-20",
    type: "summary",
    title: "Resumen UF0519",
    content: `# Resumen de la Unidad Formativa

## UD1 - Documentación Administrativa
- **Pedido**: Solicitud de bienes al proveedor
- **Albarán**: Justificante de entrega
- **Factura**: Documento fiscal de la operación
- **Nómina**: Recibo de salarios del trabajador

## UD2 - Gestión de Tesorería
- **Medios de pago**: Cheque, pagaré, letra de cambio
- **Libro de caja**: Registro de efectivo
- **Libro de bancos**: Registro de cuentas bancarias
- **Conciliación**: Verificación con extracto bancario
- **Arqueo**: Recuento físico de caja

## UD3 - Control de Existencias
- **Material fungible**: Consumible (papel, bolígrafos)
- **Material inventariable**: Duradero (ordenadores)
- **Ficha de almacén**: Registro por artículo
- **FIFO y PMP**: Métodos de valoración
- **Inventario**: Recuento físico de existencias

---

> ✅ **¡Enhorabuena!** Has completado la Unidad Formativa UF0519
> 
> Ahora conoces los documentos fundamentales de la gestión administrativa, económica y de almacén.`,
    keyTerms: ["Resumen", "Documentación", "Tesorería", "Existencias"]
  }
];

// Combine all content
const ALL_SCORM_CONTENT: Record<string, ContentSlide[]> = {
  "UF0517": UF0517_CONTENT,
  "UF0518": UF0518_CONTENT,
  "UF0519": UF0519_CONTENT
};

// Manual PDF downloads
const MANUAL_PDFS: Record<string, { title: string; files: { name: string; url: string }[] }> = {
  "UF0517": {
    title: "UF0517 - Organización Empresarial y de Recursos Humanos",
    files: [
      { name: "UD1 - Organización de entidades públicas y privadas", url: "/documents/manuales/UF0517_UD1_organizacion_entidades.pdf" },
      { name: "UD2 - Organización de los Recursos Humanos", url: "/documents/manuales/UF0517_UD2_recursos_humanos.pdf" }
    ]
  },
  "UF0518": {
    title: "UF0518 - Gestión de la Correspondencia",
    files: [
      { name: "UD1 - Tratamiento de la correspondencia y paquetería", url: "/documents/manuales/UF0518_UD1_correspondencia.pdf" }
    ]
  },
  "UF0519": {
    title: "UF0519 - Documentación Económico-Administrativa",
    files: [
      { name: "UD1 - Documentación administrativa básica", url: "/documents/manuales/UF0519_UD1_documentacion_administrativa.pdf" },
      { name: "UD2 - Gestión básica de tesorería", url: "/documents/manuales/UF0519_UD2_tesoreria.pdf" },
      { name: "UD3 - Gestión y control básico de existencias", url: "/documents/manuales/UF0519_UD3_existencias.pdf" }
    ]
  }
};

export default function ScormContentViewerExtended({
  open,
  onOpenChange,
  unitId,
  unitTitle,
  enrollmentId
}: ScormContentViewerExtendedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [slides, setSlides] = useState<ContentSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, Record<string, string>>>({});
  const [score, setScore] = useState(0);
  const [showPdfMenu, setShowPdfMenu] = useState(false);

  // Detect UF code from unit title
  const getUFCode = useCallback(() => {
    const ufMatch = unitTitle.match(/UF0?5(17|18|19)/i);
    if (ufMatch) {
      return `UF05${ufMatch[1]}`;
    }
    // Fallback based on keywords
    if (unitTitle.toLowerCase().includes("organiza") || unitTitle.toLowerCase().includes("recursos humanos")) {
      return "UF0517";
    } else if (unitTitle.toLowerCase().includes("correspond") || unitTitle.toLowerCase().includes("paqueter")) {
      return "UF0518";
    } else {
      return "UF0519";
    }
  }, [unitTitle]);

  // Load content based on unit
  useEffect(() => {
    if (open) {
      setLoading(true);
      const ufCode = getUFCode();
      const content = ALL_SCORM_CONTENT[ufCode] || UF0519_CONTENT;
      setSlides(content);
      setCurrentSlideIndex(0);
      setLoading(false);
    }
  }, [open, getUFCode]);

  const currentSlide = slides[currentSlideIndex];
  const progress = slides.length > 0 ? ((currentSlideIndex + 1) / slides.length) * 100 : 0;

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
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
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      toast({
        title: "¡Correcto! +10 puntos",
        description: "Excelente trabajo. Sigue así.",
      });
    } else {
      toast({
        title: "Respuesta incorrecta",
        description: "Lee la explicación para entender mejor el concepto.",
        variant: "destructive"
      });
    }
  };

  const toggleHint = (slideId: string) => {
    setShowHint(prev => ({ ...prev, [slideId]: !prev[slideId] }));
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'intro': return <GraduationCap className="h-5 w-5" />;
      case 'content': return <BookOpen className="h-5 w-5" />;
      case 'quiz': return <FileQuestion className="h-5 w-5" />;
      case 'exercise': return <ClipboardList className="h-5 w-5" />;
      case 'summary': return <Award className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getSlideTypeLabel = (type: string) => {
    switch (type) {
      case 'intro': return 'Introducción';
      case 'content': return 'Contenido';
      case 'quiz': return 'Test';
      case 'exercise': return 'Ejercicio';
      case 'summary': return 'Resumen';
      default: return 'Contenido';
    }
  };

  const ufCode = getUFCode();
  const manualInfo = MANUAL_PDFS[ufCode];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BookMarked className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">{unitTitle}</DialogTitle>
                <DialogDescription className="text-sm">
                  Página {currentSlideIndex + 1} de {slides.length} • {Math.round(progress)}% completado
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Score */}
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {score} pts
              </Badge>
              
              {/* Font size controls */}
              <Button variant="ghost" size="icon" onClick={() => setFontSize(prev => Math.max(12, prev - 2))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[40px] text-center">{fontSize}px</span>
              <Button variant="ghost" size="icon" onClick={() => setFontSize(prev => Math.min(24, prev + 2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* PDF Download */}
              {manualInfo && (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowPdfMenu(!showPdfMenu)}
                  >
                    <FileDown className="h-4 w-4" />
                    Descargar Manual
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showPdfMenu && (
                    <Card className="absolute right-0 top-full mt-1 z-50 w-72">
                      <CardContent className="p-2">
                        {manualInfo.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            download
                            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                            onClick={() => setShowPdfMenu(false)}
                          >
                            <FileText className="h-4 w-4 text-red-500" />
                            <span className="text-sm">{file.name}</span>
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <Progress value={progress} className="h-2 mt-3" />
        </DialogHeader>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar - Slide thumbnails */}
          <div className="w-48 border-r bg-muted/30 overflow-y-auto hidden md:block">
            <div className="p-2 space-y-1">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`w-full p-2 rounded-lg text-left text-xs flex items-center gap-2 transition-colors ${
                    index === currentSlideIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-background/50 flex items-center justify-center text-[10px] font-medium">
                    {index + 1}
                  </span>
                  <span className="truncate flex-1">{slide.title.slice(0, 25)}...</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentSlide ? (
              <ScrollArea className="h-full">
                <div className="p-6 max-w-4xl mx-auto" style={{ fontSize: `${fontSize}px` }}>
                  {/* Slide header */}
                  <div className="flex items-center gap-3 mb-6">
                    <Badge variant="outline" className="gap-1">
                      {getSlideIcon(currentSlide.type)}
                      {getSlideTypeLabel(currentSlide.type)}
                    </Badge>
                    {currentSlide.keyTerms && currentSlide.keyTerms.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {currentSlide.keyTerms.map((term, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content based on slide type */}
                  {currentSlide.type === 'quiz' && currentSlide.quiz ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileQuestion className="h-5 w-5 text-primary" />
                          {currentSlide.quiz.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentSlide.quiz.options.map((option) => {
                          const isSelected = quizAnswers[currentSlide.id] === option.id;
                          const hasAnswered = quizResults[currentSlide.id] !== undefined;
                          const isCorrectOption = option.isCorrect;
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleQuizAnswer(currentSlide.id, option.id, option.isCorrect)}
                              disabled={hasAnswered}
                              className={`w-full p-4 text-left rounded-lg border transition-all ${
                                hasAnswered
                                  ? isCorrectOption
                                    ? 'bg-green-100 border-green-500 dark:bg-green-900/30'
                                    : isSelected
                                      ? 'bg-red-100 border-red-500 dark:bg-red-900/30'
                                      : 'opacity-50'
                                  : 'hover:border-primary hover:bg-primary/5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                                  {option.id.toUpperCase()}
                                </span>
                                <span>{option.text}</span>
                                {hasAnswered && isCorrectOption && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                                )}
                                {hasAnswered && isSelected && !isCorrectOption && (
                                  <XCircle className="h-5 w-5 text-red-500 ml-auto" />
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
                            onClick={() => toggleHint(currentSlide.id)}
                            className="mt-2"
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            {showHint[currentSlide.id] ? 'Ocultar pista' : 'Ver pista'}
                          </Button>
                        )}
                        
                        {showHint[currentSlide.id] && currentSlide.quiz.hint && (
                          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm">
                            <span className="font-medium">💡 Pista:</span> {currentSlide.quiz.hint}
                          </div>
                        )}
                        
                        {/* Explanation after answer */}
                        {quizResults[currentSlide.id] !== undefined && (
                          <div className={`p-4 rounded-lg ${
                            quizResults[currentSlide.id] 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <p className="font-medium mb-1">
                              {quizResults[currentSlide.id] ? '✅ ¡Correcto!' : '📖 Explicación:'}
                            </p>
                            <p className="text-sm">{currentSlide.quiz.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : currentSlide.type === 'exercise' && currentSlide.exerciseData ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          Ejercicio Práctico
                        </CardTitle>
                        <CardDescription>{currentSlide.exerciseData.instructions}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {currentSlide.exerciseData.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                              <span className="font-medium text-primary">{item.left}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span>{item.right}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentSlide.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : null}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Página {currentSlideIndex + 1} de {slides.length}
            </span>
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
      </DialogContent>
    </Dialog>
  );
}
