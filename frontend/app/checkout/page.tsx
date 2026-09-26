'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ordersApi, paymentsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'SHIPPING' | 'DIGITAL' | 'PICKUP'>('SHIPPING');

  const { register, handleSubmit } = useForm();

  const hasPhysical = items.some((i) => i.type === 'ORIGINAL' || i.type === 'PRINT');
  const hasDigital = items.some((i) => i.type === 'DIGITAL' || i.type === 'NFT');

  const onSubmit = async (data: any) => {
    if (!isAuthenticated) {
      toast.error('Войдите чтобы оформить заказ');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const order = await ordersApi.create({
        items: items.map((i) => ({ artworkId: i.artworkId, quantity: i.quantity })),
        deliveryType,
        deliveryAddress: deliveryType === 'SHIPPING' ? data : undefined,
        notes: data.notes,
      });

      // Try Stripe checkout
      try {
        const checkout = await paymentsApi.createCheckout(order.data.id);
        if (checkout.data.url) {
          clearCart();
          window.location.href = checkout.data.url;
          return;
        }
      } catch {
        // Stripe not configured — redirect to order
      }

      clearCart();
      toast.success('Заказ оформлен!');
      router.push(`/orders/${order.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="gallery-container py-20 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Корзина пуста</h2>
          <Link href="/catalog" className="btn-primary">В каталог</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="gallery-container py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
            {/* Delivery type */}
            <div>
              <h2 className="font-medium mb-3">Способ получения</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {hasPhysical && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('SHIPPING')}
                      className={`p-4 rounded-xl border-2 text-left transition-colors
                        ${deliveryType === 'SHIPPING' ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <p className="font-medium text-sm">Доставка</p>
                      <p className="text-xs text-muted-foreground mt-0.5">По адресу</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('PICKUP')}
                      className={`p-4 rounded-xl border-2 text-left transition-colors
                        ${deliveryType === 'PICKUP' ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <p className="font-medium text-sm">Самовывоз</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Договориться с художником</p>
                    </button>
                  </>
                )}
                {hasDigital && (
                  <button
                    type="button"
                    onClick={() => setDeliveryType('DIGITAL')}
                    className={`p-4 rounded-xl border-2 text-left transition-colors
                      ${deliveryType === 'DIGITAL' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <p className="font-medium text-sm">Цифровой</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Скачивание после оплаты</p>
                  </button>
                )}
              </div>
            </div>

            {/* Delivery address */}
            {deliveryType === 'SHIPPING' && (
              <div>
                <h2 className="font-medium mb-3">Адрес доставки</h2>
                <div className="space-y-3">
                  <input className="input-field" placeholder="ФИО получателя *" required {...register('fullName')} />
                  <input className="input-field" placeholder="Телефон *" required {...register('phone')} />
                  <input className="input-field" placeholder="Страна" {...register('country')} />
                  <input className="input-field" placeholder="Город *" required {...register('city')} />
                  <input className="input-field" placeholder="Адрес (улица, дом, кв.) *" required {...register('address')} />
                  <input className="input-field" placeholder="Почтовый индекс" {...register('postalCode')} />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1 block">Комментарий к заказу</label>
              <textarea className="input-field h-20 resize-none" placeholder="Пожелания, особые инструкции..." {...register('notes')} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Оформление...' : 'Перейти к оплате'}
            </button>
          </form>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border p-6 h-fit">
            <h2 className="font-medium mb-4">Ваш заказ</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.artworkId} className="flex justify-between text-sm">
                  <span className="truncate mr-2 text-muted-foreground">{item.title}</span>
                  <span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold">
                <span>Итого</span>
                <span className="text-primary">{formatPrice(totalPrice())}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Оплата через Stripe (карта). Безопасное соединение.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
