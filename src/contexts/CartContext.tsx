'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { CartItem } from '@/lib/data/types';

const STORAGE_KEY = 'diaoshop.cart.v1';

type CartAction =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD'; item: CartItem; maxQty: number }
  | { type: 'REMOVE'; productId: string; size: string }
  | { type: 'QTY'; productId: string; size: string; quantity: number }
  | { type: 'CLEAR' };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.items;
    case 'ADD': {
      const i = state.findIndex(
        (x) => x.productId === action.item.productId && x.size === action.item.size
      );
      if (i >= 0) {
        const copy = [...state];
        const cur = copy[i];
        copy[i] = { ...cur, quantity: Math.min(cur.quantity + action.item.quantity, action.maxQty) };
        return copy;
      }
      return [...state, action.item];
    }
    case 'REMOVE':
      return state.filter((x) => !(x.productId === action.productId && x.size === action.size));
    case 'QTY':
      return state.map((x) =>
        x.productId === action.productId && x.size === action.size
          ? { ...x, quantity: Math.max(1, action.quantity) }
          : x
      );
    case 'CLEAR':
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: CartItem, maxQty?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [] as CartItem[]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) as CartItem[] });
    } catch {
      // Stockage indisponible — le panier démarre vide.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Stockage indisponible — état conservé en mémoire.
    }
  }, [items]);

  const addItem = useCallback(
    (item: CartItem, maxQty = 99) => dispatch({ type: 'ADD', item, maxQty }),
    []
  );
  const removeItem = useCallback(
    (productId: string, size: string) => dispatch({ type: 'REMOVE', productId, size }),
    []
  );
  const updateQty = useCallback(
    (productId: string, size: string, quantity: number) =>
      dispatch({ type: 'QTY', productId, size, quantity }),
    []
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      hydrated,
      addItem,
      removeItem,
      updateQty,
      clear,
    }),
    [items, hydrated, addItem, removeItem, updateQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
}
