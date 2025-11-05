import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getCurrentBranding, 
  updateBranding, 
  resetToDefaultBranding,
  defaultBranding,
  type BrandingConfig 
} from "@/lib/branding";
import { Building2, Palette, Upload, RotateCcw, Save } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [branding, setBranding] = useState<BrandingConfig>(getCurrentBranding());

  const handleSave = () => {
    updateBranding(branding);
    toast({
      title: "Configuración guardada",
      description: "La plataforma se recargará para aplicar los cambios",
    });
  };

  const handleReset = () => {
    resetToDefaultBranding();
    toast({
      title: "Restaurado a SEPE",
      description: "Se ha restaurado la configuración por defecto de SEPE",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding({ ...branding, centerLogo: reader.result as string });
        toast({
          title: "Logo cargado",
          description: "Recuerda guardar los cambios",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza la plataforma para tu centro de formación
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="branding">Marca</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Personalización de Marca
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configura el branding para alquilar la plataforma a diferentes centros de formación
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Multi-tenant
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="centerName">Nombre del Centro</Label>
                  <Input
                    id="centerName"
                    value={branding.centerName}
                    onChange={(e) => setBranding({ ...branding, centerName: e.target.value })}
                    placeholder="Ej: SEPE - Servicio Público de Empleo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officialBadge">Distintivo Oficial</Label>
                  <Input
                    id="officialBadge"
                    value={branding.officialBadge || ""}
                    onChange={(e) => setBranding({ ...branding, officialBadge: e.target.value })}
                    placeholder="Ej: Centro Oficial SEPE"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="centerLogo">Logo del Centro</Label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input
                      id="centerLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Formato recomendado: PNG transparente, 200x60px
                    </p>
                  </div>
                  {branding.centerLogo && (
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <img
                        src={branding.centerLogo}
                        alt="Logo preview"
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Primario
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primaryColor.match(/hsl\((\d+)/)?.[1] ? `#${Number(branding.primaryColor.match(/hsl\((\d+)/)?.[1]).toString(16).padStart(2, '0')}80ff` : "#3b82f6"}
                      onChange={(e) => {
                        const hex = e.target.value;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        const h = Math.round(Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI);
                        setBranding({ ...branding, primaryColor: `hsl(${h}, 91%, 60%)` });
                      }}
                      className="w-20"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      placeholder="hsl(217, 91%, 60%)"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <Input
                    id="secondaryColor"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    placeholder="hsl(262, 83%, 58%)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Texto del Footer</Label>
                <Input
                  id="footer"
                  value={branding.footer || ""}
                  onChange={(e) => setBranding({ ...branding, footer: e.target.value })}
                  placeholder="Ej: © 2024 - Todos los derechos reservados"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleSave} size="lg" className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restaurar SEPE
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Configuración Actual
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Centro:</dt>
                    <dd className="font-medium">{branding.centerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Distintivo:</dt>
                    <dd className="font-medium">{branding.officialBadge || "No configurado"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Es SEPE:</dt>
                    <dd className="font-medium">
                      {branding.centerName === defaultBranding.centerName ? "Sí" : "No"}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Opciones generales de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>
                Conecta con servicios externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Próximamente: SCORM Cloud, Zoom, Microsoft Teams...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
