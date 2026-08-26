import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type ComboData } from '../types';
import { usePanZoom } from '../../../hooks/usePanZoom';
import TacticalMarker from './TacticalMarker';

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
  isLoading?: boolean;
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
  isLoading,
}: ComboCanvasProps) {
  const { t } = useTranslation();
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

  const groupedCombos = useMemo(() => {
    const groups: Record<string, ComboData[]> = {};
    combos.forEach((c) => {
      const key = `${Math.round(Number(c.startX))},${Math.round(Number(c.startY))}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return Object.values(groups);
  }, [combos]);

  return (
    <main
      className={`bg-surface-dim relative flex h-full w-full items-center justify-center overflow-hidden transition-all duration-300 ease-out ${
        isPanelOpen ? 'md:pr-[450px]' : 'pr-0'
      }`}
      onClick={onMapClick}
    >
      <div className="radar-grid pointer-events-none absolute inset-0 opacity-30"></div>

      <div className="pointer-events-none absolute top-6 left-6 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-surface-container/90 text-primary font-data-label text-data-label rounded-sm border border-white/10 px-3 py-1 uppercase backdrop-blur">
            {t('tactics.executesLabel')} // {mapId?.toUpperCase()}
          </div>
          {isLoading && (
            <div className="tactical-shimmer bg-surface-container/90 border-primary-container/30 text-primary-container font-data-label text-data-label flex items-center gap-1.5 rounded-sm border px-2.5 py-1 tracking-wider uppercase backdrop-blur">
              <span className="bg-primary-container h-1.5 w-1.5 animate-ping rounded-full" />
              <span>{t('tactics.scanningTacticalData')}</span>
            </div>
          )}
        </div>
        <div className="font-data-label text-on-surface-variant text-xs">
          {t('tactics.coordLabel')}:{' '}
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

            {/* Linhas animadas dos Combos */}
            {activeCombo && (
              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
                {activeCombo.targets.map((target, idx) => (
                  <line
                    key={idx}
                    x1={`${activeCombo.startX}%`}
                    y1={`${activeCombo.startY}%`}
                    x2={`${target.endX}%`}
                    y2={`${target.endY}%`}
                    stroke={
                      activeCombo.side === 'COUNTER-TERRORIST'
                        ? 'rgba(164,201,255,0.6)'
                        : 'rgba(246,174,45,0.6)'
                    }
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-dash-flow"
                  />
                ))}
              </svg>
            )}

            {/* Posições iniciais dos Combos */}
            {groupedCombos.map((group, idx) => {
              const first = group[0];
              const posX = Math.round(Number(first.startX));
              const posY = Math.round(Number(first.startY));

              const isSelected = selectedPos?.x === posX && selectedPos?.y === posY;
              if (selectedPos && !isSelected) return null;

              const activeInGroup =
                activeCombo && group.some((c) => c.id === activeCombo.id) ? activeCombo : null;

              const count = activeInGroup ? 1 : group.length;

              const hasT = group.some((c) => c.side === 'TERRORIST');
              const hasCT = group.some((c) => c.side === 'COUNTER-TERRORIST');

              const side = activeInGroup
                ? activeInGroup.side
                : hasT && hasCT
                  ? 'MIXED'
                  : hasCT
                    ? 'COUNTER-TERRORIST'
                    : 'TERRORIST';

              return (
                <TacticalMarker
                  key={`start-${idx}`}
                  x={first.startX}
                  y={first.startY}
                  type="COMBO"
                  side={side}
                  count={count}
                  isSelected={isSelected}
                  onClick={(e) => onPositionClick({ x: posX, y: posY }, e)}
                  zoom={zoom}
                />
              );
            })}

            {/* Alvos finais dos Combos */}
            {activeCombo &&
              activeCombo.targets.map((target, idx) => (
                <TacticalMarker
                  key={`target-${idx}`}
                  x={target.endX}
                  y={target.endY}
                  type={target.type}
                  side={activeCombo.side} // Agora a cor do alvo adapta-se à equipa do Combo!
                  variant="target"
                  zoom={zoom}
                />
              ))}
          </div>
        </div>

        {/* ... botões de zoom iguais ... */}
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
