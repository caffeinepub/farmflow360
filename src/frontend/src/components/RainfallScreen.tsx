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
import { Textarea } from "@/components/ui/textarea";
import {
  CloudRain,
  Droplets,
  Loader2,
  Pencil,
  StickyNote,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RainfallLog } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateRainfallLog,
  useDeleteRainfallLog,
  useUserEstates,
  useUserRainfallLogs,
} from "../hooks/useQueries";

function getRainfallLevel(mm: number) {
  if (mm === 0)
    return { label: "None", color: "text-gray-400", bg: "bg-gray-50" };
  if (mm < 5)
    return { label: "Light", color: "text-blue-300", bg: "bg-blue-50" };
  if (mm < 20)
    return { label: "Moderate", color: "text-blue-500", bg: "bg-blue-100" };
  if (mm < 50)
    return { label: "Heavy", color: "text-blue-600", bg: "bg-blue-200" };
  return { label: "Extreme", color: "text-indigo-700", bg: "bg-indigo-100" };
}

interface LocalRainfallEntry {
  id: string;
  date: string;
  rainfallMM: number;
  notes: string;
  estateId: string;
  backendId?: bigint;
}

interface RainfallEditForm {
  date: string;
  rainfallMM: string;
  notes: string;
  estateId: string;
}

const today = new Date().toISOString().split("T")[0];

