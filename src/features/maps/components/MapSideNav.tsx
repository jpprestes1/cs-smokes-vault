interface MapSideNavProps {
  mapName?: string;
  activeSide: string;
  setActiveSide: (side: string) => void;
  onBack: () => void;
  onAddTactic: () => void; // Nossa nova propriedade
}

export default function MapSideNav({
  mapName,
  activeSide,
  setActiveSide,
  onBack,
  onAddTactic, // Extraindo a propriedade aqui
}: MapSideNavProps) {
  const sides = ['All Sides', 'Terrorist', 'Counter-Terrorist'];

  return (
    <aside className="bg-surface-container-low/90 text-primary font-data-label text-data-label relative z-30 hidden w-64 flex-col border-r border-white/5 py-6 backdrop-blur-xl md:flex">
      <div className="mb-8 flex flex-col gap-1 px-6">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-primary mb-4 flex w-fit items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
        <div className="bg-surface-variant mb-2 flex h-10 w-10 items-center justify-center rounded">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            target
          </span>
        </div>
        <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold uppercase">
          STRAT FILTER
        </h2>
        <span className="text-on-surface-variant text-opacity-70 capitalize">
          {mapName} Execution
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
            {side}
          </button>
        ))}
      </div>

      {/* NOVO BOTÃO DE ADD TACTIC AQUI */}
      {/* A classe 'mt-auto' empurra este bloco lá pro final (rodapé) do menu lateral */}
      <div className="mt-auto border-t border-white/5 px-6 pt-6">
        <button
          onClick={onAddTactic}
          className="bg-primary-container text-on-primary-container font-headline-md hover:bg-primary flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm tracking-wide uppercase transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Add Tactic
        </button>
      </div>
    </aside>
  );
}
