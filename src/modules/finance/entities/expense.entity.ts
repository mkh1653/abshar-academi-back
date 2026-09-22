import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { ExpenseCategory } from '../enums/expense-category.enum';

@Entity('expenses')
@Index(['occurredOn', 'category'])
export class Expense extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category!: ExpenseCategory;

  @Column({ name: 'amount_rial', type: 'bigint' })
  amountRial!: string;

  @Column({ name: 'occurred_on', type: 'date' })
  occurredOn!: string;

  @Column({ name: 'season', type: 'varchar', length: 100, nullable: true })
  season!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
