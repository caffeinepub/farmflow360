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
  Briefcase,
  CalendarDays,
  DollarSign,
  Loader2,
  Pencil,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { LabourEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateLabourEntry,
  useDeleteLabourEntry,
  useUserEstates,
  useUserLabourEntries,
} from "../hooks/useQueries";

const WORK_TYPES = [
  "Planting",
  "Harvesting",
  "Weeding",
  "Irrigation",
  "Fertilizing",
  "Pest Control",
  "Pruning",
  "Transportation",
  "Maintenance",
  "Other",
];

interface LocalLabourEntry {
  id: string;
  workerName: string;
  workType: string;
  wagePerDay: number;
  numberOfDays: number;
  totalAmount: number;
  date: string;
  estateId: string;
  backendId?: bigint;
}

interface LabourEditForm {
  workerName: string;
  workType: string;
  wagePerDay: string;
  numberOfDays: string;
  date: string;
  estateId: string;
}

const today = new Date().toISOString().split("T")[0];

export default function LabourScreen() {
  const { data: entries = [], isLoading: entriesLoading } =
    useUserLabourEntries();
  const { data: estates = [] } = useUserEstates();
  const createEntry = useCreateLabourEntry();
  const deleteEntry = useDeleteLabourEntry();
  const { identity } = useInternetIdentity();

  const [form, setForm] = useState({
    workerName: "",
    workType: "",
    wagePerDay: "",
    numberOfDays: "",
    date: today,
    estateId: "",
  });

  const [localEntries, setLocalEntries] = useState<LocalLabourEntry[]>([]);
  const [editEntry, setEditEntry] = useState<LocalLabourEntry | null>(null);
  const [editForm, setEditForm] = useState<LabourEditForm>({
    workerName: "",
    workType: "",
    wagePerDay: "",
    numberOfDays: "",
    date: today,
    estateId: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Seed local entries from backend data
  useEffect(() => {
    if (entriesLoading) return;
    const mapped: LocalLabourEntry[] = entries
      .map((e) => ({
        id: `be-${e.id.toString()}`,
        workerName: e.workerName,
        workType: e.workType,
        wagePerDay: e.wagePerDay,
        numberOfDays: Number(e.numberOfDays),
        totalAmount: e.totalAmount,
        date: e.date,
        estateId: e.estateId.toString(),
        backendId: e.id,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    setLocalEntries(mapped);
  }, [entriesLoading, entries]);

  const totalAmount =
    (Number.parseFloat(form.wagePerDay) || 0) *
    (Number.parseFloat(form.numberOfDays) || 0);

  const editTotalAmount =
    (Number.parseFloat(editForm.wagePerDay) || 0) *
    (Number.parseFloat(editForm.numberOfDays) || 0);

  const handleSubmit = async () => {
    if (!form.workerName.trim()) {
      toast.error("Worker name is required");
      return;
    }
    if (!form.workType) {
      toast.error("Work type is required");
      return;
    }
    if (!form.estateId) {
      toast.error("Please select an estate");
      return;
    }
    if (!identity) {
      toast.error("Not authenticated");
      return;
    }

    try {
      const entry: LabourEntry = {
        id: BigInt(0),
        userId: identity.getPrincipal(),
        workerName: form.workerName.trim(),
        workType: form.workType,
        wagePerDay: Number.parseFloat(form.wagePerDay) || 0,
        numberOfDays: BigInt(Number.parseInt(form.numberOfDays) || 0),
        totalAmount,
        date: form.date,
        estateId: BigInt(form.estateId),
      };

      const newEntryId = await createEntry.mutateAsync(entry);
      toast.success("Labour entry saved! 👷");

      const newEntry: LocalLabourEntry = {
        id: `local-${Date.now()}`,
        workerName: form.workerName.trim(),
        workType: form.workType,
        wagePerDay: Number.parseFloat(form.wagePerDay) || 0,
        numberOfDays: Number.parseInt(form.numberOfDays) || 0,
        totalAmount,
        date: form.date,
        estateId: form.estateId,
        backendId: newEntryId,
      };
      setLocalEntries((prev) =>
        [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)),
      );

      setForm({
        workerName: "",
        workType: "",
        wagePerDay: "",
        numberOfDays: "",
        date: today,
        estateId: form.estateId,
      });
    } catch {
      toast.error("Failed to save labour entry.");
    }
  };

  const openEdit = (entry: LocalLabourEntry) => {
    setEditEntry(entry);
    setEditForm({
      workerName: entry.workerName,
      workType: entry.workType,
      wagePerDay: entry.wagePerDay.toString(),
      numberOfDays: entry.numberOfDays.toString(),
      date: entry.date,
      estateId: entry.estateId,
    });
  };

  const handleSaveEdit = () => {
    if (!editEntry) return;
    if (!editForm.workerName.trim()) {
      toast.error("Worker name is required");
      return;
    }
    setLocalEntries((prev) =>
      prev.map((e) =>
        e.id === editEntry.id
          ? {
              ...e,
              workerName: editForm.workerName.trim(),
              workType: editForm.workType,
              wagePerDay: Number.parseFloat(editForm.wagePerDay) || 0,
              numberOfDays: Number.parseInt(editForm.numberOfDays) || 0,
              totalAmount: editTotalAmount,
              date: editForm.date,
              estateId: editForm.estateId,
            }
          : e,
      ),
    );
    setEditEntry(null);
    toast.success("Labour entry updated");
  };

  const handleDelete = async (id: string) => {
    const entry = localEntries.find((e) => e.id === id);
    if (!entry) return;

    setIsDeleting(true);
    try {
      if (entry.backendId !== undefined && entry.backendId > BigInt(0)) {
        await deleteEntry.mutateAsync(entry.backendId);
      }
      setLocalEntries((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
      toast.success("Labour entry deleted");
    } catch {
      toast.error("Failed to delete labour entry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalWages = localEntries.reduce((sum, e) => sum + e.totalAmount, 0);
  const recentEntries = localEntries.slice(0, 10);

  return (
    <div className="pb-6">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 rounded-b-3xl mb-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.1 55) 0%, oklch(0.35 0.08 50) 100%)",
        }}
      >
        <h1 className="text-2xl font-display font-bold text-white">
          Labour 👷
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          Total wages: ${totalWages.toFixed(2)}
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            New Labour Entry
          </h2>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                Worker Name *
              </Label>
              <Input
                placeholder="e.g. John Kamau"
                value={form.workerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, workerName: e.target.value }))
                }
                className="h-11 rounded-xl"
                data-ocid="labour.worker_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                Work Type *
              </Label>
              <Select
                value={form.workType}
                onValueChange={(v) => setForm((p) => ({ ...p, workType: v }))}
              >
                <SelectTrigger
                  className="h-11 rounded-xl"
                  data-ocid="labour.select"
                >
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-green-500" />
                  Wage/Day ($)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.wagePerDay}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, wagePerDay: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                  No. of Days
                </Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={form.numberOfDays}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, numberOfDays: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="1"
                />
              </div>
            </div>

            {/* Auto-calculated total */}
            {totalAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center justify-between bg-farm-pale rounded-xl px-4 py-3"
              >
                <span className="text-sm text-muted-foreground font-medium">
                  Total Amount
                </span>
                <span className="text-lg font-display font-bold text-farm-mid">
                  ${totalAmount.toFixed(2)}
                </span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  max={today}
                />
              </div>

              {estates.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Estate</Label>
                  <Select
                    value={form.estateId}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, estateId: v }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {estates.map((e) => (
                        <SelectItem
                          key={e.id.toString()}
                          value={e.id.toString()}
                        >
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createEntry.isPending}
              className="w-full h-12 rounded-xl font-display font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.12 55) 0%, oklch(0.42 0.1 50) 100%)",
              }}
              data-ocid="labour.save_button"
            >
              {createEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Labour Entry 👷"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Recent Entries */}
        <div>
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            Recent Entries
          </h2>

          {entriesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <div
              data-ocid="labour.empty_state"
              className="text-center py-8 bg-white rounded-2xl border border-dashed border-border"
            >
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No labour entries yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {recentEntries.map((entry, idx) => {
                  const estateForEntry = estates.find(
                    (e) => e.id.toString() === entry.estateId,
                  );
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      data-ocid={`labour.item.${idx + 1}`}
                      className="bg-white rounded-2xl p-3.5 shadow-card border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-sm text-foreground">
                            {entry.workerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.workType} • {entry.date}
                          </p>
                          {estateForEntry && (
                            <p className="text-xs text-muted-foreground">
                              {estateForEntry.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-display font-bold text-foreground">
                            ${entry.totalAmount.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.numberOfDays}d × ${entry.wagePerDay}
                          </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                          <button
                            type="button"
                            onClick={() => openEdit(entry)}
                            data-ocid={`labour.edit_button.${idx + 1}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                            aria-label={`Edit ${entry.workerName} labour entry`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(entry.id)}
                            data-ocid={`labour.delete_button.${idx + 1}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            aria-label={`Delete ${entry.workerName} labour entry`}
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
          data-ocid="labour.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Labour Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                Worker Name *
              </Label>
              <Input
                placeholder="e.g. John Kamau"
                value={editForm.workerName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, workerName: e.target.value }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                Work Type *
              </Label>
              <Select
                value={editForm.workType}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, workType: v }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-green-500" />
                  Wage/Day ($)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.wagePerDay}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, wagePerDay: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                  No. of Days
                </Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={editForm.numberOfDays}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, numberOfDays: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="1"
                />
              </div>
            </div>

            {editTotalAmount > 0 && (
              <div className="flex items-center justify-between bg-farm-pale rounded-xl px-4 py-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Amount
                </span>
                <span className="text-lg font-display font-bold text-farm-mid">
                  ${editTotalAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Date</Label>
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {estates.map((e) => (
                        <SelectItem
                          key={e.id.toString()}
                          value={e.id.toString()}
                        >
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setEditEntry(null)}
              className="flex-1 rounded-xl"
              data-ocid="labour.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 rounded-xl text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.12 55) 0%, oklch(0.42 0.1 50) 100%)",
              }}
              data-ocid="labour.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Delete Labour Entry?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
              className="flex-1 rounded-xl"
              data-ocid="labour.cancel_delete_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="flex-1 rounded-xl"
              data-ocid="labour.confirm_delete_button"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
