import { BadRequestException } from '@nestjs/common';
import { FinanceService } from '../src/modules/finance/finance.service';

describe('FinanceService', () => {
  it('rejects an invoice with no items', async () => {
    const service = new FinanceService(
      {} as never,
      {} as never,
      {} as never,
      { findOne: jest.fn().mockResolvedValue({ id: 'player-1' }) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.createInvoice({
        playerId: 'player-1',
        billingCycle: 'MONTHLY' as never,
        issueDate: '2026-09-01',
        dueDate: '2026-09-10',
        items: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
