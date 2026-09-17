import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUser } from "@/context/UserContext";
import { useShop } from "@/context/ShopContext";
import { fetchProducts, formatPrice, type Product } from "@/data/products";

export function WishlistDrawer() {
  const { wishlist, wishlistOpen, setWishlistOpen, toggleWishlist } = useUser();
  const { addToCart } = useShop();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, [wishlist]);

  const wishlisted = products.filter((p) => wishlist.includes(p.id));

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setWishlistOpen(false)}
            className="fixed inset-0 bg-foreground/40 z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-secondary z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div>
                <span className="lux-eyebrow block mb-0.5">Your Wishlist</span>
                <p className="font-serif italic text-mocha text-xs">{wishlisted.length} piece{wishlisted.length !== 1 ? "s" : ""} saved</p>
              </div>
              <button onClick={() => setWishlistOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {wishlisted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <Heart className="h-10 w-10 text-border" strokeWidth={1} />
                  <p className="font-serif italic text-mocha">Your wishlist is empty.</p>
                  <p className="font-serif italic text-muted-foreground text-sm">Heart a piece to save it here.</p>
                  <button onClick={() => setWishlistOpen(false)} className="lux-btn mt-2">Explore Collections</button>
                </div>
              ) : (
                wishlisted.map((p) => (
                  <div key={p.id} className="flex gap-4">
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={() => setWishlistOpen(false)}
                      className="shrink-0"
                    >
                      <img src={p.image} alt={p.title} className="w-24 h-32 object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/product/$slug"
                        params={{ slug: p.slug }}
                        onClick={() => setWishlistOpen(false)}
                      >
                        <h4 className="font-serif text-foreground text-sm leading-snug hover:text-accent transition-colors">{p.title}</h4>
                      </Link>
                      <p className="text-xs text-mocha mt-1 tracking-widest uppercase">{p.collection}</p>
                      <p className="font-serif text-mocha mt-2 text-sm">{formatPrice(p.price, p.currency)}</p>

                      <div className="flex items-center gap-3 mt-3">
                        {p.status === "in-stock" && (
                          <button
                            onClick={() => { addToCart(p); setWishlistOpen(false); }}
                            className="inline-flex items-center gap-1.5 text-[10px] tracking-[2px] uppercase text-foreground hover:text-accent transition-colors"
                          >
                            <ShoppingBag className="h-3 w-3" /> Add to Bag
                          </button>
                        )}
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="inline-flex items-center gap-1.5 text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
