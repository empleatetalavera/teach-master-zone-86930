import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, Building2, CreditCard, Wallet, Clock } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

export default function PaymentInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentMethod, totalAmount } = location.state || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  // Bank details
  const bankDetails = {
    bank: "BBVA",
    iban: "ES14 0182 0861 6802 0169 9387",
    bic: "BBVAESMMXXX",
    beneficiary: "TalentCloud Solutions S.L.",
    concept: `Pedido #${orderId?.slice(0, 8).toUpperCase()}`,
  };

  const renderInstructions = () => {
    switch (paymentMethod) {
      case "bank_transfer":
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Transferencia Bancaria</CardTitle>
                  <CardDescription>Realiza la transferencia a los siguientes datos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Banco:</span>
                  <span className="font-medium">{bankDetails.bank}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Beneficiario:</span>
                  <span className="font-medium">{bankDetails.beneficiary}</span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">IBAN:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm font-mono">
                      {bankDetails.iban}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(bankDetails.iban.replace(/\s/g, ""))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">BIC/SWIFT:</span>
                  <span className="font-medium">{bankDetails.bic}</span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Concepto:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm font-mono">
                      {bankDetails.concept}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(bankDetails.concept)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {totalAmount && (
                  <div className="flex items-center justify-between border-t pt-3 mt-3">
                    <span className="text-sm text-muted-foreground">Importe:</span>
                    <span className="text-lg font-bold text-primary">
                      €{(totalAmount * 1.21).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Una vez realizada la transferencia, envíanos el comprobante a{" "}
                  <strong>pagos@talentcloudsolution.es</strong> para agilizar la activación de tu servicio.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "paypal":
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Pago con PayPal</CardTitle>
                  <CardDescription>Completa el pago a través de PayPal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email PayPal:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">pagos@talentcloudsolution.es</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard("pagos@talentcloudsolution.es")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referencia:</span>
                  <span className="font-medium">{bankDetails.concept}</span>
                </div>

                {totalAmount && (
                  <div className="flex items-center justify-between border-t pt-3 mt-3">
                    <span className="text-sm text-muted-foreground">Importe:</span>
                    <span className="text-lg font-bold text-primary">
                      €{(totalAmount * 1.21).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full bg-[#0070ba] hover:bg-[#005ea6]" 
                size="lg"
                onClick={() => window.open("https://paypal.me/talentcloudsolution", "_blank")}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Pagar con PayPal
              </Button>
              
              <Alert>
                <AlertDescription>
                  Incluye la referencia <strong>{bankDetails.concept}</strong> en el concepto del pago de PayPal.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "klarna":
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <CardTitle>Pago con Klarna</CardTitle>
                  <CardDescription>Próximamente disponible</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  El pago con Klarna estará disponible próximamente. Por favor, selecciona otro método de pago 
                  o contacta con nosotros en <strong>comercial@talentcloudsolution.es</strong> para más información.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "redsys":
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <CardTitle>Pago con Tarjeta (Redsys)</CardTitle>
                  <CardDescription>Próximamente disponible</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  El pago con tarjeta a través de Redsys estará disponible próximamente. Por favor, selecciona 
                  transferencia bancaria o PayPal, o contacta con nosotros en <strong>comercial@talentcloudsolution.es</strong>.
                </AlertDescription>
              </Alert>
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
              <Button onClick={() => navigate("/shop")}>Volver a la Tienda</Button>
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
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¡Pedido Creado!</h1>
          <p className="text-muted-foreground">
            Tu número de pedido es: <strong className="text-foreground">#{orderId?.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>

        {renderInstructions()}

        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">¿Qué ocurre después?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Realiza el pago según las instrucciones indicadas</li>
              <li>Recibirás un email de confirmación cuando verifiquemos el pago</li>
              <li>Te enviaremos los datos de acceso a tu plataforma</li>
              <li>Nuestro equipo te contactará para la configuración inicial</li>
            </ol>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Tienes alguna duda? Contáctanos en{" "}
            <a href="mailto:comercial@talentcloudsolution.es" className="text-primary hover:underline">
              comercial@talentcloudsolution.es
            </a>
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Volver al Inicio
            </Button>
            <Button onClick={() => navigate("/shop")}>
              Seguir Comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}