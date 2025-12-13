import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Building2, 
  Save, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Shield,
  RefreshCw,
  Phone,
  Copy
} from "lucide-react";

export default function AdminSionlineSettings() {
  // SíOnline account settings
  const [sionlineAccount, setSionlineAccount] = useState({
    enabled: true,
    email: "formacion.empleate@gmail.com",
    password: "",
    isConnected: true,
  });

  // Training centers with SíOnline integration
  const [centers, setCenters] = useState([
    {
      id: "1",
      cif: "B45878253",
      razonSocial: "EMPLEATE TALAVERA FORMACION SL",
      domicilio: "CALLE MARQUES MIRASOL 19",
      codigoPostal: "45600",
      localidad: "TALAVERA DE LA REINA",
      urlSeguimiento: "https://plataformasionline.es/seguimiento/centro/cif/B45878253",
      credencialesSeguimiento: "d12345E",
      fechaRenovacion: "19/07/2024",
      estado: "activo",
    },
    {
      id: "2",
      cif: "G45815560",
      razonSocial: "ASOCIACION EMPLEATE TALAVERA",
      domicilio: "JOSE BARCENAS 16",
      codigoPostal: "45600",
      localidad: "TALAVERA DE LA REINA",
      urlSeguimiento: "https://plataformasionline.es/seguimiento/centro/cif/G45815560",
      credencialesSeguimiento: "5207418",
      fechaRenovacion: null,
      estado: "activo",
    },
  ]);

  const [selectedCenter, setSelectedCenter] = useState<typeof centers[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveAccount = () => {
    toast.success("Configuración de cuenta SíOnline guardada");
  };

  const handleSaveCenter = () => {
    if (selectedCenter) {
      setCenters(centers.map(c => c.id === selectedCenter.id ? selectedCenter : c));
      toast.success("Centro actualizado correctamente");
      setIsEditing(false);
    }
  };

  const handleTestConnection = () => {
    toast.success("Conexión con SíOnline verificada correctamente");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada al portapapeles`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integración SíOnline - SEPE</h1>
          <p className="text-muted-foreground">Gestiona tu URL de seguimiento SOAP para SEPE</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://plataformasionline.es" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ir a SíOnline
            </Button>
          </a>
          <span className="text-orange-600 font-semibold">955 27 15 15</span>
        </div>
      </div>

      {/* Service Overview Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <Shield className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Servicio WEB de seguimiento SOAP requerido por SEPE</strong><br />
          Este servicio proporciona la URL de seguimiento válida necesaria para la inscripción o acreditación 
          de entidades de formación en la modalidad de teleformación ante SEPE.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Cuenta SíOnline
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Centros de Formación
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Información del Servicio
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Cuenta SíOnline</CardTitle>
                    <CardDescription>Credenciales de acceso a plataformasionline.es</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sionlineAccount.isConnected ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Desconectado
                    </Badge>
                  )}
                  <Switch
                    checked={sionlineAccount.enabled}
                    onCheckedChange={(checked) => setSionlineAccount(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sionline-email">Correo electrónico</Label>
                  <Input
                    id="sionline-email"
                    type="email"
                    value={sionlineAccount.email}
                    onChange={(e) => setSionlineAccount(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sionline-password">Clave de acceso</Label>
                  <Input
                    id="sionline-password"
                    type="password"
                    value={sionlineAccount.password}
                    onChange={(e) => setSionlineAccount(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveAccount}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Credenciales
                </Button>
                <Button variant="outline" onClick={handleTestConnection}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Conexión
                </Button>
                <Button variant="outline" onClick={() => window.open("https://plataformasionline.es", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acceder a SíOnline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Centers */}
        <TabsContent value="centers">
          <div className="grid gap-6">
            {/* Centers List */}
            {!selectedCenter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Centros de Formación ({centers.length})</CardTitle>
                      <CardDescription>Centros registrados con URL de seguimiento SOAP</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Nuevo Centro
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">CIF</th>
                          <th className="text-left py-3 px-4 font-semibold text-orange-600">Razón social</th>
                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Código de centro</th>
                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Fecha renovación</th>
                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {centers.map((center) => (
                          <tr
                            key={center.id}
                            className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedCenter(center)}
                          >
                            <td className="py-3 px-4 text-blue-600">{center.cif}</td>
                            <td className="py-3 px-4 text-blue-600">{center.razonSocial}</td>
                            <td className="py-3 px-4">{center.cif}</td>
                            <td className="py-3 px-4 text-orange-600">
                              {center.fechaRenovacion || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant="outline" 
                                className={center.estado === "activo" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : "bg-gray-50 text-gray-700 border-gray-200"}
                              >
                                {center.estado === "activo" ? "Activo" : "Inactivo"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Haga clic en un centro para abrir su ficha y ver su URL de seguimiento
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Center Detail */}
            {selectedCenter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Centros de formación</CardTitle>
                    <Button 
                      variant="outline" 
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setSelectedCenter(null)}
                    >
                      Volver al listado
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CIF *</Label>
                      <Input
                        value={selectedCenter.cif}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, cif: e.target.value })}
                        disabled={!isEditing}
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Razón social *</Label>
                      <Input
                        value={selectedCenter.razonSocial}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, razonSocial: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Domicilio *</Label>
                      <Input
                        value={selectedCenter.domicilio}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, domicilio: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Código postal *</Label>
                      <Input
                        value={selectedCenter.codigoPostal}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, codigoPostal: e.target.value })}
                        disabled={!isEditing}
                        className="max-w-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Localidad *</Label>
                      <Input
                        value={selectedCenter.localidad}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, localidad: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* URL de seguimiento */}
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">URL seguimiento</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={selectedCenter.urlSeguimiento}
                          disabled
                          className="bg-muted font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(selectedCenter.urlSeguimiento, "URL de seguimiento")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Esta es la URL que debe proporcionar al SEPE para la acreditación
                      </p>
                    </div>
                  </div>

                  {/* Credenciales de seguimiento */}
                  <div className="space-y-2">
                    <Label>Credenciales de seguimiento</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedCenter.credencialesSeguimiento}
                        onChange={(e) => setSelectedCenter({ ...selectedCenter, credencialesSeguimiento: e.target.value })}
                        disabled={!isEditing}
                        className="max-w-[200px]"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(selectedCenter.credencialesSeguimiento, "Credenciales")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Clave de acceso del seguimiento
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveCenter} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Grabar
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Editar Centro
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => window.open(selectedCenter.urlSeguimiento, "_blank")}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Probar URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Service Information */}
        <TabsContent value="info">
          <div className="grid gap-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader className="bg-orange-500 text-white rounded-t-lg">
                <CardTitle className="text-center text-2xl">
                  Contratar seguimiento SOAP ¡en 24 horas!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-4 py-1">
                    Contrato trimestral sin permanencia
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-orange-600">
                      URL de seguimiento SOAP para la inscripción o acreditación en SEPE
                    </h3>
                    <p className="text-muted-foreground">
                      Este servicio le permite presentar la <strong>declaración responsable de inscripción</strong> de 
                      entidades de formación en la modalidad de teleformación y la <strong>solicitud de acreditación</strong> de 
                      entidades de formación para la impartición de certificados de profesionalidad.
                    </p>
                    <p className="text-muted-foreground">
                      Una vez inscrito o acreditado, este servicio le permite <strong>impartir</strong>, en la modalidad de 
                      teleformación, formación de <strong>certificados de profesionalidad</strong> y <strong>formación de contratos en alternancia</strong>.
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="text-5xl font-bold text-foreground">
                      200<span className="text-2xl">€</span><span className="text-xl font-normal text-muted-foreground"> / trimestre</span>
                    </div>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3 h-auto"
                      onClick={() => window.open("https://plataformasionline.es/contratar", "_blank")}
                    >
                      CONTRATAR URL POR 200 € TRIMESTRE
                    </Button>
                    <p className="text-sm text-muted-foreground">sin compromiso de permanencia</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-orange-600 mb-4 text-center">
                    Este servicio incluye las siguientes condiciones
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Los precios se verán incrementados con el IVA vigente en la fecha de emisión de la factura.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Instalación en 24 horas (días laborables).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Respuesta 24/7 a las consultas de seguimiento de SEPE.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Modificaciones por cambios en la normativa de SEPE.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Monitorización y corrección de posibles errores.</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* SOAP Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Seguimiento automático SOAP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      En la Orden TMS/369/2019, de 28 de marzo, ANEXO V, apartado A dice:
                    </p>
                    <blockquote className="border-l-4 border-orange-500 pl-4 italic text-muted-foreground">
                      "El servicio web de seguimiento, con el protocolo de conexión (SOAP) y las especificaciones 
                      publicadas en las páginas web de los servicios públicos de empleo del Sistema Nacional de Empleo, 
                      deberá estar implementado por las entidades de formación acreditadas e inscritas en la modalidad de teleformación."
                    </blockquote>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-700 text-center">
                        NUESTRO SISTEMA ES COMPATIBLE CON TODAS LAS PLATAFORMAS DEL MERCADO
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="text-6xl font-bold text-gray-400">SEPE</div>
                    <div className="bg-orange-500 text-white px-6 py-3 rounded-lg text-center">
                      <div className="font-bold text-lg">SOAP</div>
                      <div className="font-bold text-lg">SSL</div>
                    </div>
                    <p className="text-orange-600 font-semibold">sistema de seguimiento</p>
                  </div>
                </div>

                <Alert className="mt-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validación del seguimiento:</strong> En la web de SEPE se puede descargar un KIT de pruebas 
                    para validar la URL de seguimiento. Valide su URL de seguimiento antes de presentar la solicitud de acreditación.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center mt-4">
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => window.open("https://plataformasionline.es/validar", "_blank")}
                  >
                    Pruebe gratis nuestra URL de seguimiento
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="font-semibold">¿Necesitas ayuda?</p>
                      <p className="text-muted-foreground">Contacta con SíOnline</p>
                    </div>
                  </div>
                  <a href="tel:955271515" className="text-2xl font-bold text-orange-600 hover:underline">
                    955 27 15 15
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
