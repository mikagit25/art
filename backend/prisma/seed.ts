import { PrismaClient, Role, ArtistStatus, ArtworkCategory, ArtworkType, ArtworkStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Platform settings
  const settings = [
    { key: 'commission_rate', value: '15', description: 'Default gallery commission rate (%)' },
    { key: 'gallery_name', value: 'Mikheyeva Art Gallery', description: 'Gallery name' },
    { key: 'gallery_name_ru', value: 'Галерея Михеевой', description: 'Gallery name RU' },
    { key: 'currency', value: 'RUB', description: 'Default currency' },
    { key: 'min_payout', value: '1000', description: 'Minimum payout amount (RUB)' },
    { key: 'payout_schedule', value: 'weekly', description: 'Payout schedule' },
  ];

  for (const setting of settings) {
    await prisma.platformSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mikheyeva.art' },
    update: {},
    create: {
      email: 'admin@mikheyeva.art',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Gallery',
          lastName: 'Admin',
        },
      },
    },
  });
  console.log('Admin user created:', admin.email);

  // Marina Mikheyeva — partner artist
  const marinaPassword = await bcrypt.hash('Marina123!', 10);
  const marina = await prisma.user.upsert({
    where: { email: 'marina@mikheyeva.art' },
    update: {},
    create: {
      email: 'marina@mikheyeva.art',
      password: marinaPassword,
      role: Role.PARTNER_ARTIST,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Марина',
          lastName: 'Михеева',
          country: 'RU',
        },
      },
    },
  });

  const marinaArtist = await prisma.artist.upsert({
    where: { userId: marina.id },
    update: {},
    create: {
      userId: marina.id,
      displayName: 'Марина Михеева',
      slug: 'marina-mikheyeva',
      bio: 'Художница и основатель галереи. Работает в техниках масляной живописи и акварели. Окончила Академию художеств. Участница многочисленных российских и международных выставок.',
      specialization: ['Масляная живопись', 'Акварель', 'Графика'],
      status: ArtistStatus.ACTIVE,
      isVerified: true,
      instagram: 'https://instagram.com/mikheyeva.art',
      website: 'https://mikheyeva.art',
      stats: {
        create: {},
      },
    },
  });

  // Sample artworks for Marina
  const artworkData = [
    {
      title: 'Утренний свет',
      slug: 'utrenni-svet',
      description: 'Масляная живопись на холсте. Работа передаёт особую атмосферу раннего утра, когда первые лучи солнца касаются поверхности воды.',
      category: ArtworkCategory.PAINTING,
      technique: 'Масло на холсте',
      materials: 'Холст, масляные краски',
      style: 'Импрессионизм',
      tags: ['пейзаж', 'утро', 'свет', 'вода'],
      width: 80,
      height: 60,
      price: 45000,
      type: ArtworkType.ORIGINAL,
      status: ArtworkStatus.PUBLISHED,
      year: 2024,
      hasCertificate: true,
    },
    {
      title: 'Городской этюд',
      slug: 'gorodskoy-etyud',
      description: 'Акварельный этюд городского пейзажа. Быстрое ощущение городской жизни, схваченное в один момент.',
      category: ArtworkCategory.PAINTING,
      technique: 'Акварель',
      materials: 'Бумага для акварели, акварельные краски',
      style: 'Реализм',
      tags: ['город', 'акварель', 'этюд'],
      width: 30,
      height: 40,
      price: 12000,
      type: ArtworkType.ORIGINAL,
      status: ArtworkStatus.PUBLISHED,
      year: 2025,
      hasCertificate: true,
    },
    {
      title: 'Абстрактная композиция №3',
      slug: 'abstraktnaya-kompozitsiya-3',
      description: 'Серия абстрактных работ, исследующих взаимодействие цвета и формы. Работа №3 из серии «Внутренний диалог».',
      category: ArtworkCategory.PAINTING,
      technique: 'Смешанная техника',
      materials: 'Холст, акрил, пастель',
      style: 'Абстракционизм',
      tags: ['абстракция', 'цвет', 'форма'],
      width: 100,
      height: 100,
      price: 75000,
      type: ArtworkType.ORIGINAL,
      status: ArtworkStatus.PUBLISHED,
      year: 2025,
      hasCertificate: true,
    },
  ];

  for (const artwork of artworkData) {
    await prisma.artwork.upsert({
      where: { slug: artwork.slug },
      update: {},
      create: {
        ...artwork,
        price: artwork.price,
        artistId: marinaArtist.id,
      },
    });
  }

  // Categories
  const categories = [
    { name: 'Живопись', nameEn: 'Painting', slug: 'painting', order: 1 },
    { name: 'Графика', nameEn: 'Graphics', slug: 'graphics', order: 2 },
    { name: 'Фотография', nameEn: 'Photography', slug: 'photography', order: 3 },
    { name: 'Скульптура', nameEn: 'Sculpture', slug: 'sculpture', order: 4 },
    { name: 'Цифровое искусство', nameEn: 'Digital Art', slug: 'digital-art', order: 5 },
    { name: 'NFT', nameEn: 'NFT', slug: 'nft', order: 6 },
    { name: 'Принты', nameEn: 'Prints', slug: 'prints', order: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Sample banner
  await prisma.banner.upsert({
    where: { id: 'banner-1' },
    update: {},
    create: {
      id: 'banner-1',
      title: 'Галерея Михеевой',
      subtitle: 'Откройте для себя уникальное искусство независимых художников',
      imageUrl: '/images/banner-default.jpg',
      linkUrl: '/catalog',
      order: 1,
      isActive: true,
    },
  });

  console.log('Seeding completed!');
  console.log('Admin: admin@mikheyeva.art / Admin123!');
  console.log('Artist (Marina): marina@mikheyeva.art / Marina123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
