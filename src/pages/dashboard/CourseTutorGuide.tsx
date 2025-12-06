import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  BookOpen, FileText, Users, Calendar, ClipboardList, 
  MessageSquare, Award, ChevronLeft, Paperclip, Edit2, Save, X,
  Target, CheckCircle, AlertCircle, Loader2, Upload, Trash2, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Json } from "@/integrations/supabase/types";

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  objectives: string | null;
  specific_objectives: Json | null;
  category: string | null;
  course_type: string | null;
}

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
  start_date: string | null;
  end_date: string | null;
  formative_units: FormativeUnitData[];
}

interface FormativeUnitData {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  objectives: string | null;
}

interface EvaluationData {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number | null;
  time_limit_minutes: number | null;
  module_id: string | null;
  formative_unit_id: string | null;
}

interface ActivityData {
  id: string;
  title: string;
  description: string;
  max_score: number | null;
  due_date: string | null;
  module_id: string | null;
  formative_unit_id: string | null;
}

interface GuideSection {
  id: string;
  section_key: string;
  section_title: string;
  content: string | null;
  resources: Json;
  order_index: number;
}

const defaultSections = [
  { 
    key: "datos_accion", 
    title: "1. Datos de la Acción Formativa", 
    icon: FileText,
    description: "Información general del curso: denominación, código, duración, fechas de realización, objetivos generales y específicos de la formación."
  },
  { 
    key: "alumnos_equipo", 
    title: "2. Alumnos y Equipo Docente", 
    icon: Users,
    description: "Listado de alumnos matriculados, datos del tutor-formador asignado, y otros miembros del equipo docente involucrados en la acción formativa."
  },
  { 
    key: "campus_virtual", 
    title: "3. Campus Virtual y Aplicaciones", 
    icon: BookOpen,
    description: "Acceso al campus virtual, aplicaciones disponibles, guía de uso de la plataforma, herramientas de comunicación y recursos tecnológicos."
  },
  { 
    key: "programacion_didactica", 
    title: "4. Programación Didáctica y Evaluación", 
    icon: Calendar,
    description: "Estructura del curso (módulos y unidades formativas), contenidos, sistema de evaluación, criterios de calificación y ponderación de notas."
  },
  { 
    key: "seguimiento_aprendizaje", 
    title: "5. Seguimiento del Aprendizaje", 
    icon: ClipboardList,
    description: "Procedimientos de seguimiento del progreso del alumno, control de tiempos, indicadores de participación y herramientas de trazabilidad."
  },
  { 
    key: "sistema_tutorial", 
    title: "6. Sistema Tutorial", 
    icon: MessageSquare,
    description: "Modalidades de tutorías (telemáticas/presenciales), canales de comunicación, horarios de atención, procedimientos de consulta y resolución de dudas."
  },
  { 
    key: "gestion_administracion", 
    title: "7. Gestión y Administración", 
    icon: Award,
    description: "Documentación administrativa, procedimientos de gestión, certificaciones, normativa aplicable y contacto con el centro de formación."
  },
];

