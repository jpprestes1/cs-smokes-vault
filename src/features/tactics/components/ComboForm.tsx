import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ComboTarget, type ComboData, type PlatformType, type GrenadeType } from '../types';
import { createCombo, updateCombo, addVideoToCombo } from '../services/combosService';

interface ComboFormProps {
  mapId?: string;
  coords?: { x: number; y: number };
  onClose: () => void;
  initialData?: ComboData; // Propriedade de edição
}

export default function ComboForm({ mapId, onClose, initialData }: ComboFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [side, setSide] = useState(initialData?.side || 'TERRORIST');
  const [desc, setDesc] = useState(initialData?.desc || '');
  const [startX, setStartX] = useState(initialData?.startX.toString() || '');
  const [startY, setStartY] = useState(initialData?.startY.toString() || '');

  // Carrega os alvos existentes na edição ou inicia vazio na criação
  const [targets, setTargets] = useState<Array<{ type: GrenadeType; endX: string; endY: string }>>(
    initialData?.targets.map((tgt) => ({
      type: tgt.type,
      endX: tgt.endX.toString(),
      endY: tgt.endY.toString(),
    })) || []
  );

  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('youtube');
  const [author, setAuthor] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddTarget = (e: React.MouseEvent) => {
    e.preventDefault();
    setTargets([...targets, { type: 'SMOKE', endX: '', endY: '' }]);
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleTargetChange = (index: number, field: 'type' | 'endX' | 'endY', value: string) => {
    const updated = [...targets];
    if (field === 'type') {
      updated[index] = {
        ...updated[index],
        type: value as GrenadeType,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setTargets(updated);
  };

  const handleSubmit = async () => {
    if (!title || !startX || !startY || targets.length === 0) {
      showToast(t('tactics.formErrors.comboRequiredFields'), 'error');
      return;
    }

    if (!initialData && !videoUrl) {
      showToast(t('tactics.formErrors.comboVideoRequired'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedTargets: ComboTarget[] = targets.map((tgt) => ({
        type: tgt.type,
        endX: Number(tgt.endX),
        endY: Number(tgt.endY),
      }));

      // MODO EDIÇÃO
      if (initialData) {
        await updateCombo(initialData.id, {
          title,
          side,
          startX: Number(startX),
          startY: Number(startY),
          targets: formattedTargets,
          desc,
        });

        if (videoUrl) {
          await addVideoToCombo(initialData.id, {
            platform,
            title,
            videoUrl,
            author,
            difficulty: 'MEDIUM',
          });
        }

        showToast(t('tactics.formSuccess.comboUpdated'), 'success');
        setTimeout(() => onClose(), 1500);
        return;
      }

      // MODO CRIAÇÃO
      await createCombo({
        mapId: mapId || '',
        title,
        side,
        startX: Number(startX),
        startY: Number(startY),
        targets: formattedTargets,
        desc,
        initialVideo: {
          platform,
          title,
          videoUrl,
          author,
          difficulty: 'MEDIUM',
        },
      });

      showToast(t('tactics.formSuccess.comboPublished'), 'success');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Erro ao salvar combo:', error);
      showToast(t('tactics.formErrors.saveDb'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      {toast && (
        <div
          className={`absolute top-4 left-1/2 z-50 flex w-[95%] -translate-x-1/2 items-center gap-2 rounded px-4 py-3 shadow-xl transition-all ${toast.type === 'success' ? 'bg-green-900/95 text-green-400' : 'bg-red-900/95 text-red-400'}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-data-label text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">{initialData ? 'edit' : 'strategy'}</span>
          {initialData ? t('tactics.editCombo') : t('tactics.addCombo')}
        </h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors"
        >
          <span className="material-symbols-outlined p-1">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              {t('common.title')}
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
              placeholder={t('tactics.placeholders.comboTitle')}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              {t('common.side')}
            </span>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            >
              <option value="TERRORIST">{t('maps.sideT')}</option>
              <option value="COUNTER-TERRORIST">{t('maps.sideCt')}</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              {t('tactics.startCoordX')}
            </span>
            <input
              type="number"
              value={startX}
              onChange={(e) => setStartX(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
              placeholder={t('common.example45')}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              {t('tactics.startCoordY')}
            </span>
            <input
              type="number"
              value={startY}
              onChange={(e) => setStartY(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
              placeholder={t('common.example50')}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('common.description')}
          </span>
          <textarea
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="bg-surface-variant/20 text-on-surface focus:border-primary resize-none rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            placeholder={t('tactics.placeholders.comboDescription')}
          ></textarea>
        </label>

        <div className="border-t border-white/10 pt-4">
          <span className="text-on-surface-variant font-data-label mb-2 block text-xs">
            {t('tactics.attachVideo')}
          </span>
          <div className="mb-4 flex gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PlatformType)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary w-1/3 rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            >
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder={t('common.url')}
              className="bg-surface-variant/20 text-on-surface focus:border-primary flex-1 rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              {t('common.creator')}
            </span>
            <input
              type="text"
              placeholder={t('tactics.placeholders.creatorShort')}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            />
          </label>
        </div>

        <div className="border-t border-white/10 pt-4">
          <span className="text-primary font-data-label mb-3 block text-xs font-bold uppercase">
            {t('tactics.targetGrenades')}
          </span>

          <div className="flex flex-col gap-3">
            {targets.map((target, idx) => (
              <div
                key={idx}
                className="bg-surface-container flex items-center gap-2 rounded border border-white/10 p-2"
              >
                <select
                  value={target.type}
                  onChange={(e) => handleTargetChange(idx, 'type', e.target.value)}
                  className="bg-transparent text-xs outline-none focus:ring-0"
                >
                  <option value="SMOKE">{t('common.smoke')}</option>
                  <option value="FLASH">{t('common.flash')}</option>
                  <option value="MOLOTOV">{t('common.molotov')}</option>
                </select>

                <div className="flex flex-1 gap-2">
                  <input
                    type="number"
                    placeholder={t('tactics.coordXShort')}
                    value={target.endX}
                    onChange={(e) => handleTargetChange(idx, 'endX', e.target.value)}
                    className="bg-surface-variant/20 text-on-surface focus:border-primary w-full rounded border border-white/10 p-1.5 text-xs transition-colors outline-none"
                  />
                  <input
                    type="number"
                    placeholder={t('tactics.coordYShort')}
                    value={target.endY}
                    onChange={(e) => handleTargetChange(idx, 'endY', e.target.value)}
                    className="bg-surface-variant/20 text-on-surface focus:border-primary w-full rounded border border-white/10 p-1.5 text-xs transition-colors outline-none"
                  />
                </div>

                <button
                  onClick={() => handleRemoveTarget(idx)}
                  className="text-error hover:bg-error/20 rounded p-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTarget}
            className="text-on-surface hover:text-primary mt-3 flex w-full items-center justify-center gap-1 rounded border border-dashed border-white/20 p-2 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span> {t('tactics.addTarget')}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`font-headline-md mt-4 flex justify-center gap-2 rounded py-3 font-bold transition-transform ${isSubmitting ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(246,174,45,0.4)] active:scale-95'}`}
        >
          {isSubmitting
            ? t('common.saving').toUpperCase()
            : initialData
              ? t('tactics.updateCombo')
              : t('tactics.publishCombo')}
        </button>
      </div>
    </div>
  );
}
