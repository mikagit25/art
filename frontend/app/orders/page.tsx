'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll().then((r) => r.data),
  });

  const STATUS_CLASSES: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
    REFUNDED: 'bg-orange-100 text-orange-700',
  };

  return (
    <MainLayout>
      <div className="gallery-container py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Мои заказы</h1>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : !data?.length ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🛍️</p>
            <h2 className="font-serif text-2xl font-bold mb-2">Заказов нет</h2>
            <p className="text-muted-foreground mb-6">Сделайте первую покупку в галерее</p>
            <Link href="/catalog" className="btn-primary">В каталог</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((order: any) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block bg-card rounded-xl border border-border p-5 hover:border-primary transition-colors">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                    {order.items?.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.items.map((i: any) => i.artwork?.title || i.title).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${STATUS_CLASSES[order.status] || 'bg-muted'}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
