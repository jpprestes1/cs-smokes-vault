import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/hooks/useAuth';
import { mapsDatabase } from '../features/maps/data/maps';
import {
  useCommunityStrats,
  type CommunitySideFilter,
  type CommunitySort,
} from '../features/tactical-board/hooks/useCommunityStrats';
import StratCard from '../features/tactical-board/components/StratCard';
import StratCardSkeleton from '../features/tactical-board/components/StratCardSkeleton';
import type { StratData } from '../features/tactical-board/types';

export default function StratCommunity() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMap = searchParams.get('map') || 'all';

  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    filteredStrats,
    totalCount,
    publicStratsCount,
    myStratsCount,
    mapCounts,
    creatorsCount,
    isLoading,
    selectedMapId,
    setSelectedMapId,
    selectedSide,
    setSelectedSide,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    resetFilters,
    handleDeleteStrat,
  } = useCommunityStrats({
    currentUserId: user?.uid,
    initialMapId: initialMap,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenStrat = (strat: StratData) => {
    navigate(`/strat-board/editor/${strat.mapId}?stratId=${strat.id}`);
  };

  const handleShareStrat = (strat: StratData) => {
    const shareUrl = `${window.location.origin}/strat-board/editor/${strat.mapId}?stratId=${strat.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast(
          t('tacticalBoard.linkCopied', 'Link da tática copiado para a área de transferência!')
        );
      })
      .catch(() => {
        showToast(shareUrl);
      });
  };

  const handleDelete = async (stratId: string, title: string) => {
    if (window.confirm(t('tacticalBoard.deleteConfirm', { title }))) {
      const ok = await handleDeleteStrat(stratId);
      if (ok) {
        showToast(t('tacticalBoard.stratDeleted', 'Estratégia excluída com sucesso!'));
      } else {
        showToast(t('tacticalBoard.deleteError', 'Erro ao excluir estratégia.'));
      }
    }
  };

  const handleOpenEditor = () => {
    if (selectedMapId && selectedMapId !== 'all') {
      navigate(`/strat-board/editor/${selectedMapId}`);
    } else {
      navigate('/strat-board/editor/mirage');
    }
  };

  const sideOptions: { value: CommunitySideFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: t('maps.sideAll', 'Todos os Lados'), icon: 'groups' },
    {
      value: 'TERRORIST',
      label: t('maps.sideT', 'Terrorista (TR)'),
      icon: 'security_update_warning',
    },
    {
      value: 'COUNTER-TERRORIST',
      label: t('maps.sideCt', 'Contra-Terrorista (CT)'),
      icon: 'shield',
    },
    { value: 'MIXED', label: t('tacticalBoard.bothSides', 'Misto / Ambos'), icon: 'shuffle' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col gap-8 duration-500">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-surface-container-highest border-primary text-primary font-data-label text-data-label tactical-glass animate-in fade-in slide-in-from-top-4 fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-sm border px-4 py-2 shadow-2xl duration-200">
          <span className="mr-2">●</span> {toastMessage}
        </div>
      )}

      {/* Hero / Header Tático */}
      <section className="bg-surface-container-low/90 border-outline-variant tactical-glass relative flex flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-2xl md:p-8">
        {/* Detalhes HUD de Fundo */}
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-primary border-primary/30 font-data-label rounded-xs border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                STRAT VAULT // COMMUNITY
              </span>
              <span className="bg-surface-variant text-on-surface-variant font-data-label rounded-xs px-2 py-0.5 text-[10px] font-bold uppercase">
                LIVE PLAYBOOKS
              </span>
            </div>

            <h1 className="font-display-lg text-primary md:text-display-lg text-3xl font-extrabold tracking-tight uppercase">
              {t('tacticalBoard.communityHubTitle', 'CENTRAL COMUNITÁRIA // STRAT BOARD')}
            </h1>

            <p className="font-body-base text-on-surface-variant text-sm leading-relaxed md:text-base">
              {t(
                'tacticalBoard.communityHubSubtitle',
                'Explore, aprenda e execute táticas coordenadas criadas pela comunidade de CS2. Visualize rotas com timeline, reproduza rounds e monte o seu próprio playbook.'
              )}
            </p>

            {/* Métricas Rápidas HUD */}
            <div className="font-data-label text-on-surface mt-3 flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-surface-variant/30 flex items-center gap-2 rounded-sm border border-white/5 px-3 py-1.5">
                <span className="material-symbols-outlined text-primary text-base">
                  folder_open
                </span>
                <span>
                  <strong className="text-primary">{totalCount}</strong>{' '}
                  {t('tacticalBoard.stratsCount', 'Táticas Públicas')}
                </span>
              </div>

              <div className="bg-surface-variant/30 flex items-center gap-2 rounded-sm border border-white/5 px-3 py-1.5">
                <span className="material-symbols-outlined text-secondary text-base">person</span>
                <span>
                  <strong className="text-secondary">{creatorsCount}</strong>{' '}
                  {t('tacticalBoard.creatorsCount', 'Criadores')}
                </span>
              </div>

              <div className="bg-surface-variant/30 flex items-center gap-2 rounded-sm border border-white/5 px-3 py-1.5">
                <span className="material-symbols-outlined text-base text-amber-400">public</span>
                <span>
                  <strong className="text-amber-400">8</strong> {t('maps.allMaps', 'Mapas')}
                </span>
              </div>
            </div>
          </div>

          {/* Botão CTA Principal: Abrir Strat Board */}
          <div className="flex shrink-0 flex-col gap-2">
            <button
              onClick={handleOpenEditor}
              className="bg-primary text-on-primary font-headline-md hover:bg-primary-container flex items-center justify-center gap-2.5 rounded-lg px-6 py-4 text-sm font-black tracking-wider uppercase shadow-[0_0_20px_rgba(246,174,45,0.3)] transition-all duration-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">draw</span>
              <span>{t('tacticalBoard.openInteractiveBoard', 'ABRIR STRAT BOARD')}</span>
            </button>
            <span className="text-on-surface-variant font-data-label text-center text-[10px] uppercase">
              {t(
                'tacticalBoard.openInteractiveBoardSub',
                'Crie novas táticas ou edite no quadro interativo'
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Seletor de Abas: Todas as Táticas vs Minhas Táticas */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="bg-surface-container-highest flex rounded-lg p-1">
          <button
            onClick={() => setActiveTab('community')}
            className={`font-data-label flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold uppercase transition-all ${
              activeTab === 'community'
                ? 'bg-primary text-on-primary shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">public</span>
            {t('tacticalBoard.allCommunityStrats', 'Táticas da Comunidade')}
            <span className="py-0.2 rounded bg-black/20 px-1.5 text-[10px]">
              {publicStratsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my_strats')}
            className={`font-data-label flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold uppercase transition-all ${
              activeTab === 'my_strats'
                ? 'bg-primary text-on-primary shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">bookmark</span>
            {t('tacticalBoard.mySavedStrats', 'Minhas Táticas')}
            {user && (
              <span className="py-0.2 rounded bg-black/20 px-1.5 text-[10px]">{myStratsCount}</span>
            )}
          </button>
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <span className="font-data-label text-on-surface-variant text-xs uppercase">
            {t('tacticalBoard.sortBy', 'Ordenar')}:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CommunitySort)}
            className="bg-surface-container-high border-outline-variant text-on-surface font-data-label focus:border-primary rounded-sm border px-3 py-1.5 text-xs transition-colors outline-none"
          >
            <option value="newest">{t('tacticalBoard.sortNewest', 'Mais Recentes')}</option>
            <option value="oldest">{t('tacticalBoard.sortOldest', 'Mais Antigas')}</option>
            <option value="complexity">
              {t('tacticalBoard.sortComplexity', 'Mais Complexas')}
            </option>
            <option value="title">{t('tacticalBoard.sortTitle', 'Ordem Alfabética (A-Z)')}</option>
          </select>
        </div>
      </div>

      {/* Barra de Filtros: Mapas, Lado e Busca Textual */}
      <section className="flex flex-col gap-4">
        {/* Seletor de Mapa em Chips com Contadores */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedMapId('all')}
            className={`font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-bold uppercase transition-all ${
              selectedMapId === 'all'
                ? 'bg-primary text-on-primary border-primary shadow-[0_0_10px_rgba(246,174,45,0.3)]'
                : 'bg-surface-container text-on-surface-variant hover:border-primary/40 hover:text-on-surface border-white/5'
            }`}
          >
            <span>{t('maps.allMaps', 'TODOS OS MAPAS')}</span>
            <span className="py-0.2 rounded bg-black/20 px-1.5 text-[10px]">
              {mapCounts['all'] || 0}
            </span>
          </button>

          {mapsDatabase.map((map) => {
            const count = mapCounts[map.id] || 0;
            const isSelected = selectedMapId === map.id;
            return (
              <button
                key={map.id}
                onClick={() => setSelectedMapId(map.id)}
                className={`font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-[0_0_10px_rgba(246,174,45,0.3)]'
                    : 'bg-surface-container text-on-surface-variant hover:border-primary/40 hover:text-on-surface border-white/5'
                }`}
              >
                <span>{map.name}</span>
                <span
                  className={`py-0.2 rounded px-1.5 text-[10px] ${isSelected ? 'bg-black/20' : 'bg-surface-variant/40 text-on-surface-variant'}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Linha com Busca Textual e Filtro de Lado */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'tacticalBoard.searchStratsPlaceholder',
                'Buscar tática por título, descrição, autor...'
              )}
              className="bg-surface-container border-outline-variant text-on-surface placeholder-on-surface-variant/50 focus:border-primary font-data-label w-full rounded-sm border py-2.5 pr-8 pl-10 text-xs transition-colors outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-on-surface-variant hover:text-on-surface absolute top-1/2 right-3 -translate-y-1/2"
                title={t('common.clear', 'Limpar')}
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Filtros de Lado (TR / CT / Misto) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {sideOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedSide(opt.value)}
                className={`font-data-label flex items-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-bold uppercase transition-all ${
                  selectedSide === opt.value
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-surface-container text-on-surface-variant border-white/5 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Táticas da Comunidade */}
      <section className="flex flex-col gap-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <StratCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : filteredStrats.length === 0 ? (
          /* Estado Vazio */
          <div className="bg-surface-container-low tactical-glass flex flex-col items-center justify-center gap-4 rounded-xl border border-white/5 py-16 text-center shadow-lg">
            <div className="bg-surface-variant/40 text-primary flex h-16 w-16 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-3xl">filter_alt_off</span>
            </div>

            <div className="flex max-w-md flex-col gap-1">
              <h3 className="font-headline-md text-on-surface text-lg font-bold uppercase">
                {activeTab === 'my_strats' && !user
                  ? t(
                      'tacticalBoard.loginRequiredForMyStrats',
                      'Faça login para ver suas táticas salvas'
                    )
                  : t('tacticalBoard.noStratsFound', 'Nenhuma estratégia encontrada')}
              </h3>
              <p className="font-body-base text-on-surface-variant text-xs">
                {activeTab === 'my_strats' && !user
                  ? t(
                      'tacticalBoard.loginRequiredDesc',
                      'Conecte-se com sua conta para acessar seu cofre pessoal de jogadas e rounds.'
                    )
                  : t(
                      'tacticalBoard.noStratsFoundDesc',
                      'Tente alterar os filtros de mapa, lado ou o termo de busca, ou crie a primeira estratégia no Strat Board.'
                    )}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-3">
              {searchQuery || selectedMapId !== 'all' || selectedSide !== 'ALL' ? (
                <button
                  onClick={resetFilters}
                  className="bg-surface-variant text-on-surface font-data-label hover:bg-surface-variant/80 rounded px-4 py-2 text-xs font-bold uppercase transition-colors"
                >
                  {t('tacticalBoard.clearFilters', 'Limpar Filtros')}
                </button>
              ) : null}

              {activeTab === 'my_strats' && !user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary text-on-primary font-headline-md rounded px-5 py-2.5 text-xs font-bold uppercase transition-all active:scale-95"
                >
                  {t('nav.login', 'Entrar')}
                </button>
              ) : (
                <button
                  onClick={handleOpenEditor}
                  className="bg-primary text-on-primary font-headline-md flex items-center gap-1.5 rounded px-5 py-2.5 text-xs font-bold uppercase transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  {t('tacticalBoard.createFirstStrat', 'Criar Nova Tática')}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Grid de Cards */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredStrats.map((strat) => (
              <StratCard
                key={strat.id}
                strat={strat}
                currentUserId={user?.uid}
                isAdmin={isAdmin}
                onOpen={handleOpenStrat}
                onShare={handleShareStrat}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
