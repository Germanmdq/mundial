import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mundial entre Amigos";
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
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #061426 0%, #0b1d35 52%, #0071e3 100%)",
          color: "white",
          padding: "76px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, width: 690 }}>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "12px 20px",
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            Pozo acumulado
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 82, lineHeight: 0.95, fontWeight: 900, letterSpacing: -3 }}>
              Mundial entre Amigos
            </div>
            <div style={{ fontSize: 34, lineHeight: 1.25, color: "rgba(255,255,255,0.84)", fontWeight: 700 }}>
              Armá tu predicción del Mundial 2026.
            </div>
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.78)", fontWeight: 700 }}>
            Cada participación suma al premio.
          </div>
        </div>

        <div
          style={{
            width: 330,
            height: 330,
            borderRadius: 82,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 34px 90px rgba(0,0,0,0.34)",
          }}
        >
          <svg width="220" height="220" viewBox="0 0 512 512" fill="none">
            <path d="M170 150h172v56c0 70-37 121-86 121s-86-51-86-121v-56Z" fill="white" />
            <path d="M164 172h-42c0 48 27 84 68 94" stroke="white" strokeWidth="28" strokeLinecap="round" />
            <path d="M348 172h42c0 48-27 84-68 94" stroke="white" strokeWidth="28" strokeLinecap="round" />
            <path d="M256 327v56" stroke="white" strokeWidth="30" strokeLinecap="round" />
            <path d="M202 406h108" stroke="white" strokeWidth="34" strokeLinecap="round" />
            <path d="M218 196h76M218 244h76" stroke="#0071e3" strokeWidth="20" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
