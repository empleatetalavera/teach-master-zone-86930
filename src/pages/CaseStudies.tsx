import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, TrendingUp, Users, Award } from "lucide-react";

export default function CaseStudies() {
  const cases = [
    {
      company: "Centro de Formación Castilla-La Mancha",
      sector: "Formación Subvencionada",
      image: "/placeholder.svg",
      challenge: "Gestionar más de 50 cursos SEPE simultáneos con 500+ alumnos manteniendo total trazabilidad.",
      solution: "Implementación de TalentCloud con integración completa SEPE y sistema de informes automatizado.",
      results: [
        "Reducción del 60% en tiempo administrativo",
        "100% de cumplimiento normativo SEPE",
        "Mejora del 45% en satisfacción del alumno",
        "Ahorro anual de 25.000€ en costes operativos"
      ],
      quote: "TalentCloud nos ha permitido escalar sin perder calidad. La trazabilidad SEPE automática nos ha ahorrado cientos de horas.",
      author: "María González",
      position: "Directora de Formación"
    },
    {
      company: "Academia Digital Skills Pro",
      sector: "Formación Online",
      image: "/placeholder.svg",
      challenge: "Crear una experiencia de aprendizaje online competitiva con recursos limitados.",
      solution: "Adopción de la plataforma completa con catálogo SCORM y aulas virtuales integradas.",
      results: [
        "Crecimiento del 200% en alumnos matriculados",
        "95% de tasa de finalización de cursos",
        "Lanzamiento de 30 nuevos cursos en 6 meses",
        "ROI positivo en el primer trimestre"
      ],
      quote: "La biblioteca SCORM nos dio acceso inmediato a contenidos profesionales. Pudimos lanzar nuestra academia en semanas.",
      author: "Carlos Martínez",
      position: "CEO"
    },
    {
      company: "Corporación Industrial TechCorp",
      sector: "Formación Corporativa",
      image: "/placeholder.svg",
      challenge: "Formar a 1.200 empleados distribuidos en 15 sedes con diferentes necesidades formativas.",
      solution: "Despliegue de plataforma multisite con gestión centralizada y reporting avanzado.",
      results: [
        "1.200 empleados formados en 3 meses",
        "Reducción del 70% en costes de formación",
        "Aumento del 35% en productividad",
        "100% de cumplimiento de plan de formación"
      ],
      quote: "La plataforma se adaptó perfectamente a nuestra estructura. El reporting nos da visibilidad total del progreso formativo.",
      author: "Ana Rodríguez",
      position: "Responsable de RRHH"
    }
  ];

  const stats = [
    { number: "500+", label: "Centros de Formación", icon: Users },
    { number: "98%", label: "Satisfacción Cliente", icon: Award },
    { number: "2M+", label: "Alumnos Formados", icon: TrendingUp },
    { number: "50K+", label: "Cursos Impartidos", icon: Award }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4">Casos de Éxito</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Historias de{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Transformación
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Descubre cómo organizaciones líderes están revolucionando su formación con TalentCloud
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

      {/* Case Studies */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {cases.map((caseStudy, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-12 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-2">{caseStudy.company}</h3>
                      <Badge variant="secondary">{caseStudy.sector}</Badge>
                    </div>
                  </div>
                  
                  <div className="p-12">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2 text-primary">El Desafío</h4>
                      <p className="text-muted-foreground">{caseStudy.challenge}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2 text-primary">La Solución</h4>
                      <p className="text-muted-foreground">{caseStudy.solution}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2 text-primary">Resultados</h4>
                      <ul className="space-y-2">
                        {caseStudy.results.map((result, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Card className="bg-muted/50 border-none">
                      <CardContent className="p-6">
                        <Quote className="h-8 w-8 text-primary mb-4" />
                        <p className="italic mb-4 text-foreground">{caseStudy.quote}</p>
                        <div>
                          <p className="font-semibold">{caseStudy.author}</p>
                          <p className="text-sm text-muted-foreground">{caseStudy.position}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
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
              ¿Quieres ser el Próximo Caso de Éxito?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a cientos de organizaciones que ya están transformando su formación con TalentCloud
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/contact">Solicitar Demo</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/shop">Ver Planes</a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
