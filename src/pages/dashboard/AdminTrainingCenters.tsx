import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminTrainingCenters() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<TrainingCenter | null>(null);
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
    address: "",
    is_active: true,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCenter) {
        const { error } = await supabase
          .from("training_centers")
          .update(formData)
          .eq("id", editingCenter.id);

        if (error) throw error;
        toast({ title: "Centro actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from("training_centers")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Centro creado correctamente" });
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
      address: center.address || "",
      is_active: center.is_active,
    });
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
      address: "",
      is_active: true,
    });
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="branding">Personalización</TabsTrigger>
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
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div>
                    <Label htmlFor="logo_url">URL del Logo</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="/branding/logo.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary_color">Color Primario</Label>
                    <Input
                      id="primary_color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Color Secundario</Label>
                    <Input
                      id="secondary_color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="official_badge">Insignia Oficial</Label>
                    <Input
                      id="official_badge"
                      value={formData.official_badge}
                      onChange={(e) => setFormData({ ...formData, official_badge: e.target.value })}
                      placeholder="Centro Acreditado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer_text">Texto del Pie de Página</Label>
                    <Input
                      id="footer_text"
                      value={formData.footer_text}
                      onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCenter ? "Actualizar" : "Crear"} Centro
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Insignia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{center.contact_email}</div>
                        <div className="text-muted-foreground">{center.contact_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {center.official_badge && (
                        <Badge variant="secondary">{center.official_badge}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={center.is_active ? "default" : "secondary"}>
                        {center.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(center.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
    </div>
  );
}
