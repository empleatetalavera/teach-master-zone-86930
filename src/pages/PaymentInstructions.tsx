import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

export default function PaymentInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentMethod } = location.state || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const renderInstructions = () => {
    switch (paymentMethod) {
      case "bank_transfer":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Transferencia Bancaria</CardTitle>
              <CardDescription>Realiza la transferencia a los siguientes datos:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold">Banco: Banco Ejemplo</p>
                <div className="flex items-center gap-2">
                  <p>IBAN: ES91 2100 0418 4502 0005 1332</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard("ES91 2100 0418 4502 0005 1332")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p>Concepto: Pedido #{orderId?.slice(0, 8)}</p>
              </div>
              <Alert>
                <AlertDescription>
                  Una vez realizada la transferencia, envíanos el comprobante a pagos@ejemplo.com
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "paypal":
        return (
          <Card>
            <CardHeader>
              <CardTitle>PayPal</CardTitle>
              <CardDescription>Completa el pago con PayPal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Envía el pago a: pagos@ejemplo.com mediante PayPal
                  <br />
                  Referencia: Pedido #{orderId?.slice(0, 8)}
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => window.open("https://paypal.com", "_blank")}>
                Ir a PayPal
              </Button>
            </CardContent>
          </Card>
        );

      case "klarna":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Klarna</CardTitle>
              <CardDescription>Paga con Klarna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Serás redirigido a Klarna para completar tu pago.
                  Recibirás un email con las instrucciones de pago.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => window.open("https://klarna.com", "_blank")}>
                Continuar con Klarna
              </Button>
            </CardContent>
          </Card>
        );

      case "redsys":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Pago con Tarjeta (Redsys)</CardTitle>
              <CardDescription>Pago seguro con tarjeta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Serás redirigido a la pasarela de pago segura de Redsys para completar tu compra.
                </AlertDescription>
              </Alert>
              <Button className="w-full">
                Ir a Pasarela de Pago
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!orderId || !paymentMethod) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>No se encontró información del pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">¡Pedido Creado!</h1>
          <p className="text-muted-foreground">
            Número de pedido: #{orderId?.slice(0, 8)}
          </p>
        </div>

        {renderInstructions()}

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Recibirás un email de confirmación con los detalles de tu pedido.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
