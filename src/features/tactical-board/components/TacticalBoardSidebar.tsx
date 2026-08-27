import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DrawingTool, EntityType } from '../types';
import { mapsDatabase } from '../../maps/data/maps';

interface TacticalBoardSidebarProps {
  selectedMapId: string;
  onSelectMap: (mapId: string) => void;
  activeTool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  activeColor: string;
  onSelectColor: (color: string) => void;
  isDashed: boolean;
  onToggleDashed: () => void;
  activeEntityTool: EntityType | null;
  onSelectEntityTool: (type: EntityType | null) => void;
  onDragStartEntity: (e: React.DragEvent, type: EntityType) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

const COLORS = ['#f6ae2d', '#ef4444', '#0164b4', '#ffffff', '#22c55e', '#131313'];

export default function TacticalBoardSidebar({
  selectedMapId,
  onSelectMap,
  activeTool,
  onSelectTool,
  activeColor,
  onSelectColor,
  isDashed,
  onToggleDashed,
  activeEntityTool,
  onSelectEntityTool,
  onDragStartEntity,
  onUndo,
  onClear,
  canUndo,
  disabled = false,
}: TacticalBoardSidebarProps) {
  const { t } = useTranslation();

  const handleToolClick = (tool: DrawingTool) => {
    if (disabled) return;
    onSelectEntityTool(null);
    onSelectTool(tool);
  };

  const handleEntityClick = (type: EntityType) => {
    if (disabled) return;
    if (activeEntityTool === type) {
      onSelectEntityTool(null);
    } else {
      onSelectEntityTool(type);
    }
  };

  return (
    <aside
      className={`bg-surface-container-low/90 glass-panel relative z-40 hidden h-full w-72 flex-col overflow-y-auto border-r border-white/5 backdrop-blur-xl md:flex ${
        disabled ? 'select-none' : ''
      }`}
    >
      {/* Cabeçalho */}
      <div className="border-b border-white/5 p-6">
        <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-1 font-bold">
          {t('tacticalBoard.stratBoard', 'STRAT BOARD')}
        </h2>
        <p className="font-data-label text-data-label text-on-surface-variant">
          {t('tacticalBoard.liveEditor', 'Live Execution Editor')}
        </p>

        {disabled && (
          <div className="mt-3 flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>{t('tacticalBoard.authLockedStatus', 'ACESSO BLOQUEADO')}</span>
          </div>
        )}
      </div>

      {/* Seletor de Mapa */}
      <div className="relative border-b border-white/5 p-4">
        <label className="font-data-label text-data-label text-outline-variant mb-2 block uppercase">
          {t('tacticalBoard.selectMap', 'SELECT MAP')}
        </label>
        <div className="relative">
          <select
            disabled={disabled}
            value={selectedMapId}
            onChange={(e) => onSelectMap(e.target.value)}
            className={`bg-surface-container-high border-outline-variant text-on-surface font-body-base w-full appearance-none rounded-sm border py-2 pr-8 pl-3 transition-colors ${
              disabled
                ? 'cursor-not-allowed opacity-40'
                : 'hover:border-outline focus:border-primary focus:ring-primary cursor-pointer focus:ring-1 focus:outline-none'
            }`}
          >
            {mapsDatabase.map((m) => (
              <option key={m.id} value={m.id} className="bg-surface-container-high text-on-surface">
                {m.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <span className="material-symbols-outlined text-outline-variant text-sm">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Ferramentas de Desenho */}
      <div className="border-b border-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="font-data-label text-data-label text-outline-variant block uppercase">
            {t('tacticalBoard.drawingTools', 'DRAWING TOOLS')}
          </label>
          <button
            disabled={disabled}
            onClick={onToggleDashed}
            className={`font-data-label rounded border px-1.5 py-0.5 text-[10px] transition-all ${
              disabled
                ? 'cursor-not-allowed opacity-30'
                : isDashed
                  ? 'border-primary/40 bg-primary/20 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface border-white/10'
            }`}
            title="Toggle Dashed/Solid Stroke"
          >
            {isDashed ? 'DASHED' : 'SOLID'}
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {/* Pointer / Select */}
          <button
            disabled={disabled}
            onClick={() => handleToolClick('select')}
            className={`flex h-10 w-full items-center justify-center rounded-sm border transition-colors ${
              disabled
                ? 'bg-surface-container-high border-outline-variant text-on-surface-variant/40 cursor-not-allowed opacity-40'
                : activeTool === 'select' && !activeEntityTool
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_rgba(246,174,45,0.2)]'
                  : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={t('tacticalBoard.tools.select', 'Ponteiro')}
          >
            <span className="material-symbols-outlined text-base">near_me</span>
          </button>

          {/* Pan / Move */}
          <button
            disabled={disabled}
            onClick={() => handleToolClick('pan')}
            className={`flex h-10 w-full items-center justify-center rounded-sm border transition-colors ${
              disabled
                ? 'bg-surface-container-high border-outline-variant text-on-surface-variant/40 cursor-not-allowed opacity-40'
                : activeTool === 'pan' && !activeEntityTool
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_rgba(246,174,45,0.2)]'
                  : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={`${t('tacticalBoard.tools.pan', 'Mover')} (Space + Drag)`}
          >
            <span className="material-symbols-outlined text-base">pan_tool</span>
          </button>

          {/* Pen */}
          <button
            disabled={disabled}
            onClick={() => handleToolClick('pen')}
            className={`flex h-10 w-full items-center justify-center rounded-sm border transition-colors ${
              disabled
                ? 'bg-surface-container-high border-outline-variant text-on-surface-variant/40 cursor-not-allowed opacity-40'
                : activeTool === 'pen' && !activeEntityTool
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_rgba(246,174,45,0.2)]'
                  : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={t('tacticalBoard.tools.pen', 'Caneta')}
          >
            <span className="material-symbols-outlined text-base">draw</span>
          </button>

          {/* Line */}
          <button
            disabled={disabled}
            onClick={() => handleToolClick('line')}
            className={`flex h-10 w-full items-center justify-center rounded-sm border transition-colors ${
              disabled
                ? 'bg-surface-container-high border-outline-variant text-on-surface-variant/40 cursor-not-allowed opacity-40'
                : activeTool === 'line' && !activeEntityTool
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_rgba(246,174,45,0.2)]'
                  : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={t('tacticalBoard.tools.line', 'Linha')}
          >
            <span className="material-symbols-outlined text-base">horizontal_rule</span>
          </button>

          {/* Arrow */}
          <button
            disabled={disabled}
            onClick={() => handleToolClick('arrow')}
            className={`flex h-10 w-full items-center justify-center rounded-sm border transition-colors ${
              disabled
                ? 'bg-surface-container-high border-outline-variant text-on-surface-variant/40 cursor-not-allowed opacity-40'
                : activeTool === 'arrow' && !activeEntityTool
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_rgba(246,174,45,0.2)]'
                  : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={t('tacticalBoard.tools.arrow', 'Seta')}
          >
            <span className="material-symbols-outlined text-base">arrow_right_alt</span>
          </button>

          {/* Eraser */}
          <button
            disabled={disabled}
            onClick={() => handleToolClick('eraser')}
            className={`flex h-10 w-full items-center justify-center rounded-sm border transition-colors ${
              disabled
                ? 'bg-surface-container-high border-outline-variant text-on-surface-variant/40 cursor-not-allowed opacity-40'
                : activeTool === 'eraser' && !activeEntityTool
                  ? 'border-error/50 bg-error/20 text-error shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={t('tacticalBoard.tools.eraser', 'Borracha')}
          >
            <span className="material-symbols-outlined text-base">ink_eraser</span>
          </button>
        </div>

        {/* Amostras de Cor */}
        <div className="mt-4 flex items-center justify-between">
          {COLORS.map((c) => (
            <button
              key={c}
              disabled={disabled}
              onClick={() => onSelectColor(c)}
              style={{ backgroundColor: c }}
              className={`h-6 w-6 rounded-full border transition-transform ${
                disabled
                  ? 'cursor-not-allowed opacity-30'
                  : activeColor === c
                    ? 'ring-primary/60 scale-110 border-white ring-2'
                    : 'border-outline-variant hover:scale-105'
              }`}
              title={`Color: ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Entidades (Jogadores & Utilitários) */}
      <div className="flex-1 space-y-4 border-b border-white/5 p-4">
        <label className="font-data-label text-data-label text-outline-variant block uppercase">
          {t('tacticalBoard.entities', 'ENTITIES (DRAG & DROP)')}
        </label>

        {/* Jogadores */}
        <div>
          <span className="font-data-label text-on-surface-variant mb-2 block text-[10px] tracking-wider uppercase">
            {t('tacticalBoard.players', 'PLAYERS')}
          </span>
          <div className="flex items-center space-x-3">
            {/* Player T */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'PLAYER_T')}
              onClick={() => handleEntityClick('PLAYER_T')}
              className={`bg-primary-container flex h-9 w-9 items-center justify-center rounded-full font-bold text-black shadow-[0_0_10px_rgba(246,174,45,0.4)] transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'PLAYER_T'
                    ? 'scale-110 cursor-grab ring-2 ring-white active:cursor-grabbing'
                    : 'cursor-grab hover:scale-110 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.PLAYER_T', 'Jogador TR')}
            >
              T
            </div>

            {/* Player CT */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'PLAYER_CT')}
              onClick={() => handleEntityClick('PLAYER_CT')}
              className={`bg-secondary-container flex h-9 w-9 items-center justify-center rounded-full font-bold text-white shadow-[0_0_10px_rgba(1,100,180,0.4)] transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'PLAYER_CT'
                    ? 'scale-110 cursor-grab ring-2 ring-white active:cursor-grabbing'
                    : 'cursor-grab hover:scale-110 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.PLAYER_CT', 'Jogador CT')}
            >
              CT
            </div>
          </div>
        </div>

        {/* Utilitários */}
        <div>
          <span className="font-data-label text-on-surface-variant mb-2 block text-[10px] tracking-wider uppercase">
            {t('tacticalBoard.utility', 'UTILITY')}
          </span>
          <div className="grid grid-cols-5 gap-2">
            {/* Smoke */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'SMOKE')}
              onClick={() => handleEntityClick('SMOKE')}
              className={`bg-surface-container-high border-outline-variant flex h-10 w-10 items-center justify-center rounded-sm border p-1 transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'SMOKE'
                    ? 'border-primary bg-primary/20 ring-primary cursor-grab ring-1 active:cursor-grabbing'
                    : 'hover:border-primary/50 cursor-grab hover:scale-105 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.SMOKE', 'Smoke')}
            >
              <span className="material-symbols-outlined text-xl text-gray-300">cloud</span>
            </div>

            {/* Flash */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'FLASH')}
              onClick={() => handleEntityClick('FLASH')}
              className={`bg-surface-container-high border-outline-variant flex h-10 w-10 items-center justify-center rounded-sm border p-1 transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'FLASH'
                    ? 'border-primary bg-primary/20 ring-primary cursor-grab ring-1 active:cursor-grabbing'
                    : 'hover:border-primary/50 cursor-grab hover:scale-105 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.FLASH', 'Flash')}
            >
              <span className="material-symbols-outlined text-xl text-yellow-300">flare</span>
            </div>

            {/* Molotov */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'MOLOTOV')}
              onClick={() => handleEntityClick('MOLOTOV')}
              className={`bg-surface-container-high border-outline-variant flex h-10 w-10 items-center justify-center rounded-sm border p-1 transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'MOLOTOV'
                    ? 'border-primary bg-primary/20 ring-primary cursor-grab ring-1 active:cursor-grabbing'
                    : 'hover:border-primary/50 cursor-grab hover:scale-105 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.MOLOTOV', 'Molotov')}
            >
              <span className="material-symbols-outlined text-xl text-red-400">
                local_fire_department
              </span>
            </div>

            {/* HE Grenade */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'HE_GRENADE')}
              onClick={() => handleEntityClick('HE_GRENADE')}
              className={`bg-surface-container-high border-outline-variant flex h-10 w-10 items-center justify-center rounded-sm border p-1 transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'HE_GRENADE'
                    ? 'border-primary bg-primary/20 ring-primary cursor-grab ring-1 active:cursor-grabbing'
                    : 'hover:border-primary/50 cursor-grab hover:scale-105 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.HE_GRENADE', 'Granada HE')}
            >
              <span className="material-symbols-outlined text-xl text-orange-400">bomb</span>
            </div>

            {/* Bomb / C4 */}
            <div
              draggable={!disabled}
              onDragStart={(e) => !disabled && onDragStartEntity(e, 'BOMB')}
              onClick={() => handleEntityClick('BOMB')}
              className={`bg-surface-container border-outline-variant flex h-10 w-10 items-center justify-center rounded-sm border p-1 transition-all ${
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : activeEntityTool === 'BOMB'
                    ? 'border-primary bg-primary/20 ring-primary cursor-grab ring-1 active:cursor-grabbing'
                    : 'hover:border-primary/50 cursor-grab hover:scale-105 active:cursor-grabbing'
              }`}
              title={t('tacticalBoard.entitiesList.BOMB', 'C4')}
            >
              <span className="material-symbols-outlined text-xl text-amber-500">
                security_update_warning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações (Undo / Clear) */}
      <div className="mt-auto space-y-2 p-4">
        <button
          onClick={onUndo}
          disabled={disabled || !canUndo}
          className="bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface hover:bg-surface-variant/50 font-data-label flex w-full items-center justify-center gap-2 rounded-sm border py-2 text-xs transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">undo</span>
          {t('tacticalBoard.undo', 'Undo Last')}
        </button>

        <button
          onClick={onClear}
          disabled={disabled}
          className="bg-error-container/20 text-error hover:bg-error-container/40 border-error/30 font-data-label flex w-full items-center justify-center gap-2 rounded-sm border py-2 text-xs transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          {t('tacticalBoard.clear', 'Clear Board')}
        </button>
      </div>
    </aside>
  );
}
