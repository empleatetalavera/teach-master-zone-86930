import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentProgress {
  id: string;
  full_name: string;
  progress: number;
  last_accessed: string | null;
  status: 'active' | 'inactive' | 'completed';
}

interface TutorStudentProgressProps {
  courseId: string;
}

export function TutorStudentProgress({ courseId }: TutorStudentProgressProps) {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && courseId) {
      loadStudentsProgress();
    }
  }, [user, courseId]);

  const loadStudentsProgress = async () => {
    try {
      // Get all enrollments for this course
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress_percentage,
          last_accessed_at,
          user_id,
          profiles:user_id (
            id,
            full_name
          )
        `)
        .eq('course_id', courseId);

      if (error) throw error;

      const studentList: StudentProgress[] = (enrollments || [])
        .filter((e: any) => e.profiles)
        .map((e: any) => {
          const lastAccess = e.last_accessed_at ? new Date(e.last_accessed_at) : null;
          const daysSinceAccess = lastAccess 
            ? Math.floor((Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          let status: 'active' | 'inactive' | 'completed' = 'active';
          if (e.progress_percentage >= 100) {
            status = 'completed';
          } else if (daysSinceAccess > 7) {
            status = 'inactive';
          }

          return {
            id: e.profiles.id,
            full_name: e.profiles.full_name || 'Alumno',
            progress: e.progress_percentage || 0,
            last_accessed: e.last_accessed_at,
            status
          };
        })
        .sort((a: StudentProgress, b: StudentProgress) => {
          // Inactive students first, then by progress
          if (a.status === 'inactive' && b.status !== 'inactive') return -1;
          if (b.status === 'inactive' && a.status !== 'inactive') return 1;
          return b.progress - a.progress;
        });

      setStudents(studentList);
    } catch (error) {
      console.error('Error loading students progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'inactive':
        return <Badge variant="destructive" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Inactivo</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Activo</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const activeStudents = students.filter(s => s.status === 'active').length;
  const inactiveStudents = students.filter(s => s.status === 'inactive').length;
  const completedStudents = students.filter(s => s.status === 'completed').length;
  const avgProgress = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-2xl font-bold text-primary">{students.length}</span>
          </div>
          <p className="text-xs text-muted-foreground">Alumnos</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{avgProgress}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Media progreso</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex items-center justify-between text-xs border-t border-b py-2">
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-3 w-3" /> {completedStudents} completados
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" /> {activeStudents} activos
        </span>
        <span className="flex items-center gap-1 text-red-500">
          <AlertCircle className="h-3 w-3" /> {inactiveStudents} inactivos
        </span>
      </div>

      {/* Student List - First 4 */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {students.slice(0, 4).map((student) => (
          <div 
            key={student.id}
            className={`p-2 rounded-lg border transition-colors ${
              student.status === 'inactive' ? 'bg-red-50 border-red-200' : 'bg-background hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{student.full_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Progress value={student.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-8">{student.progress}%</span>
                </div>
              </div>
              {student.status !== 'active' && (
                <div className="flex-shrink-0">
                  {getStatusBadge(student.status)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {students.length > 4 && (
        <p className="text-xs text-center text-muted-foreground">
          +{students.length - 4} alumnos más
        </p>
      )}

      {students.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Sin alumnos matriculados</p>
        </div>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => navigate('/dashboard/teacher/students')}
      >
        <Eye className="h-3 w-3 mr-1" />
        Ver todos los alumnos
      </Button>
    </div>
  );
}
