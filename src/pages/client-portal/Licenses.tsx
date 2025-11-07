import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertCircle, Clock } from "lucide-react";

export default function ClientLicenses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Mis licencias
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y visualiza todas tus licencias de formación
          </p>
        </div>
        <Button>
          <Package className="w-4 h-4 mr-2" />
          Utilización de licencias
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="active">Licencias activas</TabsTrigger>
          <TabsTrigger value="expired">Licencias caducadas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes de validar</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No tienes ninguna licencia activa</p>
                <p className="text-muted-foreground mb-6">
                  Adquiere packs de horas o licencias por volumen para comenzar
                </p>
                <Button asChild>
                  <a href="/shop">Ver Tarifas</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay licencias caducadas</p>
                <p className="text-muted-foreground">
                  Las licencias caducadas aparecerán aquí después de 365 días desde su compra
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay licencias pendientes de validar</p>
                <p className="text-muted-foreground">
                  Las nuevas compras aparecerán aquí hasta ser validadas por nuestro equipo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
