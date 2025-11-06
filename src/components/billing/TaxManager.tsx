import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface TaxConfig {
  id: string;
  name: string;
  tax_type: string;
  rate: number;
  applies_to: string;
  is_active: boolean;
}

interface TaxManagerProps {
  taxes: TaxConfig[];
  onUpdate: () => void;
}

export function TaxManager({ taxes, onUpdate }: TaxManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tax_type: "vat",
    rate: "",
    applies_to: "all",
  });

  const handleCreate = async () => {
    try {
      const { error } = await supabase.from("tax_configurations").insert([{
        ...formData,
        rate: parseFloat(formData.rate),
      }]);
      if (error) throw error;
      toast.success("Configuración de impuesto creada");
      setDialogOpen(false);
      setFormData({ name: "", tax_type: "vat", rate: "", applies_to: "all" });
      onUpdate();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Impuestos</CardTitle>
            <CardDescription>Configura tasas de IVA y retenciones</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nueva Configuración</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Configuración Fiscal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={formData.tax_type} onValueChange={(value) => setFormData({ ...formData, tax_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vat">IVA</SelectItem>
                      <SelectItem value="retention">Retención</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tasa (%)</Label>
                  <Input type="number" step="0.01" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Crear</Button>
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
              <TableHead>Tipo</TableHead>
              <TableHead>Tasa</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxes.map((tax) => (
              <TableRow key={tax.id}>
                <TableCell className="font-medium">{tax.name}</TableCell>
                <TableCell className="capitalize">{tax.tax_type}</TableCell>
                <TableCell>{tax.rate}%</TableCell>
                <TableCell>
                  <Badge variant={tax.is_active ? "default" : "secondary"}>
                    {tax.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
