import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CardDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  name?: string;

  @IsString()
  type?: string;

  @IsString()
  desc?: string;

  @IsString()
  race?: string;

  @IsString()
  cardSet?: string;

  @IsString()
  cardId?: string;

  @IsString()
  imageUrl?: string | null;

  @IsArray()
  @IsOptional()
  typeline?: string[];

  @IsNumber()
  @IsOptional()
  atk?: number;

  @IsNumber()
  @IsOptional()
  def?: number;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsString()
  @IsOptional()
  attribute?: string;

  @IsNumber()
  @IsOptional()
  linkval?: number;

  @IsArray()
  @IsOptional()
  linkmarkers?: string[];

  @IsString()
  @IsOptional()
  pend_desc?: string;

  @IsString()
  @IsOptional()
  monster_desc?: string;

  @IsNumber()
  @IsOptional()
  scale?: number;

  @IsString()
  @IsOptional()
  humanReadableCardType?: string;

  @IsString()
  @IsOptional()
  frameType?: string;

  @IsString()
  @IsOptional()
  archetype?: string;

  @IsArray()
  @IsOptional()
  cardSetNames?: string[];
}
