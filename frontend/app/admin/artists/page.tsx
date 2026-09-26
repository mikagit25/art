'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X, BadgeCheck } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

const STATUS_CLASSES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает',
  ACTIVE: 'Активен',
  SUSPENDED: 'Заблокирован',
};

export default function AdminArtistsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'artists'],
    queryFn: () => adminApi.getAllArtists().then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveArtist(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin'] }); toast.success('Художник одобрен'); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectArtist(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin'] }); toast.success('Художник заблокирован'); },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Художники</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data?.items || []).map((artist: any) => (
            <div key={artist.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {artist.avatarUrl ? (
                  <Image src={artist.avatarUrl} alt="" width={48} height={48} className="object-cover" />
                ) : <div className="w-full h-full flex items-center justify-center text-lg">🎨</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium">{artist.displayName}</p>
                  {artist.isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{artist.user?.email} • {artist._count?.artworks} работ</p>
              </div>
              <span className={`badge text-xs ${STATUS_CLASSES[artist.status]}`}>
                {STATUS_LABELS[artist.status]}
              </span>
              <div className="flex items-center gap-2">
                <Link href={`/artist/${artist.slug}`} target="_blank" className="text-xs text-muted-foreground hover:text-primary">
                  Профиль
                </Link>
                {artist.status === 'PENDING' && (
                  <>
                    <button onClick={() => approveMutation.mutate(artist.id)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => rejectMutation.mutate(artist.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
                {artist.status === 'ACTIVE' && (
                  <button onClick={() => rejectMutation.mutate(artist.id)} className="p-2 text-red-600 hover:bg-red-50 rounded text-xs">
                    <X className="h-4 w-4" />
                  </button>
                )}
                {artist.status === 'SUSPENDED' && (
                  <button onClick={() => approveMutation.mutate(artist.id)} className="p-2 text-green-600 hover:bg-green-50 rounded text-xs">
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
