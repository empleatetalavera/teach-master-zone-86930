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
  ArrowLeft,
  Brain,
  Target,
  BarChart3,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Demo() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Demo data for time tracking
  const weeklyProgressData = [
    { week: "Sem 1", hours: 8 },
    { week: "Sem 2", hours: 12 },
    { week: "Sem 3", hours: 10 },
    { week: "Sem 4", hours: 15 },
    { week: "Sem 5", hours: 18 },
    { week: "Sem 6", hours: 14 },
  ];

  const moduleTimeData = [
    { module: "Módulo 1", presencial: 10, distancia: 15, teletrabajo: 8 },
    { module: "Módulo 2", presencial: 12, distancia: 18, teletrabajo: 10 },
    { module: "Módulo 3", presencial: 8, distancia: 12, teletrabajo: 6 },
    { module: "Módulo 4", presencial: 15, distancia: 20, teletrabajo: 12 },
  ];

  const competenciasDigitales = [
    { name: "Navegación y búsqueda", progress: 85, status: "completed" },
    { name: "Gestión de información", progress: 72, status: "in-progress" },
    { name: "Comunicación digital", progress: 90, status: "completed" },
    { name: "Creación de contenidos", progress: 65, status: "in-progress" },
    { name: "Seguridad digital", progress: 78, status: "completed" },
  ];

  const activityLog = [
    { date: "2025-01-10", activity: "Completado Módulo 2", duration: "2h 30min" },
    { date: "2025-01-09", activity: "Examen Módulo 1 - Aprobado", duration: "45min" },
    { date: "2025-01-08", activity: "Lectura de materiales", duration: "1h 15min" },
    { date: "2025-01-07", activity: "Videoconferencia con tutor", duration: "30min" },
  ];

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
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                    <TabsTrigger value="competencias">Competencias</TabsTrigger>
                    <TabsTrigger value="tiempos">Tiempos</TabsTrigger>
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                    <TabsTrigger value="resources">Recursos</TabsTrigger>
                    <TabsTrigger value="ai">Asistente IA</TabsTrigger>
                  </TabsList>

                  <TabsContent value="modules" className="space-y-4 mt-6">
                    {Array.from({ length: course.modules }).map((_, index) => {
                      const isCompleted = index < 2;
                      const isCurrent = index === 2;
                      return (
                        <Card 
                          key={index}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                isCompleted ? "bg-green-500/10" : 
                                isCurrent ? "bg-primary/10" : "bg-muted"
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                  <PlayCircle className={`w-6 h-6 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">
                                    Módulo {index + 1}: {
                                      index === 0 ? "Navegación y búsqueda de información" : 
                                      index === 1 ? "Gestión de datos y contenidos digitales" :
                                      index === 2 ? "Comunicación y colaboración digital" :
                                      index === 3 ? "Creación de contenidos digitales" :
                                      "Seguridad y resolución de problemas"
                                    }
                                  </h3>
                                  {isCompleted && <Badge variant="default" className="text-xs">Completado</Badge>}
                                  {isCurrent && <Badge variant="secondary" className="text-xs">En progreso</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {isCompleted ? "Completado el " + (index === 0 ? "08/01/2025" : "12/01/2025") : 
                                   isCurrent ? "Última actividad: hace 2 días" : "Bloqueado"}
                                </p>
                                {(isCompleted || isCurrent) && (
                                  <div className="mt-2">
                                    <Progress value={isCompleted ? 100 : 65} className="h-1" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </Card>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="competencias" className="space-y-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Competencias Digitales Básicas
                      </h3>
                      <div className="space-y-4">
                        {competenciasDigitales.map((comp, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comp.name}</span>
                                {comp.status === "completed" && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <span className="text-sm font-semibold">{comp.progress}%</span>
                            </div>
                            <Progress value={comp.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm">Evaluación de Competencias</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tu nivel actual es <strong>Intermedio</strong>. Has completado el 76% de las competencias digitales básicas requeridas.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tiempos" className="space-y-6 mt-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          Seguimiento de Tiempos (SEPE)
                        </h3>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Exportar PDF
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card className="p-4">
                          <p className="text-sm text-muted-foreground">Horas Totales</p>
                          <p className="text-2xl font-bold text-primary">127h</p>
                        </Card>
                        <Card className="p-4">
                          <p className="text-sm text-muted-foreground">Horas Presenciales</p>
                          <p className="text-2xl font-bold">45h</p>
                        </Card>
                        <Card className="p-4">
                          <p className="text-sm text-muted-foreground">Horas Distancia</p>
                          <p className="text-2xl font-bold">82h</p>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Progreso Semanal</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={weeklyProgressData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="week" />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-3">Distribución por Módulo</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={moduleTimeData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="module" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="presencial" fill="hsl(var(--primary))" name="Presencial" />
                              <Bar dataKey="distancia" fill="hsl(var(--secondary))" name="Distancia" />
                              <Bar dataKey="teletrabajo" fill="hsl(var(--accent))" name="Teletrabajo" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-3">Registro de Actividad</h4>
                          <div className="space-y-2">
                            {activityLog.map((log, index) => (
                              <Card key={index} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{log.activity}</p>
                                      <p className="text-xs text-muted-foreground">{log.date}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline">{log.duration}</Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tutor" className="space-y-4 mt-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full" />
                        <div>
                          <h3 className="font-semibold text-lg">María González</h3>
                          <p className="text-sm text-muted-foreground">Tutora especializada en Competencias Digitales</p>
                          <Badge variant="secondary" className="mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Disponible
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Última comunicación:</p>
                          <p className="text-sm text-muted-foreground">
                            "Excelente trabajo en el Módulo 2. Te recomiendo revisar los ejercicios adicionales antes del examen."
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">Hace 2 días</p>
                        </div>

                        <div className="space-y-3">
                          <Textarea 
                            placeholder="Escribe tu mensaje al tutor..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                          <Button className="w-full">
                            <Send className="w-4 h-4 mr-2" />
                            Enviar mensaje
                          </Button>
                        </div>

                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-3">Estadísticas de tutoría</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-2xl font-bold text-primary">12</p>
                              <p className="text-xs text-muted-foreground">Sesiones realizadas</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-2xl font-bold text-secondary">4.8</p>
                              <p className="text-xs text-muted-foreground">Valoración media</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="resources" className="space-y-4 mt-6">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <h3 className="font-semibold">Manual Competencias Digitales</h3>
                            <p className="text-sm text-muted-foreground">PDF - 156 páginas</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-secondary" />
                          <div>
                            <h3 className="font-semibold">Ejercicios prácticos</h3>
                            <p className="text-sm text-muted-foreground">ZIP - 45 MB</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <PlayCircle className="w-8 h-8 text-accent" />
                          <div>
                            <h3 className="font-semibold">Videotutoriales</h3>
                            <p className="text-sm text-muted-foreground">12 vídeos - 4.5h total</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-4 mt-6">
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">Asistente IA del Curso</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Tu asistente inteligente está disponible 24/7 para ayudarte con dudas sobre el contenido del curso.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="bg-background rounded-lg p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">Preguntas frecuentes respondidas:</p>
                                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                    <li>• ¿Cómo se evalúan las competencias digitales?</li>
                                    <li>• ¿Cuánto tiempo tengo para completar el curso?</li>
                                    <li>• ¿Dónde encuentro los recursos adicionales?</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <Input 
                              placeholder="Pregunta algo sobre el curso..."
                              className="bg-background"
                            />
                            <Button className="w-full">
                              <Brain className="w-4 h-4 mr-2" />
                              Consultar al asistente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Resumen generado por IA</h4>
                      <p className="text-sm text-muted-foreground">
                        Basándose en tu progreso actual (76%), el asistente IA recomienda enfocarte en:
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                        <li>Reforzar conceptos de seguridad digital</li>
                        <li>Practicar más ejercicios de creación de contenidos</li>
                        <li>Revisar el Módulo 2 antes del examen final</li>
                      </ul>
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
