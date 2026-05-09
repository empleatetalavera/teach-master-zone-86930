import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Clock, BarChart3, ArrowLeft, Calendar, MessageSquare, FileText, CheckCircle2, CheckCircle, PlayCircle, ChevronDown, Mail, Phone, FileDown, ShieldCheck, User, Users, GraduationCap, MapIcon, Settings, ListChecks, Video, Headphones, FileQuestion, Layers, Presentation, Plus, BookMarked, ClipboardList, ClipboardCheck, Circle, AlertCircle, Star, Edit2, Play, MonitorPlay, Inbox, Bell, HelpCircle, Target, Sparkles, Upload, CheckSquare, PenTool, ExternalLink, Award, Download, Send, FolderUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TutorMessaging } from "@/components/TutorMessaging";
import { GradesSection } from "@/components/GradesSection";
import { SimpleGradesSection } from "@/components/SimpleGradesSection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeTrackingReport } from "@/components/TimeTrackingReport";
import { QualityAuditView } from "@/components/QualityAuditView";
import { UnitContentViewer } from "@/components/UnitContentViewer";
import { InteractiveMultimediaViewer } from "@/components/InteractiveMultimediaViewer";
import { UnitActivityManager } from "@/components/UnitActivityManager";
import { CourseSchedule } from "@/components/CourseSchedule";
import CourseScheduleManager from "@/components/CourseScheduleManager";
import { CourseCalendar } from "@/components/CourseCalendar";
import { GradeBreakdown } from "@/components/GradeBreakdown";
import { SEPEGradesSection } from "@/components/SEPEGradesSection";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CampusChrome } from "@/components/CertificateCampusLayout";

