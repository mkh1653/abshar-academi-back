import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Player } from '../players/entities/player.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { FinanceQueryDto } from './dto/finance-query.dto';
import { Service } from './entities/service.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment } from './entities/payment.entity';
import { Expense } from './entities/expense.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { MockPaymentGateway } from './mock-payment.gateway';
import { Discount } from './entities/discount.entity';
import { DiscountType } from './enums/discount-type.enum';
import { CreateDiscountDto } from './dto/create-discount.dto';

@Injectable()
export class FinanceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mockGateway: MockPaymentGateway,
    @InjectRepository(Service) private readonly services: Repository<Service>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private readonly invoiceItems: Repository<InvoiceItem>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
    @InjectRepository(Discount) private readonly discounts: Repository<Discount>,
  ) {}

  listServices() {
    return this.services.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  createService(dto: CreateServiceDto) {
    return this.services.save(
      this.services.create({
        code: dto.code,
        name: dto.name,
        category: dto.category,
        defaultPriceRial: String(dto.defaultPriceRial),
        description: dto.description ?? null,
        isActive: true,
      }),
    );
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const player = await this.players.findOne({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Player not found');
    if (!dto.items?.length) {
      throw new BadRequestException('Invoice must contain at least one item');
    }

    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceRial,
      0,
    );

    let discount = dto.discountRial ?? 0;
    if (dto.discountCode) {
      const discountEntity = await this.discounts.findOne({
        where: { code: dto.discountCode, isActive: true },
      });
      if (!discountEntity) throw new NotFoundException('Discount code not found');

      const now = Date.now();
      if (
        (discountEntity.startsAt && discountEntity.startsAt.getTime() > now) ||
        (discountEntity.endsAt && discountEntity.endsAt.getTime() < now)
      ) {
        throw new BadRequestException('Discount code is not active');
      }

      if (discountEntity.type === DiscountType.PERCENT) {
        if (BigInt(discountEntity.value) > 100n) {
          throw new BadRequestException('Invalid discount percentage');
        }
        discount = Math.floor(subtotal * Number(discountEntity.value) / 100);
      } else {
        discount = Number(discountEntity.value);
      }
    }

    if (discount < 0 || discount > subtotal) {
      throw new BadRequestException('Invalid discount');
    }

    return this.dataSource.transaction(async (manager) => {
      const sequence = (await manager.query(
        "SELECT nextval('invoice_number_seq') AS value",
      )) as Array<{ value: string }>;

      const invoiceNumber =
        'INV-' +
        new Date().getFullYear() +
        '-' +
        String(sequence[0].value).padStart(6, '0');

      const invoiceRepo = manager.getRepository(Invoice);
      const itemRepo = manager.getRepository(InvoiceItem);
      const serviceRepo = manager.getRepository(Service);

      const invoice = invoiceRepo.create({
        player,
        invoiceNumber,
        billingCycle: dto.billingCycle,
        issueDate: dto.issueDate,
        dueDate: dto.dueDate,
        periodStart: dto.periodStart ?? null,
        periodEnd: dto.periodEnd ?? null,
        subtotalRial: String(subtotal),
        discountRial: String(discount),
        totalRial: String(subtotal - discount),
        paidRial: '0',
        status: InvoiceStatus.PENDING,
        note: dto.note ?? null,
      });
      await invoiceRepo.save(invoice);

      for (const item of dto.items) {
        const service = item.serviceId
          ? await serviceRepo.findOne({ where: { id: item.serviceId } })
          : null;

        if (item.serviceId && !service) {
          throw new NotFoundException('Invoice service not found');
        }

        await itemRepo.save(
          itemRepo.create({
            invoice,
            service,
            title: item.title,
            quantity: String(item.quantity),
            unitPriceRial: String(item.unitPriceRial),
            totalPriceRial: String(item.quantity * item.unitPriceRial),
          }),
        );
      }

      return invoiceRepo.findOne({
        where: { id: invoice.id },
        relations: { player: true, items: { service: true } },
      });
    });
  }

  async createDiscount(dto: CreateDiscountDto) {
    return this.discounts.save(
      this.discounts.create({
        code: dto.code,
        type: dto.type,
        value: String(dto.value),
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: true,
      }),
    );
  }

  async listPayments(user: User, playerId?: string) {
    if (user.role === UserRole.PARENT) {
      const rows = await this.dataSource.query(
        'SELECT p.id FROM players p INNER JOIN player_guardians pg ON pg.player_id = p.id INNER JOIN guardians g ON g.id = pg.guardian_id WHERE g.user_id = $1 AND p.deleted_at IS NULL',
        [user.id],
      );
      const playerIds = rows.map((row: { id: string }) => row.id);
      if (playerId && !playerIds.includes(playerId)) {
        throw new ForbiddenException('You cannot access this player');
      }
      if (!playerIds.length) return [];
      const qb = this.payments.createQueryBuilder('payment')
        .leftJoinAndSelect('payment.invoice', 'invoice')
        .leftJoinAndSelect('payment.order', 'order')
        .leftJoinAndSelect('invoice.player', 'invoicePlayer')
        .leftJoinAndSelect('order.player', 'orderPlayer')
        .where('(invoicePlayer.id IN (:...playerIds) OR orderPlayer.id IN (:...playerIds))', { playerIds });
      if (playerId) {
        qb.andWhere('(invoicePlayer.id = :playerId OR orderPlayer.id = :playerId)', { playerId });
      }
      return qb.orderBy('payment.created_at', 'DESC').getMany();
    }

    const qb = this.payments.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('invoice.player', 'invoicePlayer')
      .leftJoinAndSelect('order.player', 'orderPlayer');
    if (playerId) {
      qb.where('(invoicePlayer.id = :playerId OR orderPlayer.id = :playerId)', { playerId });
    }
    return qb.orderBy('payment.created_at', 'DESC').getMany();
  }

  async debtors() {
    return this.invoices
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.player', 'player')
      .where('invoice.status IN (:...statuses)', {
        statuses: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.EXPIRED],
      })
      .orderBy('invoice.due_date', 'ASC')
      .getMany();
  }

  async familyFinance(user: User) {
    if (user.role !== UserRole.PARENT) {
      throw new ForbiddenException('Only parents can access family finance summary');
    }

    const rows = await this.dataSource.query(
      'SELECT p.id, p.player_code, p.first_name_fa, p.last_name_fa FROM players p INNER JOIN player_guardians pg ON pg.player_id = p.id INNER JOIN guardians g ON g.id = pg.guardian_id WHERE g.user_id = $1 AND p.deleted_at IS NULL ORDER BY p.first_name_fa',
      [user.id],
    );

    const children = [];
    for (const child of rows) {
      const invoices = await this.invoices.find({
        where: { player: { id: child.id } },
        order: { dueDate: 'ASC' },
      });
      const outstandingRial = invoices.reduce(
        (sum, invoice) => sum + BigInt(invoice.totalRial) - BigInt(invoice.paidRial),
        0n,
      );
      children.push({
        player: child,
        outstandingRial: outstandingRial.toString(),
        invoices,
      });
    }
    return { children };
  }

  async listPlayerInvoices(user: User, playerId?: string) {
    if (user.role === UserRole.PARENT) {
      const rows = await this.dataSource.query(
        'SELECT p.id FROM players p INNER JOIN player_guardians pg ON pg.player_id = p.id INNER JOIN guardians g ON g.id = pg.guardian_id WHERE g.user_id = $1 AND p.deleted_at IS NULL',
        [user.id],
      );

      const playerIds = rows.map((row: { id: string }) => row.id);
      if (playerId && !playerIds.includes(playerId)) {
        throw new ForbiddenException('You cannot access this player');
      }

      const qb = this.invoices
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.player', 'player')
        .leftJoinAndSelect('invoice.items', 'items')
        .leftJoinAndSelect('items.service', 'service');

      if (playerIds.length === 0) return [];
      qb.where('player.id IN (:...playerIds)', { playerIds });
      if (playerId) qb.andWhere('player.id = :playerId', { playerId });

      return qb.orderBy('invoice.issue_date', 'DESC').getMany();
    }

    const qb = this.invoices
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.player', 'player')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.service', 'service');

    if (playerId) qb.where('player.id = :playerId', { playerId });
    return qb.orderBy('invoice.issue_date', 'DESC').getMany();
  }

  async initiatePayment(user: User, dto: CreatePaymentDto) {
    const invoice = await this.invoices.findOne({
      where: { id: dto.invoiceId },
      relations: { player: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    if (user.role === UserRole.PARENT) {
      const allowed = await this.isParentPlayer(user.id, invoice.player.id);
      if (!allowed) throw new ForbiddenException('You cannot pay this invoice');
    }

    const remaining = BigInt(invoice.totalRial) - BigInt(invoice.paidRial);
    if (remaining <= 0n) throw new BadRequestException('Invoice is already paid');

    if (BigInt(dto.amountRial) > remaining) {
      throw new BadRequestException('Payment exceeds remaining invoice balance');
    }

    const payment = await this.payments.save(
      this.payments.create({
        invoice,
        amountRial: String(dto.amountRial),
        gateway: dto.gateway ?? 'mock',
        authority: null,
        transactionId: null,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.ONLINE,
        paidAt: null,
        callbackPayload: null,
      }),
    );

    const paymentRequest = await this.mockGateway.requestPayment({
      amountRial: payment.amountRial,
      paymentId: payment.id,
      description: 'Abshar Academy invoice ' + invoice.invoiceNumber,
      returnUrl:
        process.env.PAYMENT_RETURN_URL ??
        'http://localhost:3000/payment/callback',
    });

    payment.authority = paymentRequest.authority;
    await this.payments.save(payment);

    return {
      paymentId: payment.id,
      authority: payment.authority,
      amountRial: payment.amountRial,
      checkoutUrl: paymentRequest.checkoutUrl,
    };
  }

  async callback(dto: PaymentCallbackDto) {
    const payment = await this.payments.findOne({
      where: { authority: dto.authority },
      relations: { invoice: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.PENDING) return payment;

    if (dto.status !== 'success') {
      payment.status = PaymentStatus.FAILED;
      payment.callbackPayload = dto as unknown as Record<string, unknown>;
      return this.payments.save(payment);
    }

    const verification = await this.mockGateway.verifyPayment({
      authority: dto.authority,
      amountRial: payment.amountRial,
    });

    if (!verification.success) {
      payment.status = PaymentStatus.FAILED;
      payment.callbackPayload = dto as unknown as Record<string, unknown>;
      return this.payments.save(payment);
    }

    return this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(Payment);
      const invoiceRepo = manager.getRepository(Invoice);

      const lockedPayment = await paymentRepo.findOne({
        where: { id: payment.id },
        relations: { invoice: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedPayment) throw new NotFoundException('Payment not found');
      if (lockedPayment.status !== PaymentStatus.PENDING) return lockedPayment;

      lockedPayment.status = PaymentStatus.SUCCESS;
      lockedPayment.transactionId =
        dto.transactionId ?? verification.transactionId ?? null;
      lockedPayment.paidAt = new Date();
      lockedPayment.callbackPayload =
        dto as unknown as Record<string, unknown>;
      await paymentRepo.save(lockedPayment);

      if (lockedPayment.invoice) {
        lockedPayment.invoice.paidRial = String(
          BigInt(lockedPayment.invoice.paidRial) +
            BigInt(lockedPayment.amountRial),
        );

        const paid = BigInt(lockedPayment.invoice.paidRial);
        const total = BigInt(lockedPayment.invoice.totalRial);
        lockedPayment.invoice.status =
          paid >= total
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;

        await invoiceRepo.save(lockedPayment.invoice);
      }

      return lockedPayment;
    });
  }

  async createExpense(dto: CreateExpenseDto) {
    return this.expenses.save(
      this.expenses.create({
        title: dto.title,
        category: dto.category,
        amountRial: String(dto.amountRial),
        occurredOn: dto.occurredOn,
        season: dto.season ?? null,
        description: dto.description ?? null,
      }),
    );
  }

  async listExpenses(query: FinanceQueryDto) {
    const qb = this.expenses.createQueryBuilder('expense');

    if (query.from) {
      qb.andWhere('expense.occurred_on >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('expense.occurred_on <= :to', { to: query.to });
    }
    if (query.season) {
      qb.andWhere('expense.season = :season', { season: query.season });
    }

    return qb.orderBy('expense.occurred_on', 'DESC').getMany();
  }

  async summary(query: FinanceQueryDto) {
    const from = query.from ?? '2000-01-01';
    const to = query.to ?? '2999-12-31';

    const [incomeRows, expenseRows] = await Promise.all([
      this.dataSource.query(
        'SELECT COALESCE(SUM(amount_rial),0)::text AS total FROM payments WHERE status = $1 AND paid_at::date BETWEEN $2 AND $3',
        [PaymentStatus.SUCCESS, from, to],
      ),
      this.dataSource.query(
        'SELECT COALESCE(SUM(amount_rial),0)::text AS total FROM expenses WHERE occurred_on BETWEEN $1 AND $2',
        [from, to],
      ),
    ]);

    const income = BigInt(incomeRows[0].total);
    const expenses = BigInt(expenseRows[0].total);

    return {
      from,
      to,
      incomeRial: income.toString(),
      expensesRial: expenses.toString(),
      netRial: (income - expenses).toString(),
    };
  }

  private async isParentPlayer(userId: string, playerId: string) {
    const rows = await this.dataSource.query(
      'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
      [playerId, userId],
    );
    return rows.length > 0;
  }
}
