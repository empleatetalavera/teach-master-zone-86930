import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FormativeUnitData {
  title: string;
  duration_hours?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface ModuleData {
  title: string;
  duration_minutes?: number;
  formative_units?: FormativeUnitData[];
}

interface AnnexPDFParams {
  courseTitle: string;
  courseCode: string;
  durationHours: number;
  presentialHours: number;
  internshipHours: number;
  modules: ModuleData[];
  centerName: string;
  centerCity?: string;
  startDate?: string;
  endDate?: string;
}

const PRIMARY: [number, number, number] = [0, 102, 153];
const PRIMARY_LIGHT: [number, number, number] = [230, 242, 250];
const HEADER_BG: [number, number, number] = [0, 51, 102];
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [100, 100, 100];
const LIGHT_GRAY: [number, number, number] = [240, 240, 240];
const AMBER_BG: [number, number, number] = [255, 243, 205];
const STONE_BG: [number, number, number] = [231, 229, 228];
const ROSE_BG: [number, number, number] = [255, 228, 230];
const GREEN_BG: [number, number, number] = [220, 252, 231];
const BLUE_BG: [number, number, number] = [219, 234, 254];

const DAILY_HOURS = 2.5;

interface SessionEntry {
  sessionNum: number;
  type: string;
  space: string;
  tasks: string;
  description: string;
}

interface PlanEntry {
  moduleTitle: string;
  moduleIndex: number;
  moduleHours: number;
  ufTitle: string;
  ufHours: number;
  sessions: SessionEntry[];
  tutorProfile: number;
}

function generateSessionPlan(modules: ModuleData[]): { plan: PlanEntry[]; totalSessions: number } {
  let sessionCounter = 1;
  const plan: PlanEntry[] = [];

  modules.forEach((mod, mIndex) => {
    const modHours = mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : 0;
    const units = mod.formative_units || [];
    const isPracticas = mod.title.toLowerCase().includes('prácticas') || mod.title.toLowerCase().includes('práctica');

    if (isPracticas) {
      const practDays = Math.ceil(modHours / 4);
      const sessions: SessionEntry[] = [];
      for (let d = 0; d < practDays; d++) {
        sessions.push({
          sessionNum: sessionCounter++,
          type: 'practicas',
          space: 'CENTRO DE TRABAJO',
          tasks: 'Prácticas profesionales no laborales (4h/día)',
          description: ''
        });
      }
      plan.push({ moduleTitle: mod.title, moduleIndex: mIndex, moduleHours: modHours, ufTitle: mod.title, ufHours: modHours, sessions, tutorProfile: mIndex + 1 });
      return;
    }

    units.forEach((uf, ufIndex) => {
      const ufHours = uf.duration_hours || 0;
      const totalSessions = Math.ceil(ufHours / DAILY_HOURS);
      const sessions: SessionEntry[] = [];

      if (ufIndex === 0) {
        sessions.push({ sessionNum: sessionCounter++, type: 'intro', space: 'CAMPUS - INTRODUCCIÓN', tasks: 'SESIÓN INICIAL / CUESTIONARIO DE CONOCIMIENTOS PREVIOS', description: 'Sesión inicial con tutor-formador.' });
      }

      const contentSessions = Math.max(1, Math.floor(totalSessions * 0.35));
      for (let c = 0; c < contentSessions; c++) {
        sessions.push({ sessionNum: sessionCounter++, type: 'content', space: 'CAMPUS - UNIDAD DIDÁCTICA (Contenido Multimedia)', tasks: `CONTENIDO MULTIMEDIA`, description: 'Estudio de contenidos interactivos y ejercicios de autoevaluación.' });
      }

      sessions.push({ sessionNum: sessionCounter++, type: 'material', space: 'CAMPUS - UNIDAD DIDÁCTICA (Material complementario)', tasks: 'Documentos y vídeos complementarios', description: 'Materiales complementarios de la unidad.' });
      sessions.push({ sessionNum: sessionCounter++, type: 'activity', space: 'CAMPUS - UNIDAD DIDÁCTICA (Actividades)', tasks: 'Actividades de aprendizaje', description: 'Actividades individuales y grupales.' });
      sessions.push({ sessionNum: sessionCounter++, type: 'forum', space: 'CAMPUS - UNIDAD DIDÁCTICA (Foros)', tasks: `Foro de debate y dudas: ${uf.title}`, description: 'Participación en foros y consultas.' });
      sessions.push({ sessionNum: sessionCounter++, type: 'autoeval', space: 'CAMPUS - UNIDAD DIDÁCTICA (Contenido)', tasks: 'Prueba de autoevaluación', description: 'Autoevaluación tipo test.' });

      if (ufIndex === units.length - 1) {
        sessions.push({ sessionNum: sessionCounter++, type: 'tutoria_virtual', space: 'CAMPUS - TUTORÍA VIRTUAL', tasks: 'Tutoría virtual grupal + Test Final', description: 'Repaso y evaluación final de la UF.' });
        sessions.push({ sessionNum: sessionCounter++, type: 'eval_1conv', space: 'CENTRO DE FORMACIÓN', tasks: '1ª Convocatoria: Evaluación final presencial', description: 'Prueba teórico-práctica presencial.' });
        sessions.push({ sessionNum: sessionCounter++, type: 'eval_2conv', space: 'CENTRO DE FORMACIÓN', tasks: '2ª Convocatoria: Evaluación final presencial', description: 'Segunda oportunidad.' });
      }

      plan.push({
        moduleTitle: mod.title,
        moduleIndex: mIndex,
        moduleHours: modHours,
        ufTitle: uf.title,
        ufHours: ufHours,
        sessions,
        tutorProfile: mIndex < Math.ceil(modules.length / 2) ? 1 : 2
      });
    });
  });

  return { plan, totalSessions: sessionCounter - 1 };
}

function getSessionBg(type: string): [number, number, number] | null {
  switch (type) {
    case 'eval_1conv': return AMBER_BG;
    case 'eval_2conv': return STONE_BG;
    case 'intro': return GREEN_BG;
    case 'tutoria_virtual': return BLUE_BG;
    case 'practicas': return ROSE_BG;
    default: return null;
  }
}

export function generateAnnexCalendarPDF(params: AnnexPDFParams): void {
  const { courseTitle, courseCode, durationHours, presentialHours, internshipHours, modules, centerName, centerCity, startDate, endDate } = params;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const addPageHeader = () => {
    doc.setFillColor(...HEADER_BG);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(centerName.toUpperCase(), margin, 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`ANEXO I - ${courseCode}`, pageWidth - margin, 8, { align: 'right' });
    doc.setTextColor(...BLACK);
  };

  const addPageFooter = (pageNum: number) => {
    doc.setFillColor(...HEADER_BG);
    doc.rect(0, 285, pageWidth, 12, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.text(`Página ${pageNum}`, pageWidth / 2, 291, { align: 'center' });
    doc.setTextColor(...BLACK);
  };

  const checkNewPage = (needed: number, pageNum: { value: number }) => {
    if (y + needed > 275) {
      addPageFooter(pageNum.value);
      doc.addPage();
      pageNum.value++;
      addPageHeader();
      y = 18;
    }
  };

  const pageNum = { value: 1 };

  // ===== PORTADA =====
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, pageWidth, 297, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(centerName.toUpperCase(), pageWidth / 2, 80, { align: 'center' });
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ANEXO I:', pageWidth / 2, 120, { align: 'center' });
  doc.setFontSize(24);
  doc.text('CALENDARIO Y', pageWidth / 2, 135, { align: 'center' });
  doc.text('PLAN DE TRABAJO', pageWidth / 2, 150, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const titleLines = doc.splitTextToSize(courseTitle, contentWidth - 20);
  doc.text(titleLines, pageWidth / 2, 175, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Código: ${courseCode}`, pageWidth / 2, 200, { align: 'center' });
  doc.text(`Duración: ${durationHours} horas`, pageWidth / 2, 210, { align: 'center' });
  if (startDate) {
    doc.text(`Fecha inicio: ${new Date(startDate).toLocaleDateString('es-ES')}`, pageWidth / 2, 220, { align: 'center' });
  }
  doc.setFontSize(8);
  doc.text(`Documento generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 270, { align: 'center' });

  // ===== PÁGINA 2: TABLA RESUMEN =====
  doc.addPage();
  pageNum.value++;
  addPageHeader();
  y = 20;

  doc.setFillColor(...PRIMARY);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${courseCode} - ${courseTitle}`, pageWidth / 2, y + 5.5, { align: 'center' });
  doc.setTextColor(...BLACK);
  y += 12;

  // Summary table
  const summaryHead = [['Módulo Formativo (MF)', 'Horas\n(MF)', 'Unidad Formativa (UF)', 'Horas\n(UF)', 'Tut.\nPres.', 'Prueba\nFinal', 'Perfil']];
  const summaryBody: any[][] = [];

  modules.forEach((mod, mIndex) => {
    const modHours = mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : 0;
    const units = mod.formative_units || [];
    const isPracticas = mod.title.toLowerCase().includes('prácticas') || mod.title.toLowerCase().includes('práctica');
    const profile = mIndex < Math.ceil(modules.length / 2) ? 'Perfil 1' : 'Perfil 2';

    if (isPracticas || units.length === 0) {
      summaryBody.push([mod.title, modHours, isPracticas ? 'Prácticas profesionales no laborales' : 'Sin UF definidas', modHours, '-', '-', profile]);
    } else {
      units.forEach((uf, ufIndex) => {
        const row: any[] = [];
        if (ufIndex === 0) {
          row.push({ content: mod.title, rowSpan: units.length, styles: { fontStyle: 'bold', fillColor: LIGHT_GRAY } });
          row.push({ content: modHours, rowSpan: units.length, styles: { halign: 'center', fontStyle: 'bold', fillColor: LIGHT_GRAY } });
        }
        row.push(uf.title);
        row.push({ content: uf.duration_hours || 0, styles: { halign: 'center' } });
        row.push({ content: 0, styles: { halign: 'center' } });
        row.push({ content: ufIndex === units.length - 1 ? 2 : 0, styles: { halign: 'center' } });
        if (ufIndex === 0) {
          row.push({ content: profile, rowSpan: units.length, styles: { halign: 'center' } });
        }
        summaryBody.push(row);
      });
    }
  });

  // Total row
  summaryBody.push([{ content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', fillColor: LIGHT_GRAY } }, { content: durationHours, styles: { halign: 'center', fontStyle: 'bold', fillColor: LIGHT_GRAY } }, '', '', '']);

  autoTable(doc, {
    startY: y,
    head: summaryHead,
    body: summaryBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', halign: 'center', fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' }
    },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // Notes
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`Carga horaria diaria: ${DAILY_HOURS} horas/día`, margin, y);
  y += 4;
  doc.text('Nota: El módulo de prácticas se realiza con una carga horaria diaria de 4 horas.', margin, y);
  y += 4;
  doc.text('Nota 2: Las pruebas de evaluación se realizan al completar las unidades formativas que componen cada módulo.', margin, y);
  doc.setTextColor(...BLACK);
  y += 8;

  // Distribution
  checkNewPage(30, pageNum);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribución de Horas por Modalidad', margin, y);
  y += 4;

  const teleHours = durationHours - presentialHours - internshipHours;
  autoTable(doc, {
    startY: y,
    head: [['Teleformación', 'Tutorías Presenciales + Evaluación', 'Prácticas Profesionales (MP)', 'TOTAL']],
    body: [[`${teleHours}h`, `${presentialHours}h`, `${internshipHours}h`, `${durationHours}h`]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, halign: 'center', cellPadding: 3 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  addPageFooter(pageNum.value);

  // ===== CALENDARIO MENSUAL =====
  doc.addPage();
  pageNum.value++;
  addPageHeader();
  y = 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Calendario de Sesiones', margin, y);
  y += 6;

  const { plan, totalSessions } = generateSessionPlan(modules);

  // Build calendar grid
  const calendarHead = [['', 'L', 'M', 'X', 'J', 'V', 'S', 'D']];
  const calendarBody: any[][] = [];
  let session = 1;
  let monthNum = 1;

  while (session <= totalSessions) {
    for (let w = 0; w < 4 && session <= totalSessions; w++) {
      const row: any[] = [];
      if (w === 0) {
        row.push({ content: `MES ${monthNum}`, rowSpan: Math.min(4, Math.ceil((totalSessions - session + 1) / 5)), styles: { fontStyle: 'bold', fillColor: LIGHT_GRAY, halign: 'center', valign: 'middle' } });
      }
      for (let d = 0; d < 5; d++) {
        if (session <= totalSessions) {
          // Check if this session is an evaluation
          let bgColor: [number, number, number] | null = null;
          for (const p of plan) {
            for (const s of p.sessions) {
              if (s.sessionNum === session) {
                bgColor = getSessionBg(s.type);
              }
            }
          }
          row.push({ content: `${session}º`, styles: bgColor ? { fillColor: bgColor, halign: 'center' } : { halign: 'center' } });
          session++;
        } else {
          row.push({ content: '', styles: { halign: 'center' } });
        }
      }
      row.push({ content: '', styles: { fillColor: [245, 245, 245] as [number, number, number], halign: 'center' } });
      row.push({ content: '', styles: { fillColor: [245, 245, 245] as [number, number, number], halign: 'center' } });
      calendarBody.push(row);
    }
    monthNum++;
  }

  autoTable(doc, {
    startY: y,
    head: calendarHead,
    body: calendarBody,
    margin: { left: margin + 10, right: margin + 10 },
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    columnStyles: { 0: { cellWidth: 16 } },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // Legend
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Leyenda:', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');

  const legends: Array<{ color: [number, number, number]; text: string }> = [
    { color: AMBER_BG, text: '1ª convocatoria prueba de evaluación final presencial.' },
    { color: STONE_BG, text: '2ª convocatoria prueba de evaluación final presencial.' },
    { color: ROSE_BG, text: 'Módulo de prácticas profesionales no laborales.' },
    { color: GREEN_BG, text: 'Sesión inicial / Introducción.' },
    { color: BLUE_BG, text: 'Tutoría virtual grupal.' },
  ];
  legends.forEach(l => {
    doc.setFillColor(...l.color);
    doc.rect(margin, y - 2.5, 4, 3, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, y - 2.5, 4, 3, 'S');
    doc.text(l.text, margin + 6, y);
    y += 4;
  });

  addPageFooter(pageNum.value);

  // ===== PRESCRIPCIONES DE FORMADORES =====
  doc.addPage();
  pageNum.value++;
  addPageHeader();
  y = 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescripciones de los Formadores', margin, y);
  y += 6;

  const prescBody: any[][] = [];
  modules.forEach((mod, mIndex) => {
    const isPracticas = mod.title.toLowerCase().includes('prácticas') || mod.title.toLowerCase().includes('práctica');
    if (isPracticas) return;
    const profile = mIndex < Math.ceil(modules.length / 2) ? 'Perfil 1' : 'Perfil 2';
    prescBody.push([
      { content: mod.title, styles: { fontStyle: 'bold' } },
      '• Licenciado, ingeniero, arquitecto o título de grado equivalente.\n• Diplomado, ingeniero técnico, arquitecto técnico o título equivalente.\n• Técnico y Técnico Superior de familias profesionales afines.\n• Certificados de profesionalidad de nivel 2 y 3.',
      { content: '1 año', styles: { halign: 'center' } },
      { content: '3 años', styles: { halign: 'center' } },
      { content: profile, styles: { halign: 'center', fontStyle: 'bold' } }
    ]);
  });

  autoTable(doc, {
    startY: y,
    head: [['MÓDULO FORMATIVO', 'Acreditación requerida', 'Exp. con\nacreditación', 'Exp. sin\nacreditación', 'Perfil']],
    body: prescBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 6.5, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 80 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' }
    },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  addPageFooter(pageNum.value);

  // ===== PLAN DE TRABAJO DETALLADO =====
  doc.addPage();
  pageNum.value++;
  addPageHeader();
  y = 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Plan de Trabajo Detallado - Sesión a Sesión', margin, y);
  y += 6;

  const detailHead = [['MÓDULO\nFORMATIVO', 'UNIDAD\nFORMATIVA', 'Nº', 'ESPACIO', 'TAREAS PROGRAMADAS', 'DESCRIPCIÓN', 'PERFIL']];
  const detailBody: any[][] = [];

  let prevModuleIdx = -1;

  plan.forEach((entry) => {
    entry.sessions.forEach((session, sIdx) => {
      const row: any[] = [];
      const bg = getSessionBg(session.type);
      const rowStyles = bg ? { fillColor: bg } : {};

      // Module column
      if (entry.moduleIndex !== prevModuleIdx && sIdx === 0) {
        const totalRows = plan.filter(p => p.moduleIndex === entry.moduleIndex).reduce((a, p) => a + p.sessions.length, 0);
        row.push({ content: entry.moduleTitle, rowSpan: totalRows, styles: { fontStyle: 'bold', fillColor: LIGHT_GRAY, valign: 'top' } });
        prevModuleIdx = entry.moduleIndex;
      }

      // UF column
      if (sIdx === 0) {
        row.push({ content: entry.ufTitle, rowSpan: entry.sessions.length, styles: { valign: 'top' } });
      }

      row.push({ content: session.sessionNum, styles: { halign: 'center', fontStyle: 'bold', ...rowStyles } });
      row.push({ content: session.space, styles: rowStyles });
      row.push({ content: session.tasks, styles: { fontStyle: 'bold', ...rowStyles } });
      row.push({ content: session.description, styles: rowStyles });

      // Formador
      if (sIdx === 0 && (entry.moduleIndex !== (plan[plan.indexOf(entry) - 1]?.moduleIndex ?? -1))) {
        const totalRows = plan.filter(p => p.moduleIndex === entry.moduleIndex).reduce((a, p) => a + p.sessions.length, 0);
        row.push({ content: `Perfil ${entry.tutorProfile}`, rowSpan: totalRows, styles: { halign: 'center', valign: 'top' } });
      }

      detailBody.push(row);
    });
  });

  autoTable(doc, {
    startY: y,
    head: detailHead,
    body: detailBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 5.5, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 6, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 8, halign: 'center' },
      3: { cellWidth: 30 },
      4: { cellWidth: 40 },
      5: { cellWidth: 35 },
      6: { cellWidth: 14, halign: 'center' }
    },
    theme: 'grid',
    didDrawPage: () => {
      addPageHeader();
      addPageFooter(pageNum.value);
    },
    willDrawPage: () => {
      pageNum.value++;
    },
  });

  // ===== FIRMA =====
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  const currentPage = doc.getNumberOfPages();
  doc.setPage(currentPage);
  
  let signY = finalY;
  if (signY > 240) {
    doc.addPage();
    addPageHeader();
    signY = 40;
  }

  doc.setDrawColor(180, 180, 180);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Left signature
  doc.text('El/La Responsable del Centro', margin + 20, signY, { align: 'center' });
  doc.line(margin, signY + 25, margin + 55, signY + 25);
  doc.text(`Fdo.: ________________________`, margin + 20, signY + 30, { align: 'center' });
  doc.setFontSize(7);
  doc.text(centerName, margin + 20, signY + 35, { align: 'center' });

  // Right signature  
  doc.setFontSize(8);
  doc.text('Fecha y Sello', pageWidth - margin - 20, signY, { align: 'center' });
  doc.line(pageWidth - margin - 55, signY + 25, pageWidth - margin, signY + 25);
  doc.setFontSize(7);
  doc.text(`En ${centerCity || '____________'}, a _____ de _______________ de ${new Date().getFullYear()}`, pageWidth - margin - 27, signY + 30, { align: 'center' });

  addPageFooter(doc.getNumberOfPages());

  // Save
  const filename = `Anexo_I_Calendario_Plan_Trabajo_${courseCode.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
