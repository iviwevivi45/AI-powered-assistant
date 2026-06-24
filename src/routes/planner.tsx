import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToolPageHeader } from "@/components/tool-page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { HistoryPanel } from "@/components/history-panel";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import { planTasks } from "@/lib/ai.functions";
import { useHistory } from "@/hooks/use-history";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Task Planner — Workmate AI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const { add } = useHistory();
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handle = async () => {
    if (!tasks.trim()) return toast.error("Enter your tasks first.");
    setLoading(true); setResult("");
    try {
      const res = await fn({ data: { tasks, hours } });
      setResult(res.text);
      add({ tool: "planner", title: `Daily plan (${hours}h)`, preview: tasks.slice(0, 120) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolPageHeader icon={CalendarClock} title="AI Task Planner" description="Prioritize tasks and build a realistic daily schedule." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Your day</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 max-w-[180px]">
                <Label>Available hours</Label>
                <Input type="number" min={0.5} max={24} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tasks (one per line)</Label>
                <Textarea rows={8} placeholder={"Finish Q4 proposal (due tomorrow)\nReply to client emails\nReview team PRs\nGym"} value={tasks} onChange={(e) => setTasks(e.target.value)} />
              </div>
              <Button onClick={handle} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Planning…</> : "Build my plan"}
              </Button>
            </CardContent>
          </Card>
          {result && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Your optimized day</CardTitle>
                <CopyButton text={result} />
              </CardHeader>
              <CardContent><Markdown>{result}</Markdown></CardContent>
            </Card>
          )}
          <AiDisclaimer />
        </div>
        <div className="lg:h-[600px]"><HistoryPanel filter="planner" /></div>
      </div>
    </div>
  );
}
