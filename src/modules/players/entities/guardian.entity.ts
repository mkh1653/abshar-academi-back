import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('guardians')
@Index(['mobile'], { unique: true })
export class Guardian extends BaseEntity {
  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  occupation!: string | null;

  @Column({ type: 'varchar', length: 20 })
  mobile!: string;

  @Column({ name: 'eitaa_mobile', type: 'varchar', length: 20, nullable: true })
  eitaaMobile!: string | null;
}
