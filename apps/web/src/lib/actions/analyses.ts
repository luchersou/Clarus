"use server";

import { revalidatePath } from "next/cache";
import { authHeaders } from "@/lib/api/auth-headers";
import { getAnalyses } from "../api/analyses";

const API_URL = process.env.API_GATEWAY_URL!;

export async function requestAnalysis(documentId: string, type: string) {
  const res = await fetch(`${API_URL}/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: JSON.stringify({ documentId, type }),
  });

  if (!res.ok) {
    throw new Error("Failed to request analysis");
  }

  revalidatePath("/dashboard/analyses");
  return res.json();
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