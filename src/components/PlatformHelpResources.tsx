import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  ExternalLink,
  Phone,
  Mail,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CenterContactInfo {
  phone?: string;
  email?: string;
}

interface PlatformHelpResourcesProps {
  centerSlug?: string;
  centerContact?: CenterContactInfo | null;
}

const faqs = [
  {
    question: "¿Cómo accedo al contenido del curso?",
    answer: "Desde el menú lateral, selecciona 'Mis Cursos' y haz clic en el curso deseado. Dentro del curso, encontrarás los módulos organizados por orden. Haz clic en cada módulo para desplegar las Unidades Formativas y acceder al contenido interactivo."
  },
  {
    question: "¿Dónde puedo ver mi progreso?",
    answer: "Tu progreso se muestra en la barra de progreso de cada módulo y unidad formativa. También puedes consultar la sección 'Calificaciones' en el menú del curso para ver un resumen completo de tus evaluaciones y actividades."
  },
  {
    question: "¿Cómo contacto con mi tutor?",
    answer: "Tienes varias opciones: 1) Usa el botón de WhatsApp que aparece en la pantalla para dudas rápidas. 2) Envía un mensaje desde la sección 'Mensajería' del curso. 3) Participa en el foro del módulo correspondiente."
  },
  {
    question: "¿Cómo envío una actividad?",
    answer: "Dentro de cada Unidad Formativa encontrarás la sección 'Actividades'. Haz clic en la actividad correspondiente, lee las instrucciones, adjunta tu archivo o escribe tu respuesta, y pulsa 'Enviar'. Recibirás una notificación cuando el tutor la califique."
  },
  {
    question: "¿Qué hago si tengo problemas técnicos?",
    answer: "Contacta con el Centro de Atención al Usuario (CAU) llamando al teléfono de soporte o enviando un correo electrónico. El horario de atención es de 09:00 a 14:00 horas de lunes a viernes."
  },
  {
    question: "¿Cómo se registra mi tiempo de estudio?",
    answer: "El sistema registra automáticamente el tiempo que pasas conectado y visualizando contenidos. Puedes consultar tu tiempo invertido en la sección 'Tiempos Invertidos' del menú del curso."
  },
  {
    question: "¿Cuántos intentos tengo en los tests?",
    answer: "Por defecto, dispones de 3 intentos para cada test de evaluación. El sistema guardará tu mejor puntuación. Consulta los detalles específicos de cada evaluación en la información del test."
  },
  {
    question: "¿Puedo descargar los materiales del curso?",
    answer: "Sí, desde la sección 'Descargas' del temario interactivo puedes descargar los manuales en PDF. También están disponibles en la sección de recursos de cada unidad formativa."
  }
];

export const PlatformHelpResources: React.FC<PlatformHelpResourcesProps> = ({ centerSlug, centerContact }) => {
  const contactPhone = centerContact?.phone || "";
  const contactEmail = centerContact?.email || "";
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Centro de Ayuda</h3>
            <p className="text-sm text-muted-foreground">Recursos y guías para usar la plataforma</p>
          </div>
        </div>
      </div>

      {/* Quick Resources Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm">Guía del Campus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Manual completo de navegación y uso de la plataforma
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open(centerSlug ? `/campus-guide?center=${centerSlug}` : '/campus-guide', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Ver Guía
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-sm">Video Tutorial</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Demostración en video del funcionamiento del campus
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              <Video className="h-3 w-3 mr-2" />
              Próximamente
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-sm">Soporte Técnico</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Ayuda para problemas técnicos y acceso
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open('/support', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Ir a Soporte
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Preguntas Frecuentes (FAQs)</CardTitle>
          </div>
          <CardDescription>Respuestas a las dudas más comunes sobre el uso de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">{index + 1}</Badge>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pl-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Centro de Atención al Usuario (CAU)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {contactPhone ? (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{contactPhone}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono no especificado</span>
                </div>
              )}
              {contactEmail ? (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contactEmail}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email no especificado</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Lunes a Viernes: 09:00 - 14:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Respuesta en 24-48h laborables</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
