import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CenterBranding {
  centerName: string;
  centerLogo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  cif?: string;
  sepeRegistryNumber?: string;
}

interface ModuleData {
  title: string;
  durationMinutes?: number | null;
  description?: string | null;
  objectives?: string | null;
  formativeUnits?: Array<{
    title: string;
    durationHours?: number | null;
    objectives?: string | null;
  }>;
}

interface CourseDataForPDF {
  title: string;
  code?: string | null;
  professionalFamily?: string | null;
  qualificationLevel?: number | null;
  durationHours?: number | null;
  objectives?: string | null;
  modules?: ModuleData[];
  supportEmail?: string | null;
  supportPhone?: string | null;
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
  branding: CenterBranding,
  courseData?: CourseDataForPDF
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

  // Use courseData if provided, otherwise fallback
  const code = courseData?.code || "Sin código";
  const family = courseData?.professionalFamily || "Sin especificar";
  const level = courseData?.qualificationLevel ?? null;
  const totalHours = courseData?.durationHours || 0;
  const courseObjectives = courseData?.objectives || "Con este curso aprenderás a desarrollar las competencias profesionales necesarias para el desempeño de las funciones propias de la ocupación relacionada con el certificado de profesionalidad.";
  const modules = courseData?.modules || [];
  const supportEmail = branding.contactEmail || courseData?.supportEmail || "soporte@campus.es";
  const supportPhone = branding.contactPhone || courseData?.supportPhone || "";
  const centerAddress = branding.address || "";
  const centerCIF = branding.cif || "";
  const centerSepeReg = branding.sepeRegistryNumber || "";

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

  const addMainSectionTitle = (number: string, title: string) => {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(`${number}. ${title}`, margin, yPos);
    yPos += 12;
  };

  const addSubsectionTitle = (number: string, title: string) => {
    checkPageBreak(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(`${number} ${title}`, margin, yPos);
    yPos += 8;
  };

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

  const addIconSection = (title: string, description: string, isLink = false) => {
    checkPageBreak(20);
    
    doc.setFillColor(...LIGHT_TEAL);
    doc.setDrawColor(...TEAL_COLOR);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 4, 8, 8, 'FD');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEAL_COLOR);
    doc.text(title, margin + 12, yPos);
    
    if (isLink) {
      doc.line(margin + 12, yPos + 1, margin + 12 + doc.getTextWidth(title), yPos + 1);
    }
    
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

  // ===== CAMPUS SCREENSHOT DIAGRAMS =====
  
  const BLUE_ACCENT: [number, number, number] = [59, 130, 246];
  const LIGHT_BLUE: [number, number, number] = [219, 234, 254];
  const SIDEBAR_BG: [number, number, number] = [243, 244, 246];
  
