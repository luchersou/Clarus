import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/api/documents";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const document = await getDocumentById(id);
    return NextResponse.json(document);
  } catch {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
}