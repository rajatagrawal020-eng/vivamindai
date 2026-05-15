import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Menu, X, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const links = [
    { href: "/#features", label: t("nav.features") },
    { href: "/#categories", label: t("nav.categories") },
    { href: "/#how", label: t("nav.how") },
    { href: "/#pricing", label: t("nav.pricing") },
    { href: "/#faq", label: t("nav.faq") },
  ];

  const onLogout = async () => { await supabase.auth.signOut(); nav({ to: "/" }); };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center glow">
            <Brain className="size-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg">VivaMind<span className="text-gradient"> AI</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
          {links.map(l => <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>)}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs font-medium hover:bg-white/5">
            <Globe className="size-3.5" /> {lang === "en" ? "EN" : "हिं"}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5">{t("nav.dashboard")}</Link>
              <button onClick={onLogout} className="px-4 py-2 rounded-lg text-sm font-medium glass hover:bg-white/10">{t("nav.logout")}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5">{t("nav.login")}</Link>
              <Link to="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-brand text-white shadow-card hover:opacity-95">{t("nav.signup")}</Link>
            </>
          )}
          <button className="lg:hidden p-2 rounded-lg glass" onClick={() => setOpen(!open)}>
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border/50 px-5 py-4 space-y-2 bg-background/95 backdrop-blur-xl">
          {links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">{l.label}</a>)}
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="text-sm text-muted-foreground py-2">🌐 {lang === "en" ? "हिंदी" : "English"}</button>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="mx-auto max-w-7xl px-5 py-12 grid sm:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-gradient-brand grid place-items-center"><Brain className="size-3.5 text-white" /></div>
            <span className="font-display font-bold">VivaMind <span className="text-gradient">AI</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer.tag")}</p>
        </div>
        <div className="sm:text-right text-xs text-muted-foreground self-end">
          © {new Date().getFullYear()} VivaMind AI. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
