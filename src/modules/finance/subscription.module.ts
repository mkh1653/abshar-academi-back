import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Player } from '../players/entities/player.entity';
import { PlayerSubscription } from './entities/player-subscription.entity';
import { Service } from './entities/service.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerSubscription, Player, Service]),
    AuthModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
