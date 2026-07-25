"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Lock, User, Shield, Building2, Save, RefreshCw, Mail, Phone, Activity } from "lucide-react";

type Profile = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_joined: string;
  operator_id: string;
  operator_code: string;
  status: string;
  designation: string;
  reporting_manager: string;
  role: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    order_alerts: boolean;
    support_alerts: boolean;
    delivery_alerts: boolean;
    pickup_alerts: boolean;
  };
};

type Society = {
  id: string;
  name: string;
  address_line_1: string;
  city: string;
  status: string;
  total_residents: string;
  today_orders: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  
  const [phone, setPhone] = useState("");
  const [notifs, setNotifs] = useState<Profile["notification_preferences"] | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operations/settings/profile", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");
      
      setProfile(data.profile);
      setSocieties(data.assignedSocieties);
      
      setPhone(data.profile.phone || "");
      setNotifs(data.profile.notification_preferences);
    } catch (err) {
      console.error(err);
      toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/operations/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, notification_preferences: notifs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update settings");
      
      toast("Profile updated successfully.", "success");
      await fetchProfile();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error saving", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNotifToggle = (key: keyof Profile["notification_preferences"]) => {
    if (!notifs) return;
    setNotifs({ ...notifs, [key]: !notifs[key] });
  };

  const [activeTab, setActiveTab] = useState("profile");

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Operations Settings"
      subtitle="Manage your profile, security, and preferences"
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary/40" />
          Loading profile...
        </div>
      ) : !profile ? (
        <div className="py-20 text-center text-destructive">Failed to load profile data.</div>
      ) : (
        <div className="max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="profile"><User className="h-4 w-4 mr-2 hidden sm:inline" /> Profile</TabsTrigger>
              <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2 hidden sm:inline" /> Security</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2 hidden sm:inline" /> Notifications</TabsTrigger>
              <TabsTrigger value="societies"><Building2 className="h-4 w-4 mr-2 hidden sm:inline" /> Societies</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>View and manage your employee profile details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/20">
                      {profile.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{profile.full_name}</h3>
                      <p className="text-muted-foreground">{profile.designation}</p>
                      <Badge variant={profile.status === "active" ? "success" : "secondary"} className="mt-2">
                        {profile.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee Code</label>
                      <div className="font-medium">{profile.operator_code || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Role</label>
                      <div className="font-medium capitalize">{profile.role}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Joined</label>
                      <div className="font-medium">{new Date(profile.date_joined).toLocaleDateString()}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporting Manager</label>
                      <div className="font-medium">{profile.reporting_manager}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <div className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" /> {profile.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number (Editable)</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground absolute ml-3" />
                        <Input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="pl-9 h-9" 
                          placeholder="+91..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} disabled={saving} className="gap-2 shadow">
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and active sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 max-w-md">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <Button variant="outline" className="w-full">Update Password</Button>
                  </div>
                  
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Active Sessions</h3>
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">Mac OS Safari - Current Session</p>
                          <p className="text-xs text-muted-foreground">Mumbai, India • IP: 103.24.xx.xx</p>
                        </div>
                      </div>
                      <Badge variant="success">Active Now</Badge>
                    </div>
                    <Button variant="ghost" className="text-destructive w-full justify-start hover:text-destructive hover:bg-destructive/10">
                      Sign out of all other sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how and when you want to be alerted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {notifs && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition">
                          <span className="font-medium text-sm">Email Alerts</span>
                          <input type="checkbox" checked={notifs.email} onChange={() => handleNotifToggle('email')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition">
                          <span className="font-medium text-sm">SMS Alerts</span>
                          <input type="checkbox" checked={notifs.sms} onChange={() => handleNotifToggle('sms')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition">
                          <span className="font-medium text-sm">Push Notifications</span>
                          <input type="checkbox" checked={notifs.push} onChange={() => handleNotifToggle('push')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-semibold mb-4">Event Subscriptions</h3>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div>
                            <p className="font-medium text-sm">Order Alerts</p>
                            <p className="text-xs text-muted-foreground">Get notified when new orders are placed in your assigned societies.</p>
                          </div>
                          <input type="checkbox" checked={notifs.order_alerts} onChange={() => handleNotifToggle('order_alerts')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div>
                            <p className="font-medium text-sm">Support Alerts</p>
                            <p className="text-xs text-muted-foreground">Get notified about new tickets or escalations.</p>
                          </div>
                          <input type="checkbox" checked={notifs.support_alerts} onChange={() => handleNotifToggle('support_alerts')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div>
                            <p className="font-medium text-sm">Delivery Alerts</p>
                            <p className="text-xs text-muted-foreground">Alerts for delayed deliveries or driver issues.</p>
                          </div>
                          <input type="checkbox" checked={notifs.delivery_alerts} onChange={() => handleNotifToggle('delivery_alerts')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div>
                            <p className="font-medium text-sm">Pickup Alerts</p>
                            <p className="text-xs text-muted-foreground">Alerts for missed or delayed pickups.</p>
                          </div>
                          <input type="checkbox" checked={notifs.pickup_alerts} onChange={() => handleNotifToggle('pickup_alerts')} className="h-4 w-4 rounded border-gray-300" />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2 shadow">
                          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Preferences
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="societies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Societies</CardTitle>
                  <CardDescription>Societies in your operational jurisdiction.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-semibold">Society Details</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Residents</TableHead>
                          <TableHead className="font-semibold text-center">Today's Orders</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {societies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                              No societies assigned to you yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          societies.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-muted-foreground">{s.address_line_1}, {s.city}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={s.status === "Completed" ? "success" : "secondary"}>
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">{s.total_residents}</TableCell>
                              <TableCell className="text-center font-medium">{s.today_orders}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PortalShell>
  );
}
