import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InvoiceFiltersProps {
  centers: any[];
  filterCenter: string;
  setFilterCenter: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (value: string) => void;
  filterDateTo: string;
  setFilterDateTo: (value: string) => void;
  onClear: () => void;
}

export function InvoiceFilters({
  centers,
  filterCenter,
  setFilterCenter,
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  onClear
}: InvoiceFiltersProps) {
  const hasFilters = filterCenter || filterStatus || filterDateFrom || filterDateTo;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Centro</Label>
            <Select value={filterCenter} onValueChange={setFilterCenter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los centros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los centros</SelectItem>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Desde</Label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha Hasta</Label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
