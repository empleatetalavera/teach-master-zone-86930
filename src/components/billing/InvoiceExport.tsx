import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Invoice {
  invoice_number: string;
  training_centers?: { name: string };
  issue_date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
}

interface InvoiceExportProps {
  invoices: Invoice[];
}

export function InvoiceExport({ invoices }: InvoiceExportProps) {
  const exportToCSV = () => {
    try {
      const headers = [
        "Número Factura",
        "Centro",
        "Fecha Emisión",
        "Fecha Vencimiento",
        "Importe Base",
        "IVA",
        "Total",
        "Estado",
        "Fecha Pago",
        "Notas"
      ];

      const csvData = invoices.map(inv => [
        inv.invoice_number,
        inv.training_centers?.name || "",
        format(new Date(inv.issue_date), "dd/MM/yyyy"),
        format(new Date(inv.due_date), "dd/MM/yyyy"),
        inv.amount.toFixed(2),
        inv.tax_amount.toFixed(2),
        inv.total_amount.toFixed(2),
        inv.status,
        inv.payment_date ? format(new Date(inv.payment_date), "dd/MM/yyyy") : "",
        inv.notes || ""
      ]);

      const csv = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `facturas_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${invoices.length} facturas exportadas a CSV`);
    } catch (error: any) {
      toast.error("Error al exportar: " + error.message);
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Exportar CSV ({invoices.length})
    </Button>
  );
}
