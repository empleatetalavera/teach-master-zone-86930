import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileSignature, Eye, Download, Building2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Contract {
  id: string;
  training_center_id: string;
  signer_name: string;
  signer_dni: string;
  signer_position: string;
  signer_email: string;
  contract_type: string;
  contract_version: string;
  signed_at: string;
  signature_data: string;
  contract_content: string;
  training_centers?: {
    name: string;
  };
}

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractDialog, setShowContractDialog] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("center_contracts")
        .select(`
          *,
          training_centers (name)
        `)
        .order("signed_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      console.error("Error loading contracts:", error);
      toast.error("Error al cargar los contratos");
    } finally {
      setIsLoading(false);
    }
  };

  const viewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractDialog(true);
  };

  const downloadContract = (contract: Contract) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Contrato - ${contract.training_centers?.name || "Centro"}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { text-align: center; font-size: 18px; }
          h2 { font-size: 16px; margin-top: 20px; }
          h3 { font-size: 14px; margin-top: 15px; }
          p, li { font-size: 12px; line-height: 1.6; }
          .signature-section { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
          .signature-img { max-width: 200px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        ${contract.contract_content}
        <div class="signature-section">
          <h3>Firma Digital:</h3>
          <img src="${contract.signature_data}" class="signature-img" alt="Firma" />
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_${contract.training_centers?.name?.replace(/\s+/g, "_") || "centro"}_${format(new Date(contract.signed_at), "yyyy-MM-dd")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSignature className="w-8 h-8" />
          Contratos Firmados
        </h1>
        <p className="text-muted-foreground">
          Gestión de contratos de uso del campus firmados por los centros de formación
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => {
                const signedDate = new Date(c.signed_at);
                const now = new Date();
                return signedDate.getMonth() === now.getMonth() && 
                       signedDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Versión Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Contratos</CardTitle>
          <CardDescription>
            Lista de todos los contratos firmados por los centros de formación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando contratos...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay contratos firmados todavía
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centro de Formación</TableHead>
                  <TableHead>Firmante</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Fecha Firma</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {contract.training_centers?.name || "Centro desconocido"}
                      </div>
                    </TableCell>
                    <TableCell>{contract.signer_name}</TableCell>
                    <TableCell>{contract.signer_dni}</TableCell>
                    <TableCell>{contract.signer_position}</TableCell>
                    <TableCell>
                      {format(new Date(contract.signed_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">v{contract.contract_version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewContract(contract)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadContract(contract)}
                        >
                          <Download className="w-4 h-4" />
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

      {/* Contract View Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              Contrato - {selectedContract?.training_centers?.name}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            {selectedContract && (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Firmante</p>
                    <p className="font-medium">{selectedContract.signer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">DNI/NIE</p>
                    <p className="font-medium">{selectedContract.signer_dni}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo</p>
                    <p className="font-medium">{selectedContract.signer_position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedContract.signer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Firma</p>
                    <p className="font-medium">
                      {format(new Date(selectedContract.signed_at), "dd MMMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Versión</p>
                    <p className="font-medium">v{selectedContract.contract_version}</p>
                  </div>
                </div>

                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedContract.contract_content }}
                />

                {selectedContract.signature_data && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Firma Digital:</p>
                    <img 
                      src={selectedContract.signature_data} 
                      alt="Firma" 
                      className="border rounded max-w-[200px]"
                    />
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
