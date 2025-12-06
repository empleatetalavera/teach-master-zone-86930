import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Building2, CreditCard, Wallet, Save, Info, ExternalLink } from "lucide-react";

export default function AdminPaymentSettings() {
  // Bank transfer settings
  const [bankSettings, setBankSettings] = useState({
    enabled: true,
    bankName: "BBVA",
    iban: "ES14 0182 0861 6802 0169 9387",
    bic: "BBVAESMMXXX",
    beneficiary: "TalentCloud Solutions S.L.",
    notificationEmail: "pagos@talentcloudsolution.es",
  });

  // PayPal settings
  const [paypalSettings, setPaypalSettings] = useState({
    enabled: true,
    email: "pagos@talentcloudsolution.es",
    clientId: "",
    clientSecret: "",
    sandboxMode: false,
  });

  // Redsys settings
  const [redsysSettings, setRedsysSettings] = useState({
    enabled: true,
    merchantCode: "",
    terminal: "001",
    secretKey: "",
    sandboxMode: true,
  });

  // Klarna settings
  const [klarnaSettings, setKlarnaSettings] = useState({
    enabled: true,
    apiUsername: "",
    apiPassword: "",
    sandboxMode: true,
  });

  const handleSave = (section: string) => {
    // Here you would save to database or environment variables
    toast.success(`Configuración de ${section} guardada correctamente`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Pagos</h1>
        <p className="text-muted-foreground">Configura los métodos de pago de tu tienda online</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los cambios en la configuración de pagos afectarán a todos los pedidos futuros. 
          Asegúrate de probar cada método antes de activarlo en producción.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="bank" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Transferencia
          </TabsTrigger>
          <TabsTrigger value="paypal" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            PayPal
          </TabsTrigger>
          <TabsTrigger value="redsys" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Redsys
          </TabsTrigger>
          <TabsTrigger value="klarna" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Klarna
          </TabsTrigger>
        </TabsList>

        {/* Bank Transfer */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Transferencia Bancaria</CardTitle>
                    <CardDescription>Configura los datos bancarios para recibir pagos</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bank-enabled">Activado</Label>
                  <Switch
                    id="bank-enabled"
                    checked={bankSettings.enabled}
                    onCheckedChange={(checked) => setBankSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nombre del Banco</Label>
                  <Input
                    id="bankName"
                    value={bankSettings.bankName}
                    onChange={(e) => setBankSettings(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Beneficiario</Label>
                  <Input
                    id="beneficiary"
                    value={bankSettings.beneficiary}
                    onChange={(e) => setBankSettings(prev => ({ ...prev, beneficiary: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={bankSettings.iban}
                    onChange={(e) => setBankSettings(prev => ({ ...prev, iban: e.target.value }))}
                    placeholder="ES00 0000 0000 0000 0000 0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bic">BIC/SWIFT</Label>
                  <Input
                    id="bic"
                    value={bankSettings.bic}
                    onChange={(e) => setBankSettings(prev => ({ ...prev, bic: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notificationEmail">Email para notificaciones de pago</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={bankSettings.notificationEmail}
                    onChange={(e) => setBankSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("Transferencia Bancaria")} className="mt-4">
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PayPal */}
        <TabsContent value="paypal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>PayPal</CardTitle>
                    <CardDescription>Configura tu cuenta de PayPal para recibir pagos</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="paypal-enabled">Activado</Label>
                  <Switch
                    id="paypal-enabled"
                    checked={paypalSettings.enabled}
                    onCheckedChange={(checked) => setPaypalSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="paypalEmail">Email de PayPal</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    value={paypalSettings.email}
                    onChange={(e) => setPaypalSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypalClientId">Client ID (API)</Label>
                  <Input
                    id="paypalClientId"
                    value={paypalSettings.clientId}
                    onChange={(e) => setPaypalSettings(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Opcional - para pagos automáticos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypalSecret">Client Secret (API)</Label>
                  <Input
                    id="paypalSecret"
                    type="password"
                    value={paypalSettings.clientSecret}
                    onChange={(e) => setPaypalSettings(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Opcional - para pagos automáticos"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="paypal-sandbox"
                  checked={paypalSettings.sandboxMode}
                  onCheckedChange={(checked) => setPaypalSettings(prev => ({ ...prev, sandboxMode: checked }))}
                />
                <Label htmlFor="paypal-sandbox">Modo Sandbox (pruebas)</Label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("PayPal")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => window.open("https://developer.paypal.com/dashboard/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  PayPal Developer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redsys */}
        <TabsContent value="redsys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Redsys (TPV Virtual)</CardTitle>
                    <CardDescription>Configura el TPV virtual de Redsys para pagos con tarjeta</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="redsys-enabled">Activado</Label>
                  <Switch
                    id="redsys-enabled"
                    checked={redsysSettings.enabled}
                    onCheckedChange={(checked) => setRedsysSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para usar Redsys necesitas contratar el servicio con tu banco. 
                  Ellos te proporcionarán el código de comercio y la clave secreta.
                </AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchantCode">Código de Comercio (FUC)</Label>
                  <Input
                    id="merchantCode"
                    value={redsysSettings.merchantCode}
                    onChange={(e) => setRedsysSettings(prev => ({ ...prev, merchantCode: e.target.value }))}
                    placeholder="999008881"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terminal">Terminal</Label>
                  <Input
                    id="terminal"
                    value={redsysSettings.terminal}
                    onChange={(e) => setRedsysSettings(prev => ({ ...prev, terminal: e.target.value }))}
                    placeholder="001"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="secretKey">Clave Secreta (SHA-256)</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={redsysSettings.secretKey}
                    onChange={(e) => setRedsysSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Tu clave secreta proporcionada por el banco"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="redsys-sandbox"
                  checked={redsysSettings.sandboxMode}
                  onCheckedChange={(checked) => setRedsysSettings(prev => ({ ...prev, sandboxMode: checked }))}
                />
                <Label htmlFor="redsys-sandbox">Modo Sandbox (pruebas)</Label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("Redsys")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => window.open("https://pagosonline.redsys.es/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Panel Redsys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Klarna */}
        <TabsContent value="klarna">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <CardTitle>Klarna</CardTitle>
                    <CardDescription>Configura Klarna para pagos a plazos y "Paga después"</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="klarna-enabled">Activado</Label>
                  <Switch
                    id="klarna-enabled"
                    checked={klarnaSettings.enabled}
                    onCheckedChange={(checked) => setKlarnaSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para usar Klarna necesitas registrarte como comercio en Klarna Merchant Portal. 
                  El proceso de aprobación puede tardar varios días.
                </AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="klarnaUsername">API Username (UID)</Label>
                  <Input
                    id="klarnaUsername"
                    value={klarnaSettings.apiUsername}
                    onChange={(e) => setKlarnaSettings(prev => ({ ...prev, apiUsername: e.target.value }))}
                    placeholder="K12345_abcdefgh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="klarnaPassword">API Password</Label>
                  <Input
                    id="klarnaPassword"
                    type="password"
                    value={klarnaSettings.apiPassword}
                    onChange={(e) => setKlarnaSettings(prev => ({ ...prev, apiPassword: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="klarna-sandbox"
                  checked={klarnaSettings.sandboxMode}
                  onCheckedChange={(checked) => setKlarnaSettings(prev => ({ ...prev, sandboxMode: checked }))}
                />
                <Label htmlFor="klarna-sandbox">Modo Sandbox (pruebas)</Label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("Klarna")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => window.open("https://portal.klarna.com/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Klarna Merchant Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}