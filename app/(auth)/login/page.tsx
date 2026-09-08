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
    <div className="min-h-screen bg-ink flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            <span className="font-serif text-2xl text-text-primary font-medium tracking-wide">
              Orbit
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            AI Sales Outreach & CRM Ledger
          </p>
        </div>

        {/* Auth form card */}
        <div className="border border-border bg-surface p-7 rounded space-y-5">
          {!configured && (
            <div className="p-3 border border-warning/30 bg-warning/5 rounded text-xs text-text-secondary space-y-1">
              <div className="text-warning font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Development Preview</span>
              </div>
              <p>
                Supabase keys not detected in <code className="font-mono text-[11px] text-text-primary">.env.local</code>. Click sign in below to explore the dashboard shell.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 border border-danger/30 bg-danger/10 rounded text-xs text-danger">
              {errorMsg}
            </div>
          )}

          {message && (
            <div className="p-3 border border-success/30 bg-success/10 rounded text-xs text-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.com"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>

            {mode === "password" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Password</label>
                </div>
                <input
                  type="password"
                  required={configured}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded disabled:opacity-50"
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
