import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { mapsDatabase } from '../features/maps/data/maps';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import MapSideNav from '../features/maps/components/MapSideNav';
import RadarCanvas from '../features/tactics/components/RadarCanvas';
import TacticalPanel from '../features/tactics/components/TacticalPanel';
import ComboCanvas from '../features/tactics/components/ComboCanvas';
import MobileMenu from '../components/MobileMenu';
import ComboDetails from '../features/tactics/components/ComboDetails';
import TacticVideoPlayer from '../features/tactics/components/TacticVideoPlayer';
import ComboList from '../features/tactics/components/ComboList';
import { type ComboData, type MarkerData, type VideoData } from '../features/tactics/types';
import { useMapData } from '../features/tactics/hooks/useMapData';
import { useAuth } from '../features/auth/hooks/useAuth';
import ComboForm from '../features/tactics/components/ComboForm';
import { db } from '../lib/firebase';

export default function MapDetail() {
  const { t } = useTranslation();
  const { mapId, view } = useParams();
  const navigate = useNavigate();

  // UTILIZANDO O NOVO HOOK GENÉRICO AQUI
  const { data: markers } = useMapData<MarkerData>('markers', mapId);
  const { data: combos } = useMapData<ComboData>('combos', mapId);

  const [activeSide, setActiveSide] = useState('All Sides');
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [selectedCombo, setSelectedCombo] = useState<ComboData | null>(null);

  const [isAddingTactic, setIsAddingTactic] = useState(false);
  const currentMap = mapsDatabase.find((m) => m.id === mapId);

  const visibleMarkers = markers.filter((marker) => {
    if (activeSide === 'All Sides') return true;
    return marker.side === activeSide.toUpperCase();
  });

  const [hoveredVideo, setHoveredVideo] = useState<VideoData | null>(null);
  const isPanelOpen = selectedMarker !== null || isAddingTactic;

  const { role } = useAuth();
  const canCreate = role === 'ADMIN' || role === 'CREATOR';

  const [isEditingTactic, setIsEditingTactic] = useState(false);
  const [selectedComboPos, setSelectedComboPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCombo, setHoveredCombo] = useState<ComboData | null>(null);

  const combosAtPosition = selectedComboPos
    ? combos.filter((c) => c.startX === selectedComboPos.x && c.startY === selectedComboPos.y)
    : [];

  const handleClosePanel = () => {
    setSelectedMarker(null);
    setSelectedCombo(null);
    setSelectedComboPos(null);
    setHoveredCombo(null);
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

  const handleSideChange = (side: string) => {
    setActiveSide(side);
    handleClosePanel();
  };

  const handleAddTacticClick = () => {
    setSelectedMarker(null);
    setSelectedVideo(null);
    setIsAddingTactic(true);
    setHoveredVideo(null);
  };

  const handleDeleteItem = async (collectionName: string, id: string) => {
    if (
      window.confirm(
        collectionName === 'markers' ? t('maps.deleteTacticConfirm') : t('maps.deleteComboConfirm')
      )
    ) {
      await deleteDoc(doc(db, collectionName, id));
      handleClosePanel();
    }
  };

  const handleDeleteVideo = async (
    collectionName: 'markers' | 'combos',
    parentId: string,
    videoId: string
  ) => {
    if (window.confirm(t('maps.deleteVideoConfirm'))) {
      try {
        const docRef = doc(db, collectionName, parentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedVideos = data.videos.filter((v: VideoData) => v.id !== videoId);
          await updateDoc(docRef, { videos: updatedVideos });
        }
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleEditVideo = (
    collectionName: 'markers' | 'combos',
    parentId: string,
    video: VideoData
  ) => {
    alert(
      t('maps.editVideoAlert', {
        title: video.title,
        collectionName,
        parentId,
      })
    );
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
            onDelete={() => handleDeleteItem('markers', selectedMarker!.id)}
            onDeleteVideo={(videoId) => handleDeleteVideo('markers', selectedMarker!.id, videoId)}
            onEditVideo={(video) => handleEditVideo('markers', selectedMarker!.id, video)}
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
            onPositionClick={handlePositionClick}
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
                    {combosAtPosition.length > 1 ? (
                      <button
                        onClick={() => {
                          setSelectedCombo(null);
                          setSelectedVideo(null);
                        }}
                        className="text-on-surface-variant hover:text-primary flex items-center gap-1 text-xs font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>{' '}
                        {t('maps.backToList')}
                      </button>
                    ) : (
                      <span className="font-data-label text-on-surface-variant text-xs font-bold tracking-widest uppercase">
                        {t('maps.executeDetails')}
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
                        onDelete={() => handleDeleteItem('combos', selectedCombo.id)}
                        onDeleteVideo={(videoId) =>
                          handleDeleteVideo('combos', selectedCombo.id, videoId)
                        }
                        onEditVideo={(video) => handleEditVideo('combos', selectedCombo.id, video)}
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
