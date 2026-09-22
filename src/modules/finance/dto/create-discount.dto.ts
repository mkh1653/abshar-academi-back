import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DiscountType } from '../enums/discount-type.enum';

export class CreateDiscountDto {
  @IsString() code!: string;
  @IsEnum(DiscountType) type!: DiscountType;
  @IsInt() @Min(0) value!: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @Min(0) @Max(100) percent?: number;
}
