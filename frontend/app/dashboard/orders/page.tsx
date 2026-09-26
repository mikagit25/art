'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';

export default function DashboardOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-orders'],
    queryFn: () => ordersApi.getArtistOrders().then((r) => r.data),
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Заказы</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : !data?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-3">📦</p>
          Заказов пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((order: any) => (
            <div key={order.id} className="p-4 bg-card rounded-xl border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.items?.map((i: any) => i.artwork?.title).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(order.artistAmount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <span className="badge bg-green-100 text-green-700 mt-1">{ORDER_STATUS_LABELS[order.status]}</span>
                </div>
              </div>
              {order.trackingNumber && (
                <p className="text-sm text-muted-foreground mt-2">Трек: {order.trackingNumber}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
