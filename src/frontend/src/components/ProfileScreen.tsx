import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Loader2,
  LogOut,
  Share2,
  Smartphone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveUserProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfileScreen() {
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const { clear } = useInternetIdentity();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  // Detect mobile browser (not standalone PWA)
  const isMobileBrowser =
    typeof navigator !== "undefined" &&
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) &&
    !window.matchMedia("(display-mode: standalone)").matches;

  // Pre-fill with existing profile name
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: trimmedName });
      setSaved(true);
      toast.success("Profile updated! 🌿");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleSignOut = () => {
    clear();
  };

  // Avatar initials from name
  const initials = name.trim()
    ? name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with farm gradient */}
      <div className="farm-gradient-card px-4 pt-12 pb-10 relative overflow-hidden">
        {/* Decorative leaves */}
        <div className="absolute top-3 right-6 opacity-10">
          <Leaf className="w-16 h-16 text-white rotate-12" />
        </div>
        <div className="absolute bottom-2 left-4 opacity-10">
          <Leaf className="w-10 h-10 text-white -rotate-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-3xl bg-white/20" />
            ) : (
              <span className="text-white font-display font-bold text-2xl">
                {initials}
              </span>
            )}
          </div>

          {/* Name & label */}
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="h-6 w-32 bg-white/20 mx-auto" />
            ) : (
              <h1 className="text-white font-display font-bold text-xl leading-tight">
                {profile?.name || "Farmer"}
              </h1>
            )}
            <p className="text-white/70 text-sm mt-0.5">Your Profile</p>
          </div>
        </motion.div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card border border-border p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl farm-gradient-light flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display font-bold text-foreground text-base">
              Account
            </h2>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="profile-name"
                className="text-sm font-medium text-foreground"
              >
                Your Name
              </Label>
              {isLoading ? (
                <Skeleton className="h-12 w-full rounded-xl" />
              ) : (
                <Input
                  id="profile-name"
                  data-ocid="profile.name_input"
                  placeholder="e.g. Jay Kamau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleSave()}
                  className="h-12 rounded-xl text-base border-input focus-visible:ring-ring"
                  autoComplete="name"
                />
              )}
              <p className="text-xs text-muted-foreground">
                This name appears on your dashboard and logs
              </p>
            </div>

            <Button
              data-ocid="profile.save_button"
              onClick={() => void handleSave()}
              disabled={saveProfile.isPending || isLoading}
              className="w-full h-12 rounded-xl font-display font-bold text-base farm-gradient-light text-white shadow-green transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Add to Home Screen tip — mobile only */}
        {isMobileBrowser && (
          <motion.div
            data-ocid="profile.panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl border border-border overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.95 0.04 140) 0%, oklch(0.92 0.06 142) 100%)",
            }}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl farm-gradient-light flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-display font-bold text-foreground text-base">
                  Install as App
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Get the full app experience — faster loading, full-screen, and
                works with cached data offline.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 bg-white/70 rounded-xl p-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      iPhone (Safari)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tap the Share icon → &ldquo;Add to Home Screen&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white/70 rounded-xl p-3">
                  <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smartphone className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Android (Chrome)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tap the menu (⋮) → &ldquo;Install App&rdquo; or &ldquo;Add
                      to Home Screen&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Danger Zone / Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card border border-border p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="font-display font-bold text-foreground text-base">
              Account Actions
            </h2>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Signing out will end your session. Your data stays safe in the
              cloud.
            </p>
            <Button
              data-ocid="profile.signout_button"
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-12 rounded-xl font-display font-semibold text-base border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50 transition-all duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* App info footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
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
