import { Slide } from "../scorm-author/types";

const id = () => Math.random().toString(36).substring(2, 11);

/**
 * Genera slides predefinidos con estructura BOE para las 4 UDs del módulo
 * MF1442_3: Programación didáctica de acciones formativas para el empleo (60h)
 */

// ──────────────────────────────────────────────────────
// UD1: Estructura de la Formación Profesional (15h)
// ──────────────────────────────────────────────────────
export function generateMF1442_UD1Slides(): Slide[] {
  return [
    // Portada
    {
      id: id(), type: "title", order: 0,
      title: "UD1. Estructura de la Formación Profesional",
      subtitle: "MF1442_3 · Programación didáctica de acciones formativas para el empleo",
      author: "SSCE0110 - Docencia de la formación profesional para el empleo",
    },
    // Objetivos
    {
      id: id(), type: "content", order: 1,
      title: "Objetivos de aprendizaje",
      content: `## Capacidad a desarrollar\n\n**C1:** Analizar la normativa sobre la Formación Profesional para el Empleo en sus diferentes modalidades de impartición, identificando sus características y colectivos destinatarios.\n\n### Al finalizar esta unidad serás capaz de:\n- Identificar la estructura del Sistema Nacional de Cualificaciones\n- Diferenciar el Subsistema de FP Reglada del de FP para el Empleo\n- Conocer la estructura de los programas y proyectos formativos`,
      layout: "single",
    },
    // Tabs: SNCP
    {
      id: id(), type: "tabs", order: 2,
      title: "Sistema Nacional de las Cualificaciones Profesionales",
      tabs: [
        {
          id: id(), title: "¿Qué es el SNCP?",
          content: "El **Sistema Nacional de Cualificaciones Profesionales (SNCP)** es el conjunto de instrumentos y acciones necesarios para promover y desarrollar la integración de las ofertas de la formación profesional.\n\nSu objetivo es promover y desarrollar la evaluación y acreditación de las competencias profesionales.",
        },
        {
          id: id(), title: "Catálogo Nacional",
          content: "El **Catálogo Nacional de Cualificaciones Profesionales (CNCP)** ordena las cualificaciones profesionales susceptibles de reconocimiento y acreditación, identificadas en el sistema productivo.\n\n### Estructura\n- 26 Familias profesionales\n- 5 Niveles de cualificación\n- Unidades de competencia",
        },
        {
          id: id(), title: "Niveles de cualificación",
          content: "### Los 5 niveles:\n\n| Nivel | Descripción |\n|---|---|\n| 1 | Competencia en actividades simples y repetitivas |\n| 2 | Competencia en actividades bien determinadas con instrumentos y técnicas |\n| 3 | Competencia en actividades que requieren dominio de técnicas con autonomía |\n| 4 | Competencia en actividades complejas con responsabilidad de supervisión |\n| 5 | Competencia en actividades muy complejas con gran autonomía |",
        },
        {
          id: id(), title: "Formación modular",
          content: "La **formación modular** permite la acumulación de competencias profesionales a lo largo de la vida.\n\nCada módulo formativo está asociado a una unidad de competencia, facilitando:\n- Itinerarios formativos flexibles\n- Acreditación parcial acumulable\n- Adaptación al mercado laboral",
        },
      ],
    },
    // Accordion: Subsistema FP Reglada
    {
      id: id(), type: "accordion", order: 3,
      title: "Subsistema de Formación Profesional Reglada",
      items: [
        {
          id: id(), title: "Programas de Cualificación Profesional Inicial (PCPI)",
          content: "**Destinatarios:** Jóvenes mayores de 16 años sin titulación de Graduado en ESO.\n\n**Objetivo:** Alcanzar competencias profesionales de nivel 1 del CNCP.\n\n**Estructura:**\n- Módulos específicos asociados a unidades de competencia\n- Módulos formativos de carácter general\n- Módulos voluntarios",
        },
        {
          id: id(), title: "Ciclos Formativos de Grado Medio",
          content: "**Nivel de cualificación:** 2\n\n**Duración:** 2.000 horas (2 cursos académicos)\n\n**Requisitos de acceso:**\n- Título de Graduado en ESO\n- Prueba de acceso\n- Título de PCPI",
        },
        {
          id: id(), title: "Ciclos Formativos de Grado Superior",
          content: "**Nivel de cualificación:** 3\n\n**Duración:** 2.000 horas (2 cursos académicos)\n\n**Requisitos de acceso:**\n- Título de Bachiller\n- Prueba de acceso\n- Título de Técnico",
        },
      ],
      allow_multiple_open: true,
    },
    // Content: FP para el Empleo
    {
      id: id(), type: "content", order: 4,
      title: "Subsistema de Formación Profesional para el Empleo",
      content: `## Características y destinatarios\n\nEl subsistema de FP para el Empleo integra las antiguas formaciones ocupacional y continua en un único modelo.\n\n### Destinatarios principales:\n- **Trabajadores ocupados** (formación de demanda y de oferta)\n- **Trabajadores desempleados** (formación de oferta)\n- **Colectivos prioritarios**: jóvenes, mayores de 45 años, personas con discapacidad\n\n### Modalidades de impartición:\n- Presencial\n- Teleformación\n- Mixta`,
      layout: "single",
    },
    // Tabs: Formación de demanda vs oferta
    {
      id: id(), type: "tabs", order: 5,
      title: "Formación de Demanda y de Oferta",
      tabs: [
        {
          id: id(), title: "Formación de Demanda",
          content: "### Características\n- Promovida por las **empresas** para sus trabajadores\n- Financiada mediante bonificaciones en las cuotas de la Seguridad Social\n- Incluye: acciones formativas de las empresas y permisos individuales de formación (PIF)\n\n**Gestión:** A través de FUNDAE (Fundación Estatal para la Formación en el Empleo)",
        },
        {
          id: id(), title: "Formación de Oferta",
          content: "### Características\n- Financiada total o parcialmente con **fondos públicos**\n- Dirigida a trabajadores ocupados y desempleados\n- Incluye: planes de formación sectoriales, intersectoriales y de economía social\n\n**Programas:**\n- Programas de formación para trabajadores ocupados\n- Programas de formación para trabajadores desempleados\n- Acciones formativas con compromiso de contratación",
        },
      ],
    },
    // Quiz 1
    {
      id: id(), type: "quiz", order: 6,
      title: "Autoevaluación: SNCP",
      question: "¿Cuántos niveles de cualificación contempla el Catálogo Nacional de Cualificaciones Profesionales?",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "3 niveles", isCorrect: false },
        { id: id(), text: "4 niveles", isCorrect: false },
        { id: id(), text: "5 niveles", isCorrect: true },
        { id: id(), text: "6 niveles", isCorrect: false },
      ],
      explanation: "El CNCP contempla 5 niveles de cualificación, ordenados de menor a mayor complejidad de las competencias profesionales.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    // Content: Programas formativos
    {
      id: id(), type: "content", order: 7,
      title: "Programas Formativos: Estructura",
      content: `## Estructura del programa formativo\n\nUn programa formativo se estructura en los siguientes elementos:\n\n1. **Datos de identificación** del programa\n2. **Objetivos generales** y específicos\n3. **Contenidos** organizados en módulos\n4. **Secuenciación** y temporalización\n5. **Metodología** de impartición\n6. **Recursos** necesarios\n7. **Criterios de evaluación**\n8. **Requisitos** del alumnado y del profesorado`,
      layout: "single",
    },
    // Content: Proyectos formativos
    {
      id: id(), type: "content", order: 8,
      title: "Proyectos Formativos en Alternancia con el Empleo",
      content: `## Formación en Alternancia\n\nLos proyectos formativos en alternancia combinan periodos de formación teórica con actividad laboral práctica.\n\n### Estructura:\n- **Fase teórica:** Contenidos asociados a módulos formativos\n- **Fase práctica:** Actividad productiva en la empresa\n\n### Características:\n- El contrato de formación incluye un plan formativo individual\n- La formación teórica debe representar al menos el 15% de la jornada\n- Se requiere un tutor de empresa y un tutor de formación\n- La evaluación es continua y formativa`,
      layout: "single",
    },
    // Quiz 2
    {
      id: id(), type: "quiz", order: 9,
      title: "Autoevaluación: Subsistemas de FP",
      question: "La formación bonificada que realizan las empresas para sus trabajadores se denomina:",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "Formación de oferta", isCorrect: false },
        { id: id(), text: "Formación de demanda", isCorrect: true },
        { id: id(), text: "Formación reglada", isCorrect: false },
        { id: id(), text: "Formación ocupacional", isCorrect: false },
      ],
      explanation: "La formación de demanda es la promovida por las empresas para sus trabajadores, financiada mediante bonificaciones en las cuotas de la Seguridad Social.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    // Resumen
    {
      id: id(), type: "summary", order: 10,
      title: "Resumen de la UD1",
      key_points: [
        "El SNCP integra el Catálogo Nacional de Cualificaciones con 26 familias profesionales y 5 niveles",
        "La FP Reglada incluye PCPI, Ciclos de Grado Medio y Grado Superior",
        "La FP para el Empleo unifica las antiguas formaciones ocupacional y continua",
        "La formación de demanda la promueven las empresas; la de oferta se financia con fondos públicos",
        "Los programas formativos se estructuran con objetivos, contenidos, metodología y evaluación",
        "La formación en alternancia combina teoría y práctica laboral en empresa",
      ],
      next_steps: "En la siguiente unidad estudiaremos los Certificados de Profesionalidad y su programación didáctica.",
    },
  ];
}

