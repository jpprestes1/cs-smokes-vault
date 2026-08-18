import React from 'react';
import { type MarkerData, type VideoData } from '../types';
import { usePanZoom } from '../../../hooks/usePanZoom';

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

  const getMarkerStyles = (side: string, isSelected: boolean) => {
    const isCT = side === 'COUNTER-TERRORIST';
    if (isSelected) {
      return isCT
        ? 'border-secondary text-secondary scale-110 shadow-[0_0_25px_5px_rgba(164,201,255,0.5)] z-30'
        : 'border-primary text-primary scale-110 shadow-[0_0_25px_5px_rgba(246,174,45,0.5)] z-30';
    }
    return isCT
      ? 'border-secondary/60 text-secondary/80 hover:scale-110 hover:border-secondary hover:text-secondary shadow-[0_0_15px_rgba(164,201,255,0.2)] hover:shadow-[0_0_15px_rgba(164,201,255,0.6)] z-10'
      : 'border-primary/60 text-primary/80 hover:scale-110 hover:border-primary hover:text-primary shadow-[0_0_15px_rgba(246,174,45,0.2)] hover:shadow-[0_0_15px_rgba(246,174,45,0.6)] z-10';
  };

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

            {markers.map((marker) => {
              const isSelected = selectedMarkerId === marker.id;
              const formatCoord = (coord: string | number) => {
                const strCoord = String(coord);
                return strCoord.endsWith('%') ? strCoord : `${strCoord}%`;
              };
              return (
                <button
                  key={marker.id}
                  onClick={(e) => onMarkerClick(marker, e)}
                  className={`bg-surface-container absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 ${getMarkerStyles(marker.side, isSelected)}`}
                  style={{ top: formatCoord(marker.y), left: formatCoord(marker.x) }}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {marker.type === 'SMOKE'
                      ? 'cloud'
                      : marker.type === 'FLASH'
                        ? 'flare'
                        : 'local_fire_department'}
                  </span>
                </button>
              );
            })}

            {hoveredVideo && hoveredVideo.throwX && hoveredVideo.throwY && (
              <div
                className="pointer-events-none absolute z-40 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-white bg-white/20"
                style={{ top: `${hoveredVideo.throwY}%`, left: `${hoveredVideo.throwX}%` }}
              >
                <span className="material-symbols-outlined text-[12px] text-white">
                  accessibility_new
                </span>
              </div>
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
