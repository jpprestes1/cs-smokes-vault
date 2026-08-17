import React from 'react';
import { type ComboData } from '../types';

interface ComboCanvasProps {
  mapId?: string;
  radarImage?: string;
  combos: ComboData[];
  coords: { x: number; y: number };
  setCoords: (coords: { x: number; y: number }) => void;
  selectedPos?: { x: number; y: number } | null;
  activeCombo?: ComboData | null; // O combo que deve ter suas rotas desenhadas (Hover ou Selecionado)
  onPositionClick: (pos: { x: number; y: number }, e: React.MouseEvent) => void;
  onMapClick: () => void;
  isPanelOpen?: boolean;
}

export default function ComboCanvas({
  mapId,
  radarImage,
  combos,
  coords,
  setCoords,
  selectedPos,
  activeCombo,
  onPositionClick,
  onMapClick,
  isPanelOpen,
}: ComboCanvasProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setCoords({
      x: Math.max(0, Math.min(100, xPercent)),
      y: Math.max(0, Math.min(100, yPercent)),
    });
  };

  // Agrupa os combos pela posição inicial para evitar sobreposição de botões no radar
  const uniquePositions = Array.from(new Set(combos.map((c) => `${c.startX},${c.startY}`))).map(
    (key) => {
      const [x, y] = key.split(',');
      return { startX: Number(x), startY: Number(y) };
    }
  );

  return (
    <main
      className={`bg-surface-dim relative flex h-full w-full items-center justify-center overflow-hidden transition-all duration-300 ease-out ${
        isPanelOpen ? 'md:pr-[450px]' : 'pr-0'
      }`}
      onClick={onMapClick}
    >
      <div className="radar-grid pointer-events-none absolute inset-0 opacity-30"></div>

      <div className="pointer-events-none absolute top-6 left-6 z-20 flex flex-col gap-2">
        <div className="bg-surface-container/90 text-primary font-data-label text-data-label rounded-sm border border-white/10 px-3 py-1 uppercase backdrop-blur">
          EXECUTES // {mapId?.toUpperCase()}
        </div>
        <div className="font-data-label text-on-surface-variant text-xs">
          COORD:{' '}
          <span className="font-mono">
            X:{String(coords.x).padStart(2, '0')} Y:{String(coords.y).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div
        className="bg-surface-container border-outline-variant relative aspect-square w-full max-w-[min(95vw,75vh)] overflow-hidden rounded-lg border shadow-2xl lg:max-w-[600px]"
        onMouseMove={handleMouseMove}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url('${radarImage}')` }}
        ></div>

        {/* Camada SVG para as linhas tracejadas baseadas no activeCombo (Hover ou Click) */}
        {activeCombo && (
          <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
            {activeCombo.targets.map((target, idx) => (
              <line
                key={idx}
                x1={`${activeCombo.startX}%`}
                y1={`${activeCombo.startY}%`}
                x2={`${target.endX}%`}
                y2={`${target.endY}%`}
                stroke="rgba(246,174,45,0.6)"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-dash-flow"
              />
            ))}
          </svg>
        )}

        {/* Renderiza os Pontos de Início agrupados */}
        {uniquePositions.map((pos, idx) => {
          const isSelected = selectedPos?.x === pos.startX && selectedPos?.y === pos.startY;

          if (selectedPos && !isSelected) return null;

          return (
            <button
              key={idx}
              onClick={(e) => onPositionClick({ x: pos.startX, y: pos.startY }, e)}
              className={`bg-surface-container absolute -mt-4 -ml-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-primary text-primary z-30 scale-140 shadow-[0_0_25px_5px_rgba(246,174,45,0.5)]'
                  : 'border-primary/60 text-primary/80 hover:border-primary hover:text-primary z-20 shadow-[0_0_15px_rgba(246,174,45,0.2)] hover:scale-140'
              }`}
              style={{ top: `${pos.startY}%`, left: `${pos.startX}%` }}
            >
              <span className="material-symbols-outlined !text-[16px]">strategy</span>
            </button>
          );
        })}

        {/* Renderiza as Granadas (Alvos) do activeCombo */}
        {activeCombo &&
          activeCombo.targets.map((target, idx) => (
            <div
              key={`target-${idx}`}
              className="bg-surface-container border-primary/50 text-primary absolute z-20 -mt-3 -ml-3 flex h-6 w-6 items-center justify-center rounded-full border shadow-[0_0_10px_rgba(246,174,45,0.4)]"
              style={{ top: `${target.endY}%`, left: `${target.endX}%` }}
            >
              <span
                className="material-symbols-outlined !text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {target.type === 'SMOKE'
                  ? 'cloud'
                  : target.type === 'FLASH'
                    ? 'flare'
                    : 'local_fire_department'}
              </span>
            </div>
          ))}
      </div>
    </main>
  );
}
