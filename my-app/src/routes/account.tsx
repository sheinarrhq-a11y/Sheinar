import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Package, LogOut, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useUser } from "@/context/UserContext";
import { useShop } from "@/context/ShopContext";
import { formatPrice } from "@/data/products";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "overview",
  }),
});

function AccountPage() {
  const { user, logout, wishlist } = useUser();
  const { cart } = useShop();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const search = useSearch({ from: "/account" });
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "saved">(
    (search.tab as "overview" | "orders" | "saved") || "overview"
  );

  useEffect(() => {
    const t = search.tab as string;
    if (t === "orders" || t === "saved" || t === "overview") setActiveTab(t);
  }, [search.tab]);

  const API = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/orders/customer?email=${encodeURIComponent(user.email)}`, {
          headers: user.authToken ? { Authorization: `Bearer ${user.authToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, API]);

  if (!user) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <h2 className="font-serif text-3xl mb-4 text-foreground">
            Sign in to your account
          </h2>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your account details and orders.
          </p>
          <Link to="/" className="lux-btn">
            Return Home
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">
            My Account
          </h1>
          <p className="text-muted-foreground">Welcome back, {user.name}.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex gap-6 border-b border-border">
              {[
                { id: "overview" as const, label: "Overview" },
                { id: "orders" as const, label: "Orders" },
                { id: "saved" as const, label: "Saved Items" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 text-sm font-serif border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Account Info */}
                <div className="border border-border rounded-2xl p-6 md:p-8">
                  <h2 className="font-serif text-2xl mb-6 text-foreground">
                    Account Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-sans text-xs tracking-[2px] uppercase text-muted-foreground mb-2">
                        Full Name
                      </label>
                      <p className="font-serif text-lg text-foreground">
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <label className="block font-sans text-xs tracking-[2px] uppercase text-muted-foreground mb-2">
                        Email Address
                      </label>
                      <p className="font-serif text-lg text-foreground">
                        {user.email}
                      </p>
                    </div>
                    {user.createdAt && (
                      <div>
                        <label className="block font-sans text-xs tracking-[2px] uppercase text-muted-foreground mb-2">
                          Member Since
                        </label>
                        <p className="font-serif text-lg text-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-2xl p-6 text-center">
                    <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-accent" />
                    </div>
                    <p className="font-serif text-3xl text-foreground mb-1">
                      {orders.length}
                    </p>
                    <p className="font-sans text-xs tracking-[2px] uppercase text-muted-foreground">
                      Total Orders
                    </p>
                  </div>
                  <div className="border border-border rounded-2xl p-6 text-center">
                    <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-6 w-6 text-accent" />
                    </div>
                    <p className="font-serif text-3xl text-foreground mb-1">
                      {wishlist.length}
                    </p>
                    <p className="font-sans text-xs tracking-[2px] uppercase text-muted-foreground">
                      Saved Pieces
                    </p>
                  </div>
                  <div className="border border-border rounded-2xl p-6 text-center">
                    <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <p className="font-serif text-3xl text-foreground mb-1">
                      {cart.length}
                    </p>
                    <p className="font-sans text-xs tracking-[2px] uppercase text-muted-foreground">
                      In Bag
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {loading ? (
                  <p className="text-muted-foreground">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-serif text-lg text-foreground mb-2">
                      No orders yet
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Start exploring our collection and place your first order.
                    </p>
                    <Link to="/" className="lux-btn">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-border rounded-2xl p-6 hover:border-accent transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-sans text-xs tracking-[2px] uppercase text-muted-foreground mb-1">
                            Order
                          </p>
                          <p className="font-serif text-foreground">
                            {order.orderNumber || order._id}
                          </p>
                        </div>
                        <span className="font-sans text-xs px-3 py-1 rounded-full bg-accent/10 text-accent tracking-[1px] uppercase">
                          {order.status || "processing"}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mb-1">
                            Order Date
                          </label>
                          <p className="font-serif text-sm text-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="block font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mb-1">
                            Total
                          </label>
                          <p className="font-serif text-sm text-foreground">
                            {formatPrice(order.total || 0, order.currency || "INR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Saved Items Tab */}
            {activeTab === "saved" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-serif text-lg text-foreground mb-2">
                      No saved items yet
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Save your favorite pieces to your wishlist.
                    </p>
                    <Link to="/" className="lux-btn">
                      Browse Collection
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlist.map((item: any) => (
                      <div
                        key={item._id || item.id}
                        className="border border-border rounded-2xl overflow-hidden hover:border-accent transition-colors group"
                      >
                        {item.image && (
                          <div className="aspect-square bg-muted overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name || item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="font-serif text-foreground mb-2 line-clamp-2">
                            {item.name || item.title}
                          </p>
                          <p className="font-serif text-lg text-accent">
                            {formatPrice(item.price || 0, item.currency || "INR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="border border-border rounded-2xl p-6 space-y-3">
              <h3 className="font-serif text-lg text-foreground mb-4">
                Quick Actions
              </h3>
              <Link
                to="/book-appointment"
                className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Calendar className="h-5 w-5 text-accent" />
                <span className="font-serif text-sm text-foreground">
                  Book Appointment
                </span>
              </Link>
              <Link
                to="/checkout"
                className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Package className="h-5 w-5 text-accent" />
                <span className="font-serif text-sm text-foreground">
                  View Bag
                </span>
              </Link>
            </div>

            {/* Account Settings */}
            <div className="border border-border rounded-2xl p-6 space-y-3">
              <h3 className="font-serif text-lg text-foreground mb-4">
                Settings
              </h3>
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-serif"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            {/* Help & Support */}
            <div className="border border-border rounded-2xl p-6 space-y-2 text-sm">
              <h3 className="font-serif text-lg text-foreground mb-4">
                Need Help?
              </h3>
              <p className="text-muted-foreground mb-4">
                Have questions about your account or orders?
              </p>
              <a
                href="mailto:support@example.com"
                className="inline-block text-accent hover:text-foreground transition-colors font-serif underline"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
