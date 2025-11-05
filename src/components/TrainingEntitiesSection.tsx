import { Check } from "lucide-react";
import studentLearningImg from "@/assets/student-learning.jpg";

export const TrainingEntitiesSection = () => {
  const services = [
    "Contenidos y Plataforma",
    "Tarifa Plana para Programada",
    "Acreditación de Certificados de Profesionalidad",
    "Preparación de Oposiciones",
    "Acreditaciones",
    "Digitalización y Creación de Contenidos",
    "Alquiler de Aulas",
    "Manuales Formativos",
    "Impulsa tus ventas",
    "EdTech",
    "Contratos en alternancia"
  ];

  return (
    <section className="py-24 bg-background" id="entidades">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span>
              <strong>Exámenes:</strong> Evalúa los conocimientos adquiridos por tu alumnado con exámenes tipo test de cada tema.
            </span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Services list */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground mb-8">
              Entidades de Formación
            </h2>
            
            <div className="space-y-3">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-foreground font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Image with overlay */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={studentLearningImg}
                alt="Formación online"
                className="w-full h-auto object-cover"
              />
              
              {/* Blue overlay card */}
              <div className="absolute top-8 right-8 bg-[#1e3a5f] text-white p-8 rounded-lg shadow-xl max-w-md">
                <p className="text-sm mb-2 uppercase tracking-wider opacity-90">
                  TU FORMACIÓN ONLINE EN MANOS EXPERTAS
                </p>
                <h3 className="text-3xl font-bold">
                  <span className="italic">EdTech:</span> tu Centro
                </h3>
                <h3 className="text-3xl font-bold">
                  Educativo online
                </h3>
              </div>
            </div>

            {/* Decorative pattern */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent -z-10 rounded-tl-[100px]" />
          </div>
        </div>

        {/* Additional info section */}
        <div className="mt-16 p-8 bg-[#1e3a5f] text-white rounded-2xl">
          <p className="text-lg leading-relaxed">
            Además la plataforma cuenta con una <strong>"Sala de profesores"</strong> en la cual los docentes pueden interactuar, compartir impresiones y realizar conferencias.
          </p>
        </div>
      </div>
    </section>
  );
};
