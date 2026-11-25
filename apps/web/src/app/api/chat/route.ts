import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.API_GATEWAY_URL!;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const gatewayResponse = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!gatewayResponse.ok || !gatewayResponse.body) {
    const errorBody = await gatewayResponse.text().catch(() => null);
    console.error("Chat gateway error:", gatewayResponse.status, errorBody);

    // Client errors (rate limit, validation, missing session) carry a message worth showing
    const status = gatewayResponse.status;
    if (status >= 400 && status < 500 && status !== 401) {
      return NextResponse.json(
        { error: gatewayErrorMessage(errorBody) ?? "The message couldn't be sent." },
        { status },
      );
    }

    return NextResponse.json(
      { error: "Failed to reach chat service" },
      { status: 502 },
    );
  }

  return new NextResponse(gatewayResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Nest error bodies look like { statusCode, message, error }; message may be a list
function gatewayErrorMessage(body: string | null): string | null {
  if (!body) return null;
  try {
    const { message } = JSON.parse(body) as { message?: unknown };
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  } catch {
    // Not JSON: fall back to the generic message
  }
  return null;
}
