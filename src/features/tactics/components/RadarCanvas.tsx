import React from 'react';
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
  onMarkerClick: (marker: MarkerData, e: React.MouseEvent) => void;
  onMapClick: () => void;
  hoveredVideo?: VideoData | null;
  isPanelOpen?: boolean;
}

// Pequeno utilitário para garantir que a coordenada tem sempre o sinal de percentagem
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
  onMarkerClick,
  onMapClick,
  hoveredVideo,
  isPanelOpen,
}: RadarCanvasProps) {
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

  // Encontra o marcador atualmente selecionado para sabermos onde a linha termina e qual a cor (CT ou TR)
  const activeMarker = markers.find((m) => m.id === selectedMarkerId);

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
          MAP // {mapId?.toUpperCase()}
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

            {/* Marcadores de Táticas */}
            {markers.map((marker) => (
              <TacticalMarker
                key={marker.id}
                x={marker.x}
                y={marker.y}
                type={marker.type}
                side={marker.side}
                isSelected={selectedMarkerId === marker.id}
                onClick={(e) => onMarkerClick(marker, e)}
              />
            ))}

            {/* Indicador Hover Fantasma (Posição de onde o jogador lança) */}
            {hoveredVideo && hoveredVideo.throwX && hoveredVideo.throwY && (
              <TacticalMarker
                x={hoveredVideo.throwX}
                y={hoveredVideo.throwY}
                type="THROW_POS"
                variant="ghost"
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
