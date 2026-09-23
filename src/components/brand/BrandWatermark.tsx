import React from 'react';

interface BrandWatermarkProps {
  className?: string;
  opacity?: number;
  scale?: number;
}

/**
 * Marca de agua profesional corporativa de RBCOMUNICACIONES.
 * Diseñada exclusivamente con el imagotipo oficial (Emblema RB 3D vectorizado),
 * optimizada para fondos de documento A4, pantalla y exportación PDF / impresión.
 */
export const BrandWatermark: React.FC<BrandWatermarkProps> = ({
  className = '',
  opacity = 0.045,
  scale = 1,
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <div 
        className="w-[420px] max-w-[70%] transform -rotate-12 transition-transform"
        style={{ transform: `scale(${scale}) rotate(-10deg)` }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto aspect-square"
        >
          {/* Outer squircle frame */}
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

          {/* Letter 'R' 3D Shadow */}
          <g fill="#0F172A">
            <path
              d="M 28,48 L 40,48 L 40,148 L 28,148 Z
                 M 70,48 C 85,48 96,58 96,73 C 96,84 90,92 79,96 L 99,148 L 81,148 L 64,102 L 48,102 L 48,48 Z"
              transform="translate(8, 8)"
            />
            <polygon points="36,56 44,64 44,156 36,148" />
            <polygon points="91,148 99,156 107,156 99,148" />
            <polygon points="79,96 87,104 99,148 91,140" />
          </g>

          {/* Letter 'B' 3D Shadow */}
          <g fill="#0F172A">
            <path
              d="M 104,48 L 116,48 L 116,148 L 104,148 Z
                 M 116,48 L 148,48 C 161,48 171,56 171,69 C 171,78 165,86 154,90 C 167,94 174,103 174,118 C 174,134 161,148 146,148 L 116,148 Z"
              transform="translate(8, 8)"
            />
            <polygon points="112,56 120,64 120,156 112,148" />
            <polygon points="154,156 146,148 161,148 169,156" />
            <polygon points="171,69 179,77 179,82 171,74" />
            <polygon points="174,118 182,126 182,134 174,126" />
          </g>

          {/* Letter 'R' Front Face */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 28,48 L 70,48 C 85,48 96,58 96,73 C 96,84 90,92 79,96 L 99,148 L 81,148 L 64,102 L 48,102 L 48,148 L 28,148 L 28,48 Z
               M 48,64 L 48,86 L 69,86 C 76,86 80,82 80,75 C 80,68 76,64 69,64 L 48,64 Z"
            fill="#FFFFFF"
          />

          {/* Letter 'B' Front Face */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 104,48 L 148,48 C 161,48 171,56 171,69 C 171,78 165,86 154,90 C 167,94 174,103 174,118 C 174,134 161,148 146,148 L 104,148 L 104,48 Z
               M 122,63 L 122,84 L 144,84 C 150,84 154,80 154,74 C 154,68 150,63 144,63 L 122,63 Z
               M 122,99 L 122,132 L 146,132 C 152,132 157,128 157,116 C 157,104 152,99 146,99 L 122,99 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </div>
  );
};
