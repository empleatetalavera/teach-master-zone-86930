import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Globe,
  Server,
  Phone,
  Mail,
  ArrowRight,
  Award,
  Building2
} from "lucide-react";

export default function SeguimientoSEPE() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Servicio Obligatorio SEPE
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              URL de Seguimiento SOAP para{" "}
              <span className="text-primary">Teleformación SEPE</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Servicio web de seguimiento requerido por SEPE para la acreditación e inscripción 
              de entidades de formación en modalidad de teleformación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/contact">
                  Solicitar Información
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:+34955271515">
                  <Phone className="mr-2 h-5 w-5" />
                  Llamar Ahora
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is it Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">¿Qué es la URL de Seguimiento SOAP?</h2>
              <p className="text-lg text-muted-foreground">
                Es un servicio web obligatorio que permite al SEPE verificar y auditar 
                la actividad formativa de los alumnos en plataformas de teleformación.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Requisito Legal</CardTitle>
                  <CardDescription>
                    Obligatorio para todas las entidades de formación que imparten teleformación 
                    subvencionada o bonificada a través de FUNDAE/SEPE.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Conexión en Tiempo Real</CardTitle>
                  <CardDescription>
                    El servicio SOAP permite a los inspectores de SEPE acceder a los datos 
                    de seguimiento de los alumnos en tiempo real.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Datos de Trazabilidad</CardTitle>
                  <CardDescription>
                    Registra tiempos de conexión, avance en contenidos, participación en foros, 
                    evaluaciones realizadas y comunicaciones con tutores.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>URL Personalizada</CardTitle>
                  <CardDescription>
                    Cada centro de formación recibe una URL única basada en su CIF 
                    que debe comunicar al SEPE en su acreditación.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Precio del Servicio</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Tarifa trimestral por centro de formación
            </p>
            
            <Card className="max-w-md mx-auto border-primary">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-2xl">Seguimiento SOAP SEPE</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  ¡Activación en 24 horas!
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold">200€</span>
                  <span className="text-muted-foreground">/trimestre</span>
                  <p className="text-sm text-muted-foreground mt-2">+ IVA por centro de formación</p>
                </div>
                
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>URL de seguimiento personalizada con tu CIF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Credenciales de acceso para inspectores SEPE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Servicio SOAP conforme a especificaciones SEPE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Alta disponibilidad 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Soporte técnico incluido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Actualizaciones automáticas según normativa</span>
                  </li>
                </ul>
                
                <Button size="lg" className="w-full">
                  <a href="/contact">Contratar Ahora</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">¿Cómo Funciona?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Solicita el Servicio</h3>
                <p className="text-muted-foreground">
                  Contacta con nosotros indicando el CIF de tu centro de formación y los datos fiscales.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Configuración</h3>
                <p className="text-muted-foreground">
                  En 24 horas generamos tu URL de seguimiento personalizada y las credenciales de acceso.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Listo para SEPE</h3>
                <p className="text-muted-foreground">
                  Incluye la URL en tu solicitud de acreditación o inscripción ante el SEPE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Confían en Nosotros</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">+150</div>
                <p className="text-muted-foreground">Centros de Formación</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Disponibilidad</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24h</div>
                <p className="text-muted-foreground">Activación</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10+</div>
                <p className="text-muted-foreground">Años de Experiencia</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Award className="w-12 h-12 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Servicio Homologado</p>
                <p className="text-sm text-muted-foreground">Conforme a las especificaciones técnicas del SEPE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas la URL de Seguimiento SOAP?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Contáctanos hoy y ten tu servicio activo en menos de 24 horas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Solicitar Información
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <a href="tel:+34955271515">
                  <Phone className="mr-2 h-5 w-5" />
                  955 27 15 15
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
