import { type ComboData, type VideoData } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import VideoCard from '../../../components/shared/VideoCard';

interface ComboDetailsProps {
  combo: ComboData;
  onSelectVideo: (video: VideoData) => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteVideo: (videoId: string) => void;
  onEditVideo: (video: VideoData) => void;
}

export default function ComboDetails({
  combo,
  onSelectVideo,
  onEdit,
  onDelete,
  onDeleteVideo,
  onEditVideo,
}: ComboDetailsProps) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const canEdit = role === 'ADMIN' || role === 'CREATOR';
  const canDelete = role === 'ADMIN';

  return (
    <div className="flex h-full flex-col">
      <p className="font-body-base text-on-surface-variant text-sm">{combo.desc}</p>
      <div className="bg-primary/10 border-primary/20 text-primary mt-2 w-fit rounded border px-2 py-1">
        <span className="font-data-label text-xs font-bold">
          {t('tactics.grenadesInCombo', { count: combo.targets.length })}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h4 className="font-data-label text-data-label text-on-surface-variant mb-4 border-b border-white/10 pb-2">
          {t('tactics.executionGuides')}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {combo.videos?.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              fallbackType="smoke" // Combos usam sempre o fallback de smoke
              canEdit={canEdit}
              canDelete={canDelete}
              onSelect={onSelectVideo}
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
              {t('tactics.editCombo')}
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
    </div>
  );
}
