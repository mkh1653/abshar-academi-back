import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FinanceQueryDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsString() season?: string;
}
