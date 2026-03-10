import type { Principal } from "@icp-sdk/core/principal";
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
  UserRole,
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

const ADMIN_TOKEN = "sagarpatelms";
const ADMIN_LOCAL_KEY = "plantation360_admin_unlocked";

export function isAdminUnlocked(): boolean {
  return localStorage.getItem(ADMIN_LOCAL_KEY) === "1";
}

export function claimAdminLocally(token: string): boolean {
  if (token.trim() === ADMIN_TOKEN) {
    localStorage.setItem(ADMIN_LOCAL_KEY, "1");
    return true;
  }
  return false;
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      // Always check backend role as the source of truth
      try {
        const backendAdmin = await actor.isCallerAdmin();
        if (backendAdmin) {
          // Sync localStorage so UI persists
          localStorage.setItem(ADMIN_LOCAL_KEY, "1");
          return true;
        }
      } catch {
        // fallback to local
      }
      return isAdminUnlocked();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

export function useAdminAllEstates() {
  const { actor, isFetching } = useActor();
  return useQuery<Estate[]>({
    queryKey: ["adminEstates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllEstates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllLabourEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<LabourEntry[]>({
    queryKey: ["adminLabourEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllLabourEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllRainfallLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<RainfallLog[]>({
    queryKey: ["adminRainfallLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllRainfallLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllDailyLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<DailyLog[]>({
    queryKey: ["adminDailyLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllDailyLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllRevenueEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<RevenueEntry[]>({
    queryKey: ["adminRevenueEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllRevenueEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllCropYields() {
  const { actor, isFetching } = useActor();
  return useQuery<CropYield[]>({
    queryKey: ["adminCropYields"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllCropYields();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllUserPrincipals() {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["adminUserPrincipals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllUserPrincipals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllUserProfiles(principals: Principal[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, string>>({
    queryKey: [
      "adminUserProfiles",
      principals.map((p) => p.toString()).join(","),
    ],
    queryFn: async () => {
      if (!actor || !principals.length) return {};
      const results = await Promise.all(
        principals.map(async (p) => {
          try {
            const profile = await actor.getUserProfile(p);
            return [p.toString(), profile?.name ?? ""] as [string, string];
          } catch {
            return [p.toString(), ""] as [string, string];
          }
        }),
      );
      return Object.fromEntries(results);
    },
    enabled: !!actor && !isFetching && principals.length > 0,
  });
}

export function useAdminAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{
      principalId: Principal;
      name: string;
      role: string;
      createdAt: bigint;
    }>
  >({
    queryKey: ["adminAllUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).adminDeleteUserFromRegistry(user);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminAllUsers"] });
    },
  });
}

export function useAdminUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).adminUpdateUserRole(user, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminAllUsers"] });
    },
  });
}

export function useAdminAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

// ─── Admin Mutations ──────────────────────────────────────────────────────────

export function useAdminDeleteEstate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (estateId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteEstate(estateId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminEstates"] });
      void queryClient.invalidateQueries({ queryKey: ["adminUserPrincipals"] });
    },
  });
}

export function useAdminDeleteLabourEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteLabourEntry(entryId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminLabourEntries"] });
    },
  });
}

export function useAdminDeleteRainfallLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteRainfallLog(logId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminRainfallLogs"] });
    },
  });
}

export function useAdminDeleteDailyLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteDailyLog(logId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDailyLogs"] });
    },
  });
}

export function useAdminDeleteRevenueEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteRevenueEntry(entryId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminRevenueEntries"] });
    },
  });
}

export function useAdminDeleteCropYield() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yieldId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteCropYield(yieldId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminCropYields"] });
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
