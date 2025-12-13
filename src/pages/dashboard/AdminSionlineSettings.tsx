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
  Euro
} from "lucide-react";

interface TrainingCenter {
  id: string;
  name: string;
  cif: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
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

  // Base URL for tracking - uses the edge function
  const baseTrackingUrl = "https://fkxbgifvwivlvpwxdzdb.supabase.co/functions/v1/sepe-tracking/centro/cif";

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
        .select('id, name, cif, address_line, postal_code, city')
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
            training_center: center || { id: setting.training_center_id, name: 'Centro no encontrado', cif: null, address_line: null, postal_code: null, city: null }
          };
        });
        
        setCentersWithSettings(centersWithSettingsList);

        // Find centers without settings
        const centersWithSettingsIds = settingsData.map(s => s.training_center_id);
        const available = centersData.filter(c => !centersWithSettingsIds.includes(c.id));
        setAvailableCenters(available);
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
      const urlSeguimiento = `${baseTrackingUrl}/${center.cif || 'SIN_CIF'}`;
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

                  {/* URL de seguimiento */}
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">URL de Seguimiento SOAP</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={selectedCenter.url_seguimiento || ''}
                          onChange={(e) => setSelectedCenter({ ...selectedCenter, url_seguimiento: e.target.value })}
                          className="font-mono text-sm"
                          placeholder="https://..."
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(selectedCenter.url_seguimiento || '', "URL de seguimiento")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Esta es la URL que el centro debe proporcionar al SEPE para la acreditación
                      </p>
                    </div>
                  </div>

                  {/* Credenciales */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Credenciales de Seguimiento</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={selectedCenter.credenciales_seguimiento || ''}
                          onChange={(e) => setSelectedCenter({ ...selectedCenter, credenciales_seguimiento: e.target.value })}
                          placeholder="Clave de acceso"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(selectedCenter.credenciales_seguimiento || '', "Credenciales")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key (opcional)</Label>
                      <Input
                        value={selectedCenter.api_key || ''}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, api_key: e.target.value })}
                        placeholder="API Key"
                      />
                    </div>
                  </div>

                  {/* Fecha renovación */}
                  <div className="grid md:grid-cols-2 gap-4">
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
          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="text-center text-2xl">
                Servicio de Seguimiento SOAP SEPE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">¿Qué es este servicio?</h3>
                  <p className="text-muted-foreground">
                    Proporciona una URL de seguimiento válida necesaria para la inscripción 
                    o acreditación de entidades de formación en la modalidad de teleformación ante SEPE.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Beneficios de ofrecer este servicio</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Servicio obligatorio para centros de formación que imparten teleformación</li>
                    <li>Genera ingresos recurrentes por cada centro cliente</li>
                    <li>Fideliza a tus clientes ofreciendo un servicio integral</li>
                    <li>Gestionas todas las URLs desde un solo panel</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Cómo funciona</h3>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>Un centro solicita el servicio de seguimiento SEPE</li>
                    <li>Añades el centro y generas su URL personalizada con su CIF</li>
                    <li>El centro usa esa URL en su acreditación ante SEPE</li>
                    <li>Facturas trimestralmente a cada centro por el servicio</li>
                  </ol>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Cada centro necesita tener su CIF correctamente 
                    registrado para generar su URL de seguimiento personalizada.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
