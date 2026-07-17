"use client";

import Link from "next/link";
import { Check, CheckCircle2, Circle, Clock3, Sparkles, Truck, Shirt, Droplets, Zap, Footprints } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addonServices, type AddonService } from "@/lib/resident-data";
import { calculateAddonServiceTotal } from "@/lib/domain";

type PickupSlot = {
  id: string;
  date: string;
  startTime24h: string;
  endTime24h: string;
  window: string;
  remainingCapacity: number;
};

type PickupExperienceProps = {
  availableSlots: PickupSlot[];
  selectedSlot: PickupSlot | null;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  garments: number;
  onGarmentsChange: (value: number) => void;
  laundryTypes: string[];
  onLaundryTypeToggle: (value: string) => void;
  garmentCategories: string[];
  onGarmentCategoryToggle: (value: string) => void;
  selectedAddons: string[];
  onAddonsToggle: (value: string) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  contactNumber: string;
  loading: boolean;
  error: string;
  onConfirm: () => void;
  confirmed: boolean;
  bookingId?: string;
  onScheduleAnother: () => void;
  onTrackOrder: () => void;
  onViewOrders: () => void;
};

const laundryTypeOptions = ["Daily Wear", "Office Wear", "Kids Wear", "Bedsheets", "Curtains", "Blankets", "Sports Wear", "Delicates", "Others"];
const garmentCategoryOptions = ["Shirts", "T-Shirts", "Pants", "Jeans", "Sarees", "Kurtas", "Suits", "Blazers", "Jackets", "School Uniform", "Sweaters", "Others"];

const iconMap: Record<string, typeof Shirt> = {
  shirt: Shirt,
  footprints: Footprints,
  sparkles: Sparkles,
  zap: Zap,
  droplets: Droplets,
};

function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function formatSlotLabel(slot: PickupSlot) {
  const date = new Date(`${slot.date}T${slot.startTime24h}:00`);
  const day = date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  const estimatedArrival = new Date(date.getTime() + 30 * 60 * 1000);
  return {
    day,
    time: `${formatTime(slot.startTime24h)} – ${formatTime(slot.endTime24h)}`,
    arrival: `Around ${formatTime(`${estimatedArrival.getHours().toString().padStart(2, "0")}:${estimatedArrival.getMinutes().toString().padStart(2, "0")}`)}`,
  };
}

function formatCurrency(value: number) {
  return `₹${value}`;
}

