import { ApiProperty } from '@nestjs/swagger';
import { CardEditions } from '../../../database/entities/card-editions.entity';

export class CollectionGroupDto {
  @ApiProperty({ description: 'Group key (card name, set name, or set code)' })
  groupKey!: string;

  @ApiProperty({ description: 'Total count of cards in this group' })
  totalCount!: number;

  @ApiProperty({ description: 'Cards in this group', type: [CardEditions] })
  cards!: CardEditions[];
}

export class CollectionResponseDto {
  @ApiProperty({ description: 'Groups of cards', type: [CollectionGroupDto] })
  groups!: CollectionGroupDto[];

  @ApiProperty({ description: 'Total number of groups' })
  totalGroups!: number;

  @ApiProperty({ description: 'Whether there are more groups to load' })
  hasMore!: boolean;
}
