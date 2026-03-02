import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#fba918",
          borderRadius: "7px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="22"
          height="22"
        >
          <path
            d="M23.75 3L13.75 23h8L17.75 45 34.25 21h-8.5l5-18z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
