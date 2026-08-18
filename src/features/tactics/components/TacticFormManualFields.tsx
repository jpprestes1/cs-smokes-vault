import { type TacticFormData } from '../types';
import { useTranslation } from 'react-i18next';

interface TacticFormManualFieldsProps {
  formData: TacticFormData;
  setFormData: React.Dispatch<React.SetStateAction<TacticFormData>>;
}

export default function TacticFormManualFields({
  formData,
  setFormData,
}: TacticFormManualFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-4 duration-300">
      <label className="flex flex-col gap-1">
        <span className="text-on-surface-variant font-data-label text-xs">{t('common.title')}</span>
        <input
          type="text"
          placeholder={t('tactics.placeholders.tacticTitle')}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('common.type')}
          </span>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
          >
            <option value="SMOKE">{t('common.smoke')}</option>
            <option value="FLASH">{t('common.flash')}</option>
            <option value="MOLOTOV">{t('common.molotov')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('common.side')}
          </span>
          <select
            value={formData.side}
            onChange={(e) => setFormData({ ...formData, side: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
          >
            <option value="TERRORIST">{t('maps.sideT')}</option>
            <option value="COUNTER-TERRORIST">{t('maps.sideCt')}</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('tactics.coordX')}
          </span>
          <input
            type="number"
            placeholder={t('common.example45')}
            value={formData.x}
            onChange={(e) => setFormData({ ...formData, x: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('tactics.coordY')}
          </span>
          <input
            type="number"
            placeholder={t('common.example50')}
            value={formData.y}
            onChange={(e) => setFormData({ ...formData, y: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-on-surface-variant font-data-label text-xs">
          {t('common.description')}
        </span>
        <textarea
          rows={3}
          placeholder={t('tactics.placeholders.lineupInstructions')}
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary resize-none rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>
    </div>
  );
}
