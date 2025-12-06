import { useState } from "react";
import { Download, BookOpen, FileText, Users, Calendar, ClipboardList, MessageSquare, Award, ChevronDown, ChevronUp, Settings, Paperclip } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TeacherTutorGuide = () => {
  const handleDownload = () => {
    // Open PDF in new tab - the file is in public/documents/
    const link = document.createElement('a');
    link.href = '/documents/guia_tutor_sepe.pdf';
    link.download = 'guia_tutor_sepe.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sections = [
    {
      id: "datos-accion",
      icon: FileText,
      title: "1. Datos de la Acción Formativa",
      description: "Objetivos, organización y fechas de realización del curso",
      content: {
        subsections: [
          {
            title: "1.1 Objetivos",
            content: "En este apartado encontrarás los objetivos generales del curso y las capacidades que deberán trabajarse en cada módulo formativo. En el Campus Virtual, en el apartado INTRODUCCIÓN de cada unidad formativa o módulo formativo, el alumnado dispone del documento 'Objetivos y contenidos' donde se detallan los objetivos que aprenderá durante la formación."
          },
          {
            title: "1.2 Organización y fechas de realización",
            content: "Información sobre el certificado de profesionalidad correspondiente, la familia profesional, el nivel de cualificación profesional y los módulos formativos que lo componen con sus respectivas horas de duración."
          }
        ],
        resources: [
          { name: "Ficha del certificado de profesionalidad", type: "PDF" },
          { name: "Calendario de la acción formativa", type: "PDF" }
        ]
      }
    },
    {
      id: "alumnos-equipo",
      icon: Users,
      title: "2. Alumnos y Equipo Docente",
      description: "Listado de participantes y coordinación del equipo",
      content: {
        subsections: [
          {
            title: "Listado de alumnos",
            content: "En el Campus Virtual tendrás acceso al listado completo de alumnos matriculados en el curso. Podrás identificar qué alumnos están conectados mediante un punto de color verde junto a su nombre."
          },
          {
            title: "Equipo docente",
            content: "Podrás ver el resto del equipo de tutores-formadores que imparten formación en cada módulo formativo y comunicarte con ellos a través del foro específico de tutores-formadores."
          }
        ],
        resources: [
          { name: "Listado de alumnos matriculados", type: "Sistema" },
          { name: "Directorio de tutores-formadores", type: "Sistema" }
        ]
      }
    },
    {
      id: "campus-virtual",
      icon: BookOpen,
      title: "3. Campus Virtual y Aplicaciones",
      description: "Requisitos técnicos, funcionamiento, recursos y preguntas frecuentes",
      content: {
        subsections: [
          {
            title: "3.1 Requisitos técnicos del equipo informático",
            content: "Especificaciones técnicas mínimas que debe cumplir el equipo del alumno para acceder correctamente al Campus Virtual y realizar todas las actividades formativas."
          },
          {
            title: "3.2 Funcionamiento y recursos",
            content: "El Campus Virtual está organizado en tres áreas principales: ORGANIZARME (agenda, tareas pendientes, guías), COMUNICARME (perfil, contactos, correo, chat, foros) y RECURSOS (contenidos interactivos, manuales, material complementario, actividades, evaluaciones)."
          },
          {
            title: "3.3 Ayuda y preguntas frecuentes",
            content: "Antes de comenzar a usar el Campus es recomendable visualizar los vídeos disponibles en el Centro de Atención al Usuario. También dispones de un apartado de preguntas frecuentes (FAQ's) para resolver dudas."
          },
          {
            title: "3.4 Aplicaciones informáticas",
            content: "Listado de aplicaciones informáticas necesarias para desarrollar la formación según cada módulo formativo (procesadores de texto, hojas de cálculo, bases de datos, etc.)."
          }
        ],
        resources: [
          { name: "Guía de navegación del Campus Virtual", type: "PDF" },
          { name: "Vídeos tutoriales del CAU", type: "Vídeo" },
          { name: "Manual de instalación de aplicaciones", type: "PDF" }
        ]
      }
    },
    {
      id: "programacion-didactica",
      icon: Calendar,
      title: "4. Programación Didáctica y Evaluación",
      description: "Cómo desarrollar la formación y planificación de la evaluación",
      content: {
        subsections: [
          {
            title: "4.1 ¿Cómo debe desarrollar el alumno la acción formativa?",
            content: "La formación se desarrolla en fases: A) Introducción al módulo (chat inicial, objetivos, test de conocimientos previos), B) Formación en Campus (contenidos multimedia, actividades, foros, autoevaluaciones), C) Tutorías presenciales, D) Tutorías virtuales, E) Pruebas de evaluación (test final y evaluación presencial)."
          },
          {
            title: "4.2 ¿Qué se evalúa en la acción formativa?",
            content: "Se realiza evaluación continua que incluye: cuestionario de conocimientos previos, test de autoevaluación por unidad, actividades de aprendizaje, participación en foros, actividades en tutorías presenciales, test final en Campus y prueba de evaluación final presencial."
          }
        ],
        resources: [
          { name: "Planificación didáctica - Teleformación (Anexo III)", type: "PDF" },
          { name: "Programación didáctica - Teleformación (Anexo IV)", type: "PDF" },
          { name: "Programación didáctica - Tutorías presenciales (Anexo IV)", type: "PDF" },
          { name: "Planificación de la evaluación del aprendizaje (Anexo V)", type: "PDF" },
          { name: "Plan de trabajo del alumno", type: "PDF" }
        ]
      }
    },
    {
      id: "seguimiento-aprendizaje",
      icon: ClipboardList,
      title: "5. Seguimiento del Aprendizaje y Evaluación",
      description: "Procedimientos de seguimiento y evaluación del alumnado",
      content: {
        subsections: [
          {
            title: "5.1 ¿Quién, cómo y cuándo se realiza el seguimiento?",
            content: "Como tutor-formador deberás confirmar que el alumno desarrolla la formación según la planificación: estudio de contenidos multimedia, realización de actividades de autoevaluación, entrega de actividades de aprendizaje y participación en foros. Utiliza las herramientas de seguimiento del Campus Virtual."
          },
          {
            title: "5.2 ¿Quién, cómo y cuándo se evalúa?",
            content: "Deberás corregir las actividades de aprendizaje, valorar la participación en foros, supervisar los resultados de autoevaluaciones y tests finales, y evaluar las pruebas presenciales. Envía feedback al alumno a través del correo del Campus."
          },
          {
            title: "5.3 Adaptación para déficits de aprendizaje",
            content: "Si detectas que un alumno tiene dificultades, puedes proponer actividades adicionales, ofrecer tutorías individuales y adaptar el ritmo de la formación según las circunstancias personales."
          }
        ],
        resources: [
          { name: "Herramienta de seguimiento de tareas", type: "Sistema" },
          { name: "Plantilla de corrección de actividades", type: "PDF" },
          { name: "Informe de progreso del alumno", type: "Sistema" }
        ]
      }
    },
    {
      id: "sistema-tutorial",
      icon: MessageSquare,
      title: "6. Sistema Tutorial",
      description: "Tutorías virtuales y presenciales",
      content: {
        subsections: [
          {
            title: "6.1 Tutorías virtuales",
            content: "Se realizan a través del Campus Virtual mediante chat, correo electrónico o videoconferencia (Contacta en Directo). Puedes organizar tutorías grupales o individuales según las necesidades del alumnado. Debes atender las consultas en un plazo máximo de 24-48 horas."
          },
          {
            title: "6.2 Tutorías presenciales",
            content: "Son sesiones obligatorias que se realizan en el Centro de Formación. El alumno dispone del 'Cuaderno del Alumno' con la información sobre el desarrollo de la tutoría. Tú dispones del 'Cuaderno del Formador' con las actividades y sistema de evaluación."
          }
        ],
        resources: [
          { name: "Cuaderno del alumno - Tutorías presenciales", type: "PDF" },
          { name: "Cuaderno del formador - Tutorías presenciales", type: "PDF" },
          { name: "Guía de uso de herramientas de comunicación", type: "PDF" }
        ]
      }
    },
    {
      id: "gestion-administracion",
      icon: Award,
      title: "7. Gestión y Administración",
      description: "Altas/bajas, formación de grupos, prácticas e incidencias",
      content: {
        subsections: [
          {
            title: "7.1 Altas y bajas de alumnos",
            content: "Procedimiento para gestionar nuevas incorporaciones de alumnos durante la formación y bajas voluntarias o por incumplimiento de requisitos de asistencia/participación."
          },
          {
            title: "7.2 Formación de grupos/equipos",
            content: "Criterios y procedimientos para organizar a los alumnos en grupos de trabajo cuando las actividades lo requieran."
          },
          {
            title: "7.3 Módulo de formación práctica",
            content: "Programación y seguimiento del módulo de prácticas profesionales no laborales en empresas. Incluye coordinación con el tutor de empresa."
          },
          {
            title: "7.4 Coordinación entre tutor-formador, formador y tutor de empresa",
            content: "Protocolo de comunicación y coordinación entre los diferentes agentes implicados en la formación del alumno."
          },
          {
            title: "7.5 Gestión de incidencias y reclamaciones",
            content: "Procedimiento para gestionar y resolver incidencias técnicas, académicas o reclamaciones de los alumnos."
          }
        ],
        resources: [
          { name: "Formulario de alta/baja de alumnos", type: "PDF" },
          { name: "Protocolo de coordinación con empresas", type: "PDF" },
          { name: "Formulario de incidencias", type: "PDF" }
        ]
      }
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
          Descargar PDF Completo
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Contenido de la Guía
          </CardTitle>
          <CardDescription>
            Haz clic en cada sección para ver el contenido detallado y los recursos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-2">
            {sections.map((section) => (
              <AccordionItem 
                key={section.id} 
                value={section.id}
                className="border rounded-lg bg-background px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-md bg-primary/10 shrink-0">
                      <section.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{section.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-2">
                    {/* Subsections */}
                    <div className="space-y-3">
                      {section.content.subsections.map((sub, idx) => (
                        <div key={idx} className="pl-4 border-l-2 border-primary/20">
                          <h4 className="font-medium text-sm text-foreground">{sub.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{sub.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Resources */}
                    {section.content.resources.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          Recursos disponibles
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {section.content.resources.map((resource, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                            >
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="flex-1 truncate">{resource.name}</span>
                              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                                {resource.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>• Ejercicios autoevaluables: 2%</li>
                <li>• Test de autoevaluación: Obligatorio</li>
                <li>• Test Final: 10%</li>
                <li>• Actividades complementarias: 11%</li>
                <li>• Tutorías presenciales: 5%</li>
                <li>• Participación en foros: 2%</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="text-3xl font-bold text-primary">70%</div>
              <div className="text-sm font-medium">Prueba de Evaluación Final</div>
              <p className="text-xs text-muted-foreground mt-1">
                Examen presencial en el Centro de Formación (mínimo 5 para aprobar)
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>• Realización en el Centro de Formación</li>
                <li>• Valoración sobre 10 puntos</li>
                <li>• Puntuación mínima requerida: 5</li>
                <li>• Incluye teoría y práctica</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requisitos para Superar el Curso</CardTitle>
          <CardDescription>
            El alumno deberá cumplir todos estos requisitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Realizar todas las actividades de aprendizaje</p>
                <p className="text-xs text-muted-foreground">Casos prácticos, foros, documentos, vídeos y pruebas de evaluación en Campus Virtual</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Asistir a las tutorías presenciales</p>
                <p className="text-xs text-muted-foreground">Mínimo 75% de asistencia a las sesiones presenciales programadas</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Superar la prueba de evaluación final</p>
                <p className="text-xs text-muted-foreground">Obtener una puntuación mínima de 5 en el examen presencial</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">4</span>
              </div>
              <div>
                <p className="text-sm font-medium">Cumplir los tiempos de acceso al Campus</p>
                <p className="text-xs text-muted-foreground">Mantener una dedicación mínima según las horas del módulo formativo</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTutorGuide;
