'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { artworksApi } from '@/lib/api';
import { CATEGORY_LABELS } from '@/lib/utils';
import { toast } from 'sonner';

export default function NewArtworkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 10,
    maxSize: 20 * 1024 * 1024,
    onDrop: (accepted) => {
      setImages((prev) => [...prev, ...accepted]);
      setPreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
    },
  });

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      toast.error('Добавьте хотя бы одно фото');
      return;
    }
    setLoading(true);
    try {
      const artwork = await artworksApi.create({
        ...data,
        price: parseFloat(data.price),
        year: data.year ? parseInt(data.year) : undefined,
        width: data.width ? parseFloat(data.width) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        hasCertificate: data.hasCertificate === 'true',
      });

      // Upload images
      for (let i = 0; i < images.length; i++) {
        await artworksApi.uploadImage(artwork.data.id, images[i], i);
      }

      toast.success('Работа создана! Отправьте на модерацию.');
      router.push('/dashboard/artworks');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ошибка создания работы');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/artworks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      <h1 className="font-serif text-2xl font-bold mb-6">Новая работа</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images */}
        <div>
          <label className="text-sm font-medium mb-2 block">Фотографии *</label>
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Отпустите файлы' : 'Перетащите или нажмите для выбора'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP • до 20 МБ • до 10 фото</p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-1 block">Название *</label>
          <input className="input-field" placeholder="Название работы" {...register('title', { required: true })} />
          {errors.title && <p className="text-xs text-destructive mt-1">Введите название</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1 block">Описание</label>
          <textarea className="input-field h-24 resize-none" placeholder="Расскажите об этой работе..." {...register('description')} />
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Категория *</label>
            <select className="input-field" {...register('category', { required: true })}>
              <option value="">Выберите...</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Тип *</label>
            <select className="input-field" {...register('type', { required: true })}>
              <option value="">Выберите...</option>
              <option value="ORIGINAL">Оригинал</option>
              <option value="PRINT">Принт/тираж</option>
              <option value="DIGITAL">Цифровая работа</option>
              <option value="NFT">NFT</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Цена (₽) *</label>
            <input type="number" className="input-field" placeholder="0" min="0" {...register('price', { required: true, min: 0 })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Год</label>
            <input type="number" className="input-field" placeholder={String(new Date().getFullYear())} {...register('year')} />
          </div>
        </div>

        {/* Technique & Materials */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Техника</label>
            <input className="input-field" placeholder="Масло на холсте" {...register('technique')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Материалы</label>
            <input className="input-field" placeholder="Холст, масло" {...register('materials')} />
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="text-sm font-medium mb-2 block">Размеры (см)</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input type="number" className="input-field" placeholder="Ширина" {...register('width')} />
            </div>
            <div>
              <input type="number" className="input-field" placeholder="Высота" {...register('height')} />
            </div>
            <div>
              <input type="number" className="input-field" placeholder="Глубина" {...register('depth')} />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-1 block">Теги (через запятую)</label>
          <input className="input-field" placeholder="пейзаж, закат, море" {...register('tags')} />
        </div>

        {/* Certificate */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="cert" value="true" {...register('hasCertificate')} className="rounded" />
          <label htmlFor="cert" className="text-sm">К работе прилагается сертификат подлинности</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Сохранение...' : 'Сохранить как черновик'}
          </button>
          <Link href="/dashboard/artworks" className="btn-outline px-6">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
