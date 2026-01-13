// UF0517 - UD2: LA ORGANIZACIÓN DE LOS RECURSOS HUMANOS
// 50+ Comprehensive Interactive Slides with visual design elements

import { ContentSlide } from './types';

// Extended slide types for more interactivity
export interface ExtendedContentSlide extends ContentSlide {
  accordionItems?: { id: string; title: string; content: string; icon?: string }[];
  flashcards?: { id: string; front: string; back: string }[];
  imageUrl?: string;
  imageCaption?: string;
  highlightBox?: { type: 'info' | 'warning' | 'tip' | 'important'; content: string };
  processSteps?: { step: number; title: string; description: string }[];
  mindMapData?: { center: string; branches: { label: string; children: string[] }[] };
}

export const generateUF0517UD2Slides = (): ExtendedContentSlide[] => [
  // ==================== INTRODUCCIÓN ====================
  {
    id: "uf0517-ud2-001",
    type: "intro",
    title: "UD2 - La Organización de los Recursos Humanos",
    section: "Introducción",
    content: `# 👥 La Organización de los Recursos Humanos

Bienvenido a esta **Unidad Didáctica** sobre la gestión del capital humano en las organizaciones.

## 🎯 ¿Qué aprenderás?

Conocerás cómo se estructura y gestiona el personal en las empresas, desde la selección hasta la salida.

> **Objetivo General:** Comprender las funciones del departamento de RR.HH. y los procesos de gestión de personal.`,
    keyTerms: ["Recursos Humanos", "Gestión de personal", "Capital humano"]
  },
  {
    id: "uf0517-ud2-002",
    type: "content",
    title: "Objetivos de Aprendizaje",
    section: "Introducción",
    content: `# 📋 Objetivos de la Unidad

## 🎯 Al finalizar serás capaz de:

1. **Identificar** las funciones del departamento de RR.HH.
2. **Conocer** los procesos de selección de personal
3. **Comprender** los tipos de contratos de trabajo
4. **Elaborar** documentos básicos de personal
5. **Gestionar** la documentación laboral
6. **Aplicar** la normativa laboral básica

> **⏱️ Duración estimada:** 30 horas de formación`,
    keyTerms: ["Objetivos", "Competencias"]
  },

  // ==================== SECCIÓN 1: EL DEPARTAMENTO DE RR.HH. ====================
  {
    id: "uf0517-ud2-003",
    type: "content",
    title: "1.1 El Departamento de Recursos Humanos",
    section: "1. Departamento de RR.HH.",
    content: `# 👥 El Departamento de Recursos Humanos

El departamento de **Recursos Humanos** (RR.HH.) se encarga de gestionar el capital humano de la organización.

## 🎯 Misión del Departamento

> "Atraer, desarrollar y retener el talento necesario para alcanzar los objetivos de la organización"

## 📋 Funciones Principales

| Función | Descripción |
|---------|-------------|
| **Planificación** | Prever necesidades de personal |
| **Reclutamiento** | Atraer candidatos cualificados |
| **Selección** | Elegir al mejor candidato |
| **Contratación** | Formalizar la relación laboral |
| **Formación** | Desarrollar competencias |
| **Evaluación** | Medir el desempeño |
| **Compensación** | Gestionar salarios y beneficios |
| **Relaciones laborales** | Gestionar el clima y conflictos |

> **💡 RR.HH. ha evolucionado de "Personal" a socio estratégico del negocio.**`,
    keyTerms: ["RR.HH.", "Capital humano", "Funciones"]
  },
  {
    id: "uf0517-ud2-004",
    type: "content",
    title: "1.2 Mapa: Áreas de RR.HH.",
    section: "1. Departamento de RR.HH.",
    content: `# 🗺️ Estructura del Departamento de RR.HH.

\`\`\`
                    ┌─────────────────────┐
                    │    DIRECCIÓN DE     │
                    │   RECURSOS HUMANOS  │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
  ┌───────────┐        ┌───────────┐        ┌───────────┐
  │SELECCIÓN Y│        │ADMINISTRA-│        │DESARROLLO │
  │RECLUTAMIE.│        │CIÓN PERS. │        │DE PERSONAS│
  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘
        │                    │                    │
        ▼                    ▼                    ▼
  • Ofertas empleo     • Nóminas           • Formación
  • Entrevistas        • Contratos         • Evaluación
  • Incorporación      • Seg. Social       • Planes carrera
  • Employer brand     • Bajas/Altas       • Clima laboral
\`\`\`

> **📌 En PYMES, una misma persona puede realizar varias de estas funciones.**`,
    keyTerms: ["Estructura RR.HH.", "Áreas funcionales"]
  },
  {
    id: "uf0517-ud2-005",
    type: "table",
    title: "1.3 Documentos de RR.HH.",
    section: "1. Departamento de RR.HH.",
    content: `# 📄 Documentos que Gestiona RR.HH.`,
    tableData: {
      headers: ["Documento", "Contenido", "Obligatoriedad"],
      rows: [
        ["📋 Contrato de trabajo", "Condiciones laborales pactadas", "Obligatorio"],
        ["💰 Nómina", "Retribución mensual detallada", "Obligatorio"],
        ["📝 Parte de alta/baja", "Comunicación a Seg. Social", "Obligatorio"],
        ["📊 Ficha del empleado", "Datos personales y laborales", "Recomendable"],
        ["📅 Calendario laboral", "Horarios, turnos, festivos", "Obligatorio"],
        ["🗓️ Control de presencia", "Registro jornada", "Obligatorio desde 2019"],
        ["📖 Curriculum vitae", "Trayectoria del candidato", "Proceso selección"],
        ["✍️ Finiquito", "Liquidación fin de contrato", "Obligatorio"]
      ]
    },
    keyTerms: ["Documentos laborales", "Nómina", "Contrato"]
  },
  {
    id: "uf0517-ud2-006",
    type: "quiz",
    title: "📝 Test: Departamento RR.HH.",
    section: "1. Departamento de RR.HH.",
    content: "Evalúa tu comprensión sobre el departamento de Recursos Humanos.",
    quiz: {
      id: "quiz-ud2-001",
      question: "¿Cuál de las siguientes NO es una función típica del departamento de Recursos Humanos?",
      options: [
        { id: "a", text: "Selección de personal", isCorrect: false },
        { id: "b", text: "Gestión de nóminas", isCorrect: false },
        { id: "c", text: "Facturación a clientes", isCorrect: true },
        { id: "d", text: "Formación de empleados", isCorrect: false }
      ],
      explanation: "La FACTURACIÓN A CLIENTES es función del departamento Comercial o Administración, no de Recursos Humanos. RR.HH. se centra en la gestión del personal.",
      hint: "Piensa en qué funciones están relacionadas con los empleados."
    },
    keyTerms: ["Funciones RR.HH."]
  },

  // ==================== SECCIÓN 2: PROCESO DE SELECCIÓN ====================
  {
    id: "uf0517-ud2-007",
    type: "content",
    title: "2.1 El Proceso de Selección",
    section: "2. Selección de Personal",
    content: `# 🎯 El Proceso de Selección de Personal

La **selección de personal** es el proceso de identificar y elegir al candidato más adecuado para un puesto de trabajo.

## 🔄 Fases del Proceso

\`\`\`
  ┌─────────────────────────────────────────────────────┐
  │              PROCESO DE SELECCIÓN                   │
  └───────────────────────┬─────────────────────────────┘
                          │
   1️⃣ ──► 2️⃣ ──► 3️⃣ ──► 4️⃣ ──► 5️⃣ ──► 6️⃣
  ANÁLISIS RECLU- PRESE-  ENTRE- SELEC- INCOR-
  PUESTO TAMIEN. LECCIÓ  VISTAS CIÓN  PORAC.
\`\`\`

## 📋 Detalle de las Fases

1. **Análisis del puesto:** Definir perfil y requisitos
2. **Reclutamiento:** Atraer candidatos (anuncios, portales)
3. **Preselección:** Filtrar currículums
4. **Entrevistas:** Conocer a los candidatos
5. **Selección:** Elegir al mejor candidato
6. **Incorporación:** Integrar al nuevo empleado

> **💡 Un buen proceso de selección reduce la rotación y mejora la productividad.**`,
    keyTerms: ["Selección", "Reclutamiento", "Entrevista"]
  },
  {
    id: "uf0517-ud2-008",
    type: "content",
    title: "2.2 El Reclutamiento",
    section: "2. Selección de Personal",
    content: `# 📢 Fuentes de Reclutamiento

El **reclutamiento** es el proceso de atraer candidatos potenciales para cubrir una vacante.

## 🔍 Tipos de Reclutamiento

### 🏠 Reclutamiento Interno
> Promocionar o reubicar a empleados actuales

**Ventajas:**
- ✅ Conocen la empresa
- ✅ Más rápido y económico
- ✅ Motiva al personal

**Inconvenientes:**
- ❌ Limita ideas nuevas
- ❌ Puede generar conflictos

### 🌍 Reclutamiento Externo
> Buscar candidatos fuera de la organización

**Fuentes:**
- 🌐 Portales de empleo (Infojobs, LinkedIn)
- 🏛️ Servicio Público de Empleo (SEPE)
- 🎓 Universidades y centros de formación
- 📰 Anuncios y redes sociales
- 🤝 Agencias de colocación y ETT

> **📌 Lo ideal es combinar ambos tipos según la situación.**`,
    keyTerms: ["Reclutamiento interno", "Reclutamiento externo", "Fuentes"]
  },
  {
    id: "uf0517-ud2-009",
    type: "flashcards",
    title: "2.3 Tarjetas: Técnicas de Selección",
    section: "2. Selección de Personal",
    content: `# 🎴 Técnicas de Selección de Personal`,
    flashcards: [
      { id: "fc1", front: "¿Qué es una entrevista por competencias?", back: "Técnica que evalúa habilidades y comportamientos pasados del candidato mediante preguntas sobre situaciones reales que ha vivido." },
      { id: "fc2", front: "¿Qué es un Assessment Center?", back: "Método de evaluación grupal donde los candidatos realizan pruebas, dinámicas y ejercicios observados por evaluadores." },
      { id: "fc3", front: "¿Qué son las pruebas psicotécnicas?", back: "Tests estandarizados que miden aptitudes (numérica, verbal, espacial), personalidad o inteligencia del candidato." },
      { id: "fc4", front: "¿Qué es una dinámica de grupo?", back: "Ejercicio donde varios candidatos debaten o resuelven un problema juntos, observados para evaluar trabajo en equipo y liderazgo." },
      { id: "fc5", front: "¿Qué es el headhunting?", back: "Búsqueda directa de profesionales de alto nivel que no están buscando empleo activamente. Se usa para puestos directivos." }
    ],
    keyTerms: ["Entrevista", "Assessment", "Headhunting"]
  },
  {
    id: "uf0517-ud2-010",
    type: "content",
    title: "2.4 La Entrevista de Trabajo",
    section: "2. Selección de Personal",
    content: `# 🗣️ La Entrevista de Selección

La **entrevista** es la técnica de selección más utilizada. Permite conocer al candidato personalmente.

## 📋 Tipos de Entrevista

| Tipo | Características | Uso |
|------|-----------------|-----|
| **Individual** | Un entrevistador y un candidato | La más común |
| **De panel** | Varios entrevistadores | Puestos importantes |
| **Grupal** | Varios candidatos simultáneos | Primeras fases |
| **Telefónica** | Preselección rápida | Filtro inicial |
| **Videoentrevista** | Por videoconferencia | Candidatos a distancia |

## 🎯 Fases de la Entrevista

1. **Preparación:** Revisar CV, preparar preguntas
2. **Acogida:** Crear ambiente cómodo
3. **Desarrollo:** Preguntas y evaluación
4. **Cierre:** Informar próximos pasos
5. **Evaluación:** Documentar impresiones

> **⚠️ Hay preguntas que NO se pueden hacer: religión, política, estado civil, planes de embarazo...**`,
    keyTerms: ["Entrevista", "Tipos", "Fases"]
  },
  {
    id: "uf0517-ud2-011",
    type: "checklist",
    title: "2.5 Checklist del Entrevistador",
    section: "2. Selección de Personal",
    content: `# ✅ Checklist para Realizar una Buena Entrevista`,
    checklistItems: [
      { id: "ent1", text: "PREPARACIÓN: He revisado el CV y la descripción del puesto", checked: false },
      { id: "ent2", text: "AMBIENTE: He preparado un espacio tranquilo y sin interrupciones", checked: false },
      { id: "ent3", text: "PREGUNTAS: Tengo un guion con preguntas preparadas", checked: false },
      { id: "ent4", text: "LEGALIDAD: Mis preguntas respetan la normativa (no discriminación)", checked: false },
      { id: "ent5", text: "ESCUCHA: Dejo hablar al candidato (80% candidato, 20% yo)", checked: false },
      { id: "ent6", text: "NOTAS: Tomo apuntes durante la entrevista", checked: false },
      { id: "ent7", text: "TIEMPO: Gestiono bien el tiempo de la entrevista", checked: false },
      { id: "ent8", text: "CIERRE: Informo al candidato de los próximos pasos", checked: false }
    ],
    keyTerms: ["Buenas prácticas", "Entrevista"]
  },
  {
    id: "uf0517-ud2-012",
    type: "quiz",
    title: "📝 Test: Selección de Personal",
    section: "2. Selección de Personal",
    content: "Comprueba tus conocimientos sobre selección de personal.",
    quiz: {
      id: "quiz-ud2-002",
      question: "¿Qué fuente de reclutamiento consiste en promocionar a empleados actuales para cubrir una vacante?",
      options: [
        { id: "a", text: "Reclutamiento externo", isCorrect: false },
        { id: "b", text: "Reclutamiento interno", isCorrect: true },
        { id: "c", text: "Headhunting", isCorrect: false },
        { id: "d", text: "ETT", isCorrect: false }
      ],
      explanation: "El RECLUTAMIENTO INTERNO consiste en cubrir vacantes con personal que ya trabaja en la empresa, mediante promoción o traslado.",
      hint: "Piensa en dónde están las personas que ya conocen la empresa."
    },
    keyTerms: ["Reclutamiento interno"]
  },

  // ==================== SECCIÓN 3: EL CONTRATO DE TRABAJO ====================
  {
    id: "uf0517-ud2-013",
    type: "content",
    title: "3.1 El Contrato de Trabajo",
    section: "3. El Contrato de Trabajo",
    content: `# 📋 El Contrato de Trabajo

El **contrato de trabajo** es el acuerdo entre empresario y trabajador por el que este se compromete a prestar sus servicios a cambio de una retribución.

## 🔑 Elementos Esenciales

| Elemento | Descripción |
|----------|-------------|
| **Consentimiento** | Acuerdo libre de ambas partes |
| **Objeto** | Prestación de servicios |
| **Causa** | Retribución económica |

## 📄 Contenido Obligatorio

- 👤 Identificación de las partes
- 📅 Fecha de inicio (y fin si es temporal)
- 💼 Puesto de trabajo y funciones
- 💰 Salario y complementos
- ⏰ Jornada de trabajo
- 🏖️ Vacaciones
- ⏳ Periodo de prueba
- 📍 Centro de trabajo
- 📜 Convenio colectivo aplicable

> **⚖️ Base legal:** Real Decreto Legislativo 2/2015, Estatuto de los Trabajadores.`,
    keyTerms: ["Contrato de trabajo", "Elementos", "Contenido"]
  },
  {
    id: "uf0517-ud2-014",
    type: "content",
    title: "3.2 Mapa: Tipos de Contratos",
    section: "3. El Contrato de Trabajo",
    content: `# 🗺️ Clasificación de los Contratos de Trabajo

\`\`\`
               ┌─────────────────────────────┐
               │   CONTRATOS DE TRABAJO      │
               └──────────────┬──────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │  INDEFINIDO  │   │  TEMPORAL    │   │  FORMACIÓN   │
   │              │   │              │   │  Y PRÁCTICAS │
   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
          │                  │                  │
          ▼                  ▼                  ▼
   • Ordinario        • Obra/servicio     • Formación dual
   • Fijo-discontinuo • Circunstancias    • Prácticas
   • A tiempo parcial   producción        
\`\`\`

> **📌 Tras la reforma laboral 2022, el contrato indefinido es el tipo preferente.**`,
    keyTerms: ["Tipos de contratos", "Indefinido", "Temporal"],
    mindMapData: {
      center: "CONTRATOS",
      branches: [
        { label: "Indefinido", children: ["Ordinario", "Fijo-discontinuo", "Tiempo parcial"] },
        { label: "Temporal", children: ["Obra/servicio", "Circunstancias producción"] },
        { label: "Formativos", children: ["Formación dual", "Prácticas"] }
      ]
    }
  },
  {
    id: "uf0517-ud2-015",
    type: "table",
    title: "3.3 Características de los Contratos",
    section: "3. El Contrato de Trabajo",
    content: `# 📊 Principales Tipos de Contratos`,
    tableData: {
      headers: ["Tipo", "Duración", "Causa", "Indemnización fin"],
      rows: [
        ["📌 Indefinido ordinario", "Sin límite", "Relación estable", "20/33 días por año"],
        ["📌 Fijo-discontinuo", "Sin límite", "Actividades estacionales", "20/33 días por año"],
        ["⏳ Circunstancias producción", "Máx. 6 meses (1 año por convenio)", "Aumento puntual trabajo", "12 días por año"],
        ["⏳ Sustitución", "Mientras dure la causa", "Cubrir ausencia trabajador", "12 días por año"],
        ["🎓 Formación en alternancia", "Mín. 3 meses, máx. 2 años", "Compatibilizar trabajo y formación", "Sin indemnización"],
        ["🎓 Prácticas", "Mín. 6 meses, máx. 1 año", "Primera experiencia profesional", "Sin indemnización"]
      ]
    },
    keyTerms: ["Indefinido", "Temporal", "Formativo"]
  },
  {
    id: "uf0517-ud2-016",
    type: "content",
    title: "3.4 El Contrato Indefinido",
    section: "3. El Contrato de Trabajo",
    content: `# 📌 El Contrato Indefinido

Es el contrato **sin fecha de finalización**. La relación laboral se mantiene hasta que alguna de las partes la extingue.

## 🏗️ Modalidades

### 📋 Indefinido Ordinario
- Sin limitación temporal
- Puede ser a tiempo completo o parcial
- Indemnización por despido: 33 días/año (procedente) o 20 días/año (objetivo)

### 📅 Fijo-Discontinuo
- Para trabajos estacionales o de temporada
- Llamamiento periódico según actividad
- Ejemplo: hostelería veraniega, campañas agrícolas

## ✅ Ventajas del Contrato Indefinido

| Para el trabajador | Para la empresa |
|-------------------|-----------------|
| Estabilidad laboral | Mayor compromiso |
| Facilidad créditos | Menor rotación |
| Desarrollo carrera | Bonificaciones SS |

> **💡 Desde 2022, los contratos temporales son la excepción y deben justificarse por causa.**`,
    keyTerms: ["Indefinido", "Fijo-discontinuo", "Estabilidad"]
  },
  {
    id: "uf0517-ud2-017",
    type: "flashcards",
    title: "3.5 Tarjetas: Conceptos Contractuales",
    section: "3. El Contrato de Trabajo",
    content: `# 🎴 Conceptos Clave sobre Contratos`,
    flashcards: [
      { id: "fc6", front: "¿Qué es el periodo de prueba?", back: "Tiempo inicial donde cualquier parte puede resolver el contrato sin indemnización ni preaviso. Máximo: 6 meses técnicos titulados, 2 meses resto." },
      { id: "fc7", front: "¿Qué es el finiquito?", back: "Documento que liquida las cantidades pendientes al finalizar la relación laboral: salario, vacaciones no disfrutadas, pagas extras prorrateadas." },
      { id: "fc8", front: "¿Qué es la jornada a tiempo parcial?", back: "Cuando el trabajador presta servicios durante menos horas que un trabajador a tiempo completo comparable." },
      { id: "fc9", front: "¿Qué es un convenio colectivo?", back: "Acuerdo entre sindicatos y empresas que regula las condiciones de trabajo de un sector o empresa: salarios, jornada, permisos, etc." },
      { id: "fc10", front: "¿Qué diferencia hay entre despido procedente e improcedente?", back: "Procedente: justificado, 20 días/año. Improcedente: no justificado, 33 días/año (con límite) o readmisión." }
    ],
    keyTerms: ["Periodo de prueba", "Finiquito", "Convenio"]
  },
  {
    id: "uf0517-ud2-018",
    type: "quiz",
    title: "📝 Test: Contratos de Trabajo",
    section: "3. El Contrato de Trabajo",
    content: "Evalúa tus conocimientos sobre contratos de trabajo.",
    quiz: {
      id: "quiz-ud2-003",
      question: "¿Cuál es la duración máxima del periodo de prueba para un trabajador NO titulado en una empresa de más de 25 trabajadores?",
      options: [
        { id: "a", text: "1 mes", isCorrect: false },
        { id: "b", text: "2 meses", isCorrect: true },
        { id: "c", text: "3 meses", isCorrect: false },
        { id: "d", text: "6 meses", isCorrect: false }
      ],
      explanation: "El periodo de prueba máximo es de 2 MESES para trabajadores sin título. Para técnicos titulados puede ser de hasta 6 meses. En empresas de menos de 25 trabajadores puede ser de hasta 3 meses para no titulados.",
      hint: "Recuerda que los técnicos titulados tienen más plazo de periodo de prueba."
    },
    keyTerms: ["Periodo de prueba"]
  },

  // ==================== SECCIÓN 4: LA NÓMINA ====================
  {
    id: "uf0517-ud2-019",
    type: "content",
    title: "4.1 La Nómina o Recibo de Salarios",
    section: "4. La Nómina",
    content: `# 💰 La Nómina

La **nómina** es el documento que justifica el pago de la retribución al trabajador. Debe incluir todos los conceptos salariales y las deducciones.

## 📋 Estructura de la Nómina

\`\`\`
┌─────────────────────────────────────────────────┐
│                    NÓMINA                       │
├─────────────────────────────────────────────────┤
│ ENCABEZADO                                      │
│ • Datos empresa (CIF, nombre, dirección, CCC)   │
│ • Datos trabajador (NIF, nombre, categoría)     │
│ • Periodo de liquidación                        │
├─────────────────────────────────────────────────┤
│ DEVENGOS (A)                                    │
│ • Salario base                                  │
│ • Complementos salariales                       │
│ • Pagas extras (prorrateadas o no)              │
│ • Horas extraordinarias                         │
├─────────────────────────────────────────────────┤
│ DEDUCCIONES (B)                                 │
│ • Seguridad Social trabajador                   │
│ • IRPF                                          │
│ • Anticipos                                     │
├─────────────────────────────────────────────────┤
│ LÍQUIDO A PERCIBIR = A - B                      │
└─────────────────────────────────────────────────┘
\`\`\`

> **📌 El empresario debe entregar al trabajador una copia de la nómina.**`,
    keyTerms: ["Nómina", "Devengos", "Deducciones"]
  },
  {
    id: "uf0517-ud2-020",
    type: "table",
    title: "4.2 Conceptos Salariales (Devengos)",
    section: "4. La Nómina",
    content: `# 💶 Devengos: Lo que el Trabajador Gana`,
    tableData: {
      headers: ["Concepto", "Descripción", "Cotiza SS"],
      rows: [
        ["💵 Salario base", "Retribución fija por tiempo trabajado", "Sí"],
        ["⭐ Antigüedad", "Por años de servicio en la empresa", "Sí"],
        ["🎯 Complemento puesto", "Por características del puesto (peligrosidad, nocturnidad)", "Sí"],
        ["📈 Incentivos/Comisiones", "Por rendimiento o ventas", "Sí"],
        ["🎄 Pagas extraordinarias", "Mínimo 2 al año (suelen ser en julio y diciembre)", "Sí (prorrateadas)"],
        ["⏰ Horas extraordinarias", "Horas por encima de la jornada ordinaria", "Sí"],
        ["🍽️ Plus transporte/dietas", "Compensación por desplazamientos", "No (hasta límites)"],
        ["👕 Plus vestuario", "Para ropa de trabajo", "No (hasta límites)"]
      ]
    },
    keyTerms: ["Salario base", "Complementos", "Pagas extras"]
  },
  {
    id: "uf0517-ud2-021",
    type: "content",
    title: "4.3 Deducciones de la Nómina",
    section: "4. La Nómina",
    content: `# ➖ Deducciones: Lo que se Descuenta

Las **deducciones** son las cantidades que se restan al salario bruto.

## 📊 Principales Deducciones

### 🏥 Seguridad Social (cuota obrera)

| Contingencia | Tipo (%) |
|--------------|----------|
| Contingencias comunes | 4,70% |
| Desempleo (general) | 1,55% |
| Formación Profesional | 0,10% |
| **TOTAL aprox.** | **6,35%** |

### 💸 IRPF (Retención)

Porcentaje variable según:
- Salario anual
- Situación familiar
- Comunidad Autónoma
- Tipo de contrato

> **Rango típico:** Entre 2% y 45% (progresivo)

### 📋 Otras Deducciones

- Anticipos recibidos
- Valor productos en especie
- Cuotas sindicales
- Embargos judiciales

> **💡 El LÍQUIDO = Devengos - Deducciones = Lo que llega a la cuenta.**`,
    keyTerms: ["Deducciones", "Seguridad Social", "IRPF"]
  },
  {
    id: "uf0517-ud2-022",
    type: "content",
    title: "4.4 Ejemplo Práctico de Nómina",
    section: "4. La Nómina",
    content: `# 📝 Ejemplo de Cálculo de Nómina

## Datos del trabajador:
- Salario base: 1.500 €
- Antigüedad: 50 €
- Plus transporte: 80 €
- Pagas extras: prorrateadas
- Retención IRPF: 12%

## 📋 Cálculo:

\`\`\`
┌─────────────────────────────────────────────┐
│ DEVENGOS                                    │
├─────────────────────────────────────────────┤
│ Salario base                     1.500,00 € │
│ Antigüedad                          50,00 € │
│ Plus transporte (no cotiza)         80,00 € │
│ Prorrata pagas extras (1550/6)     258,33 € │
│ ─────────────────────────────────────────── │
│ TOTAL DEVENGOS                  1.888,33 € │
├─────────────────────────────────────────────┤
│ DEDUCCIONES                                 │
├─────────────────────────────────────────────┤
│ Base cotización: 1808,33 €                  │
│ SS (6,35%)                        114,83 € │
│ IRPF (12%)                        226,60 € │
│ ─────────────────────────────────────────── │
│ TOTAL DEDUCCIONES                 341,43 € │
├─────────────────────────────────────────────┤
│ LÍQUIDO A PERCIBIR              1.546,90 € │
└─────────────────────────────────────────────┘
\`\`\`

> **📌 Este es un ejemplo simplificado. Las nóminas reales pueden tener más conceptos.**`,
    keyTerms: ["Cálculo nómina", "Ejemplo", "Líquido"]
  },
  {
    id: "uf0517-ud2-023",
    type: "quiz",
    title: "📝 Test: La Nómina",
    section: "4. La Nómina",
    content: "Evalúa tus conocimientos sobre la nómina.",
    quiz: {
      id: "quiz-ud2-004",
      question: "Si un trabajador tiene 2.000€ de devengos y 400€ de deducciones, ¿cuál es su líquido a percibir?",
      options: [
        { id: "a", text: "2.400 €", isCorrect: false },
        { id: "b", text: "1.600 €", isCorrect: true },
        { id: "c", text: "400 €", isCorrect: false },
        { id: "d", text: "2.000 €", isCorrect: false }
      ],
      explanation: "El LÍQUIDO A PERCIBIR = Devengos - Deducciones = 2.000 - 400 = 1.600 €. Es la cantidad que realmente cobra el trabajador.",
      hint: "Recuerda: devengos es lo que ganas, deducciones es lo que te quitan."
    },
    keyTerms: ["Líquido", "Cálculo"]
  },

  // ==================== SECCIÓN 5: SEGURIDAD SOCIAL ====================
  {
    id: "uf0517-ud2-024",
    type: "content",
    title: "5.1 El Sistema de Seguridad Social",
    section: "5. Seguridad Social",
    content: `# 🏥 La Seguridad Social

La **Seguridad Social** es el sistema público que protege a los ciudadanos ante situaciones de necesidad.

## 🎯 Principios del Sistema

| Principio | Significado |
|-----------|-------------|
| **Universalidad** | Protección para todos |
| **Solidaridad** | Los activos financian a pasivos |
| **Obligatoriedad** | Cotización obligatoria |
| **Proporcionalidad** | Prestaciones según cotización |

## 📋 Contingencias Cubiertas

- 🤒 Enfermedad común y accidente no laboral
- ⚠️ Accidente de trabajo y enfermedad profesional
- 🤰 Maternidad, paternidad, riesgo durante embarazo
- 👴 Jubilación
- 💀 Muerte y supervivencia
- 📉 Desempleo
- 👨‍👧 Cargas familiares

> **💡 España tiene un sistema de reparto: las cotizaciones actuales pagan las pensiones actuales.**`,
    keyTerms: ["Seguridad Social", "Contingencias", "Cotización"]
  },
  {
    id: "uf0517-ud2-025",
    type: "table",
    title: "5.2 Prestaciones de la Seguridad Social",
    section: "5. Seguridad Social",
    content: `# 📋 Principales Prestaciones de la Seguridad Social`,
    tableData: {
      headers: ["Prestación", "Situación protegida", "Requisitos básicos"],
      rows: [
        ["🤒 Incapacidad temporal", "Baja por enfermedad o accidente", "Estar afiliado y cotizando"],
        ["♿ Incapacidad permanente", "Reducción permanente de capacidad", "Según grado y edad"],
        ["👴 Jubilación", "Cese de actividad por edad", "Edad y periodo cotizado"],
        ["📉 Desempleo", "Pérdida involuntaria de empleo", "12 meses cotizados"],
        ["🤰 Maternidad/Paternidad", "Nacimiento, adopción, acogida", "Estar afiliado/a"],
        ["💀 Viudedad", "Fallecimiento del cónyuge", "Matrimonio o pareja de hecho"],
        ["👶 Orfandad", "Menores huérfanos", "Hijos del causante"]
      ]
    },
    keyTerms: ["Prestaciones", "Incapacidad", "Jubilación"]
  },
  {
    id: "uf0517-ud2-026",
    type: "content",
    title: "5.3 Afiliación, Alta y Baja",
    section: "5. Seguridad Social",
    content: `# 📝 Trámites ante la Seguridad Social

## 🔄 Proceso de Incorporación

\`\`\`
    ┌─────────────────────────────────────────┐
    │     INICIO RELACIÓN LABORAL             │
    └────────────────┬────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │    ¿Ya afiliado?      │
         └───────────┬───────────┘
              NO     │     SÍ
         ┌───────────▼───────────┐
         │    AFILIACIÓN         │───────┐
         │  (número SS único)    │       │
         └───────────┬───────────┘       │
                     │                   │
         ┌───────────▼───────────────────▼┐
         │         ALTA                    │
         │  (en régimen correspondiente)   │
         └─────────────────────────────────┘
\`\`\`

## 📋 Documentos y Plazos

| Trámite | Plazo | Documento |
|---------|-------|-----------|
| **Afiliación** | Antes de iniciar trabajo | TA.1 (si no tiene nº SS) |
| **Alta** | Antes de iniciar trabajo | TA.2/S o Sistema RED |
| **Baja** | 3 días naturales desde cese | TA.2/S o Sistema RED |
| **Variación datos** | 3 días naturales | Según tipo de variación |

> **⚠️ El incumplimiento de estos plazos genera sanciones a la empresa.**`,
    keyTerms: ["Afiliación", "Alta", "Baja", "Sistema RED"]
  },
  {
    id: "uf0517-ud2-027",
    type: "quiz",
    title: "📝 Test: Seguridad Social",
    section: "5. Seguridad Social",
    content: "Comprueba tus conocimientos sobre la Seguridad Social.",
    quiz: {
      id: "quiz-ud2-005",
      question: "¿En qué plazo debe comunicarse la BAJA de un trabajador a la Seguridad Social?",
      options: [
        { id: "a", text: "El mismo día del cese", isCorrect: false },
        { id: "b", text: "3 días naturales desde el cese", isCorrect: true },
        { id: "c", text: "7 días hábiles desde el cese", isCorrect: false },
        { id: "d", text: "Un mes desde el cese", isCorrect: false }
      ],
      explanation: "La BAJA debe comunicarse en el plazo de 3 DÍAS NATURALES desde el cese de la actividad laboral. El alta, en cambio, debe hacerse ANTES de iniciar el trabajo.",
      hint: "Los plazos de alta y baja son diferentes: alta antes de empezar, baja después de terminar."
    },
    keyTerms: ["Plazo baja"]
  },

  // ==================== SECCIÓN 6: FORMACIÓN Y DESARROLLO ====================
  {
    id: "uf0517-ud2-028",
    type: "content",
    title: "6.1 La Formación en la Empresa",
    section: "6. Formación y Desarrollo",
    content: `# 🎓 Formación y Desarrollo de Personas

La **formación** es la herramienta para desarrollar las competencias del personal y mejorar su desempeño.

## 🎯 Objetivos de la Formación

| Objetivo | Beneficio |
|----------|-----------|
| **Actualización** | Mantener conocimientos al día |
| **Especialización** | Profundizar en áreas concretas |
| **Adaptación** | Ajustarse a cambios tecnológicos |
| **Promoción** | Preparar para nuevos puestos |
| **Motivación** | Demostrar interés en el empleado |

## 📋 Tipos de Formación

1. **De acogida:** Para nuevas incorporaciones
2. **Técnica:** Conocimientos específicos del puesto
3. **En habilidades:** Soft skills (comunicación, liderazgo)
4. **Obligatoria:** Prevención de riesgos, protección de datos
5. **Continua:** A lo largo de toda la carrera

> **💡 La formación es una inversión, no un gasto. Genera retorno en productividad y compromiso.**`,
    keyTerms: ["Formación", "Desarrollo", "Competencias"]
  },
  {
    id: "uf0517-ud2-029",
    type: "flashcards",
    title: "6.2 Tarjetas: Conceptos de Formación",
    section: "6. Formación y Desarrollo",
    content: `# 🎴 Conceptos sobre Formación Empresarial`,
    flashcards: [
      { id: "fc11", front: "¿Qué es el Plan de Formación?", back: "Documento que recoge las acciones formativas previstas para un periodo, con objetivos, contenidos, participantes, calendario y presupuesto." },
      { id: "fc12", front: "¿Qué es FUNDAE?", back: "Fundación Estatal para la Formación en el Empleo. Gestiona las bonificaciones para formación de trabajadores en activo." },
      { id: "fc13", front: "¿Qué es el crédito de formación?", back: "Cantidad que las empresas pueden dedicar a formación bonificada según su plantilla y cotizaciones del año anterior." },
      { id: "fc14", front: "¿Qué es la formación e-learning?", back: "Modalidad de formación online, a través de plataformas digitales, que permite flexibilidad de horario y lugar." },
      { id: "fc15", front: "¿Qué es el plan de carrera?", back: "Itinerario de desarrollo profesional que establece los pasos y requisitos para la promoción dentro de la organización." }
    ],
    keyTerms: ["Plan de Formación", "FUNDAE", "E-learning"]
  },
  {
    id: "uf0517-ud2-030",
    type: "content",
    title: "6.3 Evaluación del Desempeño",
    section: "6. Formación y Desarrollo",
    content: `# 📊 Evaluación del Desempeño

La **evaluación del desempeño** es el proceso sistemático de valoración del rendimiento de los empleados.

## 🔄 Ciclo de Evaluación

\`\`\`
        ┌─────────────────┐
        │  DEFINIR        │
        │  OBJETIVOS      │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  SEGUIMIENTO    │
        │  CONTINUO       │◄────┐
        └────────┬────────┘     │
                 │              │
                 ▼              │
        ┌─────────────────┐     │
        │  EVALUACIÓN     │     │
        │  FORMAL         │     │
        └────────┬────────┘     │
                 │              │
                 ▼              │
        ┌─────────────────┐     │
        │  FEEDBACK Y     │─────┘
        │  PLAN DE MEJORA │
        └─────────────────┘
\`\`\`

## 📋 Métodos de Evaluación

| Método | Descripción |
|--------|-------------|
| **Escalas gráficas** | Puntuar factores del 1 al 5 |
| **MBO (por objetivos)** | Evaluar logro de metas cuantificables |
| **360 grados** | Feedback de jefes, compañeros y subordinados |
| **Incidentes críticos** | Registrar comportamientos destacados |
| **Assessment** | Simulaciones y pruebas |

> **💡 Una buena evaluación es objetiva, regular y orientada al desarrollo.**`,
    keyTerms: ["Evaluación desempeño", "Feedback", "Objetivos"]
  },
  {
    id: "uf0517-ud2-031",
    type: "quiz",
    title: "📝 Test: Formación",
    section: "6. Formación y Desarrollo",
    content: "Evalúa tus conocimientos sobre formación en la empresa.",
    quiz: {
      id: "quiz-ud2-006",
      question: "¿Qué organismo gestiona las bonificaciones para formación de trabajadores en activo en España?",
      options: [
        { id: "a", text: "SEPE", isCorrect: false },
        { id: "b", text: "FUNDAE", isCorrect: true },
        { id: "c", text: "Seguridad Social", isCorrect: false },
        { id: "d", text: "Ministerio de Educación", isCorrect: false }
      ],
      explanation: "FUNDAE (Fundación Estatal para la Formación en el Empleo) gestiona las bonificaciones de formación para empresas. El SEPE gestiona las políticas de empleo y prestaciones.",
      hint: "Busca el organismo específico de formación para el empleo."
    },
    keyTerms: ["FUNDAE", "Bonificaciones"]
  },

  // ==================== SECCIÓN 7: PREVENCIÓN DE RIESGOS ====================
  {
    id: "uf0517-ud2-032",
    type: "content",
    title: "7.1 Prevención de Riesgos Laborales",
    section: "7. Prevención de Riesgos",
    content: `# ⚠️ La Prevención de Riesgos Laborales (PRL)

La **PRL** es el conjunto de actividades destinadas a proteger la seguridad y salud de los trabajadores.

## ⚖️ Marco Legal

> **Ley 31/1995, de Prevención de Riesgos Laborales**

## 📋 Obligaciones del Empresario

| Obligación | Descripción |
|------------|-------------|
| **Evaluación de riesgos** | Identificar y valorar peligros |
| **Plan de prevención** | Integrar la PRL en la gestión |
| **Información** | Comunicar riesgos a trabajadores |
| **Formación** | Capacitar en seguridad |
| **Vigilancia salud** | Reconocimientos médicos |
| **Medidas de emergencia** | Planes de evacuación, primeros auxilios |
| **Equipos de protección** | Proporcionar EPIs adecuados |

## 👷 Derechos del Trabajador

- ✅ Formación en prevención
- ✅ Información sobre riesgos
- ✅ Paralizar actividad ante riesgo grave e inminente
- ✅ Vigilancia de su salud
- ✅ Participar en las decisiones de seguridad

> **📌 La prevención no es un coste, es una inversión que evita accidentes y sanciones.**`,
    keyTerms: ["PRL", "Riesgos laborales", "Seguridad"]
  },
  {
    id: "uf0517-ud2-033",
    type: "checklist",
    title: "7.2 Checklist de Seguridad Básica",
    section: "7. Prevención de Riesgos",
    content: `# ✅ Comprobaciones de Seguridad en la Oficina`,
    checklistItems: [
      { id: "prl1", text: "ERGONOMÍA: Silla regulable, pantalla a altura de ojos, teclado a altura codos", checked: false },
      { id: "prl2", text: "ILUMINACIÓN: Luz suficiente sin reflejos en pantalla", checked: false },
      { id: "prl3", text: "CABLES: Recogidos y no en zonas de paso", checked: false },
      { id: "prl4", text: "SALIDAS: Conocer rutas de evacuación y punto de encuentro", checked: false },
      { id: "prl5", text: "EXTINTORES: Localizados y con revisión vigente", checked: false },
      { id: "prl6", text: "BOTIQUÍN: Disponible y con contenido básico", checked: false },
      { id: "prl7", text: "SEÑALIZACIÓN: Visible y comprensible", checked: false },
      { id: "prl8", text: "FORMACIÓN: He recibido formación en PRL", checked: false }
    ],
    keyTerms: ["Seguridad oficina", "Ergonomía", "Evacuación"]
  },
  {
    id: "uf0517-ud2-034",
    type: "quiz",
    title: "📝 Test: Prevención",
    section: "7. Prevención de Riesgos",
    content: "Comprueba tus conocimientos sobre prevención de riesgos.",
    quiz: {
      id: "quiz-ud2-007",
      question: "¿Qué significa EPI en el contexto de prevención de riesgos laborales?",
      options: [
        { id: "a", text: "Equipo de Producción Industrial", isCorrect: false },
        { id: "b", text: "Equipo de Protección Individual", isCorrect: true },
        { id: "c", text: "Evaluación de Peligros e Incidentes", isCorrect: false },
        { id: "d", text: "Estándar de Prevención Interna", isCorrect: false }
      ],
      explanation: "EPI significa EQUIPO DE PROTECCIÓN INDIVIDUAL: guantes, casco, gafas, mascarilla, etc. Son la última barrera de protección cuando no se pueden eliminar los riesgos de otra forma.",
      hint: "Piensa en los objetos que lleva un trabajador para protegerse."
    },
    keyTerms: ["EPI", "Equipo protección"]
  },

  // ==================== SECCIÓN 8: RELACIONES LABORALES ====================
  {
    id: "uf0517-ud2-035",
    type: "content",
    title: "8.1 Relaciones Laborales",
    section: "8. Relaciones Laborales",
    content: `# 🤝 Las Relaciones Laborales

Las **relaciones laborales** son el conjunto de interacciones entre empresas, trabajadores y sus representantes.

## 👥 Actores de las Relaciones Laborales

\`\`\`
        ┌─────────────────────────────────┐
        │       ADMINISTRACIÓN            │
        │   (Inspección, SEPE, Juzgados)  │
        └────────────┬────────────────────┘
                     │
                     │  Marco regulador
                     ▼
    ┌────────────────────────────────────────┐
    │                                        │
    │   EMPRESAS  ◄─────────►  TRABAJADORES  │
    │   Patronales              Sindicatos   │
    │                                        │
    └────────────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────┐
        │     CONVENIO COLECTIVO          │
        │   Condiciones pactadas          │
        └─────────────────────────────────┘
\`\`\`

## 📋 Derechos Colectivos

- 🗣️ Libertad sindical
- 📢 Huelga
- 🤝 Negociación colectiva
- 👥 Reunión y participación

> **⚖️ El Estatuto de los Trabajadores regula estos derechos.**`,
    keyTerms: ["Relaciones laborales", "Sindicatos", "Convenio"]
  },
  {
    id: "uf0517-ud2-036",
    type: "table",
    title: "8.2 Representación de los Trabajadores",
    section: "8. Relaciones Laborales",
    content: `# 👥 Órganos de Representación de los Trabajadores`,
    tableData: {
      headers: ["Órgano", "Plantilla", "Funciones"],
      rows: [
        ["👤 Delegado de personal", "6-49 trabajadores", "Representación unitaria básica"],
        ["👥 Comité de empresa", "50+ trabajadores", "Negociación, información, consulta"],
        ["🏥 Delegado de prevención", "Según plantilla", "Seguridad y salud laboral"],
        ["🏛️ Sección sindical", "Cualquier plantilla", "Representación del sindicato"],
        ["🗣️ Delegado sindical", "250+ con implantación", "Representación sindical específica"]
      ]
    },
    keyTerms: ["Delegado de personal", "Comité de empresa", "Representación"]
  },
  {
    id: "uf0517-ud2-037",
    type: "flashcards",
    title: "8.3 Tarjetas: Conflictos Laborales",
    section: "8. Relaciones Laborales",
    content: `# 🎴 Conceptos sobre Conflictos Laborales`,
    flashcards: [
      { id: "fc16", front: "¿Qué es la huelga?", back: "Derecho constitucional de los trabajadores a cesar la actividad laboral para reivindicar mejoras. Durante la huelga no se cobra salario." },
      { id: "fc17", front: "¿Qué es el cierre patronal?", back: "Medida empresarial de cierre del centro de trabajo ante situaciones de huelga abusiva o peligro para personas o bienes." },
      { id: "fc18", front: "¿Qué es la mediación laboral?", back: "Procedimiento donde un tercero neutral ayuda a las partes a alcanzar un acuerdo en un conflicto laboral." },
      { id: "fc19", front: "¿Qué es el arbitraje?", back: "Procedimiento donde un árbitro dicta una resolución (laudo) que es vinculante para las partes en conflicto." },
      { id: "fc20", front: "¿Qué es un ERE?", back: "Expediente de Regulación de Empleo: procedimiento para despidos colectivos, suspensiones de contrato o reducciones de jornada." }
    ],
    keyTerms: ["Huelga", "Mediación", "ERE"]
  },
  {
    id: "uf0517-ud2-038",
    type: "quiz",
    title: "📝 Test: Relaciones Laborales",
    section: "8. Relaciones Laborales",
    content: "Evalúa tus conocimientos sobre relaciones laborales.",
    quiz: {
      id: "quiz-ud2-008",
      question: "¿A partir de qué número de trabajadores es obligatorio constituir un Comité de Empresa?",
      options: [
        { id: "a", text: "6 trabajadores", isCorrect: false },
        { id: "b", text: "25 trabajadores", isCorrect: false },
        { id: "c", text: "50 trabajadores", isCorrect: true },
        { id: "d", text: "100 trabajadores", isCorrect: false }
      ],
      explanation: "El COMITÉ DE EMPRESA se constituye a partir de 50 TRABAJADORES. Entre 6 y 49 trabajadores, la representación se realiza mediante delegados de personal.",
      hint: "El comité de empresa es para plantillas más grandes."
    },
    keyTerms: ["Comité de empresa"]
  },

  // ==================== SECCIÓN 9: EXTINCIÓN DEL CONTRATO ====================
  {
    id: "uf0517-ud2-039",
    type: "content",
    title: "9.1 Extinción del Contrato de Trabajo",
    section: "9. Extinción del Contrato",
    content: `# 🔚 Extinción del Contrato de Trabajo

La **extinción** es la finalización de la relación laboral. Puede producirse por diferentes causas.

## 📋 Causas de Extinción

### 🤝 Por Mutuo Acuerdo
- Acuerdo entre empresario y trabajador

### 👤 Por Voluntad del Trabajador
- Dimisión (preaviso según convenio)
- Abandono
- Resolución por incumplimiento empresarial

### 🏢 Por Voluntad del Empresario
- Despido disciplinario
- Despido objetivo
- Despido colectivo (ERE)

### 📋 Otras Causas
- Fin del contrato temporal
- Jubilación
- Fallecimiento
- Incapacidad permanente
- Fuerza mayor

> **⚠️ La forma de extinción determina el derecho a indemnización y desempleo.**`,
    keyTerms: ["Extinción", "Despido", "Dimisión"]
  },
  {
    id: "uf0517-ud2-040",
    type: "table",
    title: "9.2 Tipos de Despido",
    section: "9. Extinción del Contrato",
    content: `# ⚖️ Tipos de Despido y sus Consecuencias`,
    tableData: {
      headers: ["Tipo", "Causa", "Indemnización"],
      rows: [
        ["🔴 Disciplinario procedente", "Incumplimiento grave del trabajador", "Sin indemnización"],
        ["🟠 Disciplinario improcedente", "Despido injustificado", "33 días/año (máx. 24 meses)"],
        ["🟡 Objetivo procedente", "Causas económicas, técnicas, organizativas", "20 días/año (máx. 12 meses)"],
        ["🟠 Objetivo improcedente", "No demostradas las causas", "33 días/año (máx. 24 meses)"],
        ["⚫ Nulo", "Vulneración derechos fundamentales", "Readmisión obligatoria + salarios"]
      ]
    },
    keyTerms: ["Despido disciplinario", "Despido objetivo", "Indemnización"]
  },
  {
    id: "uf0517-ud2-041",
    type: "content",
    title: "9.3 El Finiquito",
    section: "9. Extinción del Contrato",
    content: `# 📄 El Finiquito

El **finiquito** es el documento que liquida las cantidades pendientes al finalizar la relación laboral.

## 📋 Contenido del Finiquito

\`\`\`
┌─────────────────────────────────────────────────┐
│                  FINIQUITO                      │
├─────────────────────────────────────────────────┤
│ CONCEPTOS A PERCIBIR:                           │
│                                                 │
│ • Salario días trabajados del mes              │
│ • Parte proporcional pagas extras               │
│ • Vacaciones no disfrutadas                     │
│ • Indemnización (según tipo extinción)          │
│ • Otros conceptos pendientes                    │
│                                                 │
│ DEDUCCIONES:                                    │
│ • IRPF                                          │
│ • Anticipos no devueltos                        │
│                                                 │
│ TOTAL A PERCIBIR: __________                    │
├─────────────────────────────────────────────────┤
│ El trabajador declara haber recibido           │
│ las cantidades arriba indicadas y nada         │
│ más tiene que reclamar por ningún concepto.    │
│                                                 │
│ Firma empresa:       Firma trabajador:          │
└─────────────────────────────────────────────────┘
\`\`\`

> **⚠️ IMPORTANTE: El trabajador puede firmar "No conforme" o pedir tiempo para revisar el finiquito.**`,
    keyTerms: ["Finiquito", "Liquidación", "Vacaciones"]
  },
  {
    id: "uf0517-ud2-042",
    type: "quiz",
    title: "📝 Test: Extinción",
    section: "9. Extinción del Contrato",
    content: "Comprueba tus conocimientos sobre extinción del contrato.",
    quiz: {
      id: "quiz-ud2-009",
      question: "¿Cuál es la indemnización por despido IMPROCEDENTE según la legislación actual?",
      options: [
        { id: "a", text: "12 días de salario por año trabajado", isCorrect: false },
        { id: "b", text: "20 días de salario por año trabajado", isCorrect: false },
        { id: "c", text: "33 días de salario por año trabajado", isCorrect: true },
        { id: "d", text: "45 días de salario por año trabajado", isCorrect: false }
      ],
      explanation: "La indemnización por despido IMPROCEDENTE es de 33 días de salario por año trabajado, con un máximo de 24 mensualidades. Los 45 días eran anteriores a la reforma de 2012.",
      hint: "La reforma de 2012 redujo la indemnización de 45 a 33 días."
    },
    keyTerms: ["Indemnización despido"]
  },

  // ==================== SECCIÓN 10: GESTIÓN DIGITAL DE RR.HH. ====================
  {
    id: "uf0517-ud2-043",
    type: "content",
    title: "10.1 Digitalización de RR.HH.",
    section: "10. Gestión Digital",
    content: `# 💻 La Digitalización de los Recursos Humanos

La tecnología ha transformado la gestión de personas en las organizaciones.

## 🔧 Herramientas Digitales de RR.HH.

| Herramienta | Función |
|-------------|---------|
| **SIRH/HRIS** | Sistema integral de gestión de RRHH |
| **ATS** | Sistema de seguimiento de candidatos |
| **LMS** | Plataforma de formación online |
| **Portal del empleado** | Autoservicio (nóminas, vacaciones) |
| **Control de presencia** | Registro digital de jornada |
| **Evaluación online** | Gestión del desempeño |

## 📋 Ventajas de la Digitalización

- ⚡ Mayor eficiencia en procesos
- 📊 Mejor acceso a datos e informes
- 🌍 Gestión remota de equipos
- 📈 Análisis predictivo (People Analytics)
- 🔒 Mayor seguridad de la información
- ♻️ Reducción del papel

> **💡 El departamento de RR.HH. evoluciona hacia la gestión basada en datos.**`,
    keyTerms: ["HRIS", "Digitalización", "People Analytics"]
  },
  {
    id: "uf0517-ud2-044",
    type: "content",
    title: "10.2 El Registro de Jornada",
    section: "10. Gestión Digital",
    content: `# ⏱️ El Registro Obligatorio de Jornada

Desde 2019, es **obligatorio** el registro diario de la jornada de todos los trabajadores.

## ⚖️ Marco Legal

> **Real Decreto-ley 8/2019** de medidas urgentes de protección social y de lucha contra la precariedad laboral.

## 📋 Requisitos del Registro

| Aspecto | Requisito |
|---------|-----------|
| **Obligatoriedad** | Todos los trabajadores, sin excepciones |
| **Contenido mínimo** | Hora inicio y fin de cada jornada |
| **Conservación** | 4 años desde la fecha |
| **Acceso** | Trabajador, representantes, Inspección |
| **Sistema** | Libre elección (papel o digital) |

## 💻 Sistemas de Fichaje

- 📱 App móvil con geolocalización
- 💳 Tarjeta de proximidad
- 👆 Huella dactilar o biométrico
- 💻 Fichaje en ordenador
- 📝 Registro manual

> **⚠️ Las sanciones por incumplimiento pueden llegar a 225.018 € en casos muy graves.**`,
    keyTerms: ["Registro jornada", "Fichaje", "Control horario"]
  },
  {
    id: "uf0517-ud2-045",
    type: "quiz",
    title: "📝 Test: Gestión Digital",
    section: "10. Gestión Digital",
    content: "Evalúa tus conocimientos sobre gestión digital de RR.HH.",
    quiz: {
      id: "quiz-ud2-010",
      question: "¿Durante cuánto tiempo debe conservarse el registro de jornada de los trabajadores?",
      options: [
        { id: "a", text: "1 año", isCorrect: false },
        { id: "b", text: "2 años", isCorrect: false },
        { id: "c", text: "4 años", isCorrect: true },
        { id: "d", text: "6 años", isCorrect: false }
      ],
      explanation: "El registro de jornada debe conservarse durante 4 AÑOS desde la fecha en que se produjo. Durante ese tiempo puede ser requerido por la Inspección de Trabajo.",
      hint: "Es el mismo plazo de prescripción de las infracciones laborales graves."
    },
    keyTerms: ["Conservación registro"]
  },

  // ==================== RESUMEN Y EVALUACIÓN FINAL ====================
  {
    id: "uf0517-ud2-046",
    type: "summary",
    title: "📚 Resumen de la Unidad",
    section: "Resumen Final",
    content: `# 📖 Resumen: La Organización de los Recursos Humanos

## 🎯 Conceptos Clave Aprendidos

### 1️⃣ Departamento de RR.HH.
- Funciones: planificación, selección, formación, evaluación
- Documentos: contratos, nóminas, partes SS

### 2️⃣ Selección de Personal
- Reclutamiento interno y externo
- Técnicas: entrevistas, tests, assessment

### 3️⃣ El Contrato de Trabajo
- Tipos: indefinido, temporal, formativo
- Elementos esenciales y contenido obligatorio

### 4️⃣ La Nómina
- Devengos (lo que ganas) vs Deducciones (lo que quitan)
- Líquido = Devengos - Deducciones

### 5️⃣ Seguridad Social
- Afiliación, alta y baja
- Prestaciones: IT, desempleo, jubilación

### 6️⃣ Formación y Desarrollo
- Plan de formación, FUNDAE
- Evaluación del desempeño

### 7️⃣ Prevención de Riesgos
- Obligaciones empresario y derechos trabajador
- EPIs y medidas de seguridad

### 8️⃣ Relaciones Laborales
- Representación: delegados, comité
- Conflictos y negociación

### 9️⃣ Extinción del Contrato
- Tipos de despido e indemnizaciones
- El finiquito

### 🔟 Gestión Digital
- HRIS, registro de jornada
- People Analytics

> **🎓 ¡Enhorabuena! Has completado la UD2.**`,
    keyTerms: ["Resumen", "Conceptos clave"]
  },
  {
    id: "uf0517-ud2-047",
    type: "quiz",
    title: "📝 Evaluación Final - Pregunta 1",
    section: "Evaluación Final",
    content: "Primera pregunta de la evaluación final.",
    quiz: {
      id: "quiz-ud2-final-1",
      question: "Un trabajador con contrato indefinido lleva 3 años en la empresa y es despedido de forma improcedente. ¿Cuántos días de indemnización le corresponden por año trabajado?",
      options: [
        { id: "a", text: "12 días", isCorrect: false },
        { id: "b", text: "20 días", isCorrect: false },
        { id: "c", text: "33 días", isCorrect: true },
        { id: "d", text: "45 días", isCorrect: false }
      ],
      explanation: "Por despido IMPROCEDENTE corresponden 33 días de salario por año trabajado. En este caso: 3 años x 33 días = 99 días de salario de indemnización.",
      hint: "Improcedente significa que el despido no está justificado."
    },
    keyTerms: ["Despido improcedente", "Indemnización"]
  },
  {
    id: "uf0517-ud2-048",
    type: "quiz",
    title: "📝 Evaluación Final - Pregunta 2",
    section: "Evaluación Final",
    content: "Segunda pregunta de la evaluación final.",
    quiz: {
      id: "quiz-ud2-final-2",
      question: "¿Cuál de los siguientes conceptos de la nómina NO cotiza a la Seguridad Social (hasta ciertos límites)?",
      options: [
        { id: "a", text: "Salario base", isCorrect: false },
        { id: "b", text: "Complemento de antigüedad", isCorrect: false },
        { id: "c", text: "Plus de transporte", isCorrect: true },
        { id: "d", text: "Pagas extraordinarias", isCorrect: false }
      ],
      explanation: "El PLUS DE TRANSPORTE está exento de cotización hasta ciertos límites, ya que se considera una compensación por gastos y no un salario. El salario base, antigüedad y pagas extras sí cotizan.",
      hint: "Algunos conceptos compensan gastos del trabajador, no son realmente salario."
    },
    keyTerms: ["Cotización", "Plus transporte"]
  },
  {
    id: "uf0517-ud2-049",
    type: "quiz",
    title: "📝 Evaluación Final - Pregunta 3",
    section: "Evaluación Final",
    content: "Tercera pregunta de la evaluación final.",
    quiz: {
      id: "quiz-ud2-final-3",
      question: "Un nuevo empleado comienza a trabajar el lunes. ¿Cuándo debe estar dado de alta en la Seguridad Social?",
      options: [
        { id: "a", text: "Dentro de los 3 días siguientes al inicio", isCorrect: false },
        { id: "b", text: "Antes de comenzar a trabajar", isCorrect: true },
        { id: "c", text: "Dentro de la primera semana", isCorrect: false },
        { id: "d", text: "Antes de que termine el mes", isCorrect: false }
      ],
      explanation: "El ALTA en la Seguridad Social debe realizarse ANTES de que el trabajador comience a prestar sus servicios. Es un requisito previo al inicio de la relación laboral.",
      hint: "El alta es antes de empezar, la baja es después de terminar."
    },
    keyTerms: ["Alta Seguridad Social"]
  },
  {
    id: "uf0517-ud2-050",
    type: "quiz",
    title: "📝 Evaluación Final - Pregunta 4",
    section: "Evaluación Final",
    content: "Cuarta pregunta de la evaluación final.",
    quiz: {
      id: "quiz-ud2-final-4",
      question: "¿Cuál es el capital social mínimo para constituir una Sociedad Limitada (S.L.)?",
      options: [
        { id: "a", text: "1 €", isCorrect: false },
        { id: "b", text: "3.000 €", isCorrect: true },
        { id: "c", text: "30.000 €", isCorrect: false },
        { id: "d", text: "60.000 €", isCorrect: false }
      ],
      explanation: "El capital mínimo de una S.L. es de 3.000 €. Los 60.000 € corresponden a la Sociedad Anónima (S.A.). Esta pregunta conecta con la UD1 sobre formas jurídicas.",
      hint: "La S.L. es la forma más común para pequeñas empresas por tener requisitos más accesibles."
    },
    keyTerms: ["S.L.", "Capital social"]
  }
];
