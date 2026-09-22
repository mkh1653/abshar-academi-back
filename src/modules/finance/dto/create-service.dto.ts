import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ServiceCategory } from '../enums/service-category.enum';

export class CreateServiceDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsEnum(ServiceCategory) category!: ServiceCategory;
  @IsInt() @Min(0) defaultPriceRial!: number;
  @IsOptional() @IsString() description?: string;
}
