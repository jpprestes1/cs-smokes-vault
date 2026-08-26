import { useState, useEffect, useMemo } from 'react';
import type { StratData } from '../types';
import {
  subscribeToAllPublicStrats,
  deleteStrat as deleteStratService,
} from '../services/stratsService';

export type CommunityTab = 'community' | 'my_strats';
export type CommunitySideFilter = 'ALL' | 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED';
export type CommunitySort = 'newest' | 'oldest' | 'title' | 'complexity';

interface UseCommunityStratsProps {
  currentUserId?: string;
  initialMapId?: string;
}

export function useCommunityStrats({
  currentUserId,
  initialMapId = 'all',
}: UseCommunityStratsProps = {}) {
  const [allStrats, setAllStrats] = useState<StratData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro
  const [selectedMapId, setSelectedMapId] = useState<string>(initialMapId);
  const [selectedSide, setSelectedSide] = useState<CommunitySideFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CommunityTab>('community');
  const [sortBy, setSortBy] = useState<CommunitySort>('newest');

  // Inscrição em tempo real
  useEffect(() => {
    const unsubscribe = subscribeToAllPublicStrats(
      (strats) => {
        setAllStrats(strats);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Contagem de táticas por mapa e por aba
  const mapCounts = useMemo(() => {
    const baseList =
      activeTab === 'my_strats'
        ? allStrats.filter((s) => s.authorId === currentUserId)
        : allStrats.filter((s) => s.isPublic !== false);

    const counts: Record<string, number> = { all: baseList.length };
    for (const strat of baseList) {
      if (strat.mapId) {
        counts[strat.mapId] = (counts[strat.mapId] || 0) + 1;
      }
    }
    return counts;
  }, [activeTab, allStrats, currentUserId]);

  const publicStratsCount = useMemo(() => {
    return allStrats.filter((s) => s.isPublic !== false).length;
  }, [allStrats]);

  const myStratsCount = useMemo(() => {
    return currentUserId ? allStrats.filter((s) => s.authorId === currentUserId).length : 0;
  }, [allStrats, currentUserId]);

  // Contagem de criadores únicos
  const creatorsCount = useMemo(() => {
    const uniqueCreators = new Set(
      allStrats
        .filter((s) => s.isPublic !== false)
        .map((s) => s.authorId || s.authorEmail)
        .filter(Boolean)
    );
    return uniqueCreators.size;
  }, [allStrats]);

  // Filtragem e Ordenação
  const filteredStrats = useMemo(() => {
    return allStrats
      .filter((strat) => {
        // Filtro por Aba (Comunidade vs Minhas Táticas)
        if (activeTab === 'community') {
          // Na aba pública da comunidade, NUNCA exibe táticas privadas
          if (strat.isPublic === false) {
            return false;
          }
        } else if (activeTab === 'my_strats') {
          // Na aba pessoal, exibe apenas táticas criadas pelo usuário logado
          if (!currentUserId || strat.authorId !== currentUserId) {
            return false;
          }
        }

        // Filtro por Mapa
        if (selectedMapId !== 'all' && strat.mapId !== selectedMapId) {
          return false;
        }

        // Filtro por Lado
        if (selectedSide !== 'ALL') {
          if (strat.side !== selectedSide) {
            return false;
          }
        }

        // Filtro por Busca Textual
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = strat.title.toLowerCase().includes(query);
          const matchDesc = (strat.description || '').toLowerCase().includes(query);
          const matchAuthor = (strat.authorEmail || '').toLowerCase().includes(query);
          const matchMap = strat.mapId.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchAuthor && !matchMap) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        if (sortBy === 'oldest') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'complexity') {
          // Complexidade: número total de entidades + paths somados em todos os frames
          const countA =
            (a.frames || []).reduce(
              (acc, f) => acc + (f.entities?.length || 0) + (f.paths?.length || 0),
              0
            ) || (a.entities?.length || 0) + (a.paths?.length || 0);
          const countB =
            (b.frames || []).reduce(
              (acc, f) => acc + (f.entities?.length || 0) + (f.paths?.length || 0),
              0
            ) || (b.entities?.length || 0) + (b.paths?.length || 0);
          return countB - countA;
        }
        return 0;
      });
  }, [allStrats, activeTab, currentUserId, selectedMapId, selectedSide, searchQuery, sortBy]);

  // Exclusão de Tática
  const handleDeleteStrat = async (stratId: string): Promise<boolean> => {
    try {
      await deleteStratService(stratId);
      return true;
    } catch (err) {
      console.error('Erro ao excluir estratégia da comunidade:', err);
      return false;
    }
  };

  const resetFilters = () => {
    setSelectedMapId('all');
    setSelectedSide('ALL');
    setSearchQuery('');
    setSortBy('newest');
  };

  return {
    allStrats,
    filteredStrats,
    totalCount: publicStratsCount,
    publicStratsCount,
    myStratsCount,
    filteredCount: filteredStrats.length,
    mapCounts,
    creatorsCount,
    isLoading,
    error,
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
  };
}
