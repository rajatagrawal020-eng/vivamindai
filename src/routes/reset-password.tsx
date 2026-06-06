import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Brain, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /\d/.test(pw),
  };
}

function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => validatePassword(password), [password]);
  const pwValid = checks.length && checks.letter && checks.number;

  useEffect(() => {
    // The Supabase client picks up the recovery token from the URL hash automatically
    // and emits PASSWORD_RECOVERY. We just need to confirm a session exists.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwValid) return toast.error("Password must be 8+ chars with letters and numbers.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You are signed in.");
    nav({ to: "/dashboard", replace: true });
  };

  const Req = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-400" : "text-muted-foreground"}`}>
      {ok ? <Check className="size-3" /> : <X className="size-3" />} {children}
    </li>
  );

  return (
    <div className="min-h-screen grid place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center"><Brain className="size-4 text-white" /></div>
          <span className="font-display font-bold text-lg">VivaMind <span className="text-gradient">AI</span></span>
        </Link>
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready ? "Choose a strong new password to finish resetting." : "Verifying your reset link..."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">New password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
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
              <ul className="mt-2 space-y-1 text-xs">
                <Req ok={checks.length}>At least 8 characters</Req>
                <Req ok={checks.letter}>Contains a letter</Req>
                <Req ok={checks.number}>Contains a number</Req>
              </ul>
            </div>
            <button disabled={loading || !pwValid || !ready} className="w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white glow disabled:opacity-50">
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-brand font-medium hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
