import { useState, useRef, useEffect } from 'react';
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
  onImportJson?: (file: File) => void;
  onShareStrat?: () => void;
  disabled?: boolean;
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
  onImportJson,
  onShareStrat,
  disabled = false,
}: TacticalBoardToolbarProps) {
  const { t } = useTranslation();
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (e: React.MouseEvent, stratId: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(t('tacticalBoard.deleteConfirm', { title }))) {
      if (onDeleteCloudStrat) {
        onDeleteCloudStrat(stratId);
      }
    }
  };

  return (
    <div ref={toolbarRef} className="absolute top-4 right-4 z-30 flex flex-wrap items-center gap-2">
      {/* Título da Strat */}
      <div
        className={`bg-surface-container-high/80 border-outline-variant glass-panel flex items-center rounded-sm border px-3 py-1.5 backdrop-blur-md ${
          disabled ? 'opacity-40 select-none' : ''
        }`}
      >
        <span className="font-data-label text-outline-variant mr-2 text-[10px] uppercase">
          STRAT:
        </span>
        <input
          type="text"
          disabled={disabled}
          value={stratTitle}
          onChange={(e) => onChangeTitle(e.target.value.toUpperCase())}
          className={`font-data-label text-primary placeholder-on-surface-variant/40 w-36 bg-transparent text-xs font-bold uppercase outline-none focus:ring-0 sm:w-48 ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
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
          disabled={disabled}
          onClick={() => {
            setIsPresetsOpen(!isPresetsOpen);
            setIsShareOpen(false);
          }}
          className={`bg-surface-container-high/80 border-outline-variant text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-2 text-xs backdrop-blur-md transition-colors ${
            disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-primary active:scale-95'
          } ${isPresetsOpen ? 'border-primary text-primary' : ''}`}
        >
          <span className="material-symbols-outlined text-[16px]">folder_open</span>
          <span className="hidden sm:inline">
            {t('tacticalBoard.presets', 'Estratégias')}
            {cloudStrats.length > 0 && ` (${cloudStrats.length})`}
          </span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>

        {isPresetsOpen && !disabled && (
          <div className="bg-surface-container-highest glass-panel animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-1 max-h-[420px] w-72 overflow-y-auto rounded-sm border border-white/10 p-1 shadow-2xl backdrop-blur-xl duration-150">
            {/* Seção Nuvem (Firestore) */}
            <div className="font-data-label text-primary flex items-center justify-between border-b border-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">
              <span>
                {t('tacticalBoard.cloudStrats', 'Estratégias Salvas')} ({cloudStrats.length})
              </span>
              <span className="material-symbols-outlined text-[14px]">cloud</span>
            </div>

            {cloudStrats.length === 0 ? (
              <div className="text-on-surface-variant font-data-label p-3 text-center text-xs">
                {t('tacticalBoard.noCloudStrats', 'Nenhuma estratégia salva.')}
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
                    loadedStratId === strat.id ? 'bg-primary/15 text-primary' : 'text-on-surface'
                  }`}
                >
                  <div className="flex flex-1 flex-col overflow-hidden pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-data-label truncate text-xs font-bold uppercase">
                        {strat.title}
                      </span>
                    </div>
                    {strat.description && (
                      <span className="text-on-surface-variant line-clamp-1 text-[10px]">
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

            {/* Seção Presets do Sistema (se houver) */}
            {presetStrats.length > 0 && (
              <>
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
                    <span className="font-data-label text-xs font-bold uppercase">
                      {preset.title}
                    </span>
                    <span className="text-on-surface-variant line-clamp-1 text-[11px]">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Botão Salvar Strat */}
      <button
        disabled={disabled}
        onClick={onSaveStrat}
        className={`bg-surface-container-high/80 border-outline-variant text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-2 text-xs shadow-lg backdrop-blur-md transition-colors ${
          disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-primary active:scale-95'
        }`}
        title="Salvar Estratégia na Nuvem (Firestore)"
      >
        <span className="material-symbols-outlined text-primary text-[16px]">cloud_upload</span>
        <span className="hidden sm:inline">{t('tacticalBoard.saveStrat', 'Salvar')}</span>
      </button>

      {/* Dropdown de Compartilhamento (Copiar Link / Baixar JSON) */}
      <div className="relative">
        <button
          disabled={disabled}
          onClick={() => {
            setIsShareOpen(!isShareOpen);
            setIsPresetsOpen(false);
          }}
          className={`bg-surface-container-high/80 border-outline-variant text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-2.5 py-2 text-xs shadow-lg backdrop-blur-md transition-colors ${
            disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-primary active:scale-95'
          } ${isShareOpen ? 'border-primary text-primary' : ''}`}
          title={t('tacticalBoard.shareStrat', 'Compartilhar Tática')}
        >
          <span className="material-symbols-outlined text-[16px]">share</span>
          <span className="material-symbols-outlined text-xs">expand_more</span>
        </button>

        {isShareOpen && !disabled && (
          <div className="bg-surface-container-highest/95 border-outline-variant tactical-glass animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-1 flex w-52 flex-col rounded-sm border py-1 shadow-2xl backdrop-blur-xl duration-150">
            {/* Opção 1: Copiar Link */}
            {onShareStrat && (
              <button
                onClick={() => {
                  onShareStrat();
                  setIsShareOpen(false);
                }}
                className="hover:bg-primary/10 hover:text-primary text-on-surface flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold uppercase transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-[16px]">link</span>
                <div className="flex flex-col">
                  <span className="font-data-label">
                    {t('tacticalBoard.copyLink', 'Copiar Link')}
                  </span>
                </div>
              </button>
            )}

            {/* Opção 2: Baixar JSON */}
            <button
              onClick={() => {
                onExportJson();
                setIsShareOpen(false);
              }}
              className="hover:bg-primary/10 hover:text-primary text-on-surface flex items-center gap-2.5 border-t border-white/5 px-3 py-2 text-left text-xs font-bold uppercase transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-[16px]">download</span>
              <div className="flex flex-col">
                <span className="font-data-label">
                  {t('tacticalBoard.downloadJson', 'Baixar JSON')}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Botão Importar JSON */}
      {onImportJson && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportJson(file);
              }
              e.target.value = '';
            }}
          />
          <button
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-surface-container-high/80 border-outline-variant text-on-surface glass-panel font-data-label flex items-center gap-1.5 rounded-sm border px-2.5 py-2 text-xs shadow-lg backdrop-blur-md transition-colors ${
              disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-primary active:scale-95'
            }`}
            title={t('tacticalBoard.importJson', 'Importar Tática (JSON)')}
          >
            <span className="material-symbols-outlined text-primary text-[16px]">upload_file</span>
            <span className="hidden md:inline">
              {t('tacticalBoard.importJsonShort', 'Importar')}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
