import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('guardians')
export class Guardian extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true, unique: true })
  userId!: string | null;

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
