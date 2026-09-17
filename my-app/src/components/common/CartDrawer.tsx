import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "@tanstack/react-router";
import { useCurrency } from "@/context/CurrencyContext";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQty } = useShop();
  const { user, setUserPanelOpen } = useUser();
  const { format } = useCurrency();
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-foreground/40 z-50"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-secondary z-50 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div>
                <span className="lux-eyebrow">Your    Bag</span>
                {cart.length > 0 && (
                  <p className="font-serif italic text-mocha text-xs mt-0.5">{cart.length} piece{cart.length !== 1 ? "s" : ""}</p>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {cart.length === 0 && (
                <p className="font-serif italic text-mocha text-center mt-20">
                  Your bag awaits its first heirloom.
                </p>
              )}
              {cart.map((it) => (
                <div key={`${it.product.id}-${it.size}`} className="flex gap-4">
                  <img src={it.product.image} alt={it.product.title} className="w-24 h-32 object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-foreground text-sm leading-snug">{it.product.title}</h4>
                    <p className="text-xs text-mocha mt-1 tracking-widest uppercase">{it.product.collection}</p>
                    {it.size && <p className="text-xs text-mocha mt-0.5">Size: {it.size}</p>}
                    <p className="font-serif text-mocha mt-2">{format(it.product.price * it.qty)}</p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQty(it.product.id, it.qty - 1)}
                          className="h-7 w-7 flex items-center justify-center text-foreground hover:text-accent transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-serif text-sm w-7 text-center">{it.qty}</span>
                        <button
                          onClick={() => updateQty(it.product.id, it.qty + 1)}
                          className="h-7 w-7 flex items-center justify-center text-foreground hover:text-accent transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(it.product.id)}
                        className="text-mocha hover:text-accent inline-flex items-center gap-1 text-xs tracking-widest uppercase"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex justify-between font-serif text-foreground mb-1">
                  <span>Subtotal</span><span>{format(total)}</span>
                </div>
                <p className="font-sans text-[10px] text-muted-foreground mb-5">Shipping & taxes calculated at checkout</p>
                {!user ? (
                  <button
                    onClick={() => { setCartOpen(false); setUserPanelOpen(true); }}
                    className="lux-btn w-full justify-center mb-3"
                  >
                    Sign in to save your bag
                  </button>
                ) : null}
                <CheckoutButton onClose={() => setCartOpen(false)} />
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CheckoutButton({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      className="lux-btn w-full justify-center"
      onClick={() => { onClose(); navigate({ to: "/checkout" }); }}
    >
      Proceed to Checkout
    </button>
  );
}
