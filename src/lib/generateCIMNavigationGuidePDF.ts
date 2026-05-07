import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CenterBranding {
  centerName: string;
  centerLogo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Color principal teal
const TEAL_COLOR: [number, number, number] = [0, 128, 128];
const DARK_TEAL: [number, number, number] = [0, 102, 102];
const LIGHT_TEAL: [number, number, number] = [230, 245, 245];
const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY: [number, number, number] = [128, 128, 128];
const AMBER: [number, number, number] = [245, 158, 11];
const AMBER_LIGHT: [number, number, number] = [254, 243, 199];

export const generateCIMNavigationGuidePDF = async (
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

  // Añadir header en cada página
  const addHeader = () => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...TEAL_COLOR);
    doc.text('GUÍA DE NAVEGACIÓN DEL CIM', pageWidth - margin, 15, { align: 'right' });
    
    // Número de página
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Página ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
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

  // Añadir caja de advertencia amber
  const addWarningBox = (text: string) => {
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(text, contentWidth - 20);
    const boxHeight = lines.length * 4.5 + 12;
    
    checkPageBreak(boxHeight + 5);
    
    doc.setFillColor(...AMBER_LIGHT);
    doc.setDrawColor(...AMBER);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 4, contentWidth, boxHeight, 'FD');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...AMBER);
    doc.text('⚠ IMPORTANTE', margin + 5, yPos + 2);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    lines.forEach((line: string, index: number) => {
      doc.text(line, margin + 5, yPos + (index * 4.5));
    });
    
    yPos += boxHeight - 4;
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

  // Añadir lista numerada
  const addNumberedList = (items: string[]) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    
    items.forEach((item, idx) => {
      checkPageBreak(10);
      
      // Círculo con número
      doc.setFillColor(...TEAL_COLOR);
      doc.circle(margin + 4, yPos - 1, 4, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text((idx + 1).toString(), margin + 4, yPos, { align: 'center' });
      
      doc.setTextColor(...BLACK);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const lines = doc.splitTextToSize(item, contentWidth - 15);
      lines.forEach((line: string, index: number) => {
        doc.text(line, margin + 12, yPos + (index * 4.5));
      });
      yPos += lines.length * 4.5 + 4;
    });
    yPos += 3;
  };

  // Añadir caja con borde lateral
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
        doc.text(lineIndex === 0 ? '• ' + line : '  ' + line, xPos + 8, currentY);
        currentY += lineHeight;
      });
    });
    
    yPos += boxHeight + 8;
  };

  // Añadir sección con icono
  const addIconSection = (icon: string, title: string, description: string) => {
    checkPageBreak(25);
    
    // Cuadro del icono
    doc.setFillColor(...LIGHT_TEAL);
    doc.setDrawColor(...TEAL_COLOR);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 4, 12, 12, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(...TEAL_COLOR);
    doc.text(icon, margin + 6, yPos + 3, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(title, margin + 18, yPos);
    
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    
    const lines = doc.splitTextToSize(description, contentWidth - 20);
    lines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 18, yPos);
      yPos += 4.5;
    });
    
    yPos += 6;
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
  
  // Header con logos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('Campus Virtual', margin, 30);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Formación Profesional para el Empleo', pageWidth - margin, 28, { align: 'right' });

  // Línea separadora
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(1);
  doc.line(margin, 45, pageWidth - margin, 45);

  // Título principal centrado con recuadro
  const titleBoxY = 65;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(2);
  doc.rect(margin + 10, titleBoxY, contentWidth - 20, 70, 'D');
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('GUÍA DE NAVEGACIÓN', pageWidth / 2, titleBoxY + 20, { align: 'center' });
  doc.text('DEL CONTENIDO', pageWidth / 2, titleBoxY + 32, { align: 'center' });
  doc.text('INTERACTIVO MULTIMEDIA', pageWidth / 2, titleBoxY + 44, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('(CIM)', pageWidth / 2, titleBoxY + 58, { align: 'center' });

  // Nombre del centro
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('Centro de Formación Acreditado', pageWidth / 2, 160, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text('Formación Profesional para el Empleo', pageWidth / 2, 172, { align: 'center' });

  // Badge CIM
  doc.setFillColor(...LIGHT_TEAL);
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - 40, 185, 80, 15, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('Contenido Multimedia SCORM', pageWidth / 2, 194, { align: 'center' });

  // Pie de portada
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Manual de navegación para el alumno', pageWidth / 2, 230, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Certificados de Profesionalidad', pageWidth / 2, 238, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
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
    { num: '1', title: '¿Qué es el CIM?', page: 3 },
    { num: '2', title: 'Acceso al Contenido Interactivo', page: 3 },
    { num: '3', title: 'Estructura de la Interfaz', page: 4 },
    { num: '4', title: 'Navegación por el Temario', page: 5 },
    { num: '5', title: 'Barra Superior de Herramientas', page: 6 },
    { num: '6', title: 'Control de Progreso', page: 7 },
    { num: '7', title: 'Tiempo de Visualización', page: 8 },
    { num: '8', title: 'Ejercicios y Autoevaluaciones', page: 9 },
    { num: '9', title: 'Recursos Descargables', page: 10 },
    { num: '10', title: 'Asistente IA', page: 11 },
    { num: '11', title: 'Preguntas Frecuentes', page: 12 },
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
  // 1. ¿QUÉ ES EL CIM?
  // ============================================
  addNewPage();
  addMainSectionTitle('1', '¿QUÉ ES EL CIM?');
  
  addInfoBox('El Contenido Interactivo Multimedia (CIM) es el corazón de tu formación online. Contiene todo el temario de cada Unidad Formativa en formato digital interactivo, diseñado para maximizar tu aprendizaje.');
  
  addParagraph('El CIM es un contenido desarrollado siguiendo el estándar SCORM (Sharable Content Object Reference Model), lo que garantiza:');
  
  addBulletList([
    'Compatibilidad con cualquier plataforma de e-learning',
    'Seguimiento preciso de tu progreso y tiempo de estudio',
    'Registro automático de las pantallas visitadas',
    'Sincronización de tu avance entre dispositivos'
  ]);

  addSubsectionTitle('1.1', 'CARACTERÍSTICAS PRINCIPALES');
  
  addBorderedBox('Contenido Multimedia Enriquecido', [
    'Texto formativo estructurado por temas y subtemas',
    'Imágenes explicativas y esquemas visuales',
    'Vídeos demostrativos y tutoriales',
    'Animaciones interactivas',
    'Ejercicios prácticos con feedback inmediato',
    'Tests de autoevaluación por unidad'
  ]);

  // ============================================
  // 2. ACCESO AL CONTENIDO INTERACTIVO
  // ============================================
  yPos += 5;
  addMainSectionTitle('2', 'ACCESO AL CONTENIDO INTERACTIVO');
  
  addParagraph('Para acceder al CIM de cada Unidad Formativa, sigue estos pasos:');
  
  addNumberedList([
    'Accede a tu curso desde el panel "Mis Cursos"',
    'Navega hasta el módulo formativo correspondiente',
    'Localiza la Unidad Formativa que deseas estudiar',
    'Haz clic en el botón "TEMARIO" de color azul',
    'El contenido se abrirá en una nueva ventana o pestaña'
  ]);

  addWarningBox('El botón TEMARIO solo aparece en las Unidades Formativas que tienen contenido multimedia asociado. Algunas unidades pueden incluir únicamente actividades o documentación PDF.');

  // ============================================
  // 3. ESTRUCTURA DE LA INTERFAZ
  // ============================================
  addNewPage();
  addMainSectionTitle('3', 'ESTRUCTURA DE LA INTERFAZ');
  
  addParagraph('La interfaz del CIM está dividida en tres zonas principales para facilitar la navegación:');
  
  addTable(
    ['ZONA', 'UBICACIÓN', 'FUNCIÓN'],
    [
      ['Índice Lateral', 'Izquierda', 'Muestra el árbol de contenidos con todos los puntos del temario'],
      ['Área Central', 'Centro', 'Presenta el contenido formativo: texto, imágenes, vídeos'],
      ['Barra Superior', 'Arriba', 'Contiene herramientas: Glosario, Descargas, Ejercicios, Test'],
      ['Navegación Inferior', 'Abajo', 'Botones para avanzar y retroceder entre pantallas'],
    ]
  );

  addSubsectionTitle('3.1', 'ÍNDICE LATERAL IZQUIERDO');
  
  addBorderedBox('Funcionalidades del Índice', [
    'Muestra todos los puntos y subpuntos del temario',
    'El signo "+" permite desplegar los subpuntos de cada sección',
    'El signo "-" permite colapsar los subpuntos',
    'Un "tick verde ✓" indica los apartados completados',
    'Puedes navegar directamente pulsando sobre cualquier punto',
    'Los puntos no visitados aparecen sin marca'
  ]);

  addSubsectionTitle('3.2', 'ÁREA CENTRAL DE CONTENIDO');
  
  addParagraph('El área central es donde se muestra todo el contenido formativo. Incluye:');
  
  addBulletList([
    'Texto teórico organizado en secciones claras',
    'Tablas explicativas y resúmenes',
    'Imágenes y fotografías ilustrativas',
    'Vídeos explicativos (pulsa play para reproducir)',
    'Animaciones interactivas',
    'Cuadros de información destacada',
    'Tests integrados en el contenido'
  ]);

  // ============================================
  // 4. NAVEGACIÓN POR EL TEMARIO
  // ============================================
  addNewPage();
  addMainSectionTitle('4', 'NAVEGACIÓN POR EL TEMARIO');
  
  addInfoBox('La navegación por el CIM es secuencial, lo que significa que debes completar cada pantalla antes de pasar a la siguiente. Esto garantiza que aprovechas todo el contenido formativo.');
  
  addSubsectionTitle('4.1', 'BOTONES DE NAVEGACIÓN');
  
  addIconSection('◀', 'Botón ANTERIOR', 'Retrocede a la pantalla anterior. Solo está disponible si ya has visitado pantallas previas.');
  
  addIconSection('▶', 'Botón SIGUIENTE', 'Avanza a la siguiente pantalla. Se activa cuando has completado el tiempo mínimo de visualización de la pantalla actual.');
  
  addIconSection('≡', 'Botón MENÚ', 'Despliega o colapsa el índice lateral izquierdo para maximizar el área de contenido.');

  addSubsectionTitle('4.2', 'NAVEGACIÓN DESDE EL ÍNDICE');
  
  addParagraph('Además de los botones de navegación, puedes moverte por el contenido usando el índice lateral:');
  
  addBulletList([
    'Pulsa sobre cualquier punto del índice para ir directamente a él',
    'Solo puedes acceder a puntos que ya hayas desbloqueado',
    'Los puntos bloqueados aparecen en gris claro',
    'Los puntos completados muestran un tick verde ✓'
  ]);

  addWarningBox('Para desbloquear nuevos puntos del temario, debes completar los anteriores en orden secuencial. No es posible saltar contenido sin haberlo visualizado.');

  // ============================================
  // 5. BARRA SUPERIOR DE HERRAMIENTAS
  // ============================================
  addNewPage();
  addMainSectionTitle('5', 'BARRA SUPERIOR DE HERRAMIENTAS');
  
  addParagraph('La barra superior contiene herramientas complementarias para enriquecer tu experiencia formativa:');
  
  addIconSection('📖', 'GLOSARIO', 'Diccionario de términos clave utilizados en el contenido. Consulta definiciones y conceptos importantes cuando encuentres palabras técnicas o especializadas.');
  
  addIconSection('📥', 'DESCARGAS', 'Acceso a los manuales en formato PDF para estudio offline. Puedes descargar e imprimir el material para consulta fuera de la plataforma.');
  
  addIconSection('✏️', 'EJERCICIOS', 'Actividades prácticas relacionadas con el contenido. Incluyen casos prácticos, ejercicios de aplicación y supuestos para reforzar el aprendizaje.');
  
  addIconSection('✓', 'TEST', 'Autoevaluaciones para comprobar tu nivel de comprensión. No son obligatorios pero te ayudan a prepararte para las evaluaciones finales.');

  addSubsectionTitle('5.1', 'USO DEL GLOSARIO');
  
  addBorderedBox('Cómo utilizar el Glosario', [
    'Pulsa el botón "Glosario" en la barra superior',
    'Se abrirá una ventana con los términos ordenados alfabéticamente',
    'Busca el término que necesitas consultar',
    'Pulsa sobre él para ver su definición completa',
    'Cierra la ventana para volver al contenido'
  ]);

  // ============================================
  // 6. CONTROL DE PROGRESO
  // ============================================
  addNewPage();
  addMainSectionTitle('6', 'CONTROL DE PROGRESO');
  
  addInfoBox('El sistema registra automáticamente tu progreso mientras navegas por el contenido. Esta información es fundamental para el seguimiento de tu formación y el cumplimiento de requisitos SEPE.');
  
  addSubsectionTitle('6.1', 'INDICADORES DE PROGRESO');
  
  addTable(
    ['INDICADOR', 'SIGNIFICADO'],
    [
      ['Tick verde ✓', 'Pantalla completamente visualizada'],
      ['Círculo vacío ○', 'Pantalla no visitada'],
      ['Punto gris', 'Pantalla bloqueada (requiere completar anteriores)'],
      ['Barra de progreso', 'Porcentaje global de avance en la unidad'],
    ]
  );

  addSubsectionTitle('6.2', 'GUARDADO AUTOMÁTICO');
  
  addParagraph('Tu progreso se guarda automáticamente en los siguientes momentos:');
  
  addBulletList([
    'Al completar cada pantalla del contenido',
    'Al cerrar la ventana del CIM',
    'Cada 30 segundos mientras navegas',
    'Al completar ejercicios o tests'
  ]);

  addBorderedBox('Retomar donde lo dejaste', [
    'Cuando vuelvas a abrir el CIM, el sistema te preguntará si deseas continuar donde lo dejaste.',
    'Pulsa "Sí" para retomar desde la última pantalla visitada.',
    'Pulsa "No" para empezar desde el principio del contenido.'
  ]);

  // ============================================
  // 7. TIEMPO DE VISUALIZACIÓN
  // ============================================
  addNewPage();
  addMainSectionTitle('7', 'TIEMPO DE VISUALIZACIÓN');
  
  addWarningBox('El tiempo mínimo de visualización de cada pantalla está controlado por el sistema para garantizar el aprovechamiento del contenido formativo. Este es un requisito obligatorio para certificados de profesionalidad.');
  
  addSubsectionTitle('7.1', 'CÓMO FUNCIONA');
  
  addParagraph('Cada pantalla del CIM tiene un tiempo mínimo de visualización calculado en función de su contenido:');
  
  addBulletList([
    'El botón "Siguiente" permanece desactivado hasta cumplir el tiempo mínimo',
    'Un temporizador puede mostrarse indicando el tiempo restante',
    'El tiempo se pausa si minimizas la ventana o cambias de pestaña',
    'Los vídeos tienen su propio control de tiempo (duración completa)'
  ]);

  addSubsectionTitle('7.2', 'REGISTRO DE TIEMPOS');
  
  addParagraph('El sistema registra los siguientes datos de tiempo para cada alumno:');
  
  addTable(
    ['DATO', 'DESCRIPCIÓN'],
    [
      ['Tiempo total', 'Minutos totales dedicados a la unidad formativa'],
      ['Tiempo por pantalla', 'Duración de visualización de cada página'],
      ['Fecha y hora', 'Registro de cada sesión de estudio'],
      ['Sesiones', 'Número de veces que has accedido al contenido'],
    ]
  );

  addInfoBox('Estos datos son utilizados para generar los informes de seguimiento SEPE y verificar el cumplimiento de los requisitos de teleformación.');

  // ============================================
  // 8. EJERCICIOS Y AUTOEVALUACIONES
  // ============================================
  addNewPage();
  addMainSectionTitle('8', 'EJERCICIOS Y AUTOEVALUACIONES');
  
  addSubsectionTitle('8.1', 'TIPOS DE EJERCICIOS');
  
  addBorderedBox('Ejercicios Integrados', [
    'Aparecen dentro del propio contenido mientras navegas',
    'Suelen ser preguntas rápidas de comprensión',
    'Proporcionan feedback inmediato',
    'No afectan a la calificación final'
  ]);

  addBorderedBox('Ejercicios de la Barra Superior', [
    'Accesibles desde el botón "Ejercicios"',
    'Casos prácticos más extensos',
    'Pueden requerir documentación o investigación',
    'Algunos pueden ser entregables al tutor'
  ]);

  addSubsectionTitle('8.2', 'TESTS DE AUTOEVALUACIÓN');
  
  addParagraph('Los tests de autoevaluación te permiten comprobar tu nivel de comprensión:');
  
  addBulletList([
    'Accede desde el botón "Test" de la barra superior',
    'Contienen preguntas tipo test de respuesta múltiple',
    'Al finalizar recibes tu puntuación inmediatamente',
    'Puedes repetirlos tantas veces como necesites',
    'Son orientativos: no sustituyen las evaluaciones oficiales'
  ]);

  addWarningBox('Los tests de autoevaluación del CIM NO son las evaluaciones oficiales del curso. Las evaluaciones que cuentan para tu calificación final se encuentran en la sección "Exámenes" del campus virtual.');

  // ============================================
  // 9. RECURSOS DESCARGABLES
  // ============================================
  addNewPage();
  addMainSectionTitle('9', 'RECURSOS DESCARGABLES');
  
  addSubsectionTitle('9.1', 'MANUALES EN PDF');
  
  addParagraph('Desde el botón "Descargas" de la barra superior puedes acceder a los manuales del curso en formato PDF:');
  
  addBulletList([
    'Manual completo de la Unidad Formativa',
    'Esquemas y resúmenes',
    'Material complementario',
    'Anexos y documentación de referencia'
  ]);

  addBorderedBox('Ventajas del material descargable', [
    'Estudia sin conexión a internet',
    'Imprime los contenidos que necesites',
    'Subraya y toma notas en el documento',
    'Consulta el material en cualquier momento',
    'Complementa el estudio del CIM'
  ]);

  addSubsectionTitle('9.2', 'CÓMO DESCARGAR');
  
  addNumberedList([
    'Pulsa el botón "Descargas" en la barra superior',
    'Se mostrará la lista de documentos disponibles',
    'Pulsa sobre el documento que deseas descargar',
    'El archivo PDF se descargará a tu dispositivo',
    'Ábrelo con cualquier lector de PDF (Adobe Reader, etc.)'
  ]);

  // ============================================
  // 10. ASISTENTE IA
  // ============================================
  addNewPage();
  addMainSectionTitle('10', 'ASISTENTE IA');
  
  addInfoBox('El Asistente de Inteligencia Artificial es una herramienta de apoyo que te ayuda a resolver dudas y comprender mejor el contenido formativo mientras estudias.');
  
  addSubsectionTitle('10.1', 'FUNCIONALIDADES');
  
  addIconSection('💬', 'Resolución de Dudas', 'Pregunta sobre cualquier concepto del temario y recibe explicaciones claras y detalladas.');
  
  addIconSection('📝', 'Resúmenes', 'Solicita resúmenes de secciones específicas para repasar los puntos clave.');
  
  addIconSection('❓', 'Preguntas de Práctica', 'Pide preguntas de ejemplo para practicar antes de las evaluaciones.');
  
  addIconSection('🔍', 'Ampliación de Contenido', 'Obtén información adicional sobre temas que te interesen profundizar.');

  addSubsectionTitle('10.2', 'CÓMO UTILIZARLO');
  
  addBulletList([
    'Busca el icono del asistente en la esquina de la pantalla',
    'Escribe tu pregunta de forma clara y específica',
    'El asistente responderá en contexto con el contenido que estás estudiando',
    'Puedes hacer preguntas de seguimiento para profundizar'
  ]);

  addWarningBox('El asistente IA es una herramienta de apoyo, no sustituye el estudio del contenido oficial ni la comunicación con tu tutor/a para dudas complejas o administrativas.');

  // ============================================
  // 11. PREGUNTAS FRECUENTES
  // ============================================
  addNewPage();
  addMainSectionTitle('11', 'PREGUNTAS FRECUENTES');
  
  addBorderedBox('¿Por qué el botón "Siguiente" está desactivado?', [
    'Debes esperar a que se complete el tiempo mínimo de visualización de la pantalla actual.',
    'Asegúrate de no tener la ventana minimizada, ya que el tiempo se pausa.',
    'Si hay un vídeo, debes verlo completo antes de continuar.'
  ]);

  addBorderedBox('¿Puedo saltar pantallas del contenido?', [
    'No, la navegación es secuencial para garantizar que visualizas todo el contenido.',
    'Una vez completada una pantalla, puedes volver a ella cuando quieras.',
    'El índice lateral solo permite acceder a puntos ya desbloqueados.'
  ]);

  addBorderedBox('¿Se guarda mi progreso si cierro la ventana?', [
    'Sí, tu progreso se guarda automáticamente.',
    'Al volver a abrir el CIM, podrás continuar donde lo dejaste.',
    'Los datos se sincronizan con el servidor del campus virtual.'
  ]);

  addBorderedBox('¿Por qué no veo el contenido correctamente?', [
    'Verifica que tu navegador está actualizado (Chrome, Firefox, Edge).',
    'Asegúrate de tener JavaScript habilitado.',
    'Desactiva temporalmente los bloqueadores de anuncios.',
    'Prueba a limpiar la caché del navegador.'
  ]);

  addBorderedBox('¿Los tests del CIM cuentan para la nota final?', [
    'No, los tests dentro del CIM son de autoevaluación.',
    'Las evaluaciones oficiales están en la sección "Exámenes" del campus.',
    'Utiliza los tests del CIM para practicar y prepararte.'
  ]);

  // ============================================
  // PÁGINA FINAL - CONTACTO
  // ============================================
  addNewPage();
  
  doc.setFillColor(...LIGHT_TEAL);
  doc.rect(margin, yPos, contentWidth, 60, 'F');
  
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('¿NECESITAS AYUDA?', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text('Si tienes problemas técnicos con el CIM, contacta con soporte:', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.text(`📧 ${branding.contactEmail || 'soporte@plataforma.com'}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`📞 ${branding.contactPhone || ''}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 30;
  
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text('Centro de Formación Acreditado', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Formación Profesional para el Empleo', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.text('Certificados de Profesionalidad · Teleformación', pageWidth / 2, yPos, { align: 'center' });

  // Guardar PDF (Blob + ObjectURL para evitar bloqueos del navegador)
  const fileName = `Guia_Navegacion_CIM_${new Date().toISOString().split('T')[0]}.pdf`;
  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
  } catch {
    doc.save(fileName);
  }
};