  /** Draw an annotated diagram of the main campus view (Inicio tab) */
  const drawCampusDiagramInicio = () => {
    checkPageBreak(130);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('Figura 1: Pantalla principal del Campus Virtual - Pestaña INICIO', margin, yPos);
    yPos += 5;
    
    const diagX = margin;
    const diagY = yPos;
    const diagW = contentWidth;
    const diagH = 110;
    
    // Outer border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(diagX, diagY, diagW, diagH);
    
    // Header bar
    doc.setFillColor(...BLUE_ACCENT);
    doc.rect(diagX, diagY, diagW, 10, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.text('← Volver', diagX + 3, diagY + 6);
    doc.text('Centro de Formación', diagX + diagW / 2, diagY + 6, { align: 'center' });
    
    // Course title area
    doc.setFillColor(245, 245, 245);
    doc.rect(diagX, diagY + 10, diagW, 15, 'F');
    doc.setTextColor(...BLACK);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(courseTitle.substring(0, 80), diagX + 5, diagY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`${totalHours} horas  |  ${modules.length} módulos  |  0% completado`, diagX + 5, diagY + 23);
    
    // Top tabs
    const tabY = diagY + 25;
    doc.setFillColor(...WHITE);
    doc.rect(diagX, tabY, diagW, 8, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.line(diagX, tabY + 8, diagX + diagW, tabY + 8);
    doc.setFontSize(6);
    doc.setTextColor(...BLUE_ACCENT);
    const tabs = ['Mis Cursos', 'Mensajes', 'CAU', 'WhatsApp', 'Contacto', 'Gestor Calidad'];
    tabs.forEach((tab, i) => {
      doc.text(tab, diagX + 5 + i * 28, tabY + 5);
    });
    
    // Left sidebar
    const sideW = 38;
    const contentY = tabY + 8;
    const contentH = diagH - (contentY - diagY);
    doc.setFillColor(...SIDEBAR_BG);
    doc.rect(diagX, contentY, sideW, contentH, 'F');
    
    doc.setTextColor(...BLACK);
    doc.setFontSize(6);
    const menuItems = ['► Inicio', '  Guía del Alumno', '  Programa Formativo', '  Plan de Trabajo', '  Cronograma', '  Formación en Campus', '  Calificaciones', '  Exámenes', '  Tutorías', '  Calendario', '  Foro', '  Glosario'];
    menuItems.forEach((item, i) => {
      if (i === 0) {
        doc.setFillColor(...BLUE_ACCENT);
        doc.rect(diagX, contentY + i * 5, sideW, 5, 'F');
        doc.setTextColor(...WHITE);
      } else {
        doc.setTextColor(80, 80, 80);
      }
      doc.text(item, diagX + 3, contentY + 3.5 + i * 5);
    });
    
    // Center content area
    const centerX = diagX + sideW + 2;
    const centerW = diagW - sideW - 45;
    doc.setFillColor(...WHITE);
    doc.rect(centerX, contentY, centerW, contentH, 'F');
    
    doc.setTextColor(...BLUE_ACCENT);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Centro de Ayuda', centerX + 5, contentY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text('Recursos y guías para usar la plataforma', centerX + 5, contentY + 13);
    
    // Resource boxes
    const boxW = (centerW - 15) / 3;
    ['Guía Campus', 'Video Tutorial', 'Soporte Técnico'].forEach((label, i) => {
      const bx = centerX + 5 + i * (boxW + 2);
      doc.setDrawColor(200, 200, 200);
      doc.rect(bx, contentY + 17, boxW, 12);
      doc.setTextColor(...BLUE_ACCENT);
      doc.setFontSize(5);
      doc.text(label, bx + 2, contentY + 24);
    });
    
    // FAQs section
    doc.setTextColor(...BLACK);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Preguntas Frecuentes (FAQs)', centerX + 5, contentY + 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    ['¿Cómo accedo al contenido?', '¿Dónde veo mi progreso?', '¿Cómo contacto con mi tutor?', '¿Cómo envío una actividad?'].forEach((q, i) => {
      doc.text(`${i+1}. ${q}`, centerX + 8, contentY + 41 + i * 4);
    });
    
    // Right sidebar
    const rightX = diagX + diagW - 42;
    doc.setFillColor(248, 248, 248);
    doc.rect(rightX, contentY, 42, contentH, 'F');
    doc.setTextColor(...BLACK);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Tu Tutor', rightX + 3, contentY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.text('Tutor del curso', rightX + 3, contentY + 14);
    doc.text('Mi Perfil', rightX + 3, contentY + 25);
    doc.setFontSize(4.5);
    doc.text('Datos personales y', rightX + 3, contentY + 30);
    doc.text('documentación', rightX + 3, contentY + 34);
    
    // Annotations with arrows
    doc.setTextColor(200, 0, 0);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    
    yPos = diagY + diagH + 5;
    
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('En la imagen se muestra la pantalla principal del Campus Virtual con el menú lateral, el área', margin, yPos);
    yPos += 4;
    doc.text('central de contenido y la barra lateral derecha con información del tutor y perfil.', margin, yPos);
    yPos += 10;
  };
  
