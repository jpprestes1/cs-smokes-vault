import MapCard from '../features/maps/components/MapCard';
import MapCardSkeleton from '../features/maps/components/MapCardSkeleton';
import { useTranslation } from 'react-i18next';
import { useRankedMaps, type RankedMap } from '../features/maps/hooks/useRankedMaps';

export default function FeaturedMaps() {
  const { t } = useTranslation();
  const { rankedMaps, isLoading } = useRankedMaps();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-2">
        <span className="material-symbols-outlined text-primary-container">map</span>
        <h2 className="font-headline-md text-headline-md text-on-surface">
          {t('featuredMaps.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <MapCardSkeleton key={`skeleton-featured-${index}`} />
            ))
          : rankedMaps
              .slice(0, 4)
              .map((map: RankedMap) => (
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
