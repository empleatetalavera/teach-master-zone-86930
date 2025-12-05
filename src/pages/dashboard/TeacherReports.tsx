import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, BarChart3 } from "lucide-react";
import SEPEReportGenerator from "@/components/reports/SEPEReportGenerator";

export default function TeacherReports() {
  const [activeTab, setActiveTab] = useState("sepe");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
        <p className="text-muted-foreground mt-2">
          Genera informes detallados para el SEPE y seguimiento de estudiantes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="sepe" className="gap-2">
            <FileDown className="h-4 w-4" />
            Informes SEPE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sepe">
          <SEPEReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
