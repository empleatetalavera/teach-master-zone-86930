import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Eye } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
}

interface TemplatesManagerProps {
  templates: Template[];
  onUpdate: () => void;
}

export function TemplatesManager({ templates, onUpdate }: TemplatesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    header_text: "",
    footer_text: "",
    logo_url: "",
  });

  const handleCreate = async () => {
    try {
      const { error } = await supabase.from("invoice_templates").insert([formData]);
      if (error) throw error;
      toast.success("Plantilla creada exitosamente");
      setDialogOpen(false);
      setFormData({ name: "", description: "", header_text: "", footer_text: "", logo_url: "" });
      onUpdate();
    } catch (error: any) {
      toast.error("Error al crear plantilla: " + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plantillas de Factura</CardTitle>
            <CardDescription>Gestiona plantillas personalizadas para tus facturas</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nueva Plantilla</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Plantilla de Factura</DialogTitle>
                <DialogDescription>Personaliza el aspecto de tus facturas</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label>Nombre de la Plantilla</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Plantilla Estándar"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el uso de esta plantilla"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>URL del Logo</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Texto de Cabecera</Label>
                  <Textarea
                    value={formData.header_text}
                    onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                    placeholder="Texto que aparecerá en la parte superior de la factura"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Texto de Pie de Página</Label>
                  <Textarea
                    value={formData.footer_text}
                    onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                    placeholder="Texto que aparecerá en la parte inferior de la factura"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Crear Plantilla</Button>
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
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay plantillas creadas
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {template.is_default && <Badge variant="default">Por Defecto</Badge>}
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
