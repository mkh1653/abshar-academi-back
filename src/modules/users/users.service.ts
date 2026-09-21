import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByLogin(login: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where(
        new Brackets((qb) => {
          qb.where('user.mobile = :login', { login }).orWhere(
            'user.email = :login',
            { login },
          );
        }),
      )
      .getOne();
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  create(user: Partial<User>): User {
    return this.usersRepository.create(user);
  }

  save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
