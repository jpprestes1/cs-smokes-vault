import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { BoardEntity, BoardPath, BoardPoint, DrawingTool, EntityType } from '../types';

interface TacticalBoardCanvasProps {
  radarImage?: string;
  paths: BoardPath[];
  entities: BoardEntity[];
  activeTool: DrawingTool;
  activeColor: string;
  isDashed: boolean;
  activeEntityTool: EntityType | null;
  onAddPath: (path: BoardPath) => void;
  onRemovePath: (pathId: string) => void;
  onAddEntity: (entity: BoardEntity) => void;
  onUpdateEntity: (entityId: string, updates: Partial<BoardEntity>) => void;
  onRemoveEntity: (entityId: string) => void;
  onCursorMove: (coords: { x: number; y: number }) => void;
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export default function TacticalBoardCanvas({
  radarImage,
  paths,
  entities,
  activeTool,
  activeColor,
  isDashed,
  activeEntityTool,
  onAddPath,
  onRemovePath,
  onAddEntity,
  onUpdateEntity,
  onRemoveEntity,
  onCursorMove,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: TacticalBoardCanvasProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de Desenho
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<BoardPoint[]>([]);

  // Estados de Pan (Movimentação do Mapa)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Estados de Arraste de Entidades
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
  const [hoveredPathId, setHoveredPathId] = useState<string | null>(null);

  // Estado de Edição de Rótulo de Entidade (Player CT / Player T)
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');

  // Ajusta pan se zoom voltar a 1x
  const [prevZoom, setPrevZoom] = useState(zoom);
  if (zoom !== prevZoom) {
    setPrevZoom(zoom);
    if (zoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  }

  // Listener para tecla Espaço (Spacebar Pan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Converte posição do mouse para percentual (0 a 100)
  const getCanvasCoords = useCallback(
    (e: React.PointerEvent | React.MouseEvent | React.DragEvent): BoardPoint => {
      if (!containerRef.current) return { x: 50, y: 50 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'clientX' in e ? e.clientX : 0;
      const clientY = 'clientY' in e ? e.clientY : 0;

      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    },
    []
  );

  // Cores únicas para markers de ponta de flecha SVG
  const uniqueColors = useMemo(() => {
    const set = new Set<string>();
    set.add(activeColor);
    paths.forEach((p) => set.add(p.color));
    return Array.from(set);
  }, [activeColor, paths]);

  // Início de Pan
  const startPanning = (clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStartPos({ x: clientX - pan.x, y: clientY - pan.y });
  };

  // Pointer Down na área externa (permite arrastar mesmo fora do mapa)
  const handleOuterPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      e.button === 1 ||
      isSpacePressed ||
      activeTool === 'pan' ||
      (zoom > 1 && e.target === e.currentTarget)
    ) {
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
    }
  };

  // Pointer Down (Início do Desenho, Pan ou Colocação de Entidade)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Botão do meio (Scroll wheel click), Espaço ou Ferramenta Pan ativam movimentação
    if (e.button === 1 || isSpacePressed || activeTool === 'pan') {
      e.preventDefault();
      e.stopPropagation();
      startPanning(e.clientX, e.clientY);
      return;
    }

    if (e.button !== 0) return;

    const pt = getCanvasCoords(e);

    if (activeEntityTool) {
      const newEntity: BoardEntity = {
        id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: activeEntityTool,
        x: pt.x,
        y: pt.y,
        label:
          activeEntityTool === 'PLAYER_T'
            ? 'T'
            : activeEntityTool === 'PLAYER_CT'
              ? 'CT'
              : undefined,
        side:
          activeEntityTool === 'PLAYER_T'
            ? 'TERRORIST'
            : activeEntityTool === 'PLAYER_CT'
              ? 'COUNTER-TERRORIST'
              : undefined,
      };
      onAddEntity(newEntity);
      return;
    }

    if (activeTool === 'eraser') return;

    setIsDrawing(true);
    setCurrentPoints([pt]);
  };

  // Pointer Move (Atualiza pan, traço em tempo real ou coordenadas)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartPos.x,
        y: e.clientY - panStartPos.y,
      });
      return;
    }

    const pt = getCanvasCoords(e);
    onCursorMove(pt);

    if (draggingEntityId) {
      onUpdateEntity(draggingEntityId, { x: pt.x, y: pt.y });
      return;
    }

    if (!isDrawing) return;

    if (activeTool === 'pen') {
      setCurrentPoints((prev) => [...prev, pt]);
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      setCurrentPoints((prev) => (prev.length > 0 ? [prev[0], pt] : [pt]));
    }
  };

  // Pointer Up (Finaliza o Traço ou Pan)
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (draggingEntityId) {
      setDraggingEntityId(null);
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length >= 2) {
      const newPath: BoardPath = {
        id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tool: activeTool === 'pen' ? 'pen' : activeTool === 'arrow' ? 'arrow' : 'line',
        points: currentPoints,
        color: activeColor,
        strokeWidth: 3,
        isDashed,
      };
      onAddPath(newPath);
    }

    setCurrentPoints([]);
  };

  // Suporte a Pan com Mouse Wheel / Trackpad quando zoomed
  const handleWheel = (e: React.WheelEvent) => {
    if (zoom > 1 && !e.ctrlKey) {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.7,
        y: prev.y - e.deltaY * 0.7,
      }));
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const entityType = e.dataTransfer.getData('application/cs-tactical-entity') as EntityType;
    if (!entityType) return;

    const pt = getCanvasCoords(e);
    const newEntity: BoardEntity = {
      id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: entityType,
      x: pt.x,
      y: pt.y,
      label: entityType === 'PLAYER_T' ? 'T' : entityType === 'PLAYER_CT' ? 'CT' : undefined,
      side:
        entityType === 'PLAYER_T'
          ? 'TERRORIST'
          : entityType === 'PLAYER_CT'
            ? 'COUNTER-TERRORIST'
            : undefined,
    };
    onAddEntity(newEntity);
  };

  // Submissão do novo rótulo
  const handleSaveLabel = (entityId: string, defaultLabel: string) => {
    const finalLabel = tempLabel.trim().toUpperCase() || defaultLabel;
    onUpdateEntity(entityId, { label: finalLabel });
    setEditingEntityId(null);
  };

  const renderPathD = (points: BoardPoint[]) => {
    if (points.length < 2) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  // Determina o cursor dinâmico
  const getCursorClass = () => {
    if (isPanning) return 'cursor-grabbing';
    if (isSpacePressed || activeTool === 'pan') return 'cursor-grab';
    if (activeTool === 'eraser') return 'cursor-pointer';
    if (activeEntityTool) return 'cursor-cell';
    return 'cursor-crosshair';
  };

  return (
    <div
      className={`bg-grid relative flex h-full w-full flex-1 items-center justify-center overflow-hidden p-4 select-none md:p-8 ${
        isPanning ? 'cursor-grabbing' : isSpacePressed || activeTool === 'pan' ? 'cursor-grab' : ''
      }`}
      onPointerDown={handleOuterPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Container Principal do Mapa */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition:
            isDrawing || draggingEntityId || isPanning ? 'none' : 'transform 0.15s ease-out',
        }}
        className={`bg-surface-container-lowest border-outline-variant/30 glass-panel relative aspect-square w-full max-w-[min(90vw,78vh)] overflow-hidden rounded-lg border-2 shadow-2xl lg:max-w-[650px] ${getCursorClass()}`}
      >
        {/* Imagem de Radar do Mapa */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 grayscale transition-all duration-500 hover:grayscale-0"
          style={{ backgroundImage: `url('${radarImage}')` }}
        />

        {/* Camada SVG para Trajetórias e Linhas */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {uniqueColors.map((color) => {
              const safeColorId = color.replace(/[^a-zA-Z0-9]/g, '');
              return (
                <marker
                  key={color}
                  id={`arrow-${safeColorId}`}
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={color} />
                </marker>
              );
            })}
          </defs>

          {/* Traços Salvos */}
          {paths.map((p) => {
            const safeColorId = p.color.replace(/[^a-zA-Z0-9]/g, '');
            const isHovered = hoveredPathId === p.id && activeTool === 'eraser';
            return (
              <g key={p.id} className="pointer-events-auto">
                <path
                  d={renderPathD(p.points)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="6"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPathId(p.id)}
                  onMouseLeave={() => setHoveredPathId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') onRemovePath(p.id);
                  }}
                />
                <path
                  d={renderPathD(p.points)}
                  fill="none"
                  stroke={isHovered ? '#ef4444' : p.color}
                  strokeWidth={p.strokeWidth || 3}
                  strokeDasharray={p.isDashed ? '3 1.5' : undefined}
                  className={p.isDashed ? 'animate-dash-flow' : undefined}
                  markerEnd={p.tool === 'arrow' ? `url(#arrow-${safeColorId})` : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}

          {/* Traço Sendo Desenhado no Momento */}
          {isDrawing && currentPoints.length >= 2 && (
            <path
              d={renderPathD(currentPoints)}
              fill="none"
              stroke={activeColor}
              strokeWidth={3}
              strokeDasharray={isDashed ? '3 1.5' : undefined}
              markerEnd={
                activeTool === 'arrow'
                  ? `url(#arrow-${activeColor.replace(/[^a-zA-Z0-9]/g, '')})`
                  : undefined
              }
              vectorEffect="non-scaling-stroke"
              opacity="0.9"
            />
          )}
        </svg>

        {/* Camada de Entidades (Jogadores & Granadas) */}
        {entities.map((entity) => {
          const isHovered = hoveredEntityId === entity.id;
          const isEditing = editingEntityId === entity.id;
          const isPlayer = entity.type === 'PLAYER_T' || entity.type === 'PLAYER_CT';
          const defaultLabel = entity.type === 'PLAYER_T' ? 'T' : 'CT';

          const handleEntityPointerDown = (e: React.PointerEvent) => {
            if (e.button === 1 || isSpacePressed || activeTool === 'pan' || activeEntityTool) {
              return;
            }
            e.stopPropagation();
            if (activeTool === 'eraser') {
              onRemoveEntity(entity.id);
              return;
            }
            if (!isEditing) {
              setDraggingEntityId(entity.id);
            }
          };

          const handleDoubleClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isPlayer && !activeEntityTool) {
              setEditingEntityId(entity.id);
              setTempLabel(entity.label || defaultLabel);
            }
          };

          return (
            <div
              key={entity.id}
              onPointerDown={handleEntityPointerDown}
              onDoubleClick={handleDoubleClick}
              onMouseEnter={() => !activeEntityTool && setHoveredEntityId(entity.id)}
              onMouseLeave={() => setHoveredEntityId(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!activeEntityTool) {
                  onRemoveEntity(entity.id);
                }
              }}
              title={
                activeEntityTool
                  ? undefined
                  : isPlayer
                    ? 'Duplo clique para editar rótulo (ex: AWP, IGL, 1, 2)'
                    : undefined
              }
              style={{
                top: `${entity.y}%`,
                left: `${entity.x}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute transition-transform ${
                activeEntityTool
                  ? 'pointer-events-none'
                  : isHovered && activeTool === 'eraser'
                    ? 'ring-error rounded-full opacity-50 ring-2'
                    : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              {/* Input Flutuante para Edição de Rótulo */}
              {isEditing && (
                <div
                  className="bg-surface-container-highest/95 border-primary tactical-glass animate-in fade-in zoom-in-95 absolute -top-9 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded border px-1.5 py-0.5 shadow-2xl backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    autoFocus
                    value={tempLabel}
                    maxLength={8}
                    onChange={(e) => setTempLabel(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveLabel(entity.id, defaultLabel);
                      } else if (e.key === 'Escape') {
                        setEditingEntityId(null);
                      }
                    }}
                    onBlur={() => handleSaveLabel(entity.id, defaultLabel)}
                    placeholder={defaultLabel}
                    className="font-data-label text-primary w-14 bg-transparent text-center text-[10px] font-bold tracking-wider uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveLabel(entity.id, defaultLabel)}
                    className="text-primary hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[13px]">check</span>
                  </button>
                </div>
              )}

              {/* Player T */}
              {entity.type === 'PLAYER_T' && (
                <div className="bg-primary-container border-surface flex h-5 min-w-5 items-center justify-center rounded-full border-2 p-1 text-[9px] font-black text-black shadow-[0_0_8px_rgba(246,174,45,0.8)] transition-transform hover:scale-110">
                  {entity.label === 'T' ? '' : entity.label}
                </div>
              )}

              {/* Player CT */}
              {entity.type === 'PLAYER_CT' && (
                <div className="bg-secondary-container border-surface flex h-5 min-w-5 items-center justify-center rounded-full border-2 p-1 text-[9px] font-black text-white shadow-[0_0_8px_rgba(1,100,180,0.8)] transition-transform hover:scale-110">
                  {entity.label === 'CT' ? '' : entity.label}
                </div>
              )}

              {/* Smoke Cloud */}
              {entity.type === 'SMOKE' && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-transform hover:scale-105">
                  <span className="material-symbols-outlined text-lg text-white/80">cloud</span>
                </div>
              )}

              {/* Molotov Burn Zone */}
              {entity.type === 'MOLOTOV' && (
                <div className="border-error/40 bg-error/25 flex h-13 w-9 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-xs transition-transform hover:scale-105">
                  <span className="material-symbols-outlined text-base text-red-300">
                    local_fire_department
                  </span>
                </div>
              )}

              {/* Flash Burst */}
              {entity.type === 'FLASH' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-yellow-300/60 bg-yellow-400/20 shadow-[0_0_12px_rgba(253,224,71,0.5)] backdrop-blur-xs transition-transform hover:scale-110">
                  <span className="material-symbols-outlined !text-base text-yellow-200">
                    flare
                  </span>
                </div>
              )}

              {/* HE Grenade */}
              {entity.type === 'HE_GRENADE' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-400/60 bg-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.5)] backdrop-blur-xs transition-transform hover:scale-110">
                  <span className="material-symbols-outlined !text-[16px] text-orange-200">
                    bomb
                  </span>
                </div>
              )}

              {/* Bomb / C4 */}
              {entity.type === 'BOMB' && (
                <div className="bg-surface-container border-primary-container flex h-6 w-6 items-center justify-center rounded-md border-2 text-amber-400 shadow-[0_0_12px_rgba(246,174,45,0.7)] transition-transform hover:scale-110">
                  <span className="material-symbols-outlined !text-[16px]">
                    security_update_warning
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controles de Zoom Flutuantes no Canto Inferior */}
      {(onZoomIn || onZoomOut || onResetZoom) && (
        <div
          className="bg-surface-container-high/85 border-outline-variant glass-panel absolute right-4 bottom-4 z-30 flex items-center rounded-sm border shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {onZoomOut && (
            <button
              type="button"
              onClick={onZoomOut}
              disabled={zoom <= 0.8}
              className="text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
              title={t('tacticalBoard.zoomOut', 'Diminuir Zoom')}
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
          )}
          {onResetZoom && (
            <button
              type="button"
              onClick={onResetZoom}
              className="font-data-label text-on-surface-variant hover:text-primary px-1.5 text-[10px] font-bold transition-colors"
              title={t('tacticalBoard.resetZoom', 'Resetar Zoom')}
            >
              {Math.round(zoom * 100)}%
            </button>
          )}
          {onZoomIn && (
            <button
              type="button"
              onClick={onZoomIn}
              disabled={zoom >= 2}
              className="text-on-surface hover:text-primary flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
              title={t('tacticalBoard.zoomIn', 'Aumentar Zoom')}
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
