import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  Upload, 
  Save, 
  Loader2,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  Video,
  File,
  Eye,
  EyeOff,
  Settings,
  Map,
  ListChecks,
  MessagesSquare,
  Link2,
  Play,
  FileQuestion,
  Presentation,
  Headphones,
  Image,
  Code,
  Gamepad2,
  Layers,
  Download
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ModuleManualUploader } from "@/components/ModuleManualUploader";
import { SyllabusEditor } from "@/components/SyllabusEditor";
import { ScormAuthorModal } from "@/components/scorm-author";

interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  objectives: string;
  specific_objectives: string[];
  course_type: string;
  ficha_certificado_url: string | null;
  boe_url: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  order_index: number;
  duration_minutes: number;
  is_active: boolean;
  is_visible_to_students: boolean;
  concept_map_url: string | null;
  objectives: string | null;
  forum_enabled: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface Evaluation {
  id: string;
  title: string;
  description: string;
  module_id: string | null;
  formative_unit_id: string | null;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number | null;
  is_active: boolean;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  instructions: string;
  module_id: string | null;
  formative_unit_id: string | null;
  submission_type: string;
  max_score: number;
  due_date: string | null;
  is_active: boolean;
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
  start_date: string | null;
  end_date: string | null;
}

export default function CourseContentEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formativeUnits, setFormativeUnits] = useState<FormativeUnit[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [uploadingFicha, setUploadingFicha] = useState(false);
  const [uploadingBoe, setUploadingBoe] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingUnit, setEditingUnit] = useState<FormativeUnit | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  // Syllabus editor state
  const [syllabusEditorOpen, setSyllabusEditorOpen] = useState(false);
  const [syllabusUnitId, setSyllabusUnitId] = useState("");
  const [syllabusUnitTitle, setSyllabusUnitTitle] = useState("");

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    content: "",
    duration_hours: 1,
    is_active: true,
    is_visible_to_students: true,
    concept_map_url: "",
    objectives: "",
    forum_enabled: true,
    start_date: "",
    end_date: ""
  });

  const [evaluationForm, setEvaluationForm] = useState({
    title: "",
    description: "",
    module_id: "",
    formative_unit_id: "",
    passing_score: 50,
    max_attempts: 3,
    time_limit_minutes: 60,
    is_active: true
  });

  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    instructions: "",
    module_id: "",
    formative_unit_id: "",
    submission_type: "file",
    max_score: 100,
    due_date: "",
    is_active: true
  });

  const [unitForm, setUnitForm] = useState({
    title: "",
    description: "",
    content: "",
    objectives: "",
    duration_hours: 1,
    is_active: true,
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse({
        ...courseData,
        specific_objectives: Array.isArray(courseData.specific_objectives) 
          ? (courseData.specific_objectives as string[])
          : []
      });

      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at");

      if (evaluationsError) throw evaluationsError;
      setEvaluations(evaluationsData || []);

      const { data: activitiesData, error: activitiesError } = await supabase
        .from("development_activities")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at");

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Load formative units for all modules
      if (modulesData && modulesData.length > 0) {
        const moduleIds = modulesData.map(m => m.id);
        const { data: unitsData, error: unitsError } = await supabase
          .from("formative_units")
          .select("*")
          .in("module_id", moduleIds)
          .order("order_index");

        if (unitsError) throw unitsError;
        setFormativeUnits(unitsData || []);
      }

    } catch (error: any) {
      console.error("Error loading course:", error);
      toast.error("Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Module functions
  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setSaving(true);
    try {
      if (editingModule) {
        const { error } = await supabase
          .from("modules")
          .update({
            title: moduleForm.title,
            description: moduleForm.description,
            content: moduleForm.content,
            duration_minutes: Math.round(moduleForm.duration_hours * 60),
            is_active: moduleForm.is_active,
            is_visible_to_students: moduleForm.is_visible_to_students,
            concept_map_url: moduleForm.concept_map_url || null,
            objectives: moduleForm.objectives || null,
            forum_enabled: moduleForm.forum_enabled,
            start_date: moduleForm.start_date || null,
            end_date: moduleForm.end_date || null
          })
          .eq("id", editingModule.id);

        if (error) throw error;
        toast.success("Módulo actualizado");
      } else {
        const { error } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: moduleForm.title,
            description: moduleForm.description,
            content: moduleForm.content,
            duration_minutes: Math.round(moduleForm.duration_hours * 60),
            is_active: moduleForm.is_active,
            is_visible_to_students: moduleForm.is_visible_to_students,
            order_index: modules.length + 1,
            concept_map_url: moduleForm.concept_map_url || null,
            objectives: moduleForm.objectives || null,
            forum_enabled: moduleForm.forum_enabled,
            start_date: moduleForm.start_date || null,
            end_date: moduleForm.end_date || null
          });

        if (error) throw error;
        toast.success("Módulo creado");
      }

      setModuleDialogOpen(false);
      resetModuleForm();
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al guardar el módulo");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("¿Estás seguro de eliminar este módulo?")) return;

    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;
      toast.success("Módulo eliminado");
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al eliminar el módulo");
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      content: module.content || "",
      duration_hours: module.duration_minutes ? module.duration_minutes / 60 : 1,
      is_active: module.is_active,
      is_visible_to_students: module.is_visible_to_students ?? true,
      concept_map_url: module.concept_map_url || "",
      objectives: module.objectives || "",
      forum_enabled: module.forum_enabled ?? true,
      start_date: module.start_date ? module.start_date.split('T')[0] : "",
      end_date: module.end_date ? module.end_date.split('T')[0] : ""
    });
    setModuleDialogOpen(true);
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleForm({
      title: "",
      description: "",
      content: "",
      duration_hours: 1,
      is_active: true,
      is_visible_to_students: true,
      concept_map_url: "",
      objectives: "",
      forum_enabled: true,
      start_date: "",
      end_date: ""
    });
  };

  // Evaluation functions
  const handleSaveEvaluation = async () => {
    if (!evaluationForm.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const data = {
        course_id: courseId,
        title: evaluationForm.title,
        description: evaluationForm.description,
        module_id: evaluationForm.module_id || null,
        formative_unit_id: evaluationForm.formative_unit_id || null,
        passing_score: evaluationForm.passing_score,
        max_attempts: evaluationForm.max_attempts,
        time_limit_minutes: evaluationForm.time_limit_minutes || null,
        is_active: evaluationForm.is_active
      };

      if (editingEvaluation) {
        const { error } = await supabase
          .from("evaluations")
          .update(data)
          .eq("id", editingEvaluation.id);

        if (error) throw error;
        toast.success("Evaluación actualizada");
      } else {
        const { error } = await supabase
          .from("evaluations")
          .insert(data);

        if (error) throw error;
        toast.success("Evaluación creada");
      }

      setEvaluationDialogOpen(false);
      resetEvaluationForm();
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al guardar la evaluación");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvaluation = async (evalId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta evaluación?")) return;

    try {
      const { error } = await supabase
        .from("evaluations")
        .delete()
        .eq("id", evalId);

      if (error) throw error;
      toast.success("Evaluación eliminada");
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al eliminar la evaluación");
    }
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setEvaluationForm({
      title: evaluation.title,
      description: evaluation.description || "",
      module_id: evaluation.module_id || "",
      formative_unit_id: evaluation.formative_unit_id || "",
      passing_score: evaluation.passing_score,
      max_attempts: evaluation.max_attempts || 3,
      time_limit_minutes: evaluation.time_limit_minutes || 60,
      is_active: evaluation.is_active
    });
    setEvaluationDialogOpen(true);
  };

  const resetEvaluationForm = () => {
    setEditingEvaluation(null);
    setSelectedUnitId(null);
    setEvaluationForm({
      title: "",
      description: "",
      module_id: "",
      formative_unit_id: "",
      passing_score: 50,
      max_attempts: 3,
      time_limit_minutes: 60,
      is_active: true
    });
  };

  // Activity functions
  const handleSaveActivity = async () => {
    if (!activityForm.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const data = {
        course_id: courseId,
        title: activityForm.title,
        description: activityForm.description,
        instructions: activityForm.instructions,
        module_id: activityForm.module_id || null,
        formative_unit_id: activityForm.formative_unit_id || null,
        submission_type: activityForm.submission_type,
        max_score: activityForm.max_score,
        due_date: activityForm.due_date || null,
        is_active: activityForm.is_active
      };

      if (editingActivity) {
        const { error } = await supabase
          .from("development_activities")
          .update(data)
          .eq("id", editingActivity.id);

        if (error) throw error;
        toast.success("Actividad actualizada");
      } else {
        const { error } = await supabase
          .from("development_activities")
          .insert(data);

        if (error) throw error;
        toast.success("Actividad creada");
      }

      setActivityDialogOpen(false);
      resetActivityForm();
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al guardar la actividad");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;

    try {
      const { error } = await supabase
        .from("development_activities")
        .delete()
        .eq("id", activityId);

      if (error) throw error;
      toast.success("Actividad eliminada");
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al eliminar la actividad");
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      description: activity.description || "",
      instructions: activity.instructions || "",
      module_id: activity.module_id || "",
      formative_unit_id: activity.formative_unit_id || "",
      submission_type: activity.submission_type || "file",
      max_score: activity.max_score || 100,
      due_date: activity.due_date || "",
      is_active: activity.is_active
    });
    setActivityDialogOpen(true);
  };

  const resetActivityForm = () => {
    setEditingActivity(null);
    setSelectedUnitId(null);
    setActivityForm({
      title: "",
      description: "",
      instructions: "",
      module_id: "",
      formative_unit_id: "",
      submission_type: "file",
      max_score: 100,
      due_date: "",
      is_active: true
    });
  };

  const openAddEvaluationForUnit = (moduleId: string, unitId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedUnitId(unitId);
    setEvaluationForm(prev => ({ ...prev, module_id: moduleId, formative_unit_id: unitId }));
    setEvaluationDialogOpen(true);
  };

  const openAddActivityForUnit = (moduleId: string, unitId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedUnitId(unitId);
    setActivityForm(prev => ({ ...prev, module_id: moduleId, formative_unit_id: unitId }));
    setActivityDialogOpen(true);
  };

  const openAddEvaluationForModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEvaluationForm(prev => ({ ...prev, module_id: moduleId }));
    setEvaluationDialogOpen(true);
  };

  const openAddActivityForModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setActivityForm(prev => ({ ...prev, module_id: moduleId }));
    setActivityDialogOpen(true);
  };

  // Formative Unit functions
  const handleSaveUnit = async () => {
    if (!unitForm.title.trim() || !selectedModuleId) {
      toast.error("El título es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const moduleUnits = formativeUnits.filter(u => u.module_id === selectedModuleId);
      
      if (editingUnit) {
        const { error } = await supabase
          .from("formative_units")
          .update({
            title: unitForm.title,
            description: unitForm.description || null,
            content: unitForm.content || null,
            objectives: unitForm.objectives || null,
            duration_hours: unitForm.duration_hours,
            is_active: unitForm.is_active,
            start_date: unitForm.start_date || null,
            end_date: unitForm.end_date || null
          })
          .eq("id", editingUnit.id);

        if (error) throw error;
        toast.success("Unidad formativa actualizada");
      } else {
        const { error } = await supabase
          .from("formative_units")
          .insert({
            module_id: selectedModuleId,
            title: unitForm.title,
            description: unitForm.description || null,
            content: unitForm.content || null,
            objectives: unitForm.objectives || null,
            duration_hours: unitForm.duration_hours,
            is_active: unitForm.is_active,
            order_index: moduleUnits.length + 1,
            start_date: unitForm.start_date || null,
            end_date: unitForm.end_date || null
          });

        if (error) throw error;
        toast.success("Unidad formativa creada");
      }

      setUnitDialogOpen(false);
      resetUnitForm();
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al guardar la unidad formativa");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta unidad formativa?")) return;

    try {
      const { error } = await supabase
        .from("formative_units")
        .delete()
        .eq("id", unitId);

      if (error) throw error;
      toast.success("Unidad formativa eliminada");
      loadCourseData();
    } catch (error: any) {
      toast.error("Error al eliminar la unidad formativa");
    }
  };

  const handleEditUnit = (unit: FormativeUnit) => {
    setEditingUnit(unit);
    setSelectedModuleId(unit.module_id);
    setUnitForm({
      title: unit.title,
      description: unit.description || "",
      content: unit.content || "",
      objectives: unit.objectives || "",
      duration_hours: unit.duration_hours || 1,
      is_active: unit.is_active,
      start_date: unit.start_date ? unit.start_date.split('T')[0] : "",
      end_date: unit.end_date ? unit.end_date.split('T')[0] : ""
    });
    setUnitDialogOpen(true);
  };

  const resetUnitForm = () => {
    setEditingUnit(null);
    setUnitForm({
      title: "",
      description: "",
      content: "",
      objectives: "",
      duration_hours: 1,
      is_active: true,
      start_date: "",
      end_date: ""
    });
  };

  const openAddUnitForModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    resetUnitForm();
    setUnitDialogOpen(true);
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const getModuleUnits = (moduleId: string) => formativeUnits.filter(u => u.module_id === moduleId);

  // Upload official documents
  const handleUploadFicha = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !courseId) return;

    setUploadingFicha(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/ficha_certificado.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-content')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('courses')
        .update({ ficha_certificado_url: publicUrl })
        .eq('id', courseId);

      if (updateError) throw updateError;

      setCourse(prev => prev ? { ...prev, ficha_certificado_url: publicUrl } : null);
      toast.success('Ficha del certificado subida correctamente');
    } catch (error: any) {
      console.error('Error uploading ficha:', error);
      toast.error('Error al subir la ficha del certificado');
    } finally {
      setUploadingFicha(false);
    }
  };

  const handleUploadBoe = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !courseId) return;

    setUploadingBoe(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/boe_documento.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-content')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('courses')
        .update({ boe_url: publicUrl })
        .eq('id', courseId);

      if (updateError) throw updateError;

      setCourse(prev => prev ? { ...prev, boe_url: publicUrl } : null);
      toast.success('Documento BOE subido correctamente');
    } catch (error: any) {
      console.error('Error uploading BOE:', error);
      toast.error('Error al subir el documento BOE');
    } finally {
      setUploadingBoe(false);
    }
  };

  const handleDeleteFicha = async () => {
    if (!courseId || !course?.ficha_certificado_url) return;
    if (!confirm('¿Eliminar la ficha del certificado?')) return;

    try {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ ficha_certificado_url: null })
        .eq('id', courseId);

      if (updateError) throw updateError;

      setCourse(prev => prev ? { ...prev, ficha_certificado_url: null } : null);
      toast.success('Ficha eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar la ficha');
    }
  };

  const handleDeleteBoe = async () => {
    if (!courseId || !course?.boe_url) return;
    if (!confirm('¿Eliminar el documento BOE?')) return;

    try {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ boe_url: null })
        .eq('id', courseId);

      if (updateError) throw updateError;

      setCourse(prev => prev ? { ...prev, boe_url: null } : null);
      toast.success('Documento BOE eliminado');
    } catch (error: any) {
      toast.error('Error al eliminar el documento BOE');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Curso no encontrado</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Volver</Button>
      </div>
    );
  }

  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'certificado': return 'Certificado de Profesionalidad';
      case 'cfc': return 'Curso de Formación Continua';
      default: return 'Curso Propio';
    }
  };

  const getModuleEvaluations = (moduleId: string) => evaluations.filter(e => e.module_id === moduleId && !e.formative_unit_id);
  const getModuleActivities = (moduleId: string) => activities.filter(a => a.module_id === moduleId && !a.formative_unit_id);
  const getUnitEvaluations = (unitId: string) => evaluations.filter(e => e.formative_unit_id === unitId);
  const getUnitActivities = (unitId: string) => activities.filter(a => a.formative_unit_id === unitId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{getCourseTypeLabel(course.course_type)}</Badge>
              <span className="text-sm text-muted-foreground">
                {course.duration_hours} horas · {modules.length} módulos
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/admin/course-settings/${courseId}`)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración del Curso
          </Button>
          <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
        </div>
      </div>

      {/* SEPE Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Estructura SEPE</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Este editor cumple con los requisitos de la normativa SEPE: módulos formativos, 
                evaluaciones con nota mínima del 50%, actividades de desarrollo y control de tiempos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Documents Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documentos Oficiales del Certificado
          </CardTitle>
          <CardDescription>
            Sube la ficha del certificado de profesionalidad y el documento BOE correspondiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ficha del Certificado */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium">
                <File className="h-4 w-4" />
                Ficha del Certificado de Profesionalidad
              </Label>
              {course?.ficha_certificado_url ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Ficha subida</p>
                    <a 
                      href={course.ficha_certificado_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:underline truncate block"
                    >
                      Ver documento
                    </a>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteFicha}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="ficha-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUploadFicha}
                    className="hidden"
                    disabled={uploadingFicha}
                  />
                  <label 
                    htmlFor="ficha-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {uploadingFicha ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {uploadingFicha ? 'Subiendo...' : 'Haz clic para subir la ficha'}
                    </span>
                    <span className="text-xs text-muted-foreground/75">PDF, DOC o DOCX</span>
                  </label>
                </div>
              )}
            </div>

            {/* BOE Document */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium">
                <BookOpen className="h-4 w-4" />
                Documento BOE (Boletín Oficial del Estado)
              </Label>
              {course?.boe_url ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">BOE subido</p>
                    <a 
                      href={course.boe_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:underline truncate block"
                    >
                      Ver documento
                    </a>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteBoe}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="boe-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUploadBoe}
                    className="hidden"
                    disabled={uploadingBoe}
                  />
                  <label 
                    htmlFor="boe-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {uploadingBoe ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {uploadingBoe ? 'Subiendo...' : 'Haz clic para subir el BOE'}
                    </span>
                    <span className="text-xs text-muted-foreground/75">PDF, DOC o DOCX</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Module Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Unidades Formativas / Módulos</h2>
          <p className="text-sm text-muted-foreground">
            Haz clic en cada módulo para expandir y gestionar su contenido
          </p>
        </div>
        <Dialog open={moduleDialogOpen} onOpenChange={(open) => {
          setModuleDialogOpen(open);
          if (!open) resetModuleForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Editar Módulo" : "Nuevo Módulo"}
              </DialogTitle>
              <DialogDescription>
                {editingModule ? "Modifica los datos del módulo" : "Crea un nuevo módulo o unidad formativa"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Título del Módulo *</Label>
                <Input
                  id="module-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Ej: MF0123_2 - Nombre del módulo"
                />
                <p className="text-xs text-muted-foreground">
                  Para certificados de profesionalidad, usa el formato: MF0000_X - Nombre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-description">Descripción</Label>
                <Textarea
                  id="module-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Describe los objetivos y contenidos del módulo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-content">Temario / Contenido</Label>
                <Textarea
                  id="module-content"
                  value={moduleForm.content}
                  onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                  placeholder="Contenido formativo, texto, HTML..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-objectives">Objetivos del Módulo</Label>
                <Textarea
                  id="module-objectives"
                  value={moduleForm.objectives}
                  onChange={(e) => setModuleForm({ ...moduleForm, objectives: e.target.value })}
                  placeholder="Lista de objetivos de aprendizaje..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-concept-map">URL Mapa Conceptual</Label>
                <Input
                  id="module-concept-map"
                  value={moduleForm.concept_map_url}
                  onChange={(e) => setModuleForm({ ...moduleForm, concept_map_url: e.target.value })}
                  placeholder="https://... o ruta del archivo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="module-start-date" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Fecha de Inicio
                  </Label>
                  <Input
                    id="module-start-date"
                    type="date"
                    value={moduleForm.start_date}
                    onChange={(e) => setModuleForm({ ...moduleForm, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-end-date" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Fecha de Fin
                  </Label>
                  <Input
                    id="module-end-date"
                    type="date"
                    value={moduleForm.end_date}
                    onChange={(e) => setModuleForm({ ...moduleForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="module-duration">Duración (horas)</Label>
                  <Input
                    id="module-duration"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={moduleForm.duration_hours}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration_hours: parseFloat(e.target.value) || 1 })}
                  />
                </div>

                <div className="flex items-center justify-between space-y-2">
                  <Label htmlFor="module-active">Módulo Activo</Label>
                  <Switch
                    id="module-active"
                    checked={moduleForm.is_active}
                    onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_active: checked })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4 text-primary" />
                  <Label htmlFor="module-forum">Habilitar Foro del Módulo</Label>
                </div>
                <Switch
                  id="module-forum"
                  checked={moduleForm.forum_enabled}
                  onCheckedChange={(checked) => setModuleForm({ ...moduleForm, forum_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-600" />
                  <div>
                    <Label htmlFor="module-visible" className="text-amber-800 dark:text-amber-200">Visible para Estudiantes</Label>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Desactiva para ocultar el módulo hasta que esté listo</p>
                  </div>
                </div>
                <Switch
                  id="module-visible"
                  checked={moduleForm.is_visible_to_students}
                  onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_visible_to_students: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveModule} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List - Collapsible */}
      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Sin módulos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comienza añadiendo el primer módulo o unidad formativa
            </p>
            <Button onClick={() => setModuleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Primer Módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => {
            const moduleUnits = getModuleUnits(module.id);
            const totalEvaluations = evaluations.filter(e => 
              e.module_id === module.id || moduleUnits.some(u => u.id === e.formative_unit_id)
            ).length;
            const totalActivities = activities.filter(a => 
              a.module_id === module.id || moduleUnits.some(u => u.id === a.formative_unit_id)
            ).length;
            const isExpanded = expandedModules.includes(module.id);

            return (
              <Card key={module.id} className={`${!module.is_active ? 'opacity-60' : ''} overflow-hidden`}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleModule(module.id)}>
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer">
                      <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                            <span className="font-mono text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{module.title}</CardTitle>
                              {!module.is_active && (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                              {module.is_visible_to_students === false && (
                                <Badge variant="outline" className="border-amber-500 text-amber-600">
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Oculto
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {module.description || "Sin descripción"}
                            </CardDescription>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.duration_minutes ? (module.duration_minutes / 60).toFixed(1) : 0}h
                              </span>
                              <span className="flex items-center gap-1">
                                <Map className="h-3 w-3" />
                                {module.concept_map_url ? "✓" : "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {module.objectives ? "✓" : "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessagesSquare className="h-3 w-3" />
                                {module.forum_enabled ? "✓" : "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
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
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => handleEditModule(module)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(module.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t bg-muted/20">
                      {/* Secciones del Módulo - Mismo diseño que Vista Previa */}
                      <div className="space-y-4 pt-4">
                        
                        {/* Chat de Sesión Inicial - Desplegable con botón de editar */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="chat-inicial" className="border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <div className="flex items-center justify-between pr-4">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline flex-1">
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
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditModule(module); }}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-3 bg-white dark:bg-background rounded-lg p-4 border">
                                <p className="text-sm text-muted-foreground">
                                  El día de comienzo del curso, a través de la herramienta de chat habilitada, el tutor/a-formador/a del módulo formativo informará de:
                                </p>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                  <li className="flex items-start gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Cuestiones generales relativas a la organización de la formación</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Presentación de tutores-formadores</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Exposición de objetivos que se persiguen alcanzar</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Actividades de aprendizaje y pruebas de evaluación a realizar</span>
                                  </li>
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Test de Conocimientos Previos - Desplegable */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="pre-assessment" className="border rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                            <div className="flex items-center justify-between pr-4">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white">
                                    <FileQuestion className="h-5 w-5" />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Test de Conocimientos Previos</h4>
                                    <p className="text-xs text-amber-600 dark:text-amber-300">Evaluación diagnóstica de competencias digitales y conocimientos del módulo</p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <AccordionContent className="px-4 pb-4">
                              <div className="bg-white dark:bg-background rounded-lg p-4 border text-center">
                                <p className="text-sm text-muted-foreground">
                                  Test de 20 preguntas para evaluar el nivel inicial del alumno
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Fila 1: Mapa Conceptual y Objetivos - Diseño rico */}
                        <div className="grid lg:grid-cols-2 gap-4">
                          {/* Mapa Conceptual con badges */}
                          <div className="bg-background rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <Layers className="h-4 w-4 text-primary" />
                                Mapa Conceptual
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {(() => {
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
                                  <a href={module.concept_map_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <Link2 className="h-3 w-3" />
                                    Ver mapa conceptual
                                  </a>
                                );
                              }
                              
                              if (conceptNodes.length === 0) {
                                return <p className="text-xs text-muted-foreground">Sin mapa conceptual configurado</p>;
                              }
                              
                              return (
                                <div className="space-y-3">
                                  <div className="flex justify-center">
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-lg font-semibold text-xs shadow">
                                      {conceptNodes.find(n => n.level === 0)?.label}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {conceptNodes.filter(n => n.level === 1).map((node, i) => (
                                      <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-xs font-medium border border-blue-200 dark:border-blue-800">
                                        {node.label}
                                      </span>
                                    ))}
                                  </div>
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

                          {/* Objetivos con checkmarks verdes */}
                          <div className="bg-background rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Objetivos
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
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
                                      <CheckSquare className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
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
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Foro del Módulo
                              </h4>
                              <Badge variant={module.forum_enabled ? "default" : "secondary"}>
                                {module.forum_enabled ? "Activo" : "Desactivado"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {module.forum_enabled 
                                ? "Los estudiantes pueden participar en discusiones" 
                                : "Foro desactivado para este módulo"}
                            </p>
                          </div>
                        </div>

                        {/* FORMACIÓN EN CAMPUS - Estilo SEPE Homologado */}
                        <div className="border-t pt-4">
                          <div className="bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm uppercase tracking-wide rounded-t-md flex items-center justify-between">
                            <span>FORMACIÓN EN CAMPUS</span>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => openAddUnitForModule(module.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Añadir Unidad
                            </Button>
                          </div>
                          
                          {moduleUnits.length === 0 ? (
                            <div className="text-sm text-muted-foreground bg-background rounded-b-lg p-4 border border-t-0 border-dashed text-center">
                              Sin unidades formativas en este módulo
                            </div>
                          ) : (
                            <div className="space-y-0">
                              {moduleUnits.map((unit, unitIndex) => (
                                <Accordion key={unit.id} type="single" collapsible>
                                  <AccordionItem value={unit.id} className="border-0">
                                    <div className="w-full flex items-center justify-between px-4 py-3 text-white font-medium text-sm bg-gradient-to-r from-primary to-primary/80">
                                      <AccordionTrigger className="hover:no-underline p-0 flex-1">
                                        <span className="text-left">
                                          {unit.title}
                                        </span>
                                      </AccordionTrigger>
                                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleEditUnit(unit)}>
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleDeleteUnit(unit.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <AccordionContent className="p-0">
                                      <div className="bg-white dark:bg-background border border-t-0 p-4 space-y-4">
                                        
                                        {/* Contenido Interactivo - Estilo SEPE */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-primary/10 rounded">
                                            <Layers className="h-5 w-5 text-primary" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                              <h5 className="font-semibold text-foreground">Contenido interactivo</h5>
                                              <div className="flex items-center gap-1">
                                                <Button 
                                                  size="sm" 
                                                  variant="ghost" 
                                                    className="h-7 text-xs gap-1"
                                                    onClick={() => {
                                                      setSyllabusUnitId(unit.id);
                                                      setSyllabusUnitTitle(unit.title);
                                                      setSyllabusEditorOpen(true);
                                                    }}
                                                  >
                                                    <Edit2 className="h-3 w-3" />
                                                    Editar Temario
                                                  </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="ghost" 
                                                  className="h-7 text-xs gap-1"
                                                >
                                                  <Plus className="h-3 w-3" />
                                                  Añadir
                                                </Button>
                                              </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                                                <Play className="h-3 w-3 text-red-500" />
                                                Temario Interactivo
                                              </Button>
                                              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                                                <Video className="h-3 w-3 text-purple-500" />
                                                Multimedia
                                              </Button>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Actividades de aprendizaje evaluables - Only for non-propio courses */}
                                        {course?.course_type !== 'propio' && (
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                                            <FileText className="h-5 w-5 text-amber-600" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                              <h5 className="font-semibold text-foreground">Actividades de aprendizaje evaluables</h5>
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-7 text-xs gap-1"
                                                onClick={() => openAddActivityForUnit(module.id, unit.id)}
                                              >
                                                <Plus className="h-3 w-3" />
                                                Añadir
                                              </Button>
                                            </div>
                                            {getUnitActivities(unit.id).length === 0 ? (
                                              <p className="text-xs text-muted-foreground">Sin actividades</p>
                                            ) : (
                                              <div className="space-y-1">
                                                {getUnitActivities(unit.id).map(activity => (
                                                  <div 
                                                    key={activity.id} 
                                                    className="flex items-center justify-between bg-muted/50 rounded p-2 text-xs"
                                                  >
                                                    <span className="font-medium">{activity.title}</span>
                                                    <div className="flex items-center gap-1">
                                                      <Badge variant="outline" className="text-[10px]">
                                                        Punt: {activity.max_score}
                                                      </Badge>
                                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditActivity(activity)}>
                                                        <Edit2 className="h-3 w-3" />
                                                      </Button>
                                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteActivity(activity.id)}>
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        )}

                                        {/* Tests de evaluación */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                                            <CheckSquare className="h-5 w-5 text-green-600" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                              <h5 className="font-semibold text-foreground">Tests de evaluación</h5>
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-7 text-xs gap-1"
                                                onClick={() => openAddEvaluationForUnit(module.id, unit.id)}
                                              >
                                                <Plus className="h-3 w-3" />
                                                Añadir
                                              </Button>
                                            </div>
                                            {getUnitEvaluations(unit.id).length === 0 ? (
                                              <p className="text-xs text-muted-foreground">Sin tests</p>
                                            ) : (
                                              <div className="space-y-1">
                                                {getUnitEvaluations(unit.id).map(evaluation => (
                                                  <div 
                                                    key={evaluation.id} 
                                                    className="flex items-center justify-between bg-muted/50 rounded p-2 text-xs"
                                                  >
                                                    <span className="font-medium">{evaluation.title}</span>
                                                    <div className="flex items-center gap-1">
                                                      <Badge variant="outline" className="text-[10px]">
                                                        Mín: {evaluation.passing_score}%
                                                      </Badge>
                                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditEvaluation(evaluation)}>
                                                        <Edit2 className="h-3 w-3" />
                                                      </Button>
                                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteEvaluation(evaluation.id)}>
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Manuales PDF para Descargas */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                                            <Download className="h-5 w-5 text-red-600" />
                                          </div>
                                          <div className="flex-1">
                                            <ModuleManualUploader 
                                              moduleId={module.id} 
                                              moduleTitle={module.title} 
                                            />
                                          </div>
                                        </div>

                                        {/* Foros */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                                            <MessagesSquare className="h-5 w-5 text-blue-600" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h5 className="font-semibold text-foreground">Foros</h5>
                                              <Badge variant={module.forum_enabled ? "default" : "secondary"} className="text-xs">
                                                {module.forum_enabled ? "Habilitado" : "Deshabilitado"}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* General Resources Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Recursos Generales del Curso
          </CardTitle>
          <CardDescription>
            Material complementario disponible para todo el curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Contenido SCORM</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Sube paquetes SCORM para contenido interactivo
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/scorm')}>
                  Gestionar SCORM
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Chat del Curso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  El chat está habilitado automáticamente para tutorías
                </p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Activo
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={evaluationDialogOpen} onOpenChange={(open) => {
        setEvaluationDialogOpen(open);
        if (!open) resetEvaluationForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvaluation ? "Editar Evaluación" : "Nueva Evaluación"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="eval-title">Título *</Label>
              <Input
                id="eval-title"
                value={evaluationForm.title}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, title: e.target.value })}
                placeholder="Ej: Examen Final - Módulo 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eval-description">Descripción</Label>
              <Textarea
                id="eval-description"
                value={evaluationForm.description}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, description: e.target.value })}
                placeholder="Instrucciones para el alumno..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eval-module">Módulo Asociado</Label>
              <Select 
                value={evaluationForm.module_id} 
                onValueChange={(value) => setEvaluationForm({ ...evaluationForm, module_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un módulo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin módulo específico</SelectItem>
                  {modules.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eval-passing">Nota Mínima (%)</Label>
                <Input
                  id="eval-passing"
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationForm.passing_score}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, passing_score: parseInt(e.target.value) || 50 })}
                />
                <p className="text-xs text-muted-foreground">SEPE: mínimo 50%</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eval-attempts">Intentos Máx.</Label>
                <Input
                  id="eval-attempts"
                  type="number"
                  min="1"
                  value={evaluationForm.max_attempts}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, max_attempts: parseInt(e.target.value) || 3 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eval-time">Tiempo (min)</Label>
                <Input
                  id="eval-time"
                  type="number"
                  value={evaluationForm.time_limit_minutes}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, time_limit_minutes: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="eval-active">Evaluación Activa</Label>
              <Switch
                id="eval-active"
                checked={evaluationForm.is_active}
                onCheckedChange={(checked) => setEvaluationForm({ ...evaluationForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvaluationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvaluation} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={(open) => {
        setActivityDialogOpen(open);
        if (!open) resetActivityForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Editar Actividad" : "Nueva Actividad"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="act-title">Título *</Label>
              <Input
                id="act-title"
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                placeholder="Ej: Práctica 1 - Análisis de caso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="act-description">Descripción</Label>
              <Textarea
                id="act-description"
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                placeholder="Describe brevemente la actividad..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="act-instructions">Instrucciones Detalladas</Label>
              <Textarea
                id="act-instructions"
                value={activityForm.instructions}
                onChange={(e) => setActivityForm({ ...activityForm, instructions: e.target.value })}
                placeholder="Instrucciones paso a paso para completar la actividad..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="act-module">Módulo Asociado</Label>
                <Select 
                  value={activityForm.module_id} 
                  onValueChange={(value) => setActivityForm({ ...activityForm, module_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin módulo específico</SelectItem>
                    {modules.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-type">Tipo de Entrega</Label>
                <Select 
                  value={activityForm.submission_type} 
                  onValueChange={(value) => setActivityForm({ ...activityForm, submission_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Archivo</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="url">Enlace URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="act-score">Puntuación Máxima</Label>
                <Input
                  id="act-score"
                  type="number"
                  value={activityForm.max_score}
                  onChange={(e) => setActivityForm({ ...activityForm, max_score: parseInt(e.target.value) || 100 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-due">Fecha Límite</Label>
                <Input
                  id="act-due"
                  type="datetime-local"
                  value={activityForm.due_date}
                  onChange={(e) => setActivityForm({ ...activityForm, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="act-active">Actividad Activa</Label>
              <Switch
                id="act-active"
                checked={activityForm.is_active}
                onCheckedChange={(checked) => setActivityForm({ ...activityForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveActivity} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formative Unit Dialog */}
      <Dialog open={unitDialogOpen} onOpenChange={(open) => {
        setUnitDialogOpen(open);
        if (!open) resetUnitForm();
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Editar Unidad Formativa" : "Nueva Unidad Formativa"}
            </DialogTitle>
            <DialogDescription>
              Define el contenido de esta unidad formativa dentro del módulo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-title">Título *</Label>
              <Input
                id="unit-title"
                value={unitForm.title}
                onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                placeholder="Ej: UF1 - Introducción al tema"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-description">Descripción</Label>
              <Textarea
                id="unit-description"
                value={unitForm.description}
                onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                placeholder="Descripción breve de la unidad..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-objectives">Objetivos</Label>
              <Textarea
                id="unit-objectives"
                value={unitForm.objectives}
                onChange={(e) => setUnitForm({ ...unitForm, objectives: e.target.value })}
                placeholder="Objetivos de aprendizaje..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-content">Contenido</Label>
              <Textarea
                id="unit-content"
                value={unitForm.content}
                onChange={(e) => setUnitForm({ ...unitForm, content: e.target.value })}
                placeholder="Contenido del temario..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="unit-start-date" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Fecha de Inicio
                </Label>
                <Input
                  id="unit-start-date"
                  type="date"
                  value={unitForm.start_date}
                  onChange={(e) => setUnitForm({ ...unitForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-end-date" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Fecha de Fin
                </Label>
                <Input
                  id="unit-end-date"
                  type="date"
                  value={unitForm.end_date}
                  onChange={(e) => setUnitForm({ ...unitForm, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit-duration">Duración (horas)</Label>
                <Input
                  id="unit-duration"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={unitForm.duration_hours}
                  onChange={(e) => setUnitForm({ ...unitForm, duration_hours: parseFloat(e.target.value) || 1 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="unit-active">Activa</Label>
                <Switch
                  id="unit-active"
                  checked={unitForm.is_active}
                  onCheckedChange={(checked) => setUnitForm({ ...unitForm, is_active: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUnit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Syllabus Editor Dialog */}
      <SyllabusEditor
        open={syllabusEditorOpen}
        onOpenChange={setSyllabusEditorOpen}
        unitId={syllabusUnitId}
        unitTitle={syllabusUnitTitle}
      />
    </div>
  );
}
