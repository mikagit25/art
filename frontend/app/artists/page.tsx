'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { artistsApi } from '@/lib/api';

export default function ArtistsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['artists', search],
    queryFn: () => artistsApi.getAll({ search: search || undefined }).then((r) => r.data),
  });

  return (
    <MainLayout>
      <div className="gallery-container py-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Художники</h1>
            <p className="text-muted-foreground mt-1">Мастера, представленные в галерее</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск художника..."
              className="input-field pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
                <div className="h-4 bg-muted rounded mt-3 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(data?.items || []).map((artist: any) => (
              <Link key={artist.id} href={`/artist/${artist.slug}`} className="group text-center">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors bg-muted">
                  {artist.avatarUrl ? (
                    <Image src={artist.avatarUrl} alt={artist.displayName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-amber-100 to-orange-200">
                      🎨
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {artist.displayName}
                    </p>
                    {artist.isVerified && <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />}
                  </div>
                  {artist.specialization?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate px-2">
                      {artist.specialization.slice(0, 2).join(', ')}
                    </p>
                  )}
                  {artist._count?.artworks !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">{artist._count.artworks} работ</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {data?.total === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎨</p>
            <h3 className="font-serif text-xl">Художники не найдены</h3>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
