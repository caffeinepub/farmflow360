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
import {
  Beaker,
  CalendarDays,
  ClipboardList,
  Clock,
  Droplets,
  Loader2,
  Syringe,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DailyLog } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateDailyLog,
  useUserDailyLogs,
  useUserEstates,
} from "../hooks/useQueries";

export default function DailyLogsScreen() {
  const { data: logs = [], isLoading: logsLoading } = useUserDailyLogs();
  const { data: estates = [] } = useUserEstates();
  const createLog = useCreateDailyLog();
  const { identity } = useInternetIdentity();

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    date: today,
    rainfallMM: "",
    fertilizerKg: "",
    laborHours: "",
    pesticideMl: "",
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

  const recentLogs = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

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
              {recentLogs.map((log, idx) => {
                const estateForLog = estates.find((e) => e.id === log.estateId);
                return (
                  <motion.div
                    key={log.id.toString()}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
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
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <Droplets className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                        <p className="text-xs font-bold text-foreground">
                          {log.rainfallMM}
                        </p>
                        <p className="text-[10px] text-muted-foreground">mm</p>
                      </div>
                      <div className="text-center">
                        <Beaker className="w-3.5 h-3.5 text-green-500 mx-auto mb-0.5" />
                        <p className="text-xs font-bold text-foreground">
                          {log.fertilizerKg}
                        </p>
                        <p className="text-[10px] text-muted-foreground">kg</p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-3.5 h-3.5 text-orange-400 mx-auto mb-0.5" />
                        <p className="text-xs font-bold text-foreground">
                          {log.laborHours}
                        </p>
                        <p className="text-[10px] text-muted-foreground">hrs</p>
                      </div>
                      <div className="text-center">
                        <Syringe className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                        <p className="text-xs font-bold text-foreground">
                          {log.pesticideMl}
                        </p>
                        <p className="text-[10px] text-muted-foreground">ml</p>
                      </div>
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
