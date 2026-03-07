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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@icp-sdk/core/principal";
import {
  Building2,
  CloudRain,
  Info,
  Leaf,
  Loader2,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useTotalRevenue,
  useUserEstates,
  useUserLabourEntries,
  useUserRainfallLogs,
} from "../hooks/useQueries";

export default function AdminPanelScreen() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const { data: estates = [], isLoading: estatesLoading } = useUserEstates();
  const { data: labourEntries = [], isLoading: labourLoading } =
    useUserLabourEntries();
  const { data: totalRevenue = 0, isLoading: revenueLoading } =
    useTotalRevenue();
  const { data: rainfallLogs = [], isLoading: rainfallLoading } =
    useUserRainfallLogs();

  const [principalId, setPrincipalId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [isAssigning, setIsAssigning] = useState(false);

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr
    ? `${principalStr.slice(0, 10)}...`
    : "Loading...";

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

  const stagger = {
    container: {
      animate: { transition: { staggerChildren: 0.07 } },
    },
    item: {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="farm-gradient-card px-5 pt-12 pb-8 relative overflow-hidden rounded-b-3xl"
      >
        {/* Decorative background elements */}
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
              Plantation 360 Management
            </p>
          </div>
        </div>

        {/* Admin badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 relative z-10"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UserCog className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium">
              You are the Admin
            </p>
            <p className="text-white font-display font-semibold text-sm truncate">
              {shortPrincipal}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse flex-shrink-0" />
        </motion.div>
      </motion.div>

      <div className="px-4 -mt-2 space-y-4 pt-5">
        {/* Stats Grid */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-base font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-farm-mid inline-block" />
            App Overview
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Estates Card */}
            <motion.div
              variants={stagger.item}
              data-ocid="admin.stats.estates_card"
              className="bg-white rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-farm-pale opacity-60 translate-x-4 translate-y-4" />
              <div className="w-9 h-9 rounded-xl farm-gradient-light flex items-center justify-center mb-3">
                <Building2 className="w-4.5 h-4.5 text-white" />
              </div>
              {estatesLoading ? (
                <Skeleton
                  data-ocid="admin.stats.estates_card.loading_state"
                  className="h-8 w-12 rounded-lg mb-1"
                />
              ) : (
                <p className="text-3xl font-display font-bold text-foreground leading-none">
                  {estates.length}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Total Estates
              </p>
            </motion.div>

            {/* Labour Card */}
            <motion.div
              variants={stagger.item}
              data-ocid="admin.stats.labour_card"
              className="bg-white rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-blue-50 opacity-60 translate-x-4 translate-y-4" />
              <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
                <Users className="w-4.5 h-4.5 text-white" />
              </div>
              {labourLoading ? (
                <Skeleton
                  data-ocid="admin.stats.labour_card.loading_state"
                  className="h-8 w-12 rounded-lg mb-1"
                />
              ) : (
                <p className="text-3xl font-display font-bold text-foreground leading-none">
                  {labourEntries.length}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Labour Entries
              </p>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              variants={stagger.item}
              data-ocid="admin.stats.revenue_card"
              className="bg-white rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-amber-50 opacity-60 translate-x-4 translate-y-4" />
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center mb-3">
                <TrendingUp className="w-4.5 h-4.5 text-white" />
              </div>
              {revenueLoading ? (
                <Skeleton
                  data-ocid="admin.stats.revenue_card.loading_state"
                  className="h-8 w-20 rounded-lg mb-1"
                />
              ) : (
                <p className="text-2xl font-display font-bold text-foreground leading-none">
                  ${totalRevenue.toFixed(0)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Total Revenue
              </p>
            </motion.div>

            {/* Rainfall Card */}
            <motion.div
              variants={stagger.item}
              data-ocid="admin.stats.rainfall_card"
              className="bg-white rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-sky-50 opacity-60 translate-x-4 translate-y-4" />
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center mb-3">
                <CloudRain className="w-4.5 h-4.5 text-white" />
              </div>
              {rainfallLoading ? (
                <Skeleton
                  data-ocid="admin.stats.rainfall_card.loading_state"
                  className="h-8 w-12 rounded-lg mb-1"
                />
              ) : (
                <p className="text-3xl font-display font-bold text-foreground leading-none">
                  {rainfallLogs.length}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Rainfall Logs
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Role Management */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-2xl shadow-card border border-border p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl farm-gradient-light flex items-center justify-center">
              <UserCog className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground text-base leading-tight">
                Role Management
              </h2>
              <p className="text-xs text-muted-foreground">
                Assign roles to other users
              </p>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-3">
            {/* Principal ID input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-principal"
                className="text-sm font-medium text-foreground"
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
                className="h-12 rounded-xl text-sm border-input focus-visible:ring-ring font-mono"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>

            {/* Role select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as UserRole)}
              >
                <SelectTrigger
                  data-ocid="admin.role_select"
                  className="h-12 rounded-xl border-input focus:ring-ring"
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

            {/* Assign button */}
            <Button
              data-ocid="admin.assign_button"
              onClick={() => void handleAssignRole()}
              disabled={isAssigning || !principalId.trim() || !selectedRole}
              className="w-full h-12 rounded-xl font-display font-bold text-base farm-gradient-light text-white shadow-green transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
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

        {/* App Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl border border-farm-light overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.95 0.04 140) 0%, oklch(0.92 0.06 142) 100%)",
          }}
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl farm-gradient-light flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-display font-bold text-foreground text-base">
                App Info
              </h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">
                  App Name
                </span>
                <span className="text-xs font-display font-bold text-foreground">
                  Plantation 360
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Version
                </span>
                <span className="text-xs font-display font-bold text-foreground">
                  v15.0
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Access Level
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-display font-bold text-farm-mid">
                    Administrator
                  </span>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl px-3 py-2.5">
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="text-center pb-4"
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
