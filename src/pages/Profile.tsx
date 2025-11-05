import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, User, FileText, Briefcase, GraduationCap, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  dni_nie: string | null;
  birth_date: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  nationality: string | null;
  gender: string | null;
}

interface EmploymentData {
  employment_status: string;
  company_name: string;
  job_position: string;
  education_level: string;
  work_experience_years: number | null;
  professional_sector: string;
}

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  status: string;
  created_at: string;
  file_path: string;
}

interface TrainingHistory {
  id: string;
  course_name: string;
  training_center: string;
  start_date: string | null;
  end_date: string | null;
  hours: number | null;
  certificate_number: string | null;
  is_sepe_certified: boolean;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [employmentData, setEmploymentData] = useState<EmploymentData>({
    employment_status: "",
    company_name: "",
    job_position: "",
    education_level: "",
    work_experience_years: null,
    professional_sector: "",
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);

  const [personalData, setPersonalData] = useState({
    full_name: "",
    phone: "",
    dni_nie: "",
    birth_date: "",
    address: "",
    city: "",
    postal_code: "",
    province: "",
    nationality: "",
    gender: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchEmploymentData(),
      fetchDocuments(),
      fetchTrainingHistory(),
    ]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setPersonalData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        dni_nie: data.dni_nie || "",
        birth_date: data.birth_date || "",
        address: data.address || "",
        city: data.city || "",
        postal_code: data.postal_code || "",
        province: data.province || "",
        nationality: data.nationality || "",
        gender: data.gender || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchEmploymentData = async () => {
    try {
      const { data, error } = await supabase
        .from("student_employment_data")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setEmploymentData(data);
      }
    } catch (error: any) {
      console.error("Error fetching employment data:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("student_documents")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchTrainingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("student_training_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setTrainingHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching training history:", error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 2MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/avatar.${fileExt}`;

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${user!.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user!.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido actualizada correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePersonalDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: personalData.full_name,
          phone: personalData.phone,
          dni_nie: personalData.dni_nie,
          birth_date: personalData.birth_date || null,
          address: personalData.address,
          city: personalData.city,
          postal_code: personalData.postal_code,
          province: personalData.province,
          nationality: personalData.nationality,
          gender: personalData.gender,
        })
        .eq("id", user!.id);

      if (error) throw error;

      toast({
        title: "Datos actualizados",
        description: "Tu información personal ha sido actualizada correctamente",
      });

      await fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEmploymentDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("student_employment_data")
        .upsert({
          user_id: user!.id,
          ...employmentData,
        });

      if (error) throw error;

      toast({
        title: "Datos actualizados",
        description: "Tu información laboral ha sido actualizada correctamente",
      });

      await fetchEmploymentData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("student-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("student_documents")
        .insert({
          user_id: user!.id,
          document_type: documentType,
          file_path: fileName,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: "pending",
        });

      if (dbError) throw dbError;

      toast({
        title: "Documento subido",
        description: "El documento ha sido subido correctamente y está pendiente de revisión",
      });

      await fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = () => {
    if (personalData.full_name) {
      return personalData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">Perfil del Alumno</CardTitle>
                <CardDescription>
                  Gestiona tu información personal, laboral y documentación SEPE
                </CardDescription>
              </div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {uploading ? "Subiendo..." : "Cambiar foto"}
                  </span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Datos Personales</span>
                  <span className="sm:hidden">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="employment">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Datos Laborales</span>
                  <span className="sm:hidden">Laboral</span>
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Documentación</span>
                  <span className="sm:hidden">Docs</span>
                </TabsTrigger>
                <TabsTrigger value="training">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Formación</span>
                  <span className="sm:hidden">Cursos</span>
                </TabsTrigger>
              </TabsList>

              {/* Datos Personales */}
              <TabsContent value="personal" className="space-y-4">
                <form onSubmit={handlePersonalDataSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nombre Completo *</Label>
                      <Input
                        id="full_name"
                        value={personalData.full_name}
                        onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dni_nie">DNI/NIE *</Label>
                      <Input
                        id="dni_nie"
                        value={personalData.dni_nie}
                        onChange={(e) => setPersonalData({ ...personalData, dni_nie: e.target.value })}
                        placeholder="12345678A"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={personalData.birth_date}
                        onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personalData.phone}
                        onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select
                        value={personalData.gender}
                        onValueChange={(value) => setPersonalData({ ...personalData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                          <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={personalData.address}
                        onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                        placeholder="Calle, número, piso"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={personalData.city}
                        onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Código Postal</Label>
                      <Input
                        id="postal_code"
                        value={personalData.postal_code}
                        onChange={(e) => setPersonalData({ ...personalData, postal_code: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Provincia</Label>
                      <Input
                        id="province"
                        value={personalData.province}
                        onChange={(e) => setPersonalData({ ...personalData, province: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nacionalidad</Label>
                      <Input
                        id="nationality"
                        value={personalData.nationality}
                        onChange={(e) => setPersonalData({ ...personalData, nationality: e.target.value })}
                        placeholder="Española"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar cambios"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Datos Laborales */}
              <TabsContent value="employment" className="space-y-4">
                <form onSubmit={handleEmploymentDataSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employment_status">Situación Laboral *</Label>
                      <Select
                        value={employmentData.employment_status}
                        onValueChange={(value) => setEmploymentData({ ...employmentData, employment_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="empleado">Empleado</SelectItem>
                          <SelectItem value="desempleado">Desempleado</SelectItem>
                          <SelectItem value="autonomo">Autónomo</SelectItem>
                          <SelectItem value="estudiante">Estudiante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_name">Empresa</Label>
                      <Input
                        id="company_name"
                        value={employmentData.company_name}
                        onChange={(e) => setEmploymentData({ ...employmentData, company_name: e.target.value })}
                        placeholder="Nombre de la empresa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_position">Puesto de Trabajo</Label>
                      <Input
                        id="job_position"
                        value={employmentData.job_position}
                        onChange={(e) => setEmploymentData({ ...employmentData, job_position: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education_level">Nivel de Estudios</Label>
                      <Select
                        value={employmentData.education_level}
                        onValueChange={(value) => setEmploymentData({ ...employmentData, education_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sin_estudios">Sin estudios</SelectItem>
                          <SelectItem value="primaria">Educación Primaria</SelectItem>
                          <SelectItem value="eso">ESO</SelectItem>
                          <SelectItem value="bachillerato">Bachillerato</SelectItem>
                          <SelectItem value="fp_medio">FP Grado Medio</SelectItem>
                          <SelectItem value="fp_superior">FP Grado Superior</SelectItem>
                          <SelectItem value="universitario">Universitario</SelectItem>
                          <SelectItem value="master">Máster</SelectItem>
                          <SelectItem value="doctorado">Doctorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work_experience_years">Años de Experiencia</Label>
                      <Input
                        id="work_experience_years"
                        type="number"
                        min="0"
                        value={employmentData.work_experience_years || ""}
                        onChange={(e) => setEmploymentData({ 
                          ...employmentData, 
                          work_experience_years: e.target.value ? parseInt(e.target.value) : null 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="professional_sector">Sector Profesional</Label>
                      <Input
                        id="professional_sector"
                        value={employmentData.professional_sector}
                        onChange={(e) => setEmploymentData({ ...employmentData, professional_sector: e.target.value })}
                        placeholder="Ej: Tecnología, Educación, Salud"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar cambios"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Documentación */}
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["DNI/NIE", "Certificado de Empresa", "Vida Laboral", "Título Académico", "Otro"].map((docType) => (
                      <Card key={docType}>
                        <CardHeader>
                          <CardTitle className="text-sm">{docType}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Label htmlFor={`doc-${docType}`} className="cursor-pointer">
                            <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                              <Upload className="h-5 w-5" />
                              <span className="text-sm">Subir documento</span>
                            </div>
                            <Input
                              id={`doc-${docType}`}
                              type="file"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, docType.toLowerCase().replace(/\//g, "_").replace(/ /g, "_"))}
                              disabled={uploading}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </Label>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Documentos Subidos</h3>
                    {documents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No has subido ningún documento todavía
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">
                                {doc.document_type.replace(/_/g, " ").toUpperCase()}
                              </TableCell>
                              <TableCell>{doc.file_name}</TableCell>
                              <TableCell>
                                {new Date(doc.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(doc.status)}
                                  {getStatusBadge(doc.status)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Historial de Formación */}
              <TabsContent value="training" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Historial de Formación</h3>
                  {trainingHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No hay cursos registrados en tu historial
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Curso</TableHead>
                          <TableHead>Centro</TableHead>
                          <TableHead>Fechas</TableHead>
                          <TableHead>Horas</TableHead>
                          <TableHead>SEPE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainingHistory.map((training) => (
                          <TableRow key={training.id}>
                            <TableCell className="font-medium">
                              {training.course_name}
                            </TableCell>
                            <TableCell>{training.training_center || "-"}</TableCell>
                            <TableCell>
                              {training.start_date && training.end_date
                                ? `${new Date(training.start_date).toLocaleDateString()} - ${new Date(training.end_date).toLocaleDateString()}`
                                : "-"}
                            </TableCell>
                            <TableCell>{training.hours ? `${training.hours}h` : "-"}</TableCell>
                            <TableCell>
                              {training.is_sepe_certified ? (
                                <Badge className="bg-green-500">Certificado SEPE</Badge>
                              ) : (
                                <Badge variant="secondary">No certificado</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
