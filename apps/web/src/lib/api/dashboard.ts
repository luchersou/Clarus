import { authHeaders } from "@/lib/api/auth-headers";

const API_URL = process.env.API_GATEWAY_URL!;

export async function getDashboardSummary() {
  const res = await fetch(`${API_URL}/dashboard/summary`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}