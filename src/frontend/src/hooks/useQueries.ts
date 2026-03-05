import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CropYield,
  DailyLog,
  Estate,
  Forecast,
  LabourEntry,
  RainfallLog,
  RevenueEntry,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserEstates() {
  const { actor, isFetching } = useActor();
  return useQuery<Estate[]>({
    queryKey: ["estates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserEstates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserDailyLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<DailyLog[]>({
    queryKey: ["dailyLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserDailyLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserLabourEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<LabourEntry[]>({
    queryKey: ["labourEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserLabourEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRainfallLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<RainfallLog[]>({
    queryKey: ["rainfallLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserRainfallLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRevenueEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<RevenueEntry[]>({
    queryKey: ["revenueEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserRevenueEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserCropYields() {
  const { actor, isFetching } = useActor();
  return useQuery<CropYield[]>({
    queryKey: ["cropYields"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserCropYields();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserForecasts() {
  const { actor, isFetching } = useActor();
  return useQuery<Forecast[]>({
    queryKey: ["forecasts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserForecasts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["totalExpenses"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalExpensesForUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalRevenue() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["totalRevenue"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalRevenueForUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalRainfall() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["totalRainfall"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalRainfallForUser();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateEstate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (estate: Estate) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createEstate(estate);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

export function useCreateDailyLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: DailyLog) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createDailyLog(log);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dailyLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["totalRainfall"] });
    },
  });
}

export function useCreateLabourEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: LabourEntry) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createLabourEntry(entry);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["labourEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["totalExpenses"] });
    },
  });
}

export function useCreateRainfallLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: RainfallLog) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createRainfallLog(log);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rainfallLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["totalRainfall"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useCreateCropYield() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cropYield: CropYield) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCropYield(cropYield);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cropYields"] });
    },
  });
}

export function useCreateRevenueEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: RevenueEntry) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createRevenueEntry(entry);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["revenueEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["totalRevenue"] });
    },
  });
}

export function useDeleteCropYield() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yieldId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteCropYield(yieldId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cropYields"] });
    },
  });
}

export function useDeleteRevenueEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteRevenueEntry(entryId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["revenueEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["totalRevenue"] });
    },
  });
}

export function useDeleteLabourEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteLabourEntry(entryId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["labourEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["totalExpenses"] });
    },
  });
}

export function useDeleteRainfallLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteRainfallLog(logId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rainfallLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["totalRainfall"] });
    },
  });
}

export function useDeleteDailyLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteDailyLog(logId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dailyLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["totalRainfall"] });
    },
  });
}

export function useDeleteEstate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (estateId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteEstate(estateId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

export function calculateStreak(dailyLogs: DailyLog[]): number {
  if (!dailyLogs.length) return 0;

  const uniqueDates = new Set(dailyLogs.map((log) => log.date));
  const dateArray = Array.from(uniqueDates).sort().reverse();

  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (uniqueDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // No log today — check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split("T")[0];
      if (!uniqueDates.has(yesterdayStr)) break;
    } else {
      break;
    }
  }

  void dateArray; // suppress unused warning
  return streak;
}

export function calculateFarmHealthScore(
  streak: number,
  totalRainfall: number,
  estateCount: number,
): number {
  const streakScore = Math.min(streak * 2, 40);
  const rainfallScore = (Math.min(totalRainfall, 30) / 30) * 20;
  const estateScore = Math.min(estateCount * 10, 40);
  return Math.min(Math.round(streakScore + rainfallScore + estateScore), 100);
}
