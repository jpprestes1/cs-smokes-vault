import { type MarkerData } from '../types';
import { type TacticFormData } from '../types';
import { useTranslation } from 'react-i18next';

interface TacticFormSelectorProps {
  markers: MarkerData[];
  formData: TacticFormData;
  setFormData: React.Dispatch<React.SetStateAction<TacticFormData>>;
  isManualEntry: boolean;
  setIsManualEntry: (val: boolean) => void;
}

export default function TacticFormSelector({
  markers,
  formData,
  setFormData,
  isManualEntry,
  setIsManualEntry,
}: TacticFormSelectorProps) {
  const { t } = useTranslation();
  const handleAutoFill = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, markerId: e.target.value }));
  };

  return (
    <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
      {!isManualEntry ? (
        <div className="flex items-end gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <div className="flex items-end justify-between gap-2">
              <span className="text-primary font-data-label text-xs font-bold uppercase">
                <span className="material-symbols-outlined mr-1 align-middle text-[14px]">
                  magic_button
                </span>
                {t('tactics.selectExistingTactic')}
              </span>
              <button
                onClick={() => setIsManualEntry(true)}
                className="bg-surface-variant text-on-surface hover:text-primary mb-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded border border-white/10 transition-colors"
                title={t('tactics.createNewTactic')}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <select
              value={formData.markerId}
              onChange={handleAutoFill}
              className="bg-surface-container text-on-surface focus:border-primary mt-2 rounded border border-white/10 p-2 text-sm outline-none"
            >
              <option value="" disabled>
                {t('tactics.chooseTactic')}
              </option>
              {markers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.type} - {m.side})
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-primary font-data-label text-xs font-bold uppercase">
            <span className="material-symbols-outlined mr-1 align-middle text-[14px]">edit</span>
            {t('tactics.creatingNewTactic')}
          </span>
          <button
            onClick={() => {
              setIsManualEntry(false);
              setFormData((prev) => ({ ...prev, markerId: '' }));
            }}
            className="text-on-surface-variant hover:text-error transition-colors"
            title={t('common.cancel')}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
