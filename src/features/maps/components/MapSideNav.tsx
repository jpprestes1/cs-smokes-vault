import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MapSideNavProps {
  mapName?: string;
  activeSide: string;
  setActiveSide: (side: string) => void;
  onBack: () => void;
  onAddTactic: () => void;
  canCreate: boolean;
}

export default function MapSideNav({
  mapName,
  activeSide,
  setActiveSide,
  onBack,
  onAddTactic,
  canCreate,
}: MapSideNavProps) {
  const { t } = useTranslation();
  const sides = ['All Sides', 'Terrorist', 'Counter-Terrorist'];
  const { mapId, view = 'grenades' } = useParams(); // Pega a view atual da URL

  const sideLabel = (side: string) => {
    if (side === 'Terrorist') return t('maps.sideT');
    if (side === 'Counter-Terrorist') return t('maps.sideCt');
    return t('maps.sideAll');
  };

  return (
    <aside className="bg-surface-container-low/90 text-primary font-data-label text-data-label relative z-30 hidden w-90 flex-col border-r border-white/5 py-6 backdrop-blur-xl md:flex">
      <div className="mb-6 flex flex-col gap-1 px-6">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-primary mb-4 flex w-fit items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> {t('maps.back')}
        </button>

        {/* TABS: Grenades vs Combos */}
        <div className="bg-surface-container-highest mb-2 flex w-full rounded p-1">
          <Link
            to={`/maps/${mapId}/grenades`}
            className={`flex-1 rounded py-2 text-center transition-colors ${
              view === 'grenades' || !view
                ? 'bg-surface-variant text-primary font-bold shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('maps.grenades')}
          </Link>
          <Link
            to={`/maps/${mapId}/combos`}
            className={`flex-1 rounded py-2 text-center transition-colors ${
              view === 'combos'
                ? 'bg-surface-variant text-primary font-bold shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('maps.combos')}
          </Link>
        </div>

        <Link
          to={`/strat-board/${mapId}`}
          className="border-primary/20 bg-primary/5 hover:bg-primary/15 text-primary mb-6 flex w-full items-center justify-center gap-1.5 rounded border py-1.5 text-xs font-bold transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">draw</span>
          {t('tacticalBoard.openInBoard', 'Abrir no Strat Board')}
        </Link>

        <div className="bg-surface-variant mb-2 flex h-10 w-10 items-center justify-center rounded">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {view === 'combos' ? 'strategy' : 'target'}
          </span>
        </div>
        <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold uppercase">
          {t('maps.stratFilter')}
        </h2>
        <span className="text-on-surface-variant text-opacity-70 capitalize">
          {mapName} {view === 'combos' ? t('maps.executes') : t('maps.utility')}
        </span>
      </div>

      <div className="flex w-full flex-col gap-1">
        {sides.map((side) => (
          <button
            key={side}
            onClick={() => setActiveSide(side)}
            className={`flex w-full items-center gap-3 border-r-4 px-6 py-3 text-left transition-all ${
              activeSide === side
                ? 'bg-primary/10 border-primary text-primary'
                : 'text-on-surface-variant hover:bg-surface-variant/50 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {side === 'Terrorist'
                ? 'security_update_warning'
                : side === 'Counter-Terrorist'
                  ? 'shield'
                  : 'groups'}
            </span>
            {sideLabel(side)}
          </button>
        ))}
      </div>

      {canCreate && (
        <div className="mt-auto border-t border-white/5 px-6 pt-6">
          <button
            onClick={onAddTactic}
            className="bg-primary-container text-on-primary-container font-headline-md hover:bg-primary flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm tracking-wide uppercase transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t('maps.addTactic')}
          </button>
        </div>
      )}
    </aside>
  );
}
