import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, Plus, User, Save } from "lucide-react";

interface CourseSettingsProps {
  courseId: string;
  initialData?: {
    video_url?: string;
    objectives?: string;
    specific_objectives?: string[];
    concept_map_url?: string;
    support_email?: string;
    support_phone?: string;
    tutor_cv_url?: string;
    campus_guide_url?: string;
    tutor_id?: string;
  };
  onUpdate?: () => void;
}

interface TeacherProfile {
  id: string;
  full_name: string;
}

export function CourseSettings({ courseId, initialData, onUpdate }: CourseSettingsProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [conceptMapUrl, setConceptMapUrl] = useState(initialData?.concept_map_url || "");
  const [tutorCvUrl, setTutorCvUrl] = useState(initialData?.tutor_cv_url || "");
  const [campusGuideUrl, setCampusGuideUrl] = useState(initialData?.campus_guide_url || "");
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(
    initialData?.specific_objectives || []
  );
  const [newObjective, setNewObjective] = useState("");
  
  // Tutor management state
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>(initialData?.tutor_id || "");
  const [tutorName, setTutorName] = useState("");
  const [savingTutor, setSavingTutor] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  // Load teachers list
  useEffect(() => {
    const loadTeachers = async () => {
      setLoadingTeachers(true);
      try {
        // Get users with teacher role
        const { data: userRolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["teacher", "admin", "super_admin"]);
        
        if (rolesError) throw rolesError;
        
        if (userRolesData && userRolesData.length > 0) {
          const userIds = userRolesData.map(ur => ur.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds)
            .order("full_name");
          
          if (profilesError) throw profilesError;
          setTeachers(profilesData || []);
          
          // Load current tutor name if exists
          if (initialData?.tutor_id) {
            const currentTutor = profilesData?.find(p => p.id === initialData.tutor_id);
            if (currentTutor) {
              setTutorName(currentTutor.full_name || "");
            }
          }
        }
      } catch (error) {
        console.error("Error loading teachers:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };
    
    loadTeachers();
  }, [initialData?.tutor_id]);

  // Handle tutor assignment
  const handleTutorChange = async (tutorId: string) => {
    setSelectedTutorId(tutorId);
    const selectedTeacher = teachers.find(t => t.id === tutorId);
    if (selectedTeacher) {
      setTutorName(selectedTeacher.full_name || "");
    }
    
    setSavingTutor(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ tutor_id: tutorId })
        .eq("id", courseId);
      
      if (error) throw error;
      
      toast({
        title: "Tutor asignado",
        description: `${selectedTeacher?.full_name || 'Tutor'} ha sido asignado al curso`,
      });
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingTutor(false);
    }
  };

  // Handle tutor name update
  const handleUpdateTutorName = async () => {
    if (!selectedTutorId || !tutorName.trim()) {
      toast({
        title: "Error",
        description: "Primero selecciona un tutor y escribe su nombre",
        variant: "destructive",
      });
      return;
    }

    setSavingTutor(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: tutorName })
        .eq("id", selectedTutorId);
      
      if (error) throw error;
      
      toast({
        title: "Nombre actualizado",
        description: "El nombre del tutor ha sido actualizado correctamente",
      });
      
      // Refresh teachers list
      setTeachers(prev => prev.map(t => 
        t.id === selectedTutorId ? { ...t, full_name: tutorName } : t
      ));
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingTutor(false);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      objectives: initialData?.objectives || "",
      support_email: initialData?.support_email || "",
      support_phone: initialData?.support_phone || "",
    },
  });

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de video válido",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El video no puede superar los 100MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${courseId}-intro-${Date.now()}.${fileExt}`;
      const filePath = `course-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-images")
        .getPublicUrl(filePath);

      setVideoUrl(publicUrl);

      // Update course
      const { error: updateError } = await supabase
        .from("courses")
        .update({ video_url: publicUrl })
        .eq("id", courseId);

      if (updateError) throw updateError;

      toast({
        title: "Video subido",
        description: "El video de presentación se ha guardado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleConceptMapUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${courseId}-concept-map-${Date.now()}.${fileExt}`;
      const filePath = `concept-maps/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-images")
        .getPublicUrl(filePath);

      setConceptMapUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("courses")
        .update({ concept_map_url: publicUrl })
        .eq("id", courseId);

      if (updateError) throw updateError;

      toast({
        title: "Mapa conceptual subido",
        description: "El mapa conceptual se ha guardado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      console.error("Error uploading concept map:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTutorCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo PDF",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo no puede superar los 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${courseId}-tutor-cv-${Date.now()}.pdf`;
      const filePath = `tutor-cvs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-images")
        .getPublicUrl(filePath);

      setTutorCvUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("courses")
        .update({ tutor_cv_url: publicUrl })
        .eq("id", courseId);

      if (updateError) throw updateError;

      toast({
        title: "CV subido",
        description: "El CV del docente se ha guardado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      console.error("Error uploading tutor CV:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCampusGuideUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo PDF",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo no puede superar los 20MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${courseId}-campus-guide-${Date.now()}.pdf`;
      const filePath = `campus-guides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-images")
        .getPublicUrl(filePath);

      setCampusGuideUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("courses")
        .update({ campus_guide_url: publicUrl })
        .eq("id", courseId);

      if (updateError) throw updateError;

      toast({
        title: "Guía subida",
        description: "La guía del campus se ha guardado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      console.error("Error uploading campus guide:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addObjective = async () => {
    if (!newObjective.trim()) return;

    const updatedObjectives = [...specificObjectives, newObjective];
    setSpecificObjectives(updatedObjectives);
    setNewObjective("");

    try {
      const { error } = await supabase
        .from("courses")
        .update({ specific_objectives: updatedObjectives })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Objetivo agregado",
        description: "El objetivo específico se ha agregado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeObjective = async (index: number) => {
    const updatedObjectives = specificObjectives.filter((_, i) => i !== index);
    setSpecificObjectives(updatedObjectives);

    try {
      const { error } = await supabase
        .from("courses")
        .update({ specific_objectives: updatedObjectives })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Objetivo eliminado",
        description: "El objetivo específico se ha eliminado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          objectives: data.objectives,
          support_email: data.support_email,
          support_phone: data.support_phone,
        })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los datos del curso se han actualizado correctamente",
      });

      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tutor Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Asignación de Tutor/a
          </CardTitle>
          <CardDescription>
            Selecciona y edita el nombre del tutor/a asignado al curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="tutor-select">Seleccionar Tutor/a</Label>
              {loadingTeachers ? (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando tutores...</span>
                </div>
              ) : (
                <Select 
                  value={selectedTutorId} 
                  onValueChange={handleTutorChange}
                  disabled={savingTutor}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona un tutor/a" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name || "Sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <Label htmlFor="tutor-name">Nombre del Tutor/a</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tutor-name"
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Nombre completo del tutor/a"
                  disabled={!selectedTutorId || savingTutor}
                />
                <Button 
                  onClick={handleUpdateTutorName}
                  disabled={!selectedTutorId || !tutorName.trim() || savingTutor}
                  size="icon"
                >
                  {savingTutor ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Edita el nombre que se mostrará a los alumnos
              </p>
            </div>
          </div>
          
          {selectedTutorId && tutorName && (
            <div className="p-3 bg-primary/5 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                  {tutorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{tutorName}</p>
                  <p className="text-xs text-muted-foreground">Tutor/a asignado/a al curso</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video de Presentación</CardTitle>
          <CardDescription>Sube un video de introducción al curso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {videoUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <video src={videoUrl} controls className="w-full h-full">
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          )}
          <div>
            <Label htmlFor="video-upload">
              {videoUrl ? "Cambiar video" : "Subir video"}
            </Label>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tamaño máximo: 100MB. Formatos aceptados: MP4, WebM, MOV
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guía del Campus Virtual</CardTitle>
          <CardDescription>Sube la guía de uso del campus en PDF para los alumnos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campusGuideUrl && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Guía del campus subida</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={campusGuideUrl} target="_blank" rel="noopener noreferrer">
                    Ver PDF
                  </a>
                </Button>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="campus-guide-upload">
              {campusGuideUrl ? "Cambiar guía" : "Subir guía"}
            </Label>
            <Input
              id="campus-guide-upload"
              type="file"
              accept="application/pdf"
              onChange={handleCampusGuideUpload}
              disabled={uploading}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tamaño máximo: 20MB. Solo archivos PDF con imágenes incluidas
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mapa Conceptual</CardTitle>
          <CardDescription>Sube una imagen con el mapa conceptual del curso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conceptMapUrl && (
            <img 
              src={conceptMapUrl} 
              alt="Mapa conceptual" 
              className="w-full rounded-lg border"
            />
          )}
          <div>
            <Label htmlFor="concept-map-upload">
              {conceptMapUrl ? "Cambiar imagen" : "Subir imagen"}
            </Label>
            <Input
              id="concept-map-upload"
              type="file"
              accept="image/*"
              onChange={handleConceptMapUpload}
              disabled={uploading}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CV del Docente (SEPE)</CardTitle>
          <CardDescription>Sube el curriculum vitae del docente para cumplir con requisitos SEPE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tutorCvUrl && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">CV del docente subido</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={tutorCvUrl} target="_blank" rel="noopener noreferrer">
                    Ver PDF
                  </a>
                </Button>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="tutor-cv-upload">
              {tutorCvUrl ? "Cambiar CV" : "Subir CV"}
            </Label>
            <Input
              id="tutor-cv-upload"
              type="file"
              accept="application/pdf"
              onChange={handleTutorCvUpload}
              disabled={uploading}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tamaño máximo: 10MB. Solo archivos PDF
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objetivos del Curso</CardTitle>
          <CardDescription>Define los objetivos generales y específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="objectives">Objetivo General</Label>
              <Textarea
                id="objectives"
                {...register("objectives")}
                placeholder="Describe el objetivo general del curso..."
                rows={4}
              />
            </div>

            <div>
              <Label>Objetivos Específicos</Label>
              <div className="space-y-2 mt-2">
                {specificObjectives.map((obj, index) => {
                  const displayText = typeof obj === 'string' ? obj : (obj as any)?.description || (obj as any)?.code || JSON.stringify(obj);
                  return (
                  <div key={index} className="flex items-center gap-2">
                    <p className="flex-1 text-sm p-2 bg-muted rounded">{displayText}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Agregar nuevo objetivo específico..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <Button type="button" onClick={addObjective}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-semibold mb-4">Datos de Contacto para Soporte</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="support_email">Email de Soporte</Label>
                  <Input
                    id="support_email"
                    type="email"
                    {...register("support_email")}
                    placeholder="soporte@ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="support_phone">Teléfono de Soporte</Label>
                  <Input
                    id="support_phone"
                    {...register("support_phone")}
                    placeholder="+34 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Configuración
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
