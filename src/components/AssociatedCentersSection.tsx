import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrainingCenter {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export const AssociatedCentersSection = () => {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      const { data, error } = await supabase
        .from('training_centers')
        .select('id, name, slug, logo_url')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setCenters(data);
      }
      setLoading(false);
    };

    fetchCenters();
  }, []);

  if (loading) {
    return null;
  }

  if (centers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            <span>Centros Asociados</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Accede a tu{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campus Virtual
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecciona tu centro de formación para acceder a la plataforma con tu identidad corporativa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {centers.map((center) => (
            <Card 
              key={center.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 h-20 w-40 flex items-center justify-center">
                  {center.logo_url ? (
                    <img
                      src={center.logo_url}
                      alt={center.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Building2 
                    className={`w-12 h-12 text-muted-foreground ${center.logo_url ? 'hidden' : ''}`} 
                  />
                </div>
                <CardTitle className="text-lg">{center.name}</CardTitle>
                <CardDescription>Campus Virtual Personalizado</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
                  variant="outline"
                  asChild
                >
                  <a href={`/auth?center=${center.slug}`}>
                    Acceder al Campus
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
