import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type DrawingTool,
  type EntityType,
  type BoardPath,
  type BoardEntity,
  type StratPreset,
  type StratData,
  type StratFrame,
  TIMELINE_TIMESTAMPS,
} from '../types';
import { mapsDatabase, type MapData } from '../../maps/data/maps';
import { useCloudStrats } from './useCloudStrats';
import { deleteStrat } from '../services/stratsService';

interface UseTacticalBoardProps {
  initialMapId?: string;
  onMapChange?: (mapId: string) => void;
}

type FramesMap = Record<number, { entities: BoardEntity[]; paths: BoardPath[] }>;

function createDefaultFrames(): FramesMap {
  const map: FramesMap = {};
  for (const t of TIMELINE_TIMESTAMPS) {
    map[t] = { entities: [], paths: [] };
  }
  return map;
}

function framesMapToArray(map: FramesMap): StratFrame[] {
  return TIMELINE_TIMESTAMPS.map((t) => ({
    time: t,
    entities: map[t]?.entities || [],
    paths: map[t]?.paths || [],
  }));
}

function arrayToFramesMap(
  frames: StratFrame[] = [],
  fallbackEntities: BoardEntity[] = [],
  fallbackPaths: BoardPath[] = []
): FramesMap {
  const map = createDefaultFrames();

  if (frames && frames.length > 0) {
    for (const f of frames) {
      if (f.time !== undefined && map[f.time] !== undefined) {
        map[f.time] = {
          entities: f.entities.map((e) => ({ ...e })),
          paths: f.paths.map((p) => ({ ...p, points: [...p.points] })),
        };
      }
    }

    // Se algum frame posterior estiver vazio, propaga os jogadores do frame anterior
    for (let i = 1; i < TIMELINE_TIMESTAMPS.length; i++) {
      const prevTime = TIMELINE_TIMESTAMPS[i - 1];
      const currTime = TIMELINE_TIMESTAMPS[i];
      if (map[currTime].entities.length === 0 && map[prevTime].entities.length > 0) {
        const prevPlayers = map[prevTime].entities.filter(
          (e) => e.type === 'PLAYER_T' || e.type === 'PLAYER_CT' || e.type === 'BOMB'
        );
        map[currTime].entities = prevPlayers.map((p) => ({ ...p }));
      }
    }
  } else {
    // Formato legado (apenas entities e paths na raiz)
    map[0] = {
      entities: fallbackEntities.map((e) => ({ ...e })),
      paths: fallbackPaths.map((p) => ({ ...p, points: [...p.points] })),
    };

    const initialPlayers = fallbackEntities.filter(
      (e) => e.type === 'PLAYER_T' || e.type === 'PLAYER_CT' || e.type === 'BOMB'
    );

    // Propaga players para os frames seguintes
    for (let i = 1; i < TIMELINE_TIMESTAMPS.length; i++) {
      const t = TIMELINE_TIMESTAMPS[i];
      map[t] = {
        entities: initialPlayers.map((p) => ({ ...p })),
        paths: [],
      };
    }
  }

  return map;
}

