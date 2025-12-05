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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  ListChecks,
  Video,
  File,
  Settings,
  Eye
} from "lucide-react";

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
}

interface Evaluation {
  id: string;
  title: string;
  description: string;
  module_id: string | null;
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
  submission_type: string;
  max_score: number;
  due_date: string | null;
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
  
  // Dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    content: "",
    duration_minutes: 60,
    is_active: true
  });

  const [evaluationForm, setEvaluationForm] = useState({
    title: "",
    description: "",
    module_id: "",
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
    submission_type: "file",
    max_score: 100,
    due_date: "",
    is_active: true
  });

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      // Load course
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

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Load evaluations
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at");

      if (evaluationsError) throw evaluationsError;
      setEvaluations(evaluationsData || []);

      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("development_activities")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at");

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

    } catch (error: any) {
      console.error("Error loading course:", error);
      toast.error("Error al cargar el curso");
    } finally {
      setLoading(false);
    }
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
            duration_minutes: moduleForm.duration_minutes,
            is_active: moduleForm.is_active
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
            duration_minutes: moduleForm.duration_minutes,
            is_active: moduleForm.is_active,
            order_index: modules.length + 1
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
      duration_minutes: module.duration_minutes || 60,
      is_active: module.is_active
    });
    setModuleDialogOpen(true);
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleForm({
      title: "",
      description: "",
      content: "",
      duration_minutes: 60,
      is_active: true
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
      passing_score: evaluation.passing_score,
      max_attempts: evaluation.max_attempts || 3,
      time_limit_minutes: evaluation.time_limit_minutes || 60,
      is_active: evaluation.is_active
    });
    setEvaluationDialogOpen(true);
  };

  const resetEvaluationForm = () => {
    setEditingEvaluation(null);
    setEvaluationForm({
      title: "",
      description: "",
      module_id: "",
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
      submission_type: activity.submission_type || "file",
      max_score: activity.max_score || 100,
      due_date: activity.due_date || "",
      is_active: activity.is_active
    });
    setActivityDialogOpen(true);
  };

  const resetActivityForm = () => {
    setEditingActivity(null);
    setActivityForm({
      title: "",
      description: "",
      instructions: "",
      module_id: "",
      submission_type: "file",
      max_score: 100,
      due_date: "",
      is_active: true
    });
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

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Módulos ({modules.length})
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Evaluaciones ({evaluations.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Actividades ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            Recursos
          </TabsTrigger>
        </TabsList>

        {/* MÓDULOS */}
        <TabsContent value="modules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Unidades Formativas / Módulos</h2>
              <p className="text-sm text-muted-foreground">
                Organiza el contenido del curso en módulos o unidades formativas
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
                    <Label htmlFor="module-content">Contenido del Módulo</Label>
                    <Textarea
                      id="module-content"
                      value={moduleForm.content}
                      onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                      placeholder="Contenido formativo, texto, HTML..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="module-duration">Duración (minutos)</Label>
                      <Input
                        id="module-duration"
                        type="number"
                        value={moduleForm.duration_minutes}
                        onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: parseInt(e.target.value) || 60 })}
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
              {modules.map((module, index) => (
                <Card key={module.id} className={!module.is_active ? 'opacity-60' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-5 w-5 cursor-move" />
                        <span className="font-mono text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{module.title}</h3>
                          {!module.is_active && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description || "Sin descripción"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {module.duration_minutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            {evaluations.filter(e => e.module_id === module.id).length} evaluaciones
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {activities.filter(a => a.module_id === module.id).length} actividades
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditModule(module)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(module.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* EVALUACIONES */}
        <TabsContent value="evaluations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Evaluaciones y Tests</h2>
              <p className="text-sm text-muted-foreground">
                Crea exámenes y pruebas para evaluar el aprendizaje (mínimo 50% para aprobar según SEPE)
              </p>
            </div>
            <Dialog open={evaluationDialogOpen} onOpenChange={(open) => {
              setEvaluationDialogOpen(open);
              if (!open) resetEvaluationForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Evaluación
                </Button>
              </DialogTrigger>
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
          </div>

          {evaluations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">Sin evaluaciones</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Añade exámenes y tests para evaluar a los alumnos
                </p>
                <Button onClick={() => setEvaluationDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primera Evaluación
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {evaluations.map((evaluation) => (
                <Card key={evaluation.id} className={!evaluation.is_active ? 'opacity-60' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{evaluation.title}</h3>
                          {!evaluation.is_active && <Badge variant="secondary">Inactivo</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {evaluation.description || "Sin descripción"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Nota mínima: {evaluation.passing_score}%</span>
                          <span>Intentos: {evaluation.max_attempts}</span>
                          {evaluation.time_limit_minutes && (
                            <span>Tiempo: {evaluation.time_limit_minutes} min</span>
                          )}
                          {evaluation.module_id && (
                            <Badge variant="outline" className="text-xs">
                              {modules.find(m => m.id === evaluation.module_id)?.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditEvaluation(evaluation)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvaluation(evaluation.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ACTIVIDADES */}
        <TabsContent value="activities" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Actividades de Desarrollo</h2>
              <p className="text-sm text-muted-foreground">
                Tareas y ejercicios prácticos que los alumnos deben entregar
              </p>
            </div>
            <Dialog open={activityDialogOpen} onOpenChange={(open) => {
              setActivityDialogOpen(open);
              if (!open) resetActivityForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Actividad
                </Button>
              </DialogTrigger>
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
          </div>

          {activities.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">Sin actividades</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Añade tareas prácticas para los alumnos
                </p>
                <Button onClick={() => setActivityDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primera Actividad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <Card key={activity.id} className={!activity.is_active ? 'opacity-60' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{activity.title}</h3>
                          {!activity.is_active && <Badge variant="secondary">Inactivo</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description || "Sin descripción"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Puntuación: {activity.max_score}</span>
                          <span>Entrega: {activity.submission_type === 'file' ? 'Archivo' : activity.submission_type === 'text' ? 'Texto' : 'URL'}</span>
                          {activity.due_date && (
                            <span>Límite: {new Date(activity.due_date).toLocaleDateString('es-ES')}</span>
                          )}
                          {activity.module_id && (
                            <Badge variant="outline" className="text-xs">
                              {modules.find(m => m.id === activity.module_id)?.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditActivity(activity)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteActivity(activity.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RECURSOS */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recursos y Material Complementario</CardTitle>
              <CardDescription>
                Sube archivos, vídeos y material de apoyo para los alumnos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">Subir Recursos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivos
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, Word, PowerPoint, vídeos (máx. 100MB)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
