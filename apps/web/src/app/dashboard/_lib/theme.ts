export type DashboardTheme = "light" | "dark";

export const DASHBOARD_THEME_COOKIE = "dashboard-theme";

export function parseDashboardTheme(value: string | undefined): DashboardTheme {
  return value === "dark" ? "dark" : "light";
}
