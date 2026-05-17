import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Menu, X, Globe, Github, Linkedin, Mail } from "lucide-react";
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
    <footer className="border-t border-border/50 mt-24">
      <div className="mx-auto max-w-7xl px-5 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-gradient-brand grid place-items-center"><Brain className="size-3.5 text-white" /></div>
            <span className="font-display font-bold">VivaMind <span className="text-gradient">AI</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer.tag")}</p>
        </div>

        {/* Developer / Creator card */}
        <div className="md:col-span-1">
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-gradient-brand grid place-items-center font-display font-bold text-white text-base shadow-card">
                RA
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-brand font-semibold">Developed by</div>
                <div className="font-display font-semibold leading-tight truncate">Rajat Agrwal</div>
                <div className="text-xs text-muted-foreground">Full-Stack Developer · Creator of VivaMind AI</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <a aria-label="Email" href="mailto:contact@vivamind.ai" className="inline-flex items-center justify-center size-8 rounded-lg glass hover:bg-white/10 transition-colors">
                <Mail className="size-4" />
              </a>
              <a aria-label="GitHub" href="https://github.com/" target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center size-8 rounded-lg glass hover:bg-white/10 transition-colors">
                <Github className="size-4" />
              </a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/" target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center size-8 rounded-lg glass hover:bg-white/10 transition-colors">
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="md:text-right text-xs text-muted-foreground self-end">
          © {new Date().getFullYear()} VivaMind AI. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
