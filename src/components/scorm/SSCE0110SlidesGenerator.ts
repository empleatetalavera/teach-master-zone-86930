// SSCE0110 - Docencia de la Formación Profesional para el Empleo
// Generador completo de contenido pedagógico para los 5 módulos formativos

import { ContentSlide } from './types';

// Extended slide types for SSCE0110
export interface ExtendedContentSlide extends ContentSlide {
  accordionItems?: { id: string; title: string; content: string; icon?: string }[];
  flashcards?: { id: string; front: string; back: string }[];
  imageUrl?: string;
  imageCaption?: string;
  highlightBox?: { type: 'info' | 'warning' | 'tip' | 'important'; content: string };
  processSteps?: { step: number; title: string; description: string }[];
  mindMapData?: { center: string; branches: { label: string; children: string[] }[] };
}

// ================================================================================
// MF1442_3: PROGRAMACIÓN DIDÁCTICA DE ACCIONES FORMATIVAS PARA EL EMPLEO (60h)
// ================================================================================
export const generateMF1442Slides = (): ExtendedContentSlide[] => [
  // INTRODUCCIÓN AL MÓDULO
  {
    id: "mf1442-001",
    type: "intro",
    title: "MF1442_3: Programación Didáctica de Acciones Formativas",
    section: "Introducción",
    content: `# 📚 Programación Didáctica de Acciones Formativas para el Empleo

## 🎯 Objetivo General del Módulo

Programar acciones formativas para el empleo adecuándolas a las características y condiciones de la formación, al perfil de los destinatarios y a la realidad laboral del ámbito profesional.

## ⏱️ Duración: 60 horas

## 📋 Contenidos:

1. Estructura de la Formación Profesional para el Empleo
2. Certificados de Profesionalidad
3. Elaboración de la programación didáctica
4. Elaboración de la programación temporalizada

> **Competencia:** Programar de manera efectiva acciones formativas que respondan a las necesidades del mercado laboral.`,
    keyTerms: ["Programación didáctica", "Formación para el empleo", "Certificados de profesionalidad"]
  },
  {
    id: "mf1442-002",
    type: "content",
    title: "Mapa Conceptual del Módulo",
    section: "Introducción",
    content: `# 🗺️ Mapa Conceptual: Programación Didáctica

\`\`\`
                    ┌─────────────────────────────────┐
                    │   PROGRAMACIÓN DIDÁCTICA        │
                    │   ACCIONES FORMATIVAS           │
                    └────────────────┬────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   ESTRUCTURA    │       │   CERTIFICADOS  │       │  PROGRAMACIÓN   │
│   DEL SISTEMA   │       │     DE PROF.    │       │   DIDÁCTICA     │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
    ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
    ▼         ▼               ▼         ▼               ▼         ▼
┌───────┐ ┌───────┐     ┌───────┐ ┌───────┐     ┌───────┐ ┌───────┐
│Subsis-│ │Norma- │     │Estruc-│ │Modali-│     │Objeti-│ │Conteni│
│temas  │ │tiva   │     │tura   │ │dades  │     │vos    │ │dos    │
└───────┘ └───────┘     └───────┘ └───────┘     └───────┘ └───────┘
\`\`\`

## 🔑 Conceptos Clave

- **Sistema Nacional de Cualificaciones**: Marco de referencia
- **Certificados de Profesionalidad**: Acreditación oficial
- **Programación Didáctica**: Planificación de la formación`,
    keyTerms: ["Mapa conceptual", "Sistema formación", "Cualificaciones"]
  },
  {
    id: "mf1442-003",
    type: "content",
    title: "Objetivos de Aprendizaje",
    section: "Introducción",
    content: `# 🎯 Objetivos de Aprendizaje del MF1442_3

## Al finalizar este módulo serás capaz de:

### Conocimientos (Saber)
1. ✅ **Identificar** la estructura del sistema de Formación Profesional para el Empleo
2. ✅ **Conocer** la normativa reguladora de los certificados de profesionalidad
3. ✅ **Comprender** los elementos de la programación didáctica
4. ✅ **Distinguir** los tipos de contenidos formativos

### Habilidades (Saber hacer)
1. 🔧 **Analizar** perfiles profesionales y competencias asociadas
2. 🔧 **Elaborar** programaciones didácticas completas
3. 🔧 **Secuenciar** contenidos de manera lógica y pedagógica
4. 🔧 **Temporalizar** acciones formativas adecuadamente

### Actitudes (Saber ser)
1. 💡 **Mostrar** rigor en la planificación formativa
2. 💡 **Valorar** la importancia de la programación previa
3. 💡 **Adaptar** la programación a las necesidades reales

> **Criterio de evaluación:** Demostrar capacidad para elaborar una programación didáctica completa.`,
    keyTerms: ["Objetivos", "Competencias", "Criterios evaluación"]
  },
  // SECCIÓN 1: ESTRUCTURA DE LA FPE
  {
    id: "mf1442-004",
    type: "content",
    title: "1.1 El Sistema de Formación Profesional para el Empleo",
    section: "1. Estructura de la FPE",
    content: `# 🏛️ Sistema de Formación Profesional para el Empleo

## Definición

El **Sistema de Formación Profesional para el Empleo** es el conjunto de instrumentos y acciones que tienen por objeto impulsar y extender entre las empresas y los trabajadores una formación que responda a sus necesidades.

## 📊 Estructura del Sistema

| Elemento | Descripción |
|----------|-------------|
| **Formación de demanda** | Acciones formativas planificadas por las empresas |
| **Formación de oferta** | Programas dirigidos prioritariamente a trabajadores |
| **Formación en alternancia** | Combina formación y trabajo |
| **Acciones de apoyo** | Acompañamiento, investigación, innovación |

## 🔑 Principios Básicos

- **Universalidad**: Acceso a todos los trabajadores
- **Calidad**: Mejora continua del sistema
- **Transparencia**: Información accesible
- **Vinculación laboral**: Conexión con necesidades del mercado`,
    keyTerms: ["FPE", "Formación de demanda", "Formación de oferta"]
  },
  {
    id: "mf1442-005",
    type: "content",
    title: "1.2 Marco Normativo de la FPE",
    section: "1. Estructura de la FPE",
    content: `# 📜 Marco Normativo de la Formación Profesional

## Legislación Básica

### Ley Orgánica 3/2022, de 31 de marzo
**De ordenación e integración de la Formación Profesional**

- Integra formación profesional del sistema educativo y para el empleo
- Establece el Sistema Nacional de Cualificaciones Profesionales
- Define los Certificados de Profesionalidad

### Real Decreto 34/2008
**Regulación de los Certificados de Profesionalidad**

- Estructura y contenido de los certificados
- Requisitos de los formadores
- Modalidades de impartición

## 📋 Catálogo Nacional de Cualificaciones Profesionales

| Nivel | Descripción |
|-------|-------------|
| **Nivel 1** | Competencia en un conjunto pequeño de actividades simples |
| **Nivel 2** | Competencia en actividades bien determinadas con cierta autonomía |
| **Nivel 3** | Competencia en actividades que requieren dominio de técnicas y se desarrollan con autonomía |

> **💡 Importante:** Los certificados de profesionalidad acreditan competencias del CNCP.`,
    keyTerms: ["Ley FP", "CNCP", "Niveles cualificación"]
  },
  {
    id: "mf1442-006",
    type: "quiz",
    title: "Autoevaluación: Sistema FPE",
    section: "1. Estructura de la FPE",
    content: `# ❓ Comprueba tu Aprendizaje`,
    keyTerms: ["Test", "Autoevaluación"],
    quiz: {
      id: "quiz-mf1442-001",
      question: "¿Cuál es la función principal del Sistema de Formación Profesional para el Empleo?",
      options: [
        { id: "a", text: "Proporcionar títulos universitarios", isCorrect: false },
        { id: "b", text: "Impulsar formación que responda a necesidades de empresas y trabajadores", isCorrect: true },
        { id: "c", text: "Regular únicamente la formación de desempleados", isCorrect: false },
        { id: "d", text: "Sustituir al sistema educativo tradicional", isCorrect: false }
      ],
      explanation: "El Sistema FPE tiene como objetivo impulsar y extender entre empresas y trabajadores una formación que responda a sus necesidades, mejorando su empleabilidad y competitividad.",
      hint: "Piensa en quiénes son los beneficiarios principales del sistema."
    }
  },
  // SECCIÓN 2: CERTIFICADOS DE PROFESIONALIDAD
  {
    id: "mf1442-007",
    type: "content",
    title: "2.1 Los Certificados de Profesionalidad",
    section: "2. Certificados de Profesionalidad",
    content: `# 📜 Certificados de Profesionalidad

## Definición

Los **Certificados de Profesionalidad** son el instrumento de acreditación oficial de las cualificaciones profesionales del Catálogo Nacional de Cualificaciones Profesionales.

## 🏆 Características

- **Carácter oficial** y validez en todo el territorio nacional
- **Acreditan** el conjunto de competencias profesionales
- **Configurados** por unidades de competencia
- **Estructura modular** que facilita el aprendizaje

## 📊 Estructura de un Certificado

\`\`\`
┌─────────────────────────────────────────────┐
│          CERTIFICADO DE PROFESIONALIDAD     │
├─────────────────────────────────────────────┤
│  ┌───────────────┐   ┌───────────────┐     │
│  │  Módulo MF1   │   │  Módulo MF2   │     │
│  ├───────────────┤   ├───────────────┤     │
│  │ Unidad UF1.1  │   │ Unidad UF2.1  │     │
│  │ Unidad UF1.2  │   │ Unidad UF2.2  │     │
│  └───────────────┘   └───────────────┘     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   Módulo de Prácticas Profesionales │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
\`\`\``,
    keyTerms: ["Certificado profesionalidad", "Cualificación", "Módulos formativos"]
  },
  {
    id: "mf1442-008",
    type: "content",
    title: "2.2 Estructura de los Módulos Formativos",
    section: "2. Certificados de Profesionalidad",
    content: `# 📦 Estructura de los Módulos Formativos

## Componentes de un Módulo Formativo

### 1. Identificación
- **Denominación**: Nombre del módulo
- **Código**: Identificador único (ej: MF1442_3)
- **Nivel**: De cualificación profesional (1, 2 o 3)
- **Duración**: En horas

### 2. Capacidades y Criterios de Evaluación

| Capacidad | Criterios de Evaluación |
|-----------|-------------------------|
| C1: Analizar... | CE1.1, CE1.2, CE1.3... |
| C2: Elaborar... | CE2.1, CE2.2, CE2.3... |
| C3: Aplicar... | CE3.1, CE3.2, CE3.3... |

### 3. Contenidos
- Contenidos teóricos
- Contenidos prácticos
- Secuenciación lógica

### 4. Requisitos
- **Espacios**: Aula, taller, etc.
- **Formadores**: Titulación y experiencia
- **Equipamientos**: Materiales necesarios

> **💡 Importante:** Las UF son unidades formativas más pequeñas dentro de un MF.`,
    keyTerms: ["Módulo formativo", "Capacidades", "Criterios evaluación"]
  },
  // SECCIÓN 3: PROGRAMACIÓN DIDÁCTICA
  {
    id: "mf1442-009",
    type: "content",
    title: "3.1 Elementos de la Programación Didáctica",
    section: "3. Programación Didáctica",
    content: `# 📝 Elementos de la Programación Didáctica

## ¿Qué es la Programación Didáctica?

Es el **instrumento de planificación** que guía la intervención del formador, organizando el proceso de enseñanza-aprendizaje.

## 📋 Elementos Fundamentales

### 1. Objetivos
- **Generales**: Del módulo formativo
- **Específicos**: De cada unidad didáctica

### 2. Contenidos
| Tipo | Descripción |
|------|-------------|
| **Conceptuales** | Datos, hechos, conceptos, principios |
| **Procedimentales** | Habilidades, técnicas, estrategias |
| **Actitudinales** | Valores, actitudes, normas |

### 3. Metodología
- Estrategias didácticas
- Técnicas de enseñanza
- Recursos a utilizar

### 4. Temporalización
- Distribución del tiempo
- Secuenciación de actividades

### 5. Evaluación
- Criterios e indicadores
- Instrumentos de evaluación
- Momentos de evaluación`,
    keyTerms: ["Programación", "Objetivos", "Contenidos", "Metodología"]
  },
  {
    id: "mf1442-010",
    type: "content",
    title: "3.2 Formulación de Objetivos",
    section: "3. Programación Didáctica",
    content: `# 🎯 Formulación de Objetivos de Aprendizaje

## Taxonomía de Bloom

Los objetivos deben formularse siguiendo verbos de acción según el nivel cognitivo:

### Niveles Cognitivos

| Nivel | Verbos | Ejemplo |
|-------|--------|---------|
| **Recordar** | Identificar, enumerar, definir | "Identificar los tipos de empresa" |
| **Comprender** | Explicar, describir, resumir | "Explicar la estructura organizativa" |
| **Aplicar** | Utilizar, resolver, demostrar | "Aplicar técnicas de comunicación" |
| **Analizar** | Comparar, clasificar, distinguir | "Analizar documentos administrativos" |
| **Evaluar** | Valorar, juzgar, argumentar | "Evaluar propuestas formativas" |
| **Crear** | Diseñar, elaborar, planificar | "Diseñar una unidad didáctica" |

## ✅ Características de un Buen Objetivo (SMART)

- **S**pecífico: Claro y concreto
- **M**edible: Cuantificable
- **A**lcanzable: Realista
- **R**elevante: Significativo
- **T**emporal: Con plazo definido

> **Ejemplo:** "Al finalizar la sesión, el alumno será capaz de **elaborar** una programación didáctica básica siguiendo los elementos establecidos."`,
    keyTerms: ["Objetivos", "Taxonomía Bloom", "SMART"]
  },
  {
    id: "mf1442-011",
    type: "checklist",
    title: "Checklist: Elementos Programación",
    section: "3. Programación Didáctica",
    content: `# ✅ Lista de Verificación: Programación Didáctica Completa`,
    keyTerms: ["Checklist", "Verificación"],
    checklistItems: [
      { id: "ch1", text: "Datos identificativos del módulo/UF" },
      { id: "ch2", text: "Objetivos generales y específicos formulados" },
      { id: "ch3", text: "Contenidos clasificados (conceptuales, procedimentales, actitudinales)" },
      { id: "ch4", text: "Metodología y estrategias didácticas definidas" },
      { id: "ch5", text: "Actividades de enseñanza-aprendizaje diseñadas" },
      { id: "ch6", text: "Recursos y materiales identificados" },
      { id: "ch7", text: "Temporalización establecida" },
      { id: "ch8", text: "Criterios e instrumentos de evaluación" },
      { id: "ch9", text: "Medidas de atención a la diversidad" },
      { id: "ch10", text: "Bibliografía y webgrafía" }
    ]
  },
  {
    id: "mf1442-012",
    type: "summary",
    title: "Resumen del Módulo MF1442_3",
    section: "Resumen",
    content: `# 📚 Resumen: Programación Didáctica

## 🔑 Conceptos Clave

### Sistema FPE
- Formación de demanda, oferta y alternancia
- Regulado por Ley Orgánica 3/2022
- Vinculado al mercado laboral

### Certificados de Profesionalidad
- Acreditación oficial de competencias
- Estructura modular (MF → UF)
- Tres niveles de cualificación

### Programación Didáctica
- **Objetivos**: Qué queremos conseguir
- **Contenidos**: Qué vamos a enseñar
- **Metodología**: Cómo lo enseñaremos
- **Evaluación**: Cómo comprobaremos el aprendizaje

## 💡 Ideas Fundamentales

1. La programación es la **hoja de ruta** del formador
2. Debe ser **flexible** y adaptable
3. Los objetivos guían todo el proceso
4. La evaluación es **continua** e integrada

> **Recuerda:** Una buena programación es la base de una formación de calidad.`,
    keyTerms: ["Resumen", "Síntesis", "Conceptos clave"]
  }
];

