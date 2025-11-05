import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ModuleHours {
  id: string;
  title: string;
  description: string;
  totalHours: number;
  presentialHours: number;
  distanceHours: number;
  teleformationHours: number;
  orderIndex: number;
}

export default function AdminCourseCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Datos del certificado de profesionalidad
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "2",
    sepeCode: "",
    familyProfessional: "",
    qualificationLevel: "2",
    professionalCompetence: "",
    professionalEnvironment: "",
  });

  // Unidades de competencia y módulos formativos
  const [modules, setModules] = useState<ModuleHours[]>([
    {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      totalHours: 0,
      presentialHours: 0,
      distanceHours: 0,
      teleformationHours: 0,
      orderIndex: 1,
    },
  ]);

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        totalHours: 0,
        presentialHours: 0,
        distanceHours: 0,
        teleformationHours: 0,
        orderIndex: modules.length + 1,
      },
    ]);
  };

  const removeModule = (id: string) => {
    if (modules.length === 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos un módulo",
        variant: "destructive",
      });
      return;
    }
    setModules(modules.filter((m) => m.id !== id));
  };

  const updateModule = (id: string, field: keyof ModuleHours, value: any) => {
    setModules(
      modules.map((m) => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          
          // Auto-calcular horas totales si se modifican las parciales
          if (field === "presentialHours" || field === "distanceHours" || field === "teleformationHours") {
            const presential = field === "presentialHours" ? Number(value) : m.presentialHours;
            const distance = field === "distanceHours" ? Number(value) : m.distanceHours;
            const teleformation = field === "teleformationHours" ? Number(value) : m.teleformationHours;
            updated.totalHours = presential + distance + teleformation;
          }
          
          return updated;
        }
        return m;
      })
    );
  };

  const calculateTotalHours = () => {
    return modules.reduce((sum, m) => sum + m.totalHours, 0);
  };

  const saveCourse = async () => {
    // Validaciones
    if (!courseData.title || !courseData.description) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios del curso",
        variant: "destructive",
      });
      return;
    }

    const hasInvalidModules = modules.some(
      (m) => !m.title || m.totalHours === 0
    );
    if (hasInvalidModules) {
      toast({
        title: "Error",
        description: "Todos los módulos deben tener título y horas",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Crear el curso
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          duration_hours: calculateTotalHours(),
          is_active: true,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Crear los módulos
      const modulesData = modules.map((m, index) => ({
        course_id: course.id,
        title: m.title,
        description: m.description,
        duration_minutes: m.totalHours * 60,
        order_index: index + 1,
        is_active: true,
      }));

      const { error: modulesError } = await supabase
        .from("modules")
        .insert(modulesData);

      if (modulesError) throw modulesError;

      toast({
        title: "Curso creado",
        description: "El curso SEPE se ha creado correctamente",
      });

      navigate("/admin/courses");
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="container max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/courses")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Cursos
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Crear Certificado de Profesionalidad</h1>
            <p className="text-muted-foreground">
              Configure el certificado con sus unidades de competencia y módulos formativos
            </p>
          </div>
          <Button onClick={saveCourse} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Curso"}
          </Button>
        </div>

        {/* Datos del Certificado */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Certificado de Profesionalidad</CardTitle>
            <CardDescription>
              Datos identificativos del certificado según normativa SEPE
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="title">
                  Denominación del Certificado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: DOCENCIA DE LA FORMACION PROFESIONAL PARA EL EMPLEO"
                  value={courseData.title}
                  onChange={(e) =>
                    setCourseData({ ...courseData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="sepeCode">
                  Código Certificado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sepeCode"
                  placeholder="Ej: SSCE0110"
                  value={courseData.sepeCode}
                  onChange={(e) =>
                    setCourseData({ ...courseData, sepeCode: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="familyProfessional">Familia Profesional</Label>
                <Input
                  id="familyProfessional"
                  placeholder="Ej: Servicios Socioculturales y a la Comunidad"
                  value={courseData.familyProfessional}
                  onChange={(e) =>
                    setCourseData({ ...courseData, familyProfessional: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="qualificationLevel">Nivel de Cualificación</Label>
                <Select
                  value={courseData.qualificationLevel}
                  onValueChange={(value) =>
                    setCourseData({ ...courseData, qualificationLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nivel 1 - Certificado Profesionalidad</SelectItem>
                    <SelectItem value="2">Nivel 2 - Certificado Profesionalidad</SelectItem>
                    <SelectItem value="3">Nivel 3 - Certificado Profesionalidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duración Total</Label>
                <div className="text-2xl font-bold text-primary mt-2">
                  {calculateTotalHours()} horas
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="professionalCompetence">
                  Competencia General
                </Label>
                <Textarea
                  id="professionalCompetence"
                  rows={3}
                  placeholder="Descripción de la competencia general que otorga el certificado..."
                  value={courseData.professionalCompetence}
                  onChange={(e) =>
                    setCourseData({ ...courseData, professionalCompetence: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="professionalEnvironment">
                  Entorno Profesional
                </Label>
                <Textarea
                  id="professionalEnvironment"
                  rows={3}
                  placeholder="Ámbito profesional, sectores productivos, ocupaciones..."
                  value={courseData.professionalEnvironment}
                  onChange={(e) =>
                    setCourseData({ ...courseData, professionalEnvironment: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unidades de Competencia y Módulos Formativos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Unidades de Competencia (UC) y Módulos Formativos (MF)</CardTitle>
                <CardDescription>
                  Define cada UC con su MF asociado y distribución de horas (presencial/distancia/teleformación)
                </CardDescription>
              </div>
              <Button onClick={addModule} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar UC/MF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {modules.map((module, index) => (
              <div key={module.id} className="relative">
                <div className="absolute -left-4 top-0">
                  <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                </div>

                <Card className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>
                            Unidad de Competencia y Módulo Formativo <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="Ej: 1. UC1442_3: Programar acciones formativas / MF1442_3: Programación didáctica"
                            value={module.title}
                            onChange={(e) =>
                              updateModule(module.id, "title", e.target.value)
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Formato: Nº. UCxxxx_x: Descripción / MFxxxx_x: Descripción
                          </p>
                        </div>

                        <div>
                          <Label>Descripción</Label>
                          <Textarea
                            rows={2}
                            placeholder="Descripción del módulo..."
                            value={module.description}
                            onChange={(e) =>
                              updateModule(module.id, "description", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <div>
                            <Label>Horas Presenciales</Label>
                            <Input
                              type="number"
                              min="0"
                              value={module.presentialHours}
                              onChange={(e) =>
                                updateModule(
                                  module.id,
                                  "presentialHours",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div>
                            <Label>Horas a Distancia</Label>
                            <Input
                              type="number"
                              min="0"
                              value={module.distanceHours}
                              onChange={(e) =>
                                updateModule(
                                  module.id,
                                  "distanceHours",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div>
                            <Label>Horas Teleformación</Label>
                            <Input
                              type="number"
                              min="0"
                              value={module.teleformationHours}
                              onChange={(e) =>
                                updateModule(
                                  module.id,
                                  "teleformationHours",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div>
                            <Label>Total Horas</Label>
                            <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                              <span className="text-lg font-bold text-primary">
                                {module.totalHours}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {modules.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeModule(module.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {index < modules.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resumen del Certificado */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen del Certificado de Profesionalidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <p className="text-sm text-muted-foreground">Unidades Competencia</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duración Total</p>
                <p className="text-2xl font-bold text-primary">
                  {calculateTotalHours()}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Presenciales</p>
                <p className="text-2xl font-bold">
                  {modules.reduce((sum, m) => sum + m.presentialHours, 0)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Distancia</p>
                <p className="text-2xl font-bold">
                  {modules.reduce((sum, m) => sum + m.distanceHours, 0)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Teleformación</p>
                <p className="text-2xl font-bold">
                  {modules.reduce((sum, m) => sum + m.teleformationHours, 0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
