import { CardDto } from './card.dto';
import { PartialType } from '@nestjs/swagger';

export class SearchCardDto extends PartialType(CardDto) {}