function formatDateLong(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatSummaryTime(slot: PickupSlot) {
  return `${formatTime(slot.startTime24h)} – ${formatTime(slot.endTime24h)}`;
}

const timelineSteps = [
  { label: "Booking Created", completed: true },
  { label: "Pickup Scheduled", completed: true },
  { label: "Operator Assigned", completed: false },
  { label: "Pickup Started", completed: false },
  { label: "Laundry Processing", completed: false },
  { label: "Ironing", completed: false },
  { label: "Quality Check", completed: false },
  { label: "Out For Delivery", completed: false },
  { label: "Delivered", completed: false },
];

export function PickupExperience({
  availableSlots,
  selectedSlot,
  selectedSlotId,
  onSelectSlot,
  garments,
  onGarmentsChange,
  laundryTypes,
  onLaundryTypeToggle,
  garmentCategories,
  onGarmentCategoryToggle,
  selectedAddons,
  onAddonsToggle,
  instructions,
  onInstructionsChange,
  contactNumber,
  loading,
  error,
  onConfirm,
  confirmed,
  bookingId,
  onScheduleAnother,
  onTrackOrder,
  onViewOrders,
}: PickupExperienceProps) {
  const selectedAddonServices = addonServices.filter((addon) => selectedAddons.includes(addon.id));
  const addonTotal = calculateAddonServiceTotal(selectedAddonServices);
  const isFormReady = Boolean(selectedSlot) && garments > 0;

  if (confirmed) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-[0_20px_60px_-24px_rgba(16,185,129,0.35)]">
          <CardContent className="px-6 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="text-3xl font-semibold text-foreground">Pickup Scheduled Successfully</h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Your laundry pickup request has been created successfully and is waiting for assignment.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-semibold text-emerald-600">Booking ID</p>
                <p className="text-2xl font-bold tracking-wide">{bookingId ?? "WNP-0001"}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-border bg-white/70 p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Date</p>
                    <p className="mt-1 font-semibold">{selectedSlot ? formatDateLong(selectedSlot.date) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Time</p>
                    <p className="mt-1 font-semibold">{selectedSlot ? formatSummaryTime(selectedSlot) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Window</p>
                    <p className="mt-1 font-semibold">{selectedSlot?.window ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Garments</p>
                    <p className="mt-1 font-semibold">{garments}</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Laundry Type</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {laundryTypes.length > 0 ? laundryTypes.map((item) => <Badge key={item} variant="secondary">{item}</Badge>) : <span className="text-sm text-muted-foreground">No laundry type selected</span>}
                  </div>
                </div>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Selected Add-ons</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAddons.length > 0 ? selectedAddonServices.map((item) => <Badge key={item.id} variant="default">{item.name}</Badge>) : <span className="text-sm text-muted-foreground">No add-ons selected</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/90 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Estimated Pickup
                </div>
                <p className="mt-2 text-2xl font-semibold">{selectedSlot ? formatSummaryTime(selectedSlot) : "—"}</p>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span>Operator Status</span>
                    <span className="font-semibold text-amber-600">Waiting for Assignment</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span>Contact Number</span>
                    <span className="font-semibold text-foreground">{contactNumber}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span>Special Instructions</span>
                    <span className="max-w-[10rem] truncate font-semibold text-foreground">{instructions || "None"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-white/80 p-6 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={onTrackOrder}>Track Pickup</Button>
                <Button size="lg" variant="outline" onClick={onViewOrders}>View My Orders</Button>
                <Button size="lg" variant="outline" onClick={onScheduleAnother}>Schedule Another Pickup</Button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Order Timeline</h3>
              <div className="mt-4 space-y-3">
                {timelineSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3 rounded-2xl border border-border bg-white/80 p-3 shadow-sm">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.completed ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {step.completed ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{step.label}</p>
                      <p className="text-sm text-muted-foreground">{step.completed ? "Completed" : index === 2 ? "Pending" : "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr_0.95fr]">
        <Card className="border-border/70 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.3)]">
          <CardHeader>
            <CardTitle className="text-xl">Select Pickup Slot</CardTitle>
            <CardDescription>Choose your preferred pickup window for the next laundry cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableSlots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No pickup slots are currently available.
              </div>
            ) : (
              availableSlots.map((slot) => {
                const label = formatSlotLabel(slot);
                const selected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${selected ? "border-primary bg-primary/10 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.9)]" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{label.day}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{label.time}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{slot.window}</span>
                          <span className="text-xs text-muted-foreground">{slot.remainingCapacity} slots left</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{label.arrival}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                          {selected ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          {selected ? "Selected" : "Available"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.3)]">
          <CardHeader>
            <CardTitle className="text-xl">Laundry Order</CardTitle>
            <CardDescription>Create the complete order in one place and let us handle the rest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Number of Garments</p>
                  <p className="text-sm text-muted-foreground">Approximate weight: {garments || 0} garments ≈ {(garments * 0.4).toFixed(1)} kg</p>
                </div>
                <Input type="number" min="1" value={garments} onChange={(event) => onGarmentsChange(Number(event.target.value || 0))} className="w-24 text-center text-lg font-semibold" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Garments cannot be zero.</p>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Laundry Type</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {laundryTypeOptions.map((option) => {
                  const active = laundryTypes.includes(option);
                  return (
                    <button key={option} type="button" onClick={() => onLaundryTypeToggle(option)} className={`rounded-full border px-3 py-2 text-sm font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Shirt className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Garment Categories</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {garmentCategoryOptions.map((option) => {
                  const active = garmentCategories.includes(option);
                  return (
                    <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                      <input type="checkbox" checked={active} onChange={() => onGarmentCategoryToggle(option)} className="h-4 w-4 rounded border-border text-primary" />
                      {option}
                    </label>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Add-on Services</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {addonServices.map((addon) => {
                  const Icon = iconMap[addon.icon] ?? Sparkles;
                  const active = selectedAddons.includes(addon.id);
                  return (
                    <button key={addon.id} type="button" onClick={() => onAddonsToggle(addon.id)} className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.9)]" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {active ? <Badge variant="success">Selected</Badge> : null}
                      </div>
                      <p className="mt-3 font-semibold text-foreground">{addon.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{addon.description}</p>
                      <p className="mt-3 text-sm font-semibold text-primary">{formatCurrency(addon.priceInr)}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-border bg-background/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Selected Services</p>
                    <p className="text-sm text-muted-foreground">{selectedAddonServices.length > 0 ? selectedAddonServices.map((item) => item.name).join(", ") : "No add-ons selected"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total add-on cost</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(addonTotal)}</p>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.3)] xl:sticky xl:top-24 xl:h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Pickup Summary</CardTitle>
            <CardDescription>{selectedSlot ? "Everything looks ready to confirm." : "Select a slot and complete the order details to continue."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSlot ? (
              <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                No pickup slot selected yet. Choose a window to continue.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <p className="text-sm text-muted-foreground">Pickup Date</p>
                  <p className="mt-1 font-semibold text-foreground">{formatDateLong(selectedSlot.date)}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Pickup Time</p>
                  <p className="mt-1 font-semibold text-foreground">{formatSummaryTime(selectedSlot)}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                  <p className="mt-1 font-semibold text-foreground">{formatSlotLabel(selectedSlot).arrival}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Number of Garments</p>
                  <p className="mt-1 font-semibold text-foreground">{garments}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Laundry Type</p>
                  <p className="mt-1 font-semibold text-foreground">{laundryTypes.length > 0 ? laundryTypes.join(", ") : "Not selected"}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Selected Categories</p>
                  <p className="mt-1 font-semibold text-foreground">{garmentCategories.length > 0 ? garmentCategories.join(", ") : "None"}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Selected Add-ons</p>
                  <p className="mt-1 font-semibold text-foreground">{selectedAddonServices.length > 0 ? selectedAddonServices.map((item) => item.name).join(", ") : "None"}</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <label className="text-sm font-semibold text-foreground" htmlFor="contact-number">Contact Number</label>
              <Input id="contact-number" value={contactNumber} readOnly className="mt-2 bg-background" />
              <label className="mt-4 block text-sm font-semibold text-foreground" htmlFor="instructions">Special Pickup Instructions</label>
              <Textarea id="instructions" maxLength={250} value={instructions} onChange={(event) => onInstructionsChange(event.target.value)} placeholder="Ring bell twice, leave with security, call before arrival, collect from reception" className="mt-2 min-h-24" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Maximum 250 characters</span>
                <span>{instructions.length}/250</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subscription</span>
                <span className="font-semibold text-foreground">Included</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Add-ons</span>
                <span className="font-semibold text-foreground">{formatCurrency(addonTotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-base font-semibold text-foreground">Estimated Total</span>
                <span className="text-xl font-semibold text-primary">{formatCurrency(addonTotal)}</span>
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <Button className="w-full" size="lg" disabled={!isFormReady || loading} onClick={onConfirm}>
              {loading ? "Confirming Pickup..." : "Confirm Pickup"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
