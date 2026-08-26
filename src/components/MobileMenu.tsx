import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MobileMenuProps {
  activeSide: string;
  setActiveSide: (side: string) => void;
  onAddTactic: () => void;
  canCreate: boolean;
}

export default function MobileMenu({
  activeSide,
  setActiveSide,
  onAddTactic,
  canCreate,
}: MobileMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const sides = ['Terrorist', 'Counter-Terrorist', 'All Sides'];

  const sideLabel = (side: string) => {
    if (side === 'Terrorist') return t('maps.sideT');
    if (side === 'Counter-Terrorist') return t('maps.sideCt');
    return t('maps.sideAll');
  };

  return (
    // Mudamos de items-center para items-start para manter tudo na esquerda
    <div className="absolute bottom-6 left-6 z-50 flex flex-col items-start gap-3 md:hidden">
      {/* Opções (O menu) */}
      {isOpen && (
        <div className="bg-surface-container/95 animate-in slide-in-from-bottom-2 fade-in flex flex-col gap-1 rounded-lg border border-white/10 p-2 shadow-2xl backdrop-blur-md">
          {sides.map((side) => (
            <button
              key={side}
              onClick={() => {
                setActiveSide(side);
                setIsOpen(false);
              }}
              className={`rounded px-4 py-2 text-left text-sm ${activeSide === side ? 'bg-primary text-on-primary' : 'text-on-surface'}`}
            >
              {sideLabel(side)}
            </button>
          ))}
          <div className="my-1 border-t border-white/10"></div>
          {canCreate && (
            <button
              onClick={() => {
                onAddTactic();
                setIsOpen(false);
              }}
              className="text-primary flex items-center gap-2 px-4 py-2 text-left text-sm font-bold"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>{' '}
              {t('maps.addTactic').toUpperCase()}
            </button>
          )}
        </div>
      )}

      {/* Botão Circular (O gatilho) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-on-primary flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'layers'}</span>
      </button>
    </div>
  );
}
