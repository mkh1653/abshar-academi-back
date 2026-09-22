import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  async requestPayment(input: {
    amountRial: string;
    paymentId: string;
    description: string;
    returnUrl: string;
  }) {
    const authority = randomUUID();
    return {
      authority,
      checkoutUrl:
        input.returnUrl +
        '?authority=' +
        encodeURIComponent(authority) +
        '&paymentId=' +
        encodeURIComponent(input.paymentId),
    };
  }

  async verifyPayment(input: { authority: string; amountRial: string }) {
    return {
      success: Boolean(input.authority && input.amountRial),
      transactionId: input.authority,
    };
  }
}
