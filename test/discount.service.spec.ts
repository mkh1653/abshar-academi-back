import { BadRequestException } from '@nestjs/common';
import { FinanceService } from '../src/modules/finance/finance.service';

describe('Finance discounts', () => {
  it('rejects a discount larger than invoice subtotal', async () => {
    const discounts = {
      findOne: jest.fn().mockResolvedValue({
        code: 'BIG',
        type: 'FIXED',
        value: '5000',
        isActive: true,
        startsAt: null,
        endsAt: null,
      }),
    };

    const service = new FinanceService(
      {} as never,
      {} as never,
      {} as never,
      { findOne: jest.fn().mockResolvedValue({ id: 'player-1' }) } as never,
      {} as never,
      {} as never,
      { findOne: jest.fn() } as never,
      {} as never,
      discounts as never,
    );

    await expect(
      service.createInvoice({
        playerId: 'player-1',
        billingCycle: 'MONTHLY' as never,
        issueDate: '2026-09-01',
        dueDate: '2026-09-10',
        items: [{ title: 'Training', quantity: 1, unitPriceRial: 1000 }],
        discountCode: 'BIG',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
