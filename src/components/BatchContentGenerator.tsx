import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

interface UnitWithPdf {
  contentId: string;
  moduleId: string;
  moduleTitle: string;
  formativeUnitId: string;
  unitTitle: string;
  filePath: string;
  courseId: string;
}

type UnitStatus = "pending" | "extracting" | "generating" | "done" | "error";

interface BatchContentGeneratorProps {
  courseId: string;
}

export function BatchContentGenerator({ courseId }: BatchContentGeneratorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState<UnitWithPdf[]>([]);
  const [statuses, setStatuses] = useState<Record<string, UnitStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { slides: number; activities: number; questions: number }>>({});
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("module_content")
        .select(`
          id, module_id, formative_unit_id, file_path, title,
          modules!inner(title, order_index, course_id),
          formative_units(title, order_index)
        `)
        .eq("content_type", "manual_pdf")
        .eq("modules.course_id", courseId)
        .order("modules(order_index)")
        .not("formative_unit_id", "is", null);

      if (error) throw error;

      const mapped: UnitWithPdf[] = (data || []).map((item: any) => ({
        contentId: item.id,
        moduleId: item.module_id,
        moduleTitle: item.modules?.title || "",
        formativeUnitId: item.formative_unit_id,
        unitTitle: item.formative_units?.title || item.title || "",
        filePath: item.file_path,
        courseId,
      }));

      // Sort by module order then unit order
      mapped.sort((a: UnitWithPdf, b: UnitWithPdf) => {
        const modA = data.find((d: any) => d.id === a.contentId);
        const modB = data.find((d: any) => d.id === b.contentId);
        const mOrder = (modA?.modules?.order_index || 0) - (modB?.modules?.order_index || 0);
        if (mOrder !== 0) return mOrder;
        return (modA?.formative_units?.order_index || 0) - (modB?.formative_units?.order_index || 0);
      });

      setUnits(mapped);
      const initial: Record<string, UnitStatus> = {};
      mapped.forEach((u: UnitWithPdf) => { initial[u.contentId] = "pending"; });
      setStatuses(initial);
      setErrors({});
      setResults({});
    } catch (e: any) {
      console.error("Error loading units:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  const getPdfUrl = async (filePath: string): Promise<string | null> => {
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const { data } = await supabase.storage.from("module-content").createSignedUrl(filePath, 3600);
    return data?.signedUrl || null;
  };

  const extractPdfText = async (url: string): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n\n";
    }
    return text;
  };

  const processUnit = async (unit: UnitWithPdf): Promise<void> => {
    // Extract PDF text
    setStatuses(prev => ({ ...prev, [unit.contentId]: "extracting" }));
    
    const pdfUrl = await getPdfUrl(unit.filePath);
    if (!pdfUrl) {
      setStatuses(prev => ({ ...prev, [unit.contentId]: "error" }));
      setErrors(prev => ({ ...prev, [unit.contentId]: "No se pudo obtener la URL del PDF" }));
      return;
    }

    let pdfText = "";
    try {
      pdfText = await extractPdfText(pdfUrl);
    } catch (e) {
      console.error("PDF extraction error:", e);
      // Continue without text - the edge function will try other sources
    }

    // Generate content via AI
    setStatuses(prev => ({ ...prev, [unit.contentId]: "generating" }));

    const { data, error } = await supabase.functions.invoke("generate-scorm-from-pdf", {
      body: {
        unitTitle: unit.unitTitle,
        formativeUnitId: unit.formativeUnitId,
        courseId: unit.courseId,
        pdfTextContent: pdfText,
        generateSlides: true,
        generateActivities: true,
        generateTests: true,
      },
    });

    if (error) {
      setStatuses(prev => ({ ...prev, [unit.contentId]: "error" }));
      setErrors(prev => ({ ...prev, [unit.contentId]: error.message }));
      return;
    }

    if (data?.error) {
      setStatuses(prev => ({ ...prev, [unit.contentId]: "error" }));
      setErrors(prev => ({ ...prev, [unit.contentId]: data.error }));
      return;
    }

    setStatuses(prev => ({ ...prev, [unit.contentId]: "done" }));
    setResults(prev => ({
      ...prev,
      [unit.contentId]: {
        slides: data.slideCount || 0,
        activities: data.activityCount || 0,
        questions: data.questionCount || 0,
      },
    }));
  };

  const runBatch = async () => {
    setRunning(true);
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (statuses[unit.contentId] === "done") continue; // Skip already done
      
      setCurrentIndex(i);
      
      try {
        await processUnit(unit);
      } catch (e: any) {
        console.error(`Error processing ${unit.unitTitle}:`, e);
        setStatuses(prev => ({ ...prev, [unit.contentId]: "error" }));
        setErrors(prev => ({ ...prev, [unit.contentId]: e.message }));
      }

      // Small delay between calls to avoid rate limits
      if (i < units.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    setRunning(false);
    setCurrentIndex(-1);
    toast({
      title: "¡Generación masiva completada!",
      description: `Se han procesado ${units.length} unidades.`,
    });
  };

  const doneCount = Object.values(statuses).filter(s => s === "done").length;
  const errorCount = Object.values(statuses).filter(s => s === "error").length;
  const progressPercent = units.length > 0 ? ((doneCount + errorCount) / units.length) * 100 : 0;

  const statusIcon = (status: UnitStatus) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "extracting": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "generating": return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "done": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const statusLabel = (status: UnitStatus) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "extracting": return "Extrayendo PDF...";
      case "generating": return "Generando con IA...";
      case "done": return "Completado";
      case "error": return "Error";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && units.length === 0) loadUnits(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generar todo con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generación masiva de contenido
          </DialogTitle>
          <DialogDescription>
            Genera slides interactivas, actividades y tests para todas las unidades formativas con PDF subido.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay unidades con PDFs subidos para generar contenido.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {running && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso: {doneCount + errorCount} / {units.length}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {units.map((unit, i) => {
                const status = statuses[unit.contentId] || "pending";
                const result = results[unit.contentId];
                const error = errors[unit.contentId];
                
                return (
                  <div
                    key={unit.contentId}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                      status === "generating" || status === "extracting"
                        ? "border-primary/30 bg-primary/5"
                        : status === "done"
                        ? "border-green-200 bg-green-50/50 dark:bg-green-950/20"
                        : status === "error"
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border"
                    }`}
                  >
                    <div className="pt-0.5">{statusIcon(status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{unit.unitTitle}</div>
                      <div className="text-xs text-muted-foreground truncate">{unit.moduleTitle}</div>
                      {status !== "pending" && (
                        <div className="mt-1">
                          {(status === "extracting" || status === "generating") && (
                            <Badge variant="outline" className="text-xs">{statusLabel(status)}</Badge>
                          )}
                          {status === "done" && result && (
                            <div className="flex gap-2 flex-wrap">
                              {result.slides > 0 && <Badge variant="secondary" className="text-xs">{result.slides} slides</Badge>}
                              {result.activities > 0 && <Badge variant="secondary" className="text-xs">{result.activities} actividades</Badge>}
                              {result.questions > 0 && <Badge variant="secondary" className="text-xs">{result.questions} preguntas</Badge>}
                            </div>
                          )}
                          {status === "error" && (
                            <p className="text-xs text-destructive">{error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                {units.length} unidades · ~{units.length * 2} min estimados
              </div>
              <Button
                onClick={runBatch}
                disabled={running}
                className="gap-2"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando ({doneCount + errorCount + 1}/{units.length})...
                  </>
                ) : doneCount > 0 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Continuar generación
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Iniciar generación masiva
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
