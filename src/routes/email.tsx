import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolPageHeader } from "@/components/tool-page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { HistoryPanel } from "@/components/history-panel";
import { CopyButton } from "@/components/copy-button";
import { generateEmail } from "@/lib/ai.functions";
import { useHistory } from "@/hooks/use-history";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Email Generator — Workmate AI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const { add } = useHistory();
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "persuasive" | "concise">("formal");
  const [audience, setAudience] = useState<"client" | "manager" | "colleague" | "team member">("client");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handle = async () => {
    if (!instructions.trim()) return toast.error("Describe what the email should say.");
    setLoading(true); setResult("");
    try {
      const res = await fn({ data: { instructions, tone, audience } });
      setResult(res.text);
      add({ tool: "email", title: `${tone} email to ${audience}`, preview: instructions.slice(0, 120) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolPageHeader icon={Mail} title="Smart Email Generator" description="Generate professional emails tuned to your tone and audience." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Email brief</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Audience</Label>
                  <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="team member">Team member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>What should the email say?</Label>
                <Textarea
                  rows={6}
                  placeholder="e.g. Decline the meeting next Thursday because of a conflict, and propose Friday morning instead."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
              <Button onClick={handle} disabled={loading} className="w-full sm:w-auto">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : "Generate email"}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Draft</CardTitle>
                <CopyButton text={result} />
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{result}</pre>
              </CardContent>
            </Card>
          )}
          <AiDisclaimer />
        </div>
        <div className="lg:h-[600px]"><HistoryPanel filter="email" /></div>
      </div>
    </div>
  );
}
