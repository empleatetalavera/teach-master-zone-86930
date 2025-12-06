import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Package, ShoppingCart, TrendingDown, Calculator, Building2, Check, BookOpen, Award, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProductFeatures {
  features?: string[];
  popular?: boolean;
  period?: string;
  hours?: number;
  pricePerHour?: number;
  savings?: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  product_type: string;
  category: string | null;
  features: ProductFeatures | null;
}

// Función para calcular precio basado en horas
const calculatePrice = (hours: number) => {
  if (hours <= 2000) return { pricePerHour: 0.95, total: hours * 0.95 };
  if (hours <= 5000) return { pricePerHour: 0.80, total: hours * 0.80 };
  if (hours <= 10000) return { pricePerHour: 0.70, total: hours * 0.70 };
  return { pricePerHour: 0.60, total: hours * 0.60 };
};

// Precio estándar del mercado (promedio de competidores)
const calculateMarketPrice = (hours: number) => {
  if (hours <= 2000) return hours * 1.10;
  if (hours <= 5000) return hours * 1.00;
  if (hours <= 10000) return hours * 0.90;
  return hours * 0.85;
};

// Precios para compra por volumen (por licencia)
const volumePricing = [
  { min: 1, max: 9, pricePerLicense: 1.50 },
  { min: 10, max: 24, pricePerLicense: 1.30 },
  { min: 25, max: 49, pricePerLicense: 1.10 },
  { min: 50, max: 99, pricePerLicense: 0.90 },
  { min: 100, max: 199, pricePerLicense: 0.75 },
  { min: 200, max: Infinity, pricePerLicense: 0.65 }
];

const getVolumePrice = (licenses: number, courseHours: number) => {
  const tier = volumePricing.find(t => licenses >= t.min && licenses <= t.max);
  if (!tier) return 0;
  return licenses * courseHours * tier.pricePerLicense;
};

const getVolumePricePerHour = (licenses: number) => {
  const tier = volumePricing.find(t => licenses >= t.min && licenses <= t.max);
  return tier?.pricePerLicense || 1.50;
};

