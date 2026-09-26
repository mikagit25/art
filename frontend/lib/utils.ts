import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = 'RUB'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';

  if (currency === 'RUB') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function artworkDimensions(artwork: any): string {
  if (!artwork.width && !artwork.height) return '';
  const parts = [];
  if (artwork.width) parts.push(`${artwork.width}`);
  if (artwork.height) parts.push(`${artwork.height}`);
  if (artwork.depth) parts.push(`${artwork.depth}`);
  return parts.join(' × ') + ' см';
}

export const CATEGORY_LABELS: Record<string, string> = {
  PAINTING: 'Живопись',
  GRAPHICS: 'Графика',
  PHOTOGRAPHY: 'Фотография',
  SCULPTURE: 'Скульптура',
  DIGITAL_ART: 'Цифровое искусство',
  NFT: 'NFT',
  PRINT: 'Принты',
  OTHER: 'Другое',
};

export const TYPE_LABELS: Record<string, string> = {
  ORIGINAL: 'Оригинал',
  PRINT: 'Принт',
  DIGITAL: 'Цифровая',
  NFT: 'NFT',
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Черновик',
  PENDING_REVIEW: 'На модерации',
  PUBLISHED: 'Опубликовано',
  SOLD: 'Продано',
  REMOVED: 'Снято',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачен',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
  REFUNDED: 'Возврат',
  DISPUTED: 'Спор',
};

export const SOCIAL_ICONS: Record<string, { label: string; icon: string }> = {
  instagram: { label: 'Instagram', icon: 'instagram' },
  facebook: { label: 'Facebook', icon: 'facebook' },
  pinterest: { label: 'Pinterest', icon: 'layout-grid' },
  vk: { label: 'ВКонтакте', icon: 'message-circle' },
  telegram: { label: 'Telegram', icon: 'send' },
  tiktok: { label: 'TikTok', icon: 'music' },
  youtube: { label: 'YouTube', icon: 'youtube' },
  website: { label: 'Сайт', icon: 'globe' },
};
