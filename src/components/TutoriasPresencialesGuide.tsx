import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
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
  Wrench
} from "lucide-react";
import { useState } from "react";

interface TutoriasPresencialesGuideProps {
  userRole: string;
}

const TutoriasPresencialesGuide = ({ userRole }: TutoriasPresencialesGuideProps) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  
  const isTeacher = userRole === 'teacher';
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
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

  const tools = [
    {
      icon: ClipboardList,
      title: "Lista de asistencia de alumnos",
      description: "Podrás obtener información de los alumnos en el Campus Virtual"
    },
    {
      icon: FileText,
      title: "Cuaderno del formador de las tutorías presenciales",
      description: "Incluye orientaciones e instrumentos de seguimiento y evaluación de alumnos"
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
              <div className="grid gap-3">
                {tools.map((tool, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 rounded-full bg-green-100">
                      <tool.icon className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tool.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                ))}
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
