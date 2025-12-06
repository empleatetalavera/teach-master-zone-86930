import { Download, BookOpen, FileText, Users, Calendar, ClipboardList, MessageSquare, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TeacherTutorGuide = () => {
  const handleDownload = () => {
    window.open('/documents/guia_tutor_sepe.pdf', '_blank');
  };

  const sections = [
    {
      icon: FileText,
      title: "1. Datos de la Acción Formativa",
      description: "Objetivos, organización y fechas de realización del curso"
    },
    {
      icon: Users,
      title: "2. Alumnos y Equipo Docente",
      description: "Listado de participantes y coordinación del equipo"
    },
    {
      icon: BookOpen,
      title: "3. Campus Virtual",
      description: "Requisitos técnicos, funcionamiento, recursos y preguntas frecuentes"
    },
    {
      icon: Calendar,
      title: "4. Programación Didáctica",
      description: "Cómo desarrollar la formación y planificación de la evaluación"
    },
    {
      icon: ClipboardList,
      title: "5. Seguimiento del Aprendizaje",
      description: "Procedimientos de seguimiento y evaluación del alumnado"
    },
    {
      icon: MessageSquare,
      title: "6. Sistema Tutorial",
      description: "Tutorías virtuales y presenciales"
    },
    {
      icon: Award,
      title: "7. Gestión y Administración",
      description: "Altas/bajas, formación de grupos, prácticas e incidencias"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guía del Tutor-Formador</h1>
          <p className="text-muted-foreground">
            Documento oficial aprobado por el SEPE con toda la información necesaria para la tutorización
          </p>
        </div>
        <Button onClick={handleDownload} size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          Descargar PDF
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Guía del Tutor-Formador SEPE
          </CardTitle>
          <CardDescription>
            Este documento contiene toda la información que necesitas para el desarrollo óptimo de los cursos que vas a impartir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-background border"
              >
                <div className="p-2 rounded-md bg-primary/10">
                  <section.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recursos Adicionales</CardTitle>
          <CardDescription>
            Documentos complementarios disponibles en el Campus Virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Solución y sistema de corrección de actividades de aprendizaje
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Planificación de actividades para Tutorías Presenciales
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información sobre pruebas de evaluación presencial final
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Calendario y Plan de Trabajo
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Evaluación</CardTitle>
          <CardDescription>
            Distribución de la nota final según la guía SEPE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="text-3xl font-bold text-primary">30%</div>
              <div className="text-sm font-medium">Actividades de Aprendizaje</div>
              <p className="text-xs text-muted-foreground mt-1">
                Promedio de notas en actividades, participación en foros y pruebas de evaluación
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="text-3xl font-bold text-primary">70%</div>
              <div className="text-sm font-medium">Prueba de Evaluación Final</div>
              <p className="text-xs text-muted-foreground mt-1">
                Examen presencial en el Centro de Formación (mínimo 5 para aprobar)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTutorGuide;
