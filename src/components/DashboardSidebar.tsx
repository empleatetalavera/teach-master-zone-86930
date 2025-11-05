import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  BarChart, 
  FileText,
  Calendar,
  MessageSquare,
  Award,
  LogOut,
  GraduationCap,
  UserCircle,
  BookMarked,
  ClipboardList,
  Video,
  Building2,
  Key,
  Package,
  User,
  Activity,
  Headphones,
  Bell
} from "lucide-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const adminItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Trazabilidad SEPE", url: "/dashboard/admin/traceability", icon: Activity },
  { title: "Centros", url: "/dashboard/admin/centers", icon: Building2 },
  { title: "Licencias", url: "/dashboard/admin/licenses", icon: Key },
  { title: "Pedidos", url: "/dashboard/admin/orders", icon: Package },
  { title: "Análisis AI", url: "/dashboard/admin/ai-analytics", icon: MessageSquare },
  { title: "Usuarios", url: "/dashboard/admin/users", icon: Users },
  { title: "Atención al Alumno", url: "/dashboard/admin/support", icon: Headphones },
  { title: "Certificados", url: "/dashboard/admin/courses", icon: BookOpen },
  { title: "Configurar Cursos", url: "/dashboard/admin/course-settings", icon: Settings },
  { title: "Informes", url: "/dashboard/admin/reports", icon: BarChart },
  { title: "Personalización", url: "/dashboard/admin/settings", icon: GraduationCap },
];

const teacherItems = [
  { title: "Dashboard", url: "/dashboard/teacher", icon: LayoutDashboard },
  { title: "Mis Cursos", url: "/dashboard/teacher/courses", icon: BookOpen },
  { title: "Configurar Cursos", url: "/dashboard/teacher/course-settings", icon: Settings },
  { title: "Mi Perfil Docente", url: "/dashboard/teacher/profile", icon: UserCircle },
  { title: "Alumnos", url: "/dashboard/teacher/students", icon: Users },
  { title: "Informes", url: "/dashboard/teacher/reports", icon: BarChart },
  { title: "Alertas", url: "/dashboard/teacher/alerts", icon: Bell },
  { title: "Respuestas Rápidas", url: "/dashboard/teacher/quick-responses", icon: MessageSquare },
  { title: "Atención al Alumno", url: "/dashboard/teacher/support", icon: Headphones },
  { title: "Evaluaciones", url: "/dashboard/teacher/evaluations", icon: ClipboardList },
  { title: "Calendario", url: "/dashboard/teacher/calendar", icon: Calendar },
];

const studentItems = [
  { title: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
  { title: "Mis Cursos", url: "/dashboard/student/courses", icon: BookMarked },
  { title: "Aula Virtual", url: "/dashboard/student/classroom", icon: Video },
  { title: "Evaluaciones", url: "/dashboard/student/evaluations", icon: FileText },
  { title: "Certificados", url: "/dashboard/student/certificates", icon: Award },
  { title: "Atención", url: "/dashboard/student/support", icon: Headphones },
  { title: "Mensajes", url: "/dashboard/student/messages", icon: MessageSquare },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { role } = useParams();
  const { signOut } = useAuth();

  const items = role === "admin" ? adminItems : role === "teacher" ? teacherItems : studentItems;
  const roleLabel = role === "admin" ? "Administrador" : role === "teacher" ? "Docente" : "Alumno";
  const RoleIcon = role === "admin" ? Settings : role === "teacher" ? UserCircle : GraduationCap;
  
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Campus Virtual</h2>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 space-y-2">
        {!isCollapsed ? (
          <>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate("/profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/profile")}
              title="Mi Perfil"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
