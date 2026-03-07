import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  ClipboardList,
  Cloud,
  CloudRain,
  Home,
  Shield,
  UserCircle,
  Users,
  Wheat,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import AdminPanelScreen from "./components/AdminPanelScreen";
import AnalyticsScreen from "./components/AnalyticsScreen";
import AuthScreen from "./components/AuthScreen";
import DailyLogsScreen from "./components/DailyLogsScreen";
import Dashboard from "./components/Dashboard";
import EstatesScreen from "./components/EstatesScreen";
import HarvestScreen from "./components/HarvestScreen";
import LabourScreen from "./components/LabourScreen";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import ProfileScreen from "./components/ProfileScreen";
import ProfileSetup from "./components/ProfileSetup";
import RainfallScreen from "./components/RainfallScreen";
import WeatherScreen from "./components/WeatherScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";

type Tab =
  | "home"
  | "logs"
  | "estates"
  | "rainfall"
  | "labour"
  | "analytics"
  | "harvest"
  | "weather"
  | "profile"
  | "admin";

const BASE_NAV_ITEMS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "logs", label: "Logs", icon: ClipboardList },
  { id: "rainfall", label: "Rain", icon: CloudRain },
  { id: "labour", label: "Labour", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "harvest", label: "Harvest", icon: Wheat },
  { id: "weather", label: "Weather", icon: Cloud },
  { id: "profile", label: "Profile", icon: UserCircle },
];

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { data: isAdmin = false } = useIsAdmin();

  const NAV_ITEMS = isAdmin
    ? [...BASE_NAV_ITEMS, { id: "admin" as Tab, label: "Admin", icon: Shield }]
    : BASE_NAV_ITEMS;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center farm-gradient-card">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto">
            <img
              src="/assets/generated/plantation360-logo-transparent.dim_120x120.png"
              alt="Plantation 360"
              className="w-10 h-10 object-contain"
            />
          </div>
          <Skeleton className="h-4 w-32 bg-white/20 mx-auto" />
          <p className="text-white/60 text-sm">Loading Plantation 360...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <AuthScreen />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onNavigate={(tab) => setActiveTab(tab as Tab)} />;
      case "logs":
        return <DailyLogsScreen />;
      case "estates":
        return <EstatesScreen />;
      case "rainfall":
        return <RainfallScreen />;
      case "labour":
        return <LabourScreen />;
      case "analytics":
        return <AnalyticsScreen />;
      case "harvest":
        return <HarvestScreen />;
      case "weather":
        return <WeatherScreen />;
      case "profile":
        return <ProfileScreen />;
      case "admin":
        return <AdminPanelScreen />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab as Tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="top-center" />
      <ProfileSetup />
      <PWAInstallPrompt />

      {/* App container — phone-like max width */}
      <div className="flex-1 w-full max-w-sm mx-auto relative">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white/95 backdrop-blur-md border-t border-border bottom-safe z-50">
          <div className="flex items-center overflow-x-auto scrollbar-hide px-2 py-2 gap-1 snap-x snap-mandatory">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  data-ocid={`nav.${item.id}_tab`}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 flex-shrink-0 min-w-[58px] snap-start ${
                    isActive
                      ? "bg-farm-pale text-farm-mid"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`relative ${isActive ? "scale-110" : ""} transition-transform duration-200`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-farm-mid" : ""}`}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-farm-mid"
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-none ${isActive ? "text-farm-mid font-bold" : ""}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