// ================================================================================
// MF1443_3: SELECCIÓN, ELABORACIÓN, ADAPTACIÓN Y UTILIZACIÓN DE MATERIALES (90h)
// ================================================================================
export const generateMF1443Slides = (): ExtendedContentSlide[] => [
  {
    id: "mf1443-001",
    type: "intro",
    title: "MF1443_3: Materiales, Medios y Recursos Didácticos",
    section: "Introducción",
    content: `# 🎨 Selección, Elaboración, Adaptación y Utilización de Materiales

## 🎯 Objetivo General del Módulo

Seleccionar, elaborar, adaptar y utilizar materiales, medios y recursos didácticos para el desarrollo de contenidos formativos.

## ⏱️ Duración: 90 horas

## 📋 Contenidos:

1. Diseño y elaboración de material didáctico impreso
2. Planificación y utilización de medios y recursos gráficos
3. Diseño y elaboración de materiales multimedia
4. Utilización de la web como recurso didáctico

> **Competencia:** Crear y adaptar materiales didácticos eficaces para diferentes contextos formativos.`,
    keyTerms: ["Materiales didácticos", "Recursos", "Medios audiovisuales"]
  },
  {
    id: "mf1443-002",
    type: "content",
    title: "Mapa Conceptual: Materiales y Recursos",
    section: "Introducción",
    content: `# 🗺️ Mapa Conceptual: Recursos Didácticos

\`\`\`
                    ┌─────────────────────────────┐
                    │   RECURSOS DIDÁCTICOS       │
                    └──────────────┬──────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  IMPRESOS    │          │ AUDIOVISUALES│          │  DIGITALES   │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
  ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
  ▼         ▼               ▼         ▼               ▼         ▼
┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐
│Manua│  │Guías│       │Vídeo│  │Audio│       │ Web │  │Multi│
│les  │  │     │       │     │  │     │       │     │  │media│
└─────┘  └─────┘       └─────┘  └─────┘       └─────┘  └─────┘
\`\`\`

## 🎯 Criterios de Selección
- **Adecuación** al objetivo formativo
- **Accesibilidad** para todos los participantes
- **Actualización** de los contenidos`,
    keyTerms: ["Recursos", "Clasificación", "Criterios selección"]
  },
  {
    id: "mf1443-003",
    type: "content",
    title: "Objetivos de Aprendizaje",
    section: "Introducción",
    content: `# 🎯 Objetivos de Aprendizaje del MF1443_3

## Al finalizar este módulo serás capaz de:

### Conocimientos
1. ✅ **Identificar** tipos de materiales didácticos según su función
2. ✅ **Conocer** las características de los diferentes medios
3. ✅ **Comprender** principios del diseño gráfico educativo

### Habilidades
1. 🔧 **Diseñar** materiales impresos didácticos
2. 🔧 **Crear** presentaciones multimedia efectivas
3. 🔧 **Elaborar** contenidos para plataformas e-learning
4. 🔧 **Adaptar** recursos a diferentes públicos objetivo

### Actitudes
1. 💡 **Valorar** la innovación en recursos didácticos
2. 💡 **Mostrar** creatividad en el diseño de materiales
3. 💡 **Respetar** derechos de autor y propiedad intelectual

> **Resultado de aprendizaje:** Crear un dossier de materiales didácticos originales.`,
    keyTerms: ["Objetivos", "Competencias", "Diseño didáctico"]
  },
  // SECCIÓN 1: MATERIAL DIDÁCTICO IMPRESO
  {
    id: "mf1443-004",
    type: "content",
    title: "1.1 Diseño de Material Impreso",
    section: "1. Material Didáctico Impreso",
    content: `# 📄 Diseño de Material Didáctico Impreso

## Tipos de Material Impreso

| Material | Función | Características |
|----------|---------|-----------------|
| **Manual del alumno** | Guía de estudio | Contenidos estructurados, ejercicios |
| **Guía didáctica** | Orientación metodológica | Objetivos, actividades, evaluación |
| **Fichas de trabajo** | Práctica activa | Ejercicios, casos prácticos |
| **Documentación de apoyo** | Ampliación | Artículos, normativa, ejemplos |

## 🎨 Principios de Diseño

### 1. Legibilidad
- Tipografía clara (mínimo 11pt)
- Interlineado adecuado (1.5)
- Márgenes amplios

### 2. Estructura Visual
- Títulos y subtítulos jerarquizados
- Uso de viñetas y numeración
- Tablas y gráficos explicativos

### 3. Recursos Visuales
- Iconos y pictogramas
- Esquemas y diagramas
- Imágenes ilustrativas

> **💡 Consejo:** Menos es más. Evita sobrecargar las páginas.`,
    keyTerms: ["Material impreso", "Diseño", "Legibilidad"]
  },
  {
    id: "mf1443-005",
    type: "content",
    title: "1.2 Elaboración de Guías Didácticas",
    section: "1. Material Didáctico Impreso",
    content: `# 📘 Elaboración de Guías Didácticas

## Estructura de una Guía Didáctica

### 1. Presentación
- Bienvenida y orientaciones generales
- Datos del curso/módulo
- Perfil del destinatario

### 2. Objetivos y Competencias
- Objetivos generales y específicos
- Competencias a desarrollar
- Resultados de aprendizaje

### 3. Contenidos
- Índice detallado
- Resumen de cada unidad
- Mapa conceptual general

### 4. Metodología
- Actividades propuestas
- Recursos a utilizar
- Temporalización orientativa

### 5. Evaluación
- Criterios de evaluación
- Tipos de pruebas
- Sistema de calificación

### 6. Bibliografía y Recursos
- Referencias bibliográficas
- Enlaces web recomendados
- Material complementario

> **Recuerda:** La guía debe ser una **herramienta de trabajo**, no solo un documento informativo.`,
    keyTerms: ["Guía didáctica", "Estructura", "Contenidos"]
  },
  {
    id: "mf1443-006",
    type: "quiz",
    title: "Test: Material Didáctico Impreso",
    section: "1. Material Didáctico Impreso",
    content: `# ❓ Comprueba tu Aprendizaje`,
    keyTerms: ["Test", "Autoevaluación"],
    quiz: {
      id: "quiz-mf1443-001",
      question: "¿Cuál es el tamaño de fuente mínimo recomendado para material didáctico impreso?",
      options: [
        { id: "a", text: "8 puntos", isCorrect: false },
        { id: "b", text: "10 puntos", isCorrect: false },
        { id: "c", text: "11 puntos", isCorrect: true },
        { id: "d", text: "14 puntos", isCorrect: false }
      ],
      explanation: "Para garantizar la legibilidad del material impreso, se recomienda un tamaño mínimo de 11 puntos, junto con un interlineado de 1.5 y márgenes amplios.",
      hint: "Piensa en la comodidad de lectura durante períodos prolongados."
    }
  },
  // SECCIÓN 2: MEDIOS AUDIOVISUALES
  {
    id: "mf1443-007",
    type: "content",
    title: "2.1 Planificación de Medios Gráficos",
    section: "2. Medios y Recursos Gráficos",
    content: `# 🖼️ Planificación de Medios Gráficos

## Tipos de Medios Gráficos

### Recursos Proyectables
| Medio | Ventajas | Limitaciones |
|-------|----------|--------------|
| **Presentaciones** | Versatilidad, impacto visual | Requiere equipamiento |
| **Vídeos** | Realismo, motivación | Pasividad del alumno |
| **Pizarra digital** | Interactividad | Coste elevado |

### Recursos No Proyectables
| Medio | Ventajas | Limitaciones |
|-------|----------|--------------|
| **Pizarra tradicional** | Inmediatez, flexibilidad | Efímero |
| **Pósters** | Permanencia, visibilidad | Estático |
| **Maquetas** | Tangibilidad | Coste, almacenamiento |

## 🎨 Principios del Diseño Visual

1. **Simplicidad**: Mensaje claro y directo
2. **Contraste**: Facilita la lectura
3. **Repetición**: Coherencia visual
4. **Alineación**: Orden y profesionalidad
5. **Proximidad**: Agrupa elementos relacionados`,
    keyTerms: ["Medios gráficos", "Diseño visual", "Presentaciones"]
  },
  {
    id: "mf1443-008",
    type: "content",
    title: "2.2 Elaboración de Presentaciones Efectivas",
    section: "2. Medios y Recursos Gráficos",
    content: `# 🎬 Creación de Presentaciones Efectivas

## Regla 10-20-30

| Elemento | Recomendación |
|----------|---------------|
| **10 diapositivas** | Máximo para mantener atención |
| **20 minutos** | Duración óptima de exposición |
| **30 puntos** | Tamaño mínimo de fuente |

## ✅ Buenas Prácticas

### Diseño
- Una idea por diapositiva
- Texto mínimo (máx. 6 líneas)
- Imágenes de calidad y relevantes
- Fondo limpio y colores coherentes

### Contenido
- Títulos descriptivos
- Viñetas, no párrafos
- Datos visualizados en gráficos
- Ejemplos y casos prácticos

### Presentación
- Ensayar previamente
- Contacto visual con la audiencia
- No leer las diapositivas
- Usar el puntero con moderación

## ⚠️ Errores Comunes a Evitar

- ❌ Demasiado texto
- ❌ Animaciones excesivas
- ❌ Colores que dificultan la lectura
- ❌ Imágenes de baja calidad
- ❌ Información desorganizada`,
    keyTerms: ["Presentaciones", "Regla 10-20-30", "Diseño visual"]
  },
  // SECCIÓN 3: MATERIALES MULTIMEDIA
  {
    id: "mf1443-009",
    type: "content",
    title: "3.1 Diseño de Materiales Multimedia",
    section: "3. Materiales y Recursos Multimedia",
    content: `# 💻 Diseño de Materiales Multimedia

## Características del Multimedia Educativo

### Ventajas
- **Interactividad**: Participación activa del alumno
- **Multimedialidad**: Combina texto, imagen, audio, vídeo
- **Personalización**: Ritmo de aprendizaje individual
- **Retroalimentación**: Respuesta inmediata

### Tipos de Recursos Multimedia

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Tutoriales** | Guía paso a paso | Vídeo explicativo |
| **Simuladores** | Entorno de práctica | Simulador de software |
| **Juegos educativos** | Aprendizaje lúdico | Quiz interactivo |
| **Animaciones** | Procesos dinámicos | Infografía animada |

## 🎯 Principios del Diseño Multimedia (Mayer)

1. **Principio de coherencia**: Eliminar elementos innecesarios
2. **Principio de señalización**: Destacar información clave
3. **Principio de redundancia**: No duplicar canales
4. **Principio de contigüidad**: Proximidad de elementos relacionados`,
    keyTerms: ["Multimedia", "Interactividad", "Principios Mayer"]
  },
  {
    id: "mf1443-010",
    type: "content",
    title: "3.2 La Web como Recurso Didáctico",
    section: "3. Materiales y Recursos Multimedia",
    content: `# 🌐 La Web como Recurso Didáctico

## Herramientas Web para la Formación

### Plataformas LMS
- **Moodle**: Código abierto, muy personalizable
- **Canvas**: Intuitivo, buena integración
- **Chamilo**: Sencillo, orientado a formación

### Herramientas de Creación de Contenidos
| Categoría | Herramientas |
|-----------|--------------|
| **Presentaciones** | Canva, Genially, Prezi |
| **Vídeos** | Loom, Screencast-O-Matic |
| **Cuestionarios** | Kahoot, Quizizz, Google Forms |
| **Infografías** | Piktochart, Venngage |
| **Mapas mentales** | Miro, Coggle, MindMeister |

## ⚠️ Criterios para Evaluar Recursos Web

- **Autoría**: ¿Quién ha creado el contenido?
- **Actualización**: ¿Está al día?
- **Objetividad**: ¿Es información veraz?
- **Usabilidad**: ¿Es fácil de usar?
- **Accesibilidad**: ¿Cumple estándares WCAG?

> **💡 Consejo:** Siempre verifica la fiabilidad de las fuentes antes de usar recursos web.`,
    keyTerms: ["Web 2.0", "LMS", "Herramientas digitales"]
  },
  {
    id: "mf1443-011",
    type: "summary",
    title: "Resumen del Módulo MF1443_3",
    section: "Resumen",
    content: `# 📚 Resumen: Materiales y Recursos Didácticos

## 🔑 Conceptos Clave

### Material Impreso
- Manuales, guías, fichas de trabajo
- Principios de legibilidad y diseño
- Estructura clara y jerarquizada

### Medios Gráficos y Audiovisuales
- Regla 10-20-30 para presentaciones
- Principios C.R.A.P. de diseño visual
- Equilibrio entre innovación y eficacia

### Recursos Multimedia y Web
- Interactividad y personalización
- Principios de diseño multimedia (Mayer)
- Herramientas digitales para la formación

## 💡 Ideas Fundamentales

1. Los materiales deben **adaptarse al objetivo** formativo
2. **Menos es más**: evitar sobrecarga informativa
3. La **interactividad** mejora el aprendizaje
4. Combinar diferentes **tipos de recursos**
5. Evaluar siempre la **calidad y fiabilidad**

> **Recuerda:** Un buen material didáctico facilita el aprendizaje, no lo sustituye.`,
    keyTerms: ["Resumen", "Síntesis", "Materiales didácticos"]
  }
];

