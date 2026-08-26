import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import type { BoardPath, BoardEntity, StratFrame } from '../types';
import { createStrat, updateStrat } from '../services/stratsService';

interface SaveStratModalProps {
  mapId: string;
  stratTitle: string;
  stratDescription?: string;
  stratSide?: 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED';
  frames?: StratFrame[];
  paths?: BoardPath[];
  entities?: BoardEntity[];
  loadedStratId: string | null;
  onClose: () => void;
  onSuccess: (
    savedTitle: string,
    savedDescription: string,
    savedSide: 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED',
    stratId: string
  ) => void;
}

export default function SaveStratModal({
  mapId,
  stratTitle,
  stratDescription = '',
  stratSide = 'MIXED',
  frames = [],
  paths = [],
  entities = [],
  loadedStratId,
  onClose,
  onSuccess,
}: SaveStratModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const canSave = Boolean(user);

  const [title, setTitle] = useState(stratTitle || '');
  const [description, setDescription] = useState(stratDescription || '');
  const [side, setSide] = useState<'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED'>(stratSide);
  const [saveAsNew, setSaveAsNew] = useState(!loadedStratId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('tacticalBoard.titleRequired', 'O título da estratégia é obrigatório.'));
      return;
    }

    if (!canSave) {
      setError(t('tacticalBoard.needAuth'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (loadedStratId && !saveAsNew) {
        // Atualizar estratégia existente
        await updateStrat(loadedStratId, {
          title: title.trim().toUpperCase(),
          description: description.trim(),
          side,
          frames,
          paths,
          entities,
        });
        onSuccess(title.trim().toUpperCase(), description.trim(), side, loadedStratId);
      } else {
        // Criar nova estratégia vinculada ao usuário atual
        const newId = await createStrat({
          title: title.trim().toUpperCase(),
          mapId,
          description: description.trim(),
          side,
          frames,
          paths,
          entities,
          authorId: user?.uid || '',
          authorEmail: user?.email || '',
          isPublic: true,
        });
        onSuccess(title.trim().toUpperCase(), description.trim(), side, newId);
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar estratégia:', err);
      const msg = err instanceof Error ? err.message : t('tacticalBoard.saveError');
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="bg-surface-container/95 border-outline-variant tactical-glass animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-lg border p-6 shadow-2xl duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">save</span>
            <h3 className="font-display-lg text-primary text-xl tracking-wider uppercase">
              {loadedStratId && !saveAsNew
                ? t('tacticalBoard.updateStrat', 'Atualizar Estratégia')
                : t('tacticalBoard.saveToCloud', 'Salvar Estratégia')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary rounded p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Aviso se o usuário não está autenticado */}
        {!canSave && (
          <div className="mt-4 flex items-center gap-2 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
            <span className="material-symbols-outlined text-base">lock</span>
            <span>
              {t(
                'tacticalBoard.needAuth',
                'Você precisa estar autenticado para salvar táticas na nuvem.'
              )}
            </span>
          </div>
        )}

        {/* Notificação de Erro */}
        {error && (
          <div className="bg-error/20 border-error/40 text-error mt-4 rounded border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Título */}
          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs uppercase">
              {t('common.title', 'Título')} *
            </span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="EX: MIRAGE_A_EXECUTE"
              className="bg-surface-variant/20 text-on-surface focus:border-primary font-data-label rounded border border-white/10 p-2.5 text-xs font-bold uppercase transition-colors outline-none"
            />
          </label>

          {/* Lado / Equipe */}
          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs uppercase">
              {t('common.side', 'Lado / Facção')}
            </span>
            <select
              value={side}
              onChange={(e) =>
                setSide(e.target.value as 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED')
              }
              className="bg-surface-variant/20 text-on-surface focus:border-primary font-data-label rounded border border-white/10 p-2.5 text-xs transition-colors outline-none"
            >
              <option value="TERRORIST">{t('maps.sideT', 'Terrorista (T)')}</option>
              <option value="COUNTER-TERRORIST">
                {t('maps.sideCt', 'Contra-Terrorista (CT)')}
              </option>
              <option value="MIXED">{t('tacticalBoard.bothSides', 'Ambos / Misto')}</option>
            </select>
          </label>

          {/* Descrição */}
          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs uppercase">
              {t('common.description', 'Descrição / Notas Táticas')}
            </span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                'tacticalBoard.descPlaceholder',
                'Ex: Execute coordenado no Bombsite A com 3 smokes e flashes de suporte...'
              )}
              className="bg-surface-variant/20 text-on-surface focus:border-primary resize-none rounded border border-white/10 p-2.5 text-xs transition-colors outline-none"
            />
          </label>

          {/* Opção se já existe uma estratégia carregada */}
          {loadedStratId && (
            <div className="bg-surface-container-high/50 rounded border border-white/10 p-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={saveAsNew}
                  onChange={(e) => setSaveAsNew(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span className="font-data-label text-on-surface text-xs">
                  {t('tacticalBoard.saveAsNewCopy', 'Salvar como uma nova cópia')}
                </span>
              </label>
            </div>
          )}

          {/* Informação de Contagem */}
          <div className="font-data-label text-on-surface-variant flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
            <span>
              {t('tacticalBoard.pathsCount', 'Trajetórias')}: {paths.length}
            </span>
            <span>
              {t('tacticalBoard.entitiesCount', 'Entidades')}: {entities.length}
            </span>
            <span>
              {t('tacticalBoard.map', 'Mapa')}: {mapId.toUpperCase()}
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-surface-container text-on-surface-variant hover:text-on-surface font-data-label flex-1 rounded py-2.5 text-xs uppercase transition-colors"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSave}
              className={`font-headline-md flex flex-1 items-center justify-center gap-2 rounded py-2.5 text-xs font-bold uppercase transition-all ${
                isSubmitting || !canSave
                  ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  : 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(246,174,45,0.4)] active:scale-95'
              }`}
            >
              {isSubmitting
                ? t('common.saving', 'Salvando...')
                : loadedStratId && !saveAsNew
                  ? t('tacticalBoard.update', 'Atualizar')
                  : t('tacticalBoard.save', 'Salvar na Nuvem')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
