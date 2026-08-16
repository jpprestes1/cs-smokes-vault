import { type MarkerData, type VideoData } from '../data/markers';
import TacticForm from './TacticForm';
import TacticDetails from './TacticDetails';
import TacticVideoPlayer from './TacticVideoPlayer';

interface TacticalPanelProps {
  marker: MarkerData | null;
  selectedVideo: VideoData | null;
  isAdding: boolean;
  mapId?: string;
  markers: MarkerData[];
  coords: { x: number; y: number };
  onClose: () => void;
  onSelectVideo: (video: VideoData | null) => void;
  onHoverVideo: (video: VideoData | null) => void;
}

export default function TacticalPanel({
  marker,
  selectedVideo,
  isAdding,
  mapId,
  markers,
  coords,
  onClose,
  onSelectVideo,
  onHoverVideo,
}: TacticalPanelProps) {
  const isOpen = marker !== null || isAdding;

  return (
    <aside
      className={`bg-surface-container/95 fixed top-16 right-0 z-40 flex h-[calc(100vh-64px)] w-full transform flex-col border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ease-out md:w-[450px] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {isAdding ? (
        <TacticForm mapId={mapId} markers={markers} coords={coords} onClose={onClose} />
      ) : marker ? (
        <>
          {/* Header compartilhado da exibição da Granada */}
          <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  {marker.type === 'SMOKE'
                    ? 'cloud'
                    : marker.type === 'FLASH'
                      ? 'flare'
                      : 'local_fire_department'}
                </span>
                <span className="font-data-label text-data-label text-on-surface-variant bg-surface-variant/50 scanline rounded-sm px-2 py-0.5 tracking-widest uppercase">
                  {marker.type}
                </span>
                <span
                  className={`font-data-label text-data-label ${marker.side === 'TERRORIST' ? 'text-primary border-primary/30 bg-primary/10' : 'text-secondary border-secondary/30 bg-secondary/10'} rounded-sm border px-2 py-0.5 tracking-widest uppercase`}
                >
                  {marker.side}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mt-1">
                {marker.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined p-1">close</span>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
            {!selectedVideo ? (
              <TacticDetails
                marker={marker}
                onSelectVideo={onSelectVideo}
                onHoverVideo={onHoverVideo}
              />
            ) : (
              <TacticVideoPlayer video={selectedVideo} onBack={() => onSelectVideo(null)} />
            )}
          </div>
        </>
      ) : null}
    </aside>
  );
}
