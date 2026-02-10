import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line, Legend } from "recharts";
import { Clock, Download, TrendingUp, Calendar, Award } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  id: string;
  title: string;
  duration_minutes: number;
  completed?: boolean;
  progress?: number;
}

interface TimeTrackingReportProps {
  courseName: string;
  modules: Module[];
  enrollment: any;
  studentName?: string;
}

interface DailyData {
  fecha: string;
  minutos: number;
}

interface WeeklyData {
  semana: string;
  tiempoMinutos: number;
  progreso: number;
}

interface ModuleTime {
  moduleId: string;
  totalSeconds: number;
}

export function TimeTrackingReport({ courseName, modules, enrollment, studentName }: TimeTrackingReportProps) {
  const { toast } = useToast();
  const [dailyActivity, setDailyActivity] = useState<DailyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [moduleTimeMap, setModuleTimeMap] = useState<Record<string, number>>({});
  const [totalRealSeconds, setTotalRealSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enrollment?.id) {
      loadRealTimeData();
    } else {
      setLoading(false);
    }
  }, [enrollment?.id]);

  const loadRealTimeData = async () => {
    try {
      setLoading(true);

      // Fetch all content_interactions for this enrollment
      const { data: interactions, error } = await supabase
        .from("content_interactions")
        .select("module_id, time_spent_seconds, created_at")
        .eq("enrollment_id", enrollment.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const records = interactions || [];

      // Total time
      const totalSecs = records.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
      setTotalRealSeconds(totalSecs);

      // Time per module
      const modMap: Record<string, number> = {};
      records.forEach(r => {
        modMap[r.module_id] = (modMap[r.module_id] || 0) + (r.time_spent_seconds || 0);
      });
      setModuleTimeMap(modMap);

      // Daily activity (last 14 days)
      const today = new Date();
      const dailyMap: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = 0;
      }
      records.forEach(r => {
        const day = r.created_at?.slice(0, 10);
        if (day && day in dailyMap) {
          dailyMap[day] += Math.round((r.time_spent_seconds || 0) / 60);
        }
      });
      setDailyActivity(
        Object.entries(dailyMap).map(([date, minutos]) => ({
          fecha: new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
          minutos,
        }))
      );

      // Weekly aggregation (last 8 weeks)
      const weeklyMap: Record<number, number> = {};
      for (let w = 0; w < 8; w++) weeklyMap[w] = 0;
      const eightWeeksAgo = new Date(today);
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

      records.forEach(r => {
        const d = new Date(r.created_at || "");
        if (d >= eightWeeksAgo) {
          const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          const weekIdx = 7 - Math.floor(diffDays / 7);
          if (weekIdx >= 0 && weekIdx < 8) {
            weeklyMap[weekIdx] += Math.round((r.time_spent_seconds || 0) / 60);
          }
        }
      });
      setWeeklyData(
        Array.from({ length: 8 }, (_, i) => ({
          semana: `Sem ${i + 1}`,
          tiempoMinutos: weeklyMap[i] || 0,
          progreso: Math.min(100, ((enrollment?.progress_percentage || 0) * (i + 1)) / 8),
        }))
      );
    } catch (err) {
      console.error("Error loading time tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = Math.floor(totalRealSeconds / 3600);
  const totalMins = Math.floor((totalRealSeconds % 3600) / 60);
  const completedModules = modules.filter(m => m.completed).length;
  const avgDailyMinutes = dailyActivity.length > 0
    ? Math.round(dailyActivity.reduce((s, d) => s + d.minutos, 0) / dailyActivity.filter(d => d.minutos > 0).length || 0)
    : 0;

  const formatModuleTime = (moduleId: string) => {
    const secs = moduleTimeMap[moduleId] || 0;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const exportToPDF = async () => {
    toast({ title: "Generando PDF", description: "Por favor espera..." });
    try {
      const element = document.getElementById("time-tracking-report");
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      pdf.save(`informe_tiempos_${courseName.replace(/\s/g, "_")}_${Date.now()}.pdf`);
      toast({ title: "PDF Generado", description: "El informe se ha descargado correctamente" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "No se pudo generar el PDF", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Clock className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Cargando datos de tiempo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={exportToPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Informe PDF (SEPE)
        </Button>
      </div>

      <div id="time-tracking-report" className="space-y-6 bg-background p-6 rounded-lg">
        {/* Resumen General */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardDescription>Tiempo Real Dedicado</CardDescription>
              </div>
              <CardTitle className="text-3xl text-primary">
                {totalHours}h {totalMins}m
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-secondary" />
                <CardDescription>Módulos Completados</CardDescription>
              </div>
              <CardTitle className="text-3xl text-secondary">
                {completedModules} / {modules.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <CardDescription>Progreso General</CardDescription>
              </div>
              <CardTitle className="text-3xl text-accent">
                {enrollment?.progress_percentage || 0}%
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-muted/50 border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <CardDescription>Promedio Diario</CardDescription>
              </div>
              <CardTitle className="text-3xl">
                {avgDailyMinutes}min
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Gráfico de Evolución Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Progreso por Semana</CardTitle>
            <CardDescription>Tiempo real invertido semanalmente (últimas 8 semanas)</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyData.some(w => w.tiempoMinutos > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} min`, "Tiempo"]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="tiempoMinutos"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Tiempo (min)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>Aún no hay datos de actividad semanal. Comienza a estudiar para ver tu progreso aquí.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Actividad Diaria */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Diaria (Últimos 14 días)</CardTitle>
            <CardDescription>Tiempo real invertido cada día en minutos</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyActivity.some(d => d.minutos > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} min`, "Tiempo"]} />
                  <Bar
                    dataKey="minutos"
                    fill="hsl(var(--primary))"
                    name="Minutos"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>No hay actividad registrada en los últimos 14 días.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desglose por Módulo */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Módulo</CardTitle>
            <CardDescription>Tiempo real dedicado en cada módulo del curso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modules.map((module) => (
              <Card key={module.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{module.title}</h4>
                  </div>
                  <Badge variant={module.completed ? "default" : "outline"}>
                    {module.completed ? "Completado" : "En progreso"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatModuleTime(module.id)}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={module.progress || 0} className="h-2" />
                  </div>
                  <span className="font-medium">{module.progress || 0}%</span>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Estadísticas SEPE */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Cumplimiento SEPE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tiempo Real Dedicado</p>
                <p className="text-2xl font-bold">{totalHours}h {totalMins}m</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de Matriculación</p>
                <p className="text-2xl font-bold">
                  {enrollment?.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString("es-ES") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Último Acceso</p>
                <p className="text-2xl font-bold">
                  {enrollment?.last_accessed_at ? new Date(enrollment.last_accessed_at).toLocaleDateString("es-ES") : "Sin acceso"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tasa de Finalización</p>
                <p className="text-2xl font-bold">
                  {modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