// ================================================================================
// MF1444_3: IMPARTICIÓN Y TUTORIZACIÓN DE ACCIONES FORMATIVAS (120h)
// ================================================================================
export const generateMF1444Slides = (): ExtendedContentSlide[] => [
  {
    id: "mf1444-001",
    type: "intro",
    title: "MF1444_3: Impartición y Tutorización de Acciones Formativas",
    section: "Introducción",
    content: `# 👨‍🏫 Impartición y Tutorización de Acciones Formativas

## 🎯 Objetivo General del Módulo

Impartir y tutorizar acciones formativas para el empleo utilizando técnicas, estrategias y recursos didácticos.

## ⏱️ Duración: 120 horas

### Unidades Formativas:
- **UF1645**: Impartición de acciones formativas (70h)
- **UF1646**: Tutorización de acciones formativas (30h)
- **Prácticas no laborales**: (20h)

## 📋 Competencias a Desarrollar:

1. Establecer condiciones para favorecer el desarrollo del proceso de aprendizaje
2. Impartir contenidos formativos del programa utilizando técnicas didácticas
3. Proponer, dinamizar y supervisar actividades de aprendizaje
4. Asesorar a los alumnos en el uso de estrategias de aprendizaje

> **Rol del formador:** Facilitador del aprendizaje, no mero transmisor de información.`,
    keyTerms: ["Impartición", "Tutorización", "Técnicas didácticas"]
  },
  {
    id: "mf1444-002",
    type: "content",
    title: "Mapa Conceptual: Competencias Docentes",
    section: "Introducción",
    content: `# 🗺️ Mapa Conceptual: Competencias del Formador

\`\`\`
                    ┌─────────────────────────────┐
                    │   COMPETENCIAS DOCENTES     │
                    └──────────────┬──────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   TÉCNICAS   │          │    SOCIALES   │         │  PERSONALES  │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
  ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
  ▼         ▼               ▼         ▼               ▼         ▼
┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐
│Cono-│  │Meto-│       │Comu-│  │Dina-│       │Moti-│  │Flexi│
│cimi-│  │dolo-│       │nica-│  │miza-│       │va-  │  │bili-│
│ento │  │gía  │       │ción │  │ción │       │ción │  │dad  │
└─────┘  └─────┘       └─────┘  └─────┘       └─────┘  └─────┘
\`\`\`

## 🎯 Perfil del Formador Competente

- **Domina** los contenidos de su especialidad
- **Conoce** técnicas y métodos didácticos
- **Comunica** de forma clara y efectiva
- **Motiva** y dinamiza grupos
- **Adapta** su actuación a las necesidades`,
    keyTerms: ["Competencias", "Perfil docente", "Habilidades"]
  },
  // UF1645: IMPARTICIÓN
  {
    id: "mf1444-003",
    type: "content",
    title: "1.1 El Proceso de Enseñanza-Aprendizaje",
    section: "UF1645: Impartición",
    content: `# 📚 El Proceso de Enseñanza-Aprendizaje

## Concepto

Es la **interacción** entre formador y alumnos orientada a la adquisición de conocimientos, habilidades y actitudes.

## 🔄 Elementos del Proceso

| Elemento | Función |
|----------|---------|
| **Formador** | Facilita, orienta, evalúa |
| **Alumno** | Construye su aprendizaje |
| **Contenidos** | Objeto del aprendizaje |
| **Metodología** | Cómo se desarrolla |
| **Recursos** | Medios de apoyo |
| **Contexto** | Entorno de aprendizaje |

## 🧠 Teorías del Aprendizaje

### Conductismo
- Aprendizaje por estímulo-respuesta
- Refuerzo y repetición

### Cognitivismo
- Procesamiento de la información
- Estructuras mentales

### Constructivismo
- El alumno construye su conocimiento
- Aprendizaje significativo

> **💡 Importante:** El formador actual debe integrar diferentes enfoques según el contexto.`,
    keyTerms: ["Enseñanza-aprendizaje", "Teorías", "Constructivismo"]
  },
  {
    id: "mf1444-004",
    type: "content",
    title: "1.2 Técnicas Didácticas",
    section: "UF1645: Impartición",
    content: `# 🎓 Técnicas Didácticas para la Impartición

## Clasificación de Técnicas

### Técnicas Expositivas
| Técnica | Descripción | Cuándo usar |
|---------|-------------|-------------|
| **Lección magistral** | Exposición oral del formador | Contenidos teóricos |
| **Demostración** | Mostrar cómo se hace | Procedimientos |
| **Conferencia** | Ponencia de experto | Temas especializados |

### Técnicas de Descubrimiento
| Técnica | Descripción | Cuándo usar |
|---------|-------------|-------------|
| **Estudio de casos** | Análisis de situaciones reales | Toma de decisiones |
| **Resolución de problemas** | Buscar soluciones | Aplicación práctica |
| **Investigación** | Búsqueda de información | Autonomía |

### Técnicas de Trabajo en Grupo
| Técnica | Descripción | Cuándo usar |
|---------|-------------|-------------|
| **Phillips 66** | Grupos de 6, 6 minutos | Participación masiva |
| **Brainstorming** | Tormenta de ideas | Creatividad |
| **Role-playing** | Dramatización | Habilidades sociales |
| **Debate** | Discusión estructurada | Argumentación |

> **Consejo:** Combina diferentes técnicas para mantener la motivación.`,
    keyTerms: ["Técnicas didácticas", "Metodología", "Trabajo en grupo"]
  },
  {
    id: "mf1444-005",
    type: "content",
    title: "1.3 La Comunicación Didáctica",
    section: "UF1645: Impartición",
    content: `# 🗣️ La Comunicación Didáctica

## Elementos de la Comunicación

\`\`\`
┌──────────┐         ┌──────────┐         ┌──────────┐
│  EMISOR  │ ──────▶ │  MENSAJE │ ──────▶ │ RECEPTOR │
│(Formador)│         │          │         │ (Alumno) │
└──────────┘         └──────────┘         └──────────┘
      ▲                   │                     │
      │                   ▼                     │
      │            ┌──────────┐                 │
      └────────────│  CANAL   │◀────────────────┘
                   └──────────┘
                        │
                   FEEDBACK
\`\`\`

## 🎯 Comunicación Verbal

### Técnicas de Oratoria
- **Voz**: Volumen, tono, ritmo, pausas
- **Vocabulario**: Adaptado al público
- **Estructura**: Introducción, desarrollo, conclusión
- **Ejemplos**: Concretos y cercanos

## 👁️ Comunicación No Verbal

| Elemento | Recomendación |
|----------|---------------|
| **Contacto visual** | Distribuir mirada |
| **Postura** | Abierta, dinámica |
| **Gestos** | Naturales, refuerzan mensaje |
| **Expresión facial** | Coherente, motivadora |
| **Desplazamiento** | Moverse por el espacio |

> **Recuerda:** El 70% de la comunicación es no verbal.`,
    keyTerms: ["Comunicación", "Oratoria", "Lenguaje no verbal"]
  },
  {
    id: "mf1444-006",
    type: "content",
    title: "1.4 Dinamización del Grupo de Aprendizaje",
    section: "UF1645: Impartición",
    content: `# 👥 Dinamización del Grupo de Aprendizaje

## Fases de Desarrollo Grupal

| Fase | Características | Rol del formador |
|------|-----------------|------------------|
| **Formación** | Expectativa, incertidumbre | Acoger, presentar |
| **Tormenta** | Conflictos, resistencias | Mediar, orientar |
| **Normalización** | Cohesión, normas | Consolidar, motivar |
| **Rendimiento** | Productividad | Facilitar, supervisar |
| **Clausura** | Cierre, despedida | Evaluar, reconocer |

## 🎭 Tipología de Participantes

### Perfiles y Estrategias

| Tipo | Comportamiento | Estrategia |
|------|----------------|------------|
| **Participativo** | Colabora activamente | Potenciar su participación |
| **Tímido** | Participa poco | Preguntas directas, refuerzo |
| **Dominante** | Monopoliza | Limitar intervenciones |
| **Crítico** | Cuestiona todo | Canalizar constructivamente |
| **Distraído** | Desconecta | Actividades prácticas |

## 💡 Técnicas de Dinamización

1. **Rompehielos**: Actividades iniciales para crear clima
2. **Energizadores**: Dinámicas para reactivar la atención
3. **Técnicas de cohesión**: Actividades colaborativas
4. **Gestión del tiempo**: Pausas y cambios de actividad`,
    keyTerms: ["Dinamización", "Grupos", "Participantes difíciles"]
  },
  // UF1646: TUTORIZACIÓN
  {
    id: "mf1444-007",
    type: "content",
    title: "2.1 La Función Tutorial",
    section: "UF1646: Tutorización",
    content: `# 📋 La Función Tutorial en Formación

## Concepto de Tutorización

La **tutorización** es el proceso de acompañamiento, seguimiento y orientación al alumno durante su formación.

## 🎯 Funciones del Tutor

### En Formación Presencial
- Resolver dudas y consultas
- Orientar en el estudio
- Motivar y reforzar positivamente
- Hacer seguimiento del progreso

### En Formación Online
- Guiar el aprendizaje autónomo
- Moderar foros y debates
- Proporcionar retroalimentación
- Gestionar la comunicación asíncrona

## 📊 Modalidades de Tutorización

| Modalidad | Características | Herramientas |
|-----------|-----------------|--------------|
| **Individual** | Atención personalizada | Email, teléfono, chat |
| **Grupal** | Resolución colectiva | Foros, videoconferencia |
| **Presencial** | Contacto directo | Aula, despacho |
| **Online** | A distancia | Plataforma LMS |

> **💡 Importante:** La tutorización es clave para prevenir el abandono en formación online.`,
    keyTerms: ["Tutorización", "Acompañamiento", "Seguimiento"]
  },
  {
    id: "mf1444-008",
    type: "content",
    title: "2.2 Estrategias de Aprendizaje",
    section: "UF1646: Tutorización",
    content: `# 🧠 Estrategias de Aprendizaje

## Tipos de Estrategias

### 1. Estrategias Cognitivas
- **Repetición**: Memorización activa
- **Elaboración**: Relacionar con conocimientos previos
- **Organización**: Esquemas, mapas conceptuales

### 2. Estrategias Metacognitivas
- **Planificación**: Establecer metas y tiempos
- **Supervisión**: Control del proceso
- **Evaluación**: Autoevaluación del aprendizaje

### 3. Estrategias de Gestión de Recursos
| Recurso | Estrategia |
|---------|------------|
| **Tiempo** | Planificación, priorización |
| **Espacio** | Lugar adecuado de estudio |
| **Material** | Organización, acceso |
| **Apoyo social** | Trabajo colaborativo, tutores |

## 📝 Rol del Tutor en las Estrategias

1. **Diagnosticar** el estilo de aprendizaje del alumno
2. **Recomendar** estrategias adecuadas
3. **Modelar** técnicas de estudio efectivas
4. **Supervisar** y dar feedback sobre su uso

> **Recuerda:** Enseñar a aprender es tan importante como transmitir contenidos.`,
    keyTerms: ["Estrategias", "Metacognición", "Autonomía"]
  },
  {
    id: "mf1444-009",
    type: "quiz",
    title: "Test: Impartición y Tutorización",
    section: "Evaluación",
    content: `# ❓ Comprueba tu Aprendizaje`,
    keyTerms: ["Test", "Autoevaluación"],
    quiz: {
      id: "quiz-mf1444-001",
      question: "¿Cuál de las siguientes NO es una técnica de trabajo en grupo?",
      options: [
        { id: "a", text: "Phillips 66", isCorrect: false },
        { id: "b", text: "Brainstorming", isCorrect: false },
        { id: "c", text: "Lección magistral", isCorrect: true },
        { id: "d", text: "Role-playing", isCorrect: false }
      ],
      explanation: "La lección magistral es una técnica expositiva donde el formador presenta los contenidos de forma unidireccional. Las demás opciones implican la participación activa del grupo.",
      hint: "Piensa en cuál de las opciones es más unidireccional."
    }
  },
  {
    id: "mf1444-010",
    type: "summary",
    title: "Resumen del Módulo MF1444_3",
    section: "Resumen",
    content: `# 📚 Resumen: Impartición y Tutorización

## 🔑 Conceptos Clave

### Proceso de Enseñanza-Aprendizaje
- Interacción formador-alumno-contenido
- Enfoque constructivista: alumno activo
- Rol del formador como facilitador

### Técnicas Didácticas
- **Expositivas**: Lección magistral, demostración
- **Descubrimiento**: Casos, problemas
- **Grupales**: Phillips 66, brainstorming, debate

### Comunicación Didáctica
- Verbal y no verbal
- Feedback constante
- Adaptación al público

### Dinamización Grupal
- Fases del grupo
- Gestión de perfiles difíciles
- Técnicas de cohesión

### Tutorización
- Acompañamiento y seguimiento
- Orientación en estrategias de aprendizaje
- Clave en formación online

## 💡 Ideas Fundamentales

1. El **formador facilita**, el alumno construye
2. **Combinar técnicas** mantiene la motivación
3. La **comunicación no verbal** es fundamental
4. La **tutorización previene** el abandono

> **Recuerda:** Ser formador es más que transmitir conocimientos.`,
    keyTerms: ["Resumen", "Síntesis", "Impartición"]
  }
];

