import { useTranslation } from 'react-i18next';
import { TIMELINE_TIMESTAMPS, type StratFrame } from '../types';

interface TacticalBoardTimelineProps {
  currentTime: number;
  isPlaying: boolean;
  framesList: StratFrame[];
  onSetTime: (time: number) => void;
  onNextTime: () => void;
  onPrevTime: () => void;
  onTogglePlay: () => void;
  onCopyFrameToNext: () => void;
  onClearCurrentFrame: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function TacticalBoardTimeline({
  currentTime,
  isPlaying,
  framesList,
  onSetTime,
  onNextTime,
  onPrevTime,
  onTogglePlay,
  onCopyFrameToNext,
  onClearCurrentFrame,
}: TacticalBoardTimelineProps) {
  const { t } = useTranslation();

  const currentIndex = TIMELINE_TIMESTAMPS.indexOf(
    currentTime as (typeof TIMELINE_TIMESTAMPS)[number]
  );
  const maxIndex = TIMELINE_TIMESTAMPS.length - 1;

  return (
    <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 max-w-[calc(100vw-2rem)] items-center gap-1.5 rounded-full border border-white/10 bg-surface-container/90 px-2.5 py-1.5 shadow-2xl backdrop-blur-md select-none sm:gap-2">
      {/* Controles de Playback */}
      <div className="flex items-center gap-0.5">
        {/* Recuar 20s */}
        <button
          type="button"
          onClick={onPrevTime}
          disabled={currentIndex === 0}
          className="text-on-surface-variant hover:bg-white/10 hover:text-primary flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-25"
          title={t('tacticalBoard.timeline.prevFrame', 'Recuar 20s (←)')}
        >
          <span className="material-symbols-outlined text-[18px]">fast_rewind</span>
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95 shadow-sm ${
            isPlaying
              ? 'bg-primary-container text-surface animate-pulse ring-primary/40 ring-2'
              : 'bg-primary hover:bg-primary-hover text-surface'
          }`}
          title={isPlaying ? t('tacticalBoard.timeline.pause', 'Pausar') : t('tacticalBoard.timeline.play', 'Reproduzir')}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Avançar 20s */}
        <button
          type="button"
          onClick={onNextTime}
          disabled={currentIndex === maxIndex}
          className="text-on-surface-variant hover:bg-white/10 hover:text-primary flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-25"
          title={t('tacticalBoard.timeline.nextFrame', 'Avançar 20s (→)')}
        >
          <span className="material-symbols-outlined text-[18px]">fast_forward</span>
        </button>
      </div>

      {/* Separador */}
      <div className="bg-white/10 h-3.5 w-[1px]" />

      {/* Segmentos de Tempo */}
      <div className="bg-surface-container-low/80 flex items-center gap-0.5 rounded-full border border-white/5 p-0.5 sm:gap-1">
        {TIMELINE_TIMESTAMPS.map((timestamp) => {
          const isActive = currentTime === timestamp;
          const frameData = framesList.find((f) => f.time === timestamp);
          const hasContent =
            (frameData?.entities?.length || 0) > 0 || (frameData?.paths?.length || 0) > 0;

          return (
            <button
              key={timestamp}
              type="button"
              onClick={() => onSetTime(timestamp)}
              className={`font-data-label relative flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider transition-all ${
                isActive
                  ? 'bg-primary text-surface scale-105 shadow-sm font-black'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              {formatTime(timestamp)}
              {hasContent && !isActive && (
                <span className="bg-primary-container absolute top-0.5 right-1 h-1 w-1 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Separador */}
      <div className="bg-white/10 h-3.5 w-[1px]" />

      {/* Ações Rápidas */}
      <div className="flex items-center gap-0.5">
        {/* Clonar para o Próximo Marco */}
        <button
          type="button"
          onClick={onCopyFrameToNext}
          disabled={currentIndex === maxIndex}
          className="text-on-surface-variant hover:bg-white/10 hover:text-primary flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-25"
          title={t('tacticalBoard.timeline.copyToNextTip', 'Copiar posicionamento para o próximo marco (+20s)')}
        >
          <span className="material-symbols-outlined text-[15px]">content_copy</span>
        </button>

        {/* Limpar Marco Atual */}
        <button
          type="button"
          onClick={onClearCurrentFrame}
          className="text-on-surface-variant hover:bg-error/20 hover:text-error flex h-7 w-7 items-center justify-center rounded-full transition-all"
          title={t('tacticalBoard.timeline.clearFrame', 'Limpar apenas este marco temporal')}
        >
          <span className="material-symbols-outlined text-[15px]">layers_clear</span>
        </button>
      </div>
    </div>
  );
}
