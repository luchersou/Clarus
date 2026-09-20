import { cache } from "react";
import { authHeaders } from "./auth-headers";

const API_URL = process.env.API_GATEWAY_URL!;

export const getDashboardSummary = cache(async () => {
  const res = await fetch(`${API_URL}/dashboard/summary`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch dashboard summary: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
});