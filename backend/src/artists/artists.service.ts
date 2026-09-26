import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateArtistDto, ArtistQueryDto } from './dto/artist.dto';
import { ArtistStatus } from '@prisma/client';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ArtistQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { status: ArtistStatus.ACTIVE };

    if (query.search) {
      where.OR = [
        { displayName: { contains: query.search, mode: 'insensitive' } },
        { bio: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.artist.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          displayName: true,
          slug: true,
          avatarUrl: true,
          coverUrl: true,
          specialization: true,
          bio: true,
          isVerified: true,
          instagram: true,
          facebook: true,
          website: true,
          stats: { select: { totalSales: true, totalViews: true } },
          _count: { select: { artworks: true } },
        },
        orderBy: [
          { user: { role: 'desc' } },
          { isVerified: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.artist.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, email: true, role: true } },
        stats: true,
        _count: { select: { artworks: { where: { status: 'PUBLISHED' } } } },
      },
    });

    if (!artist || artist.status !== ArtistStatus.ACTIVE) {
      throw new NotFoundException('Artist not found');
    }

    // Increment view count
    await this.prisma.artist.update({
      where: { id: artist.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return artist;
  }

  async findByUserId(userId: string) {
    return this.prisma.artist.findUnique({
      where: { userId },
      include: { stats: true, payoutSettings: true },
    });
  }

  async update(userId: string, dto: UpdateArtistDto) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new NotFoundException('Artist profile not found');

    return this.prisma.artist.update({
      where: { id: artist.id },
      data: dto,
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new NotFoundException('Artist profile not found');

    return this.prisma.artist.update({
      where: { id: artist.id },
      data: { avatarUrl },
    });
  }

  async updateCover(userId: string, coverUrl: string) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new NotFoundException('Artist profile not found');

    return this.prisma.artist.update({
      where: { id: artist.id },
      data: { coverUrl },
    });
  }

  async getStats(userId: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { userId },
      include: { stats: true },
    });
    if (!artist) throw new NotFoundException('Artist not found');

    const recentOrders = await this.prisma.order.findMany({
      where: {
        items: { some: { artwork: { artistId: artist.id } } },
        paymentStatus: 'PAID',
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          where: { artwork: { artistId: artist.id } },
          include: { artwork: { select: { title: true } } },
        },
      },
    });

    const artworkStats = await this.prisma.artwork.groupBy({
      by: ['status'],
      where: { artistId: artist.id },
      _count: { id: true },
    });

    return {
      stats: artist.stats,
      artworksByStatus: artworkStats,
      recentOrders,
    };
  }

  async getFeatured() {
    return this.prisma.artist.findMany({
      where: {
        status: ArtistStatus.ACTIVE,
        user: { role: { in: ['PARTNER_ARTIST', 'ARTIST'] } },
      },
      take: 8,
      select: {
        id: true,
        displayName: true,
        slug: true,
        avatarUrl: true,
        coverUrl: true,
        specialization: true,
        isVerified: true,
        _count: { select: { artworks: { where: { status: 'PUBLISHED' } } } },
      },
      orderBy: [
        { user: { role: 'desc' } },
        { viewCount: 'desc' },
      ],
    });
  }
}
