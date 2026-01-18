import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Monitor, Settings, Users, UserPlus, ChevronRight, 
  CheckCircle2, Globe, Shield, GraduationCap, Lightbulb, 
  ClipboardList, FileText, MessageCircle, BarChart3,
  Calendar, Mail, HelpCircle, Download, Folder,
  Video, Search, Star, Building2
} from "lucide-react";

interface GuideSection {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
  subsections?: { id: string; title: string }[];
}

const CampusVirtualGuide = () => {
  const [activeSection, setActiveSection] = useState<string>("intro");

  // Theme iSpring-teal
  const theme = {
    headerBg: 'bg-gradient-to-r from-teal-600 to-teal-500',
    contentBg: 'bg-white',
    cardBg: 'bg-white',
    accent: 'text-teal-600',
    accentBg: 'bg-teal-600',
    border: 'border-teal-500',
    highlight: 'bg-teal-50',
  };

  // Cover Page Component
  const CoverPage = ({ number, title, icon: Icon }: { number: string; title: string; icon: React.ElementType }) => (
    <div className="relative h-[300px] rounded-xl overflow-hidden mb-8 shadow-lg">
      {/* Geometric Background */}
      <div className={`absolute inset-0 ${theme.headerBg}`}>
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rotate-45" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <Badge className="bg-white/20 text-white border-0 text-lg px-4 py-1">
            Sección {number}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <div className="w-24 h-1 bg-white/40 rounded-full" />
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/40 via-white/60 to-white/40" />
    </div>
  );

  // Info Card Component
  const InfoCard = ({ icon: Icon, title, children, variant = "default" }: { 
    icon: React.ElementType; 
    title: string; 
    children: React.ReactNode;
    variant?: "default" | "tip" | "important" | "note";
  }) => {
    const variants = {
      default: { bg: theme.highlight, border: theme.border, iconBg: theme.accentBg },
      tip: { bg: "bg-amber-50", border: "border-amber-400", iconBg: "bg-amber-500" },
      important: { bg: "bg-rose-50", border: "border-rose-400", iconBg: "bg-rose-500" },
      note: { bg: "bg-blue-50", border: "border-blue-400", iconBg: "bg-blue-500" },
    };
    const v = variants[variant];
    
    return (
      <Card className={`${v.bg} ${v.border} border-l-4 shadow-sm mb-4`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 ${v.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
              <div className="text-gray-600 text-sm">{children}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Step Card Component
  const StepCard = ({ number, title, description, icon: Icon }: { 
    number: number; 
    title: string; 
    description: string;
    icon?: React.ElementType;
  }) => (
    <div className="flex gap-4 mb-4">
      <div className={`w-10 h-10 ${theme.accentBg} rounded-full flex items-center justify-center shrink-0 text-white font-bold shadow-md`}>
        {number}
      </div>
      <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className={`w-8 h-8 ${theme.highlight} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${theme.accent}`} />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-800">{title}</h4>
              <p className="text-gray-600 text-sm mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Feature Grid Component
  const FeatureGrid = ({ features }: { features: { icon: React.ElementType; title: string; description: string }[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {features.map((feature, idx) => (
        <Card key={idx} className="shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${theme.highlight} rounded-xl flex items-center justify-center shrink-0`}>
                <feature.icon className={`w-5 h-5 ${theme.accent}`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const sections: GuideSection[] = [
    {
      id: "intro",
      number: "1",
      title: "INTRODUCCIÓN AL CAMPUS EMPLEATE",
      icon: BookOpen,
      content: (
        <div>
          <CoverPage number="1" title="Introducción al Campus Empleate" icon={BookOpen} />
          
          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong className={theme.accent}>Campus Empleate</strong> es una plataforma de última generación para la gestión e impartición de acciones formativas online, diseñada específicamente para cumplir con los requisitos del <strong>SEPE</strong> y los <strong>Certificados de Profesionalidad</strong>.
              </p>
            </CardContent>
          </Card>

          <FeatureGrid features={[
            { icon: Monitor, title: "Entorno de Formación", description: "Acceso para alumnado, tutores, coordinadores y auditores con herramientas especializadas." },
            { icon: Settings, title: "Entorno de Administración", description: "Panel completo para gestión de cursos, usuarios, matriculaciones y seguimiento." },
            { icon: MessageCircle, title: "Comunicación Síncrona", description: "Videoconferencia, chat en tiempo real y herramientas de colaboración instantánea." },
            { icon: Mail, title: "Comunicación Asíncrona", description: "Foros de debate, correo interno, notificaciones y mensajes del sistema." },
          ]} />

          <InfoCard icon={Globe} title="Acceso Multiplataforma" variant="tip">
            <p>Campus Empleate es accesible desde <strong>tablet, smartphone y PC</strong>. La versión móvil incluye todas las funcionalidades adaptadas para ofrecer una formación efectiva desde cualquier lugar y momento.</p>
          </InfoCard>

          <InfoCard icon={Shield} title="Cumplimiento SEPE" variant="important">
            <p>La plataforma está diseñada para cumplir con todos los requisitos de trazabilidad, seguimiento y documentación exigidos por el <strong>Servicio Público de Empleo Estatal (SEPE)</strong> para la impartición de Certificados de Profesionalidad en modalidad de teleformación.</p>
          </InfoCard>
        </div>
      ),
    },
    {
      id: "interface",
      number: "2",
      title: "INTERFAZ DEL CAMPUS",
      icon: Monitor,
      content: (
        <div>
          <CoverPage number="2" title="Interfaz del Campus Empleate" icon={Monitor} />

          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                Al acceder con perfil de <strong>administrador</strong> a Campus Empleate, visualizará un panel de control intuitivo con todos los recursos disponibles para configurar y gestionar la formación.
              </p>
            </CardContent>
          </Card>

          <div className={`${theme.highlight} rounded-xl p-6 mb-6 border ${theme.border}`}>
            <div className="flex items-center gap-3 mb-4">
              <Star className={`w-6 h-6 ${theme.accent}`} />
              <h3 className="text-lg font-bold text-gray-800">FAVORITOS</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Personalice esta sección con las herramientas más utilizadas para acceder a ellas con un solo clic. Para marcar un elemento como favorito, haga clic en la estrella junto a cada herramienta.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Grupos", "Alumnos", "Seguimiento", "Informes"].map((item) => (
                <Badge key={item} variant="secondary" className="bg-white shadow-sm">
                  <Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Folder className={`w-5 h-5 ${theme.accent}`} />
            Menú Principal
          </h3>

          <div className="space-y-3 mb-6">
            {[
              { icon: Video, title: "Vídeos de Ayuda", desc: "Tutoriales explicativos sobre las herramientas del campus." },
              { icon: Calendar, title: "Programación de Cursos", desc: "Servicios para programar y configurar acciones formativas." },
              { icon: MessageCircle, title: "Comunicación", desc: "Recursos para comunicarse con usuarios del campus." },
              { icon: BarChart3, title: "Seguimiento", desc: "Herramientas de seguimiento de alumnado y tutores." },
              { icon: FileText, title: "Informes", desc: "Generación de informes para seguimiento y auditorías." },
              { icon: Settings, title: "Configuración", desc: "Personalización de la formación y del campus." },
            ].map((item, idx) => (
              <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${theme.highlight} rounded-lg flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${theme.accent}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "config",
      number: "3",
      title: "CONFIGURACIÓN INICIAL DE SEGUIMIENTO",
      icon: Settings,
      content: (
        <div>
          <CoverPage number="3" title="Configuración Inicial de Seguimiento" icon={Settings} />

          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                Antes de comenzar a gestionar alumnos, es fundamental configurar correctamente el sistema de seguimiento. Esta configuración determinará qué información se mostrará en las herramientas de trazabilidad.
              </p>
            </CardContent>
          </Card>

          <h3 className="text-xl font-bold text-gray-800 mb-4">Pasos para la configuración</h3>

          <StepCard 
            number={1} 
            title="Acceder con perfil Administrador" 
            description="Inicie sesión en el campus con sus credenciales de administrador."
            icon={Shield}
          />
          <StepCard 
            number={2} 
            title="Ir a la sección SEGUIMIENTO" 
            description="En el menú principal, localice y despliegue la sección de Seguimiento."
            icon={BarChart3}
          />
          <StepCard 
            number={3} 
            title="Seleccionar CONFIGURACIÓN SEGUIMIENTO DE ALUMNOS" 
            description="Acceda a la herramienta de configuración para personalizar las opciones."
            icon={Settings}
          />

          <InfoCard icon={Lightbulb} title="Opciones Configurables" variant="note">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Campos visibles en el listado de seguimiento</li>
              <li>Alertas por inactividad del alumno</li>
              <li>Umbrales de progreso mínimo</li>
              <li>Frecuencia de notificaciones automáticas</li>
            </ul>
          </InfoCard>

          <InfoCard icon={CheckCircle2} title="Recomendación" variant="tip">
            <p>Configure el seguimiento antes de matricular a los primeros alumnos para asegurar una correcta trazabilidad desde el inicio de la formación.</p>
          </InfoCard>
        </div>
      ),
    },
    {
      id: "groups",
      number: "4",
      title: "ALTA DE UN NUEVO GRUPO",
      icon: Users,
      content: (
        <div>
          <CoverPage number="4" title="Alta de un Nuevo Grupo" icon={Users} />

          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                Un <strong>grupo</strong> representa una edición o convocatoria de un curso. Antes de matricular alumnos, debe crear el grupo correspondiente con las fechas y configuración adecuada.
              </p>
            </CardContent>
          </Card>

          <h3 className="text-xl font-bold text-gray-800 mb-4">Proceso de creación</h3>

          <StepCard 
            number={1} 
            title="Acceder a PROGRAMACIÓN DE CURSOS → GRUPOS" 
            description="Desde el panel de administrador, navegue a la sección de grupos."
            icon={Folder}
          />
          <StepCard 
            number={2} 
            title="Clic en 'Nuevo'" 
            description="Se abrirá el formulario de creación de nuevo grupo."
            icon={UserPlus}
          />
          <StepCard 
            number={3} 
            title="Completar campos obligatorios" 
            description="Rellene los campos marcados con asterisco rojo (*)."
            icon={ClipboardList}
          />

          <div className={`${theme.highlight} rounded-xl p-6 my-6 border ${theme.border}`}>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList className={`w-5 h-5 ${theme.accent}`} />
              Campos Obligatorios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Código de grupo", desc: "Identificador único (letras y/o números)" },
                { label: "Nombre de grupo", desc: "Nombre visible para el alumnado" },
                { label: "Acción formativa", desc: "Curso o contenido a impartir" },
                { label: "Fecha de inicio", desc: "Cuándo comienza la formación" },
              ].map((field, idx) => (
                <Card key={idx} className="shadow-sm">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`${theme.accentBg} text-white`}>*</Badge>
                      <div>
                        <p className="font-semibold text-gray-800">{field.label}</p>
                        <p className="text-gray-500 text-xs">{field.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <InfoCard icon={Calendar} title="Fecha de Finalización" variant="note">
            <p>Aunque no es obligatoria, se recomienda establecer una fecha de fin para que los alumnos no puedan acceder una vez finalizada la formación y para el correcto funcionamiento de la agenda.</p>
          </InfoCard>

          <InfoCard icon={FileText} title="Guía Didáctica" variant="tip">
            <p>Al crear el grupo se genera automáticamente una <strong>Guía Didáctica</strong> descargable en PDF con toda la información del curso.</p>
          </InfoCard>
        </div>
      ),
    },
    {
      id: "students",
      number: "5",
      title: "MATRICULACIÓN DE ALUMNOS",
      icon: GraduationCap,
      subsections: [
        { id: "students-create", title: "5.1 Crear nuevo alumno" },
        { id: "students-enroll", title: "5.2 Matricular en grupo" },
      ],
      content: (
        <div>
          <CoverPage number="5" title="Matriculación de Alumnos" icon={GraduationCap} />

          {/* Subsection 5.1 */}
          <div id="students-create" className="scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${theme.accentBg} text-white text-lg px-3`}>5.1</Badge>
              <h2 className="text-2xl font-bold text-gray-800">Cómo dar de alta a un alumno</h2>
            </div>

            <StepCard 
              number={1} 
              title="Ir a PROGRAMACIÓN DE CURSOS → GESTIÓN DE ALUMNOS" 
              description="Acceda a la herramienta de gestión de alumnado."
              icon={Users}
            />
            <StepCard 
              number={2} 
              title="Clic en 'Nuevo'" 
              description="Se abrirá el formulario de alta de nuevo alumno."
              icon={UserPlus}
            />
            <StepCard 
              number={3} 
              title="Completar datos obligatorios" 
              description="Idioma, nombre, apellido, documento, usuario y contraseña."
              icon={ClipboardList}
            />
            <StepCard 
              number={4} 
              title="Guardar" 
              description="El sistema ofrecerá matricular directamente en un grupo."
              icon={CheckCircle2}
            />

            <InfoCard icon={Mail} title="Email del Alumno" variant="tip">
              <p>Se recomienda incluir el email para que el alumno reciba notificaciones y el correo de bienvenida con sus credenciales de acceso.</p>
            </InfoCard>
          </div>

          <div className="h-8" />

          {/* Subsection 5.2 */}
          <div id="students-enroll" className="scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${theme.accentBg} text-white text-lg px-3`}>5.2</Badge>
              <h2 className="text-2xl font-bold text-gray-800">Cómo matricular en un grupo</h2>
            </div>

            <Card className="mb-6 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-gray-700">
                  Si no matriculó al alumno durante el alta, puede hacerlo posteriormente desde la gestión de alumnos.
                </p>
              </CardContent>
            </Card>

            <StepCard 
              number={1} 
              title="Buscar al alumno" 
              description="Use el buscador por NIF o búsqueda avanzada (nombre, email...)."
              icon={Search}
            />
            <StepCard 
              number={2} 
              title="Clic en 'Asignar a grupo'" 
              description="Botón disponible en la ficha del alumno."
              icon={Users}
            />
            <StepCard 
              number={3} 
              title="Seleccionar y asignar" 
              description="Busque el grupo y pulse 'Asignar'. Puede matricular en varios grupos simultáneamente."
              icon={CheckCircle2}
            />

            <InfoCard icon={Users} title="Matriculación Múltiple" variant="note">
              <p>Un alumno puede estar matriculado en <strong>varios grupos simultáneamente</strong> sin ninguna restricción.</p>
            </InfoCard>
          </div>
        </div>
      ),
    },
    {
      id: "tutors",
      number: "6",
      title: "USUARIOS TUTORES Y AUDITORES",
      icon: Shield,
      subsections: [
        { id: "tutors-create", title: "6.1 Crear tutor/auditor" },
        { id: "tutors-assign", title: "6.2 Asignar a grupo" },
      ],
      content: (
        <div>
          <CoverPage number="6" title="Usuarios Tutores y Auditores" icon={Shield} />

          {/* Subsection 6.1 */}
          <div id="tutors-create" className="scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${theme.accentBg} text-white text-lg px-3`}>6.1</Badge>
              <h2 className="text-2xl font-bold text-gray-800">Crear nuevo tutor/auditor</h2>
            </div>

            <StepCard 
              number={1} 
              title="Ir a PROGRAMACIÓN DE CURSOS → USUARIOS" 
              description="Acceda a la gestión de usuarios del campus."
              icon={Users}
            />
            <StepCard 
              number={2} 
              title="Clic en 'Nuevo'" 
              description="Se abrirá el formulario de creación de usuario."
              icon={UserPlus}
            />
            <StepCard 
              number={3} 
              title="Seleccionar perfil" 
              description="Elija TUTOR o AUDITOR según corresponda."
              icon={Shield}
            />
            <StepCard 
              number={4} 
              title="Completar datos y guardar" 
              description="El sistema ofrecerá asignar directamente a un grupo."
              icon={CheckCircle2}
            />

            <div className={`${theme.highlight} rounded-xl p-6 my-6 border ${theme.border}`}>
              <h4 className="font-bold text-gray-800 mb-3">Campos para Certificados de Profesionalidad</h4>
              <p className="text-gray-600 text-sm">
                Los campos marcados con <Badge variant="outline" className="mx-1">(C)</Badge> son obligatorios específicamente cuando la formación está vinculada a Certificados de Profesionalidad.
              </p>
            </div>

            <InfoCard icon={Calendar} title="Días de Prórroga" variant="tip">
              <p>Puede asignar días de prórroga para que el tutor tenga acceso al curso después de finalizado (números positivos) o antes del inicio (números negativos).</p>
            </InfoCard>
          </div>

          <div className="h-8" />

          {/* Subsection 6.2 */}
          <div id="tutors-assign" className="scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${theme.accentBg} text-white text-lg px-3`}>6.2</Badge>
              <h2 className="text-2xl font-bold text-gray-800">Asignar tutor existente a nuevo grupo</h2>
            </div>

            <Card className="mb-6 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-gray-700">
                  Si el tutor ya existe en el sistema, puede asignarlo a nuevos grupos sin necesidad de crear un nuevo usuario.
                </p>
              </CardContent>
            </Card>

            <StepCard 
              number={1} 
              title="Buscar al usuario" 
              description="Localice al tutor/auditor en USUARIOS."
              icon={Search}
            />
            <StepCard 
              number={2} 
              title="Clic en 'Asignar a grupo'" 
              description="Disponible en la ficha del usuario."
              icon={Users}
            />
            <StepCard 
              number={3} 
              title="Seleccionar grupo(s)" 
              description="Puede asignar al mismo tutor a múltiples grupos."
              icon={CheckCircle2}
            />

            <InfoCard icon={Shield} title="Permisos de Auditor" variant="note">
              <p>Los <strong>auditores</strong> tienen acceso automático a las formaciones finalizadas sin necesidad de configurar días de prórroga.</p>
            </InfoCard>
          </div>
        </div>
      ),
    },
    {
      id: "verify",
      number: "7",
      title: "COMPROBACIÓN DE ASIGNACIONES",
      icon: CheckCircle2,
      content: (
        <div>
          <CoverPage number="7" title="Comprobación de Asignaciones" icon={CheckCircle2} />

          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                Una vez realizadas las asignaciones, es importante verificar que todos los usuarios están correctamente vinculados a sus grupos correspondientes.
              </p>
            </CardContent>
          </Card>

          <h3 className="text-xl font-bold text-gray-800 mb-4">Métodos de verificación</h3>

          <FeatureGrid features={[
            { icon: Users, title: "Desde el Grupo", description: "Acceda al grupo y visualice la lista de usuarios asignados." },
            { icon: GraduationCap, title: "Desde el Alumno", description: "En la ficha del alumno, consulte los grupos en los que está matriculado." },
            { icon: Shield, title: "Desde el Tutor", description: "Verifique los grupos asignados al tutor en su perfil de usuario." },
            { icon: BarChart3, title: "Informe de Asignaciones", description: "Genere un informe completo desde la sección de Informes." },
          ]} />

          <InfoCard icon={CheckCircle2} title="Verificación Completa" variant="tip">
            <p>Antes del inicio de la formación, verifique que:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Todos los alumnos están correctamente matriculados</li>
              <li>Los tutores tienen acceso al grupo</li>
              <li>Las fechas del grupo son correctas</li>
              <li>La acción formativa asignada es la adecuada</li>
            </ul>
          </InfoCard>

          <div className={`mt-8 p-6 rounded-xl ${theme.headerBg} text-white`}>
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">¿Necesita ayuda?</h3>
            </div>
            <p className="opacity-90 mb-4">
              Si tiene dudas sobre algún proceso, contacte con el soporte técnico del campus.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-0">
                <Mail className="w-3 h-3 mr-1" />
                formacion.empleate@gmail.com
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <MessageCircle className="w-3 h-3 mr-1" />
                665 673 416
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Sidebar - Índice */}
      <div className="w-80 bg-white border-r shadow-sm flex flex-col print:hidden">
        {/* Header */}
        <div className={`p-6 ${theme.headerBg} text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Campus Empleate</h1>
              <p className="text-sm opacity-80">Guía de Administración</p>
            </div>
          </div>
        </div>

        {/* Index Header */}
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            ÍNDICE
          </h2>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sections.map((section) => (
              <div key={section.id}>
                <Button
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left mb-1 h-auto py-3 ${
                    activeSection === section.id 
                      ? `${theme.accentBg} text-white hover:bg-teal-700` 
                      : 'hover:bg-teal-50'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 shrink-0 ${
                    activeSection === section.id ? 'bg-white/20' : theme.highlight
                  }`}>
                    <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-white' : theme.accent}`} />
                  </span>
                  <span className="truncate text-sm">
                    <span className="font-bold mr-1">{section.number}</span>
                    {section.title}
                  </span>
                </Button>
                
                {section.subsections && activeSection === section.id && (
                  <div className="ml-10 mb-2 space-y-1">
                    {section.subsections.map((sub) => (
                      <a
                        key={sub.id}
                        href={`#${sub.id}`}
                        className={`flex items-center gap-2 text-sm ${theme.accent} hover:underline py-1 px-2 rounded`}
                      >
                        <ChevronRight className="w-3 h-3" />
                        {sub.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Building2 className="w-4 h-4" />
            <span>TalentCloud Solution © 2024</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-4xl mx-auto">
            {sections.find((s) => s.id === activeSection)?.content}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CampusVirtualGuide;
