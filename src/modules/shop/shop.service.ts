import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Player } from '../players/entities/player.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './enums/order-status.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreatePaymentDto } from '../finance/dto/create-payment.dto';
import { Payment } from '../finance/entities/payment.entity';
import { PaymentStatus } from '../finance/enums/payment-status.enum';
import { PaymentMethod } from '../finance/enums/payment-method.enum';
import { MockPaymentGateway } from '../finance/mock-payment.gateway';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class ShopService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductVariant) private readonly variants: Repository<ProductVariant>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem) private readonly items: Repository<OrderItem>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    private readonly mockPaymentGateway: MockPaymentGateway,
    @InjectRepository(Player) private readonly players: Repository<Player>,
  ) {}

  listProducts() {
    return this.products.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  createProduct(dto: CreateProductDto) {
    return this.products.save(this.products.create({
      sku: dto.sku,
      name: dto.name,
      description: dto.description ?? null,
      priceRial: String(dto.priceRial),
      isActive: true,
    }));
  }

  async createVariant(dto: CreateVariantDto) {
    const product = await this.products.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.variants.save(this.variants.create({
      product,
      sku: dto.sku,
      size: dto.size ?? null,
      stockQuantity: dto.stockQuantity,
      priceRial: dto.priceRial === undefined ? null : String(dto.priceRial),
    }));
  }

  async createOrder(user: User, dto: CreateOrderDto) {
    const player = await this.players.findOne({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Player not found');

    if (user.role === UserRole.PARENT) {
      const allowed = await this.dataSource.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [player.id, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot create an order for this player');
    }

    if (!dto.items.length) throw new BadRequestException('Order is empty');

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const variantRepo = manager.getRepository(ProductVariant);
      const orderRepo = manager.getRepository(Order);
      const itemRepo = manager.getRepository(OrderItem);

      const sequence = (await manager.query(
        "SELECT nextval('shop_order_number_seq') AS value",
      )) as Array<{ value: string }>;

      const order = orderRepo.create({
        player,
        orderNumber: 'ORD-' + new Date().getFullYear() + '-' + String(sequence[0].value).padStart(6, '0'),
        totalRial: '0',
        status: OrderStatus.PENDING,
        shippingAddress: dto.shippingAddress ?? player.address,
      });
      await orderRepo.save(order);

      let total = 0n;
      for (const input of dto.items) {
        const product = await productRepo.findOne({ where: { id: input.productId, isActive: true } });
        if (!product) throw new NotFoundException('Product not found');

        const variant = input.variantId
          ? await variantRepo.findOne({ where: { id: input.variantId }, relations: { product: true } })
          : null;

        if (input.variantId && (!variant || variant.product.id !== product.id)) {
          throw new BadRequestException('Invalid product variant');
        }
        if (input.quantity <= 0) throw new BadRequestException('Quantity must be positive');
        if (variant && variant.stockQuantity < input.quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        const unitPrice = variant?.priceRial ?? product.priceRial;
        total += BigInt(unitPrice) * BigInt(input.quantity);

        if (variant) {
          variant.stockQuantity -= input.quantity;
          await variantRepo.save(variant);
        }

        await itemRepo.save(itemRepo.create({
          order,
          product,
          variant,
          title: product.name,
          quantity: input.quantity,
          unitPriceRial: String(unitPrice),
          size: input.size ?? variant?.size ?? null,
          jerseyNumber: input.jerseyNumber ?? null,
        }));
      }

      order.totalRial = total.toString();
      await orderRepo.save(order);

      return orderRepo.findOne({
        where: { id: order.id },
        relations: { player: true, items: { product: true, variant: true } },
      });
    });
  }

  async initiatePayment(user: User, dto: CreatePaymentDto) {
    const order = await this.orders.findOne({
      where: { id: dto.invoiceId },
      relations: { player: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (user.role === UserRole.PARENT) {
      const allowed = await this.dataSource.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [order.player.id, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot pay this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not payable');
    }

    if (BigInt(dto.amountRial) !== BigInt(order.totalRial)) {
      throw new BadRequestException('Payment amount must equal order total');
    }

    const payment = await this.payments.save(
      this.payments.create({
        invoice: null,
        order,
        amountRial: order.totalRial,
        gateway: 'mock',
        authority: null,
        transactionId: null,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.ONLINE,
        paidAt: null,
        callbackPayload: null,
      }),
    );

    const request = await this.mockPaymentGateway.requestPayment({
      amountRial: payment.amountRial,
      paymentId: payment.id,
      description: 'Abshar Academy order ' + order.orderNumber,
      returnUrl: process.env.PAYMENT_RETURN_URL ?? 'http://localhost:3000/payment/callback',
    });

    payment.authority = request.authority;
    await this.payments.save(payment);

    return {
      paymentId: payment.id,
      authority: payment.authority,
      amountRial: payment.amountRial,
      checkoutUrl: request.checkoutUrl,
    };
  }

  async paymentCallback(dto: import('../finance/dto/payment-callback.dto').PaymentCallbackDto) {
    const payment = await this.payments.findOne({
      where: { authority: dto.authority },
      relations: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.PENDING) return payment;

    if (dto.status !== 'success') {
      payment.status = PaymentStatus.FAILED;
      payment.callbackPayload = dto as unknown as Record<string, unknown>;
      return this.payments.save(payment);
    }

    const verified = await this.mockPaymentGateway.verifyPayment({
      authority: dto.authority,
      amountRial: payment.amountRial,
    });
    if (!verified.success) throw new BadRequestException('Payment verification failed');

    return this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(Payment);
      const orderRepo = manager.getRepository(Order);
      const lockedPayment = await paymentRepo.findOne({
        where: { id: payment.id },
        relations: { order: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedPayment) throw new NotFoundException('Payment not found');
      if (lockedPayment.status !== PaymentStatus.PENDING) return lockedPayment;

      lockedPayment.status = PaymentStatus.SUCCESS;
      lockedPayment.transactionId = dto.transactionId ?? verified.transactionId ?? null;
      lockedPayment.paidAt = new Date();
      lockedPayment.callbackPayload = dto as unknown as Record<string, unknown>;
      await paymentRepo.save(lockedPayment);

      if (lockedPayment.order) {
        lockedPayment.order.status = OrderStatus.PAID;
        await orderRepo.save(lockedPayment.order);
      }

      return lockedPayment;
    });
  }

  listOrders(user: User, playerId?: string) {
    const qb = this.orders
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.player', 'player')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant');

    if (user.role === UserRole.PARENT) {
      return this.dataSource.query(
        'SELECT p.id FROM players p INNER JOIN player_guardians pg ON pg.player_id = p.id INNER JOIN guardians g ON g.id = pg.guardian_id WHERE g.user_id = $1 AND p.deleted_at IS NULL',
        [user.id],
      ).then(async (rows: Array<{ id: string }>) => {
        if (!rows.length) return [];
        qb.where('player.id IN (:...ids)', { ids: rows.map((row) => row.id) });
        if (playerId) {
          if (!rows.some((row) => row.id === playerId)) throw new ForbiddenException('You cannot access this player');
          qb.andWhere('player.id = :playerId', { playerId });
        }
        return qb.orderBy('order.created_at', 'DESC').getMany();
      });
    }

    if (playerId) qb.where('player.id = :playerId', { playerId });
    return qb.orderBy('order.created_at', 'DESC').getMany();
  }
}
