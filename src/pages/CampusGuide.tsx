import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, BookOpen, Users, FileText, MessageSquare, Calendar, Award, Clock, Monitor, CheckCircle2, HelpCircle, Phone, Mail, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCenterBranding } from "@/hooks/useCenterBranding";

export default function CampusGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const centerSlug = searchParams.get("center");
  const { branding, loading } = useCenterBranding(centerSlug);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print-hidden header */}
      <div className="print:hidden sticky top-0 z-50 bg-background border-b p-4">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div className="container max-w-4xl mx-auto py-8 px-6 print:py-0 print:px-0">
        {/* Cover Page */}
        <div className="text-center mb-16 print:mb-8 print:page-break-after-always">
          <div className="flex justify-center gap-6 mb-8 items-center">
            {branding.centerLogo && (
              <img src={branding.centerLogo} alt={branding.centerName} className="h-20 object-contain" />
            )}
            <img src="/branding/sepe-gobierno-logo.png" alt="Gobierno de España" className="h-16 object-contain" />
            <img src="/branding/sepe-logo.png" alt="SEPE" className="h-16 object-contain" />
          </div>
          
          <div 
            className="border-4 p-12 my-12 print:my-8"
            style={{ borderColor: branding.primaryColor }}
          >
            <h1 
              className="text-4xl font-bold mb-4 print:text-3xl"
              style={{ color: branding.primaryColor }}
            >
              GUÍA DEL CAMPUS VIRTUAL
            </h1>
            <h2 className="text-2xl text-muted-foreground mb-6 print:text-xl">
              Manual de Usuario para el Alumno
            </h2>
            <p className="text-xl font-semibold" style={{ color: branding.secondaryColor }}>
              {branding.centerName}
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              Formación Profesional para el Empleo
            </p>
          </div>

          {branding.officialBadge && (
            <div className="mt-6 inline-block px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {branding.officialBadge}
            </div>
          )}

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Documento conforme a los requisitos del</p>
            <p className="font-semibold">Servicio Público de Empleo Estatal (SEPE)</p>
            <p className="mt-4">Versión 1.0 - {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 print:mb-8 print:page-break-after-always">
          <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-6">
            ÍNDICE DE CONTENIDOS
          </h2>
          <div className="space-y-3">
            {[
              { num: "1", title: "Introducción al Campus Virtual", page: "3" },
              { num: "2", title: "Requisitos Técnicos", page: "4" },
              { num: "3", title: "Acceso a la Plataforma", page: "5" },
              { num: "4", title: "Navegación Principal", page: "6" },
              { num: "5", title: "Estructura del Curso", page: "7" },
              { num: "6", title: "Contenidos Formativos", page: "8" },
              { num: "7", title: "Evaluaciones y Exámenes", page: "9" },
              { num: "8", title: "Actividades de Desarrollo", page: "10" },
              { num: "9", title: "Comunicación con el Tutor", page: "11" },
              { num: "10", title: "Control de Tiempos", page: "12" },
              { num: "11", title: "Foros y Participación", page: "13" },
              { num: "12", title: "Certificación", page: "14" },
              { num: "13", title: "Soporte Técnico", page: "15" },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-4">
                <span className="font-bold text-primary w-8">{item.num}.</span>
                <span className="flex-1 border-b border-dotted border-muted-foreground">{item.title}</span>
                <span className="text-muted-foreground">{item.page}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Introduction */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">1. Introducción al Campus Virtual</h2>
          </div>
          
          <div className="space-y-4 text-justify">
            <p>
              Bienvenido/a al Campus Virtual de formación. Esta plataforma de teleformación ha sido diseñada 
              siguiendo las especificaciones técnicas establecidas por el <strong>Servicio Público de Empleo 
              Estatal (SEPE)</strong> para garantizar una experiencia de aprendizaje de calidad.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <h4 className="font-semibold text-blue-800 mb-2">Objetivos de esta guía:</h4>
              <ul className="space-y-2 text-blue-900">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Facilitar el acceso y navegación por el campus virtual</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Explicar las funcionalidades disponibles para el alumno</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Describir el proceso de evaluación y certificación</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Proporcionar información sobre canales de comunicación y soporte</span>
                </li>
              </ul>
            </div>

            <p>
              El campus virtual permite realizar la acción formativa de manera flexible, adaptándose a su 
              disponibilidad horaria. Sin embargo, es importante cumplir con los plazos establecidos y 
              dedicar el tiempo necesario para alcanzar los objetivos formativos.
            </p>
          </div>
        </section>

        {/* Section 2: Technical Requirements */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">2. Requisitos Técnicos</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Para acceder correctamente al campus virtual y visualizar todos los contenidos formativos, 
              su equipo debe cumplir los siguientes requisitos mínimos:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-primary">Hardware</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Procesador: 2 GHz o superior</li>
                  <li>• Memoria RAM: 4 GB mínimo</li>
                  <li>• Resolución de pantalla: 1024x768 o superior</li>
                  <li>• Altavoces o auriculares</li>
                  <li>• Micrófono y webcam (para tutorías)</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-primary">Software</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Navegador: Chrome, Firefox, Edge o Safari (última versión)</li>
                  <li>• JavaScript y cookies habilitados</li>
                  <li>• Lector de PDF (Adobe Reader o similar)</li>
                  <li>• Reproductor multimedia</li>
                </ul>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
              <h4 className="font-semibold mb-2 text-amber-800">Conexión a Internet</h4>
              <p className="text-sm text-amber-900">
                Se requiere una conexión estable a Internet con velocidad mínima de <strong>2 Mbps</strong> 
                para la visualización de contenidos multimedia. Para las sesiones de tutoría online se 
                recomienda una velocidad de <strong>5 Mbps</strong> o superior.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Platform Access */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">3. Acceso a la Plataforma</h2>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">3.1 Primer acceso</h3>
            <p className="text-justify">
              Al inscribirse en la acción formativa, recibirá un correo electrónico con sus credenciales 
              de acceso (usuario y contraseña). Si no lo recibe, revise la carpeta de spam o contacte 
              con soporte técnico.
            </p>

            <div className="bg-gray-100 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold">Pasos para acceder:</h4>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex-shrink-0">1</span>
                  <span>Acceda a la URL del campus virtual proporcionada por su centro de formación</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex-shrink-0">2</span>
                  <span>Introduzca su correo electrónico y contraseña en el formulario de acceso</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex-shrink-0">3</span>
                  <span>Haga clic en el botón "Iniciar Sesión"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex-shrink-0">4</span>
                  <span>Complete su perfil con los datos personales requeridos (obligatorio para SEPE)</span>
                </li>
              </ol>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Importante</h4>
              <p className="text-sm text-red-900">
                No comparta sus credenciales de acceso con terceros. El uso del campus es personal e 
                intransferible. El sistema registra la actividad de cada usuario para el control de 
                seguimiento formativo exigido por SEPE.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Main Navigation */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">4. Navegación Principal</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Una vez dentro del campus, encontrará un menú de navegación con las siguientes secciones:
            </p>

            <div className="space-y-4">
              {[
                { icon: BookOpen, title: "Inicio", desc: "Vista general del curso con acceso a todas las secciones y su progreso actual" },
                { icon: FileText, title: "Módulos", desc: "Contenidos formativos organizados por unidades didácticas" },
                { icon: FileText, title: "Calificaciones", desc: "Historial de notas en evaluaciones y actividades" },
                { icon: FileText, title: "Exámenes", desc: "Acceso a las pruebas de evaluación del curso" },
                { icon: Calendar, title: "Tutorías", desc: "Calendario de sesiones de tutoría y videollamadas programadas" },
                { icon: Calendar, title: "Calendario", desc: "Fechas importantes, eventos y plazos de entrega" },
                { icon: MessageSquare, title: "Foro", desc: "Espacio de debate y comunicación con compañeros y tutores" },
                { icon: Clock, title: "Tiempos", desc: "Registro detallado del tiempo invertido en la formación" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                  <item.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Course Structure */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">5. Estructura del Curso</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Cada curso está organizado en <strong>módulos formativos</strong> que contienen unidades 
              didácticas con contenidos teóricos, ejercicios prácticos y evaluaciones.
            </p>

            <div className="border-2 border-primary rounded-lg p-6">
              <h4 className="font-semibold mb-4 text-center text-primary">Estructura típica de un módulo</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span>
                  <span>Objetivos del módulo</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span>
                  <span>Contenido teórico (texto, vídeos, presentaciones)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</span>
                  <span>Ejercicios de autoevaluación</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">4</span>
                  <span>Actividades de desarrollo</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">5</span>
                  <span>Evaluación del módulo</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-800 mb-2">✓ Seguimiento del progreso</h4>
              <p className="text-sm text-green-900">
                El sistema registra automáticamente su avance. Podrá visualizar su progreso en la 
                barra de porcentaje que aparece en cada módulo y en el panel principal del curso.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Formative Contents */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">6. Contenidos Formativos</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Los contenidos formativos se presentan en diversos formatos para facilitar el aprendizaje:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">📄 Documentos PDF</h4>
                <p className="text-sm text-muted-foreground">
                  Material teórico descargable para estudio offline
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">🎬 Vídeos formativos</h4>
                <p className="text-sm text-muted-foreground">
                  Explicaciones audiovisuales de los conceptos clave
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">📊 Presentaciones</h4>
                <p className="text-sm text-muted-foreground">
                  Diapositivas interactivas con contenido resumido
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">🎮 Contenido SCORM</h4>
                <p className="text-sm text-muted-foreground">
                  Módulos interactivos con seguimiento detallado
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Recomendación</h4>
              <p className="text-sm text-blue-900">
                Se recomienda completar los contenidos en el orden establecido. Algunos módulos pueden 
                tener requisitos previos que impiden su acceso hasta completar los anteriores.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Evaluations */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">7. Evaluaciones y Exámenes</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              El sistema de evaluación está diseñado para verificar la adquisición de conocimientos 
              y competencias. Existen diferentes tipos de pruebas:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Autoevaluaciones</h4>
                <p className="text-sm text-muted-foreground">
                  Pruebas de repaso sin límite de intentos para reforzar el aprendizaje. 
                  No cuentan para la nota final.
                </p>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold">Evaluaciones de módulo</h4>
                <p className="text-sm text-muted-foreground">
                  Exámenes con tiempo limitado. Generalmente 3 intentos máximo. 
                  Se requiere aprobar para avanzar.
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">Evaluación final</h4>
                <p className="text-sm text-muted-foreground">
                  Examen global del curso. Necesario aprobar para obtener el certificado.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Criterios de evaluación SEPE:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Nota mínima para aprobar: <strong>50%</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Completar mínimo el <strong>75%</strong> de los contenidos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Cumplir el <strong>75%</strong> del tiempo mínimo establecido</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Participar en las actividades obligatorias</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8: Development Activities */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">8. Actividades de Desarrollo</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Las actividades de desarrollo son trabajos prácticos que demuestran la aplicación de 
              los conocimientos adquiridos. Son evaluadas por el tutor del curso.
            </p>

            <h3 className="text-lg font-semibold">Tipos de actividades:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                <div>
                  <strong>Casos prácticos:</strong> Resolución de situaciones reales del ámbito profesional
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                <div>
                  <strong>Trabajos escritos:</strong> Desarrollo de temas o investigaciones
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                <div>
                  <strong>Proyectos:</strong> Elaboración de documentos, planes o propuestas
                </div>
              </li>
            </ul>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <h4 className="font-semibold text-amber-800 mb-2">📅 Plazos de entrega</h4>
              <p className="text-sm text-amber-900">
                Respete las fechas límite de entrega. Las actividades entregadas fuera de plazo 
                pueden no ser evaluadas o penalizarse según lo establecido en el programa.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Tutor Communication */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">9. Comunicación con el Tutor</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              El tutor es su guía durante todo el proceso formativo. Puede contactar con él a través 
              de los siguientes canales:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Mensajería interna</h4>
                </div>
                <p className="text-sm text-blue-900">
                  Sistema de mensajes dentro del campus. El tutor responderá en un plazo máximo de 48 horas.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Tutorías programadas</h4>
                </div>
                <p className="text-sm text-green-900">
                  Sesiones de videoconferencia para resolver dudas en directo.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Foro del curso</h4>
                </div>
                <p className="text-sm text-purple-900">
                  Espacio público para preguntas que puedan beneficiar a otros compañeros.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 bg-amber-50">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">WhatsApp de dudas</h4>
                </div>
                <p className="text-sm text-amber-900">
                  Canal para consultas rápidas durante el horario de atención.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Time Tracking */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">10. Control de Tiempos</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              El SEPE exige un control riguroso del tiempo de conexión y estudio. El sistema registra 
              automáticamente:
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Tiempo de conexión a la plataforma</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Tiempo dedicado a cada módulo y contenido</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Interacciones con el material formativo</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Participación en actividades y evaluaciones</span>
              </li>
            </ul>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Requisito de tiempo mínimo</h4>
              <p className="text-sm text-red-900">
                Para obtener el certificado debe cumplir al menos el <strong>75% del tiempo total</strong> 
                establecido para la acción formativa. Puede consultar su tiempo acumulado en la sección 
                "Tiempos Invertidos".
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm">
                <strong>Nota:</strong> Los períodos de inactividad superiores a 15 minutos no se 
                contabilizan. Asegúrese de interactuar con los contenidos regularmente.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11: Forums */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">11. Foros y Participación</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Los foros son espacios de aprendizaje colaborativo donde puede interactuar con 
              compañeros y tutores.
            </p>

            <h3 className="text-lg font-semibold">Normas de participación:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Mantenga un tono respetuoso y profesional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Aporte contenido relevante relacionado con el curso</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Cite las fuentes cuando comparta información externa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>No publique contenido protegido por derechos de autor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                <span>Revise las publicaciones anteriores antes de crear un tema nuevo</span>
              </li>
            </ul>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-800 mb-2">✓ Participación activa</h4>
              <p className="text-sm text-green-900">
                La participación en foros puede ser un criterio de evaluación. Contribuya 
                activamente al debate y colabore con sus compañeros.
              </p>
            </div>
          </div>
        </section>

        {/* Section 12: Certification */}
        <section className="mb-12 print:mb-8 print:page-break-after-always">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">12. Certificación</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Al finalizar satisfactoriamente la acción formativa, recibirá un diploma/certificado 
              acreditativo conforme a los requisitos del SEPE.
            </p>

            <h3 className="text-lg font-semibold">Requisitos para obtener el certificado:</h3>
            
            <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span>Completar mínimo el <strong>75%</strong> de los contenidos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span>Cumplir el <strong>75%</strong> del tiempo mínimo de formación</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span>Aprobar las <strong>evaluaciones</strong> con nota igual o superior al 50%</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span>Entregar las <strong>actividades obligatorias</strong></span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              El certificado estará disponible en formato digital en la sección "Certificados" una 
              vez validado por el centro de formación.
            </p>
          </div>
        </section>

        {/* Section 13: Technical Support */}
        <section className="mb-12 print:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">13. Soporte Técnico</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-justify">
              Si experimenta problemas técnicos con la plataforma, puede contactar con nuestro 
              servicio de soporte:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-6 text-center">
                <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Correo electrónico</h4>
                <p className="text-primary font-medium">soporte@campus.es</p>
                <p className="text-sm text-muted-foreground mt-2">Respuesta en 24-48 horas</p>
              </div>
              
              <div className="border rounded-lg p-6 text-center">
                <Phone className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Teléfono</h4>
                <p className="text-primary font-medium">900 XXX XXX</p>
                <p className="text-sm text-muted-foreground mt-2">L-V de 9:00 a 18:00</p>
              </div>
            </div>

            <div className="bg-blue-50 border rounded-lg p-6">
              <h4 className="font-semibold mb-3">Al contactar con soporte, indique:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Su nombre completo y correo electrónico registrado</li>
                <li>• Nombre del curso en el que está matriculado</li>
                <li>• Descripción detallada del problema</li>
                <li>• Navegador y sistema operativo que utiliza</li>
                <li>• Capturas de pantalla si es posible</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-primary pt-8 mt-12 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <img src="/branding/sepe-gobierno-logo.png" alt="Gobierno de España" className="h-12 object-contain" />
            <img src="/branding/sepe-logo.png" alt="SEPE" className="h-12 object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">
            Documento elaborado conforme a la normativa de Formación Profesional para el Empleo
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} - Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            margin: 2cm;
            size: A4;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:page-break-after-always {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
