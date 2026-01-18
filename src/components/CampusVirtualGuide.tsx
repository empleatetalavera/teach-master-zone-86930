import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Monitor, Settings, Users, UserPlus, CheckCircle, 
  Globe, Laptop, Smartphone, MessageCircle, Clock, Shield,
  FileText, GraduationCap, ClipboardCheck, Award, HelpCircle,
  Mail, Phone, Building2
} from "lucide-react";

interface GuideSection {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const CampusVirtualGuide = () => {
  const [activeSection, setActiveSection] = useState<string>("cover");

  // Section definitions with content
  const sections: GuideSection[] = [
    {
      id: "cover",
      number: "",
      title: "Portada",
      icon: BookOpen,
      content: (
        <div className="space-y-8">
          {/* Cover Page - Professional Document Style */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Header with logos */}
            <div className="flex items-center justify-between border-b pb-6 mb-8">
              <div className="flex items-center gap-2">
                <Globe className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-primary">CAMPUS EMPLEATE</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-muted-foreground">
                  <div className="font-semibold">MINISTERIO DE TRABAJO</div>
                  <div>Y ECONOMÍA SOCIAL</div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-300">SEPE</Badge>
              </div>
            </div>

            {/* Main Title Card */}
            <div className="border-2 border-primary rounded-lg p-8 text-center mb-8">
              <h1 className="text-3xl font-black text-slate-800 mb-4">
                GUÍA DEL CAMPUS VIRTUAL
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                Manual de Usuario para el Alumno
              </p>
              <div className="text-primary font-semibold text-lg mb-2">
                Empléate Talavera Formación
              </div>
              <p className="text-muted-foreground">
                Formación Profesional para el Empleo
              </p>
            </div>

            {/* SEPE Badge */}
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary text-primary">
                Centro Acreditado SEPE
              </Badge>
            </div>

            {/* Footer text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Documento conforme a los requisitos del</p>
              <p className="font-semibold">Servicio Público de Empleo Estatal (SEPE)</p>
              <p className="mt-4 text-xs">Versión 1.0 - 2026</p>
            </div>
          </div>

          {/* Index of Contents */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
              ÍNDICE DE CONTENIDOS
            </h2>
            <div className="space-y-3">
              {[
                { num: "1", title: "Introducción al Campus Virtual", page: 3 },
                { num: "2", title: "Requisitos Técnicos", page: 4 },
                { num: "3", title: "Acceso a la Plataforma", page: 5 },
                { num: "4", title: "Navegación Principal", page: 6 },
                { num: "5", title: "Estructura del Curso", page: 7 },
                { num: "6", title: "Contenidos Formativos", page: 8 },
                { num: "7", title: "Evaluaciones y Exámenes", page: 9 },
                { num: "8", title: "Actividades de Desarrollo", page: 10 },
                { num: "9", title: "Comunicación con el Tutor", page: 11 },
                { num: "10", title: "Control de Tiempos", page: 12 },
                { num: "11", title: "Foros y Participación", page: 13 },
                { num: "12", title: "Certificación", page: 14 },
                { num: "13", title: "Soporte Técnico", page: 15 },
              ].map((item) => (
                <button
                  key={item.num}
                  onClick={() => setActiveSection(`section-${item.num}`)}
                  className="flex items-center w-full hover:bg-muted/50 rounded px-2 py-2 transition-colors group"
                >
                  <span className="text-primary font-semibold w-8">{item.num}.</span>
                  <span className="flex-1 text-left text-slate-700 group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="text-slate-400 border-b border-dotted border-slate-300 flex-1 mx-4" />
                  <span className="text-slate-500">{item.page}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-1",
      number: "1",
      title: "Introducción al Campus Virtual",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <SectionHeader number="1" title="Introducción al Campus Virtual" icon={BookOpen} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-600 leading-relaxed">
                <strong>Campus Empleate</strong> es una plataforma para la gestión e impartición de acciones 
                formativas online, dividida en dos entornos claramente diferenciados: el <strong>entorno virtual 
                de formación</strong>, al que pueden acceder alumnado, tutores/as, coordinadores/as y auditores/as; 
                y el <strong>entorno de administración</strong>, dirigido a los perfiles de gestión de la plataforma.
              </p>
              
              <p className="text-slate-600 leading-relaxed">
                Asimismo, el entorno virtual de formación permite el uso de herramientas de comunicación 
                <strong> síncronas</strong> (videoconferencia, chat, etc.) y <strong>asíncronas</strong> (foros, 
                correo, mensajes emergentes, redes sociales, etc.).
              </p>

              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-slate-700">
                  <strong>📱 Acceso móvil:</strong> Campus Empleate es accesible desde tablet o smartphone, 
                  donde tendrás todas las utilidades de la versión PC adaptadas a dispositivos móviles. 
                  La versión móvil te permite una formación online efectiva y sin excusas: accesible 
                  desde cualquier sitio y a cualquier hora.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <FeatureCard 
              icon={Globe} 
              title="100% Online" 
              description="Accede desde cualquier lugar con conexión a internet"
            />
            <FeatureCard 
              icon={Clock} 
              title="24/7" 
              description="Disponible las 24 horas del día, los 7 días de la semana"
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Multidispositivo" 
              description="Compatible con PC, tablet y smartphone"
            />
          </div>
        </div>
      ),
    },
    {
      id: "section-2",
      number: "2",
      title: "Requisitos Técnicos",
      icon: Monitor,
      content: (
        <div className="space-y-6">
          <SectionHeader number="2" title="Requisitos Técnicos" icon={Monitor} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Para acceder correctamente a Campus Empleate y disfrutar de todas sus funcionalidades, 
                es necesario cumplir con los siguientes requisitos técnicos mínimos:
              </p>

              <div className="space-y-4">
                <RequirementCard 
                  letter="A" 
                  title="Navegador web actualizado"
                  items={[
                    "Google Chrome (recomendado) - versión 90 o superior",
                    "Mozilla Firefox - versión 85 o superior",
                    "Microsoft Edge - versión 90 o superior",
                    "Safari - versión 14 o superior (para Mac/iOS)"
                  ]}
                />

                <RequirementCard 
                  letter="B" 
                  title="Conexión a Internet"
                  items={[
                    "Velocidad mínima de descarga: 5 Mbps",
                    "Velocidad recomendada: 10 Mbps o superior",
                    "Conexión estable para videoconferencias"
                  ]}
                />

                <RequirementCard 
                  letter="C" 
                  title="Configuración del navegador"
                  items={[
                    "JavaScript habilitado",
                    "Cookies habilitadas",
                    "Ventanas emergentes permitidas para el dominio del campus"
                  ]}
                />

                <RequirementCard 
                  letter="D" 
                  title="Software adicional"
                  items={[
                    "Lector de PDF (Adobe Reader o similar)",
                    "Reproductor de vídeo HTML5 (integrado en navegadores modernos)",
                    "Procesador de textos para actividades prácticas"
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <InfoBox type="tip">
            <strong>💡 Recomendación:</strong> Mantén tu navegador siempre actualizado a la última versión 
            para garantizar la mejor experiencia de usuario y evitar problemas de compatibilidad.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "section-3",
      number: "3",
      title: "Acceso a la Plataforma",
      icon: Shield,
      content: (
        <div className="space-y-6">
          <SectionHeader number="3" title="Acceso a la Plataforma" icon={Shield} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Para acceder al Campus Empleate, sigue estos sencillos pasos:
              </p>

              <div className="space-y-4">
                <StepCard 
                  number={1}
                  title="Accede a la URL del campus"
                  description="Introduce en tu navegador la dirección web proporcionada por tu centro de formación."
                />
                
                <StepCard 
                  number={2}
                  title="Introduce tus credenciales"
                  description="En la pantalla de login, introduce tu nombre de usuario y contraseña. Estos datos te habrán sido facilitados por el centro de formación."
                />
                
                <StepCard 
                  number={3}
                  title="Pulsa 'Iniciar Sesión'"
                  description="Haz clic en el botón de acceso para entrar en tu espacio personal del campus virtual."
                />
                
                <StepCard 
                  number={4}
                  title="Completa tu perfil"
                  description="La primera vez que accedas, deberás completar tu perfil con los datos personales requeridos para la acción formativa."
                />
              </div>

              <InfoBox type="important">
                <strong>⚠️ Importante:</strong> Tus credenciales de acceso son personales e intransferibles. 
                No compartas tu usuario y contraseña con terceros. Si olvidas tu contraseña, contacta con 
                el soporte técnico del centro.
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-4",
      number: "4",
      title: "Navegación Principal",
      icon: Laptop,
      content: (
        <div className="space-y-6">
          <SectionHeader number="4" title="Navegación Principal" icon={Laptop} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Una vez hayas iniciado sesión, accederás a tu <strong>Panel de Control</strong>, donde 
                encontrarás todas las herramientas y recursos necesarios para tu formación.
              </p>

              <div className="space-y-4">
                <NavigationItem 
                  title="📚 Mis Cursos"
                  description="Acceso directo a todos los cursos en los que estás matriculado. Desde aquí podrás ver tu progreso, acceder a los contenidos y realizar las evaluaciones."
                />
                
                <NavigationItem 
                  title="📅 Calendario"
                  description="Visualiza las fechas importantes: entregas de actividades, tutorías programadas, exámenes y eventos formativos."
                />
                
                <NavigationItem 
                  title="✉️ Mensajería"
                  description="Sistema de comunicación interna con tutores y compañeros. Aquí recibirás notificaciones importantes sobre tu formación."
                />
                
                <NavigationItem 
                  title="📊 Mi Progreso"
                  description="Panel con estadísticas detalladas de tu avance: tiempo dedicado, contenidos completados, calificaciones obtenidas."
                />
                
                <NavigationItem 
                  title="👤 Mi Perfil"
                  description="Gestiona tus datos personales, cambia tu contraseña y configura las preferencias de notificación."
                />
                
                <NavigationItem 
                  title="❓ Ayuda"
                  description="Centro de ayuda con preguntas frecuentes, tutoriales y datos de contacto del soporte técnico."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-5",
      number: "5",
      title: "Estructura del Curso",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <SectionHeader number="5" title="Estructura del Curso" icon={FileText} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Los cursos en Campus Empleate están organizados siguiendo una estructura jerárquica 
                que facilita el aprendizaje progresivo:
              </p>

              <div className="bg-slate-50 rounded-lg p-6 border">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Certificado de Profesionalidad</h4>
                      <p className="text-sm text-slate-600">Nivel superior que agrupa todos los módulos formativos</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-primary/30 pl-8 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/80 text-white rounded-lg flex items-center justify-center font-bold">2</div>
                      <div>
                        <h4 className="font-bold text-slate-800">Módulos Formativos (MF)</h4>
                        <p className="text-sm text-slate-600">Bloques temáticos principales del certificado</p>
                      </div>
                    </div>
                    <div className="ml-4 border-l-2 border-primary/20 pl-8 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary/60 text-white rounded-lg flex items-center justify-center font-bold">3</div>
                        <div>
                          <h4 className="font-bold text-slate-800">Unidades Formativas (UF)</h4>
                          <p className="text-sm text-slate-600">Divisiones específicas dentro de cada módulo</p>
                        </div>
                      </div>
                      <div className="ml-4 border-l-2 border-primary/10 pl-8">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-primary/40 text-white rounded-lg flex items-center justify-center font-bold">4</div>
                          <div>
                            <h4 className="font-bold text-slate-800">Unidades Didácticas (UD)</h4>
                            <p className="text-sm text-slate-600">Contenidos específicos con teoría, práctica y evaluación</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <InfoBox type="note">
                Cada unidad incluye contenido teórico, actividades prácticas, test de autoevaluación 
                y recursos complementarios.
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-6",
      number: "6",
      title: "Contenidos Formativos",
      icon: GraduationCap,
      content: (
        <div className="space-y-6">
          <SectionHeader number="6" title="Contenidos Formativos" icon={GraduationCap} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                El campus ofrece contenidos multimedia interactivos diseñados para facilitar el 
                aprendizaje autónomo y la adquisición de competencias profesionales.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <ContentTypeCard 
                  icon={FileText}
                  title="Contenido Interactivo Multimedia"
                  description="Presentaciones dinámicas con animaciones, vídeos y elementos interactivos."
                />
                <ContentTypeCard 
                  icon={BookOpen}
                  title="Manuales PDF"
                  description="Documentación teórica descargable para estudio offline."
                />
                <ContentTypeCard 
                  icon={ClipboardCheck}
                  title="Actividades Prácticas"
                  description="Ejercicios aplicados para consolidar el aprendizaje."
                />
                <ContentTypeCard 
                  icon={CheckCircle}
                  title="Test de Autoevaluación"
                  description="Cuestionarios para verificar la comprensión de cada unidad."
                />
              </div>

              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-slate-700">
                  <strong>🎯 Objetivo:</strong> Cada unidad formativa está diseñada para ser completada 
                  de forma secuencial. Se recomienda estudiar el contenido teórico antes de realizar 
                  las actividades prácticas y los test de evaluación.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-7",
      number: "7",
      title: "Evaluaciones y Exámenes",
      icon: ClipboardCheck,
      content: (
        <div className="space-y-6">
          <SectionHeader number="7" title="Evaluaciones y Exámenes" icon={ClipboardCheck} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                El sistema de evaluación en Campus Empleate está diseñado para medir tu progreso 
                y garantizar la adquisición de las competencias profesionales requeridas.
              </p>

              <div className="space-y-4">
                <EvaluationCard 
                  title="Test de Autoevaluación por Unidad"
                  percentage="No ponderado"
                  description="Test formativos al final de cada unidad didáctica. No computan en la nota final pero son obligatorios para avanzar."
                />
                <EvaluationCard 
                  title="Evaluación de Aprendizaje (Test Módulo)"
                  percentage="30%"
                  description="Examen tipo test al finalizar cada módulo formativo. Mínimo requerido: 5 sobre 10."
                />
                <EvaluationCard 
                  title="Evaluación Final Presencial"
                  percentage="70%"
                  description="Examen presencial obligatorio que evalúa las competencias adquiridas. Mínimo requerido: 5 sobre 10."
                />
              </div>

              <InfoBox type="important">
                <strong>⚠️ Requisitos para obtener el certificado:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                  <li>Completar el 100% de los contenidos formativos</li>
                  <li>Superar todos los test de autoevaluación</li>
                  <li>Obtener mínimo 5/10 en la evaluación de aprendizaje</li>
                  <li>Obtener mínimo 5/10 en la evaluación presencial</li>
                  <li>Asistir a las tutorías presenciales programadas</li>
                </ul>
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-8",
      number: "8",
      title: "Actividades de Desarrollo",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <SectionHeader number="8" title="Actividades de Desarrollo" icon={FileText} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Las actividades de desarrollo son ejercicios prácticos diseñados para aplicar 
                los conocimientos teóricos adquiridos en situaciones reales del ámbito profesional.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <h4 className="font-bold text-slate-800 mb-2">📝 Tipos de actividades</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span><strong>Casos prácticos:</strong> Resolución de situaciones profesionales reales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span><strong>Ejercicios de aplicación:</strong> Uso de herramientas y procedimientos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span><strong>Proyectos:</strong> Trabajos integradores de conocimientos</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border">
                  <h4 className="font-bold text-slate-800 mb-2">📤 Entrega de actividades</h4>
                  <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                    <li>Accede a la actividad desde la unidad correspondiente</li>
                    <li>Lee atentamente las instrucciones y rúbrica de evaluación</li>
                    <li>Elabora tu respuesta siguiendo el formato indicado</li>
                    <li>Sube el archivo en los formatos permitidos (PDF, DOC, DOCX)</li>
                    <li>Confirma el envío antes de la fecha límite</li>
                  </ol>
                </div>
              </div>

              <InfoBox type="tip">
                <strong>💡 Consejo:</strong> Revisa siempre la rúbrica de evaluación antes de comenzar 
                cada actividad para conocer los criterios de calificación.
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-9",
      number: "9",
      title: "Comunicación con el Tutor",
      icon: MessageCircle,
      content: (
        <div className="space-y-6">
          <SectionHeader number="9" title="Comunicación con el Tutor" icon={MessageCircle} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                El tutor es tu principal apoyo durante el proceso formativo. Tienes a tu disposición 
                varios canales para comunicarte y resolver tus dudas.
              </p>

              <div className="space-y-4">
                <CommunicationChannel 
                  icon={Mail}
                  title="Mensajería Interna"
                  description="Sistema de mensajes dentro del campus. El tutor responderá en un plazo máximo de 48 horas laborables."
                  responseTime="48h"
                />
                <CommunicationChannel 
                  icon={MessageCircle}
                  title="Foros del Curso"
                  description="Espacios de debate donde puedes plantear dudas que pueden beneficiar a otros compañeros."
                  responseTime="24-48h"
                />
                <CommunicationChannel 
                  icon={Users}
                  title="Tutorías Virtuales"
                  description="Sesiones en directo programadas para resolver dudas de forma síncrona vía videoconferencia."
                  responseTime="Programadas"
                />
                <CommunicationChannel 
                  icon={Building2}
                  title="Tutorías Presenciales"
                  description="Sesiones obligatorias de orientación y seguimiento en el centro de formación."
                  responseTime="Según calendario"
                />
              </div>

              <InfoBox type="note">
                El tutor te notificará por correo interno cuando califique tus actividades o 
                tengas alguna comunicación importante sobre tu formación.
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-10",
      number: "10",
      title: "Control de Tiempos",
      icon: Clock,
      content: (
        <div className="space-y-6">
          <SectionHeader number="10" title="Control de Tiempos" icon={Clock} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                El sistema registra automáticamente el tiempo de conexión y dedicación a cada 
                contenido formativo. Este control es <strong>obligatorio</strong> para certificados de profesionalidad.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-bold text-amber-800 mb-2">⏱️ Tiempo mínimo requerido</h4>
                <p className="text-sm text-amber-700">
                  Cada unidad formativa tiene asignado un tiempo mínimo de dedicación que debes 
                  cumplir para poder acceder a la evaluación. El sistema te mostrará tu progreso 
                  temporal en el panel de seguimiento.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <span className="font-medium text-slate-700">Tiempo de conexión</span>
                  <span className="text-sm text-slate-500">Se registra automáticamente</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <span className="font-medium text-slate-700">Tiempo en contenidos</span>
                  <span className="text-sm text-slate-500">Navegación por páginas/slides</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <span className="font-medium text-slate-700">Tiempo en evaluaciones</span>
                  <span className="text-sm text-slate-500">Duración de los exámenes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <span className="font-medium text-slate-700">Participación en foros</span>
                  <span className="text-sm text-slate-500">Mensajes e interacciones</span>
                </div>
              </div>

              <InfoBox type="important">
                <strong>⚠️ Importante:</strong> La sesión se cierra automáticamente tras 30 minutos 
                de inactividad. Asegúrate de guardar tu trabajo regularmente.
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-11",
      number: "11",
      title: "Foros y Participación",
      icon: Users,
      content: (
        <div className="space-y-6">
          <SectionHeader number="11" title="Foros y Participación" icon={Users} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Los foros son espacios de aprendizaje colaborativo donde puedes interactuar 
                con tus compañeros y tutores, compartir experiencias y resolver dudas conjuntamente.
              </p>

              <div className="space-y-4">
                <ForumType 
                  title="📢 Tablón de Anuncios"
                  description="Comunicados oficiales del tutor y el centro. Solo lectura para alumnos."
                  participation="Obligatorio leer"
                />
                <ForumType 
                  title="💬 Foro de Dudas/Consultas"
                  description="Espacio para plantear preguntas sobre contenidos técnicos y procedimientos."
                  participation="Participación activa"
                />
                <ForumType 
                  title="🗣️ Foro de Debate"
                  description="Discusiones sobre temas de actualidad relacionados con el sector profesional."
                  participation="Mínimo 2 aportaciones"
                />
                <ForumType 
                  title="☕ Cafetería"
                  description="Espacio informal para presentaciones y conversaciones entre compañeros."
                  participation="Opcional"
                />
              </div>

              <InfoBox type="tip">
                <strong>💡 Buenas prácticas en foros:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                  <li>Sé respetuoso y constructivo en tus intervenciones</li>
                  <li>Busca si tu duda ya ha sido resuelta antes de publicar</li>
                  <li>Utiliza títulos descriptivos en tus mensajes</li>
                  <li>Cita correctamente cuando respondas a otro compañero</li>
                </ul>
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-12",
      number: "12",
      title: "Certificación",
      icon: Award,
      content: (
        <div className="space-y-6">
          <SectionHeader number="12" title="Certificación" icon={Award} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Al completar satisfactoriamente tu formación, obtendrás la acreditación oficial 
                correspondiente según el tipo de acción formativa cursada.
              </p>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
                <h4 className="font-bold text-primary text-lg mb-4">🎓 Certificado de Profesionalidad</h4>
                <p className="text-slate-600 mb-4">
                  Para obtener el Certificado de Profesionalidad oficial expedido por el SEPE, 
                  debes cumplir todos los requisitos de la formación:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">100% contenidos completados</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Tiempo mínimo cumplido</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Evaluaciones superadas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Tutorías presenciales realizadas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Examen final aprobado</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Encuestas completadas</span>
                  </div>
                </div>
              </div>

              <InfoBox type="note">
                El diploma se emite una vez verificados todos los requisitos y está disponible 
                para descarga en tu perfil. El Certificado oficial se solicita a través del SEPE.
              </InfoBox>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "section-13",
      number: "13",
      title: "Soporte Técnico",
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <SectionHeader number="13" title="Soporte Técnico" icon={HelpCircle} />
          
          <Card className="border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Si experimentas problemas técnicos con la plataforma, tienes varios canales 
                disponibles para recibir asistencia.
              </p>

              <div className="grid gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Correo electrónico</h4>
                    <p className="text-primary font-medium">soporte@campusempleate.com</p>
                    <p className="text-sm text-slate-500">Respuesta en 24-48 horas laborables</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Teléfono</h4>
                    <p className="text-primary font-medium">925 XX XX XX</p>
                    <p className="text-sm text-slate-500">Lunes a viernes de 9:00 a 18:00</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Centro de Ayuda</h4>
                    <p className="text-primary font-medium">Sección "Ayuda" del campus</p>
                    <p className="text-sm text-slate-500">FAQs, tutoriales y guías</p>
                  </div>
                </div>
              </div>

              <InfoBox type="tip">
                <strong>💡 Para agilizar tu consulta:</strong> Indica siempre tu nombre de usuario, 
                el curso al que estás matriculado y una descripción detallada del problema, 
                incluyendo capturas de pantalla si es posible.
              </InfoBox>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>© 2026 Campus Empleate - Formación Profesional para el Empleo</p>
            <p className="mt-1">Centro Acreditado por el Servicio Público de Empleo Estatal</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-100">
      {/* Sidebar - Index */}
      <div className="w-72 bg-white border-r shadow-sm flex flex-col print:hidden">
        <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-6 w-6" />
            <span className="text-lg font-bold">Campus Empleate</span>
          </div>
          <p className="text-xs opacity-80">Guía del Usuario</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Cover button */}
            <button
              onClick={() => setActiveSection("cover")}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                activeSection === "cover" 
                  ? "bg-primary text-white" 
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-sm font-medium">📖 Portada e Índice</span>
            </button>
            
            {/* Section buttons */}
            {sections.filter(s => s.id !== "cover").map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                  activeSection === section.id 
                    ? "bg-primary text-white" 
                    : "hover:bg-muted"
                }`}
              >
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  activeSection === section.id ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}>
                  {section.number}
                </span>
                <span className="text-sm truncate">{section.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-slate-50 text-center">
          <p className="text-xs text-muted-foreground">
            Versión 1.0 - 2026
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-4xl mx-auto">
            {sections.find(s => s.id === activeSection)?.content}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Helper Components
const SectionHeader = ({ number, title, icon: Icon }: { number: string; title: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center">
      <Icon className="h-6 w-6" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800">
      <span className="text-primary">{number}.</span> {title}
    </h2>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <Card className="text-center p-4 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
    <p className="text-xs text-slate-500">{description}</p>
  </Card>
);

const RequirementCard = ({ letter, title, items }: { letter: string; title: string; items: string[] }) => (
  <div className="bg-slate-50 rounded-lg p-4 border">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold shrink-0">
        {letter}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">
      {number}
    </div>
    <div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

const InfoBox = ({ type, children }: { type: "tip" | "important" | "note"; children: React.ReactNode }) => {
  const styles = {
    tip: "bg-blue-50 border-blue-500 text-blue-700",
    important: "bg-amber-50 border-amber-500 text-amber-700",
    note: "bg-slate-50 border-slate-400 text-slate-700"
  };
  
  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${styles[type]}`}>
      {children}
    </div>
  );
};

const NavigationItem = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
    <div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

const ContentTypeCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="bg-slate-50 rounded-lg p-4 border hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-primary" />
      <h4 className="font-bold text-slate-800">{title}</h4>
    </div>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

const EvaluationCard = ({ title, percentage, description }: { title: string; percentage: string; description: string }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
    <Badge className="bg-primary shrink-0">{percentage}</Badge>
    <div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

const CommunicationChannel = ({ icon: Icon, title, description, responseTime }: { 
  icon: React.ElementType; title: string; description: string; responseTime: string 
}) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <Badge variant="outline" className="text-xs">{responseTime}</Badge>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

const ForumType = ({ title, description, participation }: { title: string; description: string; participation: string }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <Badge variant="secondary" className="text-xs">{participation}</Badge>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

export default CampusVirtualGuide;
