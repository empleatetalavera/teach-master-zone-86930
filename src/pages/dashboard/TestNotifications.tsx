import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, CheckCircle } from "lucide-react";

export default function TestNotifications() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runCheck = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("check-student-activity", {
        body: { manual: true },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Verificación completada",
        description: "El sistema ha verificado la actividad de los estudiantes",
      });
    } catch (error: any) {
      console.error("Error running check:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo ejecutar la verificación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prueba de Sistema de Notificaciones</h1>
        <p className="text-muted-foreground">
          Ejecuta manualmente la verificación de actividad de estudiantes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verificación Manual</CardTitle>
          <CardDescription>
            Ejecuta el sistema de detección de estudiantes inactivos y con bajo rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">¿Qué hace esta verificación?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Detecta estudiantes que no han accedido en 7+ días</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Identifica estudiantes con progreso menor al 30%</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Crea notificaciones automáticas para docentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Se ejecuta automáticamente cada día a las 8:00 AM</span>
                </li>
              </ul>
            </div>

            <Button onClick={runCheck} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ejecutando verificación...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Ejecutar Verificación Ahora
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                ✓ Verificación completada con éxito
              </h4>
              <p className="text-sm text-muted-foreground">
                El sistema ha verificado todos los estudiantes y creado las notificaciones
                correspondientes. Revisa el icono de campana en la parte superior para ver las
                alertas generadas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Ejecución Automática</h4>
              <p className="text-sm text-muted-foreground">
                El sistema se ejecuta automáticamente todos los días a las 8:00 AM mediante un
                cron job de Supabase
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Configuración Personalizable</h4>
              <p className="text-sm text-muted-foreground">
                Los docentes pueden personalizar los umbrales de alerta desde la página de
                "Alertas" en el menú
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Sin Duplicados</h4>
              <p className="text-sm text-muted-foreground">
                El sistema evita crear notificaciones duplicadas si ya existe una para el mismo
                estudiante y curso en las últimas 24 horas
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Prioridad Automática</h4>
              <p className="text-sm text-muted-foreground">
                Las alertas se clasifican automáticamente por prioridad según la gravedad del
                problema detectado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
