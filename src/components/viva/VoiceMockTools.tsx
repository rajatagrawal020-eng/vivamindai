import { useEffect, useRef, useState } from "react";
import { Volume2, Mic, Square, Timer } from "lucide-react";
import { toast } from "sonner";

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

function pickVoice(lang: "en" | "hi" | "hinglish"): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined") return undefined;
  const voices = window.speechSynthesis.getVoices();
  const want = lang === "hi" ? "hi" : "en";
  // Prefer Google / Microsoft natural voices
  const preferred = voices.find(
    (v) => v.lang.toLowerCase().startsWith(want) && /google|natural|neural|microsoft/i.test(v.name),
  );
  return preferred ?? voices.find((v) => v.lang.toLowerCase().startsWith(want)) ?? voices[0];
}

export function SpeakButton({ text, lang = "en" }: { text: string; lang?: "en" | "hi" | "hinglish" }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Warm voices list (some browsers need this event)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported");
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
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
  );
}

export function MicButton({
  onTranscript,
  lang = "en",
}: {
  onTranscript: (text: string) => void;
  lang?: "en" | "hi" | "hinglish";
}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SRInstance | null>(null);
  const baseRef = useRef<string>("");

  const stop = () => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  };

  useEffect(() => () => stop(), []);

  const start = () => {
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
    } catch {
      toast.error("Could not start microphone");
    }
  };

  return (
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
