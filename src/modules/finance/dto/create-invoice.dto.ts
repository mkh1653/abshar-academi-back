import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';

export class InvoiceItemInputDto {
  @IsOptional() @IsString() serviceId?: string;
  @IsString() title!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsInt() @Min(0) unitPriceRial!: number;
}

export class CreateInvoiceDto {
  @IsString() playerId!: string;
  @IsEnum(BillingCycle) billingCycle!: BillingCycle;
  @IsDateString() issueDate!: string;
  @IsDateString() dueDate!: string;
  @IsOptional() @IsDateString() periodStart?: string;
  @IsOptional() @IsDateString() periodEnd?: string;
  @IsOptional() @IsString() note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInputDto)
  items!: InvoiceItemInputDto[];

  @IsOptional() @IsInt() @Min(0) discountRial?: number;
}
