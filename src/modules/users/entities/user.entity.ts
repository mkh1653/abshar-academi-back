import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
@Index(['mobile'], { unique: true })
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PARENT,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
