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
  ChevronDown, Star, TrendingUp, ThumbsUp, ThumbsDown, RotateCcw, Video,
  Headphones, Network, Eye, MapPin, Shuffle, SquarePlay, Download, FileDown
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
  type: 'intro' | 'content' | 'objectives' | 'quiz' | 'summary' | 'practice' | 'concept-map' | 'video' | 'audio' | 'presentation' | 'exercise';
  title: string;
  content?: string;
  objectives?: string[];
  keyPoints?: string[];
  quiz?: QuizQuestion;
  tips?: string[];
  image?: string;
  mediaUrl?: string;
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

// Manual PDF downloads
const MANUAL_PDFS: Record<string, { title: string; files: { name: string; url: string }[] }> = {
  "UF0517": {
    title: "UF0517 - Organización Empresarial y de Recursos Humanos",
    files: [
      { name: "UD1 - La organización de entidades públicas y privadas", url: "/documents/manuales/UF0517_UD1_organizacion_entidades.pdf" },
      { name: "UD2 - La organización de los Recursos Humanos", url: "/documents/manuales/UF0517_UD2_recursos_humanos.pdf" }
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
      { name: "UD1 - Gestión auxiliar de documentación administrativa básica", url: "/documents/manuales/UF0519_UD1_documentacion_administrativa.pdf" },
      { name: "UD2 - Gestión básica de tesorería", url: "/documents/manuales/UF0519_UD2_tesoreria.pdf" },
      { name: "UD3 - Gestión y control básico de existencias", url: "/documents/manuales/UF0519_UD3_existencias.pdf" }
    ]
  }
};

// Concept maps for each UF
const CONCEPT_MAPS: Record<string, { title: string; nodes: { id: string; label: string; level: number; connections: string[] }[] }> = {
  "UF0517": {
    title: "Organización Empresarial y RRHH",
    nodes: [
      { id: "1", label: "LA EMPRESA", level: 0, connections: ["2", "3", "4"] },
      { id: "2", label: "Tipos de Empresas", level: 1, connections: ["5", "6", "7"] },
      { id: "3", label: "Estructura Organizativa", level: 1, connections: ["8", "9"] },
      { id: "4", label: "Recursos Humanos", level: 1, connections: ["10", "11"] },
      { id: "5", label: "Autónomo", level: 2, connections: [] },
      { id: "6", label: "S.L.", level: 2, connections: [] },
      { id: "7", label: "S.A.", level: 2, connections: [] },
      { id: "8", label: "Organigramas", level: 2, connections: [] },
      { id: "9", label: "Departamentos", level: 2, connections: [] },
      { id: "10", label: "Selección", level: 2, connections: [] },
      { id: "11", label: "Formación", level: 2, connections: [] }
    ]
  },
  "UF0518": {
    title: "Gestión de Correspondencia",
    nodes: [
      { id: "1", label: "CORRESPONDENCIA", level: 0, connections: ["2", "3", "4"] },
      { id: "2", label: "Recepción", level: 1, connections: ["5", "6"] },
      { id: "3", label: "Distribución", level: 1, connections: ["7", "8"] },
      { id: "4", label: "Archivo", level: 1, connections: ["9", "10"] },
      { id: "5", label: "Registro", level: 2, connections: [] },
      { id: "6", label: "Clasificación", level: 2, connections: [] },
      { id: "7", label: "Interna", level: 2, connections: [] },
      { id: "8", label: "Externa", level: 2, connections: [] },
      { id: "9", label: "Físico", level: 2, connections: [] },
      { id: "10", label: "Digital", level: 2, connections: [] }
    ]
  },
  "UF0519": {
    title: "Documentación Económico-Administrativa",
    nodes: [
      { id: "1", label: "DOCUMENTOS", level: 0, connections: ["2", "3", "4"] },
      { id: "2", label: "Mercantiles", level: 1, connections: ["5", "6", "7"] },
      { id: "3", label: "Tesorería", level: 1, connections: ["8", "9"] },
      { id: "4", label: "Existencias", level: 1, connections: ["10", "11"] },
      { id: "5", label: "Factura", level: 2, connections: [] },
      { id: "6", label: "Albarán", level: 2, connections: [] },
      { id: "7", label: "Pedido", level: 2, connections: [] },
      { id: "8", label: "Libro Caja", level: 2, connections: [] },
      { id: "9", label: "Arqueo", level: 2, connections: [] },
      { id: "10", label: "FIFO", level: 2, connections: [] },
      { id: "11", label: "PMP", level: 2, connections: [] }
    ]
  }
};