// ──────────────────────────────────────────────────────
// UD2: Certificados de Profesionalidad (15h)
// ──────────────────────────────────────────────────────
export function generateMF1442_UD2Slides(): Slide[] {
  return [
    {
      id: id(), type: "title", order: 0,
      title: "UD2. Certificados de Profesionalidad",
      subtitle: "MF1442_3 · Programación didáctica de acciones formativas para el empleo",
      author: "SSCE0110 - Docencia de la formación profesional para el empleo",
    },
    {
      id: id(), type: "content", order: 1,
      title: "Objetivos de aprendizaje",
      content: `## Capacidad a desarrollar\n\n**C2:** Establecer pautas de coordinación metodológica adaptada a la modalidad formativa de la acción a impartir.\n\n### Al finalizar esta unidad serás capaz de:\n- Identificar las características y estructura de los certificados de profesionalidad\n- Conocer las vías de adquisición de un certificado\n- Vincular la programación didáctica a la certificación profesional`,
      layout: "single",
    },
    {
      id: id(), type: "tabs", order: 2,
      title: "¿Qué es un Certificado de Profesionalidad?",
      tabs: [
        {
          id: id(), title: "Definición",
          content: "Los **Certificados de Profesionalidad** son el instrumento de acreditación oficial de las cualificaciones profesionales del CNCP en el ámbito de la administración laboral.\n\nTienen **carácter oficial** y **validez en todo el territorio nacional**.\n\nAcreditan el conjunto de competencias profesionales que capacitan para el desarrollo de una actividad laboral.",
        },
        {
          id: id(), title: "Características",
          content: "### Características principales:\n- Acreditan competencias con **carácter oficial**\n- Se estructuran en **módulos formativos** asociados a unidades de competencia\n- Incluyen un **módulo de prácticas profesionales no laborales**\n- Se organizan en **3 niveles** de cualificación (1, 2 y 3)\n- Son **acumulables**: se pueden obtener por módulos",
        },
        {
          id: id(), title: "Vías de adquisición",
          content: "### Vías para obtener un Certificado de Profesionalidad:\n\n1. **Superar todos los módulos formativos** que lo integran (formación formal)\n2. **Procedimiento de evaluación y acreditación** de competencias profesionales (PEAC) - experiencia laboral\n3. **Vías no formales** de formación\n\n**Importante:** Las acreditaciones parciales acumulables se pueden ir obteniendo por separado.",
        },
      ],
    },
    // Accordion: Estructura del certificado
    {
      id: id(), type: "accordion", order: 3,
      title: "Estructura del Certificado de Profesionalidad",
      items: [
        {
          id: id(), title: "1. Perfil profesional / Referente ocupacional",
          content: "Define la competencia general, las unidades de competencia, el entorno profesional y las ocupaciones relacionadas.\n\n**Incluye:**\n- Competencia general\n- Unidades de competencia y realizaciones profesionales\n- Entorno profesional\n- Ocupaciones y puestos de trabajo relevantes",
        },
        {
          id: id(), title: "2. Formación del certificado / Referente formativo",
          content: "Describe los módulos formativos asociados a cada unidad de competencia.\n\n**Incluye:**\n- Módulos formativos con duración en horas\n- Unidades formativas dentro de cada módulo\n- Contenidos teóricos y prácticos\n- Criterios de evaluación\n- Capacidades y criterios de evaluación",
        },
        {
          id: id(), title: "3. Prescripciones de los formadores",
          content: "Establece los requisitos que deben cumplir los formadores/tutores:\n\n- **Titulación:** Acreditación académica o experiencia profesional\n- **Experiencia profesional:** Mínimo 1 año en los últimos 10 años\n- **Competencia docente:** Formación metodológica o experiencia\n\n**Nota:** Para teleformación se requiere además competencia en TIC.",
        },
        {
          id: id(), title: "4. Requisitos de espacio e instalaciones",
          content: "Especifica las condiciones mínimas de los espacios formativos:\n\n- **Aula polivalente:** m² por alumno, iluminación, mobiliario\n- **Talleres/laboratorios:** equipamiento específico\n- **Instalaciones:** accesibilidad, normativa de seguridad\n- **Equipamiento:** hardware, software, materiales didácticos",
        },
      ],
      allow_multiple_open: true,
    },
    // Content: Formación presencial y en línea
    {
      id: id(), type: "content", order: 4,
      title: "Modalidades de Impartición",
      content: `## Formación presencial y en línea\n\n### Presencial\n- Requiere asistencia física del alumnado\n- El porcentaje de faltas no puede superar el 25%\n- Facilita la interacción directa docente-alumno\n\n### Teleformación\n- Se realiza a través de una **plataforma virtual de aprendizaje**\n- Debe garantizar la interactividad y el seguimiento\n- Requiere tutorías síncronas y asíncronas\n- Ratio máximo tutor/alumno: **80 alumnos**\n\n### Mixta\n- Combina sesiones presenciales y en línea\n- Se debe especificar el porcentaje de cada modalidad`,
      layout: "single",
    },
    // Content: Programación didáctica vinculada
    {
      id: id(), type: "content", order: 5,
      title: "Programación Didáctica vinculada a Certificación",
      content: `## Vinculación con la programación\n\nLa programación didáctica de un certificado de profesionalidad debe:\n\n1. **Respetar los contenidos** establecidos en el referente formativo\n2. **Cumplir la duración mínima** de cada módulo y unidad formativa\n3. **Garantizar las capacidades** y criterios de evaluación del RD\n4. **Secuenciar adecuadamente** los módulos (prerrequisitos)\n5. **Incluir las prácticas** profesionales no laborales\n\n### Documentación obligatoria:\n- Programación didáctica por módulo\n- Plan de evaluación\n- Guía del alumno\n- Guía del tutor-formador`,
      layout: "single",
    },
    // Quiz
    {
      id: id(), type: "quiz", order: 6,
      title: "Autoevaluación: Certificados de Profesionalidad",
      question: "¿Cuál de las siguientes NO es una vía de adquisición de un certificado de profesionalidad?",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "Superar todos los módulos formativos", isCorrect: false },
        { id: id(), text: "Procedimiento de evaluación y acreditación de competencias (PEAC)", isCorrect: false },
        { id: id(), text: "Aprobar un examen único convocado por el SEPE", isCorrect: true },
        { id: id(), text: "Acumulación de acreditaciones parciales", isCorrect: false },
      ],
      explanation: "No existe un examen único. Los certificados se obtienen superando los módulos formativos, mediante el PEAC, o por acumulación de acreditaciones parciales.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    {
      id: id(), type: "quiz", order: 7,
      title: "Autoevaluación: Estructura del certificado",
      question: "El ratio máximo tutor/alumno en modalidad de teleformación para certificados de profesionalidad es de:",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "30 alumnos", isCorrect: false },
        { id: id(), text: "50 alumnos", isCorrect: false },
        { id: id(), text: "80 alumnos", isCorrect: true },
        { id: id(), text: "100 alumnos", isCorrect: false },
      ],
      explanation: "La normativa establece un ratio máximo de 80 alumnos por tutor-formador en la modalidad de teleformación.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    {
      id: id(), type: "summary", order: 8,
      title: "Resumen de la UD2",
      key_points: [
        "Los certificados de profesionalidad acreditan oficialmente cualificaciones del CNCP",
        "Se estructuran en perfil profesional, referente formativo y prescripciones",
        "Se pueden obtener por formación, PEAC o acumulación de acreditaciones parciales",
        "Las modalidades de impartición son presencial, teleformación y mixta",
        "La programación didáctica debe respetar contenidos, duración y capacidades del RD",
        "La documentación obligatoria incluye programación, plan de evaluación y guías",
      ],
      next_steps: "En la UD3 aprenderemos a elaborar la programación didáctica completa de una acción formativa.",
    },
  ];
}

