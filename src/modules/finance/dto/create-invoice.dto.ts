import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';

export class CreateInvoiceDto {
  @IsString() playerId!: string;
  @IsEnum(BillingCycle) billingCycle!: BillingCycle;
  @IsDateString() issueDate!: string;
  @IsDateString() dueDate!: string;
  @IsOptional() @IsDateString() periodStart?: string;
  @IsOptional() @IsDateString() periodEnd?: string;
  @IsOptional() @IsString() note?: string;
  items!: Array<{ serviceId?: string; title: string; quantity: number; unitPriceRial: number }>;
  @IsOptional() @IsInt() @Min(0) discountRial?: number;
}