export default function RainfallScreen() {
  const { data: rainfallLogs = [], isLoading: logsLoading } =
    useUserRainfallLogs();
  const { data: estates = [] } = useUserEstates();
  const createLog = useCreateRainfallLog();
  const deleteLog = useDeleteRainfallLog();
  const { identity } = useInternetIdentity();

  const [form, setForm] = useState({
    date: today,
    rainfallMM: "",
    notes: "",
    estateId: "",
  });

  const [localEntries, setLocalEntries] = useState<LocalRainfallEntry[]>([]);
  const [editEntry, setEditEntry] = useState<LocalRainfallEntry | null>(null);
  const [editForm, setEditForm] = useState<RainfallEditForm>({
    date: today,
    rainfallMM: "",
    notes: "",
    estateId: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Seed local entries from backend data
  useEffect(() => {
    if (logsLoading) return;
    const mapped: LocalRainfallEntry[] = rainfallLogs
      .map((log) => ({
        id: `be-${log.id.toString()}`,
        date: log.date,
        rainfallMM: log.rainfallMM,
        notes: log.notes,
        estateId: log.estateId.toString(),
        backendId: log.id,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    setLocalEntries(mapped);
  }, [logsLoading, rainfallLogs]);

  const handleSubmit = async () => {
    if (!form.estateId) {
      toast.error("Please select an estate");
      return;
    }
    if (!identity) {
      toast.error("Not authenticated");
      return;
    }

    try {
      const log: RainfallLog = {
        id: BigInt(0),
        userId: identity.getPrincipal(),
        date: form.date,
        rainfallMM: Number.parseFloat(form.rainfallMM) || 0,
        notes: form.notes.trim(),
        estateId: BigInt(form.estateId),
      };

      const newLogId = await createLog.mutateAsync(log);
      toast.success("Rainfall logged! 🌧️");

      const newEntry: LocalRainfallEntry = {
        id: `local-${Date.now()}`,
        date: form.date,
        rainfallMM: Number.parseFloat(form.rainfallMM) || 0,
        notes: form.notes.trim(),
        estateId: form.estateId,
        backendId: newLogId,
      };
      setLocalEntries((prev) =>
        [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)),
      );

      setForm({
        date: today,
        rainfallMM: "",
        notes: "",
        estateId: form.estateId,
      });
    } catch {
      toast.error("Failed to save rainfall log.");
    }
  };

  const openEdit = (entry: LocalRainfallEntry) => {
    setEditEntry(entry);
    setEditForm({
      date: entry.date,
      rainfallMM: entry.rainfallMM.toString(),
      notes: entry.notes,
      estateId: entry.estateId,
    });
  };

  const handleSaveEdit = () => {
    if (!editEntry) return;
    setLocalEntries((prev) =>
      prev.map((e) =>
        e.id === editEntry.id
          ? {
              ...e,
              date: editForm.date,
              rainfallMM: Number.parseFloat(editForm.rainfallMM) || 0,
              notes: editForm.notes.trim(),
              estateId: editForm.estateId,
            }
          : e,
      ),
    );
    setEditEntry(null);
    toast.success("Rainfall log updated");
  };

  const handleDelete = async (id: string) => {
    const entry = localEntries.find((e) => e.id === id);
    if (!entry) return;

    setIsDeleting(true);
    try {
      if (entry.backendId !== undefined && entry.backendId > BigInt(0)) {
        await deleteLog.mutateAsync(entry.backendId);
      }
      setLocalEntries((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
      toast.success("Rainfall log deleted");
    } catch {
      toast.error("Failed to delete rainfall log.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalRainfallMM = localEntries.reduce(
    (sum, l) => sum + l.rainfallMM,
    0,
  );
  const recentLogs = localEntries.slice(0, 10);

  return (
    <div className="pb-6">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 rounded-b-3xl mb-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.12 240) 0%, oklch(0.35 0.1 250) 100%)",
        }}
      >
        <h1 className="text-2xl font-display font-bold text-white">
          Rainfall 🌧️
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          Total: {totalRainfallMM.toFixed(1)} mm recorded
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
            Log Rainfall
          </h2>

          <div className="space-y-3">
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

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Rainfall (mm)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.rainfallMM}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rainfallMM: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.1"
                  data-ocid="rainfall.input"
                />
              </div>
            </div>

            {estates.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Estate</Label>
                <Select
                  value={form.estateId}
                  onValueChange={(v) => setForm((p) => ({ ...p, estateId: v }))}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl"
                    data-ocid="rainfall.select"
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                Notes (optional)
              </Label>
              <Textarea
                placeholder="e.g. Heavy rain in the morning, soil absorbed well..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createLog.isPending}
              className="w-full h-12 rounded-xl font-display font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.14 240) 0%, oklch(0.42 0.12 248) 100%)",
              }}
              data-ocid="rainfall.save_button"
            >
              {createLog.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rainfall Log 🌧️"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Recent Logs */}
        <div>
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            Recent Readings
          </h2>

          {logsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div
              data-ocid="rainfall.empty_state"
              className="text-center py-8 bg-white rounded-2xl border border-dashed border-border"
            >
              <CloudRain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No rainfall data yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {recentLogs.map((log, idx) => {
                  const level = getRainfallLevel(log.rainfallMM);
                  const estateForLog = estates.find(
                    (e) => e.id.toString() === log.estateId,
                  );
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      data-ocid={`rainfall.item.${idx + 1}`}
                      className="bg-white rounded-2xl p-3.5 shadow-card border border-border flex items-center gap-3"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${level.bg}`}
                      >
                        <Droplets className={`w-5 h-5 ${level.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-foreground">
                          {log.date}
                        </p>
                        {estateForLog && (
                          <p className="text-xs text-muted-foreground">
                            {estateForLog.name}
                          </p>
                        )}
                        {log.notes && (
                          <p className="text-xs text-muted-foreground truncate">
                            {log.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-display font-bold text-foreground">
                          {log.rainfallMM}
                        </p>
                        <p className="text-xs text-muted-foreground">mm</p>
                        <p className={`text-xs font-medium ${level.color}`}>
                          {level.label}
                        </p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(log)}
                          data-ocid={`rainfall.edit_button.${idx + 1}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          aria-label={`Edit rainfall log for ${log.date}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(log.id)}
                          data-ocid={`rainfall.delete_button.${idx + 1}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          aria-label={`Delete rainfall log for ${log.date}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          data-ocid="rainfall.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Rainfall Log
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
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
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Rainfall (mm)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.rainfallMM}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, rainfallMM: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.1"
                />
              </div>
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                Notes (optional)
              </Label>
              <Textarea
                placeholder="e.g. Heavy rain in the morning..."
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setEditEntry(null)}
              className="flex-1 rounded-xl"
              data-ocid="rainfall.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 rounded-xl text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.14 240) 0%, oklch(0.42 0.12 248) 100%)",
              }}
              data-ocid="rainfall.save_button"
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
              Delete Rainfall Log?
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
              data-ocid="rainfall.cancel_delete_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="flex-1 rounded-xl"
              data-ocid="rainfall.confirm_delete_button"
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
