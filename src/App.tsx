import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './features/auth/components/AdminRoutes';

// Importações dinâmicas (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const MapsView = lazy(() => import('./pages/MapsView'));
const MapDetail = lazy(() => import('./pages/MapDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function ComingSoon() {
  const { t } = useTranslation();
  return (
    <div className="text-on-surface-variant bg-surface-container-low animate-in zoom-in-95 flex min-h-[50vh] flex-grow flex-col items-center justify-center gap-4 rounded-lg border border-white/5 duration-300">
      <span className="material-symbols-outlined text-primary/50 text-4xl">construction</span>
      <h2 className="font-headline-md text-2xl">{t('app.comingSoon')}</h2>
    </div>
  );
}

export default function App() {
  return (
    <div className="font-body-base text-body-base bg-background text-on-surface flex min-h-screen flex-col antialiased">
      <Navbar />
      <main className="md:px-margin-desktop max-w-container-max mx-auto flex w-full flex-grow flex-col gap-12 px-4 pt-24 pb-24">
        {/* Suspense exibe um fallback enquanto o chunk da página é baixado */}
        <Suspense
          fallback={
            <div className="text-primary flex h-full items-center justify-center">
              Carregando...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/maps" element={<MapsView />} />
            <Route path="/maps/:mapId/:view?" element={<MapDetail />} />
            <Route path="/tactics" element={<ComingSoon />} />
            <Route path="/pro-strats" element={<ComingSoon />} />
            <Route path="/training" element={<ComingSoon />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<ComingSoon />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
