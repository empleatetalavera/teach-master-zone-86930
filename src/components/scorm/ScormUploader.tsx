import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileArchive, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ScormUploader() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scormData, setScormData] = useState({
    title: "",
    description: "",
    scorm_version: "1.2"
  });

  const uploadScormMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");

      setIsUploading(true);
      setUploadProgress(10);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('scorm-packages')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Create database record
      const { data: scormPackage, error: dbError } = await supabase
        .from('scorm_packages')
        .insert({
          title: scormData.title,
          description: scormData.description,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          scorm_version: scormData.scorm_version,
          uploaded_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      return scormPackage;
    },
    onSuccess: () => {
      toast({
        title: "Paquete SCORM subido",
        description: "El contenido se ha subido correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["scorm-packages"] });
      // Reset form
      setSelectedFile(null);
      setScormData({ title: "", description: "", scorm_version: "1.2" });
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: (error: any) => {
      console.error("Error uploading SCORM:", error);
      toast({
        title: "Error al subir",
        description: error.message || "No se pudo subir el paquete SCORM",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      toast({
        title: "Formato inválido",
        description: "Solo se permiten archivos ZIP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500MB max)
    if (file.size > 524288000) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo es 500MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    // Auto-fill title from filename if empty
    if (!scormData.title) {
      const nameWithoutExt = file.name.replace('.zip', '');
      setScormData({ ...scormData, title: nameWithoutExt });
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Selecciona un archivo",
        description: "Debes seleccionar un paquete SCORM",
        variant: "destructive",
      });
      return;
    }

    if (!scormData.title) {
      toast({
        title: "Título requerido",
        description: "Debes proporcionar un título",
        variant: "destructive",
      });
      return;
    }

    uploadScormMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Paquete SCORM
        </CardTitle>
        <CardDescription>
          Sube contenido educativo en formato SCORM 1.2 o SCORM 2004
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="scorm-file">Archivo SCORM (ZIP) *</Label>
          <div className="flex gap-2">
            <Input
              id="scorm-file"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileArchive className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <span className="text-xs">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Ej: Módulo 1 - Introducción"
            value={scormData.title}
            onChange={(e) => setScormData({ ...scormData, title: e.target.value })}
            disabled={isUploading}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe el contenido del paquete SCORM..."
            value={scormData.description}
            onChange={(e) => setScormData({ ...scormData, description: e.target.value })}
            disabled={isUploading}
            rows={3}
          />
        </div>

        {/* SCORM Version */}
        <div className="space-y-2">
          <Label htmlFor="version">Versión SCORM</Label>
          <Select
            value={scormData.scorm_version}
            onValueChange={(value) => setScormData({ ...scormData, scorm_version: value })}
            disabled={isUploading}
          >
            <SelectTrigger id="version">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.2">SCORM 1.2</SelectItem>
              <SelectItem value="2004">SCORM 2004</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subiendo...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Subiendo...
            </>
          ) : uploadProgress === 100 ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Completado
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Subir Paquete SCORM
            </>
          )}
        </Button>

        {/* Info */}
        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
          <p className="font-medium">Requisitos del paquete SCORM:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Formato: Archivo ZIP</li>
            <li>Tamaño máximo: 500 MB</li>
            <li>Debe incluir imsmanifest.xml en la raíz</li>
            <li>Compatible con SCORM 1.2 o SCORM 2004</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}