import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';

export class CreateSubscriptionDto {
  @IsString() playerId!: string;
  @IsString() serviceId!: string;
  @IsEnum(BillingCycle) billingCycle!: BillingCycle;
  @IsDateString() startsOn!: string;
  @IsOptional() @IsDateString() endsOn?: string;
  @IsInt() @Min(0) unitPriceRial!: number;
}
