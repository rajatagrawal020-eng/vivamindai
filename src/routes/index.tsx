import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Zap, Languages, FileText, Bookmark, ShieldCheck, Cpu, Stethoscope, Landmark, Calculator, GraduationCap, Code2, Briefcase, FlaskConical, Microscope, Sparkles, ArrowRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Navbar, Footer } from "@/components/site/Chrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VivaMind AI — AI-powered viva & interview practice" },
      { name: "description", content: "Generate examiner-grade viva questions, rapid-fire mock interviews and bilingual (English/Hindi) explanations for engineering, medical, UPSC, commerce and coding interviews." },
      { property: "og:title", content: "VivaMind AI — Prepare smarter with AI viva practice" },
      { property: "og:description", content: "AI viva questions, rapid-fire interviews and bilingual explanations." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const { isPremium, loading } = useAuth();

  const features = [
    { icon: Brain, k: "feat.1" }, { icon: Zap, k: "feat.2" }, { icon: Languages, k: "feat.3" },
    { icon: FileText, k: "feat.4" }, { icon: Bookmark, k: "feat.5" }, { icon: ShieldCheck, k: "feat.6" },
  ];
  const cats = [
    { i: Cpu, k: "cat.eng" }, { i: Stethoscope, k: "cat.med" }, { i: Landmark, k: "cat.upsc" },
    { i: Calculator, k: "cat.com" }, { i: GraduationCap, k: "cat.school" }, { i: Code2, k: "cat.code" },
    { i: Briefcase, k: "cat.place" }, { i: FlaskConical, k: "cat.prac" }, { i: Microscope, k: "cat.lab" },
  ];
  const steps = [{ k: "how.1" }, { k: "how.2" }, { k: "how.3" }];

  const faqs = [
    { q: "Is VivaMind AI free to start?", a: "Yes. The Free plan lets you generate viva questions across all categories with limited usage. Upgrade anytime for unlimited generations and rapid-fire interviews." },
    { q: "Which languages are supported?", a: "Full support for English and Hindi across the entire app — including UI, generated questions and explanations. Hinglish mode is available for explanations." },
    { q: "How does the AI generate questions?", a: "We use state-of-the-art AI models with examiner-tuned prompts trained on real viva patterns from engineering, medical, UPSC and other tracks." },
    { q: "Can I use it on mobile?", a: "Absolutely. The entire experience is fully responsive and works beautifully on phones, tablets and desktops." },
  ];

  const plans: { k: "free" | "pro"; popular: boolean; perks: string[]; amount: number }[] = [
    { k: "free", popular: false, amount: 0, perks: ["Limited AI generations", "Basic question bank", "EN + HI support"] },
    { k: "pro", popular: true, amount: 4900, perks: ["Unlimited generations", "Rapid-fire mode", "PDF upload & analysis", "Voice viva simulation", "Strictness levels (Easy/Medium/Hard)", "AI interview analytics", "Export to PDF", "Saved sessions", "Priority processing"] },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 pt-12 pb-16 sm:pt-20 sm:pb-28 lg:pt-32 lg:pb-40 text-center">

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" /> {t("hero.badge")}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            {t("hero.title1")} <br className="hidden sm:block" />
            <span className="text-gradient">{t("hero.title2")}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">{t("hero.sub")}</motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white glow hover:opacity-95">
              {t("hero.cta")} <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-white/10">{t("hero.cta2")}</a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("hero.trust")}</p>
            <div className="mt-4 flex flex-wrap justify-center items-center gap-x-10 gap-y-3 text-sm font-medium text-muted-foreground/70">
              <span>IIT</span><span>•</span><span>NIT</span><span>•</span><span>AIIMS</span><span>•</span><span>BITS</span><span>•</span><span>DU</span><span>•</span><span>VIT</span>
            </div>
          </motion.div>

          {/* Floating preview card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-20 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-6 text-left ring-brand">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="size-2 rounded-full bg-brand animate-pulse" /> AI Examiner · Engineering · Operating Systems</div>
              <p className="mt-4 text-base font-medium">Q. Explain the difference between paging and segmentation, and when would you prefer one over the other?</p>
              <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Paging divides memory into fixed-size blocks while segmentation uses variable-sized logical units...
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold">{t("features.kicker")}</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold">{t("features.title")}</h2>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors">
              <div className="size-11 rounded-xl bg-gradient-brand grid place-items-center"><f.icon className="size-5 text-white" /></div>
              <h3 className="mt-4 text-lg font-semibold">{t(`${f.k}.t`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`${f.k}.d`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold">{t("cats.kicker")}</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold">{t("cats.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("cats.sub")}</p>
        </div>
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {cats.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="group glass rounded-2xl p-6 cursor-pointer hover:bg-white/[0.07] transition-all hover:-translate-y-1">
              <div className="size-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand-2/20 grid place-items-center group-hover:from-brand/40 group-hover:to-brand-2/40 transition-colors">
                <c.i className="size-5 text-brand" />
              </div>
              <h3 className="mt-4 font-semibold">{t(c.k)}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold">{t("how.kicker")}</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold">{t("how.title")}</h2>
        </div>
        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 relative">
              <div className="text-6xl font-display font-bold text-gradient opacity-30">0{i + 1}</div>
              <h3 className="mt-2 text-xl font-semibold">{t(`${s.k}.t`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`${s.k}.d`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold">{t("price.kicker")}</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold">{t("price.title")}</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {plans.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`relative glass rounded-2xl p-8 ${p.popular ? "ring-brand" : ""}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-white text-xs font-semibold px-3 py-1 rounded-full">{t("price.popular")}</div>}
              <h3 className="text-lg font-semibold">{t(`price.${p.k}.t`)}</h3>
              <div className="mt-3 text-4xl font-bold font-display">{t(`price.${p.k}.p`)}</div>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {p.perks.map((x) => <li key={x} className="flex gap-2"><Check className="size-4 text-brand shrink-0 mt-0.5" />{x}</li>)}
              </ul>
              {p.amount === 0 ? (
                <Link to="/signup" className="mt-8 block text-center rounded-xl py-3 text-sm font-semibold glass hover:bg-white/10">{t("price.cta")}</Link>
              ) : loading ? (
                <div className="mt-8 flex h-[48px] items-center justify-center rounded-xl border border-border/60 text-sm text-muted-foreground">
                  Checking plan…
                </div>
              ) : isPremium ? (
                <div className="mt-8 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-center text-sm font-semibold text-brand">
                  Your Pro access is active
                </div>
              ) : (
                <RazorpayCheckoutButton
                  amount={p.amount}
                  description={`VivaMind Pro plan`}
                  label={`Pay ₹${(p.amount / 100).toFixed(0)}`}
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold ${p.popular ? "bg-gradient-brand text-white glow hover:opacity-95" : ""}`}
                />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold">{t("faq.kicker")}</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold">{t("faq.title")}</h2>
        </div>
        <div className="mt-12 glass rounded-2xl p-3">
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`} className="border-border/50 px-4">
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
