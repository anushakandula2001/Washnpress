import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImpactBars({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number; unit?: string }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value.toLocaleString()} {item.unit ?? ""}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
