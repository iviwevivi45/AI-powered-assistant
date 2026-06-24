import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolPageHeader } from "@/components/tool-page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { HistoryPanel } from "@/components/history-panel";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import { research } from "@/lib/ai.functions";
import { useHistory } from "@/hooks/use-history";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Workmate AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(research);
  const { add } = useHistory();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handle = async () => {
    if (!topic.trim()) return toast.error("Enter a topic or paste an article.");
    setLoading(true); setResult("");
    try {
      const res = await fn({ data: { topic } });
      setResult(res.text);
      add({ tool: "research", title: "Research brief", preview: topic.slice(0, 120) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to research");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolPageHeader icon={BookOpen} title="AI Research Assistant" description="Get a summary, insights, and a plain-language explainer." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Topic or article</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>What should we research?</Label>
                <Textarea rows={10} placeholder="Enter a topic (e.g. 'vector databases for RAG') or paste an article…" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
              <Button onClick={handle} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Researching…</> : "Research"}
              </Button>
            </CardContent>
          </Card>
          {result && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Research brief</CardTitle>
                <CopyButton text={result} />
              </CardHeader>
              <CardContent><Markdown>{result}</Markdown></CardContent>
            </Card>
          )}
          <AiDisclaimer />
        </div>
        <div className="lg:h-[600px]"><HistoryPanel filter="research" /></div>
      </div>
    </div>
  );
}
