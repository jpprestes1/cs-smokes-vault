import { useTranslation } from 'react-i18next';
import type { DrawingTool, EntityType } from '../types';

interface TacticalBoardStatusBarProps {
  cursorCoords: { x: number; y: number };
  activeTool: DrawingTool;
  activeEntityTool: EntityType | null;
  selectedMapName: string;
  stratTitle: string;
  entitiesCount: number;
  pathsCount: number;
}

export default function TacticalBoardStatusBar({
  cursorCoords,
  activeTool,
  activeEntityTool,
  selectedMapName,
  stratTitle,
  entitiesCount,
  pathsCount,
}: TacticalBoardStatusBarProps) {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface-container-low flex h-10 shrink-0 items-center justify-between border-t border-white/5 px-4">
      {/* Lado Esquerdo */}
      <div className="flex items-center gap-4 overflow-hidden">
        <span className="font-data-label text-on-surface-variant flex items-center gap-1.5 text-[10px] tracking-wider uppercase">
          <span className="bg-primary-container h-2 w-2 animate-pulse rounded-full" />
          {t('tacticalBoard.liveEditor', 'LIVE EDITOR')}
        </span>

        <span className="border-outline-variant/30 font-data-label text-outline-variant hidden border-l pl-4 text-[10px] sm:inline">
          CURSOR: X: {String(cursorCoords.x).padStart(2, '0')}%, Y:{' '}
          {String(cursorCoords.y).padStart(2, '0')}%
        </span>

        <span className="border-outline-variant/30 font-data-label text-primary/80 hidden border-l pl-4 text-[10px] uppercase md:inline">
          {activeEntityTool ? `PLACE: ${activeEntityTool}` : `TOOL: ${activeTool.toUpperCase()}`}
        </span>
      </div>

      {/* Lado Direito */}
      <div className="font-data-label text-outline-variant text-[10px] tracking-wider uppercase">
        <span className="hidden sm:inline">TICKRATE: 128 | </span>
        <span className="text-primary-container font-bold">
          {selectedMapName}_{stratTitle || 'EXEC'}.JSON
        </span>
        <span className="hidden md:inline">
          {' '}
          | {entitiesCount} ENT | {pathsCount} PATHS
        </span>
      </div>
    </footer>
  );
}
