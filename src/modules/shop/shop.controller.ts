import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ShopService } from './shop.service';

@Controller()
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get('shop/products')
  listProducts() {
    return this.shop.listProducts();
  }

  @Post('admin/shop/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createProduct(@Body() dto: CreateProductDto) {
    return this.shop.createProduct(dto);
  }

  @Post('shop/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.shop.createOrder(user, dto);
  }

  @Get('shop/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  listOrders(@CurrentUser() user: User, @Query('playerId') playerId?: string) {
    return this.shop.listOrders(user, playerId);
  }
}
