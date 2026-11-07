import { ImageResponse } from "next/og";

export const alt = "Clarus — Ask your documents.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#34c67a";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        color: "#fafafa",
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(52, 198, 122, 0.28), transparent 55%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            fontSize: 38,
            fontWeight: 700,
            color: "#0a0a0a",
            backgroundColor: GREEN,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 40, fontWeight: 600 }}>Clarus</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3 }}>
          Ask your documents.
        </div>
        <div style={{ fontSize: 34, color: "#a3a3a3" }}>
          AI answers from your contracts, invoices and reports.
        </div>
      </div>
    </div>,
    size,
  );
}
