import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Heart, LogOut, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUser } from "@/context/UserContext";
import { useShop } from "@/context/ShopContext";
import { useCurrency } from "@/context/CurrencyContext";
import { signInWithGoogle } from "@/utils/auth";

const inp = "w-full border-b border-border bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors font-serif text-sm";
const lbl = "block font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mb-1.5";

export function UserPanel() {
  const { user, wishlist, userPanelOpen, setUserPanelOpen, setWishlistOpen, login, logout } = useUser();
  const { cart } = useShop();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    if (tab === "register" && !name.trim()) { setError("Enter your name."); return; }
    login(tab === "register" ? name.trim() : (email.split("@")[0] || "Guest"), email.trim());
  }

  async function handleGoogleResponse(response: { credential?: string }) {
    if (!response.credential) {
      setError("Google sign-in failed to return a token.");
      setLoading(false);
      return;
    }

    try {
      const data = await signInWithGoogle(response.credential);
      login(data.user.name, data.user.email);
      setUserPanelOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) {
      setError("Google sign-in is not available. Please use email instead.");
      setLoading(false);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      // Trigger the One Tap UI or Google Sign-In flow
      // Note: prompt() will show One Tap if available, otherwise users can use other sign-in methods
      // This is the recommended approach for transitioning to FedCM
      window.google.accounts.id.prompt((notification) => {
        // Silently handle if prompt is not displayed - FedCM fallback
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap not shown, but that's okay - user clicked the button manually
          console.log("Google One Tap UI not displayed, user can still sign in");
        }
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again or use email.");
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    setUserPanelOpen(false);
  }

  useEffect(() => {
    // Only load Google script if a client ID is configured
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return;

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => {}; // fail silently — button stays hidden
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <AnimatePresence>
      {userPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setUserPanelOpen(false)}
            className="fixed inset-0 bg-foreground/40 z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-secondary z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-border">
              <span className="lux-eyebrow">{user ? "My Account" : "Sign In"}</span>
              <button onClick={() => setUserPanelOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {!user ? (
                /* ── Login / Register ── */
                <div className="p-6">
                  {/* Tab switcher */}
                  <div className="flex border-b border-border mb-6">
                    {(["login", "register"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTab(t); setError(""); }}
                        className={`flex-1 py-3 text-[11px] tracking-[2px] uppercase transition-colors border-b-2 -mb-px ${
                          tab === t ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t === "login" ? "Sign In" : "Register"}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {tab === "register" && (
                      <div>
                        <label className={lbl}>Full Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={inp} placeholder="Anu Kaushal" />
                      </div>
                    )}
                    <div>
                      <label className={lbl}>Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} placeholder="your@email.com" />
                    </div>
                    {error && <p className="text-destructive text-xs font-serif italic">{error}</p>}
                    <button type="submit" className="lux-btn w-full justify-center mt-2">
                      {tab === "login" ? "Continue" : "Create Account"}
                    </button>
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={!googleReady || loading}
                        className="lux-btn w-full justify-center bg-white text-foreground border border-border hover:bg-muted transition-colors mt-2"
                      >
                        {loading ? "Signing in with Google…" : "Continue with Google"}
                      </button>
                    )}
                  </form>

                  <p className="font-serif italic text-muted-foreground text-xs text-center mt-6 leading-relaxed">
                    Your wishlist is saved to your account and accessible across devices.
                  </p>
                </div>
              ) : (
                /* ── Dashboard ── */
                <div className="p-6 space-y-6">
                  {/* User info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    <div className="h-12 w-12 bg-foreground text-secondary rounded-full flex items-center justify-center shrink-0">
                      <span className="font-serif text-lg">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-serif text-foreground text-base">{user.name}</p>
                      <p className="font-sans text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
                      <p className="font-sans text-[10px] text-muted-foreground/60 mt-0.5">
                        Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setUserPanelOpen(false); setWishlistOpen(true); }}
                      className="border border-border p-4 text-left hover:border-accent transition-colors group"
                    >
                      <Heart className="h-4 w-4 text-accent mb-2" />
                      <p className="font-serif text-foreground text-xl">{wishlist.length}</p>
                      <p className="font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mt-0.5">Saved Pieces</p>
                    </button>
                    <div className="border border-border p-4">
                      <Package className="h-4 w-4 text-accent mb-2" />
                      <p className="font-serif text-foreground text-xl">{cart.length}</p>
                      <p className="font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mt-0.5">In Bag</p>
                    </div>
                  </div>

                  {/* Wishlist preview */}
                  {wishlist.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground">Saved Pieces</span>
                        <button
                          onClick={() => { setUserPanelOpen(false); setWishlistOpen(true); }}
                          className="font-sans text-[10px] tracking-[2px] uppercase text-accent hover:text-foreground transition-colors"
                        >
                          View All →
                        </button>
                      </div>
                      <WishlistPreview wishlist={wishlist} onClose={() => setUserPanelOpen(false)} />
                    </div>
                  )}

                  {/* Quick links */}
                  <div className="border-t border-border pt-4 space-y-1">
                    <Link
                      to="/account"
                      search={{ tab: "orders" }}
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-border/50 group"
                    >
                      <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors">My Orders</span>
                      <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
                    </Link>
                    <Link
                      to="/track"
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-border/50 group"
                    >
                      <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors">Track Shipment</span>
                      <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
                    </Link>
                    <Link
                      to="/book-appointment"
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between py-3 group"
                    >
                      <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors">Book Appointment</span>
                      <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-muted-foreground hover:text-destructive transition-colors mt-2"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Small wishlist preview inside user panel
function WishlistPreview({ wishlist, onClose }: { wishlist: string[]; onClose: () => void }) {
  const [products, setProducts] = useState<{ id: string; image: string; title: string; price: number; slug: string }[]>([]);
  const { format } = useCurrency();
  useEffect(() => {
    import("@/data/products").then(({ fetchProducts }) =>
      fetchProducts().then((all) => setProducts(all.filter((p) => wishlist.includes(p.id)).map((p) => ({ id: p.id, image: p.image, title: p.title, price: p.price, slug: p.slug }))))
    );
  }, [wishlist]);

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {products.slice(0, 6).map((p) => (
        <Link
          key={p.id}
          to="/product/$slug"
          params={{ slug: p.slug }}
          onClick={onClose}
          className="shrink-0 group"
        >
          <div className="w-20 h-24 bg-muted overflow-hidden">
            <img src={p.image || undefined} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <p className="font-serif text-[10px] text-foreground mt-1 truncate w-20">{p.title.split("—")[0].trim()}</p>
          <p className="font-serif text-[10px] text-mocha">{format(p.price)}</p>
        </Link>
      ))}
    </div>
  );
}
