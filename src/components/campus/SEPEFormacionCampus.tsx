import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModuleFormativeUnitManager } from "@/components/ModuleFormativeUnitManager";
import { SelfAssessmentQuiz } from "@/components/SelfAssessmentQuiz";
import { UFIntroductionSection } from "./UFIntroductionSection";
import { SupplementaryMaterialList } from "./SupplementaryMaterialList";
import { UFActivitiesList } from "./UFActivitiesList";
import { UFForumsList } from "./UFForumsList";
import { ModuleLibrary } from "./ModuleLibrary";
import TutoriasPresencialesGuide from "@/components/TutoriasPresencialesGuide";
import {
  BookOpen, Clock, FileText, CheckCircle2, ChevronDown, PlayCircle,
  Layers, PenTool, ClipboardList, ListChecks, Target, Upload,
  ExternalLink, Star, User, AlertCircle, MessageSquare, FileQuestion,
  CheckSquare, Plus, BarChart3
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  start_date?: string | null;
  end_date?: string | null;
  completed?: boolean;
  progress?: number;
  evaluations?: any[];
  activities?: any[];
  scorm_content?: any[];
  formative_units?: FormativeUnit[];
  concept_map_url?: string | null;
  objectives?: string | null;
  content?: string | null;
  forum_enabled?: boolean;
}

interface FormativeUnit {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  objectives: string | null;
  order_index: number;
  duration_hours: number | null;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  evaluations?: any[];
  activities?: any[];
}

interface UnitProgressData {
  content_progress: number;
  activities_progress: number;
  overall_progress: number;
}

interface SEPEFormacionCampusProps {
  modules: Module[];
  courseId: string;
  courseTitle: string;
  userRole: string | null;
  getUnitProgress: (unitId: string) => UnitProgressData;
  onOpenScormViewer: (unitId: string, unitTitle: string, moduleId?: string) => void;
  onOpenActivityManager: (unitId: string, unitTitle: string) => void;
  onOpenManualUploader: (moduleId: string, unitTitle: string, unitId: string) => void;
  onOpenScormAuthor: (moduleId: string, unitId: string, unitTitle: string) => void;
  onReloadCourse: () => void;
}

// Helper to fetch and open PDF
async function fetchAndOpenPDF(
  moduleId: string,
  unitId: string,
  toast: any
) {
  const openPdfViaBlob = async (url: string, filename = 'manual.pdf') => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  };

  const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

  let pdfData: any[] | null = null;
  const { data: exactMatch } = await (supabase as any)
    .from('module_content')
    .select('file_path, file_name, title')
    .eq('module_id', moduleId)
    .eq('content_type', 'manual_pdf')
    .eq('formative_unit_id', unitId)
    .limit(1);
  pdfData = exactMatch;

  if (!pdfData || pdfData.length === 0) {
    const { data: fallback } = await (supabase as any)
      .from('module_content')
      .select('file_path, file_name, title')
      .eq('module_id', moduleId)
      .eq('content_type', 'manual_pdf')
      .is('formative_unit_id', null)
      .order('created_at', { ascending: false })
      .limit(1);
    pdfData = fallback;
  }

  if (!pdfData || pdfData.length === 0 || !pdfData[0].file_path) {
    toast({ title: 'Sin PDF', description: 'Aún no se ha subido el PDF de esta unidad.', variant: 'destructive' });
    return;
  }

  try {
    const filePath = pdfData[0].file_path as string;
    const filename = pdfData[0].file_name || `${pdfData[0].title || 'manual'}.pdf`;

    if (isAbsoluteUrl(filePath)) {
      await openPdfViaBlob(filePath, filename);
      return;
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('module-content')
      .createSignedUrl(filePath, 3600);

    if (signedError) {
      throw signedError;
    }

    if (!signedData?.signedUrl) {
      throw new Error('signed-url-empty');
    }

    await openPdfViaBlob(signedData.signedUrl, filename);
  } catch (error) {
    console.error('Error opening unit PDF:', error);
    toast({ title: 'Error', description: 'No se pudo abrir el PDF', variant: 'destructive' });
  }
}

