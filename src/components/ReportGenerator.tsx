import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, FileText, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReportGeneratorProps {
  reportType: string;
  reportName: string;
  courseId?: string;
  studentId?: string;
  data: any;
  filters?: Record<string, any>;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#82ca9d", "#ffc658"];

export const ReportGenerator = ({
  reportType,
  reportName,
  courseId,
  studentId,
  data,
  filters = {},
}: ReportGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const logReportGeneration = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await supabase.from("report_audit_log").insert({
        generated_by: userData.user.id,
        report_type: reportType,
        report_name: reportName,
        filters_applied: filters,
        course_id: courseId,
        student_id: studentId,
        file_format: "pdf",
        metadata: {
          timestamp: new Date().toISOString(),
          data_summary: {
            total_records: Array.isArray(data) ? data.length : Object.keys(data).length,
          },
        },
      });
    } catch (error) {
      console.error("Error logging report:", error);
    }
  };

  const generatePDF = async () => {
    try {
      setGenerating(true);

      // Create a temporary container for the report
      const reportContainer = document.createElement("div");
      reportContainer.style.width = "800px";
      reportContainer.style.padding = "40px";
      reportContainer.style.backgroundColor = "white";
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      document.body.appendChild(reportContainer);

      // Header
      const header = document.createElement("div");
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: hsl(var(--primary)); font-size: 24px; margin-bottom: 10px;">${reportName}</h1>
          <p style="color: #666; font-size: 14px;">Generado el ${new Date().toLocaleString("es-ES")}</p>
          <p style="color: #666; font-size: 12px; margin-top: 5px;">Sistema de Auditoría SEPE</p>
        </div>
      `;
      reportContainer.appendChild(header);

      // Summary section
      if (data.summary) {
        const summarySection = document.createElement("div");
        summarySection.style.marginBottom = "30px";
        summarySection.innerHTML = `
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid hsl(var(--primary)); padding-bottom: 5px;">Resumen General</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            ${Object.entries(data.summary)
              .map(
                ([key, value]) => `
              <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p style="color: #666; font-size: 12px; margin-bottom: 5px;">${key}</p>
                <p style="color: #333; font-size: 20px; font-weight: bold;">${value}</p>
              </div>
            `
              )
              .join("")}
          </div>
        `;
        reportContainer.appendChild(summarySection);
      }

      // Charts section
      if (data.charts) {
        const chartsSection = document.createElement("div");
        chartsSection.style.marginBottom = "30px";
        chartsSection.innerHTML = `
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid hsl(var(--primary)); padding-bottom: 5px;">Análisis Gráfico</h2>
        `;

        // Render each chart
        for (const chart of data.charts) {
          const chartDiv = document.createElement("div");
          chartDiv.style.marginBottom = "20px";
          chartDiv.style.height = "300px";

          const chartTitle = document.createElement("h3");
          chartTitle.style.fontSize = "14px";
          chartTitle.style.color = "#666";
          chartTitle.style.marginBottom = "10px";
          chartTitle.textContent = chart.title;
          chartsSection.appendChild(chartTitle);

          chartsSection.appendChild(chartDiv);
          reportContainer.appendChild(chartsSection);

          // Render chart based on type
          const chartContainer = document.createElement("div");
          chartContainer.style.width = "100%";
          chartContainer.style.height = "300px";
          chartDiv.appendChild(chartContainer);

          // Note: In real implementation, you'd render the recharts component here
          // For now, we'll add a placeholder
          chartContainer.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; border-radius: 8px;">
            <p style="color: #666;">Gráfica: ${chart.title}</p>
          </div>`;
        }
      }

      // Data table
      if (data.table) {
        const tableSection = document.createElement("div");
        tableSection.style.marginBottom = "30px";
        tableSection.innerHTML = `
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid hsl(var(--primary)); padding-bottom: 5px;">Datos Detallados</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: hsl(var(--primary)); color: white;">
                ${data.table.headers.map((h: string) => `<th style="padding: 10px; text-align: left;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.table.rows
                .map(
                  (row: any[], i: number) => `
                <tr style="background: ${i % 2 === 0 ? "#f8f9fa" : "white"}; border-bottom: 1px solid #ddd;">
                  ${row.map((cell) => `<td style="padding: 10px;">${cell}</td>`).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
        reportContainer.appendChild(tableSection);
      }

      // Footer
      const footer = document.createElement("div");
      footer.style.marginTop = "40px";
      footer.style.borderTop = "1px solid #ddd";
      footer.style.paddingTop = "20px";
      footer.innerHTML = `
        <p style="color: #666; font-size: 10px; text-align: center;">
          Este informe ha sido generado automáticamente por el sistema de auditoría SEPE<br>
          Documento confidencial - Solo para uso autorizado
        </p>
      `;
      reportContainer.appendChild(footer);

      // Convert to canvas
      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Clean up
      document.body.removeChild(reportContainer);

      // Save PDF
      const fileName = `${reportName.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      // Log the report generation
      await logReportGeneration();

      toast({
        title: "Informe generado",
        description: "El informe se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el informe",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generatePDF} disabled={generating} className="gap-2">
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Descargar Informe PDF
        </>
      )}
    </Button>
  );
};

// Preview component for showing charts before generating PDF
export const ReportPreview = ({ data }: { data: any }) => {
  if (!data.charts) return null;

  return (
    <div className="space-y-6">
      {data.charts.map((chart: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {chart.title}
            </CardTitle>
            {chart.description && <CardDescription>{chart.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <>
                {chart.type === "bar" && (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                )}
                {chart.type === "line" && (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                )}
                {chart.type === "pie" && (
                  <PieChart>
                    <Pie 
                      data={chart.data} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={(entry) => entry.name} 
                      outerRadius={100} 
                      dataKey="value"
                      fill="hsl(var(--primary))"
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