// ================================================================================
// MF1445_3: EVALUACIÓN DEL PROCESO DE ENSEÑANZA-APRENDIZAJE (60h)
// ================================================================================
export const generateMF1445Slides = (): ExtendedContentSlide[] => [
  {
    id: "mf1445-001",
    type: "intro",
    title: "MF1445_3: Evaluación del Proceso de Enseñanza-Aprendizaje",
    section: "Introducción",
    content: `# 📊 Evaluación del Proceso de Enseñanza-Aprendizaje

## 🎯 Objetivo General del Módulo

Evaluar el proceso de enseñanza-aprendizaje en las acciones formativas para el empleo.

## ⏱️ Duración: 60 horas

## 📋 Contenidos:

1. Evaluación en formación para el empleo aplicada a las distintas modalidades
2. Elaboración de pruebas para la evaluación de contenidos teóricos
3. Diseño y elaboración de pruebas de evaluación de contenidos prácticos
4. Evaluación y seguimiento del proceso formativo

> **Competencia:** Diseñar y aplicar instrumentos de evaluación que garanticen la calidad del proceso formativo.`,
    keyTerms: ["Evaluación", "Instrumentos", "Seguimiento"]
  },
  {
    id: "mf1445-002",
    type: "content",
    title: "Mapa Conceptual: Evaluación Formativa",
    section: "Introducción",
    content: `# 🗺️ Mapa Conceptual: Sistema de Evaluación

\`\`\`
                    ┌─────────────────────────────┐
                    │   EVALUACIÓN FORMATIVA      │
                    └──────────────┬──────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   ¿CUÁNDO?   │          │    ¿QUÉ?     │          │   ¿CÓMO?     │
│   MOMENTOS   │          │  CONTENIDOS  │          │ INSTRUMENTOS │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
  ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
  ▼         ▼               ▼         ▼               ▼         ▼
┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐
│Ini- │  │Pro- │       │Teóri│  │Prác-│       │Prue-│  │Obser│
│cial │  │ceso │       │cos  │  │ticos│       │bas  │  │vación│
│     │  │Final│       │     │  │     │       │     │  │     │
└─────┘  └─────┘       └─────┘  └─────┘       └─────┘  └─────┘
\`\`\`

## 🎯 Funciones de la Evaluación

- **Diagnóstica**: Conocer punto de partida
- **Formativa**: Mejorar el proceso
- **Sumativa**: Certificar logros`,
    keyTerms: ["Mapa conceptual", "Funciones", "Tipos evaluación"]
  },
  {
    id: "mf1445-003",
    type: "content",
    title: "Objetivos de Aprendizaje",
    section: "Introducción",
    content: `# 🎯 Objetivos de Aprendizaje del MF1445_3

## Al finalizar este módulo serás capaz de:

### Conocimientos
1. ✅ **Identificar** los tipos y funciones de la evaluación
2. ✅ **Conocer** los instrumentos de evaluación teórica y práctica
3. ✅ **Comprender** los criterios de calidad de las pruebas

### Habilidades
1. 🔧 **Diseñar** pruebas de evaluación de conocimientos
2. 🔧 **Elaborar** instrumentos para evaluar habilidades prácticas
3. 🔧 **Aplicar** técnicas de observación sistemática
4. 🔧 **Analizar** resultados y proponer mejoras

### Actitudes
1. 💡 **Valorar** la evaluación como herramienta de mejora
2. 💡 **Mostrar** objetividad en la calificación
3. 💡 **Practicar** el feedback constructivo

> **Resultado de aprendizaje:** Elaborar un sistema de evaluación completo para una acción formativa.`,
    keyTerms: ["Objetivos", "Competencias", "Evaluación"]
  },
  // SECCIÓN 1: EVALUACIÓN EN FPE
  {
    id: "mf1445-004",
    type: "content",
    title: "1.1 Concepto y Tipos de Evaluación",
    section: "1. Evaluación en FPE",
    content: `# 📊 Concepto y Tipos de Evaluación

## Definición

La **evaluación** es el proceso sistemático de recogida de información para emitir juicios de valor y tomar decisiones.

## 📋 Tipos de Evaluación

### Según el Momento

| Tipo | Momento | Finalidad |
|------|---------|-----------|
| **Inicial/Diagnóstica** | Antes de empezar | Conocer nivel previo |
| **Continua/Formativa** | Durante el proceso | Mejorar aprendizaje |
| **Final/Sumativa** | Al finalizar | Certificar logros |

### Según el Agente

| Tipo | Quién evalúa | Ventajas |
|------|--------------|----------|
| **Heteroevaluación** | El formador | Objetividad |
| **Autoevaluación** | El propio alumno | Metacognición |
| **Coevaluación** | Entre iguales | Perspectiva múltiple |

### Según el Referente

- **Normativa**: Compara con el grupo
- **Criterial**: Compara con criterios establecidos

> **💡 Importante:** En FPE predomina la evaluación criterial basada en los resultados de aprendizaje.`,
    keyTerms: ["Tipos evaluación", "Diagnóstica", "Formativa", "Sumativa"]
  },
  {
    id: "mf1445-005",
    type: "content",
    title: "1.2 Criterios e Instrumentos de Evaluación",
    section: "1. Evaluación en FPE",
    content: `# 📝 Criterios e Instrumentos de Evaluación

## Criterios de Evaluación

### Definición
Los **criterios de evaluación** son indicadores que permiten valorar el grado de adquisición de las competencias.

### Características de buenos criterios
- **Claros**: Fáciles de entender
- **Medibles**: Cuantificables
- **Alcanzables**: Realistas
- **Relevantes**: Relacionados con objetivos

## 🛠️ Instrumentos de Evaluación

### Para Contenidos Teóricos

| Instrumento | Ventajas | Limitaciones |
|-------------|----------|--------------|
| **Examen tipo test** | Objetividad, corrección rápida | No evalúa expresión |
| **Preguntas cortas** | Evalúa comprensión | Subjetividad |
| **Desarrollo** | Evalúa síntesis | Corrección lenta |
| **Trabajo escrito** | Profundidad | Tiempo elaboración |

### Para Contenidos Prácticos

| Instrumento | Aplicación |
|-------------|------------|
| **Lista de cotejo** | Verificar presencia/ausencia |
| **Escala de valoración** | Graduar nivel de ejecución |
| **Rúbrica** | Criterios detallados por niveles |
| **Observación sistemática** | Seguimiento del proceso |`,
    keyTerms: ["Criterios", "Instrumentos", "Pruebas"]
  },
  {
    id: "mf1445-006",
    type: "content",
    title: "2.1 Elaboración de Pruebas Teóricas",
    section: "2. Pruebas Teóricas",
    content: `# 📄 Elaboración de Pruebas de Evaluación Teórica

## Pruebas Objetivas (Tipo Test)

### Tipos de Ítems

| Tipo | Ejemplo |
|------|---------|
| **Verdadero/Falso** | "La evaluación formativa se realiza al final del curso. V/F" |
| **Elección múltiple** | "¿Cuál de las siguientes es...? a) b) c) d)" |
| **Emparejamiento** | "Une cada concepto con su definición" |
| **Completar** | "La evaluación ______ sirve para conocer el nivel previo" |

### Reglas para Redactar Ítems

✅ **Hacer:**
- Redacción clara y precisa
- Una sola respuesta correcta
- Distractores plausibles
- Opciones de longitud similar

❌ **Evitar:**
- Dobles negaciones
- Pistas en la redacción
- "Todas las anteriores"
- Ítems demasiado obvios

## 📊 Tabla de Especificaciones

| Contenido | Peso | Nº ítems | Nivel cognitivo |
|-----------|------|----------|-----------------|
| Tema 1 | 30% | 6 | Comprensión |
| Tema 2 | 40% | 8 | Aplicación |
| Tema 3 | 30% | 6 | Análisis |

> **💡 Consejo:** Elabora más ítems de los necesarios para poder seleccionar los mejores.`,
    keyTerms: ["Test", "Ítems", "Tabla especificaciones"]
  },
  {
    id: "mf1445-007",
    type: "content",
    title: "2.2 Diseño de Rúbricas",
    section: "2. Pruebas Teóricas",
    content: `# 📋 Diseño de Rúbricas de Evaluación

## ¿Qué es una Rúbrica?

Es una **matriz de evaluación** que establece criterios y niveles de desempeño con descriptores claros.

## 🎯 Tipos de Rúbricas

### Rúbrica Holística
Valora el desempeño de forma global

| Nivel | Descripción |
|-------|-------------|
| **4** | Excelente: supera expectativas |
| **3** | Bueno: cumple expectativas |
| **2** | Regular: cumple parcialmente |
| **1** | Insuficiente: no cumple |

### Rúbrica Analítica
Valora cada criterio por separado

| Criterio | 4 Excelente | 3 Bueno | 2 Regular | 1 Insuficiente |
|----------|-------------|---------|-----------|----------------|
| **Contenido** | Completo y preciso | Completo | Incompleto | Muy incompleto |
| **Organización** | Muy estructurado | Estructurado | Poco estructurado | Desorganizado |
| **Presentación** | Impecable | Adecuada | Mejorable | Descuidada |

## ✅ Ventajas de las Rúbricas

1. **Transparencia**: El alumno conoce los criterios
2. **Objetividad**: Reduce la subjetividad
3. **Feedback**: Facilita la retroalimentación
4. **Autoevaluación**: El alumno puede evaluarse`,
    keyTerms: ["Rúbrica", "Criterios", "Niveles desempeño"]
  },
  {
    id: "mf1445-008",
    type: "content",
    title: "3.1 Evaluación de Contenidos Prácticos",
    section: "3. Pruebas Prácticas",
    content: `# 🔧 Evaluación de Contenidos Prácticos

## Características de la Evaluación Práctica

- Se realiza mediante **observación** del desempeño
- Evalúa **habilidades y destrezas**
- Requiere contextos **reales o simulados**
- Necesita **instrumentos sistemáticos**

## 📋 Instrumentos de Observación

### Lista de Cotejo (Checklist)

| Criterio | Sí | No |
|----------|----|----|
| Utiliza correctamente el EPIs | ☑️ | |
| Sigue el procedimiento establecido | ☑️ | |
| Respeta las normas de seguridad | | ☑️ |
| Limpia y ordena el puesto de trabajo | ☑️ | |

### Escala de Valoración

| Criterio | 1 | 2 | 3 | 4 | 5 |
|----------|---|---|---|---|---|
| Precisión en la ejecución | | | | ☑️ | |
| Tiempo empleado | | | ☑️ | | |
| Calidad del resultado | | | | | ☑️ |

## 🎯 Criterios para Evaluar Prácticas

1. **Proceso**: ¿Cómo lo hace?
2. **Producto**: ¿Qué resultado obtiene?
3. **Tiempo**: ¿Cuánto tarda?
4. **Seguridad**: ¿Cumple normas?
5. **Autonomía**: ¿Necesita ayuda?`,
    keyTerms: ["Evaluación práctica", "Observación", "Lista cotejo"]
  },
  {
    id: "mf1445-009",
    type: "quiz",
    title: "Test: Evaluación del Aprendizaje",
    section: "Evaluación",
    content: `# ❓ Comprueba tu Aprendizaje`,
    keyTerms: ["Test", "Autoevaluación"],
    quiz: {
      id: "quiz-mf1445-001",
      question: "¿Qué tipo de evaluación se realiza DURANTE el proceso formativo para mejorar el aprendizaje?",
      options: [
        { id: "a", text: "Evaluación diagnóstica", isCorrect: false },
        { id: "b", text: "Evaluación formativa", isCorrect: true },
        { id: "c", text: "Evaluación sumativa", isCorrect: false },
        { id: "d", text: "Evaluación normativa", isCorrect: false }
      ],
      explanation: "La evaluación formativa o continua se realiza durante el proceso de enseñanza-aprendizaje con el objetivo de mejorar y regular dicho proceso, proporcionando feedback al alumno.",
      hint: "Piensa en cuál tiene función de mejora durante el proceso."
    }
  },
  {
    id: "mf1445-010",
    type: "summary",
    title: "Resumen del Módulo MF1445_3",
    section: "Resumen",
    content: `# 📚 Resumen: Evaluación del Proceso Formativo

## 🔑 Conceptos Clave

### Tipos de Evaluación
- **Diagnóstica**: Conocer nivel previo
- **Formativa**: Mejorar proceso
- **Sumativa**: Certificar logros

### Instrumentos Teóricos
- Pruebas objetivas (test)
- Preguntas de desarrollo
- Trabajos escritos

### Instrumentos Prácticos
- Listas de cotejo
- Escalas de valoración
- Rúbricas analíticas

### Calidad de las Pruebas
- **Validez**: Mide lo que debe medir
- **Fiabilidad**: Resultados consistentes
- **Objetividad**: Independiente del evaluador

## 💡 Ideas Fundamentales

1. La evaluación es una **herramienta de mejora**
2. Los **criterios deben ser claros** y conocidos
3. Las **rúbricas aumentan** la objetividad
4. El **feedback es esencial** para el aprendizaje
5. La evaluación es **continua e integrada**

> **Recuerda:** Evaluar no es solo calificar, es mejorar el proceso.`,
    keyTerms: ["Resumen", "Síntesis", "Evaluación"]
  }
];

