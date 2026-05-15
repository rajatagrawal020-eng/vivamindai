import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway";

const inputSchema = z.object({
  category: z.string().min(1).max(80),
  subject: z.string().min(1).max(120),
  topic: z.string().min(1).max(160),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "examiner"]),
  language: z.enum(["en", "hi", "hinglish"]),
});

export type VivaQuestion = {
  q: string;
  short: string;
  detailed: string;
};

export const generateViva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI gateway not configured." };
    }

    const langInstr =
      data.language === "hi"
        ? "Write all questions and answers in clear Hindi (Devanagari)."
        : data.language === "hinglish"
        ? "Write in Hinglish (Hindi spoken in Roman script, mixed with English technical terms)."
        : "Write in clear, simple English.";

    const diffInstr = {
      beginner: "Keep questions foundational and clear.",
      intermediate: "Mix conceptual and applied questions.",
      advanced: "Use deep, application + reasoning questions.",
      examiner: "Act as a strict external examiner. Include tricky, follow-up and trap questions.",
    }[data.difficulty];

    const prompt = `Generate exactly 8 viva-style questions for:
Category: ${data.category}
Subject: ${data.subject}
Topic: ${data.topic}
Difficulty: ${data.difficulty} — ${diffInstr}
${langInstr}

Return ONLY valid minified JSON of this exact shape:
{"questions":[{"q":"...","short":"1-2 line answer","detailed":"4-6 line detailed explanation"}, ...]}
No markdown, no commentary. JSON only.`;

    try {
      const gateway = createLovableAiGatewayProvider(apiKey);
      const model = gateway("google/gemini-3-flash-preview");
      const { text } = await generateText({ model, prompt });

      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { ok: false as const, error: "AI returned invalid format." };
      const parsed = JSON.parse(jsonMatch[0]) as { questions: VivaQuestion[] };
      const questions = parsed.questions?.slice(0, 12) ?? [];
      if (!questions.length) return { ok: false as const, error: "No questions generated." };

      // Save session
      const { supabase, userId } = context;
      const { data: row, error } = await supabase
        .from("viva_sessions")
        .insert({
          user_id: userId,
          category: data.category,
          subject: data.subject,
          topic: data.topic,
          difficulty: data.difficulty,
          language: data.language,
          questions: questions as unknown as object,
        })
        .select("id")
        .single();
      if (error) console.error("[viva] save error", error);

      return { ok: true as const, sessionId: row?.id ?? null, questions };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[viva] gen error", msg);
      if (msg.includes("429")) return { ok: false as const, error: "Rate limit reached. Try again in a moment." };
      if (msg.includes("402")) return { ok: false as const, error: "AI credits exhausted. Add credits in workspace settings." };
      return { ok: false as const, error: "Could not generate questions. Please try again." };
    }
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("viva_sessions")
      .select("id, category, subject, topic, difficulty, language, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return { sessions: [] };
    return { sessions: data ?? [] };
  });
