import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Clock, Eye, Activity, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentReportGenerator } from "@/components/StudentReportGenerator";
import ScormResultsSection from "@/components/scorm/ScormResultsSection";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  last_accessed_at: string;
  courses: {
    id: string;
    title: string;
    duration_hours: number;
  };
}

const mockAccessLog = [
  {
    id: 1,
    startTime: "21/10/2020 11:37:29",
    endTime: "21/10/2020 11:40:38",
    duration: "00:03:09",
    ip: "79.152.169.67"
  },
  {
    id: 2,
    startTime: "21/10/2020 11:40:42",
    endTime: "21/10/2020 11:40:42",
    duration: "00:00:00",
    ip: "79.152.159.67"
  },
  {
    id: 3,
    startTime: "21/10/2020 11:41:14",
    endTime: "21/10/2020 11:41:48",
    duration: "00:00:34",
    ip: "79.152.159.67"
  },
  {
    id: 4,
    startTime: "21/10/2020 12:09:20",
    endTime: "21/10/2020 12:09:28",
    duration: "00:00:08",
    ip: "79.152.159.67"
  },
  {
    id: 5,
    startTime: "21/10/2020 12:12:11",
    endTime: "21/10/2020 12:21:15",
    duration: "00:09:04",
    ip: "79.152.159.67"
  },
  {
    id: 6,
    startTime: "21/10/2020 12:21:33",
    endTime: "21/10/2020 12:30:06",
    duration: "00:08:33",
    ip: "79.152.159.67"
  },
];

const mockProgress = [
  { module: "UD1. Introducción a Microsoft Excel", completed: true, score: 100 },
  { module: "UD2. Comenzar el trabajo con Excel", completed: true, score: 95 },
  { module: "UD3. Fórmulas y operaciones básicas", completed: true, score: 88 },
  { module: "UD4. Seleccionar y dar formato a Hojas", completed: false, score: 0 },
  { module: "UD5. Impresión de hojas de cálculo", completed: false, score: 0 },
];

export default function TeacherStudentDetail() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      loadStudentEnrollments();
    }
  }, [studentId]);

  const loadStudentEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          progress_percentage,
          enrolled_at,
          last_accessed_at,
          courses (
            id,
            title,
            duration_hours
          )
        `)
        .eq('user_id', studentId);

      if (error) throw error;
      setEnrollments(data as Enrollment[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos del estudiante",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAccesses = mockAccessLog.length;
  const totalTime = "00:21:28";
  const firstAccess = "21/10/2020 11:37:29";
  const lastAccess = "21/10/2020 12:21:33";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard/teacher/students")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seguimiento de alumnos</h1>
            <p className="text-muted-foreground mt-2">
              Detalle de actividad del estudiante
            </p>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <StudentReportGenerator 
        studentId={studentId || ''}
        courseId="52d30340-897b-4938-b84f-bcca27874a8d"
        studentName="Demo Seminario Web"
      />

      {/* Student Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Cursos del Estudiante
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando cursos...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Este estudiante no está inscrito en ningún curso
            </p>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-base">{enrollment.courses.title}</h3>
                      <Badge variant={enrollment.progress_percentage >= 100 ? "default" : "secondary"}>
                        {enrollment.progress_percentage}% completado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duración: {enrollment.courses.duration_hours}h • 
                      Inscrito: {new Date(enrollment.enrolled_at).toLocaleDateString('es-ES')}
                      {enrollment.last_accessed_at && (
                        <> • Último acceso: {new Date(enrollment.last_accessed_at).toLocaleDateString('es-ES')}</>
                      )}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 max-w-md">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="ml-4 gap-2"
                    onClick={() => navigate(`/dashboard/teacher/courses/${enrollment.course_id}`)}
                  >
                    Ver Curso
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Alumno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Alumno/a:</p>
              <p className="font-semibold">Demo Seminario Web</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acción formativa:</p>
              <p className="font-semibold">(AP0994) AP0994 - Iniciación a Excel 2016</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grupo:</p>
              <p className="font-semibold">(Demo Excel) Iniciación a Excel 2016</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              ACCESOS
            </CardTitle>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">N° Acc.:</span>
                <Badge variant="secondary">{totalAccesses}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tiempo:</span>
                <Badge variant="secondary">{totalTime}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Primer acceso</p>
              <p className="font-semibold">{firstAccess}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Último acceso</p>
              <p className="font-semibold">{lastAccess}</p>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HoraInicio</TableHead>
                  <TableHead>HoraFin</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAccessLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.startTime}</TableCell>
                    <TableCell className="font-mono text-sm">{log.endTime}</TableCell>
                    <TableCell className="font-mono text-sm">{log.duration}</TableCell>
                    <TableCell className="font-mono text-sm text-primary">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            VÍDEOS DIDÁCTICOS VISIONADOS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No hay vídeos visionados registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PROGRESOS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProgress.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground bg-background'
                  }`}>
                    {item.completed && (
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{item.module}</span>
                </div>
                <div className="flex items-center gap-4">
                  {item.completed && (
                    <Badge variant="secondary">
                      {item.score}%
                    </Badge>
                  )}
                  <Badge variant={item.completed ? "default" : "outline"}>
                    {item.completed ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {studentId && (
        <ScormResultsSection userId={studentId} title="Evaluaciones del alumno" />
      )}
    </div>
  );
}
