import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  authToken?: string;
  createdAt: string;
};

export type Address = {
  id: string;
  label: string; // "Home" | "Work" | custom
  firstName: string;
  lastName: string;
  address: string;
  apt?: string;
  city: string;
  state: string;
  pin: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  collection: string;
  price: number;
  currency: string;
  qty: number;
  size?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress?: Partial<Address>;
  trackingNumber?: string;
  estimatedDelivery?: string;
};

type UserState = {
  user: User | null;
  wishlist: string[];
  wishlistOpen: boolean;
  userPanelOpen: boolean;
  addresses: Address[];
  orders: Order[];
  login: (name: string, email: string, phone?: string, token?: string, avatar?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "email" | "phone">>) => void;
  toggleWishlist: (id: string) => void;
  setWishlistOpen: (v: boolean) => void;
  setUserPanelOpen: (v: boolean) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  updateAddress: (id: string, a: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

const UserContext = createContext<UserState | null>(null);

function storageKey(userId: string) { return `sheinar_wishlist_${userId}`; }
function guestKey() { return "sheinar_wishlist_guest"; }
function addrKey(userId: string) { return `sheinar_addresses_${userId}`; }
function ordersKey(userId: string) { return `sheinar_orders_${userId}`; }

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sheinar_user") || "null") as User | null;
      const token = localStorage.getItem("sheinar_token");
      if (saved && token) return { ...saved, authToken: token };
      return saved;
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const u = JSON.parse(localStorage.getItem("sheinar_user") || "null") as User | null;
      const key = u ? storageKey(u.id) : guestKey();
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch { return []; }
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const u = JSON.parse(localStorage.getItem("sheinar_user") || "null") as User | null;
      if (!u) return [];
      return JSON.parse(localStorage.getItem(addrKey(u.id)) || "[]");
    } catch { return []; }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const u = JSON.parse(localStorage.getItem("sheinar_user") || "null") as User | null;
      if (!u) return [];
      return JSON.parse(localStorage.getItem(ordersKey(u.id)) || "[]") as Order[];
    } catch { return []; }
  });

  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);

  useEffect(() => {
    const key = user ? storageKey(user.id) : guestKey();
    localStorage.setItem(key, JSON.stringify(wishlist));
  }, [wishlist, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(addrKey(user.id), JSON.stringify(addresses));
  }, [addresses, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(ordersKey(user.id), JSON.stringify(orders));
  }, [orders, user]);

  function login(name: string, email: string, phone?: string, token?: string, avatar?: string) {
    const id = btoa(email).replace(/[^a-z0-9]/gi, "").slice(0, 16);
    const newUser: User = {
      id,
      name,
      email,
      phone,
      avatar,
      authToken: token,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("sheinar_user", JSON.stringify(newUser));
    if (token) localStorage.setItem("sheinar_token", token);
    else localStorage.removeItem("sheinar_token");
    const savedWishlist = JSON.parse(localStorage.getItem(storageKey(id)) || "[]") as string[];
    const savedAddresses = JSON.parse(localStorage.getItem(addrKey(id)) || "[]") as Address[];
    const savedOrders = JSON.parse(localStorage.getItem(ordersKey(id)) || "[]") as Order[];
    setUser(newUser);
    setWishlist(savedWishlist);
    setAddresses(savedAddresses);
    setOrders(savedOrders);
  }

  function logout() {
    localStorage.removeItem("sheinar_user");
    localStorage.removeItem("sheinar_token");
    setUser(null);
    const saved = JSON.parse(localStorage.getItem(guestKey()) || "[]") as string[];
    setWishlist(saved);
    setAddresses([]);
    setOrders([]);
  }

  function updateProfile(data: Partial<Pick<User, "name" | "email" | "phone">>) {
    if (!user) return;
    const updated = { ...user, ...data };
    localStorage.setItem("sheinar_user", JSON.stringify(updated));
    setUser(updated);
  }

  function toggleWishlist(id: string) {
    setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);
  }

  function addAddress(a: Omit<Address, "id">) {
    const newAddr: Address = { ...a, id: `addr_${Date.now()}` };
    setAddresses((prev) => {
      if (a.isDefault) return [...prev.map((x) => ({ ...x, isDefault: false })), newAddr];
      return [...prev, newAddr];
    });
  }

  function updateAddress(id: string, data: Partial<Address>) {
    setAddresses((prev) => {
      let updated = prev.map((a) => a.id === id ? { ...a, ...data } : a);
      if (data.isDefault) updated = updated.map((a) => a.id === id ? a : { ...a, isDefault: false });
      return updated;
    });
  }

  function removeAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function setDefaultAddress(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  return (
    <UserContext.Provider value={{
      user, wishlist, wishlistOpen, userPanelOpen, addresses, orders,
      login, logout, updateProfile, toggleWishlist,
      setWishlistOpen, setUserPanelOpen,
      addAddress, updateAddress, removeAddress, setDefaultAddress,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
