import { type TacticFormData } from '../types';
import { useTranslation } from 'react-i18next';

interface TacticFormVideoFieldsProps {
  formData: TacticFormData;
  setFormData: React.Dispatch<React.SetStateAction<TacticFormData>>;
  isManualEntry: boolean;
}

export default function TacticFormVideoFields({
  formData,
  setFormData,
  isManualEntry,
}: TacticFormVideoFieldsProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`border-t border-white/10 pt-4 ${!isManualEntry ? 'mt-0 border-t-0 pt-0' : ''}`}
    >
      <label className="flex flex-col gap-1 pb-2">
        <span className="text-on-surface-variant font-data-label text-xs">
          {t('tactics.videoTitle')}
        </span>
        <input
          type="text"
          placeholder={t('tactics.placeholders.videoTitle')}
          value={formData.titleVideo}
          onChange={(e) => setFormData({ ...formData, titleVideo: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 pb-2">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('tactics.throwCoordX')}
          </span>
          <input
            type="number"
            placeholder={t('common.example45')}
            value={formData.throwX}
            onChange={(e) => setFormData({ ...formData, throwX: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">
            {t('tactics.throwCoordY')}
          </span>
          <input
            type="number"
            placeholder={t('common.example50')}
            value={formData.throwY}
            onChange={(e) => setFormData({ ...formData, throwY: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 pb-4">
        <span className="text-on-surface-variant font-data-label text-xs">
          {t('tactics.difficultyJumpType')}
        </span>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
        >
          <option value="EASY">{t('tactics.difficulty.easy')}</option>
          <option value="MEDIUM">{t('tactics.difficulty.medium')}</option>
          <option value="HARD">{t('tactics.difficulty.hard')}</option>
        </select>
      </label>

      <span className="text-on-surface-variant font-data-label mb-2 block text-xs">
        {t('tactics.attachVideo')}
      </span>
      <div className="mb-4 flex gap-2">
        <select
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container w-1/3 rounded border border-white/10 p-2 text-sm outline-none"
        >
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
        <input
          type="text"
          placeholder={t('common.url')}
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary flex-1 rounded border border-white/10 p-2 text-sm outline-none"
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-on-surface-variant font-data-label text-xs">
          {t('common.creator')}
        </span>
        <input
          type="text"
          placeholder={t('tactics.placeholders.creator')}
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>
    </div>
  );
}
