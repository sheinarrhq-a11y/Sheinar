import { useState, type FormEvent } from "react";
import { login } from "./api";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function LoginPage({ onLogin }: { onLogin: (token: string, username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) { setError("All fields are required."); return; }
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      // Store in sessionStorage — clears when tab/browser closes
      sessionStorage.setItem("admin_token", data.token);
      sessionStorage.setItem("admin_username", data.username);
      onLogin(data.token, data.username);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setPassword(""); // clear password on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4"
      // Prevent browser from offering to save credentials via autocomplete
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-[#b08d57]/40 mb-5">
            <Lock className="h-5 w-5 text-[#b08d57]" />
          </div>
          <h1 className="text-2xl tracking-[0.5em] font-light text-white">SHEINAR</h1>
          <p className="text-[10px] tracking-[4px] uppercase text-neutral-500 mt-1.5">Admin Panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="bg-[#141414] border border-neutral-800 p-8 space-y-5"
        >
          {/* Username */}
          <div>
            <label className="block text-[10px] tracking-[2.5px] uppercase text-neutral-500 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-[#0a0a0a] border border-neutral-700 pl-9 pr-4 py-3 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#b08d57] transition-colors"
                placeholder="Username"
              />
            </div>
          </div>

          {/* Password — with show/hide toggle, no autocomplete */}
          <div>
            <label className="block text-[10px] tracking-[2.5px] uppercase text-neutral-500 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="w-full bg-[#0a0a0a] border border-neutral-700 pl-9 pr-11 py-3 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#b08d57] transition-colors"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 px-4 py-2.5">
              <p className="text-red-400 text-xs tracking-wide">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b08d57] text-white text-[11px] tracking-[3px] uppercase py-3.5 hover:bg-[#9a7a48] active:bg-[#8a6a38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>

          <p className="text-[10px] text-neutral-700 text-center tracking-wide pt-1">
            Protected area · Unauthorised access is prohibited
          </p>
        </form>

        <p className="text-center text-[10px] text-neutral-700 mt-6 tracking-wide">
          Session expires automatically when the tab is closed
        </p>
      </div>
    </div>
  );
}
