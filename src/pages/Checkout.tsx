import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreditCard, Building2, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";

type PaymentMethod = "bank_transfer" | "paypal" | "klarna" | "redsys";

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("redsys");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión");
        navigate("/auth");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          order_details: { notes },
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

      // Clear cart
      await clearCart();

      toast.success("Pedido creado correctamente");
      navigate("/payment-instructions", { state: { orderId: order.id, paymentMethod } });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al procesar el pedido");
    } finally {
      setProcessing(false);
    }
  };

  const paymentOptions = [
    {
      id: "redsys" as PaymentMethod,
      name: "Tarjeta (Redsys)",
      description: "Pago seguro con tarjeta de crédito o débito",
      icon: CreditCard,
    },
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
      id: "klarna" as PaymentMethod,
      name: "Klarna",
      description: "Paga ahora o a plazos con Klarna",
      icon: Wallet,
    },
  ];

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
              <Button onClick={() => navigate("/")}>Volver a la Tienda</Button>
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
              <CardDescription>{items.length} artículo(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
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

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>€{totalAmount.toFixed(2)}</span>
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
                  return (
                    <div key={option.id} className="flex items-start space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
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
                {processing ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
