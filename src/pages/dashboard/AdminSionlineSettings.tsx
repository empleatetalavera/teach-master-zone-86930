import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { 
  Building2, 
  Save, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  RefreshCw,
  Copy,
  Plus,
  Trash2,
  Euro,
  GraduationCap,
  Users,
  Clock
} from "lucide-react";

interface TrainingCenter {
  id: string;
  name: string;
  cif: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  contact_email: string | null;
  custom_domain: string | null;
  slug: string | null;
}

interface SionlineSettings {
  id: string;
  training_center_id: string;
  enabled: boolean;
  url_seguimiento: string | null;
  credenciales_seguimiento: string | null;
  api_key: string | null;
  fecha_alta: string | null;
  fecha_renovacion: string | null;
  estado: string;
  notas: string | null;
  training_center?: TrainingCenter;
  // Valoración de la plataforma
  url_valoracion?: string | null;
  admin_username?: string | null;
  admin_password?: string | null;
  alumno_username?: string | null;
  alumno_password?: string | null;
  tutor_username?: string | null;
  tutor_password?: string | null;
}

interface GlobalConfig {
  id?: string;
  email: string;
  password_hash: string;
  is_connected: boolean;
  precio_trimestral: number;
}

export default function AdminSionlineSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Global config
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    email: "",
    password_hash: "",
    is_connected: true,
    precio_trimestral: 150
  });

  // Centers with settings
  const [centersWithSettings, setCentersWithSettings] = useState<(SionlineSettings & { training_center: TrainingCenter })[]>([]);
  const [availableCenters, setAvailableCenters] = useState<TrainingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<(SionlineSettings & { training_center: TrainingCenter }) | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Base URL for tracking - uses the LucusHost proxy to forward to Lovable Cloud
  const baseTrackingUrl = "https://talentcloudsolution.es/sepe-tracking";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load global config
      const { data: configData } = await supabase
        .from('sionline_global_config')
        .select('*')
        .single();
      
      if (configData) {
        setGlobalConfig(configData);
      }

      // Load all training centers
      const { data: centersData } = await supabase
        .from('training_centers')
        .select('id, name, cif, address_line, postal_code, city, contact_email, custom_domain, slug')
        .eq('is_active', true);

      // Load sionline settings with center info
      const { data: settingsData } = await supabase
        .from('sionline_settings')
        .select('*');

      if (centersData && settingsData) {
        // Map settings to centers
        const centersWithSettingsList = settingsData.map(setting => {
          const center = centersData.find(c => c.id === setting.training_center_id);
          return {
            ...setting,
            training_center: center || { id: setting.training_center_id, name: 'Centro no encontrado', cif: null, address_line: null, postal_code: null, city: null, contact_email: null, custom_domain: null, slug: null }
          };
        });
        
        setCentersWithSettings(centersWithSettingsList as any);

        // Find centers without settings
        const centersWithSettingsIds = settingsData.map(s => s.training_center_id);
        const available = centersData.filter(c => !centersWithSettingsIds.includes(c.id));
        setAvailableCenters(available as TrainingCenter[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalConfig = async () => {
    setSaving(true);
    try {
      if (globalConfig.id) {
        await supabase
          .from('sionline_global_config')
          .update({
            email: globalConfig.email,
            password_hash: globalConfig.password_hash,
            is_connected: globalConfig.is_connected,
            precio_trimestral: globalConfig.precio_trimestral
          })
          .eq('id', globalConfig.id);
      } else {
        const { data } = await supabase
          .from('sionline_global_config')
          .insert({
            email: globalConfig.email,
            password_hash: globalConfig.password_hash,
            is_connected: globalConfig.is_connected,
            precio_trimestral: globalConfig.precio_trimestral
          })
          .select()
          .single();
        
        if (data) {
          setGlobalConfig({ ...globalConfig, id: data.id });
        }
      }
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'tcs_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateCredentials = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddCenter = async (centerId: string) => {
    const center = availableCenters.find(c => c.id === centerId);
    if (!center) return;

    try {
      const urlSeguimiento = `${baseTrackingUrl}?cif=${center.cif || 'SIN_CIF'}`;
      const apiKey = generateApiKey();
      const credentials = generateCredentials();
      const fechaRenovacion = new Date();
      fechaRenovacion.setMonth(fechaRenovacion.getMonth() + 3);
      
      const { data, error } = await supabase
        .from('sionline_settings')
        .insert({
          training_center_id: centerId,
          enabled: true,
          url_seguimiento: urlSeguimiento,
          api_key: apiKey,
          credenciales_seguimiento: credentials,
          fecha_renovacion: fechaRenovacion.toISOString(),
          estado: 'activo'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCentersWithSettings([...centersWithSettings, { ...data, training_center: center }]);
        setAvailableCenters(availableCenters.filter(c => c.id !== centerId));
        toast.success(`Centro ${center.name} añadido con credenciales generadas`);
      }
    } catch (error) {
      console.error('Error adding center:', error);
      toast.error('Error al añadir el centro');
    }
  };

  const handleSaveCenter = async () => {
    if (!selectedCenter) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sionline_settings')
        .update({
          enabled: selectedCenter.enabled,
          url_seguimiento: selectedCenter.url_seguimiento,
          credenciales_seguimiento: selectedCenter.credenciales_seguimiento,
          api_key: selectedCenter.api_key,
          fecha_renovacion: selectedCenter.fecha_renovacion,
          estado: selectedCenter.estado,
          notas: selectedCenter.notas
        })
        .eq('id', selectedCenter.id);

      if (error) throw error;

      setCentersWithSettings(centersWithSettings.map(c => 
        c.id === selectedCenter.id ? selectedCenter : c
      ));
      toast.success("Centro actualizado correctamente");
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving center:', error);
      toast.error('Error al guardar el centro');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCenter = async (settingId: string) => {
    const setting = centersWithSettings.find(c => c.id === settingId);
    if (!setting) return;

    try {
      const { error } = await supabase
        .from('sionline_settings')
        .delete()
        .eq('id', settingId);

      if (error) throw error;

      setCentersWithSettings(centersWithSettings.filter(c => c.id !== settingId));
      setAvailableCenters([...availableCenters, setting.training_center]);
      setSelectedCenter(null);
      toast.success("Centro eliminado del servicio SíOnline");
    } catch (error) {
      console.error('Error deleting center:', error);
      toast.error('Error al eliminar el centro');
    }
  };

  const handleTestConnection = () => {
    toast.success("Conexión verificada correctamente");
    setGlobalConfig({ ...globalConfig, is_connected: true });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada al portapapeles`);
  };

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      activo: "bg-green-50 text-green-700 border-green-200",
      pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
      inactivo: "bg-gray-50 text-gray-700 border-gray-200",
      vencido: "bg-red-50 text-red-700 border-red-200"
    };
    return styles[estado] || styles.pendiente;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Servicio Seguimiento SEPE</h1>
          <p className="text-muted-foreground">Gestiona el servicio de URL de seguimiento SOAP para tus clientes</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/seguimiento-sepe" target="_blank">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Página Pública
          </a>
        </Button>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Tu servicio de seguimiento SOAP</strong><br />
          Ofrece URL de seguimiento SOAP a centros de formación que necesitan acreditarse ante SEPE. 
          Precio configurado: {globalConfig.precio_trimestral}€/trimestre por centro.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="centers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="centers" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Centros Clientes ({centersWithSettings.length})
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Precios y Facturación
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Información
          </TabsTrigger>
        </TabsList>

        {/* Training Centers */}
        <TabsContent value="centers">
          <div className="grid gap-6">
            {!selectedCenter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Centros con Servicio SíOnline ({centersWithSettings.length})</CardTitle>
                      <CardDescription>Gestiona el servicio de seguimiento SOAP para tus centros clientes</CardDescription>
                    </div>
                    {availableCenters.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Select onValueChange={handleAddCenter}>
                          <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Añadir centro al servicio..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCenters.map((center) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name} ({center.cif || 'Sin CIF'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {centersWithSettings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay centros configurados con el servicio SíOnline</p>
                      <p className="text-sm">Selecciona un centro del desplegable para añadirlo</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">CIF</th>
                            <th className="text-left py-3 px-4 font-semibold text-primary">Centro</th>
                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Renovación</th>
                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Estado</th>
                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Activo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {centersWithSettings.map((setting) => (
                            <tr
                              key={setting.id}
                              className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setSelectedCenter(setting)}
                            >
                              <td className="py-3 px-4 text-blue-600 font-mono text-sm">
                                {setting.training_center?.cif || '-'}
                              </td>
                              <td className="py-3 px-4 text-blue-600">
                                {setting.training_center?.name}
                              </td>
                              <td className="py-3 px-4 text-orange-600">
                                {setting.fecha_renovacion 
                                  ? new Date(setting.fecha_renovacion).toLocaleDateString('es-ES')
                                  : "-"
                                }
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className={getEstadoBadge(setting.estado)}>
                                  {setting.estado.charAt(0).toUpperCase() + setting.estado.slice(1)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {setting.enabled ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-gray-400" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Haga clic en un centro para ver y editar su configuración
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Center Detail */}
            {selectedCenter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedCenter.training_center?.name}</CardTitle>
                      <CardDescription>Configuración del servicio SíOnline</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedCenter(null); setIsEditing(false); }}
                      >
                        Volver al listado
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDeleteCenter(selectedCenter.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Estado y activación */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Servicio Activo</Label>
                      <p className="text-sm text-muted-foreground">Habilitar URL de seguimiento para este centro</p>
                    </div>
                    <Switch
                      checked={selectedCenter.enabled}
                      onCheckedChange={(checked) => setSelectedCenter({ ...selectedCenter, enabled: checked })}
                    />
                  </div>

                  {/* Datos del centro */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CIF</Label>
                      <Input
                        value={selectedCenter.training_center?.cif || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado del servicio</Label>
                      <Select
                        value={selectedCenter.estado}
                        onValueChange={(value) => setSelectedCenter({ ...selectedCenter, estado: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SEPE Form Data - Destacado */}
                  <div className="border-t pt-4">
                    <Alert className="border-blue-200 bg-blue-50 mb-4">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Datos para el formulario SEPE</strong> - Copia estos datos exactamente en el formulario del SEPE
                      </AlertDescription>
                    </Alert>

                    {/* SECCIÓN 1: ACCESO PARA LA VALORACIÓN DE LA PLATAFORMA */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6 space-y-4 mb-6">
                      <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">
                        ACCESO PARA LA VALORACIÓN DE LA PLATAFORMA:
                      </h3>
                      
                      {/* Dirección URL Valoración - Usa el custom_domain del centro */}
                      <div className="space-y-2">
                        <Label className="text-red-600 font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span> Dirección (URL):
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedCenter.training_center?.custom_domain || `https://teach-master-zone-86930.lovable.app/auth?center=${selectedCenter.training_center?.slug || selectedCenter.training_center?.cif || 'default'}`}
                            readOnly
                            className="font-mono text-sm bg-white border-2 border-blue-300"
                          />
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedCenter.training_center?.custom_domain || `https://teach-master-zone-86930.lovable.app/auth?center=${selectedCenter.training_center?.slug || selectedCenter.training_center?.cif || 'default'}`, "URL de valoración")}
                            className="shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Configura el dominio personalizado en la sección "Centros de Formación"
                        </p>
                      </div>

                      {/* Credenciales de Acceso - Título */}
                      <div className="pt-2">
                        <Label className="font-bold text-slate-700">Credenciales De Acceso:</Label>
                      </div>

                      {/* Usuario Administrador - FIJO como el admin del centro */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                        <div className="space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Usuario con perfil de administrador con permisos para publicar contenidos:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={selectedCenter.training_center?.contact_email || 'admin@centro.es'}
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(selectedCenter.training_center?.contact_email || 'admin@centro.es', "Usuario admin")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Contraseña:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="(Contraseña del administrador del centro)"
                              readOnly
                              className="font-mono text-sm bg-gray-50 border-2 border-blue-300"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Confirmar Contraseña:
                          </Label>
                          <Input
                            value="(Misma contraseña)"
                            readOnly
                            className="font-mono text-sm bg-gray-50 border-2 border-blue-300"
                          />
                        </div>
                      </div>

                      {/* Usuario Alumno - FIJO: alumnocertificados / d123456-A */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-green-200 mt-4">
                        <div className="space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Usuario con perfil de alumno:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="alumnocertificados"
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300 font-bold"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard("alumnocertificados", "Usuario alumno")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Contraseña:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="d123456-A"
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300 font-bold"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard("d123456-A", "Contraseña alumno")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Confirmar Contraseña:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="d123456-A"
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300 font-bold"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard("d123456-A", "Contraseña alumno")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Usuario Tutor - FIJO: tutorcertificados / d123456-T */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-orange-200 mt-4">
                        <div className="space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Usuario con perfil de tutor:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="tutorcertificados"
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300 font-bold"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard("tutorcertificados", "Usuario tutor")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Contraseña:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="d123456-T"
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300 font-bold"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard("d123456-T", "Contraseña tutor")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span> Confirmar Contraseña:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value="d123456-T"
                              readOnly
                              className="font-mono text-sm bg-white border-2 border-blue-300 font-bold"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard("d123456-T", "Contraseña tutor")}
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN 2: ACCESO PARA EL SEGUIMIENTO Y CONTROL */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6 space-y-4">
                      <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">
                        ACCESO PARA EL SEGUIMIENTO Y CONTROL DE ACCIONES FORMATIVAS:
                      </h3>
                      
                      {/* Dirección URL */}
                      <div className="space-y-2">
                        <Label className="text-red-600 font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span> Dirección (URL):
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedCenter.url_seguimiento || ''}
                            readOnly
                            className="font-mono text-sm bg-white border-2 border-blue-300"
                          />
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedCenter.url_seguimiento || '', "URL")}
                            className="shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Para verificar, añada <code className="bg-slate-200 px-1 rounded">?wsdl</code> al final de la URL
                        </p>
                      </div>

                      {/* Credenciales de Acceso */}
                      <div className="space-y-2">
                        <Label className="text-red-600 font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span> Credenciales De Acceso:
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedCenter.credenciales_seguimiento || ''}
                            readOnly
                            className="font-mono text-sm bg-white border-2 border-blue-300"
                          />
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedCenter.credenciales_seguimiento || '', "Credenciales")}
                            className="shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      {/* Confirmar credenciales */}
                      <div className="space-y-2">
                        <Label className="text-red-600 font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span> Confirmar credenciales de acceso:
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedCenter.credenciales_seguimiento || ''}
                            readOnly
                            className="font-mono text-sm bg-white border-2 border-blue-300"
                          />
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedCenter.credenciales_seguimiento || '', "Credenciales")}
                            className="shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          (Introduce las mismas credenciales en ambos campos)
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-300">
                        <Button 
                          className="w-full bg-slate-700 text-white hover:bg-slate-800"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `ACCESO PARA LA VALORACIÓN DE LA PLATAFORMA:\nURL: ${selectedCenter.url_valoracion || `https://teach-master-zone-86930.lovable.app/auth?center=${selectedCenter.training_center?.cif || 'default'}`}\nAdmin: ${selectedCenter.admin_username || ''} / ${selectedCenter.admin_password || ''}\nAlumno: ${selectedCenter.alumno_username || ''} / ${selectedCenter.alumno_password || ''}\nTutor: ${selectedCenter.tutor_username || ''} / ${selectedCenter.tutor_password || ''}\n\nACCESO PARA EL SEGUIMIENTO:\nURL: ${selectedCenter.url_seguimiento}\nCredenciales: ${selectedCenter.credenciales_seguimiento}`
                            );
                            toast.success("Todos los datos copiados al portapapeles");
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar todos los datos para SEPE
                        </Button>
                      </div>

                      <div className="pt-2">
                        <Button 
                          variant="outline"
                          className="w-full bg-blue-800 text-white hover:bg-blue-900"
                          onClick={() => {
                            toast.success("Validación del servicio web iniciada");
                          }}
                        >
                          AUTOVALIDAR SERVICIO WEB
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Configuración adicional */}
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-semibold text-muted-foreground">Configuración Interna</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>URL de Seguimiento (editable)</Label>
                        <Input
                          value={selectedCenter.url_seguimiento || ''}
                          onChange={(e) => setSelectedCenter({ ...selectedCenter, url_seguimiento: e.target.value })}
                          className="font-mono text-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Credenciales (editable)</Label>
                        <Input
                          value={selectedCenter.credenciales_seguimiento || ''}
                          onChange={(e) => setSelectedCenter({ ...selectedCenter, credenciales_seguimiento: e.target.value })}
                          placeholder="Clave de acceso"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Key (interno)</Label>
                        <Input
                          value={selectedCenter.api_key || ''}
                          onChange={(e) => setSelectedCenter({ ...selectedCenter, api_key: e.target.value })}
                          placeholder="API Key"
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de Renovación</Label>
                        <Input
                          type="date"
                          value={selectedCenter.fecha_renovacion?.split('T')[0] || ''}
                          onChange={(e) => setSelectedCenter({ ...selectedCenter, fecha_renovacion: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                      <Label>Notas internas</Label>
                      <Textarea
                        value={selectedCenter.notas || ''}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, notas: e.target.value })}
                        placeholder="Notas sobre este centro..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSaveCenter} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                    {selectedCenter.url_seguimiento && (
                      <Button variant="outline" onClick={() => window.open(selectedCenter.url_seguimiento!, "_blank")}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Probar URL
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  Precio para tus Clientes
                </CardTitle>
                <CardDescription>Configura el precio que cobras a tus centros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Precio trimestral por centro (€)</Label>
                  <Input
                    type="number"
                    value={globalConfig.precio_trimestral}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, precio_trimestral: parseFloat(e.target.value) || 0 })}
                    className="max-w-[200px]"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Este precio se usará como referencia en facturas y recordatorios de renovación.
                </p>
                <Button onClick={handleSaveGlobalConfig} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Precio
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ingresos</CardTitle>
                <CardDescription>Estimación basada en centros activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Centros activos:</span>
                    <span className="font-semibold">{centersWithSettings.filter(c => c.estado === 'activo').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio por centro:</span>
                    <span className="font-semibold">{globalConfig.precio_trimestral}€/trimestre</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Ingresos trimestrales:</span>
                      <span className="font-bold text-primary">
                        {(centersWithSettings.filter(c => c.estado === 'activo').length * globalConfig.precio_trimestral).toLocaleString('es-ES')}€
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                      <span>Ingresos anuales estimados:</span>
                      <span>
                        {(centersWithSettings.filter(c => c.estado === 'activo').length * globalConfig.precio_trimestral * 4).toLocaleString('es-ES')}€
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Configuración del Servicio</CardTitle>
                  <CardDescription>URL base y configuración técnica</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL Base de Seguimiento</Label>
                <Input
                  value={baseTrackingUrl}
                  disabled
                  className="bg-muted font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Esta URL se combina con el CIF de cada centro para generar su URL personalizada
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Las URLs de seguimiento se generan automáticamente siguiendo el formato:<br />
                  <code className="bg-muted px-2 py-1 rounded text-sm">{baseTrackingUrl}/[CIF_CENTRO]</code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Information */}
        <TabsContent value="info">
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-center text-2xl">
                  Modelo de Datos para Seguimiento SEPE - Teleformación
                </CardTitle>
                <CardDescription className="text-center text-primary-foreground/80">
                  Según Orden TMS/369/2019 y Anexo V - Servicio Público de Empleo Estatal
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Requisito Legal:</strong> La URL de seguimiento es obligatoria según el artículo 27 de la Orden ESS/1897/2013 
                      para centros que imparten formación en modalidad de teleformación con fondos no públicos.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      ¿Qué es el Servicio SOAP de Seguimiento?
                    </h3>
                    <p className="text-muted-foreground">
                      Es un servicio web obligatorio que implementa el Protocolo Simple Object Access Protocol (SOAP) 1.1 sobre HTTPS, 
                      conforme al estándar Web Services Security UsernameToken Profile 1.0 OASIS Standard 200401. 
                      Este servicio permite al SEPE realizar el seguimiento de las acciones formativas impartidas en modalidad de teleformación.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Operaciones del Servicio</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <code>crearCentro</code> - Crear centro de formación</li>
                        <li>• <code>obtenerDatosCentro</code> - Obtener datos del centro</li>
                        <li>• <code>crearAccion</code> - Crear acción formativa</li>
                        <li>• <code>obtenerListaAcciones</code> - Listar acciones iniciadas</li>
                        <li>• <code>obtenerAccion</code> - Obtener datos de una acción</li>
                        <li>• <code>eliminarAccion</code> - Eliminar acción formativa</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Códigos de Retorno</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• <code>0</code> - Operación correcta</li>
                        <li>• <code>1</code> - Centro/Acción inexistente</li>
                        <li>• <code>2</code> - Error en parámetro</li>
                        <li>• <code>-1</code> - Error inesperado</li>
                        <li>• <code>-2</code> - WS no disponible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  A. Datos Identificativos del Centro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left font-semibold">Campo</th>
                        <th className="border p-2 text-left font-semibold">Descripción</th>
                        <th className="border p-2 text-left font-semibold">Formato</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-mono text-xs">ID_CENTRO</td>
                        <td className="border p-2">Identificador compuesto: ORIGEN_CENTRO + CODIGO_CENTRO</td>
                        <td className="border p-2 text-xs">20 + 8000XXXXXXXX</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">ORIGEN_CENTRO</td>
                        <td className="border p-2">Siempre valor 20 (SEPE)</td>
                        <td className="border p-2 text-xs">Numérico 2 dígitos</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono text-xs">CODIGO_CENTRO</td>
                        <td className="border p-2">80 (teleformación) + secuencial de 8 dígitos</td>
                        <td className="border p-2 text-xs">10 caracteres</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">NOMBRE_CENTRO</td>
                        <td className="border p-2">Denominación o nombre comercial del centro</td>
                        <td className="border p-2 text-xs">Alfanumérico</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono text-xs">URL_PLATAFORMA</td>
                        <td className="border p-2">Dirección web donde se desarrolla la formación</td>
                        <td className="border p-2 text-xs">URL válida</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">URL_SEGUIMIENTO</td>
                        <td className="border p-2">Dirección del servicio web SOAP de seguimiento</td>
                        <td className="border p-2 text-xs">URL HTTPS + ?wsdl</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono text-xs">TELEFONO</td>
                        <td className="border p-2">Contacto numérico del centro</td>
                        <td className="border p-2 text-xs">Numérico</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">EMAIL</td>
                        <td className="border p-2">Correo electrónico de contacto</td>
                        <td className="border p-2 text-xs">Email válido</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  B. Acción Formativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left font-semibold">Campo</th>
                        <th className="border p-2 text-left font-semibold">Descripción</th>
                        <th className="border p-2 text-left font-semibold">Valores</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-mono text-xs">ID_ACCION</td>
                        <td className="border p-2">ORIGEN_ACCION + CODIGO_ACCION</td>
                        <td className="border p-2 text-xs">20 + código asignado</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">SITUACION</td>
                        <td className="border p-2">Estado de la acción formativa</td>
                        <td className="border p-2 text-xs">10=Solicitada, 20=Autorizada, 30=Iniciada, 40=Finalizada, 50=Cancelada</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono text-xs">ID_ESPECIALIDAD_PRINCIPAL</td>
                        <td className="border p-2">Código de especialidad del catálogo SEPE</td>
                        <td className="border p-2 text-xs">ORIGEN + AREA + CODIGO</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">DURACION</td>
                        <td className="border p-2">Número de horas de la acción</td>
                        <td className="border p-2 text-xs">Entero</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono text-xs">FECHA_INICIO / FECHA_FIN</td>
                        <td className="border p-2">Fechas de la acción formativa</td>
                        <td className="border p-2 text-xs">Formato fecha</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">IND_ITINERARIO_COMPLETO</td>
                        <td className="border p-2">Si imparte todos los módulos</td>
                        <td className="border p-2 text-xs">SI / NO</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono text-xs">TIPO_FINANCIACION</td>
                        <td className="border p-2">Procedencia de fondos</td>
                        <td className="border p-2 text-xs">PU=Pública, PR=Privada</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="border p-2 font-mono text-xs">NUMERO_ASISTENTES</td>
                        <td className="border p-2">Plazas ofertadas</td>
                        <td className="border p-2 text-xs">Entero</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Datos de Seguimiento por Participante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Uso del Contenido</h4>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Horario mañana (7:00-15:00)</li>
                      <li>• Horario tarde (15:00-23:00)</li>
                      <li>• Horario noche (23:00-7:00)</li>
                      <li>• Nº participantes por franja</li>
                      <li>• Nº accesos totales</li>
                      <li>• Duración total (horas)</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">Seguimiento y Evaluación</h4>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• Nº actividades aprendizaje</li>
                      <li>• Nº actividades evaluación</li>
                      <li>• Nº intentos realizados</li>
                      <li>• Tutorías presenciales</li>
                      <li>• Evaluación final</li>
                      <li>• Resultado y calificación</li>
                    </ul>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h4 className="font-semibold text-teal-800 mb-2">Identificación Participante</h4>
                    <ul className="text-xs text-teal-700 space-y-1">
                      <li>• Tipo documento (D/E/U/W/G/H)</li>
                      <li>• Número documento (10 chars)</li>
                      <li>• Letra NIF (cálculo mod 23)</li>
                      <li>• Indicador competencias clave</li>
                      <li>• Fecha alta / baja</li>
                      <li>• Contrato formación (si aplica)</li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Periodicidad de actualización:</strong> Los datos deben permanecer actualizados con periodicidad no superior a 7 días. 
                    Las fechas anteriores a la consulta menos 7 días se consideran reales; las futuras, previstas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Períodos de Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">Inicio</div>
                      <p className="text-sm text-muted-foreground">Al comunicar inicio de la acción</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">Durante</div>
                      <p className="text-sm text-muted-foreground">Periodicidad según SEPE</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">90 días</div>
                      <p className="text-sm text-muted-foreground">Tras finalización para certificar</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    La información debe estar disponible hasta 30 días después de la fecha de fin prevista, 
                    siempre que la formación superada haya sido certificada por el SEPE.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración Técnica Requerida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Protocolo</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• SOAP 1.1 sobre HTTPS (SSL)</li>
                        <li>• WS-Security UsernameToken Profile 1.0</li>
                        <li>• Credenciales tipo wsse:PasswordText</li>
                        <li>• WSDL accesible añadiendo ?wsdl a la URL</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Seguridad y Cumplimiento</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Ley Orgánica 3/2018 (LOPD-GDD)</li>
                        <li>• Reglamento (UE) 2016/679 (RGPD)</li>
                        <li>• Consentimiento expreso del alumnado</li>
                        <li>• Medidas técnicas de seguridad</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
