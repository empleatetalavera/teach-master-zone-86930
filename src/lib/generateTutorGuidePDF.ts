import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MODULES_SSC = [
  { code: "1705", title: "Programación didáctica de los Grados A, B y C del Sistema de Formación Profesional", hours: 90 },
  { code: "1706", title: "Gestión de materiales, medios y recursos didácticos de los Grados A, B y C del Sistema de Formación Profesional", hours: 90 },
  { code: "1707", title: "Orientación profesional en los Grados A, B y C del Sistema de Formación Profesional", hours: 60 },
  { code: "1783", title: "Evaluación del proceso de enseñanza-aprendizaje de los Grados A, B y C del Sistema de la Formación Profesional", hours: 60 },
  { code: "1784", title: "Procesos para impartir acciones formativas de los Grados A, B y C del Sistema de Formación Profesional", hours: 90 },
  { code: "1785", title: "Acción tutorial de los Grados A, B y C del Sistema de Formación Profesional", hours: 60 },
  { code: "1786", title: "Competencia digital aplicada a la formación profesional", hours: 30 },
  { code: "1782", title: "Sensibilización en prevención de riesgos laborales y medioambientales", hours: 30 },
];

const MODULE_OBJECTIVES: Record<string, { general: string; specifics: string[] }> = {
  "1705": {
    general: "Programar acciones formativas de los Grados A, B y C del Sistema de Formación Profesional, adecuándolas a las características y condiciones de la formación, al perfil de los destinatarios y a la realidad laboral.",
    specifics: [
      "Identificar la normativa vigente del Sistema de Formación Profesional como sistema único e integrado, aplicándola en la programación didáctica.",
      "Analizar la estructura y el contenido de los Grados A, B y C, identificando sus elementos, requisitos, procedimientos de evaluación y acreditación.",
      "Coordinar, con el resto del equipo, la formación técnica y profesional para el desarrollo de las acciones formativas.",
      "Diseñar la programación didáctica de acciones formativas teniendo en cuenta los elementos que la componen.",
      "Temporalizar la programación didáctica secuenciando los contenidos y actividades.",
    ]
  },
  "1706": {
    general: "Seleccionar, elaborar, adaptar y utilizar materiales, medios y recursos didácticos para el desarrollo de contenidos formativos de los Grados A, B y C.",
    specifics: [
      "Seleccionar materiales, medios y recursos didácticos aplicándolos en las distintas acciones formativas.",
      "Diseñar materiales y recursos didácticos dirigidos a favorecer la adquisición del aprendizaje.",
      "Determinar y organizar los recursos personales, espacios/instalaciones y distribución temporal.",
      "Utilizar materiales, medios técnicos y recursos audiovisuales y multimedia según especificaciones técnicas.",
      "Diseñar la evaluación de materiales, medios y recursos didácticos planteados.",
    ]
  },
  "1707": {
    general: "Facilitar información y orientación laboral y promover la calidad de la formación profesional para el empleo en los Grados A, B y C.",
    specifics: [
      "Seleccionar cauces informativos y estrategias de búsqueda y actualización de la información del entorno profesional y productivo.",
      "Determinar técnicas específicas en el proceso de información y orientación profesional al alumnado.",
      "Asesorar al alumnado sobre itinerarios formativos, formación profesional y oportunidades de empleo.",
      "Analizar mecanismos que garanticen la calidad de las acciones formativas.",
      "Aplicar competencias digitales en el proceso de búsqueda de información y orientación profesional.",
      "Caracterizar los retos ambientales y sociales a los que se enfrenta el entorno profesional y productivo.",
    ]
  },
  "1783": {
    general: "Evaluar el proceso de enseñanza-aprendizaje en las acciones formativas de los Grados A, B y C del Sistema de Formación Profesional.",
    specifics: [
      "Analizar la normativa vigente sobre la evaluación, aplicándola al proceso de evaluación y calificación.",
      "Analizar la finalidad y tipología de la evaluación en el actual Sistema de la Formación Profesional.",
      "Verificar el nivel formativo inicial del alumnado realizando una evaluación diagnóstica.",
      "Analizar pruebas e instrumentos de evaluación atendiendo a las diferentes modalidades.",
      "Implementar técnicas de evaluación continua a lo largo del periodo formativo.",
      "Determinar procedimientos y pruebas de evaluación final que verifiquen el nivel de aprendizaje.",
      "Programar la evaluación de la práctica docente, analizando los resultados para mejorar la calidad.",
    ]
  },
  "1784": {
    general: "Impartir acciones formativas de los Grados A, B y C del Sistema de Formación Profesional utilizando técnicas, estrategias y recursos didácticos.",
    specifics: [
      "Desarrollar estrategias facilitadoras del proceso de aprendizaje.",
      "Generar canales de cohesión y participación activa entre el alumnado.",
      "Seleccionar técnicas de comunicación favoreciendo el buen clima y la relación entre personas.",
      "Analizar estrategias metodológicas (ABP, cooperativo, gamificación, microenseñanza).",
      "Reconocer aspectos psicopedagógicos que interceden en las acciones formativas.",
      "Determinar instrumentos y procedimientos en el proceso de aprendizaje mediante estrategias personalizadas.",
    ]
  },
  "1785": {
    general: "Tutorizar acciones formativas de los Grados A, B y C del Sistema de Formación Profesional, proporcionando estrategias y habilidades para favorecer el aprendizaje.",
    specifics: [
      "Determinar las condiciones y requisitos iniciales de una acción formativa según modalidad.",
      "Diseñar un plan de acción tutorial adaptado a la formación.",
      "Supervisar las intervenciones tutoriales en formación presencial, semipresencial y virtual.",
      "Evaluar la acción tutorial analizando su adecuación al plan establecido.",
    ]
  },
  "1786": {
    general: "Aplicar competencias digitales en el contexto de la formación profesional, utilizando herramientas TIC e IA.",
    specifics: [
      "Identificar herramientas digitales aplicables al proceso formativo.",
      "Utilizar plataformas virtuales de aprendizaje y herramientas colaborativas.",
      "Aplicar estrategias de comunicación digital en la formación.",
    ]
  },
  "1782": {
    general: "Sensibilizar al alumnado sobre la prevención de riesgos laborales y medioambientales en su entorno profesional.",
    specifics: [
      "Identificar los principales riesgos laborales asociados al entorno profesional.",
      "Reconocer las medidas de prevención y protección aplicables.",
      "Analizar la normativa básica en prevención de riesgos laborales.",
    ]
  },
};

