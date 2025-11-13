import { Card } from "@/components/ui/card";
import { Trophy, BookMarked, Globe, Users } from "lucide-react";

const stats = [
  {
    icon: Trophy,
    number: "+20",
    label: "Años de experiencia",
    description: "Líderes en soluciones e-learning"
  },
  {
    icon: BookMarked,
    number: "+500",
    label: "Contenidos SCORM",
    description: "Al mejor precio del mercado"
  },
  {
    icon: Globe,
    number: "España y Latinoamérica",
    label: "Alcance internacional",
    description: "Países de habla hispana"
  },
  {
    icon: Users,
    number: "Expertos",
    label: "Equipo profesional",
    description: "Tu mejor partner formativo"
  }
];

export const ExperienceSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Tu partner en{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              formación online
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Somos una distribuidora de contenidos y soluciones elearning con más de 20 años de experiencia 
            en el sector de la formación en España y países de habla hispana en Latinoamérica
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 text-center border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="font-semibold mb-2">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </Card>
          ))}
        </div>
        
        <Card className="p-8 lg:p-12 border-border/50 bg-card/50 backdrop-blur">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="text-2xl font-bold">Ofrecemos todos los recursos que necesitas</h3>
            <p className="text-lg text-muted-foreground">
              Contamos con un amplio catálogo con más de <span className="font-semibold text-primary">500 contenidos 
              en formato SCORM</span> de distintos proveedores al mejor precio.
            </p>
            <p className="text-muted-foreground">
              Llevamos el elearning a aquellos centros que aún no han dado el salto a la formación online 
              y quieren hacerlo de una forma rápida, sencilla y económica, y mejoramos los servicios y 
              condiciones de las soluciones elearning que cualquier entidad formativa pueda tener.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
