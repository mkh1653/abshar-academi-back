export interface PaymentGateway {
  requestPayment(input: {
    amountRial: string;
    paymentId: string;
    description: string;
    returnUrl: string;
  }): Promise<{ authority: string; checkoutUrl: string }>;

  verifyPayment(input: {
    authority: string;
    amountRial: string;
  }): Promise<{ success: boolean; transactionId?: string }>;
}
