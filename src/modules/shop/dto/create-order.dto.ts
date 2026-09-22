import { IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString() productId!: string;
  @IsOptional() @IsString() variantId?: string;
  quantity!: number;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() jerseyNumber?: string;
}

export class CreateOrderDto {
  @IsString() playerId!: string;
  @IsOptional() @IsString() shippingAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