export function useTacticalBoard({
  initialMapId = 'mirage',
  onMapChange,
}: UseTacticalBoardProps = {}) {
  const { t } = useTranslation();

  const [prevInitialMapId, setPrevInitialMapId] = useState(initialMapId);

  // Mapa selecionado
  const [selectedMapId, setSelectedMapId] = useState<string>(initialMapId);

  // ID da estratégia salva na nuvem atualmente carregada (se houver)
  const [loadedStratId, setLoadedStratId] = useState<string | null>(null);

  // Modal de Salvamento
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Título da estratégia
  const [stratTitle, setStratTitle] = useState<string>('UNTITLED_STRAT');

  // Timeline: Tempo atual em segundos (0, 20, 40, 60, 80, 100)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<number | null>(null);

  // Frames táticos indexados por timestamp
  const [frames, setFrames] = useState<FramesMap>(createDefaultFrames());

  // Carrega em tempo real estratégias da nuvem (Firestore) para o mapa atual
  const { cloudStrats } = useCloudStrats(selectedMapId);

  // Ajusta estado se initialMapId mudar via props durante a renderização
  if (initialMapId !== prevInitialMapId) {
    setPrevInitialMapId(initialMapId);
    setSelectedMapId(initialMapId);
    setLoadedStratId(null);
    setStratTitle('UNTITLED_STRAT');
    setFrames(createDefaultFrames());
    setCurrentTime(0);
    setIsPlaying(false);
  }

  // Pilha de Histórico de Frames
  const [history, setHistory] = useState<FramesMap[]>([]);

  // Ferramentas
  const [activeTool, setActiveTool] = useState<DrawingTool>('arrow');
  const [activeColor, setActiveColor] = useState<string>('#f6ae2d');
  const [isDashed, setIsDashed] = useState<boolean>(true);
  const [activeEntityTool, setActiveEntityTool] = useState<EntityType | null>(null);

  // Coordenadas e Zoom
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [zoom, setZoom] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);

  const currentMap: MapData = mapsDatabase.find((m) => m.id === selectedMapId) || mapsDatabase[0];

  // Entidades e Caminhos do Frame Atual
  const currentFrameData = frames[currentTime] || { entities: [], paths: [] };
  const paths = currentFrameData.paths;
  const entities = currentFrameData.entities;

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Helper de histórico
  const pushHistory = useCallback(() => {
    setHistory((prev) => {
      // Clona profundamente os frames para o histórico
      const clone: FramesMap = {};
      for (const key of TIMELINE_TIMESTAMPS) {
        clone[key] = {
          entities: frames[key]?.entities ? frames[key].entities.map((e) => ({ ...e })) : [],
          paths: frames[key]?.paths ? frames[key].paths.map((p) => ({ ...p, points: [...p.points] })) : [],
        };
      }
      return [...prev.slice(-20), clone];
    });
  }, [frames]);

  // Manipulação de Caminhos (específicos do frame atual)
  const handleAddPath = (newPath: BoardPath) => {
    pushHistory();
    setFrames((prev) => ({
      ...prev,
      [currentTime]: {
        ...prev[currentTime],
        paths: [...(prev[currentTime]?.paths || []), newPath],
      },
    }));
  };

  const handleRemovePath = (pathId: string) => {
    pushHistory();
    setFrames((prev) => ({
      ...prev,
      [currentTime]: {
        ...prev[currentTime],
        paths: (prev[currentTime]?.paths || []).filter((p) => p.id !== pathId),
      },
    }));
  };

  // Manipulação de Entidades: Adiciona ao frame atual e propaga inicialmente para frames posteriores
  const handleAddEntity = (newEntity: BoardEntity) => {
    pushHistory();
    const isPlayer =
      newEntity.type === 'PLAYER_T' || newEntity.type === 'PLAYER_CT' || newEntity.type === 'BOMB';

    setFrames((prev) => {
      const next: FramesMap = {};
      for (const t of TIMELINE_TIMESTAMPS) {
        next[t] = {
          entities: (prev[t]?.entities || []).map((e) => ({ ...e })),
          paths: (prev[t]?.paths || []).map((p) => ({ ...p, points: [...p.points] })),
        };
      }

      // Adiciona ao frame atual
      next[currentTime].entities.push({ ...newEntity });

      // Se for jogador/bomba, propaga inicialmente para frames posteriores que ainda não o possuem
      if (isPlayer) {
        for (const t of TIMELINE_TIMESTAMPS) {
          if (t > currentTime) {
            const alreadyExists = next[t].entities.some((e) => e.id === newEntity.id);
            if (!alreadyExists) {
              next[t].entities.push({ ...newEntity });
            }
          }
        }
      }

      return next;
    });
  };

  // Atualiza posição/rótulo da entidade ESTRITAMENTE no marco temporal ativo (currentTime)
  const handleUpdateEntity = (entityId: string, updates: Partial<BoardEntity>) => {
    setFrames((prev) => {
      const currentEntities = prev[currentTime]?.entities || [];
      const targetEntity = currentEntities.find((e) => e.id === entityId);
      if (!targetEntity) return prev;

      return {
        ...prev,
        [currentTime]: {
          ...prev[currentTime],
          entities: currentEntities.map((e) =>
            e.id === entityId ? { ...e, ...updates } : e
          ),
        },
      };
    });
  };

  const handleRemoveEntity = (entityId: string) => {
    pushHistory();
    setFrames((prev) => {
      const isPlayer = prev[currentTime]?.entities.some(
        (e) =>
          e.id === entityId &&
          (e.type === 'PLAYER_T' || e.type === 'PLAYER_CT' || e.type === 'BOMB')
      );

      const next: FramesMap = {};
      for (const t of TIMELINE_TIMESTAMPS) {
        // Se for jogador e removido no tempo 0:00, remove de todos os frames
        if (isPlayer && currentTime === 0) {
          next[t] = {
            ...prev[t],
            entities: (prev[t]?.entities || []).filter((e) => e.id !== entityId),
          };
        } else if (t === currentTime) {
          // Caso contrário, remove apenas do frame atual
          next[t] = {
            ...prev[t],
            entities: (prev[t]?.entities || []).filter((e) => e.id !== entityId),
          };
        } else {
          next[t] = prev[t];
        }
      }
      return next;
    });
  };

  // Desfazer (Undo)
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFrames(last);
  };

  // Limpar Quadro Inteiro
  const handleClear = () => {
    pushHistory();
    setFrames(createDefaultFrames());
    setLoadedStratId(null);
    setStratTitle('UNTITLED_STRAT');
    showToast(t('tacticalBoard.boardCleared', 'Quadro limpo!'));
  };

  // Limpar apenas o frame ativo
  const handleClearCurrentFrame = () => {
    pushHistory();
    setFrames((prev) => ({
      ...prev,
      [currentTime]: { entities: [], paths: [] },
    }));
    showToast(t('tacticalBoard.frameCleared', 'Marco atual limpo!'));
  };

  // Copiar entidades e desenhos do frame atual para o próximo marco (+20s)
  const handleCopyFrameToNext = () => {
    const nextIndex = TIMELINE_TIMESTAMPS.indexOf(currentTime as typeof TIMELINE_TIMESTAMPS[number]) + 1;
    if (nextIndex >= TIMELINE_TIMESTAMPS.length) {
      showToast(t('tacticalBoard.lastFrameReached', 'Já está no último marco temporal.'));
      return;
    }

    const nextTime = TIMELINE_TIMESTAMPS[nextIndex];
    pushHistory();
    setFrames((prev) => ({
      ...prev,
      [nextTime]: {
        entities: (prev[currentTime]?.entities || []).map((e) => ({ ...e })),
        paths: (prev[currentTime]?.paths || []).map((p) => ({ ...p, points: [...p.points] })),
      },
    }));
    setCurrentTime(nextTime);
    showToast(t('tacticalBoard.frameCopied', { nextTime: `${Math.floor(nextTime / 60)}:${String(nextTime % 60).padStart(2, '0')}` }));
  };

  // Navegação da Timeline
  const handleSetCurrentTime = (time: number) => {
    if (TIMELINE_TIMESTAMPS.includes(time as typeof TIMELINE_TIMESTAMPS[number])) {
      setCurrentTime(time);
    }
  };

  const handleNextTime = () => {
    const idx = TIMELINE_TIMESTAMPS.indexOf(currentTime as typeof TIMELINE_TIMESTAMPS[number]);
    if (idx < TIMELINE_TIMESTAMPS.length - 1) {
      setCurrentTime(TIMELINE_TIMESTAMPS[idx + 1]);
    }
  };

  const handlePrevTime = () => {
    const idx = TIMELINE_TIMESTAMPS.indexOf(currentTime as typeof TIMELINE_TIMESTAMPS[number]);
    if (idx > 0) {
      setCurrentTime(TIMELINE_TIMESTAMPS[idx - 1]);
    }
  };

  // Reprodução Automática (Play/Pause)
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = window.setInterval(() => {
        setCurrentTime((prevTime) => {
          const idx = TIMELINE_TIMESTAMPS.indexOf(prevTime as typeof TIMELINE_TIMESTAMPS[number]);
          if (idx >= TIMELINE_TIMESTAMPS.length - 1) {
            return TIMELINE_TIMESTAMPS[0]; // Loop para o início
          }
          return TIMELINE_TIMESTAMPS[idx + 1];
        });
      }, 1200);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Troca de Mapa
  const handleSelectMap = (mapId: string) => {
    setSelectedMapId(mapId);
    setLoadedStratId(null);
    setStratTitle('UNTITLED_STRAT');
    setFrames(createDefaultFrames());
    setCurrentTime(0);
    setIsPlaying(false);
    if (onMapChange) {
      onMapChange(mapId);
    }
  };

  // Carregar Preset
  const handleSelectPreset = (preset: StratPreset) => {
    pushHistory();
    setSelectedMapId(preset.mapId);
    setStratTitle(preset.title);
    setFrames(arrayToFramesMap(preset.frames, preset.entities || [], preset.paths || []));
    setCurrentTime(0);
    setIsPlaying(false);
    setLoadedStratId(null);
    if (onMapChange) {
      onMapChange(preset.mapId);
    }
    showToast(t('tacticalBoard.presetLoaded', { title: preset.title }));
  };

  // Carregar Estratégia Salva no Firestore
  const handleSelectCloudStrat = (strat: StratData) => {
    pushHistory();
    setSelectedMapId(strat.mapId);
    setStratTitle(strat.title);
    setFrames(arrayToFramesMap(strat.frames, strat.entities || [], strat.paths || []));
    setCurrentTime(0);
    setIsPlaying(false);
    setLoadedStratId(strat.id);
    if (onMapChange && strat.mapId !== selectedMapId) {
      onMapChange(strat.mapId);
    }
    showToast(t('tacticalBoard.stratLoaded', { title: strat.title }));
  };

  // Excluir Estratégia do Firestore
  const handleDeleteCloudStrat = async (stratId: string) => {
    try {
      await deleteStrat(stratId);
      if (loadedStratId === stratId) {
        setLoadedStratId(null);
        setStratTitle('UNTITLED_STRAT');
        setFrames(createDefaultFrames());
        setCurrentTime(0);
      }
      showToast(t('tacticalBoard.stratDeleted', 'Estratégia excluída com sucesso!'));
    } catch (err) {
      console.error('Erro ao excluir estratégia:', err);
      showToast(t('tacticalBoard.deleteError', 'Erro ao excluir estratégia.'));
    }
  };

  // Callback de sucesso ao salvar
  const handleStratSavedSuccessfully = (savedTitle: string, stratId: string) => {
    setStratTitle(savedTitle);
    setLoadedStratId(stratId);
    setIsSaveModalOpen(false);
    showToast(t('tacticalBoard.stratSaved', 'Estratégia salva com sucesso!'));
  };

  // Abrir Modal de Salvar
  const handleOpenSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  // Exportar JSON
  const handleExportJson = () => {
    const allFrames = framesMapToArray(frames);
    const stratData: StratPreset = {
      id: loadedStratId || `strat-${Date.now()}`,
      title: stratTitle || 'STRAT',
      mapId: selectedMapId,
      frames: allFrames,
      paths: allFrames[0]?.paths || [],
      entities: allFrames[0]?.entities || [],
      createdAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(stratData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stratTitle || 'STRAT'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('tacticalBoard.jsonExported', 'Arquivo JSON baixado!'));
  };

  // Drag & Drop
  const handleDragStartEntity = (e: React.DragEvent, type: EntityType) => {
    e.dataTransfer.setData('application/cs-tactical-entity', type);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10));
  const handleResetZoom = () => setZoom(1);

  return {
    selectedMapId,
    currentMap,
    stratTitle,
    setStratTitle,
    paths,
    entities,
    frames,
    allFramesList: framesMapToArray(frames),
    currentTime,
    isPlaying,
    cloudStrats,
    loadedStratId,
    isSaveModalOpen,
    setIsSaveModalOpen,
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    isDashed,
    setIsDashed,
    activeEntityTool,
    setActiveEntityTool,
    cursorCoords,
    setCursorCoords,
    zoom,
    notification,
    canUndo: history.length > 0,
    handleAddPath,
    handleRemovePath,
    handleAddEntity,
    handleUpdateEntity,
    handleRemoveEntity,
    handleUndo,
    handleClear,
    handleClearCurrentFrame,
    handleCopyFrameToNext,
    handleSetCurrentTime,
    handleNextTime,
    handlePrevTime,
    handleTogglePlay,
    handleSelectMap,
    handleSelectPreset,
    handleSelectCloudStrat,
    handleDeleteCloudStrat,
    handleOpenSaveModal,
    handleStratSavedSuccessfully,
    handleExportJson,
    handleDragStartEntity,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    showToast,
  };
}

