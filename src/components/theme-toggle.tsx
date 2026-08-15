"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  cycleTheme,
  readStoredTheme,
  type ThemePreference,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const LABEL: Record<ThemePreference, string> = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};

const NEXT_HINT: Record<ThemePreference, string> = {
  light: "Switch to dark theme",
  dark: "Switch to system theme",
  system: "Switch to light theme",
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
    setMounted(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const pref = readStoredTheme();
      if (pref === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function onToggle() {
    const next = cycleTheme(theme);
    setTheme(next);
    applyTheme(next);
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Laptop;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-muted-bg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={mounted ? NEXT_HINT[theme] : "Toggle theme"}
      title={mounted ? `${LABEL[theme]} — click to change` : "Toggle theme"}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">
        {mounted ? LABEL[theme] : "Theme"}
      </span>
    </button>
  );
}
