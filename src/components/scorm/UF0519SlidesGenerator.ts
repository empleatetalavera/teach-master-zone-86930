// UF0519 - GESTIÓN AUXILIAR DE DOCUMENTACIÓN ECONÓMICO-ADMINISTRATIVA
// 60+ Comprehensive Interactive Slides based on full PDF content

import { ContentSlide } from './types';

// Extended slide types for more interactivity
export interface ExtendedContentSlide extends ContentSlide {
  accordionItems?: { id: string; title: string; content: string; icon?: string }[];
  flashcards?: { id: string; front: string; back: string }[];
  imageUrl?: string;
  imageCaption?: string;
  highlightBox?: { type: 'info' | 'warning' | 'tip' | 'important'; content: string };
  processSteps?: { step: number; title: string; description: string }[];
}

export const generateUF0519ComprehensiveSlides = (): ExtendedContentSlide[] => [
  // ==================== INTRODUCCIÓN ====================
  {
    id: "uf0519-001",
    type: "intro",
    title: "UF0519 - Gestión Auxiliar de Documentación Económico-Administrativa",
    section: "Introducción",
    content: `# 📋 Gestión Auxiliar de Documentación Económico-Administrativa

Bienvenido a esta **Unidad Formativa** fundamental para el trabajo administrativo profesional.

## 🎯 ¿Qué aprenderás?

La gestión documental constituye una de las funciones más importantes dentro de cualquier organización. Los documentos administrativos son la base de las operaciones comerciales y de gestión.

> **Objetivo General:** Capacitar al alumno para identificar, elaborar y gestionar correctamente los documentos administrativos básicos utilizados en las operaciones comerciales y de personal.`,
    keyTerms: ["Documentación", "Gestión administrativa", "Documentos comerciales"]
  },
  {
    id: "uf0519-002",
    type: "content",
    title: "Estructura del Temario",
    section: "Introducción",
    content: `# 📚 Contenidos de la Unidad Formativa

## 📖 Índice del Temario

1. **Los Documentos Administrativos** en Entidades Públicas y Privadas
2. **Documentos de la Compraventa**: Pedido, Albarán, Factura, Recibo
3. **Documentos de Personal**: Órdenes de trabajo, Nóminas
4. **Otros Documentos**: Instancias, Certificados, Actas, Informes
5. **Gestión de Tesorería**: Cobros, Pagos, Conciliación
6. **Control de Existencias**: Stock, Inventario, Valoración
7. **Operaciones Informáticas**: Sistemas de facturación y nóminas

> **⏱️ Duración estimada:** 30 horas de formación teórico-práctica`,
    keyTerms: ["Temario", "Unidad Formativa", "Contenidos"]
  },

  // ==================== SECCIÓN 1: DOCUMENTOS ADMINISTRATIVOS ====================
  {
    id: "uf0519-003",
    type: "content",
    title: "1.1 ¿Qué es un Documento Administrativo?",
    section: "1. Documentos Administrativos",
    content: `# 📄 Definición de Documento Administrativo

Un **documento administrativo** es cualquier soporte material que contiene información relativa a las actividades de una organización, ya sea pública o privada, y que sirve como prueba de dichas actividades.

## 🔑 Características Esenciales

Los documentos administrativos son **instrumentos fundamentales** para:

- 📝 Dejar constancia escrita de hechos y decisiones
- ⚖️ Servir como prueba legal ante terceros
- 📊 Facilitar el seguimiento y control de operaciones
- 🗂️ Permitir la organización de la información empresarial

> **💡 Recuerda:** Todo documento administrativo debe ser auténtico, íntegro y verificable.`,
    keyTerms: ["Documento administrativo", "Soporte material", "Prueba"]
  },
  {
    id: "uf0519-004",
    type: "table",
    title: "1.2 Elementos de los Documentos",
    section: "1. Documentos Administrativos",
    content: `# 📋 Elementos de los Documentos Administrativos

Todos los documentos administrativos comparten una estructura básica con los siguientes elementos:`,
    tableData: {
      headers: ["Elemento", "Descripción", "Ejemplos"],
      rows: [
        ["📌 Membrete", "Identificación de la entidad emisora", "Logo, nombre empresa, dirección, CIF"],
        ["📅 Fecha", "Momento de emisión del documento", "Día, mes y año completo"],
        ["👤 Destinatario", "Persona o entidad a quien va dirigido", "Nombre, dirección, cargo"],
        ["📝 Cuerpo", "Contenido principal del documento", "Texto informativo, datos, tablas"],
        ["✍️ Firma", "Validación del documento", "Firma manuscrita o digital"],
        ["🔢 Registro", "Número identificativo único", "Nº de registro, referencia, código"]
      ]
    },
    keyTerms: ["Membrete", "Destinatario", "Registro"]
  },
  {
    id: "uf0519-005",
    type: "content",
    title: "1.3 Funciones de los Documentos",
    section: "1. Documentos Administrativos",
    content: `# 🎯 Funciones de los Documentos Administrativos

Los documentos administrativos cumplen **cinco funciones esenciales**:

## 1️⃣ Función Probatoria
Constituyen **prueba de hechos**, actos o situaciones. Son evidencia documental.

## 2️⃣ Función Informativa
**Transmiten datos e información** entre las partes involucradas.

## 3️⃣ Función de Control
Permiten el **seguimiento y verificación** de operaciones realizadas.

## 4️⃣ Función Jurídica
Generan **derechos y obligaciones** para las partes firmantes.

## 5️⃣ Función Contable
Sirven de **base para los registros contables** y fiscales.

> **⚠️ Importante:** Un documento puede cumplir varias funciones simultáneamente. Por ejemplo, una factura tiene función probatoria, contable y jurídica.`,
    keyTerms: ["Función probatoria", "Función jurídica", "Función contable"]
  },
  {
    id: "uf0519-006",
    type: "checklist",
    title: "1.4 Características de los Documentos",
    section: "1. Documentos Administrativos",
    content: `# ✅ Características que debe cumplir todo Documento Administrativo

Marca las características que consideres esenciales para un documento válido:`,
    checklistItems: [
      { id: "c1", text: "AUTENTICIDAD: Debe poder verificarse como genuino y original", checked: false },
      { id: "c2", text: "INTEGRIDAD: Debe estar completo, sin alteraciones ni tachaduras", checked: false },
      { id: "c3", text: "FIABILIDAD: Debe reflejar fielmente los hechos que documenta", checked: false },
      { id: "c4", text: "DISPONIBILIDAD: Debe poder localizarse y recuperarse cuando se necesite", checked: false },
      { id: "c5", text: "CONFIDENCIALIDAD: Algunos deben protegerse de accesos no autorizados", checked: false },
      { id: "c6", text: "LEGIBILIDAD: El contenido debe poder leerse claramente", checked: false }
    ],
    keyTerms: ["Autenticidad", "Integridad", "Fiabilidad"]
  },
  {
    id: "uf0519-007",
    type: "table",
    title: "1.5 Clasificación por Origen",
    section: "1. Documentos Administrativos",
    content: `# 📊 Clasificación de Documentos según su Origen`,
    tableData: {
      headers: ["Tipo", "Descripción", "Ejemplos Típicos"],
      rows: [
        ["📁 Internos", "Generados y utilizados DENTRO de la organización", "Memorándums, informes internos, órdenes de trabajo"],
        ["📤 Externos", "Intercambiados con OTRAS entidades", "Facturas, contratos, cartas comerciales"],
        ["📥 Recibidos", "Documentos que ENTRAN en la organización", "Pedidos de clientes, facturas de proveedores"],
        ["📨 Emitidos", "Documentos que SALEN de la organización", "Presupuestos, albaranes, facturas emitidas"]
      ]
    },
    keyTerms: ["Documentos internos", "Documentos externos"]
  },
  {
    id: "uf0519-008",
    type: "table",
    title: "1.6 Clasificación por Función",
    section: "1. Documentos Administrativos",
    content: `# 📑 Clasificación de Documentos según su Función`,
    tableData: {
      headers: ["Categoría", "Función Principal", "Documentos Típicos"],
      rows: [
        ["🛒 Comerciales", "Operaciones de compraventa", "Pedidos, albaranes, facturas, presupuestos"],
        ["💰 Contables", "Registro de operaciones económicas", "Asientos, balances, libros contables"],
        ["👥 Laborales", "Gestión del personal", "Nóminas, contratos, partes de alta/baja"],
        ["🏛️ Oficiales", "Relación con Administración Pública", "Instancias, certificados, declaraciones"],
        ["📋 Organizativos", "Funcionamiento interno", "Actas, informes, memorias, circulares"]
      ]
    },
    keyTerms: ["Documentos comerciales", "Documentos laborales", "Documentos oficiales"]
  },
  {
    id: "uf0519-009",
    type: "quiz",
    title: "📝 Test: Documentos Administrativos",
    section: "1. Documentos Administrativos",
    content: "Evalúa tu comprensión sobre los conceptos básicos de documentos administrativos.",
    quiz: {
      id: "quiz-001",
      question: "¿Cuál de las siguientes NO es una función de los documentos administrativos?",
      options: [
        { id: "a", text: "Función probatoria", isCorrect: false },
        { id: "b", text: "Función decorativa", isCorrect: true },
        { id: "c", text: "Función contable", isCorrect: false },
        { id: "d", text: "Función jurídica", isCorrect: false }
      ],
      explanation: "Las cinco funciones de los documentos son: probatoria, informativa, de control, jurídica y contable. La 'función decorativa' no existe ya que los documentos tienen siempre un propósito práctico.",
      hint: "Piensa en para qué sirve realmente un documento en una empresa."
    },
    keyTerms: ["Funciones", "Documentos administrativos"]
  },
  {
    id: "uf0519-010",
    type: "table",
    title: "1.7 Métodos de Registro de Documentos",
    section: "1. Documentos Administrativos",
    content: `# 📝 Sistemas de Registro de Documentos

El registro de documentos es fundamental para su control y seguimiento:`,
    tableData: {
      headers: ["Tipo de Registro", "Descripción", "Información Registrada"],
      rows: [
        ["📥 Libro de Entrada", "Registra documentos RECIBIDOS", "Fecha, remitente, asunto, destino interno"],
        ["📤 Libro de Salida", "Registra documentos EMITIDOS", "Fecha, destinatario, asunto, referencia"],
        ["📋 Registro General", "Registra TODOS los documentos", "Número correlativo, tipo, fecha, resumen"],
        ["💻 Registro Digital", "En sistemas informáticos", "Metadatos, archivo digital, historial, accesos"]
      ]
    },
    keyTerms: ["Libro de entrada", "Libro de salida", "Registro digital"]
  },
  {
    id: "uf0519-011",
    type: "content",
    title: "1.8 Normas de Elaboración",
    section: "1. Documentos Administrativos",
    content: `# ✍️ Normativa Básica para la Elaboración de Documentos

La elaboración de documentos administrativos debe seguir estas **normas fundamentales**:

## 📏 Reglas de Redacción

| Norma | Descripción |
|-------|-------------|
| **Claridad** | Redacción comprensible y sin ambigüedades |
| **Concisión** | Información necesaria sin redundancias |
| **Corrección** | Sin errores gramaticales ni ortográficos |
| **Coherencia** | Estructura lógica y organizada |
| **Formalidad** | Tono apropiado según el tipo de documento |
| **Normalización** | Uso de formatos estandarizados |

> **💡 Consejo Práctico:** Antes de enviar cualquier documento, revísalo al menos una vez para detectar posibles errores. Una segunda lectura puede evitar problemas futuros.`,
    keyTerms: ["Claridad", "Concisión", "Normalización"]
  },

  // ==================== SECCIÓN 2: DOCUMENTOS DE COMPRAVENTA ====================
  {
    id: "uf0519-012",
    type: "content",
    title: "2.1 El Ciclo de la Compraventa",
    section: "2. Documentos de Compraventa",
    content: `# 🔄 El Ciclo Documental de la Compraventa

Todo proceso de compraventa genera una secuencia de documentos que reflejan cada fase de la operación:

## 📋 Secuencia Documental

\`\`\`
PEDIDO → ALBARÁN → FACTURA → RECIBO/PAGO
\`\`\`

### Cada documento tiene su función:

1. **PEDIDO**: El comprador solicita los productos/servicios
2. **ALBARÁN**: Acompaña a la mercancía en la entrega
3. **FACTURA**: Refleja la operación y genera obligación de pago
4. **RECIBO**: Acredita que el pago se ha realizado

> **⚠️ Importante:** Cada documento debe concordar con los anteriores. Las discrepancias entre pedido, albarán y factura pueden generar conflictos comerciales.`,
    keyTerms: ["Ciclo compraventa", "Pedido", "Factura"]
  },
  {
    id: "uf0519-013",
    type: "content",
    title: "2.2 El Pedido - Definición",
    section: "2. Documentos de Compraventa",
    content: `# 📦 El Pedido

El **pedido** es el documento mediante el cual el comprador solicita al vendedor el suministro de determinados bienes o servicios.

## 🎯 Finalidad del Pedido

- Formalizar la **solicitud de compra**
- Establecer las **condiciones acordadas**
- Servir de **referencia** para documentos posteriores
- Crear un **compromiso** entre comprador y vendedor

## ✅ Requisitos Esenciales

Para que un pedido sea válido debe contener:

- Identificación clara del comprador y vendedor
- Descripción precisa de los productos/servicios
- Cantidades exactas solicitadas
- Fecha de entrega deseada
- Lugar de entrega acordado
- Firma o autorización del responsable

> **💡 Tip:** Un pedido bien elaborado evita malentendidos y facilita la gestión de toda la operación comercial.`,
    keyTerms: ["Pedido", "Solicitud de compra", "Requisitos"]
  },
  {
    id: "uf0519-014",
    type: "table",
    title: "2.3 Elementos del Pedido",
    section: "2. Documentos de Compraventa",
    content: `# 📋 Elementos que debe contener un Pedido`,
    tableData: {
      headers: ["Elemento", "Descripción", "¿Obligatorio?"],
      rows: [
        ["🏢 Datos del comprador", "Nombre, dirección, CIF, persona de contacto", "Sí"],
        ["🏭 Datos del vendedor", "Nombre, dirección, CIF", "Sí"],
        ["🔢 Número de pedido", "Referencia única para identificación", "Sí"],
        ["📅 Fecha de emisión", "Fecha en que se realiza el pedido", "Sí"],
        ["📝 Descripción productos", "Detalle de lo solicitado (código, nombre)", "Sí"],
        ["🔢 Cantidades", "Unidades de cada producto", "Sí"],
        ["💶 Precios unitarios", "Precio por unidad (si se conoce)", "Recomendable"],
        ["🚚 Condiciones entrega", "Lugar, fecha y forma de entrega", "Sí"],
        ["💳 Condiciones de pago", "Forma y plazo de pago acordados", "Sí"],
        ["✍️ Firma autorizada", "Del responsable de compras", "Sí"]
      ]
    },
    keyTerms: ["Elementos del pedido", "Condiciones de entrega", "Condiciones de pago"]
  },
  {
    id: "uf0519-015",
    type: "table",
    title: "2.4 Clases de Pedidos",
    section: "2. Documentos de Compraventa",
    content: `# 📊 Tipos de Pedidos según su Forma`,
    tableData: {
      headers: ["Tipo de Pedido", "Descripción", "Cuándo se utiliza"],
      rows: [
        ["📞 Verbal", "Por teléfono o en persona", "Pedidos urgentes, confianza mutua, pequeñas cantidades"],
        ["✉️ Escrito", "Mediante carta, formulario o impreso", "Operaciones formales, necesidad de constancia"],
        ["💻 Electrónico", "Por correo electrónico o plataforma online", "Operaciones habituales, agilidad en la gestión"],
        ["📋 Programado", "Acordado previamente con entregas periódicas", "Suministros regulares (materias primas, consumibles)"],
        ["⚡ Urgente", "Con necesidad de entrega inmediata", "Situaciones excepcionales, roturas de stock"]
      ]
    },
    keyTerms: ["Pedido verbal", "Pedido electrónico", "Pedido programado"]
  },
  {
    id: "uf0519-016",
    type: "content",
    title: "2.5 Proceso del Pedido",
    section: "2. Documentos de Compraventa",
    content: `# 🔄 Proceso Completo de Gestión del Pedido

Desde que surge la necesidad hasta que se recibe la mercancía:

## 📋 Fases del Proceso

### 1️⃣ EMISIÓN
El departamento de compras elabora el pedido según las necesidades detectadas.

### 2️⃣ RECEPCIÓN
El vendedor recibe el pedido y verifica su contenido.

### 3️⃣ COMPROBACIÓN
Se comprueba la disponibilidad de productos, precios y condiciones.

### 4️⃣ CONFIRMACIÓN
El vendedor confirma la aceptación del pedido al comprador.

### 5️⃣ PREPARACIÓN
Se prepara la mercancía para su envío según las especificaciones.

### 6️⃣ EXPEDICIÓN
Se envía la mercancía acompañada del correspondiente albarán.

> **⚠️ Atención:** Cualquier incidencia en alguna de estas fases debe comunicarse inmediatamente entre las partes.`,
    keyTerms: ["Proceso del pedido", "Expedición", "Confirmación"]
  },
  {
    id: "uf0519-017",
    type: "quiz",
    title: "📝 Test: El Pedido",
    section: "2. Documentos de Compraventa",
    content: "Comprueba tus conocimientos sobre el documento de pedido.",
    quiz: {
      id: "quiz-002",
      question: "¿Qué tipo de pedido se utiliza para suministros regulares con entregas periódicas acordadas?",
      options: [
        { id: "a", text: "Pedido urgente", isCorrect: false },
        { id: "b", text: "Pedido programado", isCorrect: true },
        { id: "c", text: "Pedido verbal", isCorrect: false },
        { id: "d", text: "Pedido electrónico", isCorrect: false }
      ],
      explanation: "El PEDIDO PROGRAMADO se utiliza cuando existe un acuerdo previo para realizar entregas periódicas de productos. Es muy común para materias primas o consumibles de uso habitual.",
      hint: "Piensa en cómo una fábrica pide regularmente las materias primas que necesita."
    },
    keyTerms: ["Pedido programado"]
  },
  {
    id: "uf0519-018",
    type: "content",
    title: "2.6 El Albarán - Definición",
    section: "2. Documentos de Compraventa",
    content: `# 📋 El Albarán o Nota de Entrega

El **albarán** es el documento que acompaña a la mercancía en su entrega y que justifica la recepción de los bienes por parte del comprador.

## 🎯 Funciones Principales del Albarán

| Función | Descripción |
|---------|-------------|
| **Control** | Verificar que se entrega exactamente lo pedido |
| **Probatoria** | Acreditar que la entrega se ha producido |
| **Contable** | Servir de base para la posterior emisión de facturas |
| **Reclamación** | Documento de referencia para posibles incidencias |

## ✅ Características Importantes

- Se emite **por duplicado** como mínimo (vendedor y comprador)
- Debe incluir espacio para la **firma de conformidad**
- Permite anotar **incidencias** (mercancía dañada, faltante, etc.)
- Debe **correlacionarse** con el número de pedido original`,
    keyTerms: ["Albarán", "Nota de entrega", "Conformidad"]
  },
  {
    id: "uf0519-019",
    type: "table",
    title: "2.7 Elementos del Albarán",
    section: "2. Documentos de Compraventa",
    content: `# 📦 Elementos que debe contener un Albarán`,
    tableData: {
      headers: ["Elemento", "Descripción", "Observaciones"],
      rows: [
        ["🏭 Datos del vendedor", "Identificación completa de quien entrega", "Nombre, CIF, dirección, teléfono"],
        ["🏢 Datos del comprador", "Identificación y dirección de entrega", "Puede diferir de la dirección fiscal"],
        ["🔢 Número de albarán", "Referencia única correlativa", "Permite el seguimiento del documento"],
        ["📅 Fecha de entrega", "Día de la entrega efectiva", "Importante para plazos y garantías"],
        ["🔗 Referencia del pedido", "Número del pedido correspondiente", "Vincula albarán con pedido original"],
        ["📝 Descripción productos", "Detalle de los bienes entregados", "Código, descripción, unidad de medida"],
        ["🔢 Cantidades", "Unidades efectivamente entregadas", "Pueden diferir de las pedidas"],
        ["✍️ Firma del receptor", "Conformidad de recepción", "Con DNI, sello de empresa o firma"]
      ]
    },
    keyTerms: ["Elementos del albarán", "Firma del receptor", "Conformidad"]
  },
  {
    id: "uf0519-020",
    type: "content",
    title: "2.8 Gestión de Incidencias en la Entrega",
    section: "2. Documentos de Compraventa",
    content: `# ⚠️ Incidencias en la Recepción de Mercancías

Es fundamental saber actuar ante problemas en la recepción:

## 📋 Tipos de Incidencias Comunes

| Incidencia | Acción a realizar |
|------------|-------------------|
| **Mercancía dañada** | Anotar en el albarán, fotografiar, reclamar |
| **Cantidad incorrecta** | Indicar diferencia, firmar "con reservas" |
| **Producto erróneo** | Rechazar o anotar, contactar con proveedor |
| **Entrega tardía** | Registrar fecha real, aplicar penalizaciones si procede |

## ✅ Buenas Prácticas

1. **SIEMPRE** revisar la mercancía ANTES de firmar
2. Si hay dudas, firmar **"PENDIENTE DE REVISIÓN"**
3. Anotar **cualquier anomalía** visible en el albarán
4. Guardar una **copia del albarán** con las anotaciones
5. Comunicar incidencias **inmediatamente** al proveedor

> **💡 Importante:** Una vez firmado el albarán sin reservas, será más difícil reclamar por defectos o faltas.`,
    keyTerms: ["Incidencias", "Reclamación", "Firma con reservas"]
  },
  {
    id: "uf0519-021",
    type: "content",
    title: "2.9 La Factura - Definición",
    section: "2. Documentos de Compraventa",
    content: `# 🧾 La Factura

La **factura** es el documento mercantil que refleja toda la información de una operación de compraventa y que genera obligaciones de pago.

## 📜 Marco Legal

La facturación en España está regulada por:
- **Reglamento de Facturación** (RD 1619/2012)
- **Ley General Tributaria**
- **Normativa del IVA**

## 🎯 Funciones de la Factura

1. **Función fiscal**: Documento para declaraciones de IVA e IRPF
2. **Función contable**: Base para registros en contabilidad
3. **Función probatoria**: Prueba de la operación comercial
4. **Función de cobro**: Genera derecho a reclamar el pago

> **⚠️ Atención:** La emisión de facturas es OBLIGATORIA para empresarios y profesionales en la mayoría de las operaciones.`,
    keyTerms: ["Factura", "Documento mercantil", "IVA"]
  },
  {
    id: "uf0519-022",
    type: "table",
    title: "2.10 Elementos Obligatorios de la Factura",
    section: "2. Documentos de Compraventa",
    content: `# 📋 Requisitos Legales de la Factura

Según la normativa de facturación española, toda factura debe contener:`,
    tableData: {
      headers: ["Elemento", "Descripción", "Ejemplo"],
      rows: [
        ["🔢 Serie y número", "Numeración correlativa única", "FA-2024/00125"],
        ["📅 Fecha de expedición", "Fecha de emisión", "15/01/2024"],
        ["🏭 NIF del expedidor", "Número de Identificación Fiscal", "B12345678"],
        ["🏢 NIF del destinatario", "En facturas > 100€", "A87654321"],
        ["📍 Domicilio partes", "Dirección fiscal de ambos", "C/ Principal 15, Madrid"],
        ["📝 Descripción operaciones", "Detalle de bienes/servicios", "Ordenador portátil HP 15\""],
        ["💶 Base imponible por tipo", "Importe antes de IVA, por tipo", "Base 21%: 800,00 €"],
        ["📊 Tipo impositivo", "Porcentaje de IVA aplicado", "21%"],
        ["💰 Cuota tributaria", "Importe del IVA", "168,00 €"],
        ["💵 Importe total", "Cantidad total a pagar", "968,00 €"]
      ]
    },
    keyTerms: ["Elementos factura", "Base imponible", "Cuota tributaria"]
  },
  {
    id: "uf0519-023",
    type: "table",
    title: "2.11 Tipos de Facturas",
    section: "2. Documentos de Compraventa",
    content: `# 📑 Clasificación de los Tipos de Facturas`,
    tableData: {
      headers: ["Tipo", "Características", "Cuándo se usa"],
      rows: [
        ["📄 Ordinaria", "Documento completo con todos los requisitos legales", "Operaciones habituales entre empresas"],
        ["🧾 Simplificada", "Menos requisitos, antes llamada 'ticket'", "Operaciones < 400€ o particulares"],
        ["🔧 Rectificativa", "Corrige errores de una factura anterior", "Errores, devoluciones, descuentos posteriores"],
        ["📋 Recapitulativa", "Agrupa varias operaciones del mismo período", "Clientes con operaciones frecuentes"],
        ["📝 Proforma", "Documento previo SIN validez fiscal", "Presupuestos, operaciones de importación"],
        ["💻 Electrónica", "Formato digital con firma electrónica", "Obligatoria con la Administración Pública"]
      ]
    },
    keyTerms: ["Factura ordinaria", "Factura simplificada", "Factura rectificativa", "Factura electrónica"]
  },
  {
    id: "uf0519-024",
    type: "content",
    title: "2.12 Tipos de IVA en España",
    section: "2. Documentos de Compraventa",
    content: `# 💶 Los Tipos de IVA en España

El Impuesto sobre el Valor Añadido (IVA) tiene tres tipos impositivos:

## 📊 Tipos de IVA vigentes

| Tipo | Porcentaje | Se aplica a... |
|------|------------|----------------|
| **General** | 21% | La mayoría de productos y servicios |
| **Reducido** | 10% | Alimentos, transporte, hostelería, vivienda |
| **Superreducido** | 4% | Pan, leche, frutas, libros, medicamentos |

## 💡 Ejemplos Prácticos

- **21%**: Ordenadores, ropa, electrodomésticos, servicios profesionales
- **10%**: Restaurantes, hoteles, entradas a espectáculos, agua
- **4%**: Pan común, leche natural, huevos, medicamentos

> **⚠️ Importante:** Existe también el tipo 0% para operaciones exentas (sanidad, educación, seguros) y operaciones intracomunitarias.`,
    keyTerms: ["IVA", "Tipo general", "Tipo reducido", "Tipo superreducido"]
  },
  {
    id: "uf0519-025",
    type: "quiz",
    title: "📝 Test: La Factura",
    section: "2. Documentos de Compraventa",
    content: "Comprueba tus conocimientos sobre la facturación.",
    quiz: {
      id: "quiz-003",
      question: "¿Qué tipo de factura se utiliza para corregir errores de una factura anterior?",
      options: [
        { id: "a", text: "Factura ordinaria", isCorrect: false },
        { id: "b", text: "Factura proforma", isCorrect: false },
        { id: "c", text: "Factura rectificativa", isCorrect: true },
        { id: "d", text: "Factura simplificada", isCorrect: false }
      ],
      explanation: "La FACTURA RECTIFICATIVA se emite para corregir errores en facturas anteriores, aplicar descuentos posteriores a la venta, o reflejar devoluciones de mercancías.",
      hint: "Su nombre indica que sirve para 'rectificar' algo."
    },
    keyTerms: ["Factura rectificativa"]
  },
  {
    id: "uf0519-026",
    type: "checklist",
    title: "2.13 Verificación de Facturas",
    section: "2. Documentos de Compraventa",
    content: `# ✅ Proceso de Verificación de Facturas Recibidas

Antes de registrar y pagar una factura, debemos comprobar:`,
    checklistItems: [
      { id: "v1", text: "Verificar que los datos identificativos (NIF, razón social, dirección) son correctos", checked: false },
      { id: "v2", text: "Comprobar correspondencia con el albarán y pedido originales", checked: false },
      { id: "v3", text: "Revisar que los productos/servicios coinciden con lo acordado", checked: false },
      { id: "v4", text: "Verificar que los precios unitarios son los pactados", checked: false },
      { id: "v5", text: "Comprobar los cálculos (cantidades × precios = subtotales)", checked: false },
      { id: "v6", text: "Verificar que el tipo de IVA aplicado es el correcto", checked: false },
      { id: "v7", text: "Comprobar que el cálculo del IVA es correcto", checked: false },
      { id: "v8", text: "Verificar que las condiciones de pago son las acordadas", checked: false },
      { id: "v9", text: "Registrar la factura en el libro de facturas recibidas", checked: false }
    ],
    keyTerms: ["Verificación factura", "Control facturación"]
  },
  {
    id: "uf0519-027",
    type: "content",
    title: "2.14 El Recibo",
    section: "2. Documentos de Compraventa",
    content: `# 🧾 El Recibo

El **recibo** es el documento que acredita el pago de una cantidad de dinero.

## 📋 Partes del Recibo

| Elemento | Descripción |
|----------|-------------|
| **Número de recibo** | Identificación única correlativa |
| **Fecha** | Fecha en que se realiza el pago |
| **Pagador** | Quien realiza el pago |
| **Receptor** | Quien recibe el pago |
| **Concepto** | Motivo del pago (nº factura, etc.) |
| **Importe** | Cantidad en cifras Y en letras |
| **Firma** | Del receptor del pago |

## 💡 Importancia del Recibo

- Es la **prueba** de que el pago se ha realizado
- Necesario para posibles **reclamaciones** posteriores
- Sirve como **justificante** contable y fiscal

> **⚠️ Consejo:** SIEMPRE solicitar recibo cuando pagues en efectivo. En transferencias, el comprobante bancario hace las veces de recibo.`,
    keyTerms: ["Recibo", "Justificante de pago", "Prueba de pago"]
  },
  {
    id: "uf0519-028",
    type: "content",
    title: "2.15 Domiciliación Bancaria",
    section: "2. Documentos de Compraventa",
    content: `# 🏦 La Domiciliación Bancaria

La **domiciliación bancaria** es un sistema de cobro automático que permite cargar importes directamente en la cuenta del deudor.

## ✅ Ventajas de la Domiciliación

- ⚡ **Automatización** del proceso de cobro
- 📉 **Reducción de impagos** y morosidad
- 💰 **Ahorro** en gestión administrativa
- 🔄 **Comodidad** para ambas partes
- 📊 **Control** de los cobros pendientes

## 📋 Requisitos para Domiciliar

| Requisito | Descripción |
|-----------|-------------|
| **Mandato/Autorización** | Documento firmado por el titular de la cuenta |
| **IBAN** | Código de la cuenta bancaria (ES + 22 dígitos) |
| **Datos del ordenante** | Identificación del cobrador |
| **Concepto e importe** | Especificación del cargo a realizar |

> **💡 Aplicaciones:** Recibos de luz, agua, teléfono, cuotas de préstamos, seguros, suscripciones, etc.`,
    keyTerms: ["Domiciliación", "IBAN", "Cobro automático"]
  },

  // ==================== SECCIÓN 3: DOCUMENTOS DE PERSONAL ====================
  {
    id: "uf0519-029",
    type: "content",
    title: "3.1 Órdenes de Trabajo",
    section: "3. Documentos de Personal",
    content: `# 📋 Órdenes de Trabajo

La **orden de trabajo** es el documento que autoriza y especifica la realización de una tarea o trabajo.

## 🎯 Finalidad

- Formalizar la **asignación de tareas**
- Especificar los **recursos necesarios**
- Establecer **plazos de ejecución**
- Facilitar el **control y seguimiento**

## 📊 Elementos de la Orden de Trabajo

| Elemento | Descripción |
|----------|-------------|
| Número de orden | Identificación única |
| Fecha de emisión | Cuando se genera la orden |
| Departamento emisor | Quien solicita el trabajo |
| Departamento ejecutor | Quien debe realizarlo |
| Descripción del trabajo | Detalle de la tarea |
| Materiales necesarios | Recursos a utilizar |
| Tiempo estimado | Duración prevista |
| Fecha límite | Plazo de ejecución |
| Firma de autorización | Del responsable |`,
    keyTerms: ["Orden de trabajo", "Asignación de tareas", "Control"]
  },
  {
    id: "uf0519-030",
    type: "table",
    title: "3.2 Tipos de Órdenes de Trabajo",
    section: "3. Documentos de Personal",
    content: `# 📑 Clasificación de Órdenes de Trabajo`,
    tableData: {
      headers: ["Tipo", "Descripción", "Ejemplos"],
      rows: [
        ["🏭 De producción", "Para fabricación de productos", "Fabricar 100 unidades del producto X"],
        ["🔧 De mantenimiento", "Para reparaciones y revisiones", "Revisión preventiva de maquinaria"],
        ["👷 De servicio", "Para prestación de servicios", "Instalación de equipos en cliente"],
        ["📋 Internas", "Para tareas administrativas", "Auditoría de documentación"]
      ]
    },
    keyTerms: ["Órdenes de producción", "Órdenes de mantenimiento"]
  },
  {
    id: "uf0519-031",
    type: "content",
    title: "3.3 La Nómina - Definición",
    section: "3. Documentos de Personal",
    content: `# 💼 La Nómina

La **nómina** es el documento que refleja la retribución del trabajador, incluyendo todos los conceptos salariales y las deducciones correspondientes.

## 📜 Marco Legal

El formato de nómina está regulado por:
- **Estatuto de los Trabajadores**
- **Orden Ministerial** de 27/12/1994
- **Convenios colectivos** aplicables

## 🎯 Funciones de la Nómina

1. **Informar** al trabajador sobre su retribución
2. **Justificar** las deducciones aplicadas
3. **Servir de prueba** en caso de conflictos laborales
4. **Base para cotizaciones** a la Seguridad Social
5. **Documento fiscal** para declaraciones de IRPF

> **⏱️ Obligación:** El empresario debe entregar al trabajador recibo de salario (nómina) mensualmente.`,
    keyTerms: ["Nómina", "Retribución", "Recibo de salario"]
  },
  {
    id: "uf0519-032",
    type: "content",
    title: "3.4 Estructura de la Nómina - Encabezamiento",
    section: "3. Documentos de Personal",
    content: `# 📋 Estructura de la Nómina: 1. Encabezamiento

La primera parte de la nómina contiene los **datos identificativos**:

## 🏢 Datos de la Empresa

- Nombre o razón social
- Domicilio fiscal
- CIF (Código de Identificación Fiscal)
- Código de cuenta de cotización a la SS
- Sector de actividad

## 👤 Datos del Trabajador

- Nombre y apellidos
- NIF/NIE
- Número de afiliación a la Seguridad Social
- Categoría profesional
- Grupo de cotización
- Fecha de antigüedad
- Tipo de contrato

## 📅 Período de Liquidación

- Mes y año al que corresponde
- Número de días del período
- Fecha de pago`,
    keyTerms: ["Encabezamiento", "Datos identificativos", "Período de liquidación"]
  },
  {
    id: "uf0519-033",
    type: "table",
    title: "3.5 Estructura de la Nómina - Devengos",
    section: "3. Documentos de Personal",
    content: `# 💰 Estructura de la Nómina: 2. Devengos (Percepciones Salariales)

Los devengos son las cantidades que el trabajador tiene derecho a percibir:`,
    tableData: {
      headers: ["Concepto", "Descripción", "Cotiza a SS"],
      rows: [
        ["💵 Salario base", "Retribución fija por unidad de tiempo", "Sí"],
        ["⏰ Complementos antigüedad", "Por años de servicio en la empresa", "Sí"],
        ["🌙 Plus nocturnidad", "Por trabajo en horario nocturno", "Sí"],
        ["⚠️ Plus peligrosidad", "Por trabajos de riesgo", "Sí"],
        ["🎯 Complementos puesto", "Por características específicas del trabajo", "Sí"],
        ["🏆 Plus productividad", "Por rendimiento o resultados", "Sí"],
        ["⏱️ Horas extraordinarias", "Retribución por horas adicionales", "Sí"],
        ["🎁 Pagas extraordinarias", "Gratificaciones (Navidad, verano)", "Sí (prorrateadas)"]
      ]
    },
    keyTerms: ["Devengos", "Salario base", "Complementos salariales"]
  },
  {
    id: "uf0519-034",
    type: "table",
    title: "3.6 Percepciones No Salariales",
    section: "3. Documentos de Personal",
    content: `# 🎁 Percepciones No Salariales

Conceptos que recibe el trabajador pero que NO forman parte del salario:`,
    tableData: {
      headers: ["Concepto", "Descripción", "Cotiza a SS"],
      rows: [
        ["🏠 Indemnizaciones", "Por traslados, despidos", "No (hasta límites)"],
        ["🍽️ Dietas y gastos", "Compensación de desplazamientos", "No (hasta límites)"],
        ["🚗 Plus de transporte", "Ayuda para desplazamiento al trabajo", "No (hasta límites)"],
        ["💊 Prestaciones SS", "IT, maternidad, paternidad", "No"],
        ["📚 Ayuda formación", "Para estudios del trabajador", "No (hasta límites)"],
        ["👶 Guarderías", "Ayuda para cuidado de hijos", "No (hasta límites)"]
      ]
    },
    keyTerms: ["Percepciones no salariales", "Indemnizaciones", "Dietas"]
  },
  {
    id: "uf0519-035",
    type: "table",
    title: "3.7 Estructura de la Nómina - Deducciones",
    section: "3. Documentos de Personal",
    content: `# ➖ Estructura de la Nómina: 3. Deducciones

Las deducciones son cantidades que se restan del salario bruto:`,
    tableData: {
      headers: ["Concepto", "Porcentaje", "Base de cálculo"],
      rows: [
        ["🏥 Contingencias comunes", "4,70%", "Base de cotización"],
        ["📉 Desempleo (contrato indefinido)", "1,55%", "Base de cotización"],
        ["📉 Desempleo (contrato temporal)", "1,60%", "Base de cotización"],
        ["📚 Formación profesional", "0,10%", "Base de cotización"],
        ["💶 TOTAL SS (aprox.)", "6,35%", "Base de cotización"],
        ["📊 IRPF", "Variable", "Según tablas, situación familiar"]
      ]
    },
    keyTerms: ["Deducciones", "Seguridad Social", "IRPF"]
  },
  {
    id: "uf0519-036",
    type: "content",
    title: "3.8 Cálculo del Líquido a Percibir",
    section: "3. Documentos de Personal",
    content: `# 💵 Cálculo del Líquido a Percibir

El **líquido a percibir** es la cantidad FINAL que el trabajador recibe en su cuenta bancaria.

## 📊 Fórmula de Cálculo

\`\`\`
LÍQUIDO = TOTAL DEVENGOS - TOTAL DEDUCCIONES
\`\`\`

## 📋 Ejemplo Práctico

| Concepto | Importe |
|----------|---------|
| Salario base | 1.400,00 € |
| Plus transporte | 75,00 € |
| Plus antigüedad | 50,00 € |
| **TOTAL DEVENGOS** | **1.525,00 €** |
| Contingencias comunes (4,70%) | -71,68 € |
| Desempleo (1,55%) | -23,64 € |
| Formación (0,10%) | -1,53 € |
| IRPF (12%) | -183,00 € |
| **TOTAL DEDUCCIONES** | **-279,85 €** |
| **LÍQUIDO A PERCIBIR** | **1.245,15 €** |

> **💡 Nota:** El porcentaje de IRPF varía según el salario anual y la situación familiar del trabajador.`,
    keyTerms: ["Líquido a percibir", "Cálculo nómina", "Salario neto"]
  },
  {
    id: "uf0519-037",
    type: "quiz",
    title: "📝 Test: La Nómina",
    section: "3. Documentos de Personal",
    content: "Evalúa tu comprensión sobre la estructura de la nómina.",
    quiz: {
      id: "quiz-004",
      question: "¿Cuál es aproximadamente el porcentaje de cotización a la Seguridad Social que paga el TRABAJADOR?",
      options: [
        { id: "a", text: "Aproximadamente 4%", isCorrect: false },
        { id: "b", text: "Aproximadamente 6,35%", isCorrect: true },
        { id: "c", text: "Aproximadamente 12%", isCorrect: false },
        { id: "d", text: "Aproximadamente 30%", isCorrect: false }
      ],
      explanation: "El trabajador cotiza aproximadamente un 6,35% de su base de cotización (4,70% contingencias comunes + 1,55% desempleo + 0,10% formación). El empresario paga un porcentaje mucho mayor (aprox. 30%).",
      hint: "Es una cantidad relativamente pequeña comparada con el IRPF."
    },
    keyTerms: ["Cotización Seguridad Social"]
  },
  {
    id: "uf0519-038",
    type: "content",
    title: "3.9 Conservación de Nóminas",
    section: "3. Documentos de Personal",
    content: `# 📁 Conservación y Archivo de Nóminas

Las nóminas deben conservarse durante períodos mínimos legalmente establecidos:

## ⏰ Plazos de Conservación

| Tipo de efecto | Plazo mínimo |
|----------------|--------------|
| **Laboral** | 4 años (posibles reclamaciones) |
| **Fiscal** | 4 años (comprobaciones de Hacienda) |
| **Seguridad Social** | 4 años (inspecciones SS) |
| **Recomendado** | Indefinido (pensiones, prestaciones) |

## 💡 Recomendaciones Prácticas

- Conservar las nóminas en **formato papel y/o digital**
- Mantener **copias de seguridad** actualizadas
- Archivar de forma **ordenada y accesible**
- Proteger contra **accesos no autorizados** (datos personales)

> **⚠️ Importante:** Se recomienda conservar las nóminas INDEFINIDAMENTE porque pueden ser necesarias para el cálculo de pensiones de jubilación.`,
    keyTerms: ["Conservación nóminas", "Plazos legales", "Archivo"]
  },

  // ==================== SECCIÓN 4: OTROS DOCUMENTOS ====================
  {
    id: "uf0519-039",
    type: "content",
    title: "4.1 La Instancia",
    section: "4. Otros Documentos",
    content: `# 📝 La Instancia

La **instancia** es un documento mediante el cual un ciudadano se dirige a una Administración Pública para solicitar algo.

## 📋 Estructura de la Instancia

### 1️⃣ ENCABEZAMIENTO
- Datos del solicitante (nombre, DNI, dirección)
- Cargo/órgano al que se dirige

### 2️⃣ EXPONE
- Hechos que motivan la solicitud
- Circunstancias relevantes

### 3️⃣ SOLICITA
- Lo que se pide concretamente
- Debe ser claro y específico

### 4️⃣ LUGAR, FECHA Y FIRMA
- Ciudad, día, mes y año
- Firma del solicitante

### 5️⃣ PIE
- Órgano o autoridad competente
- Ejemplo: "AL ILMO. SR. DIRECTOR GENERAL DE..."`,
    keyTerms: ["Instancia", "Solicitud", "Administración Pública"]
  },
  {
    id: "uf0519-040",
    type: "table",
    title: "4.2 Tipos de Certificados",
    section: "4. Otros Documentos",
    content: `# 📜 El Certificado

El **certificado** es un documento oficial que da fe de un hecho, situación o cualidad.`,
    tableData: {
      headers: ["Tipo de Certificado", "Quién lo emite", "Qué certifica"],
      rows: [
        ["🏢 De empresa", "Empresa/empleador", "Situación laboral, antigüedad, salario"],
        ["🎓 Académico", "Centro educativo", "Estudios realizados, notas"],
        ["🏦 Bancario", "Entidad financiera", "Saldos, titularidad de cuentas"],
        ["🏛️ Municipal", "Ayuntamiento", "Empadronamiento, bienes"],
        ["💶 De Hacienda", "Agencia Tributaria", "Estar al corriente de pagos"],
        ["🏥 De Seguridad Social", "TGSS", "Estar al corriente de cotizaciones"]
      ]
    },
    keyTerms: ["Certificado", "Documento oficial", "Fe pública"]
  },
  {
    id: "uf0519-041",
    type: "content",
    title: "4.3 El Acta",
    section: "4. Otros Documentos",
    content: `# 📋 El Acta

El **acta** es el documento que recoge lo tratado y acordado en una reunión.

## 📝 Elementos del Acta

| Elemento | Descripción |
|----------|-------------|
| **Encabezamiento** | Tipo de reunión, nº de acta, fecha |
| **Lugar y fecha** | Dónde y cuándo se celebra |
| **Hora inicio/fin** | Duración de la reunión |
| **Asistentes** | Nombre y cargo de los presentes |
| **Orden del día** | Puntos a tratar |
| **Desarrollo** | Resumen de intervenciones y debates |
| **Acuerdos** | Decisiones adoptadas |
| **Firmas** | Secretario y Vº Bº del Presidente |

## 📌 Tipos de Actas

- **Actas de reunión**: Juntas, consejos, comités
- **Actas notariales**: Con fe pública
- **Actas de inspección**: Revisiones oficiales`,
    keyTerms: ["Acta", "Reunión", "Acuerdos"]
  },
  {
    id: "uf0519-042",
    type: "content",
    title: "4.4 El Informe",
    section: "4. Otros Documentos",
    content: `# 📊 El Informe

El **informe** es un documento que expone información sobre un tema específico con análisis y conclusiones.

## 📋 Estructura del Informe

### 1️⃣ PORTADA
- Título del informe
- Autor/es
- Fecha de elaboración

### 2️⃣ ÍNDICE
- Contenido y páginas

### 3️⃣ INTRODUCCIÓN
- Objetivos del informe
- Metodología utilizada

### 4️⃣ DESARROLLO
- Cuerpo del informe
- Datos, análisis, gráficos

### 5️⃣ CONCLUSIONES
- Resumen de hallazgos
- Recomendaciones

### 6️⃣ ANEXOS
- Documentación complementaria`,
    keyTerms: ["Informe", "Análisis", "Conclusiones"]
  },
  {
    id: "uf0519-043",
    type: "content",
    title: "4.5 La Memoria",
    section: "4. Otros Documentos",
    content: `# 📚 La Memoria

La **memoria** es un documento que recoge de forma detallada las actividades realizadas durante un período determinado.

## 📑 Tipos de Memorias

| Tipo | Contenido | Frecuencia |
|------|-----------|------------|
| **Memoria anual** | Actividades del ejercicio | Anual |
| **Memoria de proyecto** | Actuación específica | Al finalizar proyecto |
| **Memoria de gestión** | Área administrativa | Según necesidad |
| **Memoria económica** | Aspectos financieros | Anual o trimestral |

## 📋 Estructura Típica

1. Presentación e introducción
2. Objetivos del período
3. Actividades realizadas
4. Recursos utilizados
5. Resultados obtenidos
6. Análisis y valoración
7. Propuestas de mejora`,
    keyTerms: ["Memoria", "Actividades", "Ejercicio"]
  },

  // ==================== SECCIÓN 5: TESORERÍA ====================
  {
    id: "uf0519-044",
    type: "content",
    title: "5.1 Concepto de Tesorería",
    section: "5. Gestión de Tesorería",
    content: `# 💰 Gestión Básica de Tesorería

La **tesorería** es el área de la empresa encargada de gestionar los flujos de efectivo: cobros y pagos.

## 🎯 Objetivo Principal

Asegurar que la empresa disponga de **suficiente liquidez** para atender sus obligaciones de pago en cada momento.

## 📊 Operaciones Básicas de Tesorería

| Operación | Descripción |
|-----------|-------------|
| **Cobros** | Recepción de dinero de clientes |
| **Pagos** | Salida de dinero a proveedores, empleados, etc. |
| **Transferencias internas** | Movimientos entre cuentas propias |
| **Control de saldos** | Verificación de disponibilidad |

## 🏦 Funciones del Departamento de Tesorería

- Gestionar cuentas a cobrar y a pagar
- Controlar saldos bancarios
- Realizar previsiones de tesorería
- Negociar con entidades financieras`,
    keyTerms: ["Tesorería", "Liquidez", "Flujos de efectivo"]
  },
  {
    id: "uf0519-045",
    type: "table",
    title: "5.2 Medios de Pago y Cobro",
    section: "5. Gestión de Tesorería",
    content: `# 💳 Clasificación de Medios de Pago`,
    tableData: {
      headers: ["Clasificación", "Tipo", "Ejemplos"],
      rows: [
        ["Por momento", "Al contado", "Efectivo, tarjeta débito"],
        ["Por momento", "A crédito", "Pagaré, letra, tarjeta crédito"],
        ["Por instrumento", "Efectivo", "Billetes y monedas"],
        ["Por instrumento", "Documento bancario", "Cheque, transferencia"],
        ["Por instrumento", "Documento comercial", "Pagaré, letra de cambio"],
        ["Por instrumento", "Electrónico", "Tarjetas, Bizum, PayPal"]
      ]
    },
    keyTerms: ["Medios de pago", "Contado", "Crédito"]
  },
  {
    id: "uf0519-046",
    type: "content",
    title: "5.3 El Cheque",
    section: "5. Gestión de Tesorería",
    content: `# 💳 El Cheque

El **cheque** es un documento por el cual una persona (librador) ordena a un banco (librado) que pague una cantidad determinada a otra persona (tenedor).

## 📋 Elementos del Cheque

| Elemento | Descripción |
|----------|-------------|
| **Librador** | Quien emite y firma el cheque |
| **Librado** | El banco que debe pagar |
| **Tenedor** | Quien cobra el cheque |
| **Importe** | Cantidad en cifras y letras |
| **Fecha** | De emisión del cheque |
| **Firma** | Del librador |

## 📑 Tipos de Cheques

- **Al portador**: Lo cobra quien lo presente
- **Nominativo**: Solo el beneficiario indicado
- **Cruzado**: Solo puede cobrarse en cuenta (no en efectivo)
- **Conformado**: El banco garantiza fondos`,
    keyTerms: ["Cheque", "Librador", "Librado", "Tenedor"]
  },
  {
    id: "uf0519-047",
    type: "content",
    title: "5.4 La Transferencia Bancaria",
    section: "5. Gestión de Tesorería",
    content: `# 🏦 La Transferencia Bancaria

La **transferencia bancaria** es una orden de pago mediante la cual el ordenante instruye a su banco para que transfiera fondos a la cuenta del beneficiario.

## ✅ Ventajas de la Transferencia

- **Seguridad**: No hay manejo de efectivo
- **Rapidez**: Transferencias inmediatas (SEPA instantánea)
- **Trazabilidad**: Queda registro de la operación
- **Comodidad**: Puede hacerse desde casa (banca online)

## 📋 Datos Necesarios

| Dato | Descripción |
|------|-------------|
| **IBAN beneficiario** | Código cuenta del receptor |
| **Nombre beneficiario** | Titular de la cuenta destino |
| **Importe** | Cantidad a transferir |
| **Concepto** | Descripción del pago |
| **Fecha valor** | Cuándo se ejecuta |`,
    keyTerms: ["Transferencia", "IBAN", "SEPA"]
  },
  {
    id: "uf0519-048",
    type: "content",
    title: "5.5 Letra de Cambio y Pagaré",
    section: "5. Gestión de Tesorería",
    content: `# 📜 Letra de Cambio y Pagaré

Son **documentos de crédito** que permiten aplazar el pago.

## 📋 Letra de Cambio

| Característica | Descripción |
|----------------|-------------|
| **Librador** | Quien emite la letra (acreedor) |
| **Librado** | Quien debe pagar (deudor) |
| **Vencimiento** | Fecha en que debe pagarse |
| **Endoso** | Puede transmitirse a terceros |

## 📋 Pagaré

| Característica | Descripción |
|----------------|-------------|
| **Firmante** | Quien se compromete a pagar (deudor) |
| **Beneficiario** | Quien cobra (acreedor) |
| **Vencimiento** | Fecha de pago |
| **Promesa de pago** | Compromiso unilateral |

> **💡 Diferencia clave:** En la letra, el acreedor ordena el pago; en el pagaré, el deudor promete pagar.`,
    keyTerms: ["Letra de cambio", "Pagaré", "Endoso"]
  },
  {
    id: "uf0519-049",
    type: "quiz",
    title: "📝 Test: Tesorería",
    section: "5. Gestión de Tesorería",
    content: "Evalúa tus conocimientos sobre gestión de tesorería.",
    quiz: {
      id: "quiz-005",
      question: "¿Qué tipo de cheque solo puede cobrarse mediante ingreso en cuenta bancaria?",
      options: [
        { id: "a", text: "Cheque al portador", isCorrect: false },
        { id: "b", text: "Cheque nominativo", isCorrect: false },
        { id: "c", text: "Cheque cruzado", isCorrect: true },
        { id: "d", text: "Cheque conformado", isCorrect: false }
      ],
      explanation: "El CHEQUE CRUZADO (con dos líneas paralelas) no puede cobrarse en efectivo, solo mediante ingreso en cuenta. Es una medida de seguridad para evitar cobros fraudulentos.",
      hint: "Se llama así porque tiene dos líneas cruzadas."
    },
    keyTerms: ["Cheque cruzado"]
  },
  {
    id: "uf0519-050",
    type: "content",
    title: "5.6 El Libro Auxiliar de Caja",
    section: "5. Gestión de Tesorería",
    content: `# 📒 El Libro Auxiliar de Caja

El **libro de caja** registra todos los movimientos de dinero en efectivo de la empresa.

## 📋 Estructura del Libro de Caja

| Columna | Contenido |
|---------|-----------|
| **Fecha** | Día del movimiento |
| **Concepto** | Descripción de la operación |
| **Entrada** | Dinero que entra (cobros) |
| **Salida** | Dinero que sale (pagos) |
| **Saldo** | Dinero disponible en caja |

## ✅ Reglas Básicas

- Anotar **TODOS** los movimientos inmediatamente
- El saldo nunca puede ser **negativo**
- Debe cuadrarse **diariamente**
- Guardar **justificantes** de todas las operaciones

> **💡 Consejo:** Al cerrar caja, el saldo teórico (según libro) debe coincidir con el efectivo real contado.`,
    keyTerms: ["Libro de caja", "Entradas", "Salidas", "Saldo"]
  },
  {
    id: "uf0519-051",
    type: "content",
    title: "5.7 El Arqueo de Caja",
    section: "5. Gestión de Tesorería",
    content: `# 🔍 El Arqueo de Caja

El **arqueo de caja** es el proceso de verificación del efectivo existente en caja comparándolo con el saldo según los registros.

## 📋 Proceso del Arqueo

### 1️⃣ Contar el efectivo
- Billetes por denominación
- Monedas por valor
- Vales y justificantes de caja

### 2️⃣ Calcular el saldo teórico
- Saldo inicial + Entradas - Salidas

### 3️⃣ Comparar
- Saldo real (contado) vs Saldo teórico (libro)

### 4️⃣ Documentar diferencias
- Si hay descuadre, investigar causas

## ⚠️ Causas Comunes de Descuadre

| Causa | Solución |
|-------|----------|
| Errores de cálculo | Revisar anotaciones |
| Olvido de anotación | Buscar justificantes |
| Cambio mal dado | Formar al personal |
| Sustracción | Medidas de control |`,
    keyTerms: ["Arqueo de caja", "Verificación", "Descuadre"]
  },
  {
    id: "uf0519-052",
    type: "content",
    title: "5.8 Conciliación Bancaria",
    section: "5. Gestión de Tesorería",
    content: `# 🏦 La Conciliación Bancaria

La **conciliación bancaria** es el proceso de comparar los registros contables de la empresa con los extractos del banco para identificar y explicar las diferencias.

## 🎯 Objetivo

Asegurar que los **saldos coinciden** y detectar posibles errores o fraudes.

## 📊 Causas de Diferencias

| Tipo | Ejemplo |
|------|---------|
| **Cheques pendientes** | Emitidos pero no cobrados |
| **Ingresos en tránsito** | Depositados pero no abonados |
| **Comisiones bancarias** | Aún no registradas en contabilidad |
| **Intereses** | Abonados por el banco |
| **Errores** | De la empresa o del banco |

## ✅ Proceso de Conciliación

1. Obtener extracto bancario actualizado
2. Comparar asiento por asiento
3. Identificar partidas pendientes
4. Ajustar registros contables
5. Documentar la conciliación`,
    keyTerms: ["Conciliación bancaria", "Extracto", "Partidas pendientes"]
  },

  // ==================== SECCIÓN 6: CONTROL DE EXISTENCIAS ====================
  {
    id: "uf0519-053",
    type: "content",
    title: "6.1 Concepto de Stock",
    section: "6. Control de Existencias",
    content: `# 📦 Gestión y Control Básico de Existencias

Las **existencias** o **stock** son los bienes que una empresa tiene almacenados para su venta o para ser utilizados en el proceso productivo.

## 📊 Tipos de Existencias

| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| **Materias primas** | Para transformar | Madera, acero, tela |
| **Productos en curso** | En proceso de fabricación | Piezas a medio ensamblar |
| **Productos terminados** | Listos para venta | Muebles, ropa, coches |
| **Mercaderías** | Para reventa sin transformar | Productos de tienda |
| **Consumibles** | Material de oficina | Papel, tóner, sobres |

## 🎯 Importancia del Control

- Evitar **roturas de stock** (quedarse sin existencias)
- Minimizar **costes de almacenamiento**
- Conocer el **valor del inventario**
- Optimizar las **compras**`,
    keyTerms: ["Existencias", "Stock", "Inventario"]
  },
  {
    id: "uf0519-054",
    type: "table",
    title: "6.2 Material de Oficina",
    section: "6. Control de Existencias",
    content: `# 📋 Material de Oficina: Fungible y No Fungible`,
    tableData: {
      headers: ["Tipo", "Definición", "Ejemplos"],
      rows: [
        ["📝 FUNGIBLE (Consumible)", "Se agota con el uso", "Papel, bolígrafos, tóner, sobres, grapas"],
        ["🖥️ NO FUNGIBLE (Inventariable)", "Uso prolongado, no se consume", "Ordenadores, impresoras, mobiliario"],
        ["🔧 Equipos de comunicación", "Dispositivos de comunicación", "Teléfonos, fax, routers"],
        ["🖨️ Equipos de reproducción", "Para copiar/imprimir", "Fotocopiadoras, escáneres"]
      ]
    },
    keyTerms: ["Material fungible", "Material inventariable"]
  },
  {
    id: "uf0519-055",
    type: "content",
    title: "6.3 El Proceso de Aprovisionamiento",
    section: "6. Control de Existencias",
    content: `# 🔄 El Proceso de Aprovisionamiento

El **aprovisionamiento** es el conjunto de operaciones que realiza la empresa para abastecerse de los materiales necesarios.

## 📋 Fases del Aprovisionamiento

### 1️⃣ DETECCIÓN DE NECESIDADES
- Identificar qué productos hacen falta
- Cantidad necesaria

### 2️⃣ SELECCIÓN DE PROVEEDORES
- Evaluar ofertas
- Comparar precios y condiciones

### 3️⃣ REALIZACIÓN DEL PEDIDO
- Emitir documento de pedido
- Establecer condiciones

### 4️⃣ RECEPCIÓN DE MERCANCÍAS
- Verificar cantidad y calidad
- Firmar albarán

### 5️⃣ ALMACENAMIENTO
- Ubicar en el lugar adecuado
- Registrar la entrada

### 6️⃣ GESTIÓN DEL STOCK
- Control continuo
- Reposición cuando sea necesario`,
    keyTerms: ["Aprovisionamiento", "Gestión de compras"]
  },
  {
    id: "uf0519-056",
    type: "content",
    title: "6.4 Fichas de Almacén",
    section: "6. Control de Existencias",
    content: `# 📊 Fichas de Almacén

Las **fichas de almacén** registran todos los movimientos de entrada y salida de cada producto.

## 📋 Información de la Ficha

| Dato | Contenido |
|------|-----------|
| **Código producto** | Identificación única |
| **Descripción** | Nombre del artículo |
| **Ubicación** | Dónde está almacenado |
| **Stock mínimo** | Cantidad mínima a mantener |
| **Entradas** | Compras, devoluciones |
| **Salidas** | Ventas, consumos |
| **Existencias** | Unidades disponibles |
| **Precio unitario** | Valor por unidad |
| **Valor total** | Existencias × Precio |

## 💡 Utilidad de las Fichas

- Conocer el stock en tiempo real
- Detectar necesidad de reposición
- Base para inventarios
- Control de valor del almacén`,
    keyTerms: ["Ficha de almacén", "Entradas", "Salidas", "Existencias"]
  },
  {
    id: "uf0519-057",
    type: "table",
    title: "6.5 Métodos de Valoración de Existencias",
    section: "6. Control de Existencias",
    content: `# 💶 Métodos de Valoración de Existencias

Cuando compramos el mismo producto a diferentes precios, ¿qué valor asignamos a las salidas?`,
    tableData: {
      headers: ["Método", "Descripción", "Características"],
      rows: [
        ["📊 PMP", "Precio Medio Ponderado", "Media de todos los precios de compra según cantidades"],
        ["📦 FIFO", "First In, First Out", "Las primeras unidades que entran son las primeras en salir"],
        ["📦 LIFO", "Last In, First Out", "Las últimas en entrar son las primeras en salir (no permitido fiscalmente)"]
      ]
    },
    keyTerms: ["PMP", "FIFO", "Valoración existencias"]
  },
  {
    id: "uf0519-058",
    type: "content",
    title: "6.6 El Inventario",
    section: "6. Control de Existencias",
    content: `# 📋 El Inventario

El **inventario** es el recuento físico de todas las existencias que hay en el almacén en un momento determinado.

## 🎯 Objetivos del Inventario

- **Verificar** que el stock teórico coincide con el real
- **Detectar** roturas, deterioros, obsolescencias
- **Ajustar** registros contables
- **Valorar** las existencias para el balance

## 📑 Tipos de Inventario

| Tipo | Frecuencia | Característica |
|------|------------|----------------|
| **Periódico** | Anual, semestral | Recuento total en una fecha |
| **Rotativo** | Continuo | Recuento parcial por zonas/familias |
| **Permanente** | En tiempo real | Control informatizado continuo |

## ⚠️ Causas de Diferencias

- Errores de registro
- Robos o pérdidas
- Deterioro o caducidad
- Errores de conteo`,
    keyTerms: ["Inventario", "Recuento", "Stock real"]
  },
  {
    id: "uf0519-059",
    type: "quiz",
    title: "📝 Test: Control de Existencias",
    section: "6. Control de Existencias",
    content: "Evalúa tus conocimientos sobre gestión de almacén.",
    quiz: {
      id: "quiz-006",
      question: "Según el método FIFO (First In, First Out), ¿qué unidades se consideran vendidas primero?",
      options: [
        { id: "a", text: "Las que tienen precio más alto", isCorrect: false },
        { id: "b", text: "Las últimas que entraron al almacén", isCorrect: false },
        { id: "c", text: "Las primeras que entraron al almacén", isCorrect: true },
        { id: "d", text: "Las que están más cerca de la salida", isCorrect: false }
      ],
      explanation: "FIFO significa 'First In, First Out' (primero en entrar, primero en salir). Las unidades que se compraron antes son las que se consideran vendidas primero, independientemente de cuáles se hayan cogido físicamente.",
      hint: "El nombre del método indica claramente el orden."
    },
    keyTerms: ["FIFO"]
  },

  // ==================== SECCIÓN 7: OPERACIONES INFORMÁTICAS ====================
  {
    id: "uf0519-060",
    type: "content",
    title: "7.1 Sistemas de Facturación",
    section: "7. Operaciones Informáticas",
    content: `# 💻 Sistemas Informáticos de Facturación

Los programas de gestión de facturación automatizan las operaciones comerciales.

## 📋 Funcionalidades Principales

### Gestión de Clientes
- Datos identificativos (nombre, CIF, dirección)
- Condiciones comerciales (precios, descuentos)
- Formas de pago habituales
- Histórico de operaciones
- Límites de crédito

### Gestión de Proveedores
- Datos identificativos completos
- Condiciones de compra
- Catálogo de productos/servicios
- Histórico de pedidos y facturas
- Evaluación de proveedores

### Facturación
- Generación automática de facturas
- Numeración correlativa
- Cálculo automático de IVA
- Emisión de albaranes
- Control de cobros pendientes`,
    keyTerms: ["Sistema de facturación", "Gestión comercial", "Software"]
  },
  {
    id: "uf0519-061",
    type: "content",
    title: "7.2 Sistemas de Nóminas",
    section: "7. Operaciones Informáticas",
    content: `# 💼 Sistemas Informáticos de Nóminas

Los programas de gestión de nóminas automatizan el cálculo de retribuciones.

## 📊 Funcionalidades Principales

| Función | Descripción |
|---------|-------------|
| **Cálculo automático** | De todos los conceptos de nómina |
| **Generación TC1/TC2** | Documentos de cotización a SS |
| **Modelo 111** | Declaración trimestral retenciones IRPF |
| **Modelo 190** | Resumen anual de retenciones |
| **Certificados** | De empresa, de retenciones |
| **Históricos** | Consulta de períodos anteriores |

## ✅ Ventajas de la Gestión Informática

- ⚡ **Rapidez**: Procesos automatizados
- ✅ **Exactitud**: Minimización de errores
- 🔒 **Seguridad**: Control de accesos y copias
- 🔍 **Consultas**: Acceso rápido a información
- 📊 **Informes**: Generación automática
- ⚖️ **Cumplimiento**: Adaptación a normativa`,
    keyTerms: ["Sistema de nóminas", "TC1", "TC2", "Modelo 111"]
  },

  // ==================== RESUMEN Y AUTOEVALUACIÓN FINAL ====================
  {
    id: "uf0519-062",
    type: "summary",
    title: "📚 Resumen General UF0519",
    section: "Resumen Final",
    content: `# ✅ Resumen de la Unidad Formativa UF0519

## 🎯 Conceptos Clave Aprendidos

### 1️⃣ Documentos Administrativos
✅ Elementos: membrete, fecha, cuerpo, firma, registro
✅ Funciones: probatoria, informativa, control, jurídica, contable
✅ Clasificación: por origen, función, formato

### 2️⃣ Ciclo de Compraventa
✅ PEDIDO → ALBARÁN → FACTURA → RECIBO
✅ Elementos obligatorios de cada documento
✅ Tipos de facturas: ordinaria, simplificada, rectificativa, electrónica

### 3️⃣ Documentos de Personal
✅ La nómina: devengos - deducciones = líquido
✅ Cotización SS trabajador: ≈ 6,35%
✅ Órdenes de trabajo

### 4️⃣ Tesorería
✅ Medios de pago: efectivo, cheque, transferencia, pagaré, letra
✅ Libro de caja y arqueo
✅ Conciliación bancaria

### 5️⃣ Control de Existencias
✅ Fichas de almacén
✅ Métodos de valoración: PMP, FIFO
✅ Inventario y recuento

> **🎉 ¡Enhorabuena!** Has completado la Unidad Formativa UF0519.`,
    keyTerms: ["Resumen", "UF0519", "Certificado profesionalidad"]
  },
  {
    id: "uf0519-063",
    type: "quiz",
    title: "📝 Test Final - Pregunta 1",
    section: "Autoevaluación Final",
    content: "Primera pregunta del test de autoevaluación final.",
    quiz: {
      id: "quiz-final-01",
      question: "¿Cuál de los siguientes NO es un elemento obligatorio de una factura?",
      options: [
        { id: "a", text: "Número de factura", isCorrect: false },
        { id: "b", text: "Fecha de emisión", isCorrect: false },
        { id: "c", text: "Logotipo de la empresa", isCorrect: true },
        { id: "d", text: "Base imponible", isCorrect: false }
      ],
      explanation: "El LOGOTIPO no es obligatorio legalmente en una factura. Los elementos obligatorios son: número, fecha, datos fiscales de emisor y receptor, descripción, base imponible, tipo de IVA, cuota y total.",
      hint: "Piensa en qué elementos exige la Agencia Tributaria."
    },
    keyTerms: ["Factura", "Elementos obligatorios"]
  },
  {
    id: "uf0519-064",
    type: "quiz",
    title: "📝 Test Final - Pregunta 2",
    section: "Autoevaluación Final",
    content: "Segunda pregunta del test de autoevaluación final.",
    quiz: {
      id: "quiz-final-02",
      question: "¿Qué documento acompaña a la mercancía en su entrega?",
      options: [
        { id: "a", text: "La factura", isCorrect: false },
        { id: "b", text: "El pedido", isCorrect: false },
        { id: "c", text: "El albarán", isCorrect: true },
        { id: "d", text: "El recibo", isCorrect: false }
      ],
      explanation: "El ALBARÁN (o nota de entrega) acompaña a la mercancía. La factura se emite después para cobrar, y el recibo acredita que ya se ha pagado.",
      hint: "Es el documento que firmas cuando te entregan un paquete."
    },
    keyTerms: ["Albarán"]
  },
  {
    id: "uf0519-065",
    type: "quiz",
    title: "📝 Test Final - Pregunta 3",
    section: "Autoevaluación Final",
    content: "Tercera pregunta del test de autoevaluación final.",
    quiz: {
      id: "quiz-final-03",
      question: "¿Qué documento recoge lo tratado y acordado en una reunión?",
      options: [
        { id: "a", text: "El informe", isCorrect: false },
        { id: "b", text: "La memoria", isCorrect: false },
        { id: "c", text: "El acta", isCorrect: true },
        { id: "d", text: "El certificado", isCorrect: false }
      ],
      explanation: "El ACTA es el documento que registra los contenidos, intervenciones y acuerdos de una reunión. La firma el secretario con el visto bueno del presidente.",
      hint: "Se suele leer al inicio de la siguiente reunión."
    },
    keyTerms: ["Acta"]
  },
  {
    id: "uf0519-066",
    type: "quiz",
    title: "📝 Test Final - Pregunta 4",
    section: "Autoevaluación Final",
    content: "Cuarta pregunta del test de autoevaluación final.",
    quiz: {
      id: "quiz-final-04",
      question: "¿Cuántos años deben conservarse las nóminas a efectos laborales?",
      options: [
        { id: "a", text: "2 años", isCorrect: false },
        { id: "b", text: "4 años", isCorrect: true },
        { id: "c", text: "6 años", isCorrect: false },
        { id: "d", text: "10 años", isCorrect: false }
      ],
      explanation: "Las nóminas deben conservarse durante 4 AÑOS a efectos laborales y fiscales. Aunque se recomienda guardarlas indefinidamente para cálculos de pensiones.",
      hint: "Es el plazo estándar para reclamaciones laborales."
    },
    keyTerms: ["Conservación nóminas"]
  },
  {
    id: "uf0519-067",
    type: "quiz",
    title: "📝 Test Final - Pregunta 5",
    section: "Autoevaluación Final",
    content: "Quinta pregunta del test de autoevaluación final.",
    quiz: {
      id: "quiz-final-05",
      question: "En una nómina, ¿qué concepto corresponde a los 'Complementos del puesto'?",
      options: [
        { id: "a", text: "Devengo (ingreso)", isCorrect: true },
        { id: "b", text: "Deducción", isCorrect: false },
        { id: "c", text: "Líquido", isCorrect: false },
        { id: "d", text: "Base de cotización", isCorrect: false }
      ],
      explanation: "Los COMPLEMENTOS DEL PUESTO son un tipo de DEVENGO (ingreso). Los devengos incluyen el salario base y todos los complementos que el trabajador tiene derecho a percibir.",
      hint: "Es dinero que el trabajador recibe, no que le quitan."
    },
    keyTerms: ["Devengos", "Complementos"]
  },
  {
    id: "uf0519-068",
    type: "content",
    title: "📖 Glosario de Términos",
    section: "Recursos",
    content: `# 📚 Glosario de Términos Clave

| Término | Definición |
|---------|------------|
| **Albarán** | Documento que acompaña a la mercancía y acredita su entrega |
| **Base imponible** | Cantidad sobre la que se aplica el tipo impositivo (IVA) |
| **CIF/NIF** | Código/Número de Identificación Fiscal |
| **Devengo** | Concepto retributivo que percibe el trabajador |
| **Domiciliación** | Sistema de cobro automático mediante cargo en cuenta |
| **Factura** | Documento que refleja una operación de compraventa |
| **FIFO** | First In, First Out - Método de valoración de existencias |
| **IRPF** | Impuesto sobre la Renta de las Personas Físicas |
| **IVA** | Impuesto sobre el Valor Añadido |
| **Nómina** | Documento que refleja la retribución del trabajador |
| **Pedido** | Documento de solicitud de productos o servicios |
| **PMP** | Precio Medio Ponderado - Método de valoración |
| **Recibo** | Documento que acredita el pago de una cantidad |
| **Salario base** | Retribución fija por unidad de tiempo trabajado |
| **TC1/TC2** | Documentos de cotización a la Seguridad Social |
| **Tesorería** | Área que gestiona los flujos de efectivo |`,
    keyTerms: ["Glosario", "Términos", "Definiciones"]
  }
];
