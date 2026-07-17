import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoverageMap({
  points,
}: {
  points: Array<{ name: string; x: number; y: number; radius: number; status: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Society Coverage Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-72 overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_20%_20%,rgba(0,168,168,0.22),transparent_48%),radial-gradient(circle_at_80%_70%,rgba(0,229,204,0.25),transparent_45%),linear-gradient(135deg,rgba(0,77,77,0.08),transparent)]">
          {points.map((point) => (
            <div
              key={point.name}
              className="absolute"
              style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40 bg-primary/10"
                style={{ width: point.radius * 4, height: point.radius * 4 }}
              />
              <div className="relative z-10 rounded-full border border-primary bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow-lg">
                {point.name}
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground">{point.status}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
