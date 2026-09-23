import React from 'react';

interface ComunicacionesWordmarkProps {
  theme?: 'dark' | 'light' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Logotipo tipográfico oficial "Comunicaciones" (Recreación exacta 1:1 de Comunicaciones negro.png).
 * - Tipografía geométrica en negro riguroso (#000000) con 'a' monoespacio/circular ("ɑ").
 * - La segunda letra 'i' es un isotipo de transmisión/wifi en azul brillante (#2EA2FF),
 *   con su fuste azul, punto circular azul y 2 ondas concéntricas de radiación superior.
 * - Colores y formas protegidos y fieles a la identidad corporativa de RBCOMUNICACIONES.
 */
export const ComunicacionesWordmark: React.FC<ComunicacionesWordmarkProps> = ({
  size = 'md',
  className = '',
}) => {
  // Configuración de dimensiones proporcionales
  const dimensions = {
    sm: { height: 26, width: 155 },
    md: { height: 34, width: 200 },
    lg: { height: 46, width: 270 },
    xl: { height: 58, width: 340 },
    '2xl': { height: 72, width: 420 },
  }[size];

  const textColor = '#000000';
  const iconColor = '#2EA2FF';

  return (
    <div className={`inline-flex items-center select-none overflow-visible ${className}`}>
      <svg
        viewBox="0 0 590 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: dimensions.height, width: 'auto' }}
        className="block overflow-visible"
      >
        <defs>
          <style>
            {`
              .rb-brand-text {
                font-family: 'Montserrat', 'Century Gothic', 'Avant Garde', -apple-system, sans-serif;
                font-weight: 900;
                font-size: 60px;
                letter-spacing: -0.02em;
              }
            `}
          </style>
        </defs>

        {/* Primer segmento: "Comunicac" (en negro riguroso #000000) */}
        <text
          x="0"
          y="77"
          fill={textColor}
          className="rb-brand-text"
        >
          Comunicac
        </text>

        {/* Segunda letra 'i' especial: Isotipo de Antena / Ondas de Transmisión Wifi (#2EA2FF) */}
        <g id="rb-wifi-i-glyph" transform="translate(356, 0)">
          {/* Fuste vertical de la 'i' */}
          <rect
            x="4"
            y="48"
            width="10.5"
            height="29"
            rx="1.5"
            fill={iconColor}
          />

          {/* Punto de la 'i' */}
          <circle
            cx="9.25"
            cy="33.5"
            r="6.5"
            fill={iconColor}
          />

          {/* Onda 1 (Inferior concéntrica) */}
          <path
            d="M -3 19.5 A 15 15 0 0 1 21.5 19.5"
            stroke={iconColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Onda 2 (Superior concéntrica) */}
          <path
            d="M -13 6.5 A 27 27 0 0 1 31.5 6.5"
            stroke={iconColor}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Segundo segmento: "ones" (en negro riguroso #000000) */}
        <text
          x="390"
          y="77"
          fill={textColor}
          className="rb-brand-text"
        >
          ones
        </text>
      </svg>
    </div>
  );
};
