import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, ArrowRight, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  const featured = {
    title: "El Futuro de la Formación: IA y Personalización en e-Learning",
    excerpt: "Descubre cómo la inteligencia artificial está revolucionando la educación online y permitiendo experiencias de aprendizaje verdaderamente personalizadas.",
    category: "Innovación",
    author: "María García",
    date: "15 de Marzo, 2024",
    readTime: "8 min",
    image: "/placeholder.svg"
  };

  const posts = [
    {
      title: "10 Mejores Prácticas para Cursos SCORM Efectivos",
      excerpt: "Aprende a crear contenidos SCORM que realmente enganchen a tus alumnos y maximicen la retención del conocimiento.",
      category: "Tutoriales",
      author: "Carlos Martínez",
      date: "12 de Marzo, 2024",
      readTime: "6 min"
    },
    {
      title: "Cumplimiento SEPE: Guía Completa 2024",
      excerpt: "Todo lo que necesitas saber sobre los requisitos de trazabilidad y documentación para formación subvencionada.",
      category: "Normativa",
      author: "Ana Rodríguez",
      date: "8 de Marzo, 2024",
      readTime: "12 min"
    },
    {
      title: "Aumenta la Retención de Alumnos con Gamificación",
      excerpt: "Estrategias probadas de gamificación que han aumentado la finalización de cursos hasta un 45%.",
      category: "Estrategia",
      author: "Luis Fernández",
      date: "5 de Marzo, 2024",
      readTime: "7 min"
    },
    {
      title: "Microlearning: La Tendencia que Está Transformando la Formación",
      excerpt: "Por qué los contenidos en píldoras están ganando popularidad y cómo implementarlos efectivamente.",
      category: "Tendencias",
      author: "Elena Gómez",
      date: "1 de Marzo, 2024",
      readTime: "5 min"
    },
    {
      title: "Analítica de Aprendizaje: Toma Decisiones Basadas en Datos",
      excerpt: "Cómo utilizar los datos de tu LMS para mejorar continuamente tus cursos y la experiencia del alumno.",
      category: "Analytics",
      author: "Pedro Sánchez",
      date: "28 de Febrero, 2024",
      readTime: "10 min"
    },
    {
      title: "Integración de Aulas Virtuales: Casos de Éxito",
      excerpt: "Ejemplos reales de centros que han integrado exitosamente aulas virtuales en su metodología formativa.",
      category: "Casos de Éxito",
      author: "Laura Jiménez",
      date: "25 de Febrero, 2024",
      readTime: "9 min"
    }
  ];

  const categories = [
    "Todos", "Innovación", "Tutoriales", "Normativa", 
    "Estrategia", "Tendencias", "Analytics", "Casos de Éxito"
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge className="mb-4">Blog TalentCloud</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Recursos y{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Conocimiento
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Artículos, guías y novedades sobre e-learning, tecnología educativa y formación online
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button key={category} variant="outline">
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-24 w-24 text-primary" />
              </div>
              
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="w-fit mb-4">{featured.category}</Badge>
                <h2 className="text-3xl font-bold mb-4">{featured.title}</h2>
                <p className="text-muted-foreground mb-6">{featured.excerpt}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {featured.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {featured.readTime}
                  </span>
                </div>

                <Button>
                  Leer Más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Últimos Artículos</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                </div>
                
                <CardHeader>
                  <Badge className="w-fit mb-2">{post.category}</Badge>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{post.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Cargar Más Artículos
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <h2 className="text-3xl font-bold mb-4">
              Suscríbete a Nuestro Newsletter
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Recibe cada semana artículos, tendencias y recursos sobre e-learning directamente en tu correo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Tu email" 
                type="email"
                className="flex-1"
              />
              <Button size="lg">Suscribirme</Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
