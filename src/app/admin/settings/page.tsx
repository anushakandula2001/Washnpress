"use client";

import { readApiJson } from "@/frontend/api-client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  Mail,
  MessageSquare,
  BellRing,
  Megaphone,
  Loader2,
  Save,
} from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";
import { useToast } from "@/components/ui/toast";

const SETTING_KEYS = ["working_hours", "otp", "notifications"] as const;

interface NotifPrefs {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingNotifications: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,
  marketingNotifications: false,
};

function ToggleSwitch({
  checked,
  onChange,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const [texts, setTexts] = useState<Record<string, string>>({
    working_hours: "{}",
    otp: "{}",
    notifications: "{}",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Notification preferences state
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [prefsSaving, setPrefsSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings", { credentials: "same-origin" });
    const data = await readApiJson(res);
    if (!res.ok) throw new Error(data.message ?? "Failed");
    const settings = (data.settings as Record<string, unknown>) ?? {};
    setTexts({
      working_hours: JSON.stringify(settings.working_hours ?? {}, null, 2),
      otp: JSON.stringify(settings.otp ?? {}, null, 2),
      notifications: JSON.stringify(settings.notifications ?? {}, null, 2),
    });
  }, []);

  const loadPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notification-preferences", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await readApiJson(res);
        if (data.preferences) {
          setPrefs({ ...DEFAULT_PREFS, ...(data.preferences as Partial<NotifPrefs>) });
        }
      }
    } catch {
      // Use defaults on failure
    }
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
    void loadPrefs();
  }, [load, loadPrefs]);

  // Auto-scroll to section based on URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    const hash = window.location.hash;
    if (tab === "notifications" || hash === "#notifications") {
      setTimeout(() => notifRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } else if (hash === "#account") {
      setTimeout(() => accountRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [searchParams]);

  async function save(key: (typeof SETTING_KEYS)[number]) {
    setMsg(null);
    setError(null);
    setSaving(key);
    try {
      let value: unknown;
      try {
        value = JSON.parse(texts[key]);
      } catch {
        throw new Error(`Invalid JSON for ${key}`);
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.message ?? "Save failed");
      setMsg(`${key} saved.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  async function savePrefs() {
    setPrefsSaving(true);
    try {
      const res = await fetch("/api/admin/notification-preferences", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.message ?? "Save failed");
      toast("Notification preferences saved!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save preferences", "error");
    } finally {
      setPrefsSaving(false);
    }
  }

  const notifItems: { key: keyof NotifPrefs; label: string; description: string; icon: React.ElementType }[] = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive important updates and alerts via email",
      icon: Mail,
    },
    {
      key: "smsNotifications",
      label: "SMS Notifications",
      description: "Get time-sensitive alerts via text message",
      icon: MessageSquare,
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      description: "Receive browser push notifications when logged in",
      icon: BellRing,
    },
    {
      key: "marketingNotifications",
      label: "Marketing Notifications",
      description: "Newsletters, product updates, and platform announcements",
      icon: Megaphone,
    },
  ];

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="System Settings"
      subtitle="Platform configuration and notification preferences"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-8">
        {/* Account Section anchor */}
        <div id="account" ref={accountRef} className="scroll-mt-24 space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-primary" />
            Account Settings
          </h2>
          {SETTING_KEYS.map((key) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{key.replace(/_/g, " ")}</CardTitle>
                <CardDescription>Edit JSON and save with PUT /api/admin/settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                  value={texts[key]}
                  onChange={(e) => setTexts({ ...texts, [key]: e.target.value })}
                  aria-label={`${key} configuration JSON`}
                />
                <Button onClick={() => void save(key)} disabled={saving === key}>
                  {saving === key ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </span>
                  ) : (
                    "Save"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notification Preferences Section */}
        <div id="notifications" ref={notifRef} className="scroll-mt-24">
          <h2 className="mb-6 text-lg font-bold text-foreground flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-primary" />
            Notification Preferences
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Manage Your Notifications
              </CardTitle>
              <CardDescription>
                Control which notifications you receive as a Platform Administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {notifItems.map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <label
                        htmlFor={`notif-${key}`}
                        className="cursor-pointer text-sm font-medium text-foreground"
                      >
                        {label}
                      </label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id={`notif-${key}`}
                    checked={prefs[key]}
                    onChange={(val) => setPrefs((p) => ({ ...p, [key]: val }))}
                    disabled={prefsSaving}
                  />
                </div>
              ))}

              <div className="pt-5">
                <Button
                  onClick={() => void savePrefs()}
                  disabled={prefsSaving}
                  className="gap-2"
                >
                  {prefsSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}
