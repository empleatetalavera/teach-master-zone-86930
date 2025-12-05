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
  Gamepad2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  objectives: string;
  specific_objectives: string[];
  course_type: string;
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
  
  // Dialog states
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
    forum_enabled: true
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
    is_active: true
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
            forum_enabled: moduleForm.forum_enabled
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
            forum_enabled: moduleForm.forum_enabled
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
      forum_enabled: module.forum_enabled ?? true
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
      forum_enabled: true
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
            is_active: unitForm.is_active
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
            order_index: moduleUnits.length + 1
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
      is_active: unit.is_active
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
      is_active: true
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
                      {/* Secciones del Módulo */}
                      <div className="space-y-4 pt-4">
                        
                        {/* Fila 1: Mapa Conceptual y Objetivos */}
                        <div className="grid lg:grid-cols-2 gap-4">
                          {/* Mapa Conceptual */}
                          <div className="bg-background rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <Map className="h-4 w-4 text-primary" />
                                Mapa Conceptual
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {module.concept_map_url ? (
                              <a 
                                href={module.concept_map_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Link2 className="h-3 w-3" />
                                Ver mapa conceptual
                              </a>
                            ) : (
                              <p className="text-xs text-muted-foreground">Sin mapa conceptual configurado</p>
                            )}
                          </div>

                          {/* Objetivos */}
                          <div className="bg-background rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <Target className="h-4 w-4 text-primary" />
                                Objetivos
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {module.objectives ? (
                              <p className="text-xs text-muted-foreground line-clamp-3">{module.objectives}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Sin objetivos definidos</p>
                            )}
                          </div>
                        </div>

                        {/* Fila 2: Temario y Foro */}
                        <div className="grid lg:grid-cols-2 gap-4">
                          {/* Temario / Contenido */}
                          <div className="bg-background rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Temario / Manual
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {module.content ? (
                              <p className="text-xs text-muted-foreground line-clamp-3">{module.content.substring(0, 150)}...</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Sin contenido de temario</p>
                            )}
                          </div>

                          {/* Foro */}
                          <div className="bg-background rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2 text-sm">
                                <MessagesSquare className="h-4 w-4 text-primary" />
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

                        {/* Unidades Formativas - Submenu desplegable */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <ListChecks className="h-4 w-4 text-primary" />
                              Unidades Formativas
                            </h4>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openAddUnitForModule(module.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Añadir Unidad
                            </Button>
                          </div>
                          
                          {getModuleUnits(module.id).length === 0 ? (
                            <div className="text-sm text-muted-foreground bg-background rounded-lg p-4 border border-dashed text-center">
                              Sin unidades formativas. Añade la primera unidad a este módulo.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {getModuleUnits(module.id).map((unit, unitIndex) => {
                                const isUnitExpanded = expandedUnits.includes(unit.id);
                                return (
                                  <Collapsible 
                                    key={unit.id} 
                                    open={isUnitExpanded} 
                                    onOpenChange={() => toggleUnit(unit.id)}
                                  >
                                    <div className={`bg-background rounded-lg border ${!unit.is_active ? 'opacity-60' : ''}`}>
                                      <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                          <div className="flex items-center gap-3">
                                            {isUnitExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="font-mono text-xs text-muted-foreground">{index + 1}.{unitIndex + 1}</span>
                                            <span className="font-medium text-sm">{unit.title}</span>
                                            {unit.duration_hours && (
                                              <Badge variant="outline" className="text-xs">
                                                {unit.duration_hours}h
                                              </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                              <span className="flex items-center gap-1">
                                                <CheckSquare className="h-3 w-3" />
                                                {getUnitEvaluations(unit.id).length}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {getUnitActivities(unit.id).length}
                                              </span>
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditUnit(unit)}>
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteUnit(unit.id)}>
                                              <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="px-3 pb-3 pt-0 space-y-3 border-t bg-muted/10">
                                          {/* Info de la UF */}
                                          {(unit.objectives || unit.description || unit.content) && (
                                            <div className="pt-2 space-y-2">
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
                                              {unit.content && (
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">Contenido:</p>
                                                  <p className="text-xs line-clamp-3">{unit.content.substring(0, 200)}...</p>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Contenido Interactivo de la UF */}
                                          <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium flex items-center gap-1.5">
                                                <Gamepad2 className="h-3 w-3 text-primary" />
                                                Contenido Interactivo
                                              </span>
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-6 text-xs"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Añadir
                                              </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              {/* Video */}
                                              <div className="bg-background rounded p-2 border">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                  <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
                                                    <Play className="h-3 w-3 text-red-600" />
                                                  </div>
                                                  <span className="text-xs font-medium">Video</span>
                                                </div>
                                                <Progress value={0} className="h-1.5" />
                                                <p className="text-[10px] text-muted-foreground mt-1">Sin contenido</p>
                                              </div>
                                              
                                              {/* Presentación */}
                                              <div className="bg-background rounded p-2 border">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                  <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                                                    <Presentation className="h-3 w-3 text-orange-600" />
                                                  </div>
                                                  <span className="text-xs font-medium">Presentación</span>
                                                </div>
                                                <Progress value={0} className="h-1.5" />
                                                <p className="text-[10px] text-muted-foreground mt-1">Sin contenido</p>
                                              </div>
                                              
                                              {/* Audio */}
                                              <div className="bg-background rounded p-2 border">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                                                    <Headphones className="h-3 w-3 text-purple-600" />
                                                  </div>
                                                  <span className="text-xs font-medium">Audio</span>
                                                </div>
                                                <Progress value={0} className="h-1.5" />
                                                <p className="text-[10px] text-muted-foreground mt-1">Sin contenido</p>
                                              </div>
                                              
                                              {/* Documento */}
                                              <div className="bg-background rounded p-2 border">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                                                    <FileText className="h-3 w-3 text-blue-600" />
                                                  </div>
                                                  <span className="text-xs font-medium">Documento</span>
                                                </div>
                                                <Progress value={0} className="h-1.5" />
                                                <p className="text-[10px] text-muted-foreground mt-1">Sin contenido</p>
                                              </div>
                                              
                                              {/* SCORM */}
                                              <div className="bg-background rounded p-2 border">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                                                    <Code className="h-3 w-3 text-green-600" />
                                                  </div>
                                                  <span className="text-xs font-medium">SCORM</span>
                                                </div>
                                                <Progress value={0} className="h-1.5" />
                                                <p className="text-[10px] text-muted-foreground mt-1">Sin contenido</p>
                                              </div>
                                              
                                              {/* Ejercicio */}
                                              <div className="bg-background rounded p-2 border">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                  <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                                                    <FileQuestion className="h-3 w-3 text-amber-600" />
                                                  </div>
                                                  <span className="text-xs font-medium">Ejercicio</span>
                                                </div>
                                                <Progress value={0} className="h-1.5" />
                                                <p className="text-[10px] text-muted-foreground mt-1">Sin contenido</p>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Tests de la UF */}
                                          <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium flex items-center gap-1.5">
                                                <CheckSquare className="h-3 w-3 text-primary" />
                                                Tests ({getUnitEvaluations(unit.id).length})
                                              </span>
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => openAddEvaluationForUnit(module.id, unit.id)}
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
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
                                                    className={`flex items-center justify-between bg-background rounded p-2 border text-xs ${!evaluation.is_active ? 'opacity-60' : ''}`}
                                                  >
                                                    <div>
                                                      <span className="font-medium">{evaluation.title}</span>
                                                      <span className="text-muted-foreground ml-2">
                                                        Mín: {evaluation.passing_score}%
                                                      </span>
                                                    </div>
                                                    <div className="flex gap-1">
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

                                          {/* Actividades de la UF */}
                                          <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium flex items-center gap-1.5">
                                                <FileText className="h-3 w-3 text-primary" />
                                                Actividades ({getUnitActivities(unit.id).length})
                                              </span>
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => openAddActivityForUnit(module.id, unit.id)}
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
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
                                                    className={`flex items-center justify-between bg-background rounded p-2 border text-xs ${!activity.is_active ? 'opacity-60' : ''}`}
                                                  >
                                                    <div>
                                                      <span className="font-medium">{activity.title}</span>
                                                      <span className="text-muted-foreground ml-2">
                                                        Punt: {activity.max_score}
                                                      </span>
                                                    </div>
                                                    <div className="flex gap-1">
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
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Recursos del Módulo */}
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <File className="h-4 w-4 text-primary" />
                              Recursos y Material
                            </h4>
                            <Button variant="outline" size="sm">
                              <Upload className="h-3 w-3 mr-1" />
                              Subir
                            </Button>
                          </div>
                          <div className="bg-background rounded-lg p-4 border border-dashed text-center text-sm text-muted-foreground">
                            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            Arrastra archivos aquí o haz clic en "Subir"
                          </div>
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
    </div>
  );
}
