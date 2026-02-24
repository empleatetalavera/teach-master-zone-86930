import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, BookOpen, ListChecks, ChevronDown, ChevronRight, FileText, Users, Video } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FormativeUnit {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  duration_hours: number | null;
}

interface Module {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  duration_minutes: number | null;
  formative_units?: FormativeUnit[];
}

interface CourseEvent {
  id: string;
  title: string;
  start_time: string;
  end_time?: string | null;
  event_type: string;
  location?: string | null;
  meeting_url?: string | null;
}

interface Evaluation {
  id: string;
  title: string;
  time_limit_minutes?: number | null;
  formative_unit_id?: string | null;
  module_id?: string | null;
}

interface CourseScheduleProps {
  courseTitle: string;
  courseStartDate?: string | null;
  courseEndDate?: string | null;
  modules: {
    id: string;
    title: string;
    start_date?: string | null;
    end_date?: string | null;
    duration_minutes?: number | null;
    formative_units?: {
      id: string;
      title: string;
      start_date?: string | null;
      end_date?: string | null;
      duration_hours?: number | null;
    }[];
  }[];
  events?: CourseEvent[];
  exams?: Evaluation[];
}

export function CourseSchedule({ courseTitle, courseStartDate, courseEndDate, modules, events = [], exams = [] }: CourseScheduleProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const today = new Date();

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial':
        return <Users className="h-4 w-4" />;
      case 'live_session':
      case 'webinar':
        return <Video className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'tutorial':
        return 'Tutoría';
      case 'live_session':
        return 'Sesión en Vivo';
      case 'webinar':
        return 'Webinar';
      case 'exam':
        return 'Examen';
      default:
        return 'Evento';
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getStatus = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return 'pending';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (isBefore(today, start)) return 'upcoming';
    if (end && isAfter(today, end)) return 'completed';
    if (end && isWithinInterval(today, { start, end })) return 'active';
    if (!end && isAfter(today, start)) return 'active';
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">En curso</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completado</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Próximo</Badge>;
      default:
        return <Badge variant="outline">Sin programar</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const days = differenceInDays(end, today);
    if (days < 0) return null;
    return days;
  };

  const getProgressPercent = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = differenceInDays(end, start);
    const elapsed = differenceInDays(today, start);
    if (elapsed < 0) return 0;
    if (elapsed > total) return 100;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Cronograma de la Acción Formativa
        </CardTitle>
        {courseStartDate && courseEndDate && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>
              <strong>Inicio:</strong> {format(new Date(courseStartDate), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
            <span>—</span>
            <span>
              <strong>Fin:</strong> {format(new Date(courseEndDate), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Timeline */}
        {courseStartDate && courseEndDate && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progreso del curso</span>
              <span className="font-medium">{getProgressPercent(courseStartDate, courseEndDate)}%</span>
            </div>
            <Progress value={getProgressPercent(courseStartDate, courseEndDate)} className="h-2" />
            {getDaysRemaining(courseEndDate) !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                {getDaysRemaining(courseEndDate)} días restantes
              </p>
            )}
          </div>
        )}

        {/* Modules Timeline */}
        <div className="space-y-3">
          {modules.map((module, index) => {
            const status = getStatus(module.start_date, module.end_date);
            const isExpanded = expandedModules.includes(module.id);
            
            return (
              <Collapsible key={module.id} open={isExpanded} onOpenChange={() => toggleModule(module.id)}>
                <div className={`border rounded-lg ${status === 'active' ? 'border-primary bg-primary/5' : ''}`}>
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          status === 'active' ? 'bg-primary text-primary-foreground' :
                          status === 'completed' ? 'bg-green-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        {index < modules.length - 1 && (
                          <div className={`w-0.5 h-4 mt-1 ${
                            status === 'completed' ? 'bg-green-500' : 'bg-muted'
                          }`} />
                        )}
                      </div>

                      {/* Module info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="font-medium break-words line-clamp-2">{module.title}</span>
                          <span className="shrink-0">{getStatusBadge(status)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {module.start_date && (
                            <span>
                              Inicio: {format(new Date(module.start_date), "d MMM", { locale: es })}
                            </span>
                          )}
                          {module.end_date && (
                            <span>
                              Fin: {format(new Date(module.end_date), "d MMM", { locale: es })}
                            </span>
                          )}
                          {module.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round(module.duration_minutes / 60)}h
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand icon */}
                      {module.formative_units && module.formative_units.length > 0 && (
                        <div className="text-muted-foreground">
                          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                      )}
                    </div>
                  </CollapsibleTrigger>

                  {/* Formative Units */}
                  <CollapsibleContent>
                    {module.formative_units && module.formative_units.length > 0 && (
                      <div className="px-4 pb-4 pl-16 space-y-2">
                        {module.formative_units.map((unit, unitIndex) => {
                          const unitStatus = getStatus(unit.start_date, unit.end_date);
                          return (
                            <div 
                              key={unit.id}
                              className={`p-3 rounded-lg border ${
                                unitStatus === 'active' ? 'border-primary/50 bg-primary/5' : 'bg-muted/30'
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-1">
                                <ListChecks className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-sm font-medium break-words line-clamp-2">UF{unitIndex + 1}: {unit.title}</span>
                                <span className="shrink-0">{getStatusBadge(unitStatus)}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground ml-5">
                                {unit.start_date && (
                                  <span>Inicio: {format(new Date(unit.start_date), "d MMM", { locale: es })}</span>
                                )}
                                {unit.end_date && (
                                  <span>Fin: {format(new Date(unit.end_date), "d MMM", { locale: es })}</span>
                                )}
                                {unit.duration_hours && (
                                  <span>{unit.duration_hours}h</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay módulos programados</p>
          </div>
        )}

        {/* Events & Tutorials Section */}
        {events.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Tutorías y Sesiones
            </h4>
            <div className="space-y-2">
              {events.map((event) => {
                const eventDate = new Date(event.start_time);
                const isPast = isBefore(eventDate, today);
                const isToday = format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                
                return (
                  <div 
                    key={event.id}
                    className={`p-3 rounded-lg border flex items-center gap-3 ${
                      isToday ? 'border-primary bg-primary/5' : 
                      isPast ? 'bg-muted/30 opacity-60' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isToday ? 'bg-primary text-primary-foreground' :
                      isPast ? 'bg-muted' : 'bg-secondary/20'
                    }`}>
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge variant={isToday ? 'default' : isPast ? 'secondary' : 'outline'} className="text-xs">
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(eventDate, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                        {event.location && <span className="ml-2">📍 {event.location}</span>}
                      </div>
                    </div>
                    {event.meeting_url && !isPast && (
                      <a 
                        href={event.meeting_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Unirse
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exams Section */}
        {exams.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Evaluaciones Programadas
            </h4>
            <div className="space-y-2">
              {exams.map((exam) => (
                <div 
                  key={exam.id}
                  className="p-3 rounded-lg border flex items-center gap-3 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                >
                  <div className="p-2 rounded-full bg-orange-500/20">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{exam.title}</span>
                    {exam.time_limit_minutes && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {exam.time_limit_minutes} minutos
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="border-orange-300 text-orange-700 dark:text-orange-400">
                    Examen
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}