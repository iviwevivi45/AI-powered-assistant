import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, BookOpen, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryPanel } from "@/components/history-panel";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workmate AI" },
      { name: "description", content: "Your AI workplace productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { url: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft polished emails by tone and audience." },
  { url: "/summarize", icon: FileText, title: "Meeting Summarizer", desc: "Turn raw notes into decisions and action items." },
  { url: "/planner", icon: CalendarClock, title: "AI Task Planner", desc: "Prioritize tasks into an optimized daily schedule." },
  { url: "/research", icon: BookOpen, title: "Research Assistant", desc: "Summarize topics with insights and recommendations." },
  { url: "/chat", icon: MessageSquare, title: "Assistant Chat", desc: "Ask productivity questions in a live chat." },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-border bg-[image:var(--gradient-subtle)] p-6 sm:p-10">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Workmate AI
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
          Your AI-powered workplace assistant
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Generate emails, summarize meetings, plan your day, research topics, and chat with an
          assistant — all in one polished workspace.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((t) => (
            <Link key={t.url} to={t.url} className="group">
              <Card className="h-full transition-all hover:shadow-[var(--shadow-elegant)] hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="mt-3 text-base font-display">{t.title}</CardTitle>
                  <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
                <CardContent className="hidden" />
              </Card>
            </Link>
          ))}
        </div>

        <div className="lg:h-[520px]">
          <HistoryPanel />
        </div>
      </div>

      <AiDisclaimer />
    </div>
  );
}
