import { useState, useEffect } from "react";
import { 
  FileText, 
  Users, 
  Monitor, 
  CalendarDays, 
  BarChart3, 
  MessageSquare, 
  Settings,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  Trash2,
  Loader2,
  FileIcon,
  Paperclip,
  GraduationCap,
  FileDown
} from "lucide-react";
import { generateTutorGuidePDF } from "@/lib/generateTutorGuidePDF";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useBranding } from "@/hooks/useBranding";

interface AttachedFile {
  name: string;
  url: string;
  uploadedAt: string;
}

interface GuideSection {
  key: string;
  title: string;
  icon: React.ReactNode;
  files: AttachedFile[];
}

const MODULES_SSC = [
  { code: "1705", title: "Programación didáctica de los Grados A, B y C del Sistema de Formación Profesional", hours: 90 },
  { code: "1706", title: "Gestión de materiales, medios y recursos didácticos de los Grados A, B y C del Sistema de Formación Profesional", hours: 90 },
  { code: "1707", title: "Orientación profesional en los Grados A, B y C del Sistema de Formación Profesional", hours: 60 },
  { code: "1783", title: "Evaluación del proceso de enseñanza-aprendizaje de los Grados A, B y C del Sistema de la Formación Profesional", hours: 60 },
  { code: "1784", title: "Procesos para impartir acciones formativas de los Grados A, B y C del Sistema de Formación Profesional", hours: 90 },
  { code: "1785", title: "Acción tutorial de los Grados A, B y C del Sistema de Formación Profesional", hours: 60 },
  { code: "1786", title: "Competencia digital aplicada a la formación profesional", hours: 30 },
  { code: "1782", title: "Sensibilización en prevención de riesgos laborales y medioambientales", hours: 30 },
];

const MODULE_OBJECTIVES: Record<string, { general: string; specifics: string[] }> = {
  "1705": {
    general: "Programar acciones formativas de los Grados A, B y C del Sistema de Formación Profesional, adecuándolas a las características y condiciones de la formación, al perfil de los destinatarios y a la realidad laboral.",
    specifics: [
      "Identificar la normativa vigente del Sistema de Formación Profesional como sistema único e integrado, aplicándola en la programación didáctica.",
      "Analizar la estructura y el contenido de los Grados A, B y C, identificando sus elementos, requisitos, procedimientos de evaluación y acreditación.",
      "Coordinar, con el resto del equipo, la formación técnica y profesional para el desarrollo de las acciones formativas.",
      "Diseñar la programación didáctica de acciones formativas teniendo en cuenta los elementos que la componen.",
      "Temporalizar la programación didáctica secuenciando los contenidos y actividades.",
    ]
  },
  "1706": {
    general: "Seleccionar, elaborar, adaptar y utilizar materiales, medios y recursos didácticos para el desarrollo de contenidos formativos de los Grados A, B y C.",
    specifics: [
      "Seleccionar materiales, medios y recursos didácticos aplicándolos en las distintas acciones formativas.",
      "Diseñar materiales y recursos didácticos dirigidos a favorecer la adquisición del aprendizaje.",
      "Determinar y organizar los recursos personales, espacios/instalaciones y distribución temporal.",
      "Utilizar materiales, medios técnicos y recursos audiovisuales y multimedia según especificaciones técnicas.",
      "Diseñar la evaluación de materiales, medios y recursos didácticos planteados.",
    ]
  },
  "1707": {
    general: "Facilitar información y orientación laboral y promover la calidad de la formación profesional para el empleo en los Grados A, B y C.",
    specifics: [
      "Seleccionar cauces informativos y estrategias de búsqueda y actualización de la información del entorno profesional y productivo.",
      "Determinar técnicas específicas en el proceso de información y orientación profesional al alumnado.",
      "Asesorar al alumnado sobre itinerarios formativos, formación profesional y oportunidades de empleo.",
      "Analizar mecanismos que garanticen la calidad de las acciones formativas.",
      "Aplicar competencias digitales en el proceso de búsqueda de información y orientación profesional.",
      "Caracterizar los retos ambientales y sociales a los que se enfrenta el entorno profesional y productivo.",
    ]
  },
  "1783": {
    general: "Evaluar el proceso de enseñanza-aprendizaje en las acciones formativas de los Grados A, B y C del Sistema de Formación Profesional.",
    specifics: [
      "Analizar la normativa vigente sobre la evaluación, aplicándola al proceso de evaluación y calificación.",
      "Analizar la finalidad y tipología de la evaluación en el actual Sistema de la Formación Profesional.",
      "Verificar el nivel formativo inicial del alumnado realizando una evaluación diagnóstica.",
      "Analizar pruebas e instrumentos de evaluación atendiendo a las diferentes modalidades.",
      "Implementar técnicas de evaluación continua a lo largo del periodo formativo.",
      "Determinar procedimientos y pruebas de evaluación final que verifiquen el nivel de aprendizaje.",
      "Programar la evaluación de la práctica docente, analizando los resultados para mejorar la calidad.",
    ]
  },
  "1784": {
    general: "Impartir acciones formativas de los Grados A, B y C del Sistema de Formación Profesional utilizando técnicas, estrategias y recursos didácticos.",
    specifics: [
      "Desarrollar estrategias facilitadoras del proceso de aprendizaje.",
      "Generar canales de cohesión y participación activa entre el alumnado.",
      "Seleccionar técnicas de comunicación favoreciendo el buen clima y la relación entre personas.",
      "Analizar estrategias metodológicas (ABP, cooperativo, gamificación, microenseñanza).",
      "Reconocer aspectos psicopedagógicos que interceden en las acciones formativas.",
      "Determinar instrumentos y procedimientos en el proceso de aprendizaje mediante estrategias personalizadas.",
    ]
  },
  "1785": {
    general: "Tutorizar acciones formativas de los Grados A, B y C del Sistema de Formación Profesional, proporcionando estrategias y habilidades para favorecer el aprendizaje.",
    specifics: [
      "Determinar las condiciones y requisitos iniciales de una acción formativa según modalidad.",
      "Diseñar un plan de acción tutorial adaptado a la formación.",
      "Supervisar las intervenciones tutoriales en formación presencial, semipresencial y virtual.",
      "Evaluar la acción tutorial analizando su adecuación al plan establecido.",
    ]
  },
  "1786": {
    general: "Aplicar competencias digitales en el contexto de la formación profesional, utilizando herramientas TIC e IA.",
    specifics: [
      "Identificar herramientas digitales aplicables al proceso formativo.",
      "Utilizar plataformas virtuales de aprendizaje y herramientas colaborativas.",
      "Aplicar estrategias de comunicación digital en la formación.",
    ]
  },
  "1782": {
    general: "Sensibilizar al alumnado sobre la prevención de riesgos laborales y medioambientales en su entorno profesional.",
    specifics: [
      "Identificar los principales riesgos laborales asociados al entorno profesional.",
      "Reconocer las medidas de prevención y protección aplicables.",
      "Analizar la normativa básica en prevención de riesgos laborales.",
    ]
  },
};

