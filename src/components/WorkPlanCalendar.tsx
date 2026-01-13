import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, ListChecks, ClipboardList, FileCheck, Users, Video, GraduationCap, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, startOfWeek, endOfWeek, isPast, isToday as isTodayFn, isFuture } from "date-fns";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkPlanEvent {
  id: string;
  title: string;
  type: 'activity_due' | 'tutorial' | 'exam' | 'module_start' | 'module_end' | 'session';
  date: Date;
  description?: string;
  is_mandatory?: boolean;
  location?: string;
  meeting_url?: string;
}

interface WorkPlanCalendarProps {
  courseId: string;
  modules: {
    id: string;
    title: string;
    start_date?: string | null;
    end_date?: string | null;
    formative_units?: {
      id: string;
      title: string;
      start_date?: string | null;
      end_date?: string | null;
    }[];
  }[];
  courseStartDate?: string | null;
  courseEndDate?: string | null;
}

export function WorkPlanCalendar({ courseId, modules, courseStartDate, courseEndDate }: WorkPlanCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<WorkPlanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [courseId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load course events (tutorials, sessions, etc.)
      const { data: courseEvents } = await supabase
        .from('course_events')
        .select('*')
        .eq('course_id', courseId)
        .order('start_time', { ascending: true });

      // Load activities with due dates
      const { data: activities } = await supabase
        .from('development_activities')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .not('due_date', 'is', null);

      // Load evaluations
      const { data: evaluations } = await supabase
        .from('evaluations')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true);

      const allEvents: WorkPlanEvent[] = [];

      // Add module dates
      modules.forEach(module => {
        if (module.start_date) {
          allEvents.push({
            id: `module-start-${module.id}`,
            title: `Inicio: ${module.title}`,
            type: 'module_start',
            date: new Date(module.start_date),
            description: `Comienza el módulo ${module.title}`
          });
        }
        if (module.end_date) {
          allEvents.push({
            id: `module-end-${module.id}`,
            title: `Fin: ${module.title}`,
            type: 'module_end',
            date: new Date(module.end_date),
            description: `Finaliza el módulo ${module.title}`
          });
        }

        // Add formative unit dates
        module.formative_units?.forEach(unit => {
          if (unit.start_date) {
            allEvents.push({
              id: `unit-start-${unit.id}`,
              title: `Inicio UF: ${unit.title}`,
              type: 'module_start',
              date: new Date(unit.start_date),
              description: `Comienza la unidad formativa ${unit.title}`
            });
          }
          if (unit.end_date) {
            allEvents.push({
              id: `unit-end-${unit.id}`,
              title: `Fin UF: ${unit.title}`,
              type: 'module_end',
              date: new Date(unit.end_date),
              description: `Finaliza la unidad formativa ${unit.title}`
            });
          }
        });
      });

      // Add course events
      courseEvents?.forEach(event => {
        const eventType = event.event_type === 'tutorial' ? 'tutorial' 
          : event.event_type === 'live_session' ? 'session' 
          : event.event_type === 'exam' ? 'exam'
          : 'session';
        
        allEvents.push({
          id: event.id,
          title: event.title,
          type: eventType,
          date: new Date(event.start_time),
          description: event.description || undefined,
          is_mandatory: event.is_mandatory || false,
          location: event.location || undefined,
          meeting_url: event.meeting_url || undefined
        });
      });

      // Add activities
      activities?.forEach(activity => {
        if (activity.due_date) {
          allEvents.push({
            id: `activity-${activity.id}`,
            title: `Entrega: ${activity.title}`,
            type: 'activity_due',
            date: new Date(activity.due_date),
            description: activity.description,
            is_mandatory: true
          });
        }
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const isInCourseRange = (day: Date) => {
    if (!courseStartDate || !courseEndDate) return false;
    return isWithinInterval(day, { 
      start: new Date(courseStartDate), 
      end: new Date(courseEndDate) 
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'activity_due': return 'bg-amber-500';
      case 'tutorial': return 'bg-blue-500';
      case 'exam': return 'bg-red-500';
      case 'session': return 'bg-purple-500';
      case 'module_start': return 'bg-green-500';
      case 'module_end': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'activity_due': return <ClipboardList className="h-3 w-3" />;
      case 'tutorial': return <Users className="h-3 w-3" />;
      case 'exam': return <GraduationCap className="h-3 w-3" />;
      case 'session': return <Video className="h-3 w-3" />;
      case 'module_start': return <BookOpen className="h-3 w-3" />;
      case 'module_end': return <FileCheck className="h-3 w-3" />;
      default: return null;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'activity_due': return 'Entrega de actividad';
      case 'tutorial': return 'Tutoría presencial';
      case 'exam': return 'Examen presencial';
      case 'session': return 'Sesión en directo';
      case 'module_start': return 'Inicio módulo/UF';
      case 'module_end': return 'Fin módulo/UF';
      default: return 'Evento';
    }
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Group events by type for the list view
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const activityDueEvents = upcomingEvents.filter(e => e.type === 'activity_due');
  const tutorialEvents = upcomingEvents.filter(e => e.type === 'tutorial');
  const examEvents = upcomingEvents.filter(e => e.type === 'exam');

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Mi Agenda / Calendario del Curso
        </CardTitle>
        <CardDescription>
          Consulta las fechas importantes: entregas, tutorías presenciales y exámenes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Lista de Fechas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[150px] text-center capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Hoy
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span>Entregas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>Tutorías</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Exámenes</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <span>Sesiones</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Inicio módulo</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, today);
                const inCourseRange = isInCourseRange(day);

                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            min-h-[70px] p-1 border rounded-lg text-center relative
                            ${!isCurrentMonth ? 'opacity-40' : ''}
                            ${isToday ? 'border-primary border-2 bg-primary/10' : ''}
                            ${inCourseRange && isCurrentMonth && !isToday ? 'bg-muted/50' : ''}
                            hover:bg-muted/80 transition-colors cursor-pointer
                          `}
                        >
                          <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                            {format(day, 'd')}
                          </span>
                          
                          {/* Event indicators */}
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayEvents.slice(0, 4).map((event, i) => (
                                <div 
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                                />
                              ))}
                              {dayEvents.length > 4 && (
                                <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      {dayEvents.length > 0 && (
                        <TooltipContent side="top" className="max-w-[280px]">
                          <div className="space-y-2">
                            <p className="font-medium border-b pb-1">
                              {format(day, "d 'de' MMMM", { locale: es })}
                            </p>
                            {dayEvents.map((event, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <div className={`p-1 rounded ${getEventColor(event.type)} text-white shrink-0`}>
                                  {getEventIcon(event.type)}
                                </div>
                                <div>
                                  <p className="font-medium">{event.title}</p>
                                  {event.is_mandatory && (
                                    <Badge variant="destructive" className="text-[10px] py-0">Obligatorio</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Entregas de Actividades */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-amber-700">
                <ClipboardList className="h-5 w-5" />
                Fechas de Entrega de Trabajos
              </h4>
              <ScrollArea className="h-[200px]">
                {activityDueEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay entregas programadas</p>
                ) : (
                  <div className="space-y-2">
                    {activityDueEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-amber-50 border-amber-200"
                      >
                        <div className="p-2 rounded-full bg-amber-500 text-white">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                        </div>
                        {isPast(event.date) && !isTodayFn(event.date) && (
                          <Badge variant="destructive">Vencido</Badge>
                        )}
                        {isTodayFn(event.date) && (
                          <Badge className="bg-amber-500">Hoy</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Tutorías Presenciales */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                <Users className="h-5 w-5" />
                Fechas de Tutorías Presenciales
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Obligatorio</Badge>
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Las tutorías presenciales son obligatorias para la obtención del certificado
              </div>
              <ScrollArea className="h-[200px]">
                {tutorialEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay tutorías programadas</p>
                ) : (
                  <div className="space-y-2">
                    {tutorialEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50 border-blue-200"
                      >
                        <div className="p-2 rounded-full bg-blue-500 text-white">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-blue-600 mt-1">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Exámenes Presenciales */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-red-700">
                <GraduationCap className="h-5 w-5" />
                Fechas de Exámenes Presenciales
                <Badge className="bg-red-100 text-red-700 border-red-200">Obligatorio</Badge>
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Los exámenes presenciales son obligatorios para la certificación oficial
              </div>
              <ScrollArea className="h-[200px]">
                {examEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay exámenes programados</p>
                ) : (
                  <div className="space-y-2">
                    {examEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200"
                      >
                        <div className="p-2 rounded-full bg-red-500 text-white">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-red-600 mt-1">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
