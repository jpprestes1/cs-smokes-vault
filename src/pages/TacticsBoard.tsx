import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import {
  useTacticalBoard,
  TacticalBoardSidebar,
  TacticalBoardCanvas,
  TacticalBoardToolbar,
  TacticalBoardTimeline,
  TacticalBoardStatusBar,
  TacticalBoardAuthLock,
  SaveStratModal,
} from '../features/tactical-board';

export default function TacticsBoard() {
  const { mapId } = useParams<{ mapId?: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isAuthenticated = Boolean(user);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    selectedMapId,
    currentMap,
    stratTitle,
    setStratTitle,
    paths,
    entities,
    allFramesList,
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
    canUndo,
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
  } = useTacticalBoard({
    initialMapId: mapId || 'mirage',
    userId: user?.uid,
    onMapChange: (newMapId) => {
      navigate(`/strat-board/${newMapId}`, { replace: true });
    },
  });

  // Atalhos de Teclado
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = ['INPUT', 'TEXTAREA'].includes(
        (e.target as HTMLElement)?.tagName
      );

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'Escape') {
        setActiveEntityTool(null);
        setActiveTool('select');
      } else if ((e.key === 'v' || e.key === 'V') && !isInputActive) {
        setActiveEntityTool(null);
        setActiveTool('select');
      } else if (e.key === 'ArrowLeft' && !isInputActive && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        handlePrevTime();
      } else if (e.key === 'ArrowRight' && !isInputActive && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        handleNextTime();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, handleUndo, setActiveEntityTool, setActiveTool, handlePrevTime, handleNextTime]);

  return (
    <div className="bg-background fixed top-16 left-0 z-30 flex h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Toast Notificação Tática */}
      {notification && (
        <div className="bg-surface-container-highest border-primary text-primary font-data-label text-data-label tactical-glass animate-in fade-in slide-in-from-top-4 fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-sm border px-4 py-2 shadow-2xl duration-200">
          <span className="mr-2">●</span> {notification}
        </div>
      )}

      {/* Modal de Salvar Estratégia no Firestore */}
      {isSaveModalOpen && isAuthenticated && (
        <SaveStratModal
          mapId={selectedMapId}
          stratTitle={stratTitle}
          frames={allFramesList}
          paths={paths}
          entities={entities}
          loadedStratId={loadedStratId}
          onClose={() => setIsSaveModalOpen(false)}
          onSuccess={handleStratSavedSuccessfully}
        />
      )}

      {/* Botão Mobile para Abrir Sidebar */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="bg-surface-container-high border-primary/30 text-primary fixed bottom-14 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border shadow-2xl md:hidden"
        title="Open Strat Tools"
      >
        <span className="material-symbols-outlined text-lg">tune</span>
      </button>

      {/* Drawer Mobile da Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 flex h-full w-72">
            <TacticalBoardSidebar
              selectedMapId={selectedMapId}
              onSelectMap={handleSelectMap}
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              activeColor={activeColor}
              onSelectColor={setActiveColor}
              isDashed={isDashed}
              onToggleDashed={() => setIsDashed((prev) => !prev)}
              activeEntityTool={activeEntityTool}
              onSelectEntityTool={setActiveEntityTool}
              onDragStartEntity={handleDragStartEntity}
              onUndo={handleUndo}
              onClear={handleClear}
              canUndo={canUndo}
              disabled={!isAuthenticated}
            />
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <TacticalBoardSidebar
        selectedMapId={selectedMapId}
        onSelectMap={handleSelectMap}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        activeColor={activeColor}
        onSelectColor={setActiveColor}
        isDashed={isDashed}
        onToggleDashed={() => setIsDashed((prev) => !prev)}
        activeEntityTool={activeEntityTool}
        onSelectEntityTool={setActiveEntityTool}
        onDragStartEntity={handleDragStartEntity}
        onUndo={handleUndo}
        onClear={handleClear}
        canUndo={canUndo}
        disabled={!isAuthenticated}
      />

      {/* Área Central do Canvas */}
      <section className="bg-surface-dim relative flex flex-1 flex-col overflow-hidden">
        {/* Barra Superior Interna */}
        <TacticalBoardToolbar
          stratTitle={stratTitle}
          onChangeTitle={setStratTitle}
          onSelectPreset={handleSelectPreset}
          cloudStrats={cloudStrats}
          onSelectCloudStrat={handleSelectCloudStrat}
          onDeleteCloudStrat={handleDeleteCloudStrat}
          loadedStratId={loadedStratId}
          onSaveStrat={handleOpenSaveModal}
          onExportJson={handleExportJson}
          disabled={!isAuthenticated}
        />

        {/* Viewport Interativo com Radar ou Bloqueio Tático */}
        <div className="relative flex flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full w-full flex-1 items-center justify-center">
              <span className="material-symbols-outlined text-primary animate-spin text-4xl">
                progress_activity
              </span>
            </div>
          ) : !isAuthenticated ? (
            <TacticalBoardAuthLock
              radarImage={currentMap.radarImage}
              mapName={currentMap.name}
            />
          ) : (
            <>
              <TacticalBoardCanvas
                radarImage={currentMap.radarImage}
                paths={paths}
                entities={entities}
                activeTool={activeTool}
                activeColor={activeColor}
                isDashed={isDashed}
                activeEntityTool={activeEntityTool}
                onAddPath={handleAddPath}
                onRemovePath={handleRemovePath}
                onAddEntity={handleAddEntity}
                onUpdateEntity={handleUpdateEntity}
                onRemoveEntity={handleRemoveEntity}
                onCursorMove={setCursorCoords}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
              />

              {/* Linha do Tempo Tática Flutuante Minimalista */}
              <TacticalBoardTimeline
                currentTime={currentTime}
                isPlaying={isPlaying}
                framesList={allFramesList}
                onSetTime={handleSetCurrentTime}
                onNextTime={handleNextTime}
                onPrevTime={handlePrevTime}
                onTogglePlay={handleTogglePlay}
                onCopyFrameToNext={handleCopyFrameToNext}
                onClearCurrentFrame={handleClearCurrentFrame}
              />
            </>
          )}
        </div>

        {/* Barra de Status Inferior HUD */}
        <TacticalBoardStatusBar
          cursorCoords={cursorCoords}
          activeTool={activeTool}
          activeEntityTool={activeEntityTool}
          selectedMapName={currentMap.name}
          stratTitle={stratTitle}
          entitiesCount={entities.length}
          pathsCount={paths.length}
          currentTime={currentTime}
        />
      </section>
    </div>
  );
}
