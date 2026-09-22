import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptions: SubscriptionService) {}

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  create(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptions.create(user, dto);
  }

  @Get('players/:playerId/subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  list(@CurrentUser() user: User, @Param('playerId') playerId: string) {
    return this.subscriptions.listForPlayer(user, playerId);
  }
}
