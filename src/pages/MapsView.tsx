import MapCard from '../components/MapCard';
import { mapsDatabase } from '../data/maps';

export default function MapsView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full duration-500">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display-lg md:text-display-lg text-on-surface text-4xl tracking-tight uppercase">
          Grenade Database
        </h1>
        <p className="font-body-base text-on-surface-variant">
          Select a map to explore utility lineups, executes, and pro strategies.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
          <span className="material-symbols-outlined text-primary-container">public</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">ALL MAPS</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mapsDatabase.map((map) => (
            <MapCard key={map.id} name={map.name} image={map.image} />
          ))}
        </div>
      </section>
    </div>
  );
}