// ================================================================================
// MF1446_3: ORIENTACIÓN LABORAL Y PROMOCIÓN DE LA CALIDAD (30h)
// ================================================================================
export const generateMF1446Slides = (): ExtendedContentSlide[] => [
  {
    id: "mf1446-001",
    type: "intro",
    title: "MF1446_3: Orientación Laboral y Promoción de la Calidad",
    section: "Introducción",
    content: `# 🧭 Orientación Laboral y Promoción de la Calidad

## 🎯 Objetivo General del Módulo

Orientar en la identificación de la realidad laboral del alumnado para ayudarle en la toma de decisiones ante su desarrollo profesional, promoviendo la calidad de la formación.

## ⏱️ Duración: 30 horas

## 📋 Contenidos:

1. Análisis del perfil profesional
2. La información profesional: Estrategias y herramientas para la búsqueda de empleo
3. Calidad de las acciones formativas: Innovación y actualización docente

> **Competencia:** Orientar profesionalmente a los alumnos y promover la mejora continua de la formación.`,
    keyTerms: ["Orientación laboral", "Calidad", "Inserción profesional"]
  },
  {
    id: "mf1446-002",
    type: "content",
    title: "Mapa Conceptual: Orientación y Calidad",
    section: "Introducción",
    content: `# 🗺️ Mapa Conceptual: Orientación Laboral y Calidad

\`\`\`
                    ┌─────────────────────────────┐
                    │   ORIENTACIÓN Y CALIDAD     │
                    └──────────────┬──────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  ORIENTACIÓN │          │  INSERCIÓN   │          │   CALIDAD    │
│   LABORAL    │          │  PROFESIONAL │          │  FORMATIVA   │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
  ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
  ▼         ▼               ▼         ▼               ▼         ▼
┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐       ┌─────┐  ┌─────┐
│Perfil│  │Compe│       │Herra│  │Técni│       │Innova│  │Mejora│
│Prof. │  │ten- │       │mien-│  │cas  │       │ción │  │Conti-│
│      │  │cias │       │tas  │  │     │       │     │  │nua   │
└─────┘  └─────┘       └─────┘  └─────┘       └─────┘  └─────┘
\`\`\`

## 🎯 Objetivo Integrador

Conectar la formación con el mercado laboral garantizando la calidad del proceso.`,
    keyTerms: ["Mapa conceptual", "Orientación", "Calidad"]
  },
  {
    id: "mf1446-003",
    type: "content",
    title: "Objetivos de Aprendizaje",
    section: "Introducción",
    content: `# 🎯 Objetivos de Aprendizaje del MF1446_3

## Al finalizar este módulo serás capaz de:

### Conocimientos
1. ✅ **Identificar** los elementos del perfil profesional
2. ✅ **Conocer** recursos y herramientas de búsqueda de empleo
3. ✅ **Comprender** sistemas de gestión de calidad en formación

### Habilidades
1. 🔧 **Analizar** perfiles profesionales y competencias
2. 🔧 **Orientar** en técnicas de búsqueda de empleo
3. 🔧 **Asesorar** en la elaboración de CV y entrevistas
4. 🔧 **Aplicar** criterios de calidad a la acción formativa

### Actitudes
1. 💡 **Valorar** la orientación como parte del proceso formativo
2. 💡 **Promover** la mejora continua
3. 💡 **Actualizar** permanentemente la propia práctica docente

> **Resultado de aprendizaje:** Diseñar una sesión de orientación laboral y un plan de mejora de la calidad docente.`,
    keyTerms: ["Objetivos", "Competencias", "Orientación"]
  },
  // SECCIÓN 1: PERFIL PROFESIONAL
  {
    id: "mf1446-004",
    type: "content",
    title: "1.1 Análisis del Perfil Profesional",
    section: "1. Perfil Profesional",
    content: `# 👤 Análisis del Perfil Profesional

## ¿Qué es el Perfil Profesional?

Es el conjunto de **competencias, conocimientos, habilidades y actitudes** que definen a un profesional en un área determinada.

## 📊 Componentes del Perfil

| Componente | Descripción | Ejemplo (Docente) |
|------------|-------------|-------------------|
| **Formación** | Titulación y certificaciones | Grado, máster, CAP/MAES |
| **Experiencia** | Trayectoria laboral | 5 años en formación |
| **Competencias técnicas** | Conocimientos específicos | Dominio de la materia |
| **Competencias transversales** | Habilidades generales | Comunicación, trabajo en equipo |
| **Actitudes** | Valores profesionales | Compromiso, actualización |

## 🎯 Competencias Clave para el Empleo

### Competencias Transversales más Demandadas

1. **Comunicación** oral y escrita
2. **Trabajo en equipo** y colaboración
3. **Resolución de problemas** y toma de decisiones
4. **Adaptación al cambio** y flexibilidad
5. **Competencia digital** y tecnológica
6. **Aprendizaje permanente** y autoaprendizaje

> **💡 Importante:** Las competencias transversales cada vez pesan más en los procesos de selección.`,
    keyTerms: ["Perfil profesional", "Competencias", "Empleabilidad"]
  },
  {
    id: "mf1446-005",
    type: "content",
    title: "1.2 Itinerarios Formativos y Certificación",
    section: "1. Perfil Profesional",
    content: `# 📚 Itinerarios Formativos y Certificación

## Sistema Nacional de Cualificaciones

### Estructura

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                  CATÁLOGO NACIONAL DE                       │
│           CUALIFICACIONES PROFESIONALES (CNCP)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Nivel 1     │    │ Nivel 2     │    │ Nivel 3     │     │
│  │ Competencias│    │ Competencias│    │ Competencias│     │
│  │ simples     │    │ intermedias │    │ complejas   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 🎓 Vías de Acreditación

| Vía | Descripción |
|-----|-------------|
| **Formación formal** | Certificados de profesionalidad, FP |
| **Experiencia laboral** | PEAC (Procedimiento de Acreditación) |
| **Formación no formal** | Cursos que suman para PEAC |

## 📋 Orientación sobre Itinerarios

El formador debe:
1. **Informar** sobre opciones de certificación
2. **Orientar** según el perfil del alumno
3. **Asesorar** sobre vías de acreditación
4. **Motivar** hacia la formación continua`,
    keyTerms: ["Itinerarios", "Certificación", "CNCP"]
  },
  // SECCIÓN 2: INSERCIÓN PROFESIONAL
  {
    id: "mf1446-006",
    type: "content",
    title: "2.1 Estrategias de Búsqueda de Empleo",
    section: "2. Inserción Profesional",
    content: `# 🔍 Estrategias de Búsqueda de Empleo

## Canales de Búsqueda

### Canales Formales

| Canal | Descripción | Ejemplos |
|-------|-------------|----------|
| **Servicios públicos** | Oficinas de empleo | SEPE, servicios autonómicos |
| **Portales de empleo** | Plataformas online | InfoJobs, LinkedIn, Indeed |
| **ETTs** | Empresas de trabajo temporal | Adecco, Randstad, Manpower |
| **Agencias de colocación** | Intermediación laboral | Públicas y privadas |

### Canales Informales

| Canal | Descripción |
|-------|-------------|
| **Networking** | Contactos profesionales |
| **Autocandidatura** | Envío espontáneo de CV |
| **Redes sociales** | LinkedIn, Twitter profesional |
| **Ferias de empleo** | Eventos de contacto con empresas |

## 📊 Mercado de Trabajo Oculto

> **⚠️ Dato importante:** El 70-80% de las ofertas no se publican

### ¿Cómo acceder?
- Construir red de contactos
- Mantener perfil actualizado en redes
- Hacer seguimiento de empresas de interés
- Asistir a eventos del sector`,
    keyTerms: ["Búsqueda empleo", "Canales", "Networking"]
  },
  {
    id: "mf1446-007",
    type: "content",
    title: "2.2 Herramientas para la Inserción",
    section: "2. Inserción Profesional",
    content: `# 🛠️ Herramientas para la Inserción Laboral

## El Curriculum Vitae

### Tipos de CV

| Tipo | Estructura | Cuándo usar |
|------|------------|-------------|
| **Cronológico** | Por fechas | Trayectoria lineal |
| **Funcional** | Por competencias | Cambio de sector |
| **Mixto/Combinado** | Ambos | Más versátil |

### Elementos Clave

- **Datos personales**: Actualizados y profesionales
- **Objetivo profesional**: Breve y específico
- **Formación**: Relevante para el puesto
- **Experiencia**: Con logros cuantificables
- **Competencias**: Técnicas y transversales

## ✉️ Carta de Presentación

### Estructura
1. **Saludo** personalizado
2. **Introducción**: Por qué escribes
3. **Desarrollo**: Por qué tú
4. **Cierre**: Llamada a la acción

## 🎤 La Entrevista de Trabajo

### Fases
1. **Antes**: Investigar empresa, preparar respuestas
2. **Durante**: Comunicación asertiva, ejemplos concretos
3. **Después**: Seguimiento y agradecimiento

> **💡 Consejo:** Practica el "Elevator Pitch" (presentación en 60 segundos).`,
    keyTerms: ["CV", "Carta presentación", "Entrevista"]
  },
  // SECCIÓN 3: CALIDAD EN LA FORMACIÓN
  {
    id: "mf1446-008",
    type: "content",
    title: "3.1 Calidad de las Acciones Formativas",
    section: "3. Calidad Formativa",
    content: `# ⭐ Calidad de las Acciones Formativas

## Concepto de Calidad en Formación

La **calidad formativa** es el grado en que la formación satisface las necesidades y expectativas de los usuarios y del mercado laboral.

## 📊 Dimensiones de la Calidad

| Dimensión | Indicadores |
|-----------|-------------|
| **Diseño** | Adecuación de objetivos, contenidos, metodología |
| **Recursos** | Instalaciones, equipamiento, materiales |
| **Docencia** | Competencia y desempeño del formador |
| **Resultados** | Aprendizaje, satisfacción, inserción |
| **Gestión** | Organización, coordinación, seguimiento |

## 🔄 Ciclo de Mejora Continua (PDCA)

\`\`\`
       ┌─────────┐
       │  PLAN   │ Planificar
       │(Diseñar)│
       └────┬────┘
            │
   ┌────────┴────────┐
   ▼                 ▲
┌─────┐           ┌─────┐
│ DO  │           │ ACT │ Actuar
│(Hacer)          │(Mejorar)
└──┬──┘           └──▲──┘
   │                 │
   └───────┬─────────┘
           ▼
       ┌─────────┐
       │ CHECK   │ Verificar
       │(Evaluar)│
       └─────────┘
\`\`\``,
    keyTerms: ["Calidad", "Mejora continua", "PDCA"]
  },
  {
    id: "mf1446-009",
    type: "content",
    title: "3.2 Innovación y Actualización Docente",
    section: "3. Calidad Formativa",
    content: `# 🚀 Innovación y Actualización Docente

## Innovación Pedagógica

### Tendencias Actuales

| Tendencia | Descripción |
|-----------|-------------|
| **Aprendizaje activo** | El alumno como protagonista |
| **Metodologías ágiles** | Flexibilidad y adaptación |
| **Gamificación** | Elementos lúdicos en formación |
| **Microlearning** | Contenidos breves y focalizados |
| **Aprendizaje colaborativo** | Trabajo en red |
| **Tecnologías inmersivas** | VR, AR, simuladores |

## 📚 Formación Continua del Formador

### Áreas de Actualización

1. **Contenidos técnicos** de la especialidad
2. **Metodologías** y técnicas didácticas
3. **Tecnologías** educativas
4. **Normativa** y regulación del sector
5. **Competencias transversales**

### Recursos para la Actualización

| Recurso | Ejemplo |
|---------|---------|
| **Cursos online** | Coursera, edX, MOOC |
| **Congresos** | Eventos del sector |
| **Publicaciones** | Revistas especializadas |
| **Comunidades** | Redes de formadores |
| **Certificaciones** | Acreditaciones oficiales |

> **💡 Recuerda:** El formador que no se actualiza se queda obsoleto.`,
    keyTerms: ["Innovación", "Actualización", "Formación continua"]
  },
  {
    id: "mf1446-010",
    type: "checklist",
    title: "Checklist: Plan de Mejora Docente",
    section: "3. Calidad Formativa",
    content: `# ✅ Lista de Verificación: Plan de Mejora Personal`,
    keyTerms: ["Checklist", "Mejora"],
    checklistItems: [
      { id: "ch1", text: "He identificado mis fortalezas como formador" },
      { id: "ch2", text: "He identificado mis áreas de mejora" },
      { id: "ch3", text: "Conozco las tendencias actuales en mi especialidad" },
      { id: "ch4", text: "Tengo un plan de formación continua" },
      { id: "ch5", text: "Participo en comunidades de práctica docente" },
      { id: "ch6", text: "Solicito y analizo feedback de mis alumnos" },
      { id: "ch7", text: "Experimento con nuevas metodologías" },
      { id: "ch8", text: "Utilizo herramientas tecnológicas actualizadas" },
      { id: "ch9", text: "Documento y comparto mis buenas prácticas" },
      { id: "ch10", text: "Reviso y actualizo mis materiales periódicamente" }
    ]
  },
  {
    id: "mf1446-011",
    type: "summary",
    title: "Resumen del Módulo MF1446_3",
    section: "Resumen",
    content: `# 📚 Resumen: Orientación Laboral y Calidad

## 🔑 Conceptos Clave

### Perfil Profesional
- Competencias técnicas y transversales
- Itinerarios formativos y certificación
- Sistema Nacional de Cualificaciones

### Inserción Profesional
- Canales formales e informales
- Herramientas: CV, carta, entrevista
- Mercado de trabajo oculto (70-80%)

### Calidad Formativa
- Dimensiones: diseño, recursos, docencia, resultados
- Ciclo PDCA de mejora continua
- Innovación y actualización permanente

## 💡 Ideas Fundamentales

1. La **orientación laboral** es parte del proceso formativo
2. Las **competencias transversales** son cada vez más valoradas
3. El **networking** es clave para acceder al empleo
4. La **calidad** requiere evaluación y mejora continua
5. El **formador debe actualizarse** constantemente

## 🎯 Conclusión del Certificado

> "Ser formador es una profesión que requiere vocación, preparación y actualización permanente. Programar, impartir, tutorizar, evaluar y orientar son las cinco funciones que definen la docencia de la formación profesional para el empleo."`,
    keyTerms: ["Resumen", "Síntesis", "Orientación", "Calidad"]
  }
];

