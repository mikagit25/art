'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Instagram, Facebook, Send, Globe, Youtube } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtworkCard } from '@/components/catalog/ArtworkCard';
import { artistsApi, artworksApi } from '@/lib/api';

const SOCIAL_ICONS: any = {
  instagram: { label: 'Instagram', icon: Instagram },
  facebook: { label: 'Facebook', icon: Facebook },
  telegram: { label: 'Telegram', icon: Send },
  youtube: { label: 'YouTube', icon: Youtube },
  website: { label: 'Сайт', icon: Globe },
};

export default function ArtistPage({ params }: { params: { slug: string } }) {
  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', params.slug],
    queryFn: () => artistsApi.getBySlug(params.slug).then((r) => r.data),
  });

  const { data: artworksData } = useQuery({
    queryKey: ['artworks', 'artist', artist?.id],
    queryFn: () => artworksApi.getAll({ artistId: artist.id, limit: 24 }).then((r) => r.data),
    enabled: !!artist?.id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="gallery-container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-8 w-48 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!artist) {
    return (
      <MainLayout>
        <div className="gallery-container py-20 text-center">
          <h2 className="font-serif text-2xl">Художник не найден</h2>
          <Link href="/artists" className="btn-primary mt-4">К художникам</Link>
        </div>
      </MainLayout>
    );
  }

  const socials = ['instagram', 'facebook', 'telegram', 'youtube', 'vk', 'pinterest', 'tiktok', 'website'];

  return (
    <MainLayout>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-amber-100 to-orange-200 overflow-hidden">
        {artist.coverUrl && (
          <Image src={artist.coverUrl} alt="Cover" fill className="object-cover" />
        )}
      </div>

      <div className="gallery-container">
        {/* Profile header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted shadow-lg">
              {artist.avatarUrl ? (
                <Image src={artist.avatarUrl} alt={artist.displayName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-amber-100 to-orange-200">
                  🎨
                </div>
              )}
            </div>
            <div className="mt-16 sm:mt-10">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-bold">{artist.displayName}</h1>
                {artist.isVerified && <BadgeCheck className="h-6 w-6 text-primary" />}
              </div>
              {artist.specialization?.length > 0 && (
                <p className="text-muted-foreground mt-1">{artist.specialization.join(', ')}</p>
              )}
              {/* Social links */}
              <div className="flex gap-3 mt-3">
                {socials.map((s) => {
                  const url = artist[s];
                  if (!url) return null;
                  const Icon = SOCIAL_ICONS[s]?.icon || Globe;
                  return (
                    <a
                      key={s}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={SOCIAL_ICONS[s]?.label || s}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-xl font-semibold mb-3">О художнике</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{artist.bio}</p>
          </div>
        )}

        {/* Stats */}
        {artist.stats && (
          <div className="flex gap-8 mb-10 pb-8 border-b border-border">
            <div>
              <p className="font-serif text-2xl font-bold">{artist._count?.artworks || 0}</p>
              <p className="text-xs text-muted-foreground">Работ</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold">{artist.stats.totalSales}</p>
              <p className="text-xs text-muted-foreground">Продаж</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold">{artist.viewCount || 0}</p>
              <p className="text-xs text-muted-foreground">Просмотров</p>
            </div>
          </div>
        )}

        {/* Artworks */}
        <div>
          <h2 className="font-serif text-2xl font-bold mb-6">Работы</h2>
          {artworksData?.items?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworksData.items.map((artwork: any) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-3xl mb-3">🎨</p>
              Работы пока не опубликованы
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
