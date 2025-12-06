import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Package, ShoppingCart, TrendingDown, Calculator, TrendingUp, Percent, Building2, Check, BookOpen, Award } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";

// Planes de alquiler de plataforma
const platformPlans = [
  {
    name: "Alquiler Mensual",
    description: "Flexibilidad total, pago mes a mes",
    price: "500€",
    period: "mes",
    commitment: "Sin permanencia",
    features: [
      "Alumnos ilimitados",
      "Personalización completa",
      "Dominio propio incluido",
      "Soporte técnico por email",
      "Backup automático diario",
      "SSL y seguridad incluida",
      "Actualizaciones incluidas"
    ],
    popular: false
  },
  {
    name: "Plan Trimestral",
    description: "Compromiso mínimo de 3 meses",
    price: "400€",
    period: "mes",
    commitment: "Mínimo 3 meses",
    features: [
      "Alumnos ilimitados",
      "Personalización completa",
      "Dominio propio incluido",
      "Soporte prioritario",
      "Backup automático diario",
      "SSL y seguridad incluida",
      "Actualizaciones incluidas",
      "Formación inicial incluida"
    ],
    popular: true
  },
  {
    name: "Tarifa Plana Anual",
    description: "Máximo ahorro con compromiso anual",
    price: "300€",
    period: "mes + IVA",
    commitment: "Mínimo 12 meses",
    features: [
      "Alumnos ilimitados",
      "Personalización avanzada",
      "Múltiples dominios incluidos",
      "Soporte prioritario 24/7",
      "Gestor de cuenta dedicado",
      "Formación personalizada",
      "Integraciones personalizadas",
      "SLA garantizado 99.9%",
      "Mejor precio garantizado"
    ],
    popular: false
  }
];

