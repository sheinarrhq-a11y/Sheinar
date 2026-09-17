import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import logoLight from "/logo_trasparentheader.png";
import logoDark from "/logo_tdark.png";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "@/context/ShopContext";
import { useUser } from "@/context/UserContext";
import { fetchCollections, fetchProducts, type Collection, type Product } from "@/data/products";
import { LazyImage } from "@/components/ui/LazyImage";
import { CurrencySelector } from "@/components/common/CurrencySelector";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";

const announcements = [
  "Each piece is meticulously handcrafted, making subtle variations and natural imperfections a mark of authenticity, artistry, and timeless individuality."
];

const SHOP_ITEMS = [
  { label: "Sarees", category: "sarees" },
  { label: "Sharara", category: "sharara" },
  { label: "Lehenga", category: "lehenga" },
  { label: "Suits", category: "suits" },
];

const ABOUT_SECTIONS = [
  {
    heading: "About Sheinar",
    items: [
      { label: "Our Story", to: "/about/out-story" },
      { label: "Contact Us", to: "/contact-us" },
    ],
  },
];

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { cart, setCartOpen } = useShop();
  const { wishlist, wishlistOpen, setWishlistOpen, userPanelOpen, setUserPanelOpen } = useUser();
  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !scrolled;
  const logoSrc = isTransparent ? logoLight : logoDark;
  const navTextClass = isTransparent ? "text-white" : "text-foreground";
  const navDividerClass = isTransparent ? "bg-white/50" : "bg-border";
  const navIconStyle = isTransparent ? { color: "white" } : undefined;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (searchOpen) {
      setSearchLoading(true);
      fetchProducts()
        .then((p) => { if (mounted) setProducts(p); })
        .catch(() => {})
        .finally(() => { if (mounted) setSearchLoading(false); });
    }
    return () => { mounted = false; };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    if (searchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <header className="fixed top-0 cursor-pointer inset-x-0 z-50">
      {/* Announcement marquee */}
      {/* <div className="bg-foreground text-secondary overflow-hidden">
        <div className="flex whitespace-nowrap py-2 lux-marquee">
          {[...announcements, ...announcements, ...announcements].map((a, i) => (
            <span key={i} className="px-10 text-[11px] tracking-[3px] uppercase font-serif italic opacity-90">
              {a} <span className="mx-6 text-accent">✦</span>
            </span>
          ))}
        </div>
      </div> */}

      <div className={`transition-all duration-500 ${isTransparent ? "bg-background/0" : "bg-background/95 backdrop-blur-md border-b border-border"}`}>
        <div className="mx-auto max-w-[1500px] px-8 lg:px-14">

          {/* ── Desktop navbar ── */}
          <div className="hidden lg:flex items-center h-[72px] relative">

            {/* Absolutely centered logo — always true center of viewport column */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10"
              aria-label="Sheinar home"
            >
              <img
                src={logoSrc}
                alt="Sheinar"
                className="h-[46px] w-auto object-contain transition-all duration-500"
              />
            </Link>

            {/* Left nav — grows to fill left half */}
            <nav className="flex items-center gap-9 m-rauto">
              <ShopDropdown isTransparent={isTransparent} />
              <CollectionsDropdown isTransparent={isTransparent} />
              <AboutDropdown isTransparent={isTransparent} />
              {/* <CampaignsDropdown />
              <CraftDropdown /> */}
            </nav>

            {/* Right icons — grows to fill right half, aligned to end */}
            <nav className="flex items-center gap-6 ml-auto">
              <Link to="/our-store" className={`lux-nav-link inline-flex items-center gap-1 uppercase ${navTextClass}`} style={navIconStyle}>
                Our Store
              </Link>
              {/* <StoriesDropdown /> */}
             
              {/* <div className={`h-4 w-px ${navDividerClass}`} />
              <CurrencySelector isTransparent={isTransparent} />
              <div className={`h-4 w-px ${navDividerClass}`} /> */}
              <IconBtn aria-label="Search" onClick={() => setSearchOpen(true)} className={navTextClass} style={navIconStyle}><Search className="h-[15px] w-[15px]" /></IconBtn>
              <button
                onClick={() => setUserPanelOpen(!userPanelOpen)}
                className={`navbar-icon-btn ${navTextClass}`}
                style={navIconStyle}
                aria-label="Account"
              >
                <User className="h-[15px] w-[15px]" />
              </button>
              <button
                onClick={() => setWishlistOpen(!wishlistOpen)}
                className={`navbar-icon-btn relative ${navTextClass}`}
                style={navIconStyle}
                aria-label="Wishlist"
              >
                <Heart className="h-[15px] w-[15px]" />
                {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className={`navbar-icon-btn cursor-pointer relative ${navTextClass}`}
                style={navIconStyle}
                aria-label="Cart"
              >
                <ShoppingBag className="h-[15px] w-[15px]" />
                {cart.length > 0 && <Badge>{cart.length}</Badge>}
              </button>
            </nav>
          </div>

          {/* ── Mobile header ── */}
          <div className="lg:hidden flex items-center justify-between h-14">
            <button onClick={() => setMobileOpen(true)} aria-label="Menu" style={navIconStyle}>
              <Menu className={`h-5 w-5 ${navTextClass}`} />
            </button>
            <Link to="/" className="flex items-center justify-center">
              <img
                src={logoSrc}
                alt="Sheinar"
                className="h-9 w-auto object-contain transition-opacity duration-500"
              />
            </Link>
            <div className="flex items-center gap-4">
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className={`relative inline-flex items-center ${navTextClass} hover:text-accent transition-colors`} style={navIconStyle}>
                <Search className="h-4 w-4" />
              </button>
              <button onClick={() => setUserPanelOpen(!userPanelOpen)} className={`relative inline-flex items-center ${navTextClass} hover:text-accent transition-colors`} style={navIconStyle} aria-label="Account">
                <User className="h-4 w-4" />
              </button>
              <button onClick={() => setWishlistOpen(!wishlistOpen)} className={`relative inline-flex items-center ${navTextClass} hover:text-accent transition-colors`} style={navIconStyle} aria-label="Wishlist">
                <Heart className="h-4 w-4" />
                {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
              </button>
              <button onClick={() => setCartOpen(true)} className={`relative inline-flex items-center ${navTextClass} hover:text-accent transition-colors`} style={navIconStyle}>
                <ShoppingBag className="h-4 w-4" />
                {cart.length > 0 && <Badge>{cart.length}</Badge>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="fixed left-1/2 -translate-x-1/2 top-12 z-50 w-[95vw] max-w-3xl bg-background border border-border shadow-[0_20px_60px_-20px_rgba(83,62,45,0.18)] rounded-md"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name or collection…"
                    className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-foreground"
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">Close</button>
                </div>
                <div className="mt-3 max-h-64 overflow-y-auto">
                  {searchLoading ? (
                    <div className="py-6 text-center text-muted-foreground">Loading…</div>
                  ) : (
                    <>
                      {searchQuery.trim() === "" ? (
                        <div className="py-6 text-center text-muted-foreground">Type to search products by name or collection.</div>
                      ) : (
                        <div className="space-y-1">
                          {products.filter(p => (
                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.collection || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase())
                          )).slice(0, 12).map((p) => (
                            <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="group flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                              <div className="w-12 h-12 bg-muted overflow-hidden rounded">
                                <LazyImage src={p.image} alt={p.title} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                              </div>
                              <div className="flex-1">
                                <div className="text-foreground text-sm group-hover:text-accent">{p.title}</div>
                                <div className="text-muted-foreground text-xs mt-0.5">{p.collection}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-background flex flex-col lg:hidden shadow-[8px_0_40px_-8px_rgba(83,62,45,0.18)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <img src={logoDark} alt="Sheinar" className="h-9 w-auto object-contain" />
                </Link>
                <button onClick={() => setMobileOpen(false)} aria-label="Close"
                  className="h-8 w-8 flex items-center justify-center border border-border text-foreground hover:border-accent hover:text-accent transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Scrollable nav */}
              <div className="flex-1 overflow-y-auto">
                <nav className="py-4">
                  <MobileAccordion
                    label="Shop"
                    delay={0.02}
                    onClose={() => setMobileOpen(false)}
                  >
                    <MobileShopLinks onClose={() => setMobileOpen(false)} />
                  </MobileAccordion>

                  <MobileAccordion
                    label="Collections"
                    delay={0.05}
                    onClose={() => setMobileOpen(false)}
                  >
                    <MobileCollectionLinks onClose={() => setMobileOpen(false)} />
                
                  </MobileAccordion>

                
                  <MobilePlainLink to="/our-store" label="Our Store" delay={0.1} onClose={() => setMobileOpen(false)} />

                  <MobileAccordion label="About Us" delay={0.3} onClose={() => setMobileOpen(false)}>
                    {[
                      { label: "Our Story", to: "/about/out-story" },
                      { label: "Contact Us", to: "/contact-us" },
                    ].map((s) => <MobileSubLink key={s.label} to={s.to} label={s.label} onClose={() => setMobileOpen(false)} />)}
                  </MobileAccordion>
                </nav>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button onClick={() => { setMobileOpen(false); setWishlistOpen(true); }}
                    className="relative text-foreground hover:text-accent transition-colors">
                    <Heart className="h-4 w-4" />
                    {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
                  </button>
                  <button onClick={() => { setMobileOpen(false); setCartOpen(true); }}
                    className="relative text-foreground hover:text-accent transition-colors">
                    <ShoppingBag className="h-4 w-4" />
                    {cart.length > 0 && <Badge>{cart.length}</Badge>}
                  </button>
                  <button onClick={() => { setMobileOpen(false); setUserPanelOpen(true); }}
                    className="text-foreground hover:text-accent transition-colors">
                    <User className="h-4 w-4" />
                  </button>
                </div>
                {/* <MobileCurrencyPicker /> */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── Shop category dropdown ─── */
function ShopDropdown({ isTransparent = false }: { isTransparent?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <SimpleDropdown label="Shop" open={open} setOpen={setOpen} width="w-64" isTransparent={isTransparent}>
      {SHOP_ITEMS.map((item) => (
        <Link
          key={item.category}
          to="/shop/$category"
          params={{ category: item.category }}
          className="group block py-3 px-4 hover:bg-muted/50 transition-colors duration-200 -mx-4"
        >
          <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors block">
            {item.label}
          </span>
        </Link>
      ))}
    </SimpleDropdown>
  );
}

/* ─── Collections mega-menu with image cards ─── */
function CollectionsDropdown({ isTransparent = false }: { isTransparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  useEffect(() => { fetchCollections().then(setCollections); }, []);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`lux-nav-link inline-flex items-center gap-1 uppercase ${isTransparent ? "text-white" : "text-foreground"}`} style={isTransparent ? { color: "white" } : undefined}>
        Collections <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-full pt-5 w-[680px]"
          >
            <div className="bg-background border border-border shadow-[0_30px_80px_-20px_rgba(83,62,45,0.2)]">
              <div className="px-8 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <span className="lux-eyebrow">The Collections</span>
                {/* <Link to="/collections" className="font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-accent transition-colors">
                  View All →
                </Link> */}
              </div>
              <div className="grid grid-cols-4 gap-0 p-6 gap-4">
                {collections.map((c, i) => (
                  <motion.div
                    key={c.slug}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                  >
                    <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
                      <div className="relative overflow-hidden aspect-[3/4] bg-muted">
                        <LazyImage src={c.image} alt={c.title} wrapperClassName="absolute inset-0"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500" />
                        <span className="absolute top-3 left-3 lux-eyebrow text-secondary text-[9px] tracking-[2px]">{c.tag}</span>
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-foreground/80 to-transparent">
                          <span className="font-sans text-[10px] tracking-[2px] uppercase text-secondary/80">Explore →</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="font-sans text-[11px] sm:text-[12px] font-medium uppercase tracking-[2px] text-foreground group-hover:text-accent transition-colors duration-300">
                          {c.title}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Campaigns dropdown ─── */
function CampaignsDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "The Heirloom Edit",   to: "/campaigns/heirloom-edit" },
    { label: "Bridal 2025",   to: "/campaigns/bridal-2025" },
    { label: "Festive Lookbook", to: "/campaigns/festive-lookbook" },
    { label: "Artisan Portraits",  to: "/campaigns/artisan-portraits" },
  ];
  return (
    <SimpleDropdown label="Campaigns" open={open} setOpen={setOpen} width="w-64">
      {items.map((item) => (
        <Link key={item.label} to={item.to}
          className="group block py-3 px-4 hover:bg-muted/50 transition-colors duration-200 -mx-4">
          <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors block">{item.label}</span>
          {/* <span className="font-sans text-[10px] text-muted-foreground mt-0.5 block">{item.desc}</span> */}
        </Link>
      ))}
    </SimpleDropdown>
  );
}

/* ─── Craft dropdown ─── */
function CraftDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Art of Embroidery", to: "/about/art-of-embroidery" },
    { label: "The   ", to: "/about/  " },
    { label: "Handloom Weaves", to: "/craft/handloom-weaves" },
    { label: "Zardozi", to: "/craft/zardozi" },
    { label: "Chikankari", to: "/craft/chikankari" },
  ];
  return (
    <SimpleDropdown label="Craft" open={open} setOpen={setOpen} width="w-64">
      {items.map((item) => (
        <Link key={item.label} to={item.to}
          className="group block py-3 px-4 hover:bg-muted/50 transition-colors duration-200 -mx-4">
          <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors block">{item.label}</span>
          {/* <span className="font-sans text-[10px] text-muted-foreground mt-0.5 block">{item.desc}</span> */}
        </Link>
      ))}
    </SimpleDropdown>
  );
}

/* ─── Stories dropdown ─── */
function StoriesDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Journal", to: "/stories/journal" },
    { label: "Artisan Portraits", to: "/stories/artisan-portraits" },
    { label: "Heritage Diaries", to: "/stories/heritage-diaries" },
    { label: "Bride Stories", to: "/stories/bride-stories" },
  ];
  return (
    <SimpleDropdown label="Stories" open={open} setOpen={setOpen} width="w-64">
      {items.map((item) => (
        <Link key={item.label} to={item.to}
          className="group block py-3 px-4 hover:bg-muted/50 transition-colors duration-200 -mx-4">
          <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors block">{item.label}</span>
          {/* <span className="font-sans text-[10px] text-muted-foreground mt-0.5 block">{item.desc}</span> */}
        </Link>
      ))}
    </SimpleDropdown>
  );
}

/* ─── About dropdown ─── */
function AboutDropdown({ isTransparent = false }: { isTransparent?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`lux-nav-link inline-flex items-center gap-1 uppercase ${isTransparent ? "text-white" : "text-foreground"}`} style={isTransparent ? { color: "white" } : undefined}>
        About Us <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-full pt-5 w-[480px]"
          >
            <div className="bg-background border border-border shadow-[0_30px_60px_-20px_rgba(83,62,45,0.18)]">
              <div className="px-8 py-4 border-b border-border bg-muted/30">
                <span className="lux-eyebrow">Discover Sheinar</span>
              </div>
              <div className="grid grid-cols-2 gap-0">
                {ABOUT_SECTIONS.map((section) => (
                  <div key={section.heading} className="p-6 border-r last:border-r-0 border-border">
                    <span className="font-sans text-[10px] tracking-[3px] uppercase text-muted-foreground block mb-4">{section.heading}</span>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Link key={item.to} to={item.to} className="group block py-2.5 px-3 hover:bg-muted/50 transition-colors duration-200 -mx-3">
                          <span className="font-serif text-sm text-foreground group-hover:text-accent transition-colors block">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="px-8 py-4 border-t border-border bg-muted/20">
                <Link to="/philosophy" className="lux-eyebrow hover:text-foreground transition-colors">View Philosophy →</Link>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Reusable simple dropdown wrapper ─── */
function SimpleDropdown({ label, open, setOpen, width, children, isTransparent = false }: {
  label: string; open: boolean; setOpen: (v: boolean) => void; width: string; children: React.ReactNode; isTransparent?: boolean;
}) {
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`lux-nav-link inline-flex items-center gap-1 uppercase ${isTransparent ? "text-white" : "text-foreground"}`} style={isTransparent ? { color: "white" } : undefined}>
        {label} <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className={`absolute left-0 top-full pt-5 ${width}`}
          >
            <div className="bg-background border border-border shadow-[0_30px_60px_-20px_rgba(83,62,45,0.18)] px-4 py-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn(props: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="text-foreground hover:text-accent transition-colors" />;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] h-4 min-w-4 px-1 rounded-full inline-flex items-center justify-center">
      {children}
    </span>
  );
}

/* ─── Mobile accordion item ─── */
function MobileAccordion({ label, delay, children }: {
  label: string; delay: number; children: React.ReactNode; onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="border-b border-border"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 group"
      >
        <span className="font-serif text-[12px] tracking-[2px] uppercase text-foreground group-hover:text-accent transition-colors duration-300">
          {label}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-accent transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-muted/20"
          >
            <div className="px-4 py-2 pb-4 space-y-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Mobile sub-link row ─── */
function MobileSubLink({ to, params, label, onClose }: {
  to: string; params?: Record<string, string>; label: string; sub?: string; onClose: () => void;
}) {
  return (
    <Link
      to={to}
      params={params}
      onClick={onClose}
      className="group flex items-center justify-between py-3 border-b border-border/30 last:border-0"
    >
      <span className="font-sans text-[11px] sm:text-[12px] font-medium uppercase tracking-[2px] text-foreground group-hover:text-accent transition-colors duration-200 block">
        {label}
      </span>
      <ChevronDown className="h-3 w-3 text-border group-hover:text-accent transition-colors -rotate-90 shrink-0" />
    </Link>
  );
}

/* ─── Mobile collection links (fetches async) ─── */
function MobileCollectionLinks({ onClose }: { onClose: () => void }) {
  const [cols, setCols] = useState<Collection[]>([]);
  useEffect(() => { fetchCollections().then(setCols); }, []);
  return (
    <>
      {cols.map((c) => (
        <MobileSubLink
          key={c.slug}
          to="/collections/$slug"
          params={{ slug: c.slug }}
          label={c.title}
          onClose={onClose}
        />
      ))}
      {/* <Link to="/collections" onClick={onClose}
        className="flex items-center gap-1.5 px-4 py-2 mt-1 lux-eyebrow hover:text-foreground transition-colors">
        View All Collections <span className="text-accent">→</span>
      </Link> */}
    </>
  );
}

function MobileShopLinks({ onClose }: { onClose: () => void }) {
  const items = [
    { label: "Sarees", sub: "Silks and heirlooms", category: "sarees" },
    { label: "Sharara", sub: "Fluid occasion dressing", category: "sharara" },
    { label: "Lehenga", sub: "Ceremonial silhouettes", category: "lehenga" },
    { label: "Suits", sub: "Refined occasion sets", category: "suits" },
  ];
  return (
    <>
      {items.map((item) => (
        <MobileSubLink key={item.category} to="/shop/$category" params={{ category: item.category }} label={item.label} sub={item.sub} onClose={onClose} />
      ))}
    </>
  );
}

/* ─── Mobile currency picker ─── */
function MobileCurrencyPicker() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 font-sans text-[10px] tracking-[2px] uppercase text-foreground hover:text-accent transition-colors border border-border px-2.5 py-1.5"
      >
        <span>{currency.flag}</span>
        <span>{currency.code}</span>
        <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 bottom-full mb-2 w-48 bg-background border border-border shadow-[0_-10px_40px_-10px_rgba(83,62,45,0.15)] z-50 max-h-64 overflow-y-auto"
          >
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                  c.code === currency.code ? "bg-muted/30" : ""
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="font-sans text-[11px] tracking-[1px] text-foreground">{c.code}</span>
                <span className="font-serif text-[11px] text-muted-foreground ml-auto">{c.symbol}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile plain link ─── */
function MobilePlainLink({ to, label, delay, onClose }: {
  to: string; label: string; delay: number; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="border-b border-border"
    >
      <Link to={to} onClick={onClose}
        className="w-full flex items-center justify-between px-6 py-4 group">
        <span className="font-serif text-[12px] tracking-[2px] uppercase text-foreground group-hover:text-accent transition-colors duration-300">
          {label}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-accent transition-colors -rotate-90" />
      </Link>
    </motion.div>
  );
}
