import { Download, Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// Extend the BeforeInstallPromptEvent type (not in standard TS lib)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "plantation360_pwa_prompt_dismissed";

export default function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if previously dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setPromptEvent(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-ocid="pwa.panel"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-sm px-3 z-50"
        >
          <div
            className="rounded-2xl shadow-lg overflow-hidden border border-white/20"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.42 0.17 148) 0%, oklch(0.32 0.12 152) 100%)",
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">
                  Install Plantation 360
                </p>
                <p className="text-white/70 text-xs mt-0.5 leading-tight">
                  Add as an app on your phone
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  data-ocid="pwa.primary_button"
                  onClick={() => void handleInstall()}
                  className="flex items-center gap-1.5 bg-white text-farm-deep font-bold text-xs px-3 py-2 rounded-xl hover:bg-white/90 active:scale-95 transition-all duration-150"
                  style={{ color: "oklch(0.32 0.12 148)" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
                <button
                  type="button"
                  data-ocid="pwa.close_button"
                  onClick={handleDismiss}
                  className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all duration-150"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