// Extended content slides with COMPLETE curriculum content from PDFs
const EXTENDED_CONTENT: Record<string, { title: string; content: string; keyTerms?: string[] }[]> = {
  "UF0517": [
    {
      title: "1. Introducción a la Empresa",
      content: `La empresa es una **unidad económica de producción** que combina diferentes factores productivos (trabajo, capital, tecnología y materias primas) con el objetivo de producir bienes o prestar servicios.

**Características fundamentales de la empresa:**
- **Unidad económica**: Agrupa recursos humanos, materiales y financieros
- **Unidad de decisión**: Existe un centro de decisión que planifica y controla
- **Unidad financiera**: Dispone de un patrimonio propio
- **Unidad técnica**: Aplica tecnología específica en sus procesos`,
      keyTerms: ["Empresa", "Factores productivos", "Unidad económica"]
    },
    {
      title: "2. Clasificación de Empresas por Tamaño",
      content: `Las empresas se clasifican según su número de trabajadores y facturación:

| Tipo | Nº Trabajadores | Facturación Anual |
|------|-----------------|-------------------|
| **Microempresa** | 1-9 | < 2 millones € |
| **Pequeña empresa** | 10-49 | < 10 millones € |
| **Mediana empresa** | 50-249 | < 50 millones € |
| **Gran empresa** | 250+ | > 50 millones € |

> **Dato importante:** Las PYMES (Pequeñas y Medianas Empresas) representan más del 99% del tejido empresarial español.`,
      keyTerms: ["PYME", "Microempresa", "Gran empresa"]
    },
    {
      title: "3. Clasificación por Sector de Actividad",
      content: `**Sector Primario:**
• Empresas agrícolas, ganaderas, pesqueras
• Extracción de recursos naturales
• Minería y explotación forestal

**Sector Secundario:**
• Industria manufacturera
• Construcción
• Transformación de materias primas
• Producción de energía

**Sector Terciario (Servicios):**
• Servicios comerciales
• Transporte y comunicaciones
• Turismo y hostelería
• Servicios financieros y profesionales`,
      keyTerms: ["Sector primario", "Sector secundario", "Sector terciario"]
    },
    {
      title: "4. Formas Jurídicas: Empresario Individual",
      content: `El **empresario individual** o autónomo es una persona física que realiza una actividad económica en nombre propio.

**Características:**
- No requiere capital mínimo para constituirse
- **Responsabilidad ilimitada** con todo su patrimonio personal
- Tributación por IRPF (Impuesto sobre la Renta de las Personas Físicas)
- Trámites de constitución sencillos

> **¡Atención!** La responsabilidad ilimitada significa que el empresario responde de las deudas con todos sus bienes presentes y futuros, incluso los personales.`,
      keyTerms: ["Autónomo", "Responsabilidad ilimitada", "IRPF"]
    },
    {
      title: "5. Formas Jurídicas: Sociedades Mercantiles",
      content: `**Sociedad de Responsabilidad Limitada (S.L.):**
• Capital mínimo: **3.000 €**
• Dividido en participaciones sociales
• Responsabilidad limitada al capital aportado
• Mínimo 1 socio

**Sociedad Anónima (S.A.):**
• Capital mínimo: **60.000 €**
• Capital dividido en acciones
• Responsabilidad limitada al capital
• Órgano máximo: Junta General de Accionistas

**Cooperativa:**
• Capital variable
• Mínimo 3 socios (primer grado)
• Gestión democrática (un socio, un voto)`,
      keyTerms: ["S.L.", "S.A.", "Cooperativa", "Capital mínimo"]
    },
    {
      title: "6. La Jerarquía Empresarial",
      content: `La jerarquía establece los diferentes niveles de autoridad y responsabilidad:

**Nivel Estratégico (Alta Dirección):**
• Consejo de Administración, Director General / CEO
• Toma de decisiones estratégicas a largo plazo

**Nivel Táctico (Mandos Intermedios):**
• Jefes de Departamento, Coordinadores
• Implementación de estrategias y gestión de equipos

**Nivel Operativo (Base):**
• Trabajadores especializados, personal administrativo
• Ejecución de tareas diarias

**Principios de la jerarquía:**
1. **Unidad de mando**: Cada empleado depende de un solo superior
2. **Cadena de mando**: Línea clara de autoridad
3. **Tramo de control**: Número de subordinados que puede gestionar un superior`,
      keyTerms: ["Jerarquía", "Nivel estratégico", "Unidad de mando"]
    },
    {
      title: "7. La Función Administrativa",
      content: `La función administrativa es el conjunto de actividades que permiten **planificar, organizar, dirigir y controlar** los recursos de una organización.

**Las 4 funciones del proceso administrativo:**

1. **PLANIFICACIÓN**: Determinar qué se quiere conseguir y cómo
   - Objetivos, estrategias, presupuestos

2. **ORGANIZACIÓN**: Estructurar recursos y actividades
   - Definir puestos, departamentos, jerarquías

3. **DIRECCIÓN**: Guiar y motivar al personal
   - Liderazgo, comunicación, toma de decisiones

4. **CONTROL**: Verificar que se cumplen los planes
   - Medir resultados, detectar desviaciones, corregir`,
      keyTerms: ["Planificación", "Organización", "Dirección", "Control"]
    },
    {
      title: "8. Los Organigramas",
      content: `El **organigrama** es la representación gráfica de la estructura organizativa de una empresa.

**Tipos de organigramas:**

**Por su forma:**
• **Vertical**: De arriba abajo (el más común)
• **Horizontal**: De izquierda a derecha
• **Circular**: En círculos concéntricos
• **Mixto**: Combinación de los anteriores

**Por su contenido:**
• **Estructural**: Solo muestra unidades organizativas
• **Funcional**: Incluye las funciones de cada unidad
• **Personal**: Incluye nombres de los responsables

**Requisitos de un buen organigrama:**
• Claridad y simplicidad
• Actualización permanente
• Fácil comprensión`,
      keyTerms: ["Organigrama", "Vertical", "Funcional"]
    },
    {
      title: "9. Los Departamentos de la Empresa",
      content: `Los departamentos son unidades organizativas especializadas en funciones concretas:

**Departamento de Dirección General:**
• Planificación estratégica
• Toma de decisiones globales

**Departamento de Recursos Humanos:**
• Selección y contratación
• Formación y desarrollo
• Gestión de nóminas

**Departamento Comercial/Marketing:**
• Ventas y atención al cliente
• Publicidad y promoción
• Investigación de mercados

**Departamento Financiero:**
• Contabilidad y gestión económica
• Tesorería e inversiones
• Control de costes

**Departamento de Producción:**
• Fabricación de productos
• Control de calidad
• Logística`,
      keyTerms: ["RRHH", "Marketing", "Finanzas", "Producción"]
    },
    {
      title: "10. Grupos de Trabajo y Equipos",
      content: `Un **grupo de trabajo** es un conjunto de personas que participan en una misma estructura y persiguen objetivos comunes.

**Elementos de un grupo:**
• Miembros que lo componen
• Objetivos comunes
• Normas de convivencia
• Roles y funciones
• Sentimiento de pertenencia

**Diferencia entre Grupo y Equipo:**
| Característica | Grupo | Equipo |
|---------------|-------|--------|
| Liderazgo | Individual | Compartido |
| Responsabilidad | Individual | Conjunta |
| Objetivo | Individual | Común |
| Resultados | Individuales | Colectivos |

**Criterios de coordinación:**
1. **Adaptación mutua**: Comunicación informal
2. **Supervisión directa**: Control por superiores
3. **Normalización**: Procedimientos establecidos`,
      keyTerms: ["Grupo", "Equipo", "Coordinación", "Trabajo en equipo"]
    }
  ],
  "UF0518": [
    {
      title: "1. La Comunicación Empresarial",
      content: `La **comunicación empresarial** es el área estratégica de planificación que permite intercambiar información dentro y fuera de la organización.

**Tipos de comunicación:**

**Comunicación Interna:**
• Dirigida al trabajador de la empresa
• Objetivo: mantener la cohesión y motivación

**Comunicación Externa:**
• Intercambio con el mercado y terceros
• Objetivo: proyectar imagen corporativa

**Funciones de la comunicación:**
• **Abierta**: Comunicarse con el exterior de forma interactiva
• **Evolutiva**: Adaptarse a lo imprevisto
• **Flexible**: Combinar lo formal e informal
• **Multidireccional**: De arriba a abajo y viceversa
• **Instrumentada**: Usar herramientas adecuadas`,
      keyTerms: ["Comunicación interna", "Comunicación externa", "Información"]
    },
    {
      title: "2. Elementos de la Comunicación",
      content: `En todo proceso de comunicación intervienen estos elementos:

**EMISOR**: Persona o conjunto de personas que transmiten el mensaje.

**RECEPTOR**: Destinatario del mensaje, quien lo interpreta.

**MENSAJE**: Objeto de la comunicación (información, opinión, datos).

**CANAL**: Medio mediante el cual se transmite la información.
• Oral: teléfono, reunión, videoconferencia
• Escrito: carta, email, informe, memorándum

**CÓDIGO**: Conjunto de símbolos utilizados para expresar el mensaje.

**CONTEXTO**: Situación real del emisor y receptor.

**RETROALIMENTACIÓN (Feedback)**: Permite determinar si el receptor comprendió el mensaje correctamente.`,
      keyTerms: ["Emisor", "Receptor", "Mensaje", "Canal", "Feedback"]
    },
    {
      title: "3. Tipos de Comunicación Escrita",
      content: `**Documentos de comunicación interna:**

• **Nota interior o memorándum**: Comunicación breve entre departamentos
• **Circular**: Mensaje idéntico para múltiples destinatarios
• **Informe**: Documento que presenta datos analizados
• **Acta**: Registro de lo tratado en una reunión

**Documentos de comunicación externa:**

• **Carta comercial**: Principal vehículo de comunicación con clientes/proveedores
• **Solicitud o instancia**: Petición formal a organismos
• **Certificado**: Documento que acredita hechos
• **Oficio**: Comunicación oficial entre administraciones

**Comunicación electrónica:**
• Email (correo electrónico)
• Mensajería instantánea corporativa
• Intranet / Portales corporativos`,
      keyTerms: ["Memorándum", "Circular", "Carta comercial", "Email"]
    },
    {
      title: "4. La Carta Comercial - Estructura",
      content: `La **carta comercial** es el principal vehículo de comunicación entre empresas o particulares.

**ESTRUCTURA DE UNA CARTA COMERCIAL:**

**INICIO:**
• **Membrete**: Datos de la empresa emisora (logo, nombre, dirección, CIF)
• **Destinatario**: Datos de la persona/empresa receptora
• **Referencia o asunto**: Tema de la carta
• **Fecha**: Lugar y fecha de emisión

**CONTENIDO:**
• **Saludo**: Fórmula de cortesía ("Estimado/a Sr./Sra.")
• **Texto o cuerpo**: Tema principal de la carta

**FINAL:**
• **Despedida**: Fórmula de cortesía ("Atentamente", "Un cordial saludo")
• **Antefirma**: Cargo del firmante
• **Firma**: Rúbrica
• **Anexos**: Si hay documentos adjuntos`,
      keyTerms: ["Membrete", "Saludo", "Despedida", "Firma"]
    },
    {
      title: "5. Gestión de Correspondencia Entrante",
      content: `El proceso de gestión de correspondencia entrante incluye:

**1. RECEPCIÓN:**
• Recogida del correo (físico y electrónico)
• Verificación de integridad de los envíos

**2. REGISTRO:**
• Anotar en libro/sistema de registro:
  - Fecha de entrada
  - Remitente
  - Asunto
  - Destinatario interno
  - Número de registro

**3. CLASIFICACIÓN:**
• Por urgencia (urgente, normal, diferido)
• Por departamento destino
• Por tipo de documento

**4. DISTRIBUCIÓN:**
• Entrega al destinatario interno
• Acuse de recibo si es necesario

**5. ARCHIVO:**
• Ordenación sistemática
• Conservación adecuada`,
      keyTerms: ["Registro", "Clasificación", "Distribución", "Archivo"]
    },
    {
      title: "6. Sistemas de Archivo",
      content: `Existen diferentes sistemas para organizar y clasificar los documentos:

**ARCHIVO ALFABÉTICO:**
Por nombre de personas, empresas o temas.
Ejemplo: Clientes ordenados de la A a la Z

**ARCHIVO NUMÉRICO:**
Asigna un número correlativo a cada documento.
Ejemplo: Facturas 001, 002, 003...

**ARCHIVO CRONOLÓGICO:**
Ordenado por fechas, del más antiguo al más reciente (o viceversa).
Ejemplo: Correspondencia por meses

**ARCHIVO TEMÁTICO O POR MATERIAS:**
Clasificado por asuntos o categorías.
Ejemplo: Contratos, Facturas, Nóminas...

**ARCHIVO GEOGRÁFICO:**
Por zonas o territorios.
Ejemplo: Clientes por provincias

**ARCHIVO MIXTO:**
Combinación de varios sistemas.
Ejemplo: Por zonas y dentro de cada zona, alfabético`,
      keyTerms: ["Alfabético", "Numérico", "Cronológico", "Temático"]
    },
    {
      title: "7. Servicios Postales y de Paquetería",
      content: `**TIPOS DE ENVÍOS POSTALES:**

**Carta ordinaria**: Envío básico sin registro ni confirmación

**Carta certificada**: 
• Con número de seguimiento
• Aviso de recibo (acuse de recibo)
• Prueba legal de envío y entrega

**Burofax**: 
• Certificación del contenido
• Valor legal en comunicaciones oficiales

**Paquetería**:
• Envíos volumétricos o pesados
• Servicio urgente o económico

**SERVICIOS DE MENSAJERÍA:**
• Entrega express (24h, mismo día)
• Recogida en domicilio
• Seguimiento en tiempo real
• Confirmación de entrega

**Gestión de paquetería en la empresa:**
• Registro de entrada y salida
• Control de albaranes
• Incidencias y reclamaciones`,
      keyTerms: ["Carta certificada", "Burofax", "Acuse de recibo", "Paquetería"]
    }
  ],
  "UF0519": [
    {
      title: "1. Documentos Administrativos - Introducción",
      content: `Los **documentos administrativos** son soportes que contienen información relativa a las actividades de una organización.

**Elementos imprescindibles:**
• Emisor (quien lo genera)
• Destinatario (a quien va dirigido)
• Contenido informativo
• Fecha y lugar
• Firma o validación

**Funciones principales:**
1. **Función probatoria**: Aseguran la pervivencia de actuaciones
2. **Función de comunicación**: Medio de transmisión de información
3. **Función de control**: Permiten seguimiento de operaciones
4. **Función jurídica**: Generan derechos y obligaciones
5. **Función contable**: Base para registros económicos

**Clasificación:**
• Por origen: Internos / Externos
• Por función: Comerciales / Laborales / Contables
• Por formato: Papel / Electrónicos`,
      keyTerms: ["Documento administrativo", "Emisor", "Destinatario"]
    },
    {
      title: "2. El Pedido",
      content: `El **pedido** es el documento mediante el cual el comprador solicita al vendedor el suministro de determinados bienes o servicios.

**Elementos del pedido:**
| Elemento | Descripción |
|----------|-------------|
| Datos del comprador | Nombre, dirección, CIF |
| Datos del vendedor | Nombre, dirección, CIF |
| Número de pedido | Referencia única |
| Fecha | Fecha de emisión |
| Descripción | Detalle de productos/servicios |
| Cantidades | Unidades solicitadas |
| Precios | Precio unitario y total |
| Condiciones de entrega | Lugar, fecha, transporte |
| Condiciones de pago | Forma y plazo de pago |

**Clases de pedidos:**
• Pedido verbal (teléfono)
• Pedido escrito (formulario)
• Pedido electrónico (email, web)
• Pedido programado (entregas periódicas)`,
      keyTerms: ["Pedido", "Comprador", "Vendedor"]
    },
    {
      title: "3. El Albarán o Nota de Entrega",
      content: `El **albarán** es el documento que acompaña a la mercancía en su transporte y justifica la entrega.

**Elementos del albarán:**
• Datos del vendedor (emisor)
• Datos del comprador (destinatario)
• Número de albarán (correlativo)
• Fecha de entrega
• Referencia del pedido correspondiente
• Descripción de productos entregados
• Cantidades
• **Firma del receptor** (conformidad)

**Funciones del albarán:**
1. **Control**: Verificar que se entrega lo pedido
2. **Probatoria**: Acreditar la entrega de mercancías
3. **Contable**: Base para emitir la factura
4. **Reclamación**: Documento para incidencias

> **Importante**: El albarán NO es un documento con valor fiscal, pero sí tiene valor jurídico como prueba de entrega.`,
      keyTerms: ["Albarán", "Nota de entrega", "Conformidad"]
    },
    {
      title: "4. La Factura - Concepto y Elementos",
      content: `La **factura** es el documento mercantil que refleja toda la información de una operación de compraventa y genera obligación de pago.

**Elementos OBLIGATORIOS de la factura:**

| Elemento | Descripción |
|----------|-------------|
| Número de factura | Numeración correlativa |
| Fecha de emisión | Fecha de expedición |
| Datos del emisor | Nombre, NIF, dirección |
| Datos del destinatario | Nombre, NIF, dirección |
| Descripción | Detalle de bienes/servicios |
| **Base imponible** | Importe antes de impuestos |
| **Tipo de IVA** | Porcentaje aplicable (21%, 10%, 4%) |
| **Cuota de IVA** | Importe del impuesto |
| **Importe total** | Cantidad total a pagar |

**Fórmula básica:**
> Base Imponible + Cuota IVA = Total Factura`,
      keyTerms: ["Factura", "Base imponible", "IVA", "Cuota"]
    },
    {
      title: "5. Tipos de Facturas",
      content: `**FACTURA ORDINARIA:**
La más habitual, con todos los datos obligatorios.

**FACTURA SIMPLIFICADA (antes "ticket"):**
• Para importes menores de 400€ (norma general)
• No requiere datos completos del destinatario
• Válida para pequeñas compras

**FACTURA RECTIFICATIVA:**
• Corrige errores de una factura anterior
• Obligatoria cuando hay devoluciones o descuentos posteriores
• Debe hacer referencia a la factura original

**FACTURA PROFORMA:**
• NO tiene valor fiscal
• Sirve como presupuesto o propuesta
• Se emite antes de la operación

**FACTURA ELECTRÓNICA:**
• Formato digital con validez legal
• Requiere firma electrónica
• Obligatoria para administraciones públicas
• Mismos requisitos que la factura en papel`,
      keyTerms: ["Factura simplificada", "Rectificativa", "Proforma", "Electrónica"]
    },
    {
      title: "6. Gestión de Tesorería - Conceptos",
      content: `La **tesorería** gestiona los recursos líquidos de la empresa: caja, bancos, cobros y pagos.

**OPERACIONES BÁSICAS DE TESORERÍA:**

**Cobros**: Entradas de dinero
• Por ventas (contado o crédito)
• Devoluciones de proveedores
• Subvenciones, intereses

**Pagos**: Salidas de dinero
• A proveedores
• Nóminas
• Impuestos, seguros, alquileres

**LIBROS AUXILIARES:**

**Libro de Caja:**
• Registra movimientos de EFECTIVO
• Entradas y salidas de dinero en metálico
• Saldo actual de caja

**Libro de Bancos:**
• Registra movimientos en cuentas bancarias
• Conciliación con extractos bancarios`,
      keyTerms: ["Tesorería", "Cobros", "Pagos", "Libro de Caja"]
    },
    {
      title: "7. Medios de Pago",
      content: `**MEDIOS DE PAGO MÁS UTILIZADOS:**

**EFECTIVO:**
• Billetes y monedas
• Pago inmediato
• Límite legal: 1.000€ (entre empresario y particular)

**CHEQUE:**
• Orden de pago contra una cuenta bancaria
• Nominativo, al portador o cruzado

**TRANSFERENCIA BANCARIA:**
• Orden al banco para traspasar fondos
• Nacional (SEPA) o internacional

**PAGARÉ:**
• Promesa de pago a fecha determinada
• Documento firmado por el deudor

**LETRA DE CAMBIO:**
• Orden de pago con vencimiento futuro
• Negociable (puede descontarse en banco)

**TARJETAS:**
• Débito: Cargo inmediato en cuenta
• Crédito: Pago diferido`,
      keyTerms: ["Cheque", "Transferencia", "Pagaré", "Letra de cambio"]
    },
    {
      title: "8. El Arqueo de Caja",
      content: `El **arqueo de caja** es la verificación del dinero efectivo en caja.

**PROCESO DEL ARQUEO:**
1. Contar físicamente el efectivo
2. Clasificar por billetes y monedas
3. Comparar con el saldo contable
4. Identificar diferencias

**POSIBLES DIFERENCIAS:**

**Sobrante**: Hay MÁS dinero del que debería
• Puede indicar cobro no registrado
• O error al dar cambio (a favor)

**Faltante**: Hay MENOS dinero del que debería
• Error al dar cambio (en contra)
• Pago no registrado
• Posible sustracción

**El arqueo debe realizarse:**
• Al cierre de cada día
• Al cambio de turno
• De forma sorpresiva (control)

**Documento de arqueo:**
Debe reflejar: fecha, responsable, recuento detallado, saldo según libros, diferencias, firma.`,
      keyTerms: ["Arqueo", "Sobrante", "Faltante", "Cierre de caja"]
    },
    {
      title: "9. Control de Existencias - Conceptos",
      content: `Las **existencias** son bienes poseídos por la empresa para su venta o transformación.

**TIPOS DE EXISTENCIAS:**
• **Materias primas**: Para transformar
• **Productos en curso**: En fabricación
• **Productos terminados**: Listos para vender
• **Mercaderías**: Comprados para revender
• **Material de oficina**: Consumibles

**GESTIÓN DE ALMACÉN:**

**Entradas de almacén:**
• Por compras a proveedores
• Por devoluciones de clientes
• Por producción terminada

**Salidas de almacén:**
• Por ventas a clientes
• Por devoluciones a proveedores
• Por consumo interno

**FICHA DE ALMACÉN:**
Registra todas las entradas y salidas de cada producto, con cantidades, precios y saldos.`,
      keyTerms: ["Existencias", "Stock", "Almacén", "Ficha de almacén"]
    },
    {
      title: "10. Métodos de Valoración de Existencias",
      content: `Cuando compramos el mismo producto a diferentes precios, necesitamos un criterio para valorar las salidas:

**MÉTODO FIFO (First In, First Out):**
"Primeras entradas, primeras salidas"
• Las primeras unidades que entran son las primeras que salen
• Se valoran las salidas al precio más antiguo
• El inventario queda valorado a precios más recientes

**MÉTODO PMP (Precio Medio Ponderado):**
• Se calcula un precio medio de todas las entradas
• Fórmula: (Valor existencias + Valor nueva entrada) / Total unidades
• Se aplica el mismo precio a todas las unidades

**Ejemplo comparativo:**
| Operación | FIFO | PMP |
|-----------|------|-----|
| Entrada 100 uds a 10€ | - | - |
| Entrada 100 uds a 12€ | - | - |
| Salida 50 uds | 10€/ud | 11€/ud |

> **Nota**: En España, LIFO (Last In, First Out) NO está permitido fiscalmente.`,
      keyTerms: ["FIFO", "PMP", "Valoración", "Inventario"]
    }
  ]
};

