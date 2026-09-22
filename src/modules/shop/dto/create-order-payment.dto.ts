import { IsInt, IsString, Min } from 'class-validator';

export class CreateOrderPaymentDto {
  @IsString()
  orderId!: string;

  @IsInt()
  @Min(1)
  amountRial!: number;
}