// Progress ring component
function ProgressRing({ value, size = 40, strokeWidth = 3 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 100 ? 'text-green-500' : value > 50 ? 'text-primary' : value > 0 ? 'text-amber-500' : 'text-muted-foreground/30';
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/30"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {value >= 100 ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <span className="text-[10px] font-bold text-foreground">{value}%</span>
        )}
      </div>
    </div>
  );
}

// Unit resource item
function UnitResourceItem({ 
  icon, 
  iconBg, 
  iconColor,
  title, 
  subtitle, 
  status,
  onClick,
  actions 
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  status?: 'completed' | 'in_progress' | 'pending' | 'locked';
  onClick?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div 
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm hover:border-primary/30 hover:bg-muted/30' : ''
      } ${status === 'completed' ? 'bg-green-50/30 dark:bg-green-950/10 border-green-200/50' : 'border-border/50'}`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate">{title}</span>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {status === 'completed' && (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      )}
      {actions && (
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
}

// Tabs row of formative units; clicking a pill shows that unit's panel below.
function ModuleUnitsTabs({
  moduleId,
  moduleEvaluations,
  moduleUnits,
  courseId,
  isAdmin,
  getUnitProgress,
  onOpenScormViewer,
  onOpenActivityManager,
  onOpenManualUploader,
  onOpenScormAuthor,
  navigate,
  toast,
}: {
  moduleId: string;
  moduleEvaluations: any[];
  moduleUnits: FormativeUnit[];
  courseId: string;
  isAdmin: boolean;
  getUnitProgress: (unitId: string) => UnitProgressData;
  onOpenScormViewer: (unitId: string, unitTitle: string, moduleId?: string) => void;
  onOpenActivityManager: (unitId: string, unitTitle: string) => void;
  onOpenManualUploader: (moduleId: string, unitTitle: string, unitId: string) => void;
  onOpenScormAuthor: (moduleId: string, unitId: string, unitTitle: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(moduleUnits[0]?.id ?? "");
  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  useEffect(() => {
    if (!moduleUnits.find((u) => u.id === selectedUnitId)) {
      setSelectedUnitId(moduleUnits[0]?.id ?? "");
    }
  }, [moduleUnits, selectedUnitId]);

  if (moduleUnits.length === 0) return null;

  const renderUnitPanel = (u: FormativeUnit, idx: number) => {
    const up = getUnitProgress(u.id);
    const evals = moduleEvaluations.filter((ev: any) => ev.formative_unit_id === u.id);
    const hasT = evals.length > 0;
    return (
      <div className="p-4 space-y-3 bg-teal-50/40 border-y border-teal-200/60">
        <div className="flex items-start gap-3 pb-2 border-b">
          <ProgressRing value={up.overall_progress} size={40} strokeWidth={3} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono shrink-0">UD{idx + 1}</Badge>
              {u.duration_hours && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />{u.duration_hours}h
                </span>
              )}
            </div>
            <h4 className="font-semibold text-sm mt-0.5">{u.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2.5 rounded-lg bg-muted/30 text-xs">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Contenido</span>
              <span className="font-medium">{up.content_progress}%</span>
            </div>
            <Progress value={up.content_progress} className="h-1.5" />
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Actividades</span>
              <span className="font-medium">{up.activities_progress}%</span>
            </div>
            <Progress value={up.activities_progress} className="h-1.5" />
          </div>
        </div>

        {u.objectives && (
          <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-start gap-2">
              <Target className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide">Objetivo</span>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">{u.objectives}</p>
              </div>
            </div>
          </div>
        )}

        <UnitResourceItem
          icon={<Layers className="h-4 w-4" />}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600"
          title="Contenido Interactivo"
          subtitle="Material multimedia, lecturas y autoevaluaciones"
          onClick={() => onOpenScormViewer(u.id, u.title, moduleId)}
          actions={isAdmin ? (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpenScormAuthor(moduleId, u.id, u.title)}>
              <Plus className="h-3 w-3" />Editor
            </Button>
          ) : undefined}
        />

        <UnitResourceItem
          icon={<FileText className="h-4 w-4" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600"
          title="Manual PDF de la unidad"
          subtitle="Contenido teórico imprimible"
          onClick={() => fetchAndOpenPDF(moduleId, u.id, toast)}
          actions={
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => fetchAndOpenPDF(moduleId, u.id, toast)}>
                <ExternalLink className="h-3 w-3" />PDF
              </Button>
              {isAdmin && (
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpenManualUploader(moduleId, u.title, u.id)}>
                  <Upload className="h-3 w-3" />Subir
                </Button>
              )}
            </>
          }
        />

        <SupplementaryMaterialList moduleId={moduleId} formativeUnitId={u.id} isAdmin={isAdmin} />
        <UFActivitiesList courseId={courseId} moduleId={moduleId} formativeUnitId={u.id} formativeUnitTitle={u.title} isAdmin={isAdmin} onOpenActivityManager={onOpenActivityManager} />
        <UFForumsList courseId={courseId} moduleId={moduleId} formativeUnitId={u.id} isAdmin={isAdmin} />

        <UnitResourceItem
          icon={<ClipboardList className="h-4 w-4" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600"
          title="Test Final de la Unidad"
          subtitle={hasT ? `Evaluación: ${evals[0].title}` : 'Pendiente de configurar'}
          onClick={hasT ? () => navigate(`/course/${courseId}/evaluation/${evals[0].id}`) : undefined}
          actions={
            <>
              {hasT && (
                <Button variant="default" size="sm" className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-700" onClick={() => navigate(`/course/${courseId}/evaluation/${evals[0].id}`)}>
                  <PlayCircle className="h-3 w-3" />Realizar
                </Button>
              )}
              {isAdmin && !hasT && (
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast({ title: "Crear Test", description: "Usa el generador de tests en la UF." })}>
                  <Plus className="h-3 w-3" />Crear
                </Button>
              )}
            </>
          }
        />

        <SelfAssessmentQuiz courseId={courseId} formativeUnitId={u.id} formativeUnitTitle={u.title} />
      </div>
    );
  };

  return (
    <div className="bg-teal-50/30 dark:bg-teal-950/10">
      <div className="flex flex-col">
        {moduleUnits.map((u, i) => {
          const p = getUnitProgress(u.id).overall_progress;
          const isOpen = u.id === selectedUnitId && panelOpen;
          const done = p >= 100;
          return (
            <div key={u.id} className="border-b border-teal-200/40 dark:border-teal-900/30 last:border-b-0">
              <button
                onClick={() => {
                  if (u.id === selectedUnitId) {
                    setPanelOpen((o) => !o);
                  } else {
                    setSelectedUnitId(u.id);
                    setPanelOpen(true);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isOpen ? "bg-teal-700 text-white" : "bg-teal-500/90 text-white hover:bg-teal-600"
                }`}
                aria-expanded={isOpen}
              >
                <span className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold shrink-0 ${
                  done ? "bg-green-300 text-green-900" : "bg-white/20 text-white"
                }`}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="flex-1 text-sm font-medium leading-snug">
                  Unidad Didáctica {i + 1}. {u.title}
                </span>
                <span className="text-[11px] font-bold tabular-nums opacity-90 shrink-0">{p}%</span>
                <span className={`text-[11px] font-bold tracking-wider px-2 py-1 rounded shrink-0 ${
                  isOpen ? "bg-white text-teal-700" : "bg-amber-400 text-amber-950"
                }`}>
                  {isOpen ? "CONTRAER" : "AMPLIAR"}
                </span>
              </button>
              {isOpen && renderUnitPanel(u, i)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sección colapsable estilo barra (Tutorías / Evaluación) por módulo
function ModuleSectionBar({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-teal-200/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          open ? "bg-slate-700 text-white" : "bg-slate-600 text-white hover:bg-slate-700"
        }`}
        aria-expanded={open}
      >
        <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
        <span className={`text-[11px] font-bold tracking-wider px-2 py-1 rounded shrink-0 ${
          open ? "bg-white text-slate-700" : "bg-amber-400 text-amber-950"
        }`}>
          {open ? "CONTRAER" : "AMPLIAR"}
        </span>
      </button>
      {open && <div className="p-4 bg-slate-50/40">{children}</div>}
    </div>
  );
}

