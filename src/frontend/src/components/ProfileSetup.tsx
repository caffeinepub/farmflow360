import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isLoading && !profile?.name) {
      // Small delay to avoid flash on first load
      const timer = setTimeout(() => setShowSetup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success(`Welcome to FarmFlow360, ${name.trim()}! 🌿`);
      setShowSetup(false);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {showSetup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            {/* Logo */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl farm-gradient flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">
                Welcome to FarmFlow360! 🌱
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Let&apos;s set up your farmer profile
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Your Name</Label>
                <Input
                  placeholder="e.g. Jay Kamau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saveProfile.isPending}
                className="w-full h-12 rounded-xl font-display font-bold text-base farm-gradient-light text-white shadow-green"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Start Farming 🌿"
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowSetup(false)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
