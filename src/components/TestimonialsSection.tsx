import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "María González",
      role: "Directora de Formación",
      company: "Centro de Estudios Profesionales",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      testimonial: "La plataforma ha transformado completamente nuestra forma de impartir formación online. La experiencia de nuestros alumnos ha mejorado significativamente y la gestión administrativa es mucho más eficiente.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Coordinador Académico",
      company: "Academia de Formación Continua",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      testimonial: "El soporte técnico es excepcional y la personalización de la plataforma nos permite mantener nuestra identidad de marca. Los docentes están encantados con las herramientas de seguimiento.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Responsable de Calidad",
      company: "Instituto Superior de Formación",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      testimonial: "Llevamos 2 años usando la plataforma y cada actualización nos sorprende. La integración con SEPE y las herramientas de auditoría nos han facilitado enormemente los procesos de certificación.",
      rating: 5
    },
    {
      name: "Javier López",
      role: "Director",
      company: "Escuela Online de Negocios",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      testimonial: "La inversión se recuperó rápidamente. Hemos triplicado nuestra capacidad de alumnos sin aumentar el personal administrativo. La plataforma es intuitiva tanto para docentes como para estudiantes.",
      rating: 5
    },
    {
      name: "Laura Sánchez",
      role: "Coordinadora Pedagógica",
      company: "Centro de Formación Profesional",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
      testimonial: "Lo que más valoro es la facilidad de uso y el asistente virtual Esmeralda, que reduce significativamente las consultas básicas. Nuestros alumnos se sienten muy bien acompañados durante todo el proceso formativo.",
      rating: 5
    },
    {
      name: "Miguel Fernández",
      role: "Responsable IT",
      company: "Universidad Corporativa",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      testimonial: "La implementación fue sorprendentemente rápida y sin complicaciones técnicas. La plataforma es estable, segura y escalable. Perfecta para nuestras necesidades empresariales.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20" id="testimonios">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de entidades de formación confían en nuestra plataforma para transformar la educación online
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent className="p-6">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.testimonial}"
                </p>

                {/* Author info */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Confianza respaldada por más de 15 años de experiencia
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Centros de Formación</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">50.000+</p>
              <p className="text-sm text-muted-foreground">Alumnos Activos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-sm text-muted-foreground">Satisfacción</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
