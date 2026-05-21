import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, Mic, Square, Timer, Sparkles, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";

export function useIsPremium() {
  return useAuth().isPremium;
}

// Minimal types for the Web Speech API (not in lib.dom)
type SRResult = { 0: { transcript: string }; isFinal: boolean };
type SREvent = { resultIndex: number; results: ArrayLike<SRResult> };
type SRErrorEvent = { error: string };
type SRInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
};
type SRConstructor = new () => SRInstance;
declare global {
  interface Window {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  }
}

// ---------- Daily free-tier voice limit ----------
const DAILY_LIMIT = 3;

function todayKey() {
  const d = new Date();
  return `vm_voice_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readCount(): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(todayKey());
  return v ? parseInt(v, 10) || 0 : 0;
}

function writeCount(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(todayKey(), String(n));
  window.dispatchEvent(new CustomEvent("vm-voice-count"));
}

export function useDailyVoiceLimit() {
  const [count, setCount] = useState<number>(0);
  const premium = useIsPremium();
  useEffect(() => {
    setCount(readCount());
    const sync = () => setCount(readCount());
    window.addEventListener("vm-voice-count", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vm-voice-count", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const consume = useCallback(() => {
    if (premium) return 0;
    const next = readCount() + 1;
    writeCount(next);
    return next;
  }, [premium]);
  return {
    count: premium ? 0 : count,
    remaining: premium ? Infinity : Math.max(0, DAILY_LIMIT - count),
    blocked: premium ? false : count >= DAILY_LIMIT,
    consume,
    limit: DAILY_LIMIT,
  };
}

// ---------- Shared TTS helper (handles voice loading) ----------
function pickVoice(lang: "en" | "hi" | "hinglish"): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined") return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;

  if (lang === "hi") {
    const hi = voices.filter((v) => v.lang.toLowerCase().startsWith("hi"));
    return (
      hi.find((v) => /google/i.test(v.name)) ??
      hi.find((v) => /natural|neural|online/i.test(v.name)) ??
      hi[0] ??
      voices[0]
    );
  }

  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  // Tiered priority list — best (most natural) cloud voices first
  const tiers: Array<(v: SpeechSynthesisVoice) => boolean> = [
    // 1. Google US English (premium cloud voice on Chrome/Android)
    (v) => /^Google US English$/i.test(v.name),
    (v) => /google/i.test(v.name) && /en[-_]?us/i.test(v.lang),
    // 2. Microsoft Natural / Neural cloud voices (Aria, Jenny, Guy, Davis…)
    (v) => /microsoft/i.test(v.name) && /(natural|neural|online)/i.test(v.name),
    (v) => /(aria|jenny|guy|davis|emma|brian)/i.test(v.name) && /(natural|neural|online)/i.test(v.name),
    // 3. Apple premium / enhanced voices (Samantha, Ava, Allison, Evan)
    (v) => /(samantha|ava|allison|evan|nicky|tom)/i.test(v.name) && /(premium|enhanced)/i.test(v.name),
    (v) => /(samantha|ava|allison|evan)/i.test(v.name),
    // 4. Any other Google English voice
    (v) => /google/i.test(v.name),
    // 5. Any other Microsoft/Apple en-US voice
    (v) => /(microsoft|apple)/i.test(v.name) && /en[-_]?us/i.test(v.lang),
    // 6. Any en-US voice
    (v) => /en[-_]?us/i.test(v.lang),
  ];
  for (const match of tiers) {
    const found = en.find(match);
    if (found) return found;
  }
  return en[0] ?? voices[0];
}

async function waitForVoices(timeoutMs = 1500): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (window.speechSynthesis.getVoices().length > 0) return;
  await new Promise<void>((resolve) => {
    const t = setTimeout(resolve, timeoutMs);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(t);
      resolve();
    };
  });
}

export async function speakText(text: string, lang: "en" | "hi" | "hinglish" = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  await waitForVoices();
  synth.cancel();
  // mobile Safari needs a resume after gesture
  try { synth.resume(); } catch { /* noop */ }
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(lang);
  if (v) u.voice = v;
  u.lang = v?.lang ?? (lang === "hi" ? "hi-IN" : "en-US");
  u.rate = 0.95;
  u.pitch = 1;
  synth.speak(u);
}

// ---------- Paywall modal ----------
export function VoicePaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const goPay = () => {
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/#pricing";
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-brand/40 bg-gradient-to-br from-card/95 via-card/90 to-brand/10 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-white/10"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <div className="flex items-center gap-2 text-brand">
          <Sparkles className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Daily Free Limit</span>
        </div>
        <h3 className="mt-3 text-xl font-bold">Daily Free Voice Limit Reached!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve used your <span className="font-semibold text-foreground">{DAILY_LIMIT} free voice sessions</span> for today.
          Upgrade to <span className="font-semibold text-brand">Pro</span> for unlimited AI voice interviews,
          PDF uploads, and detailed reports.
        </p>
        <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">₹49</span>
            <span className="text-xs text-muted-foreground">/mo</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Unlimited AI voice interviews</li>
            <li>• PDF uploads & detailed reports</li>
            <li>• Priority Hinglish & हिंदी voices</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={goPay}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-white glow"
        >
          <Zap className="size-4" />
          Upgrade to Pro — ₹49
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl border border-border/60 py-2 text-xs text-muted-foreground hover:bg-white/[0.04]"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ---------- Speak button ----------
export function SpeakButton({ text, lang = "en" }: { text: string; lang?: "en" | "hi" | "hinglish" }) {
  const [speaking, setSpeaking] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const { blocked } = useDailyVoiceLimit();

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handle = async () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported");
      return;
    }
    if (blocked) { setPaywall(true); return; }
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    await waitForVoices();
    synth.cancel();
    try { synth.resume(); } catch { /* noop */ }
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.lang = v?.lang ?? (lang === "hi" ? "hi-IN" : "en-US");
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <>
      <button
        type="button"
        onClick={handle}
        className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-white/[0.04] ${
          speaking ? "bg-brand/10 text-brand border-brand/40" : ""
        }`}
        aria-label="Speak question"
      >
        <Volume2 className={`size-3.5 ${speaking ? "animate-pulse" : ""}`} />
        {speaking ? "Stop" : "Speak Question"}
      </button>
      <VoicePaywallModal open={paywall} onClose={() => setPaywall(false)} />
    </>
  );
}

