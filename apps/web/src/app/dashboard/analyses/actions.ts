"use server";

import { revalidatePath } from "next/cache";
import { authHeaders } from "@/lib/api/auth-headers";
import { getAnalyses } from "@/lib/api/analyses";

const API_URL = process.env.API_GATEWAY_URL!;

const REQUEST_FAILED = "Unable to start analysis. Please try again.";

// Returned instead of thrown: Next.js hides thrown error messages from the client in production.
export type RequestAnalysisResult = { ok: true } | { ok: false; error: string };

export async function requestAnalysis(
  documentId: string,
  type: string,
): Promise<RequestAnalysisResult> {
  const res = await fetch(`${API_URL}/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: JSON.stringify({ documentId, type }),
  });

  if (!res.ok) {
    return { ok: false, error: await requestErrorMessage(res) };
  }

  revalidatePath("/dashboard/analyses");
  return { ok: true };
}

// The gateway explains quota (429) and duplicate (409) rejections; other failures stay generic.
async function requestErrorMessage(res: Response): Promise<string> {
  if (res.status !== 409 && res.status !== 429) return REQUEST_FAILED;

  const body = await res.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : REQUEST_FAILED;
}

export async function deleteAnalysis(id: string) {
  const res = await fetch(`${API_URL}/analyses/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete analysis");
  }

  revalidatePath("/dashboard/analyses");
}

export async function getAnalysesAction(documentId?: string) {
  return getAnalyses(documentId);
}