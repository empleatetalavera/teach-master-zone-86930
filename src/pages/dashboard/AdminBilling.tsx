import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, FileText, CreditCard, DollarSign, Plus, Download, Eye, Check, X, Bell, Play, Filter, FileSpreadsheet, Receipt, History, Percent } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import { useAuth } from "@/lib/auth";
import { InvoiceExport } from "@/components/billing/InvoiceExport";
import { InvoiceFilters } from "@/components/billing/InvoiceFilters";
import { TemplatesManager } from "@/components/billing/TemplatesManager";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { TaxManager } from "@/components/billing/TaxManager";

interface TrainingCenter {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

interface License {
  id: string;
  training_center_id: string;
  license_type: string;
  max_students: number;
  max_teachers: number;
  max_courses: number;
  start_date: string;
  end_date: string;
  price: number;
  is_active: boolean;
  training_centers?: { name: string };
}

interface Invoice {
  id: string;
  invoice_number: string;
  training_center_id: string;
  license_id: string | null;
  issue_date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  training_centers?: { name: string };
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  license_type: string;
  max_students: number;
  max_teachers: number;
  max_courses: number;
  duration_months: number;
  base_price: number;
  price_per_student: number;
  price_per_teacher: number;
  price_per_course: number;
  is_active: boolean;
  features: any;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  training_center_id?: string;
  is_default: boolean;
  is_active: boolean;
}

interface PaymentHistory {
  id: string;
  invoice_id: string;
  training_center_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  transaction_reference: string | null;
  notes: string | null;
  training_centers?: { name: string };
  invoices?: { invoice_number: string };
}

interface TaxConfiguration {
  id: string;
  name: string;
  description: string;
  tax_type: string;
  rate: number;
  applies_to: string;
  is_inclusive: boolean;
  is_active: boolean;
}

export default function AdminBilling() {
  const { user, userRole } = useAuth();
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [taxConfigs, setTaxConfigs] = useState<TaxConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCenterId, setUserCenterId] = useState<string | null>(null);
  
  // Check if user is super_admin (platform admin) or center admin
  const isSuperAdmin = userRole === 'super_admin';
  
