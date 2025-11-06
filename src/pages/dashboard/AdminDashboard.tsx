import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Key, Package, AlertCircle, TrendingUp, CheckCircle2, Clock, Users, BookOpen, BarChart3, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalCenters: number;
  activeCenters: number;
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentActivity {
  id: string;
  type: "center" | "license" | "order";
  title: string;
  description: string;
  time: string;
  status?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCenters: 0,
    activeCenters: 0,
    totalLicenses: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch training centers
      const { data: centers, error: centersError } = await supabase
        .from("training_centers")
        .select("*");

      if (centersError) throw centersError;

      // Fetch licenses
      const { data: licenses, error: licensesError } = await supabase
        .from("licenses")
        .select("*");

      if (licensesError) throw licensesError;

      // Fetch content orders
      const { data: orders, error: ordersError } = await supabase
        .from("content_orders")
        .select("*, training_centers(name)");

      if (ordersError) throw ordersError;

      // Calculate stats
      const now = new Date();
      const activeLicenses = licenses?.filter(
        (l) => l.is_active && new Date(l.end_date) > now
      ) || [];
      const expiredLicenses = licenses?.filter(
        (l) => new Date(l.end_date) <= now
      ) || [];

      setStats({
        totalCenters: centers?.length || 0,
        activeCenters: centers?.filter((c) => c.is_active).length || 0,
        totalLicenses: licenses?.length || 0,
        activeLicenses: activeLicenses.length,
        expiredLicenses: expiredLicenses.length,
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter((o) => o.status === "pending").length || 0,
        completedOrders: orders?.filter((o) => o.status === "completed").length || 0,
      });

      // Build recent activity
      const activities: RecentActivity[] = [];

      // Recent centers
      centers?.slice(0, 2).forEach((center) => {
        activities.push({
          id: center.id,
          type: "center",
          title: "Nuevo centro registrado",
          description: center.name,
          time: new Date(center.created_at).toLocaleString(),
          status: center.is_active ? "active" : "inactive",
        });
      });

      // Recent licenses
      licenses?.slice(0, 2).forEach((license) => {
        const isExpired = new Date(license.end_date) <= now;
        activities.push({
          id: license.id,
          type: "license",
          title: isExpired ? "Licencia vencida" : "Licencia activa",
          description: `${license.license_type} - ${license.max_students} estudiantes`,
          time: new Date(license.created_at).toLocaleString(),
          status: isExpired ? "expired" : "active",
        });
      });

      // Recent orders
      orders?.slice(0, 3).forEach((order) => {
        activities.push({
          id: order.id,
          type: "order",
          title: `Pedido: ${order.title}`,
          description: order.training_centers?.name || "Centro desconocido",
          time: new Date(order.created_at).toLocaleString(),
          status: order.status,
        });
      });

      // Sort by time
      activities.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setRecentActivity(activities.slice(0, 6));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "center":
        return Building2;
      case "license":
        return Key;
      case "order":
        return Package;
      default:
        return AlertCircle;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Activo" },
      inactive: { variant: "secondary", label: "Inactivo" },
      expired: { variant: "destructive", label: "Vencido" },
      pending: { variant: "secondary", label: "Pendiente" },
      in_progress: { variant: "default", label: "En Progreso" },
      completed: { variant: "default", label: "Completado" },
      cancelled: { variant: "destructive", label: "Cancelado" },
    };

    const config = variants[status];
    if (!config) return null;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrador</h1>
        <p className="text-muted-foreground">
          Gestión multi-centro y visión general de la plataforma
        </p>
      </div>

      {/* Quick Access Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h2 className="text-xl font-semibold mb-6">Acceso Rápido</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 px-6 flex flex-col items-start gap-3 hover:bg-primary/10 hover:border-primary transition-all group"
            onClick={() => navigate("/dashboard/admin/users")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-base mb-1">Gestión de Usuarios</p>
              <p className="text-sm text-muted-foreground">Ver y administrar usuarios</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-6 flex flex-col items-start gap-3 hover:bg-secondary/10 hover:border-secondary transition-all group"
            onClick={() => navigate("/dashboard/admin/courses")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-base mb-1">Administrar Cursos</p>
              <p className="text-sm text-muted-foreground">Crear y gestionar formaciones</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-6 flex flex-col items-start gap-3 hover:bg-accent/10 hover:border-accent transition-all group"
            onClick={() => navigate("/dashboard/admin/ai-analytics")}
          >
            <div className="w-full flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-base mb-1">Analíticas IA</p>
              <p className="text-sm text-muted-foreground">Ver estadísticas y métricas</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros de Formación</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCenters}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCenters} activos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias Totales</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeLicenses} activas · {stats.expiredLicenses} vencidas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalOrders} totales
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders > 0
                ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                : 0}
              % tasa de completitud
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Licencias Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeLicenses}</div>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.totalLicenses > 0
                        ? (stats.activeLicenses / stats.totalLicenses) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.totalLicenses > 0
                  ? Math.round((stats.activeLicenses / stats.totalLicenses) * 100)
                  : 0}
                % del total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Licencias Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {stats.expiredLicenses}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requieren renovación inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos en Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalOrders - stats.pendingOrders - stats.completedOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Contenido en desarrollo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay actividad reciente
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
