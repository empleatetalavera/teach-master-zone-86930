import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, Eye, Award, Users, Lightbulb, Heart, 
  TrendingUp, Shield, Zap, Globe
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovación",
      description: "Constante evolución tecnológica para ofrecer las mejores soluciones del mercado."
    },
    {
      icon: Heart,
      title: "Compromiso",
      description: "Dedicación total al éxito de nuestros clientes y sus alumnos."
    },
    {
      icon: Shield,
      title: "Confianza",
      description: "Transparencia y seguridad en cada interacción y proceso."
    },
    {
      icon: Users,
      title: "Colaboración",
      description: "Trabajo en equipo con nuestros clientes para alcanzar objetivos comunes."
    },
    {
      icon: Zap,
      title: "Excelencia",
      description: "Máxima calidad en cada detalle de nuestra plataforma y servicio."
    },
    {
      icon: Globe,
      title: "Accesibilidad",
      description: "Educación al alcance de todos, sin barreras tecnológicas."
    }
  ];

  const milestones = [
    { year: "2018", event: "Fundación de TalentCloud Solution" },
    { year: "2019", event: "Primeros 50 centros de formación" },
    { year: "2020", event: "Certificación SEPE y 500.000 alumnos" },
    { year: "2021", event: "Expansión internacional - 5 países" },
    { year: "2022", event: "1 millón de alumnos formados" },
    { year: "2023", event: "Lanzamiento de IA Educativa" },
    { year: "2024", event: "+500 centros y 2M alumnos" }
  ];

  const stats = [
    { number: "500+", label: "Centros de Formación", icon: Award },
    { number: "2M+", label: "Alumnos Formados", icon: Users },
    { number: "50K+", label: "Cursos Impartidos", icon: TrendingUp },
    { number: "98%", label: "Satisfacción", icon: Heart }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4">Sobre Nosotros</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transformando la{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Educación Digital
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Desde 2018, ayudamos a centros de formación y empresas a digitalizar 
              y optimizar su formación con tecnología de vanguardia.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Nuestra Misión</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Democratizar el acceso a la formación de calidad mediante tecnología 
                innovadora, potenciando el crecimiento profesional y personal de millones 
                de personas en todo el mundo.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Nuestra Visión</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Ser la plataforma e-learning líder en Europa, reconocida por su innovación, 
                calidad y compromiso con la excelencia educativa, transformando la manera 
                en que las personas aprenden y crecen profesionalmente.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nuestros Valores</h2>
            <p className="text-xl text-muted-foreground">
              Los principios que guían cada decisión y acción
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nuestra Historia</h2>
            <p className="text-xl text-muted-foreground">
              Un viaje de innovación y crecimiento continuo
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-center">
                  <div className="w-24 flex-shrink-0 text-right">
                    <Badge className="text-lg px-4 py-2">{milestone.year}</Badge>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
                  <Card className="flex-1 p-6">
                    <p className="font-medium text-lg">{milestone.event}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Dónde Estamos</h2>
            <p className="text-xl text-muted-foreground">
              Con sede en Talavera de la Reina, presentes en toda España
            </p>
          </div>

          <Card className="p-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">Oficinas Principales</h3>
                <div className="space-y-4 text-lg">
                  <p className="flex items-start gap-3">
                    <Globe className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span>Talavera de la Reina, Toledo</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-primary font-semibold">Email:</span>
                    <a href="mailto:comercial@talentcloudsolution.es" className="hover:underline">
                      comercial@talentcloudsolution.es
                    </a>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-primary font-semibold">Teléfono:</span>
                    <a href="tel:+34665673416" className="hover:underline">
                      +34 665 673 416
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6">Horario de Atención</h3>
                <div className="space-y-3 text-lg text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Lunes - Viernes:</span> 9:00 - 18:00</p>
                  <p><span className="font-semibold text-foreground">Sábados:</span> 10:00 - 14:00</p>
                  <p><span className="font-semibold text-foreground">Domingos:</span> Cerrado</p>
                  <p className="text-sm mt-4">
                    Soporte técnico 24/7 para clientes Premium
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" asChild>
                <a href="/contact">Contáctanos</a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <h2 className="text-3xl font-bold mb-4">
              ¿Quieres Formar Parte de Nuestra Historia?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a cientos de organizaciones que ya confían en TalentCloud para su formación
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/shop">Ver Planes</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/demo">Solicitar Demo</a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
