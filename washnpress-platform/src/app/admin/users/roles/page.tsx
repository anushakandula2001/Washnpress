"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type Role = { id: string; name: string };

type UserRow = {
  id: string;
  phone: string;
  full_name: string;
  status: string;
  roles: string[];
};

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/roles", { credentials: "same-origin" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed");
        setRoles((data.roles as Role[]) ?? []);
        setUsers((data.users as UserRow[]) ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Roles & Permissions"
      subtitle={`${roles.length} roles · ${users.length} users`}
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
            <CardDescription>Available platform roles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <Badge key={r.id} variant="secondary">{r.name}</Badge>
            ))}
            {roles.length === 0 && <p className="text-sm text-muted-foreground">No roles defined.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>Users and their assigned roles</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60">
                    <td className="py-2 font-medium">{u.full_name}</td>
                    <td>+91 {u.phone}</td>
                    <td>
                      <Badge variant={u.status === "active" ? "success" : "secondary"}>{u.status}</Badge>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(u.roles) ? u.roles : []).map((role) => (
                          <Badge key={role} variant="secondary">{role}</Badge>
                        ))}
                        {(!u.roles || u.roles.length === 0) && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="py-4 text-sm text-muted-foreground">No users found.</p>}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
