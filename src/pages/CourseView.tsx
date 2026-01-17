import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Clock, BarChart3, ArrowLeft, Calendar, MessageSquare, FileText, CheckCircle2, CheckCircle, PlayCircle, ChevronDown, Mail, Phone, FileDown, ShieldCheck, User, GraduationCap, MapIcon, Settings, ListChecks, Video, Headphones, FileQuestion, Layers, Presentation, Plus, BookMarked, ClipboardList, Circle, AlertCircle, Star, Edit2, Play, MonitorPlay, Inbox, Bell, HelpCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TutorMessaging } from "@/components/TutorMessaging";
import { GradesSection } from "@/components/GradesSection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeTrackingReport } from "@/components/TimeTrackingReport";
import { QualityAuditView } from "@/components/QualityAuditView";
import { UnitContentViewer } from "@/components/UnitContentViewer";
import { InteractiveMultimediaViewer } from "@/components/InteractiveMultimediaViewer";
import { UnitActivityManager } from "@/components/UnitActivityManager";
import { CourseSchedule } from "@/components/CourseSchedule";
import { CourseCalendar } from "@/components/CourseCalendar";
import { GradeBreakdown } from "@/components/GradeBreakdown";
import { SEPEGradesSection } from "@/components/SEPEGradesSection";
import ScormProfessionalViewer from "@/components/ScormProfessionalViewer";

import { CourseStudentGuide } from "@/components/CourseStudentGuide";
import { CourseTrainingProgram } from "@/components/CourseTrainingProgram";
import { CourseWorkPlan } from "@/components/CourseWorkPlan";
import { PreAssessmentTest } from "@/components/PreAssessmentTest";
import { SingleDocumentUploader } from "@/components/SingleDocumentUploader";
import { PlatformHelpResources } from "@/components/PlatformHelpResources";
import { CourseForum } from "@/components/CourseForum";
import { WorkPlanCalendar } from "@/components/WorkPlanCalendar";
import { SyllabusEditor } from "@/components/SyllabusEditor";
import { ActivitySubmissionViewer } from "@/components/ActivitySubmissionViewer";
import { useUnitProgress } from "@/hooks/useUnitProgress";
import { ModuleEvaluationTest } from "@/components/ModuleEvaluationTest";

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
  student_guide_pdf_url?: string | null;
  training_program_pdf_url?: string | null;
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

