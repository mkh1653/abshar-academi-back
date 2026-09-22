import { IsIn, IsOptional, IsString } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  authority!: string;

  @IsIn(['success', 'failed'])
  status!: 'success' | 'failed';

  @IsOptional()
  @IsString()
  transactionId?: string;
}
