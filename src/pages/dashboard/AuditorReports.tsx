import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Calendar, User, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReportLog {
  id: string;
  report_type: string;
  report_name: string;
  generated_at: string;
  generated_by: string;
  file_format: string;
  course_id: string | null;
  student_id: string | null;
  filters_applied: any;
  metadata: any;
}

const AuditorReports = () => {
  const [reports, setReports] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byType: {} as Record<string, number>,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Get all report logs
      const { data: reportsData, error: reportsError } = await supabase
        .from("report_audit_log")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(100);

      if (reportsError) throw reportsError;

      setReports(reportsData || []);

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const thisWeek = reportsData?.filter((r) => new Date(r.generated_at) >= weekAgo).length || 0;
      const thisMonth = reportsData?.filter((r) => new Date(r.generated_at) >= monthAgo).length || 0;

      const byType: Record<string, number> = {};
      reportsData?.forEach((r) => {
        byType[r.report_type] = (byType[r.report_type] || 0) + 1;
      });

      setStats({
        total: reportsData?.length || 0,
        thisWeek,
        thisMonth,
        byType,
      });
    } catch (error: any) {
      console.error("Error loading reports:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de informes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      course_audit: { label: "Auditoría de Curso", variant: "default" },
      student_progress: { label: "Progreso Estudiante", variant: "secondary" },
      quality_report: { label: "Informe de Calidad", variant: "outline" },
      time_tracking: { label: "Seguimiento de Tiempos", variant: "secondary" },
      communications: { label: "Comunicaciones", variant: "outline" },
    };

    return types[type] || { label: type, variant: "outline" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Registro de Informes Generados
        </h1>
        <p className="text-muted-foreground mt-2">
          Historial completo de todos los informes descargados del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Informes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Tipos Diferentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byType).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Categorías</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Informes por Tipo</CardTitle>
          <CardDescription>Distribución de informes generados por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const badge = getReportTypeBadge(type);
              return (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reports Log */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Informes</CardTitle>
          <CardDescription>Últimos 100 informes generados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay informes registrados
              </div>
            ) : (
              reports.map((report) => {
                const badge = getReportTypeBadge(report.report_type);
                return (
                  <div
                    key={report.id}
                    className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        <span className="font-semibold">{report.report_name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(report.generated_at), "PPp", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Generado por usuario
                        </span>
                        <span className="uppercase text-xs font-mono">
                          {report.file_format}
                        </span>
                      </div>
                      {Object.keys(report.filters_applied || {}).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Filtros aplicados:</span>{" "}
                          {JSON.stringify(report.filters_applied)}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>ID: {report.id.slice(0, 8)}</div>
                      {report.metadata?.data_summary && (
                        <div className="mt-1">
                          {report.metadata.data_summary.total_records} registros
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditorReports;
