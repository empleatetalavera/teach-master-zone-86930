import { Card, CardContent } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";

export default function ConsumptionHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-8 w-8" />
          Historial de consumo
        </h1>
        <p className="text-muted-foreground mt-2">
          Consulta el historial de uso de tus licencias de formación
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HistoryIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay historial de consumo</p>
            <p className="text-muted-foreground">
              El historial de uso de licencias aparecerá aquí una vez comiences a utilizar tus cursos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
