import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, BookOpen, GraduationCap, UserCheck, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
                        <TableHead className="text-right">Matrículas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
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
                          <TableCell className="text-right">
                            <Badge variant="outline">{course.enrollmentCount}</Badge>
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