// ──────────────────────────────────────────────────────
// UD3: Elaboración de la programación didáctica (20h)
// ──────────────────────────────────────────────────────
export function generateMF1442_UD3Slides(): Slide[] {
  return [
    {
      id: id(), type: "title", order: 0,
      title: "UD3. Elaboración de la Programación Didáctica",
      subtitle: "MF1442_3 · Programación didáctica de acciones formativas para el empleo",
      author: "SSCE0110 - Docencia de la formación profesional para el empleo",
    },
    {
      id: id(), type: "content", order: 1,
      title: "Objetivos de aprendizaje",
      content: `## Capacidad a desarrollar\n\n**C3:** Elaborar la programación didáctica de una acción formativa en función de la modalidad de impartición y de las características de los destinatarios.\n\n### Al finalizar esta unidad serás capaz de:\n- Diseñar objetivos de aprendizaje correctamente formulados\n- Seleccionar y secuenciar contenidos formativos\n- Definir actividades y metodología adecuadas\n- Establecer criterios e instrumentos de evaluación`,
      layout: "single",
    },
    // Tabs: Formación por competencias
    {
      id: id(), type: "tabs", order: 2,
      title: "La Formación por Competencias",
      tabs: [
        {
          id: id(), title: "Concepto",
          content: "La **formación por competencias** es un enfoque que orienta el proceso de enseñanza-aprendizaje hacia la adquisición de competencias profesionales.\n\n**Competencia profesional:** Conjunto de conocimientos, habilidades y actitudes que permiten realizar una actividad laboral con los estándares de calidad requeridos.",
        },
        {
          id: id(), title: "Tipos de competencias",
          content: "### Clasificación:\n\n- **Competencias técnicas (Saber):** Conocimientos teóricos y técnicos\n- **Competencias metodológicas (Saber hacer):** Habilidades y destrezas para aplicar conocimientos\n- **Competencias sociales (Saber estar):** Actitudes y comportamientos en el entorno laboral\n- **Competencias personales (Saber ser):** Valores, motivación, responsabilidad",
        },
        {
          id: id(), title: "Implicaciones pedagógicas",
          content: "### La formación por competencias implica:\n\n1. **Centrar** el proceso en el alumno, no en el docente\n2. **Contextualizar** la formación en situaciones laborales reales\n3. **Integrar** conocimientos, habilidades y actitudes\n4. **Evaluar** el desempeño, no solo la memorización\n5. **Garantizar** la transferencia al puesto de trabajo",
        },
      ],
    },
    // Accordion: Elementos de la programación
    {
      id: id(), type: "accordion", order: 3,
      title: "Características Generales de la Programación",
      items: [
        {
          id: id(), title: "¿Qué es programar?",
          content: "Programar es **planificar de manera ordenada y sistemática** el proceso de enseñanza-aprendizaje.\n\nEs el instrumento que permite al docente anticipar y organizar los elementos del proceso formativo: qué enseñar, cómo enseñar, cuándo enseñar y cómo evaluar.",
        },
        {
          id: id(), title: "Características de una buena programación",
          content: "- **Adecuada:** Adaptada a las características del grupo destinatario\n- **Concreta:** Con objetivos, contenidos y actividades bien definidos\n- **Flexible:** Susceptible de ajustes durante el desarrollo\n- **Viable:** Realista en recursos, tiempos e infraestructura\n- **Diversa:** Con variedad metodológica y de actividades",
        },
        {
          id: id(), title: "Elementos principales",
          content: "1. Objetivos\n2. Contenidos\n3. Actividades\n4. Metodología\n5. Recursos\n6. Temporalización\n7. Evaluación",
        },
      ],
      allow_multiple_open: true,
    },
    // Content: Objetivos
    {
      id: id(), type: "content", order: 4,
      title: "Los Objetivos de Aprendizaje",
      content: `## Definición y funciones\n\nLos objetivos son **enunciados que describen lo que el alumno será capaz de hacer** al finalizar la acción formativa.\n\n### Funciones:\n- Orientar el proceso de enseñanza-aprendizaje\n- Seleccionar contenidos y actividades\n- Definir criterios de evaluación\n\n### Clasificación:\n- **Objetivos generales:** Capacidades amplias a desarrollar\n- **Objetivos específicos:** Concreción observable y medible\n\n### Formulación (verbo en infinitivo + contenido + condición):\n✅ *"Identificar los elementos de un certificado de profesionalidad"*\n❌ *"Conocer los certificados"* (demasiado vago)`,
      layout: "single",
    },
    // Content: Contenidos
    {
      id: id(), type: "content", order: 5,
      title: "Los Contenidos Formativos",
      content: `## Tipos de contenidos\n\n### Conceptuales (Saber)\nHechos, datos, conceptos, principios y teorías.\n*Ejemplo: "Las características de la formación de demanda"*\n\n### Procedimentales (Saber hacer)\nHabilidades, técnicas, estrategias y procedimientos.\n*Ejemplo: "Elaborar una programación didáctica"*\n\n### Actitudinales (Saber ser/estar)\nValores, normas y actitudes.\n*Ejemplo: "Valorar la importancia de la planificación"*\n\n### Normas de redacción:\n- Sustantivos abstractos para conceptuales\n- Sustantivos de acción para procedimentales\n- Verbos que implican valoración para actitudinales`,
      layout: "single",
    },
    // Accordion: Actividades
    {
      id: id(), type: "accordion", order: 6,
      title: "Las Actividades de Aprendizaje",
      items: [
        {
          id: id(), title: "Tipología de actividades",
          content: "- **De inicio/motivación:** Activar conocimientos previos y despertar interés\n- **De desarrollo:** Trabajar los contenidos y adquirir competencias\n- **De consolidación/refuerzo:** Afianzar lo aprendido\n- **De ampliación:** Profundizar para alumnos con ritmo rápido\n- **De evaluación:** Comprobar la adquisición de competencias",
        },
        {
          id: id(), title: "Estructura de la actividad",
          content: "Cada actividad debe incluir:\n\n1. **Título** descriptivo\n2. **Objetivo** que persigue\n3. **Descripción** del procedimiento\n4. **Recursos** necesarios\n5. **Duración** estimada\n6. **Criterios de evaluación** (si aplica)\n7. **Agrupamiento:** individual, parejas, pequeño grupo, gran grupo",
        },
        {
          id: id(), title: "Dinámicas de trabajo en grupo",
          content: "- **Phillips 6-6:** Grupos de 6, 6 minutos de debate\n- **Brainstorming:** Generación libre de ideas\n- **Role-playing:** Simulación de situaciones\n- **Estudio de caso:** Análisis de una situación real\n- **Debate dirigido:** Discusión moderada sobre un tema\n- **Proyecto:** Trabajo colaborativo con producto final",
        },
      ],
      allow_multiple_open: true,
    },
    // Tabs: Metodología
    {
      id: id(), type: "tabs", order: 7,
      title: "Metodología: Métodos y Técnicas Didácticas",
      tabs: [
        {
          id: id(), title: "Métodos didácticos",
          content: "### Principales métodos:\n\n- **Expositivo/Magistral:** Transmisión de conocimientos por el docente\n- **Demostrativo:** El docente muestra cómo se hace\n- **Interrogativo:** A través de preguntas guiadas\n- **Por descubrimiento:** El alumno construye su conocimiento\n- **Activo/Participativo:** El alumno es protagonista\n\n**Recomendación:** Combinar métodos según objetivos y contenidos.",
        },
        {
          id: id(), title: "Modalidades de CP",
          content: "### Características metodológicas según modalidad:\n\n**Presencial:**\n- Sesiones teórico-prácticas\n- Demostraciones y ejercicios en taller\n\n**Teleformación:**\n- Materiales interactivos en plataforma\n- Tutorías síncronas y asíncronas\n- Foros, chats, videoconferencias\n\n**Mixta:**\n- Integración coherente de ambas modalidades\n- Las sesiones presenciales para contenidos prácticos",
        },
        {
          id: id(), title: "Recursos pedagógicos",
          content: "### Tipos de recursos:\n\n- **Impresos:** Manuales, guías, fichas\n- **Audiovisuales:** Vídeos, presentaciones, infografías\n- **Informáticos:** Plataformas LMS, simuladores, apps\n- **Materiales de taller:** Equipos, herramientas\n\n**Bibliografía:** Siempre actualizada y relevante\n**Anexos:** Documentos complementarios (legislación, modelos, plantillas)",
        },
      ],
    },
    // Content: Evaluación
    {
      id: id(), type: "content", order: 8,
      title: "Criterios de Evaluación",
      content: `## Tipos, momentos e instrumentos\n\n### Tipos de evaluación:\n- **Diagnóstica:** Conocimientos previos (inicio)\n- **Formativa:** Durante el proceso (continua)\n- **Sumativa:** Resultados finales\n\n### Instrumentos:\n- Pruebas objetivas (test, completar)\n- Pruebas de ejecución práctica\n- Rúbricas de observación\n- Portafolios\n- Cuestionarios de autoevaluación\n\n### Ponderaciones:\n- Cada criterio de evaluación debe tener un peso definido\n- Se recomienda evaluar conocimientos (30-40%), habilidades (40-50%) y actitudes (10-20%)`,
      layout: "single",
    },
    // Quiz
    {
      id: id(), type: "quiz", order: 9,
      title: "Autoevaluación: Programación didáctica",
      question: "Un objetivo de aprendizaje correctamente formulado debe incluir:",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "Un verbo en infinitivo + contenido + condición", isCorrect: true },
        { id: id(), text: "Solo un verbo descriptivo", isCorrect: false },
        { id: id(), text: "Una lista de contenidos a tratar", isCorrect: false },
        { id: id(), text: "El nombre del módulo formativo", isCorrect: false },
      ],
      explanation: "La formulación correcta de un objetivo incluye: verbo en infinitivo (acción observable) + contenido + condición o contexto.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    {
      id: id(), type: "quiz", order: 10,
      title: "Autoevaluación: Contenidos formativos",
      question: "Los contenidos de tipo 'Saber hacer' se clasifican como:",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "Conceptuales", isCorrect: false },
        { id: id(), text: "Procedimentales", isCorrect: true },
        { id: id(), text: "Actitudinales", isCorrect: false },
        { id: id(), text: "Transversales", isCorrect: false },
      ],
      explanation: "Los contenidos procedimentales (Saber hacer) se refieren a habilidades, técnicas y procedimientos que el alumno debe ser capaz de ejecutar.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    {
      id: id(), type: "summary", order: 11,
      title: "Resumen de la UD3",
      key_points: [
        "La formación por competencias integra saber, saber hacer, saber estar y saber ser",
        "Los objetivos se formulan con verbo en infinitivo + contenido + condición",
        "Los contenidos se clasifican en conceptuales, procedimentales y actitudinales",
        "Las actividades deben ser variadas y adaptadas al grupo destinatario",
        "La metodología debe combinar diferentes métodos según objetivos y modalidad",
        "La evaluación incluye tipos diagnóstico, formativo y sumativo con instrumentos diversos",
      ],
      next_steps: "En la UD4 abordaremos la temporalización de la programación y la elaboración de guías para teleformación.",
    },
  ];
}

