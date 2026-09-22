import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Player } from '../players/entities/player.entity';
import { PlayerGuardian } from '../players/entities/player-guardian.entity';
import { TrainingGroup } from '../academy/entities/training-group.entity';
import { TrainingSession } from '../academy/entities/training-session.entity';
import { Attendance } from './entities/attendance.entity';
import { AttendanceSource } from './enums/attendance-source.enum';
import { AttendanceStatus } from './enums/attendance-status.enum';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QrAttendanceDto } from './dto/qr-attendance.dto';

interface QrPayload {
  sessionId: string;
  type: 'attendance_qr';
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(Attendance) private readonly attendance: Repository<Attendance>,
    @InjectRepository(TrainingSession) private readonly sessions: Repository<TrainingSession>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(PlayerGuardian) private readonly playerGuardians: Repository<PlayerGuardian>,
    @InjectRepository(TrainingGroup) private readonly groups: Repository<TrainingGroup>,
  ) {}

  async createQr(sessionId: string) {
    const session = await this.sessions.findOne({
      where: { id: sessionId },
      relations: { trainingGroup: true },
    });
    if (!session) throw new NotFoundException('Training session not found');

    return {
      token: await this.jwtService.signAsync(
        { sessionId, type: 'attendance_qr' },
        {
          secret: this.configService.getOrThrow<string>('ATTENDANCE_QR_SECRET'),
          expiresIn: '12h',
        },
      ),
      expiresAt: session.endsAt,
      sessionId,
    };
  }

  async markBulk(sessionId: string, dto: BulkAttendanceDto) {
    const session = await this.sessions.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Training session not found');

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Attendance);
      const result: Attendance[] = [];

      for (const item of dto.items) {
        const player = await manager.getRepository(Player).findOne({
          where: { id: item.playerId },
        });
        if (!player) throw new NotFoundException('Player not found: ' + item.playerId);

        let record = await repo.findOne({
          where: {
            trainingSession: { id: sessionId },
            player: { id: item.playerId },
          },
        });

        if (!record) {
          record = repo.create({
            trainingSession: session,
            player,
            status: item.status,
            source: AttendanceSource.COACH,
            checkedAt: new Date(),
            note: item.note ?? null,
          });
        } else {
          record.status = item.status;
          record.source = AttendanceSource.COACH;
          record.checkedAt = new Date();
          record.note = item.note ?? null;
        }

        result.push(await repo.save(record));
      }

      return result;
    });
  }

  async markQr(dto: QrAttendanceDto) {
    let payload: QrPayload;
    try {
      payload = await this.jwtService.verifyAsync<QrPayload>(dto.token, {
        secret: this.configService.getOrThrow<string>('ATTENDANCE_QR_SECRET'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired QR code');
    }

    if (payload.type !== 'attendance_qr' || !payload.sessionId) {
      throw new BadRequestException('Invalid QR payload');
    }

    const session = await this.sessions.findOne({ where: { id: payload.sessionId }, relations: { trainingGroup: true } });
    const player = await this.players.findOne({ where: { id: dto.playerId } });

    if (!session) throw new NotFoundException('Training session not found');
    if (!player) throw new NotFoundException('Player not found');

    const enrolled = await this.dataSource.query(
      'SELECT 1 FROM training_group_enrollments WHERE training_group_id = $1 AND player_id = $2 AND is_active = true AND starts_on <= $3 AND (ends_on IS NULL OR ends_on >= $3) LIMIT 1',
      [session.trainingGroup.id, dto.playerId, session.sessionDate],
    );

    if (!enrolled.length) {
      throw new ForbiddenException('Player is not enrolled in this training group');
    }

    let record = await this.attendance.findOne({
      where: {
        trainingSession: { id: session.id },
        player: { id: player.id },
      },
    });

    if (!record) {
      record = this.attendance.create({
        trainingSession: session,
        player,
        status: AttendanceStatus.PRESENT,
        source: AttendanceSource.QR,
        checkedAt: new Date(),
        note: null,
      });
    } else {
      record.status = AttendanceStatus.PRESENT;
      record.source = AttendanceSource.QR;
      record.checkedAt = new Date();
    }

    return this.attendance.save(record);
  }

  async listForPlayer(playerId: string, user: User) {
    if (user.role === UserRole.PARENT) {
      const allowed = await this.playerGuardians.findOne({
        where: { player: { id: playerId }, guardian: { user: { id: user.id } } },
      });
      if (!allowed) throw new ForbiddenException('You cannot access this player');
    }

    return this.attendance.find({
      where: { player: { id: playerId } },
      relations: { trainingSession: { trainingGroup: true } },
      order: { checkedAt: 'DESC' },
    });
  }
}
