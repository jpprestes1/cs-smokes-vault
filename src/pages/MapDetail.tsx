import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { mapsDatabase } from '../features/maps/data/maps';

import MapSideNav from '../features/maps/components/MapSideNav';
import RadarCanvas from '../features/tactics/components/RadarCanvas';
import TacticalPanel from '../features/tactics/components/TacticalPanel';
import ComboCanvas from '../features/tactics/components/ComboCanvas';
import MobileMenu from '../components/MobileMenu';
import ComboDetails from '../features/tactics/components/ComboDetails';
import TacticVideoPlayer from '../features/tactics/components/TacticVideoPlayer';

import {
  useCombos,
  useMarkers,
  type ComboData,
  type MarkerData,
  type VideoData,
} from '../features/tactics';
import { useAuth } from '../features/auth/hooks/useAuth';
import ComboForm from '../features/tactics/components/ComboForm';

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

  // Atualize os Handlers para limpar o hover
  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null);
    setSelectedCombo(null);
  };

  const handleMarkerClick = (marker: MarkerData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarker(marker);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null);
  };

  const handleComboClick = (combo: ComboData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCombo(combo);
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null);
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

  if (!view) {
    return <Navigate to={`/maps/${mapId}/lineups`} replace />;
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

      {view === 'lineups' ? (
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
            mapId={mapId}
            markers={markers}
            coords={coords}
            onSelectVideo={setSelectedVideo}
            onHoverVideo={setHoveredVideo}
            onClose={handleClosePanel}
          />
        </>
      ) : (
        <>
          <ComboCanvas
            mapId={mapId}
            radarImage={currentMap?.radarImage}
            combos={combos} // <-- Agora recebe os combos reais do Firebase
            selectedComboId={selectedCombo?.id}
            coords={coords}
            setCoords={setCoords}
            onComboClick={handleComboClick}
            onMapClick={handleClosePanel}
            isPanelOpen={isAddingTactic || selectedCombo !== null}
          />

          {(isAddingTactic || selectedCombo !== null) && (
            <aside className="bg-surface-container/95 fixed top-16 right-0 z-40 flex h-[calc(100vh-64px)] w-full transform flex-col border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ease-out md:w-[450px]">
              {isAddingTactic ? (
                <ComboForm mapId={mapId} coords={coords} onClose={handleClosePanel} />
              ) : selectedCombo ? (
                <>
                  {/* Header do Combo */}
                  <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-6 py-5">
                    <div className="flex flex-col gap-2">
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
                    <button
                      onClick={handleClosePanel}
                      className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined p-1">close</span>
                    </button>
                  </div>

                  {/* Corpo do Painel: Detalhes ou Vídeo Player */}
                  <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                    {!selectedVideo ? (
                      <ComboDetails combo={selectedCombo} onSelectVideo={setSelectedVideo} />
                    ) : (
                      <TacticVideoPlayer
                        video={selectedVideo}
                        onBack={() => setSelectedVideo(null)}
                      />
                    )}
                  </div>
                </>
              ) : null}
            </aside>
          )}
        </>
      )}
    </div>
  );
}
