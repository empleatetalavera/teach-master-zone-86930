import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "Sin costes de instalación",
  "Personalización incluida",
  "Soporte técnico experto",
  "Actualizaciones automáticas"
];

export const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
          
          <div className="relative p-12 lg:p-16 text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              ¿Listo para transformar{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                tu formación online?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a cientos de instituciones que ya confían en nuestra plataforma LMS
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="xl" variant="hero" className="group" asChild>
                <a href="/login">
                  Ver Demo de la Plataforma
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button size="xl" variant="outline">
                Contactar con Ventas
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
