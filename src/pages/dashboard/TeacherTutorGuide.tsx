import { useState } from "react";
import { 
  FileText, 
  Users, 
  Monitor, 
  CalendarDays, 
  BarChart3, 
  MessageSquare, 
  Settings,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  Trash2,
  Loader2,
  FileIcon,
  Paperclip
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AttachedFile {
  name: string;
  url: string;
  uploadedAt: string;
}

interface GuideSection {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  files: AttachedFile[];
}

const defaultSections: GuideSection[] = [
  {
    key: "datos_accion",
    title: "1. Datos de la Acción Formativa",
    description: "Objetivos, organización y fechas de realización del curso",
    icon: <FileText className="h-5 w-5" />,
    content: `Esta sección incluye toda la información básica de la acción formativa:

• **Identificación del curso**: Código, denominación y modalidad de impartición
• **Objetivos generales y específicos**: Competencias a desarrollar por el alumnado
• **Fechas de inicio y fin**: Calendario completo de la acción formativa
• **Duración**: Horas totales, presenciales y de teleformación
• **Requisitos de acceso**: Perfil del alumnado y documentación necesaria

Adjunte aquí la programación didáctica, ficha técnica del curso y cualquier documentación oficial relacionada.`,
    files: []
  },
  {
    key: "alumnos_equipo",
    title: "2. Alumnos y Equipo Docente",
    description: "Listado de participantes y coordinación del equipo",
    icon: <Users className="h-5 w-5" />,
    content: `Información sobre los participantes y el equipo:

• **Listado de alumnos**: Datos de los participantes matriculados
• **Equipo docente**: Tutores, formadores y personal de apoyo
• **Coordinación**: Responsables y canales de comunicación
• **Roles y funciones**: Descripción de responsabilidades de cada miembro

Adjunte aquí el listado de alumnos, fichas del equipo docente y organigramas.`,
    files: []
  },
  {
    key: "campus_virtual",
    title: "3. Campus Virtual",
    description: "Requisitos técnicos, funcionamiento, recursos y preguntas frecuentes",
    icon: <Monitor className="h-5 w-5" />,
    content: `Guía del campus virtual para tutores:

• **Requisitos técnicos**: Navegadores compatibles, conexión mínima
• **Acceso a la plataforma**: Credenciales y primeros pasos
• **Navegación**: Estructura y ubicación de recursos
• **Herramientas disponibles**: Foros, mensajería, videoconferencia
• **Preguntas frecuentes**: Soluciones a problemas comunes

Adjunte manuales de usuario, guías rápidas y FAQ.`,
    files: []
  },
  {
    key: "programacion_didactica",
    title: "4. Programación Didáctica",
    description: "Cómo desarrollar la formación y planificación de la evaluación",
    icon: <CalendarDays className="h-5 w-5" />,
    content: `Planificación pedagógica del curso:

• **Estructura modular**: Organización de módulos y unidades formativas
• **Contenidos**: Temario detallado por unidad
• **Metodología**: Estrategias didácticas y recursos
• **Temporalización**: Distribución horaria de contenidos
• **Sistema de evaluación**: Criterios, instrumentos y ponderación

Adjunte la programación didáctica completa, cronogramas y materiales de evaluación.`,
    files: []
  },
  {
    key: "seguimiento_aprendizaje",
    title: "5. Seguimiento del Aprendizaje",
    description: "Procedimientos de seguimiento y evaluación del alumnado",
    icon: <BarChart3 className="h-5 w-5" />,
    content: `Procedimientos de seguimiento:

• **Indicadores de progreso**: Métricas de avance del alumnado
• **Alertas de inactividad**: Detección y actuación ante alumnos inactivos
• **Evaluación continua**: Registro de actividades y participación
• **Informes de seguimiento**: Generación y envío de informes SEPE
• **Acciones correctivas**: Protocolo ante bajo rendimiento

Adjunte plantillas de informes, protocolos de seguimiento y documentos SEPE.`,
    files: []
  },
  {
    key: "sistema_tutorial",
    title: "6. Sistema Tutorial",
    description: "Tutorías virtuales y presenciales",
    icon: <MessageSquare className="h-5 w-5" />,
    content: `Sistema de tutorización:

• **Tutorías síncronas**: Videoconferencias y sesiones en directo
• **Tutorías asíncronas**: Mensajería, foros y correo
• **Horario de atención**: Disponibilidad y tiempos de respuesta
• **Registro de comunicaciones**: Documentación de interacciones
• **Resolución de incidencias**: Protocolo de actuación

Adjunte el calendario de tutorías, guías de comunicación y plantillas de registro.`,
    files: []
  },
  {
    key: "gestion_administrativa",
    title: "7. Gestión y Administración",
    description: "Altas/bajas, formación de grupos, prácticas e incidencias",
    icon: <Settings className="h-5 w-5" />,
    content: `Procedimientos administrativos:

• **Altas y bajas**: Gestión de matriculaciones y abandonos
• **Formación de grupos**: Criterios de agrupamiento
• **Prácticas profesionales**: Organización y seguimiento (si aplica)
• **Gestión de incidencias**: Registro y resolución de problemas
• **Documentación final**: Actas, certificados y expedientes

Adjunte modelos de documentos administrativos, formularios y procedimientos.`,
    files: []
  }
];

const TeacherTutorGuide = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [sections, setSections] = useState<GuideSection[]>(defaultSections);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);

  const canManageFiles = userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher';

  const toggleSection = (key: string) => {
    setExpandedSections(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleFileUpload = async (sectionKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingSection(sectionKey);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${sectionKey}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('tutor-guides')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tutor-guides')
        .getPublicUrl(fileName);

      setSections(prev => prev.map(section => {
        if (section.key === sectionKey) {
          return {
            ...section,
            files: [...section.files, {
              name: file.name,
              url: publicUrl,
              uploadedAt: new Date().toISOString()
            }]
          };
        }
        return section;
      }));

      toast({
        title: "Archivo subido",
        description: `${file.name} se ha adjuntado correctamente`,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setUploadingSection(null);
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (sectionKey: string, fileUrl: string, fileName: string) => {
    try {
      const path = fileUrl.split('/tutor-guides/')[1];
      if (path) {
        await supabase.storage.from('tutor-guides').remove([path]);
      }

      setSections(prev => prev.map(section => {
        if (section.key === sectionKey) {
          return {
            ...section,
            files: section.files.filter(f => f.url !== fileUrl)
          };
        }
        return section;
      }));

      toast({
        title: "Archivo eliminado",
        description: `${fileName} se ha eliminado correctamente`,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guía del Tutor-Formador</h1>
          <p className="text-muted-foreground">
            Documento oficial aprobado por el SEPE con toda la información necesaria para la tutorización
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Guía del Tutor-Formador SEPE</CardTitle>
          </div>
          <CardDescription>
            Este documento contiene toda la información que necesitas para el desarrollo óptimo de los cursos que vas a impartir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.map((section) => (
            <Collapsible
              key={section.key}
              open={expandedSections.includes(section.key)}
              onOpenChange={() => toggleSection(section.key)}
            >
              <div className="border rounded-lg hover:border-primary/50 transition-colors">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-4 p-4">
                    <div className="p-2 rounded-md bg-primary/10 text-primary flex-shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-sm">{section.title}</h3>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {section.files.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {section.files.length}
                        </Badge>
                      )}
                      {expandedSections.includes(section.key) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t mx-4 pt-4">
                    <div className="text-sm text-muted-foreground">
                      {section.content.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('•') ? 'ml-4 mb-1' : 'mb-2'}>
                          {line.includes('**') ? (
                            <span dangerouslySetInnerHTML={{ 
                              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') 
                            }} />
                          ) : line}
                        </p>
                      ))}
                    </div>

                    {/* Archivos adjuntos */}
                    {section.files.length > 0 && (
                      <div className="space-y-2 border-t pt-4">
                        <p className="text-xs font-medium text-muted-foreground">Archivos adjuntos:</p>
                        <div className="grid gap-2">
                          {section.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  asChild
                                >
                                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                                {canManageFiles && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteFile(section.key, file.url, file.name)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón de subir archivo */}
                    {canManageFiles && (
                      <div className={section.files.length > 0 ? "" : "border-t pt-4"}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            onChange={(e) => handleFileUpload(section.key, e)}
                            disabled={uploadingSection === section.key}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploadingSection === section.key}
                            asChild
                          >
                            <span>
                              {uploadingSection === section.key ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Subiendo...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Adjuntar archivo PDF
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Documentación Complementaria</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            La Guía del Tutor-Formador es un documento oficial que contiene toda la información 
            necesaria para el desarrollo óptimo de cada curso que impartes.
          </p>
          <p>
            Cada sección puede contener documentos PDF adjuntos con información detallada, 
            plantillas, formularios y recursos necesarios para la tutorización.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTutorGuide;