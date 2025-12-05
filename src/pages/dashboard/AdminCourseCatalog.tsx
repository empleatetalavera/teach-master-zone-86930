import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Search, Building2, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  category: string;
  course_type: string;
  duration_hours: number;
  is_active: boolean;
}

interface TrainingCenter {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Assignment {
  course_id: string;
  training_center_id: string;
  is_active: boolean;
}

export default function AdminCourseCatalog() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (userRole === 'super_admin') {
      loadData();
    }
  }, [userRole]);

  const loadData = async () => {
    try {
      const [coursesRes, centersRes, assignmentsRes] = await Promise.all([
        supabase.from("courses").select("id, title, category, course_type, duration_hours, is_active").order("title"),
        supabase.from("training_centers").select("id, name, slug, is_active").eq("is_active", true).order("name"),
        supabase.from("course_center_assignments").select("course_id, training_center_id, is_active")
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (centersRes.error) throw centersRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setCourses(coursesRes.data || []);
      setCenters(centersRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (courseId: string, centerId: string): boolean => {
    return assignments.some(a => 
      a.course_id === courseId && 
      a.training_center_id === centerId && 
      a.is_active
    );
  };

  const toggleAssignment = async (courseId: string, centerId: string) => {
    const key = `${courseId}-${centerId}`;
    setSaving(key);

    try {
      const existing = assignments.find(a => 
        a.course_id === courseId && a.training_center_id === centerId
      );

      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from("course_center_assignments")
          .update({ is_active: !existing.is_active })
          .eq("course_id", courseId)
          .eq("training_center_id", centerId);

        if (error) throw error;

        setAssignments(prev => prev.map(a => 
          a.course_id === courseId && a.training_center_id === centerId
            ? { ...a, is_active: !a.is_active }
            : a
        ));
      } else {
        // Create new assignment
        const { error } = await supabase
          .from("course_center_assignments")
          .insert({
            course_id: courseId,
            training_center_id: centerId,
            is_active: true,
            assigned_by: user?.id
          });

        if (error) throw error;

        setAssignments(prev => [...prev, {
          course_id: courseId,
          training_center_id: centerId,
          is_active: true
        }]);
      }

      toast({
        title: "Asignación actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      console.error("Error toggling assignment:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const getAssignedCentersCount = (courseId: string): number => {
    return assignments.filter(a => a.course_id === courseId && a.is_active).length;
  };

  const getAssignedCoursesCount = (centerId: string): number => {
    return assignments.filter(a => a.training_center_id === centerId && a.is_active).length;
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Esta sección solo está disponible para super administradores
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Catálogo de Cursos
        </h1>
        <p className="text-muted-foreground">
          Asigna cursos a los centros de formación
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cursos</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Centros Activos</CardDescription>
            <CardTitle className="text-3xl">{centers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Asignaciones Activas</CardDescription>
            <CardTitle className="text-3xl">{assignments.filter(a => a.is_active).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="by-course">
        <TabsList>
          <TabsTrigger value="by-course">Por Curso</TabsTrigger>
          <TabsTrigger value="by-center">Por Centro</TabsTrigger>
        </TabsList>

        <TabsContent value="by-course" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Course List */}
          <div className="grid gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className={selectedCourse?.id === course.id ? "ring-2 ring-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {course.category && <Badge variant="outline">{course.category}</Badge>}
                        <Badge variant="secondary">{course.course_type}</Badge>
                        <span>{course.duration_hours}h</span>
                      </CardDescription>
                    </div>
                    <Badge variant={getAssignedCentersCount(course.id) > 0 ? "default" : "secondary"}>
                      {getAssignedCentersCount(course.id)} centros
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {centers.map((center) => {
                      const assigned = isAssigned(course.id, center.id);
                      const isSaving = saving === `${course.id}-${center.id}`;
                      
                      return (
                        <div
                          key={center.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                            assigned ? "bg-primary/10 border-primary" : "bg-muted/50"
                          }`}
                        >
                          <Switch
                            checked={assigned}
                            onCheckedChange={() => toggleAssignment(course.id, center.id)}
                            disabled={isSaving}
                          />
                          <span className="text-sm font-medium">{center.name}</span>
                          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-center" className="space-y-4">
          {/* Center List */}
          <div className="grid gap-4">
            {centers.map((center) => (
              <Card key={center.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{center.name}</CardTitle>
                        <CardDescription>{center.slug}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getAssignedCoursesCount(center.id) > 0 ? "default" : "secondary"}>
                      {getAssignedCoursesCount(center.id)} cursos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courses.map((course) => {
                      const assigned = isAssigned(course.id, center.id);
                      const isSaving = saving === `${course.id}-${center.id}`;
                      
                      return (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {assigned ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={assigned ? "font-medium" : "text-muted-foreground"}>
                              {course.title}
                            </span>
                          </div>
                          <Switch
                            checked={assigned}
                            onCheckedChange={() => toggleAssignment(course.id, center.id)}
                            disabled={isSaving}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}