'use client';

import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtworkCard } from '@/components/catalog/ArtworkCard';
import { artworksApi } from '@/lib/api';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => artworksApi.getFavorites().then((r) => r.data),
  });

  return (
    <MainLayout>
      <div className="gallery-container py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Избранное</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : !data?.length ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Избранное пусто</h2>
            <p className="text-muted-foreground mb-6">Добавляйте понравившиеся работы</p>
            <Link href="/catalog" className="btn-primary">В каталог</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((item: any) => (
              <ArtworkCard key={item.id} artwork={{ ...item.artwork, isFavorite: true }} onFavoriteChange={() => refetch()} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
