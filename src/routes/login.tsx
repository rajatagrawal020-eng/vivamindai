import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Brain, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function friendlyLoginError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Wrong email or password. If you signed up with Google, please use the Google button instead.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address first. Check your inbox.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return message;
}

function LoginPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) return toast.error(friendlyLoginError(error.message));
    toast.success("Welcome back!");
    nav({ to: "/dashboard", replace: true });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) toast.error(result.error.message);
  };

  const onForgot = async () => {
    if (!email.trim()) {
      toast.error("Enter your email above first, then click Forgot password.");
      return;
    }
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setSendingReset(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen grid place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center"><Brain className="size-4 text-white" /></div>
          <span className="font-display font-bold text-lg">VivaMind <span className="text-gradient">AI</span></span>
        </Link>
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold">{t("auth.login.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.login.sub")}</p>

          <button onClick={onGoogle} className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10">
            <svg className="size-4" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.18h5.36c-.23 1.5-1.78 4.4-5.36 4.4-3.23 0-5.86-2.67-5.86-5.96s2.63-5.96 5.86-5.96c1.84 0 3.07.78 3.78 1.46l2.58-2.5C16.71 3.94 14.55 3 12 3 6.99 3 3 7.03 3 12s3.99 9 9 9c5.19 0 8.62-3.65 8.62-8.78 0-.6-.07-1.06-.27-1.12z"/></svg>
            {t("auth.google")}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> {t("auth.or")} <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("auth.email")}</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("auth.password")}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl glass px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={onForgot}
                  disabled={sendingReset}
                  className="text-xs text-brand hover:underline disabled:opacity-50"
                >
                  {sendingReset ? "Sending..." : "Forgot password?"}
                </button>
              </div>
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white glow disabled:opacity-50">
              {loading ? "Signing in..." : t("nav.login")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t("auth.no")} <Link to="/signup" className="text-brand font-medium hover:underline">{t("nav.signup")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
