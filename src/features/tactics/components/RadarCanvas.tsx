import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type MarkerData, type VideoData } from '../types';
import { usePanZoom } from '../../../hooks/usePanZoom';
import TacticalMarker from './TacticalMarker';

interface RadarCanvasProps {
  mapId?: string;
  radarImage?: string;
  markers: MarkerData[];
  coords: { x: number; y: number };
  setCoords: (coords: { x: number; y: number }) => void;
  selectedMarkerId?: string;
  selectedGroupPos?: { x: number; y: number } | null;
  onMarkerGroupClick: (group: MarkerData[], e: React.MouseEvent) => void;
  onMapClick: () => void;
  hoveredVideo?: VideoData | null;
  isPanelOpen?: boolean;
}

const formatCoord = (coord: string | number) => {
  const strCoord = String(coord);
  return strCoord.endsWith('%') ? strCoord : `${strCoord}%`;
};

export default function RadarCanvas({
  mapId,
  radarImage,
  markers,
  coords,
  setCoords,
  selectedMarkerId,
  selectedGroupPos,
  onMarkerGroupClick,
  onMapClick,
  hoveredVideo,
  isPanelOpen,
}: RadarCanvasProps) {
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

  const activeMarker = markers.find((m) => m.id === selectedMarkerId);

  // Lógica de agrupamento por coordenada com proteção de tipagem
  const groupedMarkers = useMemo(() => {
    const groups: Record<string, MarkerData[]> = {};
    markers.forEach((m) => {
      const key = `${Math.round(Number(m.x))},${Math.round(Number(m.y))}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.values(groups);
  }, [markers]);

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
          {t('tactics.mapLabel')} // {mapId?.toUpperCase()}
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
          className={`bg-surface-container hide-scrollbar h-full w-full overflow-auto ${
            isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
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

            {/* Linha animada simulando a trajetória da granada */}
            {activeMarker && hoveredVideo && hoveredVideo.throwX && hoveredVideo.throwY && (
              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
                <line
                  x1={formatCoord(hoveredVideo.throwX)}
                  y1={formatCoord(hoveredVideo.throwY)}
                  x2={formatCoord(activeMarker.x)}
                  y2={formatCoord(activeMarker.y)}
                  stroke={
                    activeMarker.side === 'COUNTER-TERRORIST'
                      ? 'rgba(164,201,255,0.6)'
                      : 'rgba(246,174,45,0.6)'
                  }
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className="animate-dash-flow"
                />
              </svg>
            )}

            {/* Marcadores de Táticas Agrupados */}
            {groupedMarkers.map((group, idx) => {
              // Verifica se a granada selecionada no painel pertence a este grupo
              const selectedInGroup = selectedMarkerId
                ? group.find((m) => m.id === selectedMarkerId)
                : null;

              // Se tiver uma selecionada, força a exibição para ser única (count=1), senão mostra o total do grupo
              const count = selectedInGroup ? 1 : group.length;

              // Define qual granada ditará o ícone (a selecionada ou a primeira do grupo)
              const displayMarker = selectedInGroup || group[0];

              const hasT = group.some((m) => m.side === 'TERRORIST');
              const hasCT = group.some((m) => m.side === 'COUNTER-TERRORIST');

              // Se tiver selecionada, assume a cor dela. Se não, verifica se é misto ou de um lado só.
              const side = selectedInGroup
                ? displayMarker.side
                : hasT && hasCT
                  ? 'MIXED'
                  : displayMarker.side;

              const isSelected =
                !!selectedInGroup ||
                (selectedGroupPos?.x === Math.round(Number(displayMarker.x)) &&
                  selectedGroupPos?.y === Math.round(Number(displayMarker.y)));

              return (
                <TacticalMarker
                  key={idx}
                  x={displayMarker.x}
                  y={displayMarker.y}
                  type={displayMarker.type}
                  side={side}
                  count={count}
                  isSelected={isSelected}
                  onClick={(e) => onMarkerGroupClick(group, e)}
                  zoom={zoom}
                />
              );
            })}

            {/* Indicador Hover Fantasma */}
            {hoveredVideo && hoveredVideo.throwX && hoveredVideo.throwY && (
              <TacticalMarker
                x={hoveredVideo.throwX}
                y={hoveredVideo.throwY}
                type="THROW_POS"
                variant="ghost"
                zoom={zoom}
              />
            )}
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
