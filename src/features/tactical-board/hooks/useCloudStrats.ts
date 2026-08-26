import { useState, useEffect } from 'react';
import type { StratData } from '../types';
import { subscribeToStratsByMap } from '../services/stratsService';

export function useCloudStrats(mapId: string, authorId?: string) {
  const [cloudStrats, setCloudStrats] = useState<StratData[]>([]);
  const [isLoadingStrats, setIsLoadingStrats] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToStratsByMap(mapId, authorId, (strats) => {
      setCloudStrats(strats);
      setIsLoadingStrats(false);
    });

    return () => unsubscribe();
  }, [mapId, authorId]);

  return { cloudStrats, isLoadingStrats };
}


