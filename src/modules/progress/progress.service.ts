import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Coach } from '../coaches/entities/coach.entity';
import { Player } from '../players/entities/player.entity';
import { ProgressReport } from './entities/progress-report.entity';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ProgressReport) private readonly reports: Repository<ProgressReport>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Coach) private readonly coaches: Repository<Coach>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProgressReportDto, user: User) {
    if (user.role !== UserRole.COACH) {
      throw new ForbiddenException('Only coaches can create progress reports');
    }

    if (dto.periodEnd < dto.periodStart) {
      throw new BadRequestException('periodEnd must be after periodStart');
    }

    const player = await this.players.findOne({ where: { id: dto.playerId }, relations: { responsibleCoach: { user: true } } });
    if (!player) throw new NotFoundException('Player not found');
    if (player.responsibleCoach?.user?.id !== user.id) {
      throw new ForbiddenException('You are not the responsible coach for this player');
    }

    const coach = await this.coaches.findOne({
      where: { user: { id: user.id }, isActive: true },
    });
    if (!coach) throw new NotFoundException('Coach profile not found');

    return this.reports.save(
      this.reports.create({
        player,
        coach,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        physicalNotes: dto.physicalNotes ?? null,
        technicalNotes: dto.technicalNotes ?? null,
        psychologicalNotes: dto.psychologicalNotes ?? null,
        generalNotes: dto.generalNotes ?? null,
      }),
    );
  }

  async listForPlayer(playerId: string, user: User) {
    if (user.role === UserRole.PARENT) {
      const allowed = await this.dataSource.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [playerId, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot access this player');
    }

    return this.reports.find({
      where: { player: { id: playerId } },
      relations: { coach: true },
      order: { periodEnd: 'DESC' },
    });
  }
}
