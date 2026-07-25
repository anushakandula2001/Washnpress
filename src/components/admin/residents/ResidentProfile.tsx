"use client";

import { StatusBadge } from "./StatusBadge";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  );
}

export function ResidentProfile({
  data,
  showAddresses,
}: {
  data: Record<string, unknown>;
  showAddresses?: boolean;
}) {
  const r = data.resident as Record<string, unknown>;

  if (showAddresses) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4">
          <h4 className="mb-2 font-medium">Pickup Address</h4>
          <p className="text-sm text-muted-foreground">
            {String(r.society_address ?? r.society_name)}, {String(r.society_city)}, {String(r.society_state)} {String(r.society_pincode ?? "")}
          </p>
          <p className="mt-1 text-sm">Tower {String(r.tower_name ?? r.tower_block ?? "—")}, Flat {String(r.flat_number ?? r.unit_number ?? "—")}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <h4 className="mb-2 font-medium">Delivery Address</h4>
          <p className="text-sm text-muted-foreground">Same as pickup (default)</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(String(r.society_address ?? r.society_name))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <Field label="Resident ID" value={String(r.resident_code ?? r.id)} />
      <Field label="Full Name" value={String(r.full_name ?? "—")} />
      <Field label="Phone" value={`+91 ${String(r.phone)}`} />
      <Field label="Email" value={String(r.email ?? "—")} />
      <Field label="DOB" value={r.date_of_birth ? new Date(String(r.date_of_birth)).toLocaleDateString() : "—"} />
      <Field label="Gender" value={String(r.gender ?? "—")} />
      <Field label="Society" value={String(r.society_name)} />
      <Field label="Tower" value={String(r.tower_name ?? r.tower_block ?? "—")} />
      <Field label="Flat" value={String(r.flat_number ?? r.unit_number ?? "—")} />
      <Field label="Emergency Contact" value={String(r.alternate_contact ?? "—")} />
      <Field label="Status" value={<StatusBadge status={String(r.user_status)} />} />
      <Field label="Wallet" value={`₹${Number(r.wallet_balance ?? 0).toLocaleString("en-IN")}`} />
      <Field label="Last Login" value={r.last_login_at ? new Date(String(r.last_login_at)).toLocaleString() : "—"} />
    </div>
  );
}
