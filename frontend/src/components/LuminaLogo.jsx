import React from "react";

export const LuminaLogo = ({ size = 40 }) => (
  <div
    className="relative flex items-center justify-center shrink-0"
    style={{
      width: size, height: size,
    }}
  >
    <img 
      src="https://res.cloudinary.com/ddptxvwrj/image/upload/v1789991990/Screenshot_2026-09-21_172644_efdsxz.png" 
      alt="Lumina" 
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </div>
);
