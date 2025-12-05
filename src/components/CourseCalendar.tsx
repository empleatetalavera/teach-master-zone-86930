import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, ListChecks, ClipboardList, FileCheck } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, startOfWeek, endOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CourseEvent {
  id: string;
  title: string;
  type: 'module_start' | 'module_end' | 'unit_start' | 'unit_end' | 'activity_due' | 'evaluation_due';
  date: Date;
  moduleTitle?: string;
}

interface Module {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  duration_minutes: number | null;
  formative_units?: {
    id: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
  }[];
  activities?: {
    id: string;
    title: string;
    due_date: string | null;
  }[];
  evaluations?: {
    id: string;
    title: string;
  }[];
}

interface CourseCalendarProps {
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
    activities?: {
      id: string;
      title: string;
      due_date?: string | null;
    }[];
    evaluations?: {
      id: string;
      title: string;
    }[];
  }[];
  courseStartDate?: string | null;
  courseEndDate?: string | null;
}

export function CourseCalendar({ modules, courseStartDate, courseEndDate }: CourseCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Build events from modules
  const events = useMemo(() => {
    const allEvents: CourseEvent[] = [];

    modules.forEach(module => {
      if (module.start_date) {
        allEvents.push({
          id: `${module.id}-start`,
          title: `Inicio: ${module.title}`,
          type: 'module_start',
          date: new Date(module.start_date),
          moduleTitle: module.title
        });
      }
      if (module.end_date) {
        allEvents.push({
          id: `${module.id}-end`,
          title: `Fin: ${module.title}`,
          type: 'module_end',
          date: new Date(module.end_date),
          moduleTitle: module.title
        });
      }

      // Formative units
      module.formative_units?.forEach(unit => {
        if (unit.start_date) {
          allEvents.push({
            id: `${unit.id}-start`,
            title: `Inicio UF: ${unit.title}`,
            type: 'unit_start',
            date: new Date(unit.start_date),
            moduleTitle: module.title
          });
        }
        if (unit.end_date) {
          allEvents.push({
            id: `${unit.id}-end`,
            title: `Fin UF: ${unit.title}`,
            type: 'unit_end',
            date: new Date(unit.end_date),
            moduleTitle: module.title
          });
        }
      });

      // Activities due dates
      module.activities?.forEach(activity => {
        if (activity.due_date) {
          allEvents.push({
            id: `${activity.id}-due`,
            title: `Entrega: ${activity.title}`,
            type: 'activity_due',
            date: new Date(activity.due_date),
            moduleTitle: module.title
          });
        }
      });
    });

    return allEvents;
  }, [modules]);

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
      case 'module_start': return 'bg-green-500';
      case 'module_end': return 'bg-red-500';
      case 'unit_start': return 'bg-blue-500';
      case 'unit_end': return 'bg-blue-300';
      case 'activity_due': return 'bg-amber-500';
      case 'evaluation_due': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'module_start':
      case 'module_end':
        return <BookOpen className="h-3 w-3" />;
      case 'unit_start':
      case 'unit_end':
        return <ListChecks className="h-3 w-3" />;
      case 'activity_due':
        return <ClipboardList className="h-3 w-3" />;
      case 'evaluation_due':
        return <FileCheck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Calendario {format(currentMonth, 'yyyy', { locale: es })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Inicio módulo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Fin módulo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Unidad formativa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Entrega actividad</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Days */}
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
                        min-h-[60px] p-1 border rounded-lg text-center relative
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                        ${isToday ? 'border-primary bg-primary/10' : ''}
                        ${inCourseRange && isCurrentMonth ? 'bg-muted/50' : ''}
                        hover:bg-muted/80 transition-colors cursor-pointer
                      `}
                    >
                      <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {dayEvents.length > 0 && (
                    <TooltipContent side="top" className="max-w-[250px]">
                      <div className="space-y-1">
                        {dayEvents.map((event, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className={`p-1 rounded ${getEventColor(event.type)} text-white`}>
                              {getEventIcon(event.type)}
                            </div>
                            <span>{event.title}</span>
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

        {/* Upcoming Events */}
        {events.filter(e => e.date >= today).slice(0, 5).length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">Próximos eventos</h4>
            <div className="space-y-2">
              {events
                .filter(e => e.date >= today)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`p-1.5 rounded ${getEventColor(event.type)} text-white`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.date, "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}