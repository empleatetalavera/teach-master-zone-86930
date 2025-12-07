import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, FileText, Download, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import { useAuth } from "@/lib/auth";

interface Course {
  id: string;
  title: string;
  training_center_id: string;
}

interface Student {
  id: string;
  full_name: string;
  email?: string;
  dni_nie?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  province?: string;
}

interface StudentInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  notes: string | null;
  student_name?: string;
  student_email?: string;
  student_dni?: string;
  student_phone?: string;
  student_address?: string;
  student_city?: string;
  student_postal_code?: string;
  student_province?: string;
  course_title?: string;
}

export function StudentInvoiceGenerator() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [centerInfo, setCenterInfo] = useState<any>(null);

  const [form, setForm] = useState({
    courseId: "",
    studentId: "",
    amount: "",
    taxRate: "21",
    concept: "",
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    loadCenterInfo();
    loadInvoices();
  }, []);

  useEffect(() => {
    if (centerInfo?.id) {
      loadCourses(centerInfo.id);
    }
  }, [centerInfo]);

  useEffect(() => {
    if (form.courseId && centerInfo?.id) {
      loadStudents(form.courseId, centerInfo.id);
    }
  }, [form.courseId, centerInfo]);

  const loadCenterInfo = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("training_center_id")
      .eq("id", user.id)
      .single();

    if (profile?.training_center_id) {
      const { data: center } = await supabase
        .from("training_centers")
        .select("*")
        .eq("id", profile.training_center_id)
        .single();
      
      if (center) setCenterInfo(center);
    }
  };

  const loadCourses = async (centerId: string) => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, training_center_id")
      .eq("is_active", true)
      .eq("training_center_id", centerId)
      .order("title");

    if (data) setCourses(data);
  };

  const loadStudents = async (courseId: string, centerId: string) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", courseId);

    if (enrollments && enrollments.length > 0) {
      const userIds = enrollments.map((e) => e.user_id);
      
      // Get full profiles with all student data, filtered by training center
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, dni_nie, phone, address, city, postal_code, province, training_center_id")
        .in("id", userIds)
        .eq("training_center_id", centerId);

      if (profiles) {
        setStudents(
          profiles.map((p) => ({
            id: p.id,
            full_name: p.full_name || "Sin nombre",
            dni_nie: p.dni_nie || "",
            phone: p.phone || "",
            address: p.address || "",
            city: p.city || "",
            postal_code: p.postal_code || "",
            province: p.province || "",
          }))
        );
      }
    } else {
      setStudents([]);
    }
  };

  const loadInvoices = async () => {
    // For now, we'll store student invoices in a simple way
    // In a real implementation, you'd have a dedicated student_invoices table
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .not("notes", "is", null)
      .ilike("notes", "%alumno:%")
      .order("issue_date", { ascending: false })
      .limit(50);

    if (data) {
      // Parse student invoices from notes
      const studentInvoices: StudentInvoice[] = [];
      for (const inv of data) {
        if (inv.notes?.includes("alumno:")) {
          // Extended pattern to capture all student data
          const match = inv.notes.match(/alumno:([^|]+)\|curso:([^|]+)\|email:([^|]*)\|dni:([^|]*)\|phone:([^|]*)\|address:([^|]*)\|city:([^|]*)\|postal:([^|]*)\|province:([^|]*)/);
          if (match) {
            studentInvoices.push({
              ...inv,
              student_name: match[1],
              course_title: match[2],
              student_email: match[3] || undefined,
              student_dni: match[4] || undefined,
              student_phone: match[5] || undefined,
              student_address: match[6] || undefined,
              student_city: match[7] || undefined,
              student_postal_code: match[8] || undefined,
              student_province: match[9] || undefined,
            });
          } else {
            // Legacy format fallback
            const legacyMatch = inv.notes.match(/alumno:([^|]+)\|curso:([^|]+)\|email:([^|]*)/);
            if (legacyMatch) {
              studentInvoices.push({
                ...inv,
                student_name: legacyMatch[1],
                course_title: legacyMatch[2],
                student_email: legacyMatch[3] || undefined,
              });
            }
          }
        }
      }
      setInvoices(studentInvoices);
    }
  };

  const handleCreateInvoice = async () => {
    if (!form.courseId || !form.studentId || !form.amount || !form.dueDate) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(form.amount);
      const taxRate = parseFloat(form.taxRate) / 100;
      const taxAmount = amount * taxRate;
      const totalAmount = amount + taxAmount;

      const student = students.find((s) => s.id === form.studentId);
      const course = courses.find((c) => c.id === form.courseId);

      // Get student email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(form.studentId).catch(() => ({ data: null }));
      const studentEmail = authUser?.user?.email || "";

      const invoiceNumber = `FALUM-${Date.now()}`;
      // Extended notes with all student data
      const notes = `alumno:${student?.full_name}|curso:${course?.title}|email:${studentEmail}|dni:${student?.dni_nie || ""}|phone:${student?.phone || ""}|address:${student?.address || ""}|city:${student?.city || ""}|postal:${student?.postal_code || ""}|province:${student?.province || ""}|concepto:${form.concept}|notas:${form.notes}`;

      // Use current center or first available
      const centerId = centerInfo?.id || courses.find(c => c.id === form.courseId)?.training_center_id;

      if (!centerId) {
        toast.error("No se pudo determinar el centro de formación");
        return;
      }

      const { error } = await supabase.from("invoices").insert([
        {
          invoice_number: invoiceNumber,
          training_center_id: centerId,
          due_date: form.dueDate,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: "pending",
          notes,
        },
      ]);

      if (error) throw error;

      toast.success("Factura creada exitosamente");
      setDialogOpen(false);
      loadInvoices();
      setForm({
        courseId: "",
        studentId: "",
        amount: "",
        taxRate: "21",
        concept: "",
        dueDate: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error("Error al crear factura: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus, payment_date: newStatus === "paid" ? new Date().toISOString() : null })
        .eq("id", invoiceId);

      if (error) throw error;

      toast.success(`Estado actualizado a ${newStatus === "paid" ? "Pagado" : "Pendiente"}`);
      loadInvoices();
    } catch (error: any) {
      toast.error("Error al actualizar estado: " + error.message);
    }
  };

  const generatePDF = (invoice: StudentInvoice) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 105, 25, { align: "center" });

    // Status badge
    if (invoice.status === "paid") {
      doc.setFillColor(34, 197, 94);
      doc.rect(150, 18, 40, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("PAGADA", 170, 25, { align: "center" });
    } else {
      doc.setFillColor(234, 179, 8);
      doc.rect(145, 18, 45, 10, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("PENDIENTE", 167, 25, { align: "center" });
    }
    doc.setTextColor(0, 0, 0);

    // Center info
    if (centerInfo) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(centerInfo.name || "Centro de Formación", 20, 40);
      if (centerInfo.cif) doc.text(`CIF: ${centerInfo.cif}`, 20, 46);
      if (centerInfo.address) doc.text(centerInfo.address, 20, 52);
      if (centerInfo.city) doc.text(`${centerInfo.postal_code || ""} ${centerInfo.city}`, 20, 58);
      if (centerInfo.contact_email) doc.text(centerInfo.contact_email, 20, 64);
      if (centerInfo.contact_phone) doc.text(`Tel: ${centerInfo.contact_phone}`, 20, 70);
    }

    // Invoice details
    doc.setFontSize(11);
    doc.text(`Nº Factura: ${invoice.invoice_number}`, 130, 40);
    doc.text(`Fecha: ${format(new Date(invoice.issue_date), "dd/MM/yyyy")}`, 130, 46);
    doc.text(`Vencimiento: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, 130, 52);
    doc.text(`Estado: ${invoice.status === "paid" ? "PAGADA" : "PENDIENTE"}`, 130, 58);

    // Customer info - All student data
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL ALUMNO", 20, 90);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let yPos = 98;
    doc.text(`Nombre: ${invoice.student_name || "N/A"}`, 20, yPos);
    yPos += 6;
    if (invoice.student_dni) {
      doc.text(`DNI/NIE: ${invoice.student_dni}`, 20, yPos);
      yPos += 6;
    }
    if (invoice.student_email) {
      doc.text(`Email: ${invoice.student_email}`, 20, yPos);
      yPos += 6;
    }
    if (invoice.student_phone) {
      doc.text(`Teléfono: ${invoice.student_phone}`, 20, yPos);
      yPos += 6;
    }
    if (invoice.student_address) {
      doc.text(`Dirección: ${invoice.student_address}`, 20, yPos);
      yPos += 6;
    }
    if (invoice.student_city || invoice.student_postal_code) {
      doc.text(`${invoice.student_postal_code || ""} ${invoice.student_city || ""}`, 20, yPos);
      yPos += 6;
    }
    if (invoice.student_province) {
      doc.text(`Provincia: ${invoice.student_province}`, 20, yPos);
      yPos += 6;
    }

    // Concept - adjust position based on student data
    const conceptY = Math.max(yPos + 10, 140);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONCEPTO", 20, conceptY);

    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(20, conceptY + 8, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Descripción", 25, conceptY + 14);
    doc.text("Importe", 160, conceptY + 14);

    // Table content
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const conceptText = invoice.course_title || "Formación";
    doc.text(conceptText, 25, conceptY + 25);
    doc.text(`${invoice.amount.toFixed(2)} €`, 160, conceptY + 25);

    // Totals
    const totalsY = conceptY + 45;
    doc.setFont("helvetica", "normal");
    doc.text("Base Imponible:", 120, totalsY);
    doc.text(`${invoice.amount.toFixed(2)} €`, 160, totalsY);

    doc.text(`IVA (21%):`, 120, totalsY + 7);
    doc.text(`${invoice.tax_amount.toFixed(2)} €`, 160, totalsY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", 120, totalsY + 17);
    doc.text(`${invoice.total_amount.toFixed(2)} €`, 160, totalsY + 17);

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Esta factura ha sido generada electrónicamente y es válida sin firma.",
      105,
      280,
      { align: "center" }
    );

    doc.save(`factura-alumno-${invoice.invoice_number}.pdf`);
    toast.success("Factura descargada");
  };

  const handleSendEmail = (invoice: StudentInvoice) => {
    if (!invoice.student_email) {
      toast.error("El alumno no tiene email registrado");
      return;
    }

    // For now, just generate the PDF and show instructions
    generatePDF(invoice);
    toast.info(
      `PDF generado. Envía manualmente a: ${invoice.student_email}`,
      { duration: 5000 }
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      paid: { variant: "default", label: "Pagada" },
      overdue: { variant: "destructive", label: "Vencida" },
    };
    const c = config[status] || { variant: "secondary", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Facturas a Alumnos
            </CardTitle>
            <CardDescription>
              Genera facturas para alumnos de cursos privados
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generar Factura a Alumno</DialogTitle>
                <DialogDescription>
                  Selecciona el curso y alumno para generar la factura
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Curso *</Label>
                  <Select
                    value={form.courseId}
                    onValueChange={(v) => setForm({ ...form, courseId: v, studentId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alumno *</Label>
                  <Select
                    value={form.studentId}
                    onValueChange={(v) => setForm({ ...form, studentId: v })}
                    disabled={!form.courseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name} {s.dni_nie && `(${s.dni_nie})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Concepto</Label>
                  <Input
                    value={form.concept}
                    onChange={(e) => setForm({ ...form, concept: e.target.value })}
                    placeholder="Ej: Matrícula curso formación"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Importe (€) *</Label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IVA (%)</Label>
                    <Select
                      value={form.taxRate}
                      onValueChange={(v) => setForm({ ...form, taxRate: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Exento)</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="21">21%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de vencimiento *</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notas adicionales</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Notas opcionales..."
                    rows={2}
                  />
                </div>

                {form.amount && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex justify-between">
                      <span>Base imponible:</span>
                      <span>{parseFloat(form.amount || "0").toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA ({form.taxRate}%):</span>
                      <span>
                        {(parseFloat(form.amount || "0") * (parseFloat(form.taxRate) / 100)).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between font-bold mt-1 pt-1 border-t">
                      <span>Total:</span>
                      <span>
                        {(parseFloat(form.amount || "0") * (1 + parseFloat(form.taxRate) / 100)).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInvoice} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Factura
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay facturas de alumnos generadas
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Factura</TableHead>
                <TableHead>Alumno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium">{invoice.student_name || "N/A"}</p>
                      {invoice.student_dni && (
                        <p className="text-xs text-muted-foreground">DNI: {invoice.student_dni}</p>
                      )}
                      {invoice.student_email && (
                        <p className="text-xs text-muted-foreground">{invoice.student_email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {invoice.course_title || "N/A"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.issue_date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {invoice.total_amount.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <Select
                      value={invoice.status}
                      onValueChange={(value) => handleUpdateStatus(invoice.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue>
                          {getStatusBadge(invoice.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <Badge variant="secondary">Pendiente</Badge>
                        </SelectItem>
                        <SelectItem value="paid">
                          <Badge variant="default">Pagada</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePDF(invoice)}
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendEmail(invoice)}
                        title="Enviar por email"
                      >
                        <Mail className="h-4 w-4" />
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
  );
}