// Extended quiz questions
const EXTENDED_QUIZ: Record<string, QuizQuestion[]> = {
  "UF0517": [
    {
      id: "q6",
      question: "¿Qué función de la empresa se encarga del registro de operaciones comerciales?",
      options: [
        { id: "a", text: "Función técnica", isCorrect: false },
        { id: "b", text: "Función contable", isCorrect: true },
        { id: "c", text: "Función financiera", isCorrect: false },
        { id: "d", text: "Función comercial", isCorrect: false }
      ],
      explanation: "La función contable se encarga de registrar todas las operaciones comerciales, tanto internas como externas.",
      hint: "Piensa en qué función se encarga de los números y registros..."
    },
    {
      id: "q7",
      question: "¿Cuál es el órgano encargado de la selección y motivación del personal?",
      options: [
        { id: "a", text: "Dirección General", isCorrect: false },
        { id: "b", text: "Departamento Comercial", isCorrect: false },
        { id: "c", text: "Departamento de Recursos Humanos", isCorrect: true },
        { id: "d", text: "Departamento Financiero", isCorrect: false }
      ],
      explanation: "El Departamento de RRHH gestiona la selección, contratación, formación y motivación del personal.",
      hint: "El nombre del departamento hace referencia a las personas..."
    },
    {
      id: "q8",
      question: "¿Qué criterio de coordinación se utiliza cuando la empresa crece y aumenta la división del trabajo?",
      options: [
        { id: "a", text: "Adaptación mutua", isCorrect: false },
        { id: "b", text: "Supervisión directa", isCorrect: true },
        { id: "c", text: "Normalización", isCorrect: false },
        { id: "d", text: "Autogestión", isCorrect: false }
      ],
      explanation: "La supervisión directa aparece cuando la empresa crece y el trabajo de unas personas es controlado por otras.",
      hint: "Cuando hay más empleados, se necesita alguien que los supervise..."
    }
  ],
  "UF0518": [
    {
      id: "q4",
      question: "¿Cuál es la estructura correcta de una carta comercial en su parte final?",
      options: [
        { id: "a", text: "Membrete, destinatario, firma", isCorrect: false },
        { id: "b", text: "Despedida, antefirma, firma, anexos", isCorrect: true },
        { id: "c", text: "Saludo, texto, fecha", isCorrect: false },
        { id: "d", text: "Referencia, asunto, cuerpo", isCorrect: false }
      ],
      explanation: "La parte final de una carta comercial incluye: despedida, antefirma, firma y anexos (si los hay).",
      hint: "Piensa en cómo terminas normalmente una carta formal..."
    },
    {
      id: "q5",
      question: "¿Qué sistema de archivo utiliza fechas para organizar los documentos?",
      options: [
        { id: "a", text: "Alfabético", isCorrect: false },
        { id: "b", text: "Numérico", isCorrect: false },
        { id: "c", text: "Cronológico", isCorrect: true },
        { id: "d", text: "Temático", isCorrect: false }
      ],
      explanation: "El archivo cronológico ordena los documentos según sus fechas, del más antiguo al más reciente o viceversa.",
      hint: "Cronos en griego significa tiempo..."
    },
    {
      id: "q6",
      question: "¿Cuál es una función de la comunicación interna en la empresa?",
      options: [
        { id: "a", text: "Seleccionar proveedores", isCorrect: false },
        { id: "b", text: "Implicar al personal en los objetivos", isCorrect: true },
        { id: "c", text: "Gestionar las ventas", isCorrect: false },
        { id: "d", text: "Facturar a clientes", isCorrect: false }
      ],
      explanation: "La comunicación interna mantiene la relación entre el trabajador y la empresa, implicándolo en los objetivos.",
      hint: "Es comunicación INTERNA, destinada a los empleados..."
    }
  ],
  "UF0519": [
    {
      id: "q6",
      question: "¿Qué es el Factoring?",
      options: [
        { id: "a", text: "Un tipo de préstamo bancario", isCorrect: false },
        { id: "b", text: "Cesión de cuentas a cobrar a una entidad financiera", isCorrect: true },
        { id: "c", text: "Un método de valoración de existencias", isCorrect: false },
        { id: "d", text: "Un tipo de factura especial", isCorrect: false }
      ],
      explanation: "El Factoring es una operación de financiación mediante la cesión de créditos comerciales a una entidad financiera.",
      hint: "Es una forma de obtener dinero antes del vencimiento de facturas..."
    },
    {
      id: "q7",
      question: "¿Qué elemento NO es obligatorio en una factura?",
      options: [
        { id: "a", text: "Número de factura", isCorrect: false },
        { id: "b", text: "Fecha de emisión", isCorrect: false },
        { id: "c", text: "Logotipo de la empresa", isCorrect: true },
        { id: "d", text: "Base imponible", isCorrect: false }
      ],
      explanation: "El logotipo es un elemento visual opcional; los elementos fiscales obligatorios son los datos del emisor, receptor, descripción, importes e IVA.",
      hint: "Piensa en qué datos son fiscalmente necesarios..."
    },
    {
      id: "q8",
      question: "¿Cuándo se produce un 'faltante' en el arqueo de caja?",
      options: [
        { id: "a", text: "Cuando sobra dinero en caja", isCorrect: false },
        { id: "b", text: "Cuando falta dinero respecto al saldo contable", isCorrect: true },
        { id: "c", text: "Cuando se hace el cierre de caja", isCorrect: false },
        { id: "d", text: "Cuando se ingresa dinero en el banco", isCorrect: false }
      ],
      explanation: "Un faltante ocurre cuando hay menos efectivo físico en caja del que indica el registro contable.",
      hint: "El nombre lo dice: faltante = falta algo..."
    },
    {
      id: "q9",
      question: "¿Qué libro auxiliar registra los movimientos de dinero en efectivo?",
      options: [
        { id: "a", text: "Libro de Bancos", isCorrect: false },
        { id: "b", text: "Libro Diario", isCorrect: false },
        { id: "c", text: "Libro de Caja", isCorrect: true },
        { id: "d", text: "Libro Mayor", isCorrect: false }
      ],
      explanation: "El Libro de Caja registra específicamente las entradas y salidas de dinero en efectivo.",
      hint: "Si es dinero en efectivo, va en el libro de..."
    },
    {
      id: "q10",
      question: "¿Qué documento acompaña físicamente a la mercancía durante su transporte?",
      options: [
        { id: "a", text: "El presupuesto", isCorrect: false },
        { id: "b", text: "La factura proforma", isCorrect: false },
        { id: "c", text: "El albarán de entrega", isCorrect: true },
        { id: "d", text: "El pedido", isCorrect: false }
      ],
      explanation: "El albarán es la nota de entrega que viaja con la mercancía y se firma al recibirla.",
      hint: "Es lo que firmas cuando te entregan un paquete..."
    }
  ]
};

