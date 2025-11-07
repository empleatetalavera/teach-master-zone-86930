import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Video, FileText, Code, HelpCircle, 
  Download, Search, Rocket, Users, Settings, GraduationCap
} from "lucide-react";
import { useState } from "react";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Primeros Pasos",
      icon: Rocket,
      docs: [
        { title: "Guía de Inicio Rápido", type: "Guía", time: "5 min" },
        { title: "Configuración Inicial", type: "Tutorial", time: "15 min" },
        { title: "Creación del Primer Curso", type: "Tutorial", time: "20 min" },
        { title: "Gestión de Usuarios", type: "Guía", time: "10 min" }
      ]
    },
    {
      title: "Para Administradores",
      icon: Settings,
      docs: [
        { title: "Panel de Administración", type: "Guía", time: "10 min" },
        { title: "Gestión de Centros de Formación", type: "Tutorial", time: "15 min" },
        { title: "Configuración de Licencias", type: "Guía", time: "12 min" },
        { title: "Informes y Analytics", type: "Tutorial", time: "20 min" }
      ]
    },
    {
      title: "Para Tutores",
      icon: Users,
      docs: [
        { title: "Gestión de Alumnos", type: "Guía", time: "15 min" },
        { title: "Crear Evaluaciones", type: "Tutorial", time: "18 min" },
        { title: "Sistema de Mensajería", type: "Guía", time: "8 min" },
        { title: "Generación de Certificados", type: "Tutorial", time: "12 min" }
      ]
    },
    {
      title: "Para Alumnos",
      icon: GraduationCap,
      docs: [
        { title: "Acceso a la Plataforma", type: "Guía", time: "5 min" },
        { title: "Navegación por Cursos", type: "Tutorial", time: "10 min" },
        { title: "Realizar Evaluaciones", type: "Guía", time: "8 min" },
        { title: "Descargar Certificados", type: "Guía", time: "5 min" }
      ]
    }
  ];

  const videos = [
    { title: "Introducción a TalentCloud", duration: "8:34", views: "2.5K" },
    { title: "Configuración Inicial Completa", duration: "15:20", views: "1.8K" },
    { title: "Gestión Avanzada de Cursos", duration: "22:15", views: "1.2K" },
    { title: "Integración SCORM", duration: "12:45", views: "980" },
    { title: "Cumplimiento SEPE Paso a Paso", duration: "18:30", views: "1.5K" },
    { title: "Informes y Trazabilidad", duration: "14:20", views: "920" }
  ];

  const apiDocs = [
    { title: "Autenticación", description: "Guía de autenticación API REST" },
    { title: "Gestión de Usuarios", description: "Endpoints para CRUD de usuarios" },
    { title: "Cursos y Módulos", description: "API para gestión de contenidos" },
    { title: "Evaluaciones", description: "Endpoints de evaluaciones y calificaciones" },
    { title: "Webhooks", description: "Configuración de eventos en tiempo real" },
    { title: "SDKs", description: "Librerías oficiales en diferentes lenguajes" }
  ];

  const downloads = [
    { title: "Manual de Usuario Completo", type: "PDF", size: "8.5 MB" },
    { title: "Guía de Administrador", type: "PDF", size: "12.3 MB" },
    { title: "Manual Técnico de Integración", type: "PDF", size: "5.2 MB" },
    { title: "Plantillas de Certificados", type: "ZIP", size: "15.8 MB" },
    { title: "Material de Marketing", type: "ZIP", size: "45.2 MB" }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge className="mb-4">Centro de Documentación</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Todo lo que Necesitas{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Saber
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Guías, tutoriales, videos y documentación técnica para sacar el máximo provecho de TalentCloud
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar en la documentación..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="guides" className="space-y-8">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4">
              <TabsTrigger value="guides">
                <BookOpen className="h-4 w-4 mr-2" />
                Guías
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="api">
                <Code className="h-4 w-4 mr-2" />
                API
              </TabsTrigger>
              <TabsTrigger value="downloads">
                <Download className="h-4 w-4 mr-2" />
                Descargas
              </TabsTrigger>
            </TabsList>

            {/* Guides Tab */}
            <TabsContent value="guides" className="space-y-8">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <CardTitle>{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {category.docs.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.type} • {doc.time}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">Nuevo</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Video className="h-16 w-16 text-primary" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>
                        {video.duration} • {video.views} visualizaciones
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* API Tab */}
            <TabsContent value="api">
              <div className="grid md:grid-cols-2 gap-6">
                {apiDocs.map((doc, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Code className="h-5 w-5 text-primary" />
                        <CardTitle>{doc.title}</CardTitle>
                      </div>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Ver Documentación
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Downloads Tab */}
            <TabsContent value="downloads">
              <Card>
                <CardHeader>
                  <CardTitle>Recursos Descargables</CardTitle>
                  <CardDescription>
                    Descarga manuales, plantillas y recursos adicionales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {downloads.map((download, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Download className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">{download.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {download.type} • {download.size}
                            </p>
                          </div>
                        </div>
                        <Button>Descargar</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <HelpCircle className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              ¿No Encuentras lo que Buscas?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nuestro equipo de soporte está aquí para ayudarte. Contacta con nosotros y resolveremos tus dudas.
            </p>
            <Button size="lg" asChild>
              <a href="/support">Contactar Soporte</a>
            </Button>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
