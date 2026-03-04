import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  CalendarCheck,
  Droplets,
  Flame,
  Sprout,
  Target,
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
  useUserCropYields,
  useUserDailyLogs,
  useUserEstates,
  useUserForecasts,
} from "../hooks/useQueries";

function getProductivityBadge(streak: number) {
  if (streak >= 7)
    return {
      label: "Gold",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    };
  if (streak >= 3)
    return {
      label: "Silver",
      color: "text-slate-500",
      bg: "bg-slate-50",
      border: "border-slate-200",
    };
  return {
    label: "Bronze",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  };
}

function CSSBarChart({
  yields: cropYields,
}: { yields: { year: string; crop: string; kg: number }[] }) {
  const maxKg = Math.max(...cropYields.map((y) => y.kg), 1);

  return (
    <div className="flex items-end gap-2 h-32 pt-2">
      {cropYields.map((y, idx) => {
        const height = Math.max((y.kg / maxKg) * 100, 4);
        const colors = [
          "bg-farm-mid",
          "bg-farm-bright",
          "bg-chart-4",
          "bg-chart-5",
          "bg-chart-1",
        ];
        return (
          <div
            key={`${y.year}-${y.crop}`}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <p className="text-[10px] font-bold text-foreground">{y.kg}kg</p>
            <div
              className={`w-full rounded-t-lg ${colors[idx % colors.length]} transition-all duration-500`}
              style={{ height: `${height}%` }}
            />
            <p className="text-[9px] text-muted-foreground text-center truncate w-full px-0.5">
              {y.crop}
            </p>
            <p className="text-[9px] text-muted-foreground">{y.year}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsScreen() {
  const { data: dailyLogs = [], isLoading: logsLoading } = useUserDailyLogs();
  const { data: cropYields = [], isLoading: yieldsLoading } =
    useUserCropYields();
  const { data: forecasts = [] } = useUserForecasts();
  const { data: estates = [] } = useUserEstates();
  const { data: totalExpenses = 0, isLoading: expensesLoading } =
    useTotalExpenses();
  const { data: totalRevenue = 0, isLoading: revenueLoading } =
    useTotalRevenue();
  const { data: totalRainfall = 0, isLoading: rainfallLoading } =
    useTotalRainfall();

  const isLoading =
    logsLoading || expensesLoading || revenueLoading || rainfallLoading;

  const streak = calculateStreak(dailyLogs);
  const healthScore = calculateFarmHealthScore(
    streak,
    totalRainfall,
    estates.length,
  );
  const badge = getProductivityBadge(streak);

  // Prepare yield chart data
  const yieldChartData = cropYields.slice(0, 6).map((y) => ({
    year: y.year.toString(),
    crop: y.cropName,
    kg: y.yieldKg,
  }));

  // Budget comparison
  const maxBudget = Math.max(totalExpenses, totalRevenue, 1);
  const expensePct = (totalExpenses / maxBudget) * 100;
  const revenuePct = (totalRevenue / maxBudget) * 100;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="farm-gradient-card px-5 pt-12 pb-6 rounded-b-3xl mb-4">
        <h1 className="text-2xl font-display font-bold text-white">
          Analytics 📊
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          Your farm performance overview
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Farm Health Score */}
        <motion.div
          data-ocid="analytics.health_score_card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="farm-gradient-card rounded-2xl p-4 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-white/80" />
              <span className="font-display font-bold text-base">
                Farm Health Score
              </span>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              {healthScore >= 70
                ? "🌟 Excellent"
                : healthScore >= 40
                  ? "📈 Growing"
                  : "🌱 Starting"}
            </Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-12 w-20 bg-white/20" />
          ) : (
            <>
              <p className="text-5xl font-display font-bold leading-none mb-3">
                {healthScore}%
              </p>
              <Progress value={healthScore} className="h-3 bg-white/20" />
              <div className="flex justify-between text-xs text-white/60 mt-1.5">
                <span>0%</span>
                <span>100%</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Productivity Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card border ${badge.border}`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${badge.bg}`}
          >
            <Trophy className={`w-7 h-7 ${badge.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">
              Productivity Badge
            </p>
            <p className={`text-xl font-display font-bold ${badge.color}`}>
              {badge.label} Farmer
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {streak >= 7
                ? "Outstanding commitment! 🌟"
                : streak >= 3
                  ? "Keep it up! 💪"
                  : "Start logging daily 📅"}
            </p>
          </div>
          <div className={`text-right px-3 py-2 rounded-xl ${badge.bg}`}>
            <p className={`text-3xl font-display font-bold ${badge.color}`}>
              {streak}
            </p>
            <p className={`text-xs ${badge.color}`}>days</p>
          </div>
        </motion.div>

        {/* Streak Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">
                Streak Tracker
              </p>
              <p className="text-xs text-muted-foreground">30-day goal</p>
            </div>
            <div className="ml-auto">
              <span className="text-2xl font-display font-bold text-foreground">
                {streak}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                / 30 days
              </span>
            </div>
          </div>
          <Progress value={(streak / 30) * 100} className="h-3 bg-orange-50" />

          {/* Day blocks */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={`day-${i + 1}`}
                className={`w-6 h-6 rounded-md text-[9px] flex items-center justify-center font-bold ${
                  i < streak
                    ? "farm-gradient-light text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-display font-bold text-sm text-foreground">
              Financial Overview
            </h3>
            <span
              className={`ml-auto text-sm font-display font-bold ${netProfit >= 0 ? "text-farm-mid" : "text-destructive"}`}
            >
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(0)} net
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-farm-mid" />
                  Revenue
                </span>
                {revenueLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-bold text-farm-mid">
                    ${totalRevenue.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${revenuePct}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="h-full farm-gradient-light rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingDown className="w-3 h-3 text-destructive" />
                  Expenses
                </span>
                {expensesLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-bold text-destructive">
                    ${totalExpenses.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${expensePct}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full bg-destructive rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rainfall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 shadow-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-bold text-sm text-foreground">
              Total Rainfall
            </h3>
          </div>
          <div className="flex items-baseline gap-1">
            {rainfallLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <span className="text-4xl font-display font-bold text-foreground">
                  {totalRainfall.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground">mm</span>
              </>
            )}
          </div>
          <div className="mt-2 h-2 bg-blue-50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((totalRainfall / 100) * 100, 100)}%`,
              }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-full bg-blue-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Crop Yields Chart */}
        {(yieldsLoading || cropYields.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-card border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-4 h-4 text-farm-mid" />
              <h3 className="font-display font-bold text-sm text-foreground">
                Crop Yields
              </h3>
            </div>

            {yieldsLoading ? (
              <div className="h-32 flex items-end gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="flex-1"
                    style={{ height: `${20 + i * 15}%` }}
                  />
                ))}
              </div>
            ) : yieldChartData.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No crop yield data yet
                </p>
              </div>
            ) : (
              <CSSBarChart yields={yieldChartData} />
            )}
          </motion.div>
        )}

        {/* Forecasts */}
        {forecasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-4 shadow-card border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-4 h-4 text-farm-mid" />
              <h3 className="font-display font-bold text-sm text-foreground">
                Crop Forecasts
              </h3>
            </div>

            <div className="space-y-2">
              {forecasts.slice(0, 5).map((forecast, idx) => {
                const estateForForecast = estates.find(
                  (e) => e.id === forecast.estateId,
                );
                return (
                  <motion.div
                    key={forecast.id.toString()}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    data-ocid={`analytics.item.${idx + 1}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-farm-pale"
                  >
                    <div className="w-8 h-8 rounded-lg farm-gradient-light flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-xs text-foreground">
                        {forecast.cropName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {forecast.forecastDate}
                      </p>
                      {estateForForecast && (
                        <p className="text-[11px] text-muted-foreground">
                          {estateForForecast.name}
                        </p>
                      )}
                      {forecast.forecastNote && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {forecast.forecastNote}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
