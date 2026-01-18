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
  Download
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TutoriasPresencialesGuideProps {
  userRole: string;
  courseName?: string;
  centerName?: string;
}

const TutoriasPresencialesGuide = ({ userRole, courseName = "Curso de Formación", centerName = "Centro de Formación" }: TutoriasPresencialesGuideProps) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const { toast } = useToast();
  
  const isTeacher = userRole === 'teacher';
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Generar Lista de Asistencia PDF
  const generateAttendanceListPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LISTA DE ASISTENCIA DE ALUMNOS", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Tutorías Presenciales del Centro de Formación", pageWidth / 2, 25, { align: "center" });
    
    // Info section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
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
    
    // Table
    const tableData = [];
    for (let i = 1; i <= 25; i++) {
      tableData.push([
        i.toString(),
        "",
        "",
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
      styles: {
        fontSize: 9,
        cellPadding: 3,
        minCellHeight: 10
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 35 }
      },
      headStyles: {
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(9);
    doc.text("Observaciones:", 14, finalY);
    doc.setDrawColor(150, 150, 150);
    doc.line(14, finalY + 5, pageWidth - 14, finalY + 5);
    doc.line(14, finalY + 12, pageWidth - 14, finalY + 12);
    doc.line(14, finalY + 19, pageWidth - 14, finalY + 19);
    
    // Signature section
    doc.text("Firma y sello del Centro de Formación:", 14, finalY + 35);
    doc.rect(14, finalY + 40, 80, 30);
    
    doc.text("Firma del Formador:", 110, finalY + 35);
    doc.rect(110, finalY + 40, 80, 30);
    
    // Page footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 14, doc.internal.pageSize.getHeight() - 10);
    
    doc.save("Lista_Asistencia_Tutorias_Presenciales.pdf");
    
    toast({
      title: "PDF generado",
      description: "La Lista de Asistencia se ha descargado correctamente"
    });
  };

  // Generar Cuaderno del Formador PDF
  const generateTrainerNotebookPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // === PORTADA ===
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Logo area placeholder
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
    
    // === PÁGINA 2: ÍNDICE ===
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ÍNDICE DE CONTENIDOS", pageWidth / 2, 16, { align: "center" });
    
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
    
    // === PÁGINA 3: INTRODUCCIÓN ===
    doc.addPage();
    addPageHeader(doc, "1. INTRODUCCIÓN Y OBJETIVOS");
    
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
    introText.forEach(line => {
      doc.text(line, 20, textY);
      textY += 7;
    });
    
    // === PÁGINA 4: ORIENTACIONES METODOLÓGICAS ===
    doc.addPage();
    addPageHeader(doc, "2. ORIENTACIONES METODOLÓGICAS");
    
    const methodItems = [
      ["Recordatorio inicial", "Comenzar siempre haciendo un breve recordatorio/explicación de los conceptos fundamentales para desarrollar las tutorías presenciales."],
      ["Relaciones interpersonales", "Fomentar las relaciones interpersonales como medio para favorecer el aprendizaje colaborativo."],
      ["Participación activa", "Transmitir la importancia de la participación en las actividades para el correcto desarrollo de la formación."],
      ["Objetivos claros", "Explicar claramente el objetivo u objetivos de la tutoría presencial, así como el trabajo que se va a desarrollar."],
      ["Feedback continuo", "Facilitar un feedback continuo sobre la correcta/incorrecta realización de la actividad."],
      ["Dudas y consultas", "Favorecer la exposición de dudas y consultas en todo momento."],
      ["Seguridad e higiene", "Informar sobre los posibles riesgos y medidas de seguridad cuando corresponda."],
      ["Registro de logros", "Dejar constancia de todos los logros y deficiencias para ajustar el proceso formativo."]
    ];
    
    let methodY = 45;
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
    
    // === PÁGINA 5: CONTROL DE ASISTENCIA ===
    doc.addPage();
    addPageHeader(doc, "3. CONTROL DE ASISTENCIA");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Fecha de la Tutoría: _____/_____/_________     Horario: De _____:_____ a _____:_____", 20, 45);
    
    const attendanceData = [];
    for (let i = 1; i <= 15; i++) {
      attendanceData.push([i.toString(), "", "", "", ""]);
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
    
    // === PÁGINA 6: FICHA DE SEGUIMIENTO ===
    doc.addPage();
    addPageHeader(doc, "4. FICHA DE SEGUIMIENTO DEL ALUMNO");
    
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
        ["Participación activa en las actividades", "", "", "", "", ""],
        ["Comprensión de los contenidos teóricos", "", "", "", "", ""],
        ["Desarrollo de las actividades prácticas", "", "", "", "", ""],
        ["Trabajo en equipo y colaboración", "", "", "", "", ""],
        ["Interés y motivación mostrada", "", "", "", "", ""],
        ["Resolución de problemas planteados", "", "", "", "", ""],
        ["Cumplimiento de las normas de seguridad", "", "", "", "", ""]
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
    
    const finalY6 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text("Escala: 1 = Muy deficiente | 2 = Deficiente | 3 = Aceptable | 4 = Bueno | 5 = Excelente", 20, finalY6);
    
    doc.text("Observaciones:", 20, finalY6 + 15);
    doc.rect(20, finalY6 + 20, pageWidth - 40, 40);
    
    // === PÁGINA 7: HOJA DE VALORACIÓN ===
    doc.addPage();
    addPageHeader(doc, "5. HOJA DE VALORACIÓN DE ACTIVIDADES");
    
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
      body: Array.from({ length: 12 }, (_, i) => [(i + 1).toString(), "", "", "", ""]),
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
    
    const finalY7 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text("Participación: A = Alta | M = Media | B = Baja     Resultado: AP = Apto | NA = No Apto | EP = En Progreso", 20, finalY7);
    
    // === PÁGINA 8: REGISTRO DE INCIDENCIAS ===
    doc.addPage();
    addPageHeader(doc, "6. REGISTRO DE INCIDENCIAS");
    
    autoTable(doc, {
      startY: 45,
      head: [[
        { content: "Fecha", styles: { fillColor: [0, 102, 153] } },
        { content: "Alumno/a afectado", styles: { fillColor: [0, 102, 153] } },
        { content: "Descripción de la incidencia", styles: { fillColor: [0, 102, 153] } },
        { content: "Medidas adoptadas", styles: { fillColor: [0, 102, 153] } }
      ]],
      body: Array.from({ length: 8 }, () => ["", "", "", ""]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, minCellHeight: 18 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 55 },
        3: { cellWidth: 55 }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    
    // === PÁGINA 9: EVALUACIÓN DE LA TUTORÍA ===
    doc.addPage();
    addPageHeader(doc, "7. EVALUACIÓN DE LA TUTORÍA PRESENCIAL");
    
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
        ["Utilidad de las actividades prácticas realizadas", ""],
        ["Gestión del tiempo disponible", ""],
        ["Resolución de dudas planteadas", ""],
        ["Clima de trabajo y ambiente del grupo", ""],
        ["Recursos y materiales utilizados", ""]
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 45, halign: 'center' }
      },
      headStyles: { textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    
    const finalY9 = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Aspectos a mejorar para próximas tutorías:", 20, finalY9);
    doc.rect(20, finalY9 + 5, pageWidth - 40, 30);
    
    // === PÁGINA 10: OBSERVACIONES ===
    doc.addPage();
    addPageHeader(doc, "8. OBSERVACIONES Y RECOMENDACIONES");
    
    doc.setFontSize(10);
    doc.text("Espacio para anotaciones generales sobre el desarrollo de las tutorías presenciales:", 20, 45);
    
    // Draw lined area
    for (let i = 0; i < 20; i++) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60 + (i * 10), pageWidth - 20, 60 + (i * 10));
    }
    
    // Final signature section
    doc.setFontSize(10);
    doc.text("Fecha de cierre del cuaderno: _____/_____/_________", 20, pageHeight - 50);
    doc.text("Firma del Formador:", 20, pageHeight - 35);
    doc.rect(20, pageHeight - 30, 60, 20);
    doc.text("Sello del Centro:", 120, pageHeight - 35);
    doc.rect(120, pageHeight - 30, 60, 20);
    
    doc.save("Cuaderno_Formador_Tutorias_Presenciales.pdf");
    
    toast({
      title: "PDF generado",
      description: "El Cuaderno del Formador se ha descargado correctamente"
    });
  };

  // Helper function for page headers
  const addPageHeader = (doc: jsPDF, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 16, { align: "center" });
  };

  const actionItems = isTeacher ? [
    {
      icon: ClipboardList,
      text: "Realizar el control de asistencia de los alumnos en el documento correspondiente"
    },
    {
      icon: PenTool,
      text: "Registrar las observaciones y resultados de la evaluación en la correspondiente hoja de valoración"
    },
    {
      icon: AlertCircle,
      text: "Comunicar las faltas de asistencia al tutor-formador"
    },
    {
      icon: FileText,
      text: "En un plazo de una semana, trasladar al tutor-formador la información y documentación generada en el desarrollo de la tutoría presencial, con su correspondiente valoración, para que se refleje en el Campus Virtual"
    }
  ] : [
    {
      icon: CheckSquare,
      text: "Asistir puntualmente a todas las tutorías presenciales programadas"
    },
    {
      icon: Users,
      text: "Participar activamente en las actividades grupales e individuales"
    },
    {
      icon: MessageCircle,
      text: "Exponer dudas y consultas al formador durante las sesiones"
    },
    {
      icon: Target,
      text: "Cumplir con el mínimo del 75% de asistencia requerido por SEPE"
    }
  ];

  const methodologicalGuidelines = [
    {
      icon: BookOpen,
      text: "Comenzar siempre haciendo un breve recordatorio/explicación de los conceptos fundamentales para desarrollar las tutorías presenciales"
    },
    {
      icon: Users,
      text: "Fomentar las relaciones interpersonales como medio para favorecer el aprendizaje colaborativo"
    },
    {
      icon: Target,
      text: "Transmitir la importancia de la participación en las actividades para el correcto desarrollo de la formación y el aprovechamiento, tanto individual como grupal"
    },
    {
      icon: Lightbulb,
      text: "Explicar claramente el objetivo u objetivos de la tutoría presencial, así como el trabajo que se va a desarrollar"
    },
    {
      icon: MessageCircle,
      text: "Facilitar un feedback continuo sobre la correcta/incorrecta realización de la actividad que se está desarrollando"
    },
    {
      icon: CheckSquare,
      text: "Favorecer la exposición de dudas y consultas"
    },
    {
      icon: ShieldCheck,
      text: "Informar sobre los posibles riesgos, en caso de actividades que requieran la aplicación de normas o medidas de seguridad e higiene y/o la utilización de equipos de protección individual"
    },
    {
      icon: PenTool,
      text: "Dejar constancia de todos los logros y deficiencias en el aprendizaje de los alumnos que puedan servir para corregir y/o encauzar nuevamente el proceso formativo"
    }
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
        <Collapsible 
          open={openSections.includes('actions')} 
          onOpenChange={() => toggleSection('actions')}
        >
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
                  en el documento correspondiente, así como las observaciones y resultados de la evaluación, 
                  en su caso, en la correspondiente hoja de valoración.
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
        <Collapsible 
          open={openSections.includes('methodology')} 
          onOpenChange={() => toggleSection('methodology')}
        >
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
                Orientaciones metodológicas para el seguimiento del aprendizaje en las Tutorías Presenciales del Centro de Formación:
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
        <Collapsible 
          open={openSections.includes('tools')} 
          onOpenChange={() => toggleSection('tools')}
        >
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
              
              {/* Herramienta 1: Lista de Asistencia */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-green-100">
                  <ClipboardList className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Lista de asistencia de alumnos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Podrás obtener información de los alumnos en el Campus Virtual</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 gap-2"
                    onClick={generateAttendanceListPDF}
                  >
                    <Download className="h-4 w-4" />
                    Descargar Modelo
                  </Button>
                </div>
              </div>
              
              {/* Herramienta 2: Cuaderno del Formador */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-full bg-green-100">
                  <FileText className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Cuaderno del formador de las tutorías presenciales</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Incluye orientaciones e instrumentos de seguimiento y evaluación de alumnos</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 gap-2"
                    onClick={generateTrainerNotebookPDF}
                  >
                    <Download className="h-4 w-4" />
                    Descargar Cuaderno
                  </Button>
                </div>
              </div>
              
              {/* Nota importante */}
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Importante</p>
                  <p className="text-muted-foreground mt-1">
                    {isTeacher 
                      ? "En el Campus Virtual, en el icono de TUTORÍAS PRESENCIALES puedes encontrar el CUADERNO DEL FORMADOR DE LAS TUTORÍAS PRESENCIALES, donde encontrarás toda la información necesaria para el desarrollo de estas tutorías."
                      : "Recuerda que los resultados y valoraciones de las actividades realizadas en las Tutorías Presenciales se reflejarán en el correspondiente apartado de seguimiento y evaluación del alumno en el Campus Virtual."
                    }
                  </p>
                </div>
              </div>

              {isTeacher && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">
                    Recuerda que se deberán reflejar los resultados y valoraciones de las actividades realizadas 
                    en las Tutorías Presenciales en el correspondiente apartado de seguimiento y evaluación del 
                    alumno en el Campus Virtual.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default TutoriasPresencialesGuide;
