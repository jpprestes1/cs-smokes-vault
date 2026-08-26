import { type MarkerData } from '../types';
import { useTranslation } from 'react-i18next';

interface MarkerListProps {
  markers: MarkerData[];
  onSelectMarker: (marker: MarkerData) => void;
  onClose: () => void;
}

export default function MarkerList({ markers, onSelectMarker, onClose }: MarkerListProps) {
  const { t } = useTranslation();

  const typeLabel = (type: string) => {
    if (type === 'SMOKE') return t('common.smoke');
    if (type === 'FLASH') return t('common.flash');
    if (type === 'MOLOTOV') return t('common.molotov');
    return type;
  };

  const sideLabel = (side: string) => {
    if (side === 'TERRORIST') return t('maps.sideT');
    if (side === 'COUNTER-TERRORIST') return t('maps.sideCt');
    return side;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">format_list_bulleted</span>{' '}
          {t('tactics.availableGuides')}
        </h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined p-1">close</span>
        </button>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto p-6">
        <p className="font-body-base text-on-surface-variant mb-4 text-sm">
          {t('tactics.multipleExecutionsHint')}
        </p>
        {markers.map((marker) => (
          <button
            key={marker.id}
            onClick={() => onSelectMarker(marker)}
            className="bg-surface-variant/20 hover:border-primary hover:bg-surface-variant/40 flex flex-col rounded-lg border border-white/10 p-4 text-left transition-all"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`font-data-label text-[10px] ${
                  marker.side === 'TERRORIST'
                    ? 'text-primary bg-primary/10'
                    : 'text-secondary bg-secondary/10'
                } rounded border border-current px-2 py-0.5`}
              >
                {sideLabel(marker.side)}
              </span>
              <span className="font-data-label text-on-surface-variant text-xs tracking-wider uppercase">
                {typeLabel(marker.type)}
              </span>
            </div>
            <span className="font-headline-md text-on-surface text-lg">{marker.title}</span>
            <span className="font-body-base text-on-surface-variant mt-1 line-clamp-2 text-xs">
              {marker.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