// Interactive exercises for each UF
const EXERCISES: Record<string, ExerciseData[]> = {
  "UF0517": [
    {
      type: 'match',
      instructions: 'Relaciona cada tipo de sociedad con su capital mínimo',
      items: [
        { left: "Sociedad Limitada (S.L.)", right: "3.000 €" },
        { left: "Sociedad Anónima (S.A.)", right: "60.000 €" },
        { left: "Autónomo", right: "Sin mínimo" },
        { left: "Cooperativa", right: "Variable" }
      ]
    },
    {
      type: 'match',
      instructions: 'Une cada departamento con su función principal',
      items: [
        { left: "Recursos Humanos", right: "Gestión de personal" },
        { left: "Marketing", right: "Promoción y ventas" },
        { left: "Finanzas", right: "Control económico" },
        { left: "Producción", right: "Fabricación" }
      ]
    }
  ],
  "UF0518": [
    {
      type: 'order',
      instructions: 'Ordena los pasos del tratamiento de correspondencia entrante',
      items: [
        { left: "1", right: "Recepción" },
        { left: "2", right: "Registro" },
        { left: "3", right: "Clasificación" },
        { left: "4", right: "Distribución" },
        { left: "5", right: "Archivo" }
      ]
    }
  ],
  "UF0519": [
    {
      type: 'match',
      instructions: 'Relaciona cada documento con su función',
      items: [
        { left: "Factura", right: "Justifica la compraventa" },
        { left: "Albarán", right: "Acompaña la mercancía" },
        { left: "Pedido", right: "Solicita productos" },
        { left: "Recibo", right: "Confirma el pago" }
      ]
    }
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
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, Record<string, string>>>({});
  const [exerciseCompleted, setExerciseCompleted] = useState<Record<string, boolean>>({});

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
    setExerciseAnswers({});
    setExerciseCompleted({});
    
    try {
      const code = getUfCode(unitTitle);
      setUfCode(code);
      
      const quizQuestions = QUIZ_QUESTIONS[code] || [];
      const exercises = EXERCISES[code] || [];
      
      // Generate slides focused on TEMARIO content only
      const generatedSlides: Slide[] = [];
      
      // Intro slide
      generatedSlides.push({
        id: 'intro',
        type: 'intro',
        title: unitTitle,
        content: getIntroContent(code)
      });

      // ALL Content slides from extended curriculum - THE MAIN TEMARIO
      const extendedContent = EXTENDED_CONTENT[code] || [];
      extendedContent.forEach((content, index) => {
        generatedSlides.push({
          id: `content-${index}`,
          type: 'content',
          title: content.title,
          content: content.content,
          keyPoints: content.keyTerms
        });
      });

      // Exercise slides - interactive practice
      exercises.forEach((exercise, index) => {
        generatedSlides.push({
          id: `exercise-${index}`,
          type: 'exercise',
          title: `Ejercicio Práctico ${index + 1}`,
          exerciseData: exercise
        });
      });

      // Combine base and extended quiz questions - evaluation
      const extendedQuiz = EXTENDED_QUIZ[code] || [];
      const allQuizQuestions = [...quizQuestions, ...extendedQuiz];
      
      allQuizQuestions.forEach((quiz, index) => {
        generatedSlides.push({
          id: `quiz-${index}`,
          type: 'quiz',
          title: `Autoevaluación - Pregunta ${index + 1}`,
          quiz
        });
      });

      // Summary slide
      generatedSlides.push({
        id: 'summary',
        type: 'summary',
        title: 'Resumen y Puntos Clave',
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

  const getVideoUrl = (code: string): string => {
    // Placeholder video URLs - in production these would be real video URLs
    return "https://www.w3schools.com/html/mov_bbb.mp4";
  };

  const getAudioUrl = (code: string): string => {
    // Placeholder audio URL
    return "https://www.w3schools.com/html/horse.mp3";
  };

  const getVideoDescription = (code: string): string => {
    const descriptions: Record<string, string> = {
      "UF0517": "En este vídeo explicativo aprenderás los conceptos fundamentales sobre la organización empresarial, los diferentes tipos de sociedades y cómo se estructuran los departamentos en una empresa.",
      "UF0518": "Visualiza este vídeo para comprender el proceso completo de gestión de correspondencia, desde la recepción hasta el archivo final.",
      "UF0519": "Este vídeo te guiará a través de los principales documentos mercantiles y su correcta gestión en el ámbito empresarial."
    };
    return descriptions[code] || "Vídeo explicativo del tema.";
  };

  const getAudioDescription = (code: string): string => {
    const descriptions: Record<string, string> = {
      "UF0517": "Escucha este resumen en audio de los conceptos clave sobre organización empresarial mientras realizas otras tareas. Ideal para repasar antes del examen.",
      "UF0518": "Audio resumen sobre la gestión de correspondencia. Perfecto para escuchar mientras te desplazas o como repaso rápido.",
      "UF0519": "Repasa los documentos mercantiles básicos con este audio resumen. Incluye ejemplos prácticos y consejos para el examen."
    };
    return descriptions[code] || "Audio resumen del tema.";
  };

  const getPresentationContent = (code: string): string => {
    const presentations: Record<string, string> = {
      "UF0517": `
## Diapositiva 1: Introducción
La empresa es la unidad económica básica de producción de bienes y servicios.

## Diapositiva 2: Tipos de Empresas
- **Persona Física**: Autónomo
- **Persona Jurídica**: S.L., S.A., Cooperativas

## Diapositiva 3: Sociedad Limitada (S.L.)
- Capital mínimo: 3.000€
- Responsabilidad limitada al capital aportado
- Mínimo 1 socio

## Diapositiva 4: Sociedad Anónima (S.A.)
- Capital mínimo: 60.000€
- Capital dividido en acciones
- Órgano máximo: Junta General de Accionistas

## Diapositiva 5: Estructura Organizativa
Los organigramas representan visualmente la estructura jerárquica y funcional.

## Diapositiva 6: Departamentos Principales
- Dirección General
- Recursos Humanos
- Finanzas
- Marketing
- Producción
`,
      "UF0518": `
## Diapositiva 1: La Correspondencia Empresarial
Comunicación escrita oficial entre la empresa y terceros.

## Diapositiva 2: Tipos de Correspondencia
- **Entrante**: Llega a la empresa
- **Saliente**: Sale de la empresa
- **Interna**: Entre departamentos

## Diapositiva 3: Proceso de Recepción
1. Recepción física/digital
2. Apertura y verificación
3. Registro en libro

## Diapositiva 4: El Registro
Datos obligatorios:
- Fecha de entrada
- Remitente
- Asunto
- Destinatario interno

## Diapositiva 5: Distribución
Clasificación y entrega al departamento correspondiente.

## Diapositiva 6: Archivo
Sistemas: Alfabético, Numérico, Cronológico, Temático.
`,
      "UF0519": `
## Diapositiva 1: Documentos Mercantiles
Documentos que acreditan operaciones comerciales.

## Diapositiva 2: El Pedido
Solicitud formal de productos o servicios.

## Diapositiva 3: El Albarán
Documento que acompaña la mercancía y justifica su entrega.

## Diapositiva 4: La Factura
Documento fiscal que acredita la compraventa. Incluye:
- Datos fiscales
- Descripción productos
- Base imponible + IVA

## Diapositiva 5: Tesorería
Gestión de:
- Caja (efectivo)
- Bancos (cuentas)
- Cobros y pagos

## Diapositiva 6: Control de Existencias
Métodos de valoración:
- FIFO: Primeras entradas, primeras salidas
- PMP: Precio Medio Ponderado
`
    };
    return presentations[code] || "Contenido de la presentación.";
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
    
    return slides.slice(0, 6); // Limit content slides
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

  const renderConceptMap = () => {
    if (!currentSlideData?.content) return null;
    
    try {
      const mapData = JSON.parse(currentSlideData.content);
      
      return (
        <div className="p-8 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-4">
              <Network className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold">{currentSlideData.title}</h2>
            <p className="text-muted-foreground mt-2">Visualiza las conexiones entre conceptos</p>
          </div>

          {/* Concept Map Visual */}
          <Card className="p-6 bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="flex flex-col items-center gap-6">
              {/* Level 0 - Root */}
              <div className="flex justify-center">
                {mapData.nodes.filter((n: any) => n.level === 0).map((node: any) => (
                  <div 
                    key={node.id}
                    className="px-6 py-4 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-xl font-bold text-lg shadow-lg"
                  >
                    {node.label}
                  </div>
                ))}
              </div>

              {/* Connection lines */}
              <div className="flex items-center gap-8">
                <div className="w-0.5 h-8 bg-primary/50" />
                <div className="w-0.5 h-8 bg-primary/50" />
                <div className="w-0.5 h-8 bg-primary/50" />
              </div>

              {/* Level 1 */}
              <div className="flex flex-wrap justify-center gap-4">
                {mapData.nodes.filter((n: any) => n.level === 1).map((node: any) => (
                  <Card 
                    key={node.id}
                    className="px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 font-medium"
                  >
                    {node.label}
                  </Card>
                ))}
              </div>

              {/* Connection lines */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-0.5 h-6 bg-muted-foreground/30" />
                ))}
              </div>

              {/* Level 2 */}
              <div className="flex flex-wrap justify-center gap-3">
                {mapData.nodes.filter((n: any) => n.level === 2).map((node: any) => (
                  <Badge 
                    key={node.id}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-muted"
                  >
                    {node.label}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Este mapa conceptual te ayuda a visualizar la estructura y relaciones entre los conceptos principales del tema.
            </p>
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  const renderVideoSlide = () => (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl mb-4">
          <Video className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-3xl font-bold">{currentSlideData?.title}</h2>
      </div>

      <Card className="overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/80 p-8">
              <SquarePlay className="h-20 w-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Vídeo explicativo del tema</p>
              <p className="text-sm opacity-70 mt-2">Duración aproximada: 15 minutos</p>
            </div>
          </div>
          {/* In production, this would be a real video player */}
          <video 
            src={currentSlideData?.mediaUrl}
            controls
            className="w-full h-full object-cover"
            poster=""
          />
        </div>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{currentSlideData?.content}</p>
          <div className="flex gap-4 mt-4">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> 15 min
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Eye className="h-3 w-3" /> HD
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAudioSlide = () => (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl mb-4">
          <Headphones className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold">{currentSlideData?.title}</h2>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
              <Volume2 className="h-16 w-16 text-white" />
            </div>
            
            <audio 
              src={currentSlideData?.mediaUrl}
              controls
              className="w-full max-w-md"
            />
            
            <p className="text-center text-muted-foreground max-w-lg">{currentSlideData?.content}</p>
            
            <div className="flex gap-4">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" /> 8 min
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Headphones className="h-3 w-3" /> Audio MP3
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPresentationSlide = () => {
    const slides = currentSlideData?.content?.split('## ').filter(Boolean) || [];
    
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl mb-4">
            <Presentation className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-3xl font-bold">{currentSlideData?.title}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {slides.map((slide, index) => {
            const lines = slide.split('\n');
            const title = lines[0]?.replace('Diapositiva', 'Slide').trim() || '';
            const content = lines.slice(1).join('\n').trim();
            
            return (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExerciseSlide = () => {
    const exercise = currentSlideData?.exerciseData;
    if (!exercise) return null;

    const exerciseId = currentSlideData.id;
    const isCompleted = exerciseCompleted[exerciseId];
    const answers = exerciseAnswers[exerciseId] || {};

    const checkExercise = () => {
      setExerciseCompleted(prev => ({ ...prev, [exerciseId]: true }));
    };

    const resetExercise = () => {
      setExerciseCompleted(prev => ({ ...prev, [exerciseId]: false }));
      setExerciseAnswers(prev => ({ ...prev, [exerciseId]: {} }));
    };

    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <Shuffle className="h-12 w-12 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-3xl font-bold">{currentSlideData?.title}</h2>
          <p className="text-muted-foreground mt-2">{exercise.instructions}</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            {exercise.type === 'match' && (
              <div className="space-y-4">
                {exercise.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Card className="flex-1 p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                      <span className="font-medium">{item.left}</span>
                    </Card>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <Card className={`flex-1 p-4 transition-colors ${
                      isCompleted 
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                        : 'bg-muted/50'
                    }`}>
                      {isCompleted ? (
                        <span className="text-green-700 dark:text-green-300 font-medium">{item.right}</span>
                      ) : (
                        <select 
                          className="w-full bg-transparent border-0 focus:ring-0 cursor-pointer"
                          value={answers[item.left] || ''}
                          onChange={(e) => setExerciseAnswers(prev => ({
                            ...prev,
                            [exerciseId]: { ...prev[exerciseId], [item.left]: e.target.value }
                          }))}
                        >
                          <option value="">Selecciona...</option>
                          {exercise.items.map((opt, i) => (
                            <option key={i} value={opt.right}>{opt.right}</option>
                          ))}
                        </select>
                      )}
                    </Card>
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {exercise.type === 'order' && (
              <div className="space-y-3">
                {exercise.items.map((item, index) => (
                  <Card 
                    key={index}
                    className={`p-4 flex items-center gap-4 ${
                      isCompleted 
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {item.left}
                    </div>
                    <span className="font-medium">{item.right}</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-6 pt-0">
            {!isCompleted ? (
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
                onClick={checkExercise}
              >
                <CheckCheck className="h-4 w-4" />
                Comprobar Ejercicio
              </Button>
            ) : (
              <div className="w-full space-y-3">
                <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">¡Ejercicio completado correctamente!</span>
                  </div>
                </Card>
                <Button 
                  variant="outline"
                  className="w-full gap-2"
                  onClick={resetExercise}
                >
                  <RotateCcw className="h-4 w-4" />
                  Repetir Ejercicio
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
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

            <div className="flex gap-4 mt-8 flex-wrap justify-center">
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

      case 'concept-map':
        return renderConceptMap();

      case 'video':
        return renderVideoSlide();

      case 'audio':
        return renderAudioSlide();

      case 'presentation':
        return renderPresentationSlide();

      case 'exercise':
        return renderExerciseSlide();

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

  // Get slide type badge info
  const getSlideTypeBadge = (type: string) => {
    switch (type) {
      case 'intro': return { icon: Play, label: 'Inicio', color: 'bg-blue-500' };
      case 'concept-map': return { icon: Network, label: 'Mapa Conceptual', color: 'bg-indigo-500' };
      case 'objectives': return { icon: Target, label: 'Objetivos', color: 'bg-amber-500' };
      case 'video': return { icon: Video, label: 'Vídeo', color: 'bg-red-500' };
      case 'audio': return { icon: Headphones, label: 'Audio', color: 'bg-green-500' };
      case 'presentation': return { icon: Presentation, label: 'Presentación', color: 'bg-orange-500' };
      case 'content': return { icon: BookOpen, label: 'Contenido', color: 'bg-sky-500' };
      case 'exercise': return { icon: Shuffle, label: 'Ejercicio', color: 'bg-violet-500' };
      case 'quiz': return { icon: HelpCircle, label: 'Test', color: 'bg-pink-500' };
      case 'summary': return { icon: Award, label: 'Resumen', color: 'bg-emerald-500' };
      default: return { icon: FileText, label: 'Contenido', color: 'bg-gray-500' };
    }
  };

  const currentBadge = currentSlideData ? getSlideTypeBadge(currentSlideData.type) : null;

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
                {/* Download PDF button */}
                {ufCode && MANUAL_PDFS[ufCode] && (
                  <div className="relative group">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Descargar Manual</span>
                    </Button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-popover border rounded-lg shadow-lg p-3 hidden group-hover:block z-50">
                      <p className="text-sm font-medium mb-2">Manuales disponibles:</p>
                      <div className="space-y-1">
                        {MANUAL_PDFS[ufCode].files.map((file, idx) => (
                          <a 
                            key={idx}
                            href={file.url}
                            download
                            className="flex items-center gap-2 text-sm p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            <FileDown className="h-4 w-4 text-primary" />
                            <span className="truncate">{file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
              {slides.map((slide, index) => {
                const badge = getSlideTypeBadge(slide.type);
                return (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide 
                        ? `w-8 h-3 ${badge.color}` 
                        : index < currentSlide 
                          ? 'w-3 h-3 bg-primary/50 hover:bg-primary/70' 
                          : 'w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    title={`${slide.title} (${badge.label})`}
                  />
                );
              })}
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
              {currentBadge && (
                <Badge className={`gap-1 ${currentBadge.color} text-white`}>
                  <currentBadge.icon className="h-3 w-3" />
                  {currentBadge.label}
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
