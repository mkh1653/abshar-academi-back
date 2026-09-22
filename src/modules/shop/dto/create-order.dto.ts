import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsString() productId!: string;
  @IsOptional() @IsString() variantId?: string;
  @IsInt() @Min(1) quantity!: number;
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
