"use server";

import { revalidatePath } from "next/cache";
import { authHeaders } from "@/lib/api/auth-headers";
import { getDocumentById } from "@/lib/api/documents";

const API_URL = process.env.API_GATEWAY_URL!;

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: await authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload document");
  }

  revalidatePath("/dashboard/documents");
  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete document");
  }

  revalidatePath("/dashboard/documents");
}

export async function getDocumentByIdAction(id: string) {
  return getDocumentById(id);
}