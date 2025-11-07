import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Book, Video, MessageCircle, Mail, Phone, Clock,
  AlertCircle, CheckCircle, HelpCircle, FileText, Headphones
} from "lucide-react";
import { useState } from "react";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");

  const quickLinks = [
    {
      icon: Book,
      title: "Base de Conocimiento",
      description: "Artículos y guías paso a paso",
      link: "/documentation"
    },
    {
      icon: Video,
      title: "Tutoriales en Video",
      description: "Aprende viendo videotutoriales",
      link: "/documentation"
    },
    {
      icon: MessageCircle,
      title: "Chat en Vivo",
      description: "Habla con un agente ahora",
      badge: "Online",
      badgeColor: "bg-green-500"
    },
    {
      icon: Mail,
      title: "Email de Soporte",
      description: "soporte@talentcloudsolution.es",
      link: "mailto:soporte@talentcloudsolution.es"
    }
  ];

  const faqs = [
    {
      question: "¿Cómo puedo restablecer mi contraseña?",
      answer: "Haz clic en '¿Olvidaste tu contraseña?' en la página de inicio de sesión y sigue las instrucciones que recibirás por email."
    },
    {
      question: "¿Cuántos usuarios puedo tener en mi plan?",
      answer: "Depende del plan contratado. El plan Básico permite hasta 100 usuarios, el plan Pro hasta 500, y el plan Empresa tiene usuarios ilimitados."
    },
    {
      question: "¿Cómo puedo subir contenidos SCORM?",
      answer: "Ve a Panel de Administración > Cursos > Nuevo Curso y selecciona 'Subir paquete SCORM'. Acepta archivos .zip con contenido SCORM 1.2 y 2004."
    },
    {
      question: "¿Ofrecen soporte técnico 24/7?",
      answer: "El soporte 24/7 está disponible para clientes de los planes Pro y Empresa. El plan Básico tiene soporte de lunes a viernes de 9:00 a 18:00."
    },
    {
      question: "¿Cómo puedo generar informes SEPE?",
      answer: "Los informes SEPE se generan automáticamente. Ve a Trazabilidad > Informes y selecciona el curso y periodo deseado."
    },
    {
      question: "¿Puedo personalizar el diseño de mi plataforma?",
      answer: "Sí, puedes personalizar colores, logos, dominios y más desde Panel de Administración > Configuración > Personalización."
    }
  ];

  const status = {
    operational: [
      "Plataforma Principal",
      "API REST",
      "Sistema de Autenticación",
      "Almacenamiento de Archivos",
      "Base de Datos"
    ],
    maintenance: []
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge className="mb-4">Centro de Soporte</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              ¿En Qué Podemos{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ayudarte?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Encuentra respuestas rápidas o contacta con nuestro equipo de soporte
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar en la ayuda..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                      {link.title}
                      {link.badge && (
                        <Badge className={link.badgeColor}>{link.badge}</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Monitoreo en tiempo real de todos nuestros servicios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Todos los Sistemas Operativos
                </span>
              </div>

              <div className="space-y-2">
                {status.operational.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{service}</span>
                    <Badge className="bg-green-500">Operativo</Badge>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground text-center pt-4">
                Última actualización: Hace 2 minutos
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-muted-foreground">
              Respuestas a las dudas más comunes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <a href="/documentation">Ver Más en la Documentación</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">¿Necesitas Más Ayuda?</h2>
                <p className="text-xl text-muted-foreground">
                  Nuestro equipo de soporte está listo para asistirte
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-muted/50 border-none">
                  <CardContent className="pt-6 text-center">
                    <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Respuesta en 24h
                    </p>
                    <a 
                      href="mailto:soporte@talentcloudsolution.es"
                      className="text-sm text-primary hover:underline"
                    >
                      soporte@talentcloudsolution.es
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-none">
                  <CardContent className="pt-6 text-center">
                    <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Teléfono</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lun-Vie, 9:00-18:00
                    </p>
                    <a 
                      href="tel:+34665673416"
                      className="text-sm text-primary hover:underline"
                    >
                      +34 665 673 416
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-none">
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Horario</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Lunes a Viernes<br />
                      9:00 - 18:00
                    </p>
                    <p className="text-xs text-muted-foreground">
                      24/7 para planes Pro y Empresa
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button size="lg" asChild>
                  <a href="/contact">Abrir Ticket de Soporte</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