export function SEPEFormacionCampus({
  modules,
  courseId,
  courseTitle,
  userRole,
  getUnitProgress,
  onOpenScormViewer,
  onOpenActivityManager,
  onOpenManualUploader,
  onOpenScormAuthor,
  onReloadCourse,
}: SEPEFormacionCampusProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher';

  // Calculate module progress from UF progress
  const getModuleProgress = useCallback((module: Module) => {
    const units = module.formative_units || [];
    if (units.length === 0) return 0;
    const totalProgress = units.reduce((sum, u) => sum + getUnitProgress(u.id).overall_progress, 0);
    return Math.round(totalProgress / units.length);
  }, [getUnitProgress]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Formación en Campus — Módulos Formativos
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Estructura modular del certificado de profesionalidad
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {modules.length} módulos
          </Badge>
          <Badge variant="outline" className="text-xs">
            {modules.flatMap(m => m.formative_units || []).length} UFs
          </Badge>
        </div>
      </div>

      {/* SEPE Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Cada módulo incluye: <strong>contenido interactivo</strong>, <strong>manual PDF</strong>, <strong>actividad de desarrollo</strong> y <strong>test final</strong>. Nota mínima: 50%.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Module list */}
      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Sin módulos configurados</h3>
            <p className="text-sm text-muted-foreground">
              Este curso aún no tiene módulos formativos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => {
            const moduleUnits = module.formative_units || [];
            const moduleProgress = getModuleProgress(module);
            const totalEvaluations = (module.evaluations?.length || 0) + moduleUnits.reduce((sum, u) => sum + (u.evaluations?.length || 0), 0);
            const totalActivities = (module.activities?.length || 0) + moduleUnits.reduce((sum, u) => sum + (u.activities?.length || 0), 0);

            return (
              <Collapsible key={module.id} defaultOpen={modules.length === 1}>
                <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CollapsibleTrigger className="w-full text-left sticky top-0 z-30 bg-background">
                    <div className="p-4 bg-gradient-to-r from-muted/40 to-muted/20">
                      <div className="flex items-start gap-3">
                        {/* Module number */}
                        <div className="relative shrink-0">
                          <ProgressRing value={moduleProgress} size={44} strokeWidth={3} />
                        </div>

                        {/* Module info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono shrink-0">
                              MF {index + 1}
                            </Badge>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180 shrink-0" />
                          </div>
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                            {module.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration_minutes ? Math.round(module.duration_minutes / 60) : 0}h
                            </span>
                            <span className="flex items-center gap-1">
                              <ListChecks className="h-3 w-3" />
                              {moduleUnits.length} UFs
                            </span>
                            <span className="flex items-center gap-1">
                              <ClipboardList className="h-3 w-3" />
                              {totalEvaluations} tests
                            </span>
                            <span className="flex items-center gap-1">
                              <PenTool className="h-3 w-3" />
                              {totalActivities} actividades
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-4 bg-background">
                      {/* === A) INTRODUCCIÓN AL MÓDULO (FIJA, una sola vez) === */}
                      <UFIntroductionSection
                        moduleId={module.id}
                        courseId={courseId}
                        isAdmin={isAdmin}
                        scope="module"
                      />

                      {/* === B) FORMACIÓN EN CAMPUS — Unidades didácticas en fila === */}
                      <div className="border border-teal-200/60 dark:border-teal-900/40 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-4 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          B) FORMACIÓN EN CAMPUS — UNIDADES DIDÁCTICAS
                        </div>

                        {moduleUnits.length === 0 ? (
                          <div className="p-6 text-center bg-teal-50/30 dark:bg-teal-950/10">
                            <p className="text-sm text-muted-foreground mb-3">Sin unidades didácticas en este módulo</p>
                            {isAdmin && (
                              <ModuleFormativeUnitManager
                                moduleId={module.id}
                                moduleTitle={module.title}
                                formativeUnits={moduleUnits}
                                onUpdate={onReloadCourse}
                              />
                            )}
                          </div>
                        ) : (
                          <ModuleUnitsTabs
                            moduleId={module.id}
                            moduleEvaluations={module.evaluations || []}
                            moduleUnits={moduleUnits}
                            courseId={courseId}
                            isAdmin={isAdmin}
                            getUnitProgress={getUnitProgress}
                            onOpenScormViewer={onOpenScormViewer}
                            onOpenActivityManager={onOpenActivityManager}
                            onOpenManualUploader={onOpenManualUploader}
                            onOpenScormAuthor={onOpenScormAuthor}
                            navigate={navigate}
                            toast={toast}
                          />
                        )}

                        {isAdmin && moduleUnits.length > 0 && (
                          <div className="p-3 border-t bg-muted/10">
                            <ModuleFormativeUnitManager
                              moduleId={module.id}
                              moduleTitle={module.title}
                              formativeUnits={moduleUnits}
                              onUpdate={onReloadCourse}
                            />
                          </div>
                        )}

                        {/* C) Tutorías presenciales */}
                        <ModuleSectionBar title="C) Tutorías Presenciales">
                          <TutoriasPresencialesGuide courseId={courseId} userRole={userRole || undefined} courseName={courseTitle} />
                        </ModuleSectionBar>

                        {/* D) Tutoría virtual */}
                        <ModuleSectionBar title="D) Tutoría Virtual">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Foro del módulo, mensajería con el tutor y sesiones online.
                            </p>
                            <UFForumsList courseId={courseId} moduleId={module.id} formativeUnitId={null as any} isAdmin={isAdmin} />
                          </div>
                        </ModuleSectionBar>

                        {/* E) Evaluación del módulo */}
                        <ModuleSectionBar title="E) Evaluación del Módulo">
                          <div className="space-y-2">
                            {(module.evaluations || []).filter((ev: any) => !ev.formative_unit_id).length === 0 ? (
                              <p className="text-sm text-muted-foreground">Sin evaluación final configurada para este módulo.</p>
                            ) : (
                              (module.evaluations || [])
                                .filter((ev: any) => !ev.formative_unit_id)
                                .map((ev: any) => (
                                  <div
                                    key={ev.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/course/${courseId}/evaluation/${ev.id}`)}
                                  >
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                      <ClipboardList className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-sm font-medium block">{ev.title}</span>
                                      <p className="text-xs text-muted-foreground">Evaluación final del módulo</p>
                                    </div>
                                    <Button size="sm" className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-700">
                                      <PlayCircle className="h-3 w-3" />Realizar
                                    </Button>
                                  </div>
                                ))
                            )}
                          </div>
                        </ModuleSectionBar>
                      </div>

                      {/* === BIBLIOTECA del módulo === */}
                      <ModuleLibrary moduleId={module.id} isAdmin={isAdmin} />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* EVALUACIÓN Section */}
      <Accordion type="single" collapsible className="w-full mt-2">
        <AccordionItem value="evaluacion-global" className="border-0">
          <AccordionTrigger className="bg-[#8B1538] text-white px-4 py-3 rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
            <span className="font-bold text-lg">EVALUACIÓN</span>
          </AccordionTrigger>
          <AccordionContent className="border border-t-0 rounded-b-lg p-0 bg-card">
            <div className="space-y-0">
              <div 
                className="flex items-center gap-3 p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => toast({ title: "Test Final Global", description: "Accediendo al test final de evaluación..." })}
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{courseTitle} - Test Final</span>
                  <p className="text-xs text-muted-foreground">Evaluación final de todos los módulos</p>
                </div>
                <Badge variant="outline" className="text-xs">Obligatorio</Badge>
              </div>

              <div 
                className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => toast({ title: "Evaluación de Calidad", description: "Accediendo a la encuesta..." })}
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Evaluación de la calidad de la formación</span>
                  <p className="text-xs text-muted-foreground">Encuesta de satisfacción</p>
                </div>
                <Badge variant="secondary" className="text-xs">Recomendado</Badge>
              </div>

              {userRole === 'teacher' && (
                <div 
                  className="flex items-center gap-3 p-4 border-t hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => toast({ title: "Cuestionario del Tutor-Formador", description: "Accediendo..." })}
                >
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">Cuestionario de Satisfacción del Tutor-Formador</span>
                    <p className="text-xs text-muted-foreground">Valoración exclusiva del tutor</p>
                  </div>
                  <Badge className="text-xs bg-teal-600 text-white">Solo Tutor</Badge>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