  /** Draw annotated diagram of Formación en Campus */
  const drawCampusDiagramFormacion = () => {
    checkPageBreak(100);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('Figura 2: Sección "Formación en Campus" - Módulos Formativos', margin, yPos);
    yPos += 5;
    
    const diagX = margin;
    const diagY = yPos;
    const diagW = contentWidth;
    const diagH = 80;
    
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(diagX, diagY, diagW, diagH);
    
    // Header
    doc.setFillColor(...BLUE_ACCENT);
    doc.rect(diagX, diagY, diagW, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.text('Formacion en Campus - Modulos Formativos', diagX + diagW / 2, diagY + 5, { align: 'center' });
    
    // Info box
    doc.setFillColor(255, 251, 235);
    doc.rect(diagX + 5, diagY + 12, diagW - 10, 8, 'F');
    doc.setTextColor(180, 120, 0);
    doc.setFontSize(5.5);
    doc.text('Cada módulo incluye: contenido interactivo, manual PDF, actividad de desarrollo y test final. Nota mínima: 50%.', diagX + 8, diagY + 17);
    
    // Module cards
    doc.setTextColor(...BLACK);
    doc.setFontSize(6);
    const displayModules = modules.slice(0, 4);
    displayModules.forEach((mod, i) => {
      const cardY = diagY + 24 + i * 13;
      doc.setDrawColor(200, 200, 200);
      doc.rect(diagX + 10, cardY, diagW - 20, 11);
      
      // Progress circle
      doc.setFillColor(220, 220, 220);
      doc.circle(diagX + 16, cardY + 5.5, 3, 'F');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(4);
      doc.text('0%', diagX + 14.5, cardY + 6.5);
      
      // Module badge
      doc.setFillColor(...BLUE_ACCENT);
      doc.roundedRect(diagX + 22, cardY + 1.5, 10, 4, 1, 1, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(4.5);
      doc.text(`MF ${i + 1}`, diagX + 24, cardY + 4.2);
      
      // Module title
      doc.setTextColor(...BLACK);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(mod.title.substring(0, 85), diagX + 35, cardY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      const modHours = mod.durationMinutes ? Math.round(mod.durationMinutes / 60) : 0;
      doc.setTextColor(100, 100, 100);
      doc.text(`${modHours}h  |  UFs  |  Tests  |  Actividades`, diagX + 35, cardY + 9);
    });
    
    yPos = diagY + diagH + 5;
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Cada módulo muestra su progreso, horas, unidades formativas, tests y actividades disponibles.', margin, yPos);
    yPos += 10;
  };
  
  /** Draw annotated diagram of Calificaciones */
  const drawCampusDiagramCalificaciones = () => {
    checkPageBreak(90);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('Figura 3: Sección "Calificaciones" - Progresos y Calificaciones', margin, yPos);
    yPos += 5;
    
    const diagX = margin;
    const diagY = yPos;
    const diagW = contentWidth;
    const diagH = 65;
    
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(diagX, diagY, diagW, diagH);
    
    // Header with icon
    doc.setFillColor(255, 200, 0);
    doc.circle(diagX + 15, diagY + 12, 5, 'F');
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PROGRESOS Y CALIFICACIONES', diagX + 25, diagY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('En este módulo podrá realizar el seguimiento de todos los progresos y evaluaciones.', diagX + 25, diagY + 15);
    
    // Selectors
    doc.setDrawColor(200, 200, 200);
    doc.rect(diagX + 10, diagY + 22, 65, 7);
    doc.rect(diagX + 80, diagY + 22, 65, 7);
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text('Módulo: Seleccionar...', diagX + 12, diagY + 27);
    doc.text('Unidad formativa: Seleccionar...', diagX + 82, diagY + 27);
    
    // Grades table
    doc.setFillColor(60, 60, 60);
    doc.rect(diagX + 10, diagY + 33, diagW - 20, 6, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(5.5);
    doc.text('CALIFICACIÓN FORMACIÓN EN CAMPUS', diagX + 15, diagY + 37);
    
    const gradeItems = ['Mis Accesos', 'Contenidos interactivos', 'Ejercicios y tareas', 'Participación en foros'];
    gradeItems.forEach((item, i) => {
      const gy = diagY + 39 + i * 5;
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248);
      doc.rect(diagX + 10, gy, diagW - 20, 5, 'F');
      doc.setTextColor(...TEAL_COLOR);
      doc.setFontSize(5);
      doc.text(item, diagX + 15, gy + 3.5);
      doc.text('--', diagX + diagW - 35, gy + 3.5);
    });
    
    yPos = diagY + diagH + 5;
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('La sección de calificaciones te permite consultar tus progresos por módulo y unidad formativa.', margin, yPos);
    yPos += 10;
  };
  
  /** Draw annotated diagram of Foro */
  const drawCampusDiagramForo = () => {
    checkPageBreak(75);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('Figura 4: Sección "Foro" - Foros del Curso', margin, yPos);
    yPos += 5;
    
    const diagX = margin;
    const diagY = yPos;
    const diagW = contentWidth;
    const diagH = 50;
    
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(diagX, diagY, diagW, diagH);
    
    // Title
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Foros del Curso', diagX + 10, diagY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('El tutor responderá en un máximo de 48 horas. Participación obligatoria.', diagX + 10, diagY + 16);
    
    // Tabs
    const tabTypes = ['Formativo', 'Ayuda Técnica', 'Administrativo'];
    tabTypes.forEach((t, i) => {
      const tx = diagX + 10 + i * 50;
      doc.setDrawColor(...BLUE_ACCENT);
      if (i === 0) {
        doc.setFillColor(...LIGHT_BLUE);
        doc.rect(tx, diagY + 20, 45, 6, 'FD');
      } else {
        doc.rect(tx, diagY + 20, 45, 6);
      }
      doc.setTextColor(i === 0 ? BLUE_ACCENT[0] : 100, i === 0 ? BLUE_ACCENT[1] : 100, i === 0 ? BLUE_ACCENT[2] : 100);
      doc.setFontSize(5);
      doc.text(t, tx + 5, diagY + 24);
    });
    
    // Info box
    doc.setFillColor(239, 246, 255);
    doc.rect(diagX + 10, diagY + 30, diagW - 20, 8, 'F');
    doc.setTextColor(...BLUE_ACCENT);
    doc.setFontSize(5);
    doc.text('Foro de participación formativa: Pregunta, aclara, debate y reflexiona sobre los temas del curso.', diagX + 13, diagY + 35);
    
    // New topic button
    doc.setFillColor(...BLUE_ACCENT);
    doc.roundedRect(diagX + diagW - 45, diagY + 40, 30, 6, 1, 1, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(5);
    doc.text('+ Nuevo tema', diagX + diagW - 42, diagY + 44);
    
    yPos = diagY + diagH + 5;
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Los foros se organizan en tres categorías: Formativo, Ayuda Técnica y Administrativo.', margin, yPos);
    yPos += 10;
  };
  
  /** Draw annotated diagram of Exámenes */
  const drawCampusDiagramExamenes = () => {
    checkPageBreak(75);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('Figura 5: Sección "Exámenes" - Evaluaciones', margin, yPos);
    yPos += 5;
    
    const diagX = margin;
    const diagY = yPos;
    const diagW = contentWidth;
    const diagH = 55;
    
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(diagX, diagY, diagW, diagH);
    
    // Header
    doc.setFillColor(...BLUE_ACCENT);
    doc.rect(diagX + 5, diagY + 5, diagW - 10, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUACIÓN', diagX + 10, diagY + 10);
    
    // Test items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    const testNames = [
      'UD 1. Estructura de la Formación Profesional - Test Final',
      'UD 2. Certificados de profesionalidad - Test Final',
      'UD 3. Elaboración de la programación didáctica - Test Final',
    ];
    testNames.forEach((test, i) => {
      const ty = diagY + 17 + i * 8;
      doc.setFillColor(i % 2 === 0 ? 255 : 248, 255, i % 2 === 0 ? 255 : 248);
      doc.rect(diagX + 5, ty, diagW - 10, 7, 'F');
      doc.setTextColor(...BLACK);
      doc.text(test, diagX + 20, ty + 4.5);
      // Check icon
      doc.setFillColor(34, 197, 94);
      doc.circle(diagX + diagW - 15, ty + 3.5, 2.5, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(4);
      doc.text('✓', diagX + diagW - 16.5, ty + 4.5);
      doc.setFontSize(5.5);
    });
    
    yPos = diagY + diagH + 5;
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Los exámenes están organizados por unidad formativa. Un tick verde indica que está disponible.', margin, yPos);
    yPos += 10;
  };
  

  // Tabla de identificación dinámica
  const addIdentificationTable = () => {
    checkPageBreak(60);
    
    autoTable(doc, {
      startY: yPos,
      head: [['DENOMINACIÓN:']],
      body: [[courseTitle]],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 9, textColor: BLACK, halign: 'left' },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    yPos = (doc as any).lastAutoTable.finalY;
    
    autoTable(doc, {
      startY: yPos,
      head: [['CÓDIGO:', 'FAMILIA PROFESIONAL:', 'NIVEL DE CUALIFICACIÓN PROFESIONAL:']],
      body: [[code, family, level !== null ? String(level) : 'N/D']],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 9, textColor: BLACK, halign: 'center' },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 80 }, 2: { cellWidth: 50 } },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Tabla de itinerario formativo dinámica
  const addItinerarioTable = () => {
    checkPageBreak(80);
    
    const rows: string[][] = [];
    modules.forEach(mod => {
      const modHours = mod.durationMinutes ? Math.round(mod.durationMinutes / 60) : 0;
      rows.push([mod.title, String(modHours)]);
      if (mod.formativeUnits && mod.formativeUnits.length > 0) {
        mod.formativeUnits.forEach(uf => {
          rows.push([`   ${uf.title}`, String(uf.durationHours || 0)]);
        });
      }
    });
    
    if (rows.length === 0) {
      addParagraph('Consulta el contenido del curso para ver el detalle de módulos formativos.');
      return;
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS FORMATIVOS', 'HORAS']],
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 9, textColor: BLACK },
      columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 30, halign: 'center' } },
      alternateRowStyles: { fillColor: LIGHT_TEAL },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Tabla de objetivos dinámica
  const addObjetivosTable = () => {
    checkPageBreak(100);
    
    const rows: string[][] = [];
    modules.forEach(mod => {
      if (mod.formativeUnits && mod.formativeUnits.length > 0) {
        mod.formativeUnits.forEach(uf => {
          if (uf.objectives) {
            rows.push([uf.title, uf.objectives]);
          }
        });
      } else if (mod.objectives) {
        rows.push([mod.title, mod.objectives]);
      }
    });
    
    if (rows.length === 0) {
      addParagraph('Consulta el programa formativo para ver los objetivos específicos de cada módulo.');
      return;
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS / UNIDADES FORMATIVAS', 'OBJETIVOS']],
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: BLACK, valign: 'top' },
      columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { cellWidth: 115 } },
      alternateRowStyles: { fillColor: LIGHT_TEAL },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  };

  // Tabla de calendario de módulos dinámica
  const addModulosFormativosTable = () => {
    checkPageBreak(120);
    
    const rows: string[][] = [];
    modules.forEach(mod => {
      const modHours = mod.durationMinutes ? Math.round(mod.durationMinutes / 60) : 0;
      rows.push([mod.title, String(modHours), 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo', 'Ver Plan de Trabajo']);
      if (mod.formativeUnits && mod.formativeUnits.length > 0) {
        mod.formativeUnits.forEach(uf => {
          rows.push([`   ${uf.title}`, String(uf.durationHours || 0), '', '', '', '']);
        });
      }
    });
    
    if (rows.length === 0) {
      addParagraph('Consulta el Plan de Trabajo para ver las fechas de cada módulo.');
      return;
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['MÓDULOS FORMATIVOS', 'HORAS', 'FECHA INICIO', 'FECHA FIN', 'TUTORÍAS PRESENCIALES (*)', 'PRUEBA DE EVALUACIÓN FINAL (*) (**)']],
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 7, fontStyle: 'bold', halign: 'center', valign: 'middle' },
      bodyStyles: { fontSize: 7, textColor: BLACK, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
      alternateRowStyles: { fillColor: LIGHT_TEAL },
      tableLineColor: TEAL_COLOR,
      tableLineWidth: 0.3,
    });
    yPos = (doc as any).lastAutoTable.finalY + 5;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.text('(*) En estas fechas deberás asistir a las sesiones de tutorías y pruebas de evaluación presenciales en el Centro de Formación.', margin, yPos);
    yPos += 5;
    doc.text('(**) De forma excepcional, la prueba de evaluación se podrá desarrollar al finalizar cada unidad formativa.', margin, yPos);
    yPos += 10;
  };

  // Tabla de requisitos técnicos (genérica - igual para todos)
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
      'Google Chrome (recomendado), versión actualizada',
      'Mozilla Firefox, versión actualizada',
      'Microsoft Edge, versión actualizada',
    ]);
    
    addBulletList([
      'RESOLUCIÓN MÍNIMA DE PANTALLA: Se aconseja una resolución mínima de pantalla de 1024 x 768 píxeles.',
      'OFFICE: 2016 o superior / LibreOffice.',
      'ACROBAT READER: https://get.adobe.com/es/reader/',
    ]);
  };

  // ============ GENERAR EL PDF ============
  
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
  addParagraph(courseObjectives);
  yPos += 5;
  
  // Show objectives table only if we have data
  const hasObjectives = modules.some(m => m.objectives || (m.formativeUnits && m.formativeUnits.some(uf => uf.objectives)));
  if (hasObjectives) {
    addParagraph('A continuación podrás ver las capacidades que desarrollarás en cada módulo formativo/unidad formativa:');
    yPos += 3;
    addObjetivosTable();
  }
  
  addSubsectionTitle('2.4', 'MÓDULO DE PRÁCTICAS: FORMACIÓN PRÁCTICA EN CENTROS DE TRABAJO');
  addParagraph('El módulo de formación práctica en centros de trabajo se realiza, preferentemente, una vez hayas superado el resto de módulos formativos del certificado de profesionalidad al que corresponde tu curso.');
  addParagraph('Este módulo de formación práctica puede comenzar hasta cuatro meses después de que hayas finalizado tu formación.');
  addParagraph('En el caso de que dispongas de alguna experiencia en alguna ocupación relacionada con el certificado de profesionalidad, podrás solicitar la exención de este módulo ante la Administración.');
  
  yPos += 5;
  
  addSubsectionTitle('2.5', 'REQUISITOS DE ACCESO Y PRUEBA DE COMPETENCIA DIGITAL');

  if (level === 1) {
    addParagraph('Para acceder a este curso, correspondiente a un certificado de profesionalidad de nivel 1, deberás poseer las competencias claves en materia lingüística, matemática y/o social que se determine en cada módulo del certificado de profesionalidad.');
  } else if (level && level >= 2) {
    addParagraph(`Para acceder a este curso, correspondiente a un certificado de profesionalidad de nivel ${level}, deberás cumplir alguno de los siguientes requisitos:`);
    yPos += 3;
    addBulletList([
      level >= 3 ? 'Título de Bachiller o equivalente' : 'Título de ESO o equivalente',
      level >= 3 ? 'Título de Técnico Superior o equivalente' : 'Título de Técnico o equivalente',
      'Certificado de profesionalidad del mismo nivel',
      'Competencias clave del nivel correspondiente',
    ]);
  } else {
    addParagraph('Consulta los requisitos específicos de acceso a este curso.');
  }
  
  yPos += 3;
  addParagraph('Nota: para poder desarrollar el certificado de profesionalidad en modalidad teleformación has debido superar la prueba de competencia tecnológica que se habrá realizado antes del inicio de la acción formativa.', 9);
  yPos += 5;
  
  addSubsectionTitle('2.6', 'SALIDAS LABORALES');
  addParagraph('Con este certificado de profesionalidad podrás acceder a los sectores y ocupaciones profesionales relacionados con la cualificación de referencia. Consulta la ficha del certificado para más información.');
  yPos += 10;
  
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
  
  // SECCIÓN 3.2: FUNCIONAMIENTO DEL CAMPUS
  addSubsectionTitle('3.2', 'FUNCIONAMIENTO, RECURSOS Y UTILIDADES DEL CAMPUS');
  addParagraph('Cada vez que accedas al Campus Virtual te aparecerá una pantalla con todos los cursos en los que estás matriculado/a. Pulsando sobre el nombre del curso podrás acceder al contenido.');
  yPos += 5;
  
  addParagraph('La navegación principal del curso se estructura en el MENÚ LATERAL IZQUIERDO:');
  yPos += 8;
  
  // Tabla del menú de navegación del campus (genérica)
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
    headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, textColor: BLACK },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 45, textColor: TEAL_COLOR },
      2: { cellWidth: 80 },
    },
    alternateRowStyles: { fillColor: LIGHT_TEAL },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // INSERT CAMPUS DIAGRAMS
  addParagraph('A continuación se muestran capturas de las principales secciones del Campus Virtual:');
  yPos += 5;
  drawCampusDiagramInicio();
  drawCampusDiagramFormacion();
  drawCampusDiagramCalificaciones();
  drawCampusDiagramForo();
  drawCampusDiagramExamenes();
  
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
    headStyles: { fillColor: [80, 80, 80], textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'left' },
    bodyStyles: { fontSize: 9, textColor: TEAL_COLOR },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.2,
  });
  yPos = (doc as any).lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['CALIFICACIÓN TUTORÍAS PRESENCIALES']],
    body: [['Actividades y pruebas']],
    margin: { left: margin + 10, right: margin + 10 },
    headStyles: { fillColor: [80, 80, 80], textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'left' },
    bodyStyles: { fontSize: 9, textColor: TEAL_COLOR },
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
    headStyles: { fillColor: [80, 80, 80], textColor: WHITE, fontSize: 9, fontStyle: 'bold', halign: 'left' },
    bodyStyles: { fontSize: 9, textColor: TEAL_COLOR },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.2,
  });
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // B) COMUNICARME
  checkPageBreak(60);
  addInfoBox('B) COMUNICARME - Herramientas de Comunicación', false);
  yPos += 3;
  addParagraph('En el Campus dispones de varias herramientas para comunicarte con tu tutor/a-formador/a y con el resto de alumnos/as:');
  yPos += 5;
  
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
    headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, textColor: BLACK },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 45, textColor: TEAL_COLOR },
      2: { cellWidth: 75 },
    },
    alternateRowStyles: { fillColor: LIGHT_TEAL },
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
  const contactOptions = [
    'MENSAJERÍA INTERNA: Pulsa el botón "Contacto" en la cabecera del curso y escribe tu mensaje',
    'FORO: Para dudas sobre el contenido que puedan beneficiar a otros compañeros',
  ];
  if (supportPhone) contactOptions.push(`TELÉFONO: ${supportPhone}`);
  if (supportEmail) contactOptions.push(`EMAIL: ${supportEmail}`);
  addBulletList(contactOptions);
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
  
  // C) RECURSOS
  checkPageBreak(60);
  addInfoBox('C) RECURSOS - Contenido Formativo', false);
  yPos += 3;
  addParagraph('En el menú "Módulos" encontrarás todo el contenido formativo organizado de la siguiente manera:');
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['ESTRUCTURA DEL CONTENIDO', 'DESCRIPCIÓN']],
    body: [
      ['MODULOS FORMATIVOS (MF)', 'Grandes bloques de contenido'],
      ['  > UNIDADES FORMATIVAS (UF)', 'Subdivisiones del modulo'],
      ['      > TEMARIO / CIM', 'Contenido Interactivo Multimedia con el temario teorico'],
      ['      > CONTENIDO INTERACTIVO', 'Videos, audios, presentaciones, documentos'],
      ['      > ACTIVIDADES', 'Casos practicos y ejercicios evaluables'],
      ['      > EVALUACIONES', 'Test de cada unidad formativa'],
    ],
    margin: { left: margin, right: margin },
    bodyStyles: { fontSize: 9, textColor: BLACK },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 100 } },
    alternateRowStyles: { fillColor: LIGHT_TEAL },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 15;

  // SECCIÓN 3.3: CIM
  addSubsectionTitle('3.3', 'EL CONTENIDO INTERACTIVO MULTIMEDIA (CIM) / TEMARIO');
  addParagraph('El Contenido Interactivo Multimedia es el corazón de tu formación online. Se accede desde cada Unidad Formativa pulsando el botón "TEMARIO".');
  yPos += 5;
  addParagraph('ESTRUCTURA DEL VISOR INTERACTIVO:');
  addBulletList([
    'ÍNDICE LATERAL IZQUIERDO: Muestra todos los puntos y subpuntos del temario. Un "tick verde" indica los apartados ya completados.',
    'BARRA SUPERIOR: Glosario, Descargas (PDFs del manual), Ejercicios y Test de autoevaluación.',
    'ÁREA CENTRAL: Texto teórico con tablas, esquemas, imágenes, vídeos y ejercicios integrados.',
    'ASISTENTE DE AYUDA: En la esquina inferior derecha para consultar dudas sobre el contenido.',
  ]);
  yPos += 5;
  
  // SECCIÓN 4: FECHAS Y LUGAR
  addMainSectionTitle('4', 'FECHAS Y LUGAR DE REALIZACIÓN');
  addParagraph('Las fechas de realización de este curso son variables según la convocatoria en la que te encuentres matriculado/a.');
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    body: [
      [{ content: 'FECHA INICIO:', styles: { fontStyle: 'bold' } }, 'Ver Plan de Trabajo adjunto'],
      [{ content: 'FECHA FIN:', styles: { fontStyle: 'bold' } }, 'Ver Plan de Trabajo adjunto'],
    ],
    margin: { left: margin + 30, right: margin + 30 },
    bodyStyles: { fontSize: 10, textColor: BLACK },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 60 } },
    tableLineColor: BLACK,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  addParagraph('En concreto, deberás desarrollar cada módulo formativo/unidad formativa en las siguientes fechas:');
  yPos += 5;
  
  addModulosFormativosTable();
  
  addInfoBox('DIRECCIÓN DEL CENTRO DE FORMACIÓN');
  yPos -= 5;
  if (centerAddress) {
    addParagraph('Centro de Formación Acreditado');
    addParagraph(centerAddress);
  } else {
    addParagraph('Consulta con tu centro de formación la dirección exacta para las sesiones presenciales.');
  }
  yPos += 10;
  
  // SECCIÓN 5: METODOLOGÍA
  addMainSectionTitle('5', 'METODOLOGÍA DE ESTUDIO');
  addParagraph('En este apartado de METODOLOGÍA DE ESTUDIO te facilitamos las orientaciones y explicaciones necesarias para que sepas cómo debes realizar el curso y las posibilidades que te ofrece el Campus Virtual para el estudio.');
  yPos += 5;
  addParagraph('A continuación, te presentamos de forma esquemática cada uno de los pasos que debes seguir para el desarrollo del curso:');
  yPos += 8;
  
  addSubsectionTitle('5.1', 'TAREAS/ACTIVIDADES');
  addParagraph('Para conocer qué contenidos debes estudiar o qué actividades debes realizar en cada momento, debes acudir a tu PLAN DE TRABAJO, que encontrarás en el Anexo I de esta guía, o al icono de MI AGENDA que encontrarás en el Campus Virtual en la parte izquierda de tu pantalla.');
  yPos += 8;
  
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
  
  // A) Detallado
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
  addIconSection('Acceso al chat de la sesión inicial', 'El día de comienzo del curso, a través de la herramienta de chat habilitada, el tutor/a-formador/a del módulo formativo/unidad formativa correspondiente, te informará tanto de cuestiones generales relativas a la organización de la formación como otras específicas.');
  
  addParagraph('La sesión inicial puede ser también presencial, en ese caso tu tutor-formador te informará con antelación.');
  yPos += 5;
  
  addIconSection('Test de conocimientos previos', 'Antes de comenzar a estudiar los contenidos de la unidad formativa o módulo formativo, debes cumplimentar un cuestionario en el que deberás indicar tus conocimientos previos sobre el contenido que vas a cursar.');
  yPos += 8;
  
  // B) Detallado
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
    'Manual pdf: existe la opción de visualizar e imprimir el contenido teórico en formato pdf.',
    'Vídeos didácticos: donde profesionales de la materia profundizan y/o analizan las implicaciones de diferentes conceptos/procedimientos.',
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
  addParagraph('En todo momento podrás visualizar qué apartados has visto o cuáles te quedan por ver gracias al índice de la izquierda.');
  yPos += 10;
  
  // SECCIÓN 5.2: TIEMPO DE DEDICACIÓN
  addSubsectionTitle('5.2', 'TIEMPO DE DEDICACIÓN');
  addParagraph('Para desarrollar tu curso correctamente debes dedicar un tiempo cada día al estudio de los contenidos y la realización de las actividades de aprendizaje.');
  yPos += 3;
  addParagraph('Es fundamental que mantengas una disciplina de estudio constante para poder cumplir con los plazos establecidos y aprovechar al máximo la formación.');
  yPos += 3;
  addParagraph(`La duración total del curso es de ${totalHours} horas. Tu tutor/a-formador/a te orientará sobre el tiempo recomendado de dedicación diaria según el módulo formativo o unidad formativa que estés cursando.`);
  yPos += 3;
  addParagraph('IMPORTANTE: El Campus Virtual registra tu tiempo de dedicación. Puedes consultar tu tiempo invertido en la sección "Tiempos Invertidos" del menú lateral.');
  yPos += 10;

  // SECCIÓN 6: SISTEMA DE TUTORÍAS
  addMainSectionTitle('6', 'SISTEMA DE TUTORÍAS');
  addParagraph('A lo largo del curso contarás con el apoyo de un tutor/a-formador/a que te acompañará durante todo el proceso formativo.');
  yPos += 5;
  
  addSubsectionTitle('6.1', 'TUTORÍAS VIRTUALES');
  addParagraph('Las tutorías virtuales son sesiones en directo con tu tutor-formador a través del Campus Virtual.');
  yPos += 3;
  addParagraph('Tipos de tutorías virtuales:');
  addBulletList([
    'Tutorías grupales: Sesiones programadas con todo el grupo de alumnos a través del chat o videollamada.',
    'Tutorías individuales: Puedes solicitarlas a través del correo electrónico del Campus o el botón "Contacto".',
  ]);
  addParagraph('En estas sesiones podrás plantear tus dudas, repasar contenidos y recibir orientación sobre la prueba de evaluación final.');
  yPos += 3;
  addParagraph('Tu tutor-formador te informará con antelación de las fechas y horarios de las tutorías programadas.');
  yPos += 5;
  
  addSubsectionTitle('6.2', 'TUTORÍAS PRESENCIALES');
  addParagraph('Las tutorías presenciales se desarrollan en el Centro de Formación según el calendario establecido en el Plan de Trabajo.');
  yPos += 3;
  addParagraph('En estas sesiones:');
  addBulletList([
    'Se desarrollarán actividades de aprendizaje prácticas',
    'Se realizarán pruebas de evaluación presencial',
    'Contarás con un formador que te guiará en el desarrollo de las actividades',
    'Se trabajarán los conocimientos adquiridos en la plataforma',
  ]);
  addParagraph('Toda la información relativa a las tutorías presenciales la encontrarás en el apartado "Tutorías" del Campus, el Cuaderno del Alumno y a través de comunicaciones de tu tutor-formador.');

  yPos += 5;
  const horarioText = `HORARIO DE ATENCIÓN TUTORIAL:\nLunes a Viernes de 09:00 a 14:00 horas${supportPhone ? `\nTeléfono: ${supportPhone}` : ''}${supportEmail ? `\nEmail: ${supportEmail}` : ''}`;
  addInfoBox(horarioText);
  
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
       `${code} - ${courseTitle}`],
      [{ content: 'NIVEL:', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' } }, 
       level !== null ? String(level) : 'N/D'],
      [{ content: 'FAMILIA:', styles: { fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' } }, 
       family],
    ],
    margin: { left: margin, right: margin },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 130 } },
    bodyStyles: { fontSize: 10, textColor: BLACK },
    tableLineColor: TEAL_COLOR,
    tableLineWidth: 0.3,
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  addParagraph('Este certificado tiene carácter oficial y validez en todo el territorio nacional, acreditando las competencias profesionales adquiridas.');
  
  // SECCIÓN 9: CAU
  addMainSectionTitle('9', 'CENTRO DE ATENCIÓN AL USUARIO (CAU)');
  addParagraph('Para cualquier incidencia técnica o consulta relacionada con el funcionamiento del Campus Virtual, puedes contactar con el Centro de Atención al Usuario:');
  yPos += 5;
  
  const cauData: string[][] = [];
  if (supportPhone) cauData.push(['Teléfono:', supportPhone]);
  cauData.push(['Horario:', 'Lunes a Viernes de 09:00 a 14:00']);
  if (supportEmail) cauData.push(['Email:', supportEmail]);
  
  autoTable(doc, {
    startY: yPos,
    body: cauData,
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 40, fillColor: TEAL_COLOR, textColor: WHITE, fontStyle: 'bold' },
      1: { cellWidth: 130 },
    },
    bodyStyles: { fontSize: 10, textColor: BLACK },
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
  
  const centerData: string[][] = [
    ['Centro de Formación Acreditado'],
  ];
  if (centerCIF) centerData.push([`CIF: ${centerCIF}`]);
  if (centerSepeReg) centerData.push([`Nº Registro SEPE: ${centerSepeReg}`]);
  if (centerAddress) centerData.push([centerAddress]);
  if (supportPhone) centerData.push([`Teléfono: ${supportPhone}`]);
  if (supportEmail) centerData.push([`Email: ${supportEmail}`]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['DATOS DEL CENTRO DE FORMACIÓN']],
    body: centerData,
    margin: { left: margin + 20, right: margin + 20 },
    headStyles: { fillColor: TEAL_COLOR, textColor: WHITE, fontSize: 10, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 10, textColor: BLACK, halign: 'center' },
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

  // Sin pie de página en la guía (requisito de versión general)

  // Guardar PDF
  doc.save(`Guia_Alumno_${courseTitle.replace(/\s+/g, '_')}.pdf`);
};
