import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Clock, BarChart3, ArrowLeft, Calendar, MessageSquare, FileText, CheckCircle2, PlayCircle, ChevronDown, Mail, Phone, FileDown, ShieldCheck, User, GraduationCap, MapIcon, Settings, ListChecks, Video, Headphones, FileQuestion, Layers, Presentation, Plus, BookMarked, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TutorMessaging } from "@/components/TutorMessaging";
import { GradesSection } from "@/components/GradesSection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeTrackingReport } from "@/components/TimeTrackingReport";
import { QualityAuditView } from "@/components/QualityAuditView";
import { UnitContentViewer } from "@/components/UnitContentViewer";
import { UnitActivityManager } from "@/components/UnitActivityManager";
import { CourseSchedule } from "@/components/CourseSchedule";
import { CourseCalendar } from "@/components/CourseCalendar";
import { GradeBreakdown } from "@/components/GradeBreakdown";
import ScormProfessionalViewer from "@/components/ScormProfessionalViewer";
import { UnitManualContent } from "@/components/UnitManualContent";
import { CourseStudentGuide } from "@/components/CourseStudentGuide";
import { CourseTrainingProgram } from "@/components/CourseTrainingProgram";
import { CourseWorkPlan } from "@/components/CourseWorkPlan";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  thumbnail_url: string;
  video_url?: string;
  objectives?: string;
  specific_objectives?: string[];
  concept_map_url?: string;
  support_email?: string;
  support_phone?: string;
  tutor_id?: string;
  tutor_cv_url?: string;
  campus_guide_url?: string;
  training_center_id?: string;
  start_date?: string;
  end_date?: string;
  enable_grade_breakdown?: boolean;
  ficha_certificado_url?: string;
  boe_url?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  start_date?: string | null;
  end_date?: string | null;
  completed?: boolean;
  progress?: number;
  evaluations?: any[];
  activities?: any[];
  scorm_content?: any[];
  formative_units?: FormativeUnit[];
  concept_map_url?: string | null;
  objectives?: string | null;
  content?: string | null;
  forum_enabled?: boolean;
}

