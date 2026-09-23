import React from 'react';

interface BrandGraphicLineProps {
  className?: string;
  height?: number | string;
  style?: React.CSSProperties;
}

/**
 * Linea gráfica corporativa de RBCOMUNICACIONES (reproducción vectorial de Linea.png).
 * Trazo pincelado / brush stroke rojo (#ED1C24 / #FF0000) característico de la marca.
 */
export const BrandGraphicLine: React.FC<BrandGraphicLineProps> = ({
  className = '',
  height = 14,
  style,
}) => {
  return (
    <div 
      className={`w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ height, ...style }}
    >
      <svg
        viewBox="0 0 1200 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        {/* Main textured acrylic/oil brush stroke path imitating Linea.png */}
        <path
          d="M 0,11 
             C 12,8 24,13 38,10 
             C 52,7 68,14 84,9 
             C 98,12 112,6 128,11 
             C 142,8 158,13 174,10 
             C 190,7 206,12 222,9 
             C 238,13 254,8 270,11 
             C 286,7 302,12 318,10 
             C 334,13 350,8 366,11 
             C 382,7 398,13 414,9 
             C 430,12 446,8 462,11 
             C 478,7 494,13 510,9 
             C 526,12 542,7 558,11 
             C 574,8 590,13 606,10 
             C 622,7 638,12 654,8 
             C 670,13 686,9 702,11 
             C 718,7 734,12 750,9 
             C 766,13 782,8 798,11 
             C 814,7 830,12 846,9 
             C 862,13 878,8 894,11 
             C 910,7 926,12 942,9 
             C 958,13 974,8 990,11 
             C 1006,7 1022,12 1038,9 
             C 1054,13 1070,8 1086,11 
             C 1102,7 1118,12 1134,9 
             C 1150,13 1168,8 1184,11 
             L 1200,12
             L 1200,15
             C 1186,18 1170,14 1154,17 
             C 1138,15 1122,19 1106,16 
             C 1090,18 1074,14 1058,17 
             C 1042,15 1026,19 1010,16 
             C 994,18 978,14 962,17 
             C 946,15 930,19 914,16 
             C 898,18 882,14 866,17 
             C 850,15 834,19 818,16 
             C 802,18 786,14 770,17 
             C 754,15 738,19 722,16 
             C 706,18 690,14 674,17 
             C 658,15 642,19 626,16 
             C 610,18 594,14 578,17 
             C 562,15 546,19 530,16 
             C 514,18 498,14 482,17 
             C 466,15 450,19 434,16 
             C 418,18 402,14 386,17 
             C 370,15 354,19 338,16 
             C 322,18 306,14 290,17 
             C 274,15 258,19 242,16 
             C 226,18 210,14 194,17 
             C 178,15 162,19 146,16 
             C 130,18 114,14 98,17 
             C 82,15 66,19 50,16 
             C 34,18 18,14 0,16 
             Z"
          fill="#ED1C24"
        />
        {/* Fine texture bristles to give genuine brush feel */}
        <path
          d="M 15,6 C 45,7 75,5 110,6 M 140,5 C 190,6 230,5 280,6 M 340,6 C 400,5 450,6 520,5 M 580,6 C 640,5 710,6 770,5 M 820,6 C 890,5 940,6 1020,5 M 1060,6 C 1110,5 1160,6 1195,5"
          stroke="#ED1C24"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 25,19 C 65,18 115,20 160,19 M 220,19 C 270,20 330,18 390,19 M 450,20 C 510,19 580,20 640,19 M 710,20 C 780,19 830,20 900,19 M 950,20 C 1010,19 1080,20 1150,19"
          stroke="#ED1C24"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};
