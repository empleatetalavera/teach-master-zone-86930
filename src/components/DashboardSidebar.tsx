import { useState, useEffect } from "react";
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
  Building,
  Key,
  Package,
  User,
  Activity,
  Headphones,
  Bell,
  DollarSign,
  Layers
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

// Super Admin items (Platform administrators - TalentCloudSolution)
const superAdminItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Centros de Formación", url: "/dashboard/admin/centers", icon: Building2 },
  { title: "Catálogo de Cursos", url: "/dashboard/admin/course-catalog", icon: Layers },
  { title: "Cursos", url: "/dashboard/admin/courses", icon: BookOpen },
  { title: "Licencias", url: "/dashboard/admin/licenses", icon: Key },
  { title: "Facturación Global", url: "/dashboard/admin/billing", icon: DollarSign },
  { title: "Pedidos Tienda", url: "/dashboard/admin/shop-orders", icon: Package },
  { title: "Configurar Pagos", url: "/dashboard/admin/payment-settings", icon: Settings },
  { title: "Pedidos de Contenido", url: "/dashboard/admin/orders", icon: Package },
  { title: "Análisis AI", url: "/dashboard/admin/ai-analytics", icon: MessageSquare },
  { title: "Todos los Usuarios", url: "/dashboard/admin/users", icon: Users },
  { title: "Soporte Global", url: "/dashboard/admin/support", icon: Headphones },
];

// Training Center Admin items (Center administrators)
const adminItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Mi Centro", url: "/dashboard/admin/center-settings", icon: Building },
  { title: "Facturación y Contabilidad", url: "/dashboard/admin/billing", icon: DollarSign },
  { title: "Trazabilidad SEPE", url: "/dashboard/admin/traceability", icon: Activity },
  { title: "Usuarios", url: "/dashboard/admin/users", icon: Users },
  { title: "Cursos", url: "/dashboard/admin/courses", icon: BookOpen },
  { title: "Configurar Cursos", url: "/dashboard/admin/course-settings", icon: Settings },
  { title: "Solicitar Contenido", url: "/dashboard/admin/orders", icon: Package },
  { title: "Informes", url: "/dashboard/admin/reports", icon: BarChart },
  { title: "Atención al Alumno", url: "/dashboard/admin/support", icon: Headphones },
];

const teacherItems = [
  { title: "Dashboard", url: "/dashboard/teacher", icon: LayoutDashboard },
  { title: "Mis Cursos", url: "/dashboard/teacher/courses", icon: BookOpen },
  { title: "Alumnos", url: "/dashboard/teacher/students", icon: Users },
  { title: "Evaluar Actividades", url: "/dashboard/teacher/grade-activities", icon: ClipboardList },
  { title: "Cronograma", url: "/dashboard/teacher/calendar", icon: Calendar },
  { title: "Informes", url: "/dashboard/teacher/reports", icon: BarChart },
  { title: "Guía del Tutor", url: "/dashboard/teacher/tutor-guide", icon: BookMarked },
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

const auditorItems = [
  { title: "Dashboard", url: "/dashboard/auditor", icon: LayoutDashboard },
  { title: "Cursos", url: "/dashboard/auditor/courses", icon: BookOpen },
  { title: "Trazabilidad SEPE", url: "/dashboard/auditor/traceability", icon: Activity },
  { title: "Seguimiento Alumnos", url: "/dashboard/auditor/students", icon: Users },
  { title: "Informes de Calidad", url: "/dashboard/auditor/reports", icon: BarChart },
  { title: "Registro Informes", url: "/dashboard/auditor/report-logs", icon: FileText },
  { title: "Comunicaciones", url: "/dashboard/auditor/communications", icon: MessageSquare },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  // Role derived from authenticated user
  const { signOut, userRole, user } = useAuth();
  const [userCenterSlug, setUserCenterSlug] = useState<string | null>(null);

  // Fetch user's center slug for logout redirect
  useEffect(() => {
    const fetchUserCenter = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('training_center_id')
          .eq('id', user.id)
          .single();
        
        if (profile?.training_center_id) {
          const { data: center } = await supabase
            .from('training_centers')
            .select('slug')
            .eq('id', profile.training_center_id)
            .single();
          
          if (center?.slug) {
            setUserCenterSlug(center.slug);
          }
        }
      }
    };
    
    fetchUserCenter();
  }, [user]);

  // Determine which menu items to show
  // super_admin gets platform management menu
  // admin gets center management menu
  const items = 
    userRole === "super_admin" ? superAdminItems :
    userRole === "admin" ? adminItems : 
    userRole === "teacher" ? teacherItems : 
    userRole === "auditor" ? auditorItems :
    studentItems;
  
  const roleLabel = 
    userRole === "super_admin" ? "Super Administrador" :
    userRole === "admin" ? "Administrador de Centro" : 
    userRole === "teacher" ? "Docente" : 
    userRole === "auditor" ? "Auditor SEPE" :
    "Alumno";
  
  const RoleIcon = 
    userRole === "admin" || userRole === "super_admin" ? Settings : 
    userRole === "teacher" ? UserCircle : 
    userRole === "auditor" ? Activity :
    GraduationCap;
  
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    const centerSlug = userCenterSlug;
    await signOut();
    // Redirect to center-specific login if user had a center
    if (centerSlug) {
      navigate(`/auth?center=${centerSlug}`);
    } else {
      navigate("/auth");
    }
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
