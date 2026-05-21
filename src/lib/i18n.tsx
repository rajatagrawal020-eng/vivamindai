import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, { en: string; hi: string }>;

export const dict: Dict = {
  "nav.features": { en: "Features", hi: "विशेषताएँ" },
  "nav.categories": { en: "Categories", hi: "श्रेणियाँ" },
  "nav.how": { en: "How it works", hi: "कैसे काम करता है" },
  "nav.pricing": { en: "Pricing", hi: "मूल्य" },
  "nav.faq": { en: "FAQ", hi: "सवाल" },
  "nav.login": { en: "Log in", hi: "लॉग इन" },
  "nav.signup": { en: "Get started", hi: "शुरू करें" },
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "nav.logout": { en: "Sign out", hi: "साइन आउट" },

  "hero.badge": { en: "AI-powered viva preparation", hi: "AI-संचालित वाइवा तैयारी" },
  "hero.title1": { en: "Prepare smarter with", hi: "AI के साथ" },
  "hero.title2": { en: "AI-powered viva practice", hi: "स्मार्ट वाइवा तैयारी करें" },
  "hero.sub": {
    en: "Generate examiner-grade questions, answers, and rapid-fire rounds for any subject — in English, Hindi, or Hinglish.",
    hi: "किसी भी विषय के लिए परीक्षक-स्तर के प्रश्न, उत्तर और रैपिड-फायर राउंड जनरेट करें — अंग्रेज़ी, हिंदी या हिंग्लिश में।",
  },
  "hero.cta": { en: "Start practicing free", hi: "मुफ़्त में शुरू करें" },
  "hero.cta2": { en: "See how it works", hi: "कैसे काम करता है देखें" },
  "hero.trust": { en: "Trusted by students at", hi: "इन संस्थानों के छात्रों द्वारा भरोसेमंद" },

  "features.kicker": { en: "Why VivaMind", hi: "क्यों VivaMind" },
  "features.title": { en: "Everything you need to ace your viva", hi: "अपने वाइवा में सफल होने के लिए सब कुछ" },

  "feat.1.t": { en: "AI Viva Generator", hi: "AI वाइवा जनरेटर" },
  "feat.1.d": { en: "Pick a subject, topic, and difficulty. Get examiner-style questions with model answers in seconds.", hi: "विषय, टॉपिक और कठिनाई चुनें। सेकंड में परीक्षक-शैली के प्रश्न और उत्तर पाएं।" },
  "feat.2.t": { en: "Rapid-Fire Mode", hi: "रैपिड-फायर मोड" },
  "feat.2.d": { en: "Mock interview rounds with timed questions and instant scoring on your answers.", hi: "टाइमर वाले प्रश्नों के साथ मॉक इंटरव्यू और तुरंत स्कोरिंग।" },
  "feat.3.t": { en: "Hindi · English · Hinglish", hi: "हिंदी · अंग्रेज़ी · हिंग्लिश" },
  "feat.3.d": { en: "Explanations in the language you think in. Switch anytime.", hi: "जिस भाषा में आप सोचते हैं उसी में स्पष्टीकरण। कभी भी बदलें।" },
  "feat.4.t": { en: "Notes & PDF Analysis", hi: "नोट्स और PDF विश्लेषण" },
  "feat.4.d": { en: "Upload notes or slides. Get summaries, MCQs, and predicted viva questions.", hi: "नोट्स या स्लाइड अपलोड करें। सारांश, MCQs और संभावित प्रश्न पाएं।" },
  "feat.5.t": { en: "Saved Sessions", hi: "सहेजे गए सत्र" },
  "feat.5.d": { en: "Your history, bookmarks, and revision sets — always one click away.", hi: "आपका इतिहास, बुकमार्क और रिवीज़न सेट — एक क्लिक दूर।" },
  "feat.6.t": { en: "Examiner-Grade Quality", hi: "परीक्षक-स्तर की गुणवत्ता" },
  "feat.6.d": { en: "Tuned prompts trained on real viva patterns from engineering, medical, UPSC and more.", hi: "इंजीनियरिंग, मेडिकल, UPSC आदि के वास्तविक वाइवा पैटर्न पर ट्यून किए गए प्रॉम्प्ट्स।" },

  "cats.kicker": { en: "Built for every learner", hi: "हर सीखने वाले के लिए" },
  "cats.title": { en: "Pick your category", hi: "अपनी श्रेणी चुनें" },
  "cats.sub": { en: "Specialized question banks and prompts for each track.", hi: "प्रत्येक ट्रैक के लिए विशेष प्रश्न बैंक।" },

  "cat.eng": { en: "Engineering", hi: "इंजीनियरिंग" },
  "cat.med": { en: "Medical", hi: "मेडिकल" },
  "cat.upsc": { en: "UPSC / Civil Services", hi: "UPSC / सिविल सेवा" },
  "cat.com": { en: "Commerce", hi: "वाणिज्य" },
  "cat.school": { en: "School Studies", hi: "स्कूल अध्ययन" },
  "cat.code": { en: "Coding Interviews", hi: "कोडिंग इंटरव्यू" },
  "cat.place": { en: "Placement Prep", hi: "प्लेसमेंट तैयारी" },
  "cat.prac": { en: "Practical Viva", hi: "प्रैक्टिकल वाइवा" },
  "cat.lab": { en: "Lab Experiments", hi: "लैब प्रयोग" },

  "how.kicker": { en: "How it works", hi: "कैसे काम करता है" },
  "how.title": { en: "From topic to viva-ready in three steps", hi: "तीन चरणों में वाइवा-तैयार" },
  "how.1.t": { en: "Pick category & topic", hi: "श्रेणी और टॉपिक चुनें" },
  "how.1.d": { en: "Choose your stream, subject, topic and difficulty.", hi: "अपनी स्ट्रीम, विषय, टॉपिक और कठिनाई चुनें।" },
  "how.2.t": { en: "AI generates questions", hi: "AI प्रश्न जनरेट करता है" },
  "how.2.d": { en: "Examiner-grade Qs with concise + detailed answers.", hi: "परीक्षक-स्तर के प्रश्न और विस्तृत उत्तर।" },
  "how.3.t": { en: "Practice & track", hi: "अभ्यास और ट्रैक करें" },
  "how.3.d": { en: "Save sessions, bookmark questions, build streaks.", hi: "सत्र सहेजें, प्रश्न बुकमार्क करें, स्ट्रीक बनाएं।" },

  "price.kicker": { en: "Pricing", hi: "मूल्य निर्धारण" },
  "price.title": { en: "Simple plans that scale with you", hi: "सरल योजनाएं जो आपके साथ बढ़ती हैं" },
  "price.free.t": { en: "Free", hi: "मुफ़्त" },
  "price.free.p": { en: "₹0", hi: "₹0" },
  "price.pro.t": { en: "Pro", hi: "प्रो" },
  "price.pro.p": { en: "₹49/mo", hi: "₹49/माह" },
  "price.cta": { en: "Get started", hi: "शुरू करें" },
  "price.popular": { en: "Most popular", hi: "सबसे लोकप्रिय" },

  "faq.kicker": { en: "FAQ", hi: "सवाल-जवाब" },
  "faq.title": { en: "Questions, answered", hi: "जवाब मिल गए" },

  "footer.tag": { en: "AI viva practice for students who actually care.", hi: "गंभीर छात्रों के लिए AI वाइवा अभ्यास।" },
  "footer.rights": { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।" },

  "auth.login.title": { en: "Welcome back", hi: "वापसी पर स्वागत है" },
  "auth.login.sub": { en: "Sign in to continue your prep.", hi: "अपनी तैयारी जारी रखने के लिए साइन इन करें।" },
  "auth.signup.title": { en: "Create your account", hi: "अपना खाता बनाएं" },
  "auth.signup.sub": { en: "Free forever for basic practice.", hi: "बेसिक अभ्यास के लिए हमेशा मुफ़्त।" },
  "auth.email": { en: "Email", hi: "ईमेल" },
  "auth.password": { en: "Password", hi: "पासवर्ड" },
  "auth.name": { en: "Full name", hi: "पूरा नाम" },
  "auth.google": { en: "Continue with Google", hi: "Google से जारी रखें" },
  "auth.or": { en: "or", hi: "या" },
  "auth.have": { en: "Already have an account?", hi: "पहले से खाता है?" },
  "auth.no": { en: "Don't have an account?", hi: "खाता नहीं है?" },

  "dash.title": { en: "Your dashboard", hi: "आपका डैशबोर्ड" },
  "dash.gen.title": { en: "Generate viva questions", hi: "वाइवा प्रश्न जनरेट करें" },
  "dash.category": { en: "Category", hi: "श्रेणी" },
  "dash.subject": { en: "Subject", hi: "विषय" },
  "dash.topic": { en: "Topic", hi: "टॉपिक" },
  "dash.difficulty": { en: "Difficulty", hi: "कठिनाई" },
  "dash.lang": { en: "Answer language", hi: "उत्तर की भाषा" },
  "dash.generate": { en: "Generate", hi: "जनरेट करें" },
  "dash.generating": { en: "Generating...", hi: "जनरेट हो रहा है..." },
  "dash.recent": { en: "Recent sessions", hi: "हालिया सत्र" },
  "dash.empty": { en: "No sessions yet. Generate your first set!", hi: "अभी तक कोई सत्र नहीं। अपना पहला सेट जनरेट करें!" },
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; }

const I18nCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("vm-lang") as Lang | null;
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("vm-lang", l);
  };

  const t = (k: string) => dict[k]?.[lang] ?? k;

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
