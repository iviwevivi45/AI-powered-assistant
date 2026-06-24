import { useHistory } from "@/hooks/use-history";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2 } from "lucide-react";

const TOOL_LABEL: Record<string, string> = {
  email: "Email",
  summarize: "Summary",
  planner: "Plan",
  research: "Research",
  chat: "Chat",
};

export function HistoryPanel({ filter }: { filter?: string }) {
  const { items, clear } = useHistory();
  const filtered = filter ? items.filter((i) => i.tool === filter) : items;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Recent activity</h3>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} className="h-7 px-2">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No history yet. Your recent generations will appear here.
            </p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-primary font-medium">
                    {TOOL_LABEL[item.tool] ?? item.tool}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium line-clamp-1">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.preview}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