// ---------- Mic button ----------
export function MicButton({
  onTranscript,
  lang = "en",
}: {
  onTranscript: (text: string) => void;
  lang?: "en" | "hi" | "hinglish";
}) {
  const [listening, setListening] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const recRef = useRef<SRInstance | null>(null);
  const baseRef = useRef<string>("");
  const { blocked, consume } = useDailyVoiceLimit();

  const stop = () => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  };

  useEffect(() => () => stop(), []);

  const start = () => {
    if (blocked) { setPaywall(true); return; }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Speech recognition not supported on this browser");
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "hi" ? "hi-IN" : "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    baseRef.current = "";
    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final) baseRef.current = (baseRef.current + " " + final).trim();
      onTranscript((baseRef.current + " " + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech") toast.error(`Mic: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      const used = consume();
      const left = DAILY_LIMIT - used;
      if (left > 0) toast.message(`Voice session ${used}/${DAILY_LIMIT} today`, { description: `${left} free session${left === 1 ? "" : "s"} left` });
    } catch {
      toast.error("Could not start microphone");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border transition-colors ${
          listening
            ? "bg-red-500/15 border-red-500/60 text-red-400"
            : "border-border/60 hover:bg-white/[0.04]"
        }`}
        aria-label={listening ? "Stop recording" : "Start recording"}
      >
        {listening ? (
          <>
            <span className="absolute inset-0 rounded-full ring-2 ring-red-500/60 animate-ping" aria-hidden />
            <Square className="size-3.5 fill-current" />
            <RecordingWave />
            Listening…
          </>
        ) : (
          <>
            <Mic className="size-3.5" />
            Start Speaking
          </>
        )}
      </button>
      <VoicePaywallModal open={paywall} onClose={() => setPaywall(false)} />
    </>
  );
}

function RecordingWave() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3 ml-1" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-red-400 rounded-full animate-pulse"
          style={{
            height: `${30 + ((i * 23) % 70)}%`,
            animationDelay: `${i * 120}ms`,
            animationDuration: "700ms",
          }}
        />
      ))}
    </span>
  );
}

export function QuestionTimer({ seconds = 45, resetKey }: { seconds?: number; resetKey: string | number }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, resetKey]);

  const pct = (left / seconds) * 100;
  const danger = left <= 10;

  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <Timer className={`size-3.5 ${danger ? "text-red-400" : "text-brand"}`} />
      <span className={`font-mono tabular-nums ${danger ? "text-red-400" : "text-muted-foreground"}`}>
        00:{left.toString().padStart(2, "0")}
      </span>
      <span className="hidden sm:block w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <span
          className={`block h-full transition-all duration-500 ${danger ? "bg-red-500" : "bg-gradient-brand"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
