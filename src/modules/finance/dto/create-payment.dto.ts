import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsInt()
  @Min(1)
  amountRial!: number;

  @IsOptional()
  @IsString()
  gateway?: string;
}
