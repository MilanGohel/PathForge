export const THEME_STORAGE_KEY = "pathforge-theme";

export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "light" || preference === "dark") return preference;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Apply preference to <html> and persist. */
export function applyTheme(preference: ThemePreference): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveTheme(preference);
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = preference;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // ignore quota / private mode
  }
}

export function cycleTheme(current: ThemePreference): ThemePreference {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}
