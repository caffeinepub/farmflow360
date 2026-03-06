import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AuthScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const [showInfo, setShowInfo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 farm-gradient-card" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-4 shadow-green"
          >
            <img
              src="/assets/generated/plantation360-logo-transparent.dim_120x120.png"
              alt="Plantation 360"
              className="w-12 h-12 object-contain"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold text-white"
          >
            Plantation 360
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm mt-1 font-body"
          >
            Estate Management App
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-card-foreground">
              Welcome back 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to manage your farm
            </p>
          </div>

          {/* Demo fields — decorative only, actual auth via Internet Identity */}
          <div className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                className="h-11 rounded-xl border-border bg-farm-pale focus:ring-primary"
                data-ocid="auth.email_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-farm-pale pr-10 focus:ring-primary"
                  data-ocid="auth.password_input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-12 rounded-xl font-display font-bold text-base farm-gradient-light text-white shadow-green hover:shadow-card-hover transition-all duration-200"
            data-ocid="auth.login_button"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Leaf className="mr-2 h-4 w-4" />
                Login with Internet Identity
              </>
            )}
          </Button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              data-ocid="auth.signup_button"
            >
              New here? Tap Login to create an account →
            </button>
          </div>

          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 p-3 bg-farm-pale rounded-xl text-xs text-muted-foreground"
            >
              Internet Identity is a secure, passwordless login system on the
              Internet Computer. One tap to create your account and start
              tracking your farm.
            </motion.div>
          )}
        </motion.div>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/80"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
