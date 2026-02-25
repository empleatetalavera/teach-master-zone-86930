import { BookOpen, Users, FileText, Clock, Target, Award, CheckCircle2, GraduationCap, Building2, Calendar, ClipboardList, BarChart3, Briefcase, Settings, Globe, MapPin, Phone, Mail, Download, Monitor, Laptop, FileCheck, UserCog, Shield } from "lucide-react";
import { generateAnnexCalendarPDF } from "@/lib/generateAnnexCalendarPDF";
import { generateProyectoFormativoPDF } from "@/lib/generateProyectoFormativoPDF";
import { Button } from "@/components/ui/button";
import { CourseAnnexesUploader } from "./CourseAnnexesUploader";
import { useCenterBranding } from "@/hooks/useCenterBranding";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Module {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number;
  formative_units?: FormativeUnit[];
}

interface FormativeUnit {
  id: string;
  title: string;
  description?: string | null;
  duration_hours?: number | null;
  objectives?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface CourseTrainingProgramProps {
  course: {
    id?: string;
    title: string;
    description?: string;
    duration_hours?: number;
    objectives?: string;
    specific_objectives?: string[];
    training_center_id?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    // New dynamic fields
    course_code?: string | null;
    professional_family?: string | null;
    qualification_level?: number | null;
    modality?: string | null;
    scope?: string | null;
    max_students?: number | null;
    presential_hours?: number | null;
    internship_hours?: number | null;
    training_program_pdf_url?: string | null;
  };
  modules: Module[];
  centerSlug?: string | null;
  centerContact?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    cif?: string;
  } | null;
  isEditable?: boolean;
}

// Default values - will be overridden by course/center data
const defaultCenterData = {
  nombre: "Centro de Formación",
  cif: "",
  web: "",
  direccion: "",
  codigoPostal: "",
  localidad: "",
  provincia: "",
  ambitoGeografico: "ESTATAL",
  maximoAlumnos: 15
};

// Planificación didáctica completa basada en el Anexo III/IV del SEPE
const planificacionDidactica = [
  {
    modulo: "MF0969_1: Técnicas administrativas básicas de oficina",
    horasMF: 150,
    tutores: 1,
    unidades: [
      { codigo: "UF0517", titulo: "Organización empresarial y de recursos humanos", horas: 30, dias: "Del día 1 al día 11" },
      { codigo: "UF0518", titulo: "Gestión auxiliar de la correspondencia y paquetería en la empresa", horas: 30, dias: "Del día 12 al día 22" },
      { codigo: "UF0519", titulo: "Gestión auxiliar de documentación económico-administrativa y comercial", horas: 90, dias: "Del día 23 al día 60" }
    ]
  },
  {
    modulo: "MF0970_1: Operaciones básicas de comunicación",
    horasMF: 120,
    tutores: 1,
    unidades: [
      { codigo: "UF0520", titulo: "Comunicación en las relaciones profesionales", horas: 50, dias: "Del día 61 al día 79" },
      { codigo: "UF0521", titulo: "Comunicación oral y escrita en la empresa", horas: 70, dias: "Del día 80 al día 108" }
    ]
  },
  {
    modulo: "MF0971_1: Reproducción y archivo",
    horasMF: 120,
    tutores: 1,
    unidades: [
      { codigo: "UF0513", titulo: "Gestión auxiliar de archivo en soporte convencional o informático", horas: 60, dias: "Del día 109 al día 131" },
      { codigo: "UF0514", titulo: "Gestión auxiliar de reproducción en soporte convencional o informático", horas: 60, dias: "Del día 132 al día 156" }
    ]
  },
  {
    modulo: "MP0112: Módulo de prácticas profesionales no laborales",
    horasMF: 40,
    tutores: 1,
    unidades: [
      { codigo: "MP0112", titulo: "Prácticas profesionales no laborales", horas: 40, dias: "Del día 157 al día 166" }
    ]
  }
];

// Requisitos técnicos de la plataforma
const requisitosDelSistema = {
  conexion: "Ancho de banda mínimo de 1 Mbps",
  navegadores: [
    "Internet Explorer, versión superior o igual a 10.0",
    "Mozilla Firefox, versión superior o igual a 5.0",
    "Google Chrome, versión superior o igual a 5.0"
  ],
  resolucion: "1024 x 768 píxeles mínimo",
  software: [
    "Office 2003 o superior",
    "Java (http://www.java.com/es/download)",
    "Acrobat Reader (http://get.adobe.com/es/reader/)",
    "WinZip (http://www.winzip.com)"
  ],
  hardware: [
    "Monitor (recomendado 17\")",
    "Teclado y ratón",
    "Procesador Intel Core i3",
    "Memoria (RAM) 2Gb"
  ]
};

