'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

interface ArtistRegisterForm {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  bio?: string;
}

export default function RegisterArtistPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ArtistRegisterForm>();

  const onSubmit = async (data: ArtistRegisterForm) => {
    setLoading(true);
    try {
      const res = await authApi.registerArtist(data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Добро пожаловать! Ваш профиль проходит модерацию.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold text-primary">Mikheyeva</Link>
          <h1 className="font-serif text-2xl font-bold mt-4">Регистрация художника</h1>
          <p className="text-muted-foreground mt-1">
            Создайте профиль и начните продавать свои работы
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <div className="bg-primary/5 rounded-lg p-4 mb-6 text-sm">
            <p className="font-medium mb-1">Как это работает:</p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Заполните анкету и создайте профиль</li>
              <li>Администратор проверит ваши данные (обычно до 24ч)</li>
              <li>После одобрения — загружайте работы и продавайте</li>
              <li>Комиссия галереи — 15% с каждой продажи</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Имя</label>
                <input className="input-field" placeholder="Иван" {...register('firstName')} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Фамилия</label>
                <input className="input-field" placeholder="Иванов" {...register('lastName')} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Имя художника / псевдоним *</label>
              <input
                className="input-field"
                placeholder="Как вас будут видеть покупатели"
                {...register('displayName', { required: 'Укажите имя художника' })}
              />
              {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', { required: 'Введите email' })}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Пароль *</label>
              <input
                type="password"
                className="input-field"
                placeholder="Минимум 6 символов"
                {...register('password', { required: true, minLength: 6 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">О себе</label>
              <textarea
                className="input-field h-24 resize-none"
                placeholder="Расскажите о себе и своём творчестве..."
                {...register('bio')}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Создание профиля...' : 'Создать профиль художника'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Уже есть аккаунт? </span>
            <Link href="/auth/login" className="text-primary hover:underline">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
