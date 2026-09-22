import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Level } from './level.entity';
import { Hall } from './hall.entity';
import { ClassGender } from '../enums/class-gender.enum';
import { TrainingDay } from '../enums/training-day.enum';

@Entity('training_groups')
@Index(['hall', 'trainingDay', 'startTime'])
export class TrainingGroup extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @ManyToOne(() => Level, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_id' })
  level!: Level | null;

  @ManyToOne(() => Hall, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'hall_id' })
  hall!: Hall;

  @ManyToOne(() => Coach, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'coach_id' })
  coach!: Coach;

  @Column({ type: 'enum', enum: ClassGender })
  gender!: ClassGender;

  @Column({ name: 'training_day', type: 'enum', enum: TrainingDay })
  trainingDay!: TrainingDay;

  @Column({ name: 'start_time', type: 'time without time zone' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time without time zone' })
  endTime!: string;

  @Column({ type: 'integer', nullable: true })
  capacity!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
