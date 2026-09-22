import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Player } from '../players/entities/player.entity';
import { PlayerSubscription } from './entities/player-subscription.entity';
import { Service } from './entities/service.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(PlayerSubscription) private readonly subscriptions: Repository<PlayerSubscription>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
  ) {}

  async create(user: User, dto: CreateSubscriptionDto) {
    const [player, service] = await Promise.all([
      this.players.findOne({ where: { id: dto.playerId } }),
      this.services.findOne({ where: { id: dto.serviceId, isActive: true } }),
    ]);

    if (!player) throw new NotFoundException('Player not found');
    if (!service) throw new NotFoundException('Service not found');

    if (user.role === UserRole.PARENT) {
      const allowed = await this.players.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [player.id, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot change this player subscription');
    }

    return this.subscriptions.save(
      this.subscriptions.create({
        player,
        service,
        billingCycle: dto.billingCycle,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn ?? null,
        unitPriceRial: String(dto.unitPriceRial),
        isActive: true,
      }),
    );
  }

  listForPlayer(user: User, playerId: string) {
    return this.subscriptions.find({
      where: { player: { id: playerId }, isActive: true },
      relations: { service: true },
    }).then(async (items) => {
      if (user.role !== UserRole.PARENT) return items;
      const allowed = await this.players.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [playerId, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot access this player');
      return items;
    });
  }
}
