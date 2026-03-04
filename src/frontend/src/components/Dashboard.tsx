import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  Droplets,
  Flame,
  Leaf,
  MapPin,
  Plus,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import {
  calculateFarmHealthScore,
  calculateStreak,
  useTotalExpenses,
  useTotalRainfall,
  useTotalRevenue,
  useUserDailyLogs,
  useUserEstates,
  useUserProfile,
} from "../hooks/useQueries";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getProductivityBadge(streak: number) {
  if (streak >= 7)
    return {
      label: "Gold",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    };
  if (streak >= 3)
    return {
      label: "Silver",
      color: "text-slate-500",
      bg: "bg-slate-50 border-slate-200",
    };
  return {
    label: "Bronze",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
  };
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: estates = [], isLoading: estatesLoading } = useUserEstates();
  const { data: dailyLogs = [], isLoading: logsLoading } = useUserDailyLogs();
  const { data: totalExpenses = 0, isLoading: expensesLoading } =
    useTotalExpenses();
  const { data: totalRevenue = 0, isLoading: revenueLoading } =
    useTotalRevenue();
  const { data: totalRainfall = 0, isLoading: rainfallLoading } =
    useTotalRainfall();

  const isLoading = profileLoading || estatesLoading || logsLoading;

  const streak = calculateStreak(dailyLogs);
  const healthScore = calculateFarmHealthScore(
    streak,
    totalRainfall,
    estates.length,
  );
  const badge = getProductivityBadge(streak);
  const userName = profile?.name || "Farmer";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stagger = {
    container: { transition: { staggerChildren: 0.08 } },
    item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
  };

  return (
    <div className="pb-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="farm-gradient-card px-5 pt-12 pb-6 rounded-b-3xl"
      >
        <div className="flex items-start justify-between">
          <div>
            {isLoading ? (
              <Skeleton className="h-7 w-48 bg-white/20 mb-1" />
            ) : (
              <h1 className="text-2xl font-display font-bold text-white">
                {getGreeting()}, {userName}! 👋
              </h1>
            )}
            <p className="text-white/70 text-sm mt-0.5">{today}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Farm Health Score */}
        <motion.div
          data-ocid="dashboard.health_score_card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-5 bg-white/15 backdrop-blur-sm rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">
              Farm Health Score
            </span>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              {healthScore >= 70
                ? "🌟 Excellent"
                : healthScore >= 40
                  ? "📈 Growing"
                  : "🌱 Starting"}
            </Badge>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-display font-bold text-white leading-none">
              {isLoading ? "--" : `${healthScore}%`}
            </span>
            <div className="flex-1 pb-1">
              <Progress
                value={isLoading ? 0 : healthScore}
                className="h-2 bg-white/20"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="px-4 space-y-4">
        {/* Productivity Badge */}
        <motion.div
          {...stagger.item}
          className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${badge.bg}`}
          >
            <Trophy className={`w-6 h-6 ${badge.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">
              Productivity Badge
            </p>
            <p className={`text-lg font-display font-bold ${badge.color}`}>
              {badge.label} Farmer
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-bold text-foreground">
              {streak}
            </p>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-3 gap-3"
        >
          <motion.div variants={stagger.item} className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Droplets className="w-3.5 h-3.5 text-farm-rain" />
              <span className="text-xs text-muted-foreground">Rainfall</span>
            </div>
            {rainfallLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-display font-bold text-foreground leading-tight">
                {totalRainfall.toFixed(0)}
                <span className="text-xs font-body text-muted-foreground ml-0.5">
                  mm
                </span>
              </p>
            )}
          </motion.div>

          <motion.div variants={stagger.item} className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground">Expenses</span>
            </div>
            {expensesLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-display font-bold text-foreground leading-tight">
                ${totalExpenses.toFixed(0)}
              </p>
            )}
          </motion.div>

          <motion.div variants={stagger.item} className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-farm-mid" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            {revenueLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-display font-bold text-foreground leading-tight">
                ${totalRevenue.toFixed(0)}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Daily Streak Card */}
        <motion.div
          data-ocid="dashboard.streak_card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-display font-bold text-foreground">
                  Daily Streak
                </p>
                <p className="text-xs text-muted-foreground">
                  Log data every day to keep it going
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-foreground">
                {streak}
              </span>
              <span className="text-sm text-muted-foreground ml-1">days</span>
            </div>
          </div>
          <Progress
            value={(streak / 30) * 100}
            className="h-2.5 bg-orange-50"
          />
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            {streak}/30 days
          </p>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-farm-pale rounded-2xl p-4 border border-farm-light"
        >
          <p className="text-sm font-medium text-farm-deep">
            Welcome back! Here&apos;s an overview of your farm.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You have {estates.length} estate{estates.length !== 1 ? "s" : ""}{" "}
            registered.
          </p>
        </motion.div>

        {/* Estates Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-display font-bold text-foreground">
              My Estates
            </h2>
            <Button
              size="sm"
              onClick={() => onNavigate("estates")}
              className="h-8 px-3 rounded-xl text-xs farm-gradient-light text-white"
              data-ocid="dashboard.add_estate_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Estate
            </Button>
          </div>

          {estatesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : estates.length === 0 ? (
            <div
              data-ocid="estates.empty_state"
              className="text-center py-8 bg-white rounded-2xl border border-dashed border-border"
            >
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No estates yet</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigate("estates")}
                className="mt-2 text-primary"
              >
                Add your first estate
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {estates.slice(0, 3).map((estate, idx) => (
                <motion.div
                  key={estate.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  data-ocid={`estates.item.${idx + 1}`}
                  className="bg-white rounded-2xl p-3.5 shadow-card border border-border flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl farm-gradient-light flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground truncate">
                      {estate.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">
                        {estate.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {estate.areaAcres}
                    </p>
                    <p className="text-xs text-muted-foreground">acres</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Log Entry */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => onNavigate("logs")}
            className="w-full h-12 rounded-2xl font-display font-bold text-sm farm-gradient-light text-white shadow-green"
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            Quick Log Entry
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
