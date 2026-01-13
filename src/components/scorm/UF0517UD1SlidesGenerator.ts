// UF0517 - UD1: LA ORGANIZACIÓN DE ENTIDADES PÚBLICAS Y PRIVADAS
// 60+ Comprehensive Interactive Slides with visual design elements

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

export const generateUF0517UD1Slides = (): ExtendedContentSlide[] => [
  // ==================== INTRODUCCIÓN ====================
  {
    id: "uf0517-ud1-001",
    type: "intro",
    title: "UD1 - La Organización de Entidades Públicas y Privadas",
    section: "Introducción",
    content: `# 🏛️ La Organización de Entidades Públicas y Privadas

Bienvenido a esta **Unidad Didáctica** fundamental para comprender cómo funcionan las organizaciones.

## 🎯 ¿Qué aprenderás?

Conocerás las estructuras organizativas, los tipos de entidades y cómo se gestionan tanto en el sector público como privado.

> **Objetivo General:** Capacitar al alumno para identificar y comprender las diferentes formas de organización empresarial y administrativa.`,
    keyTerms: ["Organización", "Entidades públicas", "Entidades privadas"]
  },
  {
    id: "uf0517-ud1-002",
    type: "content",
    title: "Objetivos de la Unidad",
    section: "Introducción",
    content: `# 📋 Objetivos de Aprendizaje

## 🎯 Al finalizar esta unidad serás capaz de:

1. **Identificar** los diferentes tipos de entidades públicas y privadas
2. **Comprender** las estructuras organizativas empresariales
3. **Distinguir** las funciones de los distintos departamentos
4. **Analizar** los organigramas y su utilidad
5. **Aplicar** criterios de organización empresarial
6. **Conocer** la normativa básica de funcionamiento

> **⏱️ Duración estimada:** 30 horas de formación teórico-práctica`,
    keyTerms: ["Objetivos", "Competencias", "Aprendizaje"]
  },

  // ==================== SECCIÓN 1: CONCEPTO DE ORGANIZACIÓN ====================
  {
    id: "uf0517-ud1-003",
    type: "content",
    title: "1.1 ¿Qué es una Organización?",
    section: "1. Concepto de Organización",
    content: `# 🏢 Concepto de Organización

Una **organización** es un conjunto de personas que trabajan de forma coordinada para alcanzar objetivos comunes, utilizando recursos de manera eficiente.

## 🔑 Elementos Clave

| Elemento | Descripción |
|----------|-------------|
| **Personas** | Capital humano que realiza las actividades |
| **Objetivos** | Metas que se pretenden conseguir |
| **Recursos** | Medios materiales, financieros y tecnológicos |
| **Estructura** | Forma de ordenar y distribuir el trabajo |
| **Procesos** | Procedimientos para realizar las tareas |

> **💡 Recuerda:** Sin organización, los esfuerzos individuales no se transforman en resultados colectivos.`,
    keyTerms: ["Organización", "Estructura", "Objetivos"]
  },
  {
    id: "uf0517-ud1-004",
    type: "content",
    title: "1.2 Mapa Mental: Tipos de Organizaciones",
    section: "1. Concepto de Organización",
    content: `# 🗺️ Mapa Conceptual de las Organizaciones

## Clasificación General

\`\`\`
                    ┌─────────────────────┐
                    │   ORGANIZACIONES    │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │   PÚBLICAS   │   │   PRIVADAS   │   │   MIXTAS     │
    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
           │                  │                   │
    ┌──────┴──────┐    ┌─────┴─────┐      ┌─────┴─────┐
    │ • Estado    │    │ • S.A.    │      │ • Socieda-│
    │ • CC.AA.    │    │ • S.L.    │      │   des de  │
    │ • Ayunta-   │    │ • Coops.  │      │   Economía│
    │   mientos   │    │ • Autón.  │      │   Mixta   │
    └─────────────┘    └───────────┘      └───────────┘
\`\`\`

> **📌 Importante:** La naturaleza de la organización determina su marco legal y forma de gestión.`,
    keyTerms: ["Públicas", "Privadas", "Mixtas"],
    mindMapData: {
      center: "ORGANIZACIONES",
      branches: [
        { label: "Públicas", children: ["Estado", "CC.AA.", "Ayuntamientos"] },
        { label: "Privadas", children: ["S.A.", "S.L.", "Cooperativas"] },
        { label: "Mixtas", children: ["Economía Mixta", "Concesiones"] }
      ]
    }
  },
  {
    id: "uf0517-ud1-005",
    type: "table",
    title: "1.3 Comparativa: Públicas vs Privadas",
    section: "1. Concepto de Organización",
    content: `# ⚖️ Diferencias entre Entidades Públicas y Privadas`,
    tableData: {
      headers: ["Aspecto", "Entidades Públicas", "Entidades Privadas"],
      rows: [
        ["🎯 Finalidad", "Servicio a la ciudadanía", "Obtención de beneficios"],
        ["💰 Financiación", "Impuestos y tasas", "Capital propio y préstamos"],
        ["📋 Normativa", "Derecho Administrativo", "Derecho Mercantil"],
        ["👥 Control", "Ciudadanos y organismos", "Socios y propietarios"],
        ["📊 Gestión", "Burocrática, procedimientos", "Más flexible y ágil"],
        ["🔍 Transparencia", "Obligatoria por ley", "Según estatutos"]
      ]
    },
    keyTerms: ["Entidad pública", "Entidad privada", "Diferencias"]
  },
  {
    id: "uf0517-ud1-006",
    type: "quiz",
    title: "📝 Test: Concepto de Organización",
    section: "1. Concepto de Organización",
    content: "Evalúa tu comprensión sobre el concepto de organización.",
    quiz: {
      id: "quiz-ud1-001",
      question: "¿Cuál es el elemento que ordena y distribuye el trabajo dentro de una organización?",
      options: [
        { id: "a", text: "Los objetivos", isCorrect: false },
        { id: "b", text: "La estructura", isCorrect: true },
        { id: "c", text: "Los recursos", isCorrect: false },
        { id: "d", text: "Las personas", isCorrect: false }
      ],
      explanation: "La ESTRUCTURA es el elemento que ordena y distribuye el trabajo, estableciendo las relaciones jerárquicas y funcionales entre las diferentes partes de la organización.",
      hint: "Piensa en qué elemento define cómo se reparten las tareas y las responsabilidades."
    },
    keyTerms: ["Estructura organizativa"]
  },

  // ==================== SECCIÓN 2: ENTIDADES PÚBLICAS ====================
  {
    id: "uf0517-ud1-007",
    type: "content",
    title: "2.1 Las Administraciones Públicas",
    section: "2. Entidades Públicas",
    content: `# 🏛️ Las Administraciones Públicas en España

Las **Administraciones Públicas** son el conjunto de órganos y entidades que ejercen funciones públicas y prestan servicios a los ciudadanos.

## 📊 Niveles Territoriales

### 🇪🇸 Administración General del Estado
- Gobierno y Ministerios
- Delegaciones del Gobierno
- Organismos Autónomos

### 🏴 Administraciones Autonómicas
- Gobiernos Autonómicos
- Consejerías
- Organismos autonómicos

### 🏘️ Administración Local
- Diputaciones Provinciales
- Ayuntamientos
- Mancomunidades

> **⚖️ Base Legal:** Constitución Española de 1978 y Ley 40/2015 de Régimen Jurídico del Sector Público.`,
    keyTerms: ["Administración Pública", "Estado", "Autonomías", "Local"]
  },
  {
    id: "uf0517-ud1-008",
    type: "content",
    title: "2.2 Esquema: Estructura del Estado",
    section: "2. Entidades Públicas",
    content: `# 🏗️ Estructura del Estado Español

## Organigrama del Poder Ejecutivo

\`\`\`
                ┌─────────────────────────┐
                │     JEFE DEL ESTADO     │
                │        (El Rey)         │
                └───────────┬─────────────┘
                            │
                ┌───────────▼─────────────┐
                │       GOBIERNO          │
                │  Presidente + Ministros │
                └───────────┬─────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
    ▼                       ▼                       ▼
┌──────────┐         ┌──────────┐           ┌──────────┐
│MINISTERIO│         │MINISTERIO│           │MINISTERIO│
│  Hacienda│         │  Trabajo │           │ Educación│
└────┬─────┘         └────┬─────┘           └────┬─────┘
     │                    │                      │
     ▼                    ▼                      ▼
┌──────────┐         ┌──────────┐           ┌──────────┐
│Secretarías│        │Secretarías│          │Secretarías│
│ Generales │        │ Generales │          │ Generales │
└───────────┘        └───────────┘          └───────────┘
\`\`\`

> **📌 Nota:** Cada Ministerio tiene una estructura jerárquica interna compleja.`,
    keyTerms: ["Gobierno", "Ministerios", "Secretarías"]
  },
  {
    id: "uf0517-ud1-009",
    type: "content",
    title: "2.3 Tarjetas: Órganos del Estado",
    section: "2. Entidades Públicas",
    content: `# 🎴 Tarjetas de Estudio: Órganos Constitucionales

Estudia estos conceptos importantes sobre los órganos del Estado español.`,
    flashcards: [
      { id: "fc1", front: "¿Qué es el Congreso de los Diputados?", back: "Cámara baja de las Cortes Generales con 350 diputados que representan al pueblo español. Aprueba leyes y controla al Gobierno." },
      { id: "fc2", front: "¿Qué es el Senado?", back: "Cámara alta de las Cortes Generales. Cámara de representación territorial con senadores elegidos y designados." },
      { id: "fc3", front: "¿Qué es el Tribunal Constitucional?", back: "Órgano supremo de interpretación de la Constitución. Resuelve recursos de inconstitucionalidad y amparo." },
      { id: "fc4", front: "¿Qué es el Defensor del Pueblo?", back: "Alto comisionado de las Cortes para la defensa de los derechos fundamentales de los ciudadanos." },
      { id: "fc5", front: "¿Qué es el Tribunal de Cuentas?", back: "Órgano fiscalizador de las cuentas del Estado y del sector público. Depende de las Cortes Generales." }
    ],
    keyTerms: ["Congreso", "Senado", "Tribunal Constitucional"]
  },
  {
    id: "uf0517-ud1-010",
    type: "table",
    title: "2.4 Ministerios y sus Funciones",
    section: "2. Entidades Públicas",
    content: `# 🏢 Principales Ministerios del Gobierno de España`,
    tableData: {
      headers: ["Ministerio", "Funciones Principales", "Ámbito"],
      rows: [
        ["💰 Hacienda", "Gestión tributaria, presupuestos, contabilidad pública", "Económico"],
        ["👷 Trabajo", "Empleo, Seguridad Social, relaciones laborales", "Social"],
        ["📚 Educación", "Sistema educativo, universidades, formación", "Educativo"],
        ["🏥 Sanidad", "Sistema sanitario, salud pública, medicamentos", "Sanitario"],
        ["⚖️ Justicia", "Administración de justicia, registros, notariado", "Jurídico"],
        ["🚗 Transportes", "Infraestructuras, carreteras, ferrocarriles", "Infraestructuras"],
        ["🌍 Exteriores", "Política exterior, cooperación, consulados", "Internacional"]
      ]
    },
    keyTerms: ["Ministerios", "Gobierno", "Funciones"]
  },
  {
    id: "uf0517-ud1-011",
    type: "content",
    title: "2.5 La Administración Autonómica",
    section: "2. Entidades Públicas",
    content: `# 🏴 Las Comunidades Autónomas

España se organiza territorialmente en **17 Comunidades Autónomas** y 2 Ciudades Autónomas (Ceuta y Melilla).

## 📋 Órganos de las CC.AA.

| Órgano | Función | Equivalente Estatal |
|--------|---------|---------------------|
| **Parlamento Autonómico** | Legislativo | Cortes Generales |
| **Gobierno Autonómico** | Ejecutivo | Consejo de Ministros |
| **Presidente** | Dirige el Gobierno | Presidente del Gobierno |
| **Consejerías** | Gestión por áreas | Ministerios |

## 🔑 Competencias Autonómicas

- ✅ Educación (gestión)
- ✅ Sanidad (gestión)
- ✅ Urbanismo y vivienda
- ✅ Agricultura y pesca
- ✅ Cultura y patrimonio
- ✅ Servicios sociales

> **📌 Ejemplo:** Castilla-La Mancha tiene su Gobierno con sede en Toledo, compuesto por el Presidente y las distintas Consejerías.`,
    keyTerms: ["Comunidades Autónomas", "Competencias", "Consejerías"]
  },
  {
    id: "uf0517-ud1-012",
    type: "checklist",
    title: "2.6 Checklist: Entidades Locales",
    section: "2. Entidades Públicas",
    content: `# ✅ Entidades que forman la Administración Local

Marca las entidades que conoces de tu entorno local:`,
    checklistItems: [
      { id: "cl1", text: "AYUNTAMIENTO: Órgano de gobierno del municipio (Alcalde + Concejales)", checked: false },
      { id: "cl2", text: "DIPUTACIÓN PROVINCIAL: Coordina servicios municipales y asiste a municipios pequeños", checked: false },
      { id: "cl3", text: "MANCOMUNIDAD: Agrupación de municipios para gestionar servicios comunes", checked: false },
      { id: "cl4", text: "COMARCA: Entidad supramunicipal en algunas CC.AA.", checked: false },
      { id: "cl5", text: "CABILDO/CONSEJO INSULAR: Gobierno de las islas en Canarias y Baleares", checked: false },
      { id: "cl6", text: "ENTIDAD LOCAL MENOR: Pedanías, parroquias rurales, etc.", checked: false }
    ],
    keyTerms: ["Ayuntamiento", "Diputación", "Mancomunidad"]
  },
  {
    id: "uf0517-ud1-013",
    type: "content",
    title: "2.7 El Ayuntamiento",
    section: "2. Entidades Públicas",
    content: `# 🏘️ El Ayuntamiento: Órgano de Gobierno Municipal

El **Ayuntamiento** es la entidad más cercana al ciudadano. Gestiona los servicios básicos del municipio.

## 🏗️ Estructura del Ayuntamiento

\`\`\`
                ┌─────────────────────┐
                │       PLENO         │
                │  (Todos los concejales)
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │       ALCALDE       │
                └──────────┬──────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │Junta de │       │Tenientes│       │Concejales│
    │Gobierno │       │de Alcalde│      │Delegados │
    └─────────┘       └─────────┘       └──────────┘
\`\`\`

## 📋 Servicios Municipales Obligatorios

- 🚰 Abastecimiento de agua potable
- 🗑️ Recogida de residuos
- 🛣️ Mantenimiento de vías públicas
- 💡 Alumbrado público
- 🏛️ Cementerio municipal

> **⚠️ Los servicios obligatorios varían según la población del municipio.**`,
    keyTerms: ["Alcalde", "Pleno", "Servicios municipales"]
  },
  {
    id: "uf0517-ud1-014",
    type: "quiz",
    title: "📝 Test: Administraciones Públicas",
    section: "2. Entidades Públicas",
    content: "Comprueba tus conocimientos sobre las Administraciones Públicas.",
    quiz: {
      id: "quiz-ud1-002",
      question: "¿Qué órgano es obligatorio en municipios con más de 5.000 habitantes?",
      options: [
        { id: "a", text: "Defensor del Vecino", isCorrect: false },
        { id: "b", text: "Junta de Gobierno Local", isCorrect: true },
        { id: "c", text: "Consejo de Administración", isCorrect: false },
        { id: "d", text: "Tribunal Municipal", isCorrect: false }
      ],
      explanation: "La Junta de Gobierno Local es un órgano obligatorio en municipios con más de 5.000 habitantes. Está formada por el Alcalde y un número de concejales no superior al tercio del total.",
      hint: "Piensa en el órgano ejecutivo que asiste al Alcalde en sus funciones."
    },
    keyTerms: ["Junta de Gobierno Local"]
  },

  // ==================== SECCIÓN 3: ENTIDADES PRIVADAS ====================
  {
    id: "uf0517-ud1-015",
    type: "content",
    title: "3.1 Las Empresas Privadas",
    section: "3. Entidades Privadas",
    content: `# 🏭 Las Entidades Privadas

Las **entidades privadas** son organizaciones cuya titularidad corresponde a personas físicas o jurídicas particulares.

## 🎯 Características Principales

- **Propiedad privada** del capital
- **Ánimo de lucro** (generalmente)
- **Libertad de gestión** empresarial
- Reguladas por el **Derecho Mercantil**
- **Responsabilidad** de los propietarios

## 📊 Clasificación por Tamaño

| Tipo | Empleados | Facturación |
|------|-----------|-------------|
| 🏠 Microempresa | < 10 | < 2 millones € |
| 🏢 Pequeña | 10-49 | < 10 millones € |
| 🏗️ Mediana | 50-249 | < 50 millones € |
| 🏛️ Grande | ≥ 250 | ≥ 50 millones € |

> **💡 En España, más del 99% de las empresas son PYMES (Pequeñas y Medianas Empresas).**`,
    keyTerms: ["Empresa privada", "PYME", "Clasificación empresarial"]
  },
  {
    id: "uf0517-ud1-016",
    type: "table",
    title: "3.2 Formas Jurídicas Empresariales",
    section: "3. Entidades Privadas",
    content: `# ⚖️ Principales Formas Jurídicas de Empresas`,
    tableData: {
      headers: ["Forma Jurídica", "Capital Mínimo", "Responsabilidad", "Socios"],
      rows: [
        ["👤 Empresario Individual", "Sin mínimo", "Ilimitada (patrimonio personal)", "1"],
        ["👥 Comunidad de Bienes", "Sin mínimo", "Ilimitada", "Mínimo 2"],
        ["🏢 Sociedad Limitada (S.L.)", "3.000 €", "Limitada al capital", "1 o más"],
        ["🏛️ Sociedad Anónima (S.A.)", "60.000 €", "Limitada al capital", "1 o más"],
        ["🤝 Cooperativa", "Variable", "Limitada al capital", "Mínimo 3"],
        ["👔 Sociedad Laboral", "S.L.: 3.000€ / S.A.: 60.000€", "Limitada", "Mínimo 2 (51% trabajadores)"]
      ]
    },
    keyTerms: ["S.L.", "S.A.", "Cooperativa", "Formas jurídicas"]
  },
  {
    id: "uf0517-ud1-017",
    type: "content",
    title: "3.3 La Sociedad Limitada (S.L.)",
    section: "3. Entidades Privadas",
    content: `# 🏢 Sociedad de Responsabilidad Limitada (S.L.)

La **S.L.** es la forma jurídica más utilizada en España por su flexibilidad y protección patrimonial.

## ✅ Características Principales

| Aspecto | Detalle |
|---------|---------|
| **Capital mínimo** | 3.000 € (totalmente desembolsado) |
| **División capital** | Participaciones sociales |
| **Socios** | 1 o más (S.L.U. si es unipersonal) |
| **Responsabilidad** | Limitada al capital aportado |
| **Transmisión** | Restringida (derecho de adquisición preferente) |
| **Órganos** | Junta General + Administrador/es |

## 📋 Pasos para Constituir una S.L.

1. 📝 Solicitar certificación negativa de denominación
2. 💰 Depositar capital en cuenta bancaria
3. 📄 Redactar estatutos sociales
4. ✍️ Otorgar escritura pública ante notario
5. 🏛️ Inscribir en el Registro Mercantil
6. 📊 Obtener NIF y alta en Hacienda

> **💡 Tip:** La S.L. exprés permite constituir la sociedad en 24-48 horas con estatutos tipo.`,
    keyTerms: ["S.L.", "Participaciones", "Responsabilidad limitada"]
  },
  {
    id: "uf0517-ud1-018",
    type: "content",
    title: "3.4 Tarjetas: Órganos Societarios",
    section: "3. Entidades Privadas",
    content: `# 🎴 Órganos de Gobierno de las Sociedades

Estudia los principales órganos de las sociedades mercantiles.`,
    flashcards: [
      { id: "fc6", front: "¿Qué es la Junta General?", back: "Órgano soberano de la sociedad donde se reúnen todos los socios. Aprueba cuentas, nombra administradores y toma decisiones importantes." },
      { id: "fc7", front: "¿Qué es el Administrador Único?", back: "Persona física o jurídica que gestiona y representa a la sociedad. Tiene poder de decisión ejecutivo." },
      { id: "fc8", front: "¿Qué es el Consejo de Administración?", back: "Órgano colegiado formado por varios consejeros que administran la sociedad. Mínimo 3 miembros." },
      { id: "fc9", front: "¿Qué diferencia hay entre Administrador Solidario y Mancomunado?", back: "Solidario: cada uno puede actuar por sí solo. Mancomunado: necesitan actuar conjuntamente (mínimo 2)." },
      { id: "fc10", front: "¿Qué es el Presidente del Consejo?", back: "Consejero que preside las reuniones del Consejo de Administración. Puede tener voto de calidad en caso de empate." }
    ],
    keyTerms: ["Junta General", "Administrador", "Consejo"]
  },
  {
    id: "uf0517-ud1-019",
    type: "content",
    title: "3.5 La Sociedad Anónima (S.A.)",
    section: "3. Entidades Privadas",
    content: `# 🏛️ Sociedad Anónima (S.A.)

La **S.A.** es la forma jurídica utilizada por grandes empresas. Permite captar capital de múltiples inversores.

## 📊 Características Distintivas

\`\`\`
    ┌─────────────────────────────────────────┐
    │          SOCIEDAD ANÓNIMA               │
    ├─────────────────────────────────────────┤
    │  💰 Capital: Mínimo 60.000 €            │
    │  📈 División: ACCIONES                  │
    │  🔄 Transmisión: LIBRE                  │
    │  📋 Cotización: Puede cotizar en Bolsa  │
    │  👥 Socios: Accionistas                 │
    └─────────────────────────────────────────┘
\`\`\`

## 🔑 Diferencias clave S.L. vs S.A.

| Aspecto | S.L. | S.A. |
|---------|------|------|
| Capital mínimo | 3.000 € | 60.000 € |
| Partes sociales | Participaciones | Acciones |
| Transmisión | Restringida | Libre |
| Cotización | No puede | Puede en Bolsa |
| Desembolso inicial | 100% | Mínimo 25% |

> **📌 Las grandes empresas cotizadas (Inditex, Telefónica, Santander) son S.A.**`,
    keyTerms: ["S.A.", "Acciones", "Cotización"]
  },
  {
    id: "uf0517-ud1-020",
    type: "content",
    title: "3.6 Las Cooperativas",
    section: "3. Entidades Privadas",
    content: `# 🤝 Las Sociedades Cooperativas

Las **cooperativas** son sociedades basadas en la ayuda mutua entre sus socios, con gestión democrática.

## 🌟 Principios Cooperativos

1. **Adhesión voluntaria** y abierta
2. **Gestión democrática** (un socio, un voto)
3. **Participación económica** de los socios
4. **Autonomía e independencia**
5. **Educación y formación** continua
6. **Cooperación** entre cooperativas
7. **Interés por la comunidad**

## 📋 Tipos de Cooperativas

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| 🏭 De trabajo asociado | Los socios son los trabajadores | Talleres, fábricas |
| 🛒 De consumidores | Compran productos para socios | Supermercados |
| 🌾 Agrarias | Agricultores y ganaderos | Almazaras, bodegas |
| 🏠 De viviendas | Construyen viviendas para socios | Promociones inmobiliarias |
| 🎓 De enseñanza | Centros educativos | Colegios cooperativos |

> **💡 Ejemplo famoso:** Corporación Mondragón, el mayor grupo cooperativo del mundo.`,
    keyTerms: ["Cooperativa", "Principios cooperativos", "Gestión democrática"]
  },
  {
    id: "uf0517-ud1-021",
    type: "quiz",
    title: "📝 Test: Formas Jurídicas",
    section: "3. Entidades Privadas",
    content: "Evalúa tus conocimientos sobre las formas jurídicas empresariales.",
    quiz: {
      id: "quiz-ud1-003",
      question: "¿Cuál es el capital mínimo para constituir una Sociedad Limitada (S.L.)?",
      options: [
        { id: "a", text: "1.000 €", isCorrect: false },
        { id: "b", text: "3.000 €", isCorrect: true },
        { id: "c", text: "10.000 €", isCorrect: false },
        { id: "d", text: "60.000 €", isCorrect: false }
      ],
      explanation: "El capital mínimo para una S.L. es de 3.000 €, que debe estar totalmente desembolsado en el momento de la constitución. Los 60.000 € corresponden a la S.A.",
      hint: "Piensa en la forma jurídica más común para pequeños negocios."
    },
    keyTerms: ["Capital social", "S.L."]
  },

  // ==================== SECCIÓN 4: LA ESTRUCTURA ORGANIZATIVA ====================
  {
    id: "uf0517-ud1-022",
    type: "content",
    title: "4.1 ¿Qué es la Estructura Organizativa?",
    section: "4. Estructura Organizativa",
    content: `# 🏗️ La Estructura Organizativa

La **estructura organizativa** es la forma en que se ordenan y distribuyen las funciones, responsabilidades y relaciones dentro de una organización.

## 🎯 Elementos de la Estructura

| Elemento | Descripción |
|----------|-------------|
| **Especialización** | División del trabajo por funciones |
| **Departamentalización** | Agrupación de tareas similares |
| **Cadena de mando** | Línea de autoridad jerárquica |
| **Amplitud de control** | Número de subordinados por jefe |
| **Centralización** | Concentración de decisiones |
| **Formalización** | Grado de normas y procedimientos |

## 🔑 Importancia de la Estructura

- ✅ Define responsabilidades claras
- ✅ Facilita la comunicación
- ✅ Evita duplicidades
- ✅ Permite la coordinación
- ✅ Mejora la eficiencia

> **💡 Una buena estructura es la columna vertebral de cualquier organización exitosa.**`,
    keyTerms: ["Estructura organizativa", "Departamentalización", "Jerarquía"]
  },
  {
    id: "uf0517-ud1-023",
    type: "content",
    title: "4.2 Mapa: Tipos de Estructuras",
    section: "4. Estructura Organizativa",
    content: `# 🗺️ Tipos de Estructuras Organizativas

## Clasificación Principal

\`\`\`
    ┌──────────────────────────────────────────────────────┐
    │              ESTRUCTURAS ORGANIZATIVAS               │
    └───────────────────────┬──────────────────────────────┘
                            │
    ┌───────────────┬───────┴───────┬───────────────┐
    │               │               │               │
    ▼               ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  LINEAL │   │FUNCIONAL│   │DIVISIONAL│  │ MATRICIAL│
│         │   │         │   │         │   │         │
│  Mando  │   │ Especia-│   │ Unidades│   │ Doble   │
│  único  │   │ lización│   │ autónomas│  │ mando   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │
     ▼             ▼             ▼             ▼
  Pequeñas     Medianas     Grandes     Proyectos
  empresas     empresas     empresas    complejos
\`\`\`

> **📌 Cada estructura tiene ventajas e inconvenientes según el tipo y tamaño de organización.**`,
    keyTerms: ["Estructura lineal", "Estructura funcional", "Estructura matricial"]
  },
  {
    id: "uf0517-ud1-024",
    type: "table",
    title: "4.3 Comparativa de Estructuras",
    section: "4. Estructura Organizativa",
    content: `# ⚖️ Ventajas e Inconvenientes de cada Estructura`,
    tableData: {
      headers: ["Estructura", "Ventajas", "Inconvenientes"],
      rows: [
        ["📊 Lineal", "Simple, autoridad clara, decisiones rápidas", "Rigidez, sobrecarga de jefes, falta especialización"],
        ["🔧 Funcional", "Especialización, eficiencia técnica", "Conflictos entre áreas, lentitud decisiones"],
        ["🏭 Divisional", "Autonomía, adaptación al mercado", "Duplicidad de funciones, costes elevados"],
        ["📐 Matricial", "Flexibilidad, optimiza recursos", "Doble autoridad, conflictos de poder"],
        ["🌐 En red", "Agilidad, costes reducidos", "Dependencia externa, pérdida de control"]
      ]
    },
    keyTerms: ["Ventajas", "Inconvenientes", "Estructuras"]
  },
  {
    id: "uf0517-ud1-025",
    type: "content",
    title: "4.4 Estructura Lineal o Jerárquica",
    section: "4. Estructura Organizativa",
    content: `# 📊 Estructura Lineal o Jerárquica

Es la estructura más antigua y simple. La autoridad fluye de arriba hacia abajo.

## 🏗️ Organigrama Tipo

\`\`\`
                    ┌──────────────┐
                    │   DIRECTOR   │
                    │   GENERAL    │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐
    │ Director   │  │ Director   │  │ Director   │
    │ Comercial  │  │ Producción │  │ Admón.     │
    └──────┬─────┘  └──────┬─────┘  └──────┬─────┘
           │               │               │
      ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
      │ Ventas  │     │ Fábrica │     │Contabil.│
      └─────────┘     └─────────┘     └─────────┘
\`\`\`

## ✅ Ideal para:
- Pequeñas y medianas empresas
- Organizaciones con procesos sencillos
- Empresas familiares

> **⚠️ Limitación:** Puede generar sobrecarga en los mandos intermedios.`,
    keyTerms: ["Estructura lineal", "Jerarquía", "Mando único"]
  },
  {
    id: "uf0517-ud1-026",
    type: "content",
    title: "4.5 Estructura Funcional",
    section: "4. Estructura Organizativa",
    content: `# 🔧 Estructura Funcional

Los trabajadores dependen de varios jefes especializados en diferentes funciones.

## 🏗️ Organigrama Tipo

\`\`\`
                    ┌──────────────┐
                    │   GERENCIA   │
                    └──────┬───────┘
                           │
    ┌──────────┬───────────┼───────────┬──────────┐
    │          │           │           │          │
    ▼          ▼           ▼           ▼          ▼
┌───────┐ ┌───────┐ ┌───────────┐ ┌───────┐ ┌───────┐
│COMPRAS│ │VENTAS │ │PRODUCCIÓN │ │RR.HH. │ │FINANZAS│
└───┬───┘ └───┬───┘ └─────┬─────┘ └───┬───┘ └───┬───┘
    │         │           │           │         │
    └─────────┴───────────┴───────────┴─────────┘
                          │
                   ┌──────▼──────┐
                   │ TRABAJADORES │
                   │(reportan a   │
                   │varios jefes) │
                   └─────────────┘
\`\`\`

## ✅ Ventajas:
- Mayor especialización técnica
- Mejor aprovechamiento de expertos

## ❌ Inconvenientes:
- Confusión en la autoridad
- Posibles órdenes contradictorias`,
    keyTerms: ["Estructura funcional", "Especialización", "Múltiples jefes"]
  },
  {
    id: "uf0517-ud1-027",
    type: "content",
    title: "4.6 Tarjetas: Conceptos de Organización",
    section: "4. Estructura Organizativa",
    content: `# 🎴 Conceptos Clave de Organización

Estudia estos términos fundamentales sobre estructuras organizativas.`,
    flashcards: [
      { id: "fc11", front: "¿Qué es la departamentalización?", back: "Es la agrupación de actividades similares en unidades organizativas (departamentos) para facilitar su gestión y coordinación." },
      { id: "fc12", front: "¿Qué es la cadena de mando?", back: "Es la línea de autoridad que conecta los niveles superiores con los inferiores, indicando quién reporta a quién." },
      { id: "fc13", front: "¿Qué es la amplitud de control?", back: "Es el número de subordinados que un jefe puede supervisar eficazmente. Depende de la complejidad del trabajo." },
      { id: "fc14", front: "¿Qué diferencia hay entre centralización y descentralización?", back: "Centralización: las decisiones se toman en la cúpula. Descentralización: se delegan a niveles inferiores." },
      { id: "fc15", front: "¿Qué es el staff?", back: "Son unidades de apoyo que asesoran pero no tienen autoridad directa sobre otras áreas (ej: asesoría jurídica)." }
    ],
    keyTerms: ["Departamentalización", "Cadena de mando", "Staff"]
  },
  {
    id: "uf0517-ud1-028",
    type: "quiz",
    title: "📝 Test: Estructuras Organizativas",
    section: "4. Estructura Organizativa",
    content: "Comprueba tus conocimientos sobre las estructuras organizativas.",
    quiz: {
      id: "quiz-ud1-004",
      question: "¿En qué tipo de estructura un empleado puede tener dos jefes (funcional y de proyecto)?",
      options: [
        { id: "a", text: "Estructura lineal", isCorrect: false },
        { id: "b", text: "Estructura funcional", isCorrect: false },
        { id: "c", text: "Estructura matricial", isCorrect: true },
        { id: "d", text: "Estructura divisional", isCorrect: false }
      ],
      explanation: "La estructura MATRICIAL combina la departamentalización funcional con la organización por proyectos, haciendo que los empleados reporten a dos jefes: el funcional (de su especialidad) y el de proyecto.",
      hint: "Piensa en qué estructura se utiliza habitualmente en consultoras y empresas tecnológicas."
    },
    keyTerms: ["Estructura matricial", "Doble mando"]
  },

  // ==================== SECCIÓN 5: EL ORGANIGRAMA ====================
  {
    id: "uf0517-ud1-029",
    type: "content",
    title: "5.1 ¿Qué es un Organigrama?",
    section: "5. El Organigrama",
    content: `# 📊 El Organigrama Empresarial

Un **organigrama** es la representación gráfica de la estructura de una organización, mostrando las relaciones jerárquicas y funcionales entre sus elementos.

## 🎯 Utilidades del Organigrama

| Utilidad | Descripción |
|----------|-------------|
| **Visualización** | Muestra la estructura de un vistazo |
| **Comunicación** | Facilita entender la organización |
| **Análisis** | Permite detectar problemas estructurales |
| **Planificación** | Ayuda a diseñar cambios organizativos |
| **Orientación** | Informa a nuevos empleados |

## 📋 Elementos del Organigrama

- **Rectángulos/cuadros**: Representan cargos o departamentos
- **Líneas continuas**: Relación de autoridad directa
- **Líneas discontinuas**: Relación de coordinación o staff
- **Niveles horizontales**: Jerarquía (mismo nivel = misma importancia)

> **💡 Un organigrama actualizado es una herramienta esencial de gestión.**`,
    keyTerms: ["Organigrama", "Representación gráfica", "Estructura"]
  },
  {
    id: "uf0517-ud1-030",
    type: "table",
    title: "5.2 Tipos de Organigramas",
    section: "5. El Organigrama",
    content: `# 📈 Clasificación de los Organigramas`,
    tableData: {
      headers: ["Criterio", "Tipos", "Descripción"],
      rows: [
        ["📐 Por su forma", "Vertical, Horizontal, Circular, Mixto", "Dirección en que se representa la jerarquía"],
        ["📋 Por su contenido", "Estructural, Funcional, De personal", "Qué información muestra (cargos, funciones, personas)"],
        ["🎯 Por su ámbito", "General, Parcial", "Si muestra toda la organización o solo una parte"],
        ["✏️ Por su presentación", "Analítico, Sintético", "Nivel de detalle de la información"],
        ["📱 Por su formato", "Tradicional, Digital, Interactivo", "Soporte y medio de visualización"]
      ]
    },
    keyTerms: ["Tipos de organigramas", "Vertical", "Horizontal"]
  },
  {
    id: "uf0517-ud1-031",
    type: "content",
    title: "5.3 Organigrama Vertical",
    section: "5. El Organigrama",
    content: `# 📊 Organigrama Vertical

Es el tipo más común. La jerarquía se representa de arriba hacia abajo.

## 🏗️ Ejemplo de Organigrama Vertical

\`\`\`
                         ┌─────────────────┐
                         │    DIRECCIÓN    │
                         │    GENERAL      │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
       ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
       │  DIRECCIÓN  │     │  DIRECCIÓN  │     │  DIRECCIÓN  │
       │  COMERCIAL  │     │  OPERACIONES│     │  FINANCIERA │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
       ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐
       │             │     │             │     │             │
   ┌───▼───┐   ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
   │Ventas │   │Market.│ │Producc│ │Calidad│ │Contab.│ │Tesorer│
   └───────┘   └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
\`\`\`

## ✅ Ventajas:
- Fácil de entender
- Refleja claramente la jerarquía
- Formato tradicional reconocible

> **📌 Es el formato más utilizado en documentos oficiales y presentaciones.**`,
    keyTerms: ["Organigrama vertical", "Jerarquía", "Piramidal"]
  },
  {
    id: "uf0517-ud1-032",
    type: "content",
    title: "5.4 Organigrama Horizontal",
    section: "5. El Organigrama",
    content: `# 📊 Organigrama Horizontal

La jerarquía se representa de izquierda a derecha.

## 🏗️ Ejemplo de Organigrama Horizontal

\`\`\`
┌────────────┐   ┌────────────┐   ┌────────────┐
│            │───│  Ventas    │───│ Vendedor 1 │
│            │   │            │   │ Vendedor 2 │
│            │   └────────────┘   └────────────┘
│ DIRECCIÓN  │
│ GENERAL    │   ┌────────────┐   ┌────────────┐
│            │───│ Producción │───│ Operario 1 │
│            │   │            │   │ Operario 2 │
│            │   └────────────┘   └────────────┘
│            │
│            │   ┌────────────┐   ┌────────────┐
│            │───│ Finanzas   │───│ Contable   │
└────────────┘   │            │   │ Tesorero   │
                 └────────────┘   └────────────┘
\`\`\`

## ✅ Ventajas:
- Ocupa menos espacio vertical
- Ideal para organizaciones con muchos niveles
- Facilita comparar unidades del mismo nivel

> **📌 Se utiliza en organizaciones muy descentralizadas o con estructuras muy amplias.**`,
    keyTerms: ["Organigrama horizontal", "De izquierda a derecha"]
  },
  {
    id: "uf0517-ud1-033",
    type: "checklist",
    title: "5.5 Elementos para Crear un Organigrama",
    section: "5. El Organigrama",
    content: `# ✅ Checklist para Elaborar un Organigrama

Verifica que incluyes todos los elementos necesarios:`,
    checklistItems: [
      { id: "ch1", text: "TÍTULO: Nombre de la organización y fecha de vigencia", checked: false },
      { id: "ch2", text: "LEYENDA: Explicación de símbolos y líneas utilizados", checked: false },
      { id: "ch3", text: "CARGOS: Todos los puestos con su denominación correcta", checked: false },
      { id: "ch4", text: "JERARQUÍA: Niveles claramente diferenciados", checked: false },
      { id: "ch5", text: "LÍNEAS DE AUTORIDAD: Conexiones entre cargos", checked: false },
      { id: "ch6", text: "STAFF: Unidades de apoyo claramente identificadas", checked: false },
      { id: "ch7", text: "FORMATO: Diseño claro, legible y profesional", checked: false },
      { id: "ch8", text: "ACTUALIZACIÓN: Fecha de última revisión", checked: false }
    ],
    keyTerms: ["Elementos organigrama", "Diseño", "Formato"]
  },
  {
    id: "uf0517-ud1-034",
    type: "quiz",
    title: "📝 Test: Organigramas",
    section: "5. El Organigrama",
    content: "Evalúa tus conocimientos sobre los organigramas.",
    quiz: {
      id: "quiz-ud1-005",
      question: "¿Qué tipo de línea se utiliza para representar una relación de asesoramiento (staff) en un organigrama?",
      options: [
        { id: "a", text: "Línea continua gruesa", isCorrect: false },
        { id: "b", text: "Línea discontinua o de puntos", isCorrect: true },
        { id: "c", text: "Línea doble", isCorrect: false },
        { id: "d", text: "No se representa", isCorrect: false }
      ],
      explanation: "Las relaciones de STAFF o asesoramiento se representan con líneas discontinuas o de puntos, para distinguirlas de las líneas de mando directo (continuas).",
      hint: "Piensa en cómo diferenciar visualmente la autoridad directa del asesoramiento."
    },
    keyTerms: ["Staff", "Líneas de autoridad"]
  },

  // ==================== SECCIÓN 6: DEPARTAMENTOS EMPRESARIALES ====================
  {
    id: "uf0517-ud1-035",
    type: "content",
    title: "6.1 Los Departamentos de la Empresa",
    section: "6. Departamentos Empresariales",
    content: `# 🏢 Los Departamentos o Áreas Funcionales

La empresa se divide en **departamentos** o áreas funcionales según las actividades que realizan.

## 🗺️ Mapa de Departamentos

\`\`\`
    ┌─────────────────────────────────────────────────┐
    │              LA EMPRESA                          │
    ├─────────────────────────────────────────────────┤
    │                                                  │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
    │  │COMERCIAL│  │PRODUCCIÓN│  │FINANZAS│         │
    │  │ Ventas  │  │ Fábrica  │  │Contabil.│         │
    │  │Marketing│  │ Calidad  │  │Tesorería│         │
    │  └─────────┘  └─────────┘  └─────────┘         │
    │                                                  │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
    │  │RR.HH.   │  │COMPRAS  │  │I+D      │         │
    │  │Personal │  │Proveedor│  │Innovac. │         │
    │  │Nóminas  │  │Almacén  │  │Desarrollo│        │
    │  └─────────┘  └─────────┘  └─────────┘         │
    │                                                  │
    └─────────────────────────────────────────────────┘
\`\`\`

> **📌 No todas las empresas tienen todos los departamentos. Depende del tamaño y actividad.**`,
    keyTerms: ["Departamentos", "Áreas funcionales", "Organización"]
  },
  {
    id: "uf0517-ud1-036",
    type: "table",
    title: "6.2 Funciones de cada Departamento",
    section: "6. Departamentos Empresariales",
    content: `# 📋 Principales Funciones por Departamento`,
    tableData: {
      headers: ["Departamento", "Funciones Principales", "Documentos Típicos"],
      rows: [
        ["🛒 Comercial", "Ventas, marketing, atención al cliente", "Pedidos, presupuestos, facturas"],
        ["🏭 Producción", "Fabricación, control calidad, mantenimiento", "Órdenes de trabajo, partes"],
        ["💰 Finanzas", "Contabilidad, tesorería, cobros/pagos", "Facturas, asientos, balances"],
        ["👥 RR.HH.", "Selección, contratación, nóminas", "Contratos, nóminas, partes"],
        ["📦 Compras", "Aprovisionamiento, almacén, logística", "Pedidos, albaranes, inventarios"],
        ["💻 Informática", "Sistemas, mantenimiento, soporte", "Incidencias, manuales, proyectos"]
      ]
    },
    keyTerms: ["Funciones departamentales", "Documentos", "Gestión"]
  },
  {
    id: "uf0517-ud1-037",
    type: "content",
    title: "6.3 El Departamento Comercial",
    section: "6. Departamentos Empresariales",
    content: `# 🛒 Departamento Comercial

Es el responsable de la **venta de productos y servicios** y de la relación con los clientes.

## 📋 Áreas del Departamento Comercial

### 📈 Ventas
- Gestión de clientes
- Negociación y cierre de ventas
- Seguimiento de pedidos
- Servicio postventa

### 📢 Marketing
- Investigación de mercados
- Publicidad y promoción
- Desarrollo de productos
- Comunicación corporativa

### 🤝 Atención al Cliente
- Resolución de incidencias
- Información y asesoramiento
- Gestión de reclamaciones
- Fidelización

> **💡 El departamento comercial es el "motor de ingresos" de la empresa.**`,
    keyTerms: ["Departamento comercial", "Ventas", "Marketing"]
  },
  {
    id: "uf0517-ud1-038",
    type: "content",
    title: "6.4 El Departamento de Administración",
    section: "6. Departamentos Empresariales",
    content: `# 📋 Departamento de Administración y Finanzas

Gestiona los recursos económicos y documentales de la empresa.

## 🏗️ Estructura Típica

\`\`\`
           ┌─────────────────────────┐
           │    DIRECTOR FINANCIERO  │
           │      o ADMINISTRACIÓN   │
           └────────────┬────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼───┐          ┌────▼────┐         ┌────▼────┐
│CONTABI│          │TESORERÍA│         │ ADMÓN.  │
│ LIDAD │          │         │         │ GENERAL │
└───┬───┘          └────┬────┘         └────┬────┘
    │                   │                   │
    ▼                   ▼                   ▼
• Facturación      • Cobros            • Archivo
• Asientos         • Pagos             • Correspondencia  
• Impuestos        • Bancos            • Secretaría
• Cuentas          • Caja              • Recepción
\`\`\`

## 📄 Documentos que Gestiona

- Facturas emitidas y recibidas
- Asientos contables
- Extractos bancarios
- Declaraciones fiscales
- Correspondencia oficial`,
    keyTerms: ["Administración", "Contabilidad", "Tesorería"]
  },
  {
    id: "uf0517-ud1-039",
    type: "content",
    title: "6.5 Tarjetas: Departamentos",
    section: "6. Departamentos Empresariales",
    content: `# 🎴 Conceptos de los Departamentos Empresariales`,
    flashcards: [
      { id: "fc16", front: "¿Qué departamento se encarga de las nóminas?", back: "El departamento de Recursos Humanos (RR.HH.) o Personal es responsable de la elaboración y gestión de las nóminas de los empleados." },
      { id: "fc17", front: "¿Qué es el departamento de I+D?", back: "Investigación y Desarrollo. Se encarga de la innovación, desarrollo de nuevos productos, mejora de procesos y tecnología." },
      { id: "fc18", front: "¿Qué diferencia hay entre compras y aprovisionamiento?", back: "Compras: negociar y adquirir productos. Aprovisionamiento: gestión integral incluyendo planificación, almacén y logística." },
      { id: "fc19", front: "¿Qué es el control de gestión?", back: "Área que analiza la información económica para la toma de decisiones: presupuestos, desviaciones, rentabilidad, KPIs." },
      { id: "fc20", front: "¿Qué hace el departamento jurídico?", back: "Asesora legalmente a la empresa: contratos, normativa, litigios, propiedad intelectual, cumplimiento normativo." }
    ],
    keyTerms: ["RR.HH.", "I+D", "Control de gestión"]
  },
  {
    id: "uf0517-ud1-040",
    type: "quiz",
    title: "📝 Test: Departamentos",
    section: "6. Departamentos Empresariales",
    content: "Comprueba tus conocimientos sobre los departamentos empresariales.",
    quiz: {
      id: "quiz-ud1-006",
      question: "¿Qué departamento es responsable del control de inventarios y gestión de almacén?",
      options: [
        { id: "a", text: "Departamento Comercial", isCorrect: false },
        { id: "b", text: "Departamento de Compras/Logística", isCorrect: true },
        { id: "c", text: "Departamento Financiero", isCorrect: false },
        { id: "d", text: "Departamento de Producción", isCorrect: false }
      ],
      explanation: "El departamento de Compras o Logística (a veces llamado Aprovisionamiento) es el responsable de gestionar las existencias, el almacén y los inventarios.",
      hint: "Piensa en qué departamento se ocupa de las materias primas y productos almacenados."
    },
    keyTerms: ["Compras", "Logística", "Inventarios"]
  },

  // ==================== SECCIÓN 7: LA COMUNICACIÓN ORGANIZACIONAL ====================
  {
    id: "uf0517-ud1-041",
    type: "content",
    title: "7.1 La Comunicación en la Empresa",
    section: "7. Comunicación Organizacional",
    content: `# 💬 La Comunicación Empresarial

La **comunicación** es el proceso de transmisión de información entre los miembros de la organización.

## 🎯 Importancia de la Comunicación

| Beneficio | Descripción |
|-----------|-------------|
| **Coordinación** | Sincroniza las actividades de la empresa |
| **Motivación** | Mantiene informado al personal |
| **Decisiones** | Proporciona datos para decidir |
| **Clima laboral** | Mejora las relaciones internas |
| **Imagen** | Proyecta la identidad corporativa |

## 🔄 Elementos del Proceso Comunicativo

\`\`\`
   EMISOR → MENSAJE → CANAL → RECEPTOR
      ↑                         │
      └───────FEEDBACK←─────────┘
\`\`\`

> **💡 Una buena comunicación reduce errores y mejora la eficiencia.**`,
    keyTerms: ["Comunicación", "Emisor", "Receptor", "Feedback"]
  },
  {
    id: "uf0517-ud1-042",
    type: "table",
    title: "7.2 Tipos de Comunicación",
    section: "7. Comunicación Organizacional",
    content: `# 📊 Clasificación de la Comunicación Empresarial`,
    tableData: {
      headers: ["Criterio", "Tipos", "Ejemplos"],
      rows: [
        ["📍 Dirección", "Descendente, Ascendente, Horizontal", "Órdenes, sugerencias, coordinación"],
        ["📋 Formalidad", "Formal, Informal", "Circulares vs rumores"],
        ["👥 Participantes", "Interna, Externa", "Empleados vs clientes"],
        ["🗣️ Forma", "Oral, Escrita, No verbal", "Reuniones, emails, gestos"],
        ["📱 Canal", "Presencial, Telefónica, Digital", "Cara a cara, llamadas, chat"]
      ]
    },
    keyTerms: ["Comunicación formal", "Comunicación informal", "Canales"]
  },
  {
    id: "uf0517-ud1-043",
    type: "content",
    title: "7.3 Mapa: Flujos de Comunicación",
    section: "7. Comunicación Organizacional",
    content: `# 🗺️ Flujos de Comunicación en la Organización

\`\`\`
                    ┌─────────────────┐
                    │   DIRECCIÓN     │
                    └────────┬────────┘
                             │
              ┌──────────────│──────────────┐
              │              │              │
              │   DESCENDENTE│   ASCENDENTE │
              │      ↓       │      ↑       │
              │              │              │
        ┌─────▼─────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │ MANDOS    │←──HORIZONTAL──→│ MANDOS    │
        │ INTERMEDIOS│              │ INTERMEDIOS│
        └─────┬─────┘               └─────┬─────┘
              │                           │
              │      ↓         ↑          │
              │                           │
        ┌─────▼─────────────────────────▼─────┐
        │           EMPLEADOS/OPERARIOS       │
        └─────────────────────────────────────┘
\`\`\`

## 📋 Tipos de Flujos:

- **⬇️ Descendente:** De superiores a subordinados (instrucciones, políticas)
- **⬆️ Ascendente:** De subordinados a superiores (informes, sugerencias)
- **↔️ Horizontal:** Entre personas del mismo nivel (coordinación)
- **↗️ Diagonal:** Entre diferentes niveles y áreas (proyectos)`,
    keyTerms: ["Comunicación descendente", "Comunicación ascendente", "Horizontal"]
  },
  {
    id: "uf0517-ud1-044",
    type: "table",
    title: "7.4 Canales y Herramientas",
    section: "7. Comunicación Organizacional",
    content: `# 📱 Canales y Herramientas de Comunicación`,
    tableData: {
      headers: ["Canal", "Ventajas", "Uso Recomendado"],
      rows: [
        ["✉️ Correo electrónico", "Registro escrito, asíncrono", "Comunicaciones formales, documentación"],
        ["📞 Teléfono", "Inmediato, interactivo", "Urgencias, aclaraciones rápidas"],
        ["💬 Mensajería instantánea", "Rápido, informal", "Coordinación del día a día"],
        ["📹 Videoconferencia", "Visual, a distancia", "Reuniones remotas, formación"],
        ["🗣️ Reuniones presenciales", "Completo, relacional", "Decisiones importantes, equipo"],
        ["📋 Tablón de anuncios", "Visible, permanente", "Información general, avisos"],
        ["📰 Intranet/Portal", "Centralizado, accesible", "Documentación, noticias internas"]
      ]
    },
    keyTerms: ["Canales de comunicación", "Email", "Videoconferencia"]
  },
  {
    id: "uf0517-ud1-045",
    type: "checklist",
    title: "7.5 Buenas Prácticas de Comunicación",
    section: "7. Comunicación Organizacional",
    content: `# ✅ Checklist de Buenas Prácticas Comunicativas

Verifica que aplicas estas buenas prácticas:`,
    checklistItems: [
      { id: "bp1", text: "CLARIDAD: Mensajes concisos y fáciles de entender", checked: false },
      { id: "bp2", text: "CANAL ADECUADO: Elegir el medio apropiado según el mensaje", checked: false },
      { id: "bp3", text: "OPORTUNIDAD: Comunicar en el momento adecuado", checked: false },
      { id: "bp4", text: "BIDIRECCIONALIDAD: Fomentar el feedback y la participación", checked: false },
      { id: "bp5", text: "REGISTRO: Documentar las comunicaciones importantes", checked: false },
      { id: "bp6", text: "RESPETO: Tono profesional y cortés", checked: false },
      { id: "bp7", text: "CONFIDENCIALIDAD: Proteger la información sensible", checked: false },
      { id: "bp8", text: "COHERENCIA: Mensajes consistentes desde toda la organización", checked: false }
    ],
    keyTerms: ["Buenas prácticas", "Comunicación efectiva"]
  },
  {
    id: "uf0517-ud1-046",
    type: "quiz",
    title: "📝 Test: Comunicación",
    section: "7. Comunicación Organizacional",
    content: "Evalúa tus conocimientos sobre comunicación organizacional.",
    quiz: {
      id: "quiz-ud1-007",
      question: "Cuando un empleado presenta una sugerencia de mejora a su jefe, ¿qué tipo de comunicación está utilizando?",
      options: [
        { id: "a", text: "Comunicación descendente", isCorrect: false },
        { id: "b", text: "Comunicación ascendente", isCorrect: true },
        { id: "c", text: "Comunicación horizontal", isCorrect: false },
        { id: "d", text: "Comunicación diagonal", isCorrect: false }
      ],
      explanation: "La comunicación ASCENDENTE fluye de los niveles inferiores a los superiores. Las sugerencias, informes y quejas de empleados a jefes son ejemplos típicos.",
      hint: "Piensa en la dirección: ¿sube o baja en la jerarquía?"
    },
    keyTerms: ["Comunicación ascendente"]
  },

  // ==================== SECCIÓN 8: LA CULTURA ORGANIZACIONAL ====================
  {
    id: "uf0517-ud1-047",
    type: "content",
    title: "8.1 La Cultura Empresarial",
    section: "8. Cultura Organizacional",
    content: `# 🎭 La Cultura Organizacional

La **cultura organizacional** es el conjunto de valores, creencias, normas y costumbres que caracterizan a una organización.

## 🧩 Componentes de la Cultura

| Componente | Descripción | Ejemplos |
|------------|-------------|----------|
| **Valores** | Principios que guían la actuación | Integridad, innovación, servicio |
| **Misión** | Razón de ser de la organización | "Facilitar el acceso a la formación" |
| **Visión** | Aspiración a largo plazo | "Ser líderes en formación online" |
| **Normas** | Reglas de comportamiento | Código de conducta, dress code |
| **Símbolos** | Elementos identificativos | Logo, colores corporativos |
| **Rituales** | Prácticas habituales | Reuniones semanales, celebraciones |

> **💡 La cultura es el "ADN" de la organización. Define cómo se hacen las cosas.**`,
    keyTerms: ["Cultura organizacional", "Valores", "Misión", "Visión"]
  },
  {
    id: "uf0517-ud1-048",
    type: "content",
    title: "8.2 Misión, Visión y Valores",
    section: "8. Cultura Organizacional",
    content: `# 🎯 Los Pilares de la Identidad Corporativa

## 📋 Definiciones Clave

### 🎯 MISIÓN
> "¿Por qué existimos? ¿Qué hacemos?"

Es la declaración del propósito fundamental de la organización. Define su razón de ser en el presente.

**Ejemplo:** *"Ofrecer formación de calidad accesible para el desarrollo profesional de las personas."*

---

### 🔭 VISIÓN
> "¿Qué queremos llegar a ser?"

Es la imagen del futuro deseado. Define hacia dónde se dirige la organización.

**Ejemplo:** *"Ser la plataforma de formación online de referencia en España para 2030."*

---

### 💎 VALORES
> "¿Cómo actuamos? ¿Qué nos guía?"

Son los principios que orientan el comportamiento de la organización y sus miembros.

**Ejemplos:**
- 🤝 Compromiso con el alumno
- 💡 Innovación continua
- ⚖️ Transparencia y ética
- 🎯 Excelencia en el servicio

> **⚠️ Importante:** Misión, visión y valores deben ser coherentes y conocidos por todos.**`,
    keyTerms: ["Misión", "Visión", "Valores corporativos"]
  },
  {
    id: "uf0517-ud1-049",
    type: "content",
    title: "8.3 Tarjetas: Cultura Organizacional",
    section: "8. Cultura Organizacional",
    content: `# 🎴 Conceptos de Cultura Empresarial`,
    flashcards: [
      { id: "fc21", front: "¿Qué es la identidad corporativa?", back: "Es el conjunto de elementos visuales y conceptuales que identifican a la organización: logo, colores, tipografía, imagen de marca." },
      { id: "fc22", front: "¿Qué es el clima laboral?", back: "Es la percepción que tienen los empleados sobre el ambiente de trabajo. Incluye relaciones, condiciones y satisfacción." },
      { id: "fc23", front: "¿Qué es la Responsabilidad Social Corporativa (RSC)?", back: "Es el compromiso voluntario de la empresa con la sociedad, el medio ambiente y sus grupos de interés, más allá de las obligaciones legales." },
      { id: "fc24", front: "¿Qué son los stakeholders?", back: "Son los grupos de interés de la empresa: empleados, clientes, proveedores, accionistas, comunidad, administración pública." },
      { id: "fc25", front: "¿Qué es el código ético?", back: "Documento que recoge los principios y normas de conducta que deben seguir todos los miembros de la organización." }
    ],
    keyTerms: ["Identidad corporativa", "Clima laboral", "RSC"]
  },
  {
    id: "uf0517-ud1-050",
    type: "quiz",
    title: "📝 Test: Cultura Organizacional",
    section: "8. Cultura Organizacional",
    content: "Comprueba tus conocimientos sobre cultura organizacional.",
    quiz: {
      id: "quiz-ud1-008",
      question: "¿Cuál de los siguientes es un ejemplo de declaración de MISIÓN empresarial?",
      options: [
        { id: "a", text: "Ser el líder mundial del sector en 2030", isCorrect: false },
        { id: "b", text: "Ofrecer productos de calidad que mejoren la vida de nuestros clientes", isCorrect: true },
        { id: "c", text: "Innovación, compromiso y excelencia", isCorrect: false },
        { id: "d", text: "Aumentar las ventas un 20% anual", isCorrect: false }
      ],
      explanation: "La MISIÓN describe el propósito actual de la empresa (qué hace y para quién). 'Ofrecer productos de calidad...' es una misión. El líder en 2030 sería visión, los conceptos son valores, y el 20% es un objetivo.",
      hint: "La misión responde a: ¿Qué hacemos ahora y para quién?"
    },
    keyTerms: ["Misión empresarial"]
  },

  // ==================== SECCIÓN 9: CALIDAD Y MEJORA CONTINUA ====================
  {
    id: "uf0517-ud1-051",
    type: "content",
    title: "9.1 La Gestión de la Calidad",
    section: "9. Calidad y Mejora Continua",
    content: `# ⭐ Gestión de la Calidad en las Organizaciones

La **calidad** es el grado en que un producto o servicio satisface las necesidades del cliente.

## 📊 Evolución del Concepto de Calidad

| Etapa | Enfoque | Características |
|-------|---------|-----------------|
| **Control de calidad** | Producto final | Inspección, detección de defectos |
| **Aseguramiento** | Proceso | Prevención, procedimientos documentados |
| **Gestión total (TQM)** | Organización | Mejora continua, participación de todos |
| **Excelencia** | Stakeholders | Resultados en todos los grupos de interés |

## 🎯 Principios de la Gestión de Calidad

1. **Enfoque al cliente**
2. **Liderazgo comprometido**
3. **Participación del personal**
4. **Enfoque basado en procesos**
5. **Mejora continua**
6. **Toma de decisiones basada en evidencias**
7. **Gestión de las relaciones**

> **📌 La calidad no es un departamento, es responsabilidad de todos.**`,
    keyTerms: ["Calidad", "TQM", "Mejora continua"]
  },
  {
    id: "uf0517-ud1-052",
    type: "content",
    title: "9.2 El Ciclo PDCA",
    section: "9. Calidad y Mejora Continua",
    content: `# 🔄 El Ciclo de Mejora Continua: PDCA

El **Ciclo PDCA** (Plan-Do-Check-Act) es la herramienta fundamental de la mejora continua.

## 🏗️ Las Cuatro Fases

\`\`\`
         ┌───────────────────────┐
         │        PLAN           │
         │     (Planificar)      │
         │  ¿Qué? ¿Cómo? ¿Cuándo?│
         └───────────┬───────────┘
                     │
    ┌────────────────│────────────────┐
    │                │                │
    ▼                │                │
┌──────────┐         │         ┌──────────┐
│   ACT   │←────────┘─────────→│   DO    │
│ (Actuar)│                    │ (Hacer) │
│ Mejorar │                    │ Ejecutar│
└────┬─────┘                    └────┬─────┘
     │                               │
     │         ┌───────────┐         │
     └────────→│   CHECK   │←────────┘
               │(Verificar)│
               │ Comprobar │
               └───────────┘
\`\`\`

## 📋 Detalle de cada Fase

| Fase | Acción | Preguntas clave |
|------|--------|-----------------|
| 📝 PLAN | Identificar problema y planificar solución | ¿Qué mejorar? ¿Cómo? |
| ⚙️ DO | Implementar el plan a pequeña escala | ¿Se ejecuta correctamente? |
| 🔍 CHECK | Medir resultados y comparar | ¿Funciona? ¿Datos? |
| ✅ ACT | Estandarizar si funciona o ajustar | ¿Generalizamos o corregimos? |

> **💡 Tip:** El ciclo PDCA nunca termina. Siempre se puede mejorar.`,
    keyTerms: ["PDCA", "Deming", "Mejora continua"],
    processSteps: [
      { step: 1, title: "PLAN", description: "Planificar: identificar el problema y diseñar la mejora" },
      { step: 2, title: "DO", description: "Hacer: implementar el plan a pequeña escala" },
      { step: 3, title: "CHECK", description: "Verificar: medir resultados y compararlos con objetivos" },
      { step: 4, title: "ACT", description: "Actuar: estandarizar la mejora o corregir desviaciones" }
    ]
  },
  {
    id: "uf0517-ud1-053",
    type: "table",
    title: "9.3 Normas ISO",
    section: "9. Calidad y Mejora Continua",
    content: `# 📜 Las Normas ISO más Importantes`,
    tableData: {
      headers: ["Norma", "Ámbito", "Objetivo"],
      rows: [
        ["ISO 9001", "Gestión de Calidad", "Sistema de gestión para satisfacción del cliente"],
        ["ISO 14001", "Medio Ambiente", "Sistema de gestión ambiental"],
        ["ISO 45001", "Seguridad y Salud", "Sistema de gestión de seguridad laboral"],
        ["ISO 27001", "Seguridad Información", "Sistema de gestión de seguridad de la información"],
        ["ISO 31000", "Gestión de Riesgos", "Principios y directrices para gestionar riesgos"],
        ["ISO 26000", "Responsabilidad Social", "Guía sobre responsabilidad social corporativa"]
      ]
    },
    keyTerms: ["ISO 9001", "Certificación", "Normas"]
  },
  {
    id: "uf0517-ud1-054",
    type: "quiz",
    title: "📝 Test: Calidad",
    section: "9. Calidad y Mejora Continua",
    content: "Evalúa tus conocimientos sobre gestión de calidad.",
    quiz: {
      id: "quiz-ud1-009",
      question: "¿Qué fase del ciclo PDCA corresponde a 'medir los resultados y compararlos con los objetivos'?",
      options: [
        { id: "a", text: "Plan (Planificar)", isCorrect: false },
        { id: "b", text: "Do (Hacer)", isCorrect: false },
        { id: "c", text: "Check (Verificar)", isCorrect: true },
        { id: "d", text: "Act (Actuar)", isCorrect: false }
      ],
      explanation: "La fase CHECK (Verificar) es donde se comprueban los resultados obtenidos comparándolos con los objetivos planificados. Es el momento de analizar datos y evaluar si la mejora funciona.",
      hint: "Piensa en qué fase se hace la comprobación o verificación."
    },
    keyTerms: ["Ciclo PDCA", "Check"]
  },

  // ==================== SECCIÓN 10: NORMATIVA BÁSICA ====================
  {
    id: "uf0517-ud1-055",
    type: "content",
    title: "10.1 Marco Legal de las Organizaciones",
    section: "10. Normativa Básica",
    content: `# ⚖️ Normativa Aplicable a las Organizaciones

Las organizaciones están sujetas a un amplio marco normativo que regula su funcionamiento.

## 📋 Principales Ámbitos Normativos

| Ámbito | Normativa Principal | Aplicación |
|--------|---------------------|------------|
| 🏢 Mercantil | Código de Comercio, Ley de Sociedades | Constitución, funcionamiento empresas |
| 👥 Laboral | Estatuto de los Trabajadores | Relaciones laborales, contratos |
| 💰 Fiscal | Ley General Tributaria | Impuestos, obligaciones fiscales |
| 🔒 Protección de datos | RGPD, LOPDGDD | Tratamiento datos personales |
| 🏛️ Administrativo | Ley 39 y 40/2015 | Sector público, procedimientos |
| 📋 Prevención riesgos | Ley 31/1995 PRL | Seguridad y salud laboral |

> **⚠️ Importante:** El desconocimiento de la ley no exime de su cumplimiento.**`,
    keyTerms: ["Normativa", "Legislación", "Cumplimiento"]
  },
  {
    id: "uf0517-ud1-056",
    type: "content",
    title: "10.2 Protección de Datos (RGPD)",
    section: "10. Normativa Básica",
    content: `# 🔒 Protección de Datos Personales

El **RGPD** (Reglamento General de Protección de Datos) es la normativa europea que regula el tratamiento de datos personales.

## 📋 Principios del RGPD

\`\`\`
    ┌─────────────────────────────────────────┐
    │          PRINCIPIOS RGPD                │
    ├─────────────────────────────────────────┤
    │ ✅ LICITUD: Base legal para el tratamiento
    │ ✅ LEALTAD: Transparencia con el interesado
    │ ✅ FINALIDAD: Propósitos determinados
    │ ✅ MINIMIZACIÓN: Solo datos necesarios
    │ ✅ EXACTITUD: Datos actualizados
    │ ✅ LIMITACIÓN: Tiempo limitado de conservación
    │ ✅ SEGURIDAD: Medidas de protección
    └─────────────────────────────────────────┘
\`\`\`

## 👤 Derechos del Interesado (ARCO+)

- 📖 **Acceso:** Conocer qué datos se tratan
- ✏️ **Rectificación:** Corregir datos incorrectos
- 🗑️ **Supresión:** Derecho al olvido
- 🚫 **Oposición:** Negarse al tratamiento
- 📦 **Portabilidad:** Llevarse los datos
- ⏸️ **Limitación:** Restringir el tratamiento

> **📌 Las multas por incumplimiento pueden alcanzar los 20 millones de euros o el 4% de la facturación anual.**`,
    keyTerms: ["RGPD", "Protección de datos", "ARCO"]
  },
  {
    id: "uf0517-ud1-057",
    type: "content",
    title: "10.3 Tarjetas: Normativa",
    section: "10. Normativa Básica",
    content: `# 🎴 Conceptos Legales Clave`,
    flashcards: [
      { id: "fc26", front: "¿Qué es el Registro Mercantil?", back: "Registro público donde se inscriben los actos societarios: constitución, nombramientos, cuentas anuales, modificaciones estatutarias, etc." },
      { id: "fc27", front: "¿Qué es el compliance?", back: "Sistema de cumplimiento normativo: conjunto de procedimientos para asegurar que la empresa cumple con la legislación y previene infracciones." },
      { id: "fc28", front: "¿Qué es la firma electrónica?", back: "Mecanismo técnico que permite firmar documentos digitalmente con validez legal. Puede ser simple, avanzada o cualificada." },
      { id: "fc29", front: "¿Qué son las cuentas anuales?", back: "Documentos que reflejan la situación económico-financiera: Balance, Cuenta de Pérdidas y Ganancias, Estado de Cambios, Memoria." },
      { id: "fc30", front: "¿Qué es el NIF de una empresa?", back: "Número de Identificación Fiscal: código alfanumérico que identifica a la empresa ante Hacienda. Comienza con letra según el tipo de entidad." }
    ],
    keyTerms: ["Registro Mercantil", "Compliance", "Firma electrónica"]
  },
  {
    id: "uf0517-ud1-058",
    type: "quiz",
    title: "📝 Test: Normativa",
    section: "10. Normativa Básica",
    content: "Comprueba tus conocimientos sobre normativa empresarial.",
    quiz: {
      id: "quiz-ud1-010",
      question: "¿Cuál de los siguientes NO es un derecho del interesado según el RGPD?",
      options: [
        { id: "a", text: "Derecho de acceso", isCorrect: false },
        { id: "b", text: "Derecho de rectificación", isCorrect: false },
        { id: "c", text: "Derecho de venta", isCorrect: true },
        { id: "d", text: "Derecho de portabilidad", isCorrect: false }
      ],
      explanation: "El derecho de VENTA no existe en el RGPD. Los derechos son: Acceso, Rectificación, Supresión, Oposición, Portabilidad y Limitación del tratamiento (ARCO+).",
      hint: "Recuerda el acrónimo ARCO y sus ampliaciones."
    },
    keyTerms: ["Derechos ARCO", "RGPD"]
  },

  // ==================== RESUMEN Y EVALUACIÓN FINAL ====================
  {
    id: "uf0517-ud1-059",
    type: "summary",
    title: "📚 Resumen de la Unidad",
    section: "Resumen Final",
    content: `# 📖 Resumen: La Organización de Entidades Públicas y Privadas

## 🎯 Conceptos Clave Aprendidos

### 1️⃣ Concepto de Organización
- Conjunto de personas + recursos + objetivos + estructura
- Clasificación: públicas, privadas y mixtas

### 2️⃣ Administraciones Públicas
- Tres niveles: Estatal, Autonómico, Local
- Ministerios, Consejerías, Ayuntamientos

### 3️⃣ Entidades Privadas
- Formas jurídicas: Autónomo, S.L., S.A., Cooperativa
- Responsabilidad limitada vs ilimitada

### 4️⃣ Estructuras Organizativas
- Lineal, Funcional, Divisional, Matricial
- El organigrama como herramienta visual

### 5️⃣ Departamentos Empresariales
- Comercial, Producción, Finanzas, RR.HH., Compras

### 6️⃣ Comunicación Organizacional
- Descendente, Ascendente, Horizontal
- Canales formales e informales

### 7️⃣ Cultura y Calidad
- Misión, Visión, Valores
- Ciclo PDCA de mejora continua
- Normas ISO

### 8️⃣ Normativa
- RGPD y protección de datos
- Marco legal empresarial

> **🎓 ¡Enhorabuena! Has completado la UD1.**`,
    keyTerms: ["Resumen", "Conceptos clave"]
  },
  {
    id: "uf0517-ud1-060",
    type: "quiz",
    title: "📝 Evaluación Final UD1",
    section: "Evaluación Final",
    content: "Pregunta final de repaso de toda la unidad.",
    quiz: {
      id: "quiz-ud1-final",
      question: "Una empresa con capital de 60.000€ dividido en acciones que pueden cotizar en Bolsa es una:",
      options: [
        { id: "a", text: "Sociedad Limitada (S.L.)", isCorrect: false },
        { id: "b", text: "Sociedad Anónima (S.A.)", isCorrect: true },
        { id: "c", text: "Cooperativa", isCorrect: false },
        { id: "d", text: "Comunidad de Bienes", isCorrect: false }
      ],
      explanation: "La SOCIEDAD ANÓNIMA (S.A.) tiene un capital mínimo de 60.000€, dividido en ACCIONES, que pueden transmitirse libremente y cotizar en Bolsa. La S.L. tiene participaciones (no acciones) y no puede cotizar.",
      hint: "Solo un tipo de sociedad puede cotizar en Bolsa y tiene su capital dividido en acciones."
    },
    keyTerms: ["S.A.", "Acciones", "Bolsa"]
  }
];