export default function Shop() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [calculatorHours, setCalculatorHours] = useState(5000);
  const [volumeLicenses, setVolumeLicenses] = useState(25);
  const [volumeCourseHours, setVolumeCourseHours] = useState(25);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      // Cast features from Json to ProductFeatures
      const typedProducts: Product[] = (data || []).map(p => ({
        ...p,
        features: p.features as ProductFeatures | null
      }));
      setProducts(typedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId);
      navigate("/checkout");
    } finally {
      setAddingToCart(null);
    }
  };

  const platformPlans = products.filter(p => p.product_type === "platform_plan" && p.category !== "hours_pack");
  const hoursPacks = products.filter(p => p.category === "hours_pack");

  const ourPrice = calculatePrice(calculatorHours);
  const marketPrice = calculateMarketPrice(calculatorHours);
  const savings = marketPrice - ourPrice.total;
  const savingsPercentage = ((savings / marketPrice) * 100).toFixed(0);

  const volumeTotal = getVolumePrice(volumeLicenses, volumeCourseHours);
  const volumePricePerLicense = volumeTotal / volumeLicenses;
  const volumePricePerHour = getVolumePricePerHour(volumeLicenses);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Tarifas y{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Precios
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Elige la modalidad que mejor se adapte a las necesidades de tu centro de formación
            </p>
          </div>

          <Tabs defaultValue="platform" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="platform">
                <Building2 className="w-4 h-4 mr-2" />
                Alquiler Plataforma
              </TabsTrigger>
              <TabsTrigger value="packs">
                <Package className="w-4 h-4 mr-2" />
                Licencias SCORM
              </TabsTrigger>
              <TabsTrigger value="volume">
                <TrendingDown className="w-4 h-4 mr-2" />
                Compra por volumen
              </TabsTrigger>
            </TabsList>

            {/* Planes de Plataforma */}
            <TabsContent value="platform" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Alquiler de Plataforma LMS</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Tu propia plataforma e-learning con dominio propio, personalización completa y alumnos ilimitados. 
                  Sin costes ocultos ni límite de matriculaciones.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {platformPlans.map((plan) => {
                  const features = plan.features?.features || [];
                  const isPopular = plan.features?.popular || false;
                  const period = plan.features?.period || "mes";
                  
                  return (
                    <Card 
                      key={plan.id}
                      className={`p-6 hover:shadow-xl transition-all duration-300 ${
                        isPopular ? 'border-primary shadow-lg scale-105' : 'border-border/50'
                      } relative`}
                    >
                      {isPopular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
                          Más Popular
                        </Badge>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                        <div className="mb-2">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold">{plan.price}€</span>
                            <span className="text-muted-foreground">/ {period}</span>
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant={isPopular ? "default" : "outline"}
                          size="lg"
                          onClick={() => handleBuyNow(plan.id)}
                          disabled={addingToCart === plan.id}
                        >
                          {addingToCart === plan.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 mr-2" />
                          )}
                          Contratar Ahora
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToCart(plan.id)}
                          disabled={addingToCart === plan.id}
                        >
                          Añadir al Carrito
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Sección de Licencias de Contenido */}
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Licencias de Contenido</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Precios de licencias de certificados de profesionalidad y especialidades formativas bajo presupuesto según horas
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">Especialidades Formativas</h4>
                        <p className="text-muted-foreground text-sm">Más de 500 especialidades formativas oficiales disponibles</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4 mb-4">
                      <p className="text-lg font-semibold text-center text-primary">Presupuesto según horas</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">El precio varía según la duración del contenido</p>
                    </div>
                    <Button className="w-full" asChild>
                      <Link to="/contact">Solicitar Presupuesto</Link>
                    </Button>
                  </Card>

                  <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">Certificados de Profesionalidad</h4>
                        <p className="text-muted-foreground text-sm">Catálogo completo de certificados oficiales con trazabilidad SEPE</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4 mb-4">
                      <p className="text-lg font-semibold text-center text-primary">Presupuesto según horas</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">El precio varía según la duración del contenido</p>
                    </div>
                    <Button className="w-full" asChild>
                      <Link to="/contact">Solicitar Presupuesto</Link>
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packs" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Packs de horas: adquiere licencias al mejor precio</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Con esta opción adquieres un pack de horas de formación que podrás consumir en cualquiera de los cursos 
                  disponibles de nuestro catálogo. La tarifa para cada hora de formación depende del pack seleccionado.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {hoursPacks.map((pack) => {
                  const isPopular = pack.features?.popular || false;
                  const hours = pack.features?.hours || 0;
                  const pricePerHour = pack.features?.pricePerHour || 0;
                  const savingsText = pack.features?.savings || "";
                  
                  return (
                    <Card key={pack.id} className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
                      {isPopular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                          Más Popular
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl">{pack.name}</CardTitle>
                        <CardDescription>{pack.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {hours.toLocaleString()} horas
                          </div>
                          <div className="text-lg font-semibold text-muted-foreground mt-2">
                            {pricePerHour}€/hora
                          </div>
                          {savingsText && (
                            <Badge variant="secondary" className="mt-2">
                              {savingsText}
                            </Badge>
                          )}
                        </div>
                        <div className="border-t pt-4">
                          <div className="text-center">
                            <span className="text-sm text-muted-foreground">Precio Total:</span>
                            <div className="text-2xl font-bold">{pack.price.toLocaleString()}€</div>
                            <div className="text-xs text-muted-foreground mt-1">IVA no incluido</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            variant={isPopular ? "default" : "outline"}
                            onClick={() => handleBuyNow(pack.id)}
                            disabled={addingToCart === pack.id}
                          >
                            {addingToCart === pack.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 mr-2" />
                            )}
                            Comprar Ahora
                          </Button>
                          <Button 
                            className="w-full" 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddToCart(pack.id)}
                            disabled={addingToCart === pack.id}
                          >
                            Añadir al Carrito
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Calculadora de Precios */}
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Calculadora de Ahorro
                  </CardTitle>
                  <CardDescription>
                    Ajusta las horas para ver tu ahorro comparado con el precio estándar del mercado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium">Horas de formación</label>
                      <Badge variant="secondary" className="text-lg px-3">
                        {calculatorHours.toLocaleString()} horas
                      </Badge>
                    </div>
                    <Slider
                      value={[calculatorHours]}
                      onValueChange={(value) => setCalculatorHours(value[0])}
                      min={1000}
                      max={25000}
                      step={1000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1.000h</span>
                      <span>25.000h</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-background/50">
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-2">Precio mercado</div>
                        <div className="text-2xl font-bold text-muted-foreground line-through">
                          {marketPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/20 border-primary">
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-2">Tu precio con TalentCloud</div>
                        <div className="text-2xl font-bold text-primary">
                          {ourPrice.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                        </div>
                        <Badge className="mt-2 bg-green-500">
                          Ahorras {savingsPercentage}%
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volume" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Compra por Volumen</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Descuentos especiales para compras de múltiples licencias del mismo curso. 
                  A mayor cantidad de licencias, menor precio por hora de formación.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Tabla de precios por volumen */}
                <Card>
                  <CardHeader>
                    <CardTitle>Escala de Precios por Volumen</CardTitle>
                    <CardDescription>Precio por hora según número de licencias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {volumePricing.map((tier, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            volumeLicenses >= tier.min && volumeLicenses <= tier.max 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border'
                          }`}
                        >
                          <div>
                            <span className="font-medium">
                              {tier.max === Infinity 
                                ? `${tier.min}+ licencias` 
                                : `${tier.min} - ${tier.max} licencias`}
                            </span>
                          </div>
                          <Badge variant={volumeLicenses >= tier.min && volumeLicenses <= tier.max ? "default" : "secondary"}>
                            {tier.pricePerLicense.toFixed(2)}€/hora
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Calculadora de volumen */}
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Calculadora de Precio por Volumen
                    </CardTitle>
                    <CardDescription>
                      Calcula el precio total según el número de licencias y horas del curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium">Número de licencias</label>
                        <Badge variant="secondary" className="text-lg px-3">
                          {volumeLicenses} licencias
                        </Badge>
                      </div>
                      <Slider
                        value={[volumeLicenses]}
                        onValueChange={(value) => setVolumeLicenses(value[0])}
                        min={1}
                        max={250}
                        step={1}
                        className="mb-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium">Horas del curso</label>
                        <Badge variant="secondary" className="text-lg px-3">
                          {volumeCourseHours} horas
                        </Badge>
                      </div>
                      <Slider
                        value={[volumeCourseHours]}
                        onValueChange={(value) => setVolumeCourseHours(value[0])}
                        min={5}
                        max={500}
                        step={5}
                        className="mb-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-background/50">
                        <CardContent className="pt-6 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Precio por hora</div>
                          <div className="text-xl font-bold text-primary">
                            {volumePricePerHour.toFixed(2)}€
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Por licencia</div>
                          <div className="text-xl font-bold text-primary">
                            {volumePricePerLicense.toFixed(2)}€
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-primary text-primary-foreground">
                      <CardContent className="pt-6 text-center">
                        <div className="text-sm opacity-80 mb-1">Precio Total</div>
                        <div className="text-3xl font-bold">
                          {volumeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                        </div>
                        <div className="text-sm opacity-80 mt-1">IVA no incluido</div>
                      </CardContent>
                    </Card>

                    <Button className="w-full" size="lg" asChild>
                      <Link to="/contact">
                        Solicitar Presupuesto Personalizado
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Final */}
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 p-8">
              <h3 className="text-2xl font-bold mb-4">¿Necesitas un plan personalizado?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Si ninguna de nuestras opciones se adapta a tus necesidades, contacta con nuestro equipo comercial 
                para diseñar una solución a medida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/contact">
                    Contactar con Ventas
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/demo">
                    Solicitar Demo
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}