import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const generateCampusGuidePDF = async (
  branding: CenterBranding
) => {
  const doc = new jsPDF();
  
  // Sanitize text to avoid jsPDF encoding issues with special chars
  const sanitize = (t: string) => t
    .replace(/→/g, '>').replace(/—/g, '-').replace(/–/g, '-')
    .replace(/\u201c/g, '"').replace(/\u201d/g, '"')
    .replace(/\u2018/g, "'").replace(/\u2019/g, "'")
    .replace(/●/g, '-').replace(/•/g, '-');
  const _origText = doc.text.bind(doc);
  (doc as any).text = (text: any, x: number, y: number, options?: any) => {
    if (typeof text === 'string') text = sanitize(text);
    else if (Array.isArray(text)) text = text.map((t: any) => typeof t === 'string' ? sanitize(t) : t);
    return _origText(text, x, y, options);
  };
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

  // Añadir header en cada página
  const addHeader = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...TEAL_COLOR);
    doc.text('GUÍA DEL CAMPUS VIRTUAL', pageWidth - margin, 15, { align: 'right' });
  };

  // Añadir título de sección principal
  const addMainSectionTitle = (number: string, title: string) => {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(`${number}. ${title}`, margin, yPos);
    yPos += 12;
  };

  // Añadir subtítulo de subsección
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
    
    doc.setFillColor(...TEAL_COLOR);
    doc.rect(xPos, yPos - 4, boxWidth, boxHeight, 'F');
    
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

  // Añadir caja con borde lateral izquierdo teal
  const addBorderedBox = (title: string, content: string[], letter?: string) => {
    const boxWidth = contentWidth - 10;
    const xPos = margin + 5;
    const lineHeight = 5;
    
    let totalLines = 0;
    const formattedContent = content.map(item => {
      const lines = doc.splitTextToSize(item, boxWidth - 15);
      totalLines += lines.length;
      return lines;
    });
    
    const titleHeight = title ? 10 : 0;
    const boxHeight = titleHeight + (totalLines * lineHeight) + 15;
    
    checkPageBreak(boxHeight + 10);
    
    doc.setFillColor(...TEAL_COLOR);
    doc.rect(xPos - 3, yPos - 4, 4, boxHeight, 'F');
    
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(xPos + 1, yPos - 4, boxWidth, boxHeight);
    
    let currentY = yPos;
    
    if (title) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BLACK);
      
      const fullTitle = letter ? `${letter}) ${title}` : title;
      doc.text(fullTitle, xPos + 8, currentY + 3);
      currentY += 12;
    }
    
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

  // Añadir sección con icono y texto
  const addIconSection = (title: string, description: string) => {
    checkPageBreak(20);
    
    doc.setFillColor(...LIGHT_TEAL);
    doc.setDrawColor(...TEAL_COLOR);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 4, 8, 8, 'FD');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(title, margin + 12, yPos);
    
    yPos += 6;
    
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

  // Añadir tabla
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

  // ============================================
  // PORTADA
  // ============================================
  
  // Header con logo del centro
  if (branding.centerLogo) {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = branding.centerLogo;
      await new Promise((resolve, reject) => { logoImg.onload = resolve; logoImg.onerror = reject; setTimeout(reject, 3000); });
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      canvas.getContext('2d')?.drawImage(logoImg, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      doc.addImage(logoDataUrl, 'PNG', margin, 15, 50, 25);
    } catch { /* skip logo if failed */ }
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text(branding.centerName || 'Campus Virtual', branding.centerLogo ? margin + 55 : margin, 30);

  // Línea separadora
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(1);
  doc.line(margin, 45, pageWidth - margin, 45);

  // Título principal centrado con recuadro
  const titleBoxY = 70;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(2);
  doc.rect(margin + 10, titleBoxY, contentWidth - 20, 60, 'D');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('GUÍA DEL', pageWidth / 2, titleBoxY + 20, { align: 'center' });
  doc.text('CAMPUS VIRTUAL', pageWidth / 2, titleBoxY + 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('Manual de Usuario para el Alumno', pageWidth / 2, titleBoxY + 50, { align: 'center' });

  // Nombre del centro
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text(branding.centerName || 'Centro de Formación', pageWidth / 2, 160, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text('Formación Profesional', pageWidth / 2, 172, { align: 'center' });

  // Badge centro acreditado
  doc.setFillColor(...LIGHT_TEAL);
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - 30, 185, 60, 15, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('Centro Acreditado', pageWidth / 2, 194, { align: 'center' });

  // Pie de portada
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Versión 1.0 - 2026', pageWidth / 2, 260, { align: 'center' });

  // ============================================
  // ÍNDICE
  // ============================================
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('ÍNDICE DE CONTENIDOS', margin, yPos);
  yPos += 15;
  
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  const indexItems = [
    { num: '1', title: 'Introducción al Campus Virtual', page: 3 },
    { num: '2', title: 'Requisitos Técnicos', page: 4 },
    { num: '3', title: 'Acceso a la Plataforma', page: 5 },
    { num: '4', title: 'Navegación Principal', page: 7 },
    { num: '5', title: 'Estructura del Curso', page: 8 },
    { num: '6', title: 'Contenidos Formativos', page: 9 },
    { num: '7', title: 'Evaluaciones y Exámenes', page: 10 },
    { num: '8', title: 'Actividades de Desarrollo', page: 11 },
    { num: '9', title: 'Comunicación con el Tutor', page: 12 },
    { num: '10', title: 'Control de Tiempos', page: 13 },
    { num: '11', title: 'Foros y Participación', page: 14 },
    { num: '12', title: 'Certificación', page: 15 },
    { num: '13', title: 'Soporte Técnico', page: 16 },
  ];

  indexItems.forEach((item) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(`${item.num}.`, margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.text(item.title, margin + 10, yPos);
    
    // Línea punteada
    const titleWidth = doc.getTextWidth(item.title);
    const pageNumX = pageWidth - margin - 10;
    doc.setDrawColor(...GRAY);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin + 12 + titleWidth, yPos, pageNumX - 5, yPos);
    doc.setLineDashPattern([], 0);
    
    doc.setTextColor(...GRAY);
    doc.text(item.page.toString(), pageNumX, yPos);
    
    yPos += 10;
  });

  // ============================================
  // 1. INTRODUCCIÓN AL CAMPUS VIRTUAL
  // ============================================
  addNewPage();
  addMainSectionTitle('1', 'INTRODUCCIÓN AL CAMPUS VIRTUAL');
  
  addInfoBox('El Campus Virtual es una plataforma de teleformación diseñada para la gestión e impartición de acciones formativas online.');
  
  addParagraph('El Campus Virtual está dividido en dos entornos claramente diferenciados:');
  
  addBulletList([
    'Entorno virtual de formación: al que pueden acceder alumnado, tutores/as, coordinadores/as y auditores/as.',
    'Entorno de administración: dirigido a los perfiles de gestión de la plataforma.'
  ]);

  addParagraph('El entorno virtual de formación permite el uso de herramientas de comunicación síncronas (videoconferencia, chat, etc.) y asíncronas (foros, correo, mensajes, etc.).');

  addSubsectionTitle('1.1', 'CARACTERÍSTICAS PRINCIPALES');
  
  addBorderedBox('Accesibilidad Multiplataforma', [
    'Compatible con ordenadores de escritorio, portátiles, tablets y smartphones.',
    'Accesible desde cualquier navegador web actualizado.',
    'Todas las funcionalidades disponibles en versión móvil.'
  ]);
  
  addBorderedBox('Formación sin Excusas', [
    'Accesible desde cualquier sitio y a cualquier hora.',
    'Control automático de tiempos de conexión.',
    'Seguimiento personalizado del progreso formativo.'
  ]);

  // ============================================
  // 2. REQUISITOS TÉCNICOS
  // ============================================
  addNewPage();
  addMainSectionTitle('2', 'REQUISITOS TÉCNICOS');
  
  addParagraph('Para acceder correctamente al Campus Virtual, asegúrese de cumplir con los siguientes requisitos técnicos mínimos:');
  
  addSubsectionTitle('2.1', 'NAVEGADORES COMPATIBLES');
  
  addTable(
    ['NAVEGADOR', 'VERSIÓN MÍNIMA', 'RECOMENDACIÓN'],
    [
      ['Google Chrome', '90+', 'Recomendado'],
      ['Mozilla Firefox', '88+', 'Compatible'],
      ['Microsoft Edge', '90+', 'Compatible'],
      ['Safari (macOS)', '14+', 'Compatible'],
    ],
    [60, 50, 60]
  );

  addSubsectionTitle('2.2', 'REQUISITOS DE HARDWARE');
  
  addBulletList([
    'Procesador: Intel Core i3 o equivalente (mínimo)',
    'Memoria RAM: 4 GB mínimo (8 GB recomendado)',
    'Conexión a Internet: 5 Mbps mínimo (10 Mbps recomendado)',
    'Resolución de pantalla: 1280x720 mínimo',
    'Altavoces o auriculares para contenido multimedia',
    'Webcam y micrófono para tutorías virtuales (opcional)'
  ]);

  addSubsectionTitle('2.3', 'CONFIGURACIÓN DEL NAVEGADOR');
  
  addInfoBox('IMPORTANTE: Debe tener habilitado JavaScript y permitir cookies para el correcto funcionamiento de la plataforma.');
  
  addBulletList([
    'Habilitar JavaScript en el navegador',
    'Permitir cookies de terceros para el dominio de la plataforma',
    'Desactivar bloqueadores de ventanas emergentes (pop-ups)',
    'Permitir la reproducción automática de contenido multimedia'
  ]);

  // ============================================
  // 3. ACCESO A LA PLATAFORMA
  // ============================================
  addNewPage();
  addMainSectionTitle('3', 'ACCESO A LA PLATAFORMA');
  
  addParagraph('Para acceder al Campus Virtual, siga estos pasos:');
  
  addSubsectionTitle('3.1', 'INICIO DE SESIÓN');
  
  addBorderedBox('Paso 1: Acceder a la URL', [
    'Abra su navegador web y acceda a la dirección proporcionada por el centro de formación.',
    'Ejemplo: https://campus.empleate.es'
  ], 'A');
  
  addBorderedBox('Paso 2: Introducir credenciales', [
    'Usuario: Su DNI/NIE o el usuario asignado por el centro',
    'Contraseña: La contraseña proporcionada en el correo de bienvenida',
    'Pulse el botón "Iniciar Sesión"'
  ], 'B');
  
  addBorderedBox('Paso 3: Completar perfil', [
    'En el primer acceso, deberá completar su perfil con los datos personales requeridos.',
    'Incluye: DNI/NIE, nombre completo, dirección, teléfono, etc.'
  ], 'C');

  addSubsectionTitle('3.2', 'RECUPERACIÓN DE CONTRASEÑA');
  
  addParagraph('Si ha olvidado su contraseña, siga estos pasos:');
  
  addBulletList([
    'Pulse en el enlace "¿Olvidó su contraseña?" en la página de inicio de sesión.',
    'Introduzca el correo electrónico asociado a su cuenta.',
    'Recibirá un enlace para restablecer su contraseña.',
    'Siga las instrucciones del correo para crear una nueva contraseña.'
  ]);

  addInfoBox('NOTA: Si continúa con problemas de acceso, contacte con el soporte técnico del centro de formación.');

  // ============================================
  // 4. NAVEGACIÓN PRINCIPAL
  // ============================================
  addNewPage();
  addMainSectionTitle('4', 'NAVEGACIÓN PRINCIPAL');
  
  addParagraph('Una vez que acceda al Campus Virtual, encontrará una interfaz intuitiva organizada en las siguientes secciones:');
  
  addSubsectionTitle('4.1', 'PANEL DE CONTROL');
  
  addIconSection('Mi Escritorio', 'Vista general con acceso rápido a sus cursos, mensajes pendientes, próximos eventos y progreso formativo.');
  
  addIconSection('Mis Cursos', 'Lista de todos los cursos en los que está matriculado, con indicadores de progreso y accesos directos.');
  
  addIconSection('Calendario', 'Vista de calendario con fechas importantes: entregas de actividades, tutorías presenciales, exámenes, etc.');
  
  addIconSection('Mensajes', 'Centro de comunicación para enviar y recibir mensajes de tutores y compañeros.');

  addSubsectionTitle('4.2', 'MENÚ LATERAL');
  
  addTable(
    ['SECCIÓN', 'DESCRIPCIÓN'],
    [
      ['Programa Formativo', 'Acceso a la estructura del curso y sus módulos'],
      ['Contenido Interactivo', 'Materiales multimedia y didácticos'],
      ['Actividades', 'Ejercicios y tareas a desarrollar'],
      ['Evaluaciones', 'Tests y exámenes de cada unidad'],
      ['Foros', 'Espacios de debate y consultas'],
      ['Calificaciones', 'Registro de notas y feedback'],
      ['Documentación', 'Guías, manuales y recursos adicionales'],
    ],
    [50, 120]
  );

  // ============================================
  // 5. ESTRUCTURA DEL CURSO
  // ============================================
  addNewPage();
  addMainSectionTitle('5', 'ESTRUCTURA DEL CURSO');
  
  addParagraph('Los cursos están organizados siguiendo una estructura jerárquica:');
  
  addSubsectionTitle('5.1', 'ORGANIZACIÓN MODULAR');
  
  addBorderedBox('Curso / Certificado', [
    'Nivel superior que agrupa todos los módulos formativos.',
    'Define las competencias a adquirir.',
    'Incluye duración total en horas y requisitos de acceso.'
  ]);
  
  addBorderedBox('Módulos Formativos', [
    'Bloques temáticos principales del curso.',
    'Cada módulo tiene objetivos específicos.',
    'Se evalúan de forma independiente.'
  ]);
  
  addBorderedBox('Unidades Formativas', [
    'Divisiones internas de cada módulo.',
    'Contienen los contenidos teóricos y prácticos.',
    'Incluyen actividades y evaluaciones propias.'
  ]);

  addSubsectionTitle('5.2', 'PLAN DE TRABAJO');
  
  addParagraph('El Plan de Trabajo establece la temporalización del curso, indicando:');
  
  addBulletList([
    'Fechas de inicio y fin de cada módulo y unidad formativa',
    'Plazos de entrega de actividades',
    'Fechas de tutorías presenciales obligatorias',
    'Fechas de pruebas de evaluación final'
  ]);

  addInfoBox('IMPORTANTE: Consulte regularmente el Plan de Trabajo para no perder ninguna fecha importante.');

  // ============================================
  // 6. CONTENIDOS FORMATIVOS
  // ============================================
  addNewPage();
  addMainSectionTitle('6', 'CONTENIDOS FORMATIVOS');
  
  addParagraph('El Campus Virtual ofrece diversos tipos de contenidos formativos para facilitar su aprendizaje:');
  
  addSubsectionTitle('6.1', 'CONTENIDO INTERACTIVO MULTIMEDIA (CIM)');
  
  addBorderedBox('Características del CIM', [
    'Contenido desarrollado siguiendo estándares SCORM.',
    'Incluye texto, imágenes, vídeos y animaciones.',
    'Navegación secuencial controlada.',
    'Registro automático de progreso y tiempo de visualización.'
  ]);
  
  addIconSection('Navegación por el CIM', 'Utilice los botones de navegación inferior para avanzar/retroceder entre pantallas. El sistema guardará automáticamente su posición.');
  
  addIconSection('Tiempo de Visualización', 'El tiempo mínimo de visualización de cada pantalla está controlado para garantizar el aprovechamiento del contenido.');

  addSubsectionTitle('6.2', 'MATERIALES COMPLEMENTARIOS');
  
  addBulletList([
    'Manuales en formato PDF descargables',
    'Vídeos explicativos y tutoriales',
    'Mapas conceptuales interactivos',
    'Ejercicios de autoevaluación',
    'Recursos externos y enlaces de interés'
  ]);

  addSubsectionTitle('6.3', 'ACCESO A LOS CONTENIDOS');
  
  addParagraph('Para acceder a los contenidos de una unidad formativa:');
  
  addBulletList([
    'Seleccione el módulo correspondiente en el menú lateral',
    'Haga clic en la unidad formativa que desea estudiar',
    'Pulse en "Contenido Interactivo" para iniciar el CIM',
    'Complete todas las pantallas para marcar la unidad como finalizada'
  ]);

  // ============================================
  // 7. EVALUACIONES Y EXÁMENES
  // ============================================
  addNewPage();
  addMainSectionTitle('7', 'EVALUACIONES Y EXÁMENES');
  
  addParagraph('El sistema de evaluación del Campus Virtual contempla diferentes tipos de pruebas:');
  
  addSubsectionTitle('7.1', 'TIPOS DE EVALUACIÓN');
  
  addTable(
    ['TIPO', 'DESCRIPCIÓN', 'PESO'],
    [
      ['Test de Autoevaluación', 'Pruebas no calificables para práctica personal', '-'],
      ['Test de Módulo', 'Evaluación al finalizar cada módulo formativo', '30%'],
      ['Actividades de Desarrollo', 'Ejercicios prácticos evaluados por el tutor', '20%'],
      ['Examen Final Presencial', 'Prueba presencial obligatoria', '50%'],
    ],
    [45, 90, 25]
  );

  addSubsectionTitle('7.2', 'CRITERIOS DE SUPERACIÓN');
  
  addInfoBox('Para superar el curso, deberá obtener una calificación mínima de APTO en todas las evaluaciones y cumplir con los requisitos de asistencia.');
  
  addBorderedBox('Requisitos Obligatorios', [
    'Completar el 100% del Contenido Interactivo Multimedia (CIM)',
    'Superar todos los tests de módulo con calificación mínima de 5 sobre 10',
    'Entregar y aprobar todas las actividades de desarrollo',
    'Superar el examen final presencial con calificación mínima de 5 sobre 10',
    'Asistir a las tutorías presenciales obligatorias (mínimo 80%)'
  ]);

  addSubsectionTitle('7.3', 'INTENTOS Y RECUPERACIÓN');
  
  addParagraph('El sistema permite un número limitado de intentos para cada evaluación:');
  
  addBulletList([
    'Tests de módulo: 3 intentos máximo, se conserva la mejor nota',
    'Actividades de desarrollo: posibilidad de corrección tras feedback del tutor',
    'Examen final: 2 convocatorias (ordinaria y extraordinaria)'
  ]);

  // ============================================
  // 8. ACTIVIDADES DE DESARROLLO
  // ============================================
  addNewPage();
  addMainSectionTitle('8', 'ACTIVIDADES DE DESARROLLO');
  
  addParagraph('Las actividades de desarrollo son ejercicios prácticos que permiten aplicar los conocimientos adquiridos.');
  
  addSubsectionTitle('8.1', 'TIPOS DE ACTIVIDADES');
  
  addBorderedBox('Actividades Individuales', [
    'Ejercicios prácticos para realizar de forma autónoma',
    'Casos prácticos basados en situaciones reales',
    'Elaboración de documentos profesionales',
    'Resolución de problemas del ámbito laboral'
  ]);
  
  addBorderedBox('Actividades Colaborativas', [
    'Trabajos en grupo con otros alumnos del curso',
    'Debates y discusiones en foros temáticos',
    'Proyectos conjuntos con entregas parciales',
    'Evaluación entre pares (coevaluación)'
  ]);

  addSubsectionTitle('8.2', 'ENTREGA DE ACTIVIDADES');
  
  addParagraph('Para entregar una actividad:');
  
  addBulletList([
    'Acceda a la sección "Actividades" del módulo correspondiente',
    'Seleccione la actividad a entregar',
    'Lea atentamente las instrucciones y rúbrica de evaluación',
    'Prepare su documento en el formato solicitado (PDF, Word, etc.)',
    'Suba el archivo utilizando el botón "Adjuntar archivo"',
    'Pulse "Enviar" para confirmar la entrega',
    'Recibirá un mensaje de confirmación con la fecha y hora de entrega'
  ]);

  addInfoBox('IMPORTANTE: Respete los plazos de entrega. Las actividades fuera de plazo pueden no ser calificadas o tener penalización.');

  // ============================================
  // 9. COMUNICACIÓN CON EL TUTOR
  // ============================================
  addNewPage();
  addMainSectionTitle('9', 'COMUNICACIÓN CON EL TUTOR');
  
  addParagraph('El Campus Virtual dispone de múltiples canales de comunicación con el equipo de tutores:');
  
  addSubsectionTitle('9.1', 'CANALES DE COMUNICACIÓN');
  
  addTable(
    ['CANAL', 'USO', 'TIEMPO DE RESPUESTA'],
    [
      ['Mensajería Interna', 'Consultas académicas y administrativas', '24-48 horas'],
      ['Foro de Dudas', 'Preguntas sobre contenidos del curso', '24-48 horas'],
      ['Chat en Vivo', 'Consultas urgentes (horario limitado)', 'Inmediato'],
      ['Tutoría Virtual', 'Sesiones programadas por videoconferencia', 'Cita previa'],
      ['Correo Electrónico', 'Comunicaciones formales', '48-72 horas'],
    ],
    [40, 70, 50]
  );

  addSubsectionTitle('9.2', 'TUTORÍAS VIRTUALES');
  
  addBorderedBox('Funcionamiento de las Tutorías', [
    'Las tutorías virtuales se realizan mediante videoconferencia.',
    'Pueden ser individuales o grupales según la temática.',
    'Deben solicitarse con al menos 48 horas de antelación.',
    'El enlace de acceso se enviará por mensajería interna.'
  ]);

  addSubsectionTitle('9.3', 'TUTORÍAS PRESENCIALES');
  
  addParagraph('Además de las tutorías virtuales, existen sesiones presenciales obligatorias:');
  
  addBulletList([
    'Sesión inicial de orientación y presentación del curso',
    'Tutorías de seguimiento durante el desarrollo del curso',
    'Sesión de preparación del examen final',
    'Prueba de evaluación final presencial'
  ]);

  addInfoBox('OBLIGATORIO: La asistencia a las tutorías presenciales es obligatoria. Consulte las fechas en el Plan de Trabajo.');

  // ============================================
  // 10. CONTROL DE TIEMPOS
  // ============================================
  addNewPage();
  addMainSectionTitle('10', 'CONTROL DE TIEMPOS');
  
  addParagraph('El Campus Virtual registra automáticamente los tiempos de conexión y estudio para garantizar el cumplimiento de los requisitos formativos.');
  
  addSubsectionTitle('10.1', 'REGISTRO DE ACTIVIDAD');
  
  addBorderedBox('Datos Registrados', [
    'Tiempo total de conexión a la plataforma',
    'Tiempo dedicado a cada unidad formativa',
    'Tiempo de visualización de contenidos multimedia',
    'Participación en foros y actividades',
    'Acceso a recursos y materiales complementarios'
  ]);

  addSubsectionTitle('10.2', 'REQUISITOS DE TIEMPO');
  
  addParagraph('Para cursos en modalidad teleformación, debe cumplir:');
  
  addBulletList([
    'Mínimo del 75% del tiempo estimado para cada módulo formativo',
    'Conexiones regulares (no acumular todo el tiempo en pocas sesiones)',
    'Distribución equilibrada del tiempo entre contenidos y actividades',
    'Cumplimiento de los tiempos mínimos por pantalla del CIM'
  ]);

  addSubsectionTitle('10.3', 'CONSULTAR MI TIEMPO');
  
  addParagraph('Puede consultar su tiempo acumulado en cualquier momento:');
  
  addBulletList([
    'Acceda a "Mi Progreso" en el menú lateral',
    'Seleccione "Informe de Tiempos"',
    'Visualizará el tiempo por módulo y el total acumulado',
    'Compare con los requisitos mínimos establecidos'
  ]);

  addInfoBox('RECOMENDACIÓN: Planifique sesiones de estudio regulares de 1-2 horas para un mejor aprovechamiento y registro correcto de tiempos.');

  // ============================================
  // 11. FOROS Y PARTICIPACIÓN
  // ============================================
  addNewPage();
  addMainSectionTitle('11', 'FOROS Y PARTICIPACIÓN');
  
  addParagraph('Los foros son espacios de comunicación esenciales para el aprendizaje colaborativo y la resolución de dudas.');
  
  addSubsectionTitle('11.1', 'TIPOS DE FOROS');
  
  addTable(
    ['FORO', 'PROPÓSITO', 'MODERACIÓN'],
    [
      ['Foro de Presentación', 'Conocer a compañeros y tutor', 'Abierto'],
      ['Foro de Dudas', 'Consultas sobre contenidos', 'Tutor'],
      ['Foro de Debate', 'Discusión de temas de actualidad', 'Tutor'],
      ['Foro Técnico', 'Problemas con la plataforma', 'Soporte'],
    ],
    [45, 70, 45]
  );

  addSubsectionTitle('11.2', 'NORMAS DE PARTICIPACIÓN');
  
  addBorderedBox('Netiqueta del Campus', [
    'Utilice un lenguaje respetuoso y profesional.',
    'Escriba mensajes claros y concisos.',
    'Evite escribir todo en mayúsculas (equivale a gritar).',
    'Cite correctamente cuando responda a otros participantes.',
    'Mantenga el tema de cada foro, no se desvíe del asunto.',
    'Evite publicar información personal sensible.'
  ]);

  addSubsectionTitle('11.3', 'PARTICIPACIÓN OBLIGATORIA');
  
  addParagraph('La participación activa en los foros es un requisito evaluable:');
  
  addBulletList([
    'Presentación obligatoria en el foro inicial',
    'Mínimo 2 intervenciones por módulo formativo',
    'Respuestas constructivas a compañeros',
    'Aportaciones relevantes en los debates propuestos'
  ]);

  addInfoBox('NOTA: La calidad de las intervenciones es más importante que la cantidad. Aportaciones vacías o repetitivas no contabilizan.');

  // ============================================
  // 12. CERTIFICACIÓN
  // ============================================
  addNewPage();
  addMainSectionTitle('12', 'CERTIFICACIÓN');
  
  addParagraph('Al completar satisfactoriamente el curso, recibirá la certificación correspondiente.');
  
  addSubsectionTitle('12.1', 'REQUISITOS PARA LA CERTIFICACIÓN');
  
  addBorderedBox('Condiciones Obligatorias', [
    'Completar el 100% de los contenidos interactivos de cada módulo',
    'Superar todas las evaluaciones con calificación mínima de APTO',
    'Entregar y aprobar todas las actividades de desarrollo',
    'Cumplir con el tiempo mínimo de conexión requerido',
    'Asistir al 80% de las tutorías presenciales',
    'Superar el examen final presencial'
  ]);

  addSubsectionTitle('12.2', 'TIPOS DE CERTIFICACIÓN');
  
  addTable(
    ['TIPO', 'DESCRIPCIÓN'],
    [
      ['Diploma de Aprovechamiento', 'Certificado del centro de formación'],
      ['Acreditación Parcial', 'Por módulos formativos superados'],
      ['Certificado del Curso', 'Emitido tras completar todos los requisitos'],
    ],
    [60, 110]
  );

  addSubsectionTitle('12.3', 'PROCESO DE EXPEDICIÓN');
  
  addParagraph('Una vez finalizado el curso y verificados los requisitos:');
  
  addBulletList([
    'El centro de formación tramitará su expediente',
    'Recibirá un correo con el diploma de aprovechamiento',
    'Puede descargar su diploma desde la sección "Certificado" del curso'
  ]);

  // ============================================
  // 13. SOPORTE TÉCNICO
  // ============================================
  addNewPage();
  addMainSectionTitle('13', 'SOPORTE TÉCNICO');
  
  addParagraph('Si experimenta problemas técnicos con el Campus Virtual, dispone de varios canales de soporte:');
  
  addSubsectionTitle('13.1', 'CANALES DE SOPORTE');
  
  addTable(
    ['CANAL', 'CONTACTO', 'HORARIO'],
    [
      ['Email', 'Consultar con su centro', 'L-V 9:00-18:00'],
      ['Teléfono', 'Consultar con su centro', 'L-V 9:00-14:00'],
      ['Chat', 'Disponible en la plataforma', 'L-V 9:00-18:00'],
      ['Foro Técnico', 'Sección "Ayuda" del campus', '24/7'],
    ],
    [40, 70, 50]
  );

  addSubsectionTitle('13.2', 'PROBLEMAS FRECUENTES');
  
  addBorderedBox('Problemas de Acceso', [
    'Verifique que está usando las credenciales correctas',
    'Compruebe que no tiene el bloqueo de mayúsculas activado',
    'Limpie la caché del navegador si persiste el problema',
    'Utilice la opción "Recuperar contraseña" si es necesario'
  ]);
  
  addBorderedBox('Problemas de Visualización', [
    'Actualice su navegador a la última versión',
    'Desactive extensiones o complementos que puedan interferir',
    'Pruebe con otro navegador diferente',
    'Verifique su conexión a Internet'
  ]);
  
  addBorderedBox('Problemas con Contenidos', [
    'Asegúrese de tener habilitado JavaScript y cookies',
    'Compruebe que no tiene bloqueadores de contenido activos',
    'Verifique que su equipo cumple los requisitos técnicos mínimos',
    'Actualice los plugins de Flash/Adobe si son requeridos'
  ]);

  addSubsectionTitle('13.3', 'INFORMACIÓN PARA SOPORTE');
  
  addParagraph('Al contactar con soporte técnico, proporcione la siguiente información para agilizar la resolución:');
  
  addBulletList([
    'Su nombre de usuario y DNI/NIE',
    'Nombre del curso y módulo donde ocurre el problema',
    'Descripción detallada del error o incidencia',
    'Navegador y versión que está utilizando',
    'Sistema operativo de su equipo',
    'Capturas de pantalla del error (si es posible)'
  ]);

  // Página final con información de contacto
  addNewPage();
  
  doc.setFillColor(...TEAL_COLOR);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('INFORMACIÓN DE CONTACTO', pageWidth / 2, 25, { align: 'center' });

  yPos = 60;
  
  addBorderedBox('Centro de Formación', [
    branding.centerName || 'Centro de Formación',
    'Consulte los datos de contacto en su campus virtual',
  ]);

  addBorderedBox('Soporte Técnico', [
    'Consulte los datos de contacto en la sección CAU de su curso',
    'Horario: Lunes a Viernes de 9:00 a 18:00'
  ]);

  // Footer final
  yPos = pageHeight - 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Documento generado por ${branding.centerName || 'Campus Virtual'}`, pageWidth / 2, yPos, { align: 'center' });
  doc.text('© 2026 - Todos los derechos reservados', pageWidth / 2, yPos + 8, { align: 'center' });

  // Guardar el PDF
  const fileName = `Guia_Campus_Virtual_${branding.centerName?.replace(/\s+/g, '_') || 'Campus'}.pdf`;
  doc.save(fileName);
};
