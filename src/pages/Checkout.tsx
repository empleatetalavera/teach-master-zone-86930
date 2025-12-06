import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Building2, Wallet, Loader2, LogIn } from "lucide-react";
import { Navbar } from "@/components/Navbar";

type PaymentMethod = "bank_transfer" | "paypal" | "klarna" | "redsys";

export default function Checkout() {
  const { items, totalAmount, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Billing info for non-logged users
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    cif: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    // Validate billing info if not logged in
    if (!user) {
      if (!billingInfo.name || !billingInfo.email) {
        toast.error("Por favor, completa los datos de facturación");
        return;
      }
    }

    setProcessing(true);
    try {
      let userId = user?.id;

      // If user is not logged in, we'll store order with billing info
      if (!userId) {
        // Create order without user_id - need to handle this differently
        toast.info("Para completar tu pedido, por favor inicia sesión o regístrate");
        // Store cart and billing info in sessionStorage
        sessionStorage.setItem("pending_checkout", JSON.stringify({
          billingInfo,
          paymentMethod,
          notes,
        }));
        navigate("/auth?redirect=/checkout");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          order_details: { notes, billingInfo },
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and pending checkout
      await clearCart();
      sessionStorage.removeItem("pending_checkout");

      toast.success("Pedido creado correctamente");
      navigate("/payment-instructions", { state: { orderId: order.id, paymentMethod, totalAmount } });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al procesar el pedido");
    } finally {
      setProcessing(false);
    }
  };

  // Restore pending checkout data after login
  useEffect(() => {
    if (user) {
      const pending = sessionStorage.getItem("pending_checkout");
      if (pending) {
        try {
          const data = JSON.parse(pending);
          setBillingInfo(data.billingInfo || {});
          setPaymentMethod(data.paymentMethod || "bank_transfer");
          setNotes(data.notes || "");
        } catch (e) {
          console.error("Error restoring checkout data:", e);
        }
      }
    }
  }, [user]);

  const paymentOptions = [
    {
      id: "bank_transfer" as PaymentMethod,
      name: "Transferencia Bancaria",
      description: "Realiza una transferencia a nuestra cuenta",
      icon: Building2,
    },
    {
      id: "paypal" as PaymentMethod,
      name: "PayPal",
      description: "Pago rápido y seguro con PayPal",
      icon: Wallet,
    },
    {
      id: "redsys" as PaymentMethod,
      name: "Tarjeta (Redsys)",
      description: "Pago seguro con tarjeta de crédito o débito (próximamente)",
      icon: CreditCard,
      disabled: true,
    },
    {
      id: "klarna" as PaymentMethod,
      name: "Klarna",
      description: "Paga ahora o a plazos con Klarna (próximamente)",
      icon: Wallet,
      disabled: true,
    },
  ];

  if (checkingAuth || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Carrito Vacío</CardTitle>
              <CardDescription>No hay productos en tu carrito</CardDescription>
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
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
              <CardDescription>{items.length} artículo(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal:</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>IVA (21%):</span>
                  <span>€{(totalAmount * 0.21).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>€{(totalAmount * 1.21).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Login prompt */}
            {!user && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <LogIn className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">¿Ya tienes cuenta?</h3>
                      <p className="text-sm text-muted-foreground">
                        Inicia sesión para un proceso de compra más rápido
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/auth?redirect=/checkout")}>
                      Iniciar Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Datos de Facturación</CardTitle>
                <CardDescription>
                  {user ? "Revisa tus datos de facturación" : "Introduce tus datos para la factura"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo / Razón social *</Label>
                    <Input
                      id="name"
                      value={billingInfo.name}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre o empresa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || billingInfo.email}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      required
                      disabled={!!user}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={billingInfo.phone}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={billingInfo.company}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cif">CIF/NIF</Label>
                    <Input
                      id="cif"
                      value={billingInfo.cif}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, cif: e.target.value }))}
                      placeholder="B12345678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
                <CardDescription>Selecciona cómo deseas pagar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isDisabled = (option as any).disabled;
                    return (
                      <div 
                        key={option.id} 
                        className={`flex items-start space-x-3 border rounded-lg p-4 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} disabled={isDisabled} />
                        <Label htmlFor={option.id} className={`flex-1 ${isDisabled ? '' : 'cursor-pointer'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{option.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade cualquier comentario sobre tu pedido..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `Confirmar Pedido - €${(totalAmount * 1.21).toFixed(2)}`
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Al confirmar el pedido, aceptas nuestros términos y condiciones de servicio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}