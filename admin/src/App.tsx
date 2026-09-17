import { useState, useEffect, useCallback } from "react";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import "./index.css";

/** Decode JWT payload without a library — just base64 decode the middle segment */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  if (!token) return false;
  const exp = getTokenExpiry(token);
  if (!exp) return false;
  // Treat as expired 60s early to avoid edge-case 401s
  return Date.now() < exp - 60_000;
}

export default function App() {
  const [token, setToken] = useState(() => {
    const t = sessionStorage.getItem("admin_token") || "";
    return isTokenValid(t) ? t : "";
  });
  const [username, setUsername] = useState(() =>
    sessionStorage.getItem("admin_username") || ""
  );

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_username");
    setToken("");
    setUsername("");
  }, []);

  // Auto-logout when JWT expires
  useEffect(() => {
    if (!token) return;
    const exp = getTokenExpiry(token);
    if (!exp) return;
    const msUntilExpiry = exp - Date.now() - 60_000;
    if (msUntilExpiry <= 0) { handleLogout(); return; }
    const timer = setTimeout(handleLogout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token, handleLogout]);

  // Logout if another tab clears sessionStorage
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "admin_token" && !e.newValue) handleLogout();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [handleLogout]);

  function handleLogin(t: string, u: string) {
    setToken(t);
    setUsername(u);
  }

  if (!token) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard username={username} onLogout={handleLogout} />;
}