const sectionDefs: GuideSection[] = [
  { key: "datos_accion", title: "1. Datos de la Acción Formativa", icon: <FileText className="h-5 w-5" />, files: [] },
  { key: "alumnos_equipo", title: "2. Alumnos y Equipo Docente", icon: <Users className="h-5 w-5" />, files: [] },
  { key: "campus_virtual", title: "3. El Campus Virtual y las Aplicaciones Informáticas", icon: <Monitor className="h-5 w-5" />, files: [] },
  { key: "programacion_didactica", title: "4. Programación Didáctica y Planificación de la Evaluación", icon: <CalendarDays className="h-5 w-5" />, files: [] },
  { key: "seguimiento_aprendizaje", title: "5. Procedimiento de Seguimiento del Aprendizaje y Evaluación", icon: <BarChart3 className="h-5 w-5" />, files: [] },
  { key: "sistema_tutorial", title: "6. Sistema Tutorial", icon: <MessageSquare className="h-5 w-5" />, files: [] },
  { key: "gestion_administrativa", title: "7. Gestión y Administración de la Acción Formativa", icon: <Settings className="h-5 w-5" />, files: [] },
  { key: "recursos_didacticos", title: "8. Recursos Didácticos para el Tutor-Formador", icon: <BookOpen className="h-5 w-5" />, files: [] },
];

