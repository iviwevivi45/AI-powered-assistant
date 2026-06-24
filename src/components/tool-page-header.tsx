import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ToolPageHeader({
  icon: Icon, title, description,
}: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <Card className="border-border bg-[image:var(--gradient-subtle)]">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="hidden" />
    </Card>
  );
}
