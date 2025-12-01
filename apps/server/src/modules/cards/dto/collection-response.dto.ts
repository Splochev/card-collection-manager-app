import { CardEditions } from '../../../database/entities/card-editions.entity';

export class CollectionGroupDto {
  groupKey!: string;
  totalCount!: number;
  cards!: CardEditions[];
}

export class CollectionResponseDto {
  groups!: CollectionGroupDto[];
  totalGroups!: number;
  hasMore!: boolean;
}
