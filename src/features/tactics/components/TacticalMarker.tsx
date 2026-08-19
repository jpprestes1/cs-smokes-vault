import React from 'react';

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
}: TacticalMarkerProps) {
  const isCT = side === 'COUNTER-TERRORIST';
  const isMixed = side === 'MIXED';
  const icon = getIcon(type);

  // Variante: Fantasma de Lançamento (Pulsante e Transparente)
  if (variant === 'ghost') {
    return (
      <div
        className="pointer-events-none absolute z-40 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-white bg-white/20"
        style={{ top: formatCoord(y), left: formatCoord(x) }}
      >
        <span className="material-symbols-outlined text-[12px] text-white">{icon}</span>
      </div>
    );
  }

  // Variante: Alvo de Combo (Ponto estático menor)
  if (variant === 'target') {
    return (
      <div
        className={`bg-surface-container absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border ${
          isCT
            ? 'border-secondary/50 text-secondary shadow-[0_0_10px_rgba(164,201,255,0.4)]'
            : 'border-primary/50 text-primary shadow-[0_0_10px_rgba(246,174,45,0.4)]'
        }`}
        style={{ top: formatCoord(y), left: formatCoord(x) }}
      >
        <span
          className="material-symbols-outlined text-[14px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
    );
  }

  // Variante Padrão: Botão Interativo (Granadas no Radar e Início de Combos)
  const shapeClass = type === 'COMBO' ? 'rounded h-8 w-8' : 'rounded-full h-8 w-8';
  // A div interna deve ter exatamente o mesmo formato que a externa para não "vazar" nos cantos
  const innerShapeClass = type === 'COMBO' ? 'rounded h-full w-full' : 'rounded-full h-full w-full';
  const iconSize = type === 'COMBO' ? 'text-[18px]' : 'text-xl';

  let wrapperClasses = `absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center transition-all duration-300 ${shapeClass}`;
  let innerClasses = '';

  if (isSelected) {
    if (isMixed) {
      // Degradê com corte "duro" exato no meio usando from-50% e to-50%, com padding de 2px para simular a borda
      wrapperClasses +=
        ' scale-110 shadow-[0_0_25px_5px_rgba(255,255,255,0.3)] z-30 p-[2px] bg-gradient-to-br from-primary from-50% to-secondary to-50%';
      innerClasses = `bg-surface-container flex items-center justify-center text-on-surface ${innerShapeClass}`;
    } else if (isCT) {
      wrapperClasses +=
        ' border-2 bg-surface-container border-secondary text-secondary scale-110 shadow-[0_0_25px_5px_rgba(164,201,255,0.5)] z-30';
    } else {
      wrapperClasses +=
        ' border-2 bg-surface-container border-primary text-primary scale-110 shadow-[0_0_25px_5px_rgba(246,174,45,0.5)] z-30';
    }
  } else {
    if (isMixed) {
      // Mantendo o corte "duro" e opacidade nos estados inativos e de hover
      wrapperClasses +=
        ' hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 hover:z-20 p-[2px] bg-gradient-to-br from-primary/70 from-50% to-secondary/70 to-50% hover:from-primary hover:to-secondary';
      innerClasses = `bg-surface-container flex items-center justify-center text-on-surface/80 hover:text-on-surface ${innerShapeClass}`;
    } else if (isCT) {
      wrapperClasses +=
        ' border-2 bg-surface-container border-secondary/60 text-secondary/80 hover:scale-110 hover:border-secondary hover:text-secondary shadow-[0_0_15px_rgba(164,201,255,0.2)] hover:shadow-[0_0_15px_rgba(164,201,255,0.6)] z-10 hover:z-20';
    } else {
      wrapperClasses +=
        ' border-2 bg-surface-container border-primary/60 text-primary/80 hover:scale-110 hover:border-primary hover:text-primary shadow-[0_0_15px_rgba(246,174,45,0.2)] hover:shadow-[0_0_15px_rgba(246,174,45,0.6)] z-10 hover:z-20';
    }
  }

  const content =
    count > 1 ? (
      <span className="font-data-label text-sm font-bold">{count}</span>
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
      className={wrapperClasses}
      style={{ top: formatCoord(y), left: formatCoord(x) }}
    >
      {isMixed ? <div className={innerClasses}>{content}</div> : content}
    </button>
  );
}
