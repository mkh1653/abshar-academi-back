import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Coach } from './entities/coach.entity';
import { CreateCoachDto } from './dto/create-coach.dto';

@Injectable()
export class CoachesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Coach) private readonly coaches: Repository<Coach>,
  ) {}

  list() {
    return this.coaches.find({ where: { isActive: true }, order: { firstName: 'ASC' } });
  }

  async create(dto: CreateCoachDto) {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const coachRepo = manager.getRepository(Coach);

      if (dto.mobile) {
        const existing = await userRepo.findOne({ where: { mobile: dto.mobile } });
        if (existing) throw new ConflictException('Mobile already exists');
      }
      if (dto.email) {
        const existing = await userRepo.findOne({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email already exists');
      }

      const user = userRepo.create({
        mobile: dto.mobile ?? null,
        email: dto.email ?? null,
        passwordHash: await bcrypt.hash(dto.password, 12),
        role: UserRole.COACH,
        isActive: true,
      });
      await userRepo.save(user);

      const coach = coachRepo.create({
        user,
        firstName: dto.firstName,
        lastName: dto.lastName,
        mobile: dto.mobile ?? null,
        bio: dto.bio ?? null,
        isActive: true,
      });

      return coachRepo.save(coach);
    });
  }

  async deactivate(id: string) {
    const coach = await this.coaches.findOne({ where: { id }, relations: { user: true } });
    if (!coach) return null;
    coach.isActive = false;
    if (coach.user) coach.user.isActive = false;
    await this.coaches.save(coach);
    if (coach.user) await this.dataSource.getRepository(User).save(coach.user);
    return coach;
  }
}
