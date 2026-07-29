import { ImageResponse } from "next/og";

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
          background:
            "linear-gradient(145deg, #ff7a42 0%, #ff642f 48%, #ff4f29 100%)",
          borderRadius: "24%",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 92,
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 28px 80px rgba(255,100,47,0.32)",
          }}
        >
          <div
            style={{
              width: 246,
              height: 246,
              borderRadius: 80,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff642f",
              fontSize: 154,
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
      </div>
    ),
    {
      ...size,
    },
  );
}
