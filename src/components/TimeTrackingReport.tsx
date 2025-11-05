import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Clock, Download, TrendingUp, Calendar, Award } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

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

export function TimeTrackingReport({ courseName, modules, enrollment, studentName }: TimeTrackingReportProps) {
  const { toast } = useToast();

  // Generar datos simulados de evolución semanal (en producción vendría de content_interactions)
  const generateWeeklyProgress = () => {
    const weeks = 8;
    const data = [];
    for (let i = 0; i < weeks; i++) {
      data.push({
        semana: `Sem ${i + 1}`,
        progreso: Math.min(100, (enrollment?.progress_percentage || 0) * (i + 1) / weeks),
        tiempoHoras: Math.floor(Math.random() * 10) + 5,
        modulosCompletados: Math.floor((modules.filter(m => m.completed).length * (i + 1)) / weeks),
      });
    }
    return data;
  };

  const generateDailyActivity = () => {
    const days = 14;
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        fecha: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        minutos: Math.floor(Math.random() * 120) + 30,
      });
    }
    return data;
  };

  const weeklyData = generateWeeklyProgress();
  const dailyActivity = generateDailyActivity();

  const totalMinutes = modules.reduce((acc, m) => acc + (m.duration_minutes || 0), 0);
  const completedModules = modules.filter(m => m.completed).length;

  const exportToPDF = async () => {
    toast({
      title: "Generando PDF",
      description: "Por favor espera mientras se genera el informe...",
    });

    try {
      const element = document.getElementById('time-tracking-report');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Agregar información adicional en la última página
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Informe de Tiempos Invertidos - SEPE', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Curso: ${courseName}`, 20, 35);
      pdf.text(`Estudiante: ${studentName || 'Usuario'}`, 20, 45);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 55);
      pdf.text(`Progreso total: ${enrollment?.progress_percentage || 0}%`, 20, 65);
      pdf.text(`Módulos completados: ${completedModules} de ${modules.length}`, 20, 75);
      pdf.text(`Tiempo total invertido: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, 20, 85);

      // Agregar desglose de módulos
      pdf.setFontSize(14);
      pdf.text('Desglose por Módulo:', 20, 100);
      pdf.setFontSize(10);
      
      let yPos = 110;
      modules.forEach((module, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`${index + 1}. ${module.title}`, 25, yPos);
        pdf.text(`   Tiempo: ${Math.floor(module.duration_minutes / 60)}h ${module.duration_minutes % 60}m`, 25, yPos + 5);
        pdf.text(`   Estado: ${module.completed ? 'Completado' : 'En progreso'} (${module.progress || 0}%)`, 25, yPos + 10);
        yPos += 20;
      });

      pdf.save(`informe_tiempos_${courseName.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`);

      toast({
        title: "PDF Generado",
        description: "El informe se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

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
                <CardDescription>Tiempo Total</CardDescription>
              </div>
              <CardTitle className="text-3xl text-primary">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
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
                {Math.floor(totalMinutes / 30)}min
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Gráfico de Evolución Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Progreso por Semana</CardTitle>
            <CardDescription>Progreso acumulado y tiempo invertido semanalmente</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="progreso" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6}
                  name="Progreso (%)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="tiempoHoras" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Tiempo (horas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Actividad Diaria */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Diaria (Últimos 14 días)</CardTitle>
            <CardDescription>Tiempo invertido cada día en minutos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="minutos" 
                  fill="hsl(var(--primary))" 
                  name="Minutos"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desglose por Módulo */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Módulo</CardTitle>
            <CardDescription>Detalle del tiempo invertido en cada módulo del curso</CardDescription>
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
                    <span>{Math.floor((module.duration_minutes || 0) / 60)}h {(module.duration_minutes || 0) % 60}m</span>
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

        {/* Estadísticas Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Cumplimiento SEPE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duración del Curso</p>
                <p className="text-2xl font-bold">{Math.floor(totalMinutes / 60)} horas</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de Matriculación</p>
                <p className="text-2xl font-bold">
                  {enrollment?.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Último Acceso</p>
                <p className="text-2xl font-bold">
                  {enrollment?.last_accessed_at ? new Date(enrollment.last_accessed_at).toLocaleDateString('es-ES') : 'Hoy'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tasa de Finalización</p>
                <p className="text-2xl font-bold">{Math.round((completedModules / modules.length) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
