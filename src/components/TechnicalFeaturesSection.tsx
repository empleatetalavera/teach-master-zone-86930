import { Card } from "@/components/ui/card";
import { 
  Presentation, 
  Settings, 
  FileText, 
  UserCheck, 
  ClipboardList, 
  Video, 
  Award, 
  Languages 
} from "lucide-react";

const technicalFeatures = [
  {
    icon: Presentation,
    title: "Pizarra Digital y chat",
    description: "Acreditada por el SEPE para formación programada"
  },
  {
    icon: Settings,
    title: "Configuración por acción formativa",
    description: "Validada para la acreditación de Certificados de Profesionalidad"
  },
  {
    icon: FileText,
    title: "Informes de seguimiento tutorial",
    description: "Informes de seguimiento y evaluaciones"
  },
  {
    icon: UserCheck,
    title: "Distintos perfiles de acceso",
    description: "Importación masiva de alumnos"
  },
  {
    icon: ClipboardList,
    title: "Editor de autoevaluaciones",
    description: "Instalación y soporte técnico"
  },
  {
    icon: Video,
    title: "Aula Virtual",
    description: "con Adobe Connect"
  },
  {
    icon: Award,
    title: "Generación automática de diplomas",
    description: "Envío automatizado"
  },
  {
    icon: Languages,
    title: "Multiidioma",
    description: "Selección de lenguas cooficiales e idiomas extranjeros"
  }
];

export const TechnicalFeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Características{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              técnicas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramientas profesionales para una formación online de calidad
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technicalFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-md transition-all duration-300 border-border/50 text-center group"
            >
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-base">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
