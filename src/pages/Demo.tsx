import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  PlayCircle,
  FileText,
  MessageSquare,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Demo() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const demoCourses = [
    {
      id: 1,
      title: "Gestión Administrativa del Comercio Internacional",
      code: "COMT0210",
      progress: 45,
      hours: 120,
      currentModule: "Módulo 2: Gestión Administrativa del Comercio",
      modules: 4,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
      description: "Certificado de profesionalidad en gestión administrativa del comercio internacional",
      category: "Comercio"
    },
    {
      id: 2,
      title: "Desarrollo de Aplicaciones Web",
      code: "IFCD0210",
      progress: 78,
      hours: 180,
      currentModule: "Módulo 4: Desarrollo Web Avanzado",
      modules: 5,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
      description: "Certificado de profesionalidad en desarrollo de aplicaciones con tecnologías web",
      category: "Informática"
    },
    {
      id: 3,
      title: "Marketing Digital y Comercio Electrónico",
      code: "COMM0112",
      progress: 23,
      hours: 90,
      currentModule: "Módulo 1: Fundamentos del Marketing Digital",
      modules: 3,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      description: "Especialización en estrategias de marketing digital y e-commerce",
      category: "Marketing"
    }
  ];

  const stats = [
    {
      title: "Cursos Activos",
      value: "3",
      icon: BookOpen,
      color: "text-primary"
    },
    {
      title: "Certificados",
      value: "2",
      icon: Award,
      color: "text-secondary"
    },
    {
      title: "Horas Cursadas",
      value: "127",
      icon: Clock,
      color: "text-accent"
    },
    {
      title: "Progreso Promedio",
      value: "48%",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  if (selectedCourse) {
    const course = demoCourses.find(c => c.id === selectedCourse);
    if (!course) return null;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCourse(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {course.code}
                      </Badge>
                      <h1 className="text-3xl font-bold">{course.title}</h1>
                      <p className="text-muted-foreground mt-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{course.hours} horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{course.modules} módulos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso del curso</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Tabs defaultValue="modules">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                    <TabsTrigger value="resources">Recursos</TabsTrigger>
                    <TabsTrigger value="forum">Foro</TabsTrigger>
                  </TabsList>

                  <TabsContent value="modules" className="space-y-4 mt-6">
                    {Array.from({ length: course.modules }).map((_, index) => (
                      <Card 
                        key={index}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <PlayCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                Módulo {index + 1}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {index === 0 ? "Introducción y fundamentos" : 
                                 index === 1 ? "Desarrollo práctico" :
                                 index === 2 ? "Casos de estudio" :
                                 "Proyecto final"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="resources" className="space-y-4 mt-6">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-4">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">Manual del curso</h3>
                          <p className="text-sm text-muted-foreground">PDF - 156 páginas</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-4">
                        <FileText className="w-8 h-8 text-secondary" />
                        <div>
                          <h3 className="font-semibold">Ejercicios prácticos</h3>
                          <p className="text-sm text-muted-foreground">ZIP - 45 MB</p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="forum" className="space-y-4 mt-6">
                    <Card className="p-4">
                      <div className="flex items-start gap-4">
                        <MessageSquare className="w-8 h-8 text-primary mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold">Foro de debate abierto</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Participa en discusiones con tus compañeros y tutores
                          </p>
                          <Button variant="outline" className="mt-4">
                            Acceder al foro
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Tu Tutor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full" />
                  <div>
                    <p className="font-semibold">María González</p>
                    <p className="text-sm text-muted-foreground">Tutora especializada</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Próxima Evaluación</h3>
                <div className="space-y-2">
                  <p className="text-sm">Examen Módulo 2</p>
                  <p className="text-2xl font-bold text-primary">5 días</p>
                  <Button className="w-full mt-4">
                    Preparar examen
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Modo Demo
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Bienvenido a TalentCloudSolution
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra plataforma con datos de ejemplo. Esta es una demostración interactiva 
              de las capacidades del sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Mis Cursos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoCourses.map((course) => (
                <Card 
                  key={course.id}
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {course.code}
                      </Badge>
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.hours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.modules} módulos</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Continuar curso
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para empezar?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Esta es solo una demostración. Crea tu cuenta para acceder a la plataforma completa 
              con todos los cursos y funcionalidades disponibles.
            </p>
            <Button size="lg" variant="hero" asChild>
              <a href="/auth">
                Crear mi cuenta ahora
              </a>
            </Button>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
