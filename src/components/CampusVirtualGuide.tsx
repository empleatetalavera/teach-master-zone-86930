import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Monitor, 
  Settings, 
  Users, 
  UserPlus, 
  UserCheck, 
  ClipboardCheck,
  ChevronRight,
  Home,
  Star,
  Video,
  Calendar,
  MessageSquare,
  BarChart3,
  FileText,
  Cog,
  Layout,
  GraduationCap,
  Tablet,
  Smartphone,
  Globe,
  Search,
  Edit,
  Plus,
  Save,
  CheckCircle2
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

  const sections: GuideSection[] = [
    {
      id: "intro",
      number: "1",
      title: "INTRODUCCIÓN AL CAMPUS VIRTUAL",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">1. INTRODUCCIÓN AL CAMPUS VIRTUAL</h2>
            <p className="text-lg opacity-90">TalentCloud Solution - Plataforma de Formación Online</p>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed text-gray-700">
              El <strong>Campus Virtual TalentCloud</strong> es una plataforma para la gestión e impartición de acciones formativas online, 
              dividida en dos entornos claramente diferenciados: el <strong>entorno virtual de formación</strong>, al que pueden acceder 
              alumnado, tutores/as, coordinadores/as y auditores/as; y el <strong>entorno de administración</strong>, dirigido a los 
              perfiles de gestión de la plataforma.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <p className="text-blue-800">
                Asimismo, el entorno virtual de formación permite el uso de herramientas de comunicación <strong>síncronas</strong> 
                (videoconferencia, chat, etc.) y <strong>asíncronas</strong> (foros, correo, mensajes emergentes, etc.).
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Monitor className="w-10 h-10 text-teal-600" />
                <div>
                  <p className="font-semibold">Versión PC</p>
                  <p className="text-sm text-gray-600">Acceso completo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Tablet className="w-10 h-10 text-teal-600" />
                <div>
                  <p className="font-semibold">Tablet</p>
                  <p className="text-sm text-gray-600">Totalmente adaptado</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Smartphone className="w-10 h-10 text-teal-600" />
                <div>
                  <p className="font-semibold">Smartphone</p>
                  <p className="text-sm text-gray-600">Formación móvil</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700">
              El Campus Virtual es accesible desde tablet o smartphone, donde tendremos todas las utilidades de la versión PC, 
              pero adaptadas a este tipo de dispositivos. La versión móvil nos permite ofrecer una <strong>formación online 
              efectiva y sin excusas</strong>: accesible desde cualquier sitio y a cualquier hora.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "interfaz",
      number: "2",
      title: "INTERFAZ DEL CAMPUS VIRTUAL",
      icon: Monitor,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">2. INTERFAZ DEL CAMPUS VIRTUAL</h2>
            <p className="text-lg opacity-90">Panel de control y recursos disponibles</p>
          </div>
          
          <p className="text-lg text-gray-700">
            Cuando accedemos con perfil de administrador al Campus Virtual podemos ver nuestro 
            <strong> panel de control</strong> con todos los recursos disponibles para configurar la formación.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Star className="w-6 h-6 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">FAVORITOS</h4>
                    <p className="text-sm text-gray-600">
                      Sección personalizable con las herramientas más utilizadas. Aparecerán en la zona superior 
                      para acceso rápido. Clic en la estrella para marcar como favorito.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Video className="w-6 h-6 text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">VÍDEOS DE AYUDA</h4>
                    <p className="text-sm text-gray-600">
                      Consulta vídeos explicativos sobre las distintas herramientas del campus y cómo utilizarlas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">PROGRAMACIÓN DE CURSOS</h4>
                    <p className="text-sm text-gray-600">
                      Servicios principales para la programación del curso: grupos, alumnos, usuarios, calendarios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">COMUNICACIÓN</h4>
                    <p className="text-sm text-gray-600">
                      Recursos para comunicarse con los diferentes usuarios: mensajería, foros, avisos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">SEGUIMIENTO</h4>
                    <p className="text-sm text-gray-600">
                      Acceso a recursos para realizar seguimiento de alumnado y tutores/as en tiempo real.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">INFORMES</h4>
                    <p className="text-sm text-gray-600">
                      Extensa relación de informes para seguimiento de formaciones, alumnado, equipo docente y calificaciones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Layout className="w-6 h-6 text-indigo-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">PERSONALIZACIÓN DE LA FORMACIÓN</h4>
                    <p className="text-sm text-gray-600">
                      Herramientas para personalizar acciones formativas o crear nuevas con contenidos propios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Cog className="w-6 h-6 text-teal-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">CONFIGURACIÓN CAMPUS</h4>
                    <p className="text-sm text-gray-600">
                      Configuración de recursos e información general del campus virtual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "config",
      number: "3",
      title: "CONFIGURACIÓN INICIAL PARA SEGUIMIENTO DE ALUMNOS",
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">3. CONFIGURACIÓN INICIAL PARA SEGUIMIENTO DE ALUMNOS</h2>
            <p className="text-lg opacity-90">Configuración fundamental para el correcto seguimiento</p>
          </div>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-amber-800">
              <strong>Importante:</strong> Una vez conocemos la estructura de la formación en el Campus Virtual, 
              el primer paso será revisar la configuración de seguimiento de alumnos. Esta configuración inicial 
              será fundamental para hacer un correcto seguimiento del alumnado.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Pasos para la configuración:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Acceder con perfil Administrador</p>
                  <p className="text-sm text-gray-600">Inicia sesión con tus credenciales de administrador del centro</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Ir a la sección SEGUIMIENTO</p>
                  <p className="text-sm text-gray-600">En el menú lateral, busca la sección de seguimiento de alumnos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Acceder a CONFIGURACIÓN SEGUIMIENTO DE ALUMNOS</p>
                  <p className="text-sm text-gray-600">Se abrirá una pestaña con diferentes opciones de configuración</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium">Configurar opciones de visualización</p>
                  <p className="text-sm text-gray-600">Personaliza qué información se mostrará en las herramientas de seguimiento</p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-teal-800 mb-3">Opciones de configuración disponibles:</h4>
              <ul className="space-y-2 text-teal-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tiempo de conexión del alumno</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Progreso en contenidos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Calificaciones obtenidas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Participación en foros</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entrega de actividades</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "grupos",
      number: "4",
      title: "ALTA DE UN NUEVO GRUPO",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">4. ALTA DE UN NUEVO GRUPO</h2>
            <p className="text-lg opacity-90">Creación y configuración de grupos de formación</p>
          </div>
          
          <p className="text-lg text-gray-700">
            Una vez realizada la configuración inicial de seguimiento, el primer paso para la matriculación 
            de un alumno/a será la <strong>creación de un nuevo grupo o edición</strong>.
          </p>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Proceso de creación:</h3>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Acceder desde perfil Administrador</p>
                  <p className="text-sm text-gray-600">En la sección PROGRAMACIÓN DE CURSOS → GRUPOS</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Ventana de gestión de Grupos</p>
                  <p className="text-sm text-gray-600">Podrás buscar, editar o crear nuevos grupos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Clic en "Nuevo" para crear grupo</p>
                  <p className="text-sm text-gray-600">Se abrirá ventana de configuración del nuevo grupo</p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="border-2 border-teal-200">
            <CardHeader className="bg-teal-50">
              <CardTitle className="text-teal-800">Campos obligatorios para crear un grupo</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <span className="text-red-500">*</span> Código de grupo
                  </div>
                  <p className="text-sm text-gray-600">
                    Identificador único. Puede contener letras y/o números.
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <span className="text-red-500">*</span> Nombre de grupo
                  </div>
                  <p className="text-sm text-gray-600">
                    Nombre visible para el alumnado como título del curso.
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <span className="text-red-500">*</span> Acción formativa
                  </div>
                  <p className="text-sm text-gray-600">
                    Contenido del catálogo o propio a asignar al grupo.
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <span className="text-red-500">*</span> Fecha de inicio
                  </div>
                  <p className="text-sm text-gray-600">
                    Fecha en la que iniciará la formación el grupo.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Nota:</strong> La fecha fin no es obligatoria, pero se recomienda establecerla para que, 
                  una vez llegada, el alumnado no pueda acceder más al curso. También es necesaria para el correcto 
                  funcionamiento de herramientas como la agenda del grupo.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Edit className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-green-800">Para editar un grupo existente:</p>
                <p className="text-sm text-green-700">
                  Realiza la búsqueda del grupo y posteriormente selecciona la opción de editar el grupo correspondiente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "matriculacion",
      number: "5",
      title: "MATRICULACIÓN DE UN ALUMNO",
      icon: UserPlus,
      subsections: [
        { id: "alta-alumno", title: "5.1 Cómo dar de alta a un alumno" },
        { id: "matricular-grupo", title: "5.2 Cómo matricular a un alumno en un grupo" }
      ],
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">5. MATRICULACIÓN DE UN ALUMNO</h2>
            <p className="text-lg opacity-90">Alta y asignación de alumnos a grupos</p>
          </div>
          
          {/* Subsección 5.1 */}
          <div id="alta-alumno" className="space-y-4">
            <h3 className="text-2xl font-semibold text-teal-700 border-b-2 border-teal-200 pb-2">
              5.1 Cómo dar de alta a un alumno en el Campus Virtual
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Acceder a PROGRAMACIÓN DE CURSOS → GESTIÓN DE ALUMNOS</p>
                  <p className="text-sm text-gray-600">Desde aquí podrás buscar, editar o crear nuevos alumnos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Clic en "Nuevo" para crear alumno</p>
                  <p className="text-sm text-gray-600">Se abrirá ventana con campos a completar</p>
                </div>
              </div>
            </div>
            
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <span className="text-red-500">*</span> Campos obligatorios del alumno
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Idioma", "Nombre", "Primer apellido", "Tipo documento", "Nº documento", "Usuario", "Contraseña", "E-mail"].map((campo) => (
                    <div key={campo} className="p-3 bg-white border rounded-lg text-center">
                      <p className="font-medium text-gray-700">{campo}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Importante:</strong> Los campos "usuario" y "contraseña" son los que el alumno/a 
                    utilizará para acceder al campus. A través del e-mail recibirá notificaciones y el mail 
                    de bienvenida con sus claves de acceso.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Save className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-green-800">Al guardar el alumno:</p>
                <p className="text-sm text-green-700">
                  Aparecerá una ventana que te da la posibilidad de matricularlo directamente en un grupo. 
                  Si clicas en "Aceptar", podrás buscar el grupo y asignar al alumno.
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          {/* Subsección 5.2 */}
          <div id="matricular-grupo" className="space-y-4">
            <h3 className="text-2xl font-semibold text-teal-700 border-b-2 border-teal-200 pb-2">
              5.2 Cómo matricular a un alumno en un grupo
            </h3>
            
            <p className="text-gray-700">
              Si en el momento del alta no realizaste la asignación a un grupo, podrás realizarla posteriormente:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Ir a PROGRAMACIÓN DE CURSOS → GESTIÓN DE ALUMNOS</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Buscar al alumno/a a matricular</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Clic en botón "Asignar a grupo"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium">Buscar y seleccionar el grupo, clic en "Asignar"</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>💡 Tip:</strong> Puedes matricular al alumno/a en tantos grupos como necesites de forma simultánea.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "tutores",
      number: "6",
      title: "USUARIOS TUTORES Y AUDITORES",
      icon: GraduationCap,
      subsections: [
        { id: "alta-tutor", title: "6.1 Cómo dar de alta un tutor/auditor en un grupo" },
        { id: "asignar-tutor", title: "6.2 Cómo asignar un tutor/auditor existente a un nuevo grupo" }
      ],
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">6. USUARIOS TUTORES Y AUDITORES</h2>
            <p className="text-lg opacity-90">Gestión del equipo docente y de auditoría</p>
          </div>
          
          {/* Subsección 6.1 */}
          <div id="alta-tutor" className="space-y-4">
            <h3 className="text-2xl font-semibold text-teal-700 border-b-2 border-teal-200 pb-2">
              6.1 Cómo dar de alta un tutor/auditor en un grupo ya existente
            </h3>
            
            <p className="text-gray-700">
              El proceso es similar a la creación de un alumno, pero accediendo a la herramienta <strong>"Usuarios"</strong>:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Accede con perfil Administrador</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Ve a ADMINISTRACIÓN → PROGRAMACIÓN DE CURSOS → USUARIOS</p>
                  <p className="text-sm text-gray-600">Clic en "Nuevo"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Cumplimenta los datos y elige el perfil (TUTOR/AUDITOR)</p>
                  <p className="text-sm text-gray-600">Clic en "Guardar"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium">Asignar a grupo</p>
                  <p className="text-sm text-gray-600">Selecciona el grupo y pulsa "Asignar"</p>
                </div>
              </div>
            </div>
            
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800">Campos de la ficha de usuario</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border rounded-lg">
                    <p className="font-medium text-gray-700">Idioma</p>
                    <p className="text-xs text-gray-500">Obligatorio *</p>
                  </div>
                  <div className="p-3 bg-white border-2 border-purple-300 rounded-lg">
                    <p className="font-medium text-purple-700">Perfil</p>
                    <p className="text-xs text-purple-500">Tutor/Admin/Auditor</p>
                  </div>
                  <div className="p-3 bg-white border rounded-lg">
                    <p className="font-medium text-gray-700">Nombre</p>
                    <p className="text-xs text-gray-500">Obligatorio *</p>
                  </div>
                  <div className="p-3 bg-white border rounded-lg">
                    <p className="font-medium text-gray-700">Primer apellido</p>
                    <p className="text-xs text-gray-500">Obligatorio *</p>
                  </div>
                  <div className="p-3 bg-white border rounded-lg">
                    <p className="font-medium text-gray-700">DNI/NIE</p>
                    <p className="text-xs text-gray-500">Obligatorio *</p>
                  </div>
                  <div className="p-3 bg-white border-2 border-purple-300 rounded-lg">
                    <p className="font-medium text-purple-700">Usuario y Contraseña</p>
                    <p className="text-xs text-purple-500">Acceso al campus</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium">(C)</span>
                    <span className="text-gray-600">Campos obligatorios para Certificados de Profesionalidad</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">(*)</span>
                    <span className="text-gray-600">Campos obligatorios para cualquier formación</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>💡 Días de prórroga:</strong> Permite que el usuario tenga acceso al curso una vez finalizado. 
                Los perfiles de auditores ya cuentan con permiso para acceder sin necesidad de días de prórroga.
              </p>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          {/* Subsección 6.2 */}
          <div id="asignar-tutor" className="space-y-4">
            <h3 className="text-2xl font-semibold text-teal-700 border-b-2 border-teal-200 pb-2">
              6.2 Cómo asignar un tutor/auditor ya existente a un nuevo grupo
            </h3>
            
            <p className="text-gray-700">
              Si el tutor/auditor ya existe en el sistema, puedes asignarlo a nuevos grupos:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Ir a PROGRAMACIÓN DE CURSOS → USUARIOS</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Buscar al tutor/auditor existente</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Seleccionar "Asignar a grupo"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium">Buscar el nuevo grupo y clic en "Asignar"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "verificacion",
      number: "7",
      title: "COMPROBACIÓN DE ASIGNACIÓN DE USUARIOS",
      icon: ClipboardCheck,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">7. COMPROBACIÓN DE ASIGNACIÓN DE USUARIOS</h2>
            <p className="text-lg opacity-90">Verificación del correcto registro de usuarios</p>
          </div>
          
          <p className="text-lg text-gray-700">
            Una vez realizadas las asignaciones, es importante verificar que todos los usuarios 
            han quedado correctamente registrados en sus respectivos grupos.
          </p>
          
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Pasos para la verificación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-white border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <p className="font-medium">Acceder a la sección SEGUIMIENTO</p>
                    <p className="text-sm text-gray-600">Desde el panel de administración</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <p className="font-medium">Seleccionar el grupo a verificar</p>
                    <p className="text-sm text-gray-600">Usar el buscador de grupos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <p className="font-medium">Revisar listado de usuarios asignados</p>
                    <p className="text-sm text-gray-600">Verificar alumnos, tutores y auditores</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <p className="font-medium">Confirmar datos de cada usuario</p>
                    <p className="text-sm text-gray-600">Nombre, rol, fechas de acceso</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Verificar acceso de alumnos</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Usuario y contraseña correctos</li>
                  <li>• Email para notificaciones</li>
                  <li>• Fechas de inicio y fin</li>
                  <li>• Contenidos asignados</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Verificar acceso de tutores</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Perfil asignado correctamente</li>
                  <li>• Permisos de seguimiento</li>
                  <li>• Grupos vinculados</li>
                  <li>• Días de prórroga si aplica</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h4 className="text-xl font-semibold text-teal-800 mb-2">
              ¡Configuración completada!
            </h4>
            <p className="text-teal-700">
              Una vez verificados todos los usuarios, el grupo está listo para iniciar la formación.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex h-[calc(100vh-200px)] bg-gray-100">
      {/* Sidebar - Índice */}
      <div className="w-80 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Guía del Campus Virtual
          </h1>
          <p className="text-sm opacity-80 mt-1">Manual de Administración</p>
        </div>
        
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ÍNDICE</h2>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sections.map((section) => (
              <div key={section.id}>
                <Button
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left mb-1 ${
                    activeSection === section.id 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "hover:bg-teal-50 text-gray-700"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">
                    <span className="font-semibold mr-1">{section.number}</span>
                    {section.title}
                  </span>
                </Button>
                
                {section.subsections && activeSection === section.id && (
                  <div className="ml-6 mb-2">
                    {section.subsections.map((sub) => (
                      <a
                        key={sub.id}
                        href={`#${sub.id}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 py-1 px-2"
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
        
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            TalentCloud Solution © 2024
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

export default CampusVirtualGuide;
