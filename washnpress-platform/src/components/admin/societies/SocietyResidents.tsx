"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import type { SocietyResident } from "./types";

export function SocietyResidents({ residents, societyId }: { residents: SocietyResident[]; societyId: string }) {
  if (residents.length === 0) {
    return <EmptyState title="No residents" description="Residents will appear here once they register at this society." />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Residents ({residents.length})</CardTitle>
        <Link href={`/admin/residents?societyId=${societyId}`} className="text-sm text-primary no-underline hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Tower / Flat</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id} className="border-b border-border/60 hover:bg-muted/30">
                <td className="px-4 py-2 font-mono text-xs">{r.resident_code}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/residents/${r.id}`} className="font-medium text-primary no-underline hover:underline">
                    {r.full_name}
                  </Link>
                </td>
                <td className="px-4 py-2">+91 {r.phone}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.tower_block} {r.unit_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
