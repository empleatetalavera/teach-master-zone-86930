import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Settings, Cloud, BookOpen, BarChart } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Sistema Intuitivo",
    description: "Interfaz moderna y fácil de usar para administradores, docentes y alumnos. Navegación optimizada con acceso rápido a todas las funcionalidades educativas."
  },
  {
    icon: Users,
    title: "Gestión de Usuarios",
    description: "Control completo de roles, permisos y accesos. Sistema avanzado de administración con perfiles diferenciados para estudiantes, docentes, tutores y administradores."
  },
  {
    icon: BookOpen,
    title: "Recursos E-learning",
    description: "Biblioteca completa con contenidos SCORM 1.2 y 2004. Soporte para vídeos, documentos, evaluaciones interactivas, foros de debate y herramientas de colaboración."
  },
  {
    icon: Cloud,
    title: "100% Online",
    description: "Plataforma cloud de alta disponibilidad accesible 24/7 desde cualquier dispositivo. Sin instalaciones, sin mantenimiento técnico, siempre actualizada."
  },
  {
    icon: Settings,
    title: "Personalización Total",
    description: "Tu marca, tu logo, tu dominio corporativo. Personalización completa de colores, estilos e identidad visual sin costes adicionales. Implementación rápida en 48h."
  },
  {
    icon: BarChart,
    title: "Reportes y Analytics",
    description: "Sistema completo de seguimiento y analíticas. Informes detallados de progreso, tiempo de estudio, calificaciones y trazabilidad SEPE. Exportación en múltiples formatos."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Todo lo que necesitas en una{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              plataforma
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Una solución completa para centros de formación, academias y asociaciones
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
