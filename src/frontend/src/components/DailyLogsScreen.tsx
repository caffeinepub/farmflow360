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
  Beaker,
  CalendarDays,
  ClipboardList,
  Clock,
  Droplets,
  Loader2,
  Pencil,
  Syringe,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DailyLog } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateDailyLog,
  useUserDailyLogs,
  useUserEstates,
} from "../hooks/useQueries";

interface LocalDailyLog {
  id: string;
  date: string;
  rainfallMM: number;
  fertilizerKg: number;
  laborHours: number;
  pesticideMl: number;
  estateId: string;
}

interface DailyLogEditForm {
  date: string;
  rainfallMM: string;
  fertilizerKg: string;
  laborHours: string;
  pesticideMl: string;
  estateId: string;
}

const today = new Date().toISOString().split("T")[0];

export default function DailyLogsScreen() {
  const { data: logs = [], isLoading: logsLoading } = useUserDailyLogs();
  const { data: estates = [] } = useUserEstates();
  const createLog = useCreateDailyLog();
  const { identity } = useInternetIdentity();

  const [form, setForm] = useState({
    date: today,
    rainfallMM: "",
    fertilizerKg: "",
    laborHours: "",
    pesticideMl: "",
    estateId: "",
  });

  const [localEntries, setLocalEntries] = useState<LocalDailyLog[]>([]);
  const [editEntry, setEditEntry] = useState<LocalDailyLog | null>(null);
  const [editForm, setEditForm] = useState<DailyLogEditForm>({
    date: today,
    rainfallMM: "",
    fertilizerKg: "",
    laborHours: "",
    pesticideMl: "",
    estateId: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Seed local entries from backend data
  useEffect(() => {
    if (logsLoading) return;
    const mapped: LocalDailyLog[] = logs
      .map((log) => ({
        id: `be-${log.id.toString()}`,
        date: log.date,
        rainfallMM: log.rainfallMM,
        fertilizerKg: log.fertilizerKg,
        laborHours: log.laborHours,
        pesticideMl: log.pesticideMl,
        estateId: log.estateId.toString(),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    setLocalEntries(mapped);
  }, [logsLoading, logs]);

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
      const log: DailyLog = {
        id: BigInt(0),
        userId: identity.getPrincipal(),
        date: form.date,
        rainfallMM: Number.parseFloat(form.rainfallMM) || 0,
        fertilizerKg: Number.parseFloat(form.fertilizerKg) || 0,
        laborHours: Number.parseFloat(form.laborHours) || 0,
        pesticideMl: Number.parseFloat(form.pesticideMl) || 0,
        estateId: BigInt(form.estateId),
      };

      await createLog.mutateAsync(log);
      toast.success("Daily log saved! 📋");

      const newEntry: LocalDailyLog = {
        id: `local-${Date.now()}`,
        date: form.date,
        rainfallMM: Number.parseFloat(form.rainfallMM) || 0,
        fertilizerKg: Number.parseFloat(form.fertilizerKg) || 0,
        laborHours: Number.parseFloat(form.laborHours) || 0,
        pesticideMl: Number.parseFloat(form.pesticideMl) || 0,
        estateId: form.estateId,
      };
      setLocalEntries((prev) =>
        [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)),
      );

      setForm({
        date: today,
        rainfallMM: "",
        fertilizerKg: "",
        laborHours: "",
        pesticideMl: "",
        estateId: form.estateId,
      });
    } catch {
      toast.error("Failed to save log. Please try again.");
    }
  };

  const openEdit = (entry: LocalDailyLog) => {
    setEditEntry(entry);
    setEditForm({
      date: entry.date,
      rainfallMM: entry.rainfallMM.toString(),
      fertilizerKg: entry.fertilizerKg.toString(),
      laborHours: entry.laborHours.toString(),
      pesticideMl: entry.pesticideMl.toString(),
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
              fertilizerKg: Number.parseFloat(editForm.fertilizerKg) || 0,
              laborHours: Number.parseFloat(editForm.laborHours) || 0,
              pesticideMl: Number.parseFloat(editForm.pesticideMl) || 0,
              estateId: editForm.estateId,
            }
          : e,
      ),
    );
    setEditEntry(null);
    toast.success("Daily log updated");
  };

  const handleDelete = (id: string) => {
    setLocalEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
    toast.success("Daily log removed");
  };

  const recentLogs = localEntries.slice(0, 10);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="farm-gradient-card px-5 pt-12 pb-6 rounded-b-3xl mb-4">
        <h1 className="text-2xl font-display font-bold text-white">
          Daily Logs 📋
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          Track your farm activities daily
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Log Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            New Log Entry
          </h2>

          <div className="space-y-3">
            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                Date
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="h-11 rounded-xl"
                max={today}
                data-ocid="logs.date_input"
              />
            </div>

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
                    data-ocid="logs.select"
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

            {/* Grid inputs */}
            <div className="grid grid-cols-2 gap-3">
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
                  data-ocid="logs.rainfall_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Beaker className="w-3.5 h-3.5 text-green-500" />
                  Fertilizer (kg)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.fertilizerKg}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fertilizerKg: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  Labor (hrs)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.laborHours}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, laborHours: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Syringe className="w-3.5 h-3.5 text-purple-400" />
                  Pesticide (ml)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.pesticideMl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, pesticideMl: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createLog.isPending}
              className="w-full h-12 rounded-xl font-display font-bold farm-gradient-light text-white"
              data-ocid="logs.save_button"
            >
              {createLog.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Log 📋"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Recent Logs */}
        <div>
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            Recent Logs
          </h2>

          {logsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div
              data-ocid="logs.empty_state"
              className="text-center py-8 bg-white rounded-2xl border border-dashed border-border"
            >
              <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No logs yet — start tracking today!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {recentLogs.map((log, idx) => {
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
                      data-ocid={`logs.item.${idx + 1}`}
                      className="bg-white rounded-2xl p-3.5 shadow-card border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-display font-bold text-sm text-foreground">
                            {log.date}
                          </p>
                          {estateForLog && (
                            <p className="text-xs text-muted-foreground">
                              {estateForLog.name}
                            </p>
                          )}
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(log)}
                            data-ocid={`logs.edit_button.${idx + 1}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                            aria-label={`Edit log for ${log.date}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(log.id)}
                            data-ocid={`logs.delete_button.${idx + 1}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            aria-label={`Delete log for ${log.date}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <Droplets className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                          <p className="text-xs font-bold text-foreground">
                            {log.rainfallMM}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            mm
                          </p>
                        </div>
                        <div className="text-center">
                          <Beaker className="w-3.5 h-3.5 text-green-500 mx-auto mb-0.5" />
                          <p className="text-xs font-bold text-foreground">
                            {log.fertilizerKg}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            kg
                          </p>
                        </div>
                        <div className="text-center">
                          <Clock className="w-3.5 h-3.5 text-orange-400 mx-auto mb-0.5" />
                          <p className="text-xs font-bold text-foreground">
                            {log.laborHours}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            hrs
                          </p>
                        </div>
                        <div className="text-center">
                          <Syringe className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                          <p className="text-xs font-bold text-foreground">
                            {log.pesticideMl}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            ml
                          </p>
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
          data-ocid="logs.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Daily Log
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                Date
              </Label>
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

            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Beaker className="w-3.5 h-3.5 text-green-500" />
                  Fertilizer (kg)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.fertilizerKg}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      fertilizerKg: e.target.value,
                    }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  Labor (hrs)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.laborHours}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, laborHours: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Syringe className="w-3.5 h-3.5 text-purple-400" />
                  Pesticide (ml)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.pesticideMl}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, pesticideMl: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setEditEntry(null)}
              className="flex-1 rounded-xl"
              data-ocid="logs.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 rounded-xl farm-gradient-light text-white"
              data-ocid="logs.save_button"
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
              Delete Daily Log?
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
              data-ocid="logs.cancel_delete_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 rounded-xl"
              data-ocid="logs.confirm_delete_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