const TeacherTutorGuide = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const { branding } = useBranding();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [sections, setSections] = useState<GuideSection[]>(sectionDefs);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [centerContact, setCenterContact] = useState<any>(null);

  useEffect(() => {
    const loadCenterContact = async () => {
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('training_center_id').eq('id', user.id).maybeSingle();
      if (profile?.training_center_id) {
        const { data: center } = await supabase.from('training_centers').select('contact_email, contact_phone, address, cif, campus_url').eq('id', profile.training_center_id).maybeSingle();
        if (center) setCenterContact(center);
      }
    };
    loadCenterContact();
  }, [user]);

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      await generateTutorGuidePDF({
        centerName: branding.centerName,
        platformUrl: centerContact?.campus_url || undefined,
        centerEmail: centerContact?.contact_email || undefined,
        centerPhone: centerContact?.contact_phone || undefined,
        centerAddress: centerContact?.address || undefined,
        centerCif: centerContact?.cif || undefined,
      });
      toast({ title: "PDF generado", description: "La Guía del Tutor-Formador se ha descargado correctamente" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo generar el PDF", variant: "destructive" });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const canManageFiles = userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher';

  const toggleSection = (key: string) => {
    setExpandedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleFileUpload = async (sectionKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingSection(sectionKey);
    try {
      const fileName = `${sectionKey}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('tutor-guides').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('tutor-guides').getPublicUrl(fileName);
      setSections(prev => prev.map(section => {
        if (section.key === sectionKey) {
          return { ...section, files: [...section.files, { name: file.name, url: publicUrl, uploadedAt: new Date().toISOString() }] };
        }
        return section;
      }));
      toast({ title: "Archivo subido", description: `${file.name} se ha adjuntado correctamente` });
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo subir el archivo", variant: "destructive" });
    } finally {
      setUploadingSection(null);
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (sectionKey: string, fileUrl: string, fileName: string) => {
    try {
      const path = fileUrl.split('/tutor-guides/')[1];
      if (path) await supabase.storage.from('tutor-guides').remove([path]);
      setSections(prev => prev.map(section => {
        if (section.key === sectionKey) {
          return { ...section, files: section.files.filter(f => f.url !== fileUrl) };
        }
        return section;
      }));
      toast({ title: "Archivo eliminado", description: `${fileName} se ha eliminado correctamente` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el archivo", variant: "destructive" });
    }
  };

  const renderFileAttachments = (section: GuideSection) => (
    <>
      {section.files.length > 0 && (
        <div className="space-y-2 border-t pt-4 mt-4">
          <p className="text-xs font-medium text-muted-foreground">Archivos adjuntos:</p>
          <div className="grid gap-2">
            {section.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 min-w-0">
                  <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                  </Button>
                  {canManageFiles && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteFile(section.key, file.url, file.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {canManageFiles && (
        <div className={section.files.length > 0 ? "mt-2" : "border-t pt-4 mt-4"}>
          <label className="cursor-pointer">
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={(e) => handleFileUpload(section.key, e)} disabled={uploadingSection === section.key} />
            <Button variant="outline" size="sm" disabled={uploadingSection === section.key} asChild>
              <span>
                {uploadingSection === section.key ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo...</>) : (<><Upload className="h-4 w-4 mr-2" />Adjuntar archivo</>)}
              </span>
            </Button>
          </label>
        </div>
      )}
    </>
  );

  const renderSection1 = () => {
    const section = sections.find(s => s.key === "datos_accion")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>En este documento encontrarás toda la información que necesitas para el desarrollo óptimo del curso que vas a impartir.</p>

        <div>
          <h4 className="font-semibold text-foreground mb-2">1.1 OBJETIVOS</h4>
          <p className="mb-3">Con este curso el alumno aprenderá a programar, impartir, tutorizar y evaluar acciones formativas de los Grados A, B y C del Sistema de Formación Profesional, elaborando y utilizando materiales, medios y recursos didácticos, orientando sobre los itinerarios formativos y salidas profesionales que ofrece el mercado laboral en su especialidad, promoviendo de forma permanente la calidad de la formación y la actualización didáctica.</p>
          <p className="mb-3">A continuación, podrás ver las capacidades que deberán trabajarse en cada módulo formativo:</p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">MÓDULOS FORMATIVOS</TableHead>
                  <TableHead>OBJETIVOS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES_SSC.map(mod => {
                  const obj = MODULE_OBJECTIVES[mod.code];
                  return (
                    <TableRow key={mod.code}>
                      <TableCell className="font-medium align-top">
                        <span className="text-primary">MF{mod.code}_3</span><br />
                        {mod.title}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium mb-1">Objetivo general del módulo:</p>
                        <p className="mb-2">{obj?.general}</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {obj?.specifics.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2">1.2 ORGANIZACIÓN Y FECHAS DE REALIZACIÓN</h4>
          <p className="mb-3">Este curso se corresponde con el certificado de profesionalidad:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-xs font-medium text-muted-foreground">DENOMINACIÓN</span>
              <p className="font-medium text-foreground">Habilitación para la docencia en grados A, B y C del Sistema de Formación Profesional</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-xs font-medium text-muted-foreground">CÓDIGO</span>
              <p className="font-medium text-foreground">SSC_C_017_5B</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-xs font-medium text-muted-foreground">FAMILIA PROFESIONAL</span>
              <p className="font-medium text-foreground">Servicios Socioculturales y a la Comunidad</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-xs font-medium text-muted-foreground">NIVEL DE CUALIFICACIÓN</span>
              <p className="font-medium text-foreground">3 (MECU 5B)</p>
            </div>
          </div>

          <p className="mb-3">Se compone de los siguientes módulos formativos:</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MÓDULOS FORMATIVOS</TableHead>
                  <TableHead className="text-center w-20">HORAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES_SSC.map(mod => (
                  <TableRow key={mod.code}>
                    <TableCell><span className="text-primary font-medium">MF{mod.code}_3</span> {mod.title}</TableCell>
                    <TableCell className="text-center font-medium">{mod.hours}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">510</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <p className="mt-3">En el <strong className="text-foreground">ANEXO I "PROGRAMACIÓN DIDÁCTICA Y PLANIFICACIÓN DE LA EVALUACIÓN"</strong> de esta guía, encontrarás la relación de las unidades didácticas de cada uno de los módulos formativos que componen el certificado de profesionalidad, las capacidades que deberá adquirir el alumno, así como las actividades y pruebas de evaluación.</p>
          <p className="mt-2">En el <strong className="text-foreground">ANEXO II "CALENDARIO Y PLAN DE TRABAJO"</strong> podrás encontrar la planificación por semanas y la secuencia de actividades.</p>
        </div>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection2 = () => {
    const section = sections.find(s => s.key === "alumnos_equipo")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Puedes obtener una lista de los participantes en el módulo formativo que tutorizas a través de varias vías:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Elaborar listado propio</strong>: A través de ADMINISTRACIÓN → INFORMES → Informe de alumnos</li>
        </ul>

        <h4 className="font-semibold text-foreground mt-4">MIS CONTACTOS</h4>
        <p>En el icono MIS CONTACTOS encontrarás la información sobre el resto de los miembros del equipo docente. Podrás contactar con los alumnos y con el equipo de tutores-formadores a través de los siguientes medios:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Correo electrónico interno del Campus Virtual</strong>: Mensajería interna para comunicación directa con alumnos y otros tutores.</li>
          <li><strong className="text-foreground">Chat del Campus Virtual</strong>: Comunicación instantánea con usuarios conectados.</li>
          <li><strong className="text-foreground">Foros del Campus Virtual</strong>: Dispondrás de un foro para tutores-formadores de toda la acción formativa, y otro foro específico por cada módulo formativo.</li>
          <li><strong className="text-foreground">Correo electrónico externo</strong>: Para comunicaciones fuera del campus cuando sea necesario.</li>
        </ul>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection3 = () => {
    const section = sections.find(s => s.key === "campus_virtual")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <h4 className="font-semibold text-foreground">3.1 REQUISITOS TÉCNICOS DEL EQUIPO INFORMÁTICO</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Navegadores compatibles: Chrome, Firefox, Edge (últimas versiones)</li>
          <li>Conexión a Internet estable (mínimo 2 Mbps recomendado)</li>
          <li>Resolución de pantalla mínima: 1024x768 px</li>
          <li>JavaScript y cookies habilitados</li>
        </ul>

        <h4 className="font-semibold text-foreground mt-4">3.2 FUNCIONAMIENTO Y RECURSOS</h4>
        <p>Al acceder al Campus Virtual encontrarás toda la información a la que tienen acceso los alumnos para que puedas consultar la documentación disponible. Es muy importante que conozcas los recursos didácticos disponibles, así como las herramientas para comunicarte con los alumnos, realizar su seguimiento y evaluación.</p>

        <div className="mt-3 space-y-3">
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground mb-1">A) ORGANIZARME</h5>
            <p>En la zona izquierda encontrarás el área ORGANIZARME, con toda la información sobre la planificación del curso: la agenda con la programación de actividades y pruebas de evaluación, las tareas pendientes comunicadas a los alumnos, así como esta guía.</p>
          </div>
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground mb-1">B) COMUNICARME</h5>
            <p>En la parte derecha encontrarás el área COMUNICARME con acceso a todas las herramientas de comunicación: Mi Perfil, Mis Contactos, Correo electrónico interno, Chat y Foros.</p>
          </div>
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground mb-1">C) RECURSOS</h5>
            <p>En la parte central encontrarás todos los RECURSOS DIDÁCTICOS organizados de forma secuencial: Introducción, Contenido Interactivo Multimedia (CIM), Manual PDF, Material Complementario, Actividades de Aprendizaje Evaluables, Foros, Biblioteca, Tutorías Presenciales, Tutoría Virtual y Evaluación.</p>
          </div>
        </div>

        <h4 className="font-semibold text-foreground mt-4">RECURSOS DIDÁCTICOS PARA EL TUTOR-FORMADOR</h4>
        <p>En el Campus Virtual, además de los recursos didácticos disponibles para el alumno, vas a encontrar los recursos necesarios para llevar a cabo tu actividad como tutor-formador:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Esta guía del tutor-formador en PDF.</li>
          <li>Documentos con la solución y sistema de corrección de las actividades de aprendizaje planteadas en el Campus Virtual.</li>
          <li>Documentos con la planificación de las actividades y los instrumentos de evaluación para las Tutorías Presenciales.</li>
          <li>Documento por cada módulo formativo con la planificación y sistema de corrección de la prueba de evaluación presencial final.</li>
        </ul>

        <h4 className="font-semibold text-foreground mt-4">3.3 AYUDA, PREGUNTAS FRECUENTES Y VISITA GUIADA</h4>
        <p>Dispones de una sección de ayuda con preguntas frecuentes y una visita guiada del Campus Virtual accesible desde el menú principal.</p>

        <h4 className="font-semibold text-foreground mt-4">3.4 APLICACIONES INFORMÁTICAS</h4>
        <p>Los siguientes módulos requieren aplicaciones informáticas específicas:</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MÓDULO</TableHead>
                <TableHead>APLICACIONES NECESARIAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">MF1705_3 Programación didáctica</TableCell>
                <TableCell>Aplicaciones de presentación multimedia (PowerPoint, Canva, Google Slides)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">MF1706_3 Gestión de materiales</TableCell>
                <TableCell>Herramientas de diseño (Canva, Genially), plataformas colaborativas (Google Drive, Zoho)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">MF1786_3 Competencia digital</TableCell>
                <TableCell>Herramientas de IA generativa, plataformas LMS, aplicaciones de evaluación digital</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Resto de módulos</TableCell>
                <TableCell>NO SE REQUIERE software específico adicional</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="mt-2"><strong className="text-foreground">RECUERDA:</strong> Debes facilitar a los alumnos las instrucciones para la descarga de las aplicaciones informáticas necesarias a través del correo electrónico del Campus Virtual.</p>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection4 = () => {
    const section = sections.find(s => s.key === "programacion_didactica")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>En el <strong className="text-foreground">ANEXO I "PROGRAMACIÓN DIDÁCTICA Y PLANIFICACIÓN DE LA EVALUACIÓN"</strong> de esta guía encontrarás la planificación didáctica y la evaluación del curso (Anexos III, IV y V).</p>
        <p>Además, en el <strong className="text-foreground">ANEXO II "CALENDARIO Y PLAN DE TRABAJO"</strong> podrás encontrar el "PLAN DE TRABAJO" del que disponen los alumnos.</p>

        <p className="mt-2"><strong className="text-foreground">RECUERDA:</strong> A través de la herramienta MI AGENDA del Campus Virtual, deberás programar e informar de las actividades y evaluación al alumnado.</p>

        <h4 className="font-semibold text-foreground mt-4">4.1 ¿CÓMO DEBE DESARROLLAR EL ALUMNO LA ACCIÓN FORMATIVA?</h4>
        <div className="space-y-3">
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground">A) INTRODUCCIÓN AL MÓDULO FORMATIVO</h5>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Acudir al chat o sesión presencial de presentación.</li>
              <li>Consultar los objetivos y contenidos (PDF y vídeo de presentación).</li>
              <li>Realizar el test de conocimientos previos.</li>
            </ul>
          </div>
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground">B) DESARROLLAR LA FORMACIÓN EN CAMPUS</h5>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Estudiar los contenidos multimedia y ampliar con materiales complementarios.</li>
              <li>Consultar los documentos y vídeos de apoyo.</li>
              <li>Realizar las actividades de aprendizaje evaluables.</li>
              <li>Participar en los foros de debate.</li>
            </ul>
          </div>
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground">C) REALIZAR LAS PRUEBAS DE EVALUACIÓN</h5>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Test Final de evaluación en Campus.</li>
              <li>Cuestionario de Evaluación de la Calidad.</li>
              <li>Prueba de Evaluación Final Presencial en el centro de formación.</li>
            </ul>
          </div>
        </div>

        <h4 className="font-semibold text-foreground mt-4">4.2 ¿QUÉ SE EVALÚA EN LA ACCIÓN FORMATIVA?</h4>
        <p>Durante toda la formación se va a llevar a cabo una evaluación sistemática y continua. Los instrumentos de evaluación definidos son:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Evaluación diagnóstica:</strong> Cuestionario de conocimientos previos al inicio de cada módulo.</li>
          <li><strong className="text-foreground">Test de autoevaluación:</strong> Integrados en el CIM, con corrección automática.</li>
          <li><strong className="text-foreground">Actividades de aprendizaje:</strong> Individuales (entrega por Campus) y grupales (foro + documento final).</li>
          <li><strong className="text-foreground">Foros de debate:</strong> Número y calidad de las aportaciones.</li>
          <li><strong className="text-foreground">Tutorías presenciales:</strong> Actividades prácticas con observación directa.</li>
          <li><strong className="text-foreground">Test Final:</strong> Prueba tipo test con corrección automática.</li>
          <li><strong className="text-foreground">Prueba de evaluación final presencial:</strong> En el Centro de Formación.</li>
        </ul>

        <div className="mt-3 p-4 bg-muted/50 rounded-md">
          <h5 className="font-medium text-foreground mb-2">Ponderación de la nota final por módulo:</h5>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>INSTRUMENTO</TableHead>
                  <TableHead className="text-center">PESO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Actividades de aprendizaje + Foros + Evaluación continua (Campus + Tutorías Presenciales)</TableCell>
                  <TableCell className="text-center font-medium">30%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Prueba de evaluación final presencial (mínimo 5 puntos)</TableCell>
                  <TableCell className="text-center font-medium">70%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-xs"><strong className="text-foreground">IMPORTANTE:</strong> Para superar la formación con evaluación positiva también se tendrán en cuenta los tiempos de acceso al Campus Virtual.</p>
        </div>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection5 = () => {
    const section = sections.find(s => s.key === "seguimiento_aprendizaje")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <h4 className="font-semibold text-foreground">5.1 ¿QUIÉN, CÓMO Y CUÁNDO SE REALIZA EL SEGUIMIENTO DEL APRENDIZAJE?</h4>
        <p>El seguimiento del aprendizaje es responsabilidad directa del tutor-formador de cada módulo formativo. Deberás:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Realizar un seguimiento diario del progreso de los alumnos a través del Campus Virtual.</li>
          <li>Controlar los tiempos de acceso y la realización de actividades.</li>
          <li>Contactar con los alumnos inactivos (más de 3 días sin acceder al Campus).</li>
          <li>Informar al coordinador de alumnos con riesgo de abandono.</li>
          <li>Generar informes de seguimiento periódicos a través de ADMINISTRACIÓN → SEGUIMIENTO → PROGRESOS.</li>
          <li>Registrar las comunicaciones mantenidas con los alumnos (correo, chat, foros, tutorías).</li>
        </ul>

        <div className="mt-3 p-3 border rounded-md">
          <h5 className="font-medium text-foreground mb-1">Herramientas de seguimiento en el Campus Virtual:</h5>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Progresos:</strong> ADMINISTRACIÓN → SEGUIMIENTO → PROGRESOS (acceso, tiempo, actividades).</li>
            <li><strong className="text-foreground">Seguimiento de alumnos:</strong> ADMINISTRACIÓN → SEGUIMIENTO DE ALUMNOS (total accesos, tiempos, último acceso).</li>
            <li><strong className="text-foreground">Informes:</strong> ADMINISTRACIÓN → INFORMES (informe detallado de acceso por alumno).</li>
            <li><strong className="text-foreground">Seguimiento de tareas:</strong> ADMINISTRACIÓN → SEGUIMIENTO → SEGUIMIENTO DE TAREAS.</li>
          </ul>
        </div>

        <h4 className="font-semibold text-foreground mt-4">5.2 ¿QUIÉN, CÓMO Y CUÁNDO SE EVALÚA Y SE REGISTRAN LOS RESULTADOS?</h4>
        <p>El tutor-formador es responsable de evaluar y registrar los resultados de las actividades de aprendizaje, participación en foros y pruebas de evaluación. Los resultados se comunican al alumno a través del Campus Virtual.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Corregir las actividades de aprendizaje en un plazo máximo de 48 horas.</li>
          <li>Enviar al alumno la corrección y puntuación por correo electrónico del Campus.</li>
          <li>Registrar las calificaciones de las pruebas presenciales.</li>
          <li>Calcular la nota final conforme a la ponderación establecida (30% continua + 70% presencial).</li>
        </ul>

        <h4 className="font-semibold text-foreground mt-4">5.3 ADAPTACIÓN DE LA PROGRAMACIÓN DIDÁCTICA PARA DÉFICITS EN EL PROCESO DE APRENDIZAJE</h4>
        <p>Cuando se detecten déficits en el proceso de aprendizaje de los alumnos, el tutor-formador deberá:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Identificar las causas del bajo rendimiento mediante comunicación directa con el alumno.</li>
          <li>Proponer actividades de refuerzo y material complementario adicional.</li>
          <li>Adaptar la temporalización cuando sea posible y justificado.</li>
          <li>Coordinar con el resto del equipo docente las medidas correctivas necesarias.</li>
          <li>Documentar todas las adaptaciones realizadas para el expediente del alumno.</li>
        </ul>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection6 = () => {
    const section = sections.find(s => s.key === "sistema_tutorial")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <h4 className="font-semibold text-foreground">6.1 TUTORÍAS VIRTUALES</h4>
        <p>Las tutorías virtuales constituyen el principal medio de interacción tutor-alumno en la modalidad de teleformación. Los canales disponibles son:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Correo electrónico interno:</strong> Para consultas individuales. Tiempo de respuesta máximo: 24 horas laborables.</li>
          <li><strong className="text-foreground">Chat:</strong> Sesiones programadas según agenda para resolución de dudas en tiempo real.</li>
          <li><strong className="text-foreground">Foros:</strong> Para debate colectivo, dudas generales y actividades grupales.</li>
          <li><strong className="text-foreground">Videoconferencia:</strong> Sesiones de tutoría virtual programadas según calendario.</li>
        </ul>

        <div className="mt-3 p-3 bg-muted/50 rounded-md">
          <p className="font-medium text-foreground mb-1">Horario de atención tutorial:</p>
          <p>El tutor-formador deberá estar disponible en el Campus Virtual durante el horario de atención establecido, garantizando la atención a las consultas de los alumnos con un tiempo de respuesta máximo de 24-48 horas.</p>
        </div>

        <h4 className="font-semibold text-foreground mt-4">6.2 TUTORÍAS PRESENCIALES</h4>
        <p>Las tutorías presenciales se desarrollan en el Centro de Formación según la programación establecida. Se organizan de la siguiente manera:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sesiones presenciales programadas por módulo formativo según calendario.</li>
          <li>Desarrollo de actividades prácticas que requieren presencialidad.</li>
          <li>Evaluación mediante observación directa del desempeño del alumno.</li>
          <li>Registro de asistencia obligatorio.</li>
        </ul>

        <p className="mt-2">Como tutor-formador dispondrás de:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">CUADERNO DEL FORMADOR:</strong> Con toda la información sobre actividades y evaluación de las tutorías presenciales.</li>
          <li><strong className="text-foreground">CUADERNO DEL ALUMNO:</strong> Información que el alumno recibe sobre las tutorías presenciales.</li>
          <li><strong className="text-foreground">LISTA DE ASISTENCIA:</strong> Formato oficial para el control de asistencia.</li>
        </ul>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection7 = () => {
    const section = sections.find(s => s.key === "gestion_administrativa")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <h4 className="font-semibold text-foreground">7.1 ALTAS Y BAJAS DE ALUMNOS</h4>
        <p>El proceso de altas y bajas de alumnos se gestiona a través del departamento de administración. El tutor-formador deberá informar de cualquier incidencia relacionada con la incorporación o abandono de alumnos.</p>

        <h4 className="font-semibold text-foreground mt-4">7.2 FORMACIÓN DE GRUPOS/EQUIPOS</h4>
        <p>Para las actividades grupales, deberás crear distintos grupos de trabajo e indicar a cada alumno a qué grupo pertenece. Utiliza los foros de actividad grupal para organizar las tareas.</p>

        <h4 className="font-semibold text-foreground mt-4">7.3 PROGRAMACIÓN Y SEGUIMIENTO DEL MÓDULO DE FORMACIÓN PRÁCTICA</h4>
        <p>En caso de que el certificado incluya módulo de prácticas profesionales no laborales, el tutor-formador deberá coordinar con el tutor de empresa el seguimiento del alumno durante las prácticas.</p>

        <h4 className="font-semibold text-foreground mt-4">7.4 COORDINACIÓN ENTRE TUTOR-FORMADOR, FORMADOR Y TUTOR DE EMPRESA</h4>
        <p>La coordinación entre los distintos miembros del equipo docente se realizará a través de:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Foro de tutores-formadores en el Campus Virtual.</li>
          <li>Reuniones periódicas de coordinación (presenciales o virtuales).</li>
          <li>Correo electrónico interno del Campus.</li>
        </ul>

        <h4 className="font-semibold text-foreground mt-4">7.5 PROCEDIMIENTO DE GESTIÓN DE INCIDENCIAS Y RECLAMACIONES</h4>
        <p>Ante cualquier incidencia o reclamación:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Registrar la incidencia con detalle (fecha, alumno, descripción).</li>
          <li>Comunicar al coordinador del curso para su resolución.</li>
          <li>En caso de incidencias técnicas, derivar al CAU (Centro de Atención al Usuario).</li>
          <li>Documentar la resolución de la incidencia.</li>
        </ul>

        <div className="mt-3 space-y-3">
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground mb-1">Gestión de tareas en el Campus</h5>
            <p>Para crear una nueva tarea: Administración → Configuración/Personalización → Gestión de tareas. Puedes crear ejercicios entregables y evaluables, indicando título, descripción, día de inicio y duración.</p>
          </div>
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground mb-1">Subir material complementario</h5>
            <p>Para subir nuevos documentos o vídeos: Administración → Configuración/Personalización → Mis archivadores. Selecciona la acción formativa y adjunta el material.</p>
          </div>
          <div className="p-3 border rounded-md">
            <h5 className="font-medium text-foreground mb-1">Crear foros</h5>
            <p>Para crear nuevos foros de debate: Administración → Configuración/Personalización → Mis foros.</p>
          </div>
        </div>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const renderSection8 = () => {
    const section = sections.find(s => s.key === "recursos_didacticos")!;
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>En el Campus Virtual, además de los recursos didácticos disponibles para el alumno, vas a encontrar los recursos necesarios para llevar a cabo tu actividad como tutor-formador:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Esta guía del tutor-formador en PDF</strong> — Documento oficial con toda la información necesaria para la tutorización.</li>
          <li><strong className="text-foreground">Documentos con la solución y sistema de corrección</strong> — Materiales con las soluciones y criterios de corrección de las actividades de aprendizaje planteadas en el Campus Virtual.</li>
          <li><strong className="text-foreground">Documentos con la planificación de actividades</strong> — Planificación de las actividades de aprendizaje y los instrumentos de evaluación que se desarrollarán/aplicarán en las sesiones de las Tutorías Presenciales en el Centro de formación.</li>
          <li><strong className="text-foreground">Documento por cada módulo formativo</strong> — Información sobre la planificación y sistema de corrección de la prueba de evaluación presencial final.</li>
        </ul>

        <div className="mt-4 p-4 bg-muted/50 rounded-md">
          <h5 className="font-medium text-foreground mb-2">Recursos disponibles por módulo formativo:</h5>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MÓDULO</TableHead>
                  <TableHead>RECURSOS DISPONIBLES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES_SSC.map(mod => (
                  <TableRow key={mod.code}>
                    <TableCell className="font-medium align-top whitespace-nowrap">MF{mod.code}_3</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Contenido Interactivo Multimedia (CIM)</li>
                        <li>Manual en formato PDF</li>
                        <li>Material complementario</li>
                        <li>Actividades de aprendizaje con solucionario</li>
                        <li>Test Final con solucionario</li>
                        <li>Prueba de evaluación presencial + instrucciones</li>
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-3 p-3 border border-primary/30 rounded-md bg-primary/5">
          <p className="font-medium text-foreground mb-1">RECUERDA:</p>
          <p>Como tutor formador del módulo formativo debes implementar, una vez finalizada la formación del mismo, el <strong className="text-foreground">cuestionario de satisfacción del tutor-formador</strong>. El análisis de resultados permitirá la mejora de la calidad de posteriores ediciones de la acción formativa.</p>
        </div>
        {renderFileAttachments(section)}
      </div>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    datos_accion: renderSection1,
    alumnos_equipo: renderSection2,
    campus_virtual: renderSection3,
    programacion_didactica: renderSection4,
    seguimiento_aprendizaje: renderSection5,
    sistema_tutorial: renderSection6,
    gestion_administrativa: renderSection7,
    recursos_didacticos: renderSection8,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guía del Tutor-Formador</h1>
          <p className="text-muted-foreground">
            Habilitación para la docencia en grados A, B y C del Sistema de Formación Profesional (SSC_C_017_5B)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="mt-1">
            <GraduationCap className="h-3 w-3 mr-1" />
            510 horas
          </Badge>
          <Button onClick={handleDownloadPDF} disabled={generatingPDF} className="gap-2">
            {generatingPDF ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generando...</>
            ) : (
              <><FileDown className="h-4 w-4" />Descargar PDF</>
            )}
          </Button>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            En este documento encontrarás toda la información que necesitas para el desarrollo óptimo de los cursos que vas a impartir dentro del certificado de profesionalidad <strong className="text-foreground">Habilitación para la docencia en grados A, B y C del Sistema de Formación Profesional</strong>. Certificado compuesto por <strong className="text-foreground">8 módulos formativos</strong> con un total de <strong className="text-foreground">510 horas</strong> de formación.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Guía del Tutor-Formador SEPE</CardTitle>
          </div>
          <CardDescription>
            Documento oficial aprobado por el SEPE con toda la información necesaria para la tutorización del certificado SSC_C_017_5B.
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
                  <div className="px-4 pb-4 border-t mx-4 pt-4">
                    {sectionRenderers[section.key]?.()}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTutorGuide;
