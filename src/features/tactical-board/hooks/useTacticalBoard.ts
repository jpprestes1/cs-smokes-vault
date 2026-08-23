import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  DrawingTool,
  EntityType,
  BoardPath,
  BoardEntity,
  StratPreset,
  StratData,
} from '../types';
import { presetStrats } from '../data/presetStrats';
import { mapsDatabase, type MapData } from '../../maps/data/maps';
import { useCloudStrats } from './useCloudStrats';
import { deleteStrat } from '../services/stratsService';

interface UseTacticalBoardProps {
  initialMapId?: string;
  onMapChange?: (mapId: string) => void;
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

  const [stratTitle, setStratTitle] = useState<string>(() => {
    const matched = presetStrats.find((p) => p.mapId === initialMapId);
    return matched?.title || 'MIRAGE_A_EXEC';
  });

  const [paths, setPaths] = useState<BoardPath[]>(() => {
    const matched = presetStrats.find((p) => p.mapId === initialMapId);
    return matched?.paths || presetStrats[0]?.paths || [];
  });

  const [entities, setEntities] = useState<BoardEntity[]>(() => {
    const matched = presetStrats.find((p) => p.mapId === initialMapId);
    return matched?.entities || presetStrats[0]?.entities || [];
  });

  // Carrega em tempo real estratégias da nuvem (Firestore) para o mapa atual
  const { cloudStrats } = useCloudStrats(selectedMapId);

  // Ajusta estado se initialMapId mudar via props durante a renderização
  if (initialMapId !== prevInitialMapId) {
    setPrevInitialMapId(initialMapId);
    setSelectedMapId(initialMapId);
    setLoadedStratId(null);
    const matchedPreset = presetStrats.find((p) => p.mapId === initialMapId);
    if (matchedPreset) {
      setStratTitle(matchedPreset.title);
      setPaths(matchedPreset.paths);
      setEntities(matchedPreset.entities);
    } else {
      const mapName = mapsDatabase.find((m) => m.id === initialMapId)?.name || initialMapId;
      setStratTitle(`${mapName.toUpperCase()}_STRAT`);
      setPaths([]);
      setEntities([]);
    }
  }

  // Pilha de Histórico
  const [history, setHistory] = useState<{ paths: BoardPath[]; entities: BoardEntity[] }[]>([]);

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

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Helper de histórico
  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), { paths, entities }]);
  }, [paths, entities]);

  // Manipulação de Caminhos
  const handleAddPath = (newPath: BoardPath) => {
    pushHistory();
    setPaths((prev) => [...prev, newPath]);
  };

  const handleRemovePath = (pathId: string) => {
    pushHistory();
    setPaths((prev) => prev.filter((p) => p.id !== pathId));
  };

  // Manipulação de Entidades
  const handleAddEntity = (newEntity: BoardEntity) => {
    pushHistory();
    setEntities((prev) => [...prev, newEntity]);
    setActiveEntityTool(null);
  };

  const handleUpdateEntity = (entityId: string, updates: Partial<BoardEntity>) => {
    setEntities((prev) => prev.map((e) => (e.id === entityId ? { ...e, ...updates } : e)));
  };

  const handleRemoveEntity = (entityId: string) => {
    pushHistory();
    setEntities((prev) => prev.filter((e) => e.id !== entityId));
  };

  // Desfazer (Undo)
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setPaths(last.paths);
    setEntities(last.entities);
  };

  // Limpar Quadro
  const handleClear = () => {
    if (paths.length === 0 && entities.length === 0) return;
    pushHistory();
    setPaths([]);
    setEntities([]);
    setLoadedStratId(null);
    showToast(t('tacticalBoard.boardCleared', 'Quadro limpo!'));
  };

  // Troca de Mapa
  const handleSelectMap = (mapId: string) => {
    setSelectedMapId(mapId);
    setLoadedStratId(null);
    const matchedPreset = presetStrats.find((p) => p.mapId === mapId);
    if (matchedPreset) {
      setStratTitle(matchedPreset.title);
      setPaths(matchedPreset.paths);
      setEntities(matchedPreset.entities);
    } else {
      const mapName = mapsDatabase.find((m) => m.id === mapId)?.name || mapId;
      setStratTitle(`${mapName.toUpperCase()}_STRAT`);
      setPaths([]);
      setEntities([]);
    }
    if (onMapChange) {
      onMapChange(mapId);
    }
  };

  // Carregar Preset Local do Sistema
  const handleSelectPreset = (preset: StratPreset) => {
    pushHistory();
    setSelectedMapId(preset.mapId);
    setStratTitle(preset.title);
    setPaths(preset.paths);
    setEntities(preset.entities);
    setLoadedStratId(null);
    if (onMapChange) {
      onMapChange(preset.mapId);
    }
    showToast(t('tacticalBoard.presetLoaded', `Preset "${preset.title}" carregado!`));
  };

  // Carregar Estratégia Salva no Firestore
  const handleSelectCloudStrat = (strat: StratData) => {
    pushHistory();
    setSelectedMapId(strat.mapId);
    setStratTitle(strat.title);
    setPaths(strat.paths || []);
    setEntities(strat.entities || []);
    setLoadedStratId(strat.id);
    if (onMapChange && strat.mapId !== selectedMapId) {
      onMapChange(strat.mapId);
    }
    showToast(t('tacticalBoard.stratLoaded', `Estratégia "${strat.title}" carregada da nuvem!`));
  };

  // Excluir Estratégia do Firestore
  const handleDeleteCloudStrat = async (stratId: string) => {
    try {
      await deleteStrat(stratId);
      if (loadedStratId === stratId) {
        setLoadedStratId(null);
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
    const stratData: StratPreset = {
      id: loadedStratId || `strat-${Date.now()}`,
      title: stratTitle || 'STRAT',
      mapId: selectedMapId,
      paths,
      entities,
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
