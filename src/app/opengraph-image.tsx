import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DeeCodeK Labs — Software Studio. Product Lab.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #041c1a 0%, #0a3d36 45%, #087F70 100%)",
          color: "#f4faf8",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.85,
            fontWeight: 600,
          }}
        >
          DeeCodeK Labs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            Software Studio. Product Lab.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              opacity: 0.88,
              maxWidth: 860,
              lineHeight: 1.35,
            }}
          >
            Custom products, scalable backends, and useful tools engineered for production.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            opacity: 0.75,
            letterSpacing: "0.04em",
          }}
        >
          deecodeklabs.com
        </div>
      </div>
    ),
    { ...size }
  );
}
