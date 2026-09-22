import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() sku!: string;
  @IsString() name!: string;
  @IsInt() @Min(0) priceRial!: number;
  @IsOptional() @IsString() description?: string;
}
