import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { studentGuideContent } from './studentGuideContent';

interface CenterBranding {
  centerName: string;
  centerLogo?: string;
  primaryColor?: string;
}

// Color principal teal similar al de las capturas
const TEAL_COLOR: [number, number, number] = [0, 128, 128];
const DARK_TEAL: [number, number, number] = [0, 102, 102];
const LIGHT_TEAL: [number, number, number] = [230, 245, 245];
const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY: [number, number, number] = [128, 128, 128];

export const generateStudentGuidePDF = async (
  courseTitle: string,
  branding: CenterBranding
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 25;
  let currentPage = 1;

  // Helper para añadir nueva página
  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    yPos = 25;
    addHeader();
  };

  // Helper para verificar salto de página
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - 30) {
      addNewPage();
    }
  };

  // Añadir header "GUÍA DEL ALUMNO" en cada página
  const addHeader = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...TEAL_COLOR);
    doc.text('GUÍA DEL ALUMNO', pageWidth - margin, 15, { align: 'right' });
  };

  // Añadir título de sección principal (ej: "1. PRESENTACIÓN")
  const addMainSectionTitle = (number: string, title: string) => {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(`${number}. ${title}`, margin, yPos);
    yPos += 12;
  };

  // Añadir subtítulo de subsección (ej: "2.1 IDENTIFICACIÓN")
  const addSubsectionTitle = (number: string, title: string) => {
    checkPageBreak(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(`${number} ${title}`, margin, yPos);
    yPos += 8;
  };

  // Añadir caja de información con fondo teal
  const addInfoBox = (text: string, fullWidth = true) => {
    const boxWidth = fullWidth ? contentWidth : contentWidth * 0.9;
    const xPos = fullWidth ? margin : margin + (contentWidth - boxWidth) / 2;
    
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(text, boxWidth - 10);
    const boxHeight = lines.length * 4.5 + 8;
    
    checkPageBreak(boxHeight + 5);
    
    // Fondo teal
    doc.setFillColor(...TEAL_COLOR);
    doc.rect(xPos, yPos - 4, boxWidth, boxHeight, 'F');
    
    // Texto blanco
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    lines.forEach((line: string, index: number) => {
      doc.text(line, xPos + 5, yPos + (index * 4.5) + 2);
    });
    
    yPos += boxHeight + 5;
    doc.setTextColor(...BLACK);
  };

  // Añadir párrafo de texto normal
  const addParagraph = (text: string, fontSize = 10) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.45;
    });
    yPos += 4;
  };

  // Añadir lista con viñetas
  const addBulletList = (items: string[]) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    
    items.forEach((item) => {
      checkPageBreak(8);
      // Viñeta cuadrada teal
      doc.setFillColor(...TEAL_COLOR);
      doc.rect(margin + 1, yPos - 2.5, 2.5, 2.5, 'F');
      
      const lines = doc.splitTextToSize(item, contentWidth - 10);
      lines.forEach((line: string, index: number) => {
        doc.text(line, margin + 8, yPos + (index * 4.5));
      });
      yPos += lines.length * 4.5 + 2;
    });
    yPos += 3;
  };

  // Añadir caja con borde lateral izquierdo teal (estilo de las capturas)
  const addBorderedBox = (title: string, content: string[], letter?: string) => {
    const boxWidth = contentWidth - 10;
    const xPos = margin + 5;
    const lineHeight = 5;
    
    // Calcular altura necesaria
    let totalLines = 0;
    const formattedContent = content.map(item => {
      const lines = doc.splitTextToSize(item, boxWidth - 15);
      totalLines += lines.length;
      return lines;
    });
    
    const titleHeight = title ? 10 : 0;
    const boxHeight = titleHeight + (totalLines * lineHeight) + 15;
    
    checkPageBreak(boxHeight + 10);
    
    // Borde izquierdo teal grueso
    doc.setFillColor(...TEAL_COLOR);
    doc.rect(xPos - 3, yPos - 4, 4, boxHeight, 'F');
    
    // Contorno del recuadro
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(xPos + 1, yPos - 4, boxWidth, boxHeight);
    
    let currentY = yPos;
    
    // Título en negrita si existe
    if (title) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BLACK);
      
      const fullTitle = letter ? `${letter}) ${title}` : title;
      doc.text(fullTitle, xPos + 8, currentY + 3);
      currentY += 12;
    }
    
    // Contenido
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    
    content.forEach((item, itemIndex) => {
      formattedContent[itemIndex].forEach((line: string, lineIndex: number) => {
        const prefix = lineIndex === 0 && item.trim().match(/^[a-z]\)/) ? '' : 
                      lineIndex === 0 ? '    ' : '    ';
        doc.text(prefix + line, xPos + 8, currentY);
        currentY += lineHeight;
      });
    });
    
    yPos += boxHeight + 8;
  };

  // Añadir tabla de módulos formativos con fechas (como en las capturas)
  const addModulosFormativosTable = () => {
    checkPageBreak(120);
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS FORMATIVOS', 'HORAS', 'FECHA INICIO', 'FECHA FIN', 'TUTORÍAS PRESENCIALES (*)', 'PRUEBA DE EVALUACIÓN FINAL (*) (**)']],
      body: [
        ['MF0969_1 Técnicas administrativas básicas de oficina', '150', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo'],
        ['   UF0517: Organización empresarial y de recursos humanos', '30', '', '', '', ''],
        ['   UF0518: Gestión auxiliar de la correspondencia y paquetería', '30', '', '', '', ''],
        ['   UF0519: Gestión auxiliar de documentación económico-administrativa', '90', '', '', '', ''],
        ['MF0970_1 Operaciones básicas de comunicación', '120', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo'],
        ['   UF0520: Comunicación en las relaciones profesionales', '50', '', '', '', ''],
        ['   UF0521: Comunicación oral y escrita en la empresa', '70', '', '', '', ''],
        ['MF0971_1 Reproducción y archivo', '120', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo'],
        ['   UF0513: Gestión auxiliar de archivo', '60', '', '', '', ''],
        ['   UF0514: Gestión auxiliar de reproducción', '60', '', '', '', ''],
        ['MP0112: Módulo de prácticas profesionales no laborales', '40', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', '-', '-'],
      ],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: BLACK,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: LIGHT_TEAL,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 5;
    
    // Notas al pie
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.text('(*) En estas fechas deberás asistir a las sesiones de tutorías y pruebas de evaluación presenciales en el Centro de Formación.', margin, yPos);
    yPos += 5;
    doc.text('(**) De forma excepcional, la prueba de evaluación se podrá desarrollar al finalizar cada unidad formativa.', margin, yPos);
    yPos += 10;
  };

  // Añadir tabla de aplicaciones informáticas requeridas
  const addAplicacionesInformaticasTable = () => {
    checkPageBreak(80);
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS FORMATIVOS', 'UNIDADES FORMATIVAS', 'APLICACIONES INFORMÁTICAS', 'INSTRUCCIONES PARA ACCEDER']],
      body: [
        ['MF0969_1\nTécnicas administrativas básicas de oficina', 'UF0517\nUF0518\nUF0519', 'Microsoft Office (Word, Excel)\nLibreOffice\nPDF Reader', 'En el Contenido Interactivo Multimedia (CIM) encontrarás un enlace y las instrucciones para descargarte esta/s aplicación/es informática/s'],
        ['MF0970_1\nOperaciones básicas de comunicación', 'UF0520\nUF0521', 'Microsoft Outlook o similar\nNavegador web', 'Tu tutor-formador te facilitará las instrucciones y las claves para acceder a esta/s aplicación/es informática/s'],
        ['MF0971_1\nReproducción y archivo', 'UF0513\nUF0514', 'Sistemas de gestión de archivos\nSoftware de digitalización', 'En la UD correspondiente del CIM encontrarás el enlace y las instrucciones'],
      ],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: BLACK,
        valign: 'top',
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 55 },
      },
      alternateRowStyles: {
        fillColor: LIGHT_TEAL,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir sección con icono y texto (para descripciones tipo CIM)
  const addIconSection = (title: string, description: string, isLink = false) => {
    checkPageBreak(20);
    
    // Icono cuadrado con borde teal
    doc.setFillColor(...LIGHT_TEAL);
    doc.setDrawColor(...TEAL_COLOR);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 4, 8, 8, 'FD');
    
    // Título en teal (subrayado si es link)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(title, margin + 12, yPos);
    
    if (isLink) {
      doc.line(margin + 12, yPos + 1, margin + 12 + doc.getTextWidth(title), yPos + 1);
    }
    
    yPos += 6;
    
    // Descripción
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    
    const lines = doc.splitTextToSize(description, contentWidth - 15);
    lines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 12, yPos);
      yPos += 4.5;
    });
    
    yPos += 5;
  };

  // Añadir tabla con estilo profesional
  const addTable = (headers: string[], rows: string[][], columnWidths?: number[]) => {
    checkPageBreak(30);
    
    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: LIGHT_TEAL,
      },
      columnStyles: columnWidths ? 
        columnWidths.reduce((acc, width, index) => {
          acc[index] = { cellWidth: width };
          return acc;
        }, {} as Record<number, { cellWidth: number }>) : undefined,
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir tabla de identificación del certificado
  const addIdentificationTable = () => {
    checkPageBreak(60);
    
    // Header DENOMINACIÓN
    autoTable(doc, {
      startY: yPos,
      head: [['DENOMINACIÓN:']],
      body: [['Operaciones auxiliares de servicios administrativos y generales (RD 645/2011 de 9 de mayo)']],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
        halign: 'left',
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY;
    
    // Segunda fila: Código, Familia, Nivel
    autoTable(doc, {
      startY: yPos,
      head: [['CÓDIGO:', 'FAMILIA PROFESIONAL:', 'NIVEL DE CUALIFICACIÓN PROFESIONAL:']],
      body: [['ADGG0408', 'Administración y gestión', '1']],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50 },
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY;
    
    // Cualificación de referencia
    autoTable(doc, {
      startY: yPos,
      head: [['CUALIFICACIÓN PROFESIONAL DE REFERENCIA:']],
      body: [['ADG305_1 Operaciones auxiliares de servicios administrativos y generales (RD 107/2008, de 1 de febrero).']],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir tabla del itinerario formativo
  const addItinerarioTable = () => {
    checkPageBreak(80);
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS FORMATIVOS', 'HORAS']],
      body: [
        ['MF0969_1 Técnicas administrativas básicas de oficina', '150'],
        ['   UF0517: Organización empresarial y de recursos humanos', '30'],
        ['   UF0518: Gestión auxiliar de la correspondencia y paquetería', '30'],
        ['   UF0519: Gestión auxiliar de documentación económico-administrativa', '90'],
        ['MF0970_1 Operaciones básicas de comunicación', '120'],
        ['   UF0520: Comunicación en las relaciones profesionales', '50'],
        ['   UF0521: Comunicación oral y escrita en la empresa', '70'],
        ['MF0971_1 Reproducción y archivo', '120'],
        ['   UF0513: Gestión auxiliar de archivo en soporte convencional o informático', '60'],
        ['   UF0514: Gestión auxiliar de reproducción en soporte convencional o informático', '60'],
        ['MP0112: Módulo de prácticas profesionales no laborales', '40'],
      ],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
      },
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 30, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: LIGHT_TEAL,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir tabla de objetivos por módulo
  const addObjetivosTable = () => {
    checkPageBreak(100);
    
    const objetivosData = [
      ['UF0517: Organización empresarial y de recursos humanos', 
       '• Representar las funciones básicas y los flujos de información en estructuras organizativas.\n• Identificar criterios de actuación profesional para la integración y cooperación de actividades.'],
      ['UF0518: Gestión auxiliar de la correspondencia', 
       '• Aplicar técnicas básicas de recepción, clasificación y distribución de paquetería y correo.'],
      ['UF0519: Gestión auxiliar de documentación', 
       '• Aplicar técnicas de registro y clasificación de documentación administrativa.\n• Operar con medios de pago básicos.\n• Aplicar procedimientos de control de existencias.'],
      ['UF0520: Comunicación en las relaciones profesionales', 
       '• Aplicar técnicas de comunicación efectiva.\n• Aplicar pautas de comportamiento asertivo.\n• Aplicar pautas para tratamiento de conflictos.'],
      ['UF0521: Comunicación oral y escrita', 
       '• Aplicar técnicas de comunicación escrita.\n• Utilizar técnicas de comunicación presencial.\n• Utilizar técnicas de comunicación telefónica y telemática.'],
      ['UF0513: Gestión auxiliar de archivo', 
       '• Utilizar funciones básicas de sistemas operativos.\n• Aplicar técnicas de archivo y clasificación.\n• Utilizar funciones básicas de bases de datos.'],
      ['UF0514: Gestión auxiliar de reproducción', 
       '• Comprobar funcionamiento de equipos de reproducción.\n• Utilizar útiles de reprografía.\n• Utilizar materiales de encuadernación.'],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS FORMATIVOS', 'OBJETIVOS']],
      body: objetivosData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: TEAL_COLOR,
        textColor: WHITE,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: BLACK,
        valign: 'top',
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 115 },
      },
      alternateRowStyles: {
        fillColor: LIGHT_TEAL,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir tabla de criterios de acceso
  const addCriteriosAccesoTable = () => {
    checkPageBreak(80);
    
    autoTable(doc, {
      startY: yPos,
      body: [
        [{ content: 'CRITERIOS DE ACCESO', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' } }, 
         'Poseer las competencias claves en materia lingüística, matemática y/o social que se determine en cada módulo del certificado de profesionalidad (Nivel 1).'],
      ],
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 45, halign: 'center', valign: 'middle' },
        1: { cellWidth: 125 },
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir tabla de salidas laborales
  const addSalidasLaboralesTable = () => {
    checkPageBreak(100);
    
    autoTable(doc, {
      startY: yPos,
      body: [
        [{ content: 'ENTORNO PROFESIONAL:', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold', valign: 'middle' } }, 
         { content: 'Ámbito profesional:\n\nEste profesional desarrolla su actividad por cuenta ajena, en cualquier empresa o entidad del sector privado o público, principalmente en oficinas, despachos o departamentos de administración o servicios generales.', styles: { fillColor: LIGHT_TEAL } }],
        [{ content: '', styles: { fillColor: TEAL_COLOR } }, 
         { content: 'Sectores productivos:\n\nEstá presente en todos los sectores productivos, así como en la Administración Pública, destacando por su alto grado de transectorialidad.', styles: { fillColor: WHITE } }],
        [{ content: '', styles: { fillColor: TEAL_COLOR } }, 
         { content: 'Ocupaciones o puestos de trabajo relacionados:\n\n• 4423.1013 Operadores/as de central telefónica\n• 4424.1016 Teleoperadores/as\n• 4412.1057 Recepcionistas-telefonistas en oficinas\n• 4446.1010 Empleados/as de ventanilla de correos\n• 4221.1011 Clasificadores/as-repartidores/as de correspondencia\n• 9431.1020 Ordenanzas\n• 5500.1036 Taquilleros/as\n• Auxiliar de servicios generales\n• Auxiliar de oficina\n• Auxiliar de archivo', styles: { fillColor: LIGHT_TEAL } }],
      ],
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 45, halign: 'center' },
        1: { cellWidth: 125 },
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
      },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Añadir tabla de requisitos técnicos
  const addRequisitosTable = () => {
    checkPageBreak(80);
    
    addInfoBox('REQUISITOS TÉCNICOS DEL SISTEMA');
    
    yPos += 3;
    
    addBulletList([
      'CONEXIÓN A INTERNET: Se recomienda un ancho de banda mínimo de 1 Mbps.',
    ]);
    
    addSubsectionTitle('', 'NAVEGADORES Y VERSIONES:');
    addParagraph('Se pueden utilizar los siguientes navegadores:', 9);
    addBulletList([
      'Internet Explorer, versiones superior o igual a 10.0',
      'Mozilla Firefox, versiones superior o igual a 5.0',
      'Google Chrome, versiones superior o igual a 5.0',
    ]);
    
    addBulletList([
      'RESOLUCIÓN MÍNIMA DE PANTALLA: Se aconseja una resolución mínima de pantalla de 1024 x 768 píxeles.',
      'OFFICE: 2003 o superior.',
      'JAVA: http://www.java.com/es/download',
      'ACROBAT READER: http://get.adobe.com/es/reader/',
    ]);
  };

  // ============ GENERAR EL PDF ============
  
  // Primera página - Header
  addHeader();
  
  // SECCIÓN 1: PRESENTACIÓN
  addMainSectionTitle('1', 'PRESENTACIÓN');
  addParagraph('Estimado/a alumno/a, antes de nada queremos darte la bienvenida a tu curso.');
  yPos += 3;
  addParagraph('A lo largo del curso vamos a acompañarte en tu proceso formativo de una manera cercana y ofreciéndote todo nuestro apoyo para que puedas sacar el máximo provecho de la formación.');
  yPos += 3;
  addParagraph('Se trata de un trabajo en equipo, entre todos los que formamos parte de nuestro Centro (alumnos, tutores, orientadores, dirección,…), donde tu interés y motivación es vital para que podamos alcanzar juntos los objetivos planteados. Por ello, vamos a estar en continuo contacto para comprobar tus progresos, resolver tus dudas y orientarte en todos los aspectos que necesites.');
  
  yPos += 10;
  
  // SECCIÓN 2: ASPECTOS GENERALES
  addMainSectionTitle('2', 'ASPECTOS GENERALES DEL CERTIFICADO DE PROFESIONALIDAD');
  
  addSubsectionTitle('2.1', 'IDENTIFICACIÓN');
  addParagraph('Este curso se corresponde con el certificado de profesionalidad:');
  yPos += 3;
  addIdentificationTable();
  
  addSubsectionTitle('2.2', 'ITINERARIO FORMATIVO');
  addParagraph('Se compone de los siguientes módulos y unidades formativas:');
  yPos += 3;
  addItinerarioTable();
  
  addSubsectionTitle('2.3', 'OBJETIVOS GENERALES');
  addParagraph('Con este curso aprenderás a distribuir, reproducir y transmitir la información y documentación requeridas en las tareas administrativas y de gestión, internas y externas, así como realizar trámites elementales de verificación de datos y documentos.');
  yPos += 5;
  addParagraph('A continuación podrás ver las capacidades que desarrollarás en cada módulo formativo/unidad formativa:');
  yPos += 3;
  addObjetivosTable();
  
  addSubsectionTitle('2.4', 'MÓDULO DE PRÁCTICAS: FORMACIÓN PRÁCTICA EN CENTROS DE TRABAJO');
  addParagraph('El módulo de formación práctica en centros de trabajo se realiza, preferentemente, una vez hayas superado el resto de módulos formativos del certificado de profesionalidad al que corresponde tu curso.');
  addParagraph('Este módulo de formación práctica puede comenzar hasta cuatro meses después de que hayas finalizado tu formación.');
  addParagraph('En el caso de que dispongas de alguna experiencia en alguna ocupación relacionada con el certificado de profesionalidad, podrás solicitar la exención de este módulo ante la Administración.');
  
  yPos += 5;
  
  addSubsectionTitle('2.5', 'REQUISITOS DE ACCESO Y PRUEBA DE COMPETENCIA DIGITAL');
  addParagraph('Este curso está dirigido a todas aquellas personas que deseen desarrollar su actividad profesional en cualquier empresa o entidad del sector privado o público, principalmente en oficinas, despachos o departamentos de administración o servicios generales.');
  yPos += 3;
  addParagraph('Para acceder a este curso, correspondiente a un certificado de profesionalidad de nivel 1, deberás cumplir alguno de los siguientes requisitos:');
  yPos += 3;
  addCriteriosAccesoTable();
  
  addParagraph('Nota: para poder desarrollar el certificado de profesionalidad en modalidad teleformación has debido superar la prueba de competencia tecnológica que se habrá realizado antes del inicio de la acción formativa.', 9);
  yPos += 5;
  
  addSubsectionTitle('2.6', 'SALIDAS LABORALES');
  addParagraph('Con este certificado de profesionalidad podrás acceder a los siguientes sectores y ocupaciones:');
  yPos += 3;
  addSalidasLaboralesTable();
  
  // SECCIÓN 3: CAMPUS VIRTUAL
  addMainSectionTitle('3', 'EL CAMPUS VIRTUAL Y LAS APLICACIONES INFORMÁTICAS');
  
  addInfoBox('CONOCE EL CAMPUS VIRTUAL ANTES DE INICIAR TU CURSO...');
  
  addBulletList([
    'Diez días antes de la fecha de inicio de tu curso te serán enviadas tus claves de acceso al Campus Virtual (usuario y contraseña) a través del correo electrónico que indicaste en la inscripción al curso.',
    'Desde la fecha de recepción de tus contraseñas para acceder al Campus Virtual hasta el día antes de la fecha de inicio del curso deberás acceder al Campus para verificar que tus claves son correctas.',
  ]);
  
  yPos += 5;
  
  addSubsectionTitle('3.1', 'REQUISITOS TÉCNICOS DEL EQUIPO INFORMÁTICO');
  addParagraph('Es aconsejable y necesario que antes de iniciar el curso compruebes algunas opciones en la configuración de tu ordenador desde el que accederás al Campus, con el fin de que no se produzca ningún problema durante dicho acceso.');
  yPos += 3;
  addRequisitosTable();
  
  // SECCIÓN 3.2: FUNCIONAMIENTO, RECURSOS Y UTILIDADES - ADAPTADO A NUESTRO CAMPUS
  addSubsectionTitle('3.2', 'FUNCIONAMIENTO, RECURSOS Y UTILIDADES DEL CAMPUS');
  addParagraph('Cada vez que accedas al Campus Virtual te aparecerá una pantalla con todos los cursos en los que estás matriculado/a. Pulsando sobre el nombre del curso podrás acceder al contenido.');
  yPos += 5;
  
  addParagraph('La navegación principal del curso se estructura en el MENÚ LATERAL IZQUIERDO:');
  yPos += 8;
  
  // Tabla del menú de navegación del campus
  autoTable(doc, {
    startY: yPos,
    head: [['OPCIÓN DEL MENÚ', 'EQUIVALENTE SEPE', 'DESCRIPCIÓN']],
    body: [
      ['Inicio', 'INTRODUCCIÓN', 'Bienvenida, objetivos y vídeo de presentación'],
      ['Guía del Alumno', 'CÓMO HACER MI CURSO', 'Este documento que estás leyendo'],
      ['Programa Formativo', 'PROGRAMACIÓN DIDÁCTICA', 'Estructura y objetivos del certificado'],
      ['Plan de Trabajo', 'PLAN DE TRABAJO', 'Planificación didáctica y calendario'],
      ['Cronograma', 'CRONOGRAMA', 'Línea temporal del curso'],
      ['Módulos', 'FORMACIÓN EN CAMPUS', 'Contenido formativo por unidades'],
      ['Calificaciones', 'MIS PROGRESOS', 'Tu progreso y notas'],
      ['Exámenes', 'EVALUACIÓN', 'Test y pruebas de evaluación'],
      ['Tutorías', 'TUTORÍAS', 'Sesiones presenciales y virtuales'],
      ['Calendario', 'MI AGENDA', 'Agenda con todos los eventos'],
      ['Foro', 'FOROS', 'Debates y consultas'],
      ['Tiempos Invertidos', 'SEGUIMIENTO SEPE', 'Registro de tiempo de formación'],
    ],
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: TEAL_COLOR,
      textColor: WHITE,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: BLACK,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 45, textColor: TEAL_COLOR },
      2: { cellWidth: 80 },
    },
    alternateRowStyles: {
      fillColor: LIGHT_TEAL,
    },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  addParagraph('Dispones de tres áreas diferenciadas para organizar tu formación:');
  yPos += 8;
  
  // A) ORGANIZARME
  addInfoBox('A) ORGANIZARME - Planificación y Seguimiento', false);
  yPos += 3;
  addParagraph('En el menú lateral y la cabecera del curso encontrarás herramientas para organizarte:');
  yPos += 3;
  
  addBulletList([
    'GUÍA DEL ALUMNO: Este documento con toda la información del curso',
    'PLAN DE TRABAJO: Planificación semanal de contenidos y actividades',
    'CRONOGRAMA: Visualización de fechas de inicio/fin de cada módulo',
    'CALENDARIO: Eventos, tutorías y fechas de entrega',
    'CALIFICACIONES: Seguimiento de tu progreso y notas',
  ]);
  
  // MIS PROGRESOS (CALIFICACIONES) detalle
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('CALIFICACIONES (equivalente a "MIS PROGRESOS")', margin, yPos);
  doc.line(margin, yPos + 1, margin + 90, yPos + 1);
  yPos += 8;
  
  addParagraph('En la sección "Calificaciones" podrás realizar el seguimiento de todos tus progresos:');
  yPos += 3;
  
  // Tabla de calificaciones
  autoTable(doc, {
    startY: yPos,
    head: [['CALIFICACIÓN FORMACIÓN EN CAMPUS']],
    body: [
      ['Mis Accesos'],
      ['Contenidos interactivos'],
      ['Ejercicios y tareas'],
      ['Encuestas'],
      ['Participación en foros de debate y tutorías virtuales'],
    ],
    margin: { left: margin + 10, right: margin + 10 },
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: WHITE,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEAL_COLOR,
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.2,
  });
  yPos = (doc as any).lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['CALIFICACIÓN TUTORÍAS PRESENCIALES']],
    body: [
      ['Actividades y pruebas'],
    ],
    margin: { left: margin + 10, right: margin + 10 },
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: WHITE,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEAL_COLOR,
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.2,
  });
  yPos = (doc as any).lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['CALIFICACIÓN FINAL']],
    body: [
      ['Calificación global de la Formación en Campus + Tutorías presenciales'],
      ['Calificación prueba final presencial'],
      ['Calificación prueba final presencial 2ª conv.'],
    ],
    margin: { left: margin + 10, right: margin + 10 },
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: WHITE,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEAL_COLOR,
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.2,
  });
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // B) COMUNICARME - Herramientas de comunicación del campus
  checkPageBreak(60);
  addInfoBox('B) COMUNICARME - Herramientas de Comunicación', false);
  yPos += 3;
  addParagraph('En el Campus dispones de varias herramientas para comunicarte con tu tutor/a-formador/a y con el resto de alumnos/as:');
  yPos += 5;
  
  // Tabla de herramientas de comunicación adaptada a nuestro campus
  autoTable(doc, {
    startY: yPos,
    head: [['HERRAMIENTA EN EL CAMPUS', 'EQUIVALENTE SEPE', 'CÓMO ACCEDER']],
    body: [
      ['Botón CONTACTO (cabecera)', 'CORREO / MENSAJERÍA', 'Pulsa "Contacto" en la cabecera del curso'],
      ['WhatsApp Dudas', 'CHAT / CONTACTA EN DIRECTO', 'Botón "WhatsApp Dudas" en la cabecera'],
      ['Foro del Curso', 'FOROS DE DEBATE', 'Menú lateral > Foro'],
      ['Mi Perfil (icono usuario)', 'MI PERFIL', 'Esquina superior derecha > icono usuario'],
      ['Tutorías', 'TUTORÍAS VIRTUALES', 'Menú lateral > Tutorías'],
      ['Centro de Atención (CAU)', 'CAU', 'Datos en la Guía del Alumno'],
    ],
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: TEAL_COLOR,
      textColor: WHITE,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: BLACK,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 45, textColor: TEAL_COLOR },
      2: { cellWidth: 75 },
    },
    alternateRowStyles: {
      fillColor: LIGHT_TEAL,
    },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Detalle de cómo contactar con el tutor
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  checkPageBreak(25);
  doc.text('CÓMO CONTACTAR CON TU TUTOR/A', margin, yPos);
  doc.line(margin, yPos + 1, margin + 70, yPos + 1);
  yPos += 8;
  
  addParagraph('Tienes varias opciones para contactar con tu tutor-formador:');
  addBulletList([
    'MENSAJERÍA INTERNA: Pulsa el botón "Contacto" en la cabecera del curso y escribe tu mensaje',
    'WHATSAPP: Usa el botón "WhatsApp Dudas" para consultas rápidas (665 673 416)',
    'FORO: Para dudas sobre el contenido que puedan beneficiar a otros compañeros',
    'EMAIL: formacion.empleate@gmail.com',
  ]);
  yPos += 5;
  
  // FORO detalle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  checkPageBreak(25);
  doc.text('FORO DEL CURSO', margin, yPos);
  doc.line(margin, yPos + 1, margin + 40, yPos + 1);
  yPos += 8;
  
  addParagraph('El Foro es una herramienta de comunicación asíncrona donde podrás:');
  addBulletList([
    'Consultar dudas sobre el contenido de las unidades didácticas',
    'Participar en debates propuestos por el tutor-formador',
    'Ver las consultas de otros compañeros y sus respuestas',
    'Plantear temas de interés relacionados con la formación',
  ]);
  yPos += 5;
  
  // C) RECURSOS - Zona central adaptada a nuestro campus
  checkPageBreak(60);
  addInfoBox('C) RECURSOS - Contenido Formativo', false);
  yPos += 3;
  addParagraph('En el menú "Módulos" encontrarás todo el contenido formativo organizado de la siguiente manera:');
  yPos += 5;
  
  // Estructura de contenidos
  autoTable(doc, {
    startY: yPos,
    head: [['ESTRUCTURA DEL CONTENIDO', 'DESCRIPCIÓN']],
    body: [
      ['MÓDULOS FORMATIVOS (MF)', 'Grandes bloques de contenido (ej: MF0969_1)'],
      ['  → UNIDADES FORMATIVAS (UF)', 'Subdivisiones del módulo (ej: UF0517, UF0518...)'],
      ['      → TEMARIO / CIM', 'Contenido Interactivo Multimedia con el temario teórico'],
      ['      → CONTENIDO INTERACTIVO', 'Vídeos, audios, presentaciones, documentos'],
      ['      → ACTIVIDADES', 'Casos prácticos y ejercicios evaluables'],
      ['      → EVALUACIONES', 'Test de cada unidad formativa'],
    ],
    margin: { left: margin, right: margin },
    bodyStyles: {
      fontSize: 9,
      textColor: BLACK,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 100 },
    },
    alternateRowStyles: {
      fillColor: LIGHT_TEAL,
    },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // SECCIÓN 4: FECHAS Y LUGAR DE REALIZACIÓN
  addMainSectionTitle('4', 'FECHAS Y LUGAR DE REALIZACIÓN');
  addParagraph('Las fechas de realización de este curso son variables según la convocatoria en la que te encuentres matriculado/a.');
  yPos += 5;
  
  // Tabla de fechas inicio/fin
  autoTable(doc, {
    startY: yPos,
    body: [
      [{ content: 'FECHA INICIO:', styles: { fontStyle: 'bold' } }, 'Ver Plan de Trabajo adjunto'],
      [{ content: 'FECHA FIN:', styles: { fontStyle: 'bold' } }, 'Ver Plan de Trabajo adjunto'],
    ],
    margin: { left: margin + 30, right: margin + 30 },
    bodyStyles: {
      fontSize: 10,
      textColor: BLACK,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
    },
    tableLineColor: BLACK,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  addParagraph('En concreto, deberás desarrollar cada módulo formativo/unidad formativa en las siguientes fechas:');
  yPos += 5;
  
  addModulosFormativosTable();
  
  addInfoBox('DIRECCIÓN DEL CENTRO DE FORMACIÓN');
  yPos -= 5;
  addParagraph('Calle Marqués de Mirasol 19, Talavera de la Reina, Toledo');
  yPos += 10;
  
  // SECCIÓN 5: METODOLOGÍA DE ESTUDIO
  addMainSectionTitle('5', 'METODOLOGÍA DE ESTUDIO');
  addParagraph('En este apartado de METODOLOGÍA DE ESTUDIO te facilitamos las orientaciones y explicaciones necesarias para que sepas cómo debes realizar el curso y las posibilidades que te ofrece el Campus Virtual para el estudio.');
  yPos += 5;
  addParagraph('A continuación, te presentamos de forma esquemática cada uno de los pasos que debes seguir para el desarrollo del curso:');
  yPos += 8;
  
  addSubsectionTitle('5.1', 'TAREAS/ACTIVIDADES');
  addParagraph('Para conocer qué contenidos debes estudiar o qué actividades debes realizar en cada momento, debes acudir a tu PLAN DE TRABAJO, que encontrarás en el Anexo I de esta guía, o al icono de MI AGENDA que encontrarás en el Campus Virtual en la parte izquierda de tu pantalla.');
  yPos += 8;
  
  // Cajas con borde lateral A) B) C) D) E) como en las capturas
  addBorderedBox('INTRODUCCIÓN AL MÓDULO FORMATIVO/UNIDAD FORMATIVA', [
    'Al inicio de cada módulo formativo o unidad formativa:',
    'a. Acude al chat o la sesión presencial de la sesión inicial.',
    'b. Consulta los objetivos y contenidos, en el documento PDF o a través del vídeo de presentación.',
    'c. Realiza el test de conocimientos previos.'
  ], 'A');
  
  addBorderedBox('DESARROLLA TU FORMACIÓN EN EL CAMPUS VIRTUAL', [
    'En cada unidad didáctica:',
    'a. Estudia los contenidos multimedia y amplía tus conocimientos con los materiales complementarios.',
    'b. Consulta los documentos y vídeos de apoyo.',
    'c. Realiza las actividades de aprendizaje.',
    'd. Participa en los foros de debate.',
    'e. Realiza el test de autoevaluación en Campus.'
  ], 'B');
  
  addBorderedBox('DESARROLLA LA FORMACIÓN EN LA TUTORÍA PRESENCIAL', [
    'En la fecha y lugar que se te indique debes asistir a las tutorías presenciales en el Centro de formación. Consulta el cuaderno del alumno.'
  ], 'C');
  
  addBorderedBox('PARTICIPA EN LAS TUTORÍAS VIRTUALES', [
    'Acude a la tutoría virtual grupal (a través de la herramienta de chat o "Contacta en directo").'
  ], 'D');
  
  addBorderedBox('REALIZA LAS PRUEBAS DE EVALUACIÓN', [
    'Al finalizar cada módulo o unidad formativa deberás realizar las siguientes pruebas de evaluación:',
    '- TEST FINAL de evaluación en Campus.',
    '- También debes responder a las cuestiones planteadas en el Cuestionario de Evaluación de la Calidad que ayudarán a mejorar la formación.',
    '- PRUEBA DE EVALUACIÓN FINAL PRESENCIAL en el Centro de formación, al finalizar todas las unidades formativas que componen el módulo formativo.'
  ], 'E');
  
  // A) INTRODUCCIÓN AL MÓDULO FORMATIVO - Detallado
  checkPageBreak(80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('A) INTRODUCCIÓN AL MÓDULO FORMATIVO O UNIDAD FORMATIVA:', margin, yPos);
  yPos += 5;
  doc.text('CUESTIONARIO DE CONOCIMIENTOS PREVIOS Y OBJETIVOS DE APRENDIZAJE', margin, yPos);
  yPos += 10;
  
  addParagraph('Al comenzar cada módulo formativo o unidad formativa debes consultar en la parte central del Campus Virtual el apartado INTRODUCCIÓN:');
  yPos += 5;
  
  addParagraph('En esta área encontrarás:');
  yPos += 3;
  
  addIconSection('Vídeo de presentación', 'de la Unidad Formativa o Módulo Formativo.');
  addIconSection('Documento PDF', 'donde podrás consultar los objetivos y contenidos de la Unidad formativa o Módulo Formativo.');
  addIconSection('Acceso al chat de la sesión inicial', 'El día de comienzo del curso, a través de la herramienta de chat habilitada, el tutor/a-formador/a del módulo formativo/unidad formativa correspondiente, te informará tanto de cuestiones generales relativas a la organización de la formación como otras específicas relativas a la presentación de tutores-formadores, exposición de objetivos que se persiguen alcanzar con la formación, actividades de aprendizaje y pruebas de evaluación que debes realizar, etc. La hora de esta sesión inicial puedes consultarla en el documento PLAN DE TRABAJO, adjunto a esta guía, o a través del apartado MI AGENDA del Campus Virtual.');
  
  addParagraph('La sesión inicial puede ser también presencial, en ese caso tu tutor-formador te informará con antelación.');
  yPos += 5;
  
  addIconSection('Test de conocimientos previos', 'Antes de comenzar a estudiar los contenidos de la unidad formativa o módulo formativo, debes cumplimentar un cuestionario en el que deberás indicar tus conocimientos previos sobre el contenido que vas a cursar, las motivaciones para realizar esta formación y los resultados que esperas obtener.');
  yPos += 8;
  
  // B) DESARROLLA LA FORMACIÓN DEL MÓDULO
  checkPageBreak(80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('B) DESARROLLA LA FORMACIÓN DEL MÓDULO FORMATIVO O UNIDAD', margin, yPos);
  yPos += 5;
  doc.text('FORMATIVA EN EL CAMPUS VIRTUAL', margin, yPos);
  yPos += 10;
  
  addParagraph('Los recursos para desarrollar la formación en el Campus Virtual se encuentran en el apartado FORMACIÓN EN CAMPUS organizados en unidades didácticas.');
  yPos += 5;
  addParagraph('En cada unidad didáctica deberás desarrollar el siguiente proceso de aprendizaje:');
  yPos += 5;
  
  addParagraph('1º) Estudia los contenidos, es decir, lee, visualiza o escucha los contenidos de la unidad didáctica expuestos en el Contenido Interactivo Multimedia (CIM).');
  yPos += 5;
  
  addIconSection('CONTENIDO INTERACTIVO MULTIMEDIA', 'El Contenido Interactivo Multimedia puede incluir uno o varios de los siguientes recursos que son de obligada lectura, visualización y/o audición:', true);
  
  addBulletList([
    'Documentos de lectura.',
    'Manual pdf: existe la opción de visualizar e imprimir el contenido teórico en formato pdf, con el objetivo de facilitar su lectura y el análisis de la información para su posterior estudio.',
    'Vídeos didácticos: donde profesionales de la materia profundizan y/o analizan las implicaciones de diferentes conceptos/procedimientos (vídeos explicativos) o muestran la aplicación de procedimientos y/o técnicas específicas (vídeos demostrativos).',
    'Enlaces Web.',
    'Demo y/o tutoriales de aplicaciones informáticas.',
    'Glosario.'
  ]);
  
  // Guía de navegación del CIM
  checkPageBreak(50);
  addInfoBox('GUÍA DE NAVEGACIÓN DEL CIM');
  yPos -= 5;
  addParagraph('Para conocer cómo navegar a través de los Contenidos Interactivos Multimedia consulta la "Guía de navegación del CIM" que se encuentra en el icono "Cómo hacer mi curso".');
  yPos += 5;
  addParagraph('En todo momento podrás visualizar qué apartados has visto o cuáles te quedan por ver gracias al índice de la izquierda. En él se muestran los puntos y subpuntos que conforman la unidad didáctica de la unidad/módulo en cuestión.');
  yPos += 5;
  addParagraph('El signo "más" te permite desplegar el punto y mostrarte el subpunto o subpuntos en cuestión. Y el "tic verde" te indica qué punto o subpunto ha sido visualizado.');
  yPos += 10;
  
  // Aplicaciones informáticas
  addSubsectionTitle('5.2', 'APLICACIONES INFORMÁTICAS');
  addParagraph('Para este certificado de profesionalidad, vas a necesitar las siguientes aplicaciones informáticas:');
  yPos += 5;
  addAplicacionesInformaticasTable();
  
  addParagraph('Para instalar estas aplicaciones informáticas vas a disponer de unas instrucciones que se te irán facilitando junto con los contenidos del curso en el momento en el que se trate sobre cada aplicación informática, como se muestra en la imagen más abajo. Además, tu tutor-formador te facilitará las instrucciones precisas para llevar a cabo la instalación cuando sea necesario o necesites ayuda.');
  
  // SECCIÓN 6: SISTEMA DE TUTORÍAS
  addMainSectionTitle('6', 'SISTEMA DE TUTORÍAS');
  addParagraph('A lo largo del curso contarás con el apoyo de un tutor/a-formador/a que te acompañará durante todo el proceso formativo. Podrás comunicarte a través de:');
  yPos += 3;
  addBulletList([
    'Correo electrónico interno del Campus Virtual',
    'Foros de consulta y debate',
    'Tutorías virtuales por chat/videollamada',
    'Sesiones presenciales programadas',
  ]);
  
  yPos += 5;
  addInfoBox('HORARIO DE ATENCIÓN TUTORIAL:\nLunes a Viernes de 09:00 a 15:00 horas\nTeléfono CAU: 665 673 416\nEmail: formacion.empleate@gmail.com');
  
  // SECCIÓN 7: EVALUACIÓN
  addMainSectionTitle('7', 'EVALUACIÓN Y CERTIFICACIÓN');
  addParagraph('Para superar cada módulo formativo deberás:');
  yPos += 3;
  addBulletList([
    'Completar al menos el 75% de los contenidos formativos',
    'Realizar todas las actividades de aprendizaje obligatorias',
    'Superar las pruebas de evaluación (test y prueba presencial) con una nota mínima del 50%',
    'Asistir al 100% de las sesiones presenciales obligatorias',
  ]);
  
  yPos += 5;
  addParagraph('Una vez superados todos los módulos formativos y el módulo de prácticas, podrás solicitar el Certificado de Profesionalidad ante la Administración competente.');
  
  // SECCIÓN 8: TITULACIÓN
  addMainSectionTitle('8', 'TITULACIÓN OBTENIDA');
  addParagraph('Una vez superados todos los módulos formativos del certificado de profesionalidad, incluido el módulo de prácticas profesionales no laborales, podrás solicitar el CERTIFICADO DE PROFESIONALIDAD correspondiente ante la Administración competente.');
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    body: [
      [{ content: 'CERTIFICADO:', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' } }, 
       'ADGG0408 - Operaciones auxiliares de servicios administrativos y generales'],
      [{ content: 'NIVEL:', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' } }, 
       '1'],
      [{ content: 'FAMILIA:', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' } }, 
       'Administración y gestión'],
    ],
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 130 },
    },
    bodyStyles: {
      fontSize: 10,
      textColor: BLACK,
    },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  addParagraph('Este certificado tiene carácter oficial y validez en todo el territorio nacional, acreditando las competencias profesionales adquiridas.');
  
  // SECCIÓN 9: CAU
  addMainSectionTitle('9', 'CENTRO DE ATENCIÓN AL USUARIO (CAU)');
  addParagraph('Para cualquier incidencia técnica o consulta relacionada con el funcionamiento del Campus Virtual, puedes contactar con el Centro de Atención al Usuario:');
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    body: [
      ['Teléfono:', '665 673 416'],
      ['Horario:', 'Lunes a Viernes de 09:00 a 15:00'],
      ['Email:', 'formacion.empleate@gmail.com'],
      ['Dirección:', 'C/ Marqués de Mirasol, 19 - Talavera de la Reina'],
    ],
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 40, fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' },
      1: { cellWidth: 130 },
    },
    bodyStyles: {
      fontSize: 10,
      textColor: BLACK,
    },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  addParagraph('Tipos de incidencias que puedes consultar:');
  addBulletList([
    'Problemas de acceso al Campus',
    'Errores en la visualización de contenidos',
    'Problemas con la entrega de actividades',
    'Incidencias con las herramientas de comunicación',
  ]);
  
  // SECCIÓN 10: ATENCIÓN AL CLIENTE
  addMainSectionTitle('10', 'SERVICIO DE ATENCIÓN AL CLIENTE');
  addParagraph('El Servicio de Atención al Cliente está a tu disposición para cualquier consulta o incidencia relacionada con tu formación que no sea de carácter técnico.');
  yPos += 5;
  
  addParagraph('Tipos de consultas:');
  addBulletList([
    'Información sobre el curso y su contenido',
    'Dudas sobre la planificación y calendario',
    'Gestiones administrativas',
    'Solicitud de certificados y diplomas',
    'Reclamaciones y sugerencias',
  ]);
  
  yPos += 5;
  
  // Datos del centro
  autoTable(doc, {
    startY: yPos,
    head: [['DATOS DEL CENTRO']],
    body: [
      ['EMPLEATE TALAVERA FORMACIÓN'],
      ['CIF: B45878253'],
      ['Nº Registro SEPE: 4500027071'],
      ['C/ Marqués de Mirasol, 19'],
      ['45600 Talavera de la Reina, Toledo'],
    ],
    margin: { left: margin + 20, right: margin + 20 },
    headStyles: {
      fillColor: TEAL_COLOR,
      textColor: WHITE,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: BLACK,
      halign: 'center',
    },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // ANEXO I
  checkPageBreak(60);
  addMainSectionTitle('ANEXO I', 'CALENDARIO Y PLAN DE TRABAJO');
  addParagraph('En el ANEXO I "CALENDARIO Y PLAN DE TRABAJO" podrás encontrar la planificación por semanas, así como la secuencia de las actividades y tareas programadas para realizar en cada unidad didáctica.');
  yPos += 5;
  addParagraph('Consulta con tu tutor/a-formador/a las fechas específicas de tu convocatoria.');
  yPos += 5;
  addParagraph('Este documento incluye:');
  addBulletList([
    'Fechas de inicio y fin de cada módulo/unidad formativa',
    'Calendario de tutorías presenciales',
    'Fechas de entrega de actividades de aprendizaje',
    'Fechas de pruebas de evaluación (1ª y 2ª convocatoria)',
    'Programación semanal de contenidos y actividades',
  ]);
  yPos += 5;
  addParagraph('Consulta MI AGENDA en el Campus Virtual para ver el calendario actualizado de todas las actividades programadas.');

  // Footer con números de página
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Número de página centrado
    doc.setFontSize(10);
    doc.setTextColor(...BLACK);
    doc.text(String(i), pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Footer con nombre del centro
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.text(`${branding.centerName} - Centro Acreditado SEPE`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  // Guardar PDF
  doc.save(`Guia_Alumno_${courseTitle.replace(/\s+/g, '_')}.pdf`);
};
