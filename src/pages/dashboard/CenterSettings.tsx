import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, Upload, Palette } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

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

  useEffect(() => {
    loadCenterData();
  }, [user]);

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

      // Update center
      const { error } = await supabase
        .from("training_centers")
        .update({
          name: centerName,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          official_badge: officialBadge || null,
          footer_text: footerText || null,
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
    </div>
  );
}
