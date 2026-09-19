import { authHeaders } from "@/lib/api/auth-headers";

const API_URL = process.env.API_GATEWAY_URL!;

export async function getAnalyses(documentId?: string) {
  const url = new URL(`${API_URL}/analyses`);
  if (documentId) {
    url.searchParams.set("documentId", documentId);
  }

  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch analyses");
  return res.json();
}

export async function getAnalysisById(id: string) {
  const res = await fetch(`${API_URL}/analyses/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}