export interface ICard {
  name?: string;
  typeline?: string[];
  type?: string;
  desc?: string;
  race?: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  cardId?: string;
  imageUrl?: string;
  linkval?: number;
  linkmarkers?: string[];
  pend_desc?: string;
  monster_desc?: string;
  scale?: number;
  id: number;
  humanReadableCardType?: string;
  frameType?: string;
  archetype?: string;
  ygoprodeck_url?: string;
  card_sets?: Array<object>;
  card_images?: Array<object>;
  card_prices?: Array<object>;
  cardSetNames?: string[];
}

export interface CardApiResponse {
  data: ICard[];
  [key: string]: unknown;
}

export interface CardEntityInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ScrapeCardDto {
  'Card Number'?: string;
  'Set number'?: string;
  Name: string;
  Category?: string;
  Rarity?: string;
  'Collection Name': string;
}
