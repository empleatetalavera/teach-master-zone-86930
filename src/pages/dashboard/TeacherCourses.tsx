import { useState } from "react";
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

const mockCourses = [
  {
    id: 1,
    title: "Introducción a React",
    description: "Aprende los fundamentos de React desde cero",
    students: 45,
    duration: "8 semanas",
    status: "active",
    progress: 75,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400"
  },
  {
    id: 2,
    title: "JavaScript Avanzado",
    description: "Domina conceptos avanzados de JavaScript",
    students: 32,
    duration: "6 semanas",
    status: "active",
    progress: 45,
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400"
  },
  {
    id: 3,
    title: "TypeScript para Profesionales",
    description: "Aprende TypeScript y sus mejores prácticas",
    students: 28,
    duration: "4 semanas",
    status: "draft",
    progress: 20,
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400"
  },
];

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
  const [activeTab, setActiveTab] = useState("courses");

  const handleEditCourse = (courseId: number) => {
    toast({
      title: "Editar curso",
      description: `Editando curso ${courseId}`,
    });
  };

  const handleDeleteCourse = (courseId: number) => {
    toast({
      title: "Curso eliminado",
      description: "El curso ha sido eliminado correctamente",
      variant: "destructive",
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.image})` }}
                />
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
                        <Users className="h-4 w-4" />
                        <span>{course.students} estudiantes</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status === "active" ? "Activo" : "Borrador"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración *</Label>
                  <Input 
                    id="duration" 
                    placeholder="Ej: 8 semanas" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe el contenido y objetivos del curso..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagen del Curso</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Formato recomendado: JPG o PNG, 1200x600px
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scorm">Contenido SCORM (Opcional)</Label>
                <Input 
                  id="scorm" 
                  type="file" 
                  accept=".zip"
                />
                <p className="text-sm text-muted-foreground">
                  Sube un paquete SCORM 1.2 o 2004 en formato ZIP
                </p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Crear Curso
                </Button>
                <Button variant="outline" size="lg">
                  Guardar Borrador
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
