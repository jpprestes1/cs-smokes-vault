import { type MarkerData, type VideoData } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import VideoCard from '../../../components/shared/VideoCard';

interface TacticDetailsProps {
  marker: MarkerData;
  onSelectVideo: (video: VideoData) => void;
  onHoverVideo: (video: VideoData | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteVideo: (videoId: string) => void;
  onEditVideo: (video: VideoData) => void;
}

export default function TacticDetails({
  marker,
  onSelectVideo,
  onHoverVideo,
  onEdit,
  onDelete,
  onDeleteVideo,
  onEditVideo,
}: TacticDetailsProps) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const canEdit = role === 'ADMIN' || role === 'CREATOR';
  const canDelete = role === 'ADMIN';

  return (
    <>
      <p className="font-body-base text-on-surface-variant text-sm">{marker.desc}</p>

      <div className="mt-2">
        <h4 className="font-data-label text-data-label text-on-surface-variant mb-4 border-b border-white/10 pb-2">
          {t('tactics.availableGuides')}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {marker.videos?.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              fallbackType={marker.type}
              canEdit={canEdit}
              canDelete={canDelete}
              onSelect={onSelectVideo}
              onHover={onHoverVideo}
              onEdit={onEditVideo}
              onDelete={onDeleteVideo}
            />
          ))}
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="mt-auto flex gap-2 border-t border-white/10 pt-4">
          {canEdit && (
            <button
              onClick={onEdit}
              className="bg-surface-variant text-on-surface hover:text-primary flex-1 rounded py-2 text-xs font-bold transition-colors"
            >
              {t('tactics.editTactic')}
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="flex-1 rounded bg-red-500/10 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20"
            >
              {t('common.delete').toUpperCase()}
            </button>
          )}
        </div>
      )}
    </>
  );
}
