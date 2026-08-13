import Hero from '../components/Hero';
import FeaturedMaps from '../components/FeaturedMaps';

export default function Home() {
  return (
    <div className="animate-in fade-in flex flex-col gap-12 duration-500">
      <Hero />
      <FeaturedMaps />
    </div>
  );
}
