import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, CreditCard, Wallet, Save, Info, ExternalLink, RefreshCw, Smartphone, CreditCard as CardIcon, ShieldCheck } from "lucide-react";

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
    title: "Tarjeta bancaria",
    description: "Pago seguro a través de tarjeta bancaria. Serás redirigido al sitio web del banco de forma segura.",
    merchantName: "EMPLEATE TALAVERA FORMACION",
    merchantCode: "356598565",
    terminal: "1",
    secretKey: "",
    currency: "EUR",
    environment: "production",
    paymentTypes: "cards_iupay",
    transactionType: "standard",
    communicationMode: "redirect",
    enablePsd2: true,
    forceHttps: true,
    language: "es",
    exemptions: "none",
    enableOneClick: false,
    enableInstallments: false,
    sandboxMode: false,
  });

  // Bizum settings (via Redsys)
  const [bizumSettings, setBizumSettings] = useState({
    enabled: true,
    title: "Bizum",
    description: "Pago seguro con tu Bizum. Serás redirigido al sitio web del banco de forma segura.",
    merchantName: "EMPLEATE TALAVERA FORMACION",
    merchantCode: "356598565",
    terminal: "1",
    secretKey: "",
    currency: "EUR",
    environment: "production",
    sandboxMode: false,
  });

  // Scalapay settings
  const [scalapaySettings, setScalapaySettings] = useState({
    enabled: true,
    apiKey: "",
    secretKey: "",
    merchantId: "",
    mode: "pay_in_3", // pay_in_3 or pay_in_4
    sandboxMode: false,
  });

  // seQura settings
  const [sequraSettings, setSequraSettings] = useState({
    enabled: true,
    merchantId: "",
    apiKey: "",
    environment: "production",
    sandboxMode: false,
  });

  // Klarna settings
  const [klarnaSettings, setKlarnaSettings] = useState({
    enabled: true,
    apiUsername: "",
    apiPassword: "",
    sandboxMode: true,
  });

  // Redsys Recurring settings
  const [redsysRecurringSettings, setRedsysRecurringSettings] = useState({
    enabled: false,
    merchantCode: "",
    terminal: "001",
    secretKey: "",
    cofTxnId: "",
    recurringExpiry: "4912",
    recurringFrequency: "30",
    notificationUrl: "",
    sandboxMode: true,
  });

  const handleSave = (section: string) => {
    toast.success(`Configuración de ${section} guardada correctamente`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Pagos</h1>
        <p className="text-muted-foreground">Configura los métodos de pago de tu tienda online - Integración con plataformasionline.es</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los cambios en la configuración de pagos afectarán a todos los pedidos futuros. 
          Asegúrate de probar cada método antes de activarlo en producción.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="redsys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="redsys" className="flex items-center gap-1 text-xs">
            <CreditCard className="w-3 h-3" />
            <span className="hidden sm:inline">Redsys</span>
          </TabsTrigger>
          <TabsTrigger value="bizum" className="flex items-center gap-1 text-xs">
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">Bizum</span>
          </TabsTrigger>
          <TabsTrigger value="scalapay" className="flex items-center gap-1 text-xs">
            <CardIcon className="w-3 h-3" />
            <span className="hidden sm:inline">Scalapay</span>
          </TabsTrigger>
          <TabsTrigger value="sequra" className="flex items-center gap-1 text-xs">
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">seQura</span>
          </TabsTrigger>
          <TabsTrigger value="klarna" className="flex items-center gap-1 text-xs">
            <Wallet className="w-3 h-3" />
            <span className="hidden sm:inline">Klarna</span>
          </TabsTrigger>
          <TabsTrigger value="paypal" className="flex items-center gap-1 text-xs">
            <Wallet className="w-3 h-3" />
            <span className="hidden sm:inline">PayPal</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-1 text-xs">
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">Transfer.</span>
          </TabsTrigger>
          <TabsTrigger value="redsys-recurring" className="flex items-center gap-1 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Recurr.</span>
          </TabsTrigger>
        </TabsList>

        {/* Redsys - Tarjeta Bancaria */}
        <TabsContent value="redsys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Redsys - Tarjeta Bancaria</CardTitle>
                    <CardDescription>Pasarela de pago para tarjetas de crédito/débito</CardDescription>
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
            <CardContent className="space-y-6">
              {/* Configuración básica */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Configuración Básica</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="redsys-title">Título</Label>
                    <Input
                      id="redsys-title"
                      value={redsysSettings.title}
                      onChange={(e) => setRedsysSettings(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-merchantName">Nombre del comercio</Label>
                    <Input
                      id="redsys-merchantName"
                      value={redsysSettings.merchantName}
                      onChange={(e) => setRedsysSettings(prev => ({ ...prev, merchantName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redsys-description">Descripción</Label>
                  <Textarea
                    id="redsys-description"
                    value={redsysSettings.description}
                    onChange={(e) => setRedsysSettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>

              {/* Datos de conexión */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Datos de Conexión</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="redsys-merchantCode">FUC del comercio electrónico</Label>
                    <Input
                      id="redsys-merchantCode"
                      value={redsysSettings.merchantCode}
                      onChange={(e) => setRedsysSettings(prev => ({ ...prev, merchantCode: e.target.value }))}
                      placeholder="356598565"
                    />
                    <p className="text-xs text-muted-foreground">El banco debe darte este dato, normalmente es un número grande</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-terminal">Número de terminal</Label>
                    <Input
                      id="redsys-terminal"
                      value={redsysSettings.terminal}
                      onChange={(e) => setRedsysSettings(prev => ({ ...prev, terminal: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="redsys-secretKey">Clave secreta de encriptación</Label>
                    <Input
                      id="redsys-secretKey"
                      type="password"
                      value={redsysSettings.secretKey}
                      onChange={(e) => setRedsysSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder="Clave SHA-256"
                    />
                    <p className="text-xs text-muted-foreground">Clave de encriptación segura, también llamada clave SHA-256</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-currency">Divisa</Label>
                    <Select value={redsysSettings.currency} onValueChange={(value) => setRedsysSettings(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro</SelectItem>
                        <SelectItem value="USD">Dólar estadounidense</SelectItem>
                        <SelectItem value="GBP">Libra esterlina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-environment">Entorno</Label>
                    <Select value={redsysSettings.environment} onValueChange={(value) => setRedsysSettings(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Producción (Sis)</SelectItem>
                        <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Configuración avanzada */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Configuración Avanzada</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="redsys-paymentTypes">Tipos de pago permitidos</Label>
                    <Select value={redsysSettings.paymentTypes} onValueChange={(value) => setRedsysSettings(prev => ({ ...prev, paymentTypes: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cards_iupay">Tarjetas de crédito y iupay</SelectItem>
                        <SelectItem value="cards_only">Solo tarjetas de crédito</SelectItem>
                        <SelectItem value="all">Todos los métodos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-transactionType">Tipo de transacción</Label>
                    <Select value={redsysSettings.transactionType} onValueChange={(value) => setRedsysSettings(prev => ({ ...prev, transactionType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Pago estándar</SelectItem>
                        <SelectItem value="preauth">Preautorización</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-communicationMode">Modo de comunicación</Label>
                    <Select value={redsysSettings.communicationMode} onValueChange={(value) => setRedsysSettings(prev => ({ ...prev, communicationMode: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="redirect">Redirección estándar</SelectItem>
                        <SelectItem value="rest">API REST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redsys-language">Idioma</Label>
                    <Select value={redsysSettings.language} onValueChange={(value) => setRedsysSettings(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español/Castellano</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ca">Català</SelectItem>
                        <SelectItem value="eu">Euskara</SelectItem>
                        <SelectItem value="gl">Galego</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="redsys-psd2"
                      checked={redsysSettings.enablePsd2}
                      onCheckedChange={(checked) => setRedsysSettings(prev => ({ ...prev, enablePsd2: checked }))}
                    />
                    <Label htmlFor="redsys-psd2">Activar PSD2</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="redsys-https"
                      checked={redsysSettings.forceHttps}
                      onCheckedChange={(checked) => setRedsysSettings(prev => ({ ...prev, forceHttps: checked }))}
                    />
                    <Label htmlFor="redsys-https">Forzar respuesta por HTTPS</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="redsys-oneclick"
                      checked={redsysSettings.enableOneClick}
                      onCheckedChange={(checked) => setRedsysSettings(prev => ({ ...prev, enableOneClick: checked }))}
                    />
                    <Label htmlFor="redsys-oneclick">Pagar con un clic / Compatibilidad con suscripciones</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="redsys-installments"
                      checked={redsysSettings.enableInstallments}
                      onCheckedChange={(checked) => setRedsysSettings(prev => ({ ...prev, enableInstallments: checked }))}
                    />
                    <Label htmlFor="redsys-installments">Pago fraccionado</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("Redsys")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => window.open("https://pagosonline.redsys.es/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Panel Redsys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bizum (via Redsys) */}
        <TabsContent value="bizum">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Redsys Bizum</CardTitle>
                    <CardDescription>Pago con Bizum usando RedSys. Tus clientes podrán pagar usando su móvil.</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bizum-enabled">Activado</Label>
                  <Switch
                    id="bizum-enabled"
                    checked={bizumSettings.enabled}
                    onCheckedChange={(checked) => setBizumSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Bizum funciona a través de Redsys. Necesitas tener contratado el servicio Bizum con tu banco 
                  y configurar un terminal específico para este método de pago.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Configuración Básica</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bizum-title">Título</Label>
                    <Input
                      id="bizum-title"
                      value={bizumSettings.title}
                      onChange={(e) => setBizumSettings(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bizum-merchantName">Nombre del comercio</Label>
                    <Input
                      id="bizum-merchantName"
                      value={bizumSettings.merchantName}
                      onChange={(e) => setBizumSettings(prev => ({ ...prev, merchantName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bizum-description">Descripción</Label>
                  <Textarea
                    id="bizum-description"
                    value={bizumSettings.description}
                    onChange={(e) => setBizumSettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Datos de Conexión</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bizum-merchantCode">FUC del comercio electrónico</Label>
                    <Input
                      id="bizum-merchantCode"
                      value={bizumSettings.merchantCode}
                      onChange={(e) => setBizumSettings(prev => ({ ...prev, merchantCode: e.target.value }))}
                      placeholder="356598565"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bizum-terminal">Número de terminal</Label>
                    <Input
                      id="bizum-terminal"
                      value={bizumSettings.terminal}
                      onChange={(e) => setBizumSettings(prev => ({ ...prev, terminal: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bizum-secretKey">Clave secreta de encriptación</Label>
                    <Input
                      id="bizum-secretKey"
                      type="password"
                      value={bizumSettings.secretKey}
                      onChange={(e) => setBizumSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder="Clave SHA-256"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bizum-currency">Divisa</Label>
                    <Select value={bizumSettings.currency} onValueChange={(value) => setBizumSettings(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bizum-environment">Entorno</Label>
                    <Select value={bizumSettings.environment} onValueChange={(value) => setBizumSettings(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Producción (Sis)</SelectItem>
                        <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("Bizum")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => window.open("https://bizum.es/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Más sobre Bizum
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scalapay */}
        <TabsContent value="scalapay">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <CardIcon className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <CardTitle>Scalapay</CardTitle>
                    <CardDescription>Pago en 3 o 4 cuotas sin intereses para el cliente</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="scalapay-enabled">Activado</Label>
                  <Switch
                    id="scalapay-enabled"
                    checked={scalapaySettings.enabled}
                    onCheckedChange={(checked) => setScalapaySettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4 border-teal-200 bg-teal-50">
                <Info className="h-4 w-4 text-teal-600" />
                <AlertDescription className="text-teal-800">
                  Scalapay permite a tus clientes pagar en 3 o 4 cuotas sin intereses. 
                  Tú recibes el pago completo al momento de la compra.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scalapay-mode">Modo de pago</Label>
                  <Select value={scalapaySettings.mode} onValueChange={(value) => setScalapaySettings(prev => ({ ...prev, mode: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pay_in_3">Pay in 3 (3 cuotas)</SelectItem>
                      <SelectItem value="pay_in_4">Pay in 4 (4 cuotas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scalapay-merchantId">Merchant ID</Label>
                  <Input
                    id="scalapay-merchantId"
                    value={scalapaySettings.merchantId}
                    onChange={(e) => setScalapaySettings(prev => ({ ...prev, merchantId: e.target.value }))}
                    placeholder="Tu ID de comercio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scalapay-apiKey">API Key</Label>
                  <Input
                    id="scalapay-apiKey"
                    value={scalapaySettings.apiKey}
                    onChange={(e) => setScalapaySettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="API Key pública"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scalapay-secretKey">Secret Key</Label>
                  <Input
                    id="scalapay-secretKey"
                    type="password"
                    value={scalapaySettings.secretKey}
                    onChange={(e) => setScalapaySettings(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Secret Key"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="scalapay-sandbox"
                  checked={scalapaySettings.sandboxMode}
                  onCheckedChange={(checked) => setScalapaySettings(prev => ({ ...prev, sandboxMode: checked }))}
                />
                <Label htmlFor="scalapay-sandbox">Modo Sandbox (pruebas)</Label>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("Scalapay")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => window.open("https://portal.scalapay.com/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Portal Scalapay
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* seQura */}
        <TabsContent value="sequra">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle>seQura</CardTitle>
                    <CardDescription>Financiación flexible y pagos aplazados</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sequra-enabled">Activado</Label>
                  <Switch
                    id="sequra-enabled"
                    checked={sequraSettings.enabled}
                    onCheckedChange={(checked) => setSequraSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4 border-indigo-200 bg-indigo-50">
                <Info className="h-4 w-4 text-indigo-600" />
                <AlertDescription className="text-indigo-800">
                  seQura ofrece múltiples opciones de financiación: pago aplazado, pago en cuotas 
                  y opciones flexibles para tus clientes.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sequra-merchantId">Merchant ID</Label>
                  <Input
                    id="sequra-merchantId"
                    value={sequraSettings.merchantId}
                    onChange={(e) => setSequraSettings(prev => ({ ...prev, merchantId: e.target.value }))}
                    placeholder="Tu ID de comercio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sequra-apiKey">API Key</Label>
                  <Input
                    id="sequra-apiKey"
                    type="password"
                    value={sequraSettings.apiKey}
                    onChange={(e) => setSequraSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Tu API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sequra-environment">Entorno</Label>
                  <Select value={sequraSettings.environment} onValueChange={(value) => setSequraSettings(prev => ({ ...prev, environment: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Producción</SelectItem>
                      <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="sequra-sandbox"
                  checked={sequraSettings.sandboxMode}
                  onCheckedChange={(checked) => setSequraSettings(prev => ({ ...prev, sandboxMode: checked }))}
                />
                <Label htmlFor="sequra-sandbox">Modo Sandbox (pruebas)</Label>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("seQura")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => window.open("https://sequra.com/", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Portal seQura
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

        {/* Redsys Recurring */}
        <TabsContent value="redsys-recurring">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Redsys Pagos Recurrentes</CardTitle>
                    <CardDescription>Configura cobros automáticos mensuales para suscripciones anuales</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="redsys-recurring-enabled">Activado</Label>
                  <Switch
                    id="redsys-recurring-enabled"
                    checked={redsysRecurringSettings.enabled}
                    onCheckedChange={(checked) => setRedsysRecurringSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pagos COF (Credential on File):</strong> Este sistema permite cobrar automáticamente cada mes 
                  a los centros con plan anual de 12 meses. Necesitas un TPV virtual con soporte para pagos recurrentes.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurringMerchantCode">Código de Comercio (FUC)</Label>
                  <Input
                    id="recurringMerchantCode"
                    value={redsysRecurringSettings.merchantCode}
                    onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, merchantCode: e.target.value }))}
                    placeholder="999008881"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurringTerminal">Terminal</Label>
                  <Input
                    id="recurringTerminal"
                    value={redsysRecurringSettings.terminal}
                    onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, terminal: e.target.value }))}
                    placeholder="001"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="recurringSecretKey">Clave Secreta (SHA-256)</Label>
                  <Input
                    id="recurringSecretKey"
                    type="password"
                    value={redsysRecurringSettings.secretKey}
                    onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Tu clave secreta proporcionada por el banco"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3">Configuración de Recurrencia</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cofTxnId">COF Transaction ID (Identificador)</Label>
                    <Input
                      id="cofTxnId"
                      value={redsysRecurringSettings.cofTxnId}
                      onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, cofTxnId: e.target.value }))}
                      placeholder="Se genera automáticamente tras primer cobro"
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único para pagos recurrentes. Se obtiene del primer cobro exitoso.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurringExpiry">Fecha Expiración Tarjeta (YYMM)</Label>
                    <Input
                      id="recurringExpiry"
                      value={redsysRecurringSettings.recurringExpiry}
                      onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, recurringExpiry: e.target.value }))}
                      placeholder="4912"
                      maxLength={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formato: Año (2 dígitos) + Mes (2 dígitos). Ej: 4912 = Dic 2049
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurringFrequency">Frecuencia de Cobro (días)</Label>
                    <Input
                      id="recurringFrequency"
                      type="number"
                      value={redsysRecurringSettings.recurringFrequency}
                      onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, recurringFrequency: e.target.value }))}
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Días entre cada cobro automático. Por defecto: 30 días (mensual)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notificationUrl">URL de Notificación (Webhook)</Label>
                    <Input
                      id="notificationUrl"
                      value={redsysRecurringSettings.notificationUrl}
                      onChange={(e) => setRedsysRecurringSettings(prev => ({ ...prev, notificationUrl: e.target.value }))}
                      placeholder="https://tudominio.com/api/redsys-webhook"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL donde Redsys enviará confirmaciones de pago
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="redsys-recurring-sandbox"
                  checked={redsysRecurringSettings.sandboxMode}
                  onCheckedChange={(checked) => setRedsysRecurringSettings(prev => ({ ...prev, sandboxMode: checked }))}
                />
                <Label htmlFor="redsys-recurring-sandbox">Modo Sandbox (pruebas)</Label>
              </div>

              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Flujo de cobro recurrente:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Centro contrata Plan Anual (12 meses) y paga primera cuota</li>
                    <li>Se almacena el identificador COF de la tarjeta</li>
                    <li>Cada 30 días se realiza cobro automático sin intervención del cliente</li>
                    <li>Si falla el cobro, se notifica al centro y se reintenta</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleSave("Redsys Recurrente")}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => window.open("https://pagosonline.redsys.es/funcionalidades-702702-702.html", "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentación COF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
