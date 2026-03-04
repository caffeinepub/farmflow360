import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Pencil,
  Sprout,
  Trash2,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCropYield,
  useCreateRevenueEntry,
  useUserCropYields,
  useUserEstates,
  useUserRevenueEntries,
} from "../hooks/useQueries";

interface HarvestEntry {
  id: string;
  date: string;
  cropType: string;
  quantityKg: number;
  salePricePerUnit: number;
  totalValue: number;
  estateId: string;
}

interface HarvestForm {
  date: string;
  cropType: string;
  quantityKg: string;
  salePricePerUnit: string;
  estateId: string;
}

const today = new Date().toISOString().split("T")[0];

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const EMPTY_FORM: HarvestForm = {
  date: today,
  cropType: "",
  quantityKg: "",
  salePricePerUnit: "",
  estateId: "",
};

export default function HarvestScreen() {
  const { data: cropYields = [], isLoading: yieldsLoading } =
    useUserCropYields();
  const { data: revenueEntries = [], isLoading: revenueLoading } =
    useUserRevenueEntries();
  const { data: estates = [] } = useUserEstates();
  const createCropYield = useCreateCropYield();
  const createRevenueEntry = useCreateRevenueEntry();
  const { identity } = useInternetIdentity();

  const [localEntries, setLocalEntries] = useState<HarvestEntry[]>([]);
  const [form, setForm] = useState<HarvestForm>(EMPTY_FORM);
  const [editEntry, setEditEntry] = useState<HarvestEntry | null>(null);
  const [editForm, setEditForm] = useState<HarvestForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge backend data into local entries on first load
  useEffect(() => {
    if (yieldsLoading || revenueLoading) return;

    const merged: HarvestEntry[] = cropYields
      .map((cy) => {
        const matchingRevenue = revenueEntries.find((re) =>
          re.description.startsWith(`Harvest: ${cy.cropName}`),
        );
        const totalValue = matchingRevenue?.amount ?? 0;
        const quantityKg = cy.yieldKg;
        const salePricePerUnit = quantityKg > 0 ? totalValue / quantityKg : 0;
        return {
          id: `be-${cy.id.toString()}`,
          date: matchingRevenue?.date ?? today,
          cropType: cy.cropName,
          quantityKg,
          salePricePerUnit,
          totalValue,
          estateId: cy.estateId.toString(),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    setLocalEntries(merged);
  }, [yieldsLoading, revenueLoading, cropYields, revenueEntries]);

  const totalHarvestValue = localEntries.reduce(
    (sum, e) => sum + e.totalValue,
    0,
  );

  const qty = Number.parseFloat(form.quantityKg) || 0;
  const price = Number.parseFloat(form.salePricePerUnit) || 0;
  const calculatedTotal = qty * price;

  const editQty = Number.parseFloat(editForm.quantityKg) || 0;
  const editPrice = Number.parseFloat(editForm.salePricePerUnit) || 0;
  const editCalculatedTotal = editQty * editPrice;

  const handleSubmit = async () => {
    if (!form.cropType.trim()) {
      toast.error("Crop type is required");
      return;
    }
    if (!qty || qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (!identity) {
      toast.error("Not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      const principal = identity.getPrincipal();
      const estateIdBig = BigInt(form.estateId || "0");

      await Promise.all([
        createCropYield.mutateAsync({
          id: BigInt(0),
          userId: principal,
          cropName: form.cropType.trim(),
          yieldKg: qty,
          year: BigInt(new Date().getFullYear()),
          estateId: estateIdBig,
        }),
        createRevenueEntry.mutateAsync({
          id: BigInt(0),
          userId: principal,
          amount: calculatedTotal,
          description: `Harvest: ${form.cropType.trim()} ${qty}kg @ $${price}/unit`,
          date: form.date,
          estateId: estateIdBig,
        }),
      ]);

      const newEntry: HarvestEntry = {
        id: `local-${Date.now()}`,
        date: form.date,
        cropType: form.cropType.trim(),
        quantityKg: qty,
        salePricePerUnit: price,
        totalValue: calculatedTotal,
        estateId: form.estateId,
      };

      setLocalEntries((prev) => [newEntry, ...prev]);
      setForm((prev) => ({ ...EMPTY_FORM, estateId: prev.estateId }));
      toast.success("Harvest logged! 🌾");
    } catch {
      toast.error("Failed to log harvest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (entry: HarvestEntry) => {
    setEditEntry(entry);
    setEditForm({
      date: entry.date,
      cropType: entry.cropType,
      quantityKg: entry.quantityKg.toString(),
      salePricePerUnit: entry.salePricePerUnit.toString(),
      estateId: entry.estateId,
    });
  };

  const handleSaveEdit = () => {
    if (!editEntry) return;
    if (!editForm.cropType.trim()) {
      toast.error("Crop type is required");
      return;
    }
    setLocalEntries((prev) =>
      prev.map((e) =>
        e.id === editEntry.id
          ? {
              ...e,
              date: editForm.date,
              cropType: editForm.cropType.trim(),
              quantityKg: editQty,
              salePricePerUnit: editPrice,
              totalValue: editCalculatedTotal,
              estateId: editForm.estateId,
            }
          : e,
      ),
    );
    setEditEntry(null);
    toast.success("Harvest entry updated");
  };

  const handleDelete = (id: string) => {
    setLocalEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
    toast.success("Harvest entry removed");
  };

  const isLoading = yieldsLoading || revenueLoading;

  return (
    <div className="pb-6">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 rounded-b-3xl mb-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.15 145) 0%, oklch(0.35 0.12 140) 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Wheat className="w-6 h-6 text-white/90" />
          <h1 className="text-2xl font-display font-bold text-white">
            Harvest Log
          </h1>
          <span className="text-2xl">🌾</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <TrendingUp className="w-4 h-4 text-white/70" />
          <p className="text-white/75 text-sm">
            Total harvest value:{" "}
            <span className="text-white font-bold">
              ${totalHarvestValue.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Log Harvest Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-farm-mid" />
            Log Harvest
          </h2>

          <div className="space-y-3">
            {/* Harvest Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Harvest Date</Label>
              <Input
                type="date"
                value={form.date}
                max={today}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="h-11 rounded-xl"
                data-ocid="harvest.date_input"
              />
            </div>

            {/* Crop Type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Crop Type</Label>
              <Input
                placeholder="e.g. Maize, Tomatoes, Wheat"
                value={form.cropType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cropType: e.target.value }))
                }
                className="h-11 rounded-xl"
                data-ocid="harvest.crop_input"
              />
            </div>

            {/* Quantity + Sale Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Quantity (kg)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.quantityKg}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, quantityKg: e.target.value }))
                    }
                    className="h-11 rounded-xl pr-10"
                    min="0"
                    step="0.1"
                    data-ocid="harvest.quantity_input"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    kg
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Price / Unit ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.salePricePerUnit}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        salePricePerUnit: e.target.value,
                      }))
                    }
                    className="h-11 rounded-xl pl-6"
                    min="0"
                    step="0.01"
                    data-ocid="harvest.price_input"
                  />
                </div>
              </div>
            </div>

            {/* Auto-calculated Total Value */}
            <AnimatePresence>
              {calculatedTotal > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between bg-farm-pale rounded-xl px-4 py-3 border border-farm-light"
                >
                  <span className="text-sm text-muted-foreground font-medium">
                    Total Value
                  </span>
                  <span className="text-lg font-display font-bold text-farm-mid">
                    ${calculatedTotal.toFixed(2)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Estate Selector */}
            {estates.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Estate</Label>
                <Select
                  value={form.estateId}
                  onValueChange={(v) => setForm((p) => ({ ...p, estateId: v }))}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl"
                    data-ocid="harvest.estate_select"
                  >
                    <SelectValue placeholder="Select estate" />
                  </SelectTrigger>
                  <SelectContent>
                    {estates.map((e) => (
                      <SelectItem key={e.id.toString()} value={e.id.toString()}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-display font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.17 145) 0%, oklch(0.42 0.15 140) 100%)",
              }}
              data-ocid="harvest.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Harvest 🌾"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Harvest Records */}
        <div>
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            Harvest Records
          </h2>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : localEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="harvest.empty_state"
              className="text-center py-10 bg-white rounded-2xl border border-dashed border-border"
            >
              <div className="w-14 h-14 rounded-2xl bg-farm-pale flex items-center justify-center mx-auto mb-3">
                <Wheat className="w-7 h-7 text-farm-mid" />
              </div>
              <p className="font-display font-bold text-sm text-foreground">
                No harvests logged yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 px-6">
                Start logging your crop yields using the form above
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {localEntries.map((entry, idx) => {
                  const estateForEntry = estates.find(
                    (e) => e.id.toString() === entry.estateId,
                  );
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      data-ocid={`harvest.item.${idx + 1}`}
                      className="bg-white rounded-2xl p-3.5 shadow-card border border-border"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-farm-pale flex items-center justify-center flex-shrink-0">
                          <Wheat className="w-5 h-5 text-farm-mid" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-sm text-foreground">
                            {entry.cropType}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(entry.date)}
                            {estateForEntry ? ` • ${estateForEntry.name}` : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                              {entry.quantityKg} kg
                            </span>
                            <span className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                              ${entry.salePricePerUnit.toFixed(2)}/unit
                            </span>
                            <span className="text-xs bg-farm-pale rounded-md px-2 py-0.5 text-farm-mid font-bold">
                              ${entry.totalValue.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                          <button
                            type="button"
                            onClick={() => openEdit(entry)}
                            data-ocid={`harvest.edit_button.${idx + 1}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                            aria-label={`Edit ${entry.cropType} harvest`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(entry.id)}
                            data-ocid={`harvest.delete_button.${idx + 1}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            aria-label={`Delete ${entry.cropType} harvest`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editEntry}
        onOpenChange={(open) => !open && setEditEntry(null)}
      >
        <DialogContent
          className="max-w-[calc(100vw-2rem)] rounded-2xl"
          data-ocid="harvest.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Harvest Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Harvest Date</Label>
              <Input
                type="date"
                value={editForm.date}
                max={today}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, date: e.target.value }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Crop Type</Label>
              <Input
                placeholder="e.g. Maize"
                value={editForm.cropType}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, cropType: e.target.value }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Quantity (kg)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.quantityKg}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, quantityKg: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Price / Unit ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={editForm.salePricePerUnit}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      salePricePerUnit: e.target.value,
                    }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {editCalculatedTotal > 0 && (
              <div className="flex items-center justify-between bg-farm-pale rounded-xl px-4 py-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Value
                </span>
                <span className="text-lg font-display font-bold text-farm-mid">
                  ${editCalculatedTotal.toFixed(2)}
                </span>
              </div>
            )}

            {estates.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Estate</Label>
                <Select
                  value={editForm.estateId}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, estateId: v }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select estate" />
                  </SelectTrigger>
                  <SelectContent>
                    {estates.map((e) => (
                      <SelectItem key={e.id.toString()} value={e.id.toString()}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setEditEntry(null)}
              className="flex-1 rounded-xl"
              data-ocid="harvest.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 rounded-xl text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.17 145) 0%, oklch(0.42 0.15 140) 100%)",
              }}
              data-ocid="harvest.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Delete Harvest Entry?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The entry will be removed from your
            local records.
          </p>
          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="flex-1 rounded-xl"
              data-ocid="harvest.cancel_delete_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 rounded-xl"
              data-ocid="harvest.confirm_delete_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
