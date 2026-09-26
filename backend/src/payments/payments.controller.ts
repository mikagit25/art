import {
  Controller, Post, Get, Put, Body, Param, Headers, RawBodyRequest,
  Req, UseGuards, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('checkout/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  createCheckout(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.createCheckoutSession(orderId, userId);
  }

  @Post('webhook')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }

  @Get('payout-settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payout settings' })
  getPayoutSettings(@CurrentUser('id') userId: string) {
    return this.paymentsService.getPayoutSettings(userId);
  }

  @Put('payout-settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payout settings' })
  updatePayoutSettings(
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.paymentsService.updatePayoutSettings(userId, data);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transactions' })
  getTransactions(@CurrentUser('id') userId: string) {
    return this.paymentsService.getTransactions(userId);
  }
}
