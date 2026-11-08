"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { DASHBOARD_THEME_COOKIE, type DashboardTheme } from "@/app/dashboard/_lib/theme";

type DashboardThemeContextValue = {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
};

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Dark mode that only exists inside the dashboard.
 *
 * The wrapper div carries the `dark` class from the server render (read from a
 * cookie), so the first paint is already themed. Portaled UI (dialogs, menus,
 * tooltips) renders outside the wrapper, so the class is mirrored onto <html>
 * while the dashboard is mounted and removed when it unmounts — leaving the
 * landing page and login screen untouched after the user leaves.
 */
export function DashboardThemeProvider({
  initialTheme,
  className,
  style,
  children,
}: {
  initialTheme: DashboardTheme;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<DashboardTheme>(initialTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = theme;

    return () => {
      root.classList.remove("dark");
      root.style.removeProperty("color-scheme");
    };
  }, [theme]);

  const setTheme = useCallback((next: DashboardTheme) => {
    setThemeState(next);
    document.cookie = `${DASHBOARD_THEME_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <DashboardThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        className={cn(theme === "dark" && "dark", "bg-background text-foreground", className)}
        style={{ colorScheme: theme, ...style }}
      >
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error("useDashboardTheme must be used inside DashboardThemeProvider");
  }
  return context;
}
