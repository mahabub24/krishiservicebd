'use client';

import { useState } from 'react';
import { Product } from '@/lib/api';
import { useCart } from '@/features/cart/CartContext';
import { ShoppingCart, Zap, Plus, Minus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProductBuySection({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    const res = add(product, qty);
    if (res.ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    add(product, qty);
    router.push('/checkout');
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">পরিমাণ:</span>
        <div className="flex items-center rounded-lg border border-gray-200">
          <button
            type="button"
            disabled={qty <= 1 || outOfStock}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
          <button
            type="button"
            disabled={qty >= product.stockQuantity || outOfStock}
            onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
            className="p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="btn-outline flex-1 !py-3 text-base"
        >
          {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          {added ? 'কার্টে যোগ করা হয়েছে' : 'কার্টে যোগ করুন'}
        </button>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleBuyNow}
          className="btn-primary flex-1 !py-3 text-base"
        >
          <Zap className="h-5 w-5" />
          এখনই অর্ডার করুন
        </button>
      </div>
    </div>
  );
}
