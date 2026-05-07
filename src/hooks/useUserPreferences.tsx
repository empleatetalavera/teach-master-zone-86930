import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "teal" | "blue" | "green" | "purple" | "orange" | "rose";

export interface UserPreferences {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontScale: number;
}

const DEFAULTS: UserPreferences = { theme: "system", accentColor: "teal", fontScale: 1 };

const ACCENT_HSL: Record<AccentColor, { primary: string; primaryGlow: string; ring: string }> = {
  teal: { primary: "174 62% 47%", primaryGlow: "174 62% 60%", ring: "174 62% 47%" },
  blue: { primary: "217 91% 60%", primaryGlow: "217 91% 72%", ring: "217 91% 60%" },
  green: { primary: "142 71% 45%", primaryGlow: "142 71% 58%", ring: "142 71% 45%" },
  purple: { primary: "271 76% 53%", primaryGlow: "271 76% 65%", ring: "271 76% 53%" },
  orange: { primary: "25 95% 53%", primaryGlow: "25 95% 65%", ring: "25 95% 53%" },
  rose: { primary: "346 77% 50%", primaryGlow: "346 77% 62%", ring: "346 77% 50%" },
};

interface Ctx {
  prefs: UserPreferences;
  loading: boolean;
  update: (patch: Partial<UserPreferences>) => Promise<void>;
}

const PreferencesContext = createContext<Ctx | null>(null);

const applyPreferences = (p: UserPreferences) => {
  const root = document.documentElement;

  // Theme
  const isDark =
    p.theme === "dark" ||
    (p.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);

  // Accent color (overrides --primary tokens)
  const c = ACCENT_HSL[p.accentColor] || ACCENT_HSL.teal;
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--primary-glow", c.primaryGlow);
  root.style.setProperty("--ring", c.ring);
  root.style.setProperty("--sidebar-primary", c.primary);
  root.style.setProperty("--sidebar-ring", c.ring);

  // Font scale
  root.style.fontSize = `${16 * p.fontScale}px`;
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const cached = localStorage.getItem("user_preferences");
      return cached ? { ...DEFAULTS, ...JSON.parse(cached) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const [loading, setLoading] = useState(false);

  // Apply on every change
  useEffect(() => {
    applyPreferences(prefs);
    try { localStorage.setItem("user_preferences", JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  // Re-apply when system theme flips
  useEffect(() => {
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyPreferences(prefs);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [prefs]);

  // Load from DB on user change
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_preferences")
        .select("theme, accent_color, font_scale")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setPrefs({
          theme: (data.theme as ThemeMode) || "system",
          accentColor: (data.accent_color as AccentColor) || "teal",
          fontScale: Number(data.font_scale) || 1,
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const update = useCallback(async (patch: Partial<UserPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if (!user) return;
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      theme: next.theme,
      accent_color: next.accentColor,
      font_scale: next.fontScale,
    }, { onConflict: "user_id" });
  }, [prefs, user]);

  return (
    <PreferencesContext.Provider value={{ prefs, loading, update }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("useUserPreferences must be used within PreferencesProvider");
  return ctx;
}
