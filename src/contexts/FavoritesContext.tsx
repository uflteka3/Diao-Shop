'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'diaoshop.favorites.v1';

interface FavoritesContextValue {
  ids: string[];
  count: number;
  hydrated: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      // Stockage indisponible — favoris vides.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Stockage indisponible — état conservé en mémoire.
    }
  }, [ids]);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);
  const toggle = useCallback(
    (productId: string) =>
      setIds((prev) => (prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId])),
    []
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ ids, count: ids.length, hydrated, has, toggle }),
    [ids, hydrated, has, toggle]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites doit être utilisé dans FavoritesProvider');
  return ctx;
}
