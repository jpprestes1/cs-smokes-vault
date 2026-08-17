import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { mapsDatabase } from '../features/maps/data/maps';
import { doc, deleteDoc } from 'firebase/firestore';
import MapSideNav from '../features/maps/components/MapSideNav';
import RadarCanvas from '../features/tactics/components/RadarCanvas';
import TacticalPanel from '../features/tactics/components/TacticalPanel';
import ComboCanvas from '../features/tactics/components/ComboCanvas';
import MobileMenu from '../components/MobileMenu';
import ComboDetails from '../features/tactics/components/ComboDetails';
import TacticVideoPlayer from '../features/tactics/components/TacticVideoPlayer';
import ComboList from '../features/tactics/components/ComboList';

import {
  useCombos,
  useMarkers,
  type ComboData,
  type MarkerData,
  type VideoData,
} from '../features/tactics';
import { useAuth } from '../features/auth/hooks/useAuth';
import ComboForm from '../features/tactics/components/ComboForm';
import { db } from '../lib/firebase';

export default function MapDetail() {
  const { mapId, view } = useParams(); // <-- Lendo a view da URL
  const navigate = useNavigate();
  // 2. Chame o Hook
  const { markers } = useMarkers(mapId);
  const { combos } = useCombos(mapId);

  // Estados Globais
  const [activeSide, setActiveSide] = useState('All Sides'); // <-- Novo estado para controlar o filtro de lado
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [selectedCombo, setSelectedCombo] = useState<ComboData | null>(null);

  // NOVO ESTADO: Controla se o formulário está aberto
  const [isAddingTactic, setIsAddingTactic] = useState(false);

  // 1. Busca os dados do mapa atual
  const currentMap = mapsDatabase.find((m) => m.id === mapId);

  // 3. O NOVO FILTRO: Separa por lado (Terrorist, Counter-Terrorist ou All Sides)
  const visibleMarkers = markers.filter((marker) => {
    if (activeSide === 'All Sides') return true;
    return marker.side === activeSide.toUpperCase();
  });
  const [hoveredVideo, setHoveredVideo] = useState<VideoData | null>(null);
  const isPanelOpen = selectedMarker !== null || isAddingTactic;

  const { role } = useAuth();

  const canCreate = role === 'ADMIN' || role === 'CREATOR';

  const [isEditingTactic, setIsEditingTactic] = useState(false); // NOVO ESTADO DE EDICAO

  const [selectedComboPos, setSelectedComboPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCombo, setHoveredCombo] = useState<ComboData | null>(null);

  // Filtra os combos que pertencem à posição clicada
  const combosAtPosition = selectedComboPos
    ? combos.filter((c) => c.startX === selectedComboPos.x && c.startY === selectedComboPos.y)
    : [];

  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedCombo(null);
    setSelectedComboPos(null); // <-- Novo
    setHoveredCombo(null); // <-- Novo
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setIsEditingTactic(false);
    setHoveredVideo(null);
  };

  const handlePositionClick = (pos: { x: number; y: number }, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComboPos(pos);
    setSelectedCombo(null);
    setIsAddingTactic(false);
    setIsEditingTactic(false);
    setHoveredCombo(null);
  };

  const handleMarkerClick = (marker: MarkerData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarker(marker);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null);
    setIsEditingTactic(false);
  };

  const handleComboClick = (combo: ComboData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCombo(combo);
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null);
    setIsEditingTactic(false);
  };

  const handleSideChange = (side: string) => {
    setActiveSide(side);
    handleClosePanel();
  };

  const handleAddTacticClick = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(true);
    setHoveredVideo(null); // <-- Limpa o hover
  };

  const handleDeleteMarker = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tactic?')) {
      await deleteDoc(doc(db, 'markers', id));
      handleClosePanel();
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this combo?')) {
      await deleteDoc(doc(db, 'combos', id));
      handleClosePanel();
    }
  };

  if (!view) {
    return <Navigate to={`/maps/${mapId}/grenades`} replace />;
  }

  return (
    <div className="bg-background fixed top-16 left-0 z-30 flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <MapSideNav
        mapName={currentMap?.name}
        activeSide={activeSide}
        setActiveSide={handleSideChange}
        onBack={() => navigate('/maps')}
        onAddTactic={handleAddTacticClick}
        canCreate={canCreate}
      />

      <MobileMenu
        activeSide={activeSide}
        setActiveSide={handleSideChange}
        onAddTactic={handleAddTacticClick}
        canCreate={canCreate}
      />

      {view === 'grenades' ? (
        <>
          <RadarCanvas
            mapId={mapId}
            radarImage={currentMap?.radarImage}
            markers={visibleMarkers}
            selectedMarkerId={selectedMarker?.id}
            coords={coords}
            setCoords={setCoords}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleClosePanel}
            hoveredVideo={hoveredVideo}
            isPanelOpen={isPanelOpen}
          />
          <TacticalPanel
            marker={selectedMarker}
            selectedVideo={selectedVideo}
            isAdding={isAddingTactic}
            isEditing={isEditingTactic}
            mapId={mapId}
            markers={markers}
            coords={coords}
            onSelectVideo={setSelectedVideo}
            onHoverVideo={setHoveredVideo}
            onClose={handleClosePanel}
            onEdit={() => setIsEditingTactic(true)}
            onDelete={handleDeleteMarker}
          />
        </>
      ) : (
        <>
          <ComboCanvas
            mapId={mapId}
            radarImage={currentMap?.radarImage}
            combos={combos}
            selectedPos={selectedComboPos}
            activeCombo={hoveredCombo || selectedCombo}
            coords={coords}
            setCoords={setCoords}
            onPositionClick={handlePositionClick} /* <--- ELA DEVE SER PASSADA AQUI */
            onMapClick={handleClosePanel}
            isPanelOpen={isAddingTactic || selectedComboPos !== null}
          />

          {(isAddingTactic || selectedComboPos !== null || isEditingTactic) && (
            <aside className="bg-surface-container/95 fixed top-16 right-0 z-40 flex h-[calc(100vh-64px)] w-full transform flex-col border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ease-out md:w-[450px]">
              {isAddingTactic || isEditingTactic ? (
                <ComboForm
                  mapId={mapId}
                  coords={coords}
                  onClose={handleClosePanel}
                  initialData={isEditingTactic ? selectedCombo! : undefined}
                />
              ) : selectedCombo ? (
                <div className="flex h-full flex-col">
                  <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
                    {/* Se houver mais de um combo na lista, mostra o botão de voltar. Senão, mostra apenas o texto EXECUTE */}
                    {combosAtPosition.length > 1 ? (
                      <button
                        onClick={() => {
                          setSelectedCombo(null);
                          setSelectedVideo(null);
                        }}
                        className="text-on-surface-variant hover:text-primary flex items-center gap-1 text-xs font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
                        TO LIST
                      </button>
                    ) : (
                      <span className="font-data-label text-on-surface-variant text-xs font-bold tracking-widest uppercase">
                        Execute Details
                      </span>
                    )}
                    <button
                      onClick={handleClosePanel}
                      className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined p-1">close</span>
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col overflow-y-auto p-6">
                    <div className="mb-6 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">
                          strategy
                        </span>
                        <span className="font-data-label text-data-label text-on-surface-variant bg-surface-variant/50 scanline rounded-sm px-2 py-0.5 tracking-widest uppercase">
                          EXECUTE
                        </span>
                        <span
                          className={`font-data-label text-data-label ${selectedCombo.side === 'TERRORIST' ? 'text-primary border-primary/30 bg-primary/10' : 'text-secondary border-secondary/30 bg-secondary/10'} rounded-sm border px-2 py-0.5 tracking-widest uppercase`}
                        >
                          {selectedCombo.side}
                        </span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-primary mt-1">
                        {selectedCombo.title}
                      </h3>
                    </div>

                    {!selectedVideo ? (
                      <ComboDetails
                        combo={selectedCombo}
                        onSelectVideo={setSelectedVideo}
                        onEdit={() => setIsEditingTactic(true)}
                        onDelete={() => handleDeleteCombo(selectedCombo.id)}
                      />
                    ) : (
                      <TacticVideoPlayer
                        video={selectedVideo}
                        onBack={() => setSelectedVideo(null)}
                      />
                    )}
                  </div>
                </div>
              ) : selectedComboPos ? (
                <ComboList
                  combos={combosAtPosition}
                  onSelectCombo={setSelectedCombo}
                  onHoverCombo={setHoveredCombo}
                  onClose={handleClosePanel}
                />
              ) : null}
            </aside>
          )}
        </>
      )}
    </div>
  );
}
