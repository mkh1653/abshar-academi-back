import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Coach } from '../coaches/entities/coach.entity';
import { Player } from '../players/entities/player.entity';
import { Level } from '../academy/entities/level.entity';
import { PlayerAssessment } from './entities/player-assessment.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PlayerAssessment) private readonly assessments: Repository<PlayerAssessment>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Level) private readonly levels: Repository<Level>,
    @InjectRepository(Coach) private readonly coaches: Repository<Coach>,
  ) {}

  async create(dto: CreateAssessmentDto, user: User) {
    if (user.role !== UserRole.COACH && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only coaches can create technical assessments');
    }

    const [player, level] = await Promise.all([
      this.players.findOne({ where: { id: dto.playerId } }),
      dto.recommendedLevelId
        ? this.levels.findOne({ where: { id: dto.recommendedLevelId } })
        : null,
    ]);

    if (!player) throw new NotFoundException('Player not found');
    if (user.role === UserRole.COACH && player.responsibleCoach?.user?.id !== user.id) {
      throw new ForbiddenException('You are not the responsible coach for this player');
    }
    if (dto.recommendedLevelId && !level) {
      throw new NotFoundException('Level not found');
    }

    const coach = await this.coaches.findOne({
      where: user.role === UserRole.COACH
        ? { user: { id: user.id }, isActive: true }
        : { id: player.responsibleCoach?.id ?? '' },
      relations: { user: true },
    });

    if (!coach) throw new NotFoundException('Coach profile not found');

    return this.dataSource.transaction(async (manager) => {
      const assessmentRepo = manager.getRepository(PlayerAssessment);
      const playerRepo = manager.getRepository(Player);
      const entity = assessmentRepo.create({
        player,
        coach,
        recommendedLevel: level ?? null,
        assessedAt: dto.assessedAt,
        heightCm: dto.heightCm ?? null,
        weightKg: dto.weightKg === undefined ? null : String(dto.weightKg),
        reachCm: dto.reachCm ?? null,
        verticalJumpCm: dto.verticalJumpCm ?? null,
        speedScore: dto.speedScore ?? null,
        passingScore: dto.passingScore ?? null,
        receptionScore: dto.receptionScore ?? null,
        settingScore: dto.settingScore ?? null,
        servingScore: dto.servingScore ?? null,
        attackScore: dto.attackScore ?? null,
        blockScore: dto.blockScore ?? null,
        defenseScore: dto.defenseScore ?? null,
        strengthScore: dto.strengthScore ?? null,
        notes: dto.notes ?? null,
      });

      await assessmentRepo.save(entity);

      if (level) {
        player.technicalLevel = level;
        await playerRepo.save(player);
      }

      return entity;
    });
  }

  async listForPlayer(playerId: string, user: User) {
    if (user.role === UserRole.PARENT) {
      const allowed = await this.dataSource.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [playerId, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot access this player');
    }

    return this.assessments.find({
      where: { player: { id: playerId } },
      relations: { coach: true, recommendedLevel: true },
      order: { assessedAt: 'DESC' },
    });
  }
}
