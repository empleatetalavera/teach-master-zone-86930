import { BookOpen, Users, FileText, MessageSquare, Calendar, Award, Clock, Monitor, CheckCircle2, HelpCircle, Phone, Mail, GraduationCap, Target, ShieldCheck, HeadphonesIcon, Settings } from "lucide-react";
import { useCenterBranding } from "@/hooks/useCenterBranding";

interface CourseStudentGuideProps {
  course: {
    title: string;
    description?: string;
    duration_hours?: number;
    objectives?: string;
    specific_objectives?: string[];
    training_center_id?: string;
    support_email?: string;
    support_phone?: string;
  };
  centerSlug?: string | null;
}

export function CourseStudentGuide({ course, centerSlug }: CourseStudentGuideProps) {
  const { branding } = useCenterBranding(centerSlug);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="flex justify-center gap-4 mb-4 items-center">
          {branding.centerLogo && (
            <img src={branding.centerLogo} alt={branding.centerName} className="h-12 object-contain" />
          )}
          <img src="/branding/sepe-logo.png" alt="SEPE" className="h-10 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">
          GUÍA DEL ALUMNO
        </h1>
        <p className="text-lg text-muted-foreground">
          {course.title}
        </p>
        <p className="text-sm mt-2" style={{ color: branding.secondaryColor }}>
          {branding.centerName}
        </p>
      </div>

      {/* Section 1: Introduction */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">1. Introducción</h2>
        </div>
        
        <div className="space-y-4 text-justify">
          <p>
            Bienvenido/a a la acción formativa. Esta guía está diseñada para orientarte en el uso del 
            campus virtual y facilitar tu proceso de aprendizaje durante el curso.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-semibold text-blue-800 mb-2">¿Qué encontrarás en esta guía?</h4>
            <ul className="space-y-2 text-blue-900 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Instrucciones para navegar por el campus virtual</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Información sobre la estructura del curso</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Guía de evaluación y calificación</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Canales de comunicación y soporte</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Technical Requirements */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Monitor className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">2. Requisitos Técnicos</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Hardware
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Procesador: 2 GHz o superior
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Memoria RAM: 4 GB mínimo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Resolución: 1024x768 o superior
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Webcam y micrófono (para tutorías)
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Software
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Chrome, Firefox, Edge o Safari
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                JavaScript habilitado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Lector de PDF
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Conexión: mínimo 2 Mbps
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Platform Navigation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">3. Navegación por el Campus</h2>
        </div>
        
        <div className="space-y-3">
          {[
            { icon: BookOpen, title: "Inicio", desc: "Vista general del curso con tu progreso actual" },
            { icon: FileText, title: "Módulos", desc: "Contenidos formativos organizados por unidades" },
            { icon: Target, title: "Calificaciones", desc: "Consulta tus notas y evaluaciones" },
            { icon: FileText, title: "Exámenes", desc: "Acceso a las pruebas de evaluación" },
            { icon: Calendar, title: "Tutorías", desc: "Sesiones de tutoría programadas" },
            { icon: Calendar, title: "Calendario", desc: "Fechas importantes y plazos" },
            { icon: MessageSquare, title: "Foro", desc: "Comunicación con compañeros y tutores" },
            { icon: Clock, title: "Tiempos", desc: "Registro de tiempo invertido" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Course Structure */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">4. Estructura del Curso</h2>
        </div>
        
        <div className="border-2 border-primary rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-center text-primary text-sm">Organización por Módulos</h4>
          <div className="space-y-2">
            {[
              { num: "1", text: "Objetivos del módulo" },
              { num: "2", text: "Contenido teórico (texto, vídeos, presentaciones)" },
              { num: "3", text: "Ejercicios de autoevaluación" },
              { num: "4", text: "Actividades de desarrollo" },
              { num: "5", text: "Evaluación del módulo" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-primary/5 rounded text-sm">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{item.num}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Evaluation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">5. Sistema de Evaluación</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Tests de Autoevaluación</h4>
            <p className="text-sm text-green-900">
              Cuestionarios para comprobar tu aprendizaje. Son orientativos y puedes realizarlos varias veces.
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Actividades de Desarrollo</h4>
            <p className="text-sm text-blue-900">
              Tareas prácticas que debes entregar al tutor para su corrección y feedback.
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">Evaluaciones Finales</h4>
            <p className="text-sm text-amber-900">
              Exámenes oficiales para obtener la calificación del módulo. Nota mínima: 50%.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Communication */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">6. Comunicación con el Tutor</h2>
        </div>
        
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Canales disponibles:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Mensajería interna del campus
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Tutorías programadas (individuales o grupales)
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Foros de debate del curso
              </li>
              {course.support_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {course.support_email}
                </li>
              )}
              {course.support_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {course.support_phone}
                </li>
              )}
            </ul>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-semibold text-blue-800 mb-1">Tiempo de respuesta</h4>
            <p className="text-sm text-blue-900">
              El tutor responderá a tus consultas en un plazo máximo de 48 horas hábiles.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Technical Support */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HeadphonesIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">7. Soporte Técnico</h2>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <p className="text-sm">
            Si experimentas problemas técnicos con la plataforma, contacta con soporte:
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span>soporte@{branding.centerName?.toLowerCase().replace(/\s+/g, '') || 'campus'}.es</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span>900 XXX XXX (Horario: L-V 9:00-18:00)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-6 border-t text-sm text-muted-foreground">
        <p>Documento conforme a los requisitos del</p>
        <p className="font-semibold">Servicio Público de Empleo Estatal (SEPE)</p>
        <p className="mt-2">Versión 1.0 - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
