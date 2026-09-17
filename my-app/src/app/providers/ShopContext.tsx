import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItem = { product: Product; qty: number; size?: string };

type ShopState = {
  cart: CartItem[];
  cartOpen: boolean;
  addToCart: (p: Product, size?: string) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
  setCartOpen: (b: boolean) => void;
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "sheinar_cart";

function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (p: Product, size?: string) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id && i.size === size);
      if (ex) return c.map((i) => (i.product.id === p.id && i.size === size ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, qty: 1, size }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => setCart([]);

  return (
    <ShopContext.Provider value={{ cart, cartOpen, addToCart, removeFromCart, updateQty, clearCart, setCart, setCartOpen }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};
