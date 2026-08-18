import MapCard from '../features/maps/components/MapCard';
import { mapsDatabase } from '../features/maps/data/maps';
import { useRankedMaps } from '../features/maps/hooks/useRankedMaps';

export default function FeaturedMaps() {
  const { rankedMaps, isLoading } = useRankedMaps();

  // Utiliza os dados formatados se já carregaram, senão usa o fallback
  const displayMaps = isLoading ? mapsDatabase.slice(0, 4) : rankedMaps.slice(0, 4);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-2">
        <span className="material-symbols-outlined text-primary-container">map</span>
        <h2 className="font-headline-md text-headline-md text-on-surface">ACTIVE DUTY MAPS</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayMaps.map((map: any) => (
          <MapCard
            key={map.id}
            name={map.name}
            image={map.image}
            grenadesCount={map.grenadesCount}
            combosCount={map.combosCount}
          />
        ))}
      </div>
    </section>
  );
}
