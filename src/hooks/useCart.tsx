import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    product_type: string;
    category: string | null;
  };
}

interface LocalCartItem {
  product_id: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = "talentcloud_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      
      // If user just logged in, sync local cart to DB
      if (event === 'SIGNED_IN' && newUserId) {
        syncLocalCartToDb(newUserId);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart when userId changes
  useEffect(() => {
    loadCart();
  }, [userId]);

  const getLocalCart = (): LocalCartItem[] => {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalCart = (localItems: LocalCartItem[]) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localItems));
  };

  const clearLocalCart = () => {
    localStorage.removeItem(LOCAL_CART_KEY);
  };

  const syncLocalCartToDb = async (uid: string) => {
    const localCart = getLocalCart();
    if (localCart.length === 0) return;

    try {
      for (const item of localCart) {
        // Check if already in DB cart
        const { data: existing } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", uid)
          .eq("product_id", item.product_id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + item.quantity })
            .eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({
            user_id: uid,
            product_id: item.product_id,
            quantity: item.quantity,
          });
        }
      }
      clearLocalCart();
      loadCart();
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  const loadCart = async () => {
    setLoading(true);
    try {
      if (userId) {
        // Load from Supabase for logged-in users
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            product_id,
            quantity,
            product:products (
              id,
              name,
              description,
              price,
              product_type,
              category
            )
          `)
          .eq("user_id", userId);

        if (error) throw error;
        setItems((data as CartItem[]) || []);
      } else {
        // Load from localStorage for anonymous users
        const localCart = getLocalCart();
        if (localCart.length === 0) {
          setItems([]);
        } else {
          // Fetch product details for local cart items
          const productIds = localCart.map(item => item.product_id);
          const { data: products, error } = await supabase
            .from("products")
            .select("id, name, description, price, product_type, category")
            .in("id", productIds);

          if (error) throw error;

          const cartItems: CartItem[] = localCart.map((item, index) => {
            const product = products?.find(p => p.id === item.product_id);
            return {
              id: `local-${index}`,
              product_id: item.product_id,
              quantity: item.quantity,
              product: product || {
                id: item.product_id,
                name: "Producto",
                description: null,
                price: 0,
                product_type: "",
                category: null,
              },
            };
          }).filter(item => item.product.price > 0);

          setItems(cartItems);
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      if (userId) {
        // Add to Supabase for logged-in users
        const existingItem = items.find((item) => item.product_id === productId);

        if (existingItem) {
          await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        } else {
          const { error } = await supabase.from("cart_items").insert({
            user_id: userId,
            product_id: productId,
            quantity,
          });

          if (error) throw error;
          await loadCart();
          toast.success("Añadido al carrito");
        }
      } else {
        // Add to localStorage for anonymous users
        const localCart = getLocalCart();
        const existingIndex = localCart.findIndex(item => item.product_id === productId);

        if (existingIndex >= 0) {
          localCart[existingIndex].quantity += quantity;
        } else {
          localCart.push({ product_id: productId, quantity });
        }

        saveLocalCart(localCart);
        await loadCart();
        toast.success("Añadido al carrito");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error al añadir al carrito");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      if (userId && !itemId.startsWith("local-")) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);

        if (error) throw error;
      } else {
        // Update localStorage
        const localCart = getLocalCart();
        const item = items.find(i => i.id === itemId);
        if (item) {
          const localIndex = localCart.findIndex(l => l.product_id === item.product_id);
          if (localIndex >= 0) {
            localCart[localIndex].quantity = quantity;
            saveLocalCart(localCart);
          }
        }
      }
      await loadCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error al actualizar cantidad");
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      if (userId && !itemId.startsWith("local-")) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId);

        if (error) throw error;
      } else {
        // Remove from localStorage
        const localCart = getLocalCart();
        const item = items.find(i => i.id === itemId);
        if (item) {
          const filtered = localCart.filter(l => l.product_id !== item.product_id);
          saveLocalCart(filtered);
        }
      }
      await loadCart();
      toast.success("Eliminado del carrito");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Error al eliminar del carrito");
    }
  };

  const clearCart = async () => {
    try {
      if (userId) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
      }
      clearLocalCart();
      await loadCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}