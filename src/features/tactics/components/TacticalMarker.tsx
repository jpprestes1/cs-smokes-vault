import React, { useState } from 'react';

export type MarkerType = 'SMOKE' | 'FLASH' | 'MOLOTOV' | 'COMBO' | 'THROW_POS' | string;

interface TacticalMarkerProps {
  x: string | number;
  y: string | number;
  type: MarkerType;
  side?: string;
  isSelected?: boolean;
  variant?: 'button' | 'target' | 'ghost';
  onClick?: (e: React.MouseEvent) => void;
  count?: number;
  zoom?: number;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'SMOKE':
      return 'cloud';
    case 'FLASH':
      return 'flare';
    case 'MOLOTOV':
      return 'local_fire_department';
    case 'COMBO':
      return 'strategy';
    case 'THROW_POS':
      return 'accessibility_new';
    default:
      return 'place';
  }
};

const formatCoord = (coord: string | number) => {
  const strCoord = String(coord);
  return strCoord.endsWith('%') ? strCoord : `${strCoord}%`;
};

export default function TacticalMarker({
  x,
  y,
  type,
  side = 'TERRORIST',
  isSelected = false,
  variant = 'button',
  onClick,
  count = 1,
  zoom = 1,
}: TacticalMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCT = side === 'COUNTER-TERRORIST';
  const isMixed = side === 'MIXED';
  const icon = getIcon(type);

  const baseScale = (zoom / 1.3) * (isSelected ? 1.15 : isHovered ? 1.1 : 1);

  // Variante: Fantasma de Lançamento (Pulsante e Transparente)
  if (variant === 'ghost') {
    return (
      <div
        className="pointer-events-none absolute z-40 flex h-5 w-5 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-white bg-white/20 transition-transform duration-300 ease-out"
        style={{
          top: formatCoord(y),
          left: formatCoord(x),
          transform: `translate(-50%, -50%) scale(${zoom})`,
        }}
      >
        <span className="material-symbols-outlined text-[11px] text-white">{icon}</span>
      </div>
    );
  }

  // Variante: Alvo de Combo (Ponto estático menor)
  if (variant === 'target') {
    return (
      <div
        className={`bg-surface-container absolute z-20 flex h-5 w-5 items-center justify-center rounded-full border transition-transform duration-300 ease-out ${
          isCT
            ? 'border-secondary/50 text-secondary shadow-[0_0_10px_rgba(164,201,255,0.4)]'
            : 'border-primary/50 text-primary shadow-[0_0_10px_rgba(246,174,45,0.4)]'
        }`}
        style={{
          top: formatCoord(y),
          left: formatCoord(x),
          transform: `translate(-50%, -50%) scale(${zoom})`,
        }}
      >
        <span
          className="material-symbols-outlined !text-[14px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
    );
  }

  // Variante Padrão: Botão Interativo (Granadas no Radar e Início de Combos)
  const shapeClass = type === 'COMBO' ? 'rounded h-6 w-6' : 'rounded-full h-7 w-7';
  // A div interna deve ter exatamente o mesmo formato que a externa para não "vazar" nos cantos
  const innerShapeClass =
    type === 'COMBO' ? 'rounded-[2px] h-full w-full' : 'rounded-full h-full w-full';
  const iconSize = '!text-[18px]';
  const countSize = '!text-[11px]';

  let wrapperClasses = `absolute flex cursor-pointer items-center justify-center transition-all duration-300 ease-out ${shapeClass}`;
  let innerClasses = '';

  if (isSelected) {
    if (isMixed) {
      // Degradê com corte "duro" exato no meio usando from-50% e to-50%, com padding de 2px para simular a borda
      wrapperClasses +=
        ' shadow-[0_0_25px_5px_rgba(255,255,255,0.3)] z-30 p-[2px] bg-gradient-to-br from-primary from-50% to-secondary to-50%';
      innerClasses = `bg-surface-container flex items-center justify-center text-on-surface ${innerShapeClass}`;
    } else if (isCT) {
      wrapperClasses +=
        ' border-2 bg-surface-container border-secondary text-secondary shadow-[0_0_25px_5px_rgba(164,201,255,0.5)] z-30';
    } else {
      wrapperClasses +=
        ' border-2 bg-surface-container border-primary text-primary shadow-[0_0_25px_5px_rgba(246,174,45,0.5)] z-30';
    }
  } else {
    if (isMixed) {
      // Mantendo o corte "duro" e opacidade nos estados inativos e de hover
      wrapperClasses +=
        ' shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 hover:z-20 p-[2px] bg-gradient-to-br from-primary/70 from-50% to-secondary/70 to-50% hover:from-primary hover:to-secondary';
      innerClasses = `bg-surface-container flex items-center justify-center text-on-surface/80 hover:text-on-surface ${innerShapeClass}`;
    } else if (isCT) {
      wrapperClasses +=
        ' border-2 bg-surface-container border-secondary/60 text-secondary/80 hover:border-secondary hover:text-secondary shadow-[0_0_15px_rgba(164,201,255,0.2)] hover:shadow-[0_0_15px_rgba(164,201,255,0.6)] z-10 hover:z-20';
    } else {
      wrapperClasses +=
        ' border-2 bg-surface-container border-primary/60 text-primary/80 hover:border-primary hover:text-primary shadow-[0_0_15px_rgba(246,174,45,0.2)] hover:shadow-[0_0_15px_rgba(246,174,45,0.6)] z-10 hover:z-20';
    }
  }

  const content =
    count > 1 ? (
      <span className={`font-data-label ${countSize} font-bold`}>{count}</span>
    ) : (
      <span
        className={`material-symbols-outlined ${iconSize}`}
        style={type !== 'COMBO' ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {icon}
      </span>
    );

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={wrapperClasses}
      style={{
        top: formatCoord(y),
        left: formatCoord(x),
        transform: `translate(-50%, -50%) scale(${baseScale})`,
      }}
    >
      {isMixed ? <div className={innerClasses}>{content}</div> : content}
    </button>
  );
}
