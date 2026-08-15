import { ImageResponse } from "next/og";

export const alt = "PicTofu — Your cute online photobooth";
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
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 86px",
          background: "linear-gradient(135deg,#fffaf5 0%,#ffe9ef 48%,#eee8ff 100%)",
          color: "#342b2a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "690px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "34px", fontWeight: 800 }}>
            <div
              style={{
                width: "72px",
                height: "66px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #b87860",
                borderRadius: "20px",
                background: "#fffdf9",
                fontSize: "22px",
              }}
            >
              •‿•
            </div>
            PicTofu
          </div>
          <div style={{ marginTop: "54px", fontSize: "76px", lineHeight: 1.02, fontWeight: 850, letterSpacing: "-3px" }}>
            Your cute online photobooth
          </div>
          <div style={{ marginTop: "28px", fontSize: "27px", color: "#756865" }}>
            No install. Open. Pose. Download.
          </div>
        </div>

        <div
          style={{
            width: "260px",
            height: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            padding: "18px",
            borderRadius: "28px",
            background: "#ffdce6",
            boxShadow: "0 25px 50px rgba(120,75,85,.16)",
            transform: "rotate(4deg)",
          }}
        >
          {["✌", "♡", "✦", "☺"].map((mark) => (
            <div
              key={mark}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "15px",
                background: "linear-gradient(145deg,#d6b4aa,#f6ddd3)",
                color: "#68484a",
                fontSize: "42px",
              }}
            >
              {mark}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "center", fontSize: "20px", fontWeight: 800, color: "#845665" }}>
            ✦ PicTofu ♡
          </div>
        </div>
      </div>
    ),
    size,
  );
}
