import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NairaCloud — Join the waitlist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1e2024",
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 420,
            borderRadius: 999,
            background: "rgba(78, 201, 176, 0.28)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#F5F5F5",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "#4ec9b0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            N
          </div>
          NairaCloud
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.02,
              color: "#F5F5F5",
            }}
          >
            Serious cloud.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.02,
              color: "#4ec9b0",
            }}
          >
            No dollar drama.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 28,
              color: "#8A8F98",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Cloud priced in naira. Paystack checkout. Join the early access waitlist.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#5C6169",
            fontSize: 22,
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span>Early access</span>
          <span style={{ color: "#4ec9b0" }}>nairacloud.xyz</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
