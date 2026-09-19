import { authHeaders } from "@/lib/api/auth-headers";

const API_URL = process.env.API_GATEWAY_URL!;

export async function getDocuments() {
  const res = await fetch(`${API_URL}/documents`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function getDocumentById(id: string) {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}