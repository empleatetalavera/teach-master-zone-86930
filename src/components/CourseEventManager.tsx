import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Plus, Trash2, Edit, Save, X, Loader2, 
  ClipboardList, Users, GraduationCap, Video, MapPin, Link2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CourseEvent {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meeting_url: string | null;
  is_mandatory: boolean;
}

interface CourseEventManagerProps {
  courseId: string;
  onEventAdded?: () => void;
}

export function CourseEventManager({ courseId, onEventAdded }: CourseEventManagerProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CourseEvent | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'tutorial',
    start_time: '',
    end_time: '',
    location: '',
    meeting_url: '',
    is_mandatory: true
  });

  useEffect(() => {
    loadEvents();
  }, [courseId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_events')
        .select('*')
        .eq('course_id', courseId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'tutorial',
      start_time: '',
      end_time: '',
      location: '',
      meeting_url: '',
      is_mandatory: true
    });
    setEditingEvent(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.start_time) {
      toast.error('Por favor, introduce al menos un título y fecha');
      return;
    }

    try {
      setSaving(true);

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('course_events')
          .update({
            title: formData.title,
            description: formData.description || null,
            event_type: formData.event_type,
            start_time: formData.start_time,
            end_time: formData.end_time || null,
            location: formData.location || null,
            meeting_url: formData.meeting_url || null,
            is_mandatory: formData.is_mandatory
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Evento actualizado correctamente');
      } else {
        // Create new event
        const { error } = await supabase
          .from('course_events')
          .insert({
            course_id: courseId,
            created_by: user?.id,
            title: formData.title,
            description: formData.description || null,
            event_type: formData.event_type,
            start_time: formData.start_time,
            end_time: formData.end_time || null,
            location: formData.location || null,
            meeting_url: formData.meeting_url || null,
            is_mandatory: formData.is_mandatory
          });

        if (error) throw error;
        toast.success('Evento creado correctamente');
      }

      await loadEvents();
      resetForm();
      setShowAddDialog(false);
      onEventAdded?.();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Error al guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: CourseEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time?.slice(0, 16) || '',
      location: event.location || '',
      meeting_url: event.meeting_url || '',
      is_mandatory: event.is_mandatory
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const { error } = await supabase
        .from('course_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Evento eliminado');
      await loadEvents();
      onEventAdded?.();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error al eliminar el evento');
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tutorial': return <Users className="h-4 w-4" />;
      case 'exam': return <GraduationCap className="h-4 w-4" />;
      case 'live_session': return <Video className="h-4 w-4" />;
      case 'activity_deadline': return <ClipboardList className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'tutorial': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'exam': return 'bg-red-100 text-red-700 border-red-200';
      case 'live_session': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'activity_deadline': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'tutorial': return 'Tutoría Presencial';
      case 'exam': return 'Examen Presencial';
      case 'live_session': return 'Sesión en Directo';
      case 'activity_deadline': return 'Fecha de Entrega';
      default: return 'Evento';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Gestión del Calendario del Curso
            </CardTitle>
            <CardDescription>
              Configura fechas de entregas, tutorías presenciales y exámenes
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Añadir Fecha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Editar Evento' : 'Añadir Nueva Fecha'}
                </DialogTitle>
                <DialogDescription>
                  Configura los detalles del evento que aparecerá en el calendario del alumno
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo de Evento *</Label>
                  <Select 
                    value={formData.event_type} 
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutorial">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          Tutoría Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="exam">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-red-600" />
                          Examen Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="live_session">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-purple-600" />
                          Sesión en Directo
                        </div>
                      </SelectItem>
                      <SelectItem value="activity_deadline">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-amber-600" />
                          Fecha de Entrega
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Tutoría presencial - Módulo 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del evento..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha y Hora de Inicio *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha y Hora de Fin</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: C/ Marqués de Mirasol, 19 - Talavera"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL de Reunión Online</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={formData.meeting_url}
                      onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <Label className="font-medium">Asistencia Obligatoria</Label>
                  </div>
                  <Switch
                    checked={formData.is_mandatory}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      resetForm();
                      setShowAddDialog(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingEvent ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="font-medium text-muted-foreground">No hay eventos programados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Añade fechas de tutorías, exámenes y entregas para que los alumnos puedan consultarlas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${getEventColor(event.event_type)}`}
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{event.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {getEventLabel(event.event_type)}
                    </Badge>
                    {event.is_mandatory && (
                      <Badge variant="destructive" className="text-xs">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80">
                    {format(new Date(event.start_time), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                    {event.end_time && ` - ${format(new Date(event.end_time), 'HH:mm', { locale: es })}`}
                  </p>
                  {event.location && (
                    <p className="text-xs mt-1 flex items-center gap-1 opacity-70">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm mt-2 opacity-80">{event.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
