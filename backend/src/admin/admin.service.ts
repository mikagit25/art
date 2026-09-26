import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArtistStatus, ArtworkStatus, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalArtists,
      totalArtworks,
      totalOrders,
      pendingArtists,
      pendingArtworks,
      revenueResult,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.artist.count({ where: { status: ArtistStatus.ACTIVE } }),
      this.prisma.artwork.count({ where: { status: ArtworkStatus.PUBLISHED } }),
      this.prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      this.prisma.artist.count({ where: { status: ArtistStatus.PENDING } }),
      this.prisma.artwork.count({ where: { status: ArtworkStatus.PENDING_REVIEW } }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true, commissionAmount: true },
      }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        items: { take: 1, include: { artwork: { select: { title: true } } } },
      },
    });

    return {
      stats: {
        totalUsers,
        totalArtists,
        totalArtworks,
        totalOrders,
        pendingArtists,
        pendingArtworks,
        totalRevenue: revenueResult._sum.totalAmount || 0,
        totalCommission: revenueResult._sum.commissionAmount || 0,
      },
      recentOrders,
    };
  }

  // Artists moderation
  async getPendingArtists() {
    return this.prisma.artist.findMany({
      where: { status: ArtistStatus.PENDING },
      include: {
        user: { select: { email: true, createdAt: true } },
        _count: { select: { artworks: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveArtist(artistId: string) {
    return this.prisma.artist.update({
      where: { id: artistId },
      data: { status: ArtistStatus.ACTIVE },
    });
  }

  async rejectArtist(artistId: string, reason?: string) {
    return this.prisma.artist.update({
      where: { id: artistId },
      data: { status: ArtistStatus.SUSPENDED },
    });
  }

  async getAllArtists(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.artist.findMany({
        skip, take: limit,
        include: {
          user: { select: { email: true, role: true, isActive: true } },
          stats: true,
          _count: { select: { artworks: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artist.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateArtistCommission(artistId: string, rate: number) {
    return this.prisma.artist.update({
      where: { id: artistId },
      data: { commissionRate: rate },
    });
  }

  // Artworks moderation
  async getPendingArtworks() {
    return this.prisma.artwork.findMany({
      where: { status: ArtworkStatus.PENDING_REVIEW },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        artist: { select: { displayName: true, slug: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveArtwork(artworkId: string) {
    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: { status: ArtworkStatus.PUBLISHED },
    });
  }

  async rejectArtwork(artworkId: string, reason?: string) {
    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: { status: ArtworkStatus.REMOVED },
    });
  }

  async getAllArtworks(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as ArtworkStatus } : {};
    const [items, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where, skip, take: limit,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          artist: { select: { displayName: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artwork.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Banners
  async getBanners() {
    return this.prisma.banner.findMany({ orderBy: { order: 'asc' } });
  }

  async createBanner(data: any) {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }

  // Settings
  async getSettings() {
    return this.prisma.platformSettings.findMany();
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.platformSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Categories
  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { order: 'asc' } });
  }

  async createCategory(data: any) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  // Reports
  async getFinancialReport(from?: string, to?: string) {
    const where: any = { paymentStatus: 'PAID' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [orders, topArtists, topArtworks] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          items: { include: { artwork: { select: { title: true, artistId: true } } } },
        },
      }),
      this.prisma.artist.findMany({
        where: { stats: { totalRevenue: { gt: 0 } } },
        include: { stats: true },
        orderBy: { stats: { totalRevenue: 'desc' } },
        take: 10,
      }),
      this.prisma.artwork.findMany({
        where: { viewCount: { gt: 0 } },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { title: true, viewCount: true, favoriteCount: true, price: true, isSold: true },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalCommission = orders.reduce((sum, o) => sum + Number(o.commissionAmount), 0);

    return {
      orders,
      totalRevenue,
      totalCommission,
      totalOrders: orders.length,
      topArtists,
      topArtworks,
    };
  }

  // Users
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: limit,
        select: {
          id: true, email: true, role: true, isActive: true, createdAt: true,
          profile: true,
          artist: { select: { id: true, displayName: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: role as Role } });
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  }
}
