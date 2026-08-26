import { type VideoData } from '../types';
import { useTranslation } from 'react-i18next';

interface TacticVideoPlayerProps {
  video: VideoData;
  onBack: () => void;
}

const platformConfig = {
  youtube: { color: 'bg-red-600', icon: 'play_circle' },
  tiktok: { color: 'bg-cyan-500', icon: 'music_note' },
  instagram: { color: 'bg-fuchsia-600', icon: 'photo_camera' },
};

export default function TacticVideoPlayer({ video, onBack }: TacticVideoPlayerProps) {
  const { t, i18n } = useTranslation();
  const config =
    platformConfig[video.platform as keyof typeof platformConfig] || platformConfig.youtube;

  const formattedUpdatedAt = video.updatedAt
    ? (() => {
        try {
          const date = new Date(video.updatedAt);
          if (isNaN(date.getTime())) return null;
          return new Intl.DateTimeFormat(i18n.language || undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(date);
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex h-full flex-col duration-300">
      <button
        onClick={onBack}
        className="text-on-surface-variant hover:text-primary font-data-label mb-4 flex w-fit items-center gap-2 text-xs uppercase transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span> {t('maps.backToList')}
      </button>

      {/* Container Padronizado para Shorts, TikTok e Reels */}
      <div className="flex w-full justify-center">
        <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
          <iframe
            src={video.embedUrl}
            className="absolute inset-0 h-full w-full"
            frameBorder="0"
            scrolling="no"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <h4 className="font-headline-md text-primary mt-4 text-lg">{video.title}</h4>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div
          className={`flex w-fit items-center gap-1 rounded px-3 py-1 ${config.color} text-xs font-bold text-white`}
        >
          <span className="material-symbols-outlined text-sm">{config.icon}</span>
          {video.platform.toUpperCase()}
        </div>

        {video.author && (
          <span className="font-data-label text-on-surface-variant text-xs">
            {t('common.by')}{' '}
            <strong className="text-on-surface font-semibold">{video.author}</strong>
          </span>
        )}
      </div>

      {formattedUpdatedAt && (
        <div className="text-on-surface-variant/80 font-data-label mt-3 flex items-center gap-1.5 text-xs">
          <span className="material-symbols-outlined text-primary/70 text-[16px]">schedule</span>
          <span>
            {t('tactics.updatedAtLabel')}:{' '}
            <span className="text-on-surface font-semibold">{formattedUpdatedAt}</span>
          </span>
        </div>
      )}
    </div>
  );
}
