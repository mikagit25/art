'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="gallery-container py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">Корзина пуста</h2>
          <p className="text-muted-foreground mb-6">Добавьте работы из каталога</p>
          <Link href="/catalog" className="btn-primary">В каталог</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="gallery-container py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.artworkId} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                  {item.type === 'ORIGINAL' && (
                    <p className="text-xs text-muted-foreground mt-1">Оригинальная работа — 1 экз.</p>
                  )}
                </div>
                {item.type !== 'ORIGINAL' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.artworkId, item.quantity - 1)} className="p-1 hover:bg-muted rounded">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.artworkId, item.quantity + 1)} className="p-1 hover:bg-muted rounded">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button onClick={() => removeItem(item.artworkId)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border p-6 h-fit">
            <h2 className="font-medium mb-4">Итого</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.artworkId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{item.title}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Итого</span>
                <span className="text-primary">{formatPrice(totalPrice())}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full">
              Оформить заказ
            </Link>
            <button onClick={clearCart} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-destructive">
              Очистить корзину
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
