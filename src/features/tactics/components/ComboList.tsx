import { type ComboData } from '../types';

interface ComboListProps {
  combos: ComboData[];
  onSelectCombo: (combo: ComboData) => void;
  onHoverCombo: (combo: ComboData | null) => void;
  onClose: () => void;
}

export default function ComboList({
  combos,
  onSelectCombo,
  onHoverCombo,
  onClose,
}: ComboListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">format_list_bulleted</span> SELECT COMBO
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
          Multiple executions available from this position. Hover to preview targets.
        </p>

        {combos.map((combo) => (
          <button
            key={combo.id}
            onClick={() => onSelectCombo(combo)}
            onMouseEnter={() => onHoverCombo(combo)}
            onMouseLeave={() => onHoverCombo(null)}
            className="bg-surface-variant/20 hover:border-primary hover:bg-surface-variant/40 flex flex-col rounded-lg border border-white/10 p-4 text-left transition-all"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`font-data-label text-[10px] ${combo.side === 'TERRORIST' ? 'text-primary bg-primary/10' : 'text-secondary bg-secondary/10'} rounded border border-current px-2 py-0.5`}
              >
                {combo.side}
              </span>
              <span className="font-data-label text-on-surface-variant text-xs">
                {combo.targets.length} GRENADES
              </span>
            </div>
            <span className="font-headline-md text-on-surface text-lg">{combo.title}</span>
            <span className="font-body-base text-on-surface-variant mt-1 line-clamp-2 text-xs">
              {combo.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