const CourseTutorGuide = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { userRole } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [guideSections, setGuideSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadSection, setCurrentUploadSection] = useState<string | null>(null);
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        toast.error("Curso no encontrado");
        return;
      }
      setCourse(courseData);

      // Fetch modules with formative units
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          formative_units (*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch evaluations
      const { data: evalData, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true);

      if (evalError) throw evalError;
      setEvaluations(evalData || []);

      // Fetch activities
      const { data: actData, error: actError } = await supabase
        .from('development_activities')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true);

      if (actError) throw actError;
      setActivities(actData || []);

      // Fetch custom guide sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('tutor_guide_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (sectionsError) throw sectionsError;
      setGuideSections(sectionsData || []);

    } catch (error: any) {
      console.error('Error fetching course data:', error);
      toast.error("Error al cargar los datos del curso");
    } finally {
      setLoading(false);
    }
  };

  const getCustomContent = (sectionKey: string) => {
    const section = guideSections.find(s => s.section_key === sectionKey);
    return section?.content || null;
  };

  const getCustomResources = (sectionKey: string): { name: string; type: string; url?: string }[] => {
    const section = guideSections.find(s => s.section_key === sectionKey);
    if (!section?.resources) return [];
    if (Array.isArray(section.resources)) {
      return section.resources as { name: string; type: string; url?: string }[];
    }
    return [];
  };

  const handleEditSection = (sectionKey: string) => {
    const existingContent = getCustomContent(sectionKey);
    setEditContent(existingContent || "");
    setEditingSection(sectionKey);
  };

  const handleSaveSection = async (sectionKey: string, sectionTitle: string) => {
    setSaving(true);
    try {
      const existingSection = guideSections.find(s => s.section_key === sectionKey);
      
      if (existingSection) {
        // Update existing
        const { error } = await supabase
          .from('tutor_guide_sections')
          .update({ content: editContent, updated_at: new Date().toISOString() })
          .eq('id', existingSection.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('tutor_guide_sections')
          .insert({
            course_id: courseId,
            section_key: sectionKey,
            section_title: sectionTitle,
            content: editContent,
            order_index: defaultSections.findIndex(s => s.key === sectionKey)
          });
        
        if (error) throw error;
      }

      toast.success("Sección guardada correctamente");
      setEditingSection(null);
      fetchCourseData();
    } catch (error: any) {
      console.error('Error saving section:', error);
      toast.error("Error al guardar la sección");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (sectionKey: string, file: File) => {
    if (!courseId) return;
    
    setUploadingSection(sectionKey);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${sectionKey}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tutor-guides')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tutor-guides')
        .getPublicUrl(fileName);
      
      // Update resources in the section
      const existingSection = guideSections.find(s => s.section_key === sectionKey);
      const existingResources = getCustomResources(sectionKey);
      const newResource = {
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        url: publicUrl,
        path: fileName
      };
      const updatedResources = [...existingResources, newResource];
      
      if (existingSection) {
        const { error } = await supabase
          .from('tutor_guide_sections')
          .update({ 
            resources: updatedResources as unknown as Json,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingSection.id);
        
        if (error) throw error;
      } else {
        const sectionInfo = defaultSections.find(s => s.key === sectionKey);
        const { error } = await supabase
          .from('tutor_guide_sections')
          .insert({
            course_id: courseId,
            section_key: sectionKey,
            section_title: sectionInfo?.title || sectionKey,
            resources: updatedResources as unknown as Json,
            order_index: defaultSections.findIndex(s => s.key === sectionKey)
          });
        
        if (error) throw error;
      }
      
      toast.success("Archivo subido correctamente");
      fetchCourseData();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error("Error al subir el archivo");
    } finally {
      setUploadingSection(null);
      setCurrentUploadSection(null);
    }
  };

  const handleDeleteResource = async (sectionKey: string, resourceIndex: number) => {
    const existingSection = guideSections.find(s => s.section_key === sectionKey);
    if (!existingSection) return;
    
    const resources = getCustomResources(sectionKey);
    const resourceToDelete = resources[resourceIndex];
    
    try {
      // Delete from storage if it has a path
      if ((resourceToDelete as any).path) {
        await supabase.storage
          .from('tutor-guides')
          .remove([(resourceToDelete as any).path]);
      }
      
      // Update resources array
      const updatedResources = resources.filter((_, idx) => idx !== resourceIndex);
      
      const { error } = await supabase
        .from('tutor_guide_sections')
        .update({ 
          resources: updatedResources as unknown as Json,
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingSection.id);
      
      if (error) throw error;
      
      toast.success("Archivo eliminado");
      fetchCourseData();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast.error("Error al eliminar el archivo");
    }
  };

  const triggerFileUpload = (sectionKey: string) => {
    setCurrentUploadSection(sectionKey);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUploadSection) {
      handleFileUpload(currentUploadSection, file);
    }
    e.target.value = '';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No definido";
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const renderDatosAccion = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">Código del curso</div>
          <div className="font-medium">{course?.category || "Sin categoría"}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">Tipo de formación</div>
          <div className="font-medium capitalize">{course?.course_type || "No definido"}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">Duración total</div>
          <div className="font-medium">{course?.duration_hours || 0} horas</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">Período de realización</div>
          <div className="font-medium text-sm">
            {formatDate(course?.start_date)} - {formatDate(course?.end_date)}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Objetivo General</h4>
        <p className="text-sm text-muted-foreground">
          {course?.objectives || "No se han definido objetivos generales para este curso."}
        </p>
      </div>

      {course?.specific_objectives && Array.isArray(course.specific_objectives) && course.specific_objectives.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Objetivos Específicos</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(course.specific_objectives as any[]).map((obj: any, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <Target className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{typeof obj === 'string' ? obj : obj.text || obj.objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderModulosUnidades = () => (
    <div className="space-y-4">
      <h4 className="font-medium">Estructura del Curso</h4>
      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay módulos definidos en este curso.</p>
      ) : (
        <div className="space-y-3">
          {modules.map((module, idx) => (
            <div key={module.id} className="p-3 rounded-lg border bg-background">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{module.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {module.duration_minutes ? `${Math.round(module.duration_minutes / 60)} horas` : "Duración no definida"}
                    {module.start_date && ` • Inicio: ${formatDate(module.start_date)}`}
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  Módulo {idx + 1}
                </Badge>
              </div>
              
              {module.formative_units && module.formative_units.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-primary/20 space-y-2">
                  {module.formative_units.map((uf: FormativeUnitData) => (
                    <div key={uf.id} className="text-sm">
                      <div className="font-medium">{uf.title}</div>
                      {uf.duration_hours && (
                        <div className="text-xs text-muted-foreground">{uf.duration_hours} horas</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEvaluaciones = () => (
    <div className="space-y-4">
      <h4 className="font-medium">Sistema de Evaluación</h4>
      
      <div className="grid gap-3 md:grid-cols-2">
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="text-2xl font-bold text-primary">30%</div>
          <div className="text-sm font-medium">Actividades de Aprendizaje</div>
          <p className="text-xs text-muted-foreground mt-1">
            Promedio de notas en actividades, participación en foros y pruebas de evaluación
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="text-2xl font-bold text-primary">70%</div>
          <div className="text-sm font-medium">Prueba de Evaluación Final</div>
          <p className="text-xs text-muted-foreground mt-1">
            Examen presencial en el Centro de Formación (mínimo 5 para aprobar)
          </p>
        </div>
      </div>

      {evaluations.length > 0 && (
        <div className="pt-4 border-t">
          <h5 className="font-medium text-sm mb-2">Evaluaciones configuradas ({evaluations.length})</h5>
          <div className="space-y-2">
            {evaluations.map(evaluation => (
              <div key={evaluation.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                <span>{evaluation.title}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Aprobado: {evaluation.passing_score}%</span>
                  {evaluation.max_attempts && <span>• {evaluation.max_attempts} intentos</span>}
                  {evaluation.time_limit_minutes && <span>• {evaluation.time_limit_minutes} min</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activities.length > 0 && (
        <div className="pt-4 border-t">
          <h5 className="font-medium text-sm mb-2">Actividades de desarrollo ({activities.length})</h5>
          <div className="space-y-2">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                <span>{activity.title}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {activity.max_score && <span>Máx: {activity.max_score} pts</span>}
                  {activity.due_date && <span>• Entrega: {formatDate(activity.due_date)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSectionContent = (sectionKey: string) => {
    const customContent = getCustomContent(sectionKey);
    const customResources = getCustomResources(sectionKey);

    // Auto-generated content based on section
    let autoContent = null;
    switch (sectionKey) {
      case "datos_accion":
        autoContent = renderDatosAccion();
        break;
      case "programacion_didactica":
        autoContent = (
          <>
            {renderModulosUnidades()}
            <div className="pt-4 mt-4 border-t">
              {renderEvaluaciones()}
            </div>
          </>
        );
        break;
      default:
        break;
    }

    return (
      <div className="space-y-4">
        {autoContent}
        
        {customContent && (
          <div className={autoContent ? "pt-4 border-t" : ""}>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Edit2 className="h-3 w-3" />
              Contenido personalizado
            </h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {customContent}
            </div>
          </div>
        )}

        {customResources.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              Recursos adjuntos
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {customResources.map((resource, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{resource.name}</span>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                    {resource.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!autoContent && !customContent && (
          <p className="text-sm text-muted-foreground italic">
            {isAdmin 
              ? "No hay contenido personalizado. Haz clic en 'Editar' para añadir información a esta sección."
              : "No hay contenido disponible para esta sección."
            }
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Curso no encontrado</h2>
        <p className="text-muted-foreground mt-2">El curso que buscas no existe o no tienes acceso.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/teacher/courses">Volver a mis cursos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link to="/dashboard/teacher/courses" className="hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm">Volver a mis cursos</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Guía del Tutor-Formador</h1>
          <p className="text-muted-foreground mt-1">{course.title}</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {course.title}
          </CardTitle>
          <CardDescription>
            Guía oficial del tutor-formador para esta acción formativa. Cada sección puede contener información autogenerada y documentos adjuntos.
          </CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={["datos_accion"]} className="space-y-2">
        {defaultSections.map((section) => (
          <AccordionItem 
            key={section.key} 
            value={section.key}
            className="border rounded-lg bg-background px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3 text-left flex-1">
                <div className="p-2 rounded-md bg-primary/10 shrink-0">
                  <section.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">{section.title}</span>
                  {getCustomResources(section.key).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getCustomResources(section.key).length} archivo(s)
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {/* Section description */}
              <div className="p-3 rounded-lg bg-muted/30 border border-muted mb-4">
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>

              {editingSection === section.key ? (
                <div className="space-y-3 pt-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Escribe el contenido personalizado para esta sección..."
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection(section.key, section.title)}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(null)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  {renderSectionContent(section.key)}
                  
                  {/* Resources with download/delete options */}
                  {getCustomResources(section.key).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                        <Paperclip className="h-4 w-4 text-primary" />
                        Archivos adjuntos ({getCustomResources(section.key).length})
                      </h4>
                      <div className="space-y-2">
                        {getCustomResources(section.key).map((resource, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                          >
                            <FileText className="h-5 w-5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{resource.name}</p>
                              <p className="text-xs text-muted-foreground">{resource.type}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {resource.url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open(resource.url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteResource(section.key, idx)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSection(section.key)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {getCustomContent(section.key) ? "Editar contenido" : "Añadir contenido"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerFileUpload(section.key)}
                        disabled={uploadingSection === section.key}
                      >
                        {uploadingSection === section.key ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Adjuntar archivo
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>Requisitos para Superar el Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Realizar todas las actividades de aprendizaje</p>
                <p className="text-xs text-muted-foreground">Casos prácticos, foros, documentos, vídeos y pruebas de evaluación en Campus Virtual</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Asistir a las tutorías presenciales (mín. 75%)</p>
                <p className="text-xs text-muted-foreground">Sesiones presenciales programadas en el Centro de Formación</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Superar la prueba de evaluación final (mín. 5 puntos)</p>
                <p className="text-xs text-muted-foreground">Examen presencial que representa el 70% de la nota final</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cumplir los tiempos de acceso al Campus</p>
                <p className="text-xs text-muted-foreground">Mantener una dedicación según las horas del módulo formativo</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseTutorGuide;
