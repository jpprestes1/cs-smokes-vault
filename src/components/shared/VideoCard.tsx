import { type VideoData } from '../../features/tactics/types';
import { useTranslation } from 'react-i18next';

interface VideoCardProps {
  video: VideoData;
  fallbackType?: string; // Usado para a imagem de fundo por defeito (ex: 'smoke', 'flash')
  canEdit: boolean;
  canDelete: boolean;
  onSelect: (video: VideoData) => void;
  onHover?: (video: VideoData | null) => void;
  onEdit: (video: VideoData) => void;
  onDelete: (videoId: string) => void;
}

const platformConfig = {
  youtube: { color: 'bg-red-600', icon: 'play_circle' },
  tiktok: { color: 'bg-cyan-500', icon: 'music_note' },
  instagram: { color: 'bg-fuchsia-600', icon: 'photo_camera' },
};

const getThumbnailUrl = (
  platform: string,
  embedUrl: string,
  fallbackThumb: string,
  type: string
) => {
  if (fallbackThumb && fallbackThumb.trim() !== '') return fallbackThumb;
  if (platform === 'youtube') {
    const videoId = embedUrl.split('/embed/')[1]?.split('?')[0];
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return `/images/bg-${type.toLowerCase()}-video.png`;
};

const getDiffColor = (diff?: string) => {
  if (diff === 'EASY') return 'bg-green-500/90';
  if (diff === 'HARD') return 'bg-red-500/90';
  return 'bg-yellow-500/90';
};

export default function VideoCard({
  video,
  fallbackType = 'smoke',
  canEdit,
  canDelete,
  onSelect,
  onHover,
  onEdit,
  onDelete,
}: VideoCardProps) {
  const { t } = useTranslation();
  const config =
    platformConfig[video.platform as keyof typeof platformConfig] || platformConfig.youtube;

  return (
    <div
      onClick={() => onSelect(video)}
      onMouseEnter={() => onHover?.(video)}
      onMouseLeave={() => onHover?.(null)}
      className="group flex cursor-pointer flex-col gap-2"
    >
      <div className="group-hover:border-primary relative aspect-[9/16] w-full overflow-hidden rounded-md border border-white/10 transition-colors">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `url('${getThumbnailUrl(video.platform, video.embedUrl, video.thumbnail, fallbackType)}')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent"></div>

        {video.difficulty && (
          <div
            className={`absolute top-2 left-2 rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white shadow-sm ${getDiffColor(video.difficulty)}`}
          >
            {video.difficulty}
          </div>
        )}

        <div
          className={`absolute top-2 right-2 flex items-center gap-1 rounded px-2 py-1 ${config.color} text-[10px] font-bold tracking-wider text-white`}
        >
          <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
          {video.platform.toUpperCase()}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-sm">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="font-data-label text-on-surface group-hover:text-primary truncate text-xs transition-colors">
            {video.title}
          </span>
          {video.author && (
            <span className="font-data-label text-on-surface-variant truncate text-[10px]">
              {t('common.by')} {video.author}
            </span>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(video);
                }}
                className="rounded p-1 text-blue-500/70 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                title={t('tactics.editVideo')}
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id);
                }}
                className="rounded p-1 text-red-500/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title={t('tactics.deleteVideo')}
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
