import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "CredoNomics Investment Solutions — Research beyond market noise";

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 70px",
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
            gap: 16,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 15,
              border: "1px solid rgba(72,230,166,.42)",
              background: "rgba(72,230,166,.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#48e6a6",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            C
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <div style={{ fontSize: 29, fontWeight: 800 }}>CredoNomics</div>
            <div
              style={{
                color: "#8d96a5",
                fontSize: 14,
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
          }}
        >
          <div
            style={{
              color: "#48e6a6",
              fontSize: 17,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Independent Market Intelligence
          </div>

          <div
            style={{
              fontSize: 66,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: -3,
            }}
          >
            Research beyond
          </div>

          <div
            style={{
              fontSize: 66,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: -3,
              color: "#737d8a",
            }}
          >
            market noise.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,.12)",
            paddingTop: 21,
            color: "#727b88",
            fontSize: 15,
          }}
        >
          <span>credonomics.in</span>
          <span>Equity â€¢ IPO â€¢ Mutual Funds â€¢ Tools</span>
        </div>
      </div>
    ),
    size
  );
}