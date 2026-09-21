import React from "react";

interface LogoTHDDProps {
  className?: string;
  size?: number | string;
}

export default function LogoTHDD({ className = "", size = 56 }: LogoTHDDProps) {
  const [imgError, setImgError] = React.useState(false);

  if (!imgError) {
    return (
      <img
        src="/logo_THDD.png"
        alt="Logo Tin Học Đại Dương"
        className={`object-contain rounded-xl ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Pure SVG reproduction matching the exact logo geometry and colors
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      style={{ width: size, height: size }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Cyan Sail */}
      <path
        d="M86 42C83 75 70 115 40 138C62 136 78 131 92 122C94 92 92 65 86 42Z"
        fill="#00ADEF"
      />

      {/* Right Royal Navy Sail */}
      <path
        d="M102 12C100 58 108 95 148 132C125 130 110 122 101 112C99 82 99 50 102 12Z"
        fill="#103783"
      />

      {/* Bottom Wave / Open Book Base */}
      <path
        d="M26 142C62 140 85 152 97 172C109 152 132 140 168 142C142 154 116 158 97 182C78 158 52 154 26 142Z"
        fill="#103783"
      />

      {/* Text TIN HỌC */}
      <text
        x="97"
        y="204"
        textAnchor="middle"
        fontFamily="'Times New Roman', Times, serif"
        fontWeight="bold"
        fontSize="22"
        letterSpacing="3"
        fill="#103783"
      >
        TIN HỌC
      </text>

      {/* Text ĐẠI DƯƠNG */}
      <text
        x="97"
        y="230"
        textAnchor="middle"
        fontFamily="'Times New Roman', Times, serif"
        fontWeight="bold"
        fontSize="21"
        letterSpacing="2"
        fill="#103783"
      >
        ĐẠI DƯƠNG
      </text>
    </svg>
  );
}
