import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @IsString() productId!: string;
  @IsString() sku!: string;
  @IsOptional() @IsString() size?: string;
  @IsInt() @Min(0) stockQuantity!: number;
  @IsOptional() @IsInt() @Min(0) priceRial?: number;
}
