import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Coach } from '../coaches/entities/coach.entity';
import { Level } from '../academy/entities/level.entity';
import { GuardianType } from './enums/guardian-type.enum';
import { PlayerStatus } from './enums/player-status.enum';
import { Guardian } from './entities/guardian.entity';
import { PlayerGuardian } from './entities/player-guardian.entity';
import { Player } from './entities/player.entity';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerQueryDto } from './dto/player-query.dto';

@Injectable()
export class PlayersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Guardian) private readonly guardians: Repository<Guardian>,
    @InjectRepository(PlayerGuardian) private readonly playerGuardians: Repository<PlayerGuardian>,
    @InjectRepository(Level) private readonly levels: Repository<Level>,
    @InjectRepository(Coach) private readonly coaches: Repository<Coach>,
  ) {}

  async register(dto: RegisterPlayerDto) {
    if (!dto.fatherMobile && !dto.motherMobile) {
      throw new BadRequestException('At least one parent mobile number is required');
    }
    if (!dto.parentalConsent || !dto.academyTermsAccepted) {
      throw new BadRequestException('Required consents were not accepted');
    }

    const existingPlayer = await this.players.findOne({
      where: { nationalId: dto.nationalId },
      withDeleted: true,
    });
    if (existingPlayer) {
      throw new ConflictException('A player with this national ID already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      const playerRepo = manager.getRepository(Player);
      const guardianRepo = manager.getRepository(Guardian);
      const relationRepo = manager.getRepository(PlayerGuardian);
      const userRepo = manager.getRepository(User);
      const levelRepo = manager.getRepository(Level);
      const coachRepo = manager.getRepository(Coach);

      const primaryMobile = dto.fatherMobile ?? dto.motherMobile!;
      let primaryUser = await userRepo.findOne({
        where: dto.parentEmail
          ? [{ mobile: primaryMobile }, { email: dto.parentEmail }]
          : [{ mobile: primaryMobile }],
      });

      if (primaryUser && primaryUser.role !== UserRole.PARENT) {
        throw new ConflictException('The parent mobile is already assigned to another account');
      }

      if (!primaryUser) {
        if (!dto.parentPassword) {
          throw new BadRequestException('parentPassword is required for a new parent account');
        }
        primaryUser = userRepo.create({
          mobile: primaryMobile,
          email: dto.parentEmail ?? null,
          passwordHash: await bcrypt.hash(dto.parentPassword, 12),
          role: UserRole.PARENT,
          isActive: true,
        });
        await userRepo.save(primaryUser);
      } else if (dto.parentEmail && !primaryUser.email) {
        primaryUser.email = dto.parentEmail;
        await userRepo.save(primaryUser);
      }

      const getOrCreateGuardian = async (
        firstName: string,
        lastName: string,
        occupation: string | undefined,
        mobile: string | undefined,
        eitaaMobile: string | undefined,
        user: User | null,
      ): Promise<Guardian | null> => {
        if (!mobile) return null;
        let guardian = await guardianRepo.findOne({
          where: { mobile },
          relations: { user: true },
        });
        if (!guardian) {
          guardian = guardianRepo.create({
            firstName,
            lastName,
            occupation: occupation ?? null,
            mobile,
            eitaaMobile: eitaaMobile ?? null,
            user,
          });
          return guardianRepo.save(guardian);
        }
        if (!guardian.user && user) guardian.user = user;
        return guardianRepo.save(guardian);
      };

      const father = await getOrCreateGuardian(
        dto.fatherFirstName,
        dto.fatherLastName,
        dto.fatherOccupation,
        dto.fatherMobile,
        dto.fatherEitaaMobile,
        dto.fatherMobile === primaryMobile ? primaryUser : null,
      );
      const mother = await getOrCreateGuardian(
        dto.motherFirstName,
        dto.motherLastName,
        dto.motherOccupation,
        dto.motherMobile,
        dto.motherEitaaMobile,
        dto.motherMobile === primaryMobile ? primaryUser : null,
      );

      const level = await levelRepo.findOne({ where: { code: 'BEGINNER' } });
      const coach = await coachRepo.findOne({
        where: { firstName: 'احمد', lastName: 'احمدی', isActive: true },
      });

      const sequence = (await manager.query(
        "SELECT nextval('player_code_seq') AS value",
      )) as Array<{ value: string }>;
      const playerCode = 'AA-' + String(sequence[0].value).padStart(4, '0');

      const player = playerRepo.create({
        user: null,
        playerCode,
        firstNameFa: dto.firstNameFa,
        lastNameFa: dto.lastNameFa,
        fullNameLatin: dto.fullNameLatin,
        birthDate: dto.birthDate,
        nationalId: dto.nationalId,
        gender: dto.gender,
        heightCm: dto.heightCm,
        weightKg: String(dto.weightKg),
        dominantHand: dto.dominantHand,
        playingPosition: dto.playingPosition ?? null,
        previousClub: dto.previousClub ?? null,
        medicalConditions: dto.medicalConditions ?? null,
        allergies: dto.allergies ?? null,
        playerMobile: dto.playerMobile ?? null,
        eitaaMobile: dto.eitaaMobile ?? null,
        emergencyContact: dto.emergencyContact,
        address: dto.address,
        postalCode: dto.postalCode ?? null,
        heightWithReachCm: dto.heightWithReachCm ?? null,
        verticalJumpCm: dto.verticalJumpCm ?? null,
        wingspanCm: dto.wingspanCm ?? null,
        volleyballExperience: dto.volleyballExperience ?? null,
        currentTeamOrSchool: dto.currentTeamOrSchool ?? null,
        goal: dto.goal,
        technicalLevel: level,
        responsibleCoach: coach,
        startTrainingMonth: dto.startTrainingMonth,
        insuranceExpiryDate: dto.insuranceExpiryDate,
        clothingSize: dto.clothingSize ?? null,
        shoeSize: dto.shoeSize ?? null,
        status: PlayerStatus.PENDING,
        parentalConsentAt: new Date(),
        mediaConsentAt: dto.mediaConsent ? new Date() : null,
        academyTermsAcceptedAt: new Date(),
      });
      await playerRepo.save(player);

      if (father) {
        await relationRepo.save(
          relationRepo.create({
            player,
            guardian: father,
            relationship: GuardianType.FATHER,
            isPrimaryContact: dto.fatherMobile === primaryMobile,
          }),
        );
      }
      if (mother && (!father || mother.id !== father.id)) {
        await relationRepo.save(
          relationRepo.create({
            player,
            guardian: mother,
            relationship: GuardianType.MOTHER,
            isPrimaryContact: !father && dto.motherMobile === primaryMobile,
          }),
        );
      }

      return {
        id: player.id,
        playerCode: player.playerCode,
        status: player.status,
        parentUserId: primaryUser.id,
        technicalLevel: level
          ? { id: level.id, code: level.code, name: level.name }
          : null,
        responsibleCoach: coach
          ? { id: coach.id, firstName: coach.firstName, lastName: coach.lastName }
          : null,
      };
    });
  }

  async list(query: PlayerQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.players
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.technicalLevel', 'level')
      .leftJoinAndSelect('player.responsibleCoach', 'coach');

    if (query.search) {
      qb.andWhere(
        '(player.first_name_fa ILIKE :search OR player.last_name_fa ILIKE :search OR player.full_name_latin ILIKE :search OR player.player_code ILIKE :search OR player.national_id ILIKE :search)',
        { search: '%' + query.search + '%' },
      );
    }
    if (query.levelId) qb.andWhere('level.id = :levelId', { levelId: query.levelId });
    if (query.coachId) qb.andWhere('coach.id = :coachId', { coachId: query.coachId });
    if (query.status) qb.andWhere('player.status = :status', { status: query.status });

    qb.orderBy('player.created_at', 'DESC').skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  async getById(id: string): Promise<Player> {
    const player = await this.players.findOne({
      where: { id },
      relations: { technicalLevel: true, responsibleCoach: true, user: true },
    });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async getForUser(id: string, user: User): Promise<Player> {
    const player = await this.getById(id);
    if (user.role === UserRole.ADMIN || user.role === UserRole.COACH) return player;

    const relation = await this.playerGuardians.findOne({
      where: { player: { id: player.id }, guardian: { user: { id: user.id } } },
      relations: { guardian: { user: true } },
    });
    if (!relation) throw new ForbiddenException('You cannot access this player');
    return player;
  }

  async getMyChildren(userId: string): Promise<Player[]> {
    return this.players
      .createQueryBuilder('player')
      .innerJoin('player_guardians', 'pg', 'pg.player_id = player.id')
      .innerJoin('guardians', 'g', 'g.id = pg.guardian_id')
      .innerJoin('users', 'u', 'u.id = g.user_id')
      .where('u.id = :userId', { userId })
      .andWhere('player.deleted_at IS NULL')
      .leftJoinAndSelect('player.technicalLevel', 'level')
      .leftJoinAndSelect('player.responsibleCoach', 'coach')
      .orderBy('player.first_name_fa', 'ASC')
      .getMany();
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<Player> {
    const player = await this.getById(id);
    const clean = { ...dto } as Record<string, unknown>;
    delete clean.fatherFirstName;
    delete clean.fatherLastName;
    delete clean.fatherOccupation;
    delete clean.fatherMobile;
    delete clean.fatherEitaaMobile;
    delete clean.motherFirstName;
    delete clean.motherLastName;
    delete clean.motherOccupation;
    delete clean.motherMobile;
    delete clean.motherEitaaMobile;
    delete clean.parentEmail;
    delete clean.parentPassword;
    delete clean.parentalConsent;
    delete clean.mediaConsent;
    delete clean.academyTermsAccepted;

    for (const [key, value] of Object.entries(clean)) {
      if (value !== undefined && key in player) {
        (player as unknown as Record<string, unknown>)[key] = value;
      }
    }
    if (dto.parentalConsent === true && !player.parentalConsentAt) player.parentalConsentAt = new Date();
    if (dto.mediaConsent === true) player.mediaConsentAt = new Date();
    if (dto.academyTermsAccepted === true) player.academyTermsAcceptedAt = new Date();
    return this.players.save(player);
  }

  async approve(id: string): Promise<Player> {
    const player = await this.getById(id);
    if (player.status !== PlayerStatus.PENDING) {
      throw new BadRequestException('Only pending players can be approved');
    }
    player.status = PlayerStatus.ACTIVE;
    return this.players.save(player);
  }
}
