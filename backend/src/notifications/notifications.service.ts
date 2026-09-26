import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST', 'smtp.gmail.com'),
      port: Number(config.get('SMTP_PORT', 587)),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendOrderConfirmation(to: string, order: any) {
    const subject = `Заказ #${order.orderNumber} подтверждён`;
    const html = `
      <h2>Ваш заказ подтверждён!</h2>
      <p>Номер заказа: <strong>${order.orderNumber}</strong></p>
      <p>Сумма: <strong>${order.totalAmount} ${order.items[0]?.artwork?.currency || 'RUB'}</strong></p>
      <p>Спасибо за покупку в галерее Михеевой!</p>
      <a href="${this.config.get('FRONTEND_URL')}/orders/${order.id}">Посмотреть заказ</a>
    `;
    await this.send(to, subject, html);
  }

  async sendArtistNewOrder(to: string, order: any) {
    const subject = `Новый заказ #${order.orderNumber}`;
    const html = `
      <h2>У вас новый заказ!</h2>
      <p>Номер заказа: <strong>${order.orderNumber}</strong></p>
      <p>Сумма к получению: <strong>${order.artistAmount} RUB</strong></p>
      <a href="${this.config.get('FRONTEND_URL')}/dashboard/orders/${order.id}">Перейти к заказу</a>
    `;
    await this.send(to, subject, html);
  }

  async sendArtworkApproved(to: string, artworkTitle: string) {
    const subject = `Работа «${artworkTitle}» опубликована`;
    const html = `
      <h2>Ваша работа прошла модерацию</h2>
      <p>Работа «<strong>${artworkTitle}</strong>» опубликована в каталоге галереи.</p>
    `;
    await this.send(to, subject, html);
  }

  async sendArtworkRejected(to: string, artworkTitle: string, reason: string) {
    const subject = `Работа «${artworkTitle}» не прошла модерацию`;
    const html = `
      <h2>Ваша работа не прошла модерацию</h2>
      <p>Работа «<strong>${artworkTitle}</strong>» не опубликована.</p>
      <p>Причина: ${reason}</p>
    `;
    await this.send(to, subject, html);
  }

  async sendWelcome(to: string, name: string) {
    const subject = `Добро пожаловать в галерею Михеевой!`;
    const html = `
      <h2>Добро пожаловать, ${name}!</h2>
      <p>Вы успешно зарегистрированы в Галерее Михеевой.</p>
      <p>Исследуйте уникальные работы художников: <a href="${this.config.get('FRONTEND_URL')}">mikheyeva.art</a></p>
    `;
    await this.send(to, subject, html);
  }

  private async send(to: string, subject: string, html: string) {
    const from = this.config.get('SMTP_FROM', 'gallery@mikheyeva.art');
    try {
      await this.transporter.sendMail({ from, to, subject, html });
    } catch (err) {
      console.warn('Email send failed:', err.message);
    }
  }
}