// Component to show student's enrolled courses
function MyCoursesList({ currentCourseId }: { currentCourseId: string }) {
  const [courses, setCourses] = useState<{ id: string; title: string; progress: number; thumbnail_url?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          progress_percentage,
          courses:course_id (
            id,
            title,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id);
      
      if (!error && data) {
        const enrolledCourses = data
          .filter((e: any) => e.courses)
          .map((e: any) => ({
            id: e.courses.id,
            title: e.courses.title,
            progress: e.progress_percentage || 0,
            thumbnail_url: e.courses.thumbnail_url
          }));
        setCourses(enrolledCourses);
      }
      setLoading(false);
    };

    loadCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tienes cursos matriculados</p>
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto">
      {courses.map((c) => (
        <button
          key={c.id}
          onClick={() => navigate(`/course/${c.id}`)}
          className={`w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 text-left ${
            c.id === currentCourseId ? 'bg-primary/10' : ''
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {c.thumbnail_url ? (
              <img src={c.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${c.id === currentCourseId ? 'text-primary' : ''}`}>
              {c.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={c.progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">{c.progress}%</span>
            </div>
          </div>
          {c.id === currentCourseId && (
            <Badge variant="secondary" className="text-xs">Actual</Badge>
          )}
        </button>
      ))}
    </div>
  );
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
  
  // Extract all formative unit IDs for progress tracking
  const allFormativeUnitIds = modules.flatMap(m => 
    (m.formative_units || []).map(u => u.id)
  );

  // Use unit progress hook - must be called before any conditional returns
  const { getUnitProgress, updateContentProgress, updateActivityProgress } = useUnitProgress({
    enrollmentId: enrollment?.id || null,
    formativeUnitIds: allFormativeUnitIds,
  });
  
  // Content viewer state
  const [contentViewerOpen, setContentViewerOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedUnitTitle, setSelectedUnitTitle] = useState<string>("");
  const [selectedContentType, setSelectedContentType] = useState<'video' | 'document' | 'audio' | 'scorm' | 'exercise' | 'presentation'>('video');

  // Activity manager state
  const [activityManagerOpen, setActivityManagerOpen] = useState(false);
  
  // Activity submission viewer state
  const [activitySubmissionOpen, setActivitySubmissionOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");

  // SCORM content viewer state
  const [scormViewerOpen, setScormViewerOpen] = useState(false);

  // Syllabus editor state
  const [syllabusEditorOpen, setSyllabusEditorOpen] = useState(false);
  
  const openActivitySubmission = (activityId: string) => {
    setSelectedActivityId(activityId);
    setActivitySubmissionOpen(true);
  };

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

  const openSyllabusEditor = (unitId: string, unitTitle: string) => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(unitTitle);
    setSyllabusEditorOpen(true);
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Mis Cursos
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0" align="end">
                    <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                      <h4 className="font-semibold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Mis Formaciones Activas
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Accede a tus cursos matriculados
                      </p>
                    </div>
                    <MyCoursesList currentCourseId={courseId!} />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <Inbox className="h-4 w-4 mr-2" />
                      Mensajes Pendientes
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0" align="end">
                    <div className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-amber-500/5">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Inbox className="h-5 w-5 text-amber-600" />
                        Mensajes Pendientes
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Correo interno y foros sin leer
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
                        <Bell className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          Aquí te aparecerán los temas que tienes pendientes directamente relacionados con el correo electrónico interno o temas del foro sin leer.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      CAU
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="end">
                    <div className="p-4 border-b bg-gradient-to-r from-red-500/10 to-red-500/5">
                      <h4 className="font-semibold flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-red-600" />
                        Centro de Atención al Usuario (CAU)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Soporte técnico y ayuda del campus
                      </p>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Si tienes alguna duda o consulta técnica, puedes contactar con el <span className="font-semibold text-foreground">Centro de Atención al Usuario</span>.
                      </p>
                      
                      <p className="text-sm text-muted-foreground">
                        Dispones de un enlace para consultar la <span className="font-semibold text-foreground">Ayuda del Campus Virtual</span> con vídeos tutoriales y "paseos virtuales" por las distintas áreas del Campus.
                      </p>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <a href="mailto:formacion.empleate@gmail.com" className="text-primary hover:underline">
                            formacion.empleate@gmail.com
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>665 673 416</span>
                          <span className="text-muted-foreground text-xs">(09:00 - 14:00)</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/campus-guide')}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Ayuda del Campus Virtual
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

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
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "modules" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Formación en Campus
                  </button>
                  <button
                    onClick={() => setActiveTab("grades")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "grades" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <BarChart3 className="h-4 w-4" />
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
              {/* Mobile Tab Navigation */}
              <div className="lg:hidden overflow-x-auto pb-2">
                <TabsList className="w-max min-w-full flex h-auto p-1 gap-1">
                  <TabsTrigger value="intro" className="text-xs px-2 py-1.5">Inicio</TabsTrigger>
                  <TabsTrigger value="student-guide" className="text-xs px-2 py-1.5">Guía Alumno</TabsTrigger>
                  <TabsTrigger value="training-program" className="text-xs px-2 py-1.5">Programa</TabsTrigger>
                  <TabsTrigger value="work-plan" className="text-xs px-2 py-1.5">Plan Trabajo</TabsTrigger>
                  <TabsTrigger value="schedule" className="text-xs px-2 py-1.5">Cronograma</TabsTrigger>
                  <TabsTrigger value="modules" className="text-xs px-2 py-1.5">Formación</TabsTrigger>
                  <TabsTrigger value="grades" className="text-xs px-2 py-1.5">Calificaciones</TabsTrigger>
                  <TabsTrigger value="exams" className="text-xs px-2 py-1.5">Exámenes</TabsTrigger>
                  <TabsTrigger value="tutorials" className="text-xs px-2 py-1.5">Tutorías</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs px-2 py-1.5">Calendario</TabsTrigger>
                  <TabsTrigger value="forum" className="text-xs px-2 py-1.5">Foro</TabsTrigger>
                  <TabsTrigger value="time-tracking" className="text-xs px-2 py-1.5">Tiempos</TabsTrigger>
                  {(userRole === 'auditor' || userRole === 'admin') && (
                    <TabsTrigger value="audit" className="text-xs px-2 py-1.5">Auditoría</TabsTrigger>
                  )}
                </TabsList>
              </div>

          <TabsContent value="intro" className="space-y-6">
            {/* Platform Help Resources */}
            <PlatformHelpResources centerSlug={centerSlug} />

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
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <FileText className="h-5 w-5" />
                            Ficha del Certificado
                          </h4>
                          <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center">
                            <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-2xl mb-4">
                              <FileText className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-1">Ficha del Certificado</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">Documento PDF oficial</p>
                            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Disponible
                            </Badge>
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
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <FileText className="h-5 w-5" />
                            Boletín Oficial del Estado (BOE)
                          </h4>
                          <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center">
                            <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-2xl mb-4">
                              <BookOpen className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-1">BOE Oficial</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">Documento normativo</p>
                            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Disponible
                            </Badge>
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
            {/* Admin uploader for custom student guide */}
            {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
              <SingleDocumentUploader
                courseId={courseId || ''}
                documentUrl={course.student_guide_pdf_url}
                documentType="guide"
                onUpdate={loadCourseData}
                isAdmin={true}
              />
            )}
            
            {course.student_guide_pdf_url ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-primary" />
                    Guía del Alumno (PDF)
                  </CardTitle>
                  <CardDescription>Documento oficial de la guía del alumno para este curso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                    <iframe
                      src={`${course.student_guide_pdf_url}#toolbar=1&navpanes=0`}
                      className="w-full h-full"
                      title="Guía del Alumno"
                    />
                  </div>
                  <Button asChild className="w-full">
                    <a 
                      href={course.student_guide_pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      Descargar Guía del Alumno (PDF)
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <CourseStudentGuide 
                    course={course} 
                    centerSlug={centerSlug} 
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="training-program" className="space-y-4">
            {/* Admin uploader for custom training program */}
            {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
              <SingleDocumentUploader
                courseId={courseId || ''}
                documentUrl={course.training_program_pdf_url}
                documentType="program"
                onUpdate={loadCourseData}
                isAdmin={true}
              />
            )}
            
            {/* Credenciales de prueba - Solo visible para evaluadores (inspector, auditor) */}
            {(userRole === 'inspector' || userRole === 'auditor') && (
              <Card className="border-amber-300 bg-amber-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-amber-800 text-lg">
                    <ShieldCheck className="h-5 w-5" />
                    Credenciales de Prueba para Evaluación
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    Utilice estas credenciales para acceder a la plataforma como alumno o tutor-formador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="bg-teal-600 text-white p-2 text-left font-semibold border" colSpan={2}>CLAVE ALUMNO</th>
                          <th className="bg-teal-600 text-white p-2 text-left font-semibold border" colSpan={2}>CLAVE TUTOR-FORMADOR</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border p-2 text-muted-foreground">Usuario:</td>
                          <td className="border p-2 font-mono font-medium">alumnocertificados</td>
                          <td className="border p-2 text-muted-foreground">Usuario:</td>
                          <td className="border p-2 font-mono font-medium">tutorcertificados</td>
                        </tr>
                        <tr className="bg-muted/30">
                          <td className="border p-2 text-muted-foreground">Contraseña:</td>
                          <td className="border p-2 font-mono font-medium">d123456-A</td>
                          <td className="border p-2 text-muted-foreground">Contraseña:</td>
                          <td className="border p-2 font-mono font-medium">d123456-T</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {course.training_program_pdf_url ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Programa Formativo (PDF)
                  </CardTitle>
                  <CardDescription>Documento oficial del programa formativo para este curso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                    <iframe
                      src={`${course.training_program_pdf_url}#toolbar=1&navpanes=0`}
                      className="w-full h-full"
                      title="Programa Formativo"
                    />
                  </div>
                  <Button asChild className="w-full">
                    <a 
                      href={course.training_program_pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      Descargar Programa Formativo (PDF)
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="work-plan" className="space-y-4">
            {/* Calendario interactivo con fechas de entregas, tutorías y exámenes */}
            <WorkPlanCalendar 
              courseId={courseId!}
              modules={modules}
              courseStartDate={course.start_date}
              courseEndDate={course.end_date}
            />
            
            <CourseWorkPlan 
              course={course} 
              modules={modules}
              centerSlug={centerSlug} 
            />
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <SEPEGradesSection 
              courseId={courseId!} 
              enrollmentId={enrollment?.id || ''} 
              modules={modules}
              isEditable={userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher'}
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
              <h2 className="text-lg font-semibold">Formación en Campus - Módulos Formativos</h2>
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
                                {/* Chat Inicial - Acceso a la sesión de bienvenida */}
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value="chat-inicial" className="border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                                          <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Chat de Sesión Inicial</h4>
                                          <p className="text-xs text-blue-600 dark:text-blue-300">Acceso al chat de bienvenida con tu tutor/a-formador/a</p>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                      <div className="space-y-3 bg-white dark:bg-background rounded-lg p-4 border">
                                        <p className="text-sm text-muted-foreground">
                                          El día de comienzo del curso, a través de la herramienta de chat habilitada, el tutor/a-formador/a del módulo formativo te informará de:
                                        </p>
                                        <ul className="text-sm space-y-2 text-muted-foreground">
                                          <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Cuestiones generales relativas a la organización de la formación</span>
                                          </li>
                                          <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Presentación de tutores-formadores</span>
                                          </li>
                                          <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Exposición de objetivos que se persiguen alcanzar</span>
                                          </li>
                                          <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Actividades de aprendizaje y pruebas de evaluación a realizar</span>
                                          </li>
                                        </ul>
                                        <div className="flex items-center gap-2 pt-2 text-xs text-blue-600 dark:text-blue-400">
                                          <Calendar className="h-4 w-4" />
                                          <span>La hora de esta sesión inicial puedes consultarla en el <strong>PLAN DE TRABAJO</strong> o en <strong>MI AGENDA</strong></span>
                                        </div>
                                        <Button className="w-full mt-2" variant="default">
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Acceder al Chat de Sesión Inicial
                                        </Button>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>

                                {/* Test de Conocimientos Previos - Desplegable */}
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value="pre-assessment" className="border rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white">
                                          <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                          <h4 className="font-semibold text-amber-900 dark:text-amber-100">Test de Conocimientos Previos</h4>
                                          <p className="text-xs text-amber-600 dark:text-amber-300">Evaluación diagnóstica de competencias digitales y conocimientos del módulo</p>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                      <PreAssessmentTest 
                                        moduleId={module.id}
                                        moduleTitle={module.title}
                                        onComplete={(results) => console.log('Assessment results:', results)}
                                      />
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>

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

                                {/* Foro del Módulo */}
                                <div className="grid lg:grid-cols-2 gap-4">
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

                                {/* FORMACIÓN EN CAMPUS - Estilo SEPE Homologado */}
                                <div className="border-t pt-4">
                                  <div className="bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm uppercase tracking-wide rounded-t-md">
                                    FORMACIÓN EN CAMPUS
                                  </div>
                                  
                                  {moduleUnits.length === 0 ? (
                                    <div className="text-sm text-muted-foreground bg-background rounded-b-lg p-4 border border-t-0 border-dashed text-center">
                                      Sin unidades formativas en este módulo
                                    </div>
                                  ) : (
                                    <div className="space-y-0">
                                      {moduleUnits.map((unit, unitIndex) => {
                                        const unitProgress = getUnitProgress(unit.id);
                                        return (
                                        <Accordion key={unit.id} type="single" collapsible>
                                          <AccordionItem value={unit.id} className="border-0">
                                            <AccordionTrigger className="hover:no-underline p-0">
                                              <div className="w-full flex items-center justify-between px-4 py-3 text-white font-medium text-sm bg-gradient-to-r from-primary to-primary/80">
                                                <div className="flex items-center gap-3 flex-1">
                                                  <span className="text-left">
                                                    Unidad Didáctica {unitIndex + 1}. {unit.title}
                                                  </span>
                                                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                                                    {unitProgress.overall_progress}% completado
                                                  </Badge>
                                                </div>
                                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-0">
                                              <div className="bg-white border border-t-0 p-4 space-y-4">
                                                
                                                {/* Contenido Interactivo - Estilo SEPE */}
                                                <div className="flex items-start gap-3">
                                                  <div className="p-2 bg-primary/10 rounded">
                                                    <Layers className="h-5 w-5 text-primary" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <div className="flex items-center gap-2">
                                                        <h5 className="font-semibold text-foreground">Contenido interactivo</h5>
                                                        <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                                                          {unitProgress.content_progress}%
                                                        </span>
                                                      </div>
                                                      {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                                                        <div className="flex items-center gap-1">
                                                          <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-7 text-xs gap-1"
                                                            onClick={() => openSyllabusEditor(unit.id, unit.title)}
                                                          >
                                                            <Edit2 className="h-3 w-3" />
                                                            Editar Temario
                                                          </Button>
                                                          <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-7 text-xs gap-1"
                                                            onClick={() => openContentViewer(unit.id, unit.title, 'scorm')}
                                                          >
                                                            <Plus className="h-3 w-3" />
                                                            Añadir
                                                          </Button>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <button
                                                      onClick={() => openScormViewer(unit.id, unit.title)}
                                                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                                                    >
                                                      <span className="text-sm">
                                                        {unitIndex + 1}. {unit.title}
                                                      </span>
                                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    </button>
                                                    
                                                    {/* Barra de progreso del contenido */}
                                                    <div className="flex items-center gap-2 mt-2 mb-3">
                                                      <Progress value={unitProgress.content_progress} className="h-2 flex-1" />
                                                      <span className="text-xs font-medium text-muted-foreground min-w-[40px]">
                                                        {unitProgress.content_progress}%
                                                      </span>
                                                    </div>

                                                    {/* Botones de acceso al contenido */}
                                                    <div className="flex items-center gap-3 mt-3">
                                                      <Button
                                                        variant="outline"
                                                        className="flex items-center gap-2 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                                                        onClick={() => openScormViewer(unit.id, unit.title)}
                                                      >
                                                        <Play className="h-4 w-4 text-primary" />
                                                        <span>Temario Interactivo</span>
                                                      </Button>
                                                      {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                                                        <Button
                                                          variant="outline"
                                                          className="flex items-center gap-2 rounded-full border-2"
                                                          onClick={() => openSyllabusEditor(unit.id, unit.title)}
                                                        >
                                                          <Edit2 className="h-4 w-4 text-blue-500" />
                                                          <span>Editar Contenido</span>
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Actividades de aprendizaje evaluables */}
                                                <div className="flex items-start gap-3">
                                                  <div className="p-2 bg-orange-100 rounded">
                                                    <ClipboardList className="h-5 w-5 text-orange-600" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <div className="flex items-center gap-2">
                                                        <h5 className="font-semibold text-foreground">Actividades de aprendizaje evaluables</h5>
                                                        <span className="text-xs text-muted-foreground bg-orange-100 px-2 py-0.5 rounded-full">
                                                          {unitProgress.activities_progress}%
                                                        </span>
                                                      </div>
                                                      {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                                                        <Button 
                                                          size="sm" 
                                                          variant="ghost" 
                                                          className="h-7 text-xs gap-1"
                                                          onClick={() => openActivityManager(unit.id, unit.title)}
                                                        >
                                                          <Plus className="h-3 w-3" />
                                                          Añadir
                                                        </Button>
                                                      )}
                                                    </div>
                                                    
                                                    {/* Barra de progreso de actividades */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <Progress value={unitProgress.activities_progress} className="h-2 flex-1" />
                                                      <span className="text-xs font-medium text-muted-foreground min-w-[40px]">
                                                        {unitProgress.activities_progress}%
                                                      </span>
                                                    </div>

                                                    <div className="space-y-2">
                                                      {unit.activities && unit.activities.length > 0 ? (
                                                        unit.activities.map((activity: any, actIdx: number) => (
                                                          <div key={activity.id} className="border rounded-lg p-3 bg-orange-50/50 hover:bg-orange-100/50 transition-colors cursor-pointer"
                                                            onClick={() => openActivitySubmission(activity.id)}
                                                          >
                                                            <div className="flex items-center gap-2">
                                                              <Checkbox checked={activity.completed} className="h-4 w-4" />
                                                              <span className="flex-1 text-left text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                                                                Actividad {actIdx + 1}: {activity.title}
                                                              </span>
                                                              {activity.max_score && (
                                                                <Badge variant="outline" className="text-xs">
                                                                  Punt: {activity.max_score}
                                                                </Badge>
                                                              )}
                                                              {activity.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                            </div>
                                                            {activity.due_date && (
                                                              <div className="flex items-center gap-2 mt-2 ml-6 text-xs">
                                                                <Calendar className="h-3 w-3 text-orange-600" />
                                                                <span className="text-orange-700 font-medium">
                                                                  Fecha límite: {new Date(activity.due_date).toLocaleDateString('es-ES', { 
                                                                    weekday: 'long', 
                                                                    day: 'numeric', 
                                                                    month: 'long', 
                                                                    year: 'numeric' 
                                                                  })}
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        ))
                                                      ) : (
                                                        <>
                                                          <div className="border rounded-lg p-3 bg-orange-50/50">
                                                            <div className="flex items-center gap-2">
                                                              <Checkbox checked={true} className="h-4 w-4" />
                                                              <button
                                                                onClick={() => openActivityManager(unit.id, unit.title)}
                                                                className="flex-1 text-left text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                                                              >
                                                                Actividad 1: Caso práctico
                                                              </button>
                                                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2 ml-6 text-xs">
                                                              <Calendar className="h-3 w-3 text-orange-600" />
                                                              <span className="text-orange-700 font-medium">
                                                                Fecha límite: Por definir
                                                              </span>
                                                            </div>
                                                          </div>
                                                          <div className="border rounded-lg p-3 bg-orange-50/50">
                                                            <div className="flex items-center gap-2">
                                                              <Checkbox checked={false} className="h-4 w-4" />
                                                              <button
                                                                onClick={() => openActivityManager(unit.id, unit.title)}
                                                                className="flex-1 text-left text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                                                              >
                                                                Actividad 2: Ejercicio teórico práctico
                                                              </button>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2 ml-6 text-xs">
                                                              <Calendar className="h-3 w-3 text-orange-600" />
                                                              <span className="text-orange-700 font-medium">
                                                                Fecha límite: Por definir
                                                              </span>
                                                            </div>
                                                          </div>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Foros */}
                                                <div className="flex items-start gap-3">
                                                  <div className="p-2 bg-red-100 rounded">
                                                    <MessageSquare className="h-5 w-5 text-red-500" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <h5 className="font-semibold text-slate-700 mb-2">Foros</h5>
                                                    <button 
                                                      className="text-[#2a7a9a] hover:text-[#1a5a7a] transition-colors text-sm"
                                                      onClick={() => {
                                                        const forumTab = document.querySelector('[value="foro"]');
                                                        if (forumTab) (forumTab as HTMLElement).click();
                                                      }}
                                                    >
                                                      Foro de dudas/consultas
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* Tests / Evaluaciones */}
                                                {unit.evaluations && unit.evaluations.length > 0 && (
                                                  <div className="flex items-start gap-3 pt-2 border-t">
                                                    <div className="p-2 bg-green-100 rounded">
                                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                      <h5 className="font-semibold text-slate-700 mb-2">Test de autoevaluación</h5>
                                                      <div className="space-y-1">
                                                        {unit.evaluations.map((evaluation: any) => (
                                                          <button
                                                            key={evaluation.id}
                                                            onClick={() => navigate(`/course/${courseId}/evaluation/${evaluation.id}`)}
                                                            className="flex items-center gap-2 text-[#2a7a9a] hover:text-[#1a5a7a] transition-colors text-sm"
                                                          >
                                                            <span>{evaluation.title}</span>
                                                          </button>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* TEST DE EVALUACIÓN DEL MÓDULO - 50 preguntas */}
                                  <Accordion type="single" collapsible className="w-full border-t pt-4">
                                    <AccordionItem value="module-test" className="border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                                            <ClipboardList className="h-5 w-5" />
                                          </div>
                                          <div className="text-left">
                                            <h4 className="font-semibold text-green-900 dark:text-green-100">Test de Evaluación del Módulo</h4>
                                            <p className="text-xs text-green-600 dark:text-green-300">50 preguntas tipo test sobre todo el contenido del módulo</p>
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="px-4 pb-4">
                                        <ModuleEvaluationTest 
                                          moduleId={module.id}
                                          moduleTitle={module.title}
                                          enrollmentId={enrollment?.id}
                                          inline={true}
                                          onComplete={(results) => {
                                            toast({
                                              title: "Test completado",
                                              description: `Has obtenido ${results.score}% en el test del módulo`,
                                            });
                                          }}
                                        />
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>

                                </div>
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
            {/* EVALUACIÓN Section - SEPE Style */}
            <Accordion type="single" collapsible defaultValue="evaluacion">
              <AccordionItem value="evaluacion" className="border-0">
                <AccordionTrigger className="bg-primary text-white px-4 py-3 rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
                  <span className="font-bold text-lg">EVALUACIÓN</span>
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-lg p-4 bg-white">
                  {/* Lista de pruebas de evaluación */}
                  <div className="space-y-2 mb-6">
                    {modules.flatMap(m => m.formative_units || []).map((unit: any) => (
                      <div key={`eval-${unit.id}`} className="flex items-center justify-between p-2 bg-blue-50 rounded border-l-4 border-l-primary">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-primary/10 rounded">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">{unit.title} - Test Final</span>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded border-l-4 border-l-orange-500">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-orange-100 rounded">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                        <span className="text-sm">Prueba de evaluación Final</span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded border-l-4 border-l-purple-500">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-purple-100 rounded">
                          <Star className="h-4 w-4 text-purple-500" />
                        </div>
                        <span className="text-sm">Evaluación de la calidad de la formación</span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>

                  {/* Texto explicativo */}
                  <div className="border-l-4 border-l-slate-300 pl-4 py-2 mb-6 bg-slate-50 rounded-r">
                    <p className="text-sm text-slate-700">Las pruebas de evaluación que deberás realizar son las siguientes:</p>
                  </div>

                  {/* TEST FINAL EN CAMPUS (CIM) */}
                  <div className="border border-primary rounded-lg overflow-hidden mb-6">
                    <div className="bg-primary/10 px-4 py-3 flex items-center gap-3 border-b border-primary/20">
                      <div className="p-2 bg-primary rounded">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-primary text-lg">
                        <span className="bg-yellow-200 px-2 py-0.5">TEST FINAL EN CAMPUS (CIM)</span>
                      </h4>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm text-slate-700">
                        El <strong>TEST FINAL</strong> de evaluación desarrollado en el Campus Virtual. Para realizar este TEST FINAL 
                        dispondrás de un solo intento y podrás conocer los resultados una vez lo hayas realizado.
                      </p>
                    </div>
                  </div>

                  {/* PRUEBA DE EVALUACIÓN FINAL PRESENCIAL */}
                  <div className="border border-orange-400 rounded-lg overflow-hidden mb-6">
                    <div className="bg-orange-50 px-4 py-3 flex items-center gap-3 border-b border-orange-200">
                      <div className="p-2 bg-orange-500 rounded">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-orange-700 text-lg">
                        <span className="bg-yellow-200 px-2 py-0.5">PRUEBA DE EVALUACIÓN FINAL PRESENCIAL</span>
                      </h4>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm text-slate-700">
                        La <strong>PRUEBA DE EVALUACIÓN FINAL PRESENCIAL</strong> en el Centro de Formación. En la fecha y lugar que 
                        se te indican en el documento PLAN DE TRABAJO, y a través de MI AGENDA, deberás realizar la/s 
                        prueba/s de evaluación. Puedes encontrar en este apartado información sobre los criterios de 
                        evaluación que se aplicarán en esta prueba, así como algunas orientaciones sobre su contenido.
                      </p>
                    </div>
                  </div>

                  {/* RECUERDA */}
                  <div className="border-2 border-slate-400 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-300">
                      <h4 className="font-bold text-slate-700">
                        <span className="bg-yellow-200 px-2 py-0.5">RECUERDA</span>
                      </h4>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm text-slate-700">
                        Para poder presentarte a la prueba de evaluación final debes haber realizado el total de las actividades de 
                        aprendizaje establecidas en el Campus Virtual, así como haber participado en los foros programados.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Info Banner sobre fechas y obligatoriedad */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">Fechas Exámenes Presenciales</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los exámenes presenciales son <strong className="text-foreground">obligatorios</strong> para la obtención del certificado de profesionalidad. 
                      Debes superar todos los módulos con una nota mínima del 50% para poder presentarte al examen final presencial.
                    </p>
                    <div className="mt-3 p-3 bg-background rounded-lg border">
                      <p className="text-sm font-medium">📅 1ª Convocatoria: {course.end_date ? new Date(course.end_date).toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Por determinar'}</p>
                      <p className="text-sm font-medium mt-1">📅 2ª Convocatoria: Por determinar</p>
                      <p className="text-xs text-muted-foreground mt-2">📍 Ubicación: Centro de Formación</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {exams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay exámenes disponibles</p>
                </CardContent>
              </Card>
            ) : (
              exams.map((exam) => (
                <Card key={exam.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
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
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="text-muted-foreground">
                        Nota mínima: <strong className="text-foreground">{exam.passing_score}%</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Intentos: <strong className="text-foreground">{exam.max_attempts || "Ilimitados"}</strong>
                      </span>
                      {exam.time_limit_minutes && (
                        <span className="text-muted-foreground">
                          Tiempo: <strong className="text-foreground">{exam.time_limit_minutes} min</strong>
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
            {/* Info Banner sobre fechas y obligatoriedad */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">Fechas Tutorías Presenciales</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      La asistencia a las tutorías presenciales es <strong className="text-foreground">obligatoria</strong> según la normativa SEPE para certificados de profesionalidad. 
                      Se requiere un mínimo del 75% de asistencia para poder presentarse al examen final.
                    </p>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Asistencia mínima requerida: <strong>75%</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Participación activa en las sesiones</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Resolución de dudas con el tutor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {tutorials.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay tutorías programadas</p>
                </CardContent>
              </Card>
            ) : (
              tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(tutorial.start_time).toLocaleString("es-ES", {
                        weekday: 'long',
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
                  <CardContent className="space-y-3">
                    {tutorial.description && (
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={tutorial.is_mandatory ? "destructive" : "secondary"}>
                        {tutorial.is_mandatory !== false ? "Obligatoria" : "Opcional"}
                      </Badge>
                    </div>

                    {tutorial.location && (
                      <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
                        <MapIcon className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Ubicación:</strong> {tutorial.location}</span>
                      </div>
                    )}

                    {tutorial.meeting_url && (
                      <Button className="w-full" asChild>
                        <a href={tutorial.meeting_url} target="_blank" rel="noopener noreferrer">
                          Acceder a la Tutoría Virtual
                        </a>
                      </Button>
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
            <CourseForum 
              courseId={courseId!}
              isAdmin={userRole === 'admin' || userRole === 'super_admin'}
              isEditable={userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher'}
            />
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tu Tutor</CardTitle>
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => navigate(`/dashboard/admin/course-settings/${courseId}`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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

            {/* Mi Perfil */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Mi Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  En el icono <span className="font-semibold text-foreground">Mi Perfil</span> señalarás tus datos personales, para que otros compañeros tengan acceso a esa información y puedan acceder a ti en cualquier momento a través del correo electrónico que facilites. Así podréis recibir ayuda mutua y el aprendizaje será más fructífero.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Debes completar todos los datos requeridos en la ventana emergente que se abre al pinchar en el icono.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Ver Mi Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Tutorías Presenciales */}
            <Collapsible defaultOpen={false}>
              <Card>
                <CardHeader className="pb-2">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium uppercase tracking-wide text-primary flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Tutorías Presenciales
                      </CardTitle>
                      <span className="text-xs text-primary hover:underline">Expandir/Contraer</span>
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Cuaderno del alumno</span>
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        En la fecha y lugar que te indicamos en el documento <span className="font-semibold text-foreground">PLAN DE TRABAJO</span> y a través de <span className="font-semibold text-foreground">MI AGENDA</span>, deberás asistir a las sesiones presenciales donde se trabajarán los conocimientos que has ido adquiriendo en la plataforma.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        En estas sesiones se desarrollarán actividades de aprendizaje y/o pruebas de evaluación, de las que tu tutor/a-formador/a te informará previamente.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Durante la realización de estas tutorías presenciales contarás con un formador, que puede ser uno de tus tutores-formadores o un profesional distinto, que te explicará y guiará para el desarrollo de las actividades planteadas.
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

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

      {/* Content Viewer Dialog - Professional Design */}
      <InteractiveMultimediaViewer
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

      {/* Syllabus Editor Dialog */}
      <SyllabusEditor
        open={syllabusEditorOpen}
        onOpenChange={setSyllabusEditorOpen}
        unitId={selectedUnitId}
        unitTitle={selectedUnitTitle}
      />

      {/* Activity Submission Viewer Dialog */}
      <ActivitySubmissionViewer
        open={activitySubmissionOpen}
        onOpenChange={setActivitySubmissionOpen}
        activityId={selectedActivityId}
        enrollmentId={enrollment?.id || ""}
      />
    </div>
  );
}
