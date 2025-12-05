import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, BookOpen, Clock, Users, Settings, Eye, Loader2, GraduationCap, Award, FileCheck, Edit, Trash2, UserPlus, Check, X, UserCog } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  is_active: boolean;
  created_at: string;
  course_type: string;
  tutor_id: string | null;
  tutor_name?: string | null;
  _count?: {
    enrollments: number;
    modules: number;
  };
}

interface CenterStudent {
  id: string;
  full_name: string;
  email: string;
  isEnrolled: boolean;
}

interface CenterTeacher {
  id: string;
  full_name: string;
}

const courseTypes = [
  { value: "all", label: "Todos", icon: BookOpen },
  { value: "propio", label: "Cursos Propios", icon: BookOpen },
  { value: "cfc", label: "Cursos CFC", icon: FileCheck },
  { value: "certificado_profesional", label: "Certificados Profesionales", icon: Award },
];

export default function AdminCourses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userTrainingCenterId, setUserTrainingCenterId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Enrollment state
  const [enrollmentSheetOpen, setEnrollmentSheetOpen] = useState(false);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<Course | null>(null);
  const [centerStudents, setCenterStudents] = useState<CenterStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingEnrollments, setSavingEnrollments] = useState(false);
  
  // Tutor assignment state
  const [tutorSheetOpen, setTutorSheetOpen] = useState(false);
  const [selectedCourseForTutor, setSelectedCourseForTutor] = useState<Course | null>(null);
  const [centerTeachers, setCenterTeachers] = useState<CenterTeacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [savingTutor, setSavingTutor] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  
  // New course form
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    duration_hours: 0,
    course_type: "propio",
  });

  useEffect(() => {
    loadUserAndCourses();
  }, []);

  const loadUserAndCourses = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Check if super_admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      
      const superAdmin = !!roleData;
      setIsSuperAdmin(superAdmin);

      // Get user's training center
      const { data: profile } = await supabase
        .from("profiles")
        .select("training_center_id")
        .eq("id", user.id)
        .single();

      const centerId = profile?.training_center_id;
      setUserTrainingCenterId(centerId);

      let allCourses: any[] = [];
      let centerEnrollmentCounts: Record<string, number> = {};

      if (superAdmin) {
        // Super admin sees all courses with global enrollment counts
        const { data: coursesData, error } = await supabase
          .from("courses")
          .select(`
            *,
            enrollments:enrollments(count),
            modules:modules(count)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        allCourses = coursesData || [];
      } else if (centerId) {
        // Center admin: get courses owned by center + courses assigned to center
        
        // 1. Get students that belong to this center
        const { data: centerStudents, error: studentsError } = await supabase
          .from("profiles")
          .select("id")
          .eq("training_center_id", centerId);

        if (studentsError) throw studentsError;
        const centerStudentIds = (centerStudents || []).map(s => s.id);

        // 2. Get courses owned by center (training_center_id = centerId)
        const { data: ownedCourses, error: ownedError } = await supabase
          .from("courses")
          .select(`
            *,
            modules:modules(count)
          `)
          .eq("training_center_id", centerId)
          .order("created_at", { ascending: false });

        if (ownedError) throw ownedError;

        // 3. Get courses assigned to center via course_center_assignments
        const { data: assignments, error: assignError } = await supabase
          .from("course_center_assignments")
          .select("course_id")
          .eq("training_center_id", centerId)
          .eq("is_active", true);

        if (assignError) throw assignError;

        const assignedCourseIds = (assignments || []).map(a => a.course_id);
        
        let assignedCourses: any[] = [];
        if (assignedCourseIds.length > 0) {
          const { data: assigned, error: assignedCoursesError } = await supabase
            .from("courses")
            .select(`
              *,
              modules:modules(count)
            `)
            .in("id", assignedCourseIds)
            .order("created_at", { ascending: false });

          if (assignedCoursesError) throw assignedCoursesError;
          assignedCourses = assigned || [];
        }

        // Merge and deduplicate
        const ownedIds = new Set((ownedCourses || []).map(c => c.id));
        const uniqueAssigned = assignedCourses.filter(c => !ownedIds.has(c.id));
        allCourses = [...(ownedCourses || []), ...uniqueAssigned];

        // 4. Get enrollments only for students belonging to this center
        const allCourseIds = allCourses.map(c => c.id);
        if (allCourseIds.length > 0 && centerStudentIds.length > 0) {
          const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select("course_id, user_id")
            .in("course_id", allCourseIds)
            .in("user_id", centerStudentIds);

          if (enrollError) throw enrollError;

          // Count enrollments per course (only center students)
          (enrollments || []).forEach(e => {
            centerEnrollmentCounts[e.course_id] = (centerEnrollmentCounts[e.course_id] || 0) + 1;
          });
        }
      }

      const transformedCourses = allCourses.map((course: any) => ({
        ...course,
        _count: {
          // For center admins, use center-specific count; for super admin, use global count
          enrollments: centerId && !superAdmin 
            ? (centerEnrollmentCounts[course.id] || 0)
            : (course.enrollments?.[0]?.count || 0),
          modules: course.modules?.[0]?.count || 0,
        },
      }));

      setCourses(transformedCourses);
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

  const handleCreateCourse = async () => {
    if (!newCourse.title) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!userTrainingCenterId && !isSuperAdmin) {
      toast({
        title: "Error",
        description: "No tienes un centro de formación asignado",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: newCourse.title,
          description: newCourse.description || null,
          category: newCourse.category || null,
          level: newCourse.level,
          duration_hours: newCourse.duration_hours || null,
          course_type: newCourse.course_type,
          is_active: true,
          training_center_id: userTrainingCenterId, // Assign to user's center
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Curso creado",
        description: `El curso "${newCourse.title}" ha sido creado correctamente`,
      });

      setIsCreateDialogOpen(false);
      setNewCourse({
        title: "",
        description: "",
        category: "",
        level: "beginner",
        duration_hours: 0,
        course_type: "propio",
      });
      
      loadUserAndCourses();
      
      // Navigate to configure the new course
      if (data?.id) {
        navigate(`/dashboard/admin/course-settings/${data.id}`);
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error al crear curso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseToDelete.id);

      if (error) throw error;

      toast({
        title: "Curso eliminado",
        description: `El curso "${courseToDelete.title}" ha sido eliminado correctamente`,
      });

      setCourseToDelete(null);
      loadUserAndCourses();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error al eliminar curso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Load center students for enrollment
  const loadCenterStudents = async (courseId: string) => {
    if (!userTrainingCenterId) return;
    
    setLoadingStudents(true);
    try {
      // Get students from this center
      const { data: students, error: studentsError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("training_center_id", userTrainingCenterId);

      if (studentsError) throw studentsError;

      // Filter to only include users with student role
      const { data: studentRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (rolesError) throw rolesError;

      const studentUserIds = new Set((studentRoles || []).map(r => r.user_id));
      const centerStudentProfiles = (students || []).filter(s => studentUserIds.has(s.id));

      // Get current enrollments for this course
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("user_id")
        .eq("course_id", courseId);

      if (enrollError) throw enrollError;

      const enrolledIds = new Set((enrollments || []).map(e => e.user_id));

      // Get emails from auth (we'll use profile id as email fallback)
      const studentsWithEnrollment: CenterStudent[] = centerStudentProfiles.map(s => ({
        id: s.id,
        full_name: s.full_name || "Sin nombre",
        email: "", // We don't have direct access to auth emails
        isEnrolled: enrolledIds.has(s.id),
      }));

      setCenterStudents(studentsWithEnrollment);
    } catch (error: any) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleOpenEnrollment = (course: Course) => {
    setSelectedCourseForEnrollment(course);
    setEnrollmentSheetOpen(true);
    setStudentSearchTerm("");
    loadCenterStudents(course.id);
  };

  const toggleStudentEnrollment = (studentId: string) => {
    setCenterStudents(prev => 
      prev.map(s => 
        s.id === studentId ? { ...s, isEnrolled: !s.isEnrolled } : s
      )
    );
  };

  const handleSaveEnrollments = async () => {
    if (!selectedCourseForEnrollment) return;
    
    setSavingEnrollments(true);
    try {
      const courseId = selectedCourseForEnrollment.id;
      
      // Get current enrollments
      const { data: currentEnrollments, error: fetchError } = await supabase
        .from("enrollments")
        .select("id, user_id")
        .eq("course_id", courseId);

      if (fetchError) throw fetchError;

      const currentEnrolledIds = new Set((currentEnrollments || []).map(e => e.user_id));
      
      // Determine who to enroll and unenroll
      const toEnroll = centerStudents.filter(s => s.isEnrolled && !currentEnrolledIds.has(s.id));
      const toUnenroll = centerStudents.filter(s => !s.isEnrolled && currentEnrolledIds.has(s.id));

      // Enroll new students
      if (toEnroll.length > 0) {
        const { error: enrollError } = await supabase
          .from("enrollments")
          .insert(toEnroll.map(s => ({
            user_id: s.id,
            course_id: courseId,
          })));

        if (enrollError) throw enrollError;
      }

      // Unenroll students
      if (toUnenroll.length > 0) {
        const enrollmentIdsToDelete = (currentEnrollments || [])
          .filter(e => toUnenroll.some(s => s.id === e.user_id))
          .map(e => e.id);

        if (enrollmentIdsToDelete.length > 0) {
          const { error: unenrollError } = await supabase
            .from("enrollments")
            .delete()
            .in("id", enrollmentIdsToDelete);

          if (unenrollError) throw unenrollError;
        }
      }

      toast({
        title: "Matriculaciones actualizadas",
        description: `${toEnroll.length} matriculados, ${toUnenroll.length} desmatriculados`,
      });

      setEnrollmentSheetOpen(false);
      loadUserAndCourses(); // Refresh counts
    } catch (error: any) {
      console.error("Error saving enrollments:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingEnrollments(false);
    }
  };

  const filteredStudents = centerStudents.filter(s =>
    s.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Load center teachers for tutor assignment
  const loadCenterTeachers = async (course: Course) => {
    if (!userTrainingCenterId) return;
    
    setLoadingTeachers(true);
    try {
      // Get teachers from this center
      const { data: teachers, error: teachersError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("training_center_id", userTrainingCenterId);

      if (teachersError) throw teachersError;

      // Filter to only include users with teacher role
      const { data: teacherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "teacher");

      if (rolesError) throw rolesError;

      const teacherUserIds = new Set((teacherRoles || []).map(r => r.user_id));
      const centerTeacherProfiles = (teachers || []).filter(t => teacherUserIds.has(t.id));

      setCenterTeachers(centerTeacherProfiles.map(t => ({
        id: t.id,
        full_name: t.full_name || "Sin nombre"
      })));

      // Set current tutor if exists
      setSelectedTutorId(course.tutor_id);
    } catch (error: any) {
      console.error("Error loading teachers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesores",
        variant: "destructive",
      });
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleOpenTutorAssignment = (course: Course) => {
    setSelectedCourseForTutor(course);
    setTutorSheetOpen(true);
    loadCenterTeachers(course);
  };

  const handleSaveTutor = async () => {
    if (!selectedCourseForTutor) return;
    
    setSavingTutor(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ tutor_id: selectedTutorId })
        .eq("id", selectedCourseForTutor.id);

      if (error) throw error;

      toast({
        title: "Tutor asignado",
        description: selectedTutorId 
          ? "El tutor ha sido asignado correctamente" 
          : "El tutor ha sido desasignado",
      });

      setTutorSheetOpen(false);
      loadUserAndCourses(); // Refresh
    } catch (error: any) {
      console.error("Error saving tutor:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingTutor(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeTab === "all" || course.course_type === activeTab;
    
    return matchesSearch && matchesType;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return level;
    }
  };

  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case "propio":
        return "Curso Propio";
      case "cfc":
        return "CFC";
      case "certificado_profesional":
        return "Cert. Profesional";
      default:
        return type;
    }
  };

  const getCourseTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "propio":
        return "secondary";
      case "cfc":
        return "default";
      case "certificado_profesional":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getCourseCounts = () => {
    return {
      all: courses.length,
      propio: courses.filter(c => c.course_type === "propio").length,
      cfc: courses.filter(c => c.course_type === "cfc").length,
      certificado_profesional: courses.filter(c => c.course_type === "certificado_profesional").length,
    };
  };

  const counts = getCourseCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Gestión de Cursos
          </h1>
          <p className="text-muted-foreground">
            Gestiona cursos propios, CFC y certificados de profesionalidad
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Curso
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {courseTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.value} value={type.value} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{type.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {counts[type.value as keyof typeof counts]}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cursos por título, descripción o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Cursos</CardDescription>
                <CardTitle className="text-3xl">{filteredCourses.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Cursos Activos</CardDescription>
                <CardTitle className="text-3xl text-primary">
                  {filteredCourses.filter((c) => c.is_active).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Estudiantes</CardDescription>
                <CardTitle className="text-3xl text-secondary">
                  {filteredCourses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Módulos</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredCourses.reduce((sum, c) => sum + (c._count?.modules || 0), 0)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Courses List */}
          <div className="grid gap-4">
            {filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No se encontraron cursos con ese criterio"
                      : "No hay cursos creados en esta categoría."}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer curso
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={getCourseTypeBadgeVariant(course.course_type) as any}>
                            {getCourseTypeLabel(course.course_type)}
                          </Badge>
                          <Badge className={getLevelColor(course.level)}>
                            {getLevelLabel(course.level)}
                          </Badge>
                          {course.category && (
                            <Badge variant="outline">{course.category}</Badge>
                          )}
                          {!course.is_active && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours || 0} horas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{course._count?.modules || 0} módulos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{course._count?.enrollments || 0} estudiantes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        {!isSuperAdmin && userTrainingCenterId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEnrollment(course)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Matricular
                          </Button>
                        )}
                        {!isSuperAdmin && userTrainingCenterId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenTutorAssignment(course)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Tutor
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/dashboard/admin/courses/${course.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/admin/course-settings/${course.id}`)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Config
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCourseToDelete(course)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el curso 
              <span className="font-semibold"> "{courseToDelete?.title}"</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Curso</DialogTitle>
            <DialogDescription>
              Completa la información básica del curso. Podrás añadir módulos y contenido después.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-type">Tipo de Curso *</Label>
              <Select
                value={newCourse.course_type}
                onValueChange={(value) => setNewCourse({ ...newCourse, course_type: value })}
              >
                <SelectTrigger id="course-type">
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
              <Label htmlFor="title">Título del Curso *</Label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Ej: Gestión Administrativa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Describe el contenido y objetivos del curso..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  placeholder="Ej: Administración"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newCourse.duration_hours || ""}
                  onChange={(e) => setNewCourse({ ...newCourse, duration_hours: parseInt(e.target.value) || 0 })}
                  placeholder="Ej: 60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel</Label>
              <Select
                value={newCourse.level}
                onValueChange={(value) => setNewCourse({ ...newCourse, level: value })}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateCourse} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Curso
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrollment Sheet */}
      <Sheet open={enrollmentSheetOpen} onOpenChange={setEnrollmentSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Matricular Alumnos
            </SheetTitle>
            <SheetDescription>
              {selectedCourseForEnrollment?.title}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Student List */}
            {loadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {centerStudents.length === 0 
                  ? "No hay alumnos en tu centro. Crea alumnos primero en la sección Usuarios."
                  : "No se encontraron alumnos con ese nombre"
                }
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        student.isEnrolled 
                          ? "bg-primary/10 border-primary/30" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleStudentEnrollment(student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={student.isEnrolled}
                          onCheckedChange={() => toggleStudentEnrollment(student.id)}
                        />
                        <div>
                          <p className="font-medium">{student.full_name}</p>
                        </div>
                      </div>
                      {student.isEnrolled && (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Matriculado
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
              <span>
                {centerStudents.filter(s => s.isEnrolled).length} de {centerStudents.length} alumnos seleccionados
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEnrollmentSheetOpen(false)}
                disabled={savingEnrollments}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveEnrollments}
                disabled={savingEnrollments}
              >
                {savingEnrollments ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Tutor Assignment Sheet */}
      <Sheet open={tutorSheetOpen} onOpenChange={setTutorSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Asignar Tutor
            </SheetTitle>
            <SheetDescription>
              {selectedCourseForTutor?.title}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {loadingTeachers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : centerTeachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay profesores en tu centro. Crea profesores primero en la sección Usuarios.
              </div>
            ) : (
              <div className="space-y-4">
                <Label>Seleccionar Tutor</Label>
                <Select 
                  value={selectedTutorId || "none"} 
                  onValueChange={(val) => setSelectedTutorId(val === "none" ? null : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tutor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin tutor asignado</SelectItem>
                    {centerTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTutorId && (
                  <div className="p-4 rounded-lg border bg-primary/5">
                    <p className="text-sm font-medium">Tutor seleccionado:</p>
                    <p className="text-sm text-muted-foreground">
                      {centerTeachers.find(t => t.id === selectedTutorId)?.full_name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setTutorSheetOpen(false)}
                disabled={savingTutor}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveTutor}
                disabled={savingTutor || loadingTeachers}
              >
                {savingTutor ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}