interface TutorGuidePDFParams {
  centerName?: string;
  centerLogo?: string;
  courseTitle?: string;
  primaryColor?: [number, number, number];
  secondaryColor?: [number, number, number];
}

export const generateTutorGuidePDF = async (params: TutorGuidePDFParams = {}) => {
  const centerName = params.centerName || "Grupo Arma Formación";
  const courseTitle = params.courseTitle || "Habilitación para la docencia en grados A, B y C del Sistema de Formación Profesional";

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Grupo Arma blue branding colors - hsl(227, 73%, 57%) and hsl(227, 73%, 47%)
  const primaryColor: [number, number, number] = params.primaryColor || [65, 100, 225];
  const secondaryColor: [number, number, number] = params.secondaryColor || [32, 70, 207];
  const darkColor: [number, number, number] = [33, 37, 41];
  const grayColor: [number, number, number] = [80, 80, 80];
  const lightBg: [number, number, number] = [240, 243, 248];
  const lightBlueBg: [number, number, number] = [230, 236, 250];

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
  };

  const addFooter = (d: jsPDF, pageNum: number) => {
    d.setPage(pageNum);
    d.setFontSize(8);
    d.setTextColor(...grayColor);
    d.text(`${centerName} — Guía del Tutor-Formador`, margin, pageHeight - 10);
    d.text(`Página ${pageNum - 1}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    // Blue line at bottom
    d.setDrawColor(...primaryColor);
    d.setLineWidth(0.8);
    d.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  };

  const addSectionTitle = (title: string) => {
    checkPage(18);
    const safeTitle = title.replace(/→/g, ">").replace(/—/g, "-");
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, y - 2, contentWidth, 10, 1.5, 1.5, "F");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(safeTitle, margin + 4, y + 5);
    y += 14;
  };

  const addSubTitle = (title: string) => {
    checkPage(14);
    const safeTitle = title.replace(/→/g, ">").replace(/—/g, "-");
    doc.setFillColor(...lightBlueBg);
    doc.roundedRect(margin, y - 2, contentWidth, 8, 1, 1, "F");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(safeTitle, margin + 3, y + 4);
    y += 10;
  };

  const addParagraph = (text: string, indent = 0) => {
    const safeText = text.replace(/→/g, ">").replace(/—/g, "-").replace(/"/g, '"').replace(/"/g, '"');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(safeText, contentWidth - indent);
    for (const line of lines) {
      checkPage(6);
      doc.text(line, margin + indent, y);
      y += 4.5;
    }
    y += 2;
  };

  const addBullet = (text: string, indent = 5) => {
    // Replace arrows with safe ASCII to avoid encoding issues in jsPDF
    const safeText = text.replace(/→/g, ">").replace(/—/g, "-");
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(safeText, contentWidth - indent - 5);
    checkPage(6);
    // Use a simple dash as bullet (safe for helvetica encoding)
    doc.setFillColor(...primaryColor);
    doc.circle(margin + indent + 1, y - 1, 1, "F");
    doc.setTextColor(...darkColor);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) checkPage(6);
      doc.text(lines[i], margin + indent + 5, y);
      y += 4.5;
    }
  };

  const addNote = (text: string) => {
    const safeText = text.replace(/→/g, ">").replace(/—/g, "-").replace(/"/g, '"').replace(/"/g, '"');
    const lines = doc.splitTextToSize(safeText, contentWidth - 10);
    const boxHeight = lines.length * 4.5 + 10;
    checkPage(boxHeight + 4);
    doc.setFillColor(...lightBlueBg);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "F");
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "S");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("RECUERDA:", margin + 5, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkColor);
    doc.text(lines, margin + 5, y + 12);
    y += boxHeight + 4;
  };

  // ==================== COVER PAGE ====================
  // Blue gradient cover
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Lighter overlay for depth
  doc.setFillColor(...secondaryColor);
  doc.rect(0, pageHeight * 0.65, pageWidth, pageHeight * 0.35, "F");

  // White decorative elements
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.line(margin, 50, pageWidth - margin, 50);
  doc.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("GUÍA DEL", pageWidth / 2, 80, { align: "center" });
  doc.text("TUTOR-FORMADOR", pageWidth / 2, 98, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const titleLines = doc.splitTextToSize(courseTitle, contentWidth - 20);
  let ty = 120;
  for (const line of titleLines) {
    doc.text(line, pageWidth / 2, ty, { align: "center" });
    ty += 6;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SSC_C_017_5B", pageWidth / 2, ty + 12, { align: "center" });
  doc.setFontSize(14);
  doc.text("510 horas | Nivel 3", pageWidth / 2, ty + 22, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(centerName.toUpperCase(), pageWidth / 2, pageHeight - 38, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, pageWidth / 2, pageHeight - 28, { align: "center" });

  // ==================== TABLE OF CONTENTS ====================
  doc.addPage();
  y = margin;
  
  // Title bar
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, y - 2, contentWidth, 12, 2, 2, "F");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ÍNDICE", margin + 4, y + 7);
  y += 20;

  const tocItems = [
    { text: "1. Datos de la Acción Formativa", level: 0 },
    { text: "1.1 Objetivos", level: 1 },
    { text: "1.2 Organización y Fechas de Realización", level: 1 },
    { text: "2. Alumnos y Equipo Docente", level: 0 },
    { text: "3. El Campus Virtual y las Aplicaciones Informáticas", level: 0 },
    { text: "3.1 Requisitos técnicos del equipo informático", level: 1 },
    { text: "3.2 Funcionamiento y recursos", level: 1 },
    { text: "3.3 Ayuda, preguntas frecuentes y visita guiada", level: 1 },
    { text: "3.4 Aplicaciones informáticas", level: 1 },
    { text: "4. Programación Didáctica y Planificación de la Evaluación", level: 0 },
    { text: "4.1 ¿Cómo debe desarrollar el alumno la acción formativa?", level: 1 },
    { text: "4.2 ¿Qué se evalúa en la acción formativa?", level: 1 },
    { text: "5. Procedimiento de Seguimiento del Aprendizaje y Evaluación", level: 0 },
    { text: "5.1 ¿Quién, cómo y cuándo se realiza el seguimiento?", level: 1 },
    { text: "5.2 ¿Quién, cómo y cuándo se evalúa?", level: 1 },
    { text: "5.3 Adaptación de la programación didáctica", level: 1 },
    { text: "6. Sistema Tutorial", level: 0 },
    { text: "6.1 Tutorías virtuales", level: 1 },
    { text: "6.2 Tutorías presenciales", level: 1 },
    { text: "7. Gestión y Administración de la Acción Formativa", level: 0 },
    { text: "8. Recursos Didácticos para el Tutor-Formador", level: 0 },
  ];

  for (const item of tocItems) {
    const indent = item.level * 8;
    if (item.level === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkColor);
    }
    doc.text(item.text, margin + indent, y);
    y += item.level === 0 ? 8 : 6;
  }

  // ==================== SECTION 1 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("1. DATOS DE LA ACCIÓN FORMATIVA");
  addParagraph("En este documento encontrarás toda la información que necesitas para el desarrollo óptimo del curso que vas a impartir.");

  addSubTitle("1.1 OBJETIVOS");
  addParagraph("Con este curso el alumno aprenderá a programar, impartir, tutorizar y evaluar acciones formativas de los Grados A, B y C del Sistema de Formación Profesional, elaborando y utilizando materiales, medios y recursos didácticos, orientando sobre los itinerarios formativos y salidas profesionales que ofrece el mercado laboral en su especialidad, promoviendo de forma permanente la calidad de la formación y la actualización didáctica.");
  addParagraph("A continuación, podrás ver las capacidades que deberán trabajarse en cada módulo formativo:");

  // Modules objectives - split into individual tables per module to avoid cutoff
  for (const mod of MODULES_SSC) {
    const obj = MODULE_OBJECTIVES[mod.code];
    const objectivesText = `Objetivo general: ${obj.general}\n\n${obj.specifics.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    
    checkPage(40);
    autoTable(doc, {
      startY: y,
      head: [[`MF${mod.code}_3 — ${mod.title} (${mod.hours}h)`]],
      body: [[objectivesText]],
      margin: { left: margin, right: margin },
      styles: { fontSize: 7.5, cellPadding: 4, lineColor: [200, 210, 230], lineWidth: 0.2 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: lightBg },
    });
    y = (doc as any).lastAutoTable.finalY + 3;
  }

  // ==================== 1.2 ORGANIZACIÓN ====================
  checkPage(30);
  addSubTitle("1.2 ORGANIZACIÓN Y FECHAS DE REALIZACIÓN");
  addParagraph("Este curso se corresponde con el certificado de profesionalidad:");

  autoTable(doc, {
    startY: y,
    body: [
      ["DENOMINACIÓN", courseTitle],
      ["CÓDIGO", "SSC_C_017_5B"],
      ["FAMILIA PROFESIONAL", "Servicios Socioculturales y a la Comunidad"],
      ["NIVEL DE CUALIFICACIÓN", "3 (MECU 5B)"],
      ["DURACIÓN TOTAL", "510 horas"],
      ["MODALIDAD", "Teleformación"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [200, 210, 230], lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, fillColor: lightBlueBg, textColor: secondaryColor } },
    alternateRowStyles: { fillColor: [252, 252, 255] },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  addParagraph("Se compone de los siguientes módulos formativos:");

  const modRows = MODULES_SSC.map(m => [`MF${m.code}_3 ${m.title}`, `${m.hours}`]);
  modRows.push(["TOTAL HORAS", "510"]);

  autoTable(doc, {
    startY: y,
    head: [["MÓDULOS FORMATIVOS", "HORAS"]],
    body: modRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3.5, lineColor: [200, 210, 230], lineWidth: 0.2 },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 1: { halign: "center", cellWidth: 22 } },
    alternateRowStyles: { fillColor: lightBg },
    didParseCell: (data) => {
      if (data.row.index === modRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = lightBlueBg;
        data.cell.styles.textColor = secondaryColor;
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  addParagraph("En el ANEXO I \"PROGRAMACIÓN DIDÁCTICA Y PLANIFICACIÓN DE LA EVALUACIÓN\" de esta guía, encontrarás la relación de las unidades didácticas de cada uno de los módulos formativos que componen el certificado de profesionalidad, las capacidades que deberá adquirir el alumno, así como las actividades y pruebas de evaluación.");
  addParagraph("En el ANEXO II \"CALENDARIO Y PLAN DE TRABAJO\" podrás encontrar la planificación por semanas y la secuencia de actividades.");

  // ==================== SECTION 2 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("2. ALUMNOS Y EQUIPO DOCENTE");
  addParagraph("Puedes obtener una lista de los participantes en el módulo formativo que tutorizas a través de varias vías:");
  addBullet("Elaborar listado propio: A través de ADMINISTRACIÓN → INFORMES → Informe de alumnos");

  y += 4;
  addSubTitle("MIS CONTACTOS");
  addParagraph("En el icono MIS CONTACTOS encontrarás la información sobre el resto de los miembros del equipo docente. Podrás contactar con los alumnos y con el equipo de tutores-formadores a través de los siguientes medios:");
  addBullet("Correo electrónico interno del Campus Virtual: Mensajería interna para comunicación directa con alumnos y otros tutores.");
  addBullet("Chat del Campus Virtual: Comunicación instantánea con usuarios conectados.");
  addBullet("Foros del Campus Virtual: Dispondrás de un foro para tutores-formadores de toda la acción formativa, y otro foro específico por cada módulo formativo.");
  addBullet("Correo electrónico externo: Para comunicaciones fuera del campus cuando sea necesario.");

  // ==================== SECTION 3 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("3. EL CAMPUS VIRTUAL Y LAS APLICACIONES INFORMÁTICAS");

  addSubTitle("3.1 REQUISITOS TÉCNICOS DEL EQUIPO INFORMÁTICO");
  addBullet("Navegadores compatibles: Chrome, Firefox, Edge (últimas versiones)");
  addBullet("Conexión a Internet estable (mínimo 2 Mbps recomendado)");
  addBullet("Resolución de pantalla mínima: 1024x768 px");
  addBullet("JavaScript y cookies habilitados");

  y += 4;
  addSubTitle("3.2 FUNCIONAMIENTO Y RECURSOS");
  addParagraph("Al acceder al Campus Virtual encontrarás toda la información a la que tienen acceso los alumnos para que puedas consultar la documentación disponible. Es muy importante que conozcas los recursos didácticos disponibles, así como las herramientas para comunicarte con los alumnos, realizar su seguimiento y evaluación.");

  addSubTitle("A) ORGANIZARME");
  addParagraph("En la zona izquierda encontrarás el área ORGANIZARME, con toda la información sobre la planificación del curso: la agenda con la programación de actividades y pruebas de evaluación, las tareas pendientes comunicadas a los alumnos, así como esta guía.");

  addSubTitle("B) COMUNICARME");
  addParagraph("En la parte derecha encontrarás el área COMUNICARME con acceso a todas las herramientas de comunicación: Mi Perfil, Mis Contactos, Correo electrónico interno, Chat y Foros.");

  addSubTitle("C) RECURSOS");
  addParagraph("En la parte central encontrarás todos los RECURSOS DIDÁCTICOS organizados de forma secuencial: Introducción, Contenido Interactivo Multimedia (CIM), Manual PDF, Material Complementario, Actividades de Aprendizaje Evaluables, Foros, Biblioteca, Tutorías Presenciales, Tutoría Virtual y Evaluación.");

  y += 4;
  addSubTitle("RECURSOS DIDÁCTICOS PARA EL TUTOR-FORMADOR");
  addParagraph("En el Campus Virtual, además de los recursos didácticos disponibles para el alumno, vas a encontrar los recursos necesarios para llevar a cabo tu actividad como tutor-formador:");
  addBullet("Esta guía del tutor-formador en PDF.");
  addBullet("Documentos con la solución y sistema de corrección de las actividades de aprendizaje planteadas en el Campus Virtual.");
  addBullet("Documentos con la planificación de las actividades y los instrumentos de evaluación para las Tutorías Presenciales.");
  addBullet("Documento por cada módulo formativo con la planificación y sistema de corrección de la prueba de evaluación presencial final.");

  y += 4;
  addSubTitle("3.3 AYUDA, PREGUNTAS FRECUENTES Y VISITA GUIADA");
  addParagraph("Dispones de una sección de ayuda con preguntas frecuentes y una visita guiada del Campus Virtual accesible desde el menú principal.");

  addSubTitle("3.4 APLICACIONES INFORMÁTICAS");
  addParagraph("Los siguientes módulos requieren aplicaciones informáticas específicas:");

  checkPage(30);
  autoTable(doc, {
    startY: y,
    head: [["MÓDULO", "APLICACIONES NECESARIAS"]],
    body: [
      ["MF1705_3 Programación didáctica", "Aplicaciones de presentación multimedia (PowerPoint, Canva, Google Slides)"],
      ["MF1706_3 Gestión de materiales", "Herramientas de diseño (Canva, Genially), plataformas colaborativas (Google Drive, Zoho)"],
      ["MF1786_3 Competencia digital", "Herramientas de IA generativa, plataformas LMS, aplicaciones de evaluación digital"],
      ["Resto de módulos", "NO SE REQUIERE software específico adicional"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3.5, lineColor: [200, 210, 230], lineWidth: 0.2 },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: lightBg },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  addNote("Debes facilitar a los alumnos las instrucciones para la descarga de las aplicaciones informáticas necesarias a través del correo electrónico del Campus Virtual.");

  // ==================== SECTION 4 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("4. PROGRAMACIÓN DIDÁCTICA Y PLANIFICACIÓN DE LA EVALUACIÓN");
  addParagraph("En el ANEXO I \"PROGRAMACIÓN DIDÁCTICA Y PLANIFICACIÓN DE LA EVALUACIÓN\" de esta guía encontrarás la planificación didáctica y la evaluación del curso (Anexos III, IV y V).");
  addParagraph("Además, en el ANEXO II \"CALENDARIO Y PLAN DE TRABAJO\" podrás encontrar el \"PLAN DE TRABAJO\" del que disponen los alumnos.");

  addNote("A través de la herramienta MI AGENDA del Campus Virtual, deberás programar e informar de las actividades y evaluación al alumnado.");

  addSubTitle("4.1 ¿CÓMO DEBE DESARROLLAR EL ALUMNO LA ACCIÓN FORMATIVA?");

  addSubTitle("A) INTRODUCCIÓN AL MÓDULO FORMATIVO");
  addBullet("Acudir al chat o sesión presencial de presentación.");
  addBullet("Consultar los objetivos y contenidos (PDF y vídeo de presentación).");
  addBullet("Realizar el test de conocimientos previos.");

  y += 3;
  addSubTitle("B) DESARROLLAR LA FORMACIÓN EN CAMPUS");
  addBullet("Estudiar los contenidos multimedia y ampliar con materiales complementarios.");
  addBullet("Consultar los documentos y vídeos de apoyo.");
  addBullet("Realizar las actividades de aprendizaje evaluables.");
  addBullet("Participar en los foros de debate.");

  y += 3;
  addSubTitle("C) REALIZAR LAS PRUEBAS DE EVALUACIÓN");
  addBullet("Test Final de evaluación en Campus.");
  addBullet("Cuestionario de Evaluación de la Calidad.");
  addBullet("Prueba de Evaluación Final Presencial en el centro de formación.");

  y += 4;
  addSubTitle("4.2 ¿QUÉ SE EVALÚA EN LA ACCIÓN FORMATIVA?");
  addParagraph("Durante toda la formación se va a llevar a cabo una evaluación sistemática y continua. Los instrumentos de evaluación definidos son:");
  addBullet("Evaluación diagnóstica: Cuestionario de conocimientos previos al inicio de cada módulo.");
  addBullet("Test de autoevaluación: Integrados en el CIM, con corrección automática.");
  addBullet("Actividades de aprendizaje: Individuales (entrega por Campus) y grupales (foro + documento final).");
  addBullet("Foros de debate: Número y calidad de las aportaciones.");
  addBullet("Tutorías presenciales: Actividades prácticas con observación directa.");
  addBullet("Test Final: Prueba tipo test con corrección automática.");
  addBullet("Prueba de evaluación final presencial: En el Centro de Formación.");

  y += 4;
  addSubTitle("Ponderación de la nota final por módulo:");

  checkPage(25);
  autoTable(doc, {
    startY: y,
    head: [["INSTRUMENTO DE EVALUACIÓN", "PESO"]],
    body: [
      ["Actividades de aprendizaje + Foros + Evaluación continua\n(Campus + Tutorías Presenciales)", "30%"],
      ["Prueba de evaluación final presencial\n(mínimo 5 puntos para superar)", "70%"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 5, lineColor: [200, 210, 230], lineWidth: 0.2 },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 1: { halign: "center", cellWidth: 25, fontStyle: "bold" } },
    alternateRowStyles: { fillColor: lightBg },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  addNote("Para superar la formación con evaluación positiva también se tendrán en cuenta los tiempos de acceso al Campus Virtual.");

  // ==================== SECTION 5 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("5. PROCEDIMIENTO DE SEGUIMIENTO DEL APRENDIZAJE Y EVALUACIÓN");

  addSubTitle("5.1 ¿QUIÉN, CÓMO Y CUÁNDO SE REALIZA EL SEGUIMIENTO?");
  addParagraph("El seguimiento del aprendizaje es responsabilidad directa del tutor-formador de cada módulo formativo. Deberás:");
  addBullet("Realizar un seguimiento diario del progreso de los alumnos a través del Campus Virtual.");
  addBullet("Controlar los tiempos de acceso y la realización de actividades.");
  addBullet("Contactar con los alumnos inactivos (más de 3 días sin acceder al Campus).");
  addBullet("Informar al coordinador de alumnos con riesgo de abandono.");
  addBullet("Generar informes de seguimiento periódicos a través de ADMINISTRACIÓN → SEGUIMIENTO → PROGRESOS.");
  addBullet("Registrar las comunicaciones mantenidas con los alumnos (correo, chat, foros, tutorías).");

  y += 4;
  addSubTitle("Herramientas de seguimiento en el Campus Virtual:");
  addBullet("Progresos: ADMINISTRACIÓN → SEGUIMIENTO → PROGRESOS (acceso, tiempo, actividades).");
  addBullet("Seguimiento de alumnos: ADMINISTRACIÓN → SEGUIMIENTO DE ALUMNOS (total accesos, tiempos, último acceso).");
  addBullet("Informes: ADMINISTRACIÓN → INFORMES (informe detallado de acceso por alumno).");
  addBullet("Seguimiento de tareas: ADMINISTRACIÓN → SEGUIMIENTO → SEGUIMIENTO DE TAREAS.");

  y += 4;
  addSubTitle("5.2 ¿QUIÉN, CÓMO Y CUÁNDO SE EVALÚA?");
  addParagraph("El tutor-formador es responsable de evaluar y registrar los resultados de las actividades de aprendizaje, participación en foros y pruebas de evaluación. Los resultados se comunican al alumno a través del Campus Virtual.");
  addBullet("Corregir las actividades de aprendizaje en un plazo máximo de 48 horas.");
  addBullet("Enviar al alumno la corrección y puntuación por correo electrónico del Campus.");
  addBullet("Registrar las calificaciones de las pruebas presenciales.");
  addBullet("Calcular la nota final conforme a la ponderación establecida (30% continua + 70% presencial).");

  y += 4;
  addSubTitle("5.3 ADAPTACIÓN DE LA PROGRAMACIÓN DIDÁCTICA");
  addParagraph("Cuando se detecten déficits en el proceso de aprendizaje de los alumnos, el tutor-formador deberá:");
  addBullet("Identificar las causas del bajo rendimiento mediante comunicación directa con el alumno.");
  addBullet("Proponer actividades de refuerzo y material complementario adicional.");
  addBullet("Adaptar la temporalización cuando sea posible y justificado.");
  addBullet("Coordinar con el resto del equipo docente las medidas correctivas necesarias.");
  addBullet("Documentar todas las adaptaciones realizadas para el expediente del alumno.");

  // ==================== SECTION 6 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("6. SISTEMA TUTORIAL");

  addSubTitle("6.1 TUTORÍAS VIRTUALES");
  addParagraph("Las tutorías virtuales constituyen el principal medio de interacción tutor-alumno en la modalidad de teleformación. Los canales disponibles son:");
  addBullet("Correo electrónico interno: Para consultas individuales. Tiempo de respuesta máximo: 24 horas laborables.");
  addBullet("Chat: Sesiones programadas según agenda para resolución de dudas en tiempo real.");
  addBullet("Foros: Para debate colectivo, dudas generales y actividades grupales.");
  addBullet("Videoconferencia: Sesiones de tutoría virtual programadas según calendario.");

  y += 4;
  addParagraph("Horario de atención tutorial: El tutor-formador deberá estar disponible en el Campus Virtual durante el horario de atención establecido, garantizando la atención a las consultas de los alumnos con un tiempo de respuesta máximo de 24-48 horas.");

  y += 4;
  addSubTitle("6.2 TUTORÍAS PRESENCIALES");
  addParagraph("Las tutorías presenciales se desarrollan en el Centro de Formación según la programación establecida. Se organizan de la siguiente manera:");
  addBullet("Sesiones presenciales programadas por módulo formativo según calendario.");
  addBullet("Desarrollo de actividades prácticas que requieren presencialidad.");
  addBullet("Evaluación mediante observación directa del desempeño del alumno.");
  addBullet("Registro de asistencia obligatorio.");

  y += 4;
  addParagraph("Como tutor-formador dispondrás de:");
  addBullet("CUADERNO DEL FORMADOR: Con toda la información sobre actividades y evaluación de las tutorías presenciales.");
  addBullet("CUADERNO DEL ALUMNO: Información que el alumno recibe sobre las tutorías presenciales.");
  addBullet("LISTA DE ASISTENCIA: Formato oficial para el control de asistencia.");

  // ==================== SECTION 7 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("7. GESTIÓN Y ADMINISTRACIÓN DE LA ACCIÓN FORMATIVA");

  addSubTitle("7.1 ALTAS Y BAJAS DE ALUMNOS");
  addParagraph("El proceso de altas y bajas de alumnos se gestiona a través del departamento de administración. El tutor-formador deberá informar de cualquier incidencia relacionada con la incorporación o abandono de alumnos.");

  addSubTitle("7.2 FORMACIÓN DE GRUPOS/EQUIPOS");
  addParagraph("Para las actividades grupales, deberás crear distintos grupos de trabajo e indicar a cada alumno a qué grupo pertenece. Utiliza los foros de actividad grupal para organizar las tareas.");

  addSubTitle("7.3 PROGRAMACIÓN Y SEGUIMIENTO DEL MÓDULO DE FORMACIÓN PRÁCTICA");
  addParagraph("En caso de que el certificado incluya módulo de prácticas profesionales no laborales, el tutor-formador deberá coordinar con el tutor de empresa el seguimiento del alumno durante las prácticas.");

  addSubTitle("7.4 COORDINACIÓN ENTRE TUTOR-FORMADOR, FORMADOR Y TUTOR DE EMPRESA");
  addParagraph("La coordinación entre los distintos miembros del equipo docente se realizará a través de:");
  addBullet("Foro de tutores-formadores en el Campus Virtual.");
  addBullet("Reuniones periódicas de coordinación (presenciales o virtuales).");
  addBullet("Correo electrónico interno del Campus.");

  y += 3;
  addSubTitle("7.5 PROCEDIMIENTO DE GESTIÓN DE INCIDENCIAS Y RECLAMACIONES");
  addParagraph("Ante cualquier incidencia o reclamación:");
  addBullet("Registrar la incidencia con detalle (fecha, alumno, descripción).");
  addBullet("Comunicar al coordinador del curso para su resolución.");
  addBullet("En caso de incidencias técnicas, derivar al CAU (Centro de Atención al Usuario).");
  addBullet("Documentar la resolución de la incidencia.");

  y += 4;
  addSubTitle("Gestión de tareas en el Campus");
  addParagraph("Para crear una nueva tarea: Administración → Configuración/Personalización → Gestión de tareas. Puedes crear ejercicios entregables y evaluables, indicando título, descripción, día de inicio y duración.");

  addSubTitle("Subir material complementario");
  addParagraph("Para subir nuevos documentos o vídeos: Administración → Configuración/Personalización → Mis archivadores. Selecciona la acción formativa y adjunta el material.");

  addSubTitle("Crear foros");
  addParagraph("Para crear nuevos foros de debate: Administración → Configuración/Personalización → Mis foros.");

  // ==================== SECTION 8 ====================
  doc.addPage();
  y = margin;

  addSectionTitle("8. RECURSOS DIDÁCTICOS PARA EL TUTOR-FORMADOR");
  addParagraph("En el Campus Virtual, además de los recursos didácticos disponibles para el alumno, vas a encontrar los recursos necesarios para llevar a cabo tu actividad como tutor-formador:");
  addBullet("Esta guía del tutor-formador en PDF — Documento oficial con toda la información necesaria para la tutorización.");
  addBullet("Documentos con la solución y sistema de corrección — Materiales con las soluciones y criterios de corrección de las actividades de aprendizaje planteadas en el Campus Virtual.");
  addBullet("Documentos con la planificación de actividades — Planificación de las actividades de aprendizaje y los instrumentos de evaluación que se desarrollarán/aplicarán en las sesiones de las Tutorías Presenciales en el Centro de formación.");
  addBullet("Documento por cada módulo formativo — Información sobre la planificación y sistema de corrección de la prueba de evaluación presencial final.");

  y += 6;
  addSubTitle("Recursos disponibles por módulo formativo:");

  const resourceRows = MODULES_SSC.map(m => [
    `MF${m.code}_3`,
    "• Contenido Interactivo Multimedia (CIM)\n• Manual en formato PDF\n• Material complementario\n• Actividades de aprendizaje con solucionario\n• Test Final con solucionario\n• Prueba de evaluación presencial + instrucciones",
  ]);

  checkPage(50);
  autoTable(doc, {
    startY: y,
    head: [["MÓDULO", "RECURSOS DISPONIBLES"]],
    body: resourceRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3.5, lineColor: [200, 210, 230], lineWidth: 0.2 },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 30, halign: "center", fontStyle: "bold", textColor: secondaryColor } },
    alternateRowStyles: { fillColor: lightBg },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  checkPage(25);
  addNote("Como tutor formador del módulo formativo debes implementar, una vez finalizada la formación del mismo, el cuestionario de satisfacción del tutor-formador. El análisis de resultados permitirá la mejora de la calidad de posteriores ediciones de la acción formativa.");

  // ==================== ADD FOOTERS ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    addFooter(doc, i);
  }

  // Save
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `Guia_Tutor_Formador_${centerName.replace(/\s+/g, '_')}_SSC_C_017_5B.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};
