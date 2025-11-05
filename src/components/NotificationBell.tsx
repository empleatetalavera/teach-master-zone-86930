import { useState, useEffect } from "react";
import { Bell, Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  related_user_id: string | null;
  related_course_id: string | null;
}

interface QuickResponseTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  template_type: string;
  usage_count: number;
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [quickResponseDialogOpen, setQuickResponseDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [templates, setTemplates] = useState<QuickResponseTemplate[]>([]);
  const [sendingResponse, setSendingResponse] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadQuickResponseTemplates();
      subscribeToNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const loadQuickResponseTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("quick_response_templates")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user!.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user!.id)
        .eq("is_read", false);

      loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "normal":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "grade_published":
        return "🎓";
      case "student_inactive":
        return "⚠️";
      case "low_performance":
        return "📊";
      default:
        return "🔔";
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === "student_inactive" || notification.type === "low_performance") {
      if (notification.related_user_id) {
        navigate(`/dashboard/teacher/students/${notification.related_user_id}`);
      }
    } else if (notification.type === "grade_published") {
      // Navigate to grades section in the course
      if (notification.related_course_id) {
        navigate(`/course/${notification.related_course_id}`);
        // Optionally open the grades tab
        setTimeout(() => {
          const gradesTab = document.querySelector('[value="grades"]') as HTMLElement;
          if (gradesTab) gradesTab.click();
        }, 500);
      }
    }

    setOpen(false);
  };

  const handleQuickResponse = (notification: Notification) => {
    setSelectedNotification(notification);
    setQuickResponseDialogOpen(true);
    setOpen(false);
  };

  const sendQuickResponse = async (template: QuickResponseTemplate) => {
    if (!selectedNotification?.related_user_id) return;

    setSendingResponse(true);
    try {
      // Get student and course information for variable replacement
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", selectedNotification.related_user_id)
        .single();

      let courseInfo = null;
      let enrollmentInfo = null;
      
      if (selectedNotification.related_course_id) {
        const { data: course } = await supabase
          .from("courses")
          .select("title")
          .eq("id", selectedNotification.related_course_id)
          .single();
        courseInfo = course;

        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("progress_percentage, last_accessed_at, enrolled_at")
          .eq("user_id", selectedNotification.related_user_id)
          .eq("course_id", selectedNotification.related_course_id)
          .single();
        enrollmentInfo = enrollment;
      }

      // Calculate days inactive
      const lastAccess = enrollmentInfo?.last_accessed_at 
        ? new Date(enrollmentInfo.last_accessed_at)
        : enrollmentInfo?.enrolled_at 
        ? new Date(enrollmentInfo.enrolled_at)
        : new Date();
      
      const daysInactive = Math.floor((new Date().getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24));

      // Replace variables in subject and message
      const variables = {
        nombre_estudiante: studentProfile?.full_name || "Estudiante",
        nombre_curso: courseInfo?.title || "el curso",
        progreso: enrollmentInfo?.progress_percentage?.toString() || "0",
        dias_inactivo: daysInactive.toString(),
        ultimo_acceso: lastAccess.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
        fecha_actual: new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
      };

      let processedSubject = template.subject;
      let processedMessage = template.message;

      // Process conditionals and replace variables
      const processTemplate = (text: string): string => {
        // First process conditionals
        const conditionalRegex = /\{if\s+(\w+)\s*(==|!=|<=|>=|<|>)\s*(\d+)\}([\s\S]*?)(?:\{else\}([\s\S]*?))?\{\/if\}/g;
        let result = text.replace(conditionalRegex, (match, variable, operator, value, ifContent, elseContent) => {
          const variableValue = parseFloat(variables[variable] || "0");
          const compareValue = parseFloat(value);
          
          let conditionMet = false;
          switch (operator) {
            case ">": conditionMet = variableValue > compareValue; break;
            case "<": conditionMet = variableValue < compareValue; break;
            case ">=": conditionMet = variableValue >= compareValue; break;
            case "<=": conditionMet = variableValue <= compareValue; break;
            case "==": conditionMet = variableValue === compareValue; break;
            case "!=": conditionMet = variableValue !== compareValue; break;
          }
          
          return conditionMet ? ifContent : (elseContent || "");
        });
        
        // Then replace simple variables
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\{${key}\\}`, "g");
          result = result.replace(regex, value);
        });
        
        return result;
      };

      processedSubject = processTemplate(template.subject);
      processedMessage = processTemplate(template.message);

      // Send message through communications table
      const { error: messageError } = await supabase.from("communications").insert({
        sender_id: user!.id,
        receiver_id: selectedNotification.related_user_id,
        communication_type: "direct_message" as const,
        subject: processedSubject,
        message: processedMessage,
        course_id: selectedNotification.related_course_id,
        metadata: {
          template_id: template.id,
          notification_id: selectedNotification.id,
          variables_used: variables,
        },
      } as any);

      if (messageError) throw messageError;

      // Update template usage count
      await supabase
        .from("quick_response_templates")
        .update({ usage_count: template.usage_count + 1 })
        .eq("id", template.id);

      // Mark notification as read
      await markAsRead(selectedNotification.id);

      toast({
        title: "Mensaje enviado",
        description: "El estudiante recibirá tu mensaje en su bandeja",
      });

      setQuickResponseDialogOpen(false);
      setSelectedNotification(null);
    } catch (error: any) {
      console.error("Error sending quick response:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setSendingResponse(false);
    }
  };

  const getRelevantTemplates = () => {
    if (!selectedNotification) return templates;
    
    // Filter templates by notification type
    const typeMapping: Record<string, string> = {
      student_inactive: "inactive",
      low_performance: "low_performance",
    };

    const relevantType = typeMapping[selectedNotification.type];
    const relevantTemplates = templates.filter(
      (t) => t.template_type === relevantType || t.template_type === "general"
    );

    return relevantTemplates.length > 0 ? relevantTemplates : templates;
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Marcar todo como leído
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !notification.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl" title={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${getPriorityColor(
                        notification.priority
                      )}`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                      
                      {/* Quick Actions for teacher notifications */}
                      {(notification.type === "student_inactive" || 
                        notification.type === "low_performance") && 
                        notification.related_user_id && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickResponse(notification);
                            }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Respuesta Rápida
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            Ver Detalle
                          </Button>
                        </div>
                      )}
                      
                      {/* Action button for grade notifications */}
                      {notification.type === "grade_published" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          Ver Calificación
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>

      {/* Quick Response Dialog */}
      <Dialog open={quickResponseDialogOpen} onOpenChange={setQuickResponseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar Respuesta Rápida</DialogTitle>
            <DialogDescription>
              Selecciona una plantilla de mensaje para enviar al estudiante. Las variables se reemplazarán automáticamente con datos reales.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedNotification && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start gap-2">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${getPriorityColor(selectedNotification.priority)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      {selectedNotification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {getRelevantTemplates().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay plantillas disponibles</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setQuickResponseDialogOpen(false);
                        navigate("/dashboard/teacher/quick-responses");
                      }}
                    >
                      Crear plantilla
                    </Button>
                  </div>
                ) : (
                  getRelevantTemplates().map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {template.template_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Usada {template.usage_count} veces
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={sendingResponse}
                          onClick={(e) => {
                            e.stopPropagation();
                            sendQuickResponse(template);
                          }}
                        >
                          {sendingResponse ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Enviar
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">
                            Asunto:
                          </p>
                          <p className="text-sm">{template.subject}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">
                            Mensaje:
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                            {template.message}
                          </p>
                        </div>
                      </div>
                      {template.message.includes("{") && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            ✨ Esta plantilla usa variables dinámicas que se reemplazarán automáticamente
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setQuickResponseDialogOpen(false);
                  navigate("/dashboard/teacher/quick-responses");
                }}
              >
                Gestionar Plantillas
              </Button>
              <Button
                variant="ghost"
                onClick={() => setQuickResponseDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