// ================================================================================
// FUNCIÓN PRINCIPAL: Obtener slides por código de módulo
// ================================================================================
export const getSSCE0110SlidesByModule = (moduleCode: string): ExtendedContentSlide[] => {
  const code = moduleCode.toUpperCase();
  
  if (code.includes('MF1442') || code.includes('PROGRAMACIÓN')) {
    return generateMF1442Slides();
  }
  if (code.includes('MF1443') || code.includes('MATERIALES') || code.includes('RECURSOS')) {
    return generateMF1443Slides();
  }
  if (code.includes('MF1444') || code.includes('IMPARTICIÓN') || code.includes('TUTORIZACIÓN')) {
    return generateMF1444Slides();
  }
  if (code.includes('MF1445') || code.includes('EVALUACIÓN')) {
    return generateMF1445Slides();
  }
  if (code.includes('MF1446') || code.includes('ORIENTACIÓN') || code.includes('CALIDAD')) {
    return generateMF1446Slides();
  }
  
  return [];
};

// Función para obtener todos los slides del certificado
export const getAllSSCE0110Slides = (): ExtendedContentSlide[] => {
  return [
    ...generateMF1442Slides(),
    ...generateMF1443Slides(),
    ...generateMF1444Slides(),
    ...generateMF1445Slides(),
    ...generateMF1446Slides()
  ];
};
