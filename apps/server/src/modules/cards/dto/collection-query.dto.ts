import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum GroupByType {
  CARD_NAME = 'cardName',
  SET_NAME = 'setName',
  SET_CODE = 'setCode',
}

export enum OrderByType {
  CARD_NAME = 'cardName',
  SET_NAME = 'setName',
  SET_CODE = 'setCode',
  COUNT = 'count',
}

export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CollectionQueryDto {
  @ApiProperty({
    description: 'Filter cards by name, set name, or set code',
    required: false,
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiProperty({
    description: 'Number of groups to return',
    required: false,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5;

  @ApiProperty({
    description: 'Number of groups to skip',
    required: false,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Group cards by',
    enum: GroupByType,
    required: false,
    default: GroupByType.SET_NAME,
  })
  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType = GroupByType.SET_NAME;

  @ApiProperty({
    description: 'Order cards by',
    enum: OrderByType,
    required: false,
    default: OrderByType.CARD_NAME,
  })
  @IsOptional()
  @IsEnum(OrderByType)
  orderBy?: OrderByType = OrderByType.CARD_NAME;

  @ApiProperty({
    description: 'Sort type (ascending or descending)',
    enum: SortType,
    required: false,
    default: SortType.ASC,
  })
  @IsOptional()
  @IsEnum(SortType)
  sortType?: SortType = SortType.ASC;
}
