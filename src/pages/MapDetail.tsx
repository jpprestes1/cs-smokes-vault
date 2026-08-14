import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mapsDatabase } from '../data/maps';

import MapSideNav from '../components/MapSideNav';
import RadarCanvas from '../components/RadarCanvas';
import TacticalPanel from '../components/TacticalPanel';
import MobileMenu from '../components/MobileMenu';

import { useMarkers, type MarkerData, type VideoData } from '../data/markers';

export default function MapDetail() {
  const { mapId } = useParams();
  const navigate = useNavigate();

  // 2. Chame o Hook
  const { markers } = useMarkers(mapId);

  // Estados Globais
  const [activeSide, setActiveSide] = useState('All Sides'); // <-- Novo estado para controlar o filtro de lado
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

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

  // Atualize os Handlers para limpar o hover
  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null); // <-- Limpa o hover
  };

  const handleMarkerClick = (marker: MarkerData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarker(marker);
    setSelectedVideo(null);
    setIsAddingTactic(false);
    setHoveredVideo(null); // <-- Limpa o hover
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
  return (
    <div className="bg-background fixed top-16 left-0 z-30 flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <MapSideNav
        mapName={currentMap?.name}
        activeSide={activeSide}
        setActiveSide={handleSideChange}
        onBack={() => navigate(-1)}
        onAddTactic={handleAddTacticClick} // NOVA PROP PASSADA PARA O MENU
      />

      <MobileMenu
        activeSide={activeSide}
        setActiveSide={handleSideChange}
        onAddTactic={handleAddTacticClick}
      />

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
        isAdding={isAddingTactic} // NOVA PROP PARA O FORM
        mapId={mapId} // NOVA PROP PARA O FIREBASE SABER O MAPA
        markers={markers}
        coords={coords}
        onSelectVideo={setSelectedVideo}
        onHoverVideo={setHoveredVideo}
        onClose={handleClosePanel}
      />
    </div>
  );
}
