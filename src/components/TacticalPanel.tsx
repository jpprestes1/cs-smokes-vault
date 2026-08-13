import { type MarkerData, type VideoData } from '../data/markers';

interface TacticalPanelProps {
  marker: MarkerData | null;
  selectedVideo: VideoData | null;
  onClose: () => void;
  onSelectVideo: (video: VideoData | null) => void;
}

const platformConfig = {
  youtube: { color: 'bg-red-600', icon: 'play_circle' },
  tiktok: { color: 'bg-cyan-500', icon: 'music_note' },
  instagram: { color: 'bg-fuchsia-600', icon: 'photo_camera' },
};

// Função que tenta extrair a thumbnail automaticamente
const getThumbnailUrl = (platform: string, embedUrl: string, fallbackThumb: string) => {
  if (platform === 'youtube') {
    // Pega o ID da URL do YouTube (ex: tira o 'dQw4w9WgXcQ' de '.../embed/dQw4w9WgXcQ')
    const videoId = embedUrl.split('/embed/')[1]?.split('?')[0];
    if (videoId) {
      // Retorna a imagem oficial do YouTube em alta qualidade (hqdefault) ou máxima (maxresdefault)
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // Para TikTok e Instagram, como requerem API no Backend, usamos a thumbnail do banco de dados
  return fallbackThumb;
};

export default function TacticalPanel({
  marker,
  selectedVideo,
  onClose,
  onSelectVideo,
}: TacticalPanelProps) {
  return (
    <aside
      className={`bg-surface-container/95 fixed top-16 right-0 z-40 flex h-[calc(100vh-64px)] w-full transform flex-col border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ease-out md:w-[450px] ${
        marker ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {marker && (
        <>
          <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  cloud
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
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
            {!selectedVideo ? (
              <>
                <p className="font-body-base text-on-surface-variant text-sm">{marker.desc}</p>
                <div className="mt-2">
                  <h4 className="font-data-label text-data-label text-on-surface-variant mb-4 border-b border-white/10 pb-2">
                    AVAILABLE GUIDES
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {marker.videos?.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => onSelectVideo(video)}
                        className="group flex cursor-pointer flex-col gap-2"
                      >
                        <div className="group-hover:border-primary relative aspect-[9/16] w-full overflow-hidden rounded-md border border-white/10 transition-colors">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundImage: `url('${video.thumbnail}')` }}
                          ></div>
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                            style={{
                              backgroundImage: `url('${getThumbnailUrl(video.platform, video.embedUrl, video.thumbnail)}')`,
                            }}
                          ></div>
                          <div
                            className={`absolute top-2 right-2 flex items-center gap-1 rounded px-2 py-1 ${platformConfig[video.platform].color} text-[10px] font-bold tracking-wider text-white`}
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              {platformConfig[video.platform].icon}
                            </span>
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
                        <span className="font-data-label text-on-surface group-hover:text-primary truncate text-xs transition-colors">
                          {video.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 flex h-full flex-col duration-300">
                <button
                  onClick={() => onSelectVideo(null)}
                  className="text-on-surface-variant hover:text-primary font-data-label mb-4 flex w-fit items-center gap-2 text-xs uppercase transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Back to List
                </button>
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
                  <iframe
                    src={selectedVideo.embedUrl}
                    className="absolute inset-0 h-full w-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <h4 className="font-headline-md text-primary mt-4 text-lg">
                  {selectedVideo.title}
                </h4>
                <div
                  className={`mt-2 flex w-fit items-center gap-1 rounded px-3 py-1 ${platformConfig[selectedVideo.platform].color} text-xs font-bold text-white`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {platformConfig[selectedVideo.platform].icon}
                  </span>
                  {selectedVideo.platform.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
