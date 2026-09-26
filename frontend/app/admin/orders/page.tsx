'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';

export default function AdminOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => ordersApi.getAll().then((r) => r.data),
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Все заказы</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data || []).map((order: any) => (
            <div key={order.id} className="p-4 bg-card rounded-xl border border-border">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.user?.email} • {formatDate(order.createdAt)}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {order.items?.map((i: any) => i.artwork?.title || i.title).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus === 'PAID' ? 'Оплачен' : 'Не оплачен'}
                  </span>
                  <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
