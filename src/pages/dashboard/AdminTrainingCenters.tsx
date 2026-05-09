import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Eye } from "lucide-react";
import CenterDetailPanel from "@/components/CenterDetailPanel";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrainingCenter {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  official_badge: string | null;
  footer_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  support_schedule?: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  custom_domain: string | null;
  slug: string | null;
}

export default function AdminTrainingCenters() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<TrainingCenter | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<TrainingCenter | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    primary_color: "hsl(217, 91%, 60%)",
    secondary_color: "hsl(262, 83%, 58%)",
    official_badge: "",
    footer_text: "",
    contact_email: "",
    contact_phone: "",
    support_schedule: "De lunes a jueves de 9:00 a 18:30 h y viernes de 9:00 a 14:00 h",
    address: "",
    is_active: true,
    custom_domain: "",
  });

  const [licenseData, setLicenseData] = useState({
    create_license: true,
    license_type: "basic",
    max_students: 100,
    max_teachers: 10,
    max_courses: 20,
    duration_months: 12,
    price: "1500",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from("training_centers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCenters(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no debe superar 5MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return formData.logo_url;

    try {
      setIsUploadingLogo(true);
      
      // Delete old logo if updating
      if (editingCenter?.logo_url) {
        const oldPath = editingCenter.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('center-logos')
            .remove([oldPath]);
        }
      }

      // Upload new logo
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('center-logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('center-logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error al subir logo",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload logo if a new one was selected
      const logoUrl = await uploadLogo();
      
      const dataToSave = {
        ...formData,
        logo_url: logoUrl || formData.logo_url,
      };

      if (editingCenter) {
        const { error } = await supabase
          .from("training_centers")
          .update(dataToSave)
          .eq("id", editingCenter.id);

        if (error) throw error;
        toast({ title: "Centro actualizado correctamente" });
      } else {
        // Create center
        const { data: newCenter, error: centerError } = await supabase
          .from("training_centers")
          .insert([dataToSave])
          .select()
          .single();

        if (centerError) throw centerError;

        // Create initial license if requested
        if (licenseData.create_license && newCenter) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + licenseData.duration_months);

          const { error: licenseError } = await supabase
            .from("licenses")
            .insert([{
              training_center_id: newCenter.id,
              license_type: licenseData.license_type,
              max_students: licenseData.max_students,
              max_teachers: licenseData.max_teachers,
              max_courses: licenseData.max_courses,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              price: parseFloat(licenseData.price),
              is_active: true,
            }]);

          if (licenseError) {
            console.error("Error creating license:", licenseError);
            toast({
              title: "Centro creado pero hubo un error con la licencia",
              description: licenseError.message,
              variant: "destructive",
            });
          } else {
            toast({ title: "Centro y licencia creados correctamente" });
          }
        } else {
          toast({ title: "Centro creado correctamente" });
        }
      }

      setIsDialogOpen(false);
      resetForm();
      loadCenters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (center: TrainingCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      logo_url: center.logo_url || "",
      primary_color: center.primary_color,
      secondary_color: center.secondary_color,
      official_badge: center.official_badge || "",
      footer_text: center.footer_text || "",
      contact_email: center.contact_email || "",
      contact_phone: center.contact_phone || "",
      support_schedule: (center as any).support_schedule || "De lunes a jueves de 9:00 a 18:30 h y viernes de 9:00 a 14:00 h",
      address: center.address || "",
      is_active: center.is_active,
      custom_domain: center.custom_domain || "",
    });
    setLogoPreview(center.logo_url || null);
    setLogoFile(null);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("training_centers")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Estado actualizado" });
      loadCenters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este centro?")) return;

    try {
      const { error } = await supabase
        .from("training_centers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Centro eliminado" });
      loadCenters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingCenter(null);
    setFormData({
      name: "",
      logo_url: "",
      primary_color: "hsl(217, 91%, 60%)",
      secondary_color: "hsl(262, 83%, 58%)",
      official_badge: "",
      footer_text: "",
      contact_email: "",
      contact_phone: "",
      support_schedule: "De lunes a jueves de 9:00 a 18:30 h y viernes de 9:00 a 14:00 h",
      address: "",
      is_active: true,
      custom_domain: "",
    });
    setLicenseData({
      create_license: true,
      license_type: "basic",
      max_students: 100,
      max_teachers: 10,
      max_courses: 20,
      duration_months: 12,
      price: "1500",
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Centros de Formación</h1>
          <p className="text-muted-foreground">Gestiona los centros de formación alquilados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Centro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCenter ? "Editar Centro" : "Nuevo Centro de Formación"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="branding">Personalización</TabsTrigger>
                  {!editingCenter && <TabsTrigger value="license">Licencia</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Centro *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email de Contacto</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Teléfono</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="support_schedule">Horario de Atención (CAU)</Label>
                    <Input
                      id="support_schedule"
                      value={formData.support_schedule}
                      onChange={(e) => setFormData({ ...formData, support_schedule: e.target.value })}
                      placeholder="De lunes a jueves de 9:00 a 18:30 h y viernes de 9:00 a 14:00 h"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <Label htmlFor="custom_domain" className="text-primary font-semibold">🌐 Dominio Personalizado del Aula</Label>
                    <Input
                      id="custom_domain"
                      value={formData.custom_domain}
                      onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                      placeholder="https://aula.micentro.es"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL del dominio propio del centro para acceso al aula virtual (ej: https://aula.formacion.es)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo del Centro</Label>
                    <div className="flex flex-col gap-3">
                      {logoPreview && (
                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          <img 
                            src={logoPreview} 
                            alt="Vista previa del logo" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: JPG, PNG, SVG. Tamaño máximo: 5MB
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="primary_color">Color Primario</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#3B82F6 o hsl(217, 91%, 60%)"
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={formData.primary_color.startsWith('#') ? formData.primary_color : '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-10 h-10 rounded border cursor-pointer p-0"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Introduce código HEX (#3B82F6) o HSL</p>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Color Secundario</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="secondary_color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="#8B5CF6 o hsl(262, 83%, 58%)"
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={formData.secondary_color.startsWith('#') ? formData.secondary_color : '#8B5CF6'}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-10 h-10 rounded border cursor-pointer p-0"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Introduce código HEX (#8B5CF6) o HSL</p>
                  </div>
                  <div>
                    <Label htmlFor="official_badge">Insignia Oficial</Label>
                    <Input
                      id="official_badge"
                      value={formData.official_badge}
                      onChange={(e) => setFormData({ ...formData, official_badge: e.target.value })}
                      placeholder="Centro Acreditado SEPE"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer_text">Texto del Pie de Página</Label>
                    <Input
                      id="footer_text"
                      value={formData.footer_text}
                      onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                      placeholder="© 2025 - Todos los derechos reservados"
                    />
                  </div>
                </TabsContent>

                {!editingCenter && (
                  <TabsContent value="license" className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="create_license"
                        checked={licenseData.create_license}
                        onChange={(e) => setLicenseData({ ...licenseData, create_license: e.target.checked })}
                        className="h-4 w-4 rounded border-input"
                      />
                      <Label htmlFor="create_license" className="cursor-pointer">
                        Crear licencia inicial para este centro
                      </Label>
                    </div>

                    {licenseData.create_license && (
                      <>
                        <div>
                          <Label htmlFor="license_type">Tipo de Licencia</Label>
                          <Select
                            value={licenseData.license_type}
                            onValueChange={(value) => setLicenseData({ ...licenseData, license_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Básica</SelectItem>
                              <SelectItem value="professional">Profesional</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="max_students">Máx. Alumnos</Label>
                            <Input
                              id="max_students"
                              type="number"
                              value={licenseData.max_students}
                              onChange={(e) => setLicenseData({ ...licenseData, max_students: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="max_teachers">Máx. Profesores</Label>
                            <Input
                              id="max_teachers"
                              type="number"
                              value={licenseData.max_teachers}
                              onChange={(e) => setLicenseData({ ...licenseData, max_teachers: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="max_courses">Máx. Cursos</Label>
                            <Input
                              id="max_courses"
                              type="number"
                              value={licenseData.max_courses}
                              onChange={(e) => setLicenseData({ ...licenseData, max_courses: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration_months">Duración (meses)</Label>
                            <Input
                              id="duration_months"
                              type="number"
                              value={licenseData.duration_months}
                              onChange={(e) => setLicenseData({ ...licenseData, duration_months: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Precio (€)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={licenseData.price}
                              onChange={(e) => setLicenseData({ ...licenseData, price: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                )}
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploadingLogo}>
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo logo...
                    </>
                  ) : (
                    <>{editingCenter ? "Actualizar" : "Crear"} Centro</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Building2 className="inline-block mr-2 h-5 w-5" />
            Centros Registrados
          </CardTitle>
          <CardDescription>
            {centers.length} centros totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : centers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay centros registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Colores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell>
                      {center.logo_url ? (
                        <img 
                          src={center.logo_url} 
                          alt={`Logo de ${center.name}`}
                          className="h-12 w-12 object-contain rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{center.name}</div>
                        {center.official_badge && (
                          <Badge variant="secondary" className="mt-1">
                            {center.official_badge}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {center.contact_email && <div>{center.contact_email}</div>}
                        {center.contact_phone && (
                          <div className="text-muted-foreground">{center.contact_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: center.primary_color }}
                          title="Color primario"
                        />
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: center.secondary_color }}
                          title="Color secundario"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={center.is_active ? "default" : "secondary"}>
                        {center.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCenter(center);
                            setIsDetailOpen(true);
                          }}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(center.id, center.is_active)}
                          title={center.is_active ? "Desactivar" : "Activar"}
                        >
                          {center.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(center)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(center.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Panel de detalles del centro */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              {selectedCenter?.logo_url ? (
                <img 
                  src={selectedCenter.logo_url} 
                  alt={selectedCenter.name}
                  className="h-10 w-10 object-contain rounded"
                />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
              {selectedCenter?.name}
            </SheetTitle>
          </SheetHeader>
          {selectedCenter && (
            <div className="mt-6">
              <CenterDetailPanel 
                centerId={selectedCenter.id} 
                centerName={selectedCenter.name}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