  // Dialog states
  const [centerDialogOpen, setCenterDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  
  // Filter states
  const [filterCenter, setFilterCenter] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [centerForm, setCenterForm] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    logo_url: "",
    primary_color: "#10b981",
    secondary_color: "#059669",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    training_center_id: "",
    license_id: "",
    due_date: "",
    amount: "",
    tax_rate: "21",
    notes: "",
  });

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    license_type: "basic",
    max_students: "50",
    max_teachers: "5",
    max_courses: "10",
    duration_months: "12",
    base_price: "",
    price_per_student: "0",
    price_per_teacher: "0",
    price_per_course: "0",
    features: "",
  });

  // Get user's training center ID if they're a center admin
  useEffect(() => {
    const getUserCenterId = async () => {
      if (!user || isSuperAdmin) {
        loadData();
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('training_center_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.training_center_id) {
        setUserCenterId(profile.training_center_id);
      }
      loadData(profile?.training_center_id);
    };
    
    getUserCenterId();
  }, [user, isSuperAdmin]);

  const loadData = async (centerId?: string | null) => {
    setLoading(true);
    try {
      const effectiveCenterId = centerId || userCenterId;
      
      // Build queries based on whether user is super_admin or center admin
      let centersQuery = supabase.from("training_centers").select("*").order("created_at", { ascending: false });
      let licensesQuery = supabase.from("licenses").select("*, training_centers(name)").order("created_at", { ascending: false });
      let invoicesQuery = supabase.from("invoices").select("*, training_centers(name)").order("issue_date", { ascending: false });
      let paymentsQuery = supabase.from("payment_history").select("*, training_centers(name), invoices(invoice_number)").order("payment_date", { ascending: false });
      let templatesQuery = supabase.from("invoice_templates").select("*").order("created_at", { ascending: false });
      
      // Filter by center if not super_admin
      if (!isSuperAdmin && effectiveCenterId) {
        centersQuery = centersQuery.eq("id", effectiveCenterId);
        licensesQuery = licensesQuery.eq("training_center_id", effectiveCenterId);
        invoicesQuery = invoicesQuery.eq("training_center_id", effectiveCenterId);
        paymentsQuery = paymentsQuery.eq("training_center_id", effectiveCenterId);
        templatesQuery = templatesQuery.or(`training_center_id.eq.${effectiveCenterId},training_center_id.is.null`);
      }
      
      const [centersRes, licensesRes, invoicesRes, plansRes, notificationsRes, templatesRes, paymentsRes, taxesRes] = await Promise.all([
        centersQuery,
        licensesQuery,
        invoicesQuery,
        supabase.from("pricing_plans").select("*").order("base_price", { ascending: true }),
        user ? supabase.from("notifications").select("*").eq("user_id", user.id).in("type", ["invoice_overdue", "invoice_due_soon", "invoice_reminder"]).order("created_at", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
        templatesQuery,
        paymentsQuery,
        supabase.from("tax_configurations").select("*").order("created_at", { ascending: false }),
      ]);

      if (centersRes.data) setCenters(centersRes.data);
      if (licensesRes.data) setLicenses(licensesRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (plansRes.data) setPricingPlans(plansRes.data);
      if (notificationsRes.data) setNotifications(notificationsRes.data);
      if (templatesRes.data) setTemplates(templatesRes.data);
      if (paymentsRes.data) setPaymentHistory(paymentsRes.data);
      if (taxesRes.data) setTaxConfigs(taxesRes.data);
    } catch (error: any) {
      toast.error("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async () => {
    try {
      const { error } = await supabase.from("training_centers").insert([centerForm]);
      if (error) throw error;
      toast.success("Centro de formación creado exitosamente");
      setCenterDialogOpen(false);
      loadData();
      setCenterForm({ name: "", contact_email: "", contact_phone: "", address: "", logo_url: "", primary_color: "#10b981", secondary_color: "#059669" });
    } catch (error: any) {
      toast.error("Error al crear centro: " + error.message);
    }
  };

  const handleToggleCenterStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("training_centers")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Centro ${!currentStatus ? "activado" : "desactivado"} exitosamente`);
      loadData();
    } catch (error: any) {
      toast.error("Error al actualizar estado: " + error.message);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const amount = parseFloat(invoiceForm.amount);
      const taxRate = parseFloat(invoiceForm.tax_rate) / 100;
      const taxAmount = amount * taxRate;
      const totalAmount = amount + taxAmount;
      
      const invoiceNumber = `INV-${Date.now()}`;

      const { error } = await supabase.from("invoices").insert([{
        invoice_number: invoiceNumber,
        training_center_id: invoiceForm.training_center_id,
        license_id: invoiceForm.license_id || null,
        due_date: invoiceForm.due_date,
        amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: "pending",
        notes: invoiceForm.notes,
      }]);

      if (error) throw error;
      toast.success("Factura emitida exitosamente");
      setInvoiceDialogOpen(false);
      loadData();
      setInvoiceForm({ training_center_id: "", license_id: "", due_date: "", amount: "", tax_rate: "21", notes: "" });
    } catch (error: any) {
      toast.error("Error al emitir factura: " + error.message);
    }
  };

  const handleCreatePricingPlan = async () => {
    try {
      const features = planForm.features.split(",").map(f => f.trim()).filter(f => f);
      
      const { error } = await supabase.from("pricing_plans").insert([{
        name: planForm.name,
        description: planForm.description,
        license_type: planForm.license_type,
        max_students: parseInt(planForm.max_students),
        max_teachers: parseInt(planForm.max_teachers),
        max_courses: parseInt(planForm.max_courses),
        duration_months: parseInt(planForm.duration_months),
        base_price: parseFloat(planForm.base_price),
        price_per_student: parseFloat(planForm.price_per_student),
        price_per_teacher: parseFloat(planForm.price_per_teacher),
        price_per_course: parseFloat(planForm.price_per_course),
        features: features,
      }]);

      if (error) throw error;
      toast.success("Plan de tarifas creado exitosamente");
      setPlanDialogOpen(false);
      loadData();
      setPlanForm({
        name: "", description: "", license_type: "basic", max_students: "50", max_teachers: "5",
        max_courses: "10", duration_months: "12", base_price: "", price_per_student: "0",
        price_per_teacher: "0", price_per_course: "0", features: "",
      });
    } catch (error: any) {
      toast.error("Error al crear plan: " + error.message);
    }
  };

  const handleMarkInvoiceAsPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", payment_date: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Factura marcada como pagada");
      loadData();
    } catch (error: any) {
      toast.error("Error al actualizar factura: " + error.message);
    }
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const centerName = invoice.training_centers?.name || "Centro de Formación";

    doc.setFontSize(20);
    doc.text("FACTURA", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Número: ${invoice.invoice_number}`, 20, 40);
    doc.text(`Fecha de emisión: ${format(new Date(invoice.issue_date), "dd/MM/yyyy")}`, 20, 50);
    doc.text(`Fecha de vencimiento: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, 20, 60);
    
    doc.text(`Cliente: ${centerName}`, 20, 80);
    
    doc.text(`Importe: ${invoice.amount.toFixed(2)} €`, 20, 100);
    doc.text(`IVA (21%): ${invoice.tax_amount.toFixed(2)} €`, 20, 110);
    doc.setFontSize(14);
    doc.text(`TOTAL: ${invoice.total_amount.toFixed(2)} €`, 20, 125);
    
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.text(`Notas: ${invoice.notes}`, 20, 140);
    }

    doc.save(`factura-${invoice.invoice_number}.pdf`);
    toast.success("Factura descargada");
  };

  const handleRunInvoiceCheck = async () => {
    try {
      toast.info("Ejecutando verificación de facturas...");
      const { data, error } = await supabase.functions.invoke('check-invoice-status');
      
      if (error) throw error;
      
      toast.success(`Verificación completada: ${data.summary.notifications_created} notificaciones creadas`);
      loadData();
    } catch (error: any) {
      toast.error("Error al verificar facturas: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      paid: { variant: "default", label: "Pagada" },
      overdue: { variant: "destructive", label: "Vencida" },
      cancelled: { variant: "outline", label: "Cancelada" },
    };
    const config = statusConfig[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Facturación</h1>
        <Button onClick={handleRunInvoiceCheck} variant="outline">
          <Play className="mr-2 h-4 w-4" />
          Verificar Facturas
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSuperAdmin ? "Centros Activos" : "Mi Centro"}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSuperAdmin ? centers.filter(c => c.is_active).length : centers[0]?.name || "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias Activas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licenses.filter(l => l.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === "pending").length}</div>
            {invoices.filter(i => i.status === "overdue").length > 0 && (
              <p className="text-xs text-destructive mt-1">
                {invoices.filter(i => i.status === "overdue").length} vencidas
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices
                .filter(i => i.status === "paid" && new Date(i.payment_date!).getMonth() === new Date().getMonth())
                .reduce((sum, i) => sum + i.total_amount, 0)
                .toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isSuperAdmin ? "centers" : "invoices"} className="space-y-4">
        <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-7' : 'grid-cols-4'}`}>
          {isSuperAdmin && <TabsTrigger value="centers">Centros</TabsTrigger>}
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="templates">
            <Receipt className="h-4 w-4 mr-2" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="payments">
            <History className="h-4 w-4 mr-2" />
            Pagos
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="taxes">
              <Percent className="h-4 w-4 mr-2" />
              Impuestos
            </TabsTrigger>
          )}
          {isSuperAdmin && <TabsTrigger value="pricing">Tarifas</TabsTrigger>}
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Centros de Formación</CardTitle>
                  <CardDescription>Gestiona los centros registrados en la plataforma</CardDescription>
                </div>
                <Dialog open={centerDialogOpen} onOpenChange={setCenterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Nuevo Centro</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Centro de Formación</DialogTitle>
                      <DialogDescription>Registra un nuevo centro en la plataforma</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Centro</Label>
                        <Input
                          id="name"
                          value={centerForm.name}
                          onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={centerForm.contact_email}
                          onChange={(e) => setCenterForm({ ...centerForm, contact_email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact_phone">Teléfono</Label>
                        <Input
                          id="contact_phone"
                          value={centerForm.contact_phone}
                          onChange={(e) => setCenterForm({ ...centerForm, contact_phone: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea
                          id="address"
                          value={centerForm.address}
                          onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="logo_url">URL del Logo</Label>
                        <Input
                          id="logo_url"
                          value={centerForm.logo_url}
                          onChange={(e) => setCenterForm({ ...centerForm, logo_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateCenter}>Crear Centro</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centers.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell className="font-medium">{center.name}</TableCell>
                      <TableCell>{center.contact_email}</TableCell>
                      <TableCell>{center.contact_phone}</TableCell>
                      <TableCell>
                        <Badge variant={center.is_active ? "default" : "secondary"}>
                          {center.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCenterStatus(center.id, center.is_active)}
                        >
                          {center.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          {center.is_active ? " Desactivar" : " Activar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceFilters
            centers={centers}
            filterCenter={filterCenter}
            setFilterCenter={setFilterCenter}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDateFrom={filterDateFrom}
            setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo}
            setFilterDateTo={setFilterDateTo}
            onClear={() => {
              setFilterCenter("");
              setFilterStatus("");
              setFilterDateFrom("");
              setFilterDateTo("");
            }}
            showCenterFilter={isSuperAdmin}
          />
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Facturas</CardTitle>
                  <CardDescription>Gestiona y emite facturas a los centros de formación</CardDescription>
                </div>
                <div className="flex gap-2">
                  <InvoiceExport 
                    invoices={invoices.filter(inv => {
                      let filtered = true;
                      if (filterCenter) filtered = filtered && inv.training_center_id === filterCenter;
                      if (filterStatus) filtered = filtered && inv.status === filterStatus;
                      if (filterDateFrom) filtered = filtered && new Date(inv.issue_date) >= new Date(filterDateFrom);
                      if (filterDateTo) filtered = filtered && new Date(inv.issue_date) <= new Date(filterDateTo);
                      return filtered;
                    })}
                  />
                </div>
                <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Emitir Factura</Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Emitir Nueva Factura</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Centro de Formación</Label>
                        <Select
                          value={invoiceForm.training_center_id}
                          onValueChange={(value) => setInvoiceForm({ ...invoiceForm, training_center_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar centro" />
                          </SelectTrigger>
                          <SelectContent>
                            {centers.filter(c => c.is_active).map((center) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Licencia (opcional)</Label>
                        <Select
                          value={invoiceForm.license_id}
                          onValueChange={(value) => setInvoiceForm({ ...invoiceForm, license_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar licencia" />
                          </SelectTrigger>
                          <SelectContent>
                            {licenses.map((license) => (
                              <SelectItem key={license.id} value={license.id}>
                                {license.training_centers?.name} - {license.license_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Importe (sin IVA)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={invoiceForm.amount}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>IVA (%)</Label>
                        <Input
                          type="number"
                          value={invoiceForm.tax_rate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_rate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Fecha de Vencimiento</Label>
                        <Input
                          type="date"
                          value={invoiceForm.due_date}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Notas</Label>
                        <Textarea
                          value={invoiceForm.notes}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateInvoice}>Emitir Factura</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Centro</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.training_centers?.name}</TableCell>
                      <TableCell>{invoice.total_amount.toFixed(2)} €</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: es })}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoicePDF(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesManager templates={templates} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentHistory 
            payments={paymentHistory} 
            invoices={invoices}
            centers={centers}
            onUpdate={loadData}
            userId={user?.id || ""}
          />
        </TabsContent>

        {isSuperAdmin && (
        <TabsContent value="taxes" className="space-y-4">
          <TaxManager taxes={taxConfigs} onUpdate={loadData} />
        </TabsContent>
        )}

        {isSuperAdmin && (
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Planes de Tarifas</CardTitle>
                  <CardDescription>Configura los precios y características de cada plan</CardDescription>
                </div>
                <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Nuevo Plan</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Plan de Tarifas</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid gap-2">
                        <Label>Nombre del Plan</Label>
                        <Input
                          value={planForm.name}
                          onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={planForm.description}
                          onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Tipo de Licencia</Label>
                          <Select
                            value={planForm.license_type}
                            onValueChange={(value) => setPlanForm({ ...planForm, license_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Básico</SelectItem>
                              <SelectItem value="standard">Estándar</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Empresarial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Duración (meses)</Label>
                          <Input
                            type="number"
                            value={planForm.duration_months}
                            onChange={(e) => setPlanForm({ ...planForm, duration_months: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label>Max. Estudiantes</Label>
                          <Input
                            type="number"
                            value={planForm.max_students}
                            onChange={(e) => setPlanForm({ ...planForm, max_students: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Max. Profesores</Label>
                          <Input
                            type="number"
                            value={planForm.max_teachers}
                            onChange={(e) => setPlanForm({ ...planForm, max_teachers: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Max. Cursos</Label>
                          <Input
                            type="number"
                            value={planForm.max_courses}
                            onChange={(e) => setPlanForm({ ...planForm, max_courses: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Precio Base</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={planForm.base_price}
                          onChange={(e) => setPlanForm({ ...planForm, base_price: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label>Precio/Estudiante</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={planForm.price_per_student}
                            onChange={(e) => setPlanForm({ ...planForm, price_per_student: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Precio/Profesor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={planForm.price_per_teacher}
                            onChange={(e) => setPlanForm({ ...planForm, price_per_teacher: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Precio/Curso</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={planForm.price_per_course}
                            onChange={(e) => setPlanForm({ ...planForm, price_per_course: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Características (separadas por comas)</Label>
                        <Textarea
                          value={planForm.features}
                          onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                          placeholder="Soporte 24/7, Informes avanzados, API personalizada..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreatePricingPlan}>Crear Plan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <Card key={plan.id} className={!plan.is_active ? "opacity-50" : ""}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">{plan.base_price.toFixed(2)} €</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estudiantes:</span>
                          <span>{plan.max_students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profesores:</span>
                          <span>{plan.max_teachers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cursos:</span>
                          <span>{plan.max_courses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duración:</span>
                          <span>{plan.duration_months} meses</span>
                        </div>
                      </div>
                      {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                        <div className="pt-4 border-t space-y-2">
                          {plan.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center text-sm">
                              <Check className="h-4 w-4 mr-2 text-primary" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones de Facturación</CardTitle>
              <CardDescription>Historial de alertas y recordatorios automáticos</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay notificaciones de facturación
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Bell className={`h-4 w-4 ${
                              notification.priority === 'high' ? 'text-destructive' : 'text-primary'
                            }`} />
                            <h4 className="font-semibold">{notification.title}</h4>
                            <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                              {notification.priority === 'high' ? 'Alta' : 'Normal'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>{format(new Date(notification.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                            {notification.metadata?.invoice_number && (
                              <span>Factura: {notification.metadata.invoice_number}</span>
                            )}
                            {notification.metadata?.amount && (
                              <span>Importe: {notification.metadata.amount.toFixed(2)} €</span>
                            )}
                          </div>
                        </div>
                        {notification.metadata?.invoice_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Scroll to invoices tab
                              const invoicesTab = document.querySelector('[value="invoices"]') as HTMLElement;
                              invoicesTab?.click();
                            }}
                          >
                            Ver Factura
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
