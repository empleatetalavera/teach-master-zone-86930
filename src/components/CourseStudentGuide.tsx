import { 
  BookOpen, Users, FileText, MessageSquare, Calendar, Award, Clock, Monitor, 
  CheckCircle2, HelpCircle, Phone, Mail, GraduationCap, Target, ShieldCheck, 
  HeadphonesIcon, Settings, Play, ChevronDown, ChevronUp, AlertCircle, 
  Download, Video, Headphones, Building2, Briefcase, Globe, ListChecks,
  UserCheck, ClipboardList, Lightbulb, Folder, Timer
} from "lucide-react";
import { useCenterBranding } from "@/hooks/useCenterBranding";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    presentacion: true,
    aspectos: false,
    campus: false,
    metodologia: false,
    tutorias: false,
    evaluacion: false,
    titulacion: false,
    cau: false,
    atencion: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({ id, icon: Icon, number, title }: { id: string; icon: any; number: string; title: string }) => (
    <CollapsibleTrigger 
      onClick={() => toggleSection(id)}
      className="flex items-center gap-3 w-full p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg hover:from-primary/15 hover:to-primary/10 transition-all cursor-pointer group"
    >
      <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
        {number}
      </span>
      <h2 className="text-lg font-bold flex-1 text-left">{title}</h2>
      {openSections[id] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </CollapsibleTrigger>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center pb-6 border-b bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-xl">
        <div className="flex justify-center gap-6 mb-4 items-center">
          {branding.centerLogo && (
            <img src={branding.centerLogo} alt={branding.centerName} className="h-14 object-contain" />
          )}
          <img src="/branding/sepe-logo.png" alt="SEPE" className="h-12 object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          GUÍA DEL ALUMNO
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          {course.title}
        </p>
        <p className="text-sm mt-2" style={{ color: branding.secondaryColor }}>
          {branding.centerName}
        </p>
        {course.duration_hours && (
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{course.duration_hours} horas</span>
          </div>
        )}
      </div>

      {/* Section 1: Presentación */}
      <Collapsible open={openSections.presentacion}>
        <SectionHeader id="presentacion" icon={BookOpen} number="1" title="PRESENTACIÓN" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
              <p className="text-gray-800 leading-relaxed">
                Estimado/a alumno/a, antes de nada queremos darte la <strong>bienvenida</strong> a tu curso.
              </p>
              <p className="text-gray-800 leading-relaxed mt-3">
                A lo largo del curso vamos a acompañarte en tu proceso formativo de una manera cercana y 
                ofreciéndote todo nuestro apoyo para que puedas sacar el máximo provecho de la formación.
              </p>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              Se trata de un <strong>trabajo en equipo</strong>, entre todos los que formamos parte de nuestro Centro 
              (alumnos, tutores, orientadores, dirección,…), donde tu interés y motivación es vital para que 
              podamos alcanzar juntos los objetivos planteados.
            </p>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-900 text-sm">
                Vamos a estar en continuo contacto para comprobar tus progresos, resolver tus dudas y orientarte 
                en todos los aspectos que necesites.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ¿Qué encontrarás en esta guía?
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Información general del certificado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cómo navegar por el campus virtual</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Metodología de estudio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Sistema de evaluación</span>
                  </li>
                </ul>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tu equipo de apoyo
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Tutor/a formador/a</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Orientador/a académico/a</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Soporte técnico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Coordinación del curso</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 2: Aspectos Generales */}
      <Collapsible open={openSections.aspectos}>
        <SectionHeader id="aspectos" icon={GraduationCap} number="2" title="ASPECTOS GENERALES DEL CERTIFICADO" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            {/* 2.1 Identificación */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.1</span> Identificación
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-gray-50 w-1/3">DENOMINACIÓN:</td>
                      <td className="p-3">{course.title}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-gray-50">CÓDIGO:</td>
                      <td className="p-3">Según BOE</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-gray-50">FAMILIA PROFESIONAL:</td>
                      <td className="p-3">Administración y Gestión</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold bg-gray-50">NIVEL DE CUALIFICACIÓN:</td>
                      <td className="p-3">1-3</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold bg-gray-50">DURACIÓN:</td>
                      <td className="p-3">{course.duration_hours || 'N/D'} horas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2.2 Itinerario Formativo */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.2</span> Itinerario Formativo
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                El curso se compone de los siguientes módulos y unidades formativas:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Estructura modular</span>
                </div>
                <p className="text-sm text-blue-900">
                  Consulta el contenido del curso para ver el detalle de módulos formativos, 
                  unidades formativas y horas de cada uno.
                </p>
              </div>
            </div>

            {/* 2.3 Objetivos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.3</span> Objetivos Generales
              </h3>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  {course.objectives || 
                    "Con este curso aprenderás a desarrollar las competencias profesionales necesarias para el desempeño de las funciones propias de la ocupación relacionada con el certificado de profesionalidad."}
                </p>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Nota:</strong> En el Campus Virtual, en el apartado INTRODUCCIÓN de cada unidad formativa 
                  dispones del documento "Objetivos y contenidos" donde se detallan los objetivos específicos.
                </p>
              </div>
            </div>

            {/* 2.4 Prácticas */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.4</span> Módulo de Prácticas
              </h3>
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Formación Práctica en Centros de Trabajo</h4>
                    <ul className="text-sm text-amber-900 space-y-1">
                      <li>• Se realiza una vez superado el resto de módulos formativos</li>
                      <li>• Puede comenzar hasta 4 meses después de finalizar la formación</li>
                      <li>• Si dispones de experiencia laboral, puedes solicitar la exención</li>
                      <li>• Es necesario para obtener el certificado de profesionalidad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.5 Requisitos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.5</span> Requisitos de Acceso
              </h3>
              <div className="border rounded-lg p-4">
                <p className="text-sm mb-3">Para acceder a certificados de profesionalidad de nivel 2-3, deberás cumplir alguno de los siguientes requisitos:</p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Título de Bachiller o equivalente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Título de Técnico/Técnico Superior</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Certificado de profesionalidad del mismo nivel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Prueba de acceso a ciclos de grado medio/superior</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Competencias clave del nivel correspondiente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Prueba de acceso a universidad mayores 25 años</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                <p className="text-xs text-blue-900">
                  <strong>Modalidad teleformación:</strong> Para el desarrollo del curso en modalidad teleformación 
                  debes haber superado la prueba de competencia tecnológica.
                </p>
              </div>
            </div>

            {/* 2.6 Salidas Laborales */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">2.6</span> Salidas Laborales
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Ámbito Profesional
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Empresas públicas y privadas del sector correspondiente a la familia profesional.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Ocupaciones
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Consulta la ficha del certificado para ver las ocupaciones y puestos de trabajo relevantes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 3: Campus Virtual */}
      <Collapsible open={openSections.campus}>
        <SectionHeader id="campus" icon={Monitor} number="3" title="EL CAMPUS VIRTUAL" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            {/* 3.1 Requisitos Técnicos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.1</span> Requisitos Técnicos del Equipo
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-gray-50">
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
                      Memoria RAM: 4 GB mínimo (8 GB recomendado)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Resolución: 1024x768 o superior
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Tarjeta de sonido y altavoces
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Webcam y micrófono (para tutorías virtuales)
                    </li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Software y Conexión
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Chrome, Firefox, Edge o Safari (actualizado)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      JavaScript y cookies habilitados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Lector de documentos PDF
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Conexión a Internet: mínimo 2 Mbps
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Cliente de correo electrónico
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3.2 Funcionamiento y Recursos */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.2</span> Funcionamiento, Recursos y Utilidades
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                El campus virtual está organizado en tres áreas principales:
              </p>

              <div className="space-y-4">
                {/* Área A: Organizarme */}
                <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-100 p-3">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      A) ORGANIZARME
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Zona izquierda de la pantalla - Planificación del curso
                    </p>
                  </div>
                  <div className="p-4 grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Cómo hacer mi curso</strong>
                        <p className="text-xs text-muted-foreground">Guía del alumno y guía de navegación</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Mi agenda</strong>
                        <p className="text-xs text-muted-foreground">Planificación y eventos del curso</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Mensajes pendientes</strong>
                        <p className="text-xs text-muted-foreground">Correos y foros sin leer</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Mis progresos</strong>
                        <p className="text-xs text-muted-foreground">Avances, conexiones y calificaciones</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Área B: Comunicarme */}
                <div className="border-2 border-green-200 rounded-lg overflow-hidden">
                  <div className="bg-green-100 p-3">
                    <h4 className="font-bold text-green-800 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      B) COMUNICARME
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      Zona derecha de la pantalla - Herramientas de comunicación
                    </p>
                  </div>
                  <div className="p-4 grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <strong>Mi perfil</strong>
                        <p className="text-xs text-muted-foreground">Datos personales y redes sociales</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Users className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <strong>Mis contactos</strong>
                        <p className="text-xs text-muted-foreground">Compañeros y tutores del curso</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <strong>Correo interno</strong>
                        <p className="text-xs text-muted-foreground">Comunicación con tutores</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <strong>Chat / Contacta en directo</strong>
                        <p className="text-xs text-muted-foreground">Tutorías virtuales en tiempo real</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Área C: Recursos */}
                <div className="border-2 border-amber-200 rounded-lg overflow-hidden">
                  <div className="bg-amber-100 p-3">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      C) RECURSOS
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Parte central de la pantalla - Material formativo
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-2 bg-amber-50 rounded text-sm">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <strong>INTRODUCCIÓN</strong>
                          <span className="text-muted-foreground ml-2">Vídeo presentación, objetivos, cuestionario previo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-amber-50 rounded text-sm">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <strong>FORMACIÓN EN CAMPUS</strong>
                          <span className="text-muted-foreground ml-2">Contenidos, actividades, material complementario</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-amber-50 rounded text-sm">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <strong>TUTORÍAS PRESENCIALES</strong>
                          <span className="text-muted-foreground ml-2">Sesiones presenciales en centro</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-amber-50 rounded text-sm">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <strong>EVALUACIÓN</strong>
                          <span className="text-muted-foreground ml-2">Test final y prueba presencial</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3.3 Ayuda */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">3.3</span> Ayuda y Preguntas Frecuentes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm mb-2">
                    Antes de comenzar a usar el Campus es recomendable que visualices los vídeos disponibles 
                    en el <strong>Centro de Atención al Usuario (CAU)</strong> que te mostrarán cómo puedes 
                    utilizar el Campus y aprovechar todas sus funcionalidades.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    También dispones de un apartado de preguntas frecuentes (FAQ's) para resolver dudas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 4: Metodología de Estudio */}
      <Collapsible open={openSections.metodologia}>
        <SectionHeader id="metodologia" icon={Target} number="4" title="METODOLOGÍA DE ESTUDIO" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-900 text-sm">
                En este apartado te facilitamos las orientaciones y explicaciones necesarias para que sepas 
                cómo debes realizar el curso y las posibilidades que te ofrece el Campus Virtual para el estudio.
              </p>
            </div>

            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-primary">4.1</span> Tareas y Actividades
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              Para conocer qué contenidos debes estudiar o qué actividades debes realizar en cada momento, 
              acude a tu <strong>PLAN DE TRABAJO</strong> o al icono <strong>MI AGENDA</strong> del Campus Virtual.
            </p>

            {/* Pasos del proceso formativo */}
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">A</span>
                  Introducción al Módulo/Unidad Formativa
                </h4>
                <ul className="text-sm space-y-1 ml-8">
                  <li>• Ve el vídeo de presentación</li>
                  <li>• Descarga los objetivos y contenidos</li>
                  <li>• Acude a la videoconferencia de presentación</li>
                  <li>• Realiza el cuestionario de conocimientos previos</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">B</span>
                  Desarrolla la Formación en Campus Virtual
                </h4>
                <div className="ml-8 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Play className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Contenido Interactivo Multimedia (CIM)</strong>
                      <p className="text-xs text-muted-foreground">Estudia los contenidos multimedia de forma secuencial</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Material Complementario</strong>
                      <p className="text-xs text-muted-foreground">Documentos de apoyo, vídeos y audios para ampliar información</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Actividades de Aprendizaje</strong>
                      <p className="text-xs text-muted-foreground">Casos prácticos y ejercicios para entregar al tutor</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Foros de Debate</strong>
                      <p className="text-xs text-muted-foreground">Participa en las discusiones propuestas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Test de Autoevaluación</strong>
                      <p className="text-xs text-muted-foreground">Comprueba tu nivel de asimilación de contenidos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">C</span>
                  Formación en el Centro (si aplica)
                </h4>
                <p className="text-sm ml-8">
                  Acude a las sesiones presenciales donde se trabajarán los conocimientos adquiridos 
                  en la plataforma con actividades prácticas.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">D</span>
                  Participa en las Tutorías Virtuales
                </h4>
                <p className="text-sm ml-8">
                  Asiste a las tutorías de repaso al finalizar cada Unidad o Módulo Formativo 
                  donde podrás plantear dudas al tutor.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">E</span>
                  Realiza las Pruebas de Evaluación
                </h4>
                <p className="text-sm ml-8">
                  Una vez estudiados todos los contenidos y realizadas las actividades, 
                  realiza las pruebas de evaluación del módulo o unidad formativa.
                </p>
              </div>
            </div>

            {/* Tiempo de dedicación */}
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">4.2</span> Tiempo de Dedicación
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <Timer className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-900">
                    Debes planificar tu tiempo de estudio de acuerdo a las horas establecidas para cada 
                    módulo/unidad formativa. Recuerda que el tiempo de conexión queda registrado para 
                    cumplir con los requisitos de seguimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 5: Sistema de Tutorías */}
      <Collapsible open={openSections.tutorias}>
        <SectionHeader id="tutorias" icon={Users} number="5" title="SISTEMA DE TUTORÍAS" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            <p className="text-sm text-muted-foreground">
              Durante el desarrollo del curso contarás con el apoyo de un tutor/a-formador/a que te 
              acompañará en tu proceso de aprendizaje.
            </p>

            {/* 5.1 Tutorías Virtuales */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">5.1</span> Tutorías Virtuales
              </h3>
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-900 mb-2">
                      Se realizan a través de <strong>chat o videoconferencia</strong>. 
                      Al menos, tendrás una tutoría virtual de repaso al finalizar cada Unidad o Módulo Formativo.
                    </p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Consulta las fechas en MI AGENDA o en el PLAN DE TRABAJO</li>
                      <li>• Podrás plantear tus dudas al tutor/a-formador/a</li>
                      <li>• También puedes solicitar tutorías individuales por correo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 5.2 Tutorías Presenciales */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">5.2</span> Tutorías Presenciales
              </h3>
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-green-900 mb-2">
                      Sesiones presenciales en el Centro de Formación donde se desarrollarán 
                      actividades prácticas y/o pruebas de evaluación.
                    </p>
                    <ul className="text-green-800 space-y-1">
                      <li>• La asistencia puede ser obligatoria según el módulo</li>
                      <li>• Consulta la ubicación y horarios en tu documentación</li>
                      <li>• El tutor/a te informará previamente de las actividades</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Canales de contacto */}
            <div className="mt-4">
              <h4 className="font-semibold mb-3">Canales de comunicación con el tutor:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Correo interno del campus</span>
                </div>
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>Foros de consulta/dudas</span>
                </div>
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <Video className="h-4 w-4 text-primary" />
                  <span>Videoconferencia / Chat</span>
                </div>
                <div className="flex items-center gap-2 text-sm border rounded-lg p-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Teléfono (si disponible)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-1">Tiempo de respuesta</h4>
              <p className="text-sm text-blue-900">
                El tutor/a responderá a tus consultas en un plazo máximo de <strong>48 horas hábiles</strong>.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 6: Sistema de Evaluación */}
      <Collapsible open={openSections.evaluacion}>
        <SectionHeader id="evaluacion" icon={Award} number="6" title="SISTEMA DE EVALUACIÓN" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-6">
            {/* 6.1 Actividades y Pruebas */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">6.1</span> Actividades y Pruebas Evaluables
              </h3>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Tests de Autoevaluación
                  </h4>
                  <p className="text-sm text-green-900">
                    Cuestionarios para comprobar el grado de asimilación de los contenidos. 
                    Son orientativos y puedes realizarlos varias veces.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Actividades de Aprendizaje
                  </h4>
                  <p className="text-sm text-blue-900 mb-2">
                    Casos prácticos, ejercicios y tareas que debes entregar al tutor para su corrección. 
                    Recibirás feedback y puntuación (1-10).
                  </p>
                  <div className="bg-blue-100 rounded p-2 text-xs text-blue-800">
                    <strong>Importante:</strong> La entrega fuera de plazo puede penalizar tu nota.
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Test Final en Campus (CIM)
                  </h4>
                  <p className="text-sm text-amber-900">
                    Evaluación final en el Campus Virtual. Dispondrás de <strong>un solo intento</strong> 
                    y podrás conocer los resultados una vez finalizado.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Prueba de Evaluación Final Presencial
                  </h4>
                  <p className="text-sm text-red-900 mb-2">
                    Examen presencial en el Centro de Formación que incluye:
                  </p>
                  <ul className="text-sm text-red-800 ml-4 space-y-1">
                    <li>• Prueba de conocimientos (tipo test, respuestas cortas)</li>
                    <li>• Prueba de destrezas cognitivas y habilidades prácticas</li>
                    <li>• Evaluación de actitudes y comportamientos</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-gray-100 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  RECUERDA
                </h4>
                <p className="text-sm">
                  Para poder presentarte a la prueba de evaluación final debes haber realizado 
                  el <strong>100% de las actividades de aprendizaje</strong> establecidas en el Campus Virtual, 
                  así como haber participado en los foros programados.
                </p>
              </div>
            </div>

            {/* 6.2 Fecha y lugar */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-primary">6.2</span> Fecha y Lugar de la Prueba Final
              </h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm mb-2">
                  Consulta en el <strong>PLAN DE TRABAJO</strong> y en <strong>MI AGENDA</strong> 
                  las fechas de las pruebas de evaluación y la dirección del centro de formación.
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>• <strong>1ª Convocatoria:</strong> Al finalizar el módulo/unidad formativa</p>
                  <p>• <strong>2ª Convocatoria:</strong> Fecha alternativa si no superas la primera</p>
                </div>
              </div>
            </div>

            {/* Criterios de calificación */}
            <div className="border-2 border-primary rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3 text-center">
                Criterios de Calificación
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Componente</th>
                      <th className="text-center p-2">Peso</th>
                      <th className="text-center p-2">Nota mínima</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Formación en Campus</td>
                      <td className="text-center p-2">Variable</td>
                      <td className="text-center p-2">50%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Tutorías Presenciales</td>
                      <td className="text-center p-2">Variable</td>
                      <td className="text-center p-2">Asistencia</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Prueba Final Presencial</td>
                      <td className="text-center p-2">-</td>
                      <td className="text-center p-2 font-semibold">50%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 7: Titulación */}
      <Collapsible open={openSections.titulacion}>
        <SectionHeader id="titulacion" icon={GraduationCap} number="7" title="TITULACIÓN OBTENIDA" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-800 mb-2">Certificado de Profesionalidad</h4>
                  <p className="text-sm text-green-900 mb-3">
                    Al superar con éxito todos los módulos formativos (incluyendo el módulo de prácticas), 
                    podrás solicitar el <strong>Certificado de Profesionalidad</strong> correspondiente 
                    ante la Administración competente.
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Titulación oficial con validez en todo el territorio nacional
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Acredita competencias profesionales del Catálogo Nacional
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Expedido por el SEPE o la Comunidad Autónoma
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Diploma del curso:</strong> Al finalizar el curso también recibirás un diploma 
                acreditativo expedido por el centro de formación.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 8: CAU */}
      <Collapsible open={openSections.cau}>
        <SectionHeader id="cau" icon={HeadphonesIcon} number="8" title="CAU: CENTRO DE ATENCIÓN DE USUARIOS" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <p className="text-sm">
              Si experimentas <strong>problemas técnicos</strong> con la plataforma o el acceso al campus, 
              contacta con el Centro de Atención de Usuarios:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  Visita Virtual y FAQ
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Antes de plantear tu consulta, consulta los vídeos tutoriales y las preguntas frecuentes.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    Vídeos tutoriales de navegación
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Preguntas frecuentes (FAQ's)
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <HeadphonesIcon className="h-5 w-5" />
                  Contacto Soporte Técnico
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>soporte@campus.es</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>900 XXX XXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>L-V: 9:00 - 18:00h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-sm text-amber-900">
                <strong>Nota:</strong> Para dudas relacionadas con el <em>contenido del curso</em>, 
                contacta con tu tutor/a-formador/a a través de la mensajería del campus.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 9: Servicio de Atención al Cliente */}
      <Collapsible open={openSections.atencion}>
        <SectionHeader id="atencion" icon={Phone} number="9" title="SERVICIO DE ATENCIÓN AL CLIENTE" />
        <CollapsibleContent>
          <div className="p-6 border border-t-0 rounded-b-lg space-y-4">
            <p className="text-sm">
              Para consultas administrativas, certificaciones, o cualquier otra gestión no relacionada 
              con el contenido o la plataforma:
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-5">
              <h4 className="font-semibold mb-3">{branding.centerName}</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {course.support_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{course.support_email}</span>
                  </div>
                )}
                {course.support_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{course.support_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Horario de atención: L-V 9:00-18:00</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Footer */}
      <div className="text-center pt-6 border-t bg-gradient-to-br from-gray-50 to-transparent p-6 rounded-xl">
        <div className="flex justify-center gap-4 mb-3">
          {branding.centerLogo && (
            <img src={branding.centerLogo} alt={branding.centerName} className="h-10 object-contain opacity-70" />
          )}
          <img src="/branding/sepe-logo.png" alt="SEPE" className="h-8 object-contain opacity-70" />
        </div>
        <p className="text-sm text-muted-foreground">Documento conforme a los requisitos del</p>
        <p className="font-semibold text-primary">Servicio Público de Empleo Estatal (SEPE)</p>
        <p className="text-xs text-muted-foreground mt-2">
          Versión 1.0 - {new Date().getFullYear()} | {branding.centerName}
        </p>
      </div>
    </div>
  );
}
