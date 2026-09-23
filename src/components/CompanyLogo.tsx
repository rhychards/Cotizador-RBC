import React from 'react';
import { RbEmblem } from './brand/RbEmblem';
import { ComunicacionesWordmark } from './brand/ComunicacionesWordmark';

interface CompanyLogoProps {
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  layout?: 'horizontal' | 'stacked';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  logoUrl,
  className = '',
  size = 'md',
  showSubtitle = false,
  theme = 'dark',
  layout = 'horizontal',
}) => {
  if (logoUrl) {
    return (
      <div className={`flex items-center space-x-3 select-none ${className}`}>
        <img
          src={logoUrl}
          alt="RB Comunicaciones Logo"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="object-contain max-h-16"
        />
      </div>
    );
  }

  // Exact optical balance between 1:1 square emblem and wordmark
  const sizeConfig = {
    sm: {
      emblemSize: 32,
      wordmarkSize: 'sm' as const,
      subText: 'text-[9px]',
      gap: 'gap-2.5',
    },
    md: {
      emblemSize: 44,
      wordmarkSize: 'md' as const,
      subText: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      emblemSize: 56,
      wordmarkSize: 'lg' as const,
      subText: 'text-[11px]',
      gap: 'gap-3.5',
    },
    xl: {
      emblemSize: 70,
      wordmarkSize: 'xl' as const,
      subText: 'text-xs',
      gap: 'gap-4',
    },
  }[size];

  const isLight = theme === 'light';

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <RbEmblem size={sizeConfig.emblemSize * 1.15} />
        <div className="mt-2 flex justify-center">
          <ComunicacionesWordmark theme={theme} size={sizeConfig.wordmarkSize} />
        </div>
        {showSubtitle && (
          <p className={`font-semibold tracking-widest uppercase mt-1 ${sizeConfig.subText} ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
            Streaming • Audiovisual • Seguridad Electrónica
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${sizeConfig.gap} select-none ${className}`}>
      {/* Exact 1:1 3D RB Emblem (Cmpleto.png) */}
      <RbEmblem size={sizeConfig.emblemSize} />

      {/* Exact Brand Wordmark (Comunicaciones negro.png) */}
      <div className="flex flex-col justify-center overflow-visible shrink-0">
        <ComunicacionesWordmark theme={theme} size={sizeConfig.wordmarkSize} />
        {showSubtitle && (
          <p className={`font-semibold tracking-widest uppercase mt-0.5 ${sizeConfig.subText} ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Streaming • Audiovisual • Seguridad Electrónica
          </p>
        )}
      </div>
    </div>
  );
};
