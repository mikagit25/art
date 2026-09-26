'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, STATUS_LABELS } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_FILTER = [
  { value: '', label: 'Все' },
  { value: 'PENDING_REVIEW', label: 'На модерации' },
  { value: 'PUBLISHED', label: 'Опубликовано' },
  { value: 'DRAFT', label: 'Черновики' },
  { value: 'REMOVED', label: 'Снятые' },
];

export default function AdminArtworksPage() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'artworks', status],
    queryFn: () => adminApi.getAllArtworks({ status: status || undefined }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveArtwork(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin'] }); toast.success('Работа опубликована'); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectArtwork(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin'] }); toast.success('Работа снята'); },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Управление работами</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTER.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${status === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data?.items || []).map((artwork: any) => {
            const image = artwork.images?.[0];
            return (
              <div key={artwork.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {image ? (
                    <Image src={image.thumbUrl || image.url} alt="" width={56} height={56} className="object-cover w-full h-full" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl">🎨</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{artwork.title}</p>
                  <p className="text-sm text-muted-foreground">{artwork.artist?.displayName} • {formatPrice(artwork.price)}</p>
                </div>
                <span className={`badge text-xs hidden sm:flex ${artwork.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' : artwork.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[artwork.status]}
                </span>
                <div className="flex items-center gap-2">
                  {artwork.status === 'PUBLISHED' && (
                    <Link href={`/artwork/${artwork.slug}`} target="_blank" className="p-2 text-muted-foreground hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
                  {artwork.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        onClick={() => approveMutation.mutate(artwork.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Опубликовать"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(artwork.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Отклонить"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {artwork.status === 'PUBLISHED' && (
                    <button
                      onClick={() => rejectMutation.mutate(artwork.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded text-xs"
                      title="Снять с публикации"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {data?.items?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Работ нет</div>
          )}
        </div>
      )}
    </div>
  );
}
