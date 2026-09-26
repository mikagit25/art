'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, BadgeCheck, Share2, ArrowLeft } from 'lucide-react';
import { artworksApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatPrice, artworkDimensions, CATEGORY_LABELS, TYPE_LABELS, STATUS_LABELS } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ArtworkDetail({ slug }: { slug: string }) {
  const { data: artwork, isLoading, refetch } = useQuery({
    queryKey: ['artwork', slug],
    queryFn: () => artworksApi.getBySlug(slug).then((r) => r.data),
  });

  const [activeImage, setActiveImage] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <div className="gallery-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="gallery-container py-20 text-center">
        <h2 className="font-serif text-2xl">Работа не найдена</h2>
        <Link href="/catalog" className="btn-primary mt-4">Вернуться в каталог</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (artwork.isSold) return;
    addItem({
      artworkId: artwork.id,
      title: artwork.title,
      price: parseFloat(artwork.price),
      imageUrl: artwork.images?.[0]?.thumbUrl,
      quantity: 1,
      type: artwork.type,
    });
    toast.success('Добавлено в корзину');
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите чтобы добавить в избранное');
      return;
    }
    try {
      const res = await artworksApi.toggleFavorite(artwork.id);
      setIsFav(res.data.isFavorite);
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Ссылка скопирована');
  };

  const images = artwork.images || [];
  const currentImage = images[activeImage];

  return (
    <div className="gallery-container py-8">
      {/* Back */}
      <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Назад в каталог
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={artwork.title}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🎨</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'aspect-square rounded overflow-hidden border-2 transition-colors',
                    i === activeImage ? 'border-primary' : 'border-border hover:border-primary/50',
                  )}
                >
                  <Image src={img.thumbUrl || img.url} alt="" width={80} height={80} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Category & Type */}
          <div className="flex flex-wrap gap-2 mb-3">
            {artwork.category && (
              <span className="badge-primary">{CATEGORY_LABELS[artwork.category]}</span>
            )}
            <span className="badge bg-muted text-muted-foreground">{TYPE_LABELS[artwork.type]}</span>
            {artwork.isSold && <span className="badge bg-gray-200 text-gray-600">Продано</span>}
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2">{artwork.title}</h1>

          {/* Artist */}
          <Link href={`/artist/${artwork.artist?.slug}`} className="flex items-center gap-2 mb-4 hover:text-primary transition-colors">
            <span className="text-muted-foreground">Автор:</span>
            <span className="font-medium">{artwork.artist?.displayName}</span>
            {artwork.artist?.isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
          </Link>

          {/* Price */}
          <div className="text-3xl font-bold text-primary mb-6">
            {formatPrice(artwork.price, artwork.currency)}
          </div>

          {/* Actions */}
          {!artwork.isSold ? (
            <div className="flex gap-3 mb-8">
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" /> В корзину
              </button>
              <button
                onClick={handleFavorite}
                className={cn('btn-outline p-3', isFav && 'text-red-500 border-red-200')}
              >
                <Heart className={cn('h-5 w-5', isFav && 'fill-current')} />
              </button>
              <button onClick={handleShare} className="btn-outline p-3">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-muted-foreground">Эта работа продана</p>
              <div className="flex gap-3 mt-3">
                <button onClick={handleFavorite} className="btn-outline">
                  <Heart className="h-4 w-4 mr-2" /> В избранное
                </button>
                <button onClick={handleShare} className="btn-outline">
                  <Share2 className="h-4 w-4 mr-2" /> Поделиться
                </button>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3 border-t border-border pt-6">
            {artwork.description && (
              <div>
                <h3 className="font-medium text-sm mb-1">Описание</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{artwork.description}</p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {artwork.technique && (
                <>
                  <dt className="text-muted-foreground">Техника</dt>
                  <dd>{artwork.technique}</dd>
                </>
              )}
              {artwork.materials && (
                <>
                  <dt className="text-muted-foreground">Материалы</dt>
                  <dd>{artwork.materials}</dd>
                </>
              )}
              {(artwork.width || artwork.height) && (
                <>
                  <dt className="text-muted-foreground">Размер</dt>
                  <dd>{artworkDimensions(artwork)}</dd>
                </>
              )}
              {artwork.year && (
                <>
                  <dt className="text-muted-foreground">Год</dt>
                  <dd>{artwork.year}</dd>
                </>
              )}
              {artwork.style && (
                <>
                  <dt className="text-muted-foreground">Стиль</dt>
                  <dd>{artwork.style}</dd>
                </>
              )}
              {artwork.hasCertificate && (
                <>
                  <dt className="text-muted-foreground">Сертификат</dt>
                  <dd>✓ Прилагается</dd>
                </>
              )}
              {artwork.tags?.length > 0 && (
                <>
                  <dt className="text-muted-foreground">Теги</dt>
                  <dd className="flex flex-wrap gap-1">
                    {artwork.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/catalog?search=${tag}`}
                        className="text-xs bg-muted px-2 py-0.5 rounded-full hover:bg-accent"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
