import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Key, Edit, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface License {
  id: string;
  training_center_id: string;
  license_type: string;
  max_students: number;
  max_teachers: number;
  max_courses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  price: number | null;
  notes: string | null;
  training_centers: {
    name: string;
  };
}

interface TrainingCenter {
  id: string;
  name: string;
}

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    training_center_id: "",
    license_type: "professional",
    max_students: 50,
    max_teachers: 5,
    max_courses: 10,
    start_date: "",
    end_date: "",
    is_active: true,
    price: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [licensesRes, centersRes] = await Promise.all([
        supabase
          .from("licenses")
          .select("*, training_centers(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("training_centers")
          .select("id, name")
          .eq("is_active", true),
      ]);

      if (licensesRes.error) throw licensesRes.error;
      if (centersRes.error) throw centersRes.error;

      setLicenses(licensesRes.data || []);
      setCenters(centersRes.data || []);
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

    const submitData = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
    };

    try {
      if (editingLicense) {
        const { error } = await supabase
          .from("licenses")
          .update(submitData)
          .eq("id", editingLicense.id);

        if (error) throw error;
        toast({ title: "Licencia actualizada correctamente" });
      } else {
        const { error } = await supabase
          .from("licenses")
          .insert([submitData]);

        if (error) throw error;
        toast({ title: "Licencia creada correctamente" });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setFormData({
      training_center_id: license.training_center_id,
      license_type: license.license_type,
      max_students: license.max_students,
      max_teachers: license.max_teachers,
      max_courses: license.max_courses,
      start_date: license.start_date.split("T")[0],
      end_date: license.end_date.split("T")[0],
      is_active: license.is_active,
      price: license.price?.toString() || "",
      notes: license.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta licencia?")) return;

    try {
      const { error } = await supabase
        .from("licenses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Licencia eliminada" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingLicense(null);
    setFormData({
      training_center_id: "",
      license_type: "professional",
      max_students: 50,
      max_teachers: 5,
      max_courses: 10,
      start_date: "",
      end_date: "",
      is_active: true,
      price: "",
      notes: "",
    });
  };

  const getLicenseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic: "Básica",
      professional: "Profesional",
      enterprise: "Empresarial",
      custom: "Personalizada",
    };
    return labels[type] || type;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Licencias</h1>
          <p className="text-muted-foreground">Administra las licencias de los centros de formación</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Licencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLicense ? "Editar Licencia" : "Nueva Licencia"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="training_center_id">Centro de Formación *</Label>
                <Select
                  value={formData.training_center_id}
                  onValueChange={(value) => setFormData({ ...formData, training_center_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="license_type">Tipo de Licencia *</Label>
                <Select
                  value={formData.license_type}
                  onValueChange={(value) => setFormData({ ...formData, license_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básica</SelectItem>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="enterprise">Empresarial</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_students">Máx. Estudiantes</Label>
                  <Input
                    id="max_students"
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_teachers">Máx. Profesores</Label>
                  <Input
                    id="max_teachers"
                    type="number"
                    value={formData.max_teachers}
                    onChange={(e) => setFormData({ ...formData, max_teachers: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_courses">Máx. Cursos</Label>
                  <Input
                    id="max_courses"
                    type="number"
                    value={formData.max_courses}
                    onChange={(e) => setFormData({ ...formData, max_courses: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha de Inicio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha de Fin *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales sobre la licencia"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLicense ? "Actualizar" : "Crear"} Licencia
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Key className="inline-block mr-2 h-5 w-5" />
            Licencias Activas
          </CardTitle>
          <CardDescription>
            {licenses.length} licencias totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay licencias registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Límites</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-medium">
                      {license.training_centers.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getLicenseTypeLabel(license.license_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>{license.max_students} estudiantes</div>
                        <div className="text-muted-foreground">
                          {license.max_teachers} profesores · {license.max_courses} cursos
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(license.start_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(license.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {license.price ? `€${license.price.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          !license.is_active ? "secondary" :
                          isExpired(license.end_date) ? "destructive" : 
                          "default"
                        }
                      >
                        {!license.is_active ? "Inactiva" :
                         isExpired(license.end_date) ? "Vencida" : 
                         "Activa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(license)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(license.id)}
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
