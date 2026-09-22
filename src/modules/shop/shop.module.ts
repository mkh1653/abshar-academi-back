import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Player } from '../players/entities/player.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, Order, OrderItem, Player]),
    AuthModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService, TypeOrmModule],
})
export class ShopModule {}
