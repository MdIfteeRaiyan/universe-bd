import { ImageResponse } from "next/og";

export const alt = "CampusChoice BD university decision guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "76px", color: "#eef6ff", background: "linear-gradient(135deg,#101827 0%,#172a45 58%,#0d5960 100%)", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "920px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ width: "92px", height: "92px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "26px", border: "2px solid #67e8f9", background: "#14243a", color: "#67e8f9", fontSize: "38px", fontWeight: 800 }}>CC</div>
          <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, letterSpacing: "-2px" }}>CampusChoice BD</div>
        </div>
        <div style={{ display: "flex", marginTop: "56px", fontSize: "66px", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-2px" }}>Choose your university with clearer facts.</div>
        <div style={{ display: "flex", marginTop: "30px", fontSize: "28px", lineHeight: 1.4, color: "#bfd1e6" }}>Compare source-checked programmes, costs, scholarships and admission information across Bangladesh.</div>
        <div style={{ display: "flex", marginTop: "42px", color: "#67e8f9", fontSize: "22px", fontWeight: 700 }}>Not the best university. The best fit for you.</div>
      </div>
    </div>,
    size,
  );
}
