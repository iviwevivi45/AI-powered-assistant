import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
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
import { summarizeNotes } from "@/lib/ai.functions";
import { useHistory } from "@/hooks/use-history";

export const Route = createFileRoute("/summarize")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — Workmate AI" }] }),
  component: SummarizePage,
});

function SummarizePage() {
  const fn = useServerFn(summarizeNotes);
  const { add } = useHistory();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handle = async () => {
    if (!notes.trim()) return toast.error("Paste your meeting notes first.");
    setLoading(true); setResult("");
    try {
      const res = await fn({ data: { notes } });
      setResult(res.text);
      add({ tool: "summarize", title: "Meeting summary", preview: notes.slice(0, 120) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolPageHeader icon={FileText} title="Meeting Notes Summarizer" description="Paste raw notes — get decisions, action items, and deadlines." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Meeting notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Paste notes</Label>
                <Textarea rows={12} placeholder="Paste your raw meeting notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button onClick={handle} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Summarizing…</> : "Summarize"}
              </Button>
            </CardContent>
          </Card>
          {result && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Summary</CardTitle>
                <CopyButton text={result} />
              </CardHeader>
              <CardContent><Markdown>{result}</Markdown></CardContent>
            </Card>
          )}
          <AiDisclaimer />
        </div>
        <div className="lg:h-[600px]"><HistoryPanel filter="summarize" /></div>
      </div>
    </div>
  );
}
