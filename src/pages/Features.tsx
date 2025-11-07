import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturesSection } from "@/components/FeaturesSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { TechnicalFeaturesSection } from "@/components/TechnicalFeaturesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Rocket, 
  Shield, 
  Zap, 
  Globe, 
  HeadphonesIcon,
  Award,
  TrendingUp,
  Users,
  Clock,
  Target,
  Smartphone
} from "lucide-react";

const platformBenefits = [
  {
    icon: Rocket,
    title: "Rápido Despliegue",
    description: "Tu plataforma lista en 48-72h con tu marca corporativa completa"
  },
  {
    icon: Shield,
    title: "100% Segura",
    description: "Cumplimiento RGPD, copias de seguridad automáticas y certificados SSL"
  },
  {
    icon: Globe,
    title: "Alta Disponibilidad",
    description: "99.9% uptime garantizado con infraestructura cloud escalable"
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Experiencia perfecta en móviles, tablets y ordenadores"
  },
  {
    icon: Zap,
    title: "Sin Mantenimiento",
    description: "Actualizaciones automáticas sin interrupciones del servicio"
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte Dedicado",
    description: "Equipo de soporte técnico disponible en horario laboral"
  }
];

const complianceFeatures = [
  "Cumplimiento normativa SEPE",
  "Generación automática de reportes oficiales",
  "Trazabilidad completa de actividad",
  "Registro detallado de tiempos de conexión",
  "Certificados oficiales automáticos",
  "Auditoría y seguimiento integral"
];

const advantagesVsCompetition = [
  {
    feature: "Precio competitivo",
    us: true,
    competitors: "Variable"
  },
  {
    feature: "Personalización total incluida",
    us: true,
    competitors: false
  },
  {
    feature: "SCORM 1.2 y 2004",
    us: true,
    competitors: true
  },
  {
    feature: "Soporte técnico español",
    us: true,
    competitors: "Limitado"
  },
  {
    feature: "Reportes SEPE integrados",
    us: true,
    competitors: "Coste adicional"
  },
  {
    feature: "Sin límite de usuarios",
    us: true,
    competitors: false
  },
  {
    feature: "API para integraciones",
    us: true,
    competitors: "Premium"
  },
  {
    feature: "Actualizaciones incluidas",
    us: true,
    competitors: true
  }
];

export default function Features() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="mb-4" variant="secondary">
              Características y Beneficios
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold">
              La plataforma más{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                completa
              </span>
              {" "}del mercado
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubre todas las funcionalidades que hacen de TalentCloud la mejor opción 
              para tu centro de formación
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button size="lg" asChild>
                <a href="/demo">Solicitar Demo</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/contact">Contactar Ventas</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <FeaturesSection />

      {/* Benefits by Role */}
      <BenefitsSection />

      {/* Platform Benefits Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Ventajas de la{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                plataforma
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Todo lo que necesitas para gestionar tu formación online
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformBenefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <TechnicalFeaturesSection />

      {/* SEPE Compliance */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Cumplimiento Normativa SEPE</h2>
                </div>
                <p className="text-muted-foreground mb-8">
                  Nuestra plataforma está diseñada específicamente para cumplir con todos los 
                  requisitos del Servicio Público de Empleo Estatal (SEPE)
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {complianceFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                ¿Por qué elegir{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  TalentCloud?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Comparativa con otras plataformas del mercado
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Característica</th>
                        <th className="text-center p-4 font-semibold text-primary">TalentCloud</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">Competencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advantagesVsCompetition.map((item, index) => (
                        <tr key={index} className="border-t border-border/50">
                          <td className="p-4">{item.feature}</td>
                          <td className="text-center p-4">
                            {item.us === true ? (
                              <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                            ) : (
                              <span className="text-sm text-muted-foreground">{item.us}</span>
                            )}
                          </td>
                          <td className="text-center p-4">
                            {item.competitors === true ? (
                              <CheckCircle2 className="w-6 h-6 text-muted-foreground mx-auto" />
                            ) : item.competitors === false ? (
                              <span className="text-2xl text-muted-foreground">−</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">{item.competitors}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, value: "10,000+", label: "Usuarios activos" },
              { icon: Target, value: "99.9%", label: "Disponibilidad" },
              { icon: Clock, value: "24/7", label: "Acceso continuo" },
              { icon: TrendingUp, value: "95%", label: "Satisfacción" }
            ].map((stat, index) => (
              <Card key={index} className="text-center p-6 border-border/50">
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">
              ¿Listo para transformar tu formación online?
            </h2>
            <p className="text-xl text-muted-foreground">
              Únete a los centros de formación que ya confían en TalentCloud
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button size="lg" asChild>
                <a href="/demo">Solicitar Demo Gratuita</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/shop">Ver Precios</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
