import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function ClientBilling() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          Facturación
        </h1>
        <p className="text-muted-foreground mt-2">Consulta y descarga tus facturas</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay facturas disponibles</p>
            <p className="text-muted-foreground">Tus facturas aparecerán aquí después de realizar una compra</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
