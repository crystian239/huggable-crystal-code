import { X, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, removeItem, clearCart, totalPrice, isOpen, setIsOpen } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthTab } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    toast.success("Pedido realizado com sucesso! Aguarde o vendedor.");
    clearCart();
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 glass-strong border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-bold text-foreground">Carrinho</h2>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.listing.id} className="rounded-lg border border-border bg-card p-3 flex gap-3">
                      <img src={item.listing.images[0]} alt="" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.listing.gameName}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{item.listing.title}</p>
                        <p className="text-sm font-bold text-primary mt-1">
                          R$ {item.listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.listing.id)} className="p-1 text-muted-foreground hover:text-destructive flex-shrink-0 self-start">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-heading text-xl font-bold text-primary">
                    R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold box-glow">
                  Finalizar Compra
                </Button>
                <button onClick={clearCart} className="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Limpar carrinho
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
