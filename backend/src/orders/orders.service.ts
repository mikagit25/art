import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, PaymentStatus, DeliveryType, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(): Promise<string> {
    const prefix = 'ART';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const artworkIds = dto.items.map((i) => i.artworkId);

    const artworks = await this.prisma.artwork.findMany({
      where: { id: { in: artworkIds }, status: 'PUBLISHED', isSold: false },
      include: { artist: true },
    });

    if (artworks.length !== artworkIds.length) {
      throw new BadRequestException('Some artworks are unavailable');
    }

    // Get commission rate
    const commissionSetting = await this.prisma.platformSettings.findUnique({
      where: { key: 'commission_rate' },
    });
    const defaultCommission = parseFloat(commissionSetting?.value || '15') / 100;

    let totalAmount = 0;
    let commissionAmount = 0;
    const orderItems: any[] = [];

    for (const item of dto.items) {
      const artwork = artworks.find((a) => a.id === item.artworkId);
      const price = Number(artwork.price) * item.quantity;
      const artistCommission = artwork.artist.commissionRate
        ? artwork.artist.commissionRate / 100
        : defaultCommission;
      const commission = price * artistCommission;

      totalAmount += price;
      commissionAmount += commission;

      orderItems.push({
        artworkId: artwork.id,
        title: artwork.title,
        price: artwork.price,
        quantity: item.quantity,
      });
    }

    const artistAmount = totalAmount - commissionAmount;
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: OrderStatus.PENDING,
        deliveryType: dto.deliveryType,
        deliveryAddress: dto.deliveryAddress as any,
        deliveryPrice: 0,
        totalAmount,
        commissionAmount,
        artistAmount,
        paymentStatus: PaymentStatus.UNPAID,
        notes: dto.notes,
        items: { create: orderItems },
      },
      include: {
        items: { include: { artwork: { select: { title: true, images: { take: 1 } } } } },
      },
    });

    return order;
  }

  async findAll(userId: string, userRole: string) {
    const isAdmin = ([Role.ADMIN, Role.SUPER_ADMIN] as string[]).includes(userRole);

    const where = isAdmin ? {} : { userId };

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            artwork: { select: { title: true, images: { take: 1, orderBy: { order: 'asc' } } } },
          },
        },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const isAdmin = ([Role.ADMIN, Role.SUPER_ADMIN] as string[]).includes(userRole);

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            artwork: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } },
                artist: { select: { displayName: true, slug: true } },
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        transactions: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.userId !== userId) throw new ForbiddenException();

    return order;
  }

  async getArtistOrders(userId: string) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new NotFoundException('Artist not found');

    return this.prisma.order.findMany({
      where: {
        items: { some: { artwork: { artistId: artist.id } } },
        paymentStatus: 'PAID',
      },
      include: {
        items: {
          where: { artwork: { artistId: artist.id } },
          include: { artwork: { select: { title: true, images: { take: 1 } } } },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string, userRole: string) {
    const isAdmin = ([Role.ADMIN, Role.SUPER_ADMIN] as string[]).includes(userRole);
    const isArtist = ([Role.ARTIST, Role.PARTNER_ARTIST] as string[]).includes(userRole);

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const data: any = { status: dto.status };
    if (dto.trackingNumber) data.trackingNumber = dto.trackingNumber;

    return this.prisma.order.update({ where: { id }, data });
  }

  async markPaymentPaid(orderId: string, paymentId: string, stripeSessionId?: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentId,
        stripeSessionId,
        status: OrderStatus.PAID,
      },
    });

    // Mark artworks as sold (for originals)
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: { artwork: true },
    });

    for (const item of items) {
      if (item.artwork.type === 'ORIGINAL') {
        await this.prisma.artwork.update({
          where: { id: item.artworkId },
          data: { isSold: true, status: 'SOLD' },
        });
      }
    }

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        orderId,
        type: 'PAYMENT',
        amount: order.totalAmount,
        currency: 'RUB',
        status: 'COMPLETED',
        externalId: paymentId,
      },
    });

    return order;
  }
}
