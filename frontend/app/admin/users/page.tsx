'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Ban, Check } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  BUYER: 'Покупатель',
  ARTIST: 'Художник',
  PARTNER_ARTIST: 'Партнёр',
  ADMIN: 'Администратор',
  SUPER_ADMIN: 'Суперадмин',
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getAllUsers().then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUserActive(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin'] }); toast.success('Обновлено'); },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Пользователи</h1>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {(data?.items || []).map((user: any) => (
            <div key={user.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.profile?.firstName} {user.profile?.lastName} • {ROLE_LABELS[user.role]} • {formatDate(user.createdAt)}
                </p>
              </div>
              <span className={`badge text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.isActive ? 'Активен' : 'Заблокирован'}
              </span>
              <button
                onClick={() => toggleMutation.mutate(user.id)}
                className={`p-2 rounded ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
              >
                {user.isActive ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
