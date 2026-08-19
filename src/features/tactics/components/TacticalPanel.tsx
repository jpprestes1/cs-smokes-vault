import { type MarkerData, type VideoData } from '../types';
import { useTranslation } from 'react-i18next';
import TacticForm from './TacticForm';
import TacticDetails from './TacticDetails';
import TacticVideoPlayer from './TacticVideoPlayer';
import MarkerList from './MarkerList';

interface TacticalPanelProps {
  marker: MarkerData | null;
  markerGroup: MarkerData[] | null;
  selectedVideo: VideoData | null;
  isAdding: boolean;
  isEditing: boolean;
  mapId?: string;
  markers: MarkerData[];
  coords: { x: number; y: number };
  onClose: () => void;
  onSelectMarker: (marker: MarkerData) => void;
  onBackToList: () => void;
  onSelectVideo: (video: VideoData | null) => void;
  onHoverVideo: (video: VideoData | null) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onEditVideo: (video: VideoData) => void;
}

export default function TacticalPanel({
  marker,
  markerGroup,
  selectedVideo,
  isAdding,
  isEditing,
  mapId,
  markers,
  coords,
  onClose,
  onSelectMarker,
  onBackToList,
  onSelectVideo,
  onHoverVideo,
  onEdit,
  onDelete,
  onDeleteVideo,
  onEditVideo,
}: TacticalPanelProps) {
  const { t } = useTranslation();
  const isOpen = marker !== null || isAdding || markerGroup !== null;

  const typeLabel = (type: string) => {
    if (type === 'SMOKE') return t('common.smoke');
    if (type === 'FLASH') return t('common.flash');
    if (type === 'MOLOTOV') return t('common.molotov');
    return type;
  };

  const sideLabel = (side: string) => {
    if (side === 'TERRORIST') return t('maps.sideT');
    if (side === 'COUNTER-TERRORIST') return t('maps.sideCt');
    return side;
  };

  return (
    <aside
      className={`bg-surface-container/95 fixed top-16 right-0 z-40 flex h-[calc(100vh-64px)] w-full transform flex-col border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ease-out md:w-[450px] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {isAdding || isEditing ? (
        <TacticForm
          mapId={mapId}
          markers={markers}
          coords={coords}
          onClose={onClose}
          initialData={isEditing ? marker! : undefined}
        />
      ) : marker ? (
        <>
          <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-2">
              {markerGroup && markerGroup.length > 1 && (
                <button
                  onClick={onBackToList}
                  className="text-on-surface-variant hover:text-primary mb-1 flex items-center gap-1 text-xs font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>{' '}
                  {t('maps.backToList')}
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  {marker.type === 'SMOKE'
                    ? 'cloud'
                    : marker.type === 'FLASH'
                      ? 'flare'
                      : 'local_fire_department'}
                </span>
                <span className="font-data-label text-data-label text-on-surface-variant bg-surface-variant/50 scanline rounded-sm px-2 py-0.5 tracking-widest uppercase">
                  {typeLabel(marker.type)}
                </span>
                <span
                  className={`font-data-label text-data-label ${
                    marker.side === 'TERRORIST'
                      ? 'text-primary border-primary/30 bg-primary/10'
                      : 'text-secondary border-secondary/30 bg-secondary/10'
                  } rounded-sm border px-2 py-0.5 tracking-widest uppercase`}
                >
                  {sideLabel(marker.side)}
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
                onEdit={onEdit}
                onDelete={() => onDelete(marker.id)}
                onDeleteVideo={onDeleteVideo}
                onEditVideo={onEditVideo}
              />
            ) : (
              <TacticVideoPlayer video={selectedVideo} onBack={() => onSelectVideo(null)} />
            )}
          </div>
        </>
      ) : markerGroup ? (
        <MarkerList markers={markerGroup} onSelectMarker={onSelectMarker} onClose={onClose} />
      ) : null}
    </aside>
  );
}
