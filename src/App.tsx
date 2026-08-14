import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Home, MapsView, MapDetail } from './pages';

function ComingSoon() {
  return (
    <div className="text-on-surface-variant bg-surface-container-low animate-in zoom-in-95 flex min-h-[50vh] flex-grow flex-col items-center justify-center gap-4 rounded-lg border border-white/5 duration-300">
      <span className="material-symbols-outlined text-primary/50 text-4xl">construction</span>
      <h2 className="font-headline-md text-2xl">Content Coming Soon...</h2>
    </div>
  );
}

export default function App() {
  return (
    <div className="font-body-base text-body-base bg-background text-on-surface flex min-h-screen flex-col antialiased">
      <Navbar />

      <main className="md:px-margin-desktop max-w-container-max mx-auto flex w-full flex-grow flex-col gap-12 px-4 pt-24 pb-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/maps" element={<MapsView />} />
          <Route path="/maps/:mapId" element={<MapDetail />} />
          <Route path="/tactics" element={<ComingSoon />} />
          <Route path="/pro-strats" element={<ComingSoon />} />
          <Route path="/training" element={<ComingSoon />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
