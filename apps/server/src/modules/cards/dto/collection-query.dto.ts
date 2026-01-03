import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupByType, OrderByType, SortType } from '@card-collection-manager-app/shared';

export class CollectionQueryDto {
  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType = GroupByType.SET_NAME;

  @IsOptional()
  @IsEnum(OrderByType)
  orderBy?: OrderByType = OrderByType.CARD_NAME;

  @IsOptional()
  @IsEnum(SortType)
  sortType?: SortType = SortType.ASC;
}
