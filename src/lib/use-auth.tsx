import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const DEV_BYPASS_EMAIL = "rajatagrawal020@gmail.com";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  plan: "free" | "pro";
  isDevBypass: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isPremium: false,
  plan: "free",
  isDevBypass: false,
});

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function getGlobalEntitlements(user: User | null) {
  const email = normalizeEmail(user?.email);
  const isDevBypass = email === DEV_BYPASS_EMAIL;
  return {
    isPremium: isDevBypass,
    plan: (isDevBypass ? "pro" : "free") as "free" | "pro",
    isDevBypass,
  };
}

export function useAuthReady() {
  const auth = useAuth();
  return {
    user: auth.user,
    isReady: !auth.loading,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const user = session?.user ?? null;
  const entitlements = getGlobalEntitlements(user);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!active) return;
      setSession(s);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        setSession(session);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return <Ctx.Provider value={{ session, user, loading, ...entitlements }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
