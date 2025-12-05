import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, Plus, Loader2, Trash2, X, Calendar, FileText
} from "lucide-react";

interface UnitActivityManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  courseId: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  max_score: number | null;
  due_date: string | null;
  submission_type: string | null;
  is_active: boolean;
}

export function UnitActivityManager({ 
  open, 
  onOpenChange, 
  unitId, 
  unitTitle,
  courseId
}: UnitActivityManagerProps) {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [newDueDate, setNewDueDate] = useState("");
  const [newSubmissionType, setNewSubmissionType] = useState("text");
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);

  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    if (open && unitId) {
      loadActivities();
    }
  }, [open, unitId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("development_activities")
        .select("*")
        .eq("formative_unit_id", unitId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error("Error loading activities:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast({
        title: "Error",
        description: "El título y la descripción son obligatorios",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("development_activities")
        .insert({
          course_id: courseId,
          formative_unit_id: unitId,
          title: newTitle,
          description: newDescription,
          instructions: newInstructions || null,
          max_score: newMaxScore ? parseInt(newMaxScore) : 100,
          due_date: newDueDate || null,
          submission_type: newSubmissionType,
          allow_late_submission: allowLateSubmission,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Actividad creada",
        description: "La actividad ha sido añadida correctamente",
      });

      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewInstructions("");
      setNewMaxScore("100");
      setNewDueDate("");
      setNewSubmissionType("text");
      setAllowLateSubmission(false);
      setShowAddForm(false);
      
      loadActivities();
    } catch (error: any) {
      console.error("Error adding activity:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la actividad",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("development_activities")
        .update({ is_active: false })
        .eq("id", activityId);

      if (error) throw error;

      toast({
        title: "Actividad eliminada",
        description: "La actividad ha sido eliminada",
      });

      loadActivities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive"
      });
    }
  };

  const renderAddForm = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Nueva Actividad</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid gap-4">
        <div>
          <Label htmlFor="activity-title">Título *</Label>
          <Input
            id="activity-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej: Caso práctico - Gestión documental"
          />
        </div>
        
        <div>
          <Label htmlFor="activity-description">Descripción *</Label>
          <Textarea
            id="activity-description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Describe brevemente la actividad"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="activity-instructions">Instrucciones</Label>
          <Textarea
            id="activity-instructions"
            value={newInstructions}
            onChange={(e) => setNewInstructions(e.target.value)}
            placeholder="Instrucciones detalladas para el alumno..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="activity-score">Puntuación máxima</Label>
            <Input
              id="activity-score"
              type="number"
              value={newMaxScore}
              onChange={(e) => setNewMaxScore(e.target.value)}
              placeholder="100"
            />
          </div>
          
          <div>
            <Label htmlFor="activity-due-date">Fecha límite</Label>
            <Input
              id="activity-due-date"
              type="datetime-local"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="submission-type">Tipo de entrega</Label>
          <Select value={newSubmissionType} onValueChange={setNewSubmissionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="file">Archivo</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="mixed">Mixto (texto + archivo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="allow-late"
            checked={allowLateSubmission}
            onCheckedChange={setAllowLateSubmission}
          />
          <Label htmlFor="allow-late">Permitir entregas tardías</Label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleAddActivity} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Crear Actividad
          </Button>
          <Button variant="outline" onClick={() => setShowAddForm(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            Actividades - {unitTitle}
          </DialogTitle>
          <DialogDescription>
            Gestiona las actividades de desarrollo de esta unidad formativa
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add button for teachers/admins */}
            {isTeacherOrAdmin && !showAddForm && (
              <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Actividad
              </Button>
            )}

            {/* Add form */}
            {showAddForm && renderAddForm()}

            {/* Activities list */}
            {activities.length === 0 && !showAddForm ? (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                <p className="text-lg font-medium mb-2">No hay actividades</p>
                <p className="text-sm text-muted-foreground">
                  {isTeacherOrAdmin 
                    ? "Añade actividades usando el botón de arriba"
                    : "El tutor aún no ha añadido actividades a esta unidad"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {activity.max_score && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {activity.max_score} pts
                            </span>
                          )}
                          {activity.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(activity.due_date).toLocaleDateString("es-ES")}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {activity.submission_type === 'text' && 'Texto'}
                            {activity.submission_type === 'file' && 'Archivo'}
                            {activity.submission_type === 'url' && 'URL'}
                            {activity.submission_type === 'mixed' && 'Mixto'}
                          </Badge>
                        </div>
                      </div>
                      
                      {isTeacherOrAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteActivity(activity.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}