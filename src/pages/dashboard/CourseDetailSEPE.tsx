import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Award, 
  FileText, 
  CheckCircle,
  Download,
  Printer,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetailSEPE() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  // Fetch evaluation
  const { data: evaluation } = useQuery({
    queryKey: ["course-evaluation", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .eq("course_id", courseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  const handlePrint = () => {
    window.print();
    toast({
      title: "Imprimiendo",
      description: "Preparando documento para imprimir...",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportar PDF",
      description: "Funcionalidad en desarrollo",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title || "Curso SEPE",
        text: course?.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información del curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Curso no encontrado</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  const totalMinutes = modules.reduce((sum, mod) => sum + (mod.duration_minutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Logo SEPE para impresión */}
      <div className="print-only text-center mb-6">
        <img
          src="/branding/sepe-gobierno-logo.png"
          alt="SEPE - Gobierno de España"
          className="h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold">FICHA TÉCNICA DEL CURSO</h1>
        <p className="text-muted-foreground">Servicio Público de Empleo Estatal</p>
      </div>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{course.title}</CardTitle>
              <CardDescription className="text-base">
                {course.description}
              </CardDescription>
            </div>
            <Badge className="bg-green-600 text-white">
              <Award className="mr-1 h-3 w-3" />
              Certificado SEPE
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Ficha Técnica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ficha Técnica del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Denominación</p>
                <p className="font-semibold">{course.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Categoría</p>
                <p className="font-semibold">{course.category || "General"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nivel</p>
                <p className="font-semibold">
                  {course.level === "beginner" && "Básico"}
                  {course.level === "intermediate" && "Intermedio"}
                  {course.level === "advanced" && "Avanzado"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duración Total</p>
                <p className="font-semibold text-2xl text-primary">
                  {course.duration_hours || totalHours} horas
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({totalMinutes} minutos distribuidos en {modules.length} módulos)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Modalidad</p>
                <p className="font-semibold">Teleformación (100% Online)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Evaluación</p>
                <p className="font-semibold">
                  {evaluation ? `Nota mínima: ${evaluation.passing_score}%` : "Sin evaluación configurada"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">
            <BookOpen className="mr-2 h-4 w-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="objectives">
            <CheckCircle className="mr-2 h-4 w-4" />
            Objetivos
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <Award className="mr-2 h-4 w-4" />
            Evaluación
          </TabsTrigger>
        </TabsList>

        {/* Módulos Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estructura del Curso</CardTitle>
              <CardDescription>
                El curso está dividido en {modules.length} módulos formativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module, index) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-semibold">{module.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {module.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          {Math.round(module.duration_minutes / 60)}h
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-6" />

              {/* Contenido detallado de módulos */}
              <div className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold">Contenido Detallado por Módulo</h3>
                {modules.map((module, index) => (
                  <Card key={module.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Módulo {index + 1}: {module.title.replace(/^Módulo \d+: /, "")}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: module.content || "<p>Contenido no disponible</p>" }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objetivos Tab */}
        <TabsContent value="objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos del Curso</CardTitle>
              <CardDescription>
                Competencias y habilidades que adquirirá el alumno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Objetivo General</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adquirir las competencias digitales básicas necesarias para el uso eficaz y seguro 
                  de las tecnologías de la información y comunicación en el ámbito personal y profesional, 
                  mejorando así la empleabilidad y la capacidad de adaptación al entorno digital actual.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">Objetivos Específicos</h3>
                <div className="grid gap-4">
                  {[
                    "Identificar y utilizar de forma básica los dispositivos digitales y sistemas operativos más comunes",
                    "Navegar de forma segura y eficiente por Internet, realizando búsquedas efectivas de información",
                    "Utilizar el correo electrónico y herramientas de comunicación digital de manera profesional",
                    "Crear y editar documentos utilizando herramientas de ofimática básica (procesador de textos, hojas de cálculo, presentaciones)",
                    "Aplicar medidas de seguridad digital y proteger la información personal en el entorno online",
                    "Resolver problemas técnicos básicos de forma autónoma"
                  ].map((objetivo, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{objetivo}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">Competencias Profesionales</h3>
                <p className="text-muted-foreground mb-4">
                  Al finalizar el curso, el alumno habrá desarrollado las siguientes competencias 
                  según el Marco Común de Competencia Digital:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { area: "Información y alfabetización digital", nivel: "Básico" },
                    { area: "Comunicación y colaboración", nivel: "Básico" },
                    { area: "Creación de contenidos digitales", nivel: "Básico" },
                    { area: "Seguridad", nivel: "Básico" },
                    { area: "Resolución de problemas", nivel: "Básico" }
                  ].map((comp, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <p className="font-semibold mb-1">{comp.area}</p>
                        <Badge variant="outline">{comp.nivel}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluación Tab */}
        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Evaluación</CardTitle>
              <CardDescription>
                Criterios y metodología de evaluación del curso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {evaluation ? (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Nota Mínima</p>
                        <p className="text-3xl font-bold text-primary">{evaluation.passing_score}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Intentos Permitidos</p>
                        <p className="text-3xl font-bold text-primary">{evaluation.max_attempts}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Tiempo Límite</p>
                        <p className="text-3xl font-bold text-primary">{evaluation.time_limit_minutes} min</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Descripción de la Evaluación</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {evaluation.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay evaluación configurada para este curso</p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">Metodología de Evaluación</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Evaluación Continua</p>
                      <p className="text-sm text-muted-foreground">
                        Ejercicios prácticos al final de cada módulo para reforzar el aprendizaje
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Evaluación Final</p>
                      <p className="text-sm text-muted-foreground">
                        Prueba teórico-práctica que integra todos los conocimientos del curso
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Trazabilidad SEPE</p>
                      <p className="text-sm text-muted-foreground">
                        Seguimiento completo de la actividad del alumno según normativa SEPE
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Certificación
                </h4>
                <p className="text-sm text-muted-foreground">
                  Al superar el curso con éxito, el alumno recibirá un <strong>Certificado Oficial SEPE</strong> que 
                  acredita las competencias digitales básicas adquiridas. Este certificado es válido a nivel nacional 
                  y reconocido por empresas y organismos públicos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}