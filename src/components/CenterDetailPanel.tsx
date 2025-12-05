import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Users, BookOpen, GraduationCap, TrendingUp, Loader2, ToggleLeft, ToggleRight, UserX, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CenterDetailPanelProps {
  centerId: string;
  centerName: string;
}

interface CenterStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
}

interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
}

interface CourseData {
  id: string;
  title: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  enrollmentCount: number;
}

export default function CenterDetailPanel({ centerId, centerName }: CenterDetailPanelProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CenterStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCenterData();
  }, [centerId]);

  const loadCenterData = async () => {
    setLoading(true);
    try {
      // Get users from this center with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .eq("training_center_id", centerId);

      if (profilesError) throw profilesError;

      // Get user emails and roles
      const userIds = profiles?.map(p => p.id) || [];
      
      let usersWithDetails: UserData[] = [];
      let studentCount = 0;
      let teacherCount = 0;
      let adminCount = 0;

      if (userIds.length > 0) {
        // Get roles for these users
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        if (rolesError) throw rolesError;

        // Create user map with roles
        const roleMap: Record<string, string> = {};
        roles?.forEach(r => {
          roleMap[r.user_id] = r.role;
          if (r.role === 'student') studentCount++;
          else if (r.role === 'teacher') teacherCount++;
          else if (r.role === 'admin') adminCount++;
        });

        usersWithDetails = profiles?.map(p => ({
          id: p.id,
          full_name: p.full_name,
          email: p.id, // We'll show the ID since we can't access auth.users
          role: roleMap[p.id] || 'sin rol',
          created_at: p.created_at,
        })) || [];
      }

      // Get courses from this center
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, is_active, start_date, end_date")
        .eq("training_center_id", centerId)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      // Get enrollment counts for each course
      const coursesWithEnrollments: CourseData[] = [];
      let totalEnrollments = 0;

      for (const course of coursesData || []) {
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id);

        const enrollmentCount = count || 0;
        totalEnrollments += enrollmentCount;

        coursesWithEnrollments.push({
          ...course,
          enrollmentCount,
        });
      }

      setUsers(usersWithDetails);
      setCourses(coursesWithEnrollments);
      setStats({
        totalUsers: profiles?.length || 0,
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalAdmins: adminCount,
        totalCourses: coursesData?.length || 0,
        activeCourses: coursesData?.filter(c => c.is_active).length || 0,
        totalEnrollments,
      });
    } catch (error) {
      console.error("Error loading center data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "destructive",
      teacher: "default",
      student: "secondary",
    };
    const labels: Record<string, string> = {
      admin: "Admin",
      teacher: "Profesor",
      student: "Alumno",
      "sin rol": "Sin Rol",
    };
    return (
      <Badge variant={variants[role] || "outline"}>
        {labels[role] || role}
      </Badge>
    );
  };

  const handleToggleCourse = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_active: !currentStatus })
        .eq("id", courseId);

      if (error) throw error;

      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, is_active: !currentStatus } : c
      ));
      
      setStats(prev => ({
        ...prev,
        activeCourses: !currentStatus 
          ? prev.activeCourses + 1 
          : prev.activeCourses - 1
      }));

      toast({
        title: !currentStatus ? "Curso activado" : "Curso desactivado",
        description: "El estado del curso ha sido actualizado",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveUserRole = async (userId: string, role: string) => {
    if (!confirm(`¿Está seguro de eliminar el rol "${role}" de este usuario?`)) return;
    
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: "sin rol" } : u
      ));

      // Update stats
      if (role === 'student') {
        setStats(prev => ({ ...prev, totalStudents: prev.totalStudents - 1 }));
      } else if (role === 'teacher') {
        setStats(prev => ({ ...prev, totalTeachers: prev.totalTeachers - 1 }));
      } else if (role === 'admin') {
        setStats(prev => ({ ...prev, totalAdmins: prev.totalAdmins - 1 }));
      }

      toast({
        title: "Rol eliminado",
        description: "El usuario ya no tiene acceso con ese rol",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromCenter = async (userId: string) => {
    if (!confirm("¿Está seguro de desvincular este usuario del centro?")) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ training_center_id: null })
        .eq("id", userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));

      toast({
        title: "Usuario desvinculado",
        description: "El usuario ya no pertenece a este centro",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Usuarios Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Alumnos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCourses}</p>
                <p className="text-xs text-muted-foreground">Cursos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                <p className="text-xs text-muted-foreground">Matrículas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({stats.totalUsers})
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Cursos ({stats.totalCourses})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuarios del Centro</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay usuarios registrados en este centro
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Fecha Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "Sin nombre"}
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.created_at
                              ? format(new Date(user.created_at), "dd MMM yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {user.role !== "sin rol" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUserRole(user.id, user.role)}
                                  title="Quitar rol"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromCenter(user.id)}
                                title="Desvincular del centro"
                                className="text-destructive hover:text-destructive"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cursos del Centro</CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay cursos creados en este centro
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Matrículas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium max-w-[150px] truncate">
                            {course.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant={course.is_active ? "default" : "secondary"}>
                              {course.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {course.start_date && course.end_date
                              ? `${format(new Date(course.start_date), "dd/MM/yy")} - ${format(new Date(course.end_date), "dd/MM/yy")}`
                              : "Sin fechas"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.enrollmentCount}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleCourse(course.id, course.is_active)}
                              title={course.is_active ? "Desactivar curso" : "Activar curso"}
                            >
                              {course.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-500" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
