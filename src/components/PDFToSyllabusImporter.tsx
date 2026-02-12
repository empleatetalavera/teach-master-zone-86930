import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, FileText, Loader2, Sparkles, CheckCircle, AlertCircle,
  FileUp, Wand2, Database
} from "lucide-react";

interface PDFToSyllabusImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitTitle: string;
  moduleId?: string; // Optional - if provided and unitId is actually a moduleId, will create UF automatically
  onImportComplete: () => void;
}

type ImportStep = 'upload' | 'processing' | 'generating' | 'saving' | 'complete' | 'error';

interface SlideData {
  slide_type: string;
  title: string;
  section_title: string | null;
  content: string | null;
  key_terms: string[] | null;
  table_data: { headers: string[]; rows: string[][] } | null;
  quiz_data: { question: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation: string; hint?: string } | null;
  checklist_items: { id: string; text: string }[] | null;
}

export function PDFToSyllabusImporter({ 
  open, 
  onOpenChange, 
  unitId, 
  unitTitle,
  moduleId,
  onImportComplete 
}: PDFToSyllabusImporterProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<ImportStep>('upload');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [generateQuizzes, setGenerateQuizzes] = useState(true);
  const [generateExercises, setGenerateExercises] = useState(true);
  const [generatedSlides, setGeneratedSlides] = useState<SlideData[]>([]);
  const [error, setError] = useState<string>('');
  const [actualUnitId, setActualUnitId] = useState<string>(unitId);

  const resetState = () => {
    setStep('upload');
    setProgress(0);
    setSelectedFile(null);
    setPdfContent('');
    setGeneratedSlides([]);
    setError('');
    setActualUnitId(unitId);
  };

  // Check if unitId is actually a module ID (no matching formative unit)
  const ensureFormativeUnit = async (): Promise<string> => {
    // First, check if unitId exists as a formative_unit
    const { data: existingUnit } = await supabase
      .from('formative_units')
      .select('id')
      .eq('id', unitId)
      .maybeSingle();

    if (existingUnit) {
      return unitId; // It's a valid formative unit
    }

    // unitId is actually a module ID - check if moduleId prop was passed
    const moduleIdToUse = moduleId || unitId;

    // Create a new formative unit for this module
    const { data: newUnit, error: createError } = await supabase
      .from('formative_units')
      .insert({
        module_id: moduleIdToUse,
        title: unitTitle || 'Contenido del Módulo',
        description: 'Unidad formativa creada automáticamente al importar PDF',
        order_index: 1,
        is_active: true
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating formative unit:', createError);
      throw new Error('No se pudo crear la unidad formativa automáticamente');
    }

    toast({
      title: "Unidad formativa creada",
      description: "Se ha creado una unidad formativa para almacenar el contenido",
    });

    return newUnit.id;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ 
        title: "Formato no válido", 
        description: "Por favor, selecciona un archivo PDF", 
        variant: "destructive" 
      });
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      toast({ 
        title: "Archivo muy grande", 
        description: "El archivo no debe superar los 500MB", 
        variant: "destructive" 
      });
      return;
    }

    setSelectedFile(file);
    setStep('processing');
    setProgress(10);

    try {
      // Extract text from PDF using pdf.js or similar
      const text = await extractTextFromPDF(file);
      setPdfContent(text);
      setProgress(30);
      setStep('upload'); // Back to upload to show options before generating
    } catch (err) {
      setError('Error al procesar el PDF. Asegúrate de que no está protegido.');
      setStep('error');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    // Limit to first 80 pages to avoid excessive processing
    const maxPages = Math.min(pdf.numPages, 80);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + '\n\n';
      // Update progress during extraction (10-30%)
      setProgress(10 + Math.round((i / maxPages) * 20));
    }

    text = text.trim();
    
    if (text.length < 100) {
      text = `[Contenido del PDF: ${file.name}]\n\nEl texto del PDF no pudo extraerse completamente. Por favor, usa un PDF con texto seleccionable.`;
    }

    return text;
  };

  const handleGenerateSlides = async () => {
    if (!pdfContent) {
      toast({ title: "Error", description: "No hay contenido del PDF para procesar", variant: "destructive" });
      return;
    }

    setStep('generating');
    setProgress(35);

    try {
      // Ensure we have a valid formative unit
      const validUnitId = await ensureFormativeUnit();
      setActualUnitId(validUnitId);
      setProgress(40);

      const { data, error } = await supabase.functions.invoke('generate-syllabus-from-pdf', {
        body: {
          pdfContent: pdfContent.substring(0, 30000), // Limit content to avoid token limits
          unitTitle,
          generateQuizzes,
          generateExercises,
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedSlides(data.slides || []);
      setProgress(80);
      
      // Auto-save to database with the valid unit ID
      await saveSlides(data.slides || [], validUnitId);
      
    } catch (err) {
      console.error('Error generating slides:', err);
      setError(err instanceof Error ? err.message : 'Error al generar los slides');
      setStep('error');
    }
  };

  const saveSlides = async (slides: SlideData[], targetUnitId?: string) => {
    setStep('saving');
    setProgress(90);

    const unitIdToUse = targetUnitId || actualUnitId;

    try {
      // Get current max order_index
      const { data: existingSlides } = await supabase
        .from('unit_syllabus_slides')
        .select('order_index')
        .eq('formative_unit_id', unitIdToUse)
        .order('order_index', { ascending: false })
        .limit(1);

      let startIndex = (existingSlides?.[0]?.order_index || 0) + 1;

      // Insert all slides
      const slidesToInsert = slides.map((slide, idx) => ({
        formative_unit_id: unitIdToUse,
        slide_type: slide.slide_type,
        title: slide.title,
        section_title: slide.section_title,
        content: slide.content,
        key_terms: slide.key_terms,
        order_index: startIndex + idx,
        is_active: true,
        table_data: slide.table_data,
        quiz_data: slide.quiz_data,
        checklist_items: slide.checklist_items,
      }));

      const { error: insertError } = await supabase
        .from('unit_syllabus_slides')
        .insert(slidesToInsert);

      if (insertError) throw insertError;

      setProgress(100);
      setStep('complete');
      
      toast({ 
        title: "¡Importación completada!", 
        description: `Se han creado ${slides.length} slides interactivos` 
      });

    } catch (err) {
      console.error('Error saving slides:', err);
      setError('Error al guardar los slides en la base de datos');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'complete') {
      onImportComplete();
    }
    resetState();
    onOpenChange(false);
  };

  const getStepIcon = (currentStep: ImportStep) => {
    switch (currentStep) {
      case 'upload': return <FileUp className="h-5 w-5" />;
      case 'processing': return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'generating': return <Wand2 className="h-5 w-5 animate-pulse" />;
      case 'saving': return <Database className="h-5 w-5 animate-pulse" />;
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStepText = (currentStep: ImportStep) => {
    switch (currentStep) {
      case 'upload': return 'Seleccionar PDF';
      case 'processing': return 'Procesando PDF...';
      case 'generating': return 'Generando slides con IA...';
      case 'saving': return 'Guardando en base de datos...';
      case 'complete': return '¡Completado!';
      case 'error': return 'Error';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Importar PDF a Temario Interactivo
          </DialogTitle>
          <DialogDescription>
            Convierte automáticamente un PDF en slides interactivos con IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStepIcon(step)}
                <span className="font-medium">{getStepText(step)}</span>
              </div>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Upload step */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* File input */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  selectedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Arrastra un PDF o haz clic para seleccionar</p>
                    <p className="text-sm text-muted-foreground mt-1">Máximo 500MB</p>
                  </>
                )}
              </div>

              {/* Options */}
              {selectedFile && pdfContent && (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm">Opciones de generación</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="quizzes" 
                          checked={generateQuizzes}
                          onCheckedChange={(checked) => setGenerateQuizzes(checked === true)}
                        />
                        <Label htmlFor="quizzes" className="text-sm cursor-pointer">
                          Generar tests de autoevaluación
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="exercises" 
                          checked={generateExercises}
                          onCheckedChange={(checked) => setGenerateExercises(checked === true)}
                        />
                        <Label htmlFor="exercises" className="text-sm cursor-pointer">
                          Generar ejercicios prácticos
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      La IA generará slides de contenido, tests, tablas, checklists y ejercicios 
                      basándose en el contenido del PDF.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleGenerateSlides} className="w-full" size="lg">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar Temario Interactivo
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Processing/Generating/Saving steps */}
          {(step === 'processing' || step === 'generating' || step === 'saving') && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                {step === 'processing' && 'Extrayendo texto del PDF...'}
                {step === 'generating' && 'La IA está analizando el contenido y creando slides interactivos...'}
                {step === 'saving' && 'Guardando slides en la base de datos...'}
              </p>
              {step === 'generating' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Esto puede tardar hasta 1 minuto dependiendo del tamaño del documento
                </p>
              )}
            </div>
          )}

          {/* Complete step */}
          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">¡Importación completada!</h3>
              <p className="text-muted-foreground mb-4">
                Se han creado <span className="font-bold text-primary">{generatedSlides.length}</span> slides interactivos
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2 text-sm">Slides generados:</h4>
                <ScrollArea className="h-32">
                  <ul className="text-sm space-y-1">
                    {generatedSlides.map((slide, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-muted-foreground">{idx + 1}.</span>
                        <span className="capitalize text-xs px-1.5 py-0.5 rounded bg-primary/10">
                          {slide.slide_type}
                        </span>
                        <span className="truncate">{slide.title}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
              <Button onClick={handleClose} className="mt-4">
                Ir al Editor
              </Button>
            </div>
          )}

          {/* Error step */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error en la importación</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={resetState} variant="outline">
                Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
