import { createServerFn } from "@tanstack/react-start";
import { generateText, type ModelMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

function mapGatewayError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("429")) throw new Error("Rate limit reached. Please wait a moment and try again.");
  if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits in your workspace billing settings.");
  throw new Error(msg || "AI request failed");
}

// 1. Email Generator
const EmailInput = z.object({
  instructions: z.string().min(1),
  tone: z.enum(["formal", "friendly", "persuasive", "concise"]),
  audience: z.enum(["client", "manager", "colleague", "team member"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a professional email writing assistant. Write a polished, ready-to-send email.

Rules:
- Output ONLY the email (subject line on first line as "Subject: ...", then a blank line, then the body).
- Match the requested tone exactly.
- Tailor language and formality to the audience.
- Be concise and actionable.
- If important details (names, dates, specifics) are missing, use clearly bracketed placeholders like [Recipient Name] rather than inventing facts.
- Do not add commentary, explanations, or markdown fences.`;

    const user = `Tone: ${data.tone}\nAudience: ${data.audience}\nInstructions: ${data.instructions}`;
    try {
      const { text } = await generateText({ model: getModel(), system, prompt: user });
      return { text };
    } catch (e) { mapGatewayError(e); }
  });

// 2. Meeting Notes Summarizer
const NotesInput = z.object({ notes: z.string().min(1) });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a meeting notes analyst. Read raw meeting notes and produce a structured summary.

Return STRICT markdown with these exact sections and headings, in this order:
## Summary
A 2-4 sentence concise summary.
## Key Discussion Points
- bullet list
## Decisions Made
- bullet list (or "None recorded")
## Action Items
- [Owner] — Task — Deadline (use "Unspecified" if missing; never invent owners or dates)
## Deadlines
- bullet list of explicit dates/timeframes
## Responsible Persons
- bullet list of names mentioned with their responsibilities

Be faithful to the source. If something is unclear, mark it "(unclear)". Do not fabricate details.`;
    try {
      const { text } = await generateText({ model: getModel(), system, prompt: data.notes });
      return { text };
    } catch (e) { mapGatewayError(e); }
  });

// 3. Task Planner
const PlannerInput = z.object({
  tasks: z.string().min(1),
  hours: z.number().min(0.5).max(24),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a productivity coach and scheduler. Build an optimized daily plan.

Return STRICT markdown:
## Prioritized Tasks
Numbered list with priority label (P1 urgent+important, P2 important, P3 urgent, P4 neither) and a one-line rationale.
## Daily Schedule
A table with columns: Time Block | Task | Duration | Notes. Fit within the user's available hours. Include short breaks. Use realistic time estimates.
## Productivity Tips
3-5 specific, actionable suggestions tailored to these tasks.

Be honest about uncertainty in time estimates. Do not overcommit the schedule.`;
    const prompt = `Available working hours today: ${data.hours}\nTasks:\n${data.tasks}`;
    try {
      const { text } = await generateText({ model: getModel(), system, prompt });
      return { text };
    } catch (e) { mapGatewayError(e); }
  });

// 4. Research Assistant
const ResearchInput = z.object({ topic: z.string().min(1) });

export const research = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a research analyst. Given a topic or pasted article, produce structured research output.

Return STRICT markdown with these sections:
## Executive Summary
3-5 sentences.
## Key Insights
- 5-7 bullet points
## Recommendations
- 3-5 actionable bullets
## Explain Like I'm New
A short plain-language explanation (4-6 sentences) for a non-expert.

Important: If the topic requires up-to-date facts you cannot verify, state your uncertainty explicitly (e.g. "As of my training data..."). Do not invent statistics, citations, or quotes.`;
    try {
      const { text } = await generateText({ model: getModel(), system, prompt: data.topic });
      return { text };
    } catch (e) { mapGatewayError(e); }
  });

// 5. Chat
const ChatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).min(1),
});

export const chat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an AI Workplace Productivity Assistant. Help professionals with productivity, time management, communication, meetings, prioritization, workflows, and workplace soft skills.

Guidelines:
- Be concise, practical, and actionable.
- Use short paragraphs and bullet points when helpful.
- If a question is outside productivity/workplace topics, gently redirect.
- State uncertainty when you're not sure. Never fabricate facts, statistics, or sources.
- Encourage the user to verify important decisions with their own judgment.`;
    const messages: ModelMessage[] = data.messages.map(m => ({ role: m.role, content: m.content }));
    try {
      const { text } = await generateText({ model: getModel(), system, messages });
      return { text };
    } catch (e) { mapGatewayError(e); }
  });
