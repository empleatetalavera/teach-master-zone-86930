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
import { Switch } from "@/components/ui/switch";
import { Plus, Key, Edit, Building2, Check, X, AlertCircle, CreditCard } from "lucide-react";
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
}

interface Invoice {
  id: string;
  status: string;
  total_amount: number;
  due_date: string;
}

interface CenterWithLicense {
  id: string;
  name: string;
  is_active: boolean;
  license: License | null;
  latestInvoice: Invoice | null;
}

export default function AdminLicenses() {
  const [centersWithLicenses, setCentersWithLicenses] = useState<CenterWithLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
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
      // Load all training centers
      const { data: centers, error: centersError } = await supabase
        .from("training_centers")
        .select("id, name, is_active")
        .order("name");

      if (centersError) throw centersError;

      // Load all licenses
      const { data: licenses, error: licensesError } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (licensesError) throw licensesError;

      // Load latest invoices for each center
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("id, training_center_id, status, total_amount, due_date")
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;

      // Map centers with their licenses and invoices
      const mapped: CenterWithLicense[] = (centers || []).map((center) => {
        const centerLicenses = (licenses || []).filter(
          (l) => l.training_center_id === center.id
        );
        const activeLicense = centerLicenses.find((l) => l.is_active) || centerLicenses[0] || null;
        
        const centerInvoices = (invoices || []).filter(
          (i) => i.training_center_id === center.id
        );
        const latestInvoice = centerInvoices[0] || null;

        return {
          id: center.id,
          name: center.name,
          is_active: center.is_active,
          license: activeLicense,
          latestInvoice,
        };
      });

      setCentersWithLicenses(mapped);
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

    if (!selectedCenterId && !editingLicense) {
      toast({
        title: "Error",
        description: "Selecciona un centro de formación",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      training_center_id: editingLicense?.training_center_id || selectedCenterId,
      license_type: formData.license_type,
      max_students: formData.max_students,
      max_teachers: formData.max_teachers,
      max_courses: formData.max_courses,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
      price: formData.price ? parseFloat(formData.price) : null,
      notes: formData.notes || null,
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

  const handleCreateLicense = (centerId: string) => {
    setSelectedCenterId(centerId);
    setEditingLicense(null);
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    setFormData({
      license_type: "professional",
      max_students: 50,
      max_teachers: 5,
      max_courses: 10,
      start_date: today.toISOString().split("T")[0],
      end_date: nextYear.toISOString().split("T")[0],
      is_active: true,
      price: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
    setSelectedCenterId(license.training_center_id);
    setFormData({
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

  const toggleLicenseStatus = async (license: License) => {
    try {
      const { error } = await supabase
        .from("licenses")
        .update({ is_active: !license.is_active })
        .eq("id", license.id);

      if (error) throw error;
      
      toast({ 
        title: license.is_active ? "Licencia desactivada" : "Licencia activada" 
      });
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
    setSelectedCenterId(null);
    setFormData({
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

  const getPaymentStatusBadge = (invoice: Invoice | null) => {
    if (!invoice) {
      return <Badge variant="outline" className="text-muted-foreground">Sin factura</Badge>;
    }
    
    switch (invoice.status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Pagado</Badge>;
      case "pending":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "overdue":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge variant="outline">{invoice.status}</Badge>;
    }
  };

  const getLicenseStatusBadge = (center: CenterWithLicense) => {
    if (!center.license) {
      return <Badge variant="outline" className="text-muted-foreground">Sin licencia</Badge>;
    }
    
    if (!center.license.is_active) {
      return <Badge variant="secondary">Inactiva</Badge>;
    }
    
    if (isExpired(center.license.end_date)) {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    
    return <Badge className="bg-green-500 hover:bg-green-600">Activa</Badge>;
  };

  // Stats
  const totalCenters = centersWithLicenses.length;
  const centersWithActiveLicense = centersWithLicenses.filter(
    (c) => c.license?.is_active && !isExpired(c.license.end_date)
  ).length;
  const centersWithPendingPayment = centersWithLicenses.filter(
    (c) => c.latestInvoice?.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Licencias</h1>
          <p className="text-muted-foreground">Administra las licencias de los centros de formación</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Centros Totales</p>
                <p className="text-2xl font-bold">{totalCenters}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Licencias Activas</p>
                <p className="text-2xl font-bold text-green-600">{centersWithActiveLicense}</p>
              </div>
              <Key className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-destructive">{centersWithPendingPayment}</p>
              </div>
              <CreditCard className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Building2 className="inline-block mr-2 h-5 w-5" />
            Centros de Formación y Licencias
          </CardTitle>
          <CardDescription>
            Vista de todos los centros con su estado de licencia y pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : centersWithLicenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay centros de formación registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centro de Formación</TableHead>
                  <TableHead>Tipo Licencia</TableHead>
                  <TableHead>Estado Licencia</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Límites</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-center">Activa</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centersWithLicenses.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {center.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {center.license ? (
                        <Badge variant="outline">
                          {getLicenseTypeLabel(center.license.license_type)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getLicenseStatusBadge(center)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(center.latestInvoice)}
                    </TableCell>
                    <TableCell>
                      {center.license ? (
                        <div className="text-sm">
                          <div>{center.license.max_students} alumnos</div>
                          <div className="text-muted-foreground text-xs">
                            {center.license.max_teachers} prof. · {center.license.max_courses} cursos
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {center.license ? (
                        <div className="text-sm">
                          <div>{new Date(center.license.start_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground text-xs">
                            hasta {new Date(center.license.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {center.license ? (
                        <Switch
                          checked={center.license.is_active}
                          onCheckedChange={() => toggleLicenseStatus(center.license!)}
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {center.license ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLicense(center.license!)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateLicense(center.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Crear Licencia
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* License Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLicense ? "Editar Licencia" : "Nueva Licencia"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Centro de Formación</Label>
              <p className="text-sm font-medium mt-1">
                {centersWithLicenses.find((c) => c.id === (editingLicense?.training_center_id || selectedCenterId))?.name}
              </p>
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

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Licencia activa</Label>
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
  );
}
