import Link from 'next/link';
import { Instagram, Facebook, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="gallery-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-primary">
              Mikheyeva
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Онлайн-галерея и маркетплейс для независимых художников
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com/mikheyeva.art"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/mikheyeva_art"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog?category=PAINTING" className="hover:text-primary transition-colors">Живопись</Link></li>
              <li><Link href="/catalog?category=GRAPHICS" className="hover:text-primary transition-colors">Графика</Link></li>
              <li><Link href="/catalog?category=PHOTOGRAPHY" className="hover:text-primary transition-colors">Фотография</Link></li>
              <li><Link href="/catalog?category=DIGITAL_ART" className="hover:text-primary transition-colors">Цифровое искусство</Link></li>
              <li><Link href="/catalog?category=NFT" className="hover:text-primary transition-colors">NFT</Link></li>
            </ul>
          </div>

          {/* Gallery */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Галерея</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/artists" className="hover:text-primary transition-colors">Художники</Link></li>
              <li><Link href="/artist/marina-mikheyeva" className="hover:text-primary transition-colors">Марина Михеева</Link></li>
              <li><Link href="/auth/register/artist" className="hover:text-primary transition-colors">Стать художником</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">О галерее</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Покупателям</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/login" className="hover:text-primary transition-colors">Войти</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary transition-colors">Регистрация</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">Мои заказы</Link></li>
              <li><Link href="/favorites" className="hover:text-primary transition-colors">Избранное</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Доставка и оплата</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Галерея Михеевой. Все права защищены.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Политика конфиденциальности</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
