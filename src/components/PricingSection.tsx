import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, BookOpen, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const platformPlans = [
  {
    name: "Plataforma Básica",
    description: "Alquiler de plataforma sin contenidos",
    price: "Desde 99€",
    period: "/mes",
    features: [
      "Hasta 50 alumnos",
      "Hasta 5 cursos simultáneos",
      "Personalización completa",
      "Dominio propio incluido",
      "Soporte técnico por email",
      "Backup automático diario",
      "SSL y seguridad incluida"
    ],
    popular: false
  },
  {
    name: "Plataforma + Contenidos",
    description: "Plataforma con acceso a catálogo SCORM",
    price: "Desde 249€",
    period: "/mes",
    features: [
      "Hasta 100 alumnos",
      "Cursos ilimitados",
      "Acceso catálogo SCORM completo",
      "Especialidades formativas INCUAL",
      "Certificados de profesionalidad",
      "Personalización completa",
      "Dominio propio incluido",
      "Soporte prioritario 24/7",
      "Tutor virtual con IA incluido"
    ],
    popular: true
  },
  {
    name: "Tarifa Plana Premium",
    description: "Todo incluido sin límites",
    price: "Desde 499€",
    period: "/mes",
    features: [
      "Alumnos ilimitados",
      "Cursos ilimitados",
      "Todo el catálogo SCORM",
      "Todas las especialidades INCUAL",
      "Todos los certificados profesionalidad",
      "Licencias consumibles incluidas",
      "Personalización avanzada",
      "Múltiples dominios",
      "Gestor de cuenta dedicado",
      "Formación personalizada del equipo",
      "Integraciones personalizadas",
      "SLA garantizado 99.9%"
    ],
    popular: false
  }
];

const scormCategories = [
  {
    title: "Especialidades Formativas INCUAL",
    icon: BookOpen,
    description: "Más de 10.000 especialidades formativas oficiales del Instituto Nacional de las Cualificaciones",
    items: [
      "Administración y Gestión",
      "Informática y Comunicaciones",
      "Comercio y Marketing",
      "Hostelería y Turismo",
      "Sanidad",
      "Servicios Socioculturales",
      "Y muchas más..."
    ],
    pricing: "Desde 99€/licencia consumible"
  },
  {
    title: "Certificados de Profesionalidad",
    icon: Award,
    description: "Catálogo completo de certificados de profesionalidad oficiales con contenidos SCORM actualizados",
    items: [
      "Nivel 1, 2 y 3 disponibles",
      "Contenidos actualizados 2024",
      "Incluye material didáctico",
      "Evaluaciones integradas",
      "Trazabilidad SEPE completa",
      "Soporte técnico incluido",
      "Actualizaciones gratuitas"
    ],
    pricing: "Desde 299€/certificado completo"
  }
];

export const PricingSection = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Platform Plans */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Planes de{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Plataforma
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu centro de formación
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {platformPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border/50'
              } relative`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
                  Más Popular
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                onClick={() => {
                  const product = products.find(p => 
                    p.name === plan.name && p.product_type === 'platform_plan'
                  );
                  if (product) handleAddToCart(product.id);
                }}
                disabled={loading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Añadir al Carrito
              </Button>
            </Card>
          ))}
        </div>

        {/* SCORM Catalog */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            Catálogo de{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Contenidos SCORM
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Licencias consumibles para especialidades formativas y certificados de profesionalidad
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {scormCategories.map((category, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <category.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {category.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-6 mb-6">
                <p className="text-lg font-semibold text-center mb-4">{category.pricing}</p>
              </div>

              <Button 
                className="w-full" 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const product = products.find(p => 
                    p.product_type === 'scorm_license' && 
                    p.features?.category === (category.title.includes('INCUAL') ? 'incual' : 'certificado')
                  );
                  if (product) handleAddToCart(product.id);
                }}
                disabled={loading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Añadir Licencia
              </Button>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-border/50">
            <p className="text-lg mb-4">
              ¿Necesitas un plan personalizado para tu organización?
            </p>
            <p className="text-muted-foreground mb-6">
              Contacta con nuestro equipo comercial para obtener una solución a medida con descuentos por volumen
            </p>
            <Button size="lg" variant="hero">
              Solicitar Presupuesto Personalizado
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};