import { CourseStudentGuide } from "@/components/CourseStudentGuide";
import { EvidenceManager } from "@/components/campus/EvidenceManager";
import { CAUSupportForm } from "@/components/campus/CAUSupportForm";
import { CourseTrainingProgram } from "@/components/CourseTrainingProgram";
import { CourseWorkPlan } from "@/components/CourseWorkPlan";
import { PreAssessmentTest } from "@/components/PreAssessmentTest";
import { SingleDocumentUploader } from "@/components/SingleDocumentUploader";
import { PlatformHelpResources } from "@/components/PlatformHelpResources";
import { CourseForum } from "@/components/CourseForum";
import { TutorForum } from "@/components/TutorForum";
import { UnitForum } from "@/components/UnitForum";
import { SupplementaryMaterialManager } from "@/components/SupplementaryMaterialManager";
import { WorkPlanCalendar } from "@/components/WorkPlanCalendar";
import { SyllabusEditor } from "@/components/SyllabusEditor";
import { ActivitySubmissionViewer } from "@/components/ActivitySubmissionViewer";
import { useUnitProgress } from "@/hooks/useUnitProgress";
import { ModuleEvaluationTest } from "@/components/ModuleEvaluationTest";
import { TeacherActivityCorrectionPanel } from "@/components/TeacherActivityCorrectionPanel";
import { TutorStudentProgress } from "@/components/TutorStudentProgress";
import TutoriasPresencialesGuide from "@/components/TutoriasPresencialesGuide";
import { CertificateDocumentsSection } from "@/components/CertificateDocumentsSection";
import { ModuleContentUploader } from "@/components/ModuleContentUploader";
import { ModuleManualUploader } from "@/components/ModuleManualUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScormAuthorModal } from "@/components/scorm-author/ScormAuthorModal";
import { ModuleFormativeUnitManager } from "@/components/ModuleFormativeUnitManager";
import { CourseGlossary } from "@/components/CourseGlossary";
import { CourseFAQs } from "@/components/CourseFAQs";
import { CourseAnnouncements } from "@/components/CourseAnnouncements";
import { VirtualCafeteria } from "@/components/VirtualCafeteria";
import { CFCForumTabs } from "@/components/CFCForumTabs";
import { SelfAssessmentQuiz } from "@/components/SelfAssessmentQuiz";
import { CourseCertificateDownload } from "@/components/CourseCertificateDownload";
import { SEPECertificateUploader } from "@/components/SEPECertificateUploader";
import { SEPECertificateStudentView } from "@/components/SEPECertificateStudentView";
import { SEPEFormacionCampus } from "@/components/campus/SEPEFormacionCampus";
import TeacherTutorGuide from "@/pages/dashboard/TeacherTutorGuide";
import { ElectiveModuleContent } from "@/components/ElectiveModuleContent";
import { BatchContentGenerator } from "@/components/BatchContentGenerator";
import ScormPlayer from "@/components/scorm/ScormPlayer";
import tablaPuntuacionCurso from "@/assets/tabla-puntuacion-curso.png";

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
  tutor_guide_pdf_url?: string | null;
  course_type?: string | null;
  // New dynamic fields
  course_code?: string | null;
  professional_family?: string | null;
  qualification_level?: number | null;
  modality?: string | null;
  scope?: string | null;
  max_students?: number | null;
  presential_hours?: number | null;
  internship_hours?: number | null;
  tutorial_plan?: string | null;
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
  is_elective?: boolean;
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
  const [centerName, setCenterName] = useState<string>("");
  const [centerContact, setCenterContact] = useState<{
    name: string;
    email: string; 
    phone: string;
    whatsapp_phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    cif?: string;
    campus_url?: string;
    student_guide_pdf_url?: string | null;
    tutor_guide_pdf_url?: string | null;
    support_schedule?: string | null;
  }>({
    name: "",
    email: "", 
    phone: ""
  });
  
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
  const [selectedScormModuleId, setSelectedScormModuleId] = useState<string>("");

  // Syllabus editor state
  const [syllabusEditorOpen, setSyllabusEditorOpen] = useState(false);
  
  // SCORM Author Modal state
  const [scormAuthorOpen, setScormAuthorOpen] = useState(false);
  const [scormAuthorModuleId, setScormAuthorModuleId] = useState<string>("");
  const [scormAuthorUnitId, setScormAuthorUnitId] = useState<string>("");
  const [scormAuthorUnitTitle, setScormAuthorUnitTitle] = useState<string>("");

  // Manual uploader dialog state
  const [manualUploaderOpen, setManualUploaderOpen] = useState(false);
  const [manualUploaderModuleId, setManualUploaderModuleId] = useState<string>("");
  const [manualUploaderModuleTitle, setManualUploaderModuleTitle] = useState<string>("");
  const [manualUploaderUnitId, setManualUploaderUnitId] = useState<string | undefined>(undefined);
  
  // Supplementary material visibility (per unit, stored in state - could be in DB)
  const [showSupplementaryMaterial, setShowSupplementaryMaterial] = useState<Record<string, boolean>>({});
  
  // Determine if this is a CFC course (simplified template) vs certificate/SEPE courses
  const isCFCCourse = course?.course_type === 'cfc';
  const isPropio = course?.course_type === 'propio';
  const showSEPEFeatures = !isCFCCourse && !isPropio; // Show SEPE features for certificate/SEPE courses only
  // New 3-column "Empléate Talavera" style chrome for certificate courses (CFC + SEPE)
  const useCampusLayout = !isPropio && !!course;
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [campusEditMode, setCampusEditMode] = useState(false);
  const [diagnosticModule, setDiagnosticModule] = useState<{ id: string; title: string } | null>(null);
  const diagnosticDoneKey = (mid: string) => `diagnostic_done_${user?.id || 'anon'}_${mid}`;
  const isDiagnosticDone = (mid: string) => typeof window !== 'undefined' && !!localStorage.getItem(diagnosticDoneKey(mid));
  const isAdminOrTeacher = userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher';
  
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

  const openScormViewer = (unitId: string, unitTitle: string, moduleId?: string) => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(unitTitle);
    setSelectedScormModuleId(moduleId || "");
    if (moduleId && enrollment?.id) {
      const params = new URLSearchParams();
      if (unitId) params.set("unitId", unitId);
      if (unitTitle) params.set("title", unitTitle);
      const url = `/scorm/${enrollment.id}/${moduleId}?${params.toString()}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setScormViewerOpen(true);
    }
  };

  const openSyllabusEditor = (unitId: string, unitTitle: string) => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(unitTitle);
    setSyllabusEditorOpen(true);
  };

  const openScormAuthor = (moduleId: string, unitId: string, unitTitle: string) => {
    setScormAuthorModuleId(moduleId);
    setScormAuthorUnitId(unitId);
    setScormAuthorUnitTitle(unitTitle);
    setScormAuthorOpen(true);
  };

  const toggleSupplementaryMaterial = (unitId: string) => {
    setShowSupplementaryMaterial(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };


  const openPdfWithFallback = async (pdfUrl: string, fileName: string) => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Error downloading PDF via blob:", error);

      // Último recurso para navegadores muy restrictivos
      try {
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
      } catch (openError) {
        console.error("Direct PDF open also failed:", openError);
      }

      toast({
        title: "No se pudo descargar el documento",
        description: "Tu navegador o una extensión está bloqueando el archivo. Permite este sitio e inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const openPdfViaBlob = openPdfWithFallback;

  // Helper: resolve file_path (absolute URL or relative storage path) to a downloadable URL
  const resolveAndOpenPdf = async (filePath: string, fileName: string) => {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      await openPdfViaBlob(filePath, fileName);
    } else {
      const { data: signedData } = await supabase.storage
        .from('module-content').createSignedUrl(filePath, 3600);
      if (signedData?.signedUrl) {
        await openPdfViaBlob(signedData.signedUrl, fileName);
      } else {
        toast({ title: "Error", description: "No se pudo generar el enlace de descarga.", variant: "destructive" });
      }
    }
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

      // Load center info - PRIORITY: user's center > course's center
      // This ensures proper multi-tenant isolation
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("training_center_id")
        .eq("id", user!.id)
        .single();

      // Use user's center if available, otherwise fallback to course's center
      const centerIdToUse = userProfile?.training_center_id || courseData.training_center_id;
      
      if (centerIdToUse) {
        const { data: centerData } = await supabase
          .from("training_centers")
          .select("slug, name, email, phone, whatsapp_phone, address, city, province, postal_code, cif, logo_url, campus_url, contact_email, contact_phone, student_guide_pdf_url, tutor_guide_pdf_url, support_schedule")
          .eq("id", centerIdToUse)
          .single();
        
        if (centerData?.slug) {
          setCenterSlug(centerData.slug);
        }
        if (centerData?.name) {
          setCenterName(centerData.name);
        }
        // Set center contact info for CAU and WorkPlan - use USER's center data
        setCenterContact({
          name: centerData?.name || "",
          email: (centerData as any)?.contact_email || centerData?.email || "",
          phone: (centerData as any)?.contact_phone || centerData?.phone || "",
          whatsapp_phone: (centerData as any)?.whatsapp_phone || "",
          address: centerData?.address || "",
          city: centerData?.city || "",
          province: centerData?.province || "",
          postal_code: centerData?.postal_code || "",
          cif: centerData?.cif || "",
          campus_url: (centerData as any)?.campus_url || "",
          student_guide_pdf_url: (centerData as any)?.student_guide_pdf_url || null,
          tutor_guide_pdf_url: (centerData as any)?.tutor_guide_pdf_url || null,
          support_schedule: (centerData as any)?.support_schedule || null
        });
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
        // Create enrollment - detect if user is the course tutor
        const isTutor = courseData.tutor_id === user!.id;
        const { data: newEnrollment, error: createError } = await supabase
          .from("enrollments")
          .insert({
            user_id: user!.id,
            course_id: courseId,
            enrollment_role: isTutor ? 'teacher' : 'student',
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
      <div className={`w-full mx-auto py-6 ${useCampusLayout ? (campusEditMode ? 'px-3 sm:px-4 lg:px-6 2xl:px-10' : 'px-3 sm:px-4 md:px-6 lg:pl-[166px] lg:pr-[166px] xl:pl-[188px] xl:pr-[188px] 2xl:pl-[210px] 2xl:pr-[210px] max-w-[1800px]') : 'px-3 sm:px-4 lg:px-6 2xl:px-10'}`}>
        {!useCampusLayout && (
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
        )}

        {useCampusLayout && (
          <CampusChrome
            course={course}
            modules={modules as any}
            selectedModuleId={selectedModuleId}
            onSelectModule={setSelectedModuleId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={userRole}
            centerContact={centerContact}
            progressPercent={enrollment?.progress_percentage || 0}
            editMode={campusEditMode}
            onEditMode={
              isAdminOrTeacher
                ? () => setCampusEditMode((v) => !v)
                : undefined
            }
            onOpenAdvancedEditor={
              isAdminOrTeacher
                ? () => navigate(`/dashboard/admin/courses/${courseId}/content`)
                : undefined
            }
            onBack={() => {
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
            onOpenStudentGuide={() => setActiveTab('student-guide')}
          />
        )}

        {/* Course Header */}
        {!useCampusLayout && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {!isPropio && course.qualification_level && (
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold">
                      Certificado de Profesionalidad Nivel {course.qualification_level}
                    </Badge>
                  )}
                  {!isPropio && course.professional_family && (
                    <Badge variant="secondary" className="font-medium">
                      {course.professional_family}
                    </Badge>
                  )}
                  {!isPropio && course.course_code && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {course.course_code}
                    </Badge>
                  )}
                  <Badge className={getLevelColor(course.level)}>
                    {getLevelLabel(course.level)}
                  </Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-3">
                {isCFCCourse && (
                  <img 
                    src="/branding/cfc-clm-logo.png"
                    alt="Comisión de Formación Continuada - Sistema Nacional de Salud"
                    className="h-20 object-contain"
                  />
                )}
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
            </div>
            {enrollment && (
              <div className="mt-4">
                <Progress value={enrollment.progress_percentage || 0} />
              </div>
            )}
          </CardHeader>
        </Card>
        )}

        {/* Toolbar - Always visible */}
        {!useCampusLayout && (
        <Card className="mb-6 overflow-x-auto">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-nowrap min-w-max">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Mis Cursos
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
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
                    Correo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[440px] p-0" align="start">
                  <div className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-amber-500/5">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-amber-600" />
                      Correo electrónico interno
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Comunícate con tu tutor/a-formador/a desde el Campus Virtual
                    </p>
                  </div>
                  <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-foreground leading-relaxed">
                      Puedes enviar un mensaje a tu tutor/a-formador/a a través del correo
                      electrónico interno del Campus Virtual planteándole tu consulta y
                      recibirás un correo con la respuesta.
                    </p>
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Formato del mensaje
                      </p>
                      <ul className="text-sm space-y-1.5 list-disc pl-4">
                        <li>
                          <span className="font-medium">Asunto:</span> indica el curso que
                          estás realizando.
                        </li>
                        <li>
                          <span className="font-medium">Cuerpo:</span> tus datos personales
                          (nombre y apellidos) y la consulta indicando el módulo / unidad
                          formativa o tema.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 p-3 flex items-start gap-2">
                      <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-900 dark:text-amber-200">
                        Tiempo máximo de respuesta: <span className="font-semibold">48 horas</span> (días laborables).
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set("tab", "tutorias");
                        window.history.pushState({}, "", url.toString());
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Escribir a mi tutor/a
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    CAU
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Centro de Atención al Usuario</DialogTitle>
                  </DialogHeader>
                  <CAUSupportForm
                    courseId={courseId!}
                    courseTitle={course.title}
                    supportEmail={centerContact.email || course.support_email}
                    supportPhone={centerContact.phone || course.support_phone}
                    supportSchedule={centerContact.support_schedule || undefined}
                  />
                </DialogContent>
              </Dialog>

              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contacto
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] max-h-[600px] overflow-auto" align="start">
                  <TutorMessaging 
                    courseId={courseId!}
                    tutorId={course.tutor_id}
                    supportEmail={centerContact.email || course.support_email}
                    supportPhone={centerContact.phone || course.support_phone}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Foros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[420px] p-0" align="start">
                  <div className="p-4 border-b bg-gradient-to-r from-teal-500/10 to-teal-500/5">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-teal-600" />
                      Foros de dudas y consultas
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Plantea preguntas a tu tutor/a y debate con tus compañeros/as
                    </p>
                  </div>
                  <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-foreground leading-relaxed">
                      En cada unidad didáctica dispones de un foro de consultas/dudas
                      donde podrás plantear en cualquier momento a tu tutor-formador
                      cuestiones sobre:
                    </p>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-foreground">
                      <li>Los contenidos de la unidad didáctica.</li>
                      <li>Las actividades de aprendizaje programadas.</li>
                      <li>El funcionamiento del Campus Virtual.</li>
                    </ul>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Desde el foro del curso podrás <span className="font-semibold text-foreground">crear nuevos temas</span>,
                        responder a tus compañeros y recibir notificaciones cuando tu
                        tutor/a conteste.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => setActiveTab('forum')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ir al foro del curso
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('modules')}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Foros por unidad didáctica
                      </Button>
                      {userRole === 'teacher' && (
                        <Button
                          className="w-full"
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab('tutor-forum')}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Foro privado de tutores
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                onClick={() => setActiveTab('student-guide')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg ring-2 ring-amber-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Guía del Alumno
              </Button>

              {(userRole === 'auditor' || userRole === 'admin' || userRole === 'super_admin') && (
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
          </CardContent>
        </Card>
        )}

        {/* Course Content Tabs */}
        <div className={useCampusLayout ? '' : 'grid lg:grid-cols-[200px_1fr_280px] gap-6'}>
          {/* Left Sidebar - Navigation */}
          {!useCampusLayout && (
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
                  {showSEPEFeatures && (userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin') && (
                    <button
                      onClick={() => setActiveTab("tutor-guide")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "tutor-guide" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <BookMarked className="h-4 w-4" />
                      Guía del Tutor
                    </button>
                  )}
                  {showSEPEFeatures && (
                    <button
                      onClick={() => setActiveTab("work-plan")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "work-plan" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <Calendar className="h-4 w-4" />
                      Plan de Trabajo
                    </button>
                  )}
                  {showSEPEFeatures && (
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "schedule" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      Cronograma
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("modules")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "modules" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    {isCFCCourse ? 'Contenido del Curso' : isPropio ? 'Temario' : 'Formación en Campus'}
                  </button>
                  <button
                    onClick={() => setActiveTab("grades")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "grades" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {userRole === 'teacher' ? 'Corrección de Actividades' : 'Calificaciones'}
                  </button>
                  {showSEPEFeatures && (
                    <button
                      onClick={() => setActiveTab("tutorials")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "tutorials" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      Tutorías
                    </button>
                  )}
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
                    onClick={() => setActiveTab("glossary")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "glossary" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Glosario
                  </button>
                  <button
                    onClick={() => setActiveTab("faqs")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "faqs" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <FileQuestion className="h-4 w-4" />
                    FAQs
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "announcements" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <Bell className="h-4 w-4" />
                    Tablón
                  </button>
                  <button
                    onClick={() => setActiveTab("cafeteria")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "cafeteria" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Cafetería
                  </button>
                  {userRole === 'teacher' && (
                    <button
                      onClick={() => setActiveTab("tutor-forum")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "tutor-forum" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <Users className="h-4 w-4" />
                      Foros de Tutores
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("time-tracking")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "time-tracking" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    Tiempos Invertidos
                  </button>
                  <button
                    onClick={() => setActiveTab("certificate")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "certificate" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <Award className="h-4 w-4" />
                    Certificado
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
          )}
          
          {/* Main Content */}
          <div className={useCampusLayout ? '' : 'min-w-0'}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              {/* Mobile Tab Navigation */}
              <div className="lg:hidden overflow-x-auto pb-2">
                <TabsList className="w-max min-w-full flex h-auto p-1 gap-1">
                  <TabsTrigger value="intro" className="text-xs px-2 py-1.5">Inicio</TabsTrigger>
                  {showSEPEFeatures && (userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin') && (
                    <TabsTrigger value="tutor-guide" className="text-xs px-2 py-1.5">Guía Tutor</TabsTrigger>
                  )}
                  {showSEPEFeatures && <TabsTrigger value="work-plan" className="text-xs px-2 py-1.5">Plan Trabajo</TabsTrigger>}
                  {showSEPEFeatures && <TabsTrigger value="schedule" className="text-xs px-2 py-1.5">Cronograma</TabsTrigger>}
                  <TabsTrigger value="modules" className="text-xs px-2 py-1.5">{isCFCCourse ? 'Contenido' : isPropio ? 'Temario' : 'Formación'}</TabsTrigger>
                  <TabsTrigger value="grades" className="text-xs px-2 py-1.5">{userRole === 'teacher' ? 'Actividades' : 'Calificaciones'}</TabsTrigger>
                  
                  
                  {showSEPEFeatures && <TabsTrigger value="tutorials" className="text-xs px-2 py-1.5">Tutorías</TabsTrigger>}
                  <TabsTrigger value="calendar" className="text-xs px-2 py-1.5">Calendario</TabsTrigger>
                  <TabsTrigger value="forum" className="text-xs px-2 py-1.5">Foro</TabsTrigger>
                  <TabsTrigger value="glossary" className="text-xs px-2 py-1.5">Glosario</TabsTrigger>
                  <TabsTrigger value="faqs" className="text-xs px-2 py-1.5">FAQs</TabsTrigger>
                  <TabsTrigger value="announcements" className="text-xs px-2 py-1.5">Tablón</TabsTrigger>
                  <TabsTrigger value="cafeteria" className="text-xs px-2 py-1.5">Cafetería</TabsTrigger>
                  {userRole === 'teacher' && (
                    <TabsTrigger value="tutor-forum" className="text-xs px-2 py-1.5">Foro Tutores</TabsTrigger>
                  )}
                  <TabsTrigger value="time-tracking" className="text-xs px-2 py-1.5">Tiempos</TabsTrigger>
                  <TabsTrigger value="certificate" className="text-xs px-2 py-1.5">Certificado</TabsTrigger>
                  {(userRole === 'auditor' || userRole === 'admin') && (
                    <TabsTrigger value="audit" className="text-xs px-2 py-1.5">Auditoría</TabsTrigger>
                  )}
                </TabsList>
              </div>

          <TabsContent value="intro" className="space-y-6">
            {/* Platform Help Resources */}
            <PlatformHelpResources centerSlug={centerSlug} centerContact={centerContact} />

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
                          course.specific_objectives.map((obj: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{typeof obj === 'object' ? (obj.description || JSON.stringify(obj)) : String(obj)}</span>
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

              {/* Documentos Oficiales del Certificado - Only for non-CFC courses */}
              {showSEPEFeatures && (
                <CertificateDocumentsSection
                  courseId={courseId!}
                  fichaCertificadoUrl={course.ficha_certificado_url}
                  boeUrl={course.boe_url}
                  isEditable={userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher'}
                  onUpdate={loadCourseData}
                />
              )}

              {/* CFC Accreditation Link - Only for CFC courses */}
              {isCFCCourse && (
                <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/10">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-green-700 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Acreditación de Formación Continuada</h4>
                      <p className="text-xs text-muted-foreground">Comisión de Formación Continuada de Castilla-La Mancha</p>
                    </div>
                    <a
                      href="http://ics.jccm.es/formacion/funciones/acreditacion-de-formacion-continuada/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-2 border-green-300 text-green-700 hover:bg-green-100">
                        <ExternalLink className="h-4 w-4" />
                        Visitar web
                      </Button>
                    </a>
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
                      <Button className="w-full flex items-center gap-2" onClick={async () => {
                        try {
                          const response = await fetch(course.campus_guide_url!);
                          const blob = await response.blob();
                          const blobUrl = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = blobUrl;
                          link.download = 'Guia_Campus_Virtual.pdf';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                        } catch (err) {
                          console.error('Error downloading campus guide:', err);
                          toast({ title: "Error", description: "No se pudo descargar la guía. Desactiva el bloqueador de anuncios.", variant: "destructive" });
                        }
                      }}>
                        <FileDown className="h-4 w-4" />
                        Descargar Guía del Campus (PDF)
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center">
                        Consulta la guía completa del campus virtual con instrucciones detalladas.
                      </p>
                      <Button className="w-full flex items-center gap-2" onClick={async () => {
                        try {
                          const { generateCampusGuidePDF } = await import('@/lib/generateCampusGuidePDF');
                          const { useCenterBranding } = await import('@/hooks/useCenterBranding');
                          await generateCampusGuidePDF({
                            centerName: centerName || 'Centro de Formación',
                          });
                        } catch (err) {
                          console.error('Error generating campus guide PDF:', err);
                          toast({ title: 'Error', description: 'No se pudo generar la guía del campus', variant: 'destructive' });
                        }
                      }}>
                        <MapIcon className="h-4 w-4" />
                        Descargar Guía del Campus Virtual
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
            {/* Editor de cronograma para admins */}
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <CourseScheduleManager courseId={courseId || ''} />
            )}
            
            {/* Vista de solo lectura para estudiantes y profesores */}
            {userRole !== 'admin' && userRole !== 'super_admin' && (
              <CourseSchedule
                courseTitle={course.title}
                courseStartDate={course.start_date}
                courseEndDate={course.end_date}
                modules={modules}
                events={[...events, ...tutorials]}
                exams={exams}
              />
            )}
          </TabsContent>

          <TabsContent value="student-guide" className="space-y-4">
            {/* CIM Navigation Guide Download Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MonitorPlay className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Guía de Navegación del CIM</h4>
                      <p className="text-xs text-muted-foreground">Manual de uso del Contenido Interactivo Multimedia</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0"
                    onClick={async () => {
                      const { generateCIMNavigationGuidePDF } = await import('@/lib/generateCIMNavigationGuidePDF');
                      await generateCIMNavigationGuidePDF({
                        centerName: centerName || 'Centro de Formación',
                        contactEmail: centerContact.email || course.support_email || '',
                        contactPhone: centerContact.phone || course.support_phone || '',
                      });
                    }}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
            
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
            
            <Card>
              <CardContent className="p-6">
                <CourseStudentGuide 
                  course={{ ...course, student_guide_pdf_url: centerContact.student_guide_pdf_url || course.student_guide_pdf_url }} 
                  centerSlug={centerSlug} 
                />
              </CardContent>
            </Card>

          </TabsContent>

          {/* Tutor Guide Tab - For teachers and admins */}
          <TabsContent value="tutor-guide" className="space-y-4">
            <TeacherTutorGuide />
          </TabsContent>


          {/* CFC Course Program - simplified version */}
          <TabsContent value="course-program" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Programa del Curso
                </CardTitle>
                <CardDescription>Información general, objetivos y contenidos del curso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{course.description || "Sin descripción disponible."}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Objetivo General</h3>
                  <p className="text-muted-foreground">{course.objectives || "Objetivos no definidos."}</p>
                </div>

{course.specific_objectives && course.specific_objectives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Objetivos Específicos</h3>
                    {(() => {
                      const objectives = course.specific_objectives as any[];
                      const hasCategories = objectives.some(o => typeof o === 'object' && o.category);
                      if (hasCategories) {
                        const grouped = objectives.reduce((acc: Record<string, any[]>, obj: any) => {
                          const cat = obj.category || 'General';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(obj);
                          return acc;
                        }, {} as Record<string, any[]>);
                        return Object.entries(grouped).map(([category, objs]) => (
                          <div key={category} className="mb-4">
                            <h4 className="font-medium text-sm text-primary mb-2">{category}</h4>
                            <ul className="space-y-2 text-muted-foreground">
                              {(objs as any[]).map((obj: any, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="font-semibold text-foreground/70 flex-shrink-0">{obj.code}:</span>
                                  <span>{obj.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ));
                      }
                      return (
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {objectives.map((obj, i) => (
                            <li key={i}>{typeof obj === 'object' ? (obj as any).description || String(obj) : String(obj)}</li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                )}

                {course.tutorial_plan && (
                  <div className="bg-muted/20 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Plan de Acción Tutorial
                    </h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:space-y-1 [&_li]:text-sm [&_strong]:text-foreground/80">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.tutorial_plan}</ReactMarkdown>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Contenido del Curso</h3>
                  <div className="space-y-2">
                    {modules.map((module, idx) => (
                      <div key={module.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{module.title}</p>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                          )}
                          {module.duration_minutes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {Math.round(module.duration_minutes / 60)} horas
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{course.duration_hours}</p>
                    <p className="text-sm text-muted-foreground">Horas totales</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{modules.length}</p>
                    <p className="text-sm text-muted-foreground">Módulos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work-plan" className="space-y-4">
            {/* Calendario interactivo con fechas de entregas, tutorías y exámenes */}
            <WorkPlanCalendar 
              courseId={courseId!}
              modules={modules}
              courseStartDate={course.start_date}
              courseEndDate={course.end_date}
              userRole={userRole}
            />
            
            <CourseWorkPlan 
              course={course} 
              modules={modules}
              centerSlug={centerSlug}
              centerContact={centerContact}
            />
          </TabsContent>


          <TabsContent value="grades" className="space-y-4">

            {userRole === 'teacher' ? (
              <TeacherActivityCorrectionPanel courseId={courseId!} />
            ) : (isCFCCourse || isPropio) ? (
              <SimpleGradesSection 
                courseId={courseId!} 
                enrollmentId={enrollment?.id || ''} 
                modules={modules}
              />
            ) : (
              <SEPEGradesSection 
                courseId={courseId!} 
                enrollmentId={enrollment?.id || ''} 
                modules={modules}
                isEditable={userRole === 'admin' || userRole === 'super_admin'}
              />
            )}
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            {/* SEPE: Diagnóstico inicial - alfabetización digital y conocimientos previos */}
            <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <Target className="h-5 w-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-1">Diagnóstico inicial recomendado</h4>
                  <p className="text-sm text-amber-800">
                    Antes de comenzar cada módulo, te recomendamos realizar el <strong>test de diagnóstico inicial</strong> disponible en la primera unidad formativa de cada módulo. Evalúa tu nivel de competencia digital y tus conocimientos previos sobre los contenidos a aprender, para que tu tutor-formador pueda orientarte mejor.
                  </p>
                </div>
              </CardContent>
            </Card>

            {(isCFCCourse || isPropio) && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{isCFCCourse ? 'Contenido del Curso' : 'Temario del Curso'}</h2>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en cada módulo para expandir y ver su contenido
                    </p>
                  </div>
                  {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                    <BatchContentGenerator courseId={courseId!} />
                  )}
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
                ) : null}
              </>
            )}
            {(isCFCCourse || isPropio) && modules.length > 0 ? (
              /* ===== CFC SIMPLIFIED MODULE VIEW ===== */
              <>
                {useCampusLayout && selectedModuleId && (
                  <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      Mostrando solo el módulo seleccionado en la barra superior
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedModuleId(null)}>
                      Ver todos los módulos
                    </Button>
                  </div>
                )}
              <Accordion type="multiple" defaultValue={useCampusLayout && selectedModuleId ? [selectedModuleId] : []} className="space-y-3">
                {modules.filter(m => !useCampusLayout || !selectedModuleId || m.id === selectedModuleId).map((module, index) => {
                  const moduleUnits = module.formative_units || [];
                  return (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <span className="font-mono text-sm font-bold bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0">{index + 1}</span>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-sm">{module.title}</h3>
                            {module.description && <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>}
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{module.duration_minutes ? (module.duration_minutes / 60).toFixed(1) : 0}h</span>
                              <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" />{moduleUnits.length} UFs</span>
                              <div className="flex items-center gap-2 ml-auto">
                                <Progress value={module.progress || 0} className="w-16 h-1.5" />
                                <span className="font-medium">{module.progress || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2 border-t">
                        {/* Diagnóstico inicial del módulo (recomendado, no bloqueante) */}
                        <div
                          onClick={() => setDiagnosticModule({ id: module.id, title: module.title })}
                          className="mb-3 flex items-center gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors"
                        >
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                            <ClipboardCheck className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-semibold">Diagnóstico inicial del módulo</span>
                            <p className="text-xs text-muted-foreground">
                              Evalúa tu competencia digital y conocimientos previos antes de empezar (recomendado).
                            </p>
                          </div>
                          {isDiagnosticDone(module.id) ? (
                            <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Realizado</Badge>
                          ) : (
                            <Badge variant="outline">Pendiente</Badge>
                          )}
                        </div>

                        {moduleUnits.length === 0 ? (
                          <div className="space-y-3">
                            {/* Show module-level PDF even without UFs */}
                            <div 
                              className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-950/40 transition-colors"
                              onClick={async () => {
                                const { data: pdfData } = await (supabase as any)
                                  .from('module_content')
                                  .select('file_path, title')
                                  .eq('module_id', module.id)
                                  .eq('content_type', 'manual_pdf')
                                  .order('created_at', { ascending: false })
                                  .limit(1);
                                if (pdfData && pdfData.length > 0 && pdfData[0].file_path) {
                                  await resolveAndOpenPdf(pdfData[0].file_path, `${module.title || 'temario-modulo'}.pdf`);
                                } else {
                                  toast({ title: "Sin PDF", description: "Aún no se ha subido el PDF de este módulo.", variant: "destructive" });
                                }
                              }}
                            >
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded"><FileText className="h-4 w-4 text-blue-600" /></div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">{module.title}</span>
                                <p className="text-xs text-muted-foreground">PDF del temario de este módulo</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                                  <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                                    e.stopPropagation();
                                    setManualUploaderModuleId(module.id);
                                    setManualUploaderModuleTitle(module.title);
                                    setManualUploaderUnitId(undefined);
                                    setManualUploaderOpen(true);
                                  }}><Upload className="h-3 w-3" />Subir PDF</Button>
                                )}
                              </div>
                            </div>
                            {/* Test & Activity placeholders */}
                            <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded"><ClipboardList className="h-4 w-4 text-purple-600" /></div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">Test Final del Módulo</span>
                                <p className="text-xs text-muted-foreground">Examen tipo test</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded"><PenTool className="h-4 w-4 text-green-600" /></div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">Actividad / Tarea</span>
                                <p className="text-xs text-muted-foreground">Ejercicio práctico del módulo</p>
                              </div>
                            </div>
                            {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                              <div className="pt-2 border-t">
                                <ModuleFormativeUnitManager moduleId={module.id} moduleTitle={module.title} formativeUnits={moduleUnits} onUpdate={loadCourseData} />
                              </div>
                            )}
                          </div>
                        ) : module.is_elective ? (
                          /* ===== ELECTIVE MODULE - ITINERARY SELECTOR ===== */
                          <ElectiveModuleContent
                            module={module}
                            moduleUnits={moduleUnits}
                            courseId={courseId!}
                            userRole={userRole}
                            openPdfViaBlob={openPdfViaBlob}
                            openActivityManager={openActivityManager}
                            setManualUploaderModuleId={setManualUploaderModuleId}
                            setManualUploaderModuleTitle={setManualUploaderModuleTitle}
                            setManualUploaderUnitId={setManualUploaderUnitId}
                            setManualUploaderOpen={setManualUploaderOpen}
                          />
                        ) : (
                          <div className="space-y-3">
                            {moduleUnits.map((unit: any) => (
                              <div key={unit.id} className="border rounded-lg p-4 space-y-3">
                                <h4 className="font-medium text-sm">{unit.title}</h4>
                                <div 
                                  className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-950/40 transition-colors"
                                  onClick={async () => {
                                    let pdfData: any[] | null = null;
                                    const { data: exactMatch } = await (supabase as any)
                                      .from('module_content').select('file_path, title')
                                      .eq('module_id', module.id).eq('content_type', 'manual_pdf')
                                      .eq('formative_unit_id', unit.id).limit(1);
                                    pdfData = exactMatch;
                                    if (!pdfData || pdfData.length === 0) {
                                      const { data: fallback } = await (supabase as any)
                                        .from('module_content').select('file_path, title')
                                        .eq('module_id', module.id).eq('content_type', 'manual_pdf')
                                        .is('formative_unit_id', null).order('created_at', { ascending: false }).limit(1);
                                      pdfData = fallback;
                                    }
                                    if (pdfData && pdfData.length > 0 && pdfData[0].file_path) {
                                      await resolveAndOpenPdf(pdfData[0].file_path, `${unit.title || 'temario'}.pdf`);
                                    } else {
                                      toast({ title: "Sin PDF", description: "Aún no se ha subido el PDF de esta unidad.", variant: "destructive" });
                                    }
                                  }}
                                >
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded"><FileText className="h-4 w-4 text-blue-600" /></div>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">{unit.title}</span>
                                    <p className="text-xs text-muted-foreground">PDF del temario de esta unidad</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="gap-2" onClick={async (e) => {
                                      e.stopPropagation();
                                      let { data: pdfData } = await (supabase as any)
                                        .from('module_content').select('file_path, title')
                                        .eq('module_id', module.id).eq('content_type', 'manual_pdf')
                                        .eq('formative_unit_id', unit.id).limit(1);
                                      if (!pdfData || pdfData.length === 0) {
                                        const { data: fallback } = await (supabase as any)
                                          .from('module_content').select('file_path, title')
                                          .eq('module_id', module.id).eq('content_type', 'manual_pdf')
                                          .is('formative_unit_id', null).order('created_at', { ascending: false }).limit(1);
                                        pdfData = fallback;
                                      }
                                      if (pdfData && pdfData.length > 0 && pdfData[0].file_path) {
                                        await resolveAndOpenPdf(pdfData[0].file_path, `${unit.title || 'temario'}.pdf`);
                                      } else {
                                        toast({ title: "Sin PDF", description: "Aún no se ha subido el PDF de esta unidad.", variant: "destructive" });
                                      }
                                    }}><ExternalLink className="h-3 w-3" />Ver PDF</Button>
                                    {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                                      <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                                        e.stopPropagation();
                                        setManualUploaderModuleId(module.id);
                                        setManualUploaderModuleTitle(unit.title);
                                        setManualUploaderUnitId(unit.id);
                                        setManualUploaderOpen(true);
                                      }}><Upload className="h-3 w-3" />Subir</Button>
                                    )}
                                  </div>
                                </div>
                                {(() => {
                                  const unitEvals = (module.evaluations || []).filter((ev: any) => ev.formative_unit_id === unit.id);
                                  const hasTest = unitEvals.length > 0;
                                  return (
                                    <div className={`flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 ${hasTest && userRole === 'student' ? 'cursor-pointer hover:bg-purple-100/50' : ''}`}
                                      onClick={() => { if (hasTest && userRole === 'student') navigate(`/evaluation/${unitEvals[0].id}?courseId=${courseId}`); }}>
                                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded"><ClipboardList className="h-4 w-4 text-purple-600" /></div>
                                      <div className="flex-1">
                                        <span className="text-sm font-medium">Test Final de la Unidad</span>
                                        <p className="text-xs text-muted-foreground">{hasTest ? unitEvals[0].title : 'Examen tipo test de la unidad'}</p>
                                      </div>
                                      {hasTest && userRole === 'student' && (
                                        <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/evaluation/${unitEvals[0].id}?courseId=${courseId}`);
                                        }}><PlayCircle className="h-3 w-3" />Realizar Test</Button>
                                      )}
                                    </div>
                                  );
                                })()}
                                <div className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50">
                                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded"><PenTool className="h-4 w-4 text-green-600" /></div>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">Actividad / Tarea</span>
                                    <p className="text-xs text-muted-foreground">Ejercicio práctico de la unidad</p>
                                  </div>
                                  {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openActivityManager(unit.id, unit.title)}><Plus className="h-3 w-3" />Gestionar</Button>
                                  )}
                                </div>
                                <SelfAssessmentQuiz courseId={courseId!} formativeUnitId={unit.id} formativeUnitTitle={unit.title} />
                              </div>
                            ))}
                          </div>
                        )}
                        {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                          <div className="mt-4 pt-3 border-t">
                            <ModuleFormativeUnitManager moduleId={module.id} moduleTitle={module.title} formativeUnits={moduleUnits} onUpdate={loadCourseData} />
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              </>
            ) : (
              /* ===== SEPE / STANDARD MODULE VIEW ===== */
              <SEPEFormacionCampus
                modules={useCampusLayout && selectedModuleId ? modules.filter(m => m.id === selectedModuleId) : modules}
                courseId={courseId!}
                courseTitle={course?.title || 'Curso'}
                userRole={userRole}
                getUnitProgress={getUnitProgress}
                onOpenScormViewer={openScormViewer}
                onOpenActivityManager={openActivityManager}
                onOpenManualUploader={(moduleId, unitTitle, unitId) => {
                  setManualUploaderModuleId(moduleId);
                  setManualUploaderModuleTitle(unitTitle);
                  setManualUploaderUnitId(unitId);
                  setManualUploaderOpen(true);
                }}
                onOpenScormAuthor={openScormAuthor}
                onReloadCourse={loadCourseData}
              />
            )}
          </TabsContent>


          <TabsContent value="exams" className="space-y-4">
            <section className="rounded-lg border bg-card p-5 space-y-4 text-sm">
              <h2 className="text-lg font-semibold text-primary">¿Cómo se puntúa en tu curso?</h2>
              <p className="text-muted-foreground">
                La nota final de cada módulo formativo/unidad formativa se calculará del siguiente modo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Un <strong>30%</strong> de la nota final corresponde al promedio de notas obtenidas en las actividades de aprendizaje, valoración de la participación en los foros de debate y pruebas de evaluación realizadas tanto en el Campus Virtual como en las Tutorías Presenciales en el Centro de Formación.
                </li>
                <li>
                  Un <strong>70%</strong> de la nota final corresponderá a la nota obtenida en la prueba de evaluación final presencial desarrollada en el Centro de Formación, en la que deberás obtener, al menos, una puntuación de <strong>5</strong> como te hemos comentado anteriormente.
                </li>
              </ul>
              <p className="text-muted-foreground">
                El valor de cada una de estas actividades de aprendizaje y pruebas de evaluación se muestra en la siguiente tabla:
              </p>
              <img
                src={tablaPuntuacionCurso}
                alt="Tabla de puntuación del curso: actividades en campus virtual (30%) y prueba presencial final (70%)"
                className="w-full rounded-md border"
              />
            </section>

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

            {/* EVALUACIÓN SOBRE EL PROCESO FORMATIVO - SEPE Compliance */}
            <Accordion type="single" collapsible defaultValue="proceso">
              <AccordionItem value="proceso" className="border-0">
                <AccordionTrigger className="bg-emerald-700 text-white px-4 py-3 rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
                  <span className="font-bold text-lg">EVALUACIÓN SOBRE EL PROCESO FORMATIVO</span>
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-lg p-4 bg-white space-y-4">
                  <p className="text-sm text-slate-700">
                    Durante el desarrollo del módulo formativo se aplican las siguientes garantías de evaluación,
                    conforme a lo establecido en el Proyecto Formativo y la normativa SEPE:
                  </p>

                  <div className="grid gap-3">
                    {[
                      {
                        n: 1,
                        title: "Planificación según Proyecto Formativo",
                        text: "Se incluyen, durante el desarrollo del módulo, las actividades e instrumentos de evaluación especificados en la planificación del aprendizaje recogida en el Proyecto formativo del curso.",
                      },
                      {
                        n: 2,
                        title: "Medición de conocimientos, destrezas y habilidades",
                        text: "Las actividades e instrumentos de evaluación están diseñados para medir el logro de los conocimientos, destrezas y habilidades recogidos en las capacidades y criterios de evaluación del módulo.",
                      },
                      {
                        n: 3,
                        title: "Representatividad y nivel de cualificación",
                        text: "Las actividades de evaluación son representativas de las capacidades y criterios de evaluación a comprobar, con la complejidad y dificultad exigida por el nivel de cualificación del certificado.",
                      },
                      {
                        n: 4,
                        title: "Instrucciones claras al alumnado",
                        text: "Cada actividad incluye instrucciones que explican qué se debe realizar, cómo se medirá el desempeño, los plazos de presentación, los criterios de corrección y, si procede, cómo y dónde remitir la actividad.",
                      },
                      {
                        n: 5,
                        title: "Consulta permanente de resultados",
                        text: "Puedes consultar en todo momento los resultados obtenidos en las actividades y trabajos de evaluación desarrollados durante el proceso de aprendizaje desde la sección «Mis calificaciones», conociendo permanentemente tu rendimiento.",
                      },
                    ].map((item) => (
                      <div key={item.n} className="flex gap-3 p-3 bg-emerald-50 border-l-4 border-l-emerald-600 rounded-r">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                          {item.n}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-emerald-900">{item.title}</p>
                          <p className="text-sm text-slate-700 mt-1">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-2 border-emerald-300 rounded-lg p-4 bg-emerald-50/50">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-slate-700">
                        <p className="font-semibold text-emerald-900 mb-1">Instrumentos disponibles en este módulo</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Diagnóstico inicial por módulo (competencia digital y conocimientos previos).</li>
                          <li>Tests de autoevaluación por unidad formativa con feedback inmediato.</li>
                          <li>Actividades prácticas con criterios de corrección publicados y plazos definidos.</li>
                          <li>Participación valorada en foros de debate del módulo.</li>
                          <li>Test final de módulo en el Campus Virtual.</li>
                          <li>Prueba de evaluación final presencial en el Centro de Formación.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setActiveTab("grades")}
                    >
                      <Award className="h-4 w-4" />
                      Consultar mis calificaciones
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setActiveTab("work-plan")}
                    >
                      <Calendar className="h-4 w-4" />
                      Ver plazos en el Plan de trabajo
                    </Button>
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

            {/* Guía de Tutorías Presenciales para docentes y alumnos */}
            <TutoriasPresencialesGuide 
              userRole={userRole} 
              courseName={course?.title}
              centerName={centerName}
              courseId={course?.id || ''}
            />

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
            <CFCForumTabs
              courseId={courseId!}
              isAdmin={userRole === 'admin' || userRole === 'super_admin'}
              isTeacher={userRole === 'teacher'}
            />
          </TabsContent>

          <TabsContent value="glossary" className="space-y-4">
            <CourseGlossary
              courseId={courseId!}
              isTeacher={userRole === 'teacher'}
              isAdmin={userRole === 'admin' || userRole === 'super_admin'}
            />
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4">
            <CourseFAQs
              courseId={courseId!}
              isTeacher={userRole === 'teacher'}
              isAdmin={userRole === 'admin' || userRole === 'super_admin'}
            />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <CourseAnnouncements
              courseId={courseId!}
              isTeacher={userRole === 'teacher'}
              isAdmin={userRole === 'admin' || userRole === 'super_admin'}
            />
          </TabsContent>

          <TabsContent value="cafeteria" className="space-y-4">
            <VirtualCafeteria courseId={courseId!} />
          </TabsContent>

          {userRole === 'teacher' && (
            <TabsContent value="tutor-forum" className="space-y-4">
              <TutorForum 
                courseId={courseId!}
                moduleId={modules.length > 0 ? modules[0].id : undefined}
                courseTitle={course?.title || ""}
              />
            </TabsContent>
          )}

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

          {course && (
            <TabsContent value="certificate" className="space-y-4">
              {/* For SEPE/Certificate courses: admin uploads, student downloads */}
              {showSEPEFeatures && (userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher') && (
                <SEPECertificateUploader courseId={courseId!} courseTitle={course.title} />
              )}
              {showSEPEFeatures && userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'teacher' && enrollment && (
                <SEPECertificateStudentView courseId={courseId!} enrollmentId={enrollment.id} />
              )}
              {/* CFC courses keep the auto-generated certificate */}
              {(isCFCCourse || course?.course_type === 'propio') && (
                <CourseCertificateDownload
                  courseId={courseId!}
                  courseTitle={course.title}
                  durationHours={course.duration_hours || 0}
                  courseCode={course.course_code}
                  startDate={course.start_date}
                  endDate={course.end_date}
                  modality={course.modality}
                  trainingCenterId={course.training_center_id}
                  courseType={course.course_type}
                  certificateModelUrl={(course as any).certificate_model_url}
                />
              )}
            </TabsContent>
          )}
          </Tabs>
          </div>
          
          {/* Right Sidebar - Tutor and Evaluations */}
          {!useCampusLayout && (
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
                    {tutorProfile?.full_name ? tutorProfile.full_name.replace(/\s*\(Prueba SEPE\)/gi, '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TU'}
                  </div>
                  <div>
                    <p className="font-semibold">{tutorProfile?.full_name?.replace(/\s*\(Prueba SEPE\)/gi, '') || 'Tutor del curso'}</p>
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

            {/* Mi Perfil (alumnos) / Recursos Didácticos (tutores) */}
            {userRole === 'teacher' ? (
              <Collapsible defaultOpen={false}>
                <Card>
                  <CardHeader className="pb-2 bg-teal-700 rounded-t-lg">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                          <BookMarked className="h-5 w-5" />
                          Recursos del Tutor
                        </CardTitle>
                        <ChevronDown className="h-5 w-5 text-white" />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-0 p-0">
                      <div className="p-3 bg-teal-50 border-b text-xs text-slate-600">
                        Recursos necesarios para tu actividad como tutor-formador:
                      </div>
                      {/* Guía del Tutor-Formador */}
                      <div 
                        className="flex items-center gap-3 p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={async () => {
                          if (course?.tutor_guide_pdf_url) {
                            try {
                              const resp = await fetch(course.tutor_guide_pdf_url);
                              const blob = await resp.blob();
                              const blobUrl = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = blobUrl;
                              link.download = 'Guia_Tutor_Formador.pdf';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                            } catch {
                              toast({ title: "Error", description: "No se pudo descargar la guía.", variant: "destructive" });
                            }
                          } else {
                            toast({
                              title: "Guía del Tutor-Formador",
                              description: "La guía estará disponible próximamente.",
                            });
                          }
                        }}
                      >
                        <div className="p-2 bg-teal-100 rounded">
                          <FileText className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Guía del Tutor (PDF)</span>
                        </div>
                        <Badge className="text-xs bg-teal-600">PDF</Badge>
                      </div>
                      {/* Documentos de Actividades */}
                      <div 
                        className="flex items-center gap-3 p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          toast({
                            title: "Documentos de Actividades",
                            description: "Acceda desde Seguimiento de tareas al corregir cada actividad.",
                          });
                        }}
                      >
                        <div className="p-2 bg-blue-100 rounded">
                          <ClipboardList className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Actividades de Aprendizaje</span>
                        </div>
                      </div>
                      {/* Planificación Tutorías */}
                      <div 
                        className="flex items-center gap-3 p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          toast({
                            title: "Planificación de Tutorías",
                            description: "PDFs con planificación de actividades para tutorías presenciales.",
                          });
                        }}
                      >
                        <div className="p-2 bg-purple-100 rounded">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Tutorías Presenciales</span>
                        </div>
                      </div>
                      {/* Soluciones Tests */}
                      <div 
                        className="flex items-center gap-3 p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          toast({
                            title: "Soluciones de Tests",
                            description: "Disponibles debajo de cada CIM en 'Formación en Campus'.",
                          });
                        }}
                      >
                        <div className="p-2 bg-green-100 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Soluciones Tests</span>
                        </div>
                      </div>
                      {/* Evaluación Presencial */}
                      <div 
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          toast({
                            title: "Evaluación Presencial Final",
                            description: "Información disponible en la región 'Evaluación'.",
                          });
                        }}
                      >
                        <div className="p-2 bg-red-100 rounded">
                          <GraduationCap className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Eval. Presencial Final</span>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ) : (
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
            )}

            {/* Tutorías Virtuales */}
            <Collapsible defaultOpen={false}>
              <Card>
                <CardHeader className="pb-2">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium uppercase tracking-wide text-primary flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Tutorías Virtuales
                      </CardTitle>
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Las tutorías virtuales son sesiones en línea donde podrás conectar con tu tutor/a y compañeros/as en tiempo real.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consulta en <span className="font-semibold text-foreground">MI AGENDA</span> las fechas y horarios programados para las sesiones de videoconferencia.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Recibirás el enlace de acceso a través de la mensajería interna del campus antes de cada sesión.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Progreso - Diferente para tutor y alumno */}
            {userRole === 'teacher' ? (
              <Collapsible defaultOpen={false}>
                <Card>
                  <CardHeader className="pb-2 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-lg">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                          <Users className="h-4 w-4" />
                          Progreso de mis Alumnos
                        </CardTitle>
                        <ChevronDown className="h-4 w-4 text-white" />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-4">
                      <TutorStudentProgress courseId={courseId!} />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ) : (
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
            )}

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
          )}
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

      {/* SCORM Package Player Dialog */}
      <Dialog open={scormViewerOpen} onOpenChange={setScormViewerOpen}>
        <DialogContent className="w-screen h-[100dvh] max-w-none sm:max-w-6xl sm:h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedUnitTitle || "Contenido Interactivo"}</DialogTitle>
          </DialogHeader>
          {selectedScormModuleId && enrollment?.id ? (
            <ScormPlayer
              moduleId={selectedScormModuleId}
              formativeUnitId={selectedUnitId}
              enrollmentId={enrollment.id}
              autoStart
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground">No se pudo inicializar el reproductor SCORM.</div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* SCORM Author Modal - Editor avanzado tipo Captivate */}
      <ScormAuthorModal
        open={scormAuthorOpen}
        onOpenChange={setScormAuthorOpen}
        moduleId={scormAuthorModuleId}
        formativeUnitId={scormAuthorUnitId}
        unitTitle={scormAuthorUnitTitle}
        onSaveComplete={() => {
          loadCourseData();
          setScormAuthorOpen(false);
        }}
      />

      {/* Manual PDF Uploader Dialog */}
      <Dialog open={manualUploaderOpen} onOpenChange={setManualUploaderOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Gestión de Manuales PDF — {manualUploaderModuleTitle}
            </DialogTitle>
          </DialogHeader>
          {manualUploaderOpen && manualUploaderModuleId && (
            <ModuleManualUploader
              moduleId={manualUploaderModuleId}
              moduleTitle={manualUploaderModuleTitle}
              formativeUnitId={manualUploaderUnitId}
              courseId={courseId}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diagnóstico inicial del módulo */}
      <Dialog open={!!diagnosticModule} onOpenChange={(o) => !o && setDiagnosticModule(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Diagnóstico inicial · {diagnosticModule?.title}</DialogTitle>
          </DialogHeader>
          {diagnosticModule && (
            <PreAssessmentTest
              moduleId={diagnosticModule.id}
              moduleTitle={diagnosticModule.title}
              onComplete={(res) => {
                try { localStorage.setItem(diagnosticDoneKey(diagnosticModule.id), JSON.stringify({ at: res.completedAt })); } catch {}
                toast({ title: "Diagnóstico guardado", description: "Tu diagnóstico se ha registrado correctamente." });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
