import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Player } from '../players/entities/player.entity';
import { PlayerGuardian } from '../players/entities/player-guardian.entity';
import { Coach } from '../coaches/entities/coach.entity';
import { CreateHallDto } from './dto/create-hall.dto';
import { CreateTrainingGroupDto } from './dto/create-training-group.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { EnrollPlayerDto } from './dto/enroll-player.dto';
import { Hall } from './entities/hall.entity';
import { Level } from './entities/level.entity';
import { TrainingGroup } from './entities/training-group.entity';
import { Enrollment } from './entities/enrollment.entity';
import { TrainingSession } from './entities/training-session.entity';
import { SessionStatus } from './enums/session-status.enum';

@Injectable()
export class AcademyService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Level) private readonly levels: Repository<Level>,
    @InjectRepository(Hall) private readonly halls: Repository<Hall>,
    @InjectRepository(TrainingGroup) private readonly groups: Repository<TrainingGroup>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
    @InjectRepository(TrainingSession) private readonly sessions: Repository<TrainingSession>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Coach) private readonly coaches: Repository<Coach>,
    @InjectRepository(PlayerGuardian) private readonly playerGuardians: Repository<PlayerGuardian>,
  ) {}

  listLevels() {
    return this.levels.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  listHalls() {
    return this.halls.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  listTrainingGroups() {
    return this.groups.find({
      where: { isActive: true },
      relations: { level: true, hall: true, coach: true },
      order: { name: 'ASC' },
    });
  }

  async createHall(dto: CreateHallDto) {
    return this.halls.save(
      this.halls.create({
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity ?? null,
        latitude: dto.latitude === undefined ? null : String(dto.latitude),
        longitude: dto.longitude === undefined ? null : String(dto.longitude),
        isActive: true,
      }),
    );
  }

  async createTrainingGroup(dto: CreateTrainingGroupDto) {
    const [hall, coach, level] = await Promise.all([
      this.halls.findOne({ where: { id: dto.hallId } }),
      this.coaches.findOne({ where: { id: dto.coachId, isActive: true } }),
      dto.levelId ? this.levels.findOne({ where: { id: dto.levelId } }) : null,
    ]);

    if (!hall) throw new NotFoundException('Hall not found');
    if (!coach) throw new NotFoundException('Coach not found');
    if (dto.levelId && !level) throw new NotFoundException('Level not found');
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    return this.groups.save(
      this.groups.create({
        name: dto.name,
        hall,
        coach,
        level: level ?? null,
        gender: dto.gender,
        trainingDay: dto.trainingDay,
        startTime: dto.startTime,
        endTime: dto.endTime,
        capacity: dto.capacity ?? hall.capacity ?? null,
        isActive: true,
      }),
    );
  }

  async enrollPlayer(groupId: string, dto: EnrollPlayerDto) {
    const [group, player] = await Promise.all([
      this.groups.findOne({ where: { id: groupId }, relations: { level: true, hall: true } }),
      this.players.findOne({ where: { id: dto.playerId } }),
    ]);
    if (!group) throw new NotFoundException('Training group not found');
    if (!player) throw new NotFoundException('Player not found');

    const existing = await this.enrollments.findOne({
      where: {
        player: { id: dto.playerId },
        trainingGroup: { id: groupId },
        isActive: true,
      },
    });
    if (existing) throw new BadRequestException('Player is already enrolled');

    if (group.capacity) {
      const count = await this.enrollments.count({
        where: { trainingGroup: { id: groupId }, isActive: true },
      });
      if (count >= group.capacity) throw new BadRequestException('Training group is full');
    }

    return this.enrollments.save(
      this.enrollments.create({
        player,
        trainingGroup: group,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn ?? null,
        isActive: true,
        note: dto.note ?? null,
      }),
    );
  }

  async createSession(dto: CreateTrainingSessionDto) {
    const group = await this.groups.findOne({ where: { id: dto.trainingGroupId } });
    if (!group) throw new NotFoundException('Training group not found');
    if (new Date(dto.endsAt).getTime() <= new Date(dto.startsAt).getTime()) {
      throw new BadRequestException('Session end must be after start');
    }

    const existing = await this.sessions.findOne({
      where: {
        trainingGroup: { id: group.id },
        sessionDate: dto.sessionDate,
      },
    });
    if (existing) throw new BadRequestException('A session already exists for this date');

    return this.sessions.save(
      this.sessions.create({
        trainingGroup: group,
        sessionDate: dto.sessionDate,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        status: dto.status ?? SessionStatus.SCHEDULED,
      }),
    );
  }

  async getPlayerSchedule(playerId: string, user: User) {
    if (user.role === UserRole.PARENT) {
      const allowed = await this.dataSource.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [playerId, user.id],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot access this player');
    }

    return this.enrollments.find({
      where: { player: { id: playerId }, isActive: true },
      relations: {
        trainingGroup: {
          level: true,
          hall: true,
          coach: true,
        },
      },
    });
  }

  async upcomingSessions(playerId: string, user: User) {
    await this.getPlayerSchedule(playerId, user);

    return this.sessions
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.trainingGroup', 'group')
      .innerJoinAndSelect('group.hall', 'hall')
      .innerJoinAndSelect('group.coach', 'coach')
      .innerJoin(
        'training_group_enrollments',
        'enrollment',
        'enrollment.training_group_id = group.id AND enrollment.player_id = :playerId AND enrollment.is_active = true',
        { playerId },
      )
      .where('session.session_date >= CURRENT_DATE')
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .orderBy('session.starts_at', 'ASC')
      .getMany();
  }
}
