import { ShoppingCart as CartIcon, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";

export function ShoppingCartWidget() {
  const { items, itemCount, totalAmount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <CartIcon className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Carrito de Compra</SheetTitle>
          <SheetDescription>
            {itemCount === 0 ? "Tu carrito está vacío" : `${itemCount} artículo(s) en el carrito`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border rounded-lg bg-card"
            >
              <div className="flex-1">
                <h4 className="font-semibold">{item.product?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.product?.description}
                </p>
                <p className="text-lg font-bold mt-2">
                  €{item.product?.price?.toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>€{totalAmount.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/checkout")}
            >
              Proceder al Pago
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