const hoursPacks = [
  {
    name: "PACK - One",
    hours: 2000,
    pricePerHour: 0.95,
    totalPrice: 1900,
    description: "Ideal para centros pequeños que están comenzando",
    savings: "Ahorro del 5%"
  },
  {
    name: "PACK - Basic",
    hours: 5000,
    pricePerHour: 0.80,
    totalPrice: 4000,
    description: "Perfecto para centros en crecimiento",
    popular: true,
    savings: "Ahorro del 20%"
  },
  {
    name: "PACK - Medium",
    hours: 10000,
    pricePerHour: 0.70,
    totalPrice: 7000,
    description: "Para centros con alta demanda",
    savings: "Ahorro del 30%"
  },
  {
    name: "PACK - Plus",
    hours: 20000,
    pricePerHour: 0.60,
    totalPrice: 12000,
    description: "La mejor opción para grandes centros",
    savings: "Ahorro del 40%"
  },
];

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
  const [calculatorHours, setCalculatorHours] = useState(5000);
  const [volumeLicenses, setVolumeLicenses] = useState(25);
  const [volumeCourseHours, setVolumeCourseHours] = useState(25);

  const handleAddPack = async (pack: typeof hoursPacks[0]) => {
    toast.info(
      `Para adquirir ${pack.name}, contacta con nuestro equipo comercial en comercial@talentcloudsolution.es`,
      { duration: 5000 }
    );
  };

  const ourPrice = calculatePrice(calculatorHours);
  const marketPrice = calculateMarketPrice(calculatorHours);
  const savings = marketPrice - ourPrice.total;
  const savingsPercentage = ((savings / marketPrice) * 100).toFixed(0);

  const volumeTotal = getVolumePrice(volumeLicenses, volumeCourseHours);
  const volumePricePerLicense = volumeTotal / volumeLicenses;
  const volumePricePerHour = getVolumePricePerHour(volumeLicenses);

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
                {platformPlans.map((plan, index) => (
                  <Card 
                    key={index}
                    className={`p-6 hover:shadow-xl transition-all duration-300 ${
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
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      <Badge variant="secondary" className="mb-4">{plan.commitment}</Badge>
                      <div className="mb-2">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground">/ {plan.period}</span>
                        </div>
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
                      asChild
                    >
                      <Link to="/contact">
                        Solicitar Información
                      </Link>
                    </Button>
                  </Card>
                ))}
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
                {hoursPacks.map((pack) => (
                  <Card key={pack.name} className={`relative ${pack.popular ? 'border-primary shadow-lg' : ''}`}>
                    {pack.popular && (
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
                          {pack.hours.toLocaleString()} horas
                        </div>
                        <div className="text-lg font-semibold text-muted-foreground mt-2">
                          {pack.pricePerHour}€/hora
                        </div>
                        {pack.savings && (
                          <Badge variant="secondary" className="mt-2">
                            {pack.savings}
                          </Badge>
                        )}
                      </div>
                      <div className="border-t pt-4">
                        <div className="text-center">
                          <span className="text-sm text-muted-foreground">Precio Total:</span>
                          <div className="text-2xl font-bold">{pack.totalPrice.toLocaleString()}€</div>
                          <div className="text-xs text-muted-foreground mt-1">IVA no incluido</div>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        variant={pack.popular ? "default" : "outline"}
                        onClick={() => handleAddPack(pack)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Solicitar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                        <div className="text-sm text-primary-foreground/80 mb-2">Tu precio TalentCloud</div>
                        <div className="text-2xl font-bold text-primary">
                          {ourPrice.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                        </div>
                        <div className="text-xs text-primary-foreground/80 mt-1">
                          {ourPrice.pricePerHour}€/hora
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-secondary/20 border-secondary">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-secondary" />
                          <span className="font-semibold">Ahorro total</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-secondary">
                            {savings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            <Percent className="w-3 h-3 mr-1" />
                            {savingsPercentage}% menos
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-3">Ventajas incluidas:</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Flexibilidad total en el uso de horas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Válido durante 365 días</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Sin costes adicionales de mantenimiento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Soporte técnico incluido</span>
                      </li>
                    </ul>
                  </div>

                  <Button className="w-full" size="lg" onClick={() => handleAddPack(hoursPacks[1])}>
                    Solicitar Presupuesto Personalizado
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volume" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Compra por volumen</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto mb-4">
                  Esta modalidad te permitirá comprar un número de licencias determinado para un curso concreto. 
                  Cuantas más licencias de un curso adquieras mejor será la tarifa aplicada.
                </p>
                <p className="font-semibold text-foreground">
                  Los descuentos se aplican por volumen en cada una de las acciones formativas.
                </p>
              </div>

              {/* Calculadora de Volumen */}
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                    <Calculator className="w-6 h-6" />
                    Calculadora de Precio por Volumen
                  </CardTitle>
                  <CardDescription className="text-center">
                    Personaliza el número de licencias y horas para calcular tu precio
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Número de licencias</label>
                      <Select value={volumeLicenses.toString()} onValueChange={(val) => setVolumeLicenses(Number(val))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 licencias</SelectItem>
                          <SelectItem value="10">10 licencias</SelectItem>
                          <SelectItem value="25">25 licencias</SelectItem>
                          <SelectItem value="50">50 licencias</SelectItem>
                          <SelectItem value="100">100 licencias</SelectItem>
                          <SelectItem value="200">200 licencias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">Horas del curso</label>
                      <Select value={volumeCourseHours.toString()} onValueChange={(val) => setVolumeCourseHours(Number(val))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 horas</SelectItem>
                          <SelectItem value="15">15 horas</SelectItem>
                          <SelectItem value="20">20 horas</SelectItem>
                          <SelectItem value="25">25 horas</SelectItem>
                          <SelectItem value="30">30 horas</SelectItem>
                          <SelectItem value="40">40 horas</SelectItem>
                          <SelectItem value="50">50 horas</SelectItem>
                          <SelectItem value="60">60 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Precio por hora</div>
                          <div className="text-2xl font-bold text-primary">
                            {volumePricePerHour.toFixed(2)}€
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Precio por licencia</div>
                          <div className="text-2xl font-bold text-primary">
                            {volumePricePerLicense.toFixed(2)}€
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Total</div>
                          <div className="text-3xl font-bold text-primary">
                            {volumeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Tabla de Descuentos por Volumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {volumePricing.map((tier, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              volumeLicenses >= tier.min && volumeLicenses <= tier.max
                                ? 'bg-primary/20 border-2 border-primary'
                                : 'bg-background/50'
                            }`}
                          >
                            <span className="font-medium">
                              {tier.min} - {tier.max === Infinity ? '+' : tier.max} licencias
                            </span>
                            <div className="text-right">
                              <Badge variant={volumeLicenses >= tier.min && volumeLicenses <= tier.max ? "default" : "secondary"}>
                                {tier.pricePerLicense.toFixed(2)}€/hora
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Dispondrás de 365 días desde la fecha de la compra para consumir las licencias adquiridas.
                    </p>
                    <Button size="lg" asChild>
                      <a href="/client-portal/catalog">
                        Ver Catálogo Completo de Cursos
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button size="lg" asChild>
                  <a href="/catalog">
                    Ver Catálogo de Cursos
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </main>
  );
}
