import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0071e3 0%, #061426 100%)",
        }}
      >
        <svg width="320" height="320" viewBox="0 0 512 512" fill="none">
          <circle cx="256" cy="258" r="160" stroke="rgba(255,255,255,.18)" strokeWidth="18" />
          <path d="M170 150h172v56c0 70-37 121-86 121s-86-51-86-121v-56Z" fill="white" />
          <path d="M164 172h-42c0 48 27 84 68 94" stroke="white" strokeWidth="28" strokeLinecap="round" />
          <path d="M348 172h42c0 48-27 84-68 94" stroke="white" strokeWidth="28" strokeLinecap="round" />
          <path d="M256 327v56" stroke="white" strokeWidth="30" strokeLinecap="round" />
          <path d="M202 406h108" stroke="white" strokeWidth="34" strokeLinecap="round" />
          <path d="M218 196h76M218 244h76" stroke="#0071e3" strokeWidth="20" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
