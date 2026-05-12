import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, Upload, Palette, Eye, Building2, MapPin, Phone, Mail, Link2 } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CenterDocumentUploader } from "@/components/CenterDocumentUploader";
import { Compass } from "lucide-react";

export default function CenterSettings() {
  const { user } = useAuth();
  const { branding, refreshBranding } = useBranding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [officialBadge, setOfficialBadge] = useState("");
  const [footerText, setFooterText] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  
  // Contact info fields
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [cif, setCif] = useState("");
  const [sepeRegistryNumber, setSepeRegistryNumber] = useState("");
  const [censusCode, setCensusCode] = useState("");
  const [campusUrl, setCampusUrl] = useState("");
  const [navigationGuideUrl, setNavigationGuideUrl] = useState<string | null>(null);
  const [studentGuideUrl, setStudentGuideUrl] = useState<string | null>(null);
  const [tutorGuideUrl, setTutorGuideUrl] = useState<string | null>(null);
  const [trainingProgramUrl, setTrainingProgramUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCenterData();
  }, [user]);

  // Parse HSL to format for CSS variables
  const parseHSL = (hslString: string): string => {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return `${match[1]} ${match[2]}% ${match[3]}%`;
    }
    return hslString;
  };

  const loadCenterData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's training center
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("training_center_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.training_center_id) {
        toast.error("No tienes un centro de formación asignado");
        setLoading(false);
        return;
      }

      // Get center data
      const { data: center, error: centerError } = await supabase
        .from("training_centers")
        .select("*")
        .eq("id", profile.training_center_id)
        .single();

      if (centerError) throw centerError;

      setCenterId(center.id);
      setCenterName(center.name);
      setPrimaryColor(center.primary_color);
      setSecondaryColor(center.secondary_color);
      setOfficialBadge(center.official_badge || "");
      setFooterText(center.footer_text || "");
      setLogoPreview(center.logo_url || "");
      
      // Load contact info
      setContactEmail(center.email || "");
      setContactPhone(center.phone || "");
      setAddress(center.address || "");
      setCity(center.city || "");
      setProvince(center.province || "");
      setPostalCode(center.postal_code || "");
      setCif(center.cif || "");
      setSepeRegistryNumber(center.sepe_registry_number || "");
      setCensusCode(center.census_code || "");
      setCampusUrl(center.campus_url || "");
      setNavigationGuideUrl(center.navigation_guide_pdf_url || null);
      setStudentGuideUrl((center as any).student_guide_pdf_url || null);
      setTutorGuideUrl((center as any).tutor_guide_pdf_url || null);
    } catch (error) {
      console.error("Error loading center data:", error);
      toast.error("Error al cargar los datos del centro");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es muy grande. Máximo 5MB");
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !centerId) return null;

    try {
      setIsUploadingLogo(true);

      // Delete old logo if exists
      if (logoPreview && logoPreview.includes("center-logos")) {
        const oldPath = logoPreview.split("/center-logos/")[1];
        if (oldPath) {
          await supabase.storage.from("center-logos").remove([oldPath]);
        }
      }

      // Upload new logo
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `${centerId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("center-logos")
        .upload(filePath, logoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("center-logos")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error al subir el logo");
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!centerId) {
      toast.error("No se pudo identificar el centro");
      return;
    }

    try {
      setSaving(true);

      // Upload logo if changed
      let logoUrl = logoPreview;
      if (logoFile) {
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      // Update center with all data including contact info
      const { error } = await supabase
        .from("training_centers")
        .update({
          name: centerName,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          official_badge: officialBadge || null,
          footer_text: footerText || null,
          email: contactEmail || null,
          phone: contactPhone || null,
          address: address || null,
          city: city || null,
          province: province || null,
          postal_code: postalCode || null,
          cif: cif || null,
          sepe_registry_number: sepeRegistryNumber || null,
          census_code: censusCode || null,
          campus_url: campusUrl || null,
        })
        .eq("id", centerId);

      if (error) throw error;

      toast.success("Configuración actualizada correctamente");
      
      // Refresh branding
      await refreshBranding();
      
      // Reset logo file
      setLogoFile(null);
    } catch (error) {
      console.error("Error updating center:", error);
      toast.error("Error al actualizar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!centerId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Sin Centro Asignado</CardTitle>
            <CardDescription>
              No tienes un centro de formación asignado. Contacta con el administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración del Centro</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza el logo y colores de tu centro de formación
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Identidad Visual
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Building2 className="h-4 w-4 mr-2" />
            Datos de Contacto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Configuration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Identidad Visual
                </CardTitle>
                <CardDescription>
                  Los cambios se aplicarán a todos los usuarios de tu centro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            <div>
              <Label htmlFor="centerName">Nombre del Centro</Label>
              <Input
                id="centerName"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo del Centro</Label>
              <div className="mt-2 space-y-4">
                {logoPreview && (
                  <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/30">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-24 object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Formatos: JPG, PNG, SVG. Tamaño máximo: 5MB
                </p>
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <Label className="mb-3 block">Paletas de Colores Predefinidas</Label>
              <div className="flex gap-2 mb-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted border"></div>
                  <span>Primario</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted border"></div>
                  <span>Secundario</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "Turquesa", primary: "hsl(177, 33%, 52%)", secondary: "hsl(177, 40%, 42%)" },
                  { name: "Azul Profesional", primary: "hsl(217, 91%, 60%)", secondary: "hsl(221, 83%, 53%)" },
                  { name: "Verde Corporativo", primary: "hsl(142, 76%, 36%)", secondary: "hsl(142, 71%, 29%)" },
                  { name: "Naranja Energético", primary: "hsl(25, 95%, 53%)", secondary: "hsl(21, 90%, 48%)" },
                  { name: "Púrpura Elegante", primary: "hsl(262, 83%, 58%)", secondary: "hsl(263, 70%, 50%)" },
                  { name: "Rojo Institucional", primary: "hsl(0, 84%, 60%)", secondary: "hsl(0, 72%, 51%)" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:border-primary hover:bg-muted/50 transition-all"
                  >
                    <div className="flex gap-1">
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-10 rounded-md shadow-sm" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-[10px] text-muted-foreground mt-1">P</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-10 rounded-md shadow-sm" 
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <span className="text-[10px] text-muted-foreground mt-1">S</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Color Primario (HSL)</Label>
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="hsl(177, 33%, 52%)"
                  required
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: hsl(matiz, saturación%, luminosidad%)
                </p>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Color Secundario (HSL)</Label>
                <Input
                  id="secondaryColor"
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="hsl(177, 40%, 42%)"
                  required
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: hsl(matiz, saturación%, luminosidad%)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="officialBadge">Sello/Acreditación Oficial</Label>
              <Input
                id="officialBadge"
                value={officialBadge}
                onChange={(e) => setOfficialBadge(e.target.value)}
                placeholder="ej: Centro Acreditado SEPE"
              />
            </div>

            <div>
              <Label htmlFor="footerText">Texto del Footer</Label>
              <Input
                id="footerText"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder={`${centerName} - Todos los derechos reservados`}
              />
            </div>
          </CardContent>
        </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={loadCenterData}
              disabled={saving || isUploadingLogo}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || isUploadingLogo}>
              {(saving || isUploadingLogo) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </form>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa en Tiempo Real
              </CardTitle>
              <CardDescription>
                Así se verá tu centro con los nuevos cambios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Header */}
              <div 
                className="border rounded-lg p-4 bg-card"
                style={{
                  ['--preview-primary' as any]: parseHSL(primaryColor),
                  ['--preview-secondary' as any]: parseHSL(secondaryColor),
                }}
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    {logoPreview && (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview"
                        className="h-12 object-contain"
                      />
                    )}
                    {officialBadge && (
                      <Badge variant="secondary" className="text-xs">
                        {officialBadge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {centerName || "Nombre del Centro"}
                  </div>
                </div>

                {/* Preview Elements */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Botón Primario:</p>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                      style={{
                        backgroundColor: `hsl(var(--preview-primary))`,
                      }}
                    >
                      Ejemplo de Botón
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Botón Secundario:</p>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                      style={{
                        backgroundColor: `hsl(var(--preview-secondary))`,
                      }}
                    >
                      Ejemplo de Botón
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Enlace:</p>
                    <a 
                      href="#"
                      className="text-sm font-medium transition-colors"
                      style={{
                        color: `hsl(var(--preview-primary))`,
                      }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Enlace de ejemplo
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Badge:</p>
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor: `hsl(var(--preview-primary))`,
                      }}
                    >
                      Etiqueta
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Degradado:</p>
                    <div 
                      className="h-16 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, hsl(var(--preview-primary)), hsl(var(--preview-secondary)))`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-xs text-center text-muted-foreground">
                  {footerText || `© ${new Date().getFullYear()} ${centerName || "Centro de Formación"}. Todos los derechos reservados.`}
                </p>
              </div>

              {/* Color Values */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Color Primario:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {primaryColor}
                    </code>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Color Secundario:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {secondaryColor}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </TabsContent>

      {/* Contact Tab */}
      <TabsContent value="contact">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información del Centro
              </CardTitle>
              <CardDescription>
                Datos de contacto que se mostrarán a los alumnos en el campus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cif">CIF del Centro</Label>
                  <Input
                    id="cif"
                    value={cif}
                    onChange={(e) => setCif(e.target.value)}
                    placeholder="B12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="sepeRegistryNumber">Número Registro SEPE</Label>
                  <Input
                    id="sepeRegistryNumber"
                    value={sepeRegistryNumber}
                    onChange={(e) => setSepeRegistryNumber(e.target.value)}
                    placeholder="45/0000000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="censusCode">Código Censo</Label>
                <Input
                  id="censusCode"
                  value={censusCode}
                  onChange={(e) => setCensusCode(e.target.value)}
                  placeholder="00000000000000"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección
              </CardTitle>
              <CardDescription>
                Ubicación física del centro de formación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle Ejemplo, 123"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="28001"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Datos de Contacto (CAU)
              </CardTitle>
              <CardDescription>
                Teléfono y email que verán los alumnos en el Centro de Atención al Usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email de Contacto
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contacto@tucentro.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este email se mostrará en el CAU y guías del alumno
                  </p>
                </div>
                <div>
                  <Label htmlFor="contactPhone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono de Contacto
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="912345678"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este teléfono se mostrará en el CAU y guías del alumno
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Dominio del Campus Virtual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campusUrl">URL del Campus Virtual</Label>
                <Input
                  id="campusUrl"
                  value={campusUrl}
                  onChange={(e) => setCampusUrl(e.target.value)}
                  placeholder="https://campusarmaformacion.es"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL completa de tu campus virtual con dominio propio (ej: https://campusarmaformacion.es)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Guía de Navegación del Centro
              </CardTitle>
              <CardDescription>
                PDF que se ofrecerá al alumno como Guía de Navegación. Si no subes ninguno, se generará automáticamente con los datos del centro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {centerId && (
                <CenterDocumentUploader
                  centerId={centerId}
                  documentUrl={navigationGuideUrl}
                  dbField="navigation_guide_pdf_url"
                  bucket="course-documents"
                  label="Guía de Navegación"
                  fileNamePrefix="guia-navegacion"
                  onUpdate={loadCenterData}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Guía del Alumno (propia del centro)
              </CardTitle>
              <CardDescription>
                PDF que se mostrará a los alumnos de TODOS los cursos de tu centro como Guía del Alumno. Sustituye a la guía por defecto del curso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {centerId && (
                <CenterDocumentUploader
                  centerId={centerId}
                  documentUrl={studentGuideUrl}
                  dbField="student_guide_pdf_url"
                  bucket="course-documents"
                  label="Guía del Alumno"
                  fileNamePrefix="guia-alumno-centro"
                  onUpdate={loadCenterData}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Guía del Tutor (propia del centro)
              </CardTitle>
              <CardDescription>
                PDF que se mostrará a los tutores de TODOS los cursos de tu centro como Guía del Tutor. Sustituye a la guía por defecto del curso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {centerId && (
                <CenterDocumentUploader
                  centerId={centerId}
                  documentUrl={tutorGuideUrl}
                  dbField="tutor_guide_pdf_url"
                  bucket="course-documents"
                  label="Guía del Tutor"
                  fileNamePrefix="guia-tutor-centro"
                  onUpdate={loadCenterData}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={loadCenterData}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </TabsContent>
      </Tabs>
    </div>
  );
}
