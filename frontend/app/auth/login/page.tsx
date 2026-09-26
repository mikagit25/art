'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Добро пожаловать!');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold text-primary">Mikheyeva</Link>
          <h1 className="font-serif text-2xl font-bold mt-4">Вход</h1>
          <p className="text-muted-foreground mt-1">Войдите в свой аккаунт</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  {...register('password', { required: 'Введите пароль' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">или</span>
            </div>
          </div>

          <a
            href="/api/v1/auth/google"
            className="flex items-center justify-center gap-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </a>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Нет аккаунта? </span>
            <Link href="/auth/register" className="text-primary hover:underline">Зарегистрироваться</Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/auth/register/artist" className="text-primary hover:underline text-xs">
              Я художник — хочу продавать работы
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
