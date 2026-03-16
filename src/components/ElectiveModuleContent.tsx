import { useState, useCallback } from "react";
import { ItinerarySelector } from "@/components/ItinerarySelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SelfAssessmentQuiz } from "@/components/SelfAssessmentQuiz";
import { FileText, ClipboardList, PenTool, Upload, ExternalLink, Plus, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElectiveModuleContentProps {
  module: any;
  moduleUnits: any[];
  courseId: string;
  userRole: string;
  openPdfViaBlob: (url: string, filename: string) => Promise<void>;
  openActivityManager: (unitId: string, unitTitle: string) => void;
  setManualUploaderModuleId: (id: string) => void;
  setManualUploaderModuleTitle: (title: string) => void;
  setManualUploaderUnitId: (id: string | undefined) => void;
  setManualUploaderOpen: (open: boolean) => void;
}

export function ElectiveModuleContent({
  module,
  moduleUnits,
  courseId,
  userRole,
  openPdfViaBlob,
  openActivityManager,
  setManualUploaderModuleId,
  setManualUploaderModuleTitle,
  setManualUploaderUnitId,
  setManualUploaderOpen,
}: ElectiveModuleContentProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const handleSelectionChange = useCallback((unitId: string | null) => {
    setSelectedUnitId(unitId);
  }, []);

  // Filter units: if student selected, show only selected. Admins/teachers see all.
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher';
  const visibleUnits = selectedUnitId && !isAdmin
    ? moduleUnits.filter((u: any) => u.id === selectedUnitId)
    : selectedUnitId
      ? moduleUnits  // admins see all but selection is shown
      : [];          // no selection yet = show selector only

  const handlePdfClick = async (unitId: string, unitTitle: string) => {
    let pdfData: any[] | null = null;
    const { data: exactMatch } = await (supabase as any)
      .from('module_content').select('file_path, title')
      .eq('module_id', module.id).eq('content_type', 'manual_pdf')
      .eq('formative_unit_id', unitId).limit(1);
    pdfData = exactMatch;
    if (!pdfData || pdfData.length === 0) {
      const { data: fallback } = await (supabase as any)
        .from('module_content').select('file_path, title')
        .eq('module_id', module.id).eq('content_type', 'manual_pdf')
        .is('formative_unit_id', null).order('created_at', { ascending: false }).limit(1);
      pdfData = fallback;
    }
    if (pdfData && pdfData.length > 0 && pdfData[0].file_path) {
      const filePath = pdfData[0].file_path;
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        await openPdfViaBlob(filePath, `${unitTitle || 'temario'}.pdf`);
      } else {
        const { data: signedData } = await supabase.storage
          .from('module-content').createSignedUrl(filePath, 3600);
        if (signedData?.signedUrl) {
          await openPdfViaBlob(signedData.signedUrl, `${unitTitle || 'temario'}.pdf`);
        }
      }
    } else {
      toast({ title: "Sin PDF", description: "Aún no se ha subido el PDF de esta unidad.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <ItinerarySelector
        moduleId={module.id}
        formativeUnits={moduleUnits}
        onSelectionChange={handleSelectionChange}
      />

      {visibleUnits.map((unit: any) => {
        const unitEvals = (module.evaluations || []).filter((ev: any) => ev.formative_unit_id === unit.id);
        const hasTest = unitEvals.length > 0;
        const isSelected = unit.id === selectedUnitId;

        return (
          <div key={unit.id} className={`border rounded-lg p-4 space-y-3 ${isSelected ? 'border-primary/40 bg-primary/5' : ''}`}>
            <h4 className="font-medium text-sm">{unit.title}</h4>
            
            {/* PDF */}
            <div 
              className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-950/40 transition-colors"
              onClick={() => handlePdfClick(unit.id, unit.title)}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded"><FileText className="h-4 w-4 text-blue-600" /></div>
              <div className="flex-1">
                <span className="text-sm font-medium">{unit.title}</span>
                <p className="text-xs text-muted-foreground">PDF del temario</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                  e.stopPropagation();
                  handlePdfClick(unit.id, unit.title);
                }}><ExternalLink className="h-3 w-3" />Ver PDF</Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                    e.stopPropagation();
                    setManualUploaderModuleId(module.id);
                    setManualUploaderModuleTitle(unit.title);
                    setManualUploaderUnitId(unit.id);
                    setManualUploaderOpen(true);
                  }}><Upload className="h-3 w-3" />Subir</Button>
                )}
              </div>
            </div>

            {/* Test */}
            <div 
              className={`flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 ${hasTest && userRole === 'student' ? 'cursor-pointer hover:bg-purple-100/50' : ''}`}
              onClick={() => { if (hasTest && userRole === 'student') navigate(`/evaluation/${unitEvals[0].id}?courseId=${courseId}`); }}
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded"><ClipboardList className="h-4 w-4 text-purple-600" /></div>
              <div className="flex-1">
                <span className="text-sm font-medium">Test del Itinerario</span>
                <p className="text-xs text-muted-foreground">{hasTest ? unitEvals[0].title : 'Examen tipo test'}</p>
              </div>
              {hasTest && userRole === 'student' && (
                <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/evaluation/${unitEvals[0].id}?courseId=${courseId}`);
                }}><PlayCircle className="h-3 w-3" />Realizar Test</Button>
              )}
            </div>

            {/* Activity */}
            <div className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded"><PenTool className="h-4 w-4 text-green-600" /></div>
              <div className="flex-1">
                <span className="text-sm font-medium">Actividad / Tarea</span>
                <p className="text-xs text-muted-foreground">Ejercicio práctico</p>
              </div>
              {isAdmin && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => openActivityManager(unit.id, unit.title)}><Plus className="h-3 w-3" />Gestionar</Button>
              )}
            </div>

            <SelfAssessmentQuiz courseId={courseId} formativeUnitId={unit.id} formativeUnitTitle={unit.title} />
          </div>
        );
      })}
    </div>
  );
}
