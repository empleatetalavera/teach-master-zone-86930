import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, Users, BarChart, Shield, Cloud, Zap, 
  BookOpen, Award, MessageSquare, Video, FileText, Settings
} from "lucide-react";

export default function Platform() {
  const features = [
    {
      icon: GraduationCap,
      title: "Gestión de Cursos",
      description: "Crea y gestiona cursos SCORM con facilidad. Incluye módulos, evaluaciones y actividades de desarrollo."
    },
    {
      icon: Users,
      title: "Gestión de Usuarios",
      description: "Sistema completo de roles (Admin, Tutor, Alumno, Auditor) con permisos personalizables."
    },
    {
      icon: BarChart,
      title: "Informes Avanzados",
      description: "Analítica en tiempo real con informes detallados de progreso, asistencia y evaluaciones."
    },
    {
      icon: Shield,
      title: "Cumplimiento SEPE",
      description: "Trazabilidad completa según normativa SEPE. Gestión de certificados y documentación oficial."
    },
    {
      icon: Cloud,
      title: "Cloud Native",
      description: "Plataforma 100% en la nube con backup automático y escalabilidad bajo demanda."
    },
    {
      icon: Zap,
      title: "Alto Rendimiento",
      description: "Carga rápida y optimizada. Soporta miles de usuarios simultáneos sin pérdida de rendimiento."
    },
    {
      icon: BookOpen,
      title: "Biblioteca SCORM",
      description: "Acceso al catálogo completo de especialidades formativas INCUAL y certificados de profesionalidad."
    },
    {
      icon: Award,
      title: "Certificaciones",
      description: "Generación automática de certificados personalizables con firma digital y código QR."
    },
    {
      icon: MessageSquare,
      title: "Comunicación Integrada",
      description: "Sistema de mensajería entre tutores y alumnos. Foros de discusión por curso y módulo."
    },
    {
      icon: Video,
      title: "Aulas Virtuales",
      description: "Integración con sistemas de videoconferencia para clases en vivo y tutorías."
    },
    {
      icon: FileText,
      title: "Gestión Documental",
      description: "Almacenamiento seguro de documentos. Gestión de expedientes y certificaciones."
    },
    {
      icon: Settings,
      title: "Personalización Total",
      description: "Personaliza colores, logos, dominios y funcionalidades según tu marca corporativa."
    }
  ];

  const useCases = [
    {
      title: "Centros de Formación",
      description: "Gestiona tus cursos subvencionados y privados desde una única plataforma.",
      badge: "Popular"
    },
    {
      title: "Empresas",
      description: "Formación continua para empleados con seguimiento y reporting completo.",
      badge: "Empresas"
    },
    {
      title: "Academias Online",
      description: "Crea tu academia digital con todas las herramientas necesarias.",
      badge: "Digital"
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-4">Plataforma e-Learning Profesional</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              La Plataforma Más{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Completa
              </span>
              {" "}del Mercado
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Todo lo que necesitas para gestionar tu centro de formación: 
              desde la matriculación hasta la certificación, con total cumplimiento SEPE.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/shop">Ver Planes</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/demo">Solicitar Demo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Características Principales</h2>
            <p className="text-xl text-muted-foreground">
              Todo lo que necesitas en una única plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Casos de Uso</h2>
            <p className="text-xl text-muted-foreground">
              Adaptable a cualquier tipo de organización formativa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center p-8">
                <Badge className="mb-4">{useCase.badge}</Badge>
                <h3 className="text-2xl font-bold mb-4">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para Empezar?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Solicita una demo personalizada y descubre cómo TalentCloud puede 
              transformar la gestión de tu centro de formación.
            </p>
            <Button size="lg" asChild>
              <a href="/contact">Contactar Ahora</a>
            </Button>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
