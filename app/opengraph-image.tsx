import { ImageResponse } from "next/og";
import { profile } from "@/data/content";

export const alt = `${profile.name} – portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000", color: "#f2f2f2", padding: 72 }}>
        <div style={{ fontSize: 34, display: "flex" }}>{profile.roles.join("  /  ")}</div>
        <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 0.92, letterSpacing: -4, display: "flex", flexDirection: "column" }}>
          <span>Abdul Rehman</span>
          <span>Zaki</span>
        </div>
      </div>
    ),
    size,
  );
}
