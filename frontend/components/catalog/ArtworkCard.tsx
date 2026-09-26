'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { formatPrice, CATEGORY_LABELS, TYPE_LABELS } from '@/lib/utils';
import { artworksApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ArtworkCardProps {
  artwork: any;
  onFavoriteChange?: () => void;
}

export function ArtworkCard({ artwork, onFavoriteChange }: ArtworkCardProps) {
  const [isFav, setIsFav] = useState(artwork.isFavorite || false);
  const [favLoading, setFavLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const image = artwork.images?.[0];
  const imageUrl = image?.thumbUrl || image?.url;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Войдите чтобы добавить в избранное');
      return;
    }
    setFavLoading(true);
    try {
      const res = await artworksApi.toggleFavorite(artwork.id);
      setIsFav(res.data.isFavorite);
      onFavoriteChange?.();
    } catch {
      toast.error('Ошибка');
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (artwork.isSold) return;
    addItem({
      artworkId: artwork.id,
      title: artwork.title,
      price: parseFloat(artwork.price),
      imageUrl,
      quantity: 1,
      type: artwork.type,
    });
    toast.success('Добавлено в корзину');
  };

  return (
    <Link href={`/artwork/${artwork.slug}`} className="artwork-card block">
      <div className="artwork-card-image">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl">🎨</span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleFavorite}
              disabled={favLoading}
              className={cn(
                'p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm',
                isFav && 'text-red-500',
              )}
            >
              <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
            </button>
            {!artwork.isSold && (
              <button
                onClick={handleAddToCart}
                className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {artwork.isSold && (
            <span className="badge bg-gray-900/80 text-white text-xs">Продано</span>
          )}
          {artwork.type !== 'ORIGINAL' && (
            <span className="badge bg-primary/90 text-white text-xs">
              {TYPE_LABELS[artwork.type]}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{artwork.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {artwork.artist?.displayName}
            </p>
          </div>
          <p className="font-semibold text-sm text-primary whitespace-nowrap">
            {formatPrice(artwork.price, artwork.currency)}
          </p>
        </div>
        {artwork.category && (
          <p className="text-xs text-muted-foreground mt-1">
            {CATEGORY_LABELS[artwork.category]}
          </p>
        )}
      </div>
    </Link>
  );
}
