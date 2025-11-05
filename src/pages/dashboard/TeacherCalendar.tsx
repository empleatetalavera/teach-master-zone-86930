import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Video, Plus, Loader2, Users, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Course {
  id: string;
  title: string;
}

interface CourseEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meeting_url: string | null;
  is_mandatory: boolean;
  course_id: string;
  courses: {
    title: string;
  };
}

export default function TeacherCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "class",
    course_id: "",
    start_time: "",
    end_time: "",
    location: "",
    meeting_url: "",
    is_mandatory: false,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load teacher's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("tutor_id", user!.id)
        .eq("is_active", true);

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Load upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from("course_events")
        .select(`
          *,
          courses(title)
        `)
        .in("course_id", coursesData?.map(c => c.id) || [])
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationsToStudents = async (eventId: string, courseId: string, eventTitle: string, startTime: string) => {
    try {
      // Get all students enrolled in the course
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("user_id")
        .eq("course_id", courseId);

      if (enrollmentsError) throw enrollmentsError;

      if (enrollments && enrollments.length > 0) {
        // Create notifications for each student
        const notifications = enrollments.map(enrollment => ({
          user_id: enrollment.user_id,
          type: "event_created",
          priority: "high",
          title: "Nuevo Evento en tu Curso",
          message: `Se ha creado el evento "${eventTitle}" para el ${format(new Date(startTime), "d 'de' MMMM 'a las' HH:mm", { locale: es })}`,
          related_course_id: courseId,
          metadata: {
            event_id: eventId,
            event_title: eventTitle,
            start_time: startTime,
          },
        }));

        const { error: notificationsError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notificationsError) throw notificationsError;

        return enrollments.length;
      }
      return 0;
    } catch (error) {
      console.error("Error sending notifications:", error);
      return 0;
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.course_id || !newEvent.start_time) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa título, curso y fecha de inicio",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("course_events")
        .insert({
          title: newEvent.title,
          description: newEvent.description || null,
          event_type: newEvent.event_type,
          course_id: newEvent.course_id,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time || null,
          location: newEvent.location || null,
          meeting_url: newEvent.meeting_url || null,
          is_mandatory: newEvent.is_mandatory,
          created_by: user!.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Send notifications to all enrolled students
      const notifiedStudents = await sendNotificationsToStudents(
        eventData.id,
        newEvent.course_id,
        newEvent.title,
        newEvent.start_time
      );

      toast({
        title: "Evento creado",
        description: `Evento creado correctamente. Se han enviado ${notifiedStudents} notificaciones a los alumnos.`,
      });

      // Reset form and reload data
      setNewEvent({
        title: "",
        description: "",
        event_type: "class",
        course_id: "",
        start_time: "",
        end_time: "",
        location: "",
        meeting_url: "",
        is_mandatory: false,
      });
      setIsDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      class: "Clase",
      exam: "Examen",
      tutoring: "Tutoría",
      workshop: "Taller",
      meeting: "Reunión",
      other: "Otro",
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      class: "bg-blue-500",
      exam: "bg-red-500",
      tutoring: "bg-green-500",
      workshop: "bg-purple-500",
      meeting: "bg-yellow-500",
      other: "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendario de Eventos</h1>
          <p className="text-muted-foreground">
            Gestiona clases, exámenes y eventos de tus cursos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
              <DialogDescription>
                Los alumnos matriculados recibirán una notificación automática
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course">Curso *</Label>
                <Select
                  value={newEvent.course_id}
                  onValueChange={(value) => setNewEvent({ ...newEvent, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título del Evento *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ej: Clase de introducción al módulo 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Tipo de Evento</Label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Clase</SelectItem>
                    <SelectItem value="exam">Examen</SelectItem>
                    <SelectItem value="tutoring">Tutoría</SelectItem>
                    <SelectItem value="workshop">Taller</SelectItem>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Fecha y Hora de Inicio *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Fecha y Hora de Fin</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Describe el evento..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación Física</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ej: Aula 101, Centro de Formación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_url">URL de Reunión Virtual</Label>
                <Input
                  id="meeting_url"
                  type="url"
                  value={newEvent.meeting_url}
                  onChange={(e) => setNewEvent({ ...newEvent, meeting_url: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_mandatory"
                  checked={newEvent.is_mandatory}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_mandatory: checked })}
                />
                <Label htmlFor="is_mandatory" className="cursor-pointer">
                  Evento obligatorio para los alumnos
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Crear y Notificar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos Eventos</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cursos Activos</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistema de Avisos</p>
                <p className="text-2xl font-bold">Auto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>
            Eventos programados en orden cronológico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay eventos programados
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Evento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-2 h-full ${getEventTypeColor(event.event_type)} rounded-full`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.courses.title}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge>{getEventTypeLabel(event.event_type)}</Badge>
                          {event.is_mandatory && (
                            <Badge variant="destructive">Obligatorio</Badge>
                          )}
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm mb-3">{event.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(event.start_time), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.meeting_url && (
                          <a
                            href={event.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Video className="h-4 w-4" />
                            <span>Unirse a la reunión</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
