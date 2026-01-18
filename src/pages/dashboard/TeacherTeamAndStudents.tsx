import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Users, 
  FileText, 
  Download, 
  Mail,
  MessageSquare,
  MessagesSquare,
  UserCircle,
  Star,
  ClipboardList,
  BarChart3,
  Calendar,
  Video,
  BookOpen,
  Loader2,
  ExternalLink,
  Phone,
  Send,
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ReportItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
  starred?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  course?: string;
}

export default function TeacherTeamAndStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Get courses where this teacher is the tutor
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .eq("tutor_id", user!.id);

      setCourses(coursesData || []);

      if (coursesData && coursesData.length > 0) {
        const courseIds = coursesData.map(c => c.id);

        // Count students enrolled in these courses
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .in("course_id", courseIds);
        
        setStudentsCount(count || 0);

        // Get other teachers/tutors (admin users with teacher role)
        const { data: otherTeachers } = await supabase
          .from("user_roles")
          .select(`
            user_id,
            role,
            profiles!inner(
              id,
              full_name,
              phone
            )
          `)
          .eq("role", "teacher")
          .neq("user_id", user!.id)
          .limit(10);

        if (otherTeachers) {
          const members: TeamMember[] = otherTeachers.map((t: any) => ({
            id: t.user_id,
            name: t.profiles?.full_name || "Tutor",
            role: "Tutor-Formador",
            email: "Correo interno del campus",
            phone: t.profiles?.phone || undefined,
          }));
          setTeamMembers(members);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportStudentList = () => {
    toast({
      title: "Generando informe",
      description: "Descargando listado de alumnos...",
    });
    navigate("/dashboard/teacher/students");
  };

  const reports: ReportItem[] = [
    {
      id: "access",
      title: "Informe de accesos",
      icon: <ClipboardList className="h-5 w-5 text-amber-600" />,
      description: "Registro de accesos al campus por alumno",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "actions",
      title: "Informe de acciones formativas",
      icon: <FileText className="h-5 w-5 text-green-600" />,
      description: "Estado de las acciones formativas",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "students",
      title: "Informe de alumnos",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      description: "Listado completo de alumnos matriculados",
      action: () => handleExportStudentList(),
      starred: false,
    },
    {
      id: "forums",
      title: "Informe de foros",
      icon: <MessagesSquare className="h-5 w-5 text-purple-600" />,
      description: "Actividad en foros del campus",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "groups",
      title: "Informe de grupos",
      icon: <Users className="h-5 w-5 text-teal-600" />,
      description: "Listado de grupos formativos",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "mails",
      title: "Informe de mails",
      icon: <Mail className="h-5 w-5 text-red-600" />,
      description: "Comunicaciones por correo interno",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "popups",
      title: "Informe de mensajes emergentes",
      icon: <MessageSquare className="h-5 w-5 text-orange-600" />,
      description: "Alertas y notificaciones enviadas",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "modules",
      title: "Informe de módulos formativos",
      icon: <BookOpen className="h-5 w-5 text-indigo-600" />,
      description: "Estado de módulos por acción formativa",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "grades",
      title: "Informe de seguimiento (calificaciones)",
      icon: <BarChart3 className="h-5 w-5 text-green-700" />,
      description: "Calificaciones y progreso de alumnos",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "videoconference",
      title: "Informe de seguimiento de videoconferencias",
      icon: <Video className="h-5 w-5 text-blue-700" />,
      description: "Asistencia a sesiones en directo",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
    {
      id: "units",
      title: "Informe de unidades formativas",
      icon: <ClipboardList className="h-5 w-5 text-cyan-600" />,
      description: "Progreso por unidad formativa",
      action: () => navigate("/dashboard/teacher/reports"),
      starred: false,
    },
  ];

  const communicationMethods = [
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "Correo electrónico interno",
      description: "Mensajería del Campus Virtual para comunicación con alumnos y equipo docente.",
      action: "Acceder a Mensajería",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-secondary" />,
      title: "Chat del Campus Virtual",
      description: "Comunicación instantánea con alumnos conectados.",
      action: "Abrir Chat",
    },
    {
      icon: <MessagesSquare className="h-5 w-5 text-accent" />,
      title: "Foros del Campus Virtual",
      description: "Foro general de tutores-formadores y foros específicos por módulo formativo.",
      action: "Ver Foros",
    },
    {
      icon: <Send className="h-5 w-5 text-muted-foreground" />,
      title: "Correo electrónico externo",
      description: "Comunicación fuera del campus cuando sea necesario.",
      action: "Enviar Email",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Alumnos y Equipo Docente
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de participantes y coordinación del equipo formativo
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentsCount}</p>
                <p className="text-sm text-muted-foreground">Alumnos Matriculados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamMembers.length + 1}</p>
                <p className="text-sm text-muted-foreground">Equipo Docente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Cursos Asignados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants" className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="participants" className="gap-2">
            <Users className="h-4 w-4" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <UserCircle className="h-4 w-4" />
            Mis Contactos
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Informes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Listado de Participantes
              </CardTitle>
              <CardDescription>
                Obtén el listado de alumnos matriculados en tus módulos formativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-sm mb-3">
                  Puedes obtener una lista de los participantes en el módulo formativo que tutorizas a través de varias vías:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">a</span>
                    <div>
                      <p className="font-medium">Elaborar listado propio</p>
                      <p className="text-sm text-muted-foreground">
                        A través de <span className="font-semibold">ADMINISTRACIÓN → INFORMES → Informe de alumnos</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => navigate("/dashboard/teacher/students")} className="gap-2">
                  <Users className="h-4 w-4" />
                  Ver Listado de Alumnos
                </Button>
                <Button variant="outline" onClick={handleExportStudentList} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Listado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Mis Contactos
              </CardTitle>
              <CardDescription>
                Información del equipo docente y canales de comunicación disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Members */}
              {teamMembers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Equipo de Tutores-Formadores
                  </h4>
                  <div className="grid gap-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" title="Enviar mensaje">
                            <Mail className="h-4 w-4" />
                          </Button>
                          {member.phone && (
                            <Button variant="ghost" size="icon" title="Llamar">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication Methods */}
              <div className="space-y-3">
                <h4 className="font-semibold">Canales de Comunicación</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Podrás contactar con los alumnos y con el equipo de tutores-formadores a través de los siguientes medios:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {communicationMethods.map((method, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{method.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Forum Info */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <MessagesSquare className="h-4 w-4" />
                  Foros Disponibles
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Foro general para <strong>tutores-formadores</strong> de toda la acción formativa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Foro específico de tutores-formadores por cada <strong>módulo formativo</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                INFORMES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={report.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      {report.icon}
                      <span className="text-[#0891b2] hover:underline group-hover:underline font-medium">
                        {report.title}
                      </span>
                    </div>
                    <Star className={`h-5 w-5 ${report.starred ? 'text-amber-500 fill-amber-500' : 'text-amber-400'}`} />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p>
              <strong>Nota:</strong> Los informes se generan automáticamente basándose en los datos de seguimiento del campus virtual. 
              Para generar informes específicos del SEPE, accede a la sección de <strong>Informes SEPE</strong>.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
