'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { artworksApi } from '@/lib/api';
import { ArtworkCard } from '@/components/catalog/ArtworkCard';

export function FeaturedArtworks() {
  const { data: newArtworks } = useQuery({
    queryKey: ['artworks', 'new'],
    queryFn: () => artworksApi.getNew().then((r) => r.data),
  });

  const { data: popularArtworks } = useQuery({
    queryKey: ['artworks', 'popular'],
    queryFn: () => artworksApi.getPopular().then((r) => r.data),
  });

  return (
    <>
      {/* New artworks */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold">Новинки</h2>
            <p className="text-muted-foreground mt-1">Свежие работы художников</p>
          </div>
          <Link href="/catalog?sortBy=date" className="text-sm text-primary hover:underline flex items-center gap-1">
            Все работы <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(newArtworks || []).slice(0, 8).map((artwork: any) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
          {(!newArtworks || newArtworks.length === 0) && (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              Работы скоро появятся
            </div>
          )}
        </div>
      </section>

      {/* Popular artworks */}
      {popularArtworks && popularArtworks.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold">Популярное</h2>
              <p className="text-muted-foreground mt-1">Самые просматриваемые работы</p>
            </div>
            <Link href="/catalog?sortBy=popular" className="text-sm text-primary hover:underline flex items-center gap-1">
              Все работы <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularArtworks.slice(0, 8).map((artwork: any) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
