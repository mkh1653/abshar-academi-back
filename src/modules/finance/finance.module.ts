import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { MockPaymentGateway } from './mock-payment.gateway';
import { Service } from './entities/service.entity';
import { PlayerSubscription } from './entities/player-subscription.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment } from './entities/payment.entity';
import { Expense } from './entities/expense.entity';
import { Discount } from './entities/discount.entity';
import { Player } from '../players/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      PlayerSubscription,
      Invoice,
      InvoiceItem,
      Payment,
      Expense,
      Discount,
      Player,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, MockPaymentGateway],
  exports: [FinanceService, TypeOrmModule],
})
export class FinanceModule {}
