import { createContext, useContext, useState, ReactNode } from "react";
import type { CartItem, Listing } from "@/data/store";

interface CartContextType {
  items: CartItem[];
  addItem: (listing: Listing) => void;
  removeItem: (listingId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (listing: Listing) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.listing.id === listing.id);
      if (existing) return prev;
      return [...prev, { listing, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (listingId: string) => {
    setItems((prev) => prev.filter((i) => i.listing.id !== listingId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, i) => sum + i.listing.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
