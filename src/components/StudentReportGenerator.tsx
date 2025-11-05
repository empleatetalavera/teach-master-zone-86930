import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2 } from "lucide-react";

interface StudentReportGeneratorProps {
  studentId: string;
  courseId: string;
  studentName?: string;
}

export function StudentReportGenerator({ studentId, courseId, studentName }: StudentReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'complete' | 'progress' | 'attendance'>('complete');
  const { toast } = useToast();

  const generateReport = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await supabase.functions.invoke('generate-student-report', {
        body: {
          studentId,
          courseId,
          reportType
        }
      });

      if (response.error) throw response.error;

      // Open HTML report in new window
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(response.data);
        reportWindow.document.close();
      }

      toast({
        title: "Informe generado",
        description: "El informe se ha generado correctamente",
      });

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error.message || "Error al generar el informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generar Informe de Seguimiento
        </CardTitle>
        <CardDescription>
          {studentName && `Alumno: ${studentName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de informe</label>
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complete">
                Informe Completo
                <span className="text-xs text-muted-foreground ml-2">
                  (Progreso, calificaciones, asistencia y seguimiento)
                </span>
              </SelectItem>
              <SelectItem value="progress">
                Informe de Progreso
                <span className="text-xs text-muted-foreground ml-2">
                  (Solo avance en módulos)
                </span>
              </SelectItem>
              <SelectItem value="attendance">
                Informe de Asistencia
                <span className="text-xs text-muted-foreground ml-2">
                  (Solo conexiones y tiempos)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <p className="font-medium">El informe incluye:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {reportType === 'complete' && (
              <>
                <li>Progreso general y por módulos</li>
                <li>Calificaciones de evaluaciones</li>
                <li>Entregas de actividades</li>
                <li>Tiempos de conexión detallados</li>
                <li>Historial de seguimiento del profesor</li>
              </>
            )}
            {reportType === 'progress' && (
              <>
                <li>Progreso general del curso</li>
                <li>Avance por módulos</li>
                <li>Tiempo dedicado a cada módulo</li>
              </>
            )}
            {reportType === 'attendance' && (
              <>
                <li>Historial de conexiones</li>
                <li>Tiempos totales de conexión</li>
                <li>Número de sesiones</li>
              </>
            )}
          </ul>
        </div>

        <Button 
          onClick={generateReport} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando informe...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generar y Descargar Informe
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          El informe se abrirá en una nueva ventana lista para imprimir o guardar como PDF
        </p>
      </CardContent>
    </Card>
  );
}
