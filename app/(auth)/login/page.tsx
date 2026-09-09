"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/db/supabase-client";
import { Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"password" | "magic_link">("password");

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    // If Supabase keys are not set up yet in .env.local, allow preview access
    if (!configured) {
      setTimeout(() => {
        router.push("/");
      }, 500);
      return;
    }

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setMessage("Magic login link sent. Check your inbox.");
        }
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-sm inline-block" />
            <span className="font-serif text-3xl text-text-primary font-semibold tracking-tight">
              Orbit
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            AI Sales Outreach & Autonomous CRM Ledger
          </p>
        </div>

        {/* Auth form card */}
        <div className="border border-border/80 bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-card space-y-5">
          {!configured && (
            <div className="p-3 border border-amber-200 bg-amber-50/80 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="text-amber-700 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Development Preview</span>
              </div>
              <p className="text-amber-700/90 text-[11px] leading-relaxed">
                Supabase keys not detected in <code className="font-mono text-[11px] text-amber-900 font-semibold">.env.local</code>. Click sign in below to explore the dashboard shell.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {message && (
            <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-xl text-xs text-emerald-700 font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.com"
                className="w-full bg-white border border-border px-3.5 py-2.5 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-sm"
              />
            </div>

            {mode === "password" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-text-secondary">Password</label>
                </div>
                <input
                  type="password"
                  required={configured}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-border px-3.5 py-2.5 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : mode === "password" ? "Sign in to ledger" : "Send magic link"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-border flex justify-between text-xs">
            <button
              type="button"
              onClick={() => setMode(mode === "password" ? "magic_link" : "password")}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {mode === "password" ? "Use magic link instead" : "Use password instead"}
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-text-secondary">
          Private single-operator workspace
        </div>
      </div>
    </div>
  );
}
