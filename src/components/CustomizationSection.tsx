import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, Globe, Mail } from "lucide-react";

export const CustomizationSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Personalización{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                sin límites
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Tu plataforma LMS completamente adaptada a tu identidad corporativa. 
              Sin costes adicionales, con soporte técnico experto incluido.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tu Marca, Tu Diseño</h3>
                  <p className="text-muted-foreground">Colores, logo y estilo adaptados a tu identidad visual</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tu Propio Dominio</h3>
                  <p className="text-muted-foreground">URL personalizada dentro de tu dominio corporativo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Soporte Dedicado</h3>
                  <p className="text-muted-foreground">Equipo experto disponible para asistencia técnica continua</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <Button size="lg" variant="hero">
                Comenzar Ahora
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Card className="p-8 shadow-2xl border-border/50">
              <div className="space-y-6">
                <div className="h-12 bg-gradient-to-r from-primary to-secondary rounded-lg" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg" />
                  <div className="h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg" />
                  <div className="h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg" />
                </div>
                <div className="h-8 bg-gradient-to-r from-primary to-secondary rounded-lg w-32" />
              </div>
            </Card>
            
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full blur-2xl opacity-50" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary to-primary rounded-full blur-2xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};
