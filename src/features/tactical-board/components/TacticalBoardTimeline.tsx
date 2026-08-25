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
  const progressPercent = (currentIndex / maxIndex) * 100;

  return (
    <div className="bg-surface-container-low border-outline-variant/30 tactical-glass relative z-20 flex flex-col gap-2 border-t px-4 py-2 select-none shadow-lg">
      {/* Barra de Controles e Info de Tempo */}
      <div className="flex items-center justify-between gap-4">
        {/* Esquerda: Identificador do Round / Frame */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">schedule</span>
            <span className="font-display text-primary text-xs font-bold tracking-wider uppercase">
              {t('tacticalBoard.timeline.roundProgression', 'PROGRESSÃO DE ROUND')}
            </span>
          </div>

          <span className="bg-primary/10 text-primary border-primary/30 font-data-label rounded border px-2 py-0.5 text-xs font-bold tracking-widest">
            {formatTime(currentTime)} <span className="text-on-surface-variant font-normal">/ 1:40</span>
          </span>

          <span className="text-on-surface-variant font-data-label hidden text-[11px] sm:inline">
            [{currentIndex + 1}/6 {t('tacticalBoard.timeline.step', 'FRAME')}]
          </span>
        </div>

        {/* Centro / Direita: Ações de Playback e Utilidades */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botão Marco Anterior (-20s) */}
          <button
            type="button"
            onClick={onPrevTime}
            disabled={currentIndex === 0}
            className="hover:bg-surface-container-high text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            title={t('tacticalBoard.timeline.prevFrame', 'Recuar 20s (←)')}
          >
            <span className="material-symbols-outlined text-lg">fast_rewind</span>
          </button>

          {/* Botão Play / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex h-8 items-center gap-1.5 rounded px-3 text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-primary-container text-surface ring-primary/40 animate-pulse ring-2'
                : 'bg-primary hover:bg-primary-hover text-surface hover:shadow-primary/20'
            }`}
            title={isPlaying ? t('tacticalBoard.timeline.pause', 'Pausar') : t('tacticalBoard.timeline.play', 'Reproduzir Progressão')}
          >
            <span className="material-symbols-outlined text-base">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span className="font-data-label tracking-wider uppercase">
              {isPlaying ? t('tacticalBoard.timeline.pause', 'PAUSAR') : t('tacticalBoard.timeline.play', 'PLAY')}
            </span>
          </button>

          {/* Botão Próximo Marco (+20s) */}
          <button
            type="button"
            onClick={onNextTime}
            disabled={currentIndex === maxIndex}
            className="hover:bg-surface-container-high text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            title={t('tacticalBoard.timeline.nextFrame', 'Avançar 20s (→)')}
          >
            <span className="material-symbols-outlined text-lg">fast_forward</span>
          </button>

          <div className="bg-outline-variant/30 mx-1 hidden h-4 w-[1px] sm:block" />

          {/* Botão Copiar Frame Atual para o Próximo */}
          <button
            type="button"
            onClick={onCopyFrameToNext}
            disabled={currentIndex === maxIndex}
            className="hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex h-8 items-center gap-1 rounded px-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            title={t('tacticalBoard.timeline.copyToNextTip', 'Copiar posicionamento atual para o próximo marco (+20s)')}
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
            <span className="font-data-label hidden text-[10px] tracking-wider uppercase md:inline">
              {t('tacticalBoard.timeline.cloneNext', 'CLONAR')}
            </span>
          </button>

          {/* Botão Limpar Marco Atual */}
          <button
            type="button"
            onClick={onClearCurrentFrame}
            className="hover:bg-error/20 text-on-surface-variant hover:text-error flex h-8 w-8 items-center justify-center rounded transition-colors"
            title={t('tacticalBoard.timeline.clearFrame', 'Limpar apenas este marco temporal')}
          >
            <span className="material-symbols-outlined text-base">layers_clear</span>
          </button>
        </div>
      </div>

      {/* Trilha da Linha do Tempo Visual */}
      <div className="relative py-2">
        {/* Linha de Base */}
        <div className="bg-surface-container-highest absolute top-1/2 right-0 left-0 h-1.5 -translate-y-1/2 rounded-full">
          {/* Preenchimento de Progresso */}
          <div
            className="bg-primary/80 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Marcos de Tempo Clicáveis */}
        <div className="relative flex justify-between">
          {TIMELINE_TIMESTAMPS.map((timestamp, idx) => {
            const isActive = currentTime === timestamp;
            const isPassed = currentTime >= timestamp;
            const frameData = framesList.find((f) => f.time === timestamp);
            const entitiesCount = frameData?.entities?.length || 0;
            const pathsCount = frameData?.paths?.length || 0;
            const hasContent = entitiesCount > 0 || pathsCount > 0;

            return (
              <button
                key={timestamp}
                type="button"
                onClick={() => onSetTime(timestamp)}
                className="group relative flex flex-col items-center focus:outline-none"
              >
                {/* Indicador Circular */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary border-primary-container ring-primary/30 scale-125 shadow-lg shadow-amber-500/30 ring-4'
                      : isPassed
                        ? 'bg-surface-container-high border-primary text-primary'
                        : 'bg-surface-container-high border-outline-variant/50 text-outline-variant hover:border-primary/60'
                  }`}
                >
                  {isActive ? (
                    <span className="bg-surface h-2 w-2 rounded-full" />
                  ) : (
                    <span className="font-data-label text-[9px] font-bold">
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Rótulo de Tempo */}
                <span
                  className={`font-data-label mt-1 text-[10px] tracking-wider transition-colors ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant group-hover:text-on-surface'
                  }`}
                >
                  {formatTime(timestamp)}
                </span>

                {/* Badge de Conteúdo / Entidades */}
                {hasContent && (
                  <span
                    className={`font-data-label absolute -top-3 rounded-full px-1 text-[8px] font-bold ${
                      isActive
                        ? 'bg-primary-container text-surface'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {entitiesCount > 0 ? `${entitiesCount}e` : ''}
                    {pathsCount > 0 ? `${pathsCount}p` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
