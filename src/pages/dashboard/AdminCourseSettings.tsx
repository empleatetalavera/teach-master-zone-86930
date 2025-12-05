import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, GraduationCap } from "lucide-react";
import { CourseSettings } from "@/components/CourseSettings";
import CourseScheduleManager from "@/components/CourseScheduleManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminCourseSettings() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category, level")
        .order("title");

      if (error) throw error;
      setCourses(data || []);

      // If courseId is provided in URL, load that course
      if (courseId) {
        loadCourseDetails(courseId);
      } else if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error: any) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      const parsedCourse = {
        ...data,
        specific_objectives: Array.isArray(data.specific_objectives) 
          ? data.specific_objectives 
          : []
      };
      
      setSelectedCourse(parsedCourse);
    } catch (error: any) {
      console.error("Error loading course details:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value);
    navigate(`/dashboard/admin/course-settings/${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Configuración de Cursos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los contenidos introductorios y datos de contacto de tus cursos
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Curso</CardTitle>
          <CardDescription>
            Elige el curso que deseas configurar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="course-select">Curso</Label>
            <Select value={selectedCourseId} onValueChange={handleCourseChange}>
              <SelectTrigger id="course-select" className="w-full">
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title} - {course.category || "Sin categoría"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : selectedCourse ? (
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Configuración General</TabsTrigger>
            <TabsTrigger value="schedule">Cronograma</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <CourseSettings
              courseId={selectedCourse.id}
              initialData={{
                video_url: selectedCourse.video_url,
                objectives: selectedCourse.objectives,
                specific_objectives: selectedCourse.specific_objectives,
                concept_map_url: selectedCourse.concept_map_url,
                support_email: selectedCourse.support_email,
                support_phone: selectedCourse.support_phone,
                tutor_cv_url: selectedCourse.tutor_cv_url,
                campus_guide_url: selectedCourse.campus_guide_url,
              }}
              onUpdate={() => loadCourseDetails(selectedCourse.id)}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <CourseScheduleManager courseId={selectedCourse.id} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No hay cursos disponibles para configurar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
