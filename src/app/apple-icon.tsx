import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #ff7a42 0%, #ff642f 48%, #ff4f29 100%)",
          borderRadius: "28%",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 42,
            background: "#fff",
            color: "#ff642f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily:
              "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            letterSpacing: "-0.08em",
          }}
        >
          M
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
