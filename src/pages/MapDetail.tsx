import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mapsDatabase } from '../data/maps';

import MapSideNav from '../components/MapSideNav';
import RadarCanvas from '../components/RadarCanvas';
import TacticalPanel from '../components/TacticalPanel';

import { useMarkers, type MarkerData, type VideoData } from '../data/markers';

export default function MapDetail() {
  const { mapId } = useParams();
  const navigate = useNavigate();

  // 2. Chame o Hook
  const { markers } = useMarkers(mapId);

  // Estados Globais
  const [activeSide, setActiveSide] = useState('Terrorist');
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // NOVO ESTADO: Controla se o formulário está aberto
  const [isAddingTactic, setIsAddingTactic] = useState(false);

  // 1. Busca os dados do mapa atual
  const currentMap = mapsDatabase.find((m) => m.id === mapId);

  // 3. O NOVO FILTRO: Separa por lado (Terrorist, Counter-Terrorist ou All Sides)
  const visibleMarkers = markers.filter((marker) => {
    if (activeSide === 'All Sides') return true;
    return marker.side === activeSide.toUpperCase();
  });

  // Handlers
  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(false); // Fecha o form ao clicar fora
  };

  const handleMarkerClick = (marker: MarkerData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarker(marker);
    setSelectedVideo(null);
    setIsAddingTactic(false); // Fecha o form se abrir uma granada
  };

  // Handler customizado para a aba de Filtro
  const handleSideChange = (side: string) => {
    setActiveSide(side);
    handleClosePanel(); // Fecha o vídeo/granada/form se estiver aberto ao trocar o filtro
  };

  // NOVO HANDLER: Abre o form de adicionar tática
  const handleAddTacticClick = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(true);
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

      <RadarCanvas
        mapId={mapId}
        radarImage={currentMap?.radarImage}
        markers={visibleMarkers}
        selectedMarkerId={selectedMarker?.id}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleClosePanel}
      />

      <TacticalPanel
        marker={selectedMarker}
        selectedVideo={selectedVideo}
        isAdding={isAddingTactic} // NOVA PROP PARA O FORM
        mapId={mapId} // NOVA PROP PARA O FIREBASE SABER O MAPA
        markers={markers}
        onSelectVideo={setSelectedVideo}
        onClose={handleClosePanel}
      />
    </div>
  );
}
