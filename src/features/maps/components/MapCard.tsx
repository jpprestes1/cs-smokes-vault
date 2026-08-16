import { Link } from 'react-router-dom';
import { useMapMarkerCount } from '../../tactics/hooks/useMarkers';

interface MapCardProps {
  name: string;
  image: string;
}

export default function MapCard({ name, image }: MapCardProps) {
  const mapSlug = name.toLowerCase().replace(/\s+/g, '-');

  const realCount = useMapMarkerCount(mapSlug);

  return (
    <Link
      to={`/maps/${mapSlug}`}
      className="group tactical-glass tactical-glow relative block h-48 cursor-pointer overflow-hidden rounded-sm border border-white/5"
    >
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale transition-opacity duration-300 group-hover:opacity-70 group-hover:grayscale-0"
        src={image}
        alt={`CS2 Map ${name}`}
      />
      <div className="from-surface-container-lowest pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"></div>
      <div className="absolute bottom-4 left-4 flex flex-col">
        <span className="font-headline-md-mobile text-headline-md-mobile text-primary-container font-bold tracking-wider">
          {name}
        </span>
        <span className="font-data-label text-data-label text-on-surface-variant">
          {realCount !== null ? `${realCount} Grenades` : 'Loading...'}
        </span>
      </div>
    </Link>
  );
}