// Recursos humanos disponibles
const perfilesRecursosHumanos = [
  { perfil: "Personal de venta/captación", descripcion: "Gestión de solicitudes de inscripción y atención de consultas durante el proceso" },
  { perfil: "Personal administrativo y de orientación académica", descripcion: "Comprobación de requisitos, prueba de competencia digital y asesoramiento académico" },
  { perfil: "Tutor-formador", descripcion: "Acogida, seguimiento del aprendizaje, corrección de actividades y tutorías virtuales/presenciales" },
  { perfil: "Formador (sesiones presenciales)", descripcion: "Desarrollo de tutorías presenciales y pruebas de evaluación final" },
  { perfil: "Personal informático", descripcion: "Resolución de consultas técnicas y mantenimiento de la plataforma" },
  { perfil: "Tutor de empresa", descripcion: "Supervisión y apoyo durante las prácticas profesionales no laborales" }
];

export function CourseTrainingProgram({ course, modules, centerSlug, centerContact, isEditable = false }: CourseTrainingProgramProps) {
  const { branding } = useCenterBranding(centerSlug);

  const totalModules = modules.length;
  const totalUnits = modules.reduce((acc, m) => acc + (m.formative_units?.length || 0), 0);

  // Build center data from props or defaults
  const datosDelCentro = {
    nombre: centerContact?.name || branding.centerName || defaultCenterData.nombre,
    cif: centerContact?.cif || defaultCenterData.cif,
    web: defaultCenterData.web, // No web field in training_centers
    direccion: centerContact?.address || defaultCenterData.direccion,
    codigoPostal: centerContact?.postal_code || defaultCenterData.codigoPostal,
    localidad: centerContact?.city || defaultCenterData.localidad,
    provincia: centerContact?.province || defaultCenterData.provincia,
    ambitoGeografico: course.scope || defaultCenterData.ambitoGeografico,
    maximoAlumnos: course.max_students || defaultCenterData.maximoAlumnos
  };

  // Get course-specific data or show placeholders
  const courseCode = course.course_code || "Sin código";
  const professionalFamily = course.professional_family || course.category || "Sin especificar";
  const qualificationLevel = course.qualification_level ?? null;
  const modality = course.modality || "teleformacion";
  const presentialHours = course.presential_hours ?? 10;
  const internshipHours = course.internship_hours ?? 90;

  // Get modality display text
  const getModalityText = (m: string) => {
    switch (m) {
      case 'teleformacion': return 'Teleformación';
      case 'presencial': return 'Presencial';
      case 'mixta': return 'Mixta';
      default: return 'Teleformación';
    }
  };

  // Generate dynamic planning from actual modules
  const planificacionDinamica = modules.map((mod, index) => {
    const units = mod.formative_units || [];
    return {
      modulo: mod.title,
      horasMF: mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : 0,
      tutores: 1,
      unidades: units.map((uf, ufIndex) => ({
        codigo: `UF${String(index + 1).padStart(2, '0')}${String(ufIndex + 1).padStart(2, '0')}`,
        titulo: uf.title,
        horas: uf.duration_hours || 0,
        dias: uf.start_date && uf.end_date 
          ? `Del ${new Date(uf.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${new Date(uf.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
          : "Por programar"
      }))
    };
  });

  const handleDownloadPDF = () => {
    try {
      if (course.training_program_pdf_url) {
        const opened = window.open(course.training_program_pdf_url, '_blank', 'noopener,noreferrer');

        if (!opened) {
          const link = document.createElement('a');
          link.href = course.training_program_pdf_url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return;
      }

      generateProyectoFormativoPDF({
        courseTitle: course.title,
        courseCode: course.course_code || "SSC_C_017_5B",
        durationHours: course.duration_hours || 0,
        startDate: course.start_date,
        endDate: course.end_date,
        objectives: course.objectives,
        professionalFamily: course.professional_family || course.category || "Servicios Socioculturales y a la Comunidad",
        qualificationLevel: course.qualification_level,
        modules: modules,
        centerName: datosDelCentro.nombre,
        centerPhone: centerContact?.phone,
        centerEmail: centerContact?.email,
        centerAddress: datosDelCentro.direccion,
        centerCity: datosDelCentro.localidad,
        centerProvince: datosDelCentro.provincia,
        centerPostalCode: datosDelCentro.codigoPostal,
        centerCif: datosDelCentro.cif,
      });
    } catch (error) {
      console.error('Error generating training program PDF:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-2xl font-bold text-primary mb-2">
          PROGRAMA FORMATIVO
        </h1>
        <p className="text-lg text-muted-foreground">
          {course.title}
        </p>
        <p className="text-sm mt-2" style={{ color: branding.secondaryColor }}>
          {branding.centerName}
        </p>
        
        {/* Download Button */}
        <div className="mt-4">
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar Proyecto Formativo (PDF)
          </Button>
        </div>
      </div>

      {/* Section 1: Datos del Centro */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">1. Datos del Centro de Formación</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="font-medium">Nombre:</span>
              <span className="text-muted-foreground">{datosDelCentro.nombre}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">CIF:</span>
              <span className="text-muted-foreground">{datosDelCentro.cif}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium">Web:</span>
              <span className="text-muted-foreground">{datosDelCentro.web}</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <span className="font-medium">Dirección:</span>
                <p className="text-muted-foreground">{datosDelCentro.direccion}</p>
                <p className="text-muted-foreground">{datosDelCentro.codigoPostal} {datosDelCentro.localidad} ({datosDelCentro.provincia})</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium">Ámbito:</span>
              <Badge variant="secondary">{datosDelCentro.ambitoGeografico}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Caracterización */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">2. Caracterización de la Acción Formativa</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">Denominación:</span>
            </div>
            <p className="text-muted-foreground ml-6">{course.title}</p>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">Código:</span>
              <span className="text-muted-foreground">{courseCode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="font-medium">Familia Profesional:</span>
              <span className="text-muted-foreground">{professionalFamily}</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Duración:</span>
              <Badge variant="secondary">{course.duration_hours || 'N/D'} horas</Badge>
            </div>
            {qualificationLevel !== null && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="font-medium">Nivel de Cualificación:</span>
                <Badge>{qualificationLevel}</Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium">Modalidad:</span>
              <span className="text-muted-foreground">{getModalityText(modality)}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats - Dynamic */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalModules}</div>
            <div className="text-xs text-muted-foreground">Módulos Formativos</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalUnits}</div>
            <div className="text-xs text-muted-foreground">Unidades Formativas</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{course.duration_hours || 0}h</div>
            <div className="text-xs text-muted-foreground">Duración Total</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{internshipHours}h</div>
            <div className="text-xs text-muted-foreground">Prácticas Empresa</div>
          </div>
        </div>
      </section>

      {/* Section 3: Objectives (renumbered) */}

      {/* Section 4: Objectives */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">4. Objetivos</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">4.1 Objetivo General</h3>
            <p className="text-sm text-muted-foreground">
              {course.objectives || "Distribuir, reproducir y transmitir la información y documentación requeridas en las tareas administrativas y de gestión, internas y externas, así como realizar trámites elementales de verificación de datos y documentos a requerimiento de técnicos de nivel superior con eficacia, de acuerdo con instrucciones o procedimientos establecidos."}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">4.2 Objetivos Específicos</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Realizar e integrar operaciones de apoyo administrativo básico</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Transmitir y recibir información operativa en gestiones rutinarias con agentes externos</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Realizar operaciones auxiliares de reproducción y archivo en soporte convencional o informático</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: Methodology */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">5. Metodología</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">5.1 Modalidad de Impartición</h3>
            <p className="text-sm text-muted-foreground">
              La acción formativa se desarrollará en modalidad <strong>teleformación</strong>, a través del 
              campus virtual, permitiendo el acceso flexible a los contenidos las 24 horas del día.
            </p>
          </div>

          {/* Pasos de la Metodología con letras */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-4">5.2 Proceso de Aprendizaje</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">A</div>
                <div>
                  <h4 className="font-semibold text-blue-800">Introducción al Módulo/UF</h4>
                  <p className="text-sm text-blue-900">Ve el vídeo de presentación, descarga objetivos y realiza el cuestionario previo.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">B</div>
                <div>
                  <h4 className="font-semibold text-green-800">Formación en Campus Virtual</h4>
                  <p className="text-sm text-green-900">Estudia el CIM, realiza actividades de aprendizaje, participa en foros y completa tests.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">C</div>
                <div>
                  <h4 className="font-semibold text-amber-800">Tutorías Presenciales</h4>
                  <p className="text-sm text-amber-900">Acude a las sesiones presenciales para actividades prácticas.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">D</div>
                <div>
                  <h4 className="font-semibold text-purple-800">Tutorías Virtuales</h4>
                  <p className="text-sm text-purple-900">Asiste a tutorías de repaso por videoconferencia o chat.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold flex-shrink-0">E</div>
                <div>
                  <h4 className="font-semibold text-red-800">Evaluación Final</h4>
                  <p className="text-sm text-red-900">Realiza la prueba de evaluación final presencial en el centro.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-4">5.3 Recursos Didácticos</h3>
            
            {/* Tabla Alumno / Tutor-Formador */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="bg-primary text-primary-foreground font-bold text-center py-2 text-sm border-r border-primary-foreground/20">
                  ALUMNO
                </div>
                <div className="bg-primary text-primary-foreground font-bold text-center py-2 text-sm">
                  TUTOR-FORMADOR
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm">
                {/* Columna Alumno */}
                <div className="border-r p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Guía del alumno.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Guía del Contenido Interactivo Multimedia.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Guía del Campus (Ayuda).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Contenidos Interactivos Multimedia + Ejercicios de Autoevaluación.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Actividades de aprendizaje (casos prácticos, vídeos, documentos complementarios, foros, etc.).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Test de autoevaluación al final de cada unidad de aprendizaje (tema) y test de evaluación final de la unidad o módulo formativo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Tutoría presencial – Cuaderno del alumno.</span>
                  </div>
                </div>
                {/* Columna Tutor-Formador */}
                <div className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Guía del tutor-formador.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Guía del Contenido Interactivo Multimedia.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Guía del Campus (Ayuda).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Actividades de aprendizaje (casos prácticos, vídeos, documentos complementarios, foros, etc.).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Orientaciones metodológicas para el desarrollo de las actividades de aprendizaje.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Tutoría presencial – Cuaderno del formador.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Evaluation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">6. Sistema de Evaluación (Anexo V)</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-3">6.1 Tipos de Evaluación</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  A
                </div>
                <div>
                  <h4 className="font-medium text-sm">Autoevaluaciones</h4>
                  <p className="text-xs text-muted-foreground">Tests de repaso sin impacto en la nota final (integrados en el CIM)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  B
                </div>
                <div>
                  <h4 className="font-medium text-sm">Actividades de Aprendizaje Evaluables</h4>
                  <p className="text-xs text-muted-foreground">Casos prácticos y ejercicios evaluados por el tutor (30% nota)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  C
                </div>
                <div>
                  <h4 className="font-medium text-sm">Evaluaciones Finales Presenciales</h4>
                  <p className="text-xs text-muted-foreground">Exámenes por módulo/unidad formativa en el centro (70% nota)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-1">1ª Convocatoria</h4>
              <p className="text-sm text-green-700">
                Al finalizar cada módulo/unidad formativa
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-1">2ª Convocatoria</h4>
              <p className="text-sm text-amber-700">
                Fecha alternativa si no superas la primera
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="font-semibold text-red-800 mb-1">Criterios de Superación</h4>
            <p className="text-sm text-red-900">
              Para superar la acción formativa es necesario obtener una calificación mínima del <strong>50%</strong> en 
              cada uno de los módulos y completar todas las actividades obligatorias.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Tutoring */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">7. Sistema Tutorial</h2>
        </div>
        
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm">
            Durante toda la acción formativa contarás con el apoyo de un tutor-formador especializado 
            que te guiará en el proceso de aprendizaje.
          </p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Tutorías Virtuales</h4>
              <p className="text-xs text-muted-foreground">
                Semanalmente: repaso de contenidos y consulta de dudas a través de videoconferencia, chat y foros.
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Tutorías Presenciales</h4>
              <p className="text-xs text-muted-foreground">
                10 horas presenciales (días 150-153) para actividades prácticas y preparación de evaluación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Contact */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">8. Contacto y Atención al Usuario</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Centro de Formación</h4>
            <div className="space-y-2 text-sm">
              <p><strong>{datosDelCentro.nombre}</strong></p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{datosDelCentro.direccion}</span>
              </div>
              <p className="ml-6">{datosDelCentro.codigoPostal} {datosDelCentro.localidad} ({datosDelCentro.provincia})</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 space-y-3 bg-primary/5">
            <h4 className="font-semibold">Centro de Atención al Usuario (CAU)</h4>
            <div className="space-y-2 text-sm">
              {centerContact?.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span><strong>Teléfono:</strong> {centerContact.phone}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono no especificado</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span><strong>Horario:</strong> L-V de 09:00 a 15:00</span>
              </div>
              {centerContact?.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span><strong>Email:</strong> {centerContact.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email no especificado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Requisitos Técnicos */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Monitor className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">9. Requisitos Técnicos del Sistema</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Conexión y Navegadores
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {requisitosDelSistema.conexion}
              </li>
              {requisitosDelSistema.navegadores.map((nav, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {nav}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Resolución mínima: {requisitosDelSistema.resolucion}
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Laptop className="h-4 w-4 text-primary" />
              Hardware y Software
            </h4>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-muted-foreground">Hardware recomendado:</p>
              <ul className="space-y-1 ml-4">
                {requisitosDelSistema.hardware.map((hw, i) => (
                  <li key={i}>• {hw}</li>
                ))}
              </ul>
              <p className="font-medium text-muted-foreground mt-3">Software necesario:</p>
              <ul className="space-y-1 ml-4">
                {requisitosDelSistema.software.map((sw, i) => (
                  <li key={i}>• {sw}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Recursos Humanos */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">10. Recursos Humanos</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          La entidad cuenta con los siguientes perfiles profesionales para garantizar el correcto desarrollo de la acción formativa:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {perfilesRecursosHumanos.map((recurso, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm text-primary mb-2">{recurso.perfil}</h4>
              <p className="text-xs text-muted-foreground">{recurso.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 11: Sistema de Gestión de Calidad */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">11. Sistema de Gestión de Calidad</h2>
        </div>
        
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-4">
            La entidad tiene implantado un sistema de gestión de la calidad de la formación basado en la norma 
            <strong> UNE-EN-ISO 9001:2015</strong>, con el siguiente alcance:
          </p>
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm italic">
              "Prestación de servicios de formación en general, incluyendo formación profesional para el empleo 
              y certificados de profesionalidad."
            </p>
          </div>
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div className="text-center p-3 border rounded-lg">
              <FileCheck className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium">Indicadores de Calidad</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <BarChart3 className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium">Mejora Continua</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium">Auditorías Internas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ANEXO I: Calendario y Plan de Trabajo - Descarga PDF */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Anexo I: Calendario y Plan de Trabajo</h2>
        </div>
        <div className="border rounded-lg p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Documento detallado con la tabla resumen de módulos y unidades formativas, calendario de sesiones,
            prescripciones de formadores y plan de trabajo sesión a sesión.
          </p>
          <Button 
            onClick={() => generateAnnexCalendarPDF({
              courseTitle: course.title,
              courseCode: courseCode,
              durationHours: course.duration_hours || 0,
              presentialHours: presentialHours,
              internshipHours: internshipHours,
              modules: modules,
              centerName: datosDelCentro.nombre,
              centerCity: datosDelCentro.localidad,
              startDate: course.start_date,
              endDate: course.end_date,
            })}
            className="gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Descargar Anexo I - Calendario y Plan de Trabajo (PDF)
          </Button>
        </div>
      </section>

      {/* Proyecto Formativo Aula Virtual - Descarga PDF */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Proyecto Formativo - Aula Virtual (F11)</h2>
        </div>
        <div className="border rounded-lg p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Documento F11 con la programación didáctica por módulo y unidad formativa,
            recursos humanos y técnicos del aula virtual, y formación en PRL.
          </p>
          <Button 
            onClick={() => generateProyectoFormativoPDF({
              courseTitle: course.title,
              courseCode: courseCode,
              durationHours: course.duration_hours || 0,
              startDate: course.start_date,
              endDate: course.end_date,
              objectives: course.objectives,
              professionalFamily: course.professional_family || course.category,
              qualificationLevel: course.qualification_level,
              modules: modules,
              centerName: datosDelCentro.nombre,
              centerPhone: centerContact?.phone,
              centerEmail: centerContact?.email,
              centerAddress: datosDelCentro.direccion,
              centerCity: datosDelCentro.localidad,
              centerProvince: datosDelCentro.provincia,
              centerPostalCode: datosDelCentro.codigoPostal,
              centerCif: centerContact?.cif,
            })}
            className="gap-2"
            size="lg"
            variant="outline"
          >
            <Download className="h-5 w-5" />
            Descargar Proyecto Formativo Aula Virtual - F11 (PDF)
          </Button>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-6 border-t text-sm text-muted-foreground">
        <p>Documento conforme a los Anexos III, IV y V {courseCode !== "Sin código" ? `de la especialidad formativa ${courseCode}` : "de la acción formativa"}</p>
        <p className="mt-2">Versión 1.0 - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
