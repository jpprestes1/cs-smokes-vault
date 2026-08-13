import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mapsDatabase } from '../data/maps';
import { tacticalMarkers, type MarkerData, type VideoData } from '../data/markers';

import MapSideNav from '../components/MapSideNav';
import RadarCanvas from '../components/RadarCanvas';
import TacticalPanel from '../components/TacticalPanel';

export default function MapDetail() {
  const { mapId } = useParams();
  const navigate = useNavigate();

  // Estados Globais
  const [activeSide, setActiveSide] = useState('Terrorist');
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // 1. Busca os dados do mapa atual
  const currentMap = mapsDatabase.find((m) => m.id === mapId);

  // 2. Filtra as granadas apenas do mapa que estamos olhando
  const mapMarkers = tacticalMarkers.filter((m) => m.mapId === mapId);

  // 3. O NOVO FILTRO: Separa por lado (Terrorist, Counter-Terrorist ou All Sides)
  const visibleMarkers = mapMarkers.filter((marker) => {
    if (activeSide === 'All Sides') return true; // Mostra tudo

    // Compara o lado (ex: 'TERRORIST') com o botão selecionado (ex: 'Terrorist')
    return marker.side === activeSide.toUpperCase();
  });

  // Handlers
  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
  };

  const handleMarkerClick = (marker: MarkerData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarker(marker);
    setSelectedVideo(null);
  };

  // Handler customizado para a aba de Filtro
  const handleSideChange = (side: string) => {
    setActiveSide(side);
    handleClosePanel(); // Fecha o vídeo/granada se estiver aberto ao trocar o filtro
  };

  return (
    <div className="bg-background fixed top-16 left-0 z-30 flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <MapSideNav
        mapName={currentMap?.name}
        activeSide={activeSide}
        setActiveSide={handleSideChange}
        onBack={() => navigate(-1)}
      />

      <RadarCanvas
        mapId={mapId}
        radarImage={currentMap?.radarImage}
        markers={visibleMarkers} /* Passamos apenas os visíveis agora! */
        selectedMarkerId={selectedMarker?.id}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleClosePanel}
      />

      <TacticalPanel
        marker={selectedMarker}
        selectedVideo={selectedVideo}
        onSelectVideo={setSelectedVideo}
        onClose={handleClosePanel}
      />
    </div>
  );
}
