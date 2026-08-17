import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "CredoNomics Investment Solutions — Research beyond market noise";

export const size = {
  width: 1200,
  height: 630,
};

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
          background:
            "linear-gradient(135deg, #05070b 0%, #09120f 55%, #071018 100%)",
          color: "#f7f8fa",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              border: "1px solid rgba(72,230,166,.42)",
              background: "rgba(72,230,166,.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#48e6a6",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            C
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 31, fontWeight: 800 }}>CredoNomics</div>
            <div
              style={{
                color: "#8d96a5",
                fontSize: 15,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Investment Solutions
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 980,
          }}
        >
          <div
            style={{
              color: "#48e6a6",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            Independent Market Intelligence
          </div>

          <div
            style={{
              fontSize: 72,
              lineHeight: 1.03,
              fontWeight: 800,
              letterSpacing: -3,
            }}
          >
            Research beyond
          </div>

          <div
            style={{
              fontSize: 72,
              lineHeight: 1.03,
              fontWeight: 800,
              letterSpacing: -3,
              color: "#737d8a",
            }}
          >
            market noise.
          </div>

          <div
            style={{
              marginTop: 28,
              color: "#a5adb8",
              fontSize: 22,
              lineHeight: 1.45,
            }}
          >
            Equity research â€¢ IPO intelligence â€¢ Mutual-fund analytics â€¢
            Financial tools
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,.12)",
            color: "#727b88",
            fontSize: 16,
          }}
        >
          <span>credonomics.in</span>
          <span>Data â€¢ Research â€¢ Perspective</span>
        </div>
      </div>
    ),
    size
  );
}