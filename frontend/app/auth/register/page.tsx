'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

interface RegisterForm {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Добро пожаловать в галерею!');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold text-primary">Mikheyeva</Link>
          <h1 className="font-serif text-2xl font-bold mt-4">Регистрация</h1>
          <p className="text-muted-foreground mt-1">Создайте аккаунт покупателя</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
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
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', { required: 'Введите email' })}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Пароль</label>
              <input
                type="password"
                className="input-field"
                placeholder="Минимум 6 символов"
                {...register('password', { required: true, minLength: 6 })}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">Пароль минимум 6 символов</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Уже есть аккаунт? </span>
            <Link href="/auth/login" className="text-primary hover:underline">Войти</Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/auth/register/artist" className="text-primary hover:underline text-xs">
              Я художник — зарегистрироваться как автор
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
