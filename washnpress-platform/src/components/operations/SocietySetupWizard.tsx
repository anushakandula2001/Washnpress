"use client";

import { useEffect, useState } from "react";
import { Building2, Check, ChevronRight, Plus, Trash2, Edit3, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export type SocietyItem = {
  id: string;
  name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  pincode: string | null;
  status: string;
  building_count: number;
  last_updated: string;
};

export type FlatItem = {
  id: string;
  flat_number: string;
  status: string;
};

export type FloorItem = {
  id: string;
  floor_number: number;
  flats: FlatItem[];
};

export type BuildingItem = {
  id: string;
  name: string;
  floors: FloorItem[];
};

const STEPS = ["Select Society", "Add Building", "Preview Hierarchy", "Complete Setup"];

export function SocietySetupWizard({
  open,
  onOpenChange,
  initialSocietyId,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSocietyId?: string;
  onCompleted: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  // Societies
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [selectedSocietyId, setSelectedSocietyId] = useState(initialSocietyId || "");

  // Form step 2
  const [buildingName, setBuildingName] = useState("A Block");
  const [floorsCount, setFloorsCount] = useState(10);
  const [flatsPerFloor, setFlatsPerFloor] = useState(4);
  const [numberingFormat, setNumberingFormat] = useState<"101" | "A-101" | "A101" | "Custom Prefix">("101");
  const [customPrefix, setCustomPrefix] = useState("");
  const [generating, setGenerating] = useState(false);

  // Step 3 hierarchy preview & edits
  const [hierarchy, setHierarchy] = useState<BuildingItem[]>([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  // Inline edit state for Step 3
  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [tempBuildingName, setTempBuildingName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialSocietyId) {
      setSelectedSocietyId(initialSocietyId);
    }
    loadSocieties();
  }, [open, initialSocietyId]);

  useEffect(() => {
    if (selectedSocietyId && open) {
      loadMasterData(selectedSocietyId);
    }
  }, [selectedSocietyId, open]);

  async function loadSocieties() {
    setLoadingSocieties(true);
    try {
      const res = await fetch("/api/operations/societies/pending", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) {
        setSocieties(data.societies || []);
        if (!selectedSocietyId && data.societies?.length > 0) {
          setSelectedSocietyId(data.societies[0].id);
        }
      }
    } catch {
      toast("Failed to load societies", "error");
    } finally {
      setLoadingSocieties(false);
    }
  }

  async function loadMasterData(socId: string) {
    setLoadingHierarchy(true);
    try {
      const res = await fetch(`/api/operations/societies/${socId}/master-data`, { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) {
        setHierarchy(data.buildings || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHierarchy(false);
    }
  }

  const selectedSociety = societies.find((s) => s.id === selectedSocietyId);

  // Generate building structure
  async function handleGenerateBuilding() {
    if (!selectedSocietyId) {
      toast("Please select a society first", "error");
      return;
    }
    if (!buildingName.trim()) {
      toast("Please enter building name", "error");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/operations/societies/${selectedSocietyId}/buildings`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingName: buildingName.trim(),
          floors: Number(floorsCount),
          flatsPerFloor: Number(flatsPerFloor),
          numberingFormat,
          customPrefix: numberingFormat === "Custom Prefix" ? customPrefix : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Generation failed");

      toast(`Building '${buildingName}' generated with ${floorsCount} floors and ${flatsPerFloor} flats/floor`, "success");
      setHierarchy(data.data?.buildings || []);
      // Reset step 2 form for next building addition if desired
      const nextChar = String.fromCharCode(buildingName.toUpperCase().charCodeAt(0) + 1);
      if (nextChar >= "A" && nextChar <= "Z") {
        setBuildingName(`${nextChar} Block`);
      }
      setStep(2); // Advance to preview
    } catch (err) {
      toast(err instanceof Error ? err.message : "Generate failed", "error");
    } finally {
      setGenerating(false);
    }
  }

  // Hierarchy Editing functions
  function handleRenameBuilding(bId: string, newName: string) {
    if (!newName.trim()) return;
    setHierarchy((prev) =>
      prev.map((b) => (b.id === bId ? { ...b, name: newName.trim() } : b))
    );
    setEditingBuildingId(null);
  }

  function handleAddFloor(bId: string) {
    setHierarchy((prev) =>
      prev.map((b) => {
        if (b.id !== bId) return b;
        const nextFloorNum = b.floors.length + 1;
        const newFloor: FloorItem = {
          id: `flr-${bId}-${nextFloorNum}-${Date.now()}`,
          floor_number: nextFloorNum,
          flats: [
            { id: `flt-new-1-${Date.now()}`, flat_number: `${nextFloorNum}01`, status: "active" },
            { id: `flt-new-2-${Date.now()}`, flat_number: `${nextFloorNum}02`, status: "active" },
          ],
        };
        return { ...b, floors: [...b.floors, newFloor] };
      })
    );
  }

  function handleDeleteFloor(bId: string, floorId: string) {
    setHierarchy((prev) =>
      prev.map((b) => {
        if (b.id !== bId) return b;
        return { ...b, floors: b.floors.filter((f) => f.id !== floorId) };
      })
    );
  }

  function handleAddFlat(bId: string, floorId: string) {
    setHierarchy((prev) =>
      prev.map((b) => {
        if (b.id !== bId) return b;
        return {
          ...b,
          floors: b.floors.map((fl) => {
            if (fl.id !== floorId) return fl;
            const nextFlatIndex = fl.flats.length + 1;
            const flatNum = `${fl.floor_number}${String(nextFlatIndex).padStart(2, "0")}`;
            const newFlat: FlatItem = {
              id: `flt-${floorId}-${Date.now()}-${nextFlatIndex}`,
              flat_number: flatNum,
              status: "active",
            };
            return { ...fl, flats: [...fl.flats, newFlat] };
          }),
        };
      })
    );
  }

  function handleDeleteFlat(bId: string, floorId: string, flatId: string) {
    setHierarchy((prev) =>
      prev.map((b) => {
        if (b.id !== bId) return b;
        return {
          ...b,
          floors: b.floors.map((fl) => {
            if (fl.id !== floorId) return fl;
            return { ...fl, flats: fl.flats.filter((flat) => flat.id !== flatId) };
          }),
        };
      })
    );
  }

  function handleEditFlatNumber(bId: string, floorId: string, flatId: string, newNumber: string) {
    if (!newNumber.trim()) return;
    setHierarchy((prev) =>
      prev.map((b) => {
        if (b.id !== bId) return b;
        return {
          ...b,
          floors: b.floors.map((fl) => {
            if (fl.id !== floorId) return fl;
            return {
              ...fl,
              flats: fl.flats.map((flat) =>
                flat.id === flatId ? { ...flat, flat_number: newNumber.trim() } : flat
              ),
            };
          }),
        };
      })
    );
  }

  async function handleMarkComplete() {
    if (!selectedSocietyId) return;
    setSubmittingComplete(true);
    try {
      // First save edited hierarchy
      await fetch(`/api/operations/societies/${selectedSocietyId}/master-data`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildings: hierarchy }),
      });

      // Mark setup as complete
      const res = await fetch(`/api/operations/societies/${selectedSocietyId}/setup-complete`, {
        method: "PATCH",
        credentials: "same-origin",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark setup complete");

      toast(`Society '${selectedSociety?.name || "Society"}' setup complete!`, "success");
      onCompleted();
      onOpenChange(false);
      setStep(0);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Complete setup failed", "error");
    } finally {
      setSubmittingComplete(false);
    }
  }

  function resetForm() {
    setStep(0);
    setSelectedSocietyId(initialSocietyId || "");
    setBuildingName("A Block");
    setFloorsCount(10);
    setFlatsPerFloor(4);
    setNumberingFormat("101");
    setCustomPrefix("");
  }

  // Calculate summary counts
  const totalBuildings = hierarchy.length;
  const totalFloors = hierarchy.reduce((acc, b) => acc + b.floors.length, 0);
  const totalFlats = hierarchy.reduce(
    (acc, b) => acc + b.floors.reduce((flAcc, fl) => flAcc + fl.flats.length, 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" title="Society Setup Wizard">
        {/* Step Indicator Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          {STEPS.map((label, index) => {
            const isCurrent = index === step;
            const isCompleted = index < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`text-xs font-medium ${isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {label}
                </span>
                {index < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Select Society */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Step 1: Select Society</h3>
              <p className="text-sm text-muted-foreground">
                Choose a society assigned to Operations to configure buildings, floors, and flats.
              </p>
            </div>

            {loadingSocieties ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading assigned societies...</p>
            ) : societies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No assigned societies found</p>
                <p className="text-xs text-muted-foreground">Ask Admin to create societies and assign them for setup.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {societies.map((s) => {
                  const isSelected = s.id === selectedSocietyId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSocietyId(s.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{s.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {s.address_line_1 ? `${s.address_line_1}, ` : ""}{s.city}, {s.state}
                          </p>
                        </div>
                        <Badge
                          variant={
                            s.status === "Completed"
                              ? "success"
                              : s.status === "In Progress"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{s.building_count} building(s) configured</span>
                        {isSelected && <span className="font-semibold text-primary">Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(1)}
                disabled={!selectedSocietyId}
                className="gap-2"
              >
                Next: Add Building <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Add Building */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Step 2: Add Building for {selectedSociety?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Specify physical structure parameters to automatically generate floors and flat numbers.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(0)} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </div>

            <Card className="border-border/80 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Building Name *</label>
                  <Input
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="e.g. A Block, Tower 1, Orchid Block"
                    className="max-w-md"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Number of Floors *</label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={floorsCount}
                      onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value)))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Flats Per Floor *</label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={flatsPerFloor}
                      onChange={(e) => setFlatsPerFloor(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Flat Numbering Format *</label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { id: "101", label: "101", example: "101, 102... 1001" },
                      { id: "A-101", label: "A-101", example: "A-101, A-102... A-1001" },
                      { id: "A101", label: "A101", example: "A101, A102... A1001" },
                      { id: "Custom Prefix", label: "Custom Prefix", example: "BLK-A-101..." },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setNumberingFormat(opt.id as any)}
                        className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                          numberingFormat === opt.id
                            ? "border-primary bg-primary/10 font-medium text-primary shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <div className="font-semibold text-foreground">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.example}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {numberingFormat === "Custom Prefix" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Custom Prefix String</label>
                    <Input
                      value={customPrefix}
                      onChange={(e) => setCustomPrefix(e.target.value)}
                      placeholder="e.g. PH-, WING-A-, BLK1-"
                      className="max-w-xs"
                    />
                  </div>
                )}

                {/* Example Generation Preview Box */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs">
                  <span className="font-semibold text-foreground">Generation Formula Preview:</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground">Floor 1:</span>{" "}
                      <span className="font-mono font-medium text-primary">
                        {Array.from({ length: Math.min(4, flatsPerFloor) })
                          .map((_, i) =>
                            numberingFormat === "A-101"
                              ? `A-1${String(i + 1).padStart(2, "0")}`
                              : numberingFormat === "A101"
                              ? `A1${String(i + 1).padStart(2, "0")}`
                              : numberingFormat === "Custom Prefix"
                              ? `${customPrefix || ""}1${String(i + 1).padStart(2, "0")}`
                              : `1${String(i + 1).padStart(2, "0")}`
                          )
                          .join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Floor 2:</span>{" "}
                      <span className="font-mono font-medium text-primary">
                        {Array.from({ length: Math.min(4, flatsPerFloor) })
                          .map((_, i) =>
                            numberingFormat === "A-101"
                              ? `A-2${String(i + 1).padStart(2, "0")}`
                              : numberingFormat === "A101"
                              ? `A2${String(i + 1).padStart(2, "0")}`
                              : numberingFormat === "Custom Prefix"
                              ? `${customPrefix || ""}2${String(i + 1).padStart(2, "0")}`
                              : `2${String(i + 1).padStart(2, "0")}`
                          )
                          .join(", ")}
                      </span>
                    </div>
                    {floorsCount >= 10 && (
                      <div>
                        <span className="text-muted-foreground">Floor 10:</span>{" "}
                        <span className="font-mono font-medium text-primary">
                          {Array.from({ length: Math.min(4, flatsPerFloor) })
                            .map((_, i) =>
                              numberingFormat === "A-101"
                                ? `A-10${String(i + 1).padStart(2, "0")}`
                                : numberingFormat === "A101"
                                ? `A10${String(i + 1).padStart(2, "0")}`
                                : numberingFormat === "Custom Prefix"
                                ? `${customPrefix || ""}10${String(i + 1).padStart(2, "0")}`
                                : `10${String(i + 1).padStart(2, "0")}`
                            )
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <div className="flex gap-2">
                {hierarchy.length > 0 && (
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    Skip to Preview
                  </Button>
                )}
                <Button onClick={() => void handleGenerateBuilding()} disabled={generating || !buildingName.trim()}>
                  {generating ? "Generating..." : "Generate Building Structure"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Preview Generated Hierarchy & Interactive Editing */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Step 3: Preview Generated Hierarchy</h3>
                <p className="text-sm text-muted-foreground">
                  Society: <strong className="text-foreground">{selectedSociety?.name}</strong>. Operations can rename buildings, add/delete floors, and edit flat numbers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Another Building
                </Button>
              </div>
            </div>

            {loadingHierarchy ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading structure preview...</p>
            ) : hierarchy.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No buildings generated yet.</p>
                <Button className="mt-3" onClick={() => setStep(1)}>
                  Add Building Now
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {hierarchy.map((b) => (
                  <Card key={b.id} className="border-border/80 shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        {editingBuildingId === b.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={tempBuildingName}
                              onChange={(e) => setTempBuildingName(e.target.value)}
                              className="h-8 w-48 text-sm font-semibold"
                            />
                            <Button size="sm" className="h-8 px-2" onClick={() => handleRenameBuilding(b.id, tempBuildingName)}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingBuildingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-foreground">{b.name}</h4>
                            <button
                              onClick={() => { setEditingBuildingId(b.id); setTempBuildingName(b.name); }}
                              className="text-muted-foreground hover:text-foreground p-1"
                              title="Rename building"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{b.floors.length} Floors</Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAddFloor(b.id)}>
                          <Plus className="h-3 w-3" /> Add Floor
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-4">
                      {b.floors.map((fl) => (
                        <div key={fl.id} className="rounded-lg border border-border/70 bg-card p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Floor {fl.floor_number}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddFlat(b.id, fl.id)}
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" /> Add Flat
                              </button>
                              <button
                                onClick={() => handleDeleteFloor(b.id, fl.id)}
                                className="text-xs text-destructive hover:underline flex items-center gap-1"
                                title="Delete floor"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {fl.flats.map((flat) => (
                              <div
                                key={flat.id}
                                className="group relative flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:border-primary/50"
                              >
                                <input
                                  type="text"
                                  value={flat.flat_number}
                                  onChange={(e) => handleEditFlatNumber(b.id, fl.id, flat.id, e.target.value)}
                                  className="w-16 bg-transparent text-center font-mono font-semibold text-foreground outline-none focus:bg-muted focus:ring-1 focus:ring-primary rounded"
                                />
                                <button
                                  onClick={() => handleDeleteFlat(b.id, fl.id, flat.id)}
                                  className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition"
                                  title="Delete flat"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Add Building
              </Button>
              <Button onClick={() => setStep(3)} disabled={hierarchy.length === 0} className="gap-2">
                Next: Review & Complete <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Complete Setup */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Step 4: Complete Setup</h3>
              <p className="text-sm text-muted-foreground">
                Review setup summary for <strong className="text-foreground">{selectedSociety?.name}</strong> and mark as Completed.
              </p>
            </div>

            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <h4 className="text-base font-bold">Ready to Publish Hierarchy</h4>
                    <p className="text-xs text-muted-foreground">
                      Once marked complete, residents will be able to select these buildings, floors, and flats during registration.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4 text-center">
                  <div>
                    <div className="text-2xl font-extrabold text-foreground">{totalBuildings}</div>
                    <div className="text-xs text-muted-foreground uppercase font-medium">Buildings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-foreground">{totalFloors}</div>
                    <div className="text-xs text-muted-foreground uppercase font-medium">Floors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-foreground">{totalFlats}</div>
                    <div className="text-xs text-muted-foreground uppercase font-medium">Total Flats</div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h5 className="text-sm font-semibold text-foreground">Hierarchy Summary:</h5>
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                    {hierarchy.map((b) => (
                      <div key={b.id} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                        <span className="font-semibold text-foreground">{b.name}</span>
                        <span className="text-muted-foreground">
                          {b.floors.length} Floors · {b.floors.reduce((acc, fl) => acc + fl.flats.length, 0)} Flats
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Preview
              </Button>
              <Button
                onClick={() => void handleMarkComplete()}
                disabled={submittingComplete || totalBuildings === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
              >
                {submittingComplete ? "Updating..." : "Mark Society Setup Complete"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
