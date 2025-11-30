export interface CardDto {
  name: string;
  type: string;
  desc?: string;
  race: string;
  imageUrl?: string;
  typeline?: string[];
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  linkval?: number;
  linkmarkers?: string[];
  pend_desc?: string;
  monster_desc?: string;
  scale?: number;
  humanReadableCardType?: string;
  frameType?: string;
  archetype?: string;
  cardId: string;
  cardSet: string;
  cardSetNames: string[];
}