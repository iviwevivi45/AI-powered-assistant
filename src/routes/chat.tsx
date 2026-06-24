import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageHeader } from "@/components/tool-page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Markdown } from "@/components/markdown";
import { chat } from "@/lib/ai.functions";
import { useHistory } from "@/hooks/use-history";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Assistant Chat — Workmate AI" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I run a productive 1:1?",
  "Help me say no to a meeting request politely.",
  "How do I structure my deep work block?",
  "Tips for keeping inbox under control.",
];

function ChatPage() {
  const fn = useServerFn(chat);
  const { add } = useHistory();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => { taRef.current?.focus(); }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.text }]);
      add({ tool: "chat", title: trimmed.slice(0, 60), preview: res.text.slice(0, 120) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages(next); // keep user message
    } finally {
      setLoading(false);
      requestAnimationFrame(() => taRef.current?.focus());
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <ToolPageHeader icon={MessageSquare} title="Workplace Assistant Chat" description="Ask anything about productivity, workflows, or workplace communication." />

      <Card className="flex flex-col h-[calc(100vh-280px)] min-h-[420px] overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-md text-center pt-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">How can I help you today?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these to start:</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm hover:border-primary/40 hover:bg-accent/50 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  {m.role === "user" ? (
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 pt-0.5"><Markdown>{m.content}</Markdown></div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-2 pt-1.5 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card/50 p-3">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={taRef}
              rows={1}
              placeholder="Ask the assistant…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              className="resize-none min-h-[44px] max-h-32"
            />
            <Button onClick={() => send(input)} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <AiDisclaimer />
    </div>
  );
}
