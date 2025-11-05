import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Plus } from "lucide-react";

interface CourseSettingsProps {
  courseId: string;
  initialData?: {
    video_url?: string;
    objectives?: string;
    specific_objectives?: string[];
    concept_map_url?: string;
    support_email?: string;
    support_phone?: string;
  };
  onUpdate?: () => void;
}

export function CourseSettings({ courseId, initialData, onUpdate }: CourseSettingsProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [conceptMapUrl, setConceptMapUrl] = useState(initialData?.concept_map_url || "");
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(
    initialData?.specific_objectives || []
  );
  const [newObjective, setNewObjective] = useState("");

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
                {specificObjectives.map((obj, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <p className="flex-1 text-sm p-2 bg-muted rounded">{obj}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
