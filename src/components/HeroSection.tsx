import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-platform-dashboard.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Plataforma LMS Profesional
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Tu plataforma{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                e-learning
              </span>{" "}
              personalizada
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Ofrecemos a entidades de formación una plataforma LMS completa con todos los recursos 
              necesarios para impartir formación online de calidad.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" variant="hero" className="group" asChild>
                <a href="/demo">
                  Ver Demo Interactiva
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
            
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-primary">+20</p>
                <p className="text-sm text-muted-foreground">Años Experiencia</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary">+10.000</p>
                <p className="text-sm text-muted-foreground">Contenidos SCORM</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">100%</p>
                <p className="text-sm text-muted-foreground">Personalizable</p>
              </div>
            </div>
          </div>
          
          <div className="relative lg:block hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <img 
              src={heroImage} 
              alt="Plataforma e-learning moderna" 
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
