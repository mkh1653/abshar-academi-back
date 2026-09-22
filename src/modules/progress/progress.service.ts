import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(dto: CreateProgressReportDto, user: User) {
    if (user.role !== UserRole.COACH) {
      throw new ForbiddenException('Only coaches can create progress reports');
    }

    if (dto.periodEnd < dto.periodStart) {
      throw new BadRequestException('periodEnd must be after periodStart');
    }

    const player = await this.players.findOne({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Player not found');

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

  listForPlayer(playerId: string) {
    return this.reports.find({
      where: { player: { id: playerId } },
      relations: { coach: true },
      order: { periodEnd: 'DESC' },
    });
  }
}
