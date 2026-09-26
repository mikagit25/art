'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { artworksApi } from '@/lib/api';
import { formatPrice, STATUS_LABELS } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  SOLD: 'bg-blue-100 text-blue-700',
  REMOVED: 'bg-red-100 text-red-700',
};

export default function DashboardArtworksPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-artworks'],
    queryFn: () => artworksApi.getMy().then((r) => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => artworksApi.updateStatus(id, 'PENDING_REVIEW'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-artworks'] });
      toast.success('Работа отправлена на модерацию');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Мои работы</h1>
        <Link href="/dashboard/artworks/new" className="btn-primary py-2 px-4 text-sm">
          <Plus className="h-4 w-4 mr-1" /> Добавить
        </Link>
      </div>

      {!data?.items?.length ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-4">🎨</p>
          <h3 className="font-serif text-xl font-medium mb-2">Нет работ</h3>
          <p className="text-muted-foreground mb-6">Добавьте первую работу в галерею</p>
          <Link href="/dashboard/artworks/new" className="btn-primary">
            Добавить работу
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((artwork: any) => {
            const image = artwork.images?.[0];
            return (
              <div key={artwork.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {image ? (
                    <Image src={image.thumbUrl || image.url} alt={artwork.title} width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{artwork.title}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(artwork.price, artwork.currency)}</p>
                </div>

                <span className={`badge ${STATUS_CLASSES[artwork.status] || 'bg-muted'} hidden sm:flex`}>
                  {STATUS_LABELS[artwork.status]}
                </span>

                <div className="flex items-center gap-2">
                  {artwork.status === 'DRAFT' && (
                    <button
                      onClick={() => submitMutation.mutate(artwork.id)}
                      className="text-xs btn-outline py-1 px-3"
                    >
                      На модерацию
                    </button>
                  )}
                  {artwork.status === 'PUBLISHED' && (
                    <Link href={`/artwork/${artwork.slug}`} className="p-2 text-muted-foreground hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
                  <Link href={`/dashboard/artworks/${artwork.id}/edit`} className="p-2 text-muted-foreground hover:text-primary">
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
