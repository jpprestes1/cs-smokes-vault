import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StratPreset, StratData } from '../types';
import { presetStrats } from '../data/presetStrats';

interface TacticalBoardToolbarProps {
  stratTitle: string;
  onChangeTitle: (title: string) => void;
  onSelectPreset: (preset: StratPreset) => void;
  cloudStrats?: StratData[];
  onSelectCloudStrat?: (strat: StratData) => void;
  onDeleteCloudStrat?: (stratId: string) => void;
  loadedStratId?: string | null;
  onSaveStrat: () => void;
  onExportJson: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function TacticalBoardToolbar({
  stratTitle,
  onChangeTitle,
  onSelectPreset,
  cloudStrats = [],
  onSelectCloudStrat,
  onDeleteCloudStrat,
  loadedStratId,
  onSaveStrat,
  onExportJson,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: TacticalBoardToolbarProps) {
  const { t } = useTranslation();
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent, stratId: string, title: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        t('tacticalBoard.deleteConfirm', `Deseja realmente excluir a estratégia "${title}"?`)
      )
    ) {
      if (onDeleteCloudStrat) {
        onDeleteCloudStrat(stratId);
      }
    }
  };

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-wrap items-center gap-2">
      {/* Título da Strat */}
      <div className="bg-surface-container-high/80 border-outline-variant glass-panel flex items-center rounded-sm border px-3 py-1.5 backdrop-blur-md">
        <span className="font-data-label text-outline-variant mr-2 text-[10px] uppercase">
          STRAT:
        </span>
        <input
          type="text"
          value={stratTitle}
          onChange={(e) => onChangeTitle(e.target.value.toUpperCase())}
          className="font-data-label text-primary placeholder-on-surface-variant/40 w-36 bg-transparent text-xs font-bold uppercase outline-none focus:ring-0 sm:w-48"
          placeholder="UNTITLED_STRAT"
        />
        {loadedStratId && (
          <span className="bg-primary/20 text-primary border-primary/30 ml-2 rounded-xs border px-1.5 py-0.5 text-[9px] font-bold">
            CLOUD
          </span>
        )}
      </div>

      {/* Menu de Presets / Estratégias na Nuvem */}
      <div className="relative">
        <button
          onClick={() => setIsPresetsOpen(!isPresetsOpen)}
          className="bg-surface-container-high/80 border-outline-variant hover:border-primary text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-2 text-xs backdrop-blur-md transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">folder_open</span>
          <span className="hidden sm:inline">
            {t('tacticalBoard.presets', 'Estratégias')}
            {cloudStrats.length > 0 && ` (${cloudStrats.length})`}
          </span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>

        {isPresetsOpen && (
          <div className="bg-surface-container-highest glass-panel animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-1 max-h-[420px] w-72 overflow-y-auto rounded-sm border border-white/10 p-1 shadow-2xl backdrop-blur-xl duration-150">
            {/* Seção Nuvem (Firestore) */}
            <div className="font-data-label text-primary flex items-center justify-between border-b border-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">
              <span>
                {t('tacticalBoard.cloudStrats', 'Estratégias Salvas')} ({cloudStrats.length})
              </span>
              <span className="material-symbols-outlined text-[14px]">cloud</span>
            </div>

            {cloudStrats.length === 0 ? (
              <div className="text-on-surface-variant font-data-label px-3 py-3 text-center text-[11px]">
                {t('tacticalBoard.noCloudStrats', 'Nenhuma estratégia salva na nuvem.')}
              </div>
            ) : (
              cloudStrats.map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => {
                    if (onSelectCloudStrat) onSelectCloudStrat(strat);
                    setIsPresetsOpen(false);
                  }}
                  className={`hover:bg-primary/10 hover:text-primary flex cursor-pointer items-center justify-between px-3 py-2 transition-colors ${
                    loadedStratId === strat.id ? 'bg-primary/15 border-primary border-l-2' : ''
                  }`}
                >
                  <div className="flex flex-1 flex-col overflow-hidden pr-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-data-label text-on-surface truncate text-xs font-bold uppercase">
                        {strat.title}
                      </span>
                      {strat.side && (
                        <span
                          className={`rounded px-1 text-[9px] font-bold ${
                            strat.side === 'TERRORIST'
                              ? 'bg-primary/20 text-primary'
                              : strat.side === 'COUNTER-TERRORIST'
                                ? 'bg-secondary/20 text-secondary'
                                : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {strat.side === 'TERRORIST'
                            ? 'T'
                            : strat.side === 'COUNTER-TERRORIST'
                              ? 'CT'
                              : 'MIX'}
                        </span>
                      )}
                    </div>
                    {strat.description && (
                      <span className="text-on-surface-variant truncate text-[11px]">
                        {strat.description}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, strat.id, strat.title)}
                    className="text-on-surface-variant hover:text-error hover:bg-error/20 rounded p-1 transition-colors"
                    title={t('common.delete', 'Excluir')}
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}

            {/* Seção Presets do Sistema */}
            <div className="font-data-label text-outline-variant mt-2 border-t border-b border-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">
              {t('tacticalBoard.systemPresets', 'Presets do Sistema')}
            </div>
            {presetStrats.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  setIsPresetsOpen(false);
                }}
                className="hover:bg-primary/10 hover:text-primary text-on-surface flex w-full flex-col px-3 py-2 text-left transition-colors"
              >
                <span className="font-data-label text-xs font-bold uppercase">{preset.title}</span>
                <span className="text-on-surface-variant line-clamp-1 text-[11px]">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Botão Salvar Strat */}
      <button
        onClick={onSaveStrat}
        className="bg-surface-container-high/80 border-outline-variant hover:border-primary text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-2 text-xs shadow-lg backdrop-blur-md transition-colors active:scale-95"
        title="Salvar Estratégia na Nuvem (Firestore)"
      >
        <span className="material-symbols-outlined text-primary text-[16px]">cloud_upload</span>
        <span className="hidden sm:inline">{t('tacticalBoard.saveStrat', 'Salvar')}</span>
      </button>

      {/* Botão Exportar JSON */}
      <button
        onClick={onExportJson}
        className="bg-surface-container-high/80 border-outline-variant hover:border-primary text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-2.5 py-2 text-xs shadow-lg backdrop-blur-md transition-colors active:scale-95"
        title="Export Strategy JSON"
      >
        <span className="material-symbols-outlined text-[16px]">download</span>
      </button>

      {/* Controles de Zoom */}
      <div className="bg-surface-container-high/80 border-outline-variant glass-panel flex items-center rounded-sm border backdrop-blur-md">
        <button
          onClick={onZoomOut}
          disabled={zoom <= 0.8}
          className="text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <button
          onClick={onResetZoom}
          className="font-data-label text-on-surface-variant hover:text-primary px-1 text-[10px] font-bold"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          disabled={zoom >= 2}
          className="text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
    </div>
  );
}
