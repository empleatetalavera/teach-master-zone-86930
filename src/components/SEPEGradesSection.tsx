import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Minus, PenLine, Save, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SEPEGradesSectionProps {
  courseId: string;
  enrollmentId?: string;
  modules?: any[];
  isEditable?: boolean;
}

interface GradeCategory {
  id: string;
  name: string;
  score: number | null;
  status: 'pending' | 'evaluated';
}

interface GradeSection {
  title: string;
  categories: GradeCategory[];
}

export function SEPEGradesSection({ courseId, enrollmentId, modules = [], isEditable = false }: SEPEGradesSectionProps) {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [formativeUnits, setFormativeUnits] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  
  const [campusGrades, setCampusGrades] = useState<GradeSection>({
    title: "CALIFICACIÓN FORMACIÓN EN CAMPUS",
    categories: [
      { id: 'accesos', name: 'Mis Accesos', score: null, status: 'pending' },
      { id: 'contenidos', name: 'Contenidos interactivos', score: null, status: 'pending' },
      { id: 'ejercicios', name: 'Ejercicios y tareas', score: null, status: 'pending' },
      { id: 'encuestas', name: 'Encuestas', score: null, status: 'pending' },
      { id: 'foros', name: 'Participación en foros de debate y tutorías virtuales', score: null, status: 'pending' },
    ]
  });

  const [tutoriasGrades, setTutoriasGrades] = useState<GradeSection>({
    title: "CALIFICACIÓN TUTORÍAS PRESENCIALES",
    categories: [
      { id: 'actividades_pruebas', name: 'Actividades y pruebas', score: null, status: 'pending' },
    ]
  });

  const [finalGrades, setFinalGrades] = useState<GradeSection>({
    title: "CALIFICACIÓN FINAL",
    categories: [
      { id: 'global', name: 'Calificación global de la Formación en Campus + Tutorías presenciales', score: null, status: 'pending' },
      { id: 'prueba_final', name: 'Calificación prueba final presencial', score: null, status: 'pending' },
      { id: 'prueba_final_2', name: 'Calificación prueba final presencial 2ª conv.', score: null, status: 'pending' },
    ]
  });

  const [overallStatus, setOverallStatus] = useState<string>('Sin Evaluar');

  const canEdit = isEditable && (userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher');

  useEffect(() => {
    if (user && courseId) {
      loadGrades();
    }
  }, [user, courseId, selectedModule, selectedUnit]);

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule(modules[0].id);
    }
  }, [modules]);

  useEffect(() => {
    if (selectedModule) {
      const module = modules.find(m => m.id === selectedModule);
      if (module?.formative_units?.length > 0) {
        setFormativeUnits(module.formative_units);
        if (!selectedUnit || !module.formative_units.find((u: any) => u.id === selectedUnit)) {
          setSelectedUnit(module.formative_units[0].id);
        }
      } else {
        setFormativeUnits([]);
        setSelectedUnit('');
      }
    }
  }, [selectedModule, modules]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      
      // Load real evaluation grades
      const { data: evaluations } = await supabase
        .from("evaluation_attempts")
        .select(`*, evaluation:evaluations(title, module_id, formative_unit_id)`)
        .eq("user_id", user!.id)
        .eq("status", "completed");

      // Load real activity grades
      const { data: activities } = await supabase
        .from("activity_submissions")
        .select(`*, activity:development_activities(title, module_id, formative_unit_id)`)
        .eq("user_id", user!.id)
        .eq("status", "graded");

      // Load presential grades (tutorías y exámenes presenciales)
      const { data: presentialGrades } = await supabase
        .from("presential_grades")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", courseId);

      // Calculate grades based on real data
      const evalScores = evaluations?.map(e => e.score || 0) || [];
      const activityScores = activities?.map(a => a.score || 0) || [];
      
      const avgEval = evalScores.length > 0 ? evalScores.reduce((a, b) => a + b, 0) / evalScores.length : null;
      const avgActivity = activityScores.length > 0 ? activityScores.reduce((a, b) => a + b, 0) / activityScores.length : null;

      // Update campus grades with real data
      setCampusGrades(prev => ({
        ...prev,
        categories: prev.categories.map(cat => {
          if (cat.id === 'contenidos' && avgEval !== null) {
            return { ...cat, score: Math.round(avgEval), status: 'evaluated' as const };
          }
          if (cat.id === 'ejercicios' && avgActivity !== null) {
            return { ...cat, score: Math.round(avgActivity), status: 'evaluated' as const };
          }
          return cat;
        })
      }));

      // Update tutorías presenciales with real data
      const tutoriaGrade = presentialGrades?.find(g => g.grade_type === 'tutoria_presencial');
      if (tutoriaGrade) {
        setTutoriasGrades(prev => ({
          ...prev,
          categories: prev.categories.map(cat => {
            if (cat.id === 'actividades_pruebas') {
              // Score is stored as 0-10, convert to percentage for display
              const scorePercent = tutoriaGrade.score !== null ? (tutoriaGrade.score / (tutoriaGrade.max_score || 10)) * 100 : null;
              return { 
                ...cat, 
                score: scorePercent !== null ? Math.round(scorePercent) : null, 
                status: tutoriaGrade.score !== null ? 'evaluated' as const : 'pending' as const 
              };
            }
            return cat;
          })
        }));
      }

      // Update final grades with presential exam data
      const examenGrade = presentialGrades?.find(g => g.grade_type === 'examen_presencial');
      const examen2convGrade = presentialGrades?.find(g => g.grade_type === 'examen_presencial_2conv');
      
      // Calculate global grade (campus + tutorías)
      const campusScores = [...evalScores, ...activityScores];
      const campusAvg = campusScores.length > 0 ? campusScores.reduce((a, b) => a + b, 0) / campusScores.length : null;
      const tutoriaScore = tutoriaGrade?.score !== null ? (tutoriaGrade.score / (tutoriaGrade.max_score || 10)) * 100 : null;
      
      let globalScore = null;
      if (campusAvg !== null && tutoriaScore !== null) {
        globalScore = Math.round((campusAvg * 0.7) + (tutoriaScore * 0.3)); // 70% campus, 30% tutorías
      } else if (campusAvg !== null) {
        globalScore = Math.round(campusAvg);
      }

      setFinalGrades(prev => ({
        ...prev,
        categories: prev.categories.map(cat => {
          if (cat.id === 'global' && globalScore !== null) {
            return { ...cat, score: globalScore, status: 'evaluated' as const };
          }
          if (cat.id === 'prueba_final' && examenGrade) {
            const scorePercent = examenGrade.score !== null ? (examenGrade.score / (examenGrade.max_score || 10)) * 100 : null;
            return { 
              ...cat, 
              score: scorePercent !== null ? Math.round(scorePercent) : null, 
              status: examenGrade.score !== null ? 'evaluated' as const : 'pending' as const 
            };
          }
          if (cat.id === 'prueba_final_2' && examen2convGrade) {
            const scorePercent = examen2convGrade.score !== null ? (examen2convGrade.score / (examen2convGrade.max_score || 10)) * 100 : null;
            return { 
              ...cat, 
              score: scorePercent !== null ? Math.round(scorePercent) : null, 
              status: examen2convGrade.score !== null ? 'evaluated' as const : 'pending' as const 
            };
          }
          return cat;
        })
      }));

      // Calculate overall status based on all grades including presential
      const allScores = [...evalScores, ...activityScores];
      if (examenGrade?.score !== null) {
        allScores.push((examenGrade.score / (examenGrade.max_score || 10)) * 100);
      } else if (examen2convGrade?.score !== null) {
        allScores.push((examen2convGrade.score / (examen2convGrade.max_score || 10)) * 100);
      }
      
      if (allScores.length > 0) {
        const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        if (avg >= 50) {
          setOverallStatus('Apto');
        } else {
          setOverallStatus('No Apto');
        }
      }

    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (sectionType: 'campus' | 'tutorias' | 'final', categoryId: string, score: number | null) => {
    const setter = sectionType === 'campus' ? setCampusGrades : 
                   sectionType === 'tutorias' ? setTutoriasGrades : setFinalGrades;
    
    setter(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, score, status: score !== null ? 'evaluated' as const : 'pending' as const }
          : cat
      )
    }));
  };

  const saveGrades = async () => {
    try {
      toast.success('Calificaciones guardadas correctamente');
      setEditMode(false);
    } catch (error) {
      toast.error('Error al guardar calificaciones');
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 50) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Apto') return <Badge className="bg-green-600">Apto</Badge>;
    if (status === 'No Apto') return <Badge variant="destructive">No Apto</Badge>;
    return <Badge variant="secondary">Sin Evaluar</Badge>;
  };

  const renderGradeRow = (category: GradeCategory, sectionType: 'campus' | 'tutorias' | 'final') => (
    <div key={category.id} className="flex items-center justify-between border-l-4 border-amber-400 bg-amber-50 px-4 py-3 mb-1">
      <span className="text-[#c47a24] font-medium text-sm">{category.name}</span>
      <div className="flex items-center gap-2">
        {editMode && canEdit ? (
          <Input
            type="number"
            min={0}
            max={100}
            value={category.score ?? ''}
            onChange={(e) => updateGrade(sectionType, category.id, e.target.value ? Number(e.target.value) : null)}
            className="w-20 h-8 text-center"
            placeholder="--"
          />
        ) : (
          <span className={`font-semibold ${getScoreColor(category.score)}`}>
            {category.score !== null ? `${category.score}%` : '--'}
          </span>
        )}
        <button className="text-gray-400 hover:text-gray-600">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedModuleData = modules.find(m => m.id === selectedModule);
  const selectedUnitData = formativeUnits.find(u => u.id === selectedUnit);

  return (
    <div className="space-y-6">
      {/* Header with edit controls */}
      <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="p-4 bg-amber-400 rounded-lg">
          <PenLine className="h-10 w-10 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">"</span>
            PROGRESOS Y CALIFICACIONES
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            En este módulo podrá realizar el seguimiento de todos los progresos realizados en base a su actividad en el campus y sus evaluaciones.
          </p>
          
          {canEdit && (
            <div className="mt-4 flex gap-2">
              {editMode ? (
                <>
                  <Button size="sm" onClick={saveGrades} className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditMode(true)} className="gap-2">
                  <PenLine className="h-4 w-4" />
                  Editar calificaciones
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Module and Unit Selectors */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Módulo:</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Unidad formativa:</label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {formativeUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Info */}
          <div className="border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 text-sm space-y-1">
            <div><span className="text-gray-500">Certificado:</span> <span className="font-medium">{selectedModuleData?.title || '--'}</span></div>
            <div><span className="text-gray-500">Módulo formativo:</span> <span className="font-medium">{selectedModuleData?.title || '--'}</span></div>
            <div><span className="text-gray-500">Unidad formativa:</span> <span className="font-medium">{selectedUnitData?.title || '--'}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* CALIFICACIÓN FORMACIÓN EN CAMPUS */}
      <div className="space-y-1">
        <div className="bg-slate-600 text-white px-4 py-2 font-semibold text-sm uppercase">
          {campusGrades.title}
        </div>
        {campusGrades.categories.map(cat => renderGradeRow(cat, 'campus'))}
      </div>

      {/* CALIFICACIÓN TUTORÍAS PRESENCIALES */}
      <div className="space-y-1">
        <div className="bg-slate-600 text-white px-4 py-2 font-semibold text-sm uppercase">
          {tutoriasGrades.title}
        </div>
        {tutoriasGrades.categories.map(cat => renderGradeRow(cat, 'tutorias'))}
      </div>

      {/* CALIFICACIÓN FINAL */}
      <div className="space-y-1">
        <div className="bg-slate-600 text-white px-4 py-2 font-semibold text-sm uppercase">
          {finalGrades.title}
        </div>
        {finalGrades.categories.map(cat => renderGradeRow(cat, 'final'))}
      </div>

      {/* Overall Status */}
      <div className="bg-gray-200 px-4 py-3 rounded flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Situación/Resultado:</span>
        <span className="font-semibold">-- {overallStatus} --</span>
      </div>

      {/* Certificate Summary */}
      <div className="space-y-1">
        <div className="bg-slate-600 text-white px-4 py-2 font-semibold text-sm uppercase">
          RESUMEN DEL ESTADO/CALIFICACIONES DEL CERTIFICADO
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="summary" className="border-0">
            <AccordionTrigger className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3 hover:no-underline">
              <span className="text-[#c47a24] font-medium text-sm">
                Resumen del estado/calificaciones de las unidades formativas y módulos formativos del certificado
              </span>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 p-4">
              <div className="space-y-4">
                {modules.map((module, idx) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-slate-700 mb-2">
                      {idx + 1}. {module.title}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Contenidos:</span>
                        <span className="ml-2 font-medium">--</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Ejercicios:</span>
                        <span className="ml-2 font-medium">--</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Examen:</span>
                        <span className="ml-2 font-medium">--</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Estado:</span>
                        <Badge variant="secondary" className="ml-2">Pendiente</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
