import React from 'react';

interface RbEmblemProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

/**
 * Emblema corporativo oficial "RB" (Recreación exacta 1:1 de Cmpleto.png)
 * Cuadro rojo vibrante (#FF0000) con marco gris perimetral (#555555),
 * letras "RB" en color plata/gris claro (#EAEAEA) con relieve 3D gris oscuro (#3D3D3D),
 * reflejo en esquina superior derecha y sombras ovaladas oscuras (#800000) en la base.
 */
export const RbEmblem: React.FC<RbEmblemProps> = ({
  className = '',
  size = 56,
  alt = 'Logo RB',
}) => {
  return (
    <div
      className={`inline-block select-none shrink-0 aspect-square ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        {/* Outer squircle frame in charcoal gray (#555555) with pure red (#FF0000) fill */}
        <rect
          x="8.5"
          y="8.5"
          width="183"
          height="183"
          rx="26"
          fill="#FF0000"
          stroke="#555555"
          strokeWidth="15"
          strokeLinejoin="round"
        />

        {/* Top-right corner gloss highlight reflection */}
        <path
          d="M 146 19 C 160 21 172 28 178 39 C 175 29 165 22 152 19 Z"
          fill="#FF7575"
          opacity="0.85"
        />
        <ellipse
          cx="168"
          cy="28"
          rx="7"
          ry="3.5"
          transform="rotate(-28 168 28)"
          fill="#FFA3A3"
          opacity="0.75"
        />

        {/* Base contact oval shadows under R and B (#800000) */}
        <ellipse cx="62" cy="164" rx="34" ry="7" fill="#800000" />
        <ellipse cx="138" cy="164" rx="34" ry="7" fill="#800000" />

        {/* ==================== 3D EXTRUSION SHADOWS (#3D3D3D) ==================== */}
        {/* 3D Dark Shadow for R (offset down-right by 7.5px) */}
        <g fill="#3D3D3D">
          {/* Stem & Loop base shadow */}
          <path
            d="M 28,48 L 48,48 L 48,148 L 28,148 Z
               M 70,48 C 86,48 97,58 97,73 C 97,84 90,92 79,96 L 99,148 L 81,148 L 64,102 L 48,102 L 48,48 Z"
            transform="translate(7.5, 7.5)"
          />
          {/* Diagonal connecting faces for R */}
          <polygon points="28,48 35.5,55.5 35.5,155.5 28,148" />
          <polygon points="28,148 35.5,155.5 55.5,155.5 48,148" />
          <polygon points="70,48 77.5,55.5 104.5,80.5 97,73" />
          <polygon points="97,73 104.5,80.5 104.5,88 97,82" />
          <polygon points="79,96 86.5,103.5 106.5,155.5 99,148" />
          <polygon points="81,148 88.5,155.5 106.5,155.5 99,148" />
          <polygon points="48,102 55.5,109.5 71.5,109.5 64,102" />
        </g>

        {/* 3D Dark Shadow for B (offset down-right by 7.5px) */}
        <g fill="#3D3D3D">
          {/* B body shadow */}
          <path
            d="M 104,48 L 148,48 C 162,48 172,56 172,69 C 172,78 166,86 155,90 C 168,94 175,103 175,118 C 175,134 162,148 147,148 L 104,148 Z"
            transform="translate(7.5, 7.5)"
          />
          {/* Diagonal connecting faces for B */}
          <polygon points="104,48 111.5,55.5 111.5,155.5 104,148" />
          <polygon points="104,148 111.5,155.5 154.5,155.5 147,148" />
          <polygon points="148,48 155.5,55.5 179.5,76.5 172,69" />
          <polygon points="172,69 179.5,76.5 179.5,83 172,77" />
          <polygon points="155,90 162.5,97.5 182.5,125.5 175,118" />
          <polygon points="175,118 182.5,125.5 182.5,133 175,126" />
          <polygon points="147,148 154.5,155.5 182.5,133 175,126" />
        </g>

        {/* ==================== FRONT LETTERS (SILVER/PLATINUM #EAEAEA) ==================== */}
        {/* Letter 'R' Front Face */}
        <g fill="#EAEAEA">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 28,48 L 70,48 C 86,48 97,58 97,73 C 97,84 90,92 79,96 L 99,148 L 81,148 L 64,102 L 48,102 L 48,148 L 28,148 L 28,48 Z
               M 48,64 L 48,86 L 69,86 C 76,86 80,82 80,75 C 80,68 76,64 69,64 L 48,64 Z"
          />
        </g>

        {/* Letter 'B' Front Face */}
        <g fill="#EAEAEA">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 104,48 L 148,48 C 162,48 172,56 172,69 C 172,78 166,86 155,90 C 168,94 175,103 175,118 C 175,134 162,148 147,148 L 104,148 L 104,48 Z
               M 122,63 L 122,84 L 144,84 C 150,84 154,80 154,74 C 154,68 150,63 144,63 L 122,63 Z
               M 122,99 L 122,133 L 147,133 C 153,133 158,128 158,116 C 158,104 153,99 147,99 L 122,99 Z"
          />
        </g>
      </svg>
    </div>
  );
};
