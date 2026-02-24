import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FormativeUnit {
  id: string;
  title: string;
  duration_hours?: number | null;
  objectives?: string | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number;
  formative_units?: FormativeUnit[];
}

interface ProyectoFormativoParams {
  courseTitle: string;
  courseCode: string;
  durationHours: number;
  startDate?: string | null;
  endDate?: string | null;
  objectives?: string | null;
  professionalFamily?: string;
  qualificationLevel?: number | null;
  modules: Module[];
  centerName: string;
  centerPhone?: string;
  centerEmail?: string;
  centerAddress?: string;
  centerCity?: string;
  centerProvince?: string;
  centerPostalCode?: string;
  centerCif?: string;
  platformUrl?: string;
}

const BLUE_HEADER: [number, number, number] = [70, 100, 140];
const LIGHT_BLUE: [number, number, number] = [200, 215, 235];
const WHITE: [number, number, number] = [255, 255, 255];

export function generateProyectoFormativoPDF(params: ProyectoFormativoParams) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const formatDate = (d?: string | null) => {
    if (!d) return "Por determinar";
    return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // ===== HELPER FUNCTIONS =====
  const addPageNumber = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(String(i), pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
    }
  };

  const checkPageBreak = (needed: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY + needed > pageHeight - 20) {
      doc.addPage();
      currentY = margin;
    }
  };

  const sectionTitle = (text: string) => {
    checkPageBreak(15);
    doc.setFillColor(...BLUE_HEADER);
    doc.rect(margin, currentY, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(text, margin + 3, currentY + 5.5);
    doc.setTextColor(0);
    currentY += 10;
  };

  // ===== PAGE 1: COVER =====
  currentY = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...BLUE_HEADER);
  doc.text("PROYECTO FORMATIVO", pageWidth / 2, currentY, { align: "center" });
  currentY += 14;
  doc.setFontSize(22);
  doc.text("AULA VIRTUAL", pageWidth / 2, currentY, { align: "center" });
  currentY += 20;

  doc.setDrawColor(...BLUE_HEADER);
  doc.setLineWidth(0.5);
  doc.line(margin + 20, currentY, pageWidth - margin - 20, currentY);
  currentY += 15;

  doc.setTextColor(50);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICADO PROFESIONAL:", margin + 10, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const cpText = `${params.courseCode} - ${params.courseTitle}`;
  const cpLines = doc.splitTextToSize(cpText, contentWidth - 20);
  currentY += 6;
  doc.text(cpLines, margin + 10, currentY);
  currentY += cpLines.length * 5 + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EXPEDIENTE:", margin + 10, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("(A cumplimentar antes del inicio de la acción formativa)", margin + 42, currentY);
  currentY += 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CENTRO DE FORMACIÓN:", margin + 10, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(params.centerName, margin + 56, currentY);
  currentY += 8;
  if (params.centerCif) {
    doc.text(`CIF: ${params.centerCif}`, margin + 10, currentY);
    currentY += 6;
  }
  if (params.centerAddress) {
    doc.text(`${params.centerAddress}`, margin + 10, currentY);
    currentY += 5;
    doc.text(`${params.centerPostalCode || ""} ${params.centerCity || ""} (${params.centerProvince || ""})`, margin + 10, currentY);
  }

  // ===== PAGE 2: INSTRUCCIONES =====
  doc.addPage();
  currentY = margin;
  sectionTitle("INSTRUCCIONES");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const instrText = [
    "El presente Anexo al proyecto formativo, deberá de cumplimentarse y entregarse para la impartición a través de aula virtual, tal y como recoge el artículo 28, de la orden 178/2020, de 19 de noviembre.",
    "",
    "Este anexo diseñado para la formación auxiliar a través de aula virtual, consta de:",
    "  1. Los datos de los recursos humanos y técnicos.",
    "  2. La programación de los contenidos impartidos a través del aula virtual.",
    "",
    "Se recuerda, así mismo:",
    "  1. Que se considera aula virtual, al entorno de aprendizaje, donde el formador/a y el alumnado interactúan, de forma concurrente y en tiempo real, a través de un sistema de comunicación telemático de carácter síncrono.",
    "  2. No se podrá utilizar el aula virtual para la realización de la prueba final de módulo.",
    "  3. A título orientativo, en aquellos certificados profesionales que posean \"Especificaciones de los certificados profesionales en modalidad de teleformación\" en forma de ficha, en el anexo I de la Orden ESS/1897/2013, de 10 de octubre, se pueden consultar que contenidos son los idóneos para su impartición a través de esta modalidad.",
    "",
    "El presente F-11 sólo se debe cumplimentar para aquellos contenidos que se vayan a impartir mediante aula virtual.",
    "",
    "Este documento se debe presentar cuando se comunique el uso del aula virtual, a través de \"incidencias/otras\"."
  ];

  instrText.forEach(line => {
    const lines = doc.splitTextToSize(line || " ", contentWidth - 6);
    checkPageBreak(lines.length * 4 + 2);
    doc.text(lines, margin + 3, currentY);
    currentY += lines.length * 4 + 1;
  });

  // ===== PAGE 3: RECURSOS HUMANOS Y TÉCNICOS =====
  doc.addPage();
  currentY = margin;
  sectionTitle("RECURSOS HUMANOS Y TÉCNICOS DEL AULA VIRTUAL");
  currentY += 2;

  // Recursos Humanos table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("RECURSOS HUMANOS", margin + 3, currentY + 4);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: "Nombre del tutor/a\n-formador/a responsable:", styles: { cellWidth: 45 } },
        { content: "(A cumplimentar con datos del tutor asignado)" },
        { content: "Teléfono de contacto:", styles: { cellWidth: 35 } },
        { content: params.centerPhone || "", styles: { cellWidth: 35 } }
      ]
    ],
    body: [
      [
        { content: "E-mail", styles: { fontStyle: "bold" } },
        { content: params.centerEmail || "(A cumplimentar)", colSpan: 3 }
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: LIGHT_BLUE, textColor: [0, 0, 0], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Datos del aula - Acceso alumnado
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "DATOS DEL AULA ON-LINE ACCESO ALUMNADO", colSpan: 2, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [{ content: "Aula virtual (nombre):", styles: { fontStyle: "bold" } }, "TalentCloud Solution - Campus Virtual"],
      [{ content: "URL:", styles: { fontStyle: "bold" } }, params.platformUrl || "https://campus.talentcloudsolution.com"],
      [{ content: "Usuario:", styles: { fontStyle: "bold" } }, "(Se proporcionará individualmente al alumnado)"],
      [{ content: "Contraseña:", styles: { fontStyle: "bold" } }, "(Se proporcionará individualmente al alumnado)"]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 45 } },
    styles: { cellPadding: 3 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Datos del aula - Acceso administrador
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "DATOS DEL AULA ON-LINE ACCESO AL ADMINISTRADOR", colSpan: 3, styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [
        { content: "URL:", styles: { fontStyle: "bold" } },
        { content: "Usuario:", styles: { fontStyle: "bold" } },
        { content: "Contraseña:", styles: { fontStyle: "bold" } }
      ],
      [
        params.platformUrl || "https://campus.talentcloudsolution.com",
        "(Datos reservados)",
        "(Datos reservados)"
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });

  // ===== PAGES: F11 - PROGRAMACIÓN DIDÁCTICA POR MÓDULO/UF =====
  params.modules.forEach((mod) => {
    const moduleHours = mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : 0;
    const units = mod.formative_units || [];

    doc.addPage();
    currentY = margin;

    sectionTitle("F11- PROGRAMACIÓN DIDÁCTICA CP CON UNIDADES FORMATIVAS (UF)");
    currentY += 2;

    // Header info table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: "DURACIÓN DE LA ACCIÓN", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
          { content: `${params.durationHours} horas` },
          { content: "FECHAS DE INICIO", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
          { content: formatDate(params.startDate) },
          { content: "FECHAS FIN", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
          { content: formatDate(params.endDate) }
        ]
      ],
      theme: "grid",
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 2 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // CP, Module, UF identification
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: "CÓDIGO Y DENOMINACIÓN DEL\nCERTIFICADO PROFESIONAL", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } },
          { content: `${params.courseCode} - ${params.courseTitle}` }
        ],
        [
          { content: "CÓDIGO Y DENOMINACIÓN DEL\nMÓDULO FORMATIVO", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 55 } },
          { content: mod.title }
        ]
      ],
      theme: "grid",
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 3 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Objetivo general del módulo
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[{ content: "OBJETIVO GENERAL DEL MÓDULO FORMATIVO / MÓDULO PROFESIONAL", colSpan: 1, styles: { fillColor: BLUE_HEADER } }]],
      body: [
        [{ content: mod.description || "Según lo especificado en el Certificado Profesional correspondiente." }]
      ],
      theme: "grid",
      headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 4 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // For each UF in this module
    if (units.length > 0) {
      units.forEach((uf, ufIdx) => {
        checkPageBreak(80);

        // UF header
        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          body: [
            [
              { content: "UNIDAD FORMATIVA (UF)", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 45 } },
              { content: uf.title },
              { content: "HORAS", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: 20 } },
              { content: `${uf.duration_hours || 0}h`, styles: { cellWidth: 20 } }
            ]
          ],
          theme: "grid",
          bodyStyles: { fontSize: 8 },
          styles: { cellPadding: 3 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 3;

        // Main programming table for this UF
        const objectivesText = uf.objectives || "Logro de los resultados de aprendizaje expresados en las capacidades y criterios de evaluación del Certificado Profesional.";

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [[
            { content: "Objetivos específicos\n(Capacidades y criterios\nde evaluación)", styles: { cellWidth: 40 } },
            { content: "Contenidos" },
            { content: "Estrategias metodológicas,\nactividades de aprendizaje\ny recursos didácticos" },
            { content: "AULA / TALLER\n(espacios, instalaciones\ny equipamiento)", styles: { cellWidth: 35 } },
            { content: "EN LA\nEMPRESA\n(X)", styles: { cellWidth: 18 } }
          ]],
          body: [[
            { content: objectivesText },
            { content: getContentsForUF(uf.title) },
            { content: getMethodologyForUF() },
            { content: "Campus Virtual\nTalentCloud Solution\n\nAula virtual síncrona\n(videoconferencia)\n\nPlataforma LMS" },
            { content: "" }
          ]],
          theme: "grid",
          headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 7, valign: "top" },
          styles: { cellPadding: 3, minCellHeight: 40 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;

        // Evaluation criteria table for this UF
        checkPageBreak(40);

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [[
            { content: `Capacidades y Criterios de Evaluación - ${uf.title}`, colSpan: 2, styles: { fillColor: BLUE_HEADER } }
          ]],
          body: getCriteriaRowsForUF(uf, ufIdx),
          theme: "grid",
          headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8, fontStyle: "bold" },
          bodyStyles: { fontSize: 7 },
          styles: { cellPadding: 3 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      });
    } else {
      // Module without UFs
      checkPageBreak(50);
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [[
          { content: "Objetivos específicos" },
          { content: "Contenidos y recursos didácticos" },
          { content: "Estrategias metodológicas" },
          { content: "AULA / TALLER" },
          { content: "EN LA EMPRESA (X)", styles: { cellWidth: 20 } }
        ]],
        body: [[
          { content: mod.description || "Según Certificado Profesional" },
          { content: "Contenidos según el módulo formativo del Certificado Profesional." },
          { content: getMethodologyForUF() },
          { content: "Campus Virtual\nTalentCloud Solution" },
          { content: "" }
        ]],
        theme: "grid",
        headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 7, valign: "top" },
        styles: { cellPadding: 3, minCellHeight: 35 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  // ===== LAST PAGE: F11 - PRL =====
  doc.addPage();
  currentY = margin;
  sectionTitle("F11- PROGRAMACIÓN DIDÁCTICA. CONTENIDO PREVENCIÓN DE RIESGOS LABORALES");
  currentY += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("La formación en PRL es obligatoria para todo el alumnado que tenga que hacer FORMACIÓN EN EMPRESAS", margin + 3, currentY);
  doc.text("y debe justificarse la formación recibida.", margin + 3, currentY + 4);
  currentY += 12;

  // PRL options table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      { content: "ENTIDAD IMPARTIDORA" },
      { content: "MODALIDAD DE FORMACIÓN" },
      { content: "PROGRAMA" }
    ]],
    body: [
      [
        "☐ Formación impartida por el centro de formación.\n☐ Formación impartida por empresa externa.",
        "☐ Presencial\n☒ Teleformación",
        "☐ Formación complementaria\n☐ Formación propia\n☒ Módulo formativo dentro del CP"
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 4 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // PRL dates
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: [
      [
        { content: "Fecha inicio formación PRL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        { content: formatDate(params.startDate) },
        { content: "Fecha fin formación PRL:", styles: { fontStyle: "bold", fillColor: LIGHT_BLUE } },
        { content: formatDate(params.endDate) }
      ]
    ],
    theme: "grid",
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // PRL Objetivos
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "OBJETIVO GENERAL DEL MÓDULO DE PRL", styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [{ content: "Adquirir los conocimientos básicos sobre prevención de riesgos laborales necesarios para el desarrollo de las prácticas profesionales no laborales en empresas." }]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 4 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // PRL Competencias
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[{ content: "COMPETENCIAS QUE SE ADQUIEREN CON LA FORMACIÓN DE PRL", styles: { fillColor: BLUE_HEADER } }]],
    body: [
      [{ content: "1. Resaltar la importancia de la cultura preventiva en todos los ámbitos de la empresa." }],
      [{ content: "2. Clasificar y describir los tipos de daños profesionales (accidentes de trabajo y enfermedades profesionales)." }],
      [{ content: "3. Determinar la evaluación de riesgos y definir técnicas de prevención y protección." }],
      [{ content: "4. Realizar el análisis de los protocolos de actuación en caso de emergencia." }],
      [{ content: "5. Determinar los principales derechos y deberes en materia de prevención de riesgos laborales." }],
      [{ content: "6. Clasificar las distintas formas de gestión de la prevención en la empresa." }],
      [{ content: "7. Valorar la importancia del plan preventivo y su contenido." }],
      [{ content: "8. Determinar los requisitos para la vigilancia de la salud." }],
      [{ content: "9. Identificar las técnicas básicas de primeros auxilios." }]
    ],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 7 },
    styles: { cellPadding: 3 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // PRL Evaluation
  checkPageBreak(30);
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      { content: "Espacios, Instalaciones\ny equipamiento" },
      { content: "Contenidos" },
      { content: "Estrategias metodológicas" },
      { content: "PRUEBA DE EVALUACIÓN" }
    ]],
    body: [[
      "Campus Virtual\nTalentCloud Solution\n(Plataforma LMS)",
      "Contenidos de PRL integrados\nen el módulo formativo del\nCertificado Profesional.",
      "Contenido Interactivo Multimedia\nTest de autoevaluación\nActividades prácticas",
      "Test de evaluación tipo test\nFecha: Por determinar"
    ]],
    theme: "grid",
    headStyles: { fillColor: BLUE_HEADER, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" },
    bodyStyles: { fontSize: 7, valign: "top" },
    styles: { cellPadding: 3, minCellHeight: 30 }
  });

  // Add page numbers
  addPageNumber();

  // Save
  const fileName = `Proyecto_Formativo_Aula_Virtual_${params.courseCode.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
}

// ===== HELPER: Contents for a UF =====
function getContentsForUF(ufTitle: string): string {
  return `Contenidos formativos según el Certificado Profesional:\n\n- Contenidos teóricos de la unidad formativa\n- Ejercicios prácticos y supuestos\n- Material complementario\n- Recursos multimedia interactivos\n\n(Según lo especificado en el CP para la UF: ${ufTitle})`;
}

// ===== HELPER: Methodology =====
function getMethodologyForUF(): string {
  return [
    "• Contenido Interactivo Multimedia (CIM)",
    "• Actividades de aprendizaje evaluables",
    "• Foros temáticos por unidad",
    "• Tests de autoevaluación",
    "• Tutorías virtuales síncronas",
    "• Tutorías presenciales",
    "• Cuaderno del alumno",
    "• Recursos complementarios (vídeos, documentos, casos prácticos)"
  ].join("\n");
}

// ===== HELPER: Criteria rows =====
function getCriteriaRowsForUF(uf: FormativeUnit, index: number): string[][] {
  if (uf.objectives) {
    // Parse objectives - they may contain multiple C entries
    const parts = uf.objectives.split(/(?=C\d+:)/);
    return parts.map((part) => {
      const trimmed = part.trim();
      const match = trimmed.match(/^(C\d+):\s*(.*)/s);
      if (match) {
        return [
          { content: match[1], styles: { fontStyle: "bold", cellWidth: 25 } } as any,
          match[2].trim()
        ];
      }
      return [
        { content: `C${index + 1}`, styles: { fontStyle: "bold", cellWidth: 25 } } as any,
        trimmed
      ];
    });
  }

  return [
    [
      { content: `C${index + 1}`, styles: { fontStyle: "bold", cellWidth: 25 } } as any,
      "Según las capacidades y criterios de evaluación descritos en el Certificado Profesional."
    ]
  ];
}
