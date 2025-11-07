import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TrendingDown } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const hoursPacks = [
  {
    name: "PACK - One",
    hours: 2000,
    pricePerHour: 0.80,
    totalPrice: 1600,
    description: "Ideal para centros pequeños que están comenzando",
  },
  {
    name: "PACK - Basic",
    hours: 5000,
    pricePerHour: 0.66,
    totalPrice: 3300,
    description: "Perfecto para centros en crecimiento",
    popular: true,
  },
  {
    name: "PACK - Medium",
    hours: 10000,
    pricePerHour: 0.56,
    totalPrice: 5600,
    description: "Para centros con alta demanda",
  },
  {
    name: "PACK - Plus",
    hours: 20000,
    pricePerHour: 0.46,
    totalPrice: 9200,
    description: "La mejor opción para grandes centros",
  },
];

export default function Shop() {
  const { addToCart } = useCart();

  const handleAddPack = async (pack: typeof hoursPacks[0]) => {
    // For now, we'll show a message that users should contact for custom packs
    // In a real implementation, these would be products in the database
    toast.info(
      `Para adquirir ${pack.name}, contacta con nuestro equipo comercial en comercial@talentcloudsolution.es`,
      { duration: 5000 }
    );
  };

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
              Elige la modalidad de compra que mejor se adapte a tus necesidades. 
              Todas las licencias son válidas por 365 días desde la fecha de compra.
            </p>
          </div>

          <Tabs defaultValue="packs" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="packs">
                <Package className="w-4 h-4 mr-2" />
                Pack de horas
              </TabsTrigger>
              <TabsTrigger value="volume">
                <TrendingDown className="w-4 h-4 mr-2" />
                Compra por volumen
              </TabsTrigger>
            </TabsList>

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
                      </div>
                      <div className="border-t pt-4">
                        <div className="text-center">
                          <span className="text-sm text-muted-foreground">Precio:</span>
                          <div className="text-2xl font-bold">{pack.totalPrice.toLocaleString()}€</div>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        variant={pack.popular ? "default" : "outline"}
                        onClick={() => handleAddPack(pack)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Añadir a la cesta
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-muted/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    ¿Por qué comprar un pack de horas?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Flexibilidad total para usar las horas en cualquier curso del catálogo</li>
                    <li>✓ Mejor precio por hora cuanto mayor es el pack</li>
                    <li>✓ Ahorro significativo vs. compra individual</li>
                    <li>✓ Válido durante 365 días desde la compra</li>
                    <li>✓ Gestión centralizada de todas tus licencias</li>
                  </ul>
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

              <Card className="max-w-4xl mx-auto">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="text-2xl text-center">
                    Ejemplo de dos compras de la misma licencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold mb-6">
                      Acción formativa: PowerPoint 2010 básico (25 horas)
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6 space-y-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">Compra de 10 licencias = 320 €</div>
                          <div className="text-2xl font-bold text-primary my-3">32 €/licencia</div>
                          <div className="text-sm text-muted-foreground">
                            (25 horas × <span className="font-semibold text-primary">1,28 €/hora</span>)
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardContent className="pt-6 space-y-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">Compra de 50 licencias = 975 €</div>
                          <div className="text-2xl font-bold text-secondary my-3">19,50 €/licencia</div>
                          <div className="text-sm text-muted-foreground">
                            (25 horas × <span className="font-semibold text-secondary">0,78 €/hora</span>)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Desde la sección <Button variant="link" className="px-1" asChild>
                        <a href="/catalog">catálogo</a>
                      </Button> puedes acceder a la información del precio/hora: 
                      solo tienes que seleccionar el curso e introducir el número de licencias que quieres comprar.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dispondrás de 365 días desde la fecha de la compra para consumir las licencias adquiridas.
                    </p>
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
