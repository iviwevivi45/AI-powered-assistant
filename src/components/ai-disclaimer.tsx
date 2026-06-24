import { AlertTriangle } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground ${className}`}>
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
      <p>
        AI-generated content may be inaccurate. Review carefully before sending or acting on it,
        and verify any facts that matter for business decisions.
      </p>
    </div>
  );
}
