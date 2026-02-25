import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ClipboardList, 
  Users, 
  BookOpen, 
  CheckSquare, 
  AlertCircle,
  Lightbulb,
  FileText,
  Target,
  MessageCircle,
  ShieldCheck,
  PenTool,
  Wrench,
  Download,
  UserCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TutoriasPresencialesGuideProps {
  userRole: string;
  courseName?: string;
  centerName?: string;
  courseId?: string;
}

interface EnrolledStudent {
  full_name: string | null;
  // DNI not available in profiles table currently
  
}

const TutoriasPresencialesGuide = ({ userRole, courseName = "Curso de Formación", centerName = "Centro de Formación", courseId }: TutoriasPresencialesGuideProps) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const { toast } = useToast();
  
  const isTeacher = userRole === 'teacher';
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Load enrolled students for attendance list
  useEffect(() => {
    if (!courseId) return;
    const loadStudents = async () => {
      try {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('user_id')
          .eq('course_id', courseId)
          .eq('enrollment_role', 'student');

        if (!enrollments || enrollments.length === 0) return;

        const userIds = enrollments.map(e => e.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('full_name')
          .in('id', userIds);

        if (profiles) {
          setEnrolledStudents(profiles.map(p => ({
            full_name: p.full_name,
          })));
        }
      } catch (error) {
        console.error('Error loading students for attendance:', error);
      }
    };
    loadStudents();
  }, [courseId]);

  // === PDF: Lista de Asistencia ===
  const generateAttendanceListPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LISTA DE ASISTENCIA DE ALUMNOS", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Tutorías Presenciales del Centro de Formación", pageWidth / 2, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const infoY = 45;
    doc.setFont("helvetica", "bold");
    doc.text("Centro de Formación:", 14, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(centerName, 55, infoY);
    doc.setFont("helvetica", "bold");
    doc.text("Acción Formativa:", 14, infoY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(courseName, 55, infoY + 7);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha Tutoría:", 14, infoY + 14);
    doc.setFont("helvetica", "normal");
    doc.text("_____/_____/_________", 55, infoY + 14);
    doc.setFont("helvetica", "bold");
    doc.text("Horario:", 120, infoY + 14);
    doc.setFont("helvetica", "normal");
    doc.text("De _____:_____ a _____:_____", 140, infoY + 14);
    doc.setFont("helvetica", "bold");
    doc.text("Formador:", 14, infoY + 21);
    doc.setFont("helvetica", "normal");
    doc.text("________________________________________________", 40, infoY + 21);
    
    // Build table with real students or empty rows
    const rowCount = Math.max(enrolledStudents.length, 15);
    const tableData = [];
    for (let i = 0; i < rowCount; i++) {
      const student = enrolledStudents[i];
      tableData.push([
        (i + 1).toString(),
        "",
        student?.full_name || "",
        "",
        "",
        ""
      ]);
    }
    
    autoTable(doc, {
      startY: infoY + 30,
      head: [[
        { content: "Nº", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "DNI/NIE", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Nombre y Apellidos", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Hora Entrada", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Hora Salida", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Firma", styles: { halign: 'center', fillColor: [0, 102, 153] } }
      ]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, minCellHeight: 10 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 35 }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.text("Observaciones:", 14, finalY);
    doc.setDrawColor(150, 150, 150);
    doc.line(14, finalY + 5, pageWidth - 14, finalY + 5);
    doc.line(14, finalY + 12, pageWidth - 14, finalY + 12);
    doc.line(14, finalY + 19, pageWidth - 14, finalY + 19);
    doc.text("Firma y sello del Centro de Formación:", 14, finalY + 35);
    doc.rect(14, finalY + 40, 80, 30);
    doc.text("Firma del Formador:", 110, finalY + 35);
    doc.rect(110, finalY + 40, 80, 30);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 14, doc.internal.pageSize.getHeight() - 10);
    
    doc.save("Lista_Asistencia_Tutorias_Presenciales.pdf");
    toast({ title: "PDF generado", description: "La Lista de Asistencia se ha descargado correctamente" });
  };

  // === PDF: Cuaderno del Alumno ===
  const generateStudentNotebookPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // === PORTADA ===
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth / 2 - 30, 30, 60, 25, 3, 3, 'F');
    doc.setTextColor(46, 125, 50);
    doc.setFontSize(10);
    doc.text("Logo Centro", pageWidth / 2, 45, { align: "center" });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("CUADERNO DEL ALUMNO", pageWidth / 2, 90, { align: "center" });
    doc.setFontSize(18);
    doc.text("TUTORÍAS PRESENCIALES", pageWidth / 2, 105, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Centro de Formación", pageWidth / 2, 130, { align: "center" });
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(30, 150, pageWidth - 60, 60, 5, 5, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text("Acción Formativa:", 40, 165);
    doc.setFont("helvetica", "bold");
    doc.text(courseName, 40, 175);
    doc.setFont("helvetica", "normal");
    doc.text("Centro:", 40, 190);
    doc.setFont("helvetica", "bold");
    doc.text(centerName, 65, 190);
    doc.setFont("helvetica", "normal");
    doc.text("Alumno/a: ____________________________________________", 40, 203);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Certificados de Profesionalidad - SEPE", pageWidth / 2, 240, { align: "center" });

    // === PÁGINA 2: ÍNDICE ===
    doc.addPage();
    addPageHeader(doc, "ÍNDICE DE CONTENIDOS", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const indexItems = [
      "1. Introducción: ¿Qué son las Tutorías Presenciales?",
      "2. Tus derechos y obligaciones",
      "3. Calendario de Tutorías",
      "4. Registro de asistencia personal",
      "5. Notas y dudas por sesión",
      "6. Autoevaluación del aprendizaje",
      "7. Espacio para observaciones"
    ];
    let indexY = 45;
    indexItems.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(item, 20, indexY);
      indexY += 12;
    });

    // === PÁGINA 3: INTRODUCCIÓN ===
    doc.addPage();
    addPageHeader(doc, "1. ¿QUÉ SON LAS TUTORÍAS PRESENCIALES?", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const introLines = [
      "Las tutorías presenciales son sesiones formativas que complementan tu",
      "formación online. Se realizan en el Centro de Formación y tienen como",
      "objetivo reforzar los contenidos teóricos mediante la práctica presencial.",
      "",
      "Durante estas sesiones podrás:",
      "",
      "• Resolver dudas directamente con el formador",
      "• Practicar habilidades y competencias de forma presencial",
      "• Realizar actividades grupales con otros compañeros",
      "• Recibir orientación personalizada sobre tu progreso",
      "• Realizar pruebas de evaluación presencial si están programadas",
      "",
      "La asistencia mínima requerida es del 75% de las tutorías programadas,",
      "según normativa SEPE."
    ];
    let ty = 45;
    introLines.forEach(l => { doc.text(l, 20, ty); ty += 7; });

    // === PÁGINA 4: DERECHOS Y OBLIGACIONES ===
    doc.addPage();
    addPageHeader(doc, "2. TUS DERECHOS Y OBLIGACIONES", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DERECHOS:", 20, 45);
    doc.setFont("helvetica", "normal");
    const rights = [
      "• Recibir formación de calidad según el programa establecido",
      "• Disponer de los materiales y recursos necesarios",
      "• Recibir retroalimentación sobre tu desempeño",
      "• Plantear dudas y consultas en cualquier momento",
      "• Conocer con antelación las fechas y horarios de las sesiones"
    ];
    let ry = 55;
    rights.forEach(r => { doc.text(r, 20, ry); ry += 8; });
    
    doc.setFont("helvetica", "bold");
    doc.text("OBLIGACIONES:", 20, ry + 10);
    doc.setFont("helvetica", "normal");
    const obligations = [
      "• Asistir puntualmente a las tutorías presenciales programadas",
      "• Firmar la lista de asistencia en cada sesión",
      "• Participar activamente en las actividades propuestas",
      "• Respetar las normas del Centro de Formación",
      "• Cumplir con el mínimo del 75% de asistencia exigido por SEPE",
      "• Comunicar las ausencias justificadas al tutor-formador"
    ];
    let oy = ry + 20;
    obligations.forEach(o => { doc.text(o, 20, oy); oy += 8; });

    // === PÁGINA 5: CALENDARIO ===
    doc.addPage();
    addPageHeader(doc, "3. CALENDARIO DE TUTORÍAS", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Anota aquí las fechas de tus tutorías presenciales:", 20, 45);
    
    autoTable(doc, {
      startY: 55,
      head: [[
        { content: "Nº Sesión", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "Fecha", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "Horario", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "Lugar", styles: { fillColor: [46, 125, 50] } },
        { content: "Asistí (S/N)", styles: { halign: 'center', fillColor: [46, 125, 50] } }
      ]],
      body: Array.from({ length: 10 }, (_, i) => [(i + 1).toString(), "", "", "", ""]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, minCellHeight: 12 },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 55 },
        4: { cellWidth: 28, halign: 'center' }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // === PÁGINA 6: REGISTRO ASISTENCIA PERSONAL ===
    doc.addPage();
    addPageHeader(doc, "4. REGISTRO DE ASISTENCIA PERSONAL", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Lleva un registro personal de tu asistencia a las tutorías:", 20, 45);
    
    autoTable(doc, {
      startY: 55,
      head: [[
        { content: "Sesión", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "Fecha", styles: { fillColor: [46, 125, 50] } },
        { content: "Hora llegada", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "Hora salida", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "Temas tratados", styles: { fillColor: [46, 125, 50] } }
      ]],
      body: Array.from({ length: 10 }, (_, i) => [(i + 1).toString(), "", "", "", ""]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, minCellHeight: 14 },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 28, halign: 'center' },
        4: { cellWidth: 72 }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // === PÁGINA 7: NOTAS Y DUDAS ===
    doc.addPage();
    addPageHeader(doc, "5. NOTAS Y DUDAS POR SESIÓN", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    for (let s = 1; s <= 3; s++) {
      const baseY = 40 + (s - 1) * 75;
      doc.setFont("helvetica", "bold");
      doc.text(`Sesión ${s}  -  Fecha: _____/_____/_________`, 20, baseY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Conceptos clave aprendidos:", 20, baseY + 10);
      doc.rect(20, baseY + 13, pageWidth - 40, 18);
      doc.text("Dudas pendientes:", 20, baseY + 38);
      doc.rect(20, baseY + 41, pageWidth - 40, 18);
      doc.setFontSize(10);
    }

    // === PÁGINA 8: AUTOEVALUACIÓN ===
    doc.addPage();
    addPageHeader(doc, "6. AUTOEVALUACIÓN DEL APRENDIZAJE", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Evalúa tu propio progreso al finalizar las tutorías presenciales:", 20, 45);
    
    autoTable(doc, {
      startY: 55,
      head: [[
        { content: "ASPECTO", styles: { fillColor: [46, 125, 50] } },
        { content: "1", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "2", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "3", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "4", styles: { halign: 'center', fillColor: [46, 125, 50] } },
        { content: "5", styles: { halign: 'center', fillColor: [46, 125, 50] } }
      ]],
      body: [
        ["He comprendido los contenidos explicados", "", "", "", "", ""],
        ["He participado activamente en las actividades", "", "", "", "", ""],
        ["He resuelto mis dudas principales", "", "", "", "", ""],
        ["Me siento preparado/a para la evaluación", "", "", "", "", ""],
        ["He colaborado con mis compañeros", "", "", "", "", ""],
        ["He aplicado los contenidos teóricos en la práctica", "", "", "", "", ""],
        ["He asistido con puntualidad", "", "", "", "", ""],
        ["Estoy satisfecho/a con las tutorías", "", "", "", "", ""]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    const fy = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text("Escala: 1 = Nada | 2 = Poco | 3 = Regular | 4 = Bastante | 5 = Mucho", 20, fy);
    
    doc.text("Comentarios adicionales:", 20, fy + 15);
    doc.rect(20, fy + 20, pageWidth - 40, 40);

    // === PÁGINA 9: OBSERVACIONES ===
    doc.addPage();
    addPageHeader(doc, "7. ESPACIO PARA OBSERVACIONES", [46, 125, 50]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Utiliza este espacio para cualquier anotación adicional:", 20, 45);
    for (let i = 0; i < 22; i++) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55 + (i * 10), pageWidth - 20, 55 + (i * 10));
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, pageHeight - 10);
    
    doc.save("Cuaderno_Alumno_Tutorias_Presenciales.pdf");
    toast({ title: "PDF generado", description: "El Cuaderno del Alumno se ha descargado correctamente" });
  };

  // === PDF: Cuaderno del Formador ===
  const generateTrainerNotebookPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // PORTADA
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth / 2 - 30, 30, 60, 25, 3, 3, 'F');
    doc.setTextColor(0, 102, 153);
    doc.setFontSize(10);
    doc.text("Logo Centro", pageWidth / 2, 45, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("CUADERNO DEL FORMADOR", pageWidth / 2, 90, { align: "center" });
    doc.setFontSize(18);
    doc.text("TUTORÍAS PRESENCIALES", pageWidth / 2, 105, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Centro de Formación", pageWidth / 2, 130, { align: "center" });
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(30, 150, pageWidth - 60, 50, 5, 5, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text("Acción Formativa:", 40, 165);
    doc.setFont("helvetica", "bold");
    doc.text(courseName, 40, 175);
    doc.setFont("helvetica", "normal");
    doc.text("Centro:", 40, 190);
    doc.setFont("helvetica", "bold");
    doc.text(centerName, 65, 190);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Certificados de Profesionalidad - SEPE", pageWidth / 2, 230, { align: "center" });

    // ÍNDICE
    doc.addPage();
    addPageHeader(doc, "ÍNDICE DE CONTENIDOS", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const indexItems = [
      "1. Introducción y objetivos de las tutorías presenciales",
      "2. Orientaciones metodológicas",
      "3. Control de asistencia",
      "4. Ficha de seguimiento del alumno",
      "5. Hoja de valoración de actividades",
      "6. Registro de incidencias",
      "7. Evaluación de la tutoría presencial",
      "8. Observaciones y recomendaciones"
    ];
    let indexY = 45;
    indexItems.forEach((item, i) => {
      doc.setFont("helvetica", "normal");
      doc.text(item, 20, indexY);
      doc.text(`Pág. ${i + 3}`, pageWidth - 30, indexY);
      indexY += 12;
    });

    // INTRODUCCIÓN
    doc.addPage();
    addPageHeader(doc, "1. INTRODUCCIÓN Y OBJETIVOS", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const introText = [
      "Las tutorías presenciales son sesiones formativas que complementan la formación en",
      "modalidad de teleformación. Su objetivo principal es reforzar los contenidos teóricos",
      "mediante la práctica y resolver las dudas que puedan surgir durante el proceso formativo.",
      "",
      "OBJETIVOS DE LAS TUTORÍAS PRESENCIALES:",
      "",
      "• Reforzar los conocimientos adquiridos en la plataforma virtual",
      "• Desarrollar las destrezas prácticas necesarias",
      "• Resolver dudas y consultas de los alumnos",
      "• Fomentar el trabajo colaborativo entre los participantes",
      "• Evaluar el progreso de los alumnos de forma continua",
      "• Proporcionar retroalimentación personalizada"
    ];
    let textY = 45;
    introText.forEach(line => { doc.text(line, 20, textY); textY += 7; });

    // ORIENTACIONES METODOLÓGICAS
    doc.addPage();
    addPageHeader(doc, "2. ORIENTACIONES METODOLÓGICAS", [0, 102, 153]);
    const methodItems = [
      ["Recordatorio inicial", "Comenzar siempre haciendo un breve recordatorio/explicación de los conceptos fundamentales."],
      ["Relaciones interpersonales", "Fomentar las relaciones interpersonales como medio para favorecer el aprendizaje colaborativo."],
      ["Participación activa", "Transmitir la importancia de la participación en las actividades."],
      ["Objetivos claros", "Explicar claramente el objetivo u objetivos de la tutoría presencial."],
      ["Feedback continuo", "Facilitar un feedback continuo sobre la realización de la actividad."],
      ["Dudas y consultas", "Favorecer la exposición de dudas y consultas en todo momento."],
      ["Seguridad e higiene", "Informar sobre los posibles riesgos y medidas de seguridad."],
      ["Registro de logros", "Dejar constancia de todos los logros y deficiencias."]
    ];
    let methodY = 45;
    doc.setTextColor(0, 0, 0);
    methodItems.forEach(([title, desc]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`• ${title}:`, 20, methodY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(desc, pageWidth - 50);
      doc.text(lines, 25, methodY + 6);
      methodY += 6 + (lines.length * 5) + 5;
    });

    // CONTROL DE ASISTENCIA (with real students)
    doc.addPage();
    addPageHeader(doc, "3. CONTROL DE ASISTENCIA", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Fecha de la Tutoría: _____/_____/_________     Horario: De _____:_____ a _____:_____", 20, 45);
    
    const rowCount = Math.max(enrolledStudents.length, 15);
    const attendanceData = [];
    for (let i = 0; i < rowCount; i++) {
      const student = enrolledStudents[i];
      attendanceData.push([
        (i + 1).toString(),
        "",
        student?.full_name || "",
        "",
        ""
      ]);
    }
    
    autoTable(doc, {
      startY: 55,
      head: [[
        { content: "Nº", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "DNI/NIE", styles: { fillColor: [0, 102, 153] } },
        { content: "Nombre y Apellidos", styles: { fillColor: [0, 102, 153] } },
        { content: "Asiste (S/N)", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Firma", styles: { fillColor: [0, 102, 153] } }
      ]],
      body: attendanceData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, minCellHeight: 8 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 70 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 40 }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // FICHA DE SEGUIMIENTO
    doc.addPage();
    addPageHeader(doc, "4. FICHA DE SEGUIMIENTO DEL ALUMNO", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Alumno/a: _________________________________________________ DNI: _________________", 20, 45);
    doc.text("Tutoría Nº: _______ Fecha: _____/_____/_________", 20, 55);
    autoTable(doc, {
      startY: 65,
      head: [[
        { content: "ASPECTOS A EVALUAR", styles: { fillColor: [0, 102, 153] } },
        { content: "1", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "2", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "3", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "4", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "5", styles: { halign: 'center', fillColor: [0, 102, 153] } }
      ]],
      body: [
        ["Puntualidad y asistencia", "", "", "", "", ""],
        ["Participación activa", "", "", "", "", ""],
        ["Comprensión de contenidos teóricos", "", "", "", "", ""],
        ["Desarrollo de actividades prácticas", "", "", "", "", ""],
        ["Trabajo en equipo y colaboración", "", "", "", "", ""],
        ["Interés y motivación", "", "", "", "", ""],
        ["Resolución de problemas", "", "", "", "", ""],
        ["Cumplimiento de normas de seguridad", "", "", "", "", ""]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    const fy6 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text("Escala: 1 = Muy deficiente | 2 = Deficiente | 3 = Aceptable | 4 = Bueno | 5 = Excelente", 20, fy6);
    doc.text("Observaciones:", 20, fy6 + 15);
    doc.rect(20, fy6 + 20, pageWidth - 40, 40);

    // HOJA DE VALORACIÓN
    doc.addPage();
    addPageHeader(doc, "5. HOJA DE VALORACIÓN DE ACTIVIDADES", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Actividad: ________________________________________________________________", 20, 45);
    doc.text("Fecha: _____/_____/_________     Duración: _______ horas", 20, 55);
    autoTable(doc, {
      startY: 65,
      head: [[
        { content: "Nº", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Nombre del Alumno", styles: { fillColor: [0, 102, 153] } },
        { content: "Participación", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Resultado", styles: { halign: 'center', fillColor: [0, 102, 153] } },
        { content: "Observaciones", styles: { fillColor: [0, 102, 153] } }
      ]],
      body: Array.from({ length: Math.max(enrolledStudents.length, 12) }, (_, i) => [
        (i + 1).toString(),
        enrolledStudents[i]?.full_name || "",
        "",
        "",
        ""
      ]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, minCellHeight: 10 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 60 }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    const fy7 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text("Participación: A = Alta | M = Media | B = Baja     Resultado: AP = Apto | NA = No Apto | EP = En Progreso", 20, fy7);

    // REGISTRO DE INCIDENCIAS
    doc.addPage();
    addPageHeader(doc, "6. REGISTRO DE INCIDENCIAS", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: 45,
      head: [[
        { content: "Fecha", styles: { fillColor: [0, 102, 153] } },
        { content: "Alumno/a afectado", styles: { fillColor: [0, 102, 153] } },
        { content: "Descripción", styles: { fillColor: [0, 102, 153] } },
        { content: "Medidas adoptadas", styles: { fillColor: [0, 102, 153] } }
      ]],
      body: Array.from({ length: 8 }, () => ["", "", "", ""]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, minCellHeight: 18 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 }, 2: { cellWidth: 55 }, 3: { cellWidth: 55 } },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // EVALUACIÓN
    doc.addPage();
    addPageHeader(doc, "7. EVALUACIÓN DE LA TUTORÍA PRESENCIAL", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Tutoría Nº: _______     Fecha: _____/_____/_________", 20, 45);
    doc.text("Contenidos desarrollados: ___________________________________________________________", 20, 55);
    autoTable(doc, {
      startY: 70,
      head: [[
        { content: "ASPECTOS DE LA TUTORÍA", styles: { fillColor: [0, 102, 153] } },
        { content: "Valoración (1-5)", styles: { halign: 'center', fillColor: [0, 102, 153] } }
      ]],
      body: [
        ["Cumplimiento de los objetivos planificados", ""],
        ["Adecuación de los contenidos al nivel del grupo", ""],
        ["Participación general del alumnado", ""],
        ["Utilidad de las actividades prácticas", ""],
        ["Gestión del tiempo disponible", ""],
        ["Resolución de dudas planteadas", ""],
        ["Clima de trabajo y ambiente del grupo", ""],
        ["Recursos y materiales utilizados", ""]
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 45, halign: 'center' } },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    const fy9 = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Aspectos a mejorar para próximas tutorías:", 20, fy9);
    doc.rect(20, fy9 + 5, pageWidth - 40, 30);

    // OBSERVACIONES
    doc.addPage();
    addPageHeader(doc, "8. OBSERVACIONES Y RECOMENDACIONES", [0, 102, 153]);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Espacio para anotaciones generales:", 20, 45);
    for (let i = 0; i < 20; i++) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60 + (i * 10), pageWidth - 20, 60 + (i * 10));
    }
    doc.text("Fecha de cierre del cuaderno: _____/_____/_________", 20, pageHeight - 50);
    doc.text("Firma del Formador:", 20, pageHeight - 35);
    doc.rect(20, pageHeight - 30, 60, 20);
    doc.text("Sello del Centro:", 120, pageHeight - 35);
    doc.rect(120, pageHeight - 30, 60, 20);
    
    doc.save("Cuaderno_Formador_Tutorias_Presenciales.pdf");
    toast({ title: "PDF generado", description: "El Cuaderno del Formador se ha descargado correctamente" });
  };

  const addPageHeader = (doc: jsPDF, title: string, color: number[] = [0, 102, 153]) => {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(0, 0, pw, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, pw / 2, 16, { align: "center" });
  };

  const actionItems = isTeacher ? [
    { icon: ClipboardList, text: "Realizar el control de asistencia de los alumnos en el documento correspondiente" },
    { icon: PenTool, text: "Registrar las observaciones y resultados de la evaluación en la correspondiente hoja de valoración" },
    { icon: AlertCircle, text: "Comunicar las faltas de asistencia al tutor-formador" },
    { icon: FileText, text: "En un plazo de una semana, trasladar al tutor-formador la información y documentación generada en el desarrollo de la tutoría presencial" }
  ] : [
    { icon: CheckSquare, text: "Asistir puntualmente a todas las tutorías presenciales programadas" },
    { icon: Users, text: "Participar activamente en las actividades grupales e individuales" },
    { icon: MessageCircle, text: "Exponer dudas y consultas al formador durante las sesiones" },
    { icon: Target, text: "Cumplir con el mínimo del 75% de asistencia requerido por SEPE" }
  ];

  const methodologicalGuidelines = [
    { icon: BookOpen, text: "Comenzar siempre haciendo un breve recordatorio/explicación de los conceptos fundamentales" },
    { icon: Users, text: "Fomentar las relaciones interpersonales como medio para favorecer el aprendizaje colaborativo" },
    { icon: Target, text: "Transmitir la importancia de la participación en las actividades" },
    { icon: Lightbulb, text: "Explicar claramente el objetivo u objetivos de la tutoría presencial" },
    { icon: MessageCircle, text: "Facilitar un feedback continuo sobre la correcta/incorrecta realización de la actividad" },
    { icon: CheckSquare, text: "Favorecer la exposición de dudas y consultas" },
    { icon: ShieldCheck, text: "Informar sobre los posibles riesgos y medidas de seguridad cuando corresponda" },
    { icon: PenTool, text: "Dejar constancia de todos los logros y deficiencias en el aprendizaje" }
  ];

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
          <BookOpen className="h-5 w-5" />
          Acciones para el Seguimiento del Aprendizaje en las Tutorías Presenciales
        </CardTitle>
        <p className="text-sm text-amber-700 mt-1">
          {isTeacher 
            ? "Guía para formadores sobre el seguimiento y evaluación en tutorías presenciales del Centro de Formación"
            : "Información sobre las tutorías presenciales y tu participación en las sesiones del Centro de Formación"
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Acciones principales */}
        <Collapsible open={openSections.includes('actions')} onOpenChange={() => toggleSection('actions')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-white rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">
                {isTeacher ? "Acciones del Formador" : "Tu Participación en las Tutorías"}
              </span>
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                {actionItems.length} puntos
              </Badge>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('actions') ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-white rounded-lg border p-4 space-y-3">
              {isTeacher && (
                <p className="text-sm text-muted-foreground mb-3">
                  Como <strong>formador</strong> deberás realizar el control de asistencia de los alumnos, 
                  así como las observaciones y resultados de la evaluación.
                </p>
              )}
              <ul className="space-y-3">
                {actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-amber-100">
                      <item.icon className="h-3.5 w-3.5 text-amber-700" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Orientaciones metodológicas */}
        <Collapsible open={openSections.includes('methodology')} onOpenChange={() => toggleSection('methodology')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-white rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Orientaciones Metodológicas</span>
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                {methodologicalGuidelines.length} orientaciones
              </Badge>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('methodology') ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Orientaciones metodológicas para el seguimiento del aprendizaje en las Tutorías Presenciales:
              </p>
              <ul className="space-y-3">
                {methodologicalGuidelines.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-blue-100">
                      <item.icon className="h-3.5 w-3.5 text-blue-700" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Herramientas e instrumentos */}
        <Collapsible open={openSections.includes('tools')} onOpenChange={() => toggleSection('tools')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-white rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Herramientas e Instrumentos de Seguimiento</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('tools') ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-white rounded-lg border p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Para el seguimiento de las tutorías presenciales en el Centro de Formación dispondrás de:
              </p>
              
              {/* Lista de Asistencia - visible para todos */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-green-100">
                  <ClipboardList className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Lista de asistencia de alumnos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {enrolledStudents.length > 0 
                      ? `Incluye los ${enrolledStudents.length} alumnos matriculados en el curso`
                      : "Podrás obtener información de los alumnos en el Campus Virtual"
                    }
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={generateAttendanceListPDF}>
                    <Download className="h-4 w-4" />
                    Descargar Modelo
                  </Button>
                </div>
              </div>

              {/* Cuaderno del Alumno - visible para todos */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-green-100">
                  <UserCheck className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Cuaderno del alumno de las tutorías presenciales</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Incluye calendario, registro de asistencia personal, notas por sesión y autoevaluación</p>
                  <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={generateStudentNotebookPDF}>
                    <Download className="h-4 w-4" />
                    Descargar Cuaderno del Alumno
                  </Button>
                </div>
              </div>
              
              {/* Cuaderno del Formador - SOLO visible para profesores */}
              {isTeacher && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="p-2 rounded-full bg-green-100">
                    <FileText className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Cuaderno del formador de las tutorías presenciales</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Incluye orientaciones e instrumentos de seguimiento y evaluación de alumnos</p>
                    <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={generateTrainerNotebookPDF}>
                      <Download className="h-4 w-4" />
                      Descargar Cuaderno del Formador
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Nota importante */}
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Importante</p>
                  <p className="text-muted-foreground mt-1">
                    {isTeacher 
                      ? "Recuerda que se deberán reflejar los resultados y valoraciones de las actividades realizadas en las Tutorías Presenciales en el correspondiente apartado de seguimiento y evaluación del alumno en el Campus Virtual."
                      : "Recuerda que los resultados y valoraciones de las actividades realizadas en las Tutorías Presenciales se reflejarán en el correspondiente apartado de seguimiento y evaluación del alumno en el Campus Virtual."
                    }
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default TutoriasPresencialesGuide;
