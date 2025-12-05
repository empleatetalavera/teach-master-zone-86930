import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarIcon, Save, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  order_index: number;
  start_date: string | null;
  end_date: string | null;
  formative_units: FormativeUnit[];
}

interface FormativeUnit {
  id: string;
  title: string;
  order_index: number;
  start_date: string | null;
  end_date: string | null;
}

interface CourseScheduleManagerProps {
  courseId: string;
}

export default function CourseScheduleManager({ courseId }: CourseScheduleManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadScheduleData();
  }, [courseId]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      
      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, title, order_index, start_date, end_date")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) throw modulesError;

      // Load formative units for each module
      const modulesWithUnits: Module[] = [];
      
      for (const module of modulesData || []) {
        const { data: unitsData, error: unitsError } = await supabase
          .from("formative_units")
          .select("id, title, order_index, start_date, end_date")
          .eq("module_id", module.id)
          .order("order_index");

        if (unitsError) throw unitsError;

        modulesWithUnits.push({
          ...module,
          formative_units: unitsData || [],
        });
      }

      setModules(modulesWithUnits);
    } catch (error: any) {
      console.error("Error loading schedule:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el cronograma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleDateChange = (moduleId: string, field: 'start_date' | 'end_date', date: Date | undefined) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, [field]: date ? date.toISOString() : null }
        : m
    ));
  };

  const handleUnitDateChange = (moduleId: string, unitId: string, field: 'start_date' | 'end_date', date: Date | undefined) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? {
            ...m,
            formative_units: m.formative_units.map(u =>
              u.id === unitId 
                ? { ...u, [field]: date ? date.toISOString() : null }
                : u
            )
          }
        : m
    ));
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);

      // Save all module dates
      for (const module of modules) {
        const { error: moduleError } = await supabase
          .from("modules")
          .update({
            start_date: module.start_date,
            end_date: module.end_date,
          })
          .eq("id", module.id);

        if (moduleError) throw moduleError;

        // Save all unit dates
        for (const unit of module.formative_units) {
          const { error: unitError } = await supabase
            .from("formative_units")
            .update({
              start_date: unit.start_date,
              end_date: unit.end_date,
            })
            .eq("id", unit.id);

          if (unitError) throw unitError;
        }
      }

      toast({
        title: "Cronograma guardado",
        description: "Las fechas se han actualizado correctamente",
      });
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const DatePicker = ({ 
    value, 
    onChange, 
    placeholder 
  }: { 
    value: string | null; 
    onChange: (date: Date | undefined) => void;
    placeholder: string;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-[140px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(value), "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={onChange}
          initialFocus
          className="p-3 pointer-events-auto"
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Cronograma del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No hay módulos creados. Crea módulos desde el editor de contenidos para programar fechas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Cronograma del Curso
            </CardTitle>
            <CardDescription>
              Programa las fechas de inicio y fin de cada módulo y unidad formativa
            </CardDescription>
          </div>
          <Button onClick={handleSaveSchedule} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cronograma
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {modules.map((module, moduleIndex) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <Badge variant="outline" className="shrink-0">
                    M{moduleIndex + 1}
                  </Badge>
                  <span className="font-medium truncate">{module.title}</span>
                  {module.start_date && module.end_date && (
                    <span className="text-xs text-muted-foreground ml-auto mr-4">
                      {format(new Date(module.start_date), "dd/MM")} - {format(new Date(module.end_date), "dd/MM")}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-4 border-l-2 border-muted ml-4">
                  {/* Module dates */}
                  <div className="flex items-center gap-4 py-2 bg-muted/30 rounded-lg px-4">
                    <span className="text-sm font-medium min-w-[100px]">Módulo:</span>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        value={module.start_date}
                        onChange={(date) => handleModuleDateChange(module.id, 'start_date', date)}
                        placeholder="Inicio"
                      />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <DatePicker
                        value={module.end_date}
                        onChange={(date) => handleModuleDateChange(module.id, 'end_date', date)}
                        placeholder="Fin"
                      />
                    </div>
                  </div>

                  {/* Formative units */}
                  {module.formative_units.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Unidades Formativas:</p>
                      {module.formative_units.map((unit, unitIndex) => (
                        <div 
                          key={unit.id} 
                          className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-muted/20"
                        >
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            UF{unitIndex + 1}
                          </Badge>
                          <span className="text-sm truncate flex-1 max-w-[200px]">
                            {unit.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <DatePicker
                              value={unit.start_date}
                              onChange={(date) => handleUnitDateChange(module.id, unit.id, 'start_date', date)}
                              placeholder="Inicio"
                            />
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <DatePicker
                              value={unit.end_date}
                              onChange={(date) => handleUnitDateChange(module.id, unit.id, 'end_date', date)}
                              placeholder="Fin"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2 px-4">
                      No hay unidades formativas en este módulo
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
