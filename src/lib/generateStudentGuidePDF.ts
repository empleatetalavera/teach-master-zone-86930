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
      // Viñeta circular teal
      doc.setFillColor(...TEAL_COLOR);
      doc.circle(margin + 2, yPos - 1.5, 1, 'F');
      
      const lines = doc.splitTextToSize(item, contentWidth - 10);
      lines.forEach((line: string, index: number) => {
        doc.text(line, margin + 8, yPos + (index * 4.5));
      });
      yPos += lines.length * 4.5 + 2;
    });
    yPos += 3;
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
  addMainSectionTitle('3', 'EL CAMPUS VIRTUAL Y LAS APLICACIONES INFORMÁTICAS NECESARIAS PARA LA FORMACIÓN');
  
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
  
  // SECCIÓN 4: FECHAS Y LUGAR
  addMainSectionTitle('4', 'FECHAS Y LUGAR DE REALIZACIÓN');
  addParagraph('Las fechas de realización de este curso son variables según la convocatoria en la que te encuentres matriculado/a.');
  addParagraph('Deberás desarrollar cada módulo formativo/unidad formativa según el calendario establecido en el PLAN DE TRABAJO.');
  yPos += 5;
  addInfoBox('DIRECCIÓN DEL CENTRO DE FORMACIÓN:\nC/ Marqués de Mirasol, 19 - Talavera de la Reina, Toledo.');
  
  // SECCIÓN 5: METODOLOGÍA
  addMainSectionTitle('5', 'METODOLOGÍA DE ESTUDIO');
  
  addSubsectionTitle('5.1', 'TAREAS/ACTIVIDADES');
  addParagraph('El proceso formativo se desarrolla siguiendo estas fases:');
  yPos += 3;
  
  addInfoBox('A) INTRODUCCIÓN AL MÓDULO FORMATIVO O UNIDAD FORMATIVA');
  addBulletList([
    'Visualiza el vídeo de presentación',
    'Descarga los objetivos y contenidos que vas a estudiar',
    'Acude a la videoconferencia de presentación con tu tutor formador',
    'Realiza el cuestionario de conocimientos previos',
  ]);
  
  addInfoBox('B) DESARROLLA LA FORMACIÓN EN EL CAMPUS VIRTUAL');
  addBulletList([
    'Estudia los contenidos de cada unidad didáctica (Contenido Interactivo Multimedia)',
    'Realiza los ejercicios de autoevaluación',
    'Consulta el material didáctico complementario',
    'Realiza las actividades de aprendizaje propuestas',
    'Participa en los foros disponibles',
  ]);
  
  addInfoBox('C) DESARROLLA LA FORMACIÓN EN EL CENTRO DE FORMACIÓN');
  addParagraph('En las fechas y lugar indicados en el PLAN DE TRABAJO, deberás asistir a las sesiones presenciales donde se trabajarán los conocimientos adquiridos en la plataforma.');
  
  addInfoBox('D) REALIZA LAS PRUEBAS DE EVALUACIÓN');
  addBulletList([
    'TEST FINAL EN CAMPUS (CIM)',
    'PRUEBA DE EVALUACIÓN FINAL PRESENCIAL',
    'CUESTIONARIO DE SATISFACCIÓN',
  ]);
  
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
  
  // SECCIÓN 8: CAU
  addMainSectionTitle('8', 'CENTRO DE ATENCIÓN AL USUARIO (CAU)');
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
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // ANEXO
  checkPageBreak(40);
  addMainSectionTitle('ANEXO I', 'CALENDARIO Y PLAN DE TRABAJO');
  addParagraph('En este anexo encontrarás la planificación detallada por semanas, así como la secuencia de las actividades y tareas programadas para realizar en cada unidad didáctica.');
  addParagraph('Consulta con tu tutor/a-formador/a las fechas específicas de tu convocatoria.');

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
