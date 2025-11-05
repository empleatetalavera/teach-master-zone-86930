import { Card } from "@/components/ui/card";
import { Shield, Zap, HeadphonesIcon } from "lucide-react";

const roles = [
  {
    icon: Shield,
    title: "Para Administradores",
    color: "from-primary to-primary-glow",
    benefits: [
      "Panel de control completo",
      "Gestión de usuarios y permisos",
      "Reportes y estadísticas detalladas",
      "Configuración personalizada"
    ]
  },
  {
    icon: Zap,
    title: "Para Docentes",
    color: "from-secondary to-secondary",
    benefits: [
      "Creación de cursos intuitiva",
      "Herramientas de evaluación",
      "Seguimiento de estudiantes",
      "Gestión de contenidos multimedia"
    ]
  },
  {
    icon: HeadphonesIcon,
    title: "Para Alumnos",
    color: "from-accent to-accent",
    benefits: [
      "Acceso 24/7 a contenidos",
      "Interfaz clara y atractiva",
      "Seguimiento de progreso",
      "Certificados de finalización"
    ]
  }
];

export const BenefitsSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Diseñada para{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              todos
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Una experiencia optimizada para cada tipo de usuario
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-xl transition-all duration-300 border-border/50 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-6 relative`}>
                <role.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h3 className="text-2xl font-bold mb-6">{role.title}</h3>
              
              <ul className="space-y-3">
                {role.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color} mt-2 flex-shrink-0`} />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
