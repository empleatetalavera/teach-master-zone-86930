import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Payment {
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

interface PaymentHistoryProps {
  payments: Payment[];
  invoices: any[];
  centers: any[];
  onUpdate: () => void;
  userId: string;
}

export function PaymentHistory({ payments, invoices, centers, onUpdate, userId }: PaymentHistoryProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: "",
    training_center_id: "",
    amount: "",
    payment_method: "bank_transfer",
    transaction_reference: "",
    notes: "",
  });

  const handleCreate = async () => {
    try {
      const { error } = await supabase.from("payment_history").insert([{
        ...formData,
        amount: parseFloat(formData.amount),
        processed_by: userId,
      }]);
      
      if (error) throw error;
      
      // Update invoice status
      await supabase
        .from("invoices")
        .update({ 
          status: "paid", 
          payment_date: new Date().toISOString(),
          payment_method: formData.payment_method 
        })
        .eq("id", formData.invoice_id);
      
      toast.success("Pago registrado exitosamente");
      setDialogOpen(false);
      setFormData({
        invoice_id: "",
        training_center_id: "",
        amount: "",
        payment_method: "bank_transfer",
        transaction_reference: "",
        notes: "",
      });
      onUpdate();
    } catch (error: any) {
      toast.error("Error al registrar pago: " + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Registro completo de todos los pagos recibidos</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Registrar Pago</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Pago</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Factura</Label>
                  <Select
                    value={formData.invoice_id}
                    onValueChange={(value) => {
                      const invoice = invoices.find(i => i.id === value);
                      setFormData({ 
                        ...formData, 
                        invoice_id: value,
                        training_center_id: invoice?.training_center_id || "",
                        amount: invoice?.total_amount?.toString() || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar factura" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.filter(i => i.status === "pending" || i.status === "overdue").map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.training_centers?.name} ({invoice.total_amount?.toFixed(2)} €)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Importe</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Método de Pago</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                      <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Referencia de Transacción</Label>
                  <Input
                    value={formData.transaction_reference}
                    onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                    placeholder="Ej: TRX-12345"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional sobre el pago"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Registrar Pago</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Centro</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay pagos registrados
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.payment_date), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                  <TableCell className="font-medium">{payment.invoices?.invoice_number}</TableCell>
                  <TableCell>{payment.training_centers?.name}</TableCell>
                  <TableCell>{payment.amount.toFixed(2)} €</TableCell>
                  <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                  <TableCell>{payment.transaction_reference || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