interface FormativeUnit {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  objectives: string | null;
  order_index: number;
  duration_hours: number | null;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  evaluations?: any[];
  activities?: any[];
}

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [forumTopics, setForumTopics] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [studentName, setStudentName] = useState<string>("");
  const [tutorProfile, setTutorProfile] = useState<{ full_name: string; avatar_url?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("intro");
  const [centerSlug, setCenterSlug] = useState<string | null>(null);
  
  // Content viewer state
  const [contentViewerOpen, setContentViewerOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedUnitTitle, setSelectedUnitTitle] = useState<string>("");
  const [selectedContentType, setSelectedContentType] = useState<'video' | 'document' | 'audio' | 'scorm' | 'exercise' | 'presentation'>('video');

  // Activity manager state
  const [activityManagerOpen, setActivityManagerOpen] = useState(false);

  // SCORM content viewer state
  const [scormViewerOpen, setScormViewerOpen] = useState(false);

  const openContentViewer = (unitId: string, unitTitle: string, contentType: 'video' | 'document' | 'audio' | 'scorm' | 'exercise' | 'presentation') => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(unitTitle);
    setSelectedContentType(contentType);
    setContentViewerOpen(true);
  };

  const openActivityManager = (unitId: string, unitTitle: string) => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(unitTitle);
    setActivityManagerOpen(true);
  };

  const openScormViewer = (unitId: string, unitTitle: string) => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(unitTitle);
    setScormViewerOpen(true);
  };

  useEffect(() => {
    if (courseId && user) {
      loadCourseData();
    }
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      
      // Parse specific_objectives if it's a JSON field
      const parsedCourse = {
        ...courseData,
        specific_objectives: Array.isArray(courseData.specific_objectives) 
          ? courseData.specific_objectives 
          : []
      };
      setCourse(parsedCourse as Course);

      // Load center slug if course has a training center
      if (courseData.training_center_id) {
        const { data: centerData } = await supabase
          .from("training_centers")
          .select("slug")
          .eq("id", courseData.training_center_id)
          .single();
        
        if (centerData?.slug) {
          setCenterSlug(centerData.slug);
        }
      }

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) throw modulesError;

      // Load formative units for all modules
      const moduleIds = modulesData.map(m => m.id);
      const { data: formativeUnitsData } = await supabase
        .from("formative_units")
        .select("*")
        .in("module_id", moduleIds)
        .eq("is_active", true)
        .order("order_index");

      // Load evaluations and activities with formative_unit_id
      const { data: allEvaluations } = await supabase
        .from("evaluations")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_active", true);

      const { data: allActivities } = await supabase
        .from("development_activities")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_active", true);

      // Load progress for each module
      const modulesWithProgress = await Promise.all(
        modulesData.map(async (module) => {
          const [scormContent, progress] = await Promise.all([
            supabase.from("module_scorm_content").select("*, scorm_packages(*)").eq("module_id", module.id),
            supabase.from("module_progress").select("*").eq("module_id", module.id).eq("enrollment_id", user!.id).maybeSingle()
          ]);

          // Get formative units for this module
          const moduleUnits = (formativeUnitsData || [])
            .filter(u => u.module_id === module.id)
            .map(unit => ({
              ...unit,
              evaluations: (allEvaluations || []).filter(e => e.formative_unit_id === unit.id),
              activities: (allActivities || []).filter(a => a.formative_unit_id === unit.id)
            }));

          // Module-level evaluations and activities (not assigned to any UF)
          const moduleEvaluations = (allEvaluations || []).filter(e => e.module_id === module.id && !e.formative_unit_id);
          const moduleActivities = (allActivities || []).filter(a => a.module_id === module.id && !a.formative_unit_id);

          return {
            ...module,
            evaluations: moduleEvaluations,
            activities: moduleActivities,
            scorm_content: scormContent.data || [],
            formative_units: moduleUnits,
            completed: progress.data?.completed || false,
            progress: progress.data?.completed ? 100 : 0
          };
        })
      );

      setModules(modulesWithProgress);

      // Load or create enrollment
      let { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (enrollmentError && enrollmentError.code !== "PGRST116") throw enrollmentError;

      if (!enrollmentData) {
        // Create enrollment
        const { data: newEnrollment, error: createError } = await supabase
          .from("enrollments")
          .insert({
            user_id: user!.id,
            course_id: courseId,
          })
          .select()
          .single();

        if (createError) throw createError;
        enrollmentData = newEnrollment;
      }

      setEnrollment(enrollmentData);

      // Load calendar events
      const { data: eventsData } = await supabase
        .from("course_events")
        .select("*")
        .eq("course_id", courseId)
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(5);

      setEvents(eventsData || []);

      // Load forum topics
      const { data: topicsData } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .limit(10);

      setForumTopics(topicsData || []);

      // Load tutorials (events of type 'tutorial')
      const { data: tutorialsData } = await supabase
        .from("course_events")
        .select("*")
        .eq("course_id", courseId)
        .eq("event_type", "tutorial")
        .order("start_time", { ascending: true });

      setTutorials(tutorialsData || []);

      // Load exams (evaluations)
      const { data: examsData } = await supabase
        .from("evaluations")
        .select(`
          *,
          evaluation_attempts (
            id,
            score,
            status,
            completed_at
          )
        `)
        .eq("course_id", courseId)
        .eq("is_active", true);

      setExams(examsData || []);

      // Load student name from profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .single();
      
      if (profileData) {
        setStudentName(profileData.full_name || "Usuario");
      }

      // Load tutor profile if course has tutor_id
      if (courseData.tutor_id) {
        const { data: tutorData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", courseData.tutor_id)
          .single();
        
        if (tutorData) {
          setTutorProfile(tutorData);
        }
      }
    } catch (error: any) {
      console.error("Error loading course:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Curso no encontrado</CardTitle>
            <CardDescription>
              El curso que buscas no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtener próxima evaluación
  const nextEvaluation = modules
    .flatMap(m => m.evaluations || [])
    .filter((e: any) => {
      const attempts = e.evaluation_attempts || [];
      return !attempts.some((a: any) => a.status === 'completed' && a.score >= 50);
    })[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => {
            const dashboardRoutes: Record<string, string> = {
              'student': '/dashboard/student/courses',
              'teacher': '/dashboard/teacher/courses',
              'admin': '/dashboard/admin/courses',
              'super_admin': '/dashboard/admin/courses',
              'auditor': '/dashboard/auditor/courses',
              'inspector': '/dashboard/auditor/courses'
            };
            navigate(dashboardRoutes[userRole || 'student'] || '/dashboard/student/courses');
          }}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Course Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <img 
                    src="/branding/sepe-logo.png" 
                    alt="SEPE" 
                    className="h-8 object-contain"
                  />
                  <Badge className={getLevelColor(course.level)}>
                    {getLevelLabel(course.level)}
                  </Badge>
                  {course.category && (
                    <Badge variant="outline">{course.category}</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              </div>
              {(userRole === 'admin' || userRole === 'teacher' || userRole === 'super_admin') && (
                <Button 
                  onClick={() => navigate(`/dashboard/admin/courses/${courseId}/content`)}
                  variant="default"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Settings className="h-4 w-4" />
                  Modo Edición
                </Button>
              )}
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours} horas</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{modules.length} módulos</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>{enrollment?.progress_percentage || 0}% completado</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a 
                    href="https://wa.me/34665673416?text=Hola,%20tengo%20una%20duda%20sobre%20el%20curso" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp Dudas
                  </a>
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contacto
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] max-h-[600px] overflow-auto" align="end">
                    <TutorMessaging 
                      courseId={courseId!}
                      tutorId={course.tutor_id}
                      supportEmail={course.support_email}
                      supportPhone={course.support_phone}
                    />
                  </PopoverContent>
                </Popover>

                {(userRole === 'auditor' || userRole === 'admin') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('audit')}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Gestor Calidad
                  </Button>
                )}
              </div>
            </div>
            {enrollment && (
              <div className="mt-4">
                <Progress value={enrollment.progress_percentage || 0} />
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Course Content Tabs */}
        <div className="grid lg:grid-cols-[200px_1fr_280px] gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="hidden lg:block">
            <Card className="sticky top-4">
              <CardContent className="p-2">
                <nav className="flex flex-col space-y-1">
                  <button
                    onClick={() => setActiveTab("intro")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "intro" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => setActiveTab("student-guide")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "student-guide" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <BookMarked className="h-4 w-4" />
                    Guía del Alumno
                  </button>
                  <button
                    onClick={() => setActiveTab("training-program")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "training-program" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Programa Formativo
                  </button>
                  <button
                    onClick={() => setActiveTab("work-plan")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "work-plan" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <Calendar className="h-4 w-4" />
                    Plan de Trabajo
                  </button>
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "schedule" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Cronograma
                  </button>
                  <button
                    onClick={() => setActiveTab("modules")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "modules" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Módulos
                  </button>
                  <button
                    onClick={() => setActiveTab("grades")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "grades" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Calificaciones
                  </button>
                  <button
                    onClick={() => setActiveTab("exams")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "exams" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Exámenes
                  </button>
                  <button
                    onClick={() => setActiveTab("tutorials")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "tutorials" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Tutorías
                  </button>
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Calendario
                  </button>
                  <button
                    onClick={() => setActiveTab("forum")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "forum" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Foro
                  </button>
                  <button
                    onClick={() => setActiveTab("time-tracking")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "time-tracking" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Tiempos Invertidos
                  </button>
                  {(userRole === 'auditor' || userRole === 'admin') && (
                    <button
                      onClick={() => setActiveTab("audit")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "audit" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Auditoría
                    </button>
                  )}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">

          <TabsContent value="intro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guía de Uso de la Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold">Bienvenido/a al Campus Virtual</h3>
                  <p className="text-muted-foreground">
                    Esta plataforma está diseñada para facilitar tu proceso de aprendizaje. A continuación, 
                    te explicamos cómo navegar por las diferentes secciones:
                  </p>
                  <ul className="space-y-2 mt-4 list-disc list-inside">
                    <li><strong>Módulos:</strong> Accede al contenido del curso organizado por unidades didácticas</li>
                    <li><strong>Exámenes:</strong> Realiza las evaluaciones programadas</li>
                    <li><strong>Tutorías:</strong> Consulta las sesiones de tutoría y accede a las videollamadas</li>
                    <li><strong>Calendario:</strong> Visualiza todas las fechas importantes del curso</li>
                    <li><strong>Foro:</strong> Participa en discusiones con otros estudiantes y tutores</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

              {course.video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vídeo de Presentación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <video 
                        src={course.video_url} 
                        controls 
                        className="w-full h-full"
                      >
                        Tu navegador no soporta el elemento de vídeo.
                      </video>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Objetivos del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Objetivo General</h3>
                      <p className="text-muted-foreground">
                        {course.objectives || "Al finalizar este curso, habrás adquirido los conocimientos y competencias necesarios para desempeñarte con éxito en el área de estudio."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Objetivos Específicos</h3>
                      <ul className="space-y-2">
                        {course.specific_objectives && course.specific_objectives.length > 0 ? (
                          course.specific_objectives.map((obj: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{obj}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Comprender los conceptos fundamentales de la materia</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Aplicar los conocimientos adquiridos en casos prácticos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Desarrollar habilidades de análisis crítico</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Trabajar de forma colaborativa en proyectos del área</span>
                            </li>
                          </>
                        )}
                      </ul>

                      {course.concept_map_url && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-4">Mapa Conceptual</h3>
                          <img 
                            src={course.concept_map_url} 
                            alt="Mapa conceptual del curso" 
                            className="w-full rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documentos Oficiales del Certificado */}
              {(course.ficha_certificado_url || course.boe_url) && (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Documentos Oficiales del Certificado</CardTitle>
                        <CardDescription>Ficha del certificado de profesionalidad y BOE oficial</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {course.ficha_certificado_url && (
                        <div className="group space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <FileText className="h-5 w-5" />
                            Ficha del Certificado
                          </h4>
                          <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl overflow-hidden border-2 border-amber-200 dark:border-amber-800 relative">
                            <iframe
                              src={`${course.ficha_certificado_url}#toolbar=0&navpanes=0&scrollbar=0`}
                              className="w-full h-full"
                              title="Ficha del Certificado de Profesionalidad"
                              loading="lazy"
                            />
                            {/* Fallback overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/90 to-orange-100/90 dark:from-amber-900/90 dark:to-orange-900/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <FileText className="h-16 w-16 text-amber-600 mb-3" />
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Ficha del Certificado</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">Documento PDF oficial</p>
                            </div>
                          </div>
                          <Button asChild variant="default" className="w-full bg-amber-600 hover:bg-amber-700">
                            <a 
                              href={course.ficha_certificado_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <FileDown className="h-4 w-4" />
                              Ver / Descargar Ficha
                            </a>
                          </Button>
                        </div>
                      )}
                      {course.boe_url && (
                        <div className="group space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <FileText className="h-5 w-5" />
                            Boletín Oficial del Estado (BOE)
                          </h4>
                          <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl overflow-hidden border-2 border-amber-200 dark:border-amber-800 relative">
                            <iframe
                              src={`${course.boe_url}#toolbar=0&navpanes=0&scrollbar=0`}
                              className="w-full h-full"
                              title="BOE del Certificado"
                              loading="lazy"
                            />
                            {/* Fallback overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/90 to-orange-100/90 dark:from-amber-900/90 dark:to-orange-900/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <FileText className="h-16 w-16 text-amber-600 mb-3" />
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Boletín Oficial del Estado</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">Documento PDF oficial</p>
                            </div>
                          </div>
                          <Button asChild variant="default" className="w-full bg-amber-600 hover:bg-amber-700">
                            <a 
                              href={course.boe_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <FileDown className="h-4 w-4" />
                              Ver / Descargar BOE
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Guía del Campus */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Guía del Campus Virtual</CardTitle>
                      <CardDescription>Manual de usuario con instrucciones detalladas</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.campus_guide_url ? (
                    <>
                      <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                        <iframe
                          src={`${course.campus_guide_url}#toolbar=1&navpanes=0`}
                          className="w-full h-full"
                          title="Guía del Campus"
                        />
                      </div>
                      <Button asChild className="w-full">
                        <a 
                          href={course.campus_guide_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <FileDown className="h-4 w-4" />
                          Descargar Guía del Campus (PDF)
                        </a>
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center">
                        Consulta la guía completa del campus virtual con instrucciones detalladas para SEPE.
                      </p>
                      <Button asChild className="w-full">
                        <a 
                          href={centerSlug ? `/campus-guide?center=${centerSlug}` : "/campus-guide"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <MapIcon className="h-4 w-4" />
                          Ver Guía del Campus Virtual
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CV del Docente */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Curriculum del Docente</CardTitle>
                      <CardDescription>Conoce al profesional que imparte este curso</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.tutor_cv_url ? (
                    <>
                      <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                        <iframe
                          src={`${course.tutor_cv_url}#toolbar=1&navpanes=0`}
                          className="w-full h-full"
                          title="CV del Docente"
                        />
                      </div>
                      <Button asChild className="w-full">
                        <a 
                          href={course.tutor_cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <FileDown className="h-4 w-4" />
                          Descargar CV del Docente (PDF)
                        </a>
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>CV del docente no disponible</p>
                      <p className="text-sm">Contacta con soporte para más información</p>
                    </div>
                  )}
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <CourseSchedule
              courseTitle={course.title}
              courseStartDate={course.start_date}
              courseEndDate={course.end_date}
              modules={modules}
              events={[...events, ...tutorials]}
              exams={exams}
            />
          </TabsContent>

          <TabsContent value="student-guide" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <CourseStudentGuide 
                  course={course} 
                  centerSlug={centerSlug} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training-program" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <CourseTrainingProgram 
                  course={course} 
                  modules={modules}
                  centerSlug={centerSlug}
                  isEditable={userRole === 'admin' || userRole === 'teacher' || userRole === 'super_admin'}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work-plan" className="space-y-4">
            <CourseWorkPlan 
              course={course} 
              modules={modules}
              centerSlug={centerSlug} 
            />
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <GradeBreakdown 
              courseId={courseId!} 
              enrollmentId={enrollment?.id || ''} 
              enableBreakdown={course.enable_grade_breakdown}
            />
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            {/* SEPE Info Banner */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Estructura SEPE</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Este curso cumple con los requisitos de la normativa SEPE: módulos formativos, 
                      evaluaciones con nota mínima del 50%, actividades de desarrollo y control de tiempos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-lg font-semibold">Unidades Formativas / Módulos</h2>
              <p className="text-sm text-muted-foreground">
                Haz clic en cada módulo para expandir y ver su contenido
              </p>
            </div>

            {modules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-2">Sin módulos</h3>
                  <p className="text-sm text-muted-foreground">
                    Este curso aún no tiene módulos configurados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {modules.map((module, index) => {
                  const moduleUnits = module.formative_units || [];
                  const totalEvaluations = (module.evaluations?.length || 0) + moduleUnits.reduce((sum, u) => sum + (u.evaluations?.length || 0), 0);
                  const totalActivities = (module.activities?.length || 0) + moduleUnits.reduce((sum, u) => sum + (u.activities?.length || 0), 0);

                  return (
                    <Accordion key={module.id} type="single" collapsible>
                      <AccordionItem value={module.id} className="border rounded-lg overflow-hidden">
                        <Card className="border-0 shadow-none">
                          <AccordionTrigger className="hover:no-underline px-0">
                            <CardHeader className="pb-3 hover:bg-muted/50 transition-colors w-full">
                              <div className="flex items-start gap-4 w-full">
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                  <span className="font-mono text-sm font-bold bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">{index + 1}</span>
                                </div>
                                <div className="flex-1 text-left">
                                  <CardTitle className="text-lg">{module.title}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {module.description || "Sin descripción"}
                                  </CardDescription>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {module.duration_minutes ? (module.duration_minutes / 60).toFixed(1) : 0}h
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      {totalEvaluations} tests
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {totalActivities} actividades
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <ListChecks className="h-3 w-3" />
                                      {moduleUnits.length} UFs
                                    </span>
                                    <div className="flex items-center gap-2 ml-auto">
                                      <Progress value={module.progress || 0} className="w-20 h-2" />
                                      <span className="font-medium">{module.progress || 0}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                          </AccordionTrigger>
                          <AccordionContent>
                            <CardContent className="pt-0 border-t bg-muted/20">
                              <div className="space-y-4 pt-4">
                                {/* Fila 1: Mapa Conceptual y Objetivos */}
                                <div className="grid lg:grid-cols-2 gap-4">
                                  <div className="bg-background rounded-lg p-4 border">
                                    <h4 className="font-medium flex items-center gap-2 text-sm mb-3">
                                      <Layers className="h-4 w-4 text-primary" />
                                      Mapa Conceptual
                                    </h4>
                                    {(() => {
                                      // Generate concept map based on module title
                                      const moduleTitle = module.title.toLowerCase();
                                      let conceptNodes: { label: string; level: number }[] = [];
                                      
                                      if (moduleTitle.includes('técnicas administrativas') || moduleTitle.includes('mf0969')) {
                                        conceptNodes = [
                                          { label: 'TÉCNICAS ADMINISTRATIVAS', level: 0 },
                                          { label: 'Organización', level: 1 },
                                          { label: 'Documentación', level: 1 },
                                          { label: 'Tesorería', level: 1 },
                                          { label: 'Empresas', level: 2 },
                                          { label: 'RRHH', level: 2 },
                                          { label: 'Correspondencia', level: 2 },
                                          { label: 'Mercantiles', level: 2 },
                                          { label: 'Existencias', level: 2 },
                                        ];
                                      }
                                      
                                      if (conceptNodes.length === 0 && module.concept_map_url) {
                                        return (
                                          <a href={module.concept_map_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                            Ver mapa conceptual
                                          </a>
                                        );
                                      }
                                      
                                      if (conceptNodes.length === 0) {
                                        return <p className="text-xs text-muted-foreground">Sin mapa conceptual</p>;
                                      }
                                      
                                      return (
                                        <div className="space-y-3">
                                          {/* Root node */}
                                          <div className="flex justify-center">
                                            <span className="px-3 py-1.5 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-lg font-semibold text-xs shadow">
                                              {conceptNodes.find(n => n.level === 0)?.label}
                                            </span>
                                          </div>
                                          {/* Level 1 */}
                                          <div className="flex flex-wrap justify-center gap-2">
                                            {conceptNodes.filter(n => n.level === 1).map((node, i) => (
                                              <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-xs font-medium border border-blue-200 dark:border-blue-800">
                                                {node.label}
                                              </span>
                                            ))}
                                          </div>
                                          {/* Level 2 */}
                                          <div className="flex flex-wrap justify-center gap-1">
                                            {conceptNodes.filter(n => n.level === 2).map((node, i) => (
                                              <span key={i} className="px-2 py-0.5 bg-muted rounded text-xs">
                                                {node.label}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  <div className="bg-background rounded-lg p-4 border">
                                    <h4 className="font-medium flex items-center gap-2 text-sm mb-3">
                                      <BookOpen className="h-4 w-4 text-primary" />
                                      Objetivos
                                    </h4>
                                    {(() => {
                                      const moduleTitle = module.title.toLowerCase();
                                      let objectives: string[] = [];
                                      
                                      if (moduleTitle.includes('técnicas administrativas') || moduleTitle.includes('mf0969')) {
                                        objectives = [
                                          'Conocer la organización empresarial y tipos de entidades',
                                          'Gestionar correspondencia y documentación',
                                          'Realizar operaciones básicas de tesorería',
                                          'Controlar existencias e inventarios',
                                          'Aplicar técnicas de archivo y clasificación'
                                        ];
                                      }
                                      
                                      if (objectives.length === 0 && module.objectives) {
                                        return <p className="text-xs text-muted-foreground line-clamp-3">{module.objectives}</p>;
                                      }
                                      
                                      if (objectives.length === 0) {
                                        return <p className="text-xs text-muted-foreground">Sin objetivos definidos</p>;
                                      }
                                      
                                      return (
                                        <ul className="space-y-1.5">
                                          {objectives.map((obj, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs">
                                              <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                              <span className="text-muted-foreground">{obj}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      );
                                    })()}
                                  </div>
                                </div>

                                {/* Fila 2: Temario y Foro */}
                                <div className="grid lg:grid-cols-2 gap-4">
                                <div className="bg-background rounded-lg p-4 border lg:col-span-2">
                                    <h4 className="font-medium flex items-center gap-2 text-sm mb-4">
                                      <FileText className="h-4 w-4 text-primary" />
                                      Temario / Manual
                                    </h4>
                                    <UnitManualContent unitId={module.id} unitTitle={module.title} />
                                  </div>

                                  <div className="bg-background rounded-lg p-4 border">
                                    <h4 className="font-medium flex items-center gap-2 text-sm mb-2">
                                      <MessageSquare className="h-4 w-4 text-primary" />
                                      Foro del Módulo
                                    </h4>
                                    <Badge variant={module.forum_enabled ? "default" : "secondary"} className="text-xs">
                                      {module.forum_enabled ? "Activo" : "Desactivado"}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Unidades Formativas */}
                                <div className="border-t pt-4">
                                  <h4 className="font-medium flex items-center gap-2 mb-3">
                                    <ListChecks className="h-4 w-4 text-primary" />
                                    Unidades Formativas ({moduleUnits.length})
                                  </h4>
                                  
                                  {moduleUnits.length === 0 ? (
                                    <div className="text-sm text-muted-foreground bg-background rounded-lg p-4 border border-dashed text-center">
                                      Sin unidades formativas en este módulo
                                    </div>
                                  ) : (
                                    <Accordion type="multiple" className="space-y-2">
                                      {moduleUnits.map((unit, unitIndex) => (
                                        <AccordionItem key={unit.id} value={unit.id} className="bg-background rounded-lg border">
                                          <AccordionTrigger className="hover:no-underline px-4 py-3">
                                            <div className="flex items-center gap-3 w-full pr-4">
                                              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {index + 1}.{unitIndex + 1}
                                              </span>
                                              <div className="text-left flex-1">
                                                <p className="font-medium text-sm">{unit.title}</p>
                                                {unit.duration_hours && (
                                                  <p className="text-xs text-muted-foreground">{unit.duration_hours}h</p>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                  <CheckCircle2 className="h-3 w-3" />
                                                  {unit.evaluations?.length || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <FileText className="h-3 w-3" />
                                                  {unit.activities?.length || 0}
                                                </span>
                                              </div>
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-3">
                                              {/* Unit info */}
                                              {(unit.objectives || unit.description) && (
                                                <div className="space-y-2">
                                                  {unit.objectives && (
                                                    <div>
                                                      <p className="text-xs font-medium text-muted-foreground mb-1">Objetivos:</p>
                                                      <p className="text-xs">{unit.objectives}</p>
                                                    </div>
                                                  )}
                                                  {unit.description && (
                                                    <div>
                                                      <p className="text-xs font-medium text-muted-foreground mb-1">Descripción:</p>
                                                      <p className="text-xs">{unit.description}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {/* Botón Manual SEPE - Destacado */}
                                              <div className="pt-2 border-t">
                                                <Button
                                                  variant="default"
                                                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                                  onClick={() => openScormViewer(unit.id, unit.title)}
                                                >
                                                  <BookOpen className="h-4 w-4 mr-2" />
                                                  📚 Ver Manual / Temario SEPE
                                                </Button>
                                              </div>

                                              {/* Contenido Interactivo */}
                                              <div className="pt-2 border-t">
                                                <span className="text-xs font-medium flex items-center gap-1.5 mb-2">
                                                  <PlayCircle className="h-3 w-3 text-primary" />
                                                  Contenido Interactivo
                                                </span>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                  <div 
                                                    className="bg-muted/50 rounded-lg p-3 border cursor-pointer hover:border-primary transition-colors"
                                                    onClick={() => openContentViewer(unit.id, unit.title, 'video')}
                                                  >
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded">
                                                        <Video className="h-4 w-4 text-red-600" />
                                                      </div>
                                                      <span className="text-sm font-medium">Video</span>
                                                    </div>
                                                    <Progress value={0} className="h-1.5" />
                                                  </div>
                                                  
                                                  <div 
                                                    className="bg-muted/50 rounded-lg p-3 border cursor-pointer hover:border-primary transition-colors"
                                                    onClick={() => openContentViewer(unit.id, unit.title, 'presentation')}
                                                  >
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                                                        <Presentation className="h-4 w-4 text-orange-600" />
                                                      </div>
                                                      <span className="text-sm font-medium">Presentación</span>
                                                    </div>
                                                    <Progress value={0} className="h-1.5" />
                                                  </div>
                                                  
                                                  <div 
                                                    className="bg-muted/50 rounded-lg p-3 border cursor-pointer hover:border-primary transition-colors"
                                                    onClick={() => openContentViewer(unit.id, unit.title, 'audio')}
                                                  >
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                                                        <Headphones className="h-4 w-4 text-purple-600" />
                                                      </div>
                                                      <span className="text-sm font-medium">Audio</span>
                                                    </div>
                                                    <Progress value={0} className="h-1.5" />
                                                  </div>
                                                  
                                                  <div 
                                                    className="bg-muted/50 rounded-lg p-3 border cursor-pointer hover:border-primary transition-colors"
                                                    onClick={() => openContentViewer(unit.id, unit.title, 'document')}
                                                  >
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                      </div>
                                                      <span className="text-sm font-medium">Documento</span>
                                                    </div>
                                                    <Progress value={0} className="h-1.5" />
                                                  </div>
                                                  
                                                  <div 
                                                    className="bg-muted/50 rounded-lg p-3 border cursor-pointer hover:border-primary transition-colors bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10"
                                                    onClick={() => openScormViewer(unit.id, unit.title)}
                                                  >
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                                                        <Layers className="h-4 w-4 text-green-600" />
                                                      </div>
                                                      <span className="text-sm font-medium">SCORM</span>
                                                    </div>
                                                    <Progress value={0} className="h-1.5" />
                                                  </div>
                                                  
                                                  <div 
                                                    className="bg-muted/50 rounded-lg p-3 border cursor-pointer hover:border-primary transition-colors"
                                                    onClick={() => openContentViewer(unit.id, unit.title, 'exercise')}
                                                  >
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                                                        <FileQuestion className="h-4 w-4 text-amber-600" />
                                                      </div>
                                                      <span className="text-sm font-medium">Ejercicio</span>
                                                    </div>
                                                    <Progress value={0} className="h-1.5" />
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Tests de la UF */}
                                              {unit.evaluations && unit.evaluations.length > 0 && (
                                                <div className="pt-2 border-t">
                                                  <span className="text-xs font-medium flex items-center gap-1.5 mb-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    Tests / Evaluaciones ({unit.evaluations.length})
                                                  </span>
                                                  <div className="space-y-1">
                                                    {unit.evaluations.map((evaluation: any) => (
                                                      <Button
                                                        key={evaluation.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-xs h-8"
                                                        onClick={() => navigate(`/course/${courseId}/evaluation/${evaluation.id}`)}
                                                      >
                                                        {evaluation.title}
                                                      </Button>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Actividades de la UF */}
                                              {unit.activities && unit.activities.length > 0 && (
                                                <div className="pt-2 border-t">
                                                  <span className="text-xs font-medium flex items-center gap-1.5 mb-2">
                                                    <FileText className="h-3 w-3 text-primary" />
                                                    Actividades ({unit.activities.length})
                                                  </span>
                                                  <div className="space-y-1">
                                                    {unit.activities.map((activity: any) => (
                                                      <Button
                                                        key={activity.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-xs h-8"
                                                        onClick={() => openActivityManager(unit.id, unit.title)}
                                                      >
                                                        {activity.title}
                                                      </Button>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                    </Accordion>
                                  )}
                                </div>

                                {/* Module-level evaluations */}
                                {module.evaluations && module.evaluations.length > 0 && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium flex items-center gap-2 text-sm mb-2">
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                      Tests del Módulo ({module.evaluations.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {module.evaluations.map((evaluation: any) => (
                                        <Button
                                          key={evaluation.id}
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => navigate(`/course/${courseId}/evaluation/${evaluation.id}`)}
                                        >
                                          {evaluation.title}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Module-level activities */}
                                {module.activities && module.activities.length > 0 && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium flex items-center gap-2 text-sm mb-2">
                                      <FileText className="h-4 w-4 text-primary" />
                                      Actividades del Módulo ({module.activities.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {module.activities.map((activity: any) => (
                                        <Button
                                          key={activity.id}
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => navigate(`/course/${courseId}/activity/${activity.id}`)}
                                        >
                                          {activity.title}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            {exams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay exámenes disponibles</p>
                </CardContent>
              </Card>
            ) : (
              exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {exam.title}
                      </span>
                      <Badge variant={exam.evaluation_attempts?.some((a: any) => a.status === 'completed') ? "default" : "secondary"}>
                        {exam.evaluation_attempts?.some((a: any) => a.status === 'completed') ? "Completado" : "Pendiente"}
                      </Badge>
                    </CardTitle>
                    {exam.description && (
                      <CardDescription>{exam.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Nota mínima: <strong>{exam.passing_score}%</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Intentos: <strong>{exam.max_attempts || "Ilimitados"}</strong>
                      </span>
                      {exam.time_limit_minutes && (
                        <span className="text-muted-foreground">
                          Tiempo: <strong>{exam.time_limit_minutes} min</strong>
                        </span>
                      )}
                    </div>
                    {exam.evaluation_attempts && exam.evaluation_attempts.length > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Último intento:</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            Calificación: <strong>{exam.evaluation_attempts[0].score}%</strong>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(exam.evaluation_attempts[0].completed_at).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </div>
                    )}
                    <Button className="w-full mt-4">
                      {exam.evaluation_attempts?.some((a: any) => a.status === 'completed') ? "Ver Resultados" : "Comenzar Examen"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-4">
            {tutorials.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay tutorías programadas</p>
                </CardContent>
              </Card>
            ) : (
              tutorials.map((tutorial) => (
                <Card key={tutorial.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>
                      {new Date(tutorial.start_time).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                      {tutorial.end_time && ` - ${new Date(tutorial.end_time).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tutorial.description && (
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                    )}
                    {tutorial.meeting_url && (
                      <Button className="w-full" asChild>
                        <a href={tutorial.meeting_url} target="_blank" rel="noopener noreferrer">
                          Acceder a la Tutoría
                        </a>
                      </Button>
                    )}
                    {tutorial.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-medium">Ubicación:</span> {tutorial.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CourseCalendar
              modules={modules}
              courseStartDate={course.start_date}
              courseEndDate={course.end_date}
            />

            {/* Events list */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos eventos</CardTitle>
                <CardDescription>Eventos y tutorías programadas</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay eventos próximos</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(event.start_time).toLocaleString('es-ES', {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge>{event.event_type}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forum" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Foro de discusión</CardTitle>
                    <CardDescription>Participa en las conversaciones del curso</CardDescription>
                  </div>
                  <Button>Nuevo tema</Button>
                </div>
              </CardHeader>
              <CardContent>
                {forumTopics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay temas en el foro</p>
                ) : (
                  <div className="space-y-4">
                    {forumTopics.map((topic) => (
                      <Card key={topic.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{topic.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Por: {topic.profiles?.full_name || "Usuario"}</span>
                              <span>{new Date(topic.created_at).toLocaleDateString('es-ES')}</span>
                              <span>{topic.views_count} vistas</span>
                            </div>
                          </div>
                          {topic.is_pinned && <Badge variant="secondary">Fijado</Badge>}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time-tracking" className="space-y-4">
            <TimeTrackingReport 
              courseName={course?.title || ""}
              modules={modules}
              enrollment={enrollment}
              studentName={studentName}
            />
          </TabsContent>

          {(userRole === 'auditor' || userRole === 'admin') && (
            <TabsContent value="audit" className="space-y-4">
              <QualityAuditView courseId={courseId!} />
            </TabsContent>
          )}
          </Tabs>
          </div>
          
          {/* Right Sidebar - Tutor and Evaluations */}
          <div className="hidden lg:block space-y-4 sticky top-4 h-fit">
            {/* Tu Tutor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tu Tutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {tutorProfile?.full_name ? tutorProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TU'}
                  </div>
                  <div>
                    <p className="font-semibold">{tutorProfile?.full_name || 'Tutor del curso'}</p>
                    <p className="text-xs text-muted-foreground">Tutor/a especializado/a</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-full" variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] max-h-[600px] overflow-auto" align="end">
                    <TutorMessaging 
                      courseId={courseId!}
                      tutorId={course.tutor_id || ''}
                      supportEmail={course.support_email || ''}
                      supportPhone={course.support_phone || ''}
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Progreso del Curso */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Mi Progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{enrollment?.progress_percentage || 0}%</p>
                  <p className="text-xs text-muted-foreground">completado</p>
                </div>
                <Progress value={enrollment?.progress_percentage || 0} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="font-medium">{modules.length}</p>
                    <p className="text-muted-foreground">Módulos</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="font-medium">{course.duration_hours}h</p>
                    <p className="text-muted-foreground">Duración</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cronograma Mini */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {modules.slice(0, 3).map((module, idx) => (
                  <div key={module.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${module.progress === 100 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                    <span className="truncate flex-1">{module.title}</span>
                    {module.start_date && (
                      <span className="text-muted-foreground whitespace-nowrap">
                        {new Date(module.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                ))}
                {modules.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs h-7"
                    onClick={() => setActiveTab('schedule')}
                  >
                    Ver cronograma completo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Próxima Evaluación */}
            {nextEvaluation && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Evaluación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1 line-clamp-2">
                      {nextEvaluation.title}
                    </p>
                    <p className="text-2xl font-bold text-primary">5 días</p>
                  </div>
                  <Button className="w-full bg-primary" size="sm">
                    Preparar examen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Content Viewer Dialog */}
      <UnitContentViewer
        open={contentViewerOpen}
        onOpenChange={setContentViewerOpen}
        unitId={selectedUnitId}
        unitTitle={selectedUnitTitle}
        contentType={selectedContentType}
        enrollmentId={enrollment?.id}
      />

      {/* Activity Manager Dialog */}
      <UnitActivityManager
        open={activityManagerOpen}
        onOpenChange={setActivityManagerOpen}
        unitId={selectedUnitId}
        unitTitle={selectedUnitTitle}
        courseId={courseId || ""}
      />

      {/* SCORM Content Viewer Dialog - Professional Format */}
      <ScormProfessionalViewer
        open={scormViewerOpen}
        onOpenChange={setScormViewerOpen}
        unitId={selectedUnitId}
        unitTitle={selectedUnitTitle}
        enrollmentId={enrollment?.id}
      />
    </div>
  );
}
