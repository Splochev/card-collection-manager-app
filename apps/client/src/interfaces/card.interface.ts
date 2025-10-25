export interface ICard {
  id: number;
  cardNumber: string;
  cardSetName: string;
  name: string;
  rarities: string[];
  cardId: string;
  cardSetNames: string[];
  type: string;
  desc: string;
  race: string;
  imageUrl: string;
  typeline: string;
  atk: number;
  def: number;
  level: number;
  attribute: string;
  linkval: number | null;
  linkmarkers: number[] | null;
  pend_desc: string | null;
  monster_desc: string | null;
  scale: number | null;
  humanReadableCardType: string;
  frameType: string;
  archetype: string;
  count: number;
  wishlistCount?: number;
}
