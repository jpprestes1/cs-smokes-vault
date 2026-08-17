import { type ComboData, type VideoData } from '../types';

interface ComboDetailsProps {
  combo: ComboData;
  onSelectVideo: (video: VideoData) => void;
}

const platformConfig = {
  youtube: { color: 'bg-red-600', icon: 'play_circle' },
  tiktok: { color: 'bg-cyan-500', icon: 'music_note' },
  instagram: { color: 'bg-fuchsia-600', icon: 'photo_camera' },
};

const getThumbnailUrl = (platform: string, embedUrl: string, fallbackThumb: string) => {
  if (fallbackThumb && fallbackThumb.trim() !== '') {
    return fallbackThumb;
  }
  if (platform === 'youtube') {
    const videoId = embedUrl.split('/embed/')[1]?.split('?')[0];
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  // Fallback genérico para combos (você pode colocar uma imagem específica de combo depois)
  return `/images/bg-smoke-video.png`;
};

export default function ComboDetails({ combo, onSelectVideo }: ComboDetailsProps) {
  return (
    <>
      <p className="font-body-base text-on-surface-variant text-sm">{combo.desc}</p>

      <div className="bg-primary/10 border-primary/20 text-primary mt-2 w-fit rounded border px-2 py-1">
        <span className="font-data-label text-xs font-bold">
          {combo.targets.length} GRENADES IN THIS COMBO
        </span>
      </div>

      <div className="mt-6">
        <h4 className="font-data-label text-data-label text-on-surface-variant mb-4 border-b border-white/10 pb-2">
          EXECUTION GUIDES
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {combo.videos?.map((video) => {
            const config =
              platformConfig[video.platform as keyof typeof platformConfig] ||
              platformConfig.youtube;

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="group flex cursor-pointer flex-col gap-2"
              >
                <div className="group-hover:border-primary relative aspect-[9/16] w-full overflow-hidden rounded-md border border-white/10 transition-colors">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url('${getThumbnailUrl(video.platform, video.embedUrl, video.thumbnail)}')`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent"></div>

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
                <div className="flex flex-col">
                  <span className="font-data-label text-on-surface group-hover:text-primary truncate text-xs transition-colors">
                    {video.title}
                  </span>
                  {video.author && (
                    <span className="font-data-label text-on-surface-variant truncate text-[10px]">
                      by {video.author}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
