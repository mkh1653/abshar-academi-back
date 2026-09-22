import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';

export class CreateExpenseDto {
  @IsString() title!: string;
  @IsEnum(ExpenseCategory) category!: ExpenseCategory;
  @IsInt() @Min(0) amountRial!: number;
  @IsDateString() occurredOn!: string;
  @IsOptional() @IsString() season?: string;
  @IsOptional() @IsString() description?: string;
}