// ──────────────────────────────────────────────────────
// UD4: Elaboración de la programación temporalizada (10h)
// ──────────────────────────────────────────────────────
export function generateMF1442_UD4Slides(): Slide[] {
  return [
    {
      id: id(), type: "title", order: 0,
      title: "UD4. Elaboración de la Programación Temporalizada",
      subtitle: "MF1442_3 · Programación didáctica de acciones formativas para el empleo",
      author: "SSCE0110 - Docencia de la formación profesional para el empleo",
    },
    {
      id: id(), type: "content", order: 1,
      title: "Objetivos de aprendizaje",
      content: `## Capacidad a desarrollar\n\n**C4:** Elaborar la programación temporalizada del desarrollo de las unidades didácticas programadas, secuenciar contenidos y actividades.\n\n### Al finalizar esta unidad serás capaz de:\n- Diseñar una temporalización diaria coherente\n- Secuenciar contenidos de forma lógica y pedagógica\n- Elaborar la Guía para acciones formativas en línea`,
      layout: "single",
    },
    // Accordion: Temporalización
    {
      id: id(), type: "accordion", order: 2,
      title: "La Temporalización Diaria",
      items: [
        {
          id: id(), title: "Características",
          content: "La temporalización diaria debe ser:\n\n- **Organizada:** Distribuir los tiempos de forma equilibrada\n- **Flexible:** Permitir ajustes según el desarrollo de la sesión\n- **Completa:** Incluir todos los elementos necesarios (contenidos, actividades, descansos)\n- **Coherente:** Respetar la secuenciación de la programación general",
        },
        {
          id: id(), title: "Estructura de una sesión tipo",
          content: "### Sesión presencial (5 horas):\n\n| Tiempo | Actividad |\n|---|---|\n| 15 min | Acogida y repaso sesión anterior |\n| 45 min | Exposición teórica del contenido |\n| 30 min | Actividad práctica individual |\n| 15 min | Descanso |\n| 45 min | Trabajo en grupo / caso práctico |\n| 30 min | Puesta en común y debate |\n| 15 min | Descanso |\n| 45 min | Ejercicios de consolidación |\n| 15 min | Síntesis y avance próxima sesión |",
        },
        {
          id: id(), title: "Contenido de la temporalización",
          content: "Cada sesión temporalizada debe indicar:\n\n1. **Fecha y horario**\n2. **Objetivos** de la sesión\n3. **Contenidos** a desarrollar\n4. **Actividades** previstas\n5. **Metodología** a emplear\n6. **Recursos** necesarios\n7. **Evaluación** (si corresponde)\n8. **Observaciones**",
        },
      ],
      allow_multiple_open: true,
    },
    // Content: Secuenciación
    {
      id: id(), type: "content", order: 3,
      title: "Secuenciación de Contenidos y Actividades",
      content: `## Criterios de secuenciación\n\n### De lo simple a lo complejo\nComenzar con conceptos básicos y avanzar hacia los más elaborados.\n\n### De lo general a lo particular\nPresentar el marco general antes de entrar en detalles.\n\n### De lo conocido a lo desconocido\nPartir de los conocimientos previos del alumnado.\n\n### Principios pedagógicos:\n- **Significatividad:** Conectar con la realidad profesional\n- **Funcionalidad:** Aplicabilidad inmediata\n- **Globalización:** Interrelación entre contenidos\n- **Actividad:** El alumno como protagonista`,
      layout: "single",
    },
    // Tabs: Guía para teleformación
    {
      id: id(), type: "tabs", order: 4,
      title: "Guía para Acciones Formativas en Línea",
      tabs: [
        {
          id: id(), title: "Propósito",
          content: "La **Guía para las acciones formativas en línea** es un documento obligatorio que orienta al alumno sobre cómo se desarrollará la acción formativa en la plataforma virtual.\n\nDebe ser clara, completa y accesible desde el primer día del curso.",
        },
        {
          id: id(), title: "Contenido de la Guía",
          content: "### Elementos obligatorios:\n\n1. **Presentación** del curso y del equipo tutorial\n2. **Objetivos** generales y por módulo/UF\n3. **Contenidos** y estructura modular\n4. **Metodología** de trabajo en línea\n5. **Plan de tutorización** (horarios, vías de contacto)\n6. **Calendario** y temporalización\n7. **Sistema de evaluación** y criterios\n8. **Recursos técnicos** necesarios\n9. **Normativa** de participación",
        },
        {
          id: id(), title: "Buenas prácticas",
          content: "### Recomendaciones:\n\n- Incluir un **vídeo de bienvenida** del tutor\n- Ofrecer un **tutorial** de navegación por la plataforma\n- Establecer **plazos claros** para cada actividad\n- Definir **canales de comunicación** y tiempos de respuesta\n- Incluir **FAQ** con dudas frecuentes\n- Proporcionar **contacto técnico** para incidencias con la plataforma",
        },
      ],
    },
    // Quiz
    {
      id: id(), type: "quiz", order: 5,
      title: "Autoevaluación: Temporalización",
      question: "¿Cuál es el principio de secuenciación que indica comenzar con conceptos básicos y avanzar hacia los más complejos?",
      question_type: "multiple-choice",
      options: [
        { id: id(), text: "De lo general a lo particular", isCorrect: false },
        { id: id(), text: "De lo simple a lo complejo", isCorrect: true },
        { id: id(), text: "De lo conocido a lo desconocido", isCorrect: false },
        { id: id(), text: "De lo concreto a lo abstracto", isCorrect: false },
      ],
      explanation: "El principio de 'lo simple a lo complejo' establece que los contenidos deben presentarse comenzando por los más sencillos para ir progresivamente aumentando la dificultad.",
      points: 1, max_attempts: 2, shuffle_options: true,
    },
    {
      id: id(), type: "summary", order: 6,
      title: "Resumen de la UD4",
      key_points: [
        "La temporalización diaria debe ser organizada, flexible, completa y coherente",
        "Cada sesión incluye fecha, objetivos, contenidos, actividades, metodología y recursos",
        "La secuenciación sigue principios: de lo simple a lo complejo, de lo general a lo particular",
        "La Guía para teleformación es obligatoria e incluye presentación, metodología y plan de tutorización",
        "Las buenas prácticas incluyen vídeos de bienvenida, tutoriales y FAQ",
      ],
      next_steps: "Has completado el módulo MF1442_3. A continuación puedes realizar el test de evaluación del módulo.",
    },
  ];
}

/**
 * Devuelve todas las plantillas del MF1442_3 indexadas por ID de unidad formativa
 */
export function getMF1442Templates(): Record<string, { title: string; generator: () => Slide[] }> {
  return {
    "fa2cb0cb-2ac0-46d8-ba73-46a9350d8f46": {
      title: "UD1 - Estructura de la Formación Profesional",
      generator: generateMF1442_UD1Slides,
    },
    "d961b449-b01e-47f7-a5fc-a8925ab53682": {
      title: "UD2 - Certificados de Profesionalidad",
      generator: generateMF1442_UD2Slides,
    },
    "4bfd529a-674e-4033-97d8-159d8f5aabaa": {
      title: "UD3 - Elaboración de la Programación Didáctica",
      generator: generateMF1442_UD3Slides,
    },
    "77fba643-106c-49a7-a55c-76cbe59d905f": {
      title: "UD4 - Programación Temporalizada",
      generator: generateMF1442_UD4Slides,
    },
  };
}
