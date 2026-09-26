import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY', 'sk_test_placeholder'), {
      apiVersion: '2023-08-16',
    });
  }

  async createCheckoutSession(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            artwork: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
          },
        },
      },
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Access denied');

    const frontendUrl = this.config.get('FRONTEND_URL', 'https://mikheyeva.art');

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: order.items[0]?.artwork.currency?.toLowerCase() || 'rub',
        product_data: {
          name: item.artwork.title,
          images: item.artwork.images[0] ? [item.artwork.images[0].url] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/orders/${orderId}?success=true`,
      cancel_url: `${frontendUrl}/orders/${orderId}?cancelled=true`,
      metadata: { orderId, userId },
      customer_email: undefined,
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId } = session.metadata;

      await this.ordersService.markPaymentPaid(
        orderId,
        session.payment_intent as string,
        session.id,
      );
    }

    return { received: true };
  }

  async getPayoutSettings(userId: string) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new BadRequestException('Artist not found');

    return this.prisma.payoutSettings.findUnique({ where: { artistId: artist.id } });
  }

  async updatePayoutSettings(userId: string, data: any) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    if (!artist) throw new BadRequestException('Artist not found');

    return this.prisma.payoutSettings.upsert({
      where: { artistId: artist.id },
      create: { artistId: artist.id, ...data },
      update: data,
    });
  }

  async getTransactions(userId: string) {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });

    return this.prisma.transaction.findMany({
      where: artist ? { artistId: artist.id } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
