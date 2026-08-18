import React from 'react';
import { type ComboData } from '../types';
import { usePanZoom } from '../../../hooks/usePanZoom';

interface ComboCanvasProps {
  mapId?: string;
  radarImage?: string;
  combos: ComboData[];
  coords: { x: number; y: number };
  setCoords: (coords: { x: number; y: number }) => void;
  selectedPos?: { x: number; y: number } | null;
  activeCombo?: ComboData | null;
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
  const {
    zoom,
    scrollRef,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleMouseDown,
    handleMouseUpOrLeave,
    handleContainerMouseMove,
    handleInnerMouseMove,
  } = usePanZoom(setCoords);

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

      <div className="border-outline-variant relative aspect-square w-full max-w-[min(95vw,75vh)] overflow-hidden rounded-lg border shadow-2xl lg:max-w-[600px]">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onMouseMove={handleContainerMouseMove}
          className={`bg-surface-container hide-scrollbar h-full w-full overflow-auto ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        >
          <div
            className="relative aspect-square transition-all duration-300 ease-out"
            style={{ width: `${zoom * 100}%` }}
            onMouseMove={handleInnerMouseMove}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
              style={{ backgroundImage: `url('${radarImage}')` }}
            ></div>

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

            {uniquePositions.map((pos, idx) => {
              const isSelected = selectedPos?.x === pos.startX && selectedPos?.y === pos.startY;
              if (selectedPos && !isSelected) return null;
              return (
                <button
                  key={idx}
                  onClick={(e) => onPositionClick({ x: pos.startX, y: pos.startY }, e)}
                  className={`bg-surface-container absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-primary text-primary z-30 scale-110 shadow-[0_0_25px_5px_rgba(246,174,45,0.5)]'
                      : 'border-primary/60 text-primary/80 hover:border-primary hover:text-primary z-20 shadow-[0_0_15px_rgba(246,174,45,0.2)] hover:scale-110'
                  }`}
                  style={{ top: `${pos.startY}%`, left: `${pos.startX}%` }}
                >
                  <span className="material-symbols-outlined text-[18px]">strategy</span>
                </button>
              );
            })}

            {activeCombo &&
              activeCombo.targets.map((target, idx) => (
                <div
                  key={`target-${idx}`}
                  className="bg-surface-container border-primary/50 text-primary absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_0_10px_rgba(246,174,45,0.4)]"
                  style={{ top: `${target.endY}%`, left: `${target.endX}%` }}
                >
                  <span
                    className="material-symbols-outlined text-[14px]"
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
        </div>

        <div className="absolute right-4 bottom-4 z-40 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 1.5}
            className="bg-surface-container-highest text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center rounded border border-white/10 shadow-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="bg-surface-container-highest text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center rounded border border-white/10 shadow-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
        </div>
      </div>
    </main>
  );
}
