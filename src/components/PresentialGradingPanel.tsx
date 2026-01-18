import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  GraduationCap, 
  Save, 
  CheckCircle, 
  User, 
  Calendar,
  Search,
  FileText,
  Users,
  ClipboardCheck
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  user_id: string;
  full_name: string | null;
  email?: string;
  enrollment_id: string;
  tutoria_score?: number | null;
  tutoria_feedback?: string | null;
  tutoria_graded_at?: string | null;
  examen_score?: number | null;
  examen_feedback?: string | null;
  examen_graded_at?: string | null;
  examen_2conv_score?: number | null;
  examen_2conv_feedback?: string | null;
  examen_2conv_graded_at?: string | null;
}

interface PresentialGradingPanelProps {
  courseId: string;
}

type GradeType = 'tutoria_presencial' | 'examen_presencial' | 'examen_presencial_2conv';

export function PresentialGradingPanel({ courseId }: PresentialGradingPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [gradeType, setGradeType] = useState<GradeType>('tutoria_presencial');
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>("");
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  useEffect(() => {
    filterStudents();
  }, [students, searchUser]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Get enrollments for this course
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('id, user_id')
        .eq('course_id', courseId);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        return;
      }

      // Get profiles for enrolled users
      const userIds = enrollments.map(e => e.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Get existing presential grades
      const enrollmentIds = enrollments.map(e => e.id);
      const { data: grades } = await supabase
        .from('presential_grades')
        .select('*')
        .in('enrollment_id', enrollmentIds);

      // Merge data
      const studentsData: Student[] = enrollments.map(enrollment => {
        const profile = profiles?.find(p => p.id === enrollment.user_id);
        const tutoriaGrade = grades?.find(g => g.enrollment_id === enrollment.id && g.grade_type === 'tutoria_presencial');
        const examenGrade = grades?.find(g => g.enrollment_id === enrollment.id && g.grade_type === 'examen_presencial');
        const examen2Grade = grades?.find(g => g.enrollment_id === enrollment.id && g.grade_type === 'examen_presencial_2conv');

        return {
          id: enrollment.id,
          user_id: enrollment.user_id,
          enrollment_id: enrollment.id,
          full_name: profile?.full_name || null,
          tutoria_score: tutoriaGrade?.score ? Number(tutoriaGrade.score) : null,
          tutoria_feedback: tutoriaGrade?.feedback || null,
          tutoria_graded_at: tutoriaGrade?.graded_at || null,
          examen_score: examenGrade?.score ? Number(examenGrade.score) : null,
          examen_feedback: examenGrade?.feedback || null,
          examen_graded_at: examenGrade?.graded_at || null,
          examen_2conv_score: examen2Grade?.score ? Number(examen2Grade.score) : null,
          examen_2conv_feedback: examen2Grade?.feedback || null,
          examen_2conv_graded_at: examen2Grade?.graded_at || null,
        };
      });

      setStudents(studentsData);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    if (searchUser) {
      filtered = filtered.filter(s => 
        s.full_name?.toLowerCase().includes(searchUser.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    // Load existing grade based on type
    if (gradeType === 'tutoria_presencial') {
      setScore(student.tutoria_score?.toString() || "");
      setFeedback(student.tutoria_feedback || "");
    } else if (gradeType === 'examen_presencial') {
      setScore(student.examen_score?.toString() || "");
      setFeedback(student.examen_feedback || "");
    } else {
      setScore(student.examen_2conv_score?.toString() || "");
      setFeedback(student.examen_2conv_feedback || "");
    }
  };

  const handleGradeTypeChange = (type: GradeType) => {
    setGradeType(type);
    if (selectedStudent) {
      if (type === 'tutoria_presencial') {
        setScore(selectedStudent.tutoria_score?.toString() || "");
        setFeedback(selectedStudent.tutoria_feedback || "");
      } else if (type === 'examen_presencial') {
        setScore(selectedStudent.examen_score?.toString() || "");
        setFeedback(selectedStudent.examen_feedback || "");
      } else {
        setScore(selectedStudent.examen_2conv_score?.toString() || "");
        setFeedback(selectedStudent.examen_2conv_feedback || "");
      }
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedStudent) return;

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      toast({
        title: "Error",
        description: "La calificación debe ser un número entre 0 y 10",
        variant: "destructive",
      });
      return;
    }

    setGrading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upsert the grade
      const { error } = await supabase
        .from('presential_grades')
        .upsert({
          enrollment_id: selectedStudent.enrollment_id,
          user_id: selectedStudent.user_id,
          course_id: courseId,
          grade_type: gradeType,
          score: numericScore,
          feedback: feedback,
          graded_by: user?.id,
          graded_at: new Date().toISOString(),
          session_date: sessionDate || null,
        }, {
          onConflict: 'enrollment_id,grade_type'
        });

      if (error) throw error;

      toast({
        title: "Calificación guardada",
        description: `La calificación de ${gradeType === 'tutoria_presencial' ? 'Tutoría Presencial' : gradeType === 'examen_presencial' ? 'Examen Presencial' : 'Examen 2ª Conv.'} se ha guardado correctamente.`,
      });

      // Refresh data
      loadStudents();
      setSelectedStudent(null);
      setScore("");
      setFeedback("");
      setSessionDate("");
    } catch (error: any) {
      console.error('Error saving grade:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };

  const getGradeLabel = (type: GradeType) => {
    switch (type) {
      case 'tutoria_presencial': return 'Tutoría Presencial';
      case 'examen_presencial': return 'Examen Presencial';
      case 'examen_presencial_2conv': return 'Examen 2ª Convocatoria';
    }
  };

  const gradedTutoriasCount = students.filter(s => s.tutoria_score !== null).length;
  const gradedExamenesCount = students.filter(s => s.examen_score !== null).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando alumnos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            CALIFICACIÓN PRESENCIAL
          </CardTitle>
          <CardDescription>
            Gestiona las calificaciones de tutorías presenciales y exámenes presenciales de los alumnos.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs para tipo de calificación */}
      <Tabs value={gradeType} onValueChange={(v) => handleGradeTypeChange(v as GradeType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tutoria_presencial" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tutorías Presenciales
          </TabsTrigger>
          <TabsTrigger value="examen_presencial" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Examen Presencial
          </TabsTrigger>
          <TabsTrigger value="examen_presencial_2conv" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Examen 2ª Conv.
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tutorías calificadas</p>
                <p className="text-2xl font-bold text-purple-600">{gradedTutoriasCount} / {students.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exámenes calificados</p>
                <p className="text-2xl font-bold text-indigo-600">{gradedExamenesCount} / {students.length}</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro de búsqueda */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Buscar alumno</Label>
              <Input 
                value={searchUser} 
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Nombre del alumno..."
                className="mt-1"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchUser("")}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de alumnos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alumnos matriculados ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay alumnos matriculados en este curso.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead>Alumno</TableHead>
                    <TableHead className="text-center">Tutoría Presencial</TableHead>
                    <TableHead className="text-center">Examen Presencial</TableHead>
                    <TableHead className="text-center">Examen 2ª Conv.</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id}
                      className={`hover:bg-slate-50 ${selectedStudent?.id === student.id ? 'bg-purple-50' : ''}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {student.full_name || 'Sin nombre'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.tutoria_score !== null ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            {student.tutoria_score} / 10
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.examen_score !== null ? (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                            {student.examen_score} / 10
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.examen_2conv_score !== null ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            {student.examen_2conv_score} / 10
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">-</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSelectStudent(student)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Calificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de calificación */}
      {selectedStudent && (
        <Card className="border-2 border-purple-400">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Calificar {getGradeLabel(gradeType)}
            </CardTitle>
            <CardDescription>
              Alumno: <strong>{selectedStudent.full_name || 'Sin nombre'}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="score">Calificación (0-10):</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Introduce la calificación"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionDate">Fecha de la sesión (opcional):</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Observaciones:</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Añade observaciones sobre el desempeño del alumno..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveGrade} 
                disabled={grading || !score}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {grading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar calificación
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedStudent(null);
                  setScore("");
                  setFeedback("");
                  setSessionDate("");
                }}
              >
                Cancelar
              </Button>
            </div>

            {/* Indicador si ya está calificado */}
            {((gradeType === 'tutoria_presencial' && selectedStudent.tutoria_score !== null) ||
              (gradeType === 'examen_presencial' && selectedStudent.examen_score !== null) ||
              (gradeType === 'examen_presencial_2conv' && selectedStudent.examen_2conv_score !== null)) && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Este alumno ya tiene una calificación registrada. Al guardar, se actualizará.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
