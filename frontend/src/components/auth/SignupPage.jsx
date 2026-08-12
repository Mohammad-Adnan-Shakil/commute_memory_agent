import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UserPlus, AlertTriangle } from "lucide-react";
import { ShaderBackground } from "../ui/electric-aura";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export default function SignupPage({ onLogin, onSwitchToLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Sign up failed. Please try again.");
        return;
      }
      onLogin(data.access_token, data.user_id, data.email);
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-teal-400/50 focus:outline-none transition-colors";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060911] text-white">
      <div className="absolute inset-0">
        <ShaderBackground className="h-full w-full" />
      </div>

      <button
        type="button"
        onClick={onBack}
        className="absolute left-6 top-5 z-20 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:text-white"
      >
        ← Back
      </button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#060911]/60 p-8 shadow-2xl backdrop-blur-xl"
        >
          <h1 className="text-xl font-semibold tracking-tight font-[family-name:var(--font-heading)]">
            Create account
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign up to sync your route memory across devices.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-400/5 px-3 py-2.5 text-sm text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-500">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={inputClass}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || password.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-teal-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-teal-400 transition-colors hover:text-teal-300"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}