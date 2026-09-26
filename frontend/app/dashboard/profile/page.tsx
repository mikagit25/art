'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { artistsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardProfilePage() {
  const queryClient = useQueryClient();
  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', 'me'],
    queryFn: () => artistsApi.getMe().then((r) => r.data),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (artist) reset(artist);
  }, [artist]);

  const mutation = useMutation({
    mutationFn: (data: any) => artistsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'me'] });
      toast.success('Профиль обновлён');
    },
    onError: () => toast.error('Ошибка сохранения'),
  });

  if (isLoading) return <div className="animate-pulse space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded" />)}</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold mb-6">Профиль художника</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Имя художника / псевдоним</label>
          <input className="input-field" {...register('displayName')} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">О себе</label>
          <textarea className="input-field h-32 resize-none" {...register('bio')} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Специализация (через запятую)</label>
          <input className="input-field" placeholder="Живопись, Акварель, Графика" {...register('specialization')} />
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="font-medium mb-4">Социальные сети</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
              { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
              { key: 'vk', label: 'ВКонтакте', placeholder: 'https://vk.com/...' },
              { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/...' },
              { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/...' },
              { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
              { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
              { key: 'website', label: 'Персональный сайт', placeholder: 'https://...' },
            ].map((social) => (
              <div key={social.key}>
                <label className="text-sm font-medium mb-1 block">{social.label}</label>
                <input className="input-field text-sm" placeholder={social.placeholder} {...register(social.key)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
          {mutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}
