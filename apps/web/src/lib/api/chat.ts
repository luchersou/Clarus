import { authHeaders } from "@/lib/api/auth-headers";

const API_URL = process.env.API_GATEWAY_URL!;

export async function getChatSessions() {
  const res = await fetch(`${API_URL}/chat/sessions`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch chat sessions");
  return res.json();
}

export async function getSessionMessages(sessionId: string) {
  const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch session messages");
  return res.json();
}