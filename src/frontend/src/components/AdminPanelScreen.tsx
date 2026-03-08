import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  BarChart3,
  Building2,
  Calendar,
  CloudRain,
  Coins,
  Info,
  Leaf,
  Loader2,
  Shield,
  ShieldCheck,
  Sprout,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  CropYield,
  DailyLog,
  Estate,
  LabourEntry,
  RainfallLog,
  RevenueEntry,
  UserRole,
} from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAdminAllCropYields,
  useAdminAllDailyLogs,
  useAdminAllEstates,
  useAdminAllLabourEntries,
  useAdminAllRainfallLogs,
  useAdminAllRevenueEntries,
  useAdminAllUserPrincipals,
  useAdminDeleteCropYield,
  useAdminDeleteDailyLog,
  useAdminDeleteEstate,
  useAdminDeleteLabourEntry,
  useAdminDeleteRainfallLog,
  useAdminDeleteRevenueEntry,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortPrincipal(p: Principal | string): string {
  const s = typeof p === "string" ? p : p.toString();
  if (s.length <= 15) return s;
  return `${s.slice(0, 12)}...`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Stagger Variants ─────────────────────────────────────────────────────────

const listVariants = {
  container: {
    animate: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  },
};

// ─── Record Card Component ────────────────────────────────────────────────────

interface RecordCardProps {
  index: number;
  label: string;
  sub1: string;
  sub2?: string;
  owner: Principal | string;
  onDelete: () => void;
  isDeleting?: boolean;
  accentColor?: string;
  icon?: React.ReactNode;
}

function RecordCard({
  index,
  label,
  sub1,
  sub2,
  owner,
  onDelete,
  isDeleting,
  accentColor = "bg-farm-mid",
  icon,
}: RecordCardProps) {
  return (
    <motion.div
      variants={listVariants.item}
      layout
      data-ocid={`admin.record.item.${index}`}
      className="bg-white rounded-xl border border-border p-3 flex items-center gap-3 shadow-sm"
    >
      <div
        className={`w-9 h-9 rounded-lg ${accentColor} flex items-center justify-center flex-shrink-0`}
      >
        {icon ?? <Leaf className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{sub1}</p>
        {sub2 && (
          <p className="text-xs text-muted-foreground truncate">{sub2}</p>
        )}
        <p className="text-xs font-mono text-muted-foreground/70 mt-0.5 truncate">
          Owner: {shortPrincipal(owner)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        data-ocid={`admin.record.delete_button.${index}`}
        onClick={onDelete}
        disabled={isDeleting}
        className="h-8 w-8 p-0 rounded-lg text-destructive hover:bg-destructive/10 flex-shrink-0"
        aria-label="Delete record"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </motion.div>
  );
}

// ─── Skeleton List ────────────────────────────────────────────────────────────

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {SKELETON_KEYS.slice(0, count).map((key) => (
        <Skeleton
          key={key}
          data-ocid="admin.record.loading_state"
          className="h-16 rounded-xl w-full"
        />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  message,
  marker,
}: {
  message: string;
  marker: string;
}) {
  return (
    <div
      data-ocid={marker}
      className="flex flex-col items-center justify-center py-10 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Leaf className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  principalStr,
  actor,
}: {
  principalStr: string;
  actor: ReturnType<typeof useActor>["actor"];
}) {
  const { data: allEstates = [], isLoading: estatesLoading } =
    useAdminAllEstates();
  const { data: allLabour = [], isLoading: labourLoading } =
    useAdminAllLabourEntries();
  const { data: allUsers = [], isLoading: usersLoading } =
    useAdminAllUserPrincipals();
  const { data: allRevenue = [], isLoading: revenueLoading } =
    useAdminAllRevenueEntries();

  const totalRevenue = allRevenue.reduce((sum, r) => sum + r.amount, 0);

  const [principalId, setPrincipalId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignRole = async () => {
    if (!principalId.trim()) {
      toast.error("Please enter a Principal ID");
      return;
    }
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    if (!actor) {
      toast.error("Actor not ready");
      return;
    }
    setIsAssigning(true);
    try {
      // Dynamic import to avoid bundling issues
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(principalId.trim());
      await actor.assignCallerUserRole(principal, selectedRole as UserRole);
      toast.success(`Role "${selectedRole}" assigned successfully ✅`);
      setPrincipalId("");
      setSelectedRole("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign role";
      if (message.includes("Invalid principal")) {
        toast.error("Invalid Principal ID format");
      } else {
        toast.error(`Error: ${message}`);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const statsCards = [
    {
      label: "Total Users",
      value: allUsers.length,
      loading: usersLoading,
      icon: <Users className="w-4 h-4 text-white" />,
      accent: "bg-blue-500",
      bg: "bg-blue-50",
      marker: "admin.stats.users_card",
    },
    {
      label: "Total Estates",
      value: allEstates.length,
      loading: estatesLoading,
      icon: <Building2 className="w-4 h-4 text-white" />,
      accent: "farm-gradient-light",
      bg: "bg-farm-pale",
      marker: "admin.stats.estates_card",
    },
    {
      label: "Labour Entries",
      value: allLabour.length,
      loading: labourLoading,
      icon: <UserCog className="w-4 h-4 text-white" />,
      accent: "bg-purple-500",
      bg: "bg-purple-50",
      marker: "admin.stats.labour_card",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      loading: revenueLoading,
      icon: <TrendingUp className="w-4 h-4 text-white" />,
      accent: "bg-amber-500",
      bg: "bg-amber-50",
      marker: "admin.stats.revenue_card",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <motion.div
        variants={listVariants.container}
        initial="initial"
        animate="animate"
      >
        <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-farm-mid inline-block" />
          Platform Stats
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {statsCards.map((card) => (
            <motion.div
              key={card.label}
              variants={listVariants.item}
              data-ocid={card.marker}
              className="bg-white rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
            >
              <div
                className={`absolute bottom-0 right-0 w-14 h-14 rounded-full ${card.bg} opacity-60 translate-x-4 translate-y-4`}
              />
              <div
                className={`w-8 h-8 rounded-xl ${card.accent} flex items-center justify-center mb-2.5`}
              >
                {card.icon}
              </div>
              {card.loading ? (
                <Skeleton
                  data-ocid={`${card.marker}.loading_state`}
                  className="h-7 w-14 rounded-lg mb-1"
                />
              ) : (
                <p className="text-2xl font-bold text-foreground leading-none">
                  {card.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Role Management */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-card border border-border p-4 space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl farm-gradient-light flex items-center justify-center">
            <UserCog className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm leading-tight">
              Role Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Assign roles to users
            </p>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="admin-principal"
              className="text-xs font-medium text-foreground"
            >
              User Principal ID
            </Label>
            <Input
              id="admin-principal"
              data-ocid="admin.principal_input"
              placeholder="Enter principal ID e.g. aaaaa-aa"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleAssignRole()}
              className="h-11 rounded-xl text-xs border-input focus-visible:ring-ring font-mono"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as UserRole)}
            >
              <SelectTrigger
                data-ocid="admin.role_select"
                className="h-11 rounded-xl border-input focus:ring-ring"
              >
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-farm-mid" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="guest">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-muted-foreground" />
                    Guest
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            data-ocid="admin.assign_button"
            onClick={() => void handleAssignRole()}
            disabled={isAssigning || !principalId.trim() || !selectedRole}
            className="w-full h-11 rounded-xl font-bold text-sm farm-gradient-light text-white shadow-green transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Assign Role
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-farm-light overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.95 0.04 140) 0%, oklch(0.92 0.06 142) 100%)",
        }}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl farm-gradient-light flex items-center justify-center">
              <Info className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-foreground text-sm">App Info</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "App Name", value: "Plantation 360" },
              { label: "Version", value: "v20.0" },
              { label: "Access Level", value: "Administrator" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {value}
                </span>
              </div>
            ))}
            <div className="bg-white/70 rounded-xl px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Your Principal ID
              </p>
              <p className="text-xs font-mono font-bold text-foreground break-all leading-relaxed">
                {principalStr || <Skeleton className="h-4 w-full rounded" />}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const { data: allUsers = [], isLoading: usersLoading } =
    useAdminAllUserPrincipals();
  const { data: allEstates = [], isLoading: estatesLoading } =
    useAdminAllEstates();
  const { data: allLabour = [], isLoading: labourLoading } =
    useAdminAllLabourEntries();
  const { data: allRainfall = [], isLoading: rainfallLoading } =
    useAdminAllRainfallLogs();

  const { mutateAsync: deleteEstate, isPending: deletingEstate } =
    useAdminDeleteEstate();
  const { mutateAsync: deleteLabour, isPending: deletingLabour } =
    useAdminDeleteLabourEntry();
  const { mutateAsync: deleteRainfall, isPending: deletingRainfall } =
    useAdminDeleteRainfallLog();

  const isLoading =
    usersLoading || estatesLoading || labourLoading || rainfallLoading;

  const handleDelete = async (
    fn: (id: bigint) => Promise<void>,
    id: bigint,
    label: string,
  ) => {
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`))
      return;
    try {
      await fn(id);
      toast.success(`${label} deleted successfully`);
    } catch {
      toast.error(`Failed to delete ${label}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (!allUsers.length) {
    return (
      <EmptyState
        message="No registered users yet"
        marker="admin.users.empty_state"
      />
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <p className="text-xs text-muted-foreground font-medium px-1">
        {allUsers.length} registered user{allUsers.length !== 1 ? "s" : ""}
      </p>
      <Accordion type="multiple" className="space-y-2">
        <AnimatePresence>
          {allUsers.map((user, idx) => {
            const userStr = user.toString();
            const userEstates = allEstates.filter(
              (e) => e.userId.toString() === userStr,
            );
            const userLabour = allLabour.filter(
              (l) => l.userId.toString() === userStr,
            );
            const userRainfall = allRainfall.filter(
              (r) => r.userId.toString() === userStr,
            );

            return (
              <motion.div
                key={userStr}
                variants={listVariants.item}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                data-ocid={`admin.user.item.${idx + 1}`}
              >
                <AccordionItem
                  value={userStr}
                  className="bg-white rounded-xl border border-border overflow-hidden shadow-sm"
                >
                  <AccordionTrigger
                    data-ocid={`admin.user.view_data_button.${idx + 1}`}
                    className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="w-9 h-9 rounded-xl farm-gradient-light flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground font-mono truncate">
                          {shortPrincipal(user)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-xs h-4 px-1.5 rounded-md"
                          >
                            {userEstates.length} estate
                            {userEstates.length !== 1 ? "s" : ""}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs h-4 px-1.5 rounded-md"
                          >
                            {userLabour.length} labour
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-3 pb-3 space-y-3">
                    {/* Estates */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Estates ({userEstates.length})
                      </p>
                      {userEstates.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-2">
                          No estates
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {userEstates.map((estate, ei) => (
                            <div
                              key={estate.id.toString()}
                              className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground">
                                  {estate.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {estate.location} · {estate.areaAcres} acres
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.user.estate.delete_button.${ei + 1}`}
                                onClick={() =>
                                  void handleDelete(
                                    deleteEstate,
                                    estate.id,
                                    "estate",
                                  )
                                }
                                disabled={deletingEstate}
                                className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Labour Entries */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                        <UserCog className="w-3 h-3" />
                        Labour Entries ({userLabour.length})
                      </p>
                      {userLabour.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-2">
                          No labour entries
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {userLabour.map((entry, li) => (
                            <div
                              key={entry.id.toString()}
                              className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground">
                                  {entry.workerName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.workType} · ${entry.totalAmount}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.user.labour.delete_button.${li + 1}`}
                                onClick={() =>
                                  void handleDelete(
                                    deleteLabour,
                                    entry.id,
                                    "labour entry",
                                  )
                                }
                                disabled={deletingLabour}
                                className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rainfall Logs */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                        <CloudRain className="w-3 h-3" />
                        Rainfall Logs ({userRainfall.length})
                      </p>
                      {userRainfall.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-2">
                          No rainfall logs
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {userRainfall.map((log, ri) => (
                            <div
                              key={log.id.toString()}
                              className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground">
                                  {log.date}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.rainfallMM} mm
                                  {log.notes ? ` · ${log.notes}` : ""}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.user.rainfall.delete_button.${ri + 1}`}
                                onClick={() =>
                                  void handleDelete(
                                    deleteRainfall,
                                    log.id,
                                    "rainfall log",
                                  )
                                }
                                disabled={deletingRainfall}
                                className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Accordion>
    </div>
  );
}

// ─── Data Tab ─────────────────────────────────────────────────────────────────

function DataTab() {
  const { data: allEstates = [], isLoading: estatesLoading } =
    useAdminAllEstates();
  const { data: allLabour = [], isLoading: labourLoading } =
    useAdminAllLabourEntries();
  const { data: allRainfall = [], isLoading: rainfallLoading } =
    useAdminAllRainfallLogs();
  const { data: allDailyLogs = [], isLoading: dailyLogsLoading } =
    useAdminAllDailyLogs();
  const { data: allRevenue = [], isLoading: revenueLoading } =
    useAdminAllRevenueEntries();
  const { data: allCropYields = [], isLoading: cropYieldsLoading } =
    useAdminAllCropYields();

  const { mutateAsync: deleteEstate } = useAdminDeleteEstate();
  const { mutateAsync: deleteLabour } = useAdminDeleteLabourEntry();
  const { mutateAsync: deleteRainfall } = useAdminDeleteRainfallLog();
  const { mutateAsync: deleteDailyLog } = useAdminDeleteDailyLog();
  const { mutateAsync: deleteRevenue } = useAdminDeleteRevenueEntry();
  const { mutateAsync: deleteCropYield } = useAdminDeleteCropYield();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (
    fn: (id: bigint) => Promise<void>,
    id: bigint,
    label: string,
  ) => {
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`))
      return;
    const key = id.toString();
    setDeletingId(key);
    try {
      await fn(id);
      toast.success(`${label} deleted`);
    } catch {
      toast.error(`Failed to delete ${label}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pt-2">
      <Tabs defaultValue="estates">
        <ScrollArea className="w-full">
          <TabsList className="flex w-max gap-1 bg-muted/50 rounded-xl p-1 mb-3">
            {[
              {
                value: "estates",
                label: "Estates",
                marker: "admin.data.estates_tab",
              },
              {
                value: "labour",
                label: "Labour",
                marker: "admin.data.labour_tab",
              },
              {
                value: "rainfall",
                label: "Rainfall",
                marker: "admin.data.rainfall_tab",
              },
              {
                value: "dailylogs",
                label: "Daily",
                marker: "admin.data.dailylogs_tab",
              },
              {
                value: "revenue",
                label: "Revenue",
                marker: "admin.data.revenue_tab",
              },
              {
                value: "harvest",
                label: "Harvest",
                marker: "admin.data.harvest_tab",
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid={tab.marker}
                className="text-xs rounded-lg px-3 py-1.5 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* Estates */}
        <TabsContent value="estates" className="space-y-2 mt-0">
          {estatesLoading ? (
            <SkeletonList />
          ) : allEstates.length === 0 ? (
            <EmptyState
              message="No estates found"
              marker="admin.data.estates.empty_state"
            />
          ) : (
            <motion.div
              variants={listVariants.container}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {allEstates.map((estate: Estate, idx: number) => (
                  <RecordCard
                    key={estate.id.toString()}
                    index={idx + 1}
                    label={estate.name}
                    sub1={`${estate.location} · ${estate.areaAcres} acres`}
                    sub2={estate.estateCare}
                    owner={estate.userId}
                    onDelete={() =>
                      void handleDelete(deleteEstate, estate.id, "estate")
                    }
                    isDeleting={deletingId === estate.id.toString()}
                    accentColor="farm-gradient-light"
                    icon={<Building2 className="w-4 h-4 text-white" />}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Labour */}
        <TabsContent value="labour" className="space-y-2 mt-0">
          {labourLoading ? (
            <SkeletonList />
          ) : allLabour.length === 0 ? (
            <EmptyState
              message="No labour entries found"
              marker="admin.data.labour.empty_state"
            />
          ) : (
            <motion.div
              variants={listVariants.container}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {allLabour.map((entry: LabourEntry, idx: number) => (
                  <RecordCard
                    key={entry.id.toString()}
                    index={idx + 1}
                    label={entry.workerName}
                    sub1={`${entry.workType} · ${entry.numberOfDays}d · $${entry.totalAmount}`}
                    sub2={entry.date}
                    owner={entry.userId}
                    onDelete={() =>
                      void handleDelete(deleteLabour, entry.id, "labour entry")
                    }
                    isDeleting={deletingId === entry.id.toString()}
                    accentColor="bg-blue-500"
                    icon={<UserCog className="w-4 h-4 text-white" />}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Rainfall */}
        <TabsContent value="rainfall" className="space-y-2 mt-0">
          {rainfallLoading ? (
            <SkeletonList />
          ) : allRainfall.length === 0 ? (
            <EmptyState
              message="No rainfall logs found"
              marker="admin.data.rainfall.empty_state"
            />
          ) : (
            <motion.div
              variants={listVariants.container}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {allRainfall.map((log: RainfallLog, idx: number) => (
                  <RecordCard
                    key={log.id.toString()}
                    index={idx + 1}
                    label={`${log.rainfallMM} mm`}
                    sub1={log.date}
                    sub2={log.notes || undefined}
                    owner={log.userId}
                    onDelete={() =>
                      void handleDelete(deleteRainfall, log.id, "rainfall log")
                    }
                    isDeleting={deletingId === log.id.toString()}
                    accentColor="bg-sky-500"
                    icon={<CloudRain className="w-4 h-4 text-white" />}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Daily Logs */}
        <TabsContent value="dailylogs" className="space-y-2 mt-0">
          {dailyLogsLoading ? (
            <SkeletonList />
          ) : allDailyLogs.length === 0 ? (
            <EmptyState
              message="No daily logs found"
              marker="admin.data.dailylogs.empty_state"
            />
          ) : (
            <motion.div
              variants={listVariants.container}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {allDailyLogs.map((log: DailyLog, idx: number) => (
                  <RecordCard
                    key={log.id.toString()}
                    index={idx + 1}
                    label={log.date}
                    sub1={`Rain: ${log.rainfallMM}mm · Labor: ${log.laborHours}h`}
                    sub2={`Fertilizer: ${log.fertilizerKg}kg · Pesticide: ${log.pesticideMl}ml`}
                    owner={log.userId}
                    onDelete={() =>
                      void handleDelete(deleteDailyLog, log.id, "daily log")
                    }
                    isDeleting={deletingId === log.id.toString()}
                    accentColor="bg-emerald-500"
                    icon={<Calendar className="w-4 h-4 text-white" />}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="space-y-2 mt-0">
          {revenueLoading ? (
            <SkeletonList />
          ) : allRevenue.length === 0 ? (
            <EmptyState
              message="No revenue entries found"
              marker="admin.data.revenue.empty_state"
            />
          ) : (
            <motion.div
              variants={listVariants.container}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {allRevenue.map((entry: RevenueEntry, idx: number) => (
                  <RecordCard
                    key={entry.id.toString()}
                    index={idx + 1}
                    label={formatCurrency(entry.amount)}
                    sub1={entry.description}
                    sub2={entry.date}
                    owner={entry.userId}
                    onDelete={() =>
                      void handleDelete(
                        deleteRevenue,
                        entry.id,
                        "revenue entry",
                      )
                    }
                    isDeleting={deletingId === entry.id.toString()}
                    accentColor="bg-amber-500"
                    icon={<Coins className="w-4 h-4 text-white" />}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Harvest / Crop Yields */}
        <TabsContent value="harvest" className="space-y-2 mt-0">
          {cropYieldsLoading ? (
            <SkeletonList />
          ) : allCropYields.length === 0 ? (
            <EmptyState
              message="No harvest records found"
              marker="admin.data.harvest.empty_state"
            />
          ) : (
            <motion.div
              variants={listVariants.container}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {allCropYields.map((cy: CropYield, idx: number) => (
                  <RecordCard
                    key={cy.id.toString()}
                    index={idx + 1}
                    label={cy.cropName}
                    sub1={`${cy.yieldKg} kg · ${cy.year}`}
                    owner={cy.userId}
                    onDelete={() =>
                      void handleDelete(
                        deleteCropYield,
                        cy.id,
                        "harvest record",
                      )
                    }
                    isDeleting={deletingId === cy.id.toString()}
                    accentColor="bg-green-600"
                    icon={<Sprout className="w-4 h-4 text-white" />}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanelScreen() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortP = principalStr
    ? `${principalStr.slice(0, 10)}...`
    : "Loading...";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="farm-gradient-card px-5 pt-12 pb-6 relative overflow-hidden rounded-b-3xl"
      >
        <div className="absolute top-4 right-5 opacity-10">
          <Shield className="w-20 h-20 text-white" />
        </div>
        <div className="absolute bottom-2 left-4 opacity-8">
          <Leaf className="w-12 h-12 text-white rotate-12" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white leading-tight">
              Admin Panel
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              Plantation 360 — Full Control
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 relative z-10"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UserCog className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium">
              Logged in as Admin
            </p>
            <p className="text-white font-display font-semibold text-sm truncate">
              {shortP}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse flex-shrink-0" />
        </motion.div>
      </motion.div>

      {/* Main Tabs */}
      <div className="px-4 pt-4">
        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-3 rounded-xl bg-muted/50 p-1 mb-4 h-11">
            <TabsTrigger
              value="overview"
              data-ocid="admin.overview_tab"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              data-ocid="admin.users_tab"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="data"
              data-ocid="admin.data_tab"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Leaf className="w-3.5 h-3.5 mr-1.5" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <OverviewTab principalStr={principalStr} actor={actor} />
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <UsersTab />
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <DataTab />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center py-6"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md farm-gradient flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">
              Plantation 360
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
