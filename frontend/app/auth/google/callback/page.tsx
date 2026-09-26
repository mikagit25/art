'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

function GoogleCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (!accessToken || !refreshToken || !userId || !email || !role) {
      toast.error('Ошибка авторизации через Google');
      router.replace('/auth/login');
      return;
    }

    setAuth({ id: userId, email, role }, accessToken, refreshToken);
    toast.success('Вы вошли через Google!');
    router.replace('/');
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Входим через Google...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GoogleCallbackHandler />
    </Suspense>
  );
}
