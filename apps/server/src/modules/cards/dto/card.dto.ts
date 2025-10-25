import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CardDto {
  @ApiProperty({ description: 'Unique identifier for the card' })
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'ID of the card' })
  id?: number;

  @IsString()
  @ApiProperty({ description: 'Name of the card' })
  name?: string;

  @IsString()
  @ApiProperty({ description: 'Type of the card' })
  type?: string;

  @IsString()
  @ApiProperty({ description: 'Description of the card' })
  desc?: string;

  @IsString()
  @ApiProperty({ description: 'Race of the card' })
  race?: string;

  @IsString()
  @ApiProperty({ description: 'Set name of the card' })
  cardSet?: string;

  @IsString()
  @ApiProperty({ description: 'ID of the card' })
  cardId?: string;

  @IsString()
  @ApiProperty({ description: 'Image URL of the card' })
  imageUrl?: string | null;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Typeline of the card',
    type: [String],
    required: false,
  })
  typeline?: string[];

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Attack points of the card',
    required: false,
  })
  atk?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Defense points of the card',
    required: false,
  })
  def?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Level of the card',
    required: false,
  })
  level?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Attribute of the card',
    required: false,
  })
  attribute?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Link value of the card',
    required: false,
  })
  linkval?: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Link markers of the card',
    type: [String],
    required: false,
  })
  linkmarkers?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Pendulum description of the card',
    required: false,
  })
  pend_desc?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Monster description of the card',
    required: false,
  })
  monster_desc?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Pendulum scale of the card',
    required: false,
  })
  scale?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Human-readable card type',
    required: false,
  })
  humanReadableCardType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Frame type of the card',
    required: false,
  })
  frameType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Archetype of the card',
    required: false,
  })
  archetype?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Card set names the card belongs to',
    type: [String],
    required: false,
  })
  cardSetNames?: string[];
}
