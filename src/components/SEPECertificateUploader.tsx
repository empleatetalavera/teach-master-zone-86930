import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Trash2, Loader2, Users, CheckCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentEnrollment {
  id: string;
  user_id: string;
  profile?: { full_name: string | null; dni_nie: string | null };
  theoryCert?: { id: string; file_name: string; file_path: string; uploaded_at: string } | null;
  practiceCert?: { id: string; file_name: string; file_path: string; uploaded_at: string } | null;
}

interface SEPECertificateUploaderProps {
  courseId: string;
  courseTitle: string;
}

export function SEPECertificateUploader({ courseId, courseTitle }: SEPECertificateUploaderProps) {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Get student enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, user_id")
        .eq("course_id", courseId)
        .eq("enrollment_role", "student");

      if (!enrollments?.length) {
        setStudents([]);
        return;
      }

      // Get profiles
      const userIds = enrollments.map(e => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, dni_nie")
        .in("id", userIds);

      // Get existing SEPE certificates
      const { data: certs } = await supabase
        .from("sepe_certificates")
        .select("*")
        .eq("course_id", courseId);

      const studentList: StudentEnrollment[] = enrollments.map(e => {
        const profile = profiles?.find(p => p.id === e.user_id);
        const theoryCert = certs?.find(c => c.user_id === e.user_id && c.certificate_type === 'theory');
        const practiceCert = certs?.find(c => c.user_id === e.user_id && c.certificate_type === 'practice');
        return {
          ...e,
          profile: profile ? { full_name: profile.full_name, dni_nie: profile.dni_nie } : undefined,
          theoryCert: theoryCert ? { id: theoryCert.id, file_name: theoryCert.file_name, file_path: theoryCert.file_path, uploaded_at: theoryCert.uploaded_at } : null,
          practiceCert: practiceCert ? { id: practiceCert.id, file_name: practiceCert.file_name, file_path: practiceCert.file_path, uploaded_at: practiceCert.uploaded_at } : null,
        };
      });

      setStudents(studentList.sort((a, b) => (a.profile?.full_name || '').localeCompare(b.profile?.full_name || '')));
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Error al cargar los alumnos");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (student: StudentEnrollment, type: 'theory' | 'practice', file: File) => {
    const key = `${student.user_id}-${type}`;
    setUploading(key);
    try {
      const ext = file.name.split('.').pop();
      const path = `${student.user_id}/${courseId}/${type}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("sepe-certificates")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Upsert DB record
      const { error: dbError } = await supabase
        .from("sepe_certificates")
        .upsert({
          user_id: student.user_id,
          course_id: courseId,
          enrollment_id: student.id,
          certificate_type: type,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          uploaded_by: user!.id,
        }, { onConflict: 'user_id,course_id,certificate_type' });

      if (dbError) throw dbError;

      toast.success(`Título de ${type === 'theory' ? 'teoría' : 'prácticas'} subido para ${student.profile?.full_name || 'alumno'}`);
      await loadStudents();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Error al subir: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (student: StudentEnrollment, type: 'theory' | 'practice') => {
    const cert = type === 'theory' ? student.theoryCert : student.practiceCert;
    if (!cert) return;

    try {
      await supabase.storage.from("sepe-certificates").remove([cert.file_path]);
      await supabase.from("sepe_certificates").delete().eq("id", cert.id);
      toast.success("Título eliminado");
      await loadStudents();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("sepe-certificates").download(filePath);
    if (error) { toast.error("Error al descargar"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const filteredStudents = selectedStudent && selectedStudent !== "all"
    ? students.filter(s => s.user_id === selectedStudent) 
    : students;

  const totalTheory = students.filter(s => s.theoryCert).length;
  const totalPractice = students.filter(s => s.practiceCert).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Títulos SEPE — Subida por Alumno
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sube los títulos oficiales expedidos por el SEPE para cada alumno (teoría y prácticas)
        </p>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" /> {students.length} alumnos
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" /> {totalTheory}/{students.length} teoría
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" /> {totalPractice}/{students.length} prácticas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="max-w-sm">
          <Label className="text-xs text-muted-foreground">Filtrar por alumno</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los alumnos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los alumnos</SelectItem>
              {students.map(s => (
                <SelectItem key={s.user_id} value={s.user_id}>
                  {s.profile?.full_name || "Sin nombre"} {s.profile?.dni_nie ? `(${s.profile.dni_nie})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>No hay alumnos matriculados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map(student => (
              <div key={student.user_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(student.profile?.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.profile?.full_name || "Sin nombre"}</p>
                    {student.profile?.dni_nie && (
                      <p className="text-xs text-muted-foreground">DNI/NIE: {student.profile.dni_nie}</p>
                    )}
                  </div>
                  {student.theoryCert && student.practiceCert && (
                    <Badge className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" /> Completo</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Theory Certificate */}
                  <CertUploadSlot
                    label="Título Teoría"
                    cert={student.theoryCert}
                    uploading={uploading === `${student.user_id}-theory`}
                    onUpload={(file) => handleUpload(student, 'theory', file)}
                    onDownload={() => student.theoryCert && handleDownload(student.theoryCert.file_path, student.theoryCert.file_name)}
                    onDelete={() => handleDelete(student, 'theory')}
                  />
                  {/* Practice Certificate */}
                  <CertUploadSlot
                    label="Título Prácticas"
                    cert={student.practiceCert}
                    uploading={uploading === `${student.user_id}-practice`}
                    onUpload={(file) => handleUpload(student, 'practice', file)}
                    onDownload={() => student.practiceCert && handleDownload(student.practiceCert.file_path, student.practiceCert.file_name)}
                    onDelete={() => handleDelete(student, 'practice')}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CertUploadSlot({ label, cert, uploading, onUpload, onDownload, onDelete }: {
  label: string;
  cert: { file_name: string; uploaded_at: string } | null;
  uploading: boolean;
  onUpload: (file: File) => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`p-3 rounded-lg border ${cert ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-muted/30 border-dashed'}`}>
      <p className="text-xs font-medium mb-2">{label}</p>
      {cert ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm truncate flex-1">{cert.file_name}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Subido: {new Date(cert.uploaded_at).toLocaleDateString("es-ES")}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onDownload}>
              <Download className="h-3 w-3" /> Descargar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" /> Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Subiendo...
            </div>
          ) : (
            <Label className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" /> Subir PDF
              </div>
              <Input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                  e.target.value = "";
                }}
              />
            </Label>
          )}
        </div>
      )}
    </div>
  );
}
