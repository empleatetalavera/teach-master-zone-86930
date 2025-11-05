import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  Users, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  FileText,
  Download,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const mockScormContent = [
  {
    id: 1,
    name: "Módulo 1: Fundamentos",
    type: "SCORM 1.2",
    size: "45 MB",
    uploadDate: "2024-01-15",
    courses: 3
  },
  {
    id: 2,
    name: "Módulo 2: Prácticas Avanzadas",
    type: "SCORM 2004",
    size: "78 MB",
    uploadDate: "2024-01-20",
    courses: 2
  },
  {
    id: 3,
    name: "Evaluación Final",
    type: "SCORM 1.2",
    size: "12 MB",
    uploadDate: "2024-02-01",
    courses: 5
  },
];

export default function TeacherCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("courses");
  const [newCourse, setNewCourse] = useState({
    title: "",
    duration: "",
    description: "",
    category: "Desarrollo Web",
    level: "Principiante"
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch courses from database
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Upload image to storage
  const uploadCourseImage = async (file: File, courseId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('course-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourse) => {
      // First, create the course
      const { data, error } = await supabase
        .from("courses")
        .insert([{
          title: courseData.title,
          description: courseData.description,
          duration_hours: parseInt(courseData.duration) || null,
          category: courseData.category,
          level: courseData.level,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;

      // If there's an image, upload it and update the course
      if (selectedImage && data) {
        const imageUrl = await uploadCourseImage(selectedImage, data.id);
        
        const { error: updateError } = await supabase
          .from("courses")
          .update({ thumbnail_url: imageUrl })
          .eq("id", data.id);

        if (updateError) throw updateError;
        
        return { ...data, thumbnail_url: imageUrl };
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      toast({
        title: "¡Curso creado!",
        description: "El curso ha sido creado exitosamente",
      });
      setNewCourse({
        title: "",
        duration: "",
        description: "",
        category: "Desarrollo Web",
        level: "Principiante"
      });
      setSelectedImage(null);
      setImagePreview(null);
      setActiveTab("courses");
    },
    onError: (error) => {
      toast({
        title: "Error al crear curso",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten imágenes JPG, PNG o WEBP",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y la descripción",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(newCourse);
  };

  const handleEditCourse = (courseId: string) => {
    toast({
      title: "Editar curso",
      description: `Editando curso ${courseId}`,
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_active: false })
      .eq("id", courseId);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    toast({
      title: "Curso eliminado",
      description: "El curso ha sido desactivado correctamente",
    });
  };

  const handleUploadScorm = () => {
    toast({
      title: "Subir contenido SCORM",
      description: "Función de carga en desarrollo",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Administra tus cursos, crea nuevos contenidos y gestiona recursos SCORM
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="create">Crear Nuevo</TabsTrigger>
          <TabsTrigger value="scorm">SCORM</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando cursos...</div>
          ) : courses.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No hay cursos todavía</h3>
              <p className="text-muted-foreground mb-4">Crea tu primer curso para comenzar</p>
              <Button onClick={() => setActiveTab("create")}>
                <BookOpen className="mr-2 h-4 w-4" />
                Crear Primer Curso
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden"
                  >
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <CardDescription className="mt-2">{course.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Vista previa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours ? `${course.duration_hours} horas` : 'Sin definir'}</span>
                        </div>
                        {course.category && (
                          <Badge variant="outline">{course.category}</Badge>
                        )}
                      </div>

                      <Badge variant={course.is_active ? "default" : "secondary"}>
                        {course.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Curso</CardTitle>
              <CardDescription>
                Completa la información para crear un nuevo curso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Curso *</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej: Introducción a Python"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (horas) *</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    placeholder="Ej: 40"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Input 
                    id="category"
                    placeholder="Ej: Desarrollo Web"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel *</Label>
                  <Input 
                    id="level"
                    placeholder="Ej: Principiante, Intermedio, Avanzado"
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe el contenido y objetivos del curso..."
                  className="min-h-[120px]"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagen del Curso</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Formatos: JPG, PNG, WEBP. Tamaño máximo: 5MB. Recomendado: 1200x600px
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleCreateCourse}
                  disabled={createCourseMutation.isPending}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {createCourseMutation.isPending ? "Creando..." : "Crear Curso"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scorm" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contenidos SCORM</CardTitle>
                  <CardDescription>
                    Gestiona tus paquetes de contenido SCORM
                  </CardDescription>
                </div>
                <Button onClick={handleUploadScorm}>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir SCORM
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockScormContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {content.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{content.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {content.size}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {content.uploadDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {content.courses} cursos
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
