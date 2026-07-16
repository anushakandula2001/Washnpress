import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KanbanBoard({
  columns,
}: {
  columns: Array<{ title: string; items: string[] }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Processing Kanban</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-5">
          {columns.map((col) => (
            <section key={col.title} className="rounded-lg border border-border bg-muted/30 p-3">
              <h4 className="mb-2 text-sm font-semibold">{col.title}</h4>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <article key={item} className="rounded-md border border-border bg-card px-2 py-2 text-xs shadow-sm">
                    {item}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
