'use client';

import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const store = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    ...store,
    isReady: mounted && store.isHydrated,
  };
};