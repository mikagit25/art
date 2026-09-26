'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { artistsApi } from '@/lib/api';

export function FeaturedArtists() {
  const { data: artists } = useQuery({
    queryKey: ['artists', 'featured'],
    queryFn: () => artistsApi.getFeatured().then((r) => r.data),
  });

  if (!artists || artists.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl font-bold">Художники</h2>
          <p className="text-muted-foreground mt-1">Мастера, чьи работы представлены в галерее</p>
        </div>
        <Link href="/artists" className="text-sm text-primary hover:underline flex items-center gap-1">
          Все художники <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {artists.slice(0, 8).map((artist: any) => (
          <Link
            key={artist.id}
            href={`/artist/${artist.slug}`}
            className="group text-center"
          >
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-primary transition-colors">
              {artist.avatarUrl ? (
                <Image
                  src={artist.avatarUrl}
                  alt={artist.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-amber-100 to-orange-200">
                  🎨
                </div>
              )}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-center gap-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {artist.displayName}
                </p>
                {artist.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              {artist._count && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {artist._count.artworks} работ
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
