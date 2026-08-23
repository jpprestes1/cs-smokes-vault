import { useState, useEffect } from 'react';
import type { StratData } from '../types';
import { subscribeToStratsByMap } from '../services/stratsService';

export function useCloudStrats(mapId: string) {
  const [cloudStrats, setCloudStrats] = useState<StratData[]>([]);
  const [isLoadingStrats, setIsLoadingStrats] = useState(true);

  useEffect(() => {
    if (!mapId) return;

    const unsubscribe = subscribeToStratsByMap(mapId, (strats) => {
      setCloudStrats(strats);
      setIsLoadingStrats(false);
    });

    return () => unsubscribe();
  }, [mapId]);

  return { cloudStrats, isLoadingStrats };
}
