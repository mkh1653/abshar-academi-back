import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateInvoiceDto } from '../src/modules/finance/dto/create-invoice.dto';
import { CreateOrderDto } from '../src/modules/shop/dto/create-order.dto';

describe('DTO validation', () => {
  it('keeps nested invoice items under whitelist validation', async () => {
    const dto = plainToInstance(CreateInvoiceDto, {
      playerId: 'player-1',
      billingCycle: 'MONTHLY',
      issueDate: '2026-09-01',
      dueDate: '2026-09-10',
      items: [
        {
          title: 'Training',
          quantity: 1,
          unitPriceRial: 1000000,
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.items[0].title).toBe('Training');
  });

  it('rejects an invalid shop quantity', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      playerId: 'player-1',
      items: [{ productId: 'product-1', quantity: 0 }],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
