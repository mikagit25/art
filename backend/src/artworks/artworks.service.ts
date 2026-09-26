import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import {
  CreateArtworkDto, UpdateArtworkDto, ArtworkQueryDto, UpdateArtworkStatusDto,
} from './dto/artwork.dto';
import { ArtworkStatus, Role } from '@prisma/client';
import { generateSlug } from '../common/utils/slug.util';

const ARTWORK_PUBLIC_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  category: true,
  technique: true,
  materials: true,
  style: true,
  tags: true,
  width: true,
  height: true,
  depth: true,
  year: true,
  price: true,
  currency: true,
  type: true,
  status: true,
  quantity: true,
  isSold: true,
  videoUrl: true,
  hasCertificate: true,
  viewCount: true,
  favoriteCount: true,
  createdAt: true,
  images: {
    orderBy: { order: 'asc' as const },
    select: { id: true, url: true, thumbUrl: true, alt: true, order: true },
  },
  artist: {
    select: {
      id: true,
      displayName: true,
      slug: true,
      avatarUrl: true,
      isVerified: true,
    },
  },
};

@Injectable()
export class ArtworksService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  async findAll(query: ArtworkQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 24, 100);
    const skip = (page - 1) * limit;

    const where: any = { status: ArtworkStatus.PUBLISHED };

    if (query.category) where.category = query.category.toUpperCase();
    if (query.type) where.type = query.type.toUpperCase();
    if (query.style) where.style = { contains: query.style, mode: 'insensitive' };
    if (query.artistId) where.artistId = query.artistId;
    if (query.available === true) where.isSold = false;

    if (query.artistSlug) {
      const artist = await this.prisma.artist.findUnique({ where: { slug: query.artistSlug } });
      if (artist) where.artistId = artist.id;
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.price = {};
      if (query.priceMin !== undefined) where.price.gte = query.priceMin;
      if (query.priceMax !== undefined) where.price.lte = query.priceMax;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { hasSome: [query.search] } },
        { artist: { displayName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (query.sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (query.sortBy === 'popular') orderBy = { viewCount: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        skip,
        take: limit,
        select: ARTWORK_PUBLIC_SELECT,
        orderBy,
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string, userId?: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        artist: {
          include: {
            _count: { select: { artworks: { where: { status: 'PUBLISHED' } } } },
          },
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!artwork || artwork.status === ArtworkStatus.REMOVED) {
      throw new NotFoundException('Artwork not found');
    }

    // Increment view count
    await this.prisma.artwork.update({
      where: { id: artwork.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    let isFavorite = false;
    if (userId) {
      const fav = await this.prisma.favorite.findUnique({
        where: { userId_artworkId: { userId, artworkId: artwork.id } },
      });
      isFavorite = !!fav;
    }

    return { ...artwork, isFavorite };
  }

  async findByArtist(artistId: string, query: ArtworkQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 24, 100);
    const skip = (page - 1) * limit;

    const where: any = { artistId, status: ArtworkStatus.PUBLISHED };
    if (query.category) where.category = query.category.toUpperCase();

    const [items, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where, skip, take: limit,
        select: ARTWORK_PUBLIC_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(userId: string, dto: CreateArtworkDto) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenException('Artist profile required');

    const slug = await this.generateUniqueSlug(dto.title);

    return this.prisma.artwork.create({
      data: {
        ...dto,
        slug,
        artistId: artist.id,
        status: ArtworkStatus.DRAFT,
        tags: dto.tags || [],
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateArtworkDto, userRole: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id },
      include: { artist: true },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');

    const isAdmin = ([Role.ADMIN, Role.SUPER_ADMIN] as string[]).includes(userRole);
    if (!isAdmin && artwork.artist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.artwork.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, userId: string, dto: UpdateArtworkStatusDto, userRole: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id },
      include: { artist: true },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');

    const isAdmin = ([Role.ADMIN, Role.SUPER_ADMIN] as string[]).includes(userRole);

    // Artist can only move to DRAFT, PENDING_REVIEW, REMOVED
    if (!isAdmin) {
      if (artwork.artist.userId !== userId) throw new ForbiddenException('Access denied');
      const allowedStatuses: ArtworkStatus[] = [ArtworkStatus.DRAFT, ArtworkStatus.PENDING_REVIEW, ArtworkStatus.REMOVED];
      if (!(allowedStatuses as string[]).includes(dto.status)) {
        throw new ForbiddenException('Artists cannot set this status directly');
      }
    }

    return this.prisma.artwork.update({ where: { id }, data: { status: dto.status } });
  }

  async uploadImage(artworkId: string, userId: string, file: Express.Multer.File, order: number) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { artist: true },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');
    if (artwork.artist.userId !== userId) throw new ForbiddenException();

    const url = await this.uploads.uploadImage(file, `artworks/${artworkId}`);
    const thumbUrl = await this.uploads.uploadImageThumb(file, `artworks/${artworkId}/thumbs`);

    return this.prisma.artworkImage.create({
      data: { artworkId, url, thumbUrl, order },
    });
  }

  async deleteImage(imageId: string, userId: string) {
    const image = await this.prisma.artworkImage.findUnique({
      where: { id: imageId },
      include: { artwork: { include: { artist: true } } },
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.artwork.artist.userId !== userId) throw new ForbiddenException();

    return this.prisma.artworkImage.delete({ where: { id: imageId } });
  }

  async getMyArtworks(userId: string, query: ArtworkQueryDto) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenException('Artist profile required');

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 24, 100);
    const skip = (page - 1) * limit;

    const where: any = { artistId: artist.id };
    if (query.category) where.category = query.category.toUpperCase();

    const [items, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where, skip, take: limit,
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getNew() {
    return this.prisma.artwork.findMany({
      where: { status: ArtworkStatus.PUBLISHED, isSold: false },
      take: 12,
      select: ARTWORK_PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPopular() {
    return this.prisma.artwork.findMany({
      where: { status: ArtworkStatus.PUBLISHED, isSold: false },
      take: 12,
      select: ARTWORK_PUBLIC_SELECT,
      orderBy: { viewCount: 'desc' },
    });
  }

  async toggleFavorite(artworkId: string, userId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_artworkId: { userId, artworkId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_artworkId: { userId, artworkId } },
      });
      await this.prisma.artwork.update({
        where: { id: artworkId },
        data: { favoriteCount: { decrement: 1 } },
      }).catch(() => {});
      return { isFavorite: false };
    }

    await this.prisma.favorite.create({ data: { userId, artworkId } });
    await this.prisma.artwork.update({
      where: { id: artworkId },
      data: { favoriteCount: { increment: 1 } },
    }).catch(() => {});
    return { isFavorite: true };
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        artwork: { select: ARTWORK_PUBLIC_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title);
    let counter = 0;
    while (true) {
      const candidate = counter === 0 ? slug : `${slug}-${counter}`;
      const exists = await this.prisma.artwork.findUnique({ where: { slug: candidate } });
      if (!exists) return candidate;
      counter++;
    }
  }
}
