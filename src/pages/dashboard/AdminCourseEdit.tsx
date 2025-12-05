import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, BookOpen, FileCheck, Award } from "lucide-react";

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  duration_hours: number | null;
  course_type: string | null;
  is_active: boolean;
}

export default function AdminCourseEdit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, category, level, duration_hours, course_type, is_active")
        .eq("id", courseId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Curso no encontrado",
          description: "El curso solicitado no existe",
          variant: "destructive",
        });
        navigate("/dashboard/admin/courses");
        return;
      }

      setCourse(data);
    } catch (error: any) {
      console.error("Error loading course:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!course) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("courses")
        .update({
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          duration_hours: course.duration_hours,
          course_type: course.course_type,
          is_active: course.is_active,
        })
        .eq("id", course.id);

      if (error) throw error;

      toast({
        title: "Curso actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      navigate("/dashboard/admin/courses");
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/admin/courses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Curso</h1>
            <p className="text-muted-foreground mt-1">
              Modifica la información básica del curso
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Datos básicos del curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Curso *</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Título del curso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={course.description || ""}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Descripción del curso..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course_type">Tipo de Curso</Label>
                <Select
                  value={course.course_type || "propio"}
                  onValueChange={(value) => setCourse({ ...course, course_type: value })}
                >
                  <SelectTrigger id="course_type">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="propio">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Curso Propio
                      </div>
                    </SelectItem>
                    <SelectItem value="cfc">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        Curso CFC
                      </div>
                    </SelectItem>
                    <SelectItem value="certificado_profesional">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Certificado de Profesionalidad
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={course.category || ""}
                  onChange={(e) => setCourse({ ...course, category: e.target.value })}
                  placeholder="Ej: Administración, Informática..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={course.duration_hours || ""}
                  onChange={(e) => setCourse({ ...course, duration_hours: parseInt(e.target.value) || null })}
                  placeholder="Ej: 60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nivel</Label>
                <Select
                  value={course.level || "beginner"}
                  onValueChange={(value) => setCourse({ ...course, level: value })}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante (Nivel 1)</SelectItem>
                    <SelectItem value="intermediate">Intermedio (Nivel 2)</SelectItem>
                    <SelectItem value="advanced">Avanzado (Nivel 3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Estado del Curso</Label>
                <p className="text-sm text-muted-foreground">
                  {course.is_active ? "El curso está visible y activo" : "El curso está oculto"}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={course.is_active}
                onCheckedChange={(checked) => setCourse({ ...course, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
