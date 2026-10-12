"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/api";
import { effectivePrice, primaryImage } from "@/lib/api";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unitSize: string;
  image: string;
  price: number; // display only — server recalculates at checkout
  stock: number;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (p: Product, qty?: number) => { ok: boolean; message?: string };
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  ready: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "krishi-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((p: Product, qty = 1) => {
    if (p.stockQuantity <= 0) return { ok: false, message: "পণ্যটি স্টকে নেই" };
    let result: { ok: boolean; message?: string } = { ok: true };
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      const nextQty = Math.min((existing?.quantity ?? 0) + qty, p.stockQuantity);
      if ((existing?.quantity ?? 0) + qty > p.stockQuantity) {
        result = { ok: true, message: `সর্বোচ্চ ${p.stockQuantity}টি যোগ করা সম্ভব` };
      }
      const line: CartLine = {
        productId: p.id,
        slug: p.slug,
        name: p.nameBn,
        unitSize: p.unitSize,
        image: primaryImage(p),
        price: effectivePrice(p),
        stock: p.stockQuantity,
        quantity: nextQty,
      };
      return existing ? prev.map((l) => (l.productId === p.id ? line : l)) : [...prev, line];
    });
    return result;
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.max(0, Math.min(qty, l.stock)) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((id: string) => setLines((p) => p.filter((l) => l.productId !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      add,
      setQty,
      remove,
      clear,
      ready,
    }),
    [lines, add, setQty, remove, clear, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
