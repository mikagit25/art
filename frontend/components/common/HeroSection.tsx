'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gallery-cream">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50" />
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-amber-100/50 to-transparent" />

      <div className="gallery-container relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-primary font-medium mb-4">
              Онлайн-галерея
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gallery-dark">
              Искусство
              <br />
              <span className="text-primary italic">доступно</span>
              <br />
              каждому
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Оригинальные работы Марины Михеевой и других независимых художников.
              Живопись, графика, цифровое искусство — прямо от автора.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/catalog" className="btn-primary group">
                Смотреть каталог
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/artist/marina-mikheyeva" className="btn-outline">
                Работы Михеевой
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8">
              {[
                { value: '200+', label: 'Работ' },
                { value: '15+', label: 'Художников' },
                { value: '500+', label: 'Покупателей' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl font-bold text-gallery-dark">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero image collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:grid grid-cols-2 gap-4 h-[600px]"
          >
            <div className="col-span-1 space-y-4">
              <div className="h-64 rounded-2xl bg-stone-200 overflow-hidden shadow-lg">
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-amber-100 to-orange-200">
                  🎨
                </div>
              </div>
              <div className="h-48 rounded-2xl bg-stone-200 overflow-hidden shadow-lg">
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-rose-100 to-pink-200">
                  🖼️
                </div>
              </div>
            </div>
            <div className="col-span-1 pt-12 space-y-4">
              <div className="h-48 rounded-2xl bg-stone-200 overflow-hidden shadow-lg">
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-violet-100 to-purple-200">
                  ✏️
                </div>
              </div>
              <div className="h-72 rounded-2xl bg-stone-200 overflow-hidden shadow-lg">
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-emerald-100 to-teal-200">
                  🖌️
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
