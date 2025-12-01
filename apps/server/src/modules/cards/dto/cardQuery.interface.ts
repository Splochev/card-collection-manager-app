import { IsString, IsOptional, IsArray } from 'class-validator';

export class CardQueryDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  cardSet?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  cardSetNames?: string[];
}
