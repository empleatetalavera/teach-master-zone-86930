import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Bell } from "lucide-react";

interface AlertSettings {
  inactive_days_threshold: number;
  low_progress_threshold: number;
  enable_email_alerts: boolean;
  enable_push_alerts: boolean;
}

export default function AlertSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AlertSettings>({
    inactive_days_threshold: 7,
    low_progress_threshold: 30,
    enable_email_alerts: true,
    enable_push_alerts: true,
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings({
          inactive_days_threshold: data.inactive_days_threshold,
          low_progress_threshold: data.low_progress_threshold,
          enable_email_alerts: data.enable_email_alerts,
          enable_push_alerts: data.enable_push_alerts,
        });
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from("alert_settings")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("alert_settings")
          .update(settings)
          .eq("user_id", user!.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("alert_settings")
          .insert({
            user_id: user!.id,
            ...settings,
          });

        if (error) throw error;
      }

      toast({
        title: "Configuración guardada",
        description: "Tus preferencias de alertas se han actualizado correctamente",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuración de Alertas</h1>
        <p className="text-muted-foreground">
          Personaliza cuándo recibir notificaciones sobre tus estudiantes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Umbrales de Alerta
          </CardTitle>
          <CardDescription>
            Configura cuándo recibir alertas sobre el rendimiento de tus estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inactive_days">
              Días de Inactividad
            </Label>
            <Input
              id="inactive_days"
              type="number"
              min="1"
              max="30"
              value={settings.inactive_days_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  inactive_days_threshold: parseInt(e.target.value) || 7,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Recibe una alerta cuando un estudiante no acceda durante este número de días
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="low_progress">
              Umbral de Bajo Progreso (%)
            </Label>
            <Input
              id="low_progress"
              type="number"
              min="0"
              max="100"
              value={settings.low_progress_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  low_progress_threshold: parseInt(e.target.value) || 30,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Recibe una alerta cuando el progreso de un estudiante esté por debajo de este porcentaje
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canales de Notificación</CardTitle>
          <CardDescription>
            Elige cómo quieres recibir las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_alerts">Alertas por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en tu correo electrónico
              </p>
            </div>
            <Switch
              id="email_alerts"
              checked={settings.enable_email_alerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_email_alerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_alerts">Alertas en la Plataforma</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones dentro de la plataforma
              </p>
            </div>
            <Switch
              id="push_alerts"
              checked={settings.enable_push_alerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_push_alerts: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
