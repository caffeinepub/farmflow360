import { Button } from "@/components/ui/button";
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
import { CloudRain, Droplets, Loader2, StickyNote } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { RainfallLog } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateRainfallLog,
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

export default function RainfallScreen() {
  const { data: rainfallLogs = [], isLoading: logsLoading } =
    useUserRainfallLogs();
  const { data: estates = [] } = useUserEstates();
  const createLog = useCreateRainfallLog();
  const { identity } = useInternetIdentity();

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    date: today,
    rainfallMM: "",
    notes: "",
    estateId: "",
  });

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

      await createLog.mutateAsync(log);
      toast.success("Rainfall logged! 🌧️");
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

  const totalRainfallMM = rainfallLogs.reduce(
    (sum, l) => sum + l.rainfallMM,
    0,
  );
  const recentLogs = [...rainfallLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

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
              {recentLogs.map((log, idx) => {
                const level = getRainfallLevel(log.rainfallMM);
                const estateForLog = estates.find((e) => e.id === log.estateId);
                return (
                  <motion.div
                    key={log.id.toString()}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
