/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { CardEntity } from '../../database/entities/card.entity';
import { CardEditions } from '../../database/entities/card-editions.entity';
import { UserCards } from '../../database/entities/users-cards.entity';
import { Wishlist } from '../../database/entities/wishlist.entity';
import { CacheService } from '../cache';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEditions)
    private readonly cardEditionsRepository: Repository<CardEditions>,
    @InjectRepository(UserCards)
    private readonly userCardsRepository: Repository<UserCards>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly cacheService: CacheService,
  ) {}

  async getByCardSetCode(
    cardNumber: string,
    userId: number,
  ): Promise<CardEditions[]> {
    let cardMetadata: CardEditions;
    try {
      cardMetadata = await this.cardEditionsRepository.findOneOrFail({
        where: { cardNumber },
        relations: ['cards'],
      });
    } catch {
      throw new HttpException(
        `Card with number "${cardNumber}" not found`,
        404,
      );
    }

    const cacheKey = `card-set:${userId}:${cardMetadata.cardSetName}`;
    let cachedCards = await this.cacheService.get<CardEditions[]>(cacheKey);

    if (!(cachedCards || []).find((c) => c.cardNumber === cardNumber)) {
      await this.cacheService.del(cacheKey);
      cachedCards = null;
    }

    const setCards: CardEditions[] =
      cachedCards ||
      (await this.cardEditionsRepository.query(
        `
      SELECT
        ce."id" as "id",
        ce."cardNumber" as "cardNumber",
        ce."cardSetName" as "cardSetName",
        ce."name" as "name",
        ce."rarities" as "rarities",
        ce."cardId" as "cardId",
        ce."marketURL" as "marketURL",
        c."type" as "type",
        c."desc" as "desc",
        c."race" as "race",
        c."imageUrl" as "imageUrl",
        c."typeline" as "typeline",
        c."atk" as "atk",
        c."def" as "def",
        c."level" as "level",
        c."attribute" as "attribute",
        c."linkval" as "linkval",
        c."linkmarkers" as "linkmarkers",
        c."pend_desc" as "pend_desc",
        c."monster_desc" as "monster_desc",
        c."scale" as "scale",
        c."humanReadableCardType" as "humanReadableCardType",
        c."frameType" as "frameType",
        c."archetype" as "archetype",
        COALESCE(uc."count", 0) AS "count",
        COALESCE(w."count", 0) AS "wishlistCount"
      FROM "card-editions" ce
      LEFT JOIN "cards" c ON c."id" = ce."cardId"
      LEFT JOIN "users-cards" uc ON uc."cardEditionId" = ce."id" AND uc."userId" = $1
      LEFT JOIN "wishlist" w ON w."cardEditionId" = ce."id" AND w."userId" = $1
      WHERE 
        ce."cardSetName" ILIKE $2
    `,
        [userId, `%${cardMetadata.cardSetName}%`],
      ));

    if (!cachedCards) {
      await this.cacheService.set(cacheKey, setCards, 300);
    }

    return setCards;
  }

  async addCardToCollection(
    cardSetCode: string,
    quantity: number,
    userId: number,
  ): Promise<void> {
    try {
      const cardEdition = await this.cardEditionsRepository.findOneOrFail({
        where: { cardNumber: cardSetCode },
      });

      if (!quantity) {
        await this.userCardsRepository.delete({
          cardEditionId: cardEdition.id,
          userId,
        });
      } else {
        await this.userCardsRepository.upsert(
          {
            count: quantity,
            cardEditionId: cardEdition.id,
            userId,
          },
          ['cardEditionId', 'userId'],
        );
      }

      const cardSetCacheKey = `card-set:${userId}:${cardEdition.cardSetName}`;
      const cachedCards =
        await this.cacheService.get<CardEditions[]>(cardSetCacheKey);
      if (cachedCards) {
        const cardInCache = cachedCards.find((c) => c.id === cardEdition.id);
        if (cardInCache) {
          cardInCache.count = quantity;
          await this.cacheService.set(cardSetCacheKey, cachedCards, 300);
        }
      }

      const collectionCachePattern = `collection:${userId}:*`;
      const keys = await this.cacheService.keys(collectionCachePattern);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => this.cacheService.del(key)));
      }
    } catch {
      throw new NotFoundException('Card not found');
    }
  }

  async getCollection(
    userId: number,
    filter?: string,
    limit = 5,
    offset = 0,
    groupBy = 'setName',
    orderBy = 'cardName',
    sortType: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{
    groups: Array<{ groupKey: string; totalCount: number; cards: any[] }>;
    totalGroups: number;
    hasMore: boolean;
  }> {
    const cacheKey = `collection:${userId}:${groupBy}:${orderBy}:${sortType}:${filter || 'all'}:${offset}:${limit}`;

    const cachedResult = await this.cacheService.get<{
      groups: Array<{ groupKey: string; totalCount: number; cards: any[] }>;
      totalGroups: number;
      hasMore: boolean;
    }>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const queryBuilder = this.userCardsRepository
      .createQueryBuilder('uc')
      .leftJoinAndSelect('uc.cardEditionId', 'ce')
      .leftJoin('ce.cards', 'c')
      .addSelect([
        'ce.marketURL',
        'c.id',
        'c.name',
        'c.type',
        'c.desc',
        'c.race',
        'c.imageUrl',
        'c.typeline',
        'c.atk',
        'c.def',
        'c.level',
        'c.attribute',
        'c.linkval',
        'c.linkmarkers',
        'c.pend_desc',
        'c.monster_desc',
        'c.scale',
        'c.humanReadableCardType',
        'c.frameType',
        'c.archetype',
      ])
      .where('uc.userId = :userId', { userId });

    if (filter) {
      queryBuilder.andWhere(
        '(LOWER(ce.name) LIKE LOWER(:filter) OR LOWER(ce.cardSetName) LIKE LOWER(:filter) OR LOWER(ce.cardNumber) LIKE LOWER(:filter))',
        { filter: `%${filter}%` },
      );
    }

    const allCards = await queryBuilder.getMany();

    interface UserCardWithRelations {
      id: number;
      count: number;
      userId: number;
      cardEditionId: CardEditions & {
        cards: CardEntity;
      };
    }

    const groupMap = new Map<
      string,
      {
        groupKey: string;
        totalCount: number;
        cards: Array<{
          id: number;
          cardNumber: string;
          cardSetName: string;
          marketURL?: string | null;
          name: string;
          rarities: string[];
          cardId: number;
          count: number;
          type: string;
          desc?: string;
          race: string;
          imageUrl: string | null;
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
        }>;
      }
    >();

    allCards.forEach((userCard) => {
      const typedUserCard = userCard as unknown as UserCardWithRelations;
      let groupKey: string;
      const cardEdition = typedUserCard.cardEditionId;

      switch (groupBy) {
        case 'setName':
          groupKey = cardEdition.cardSetName;
          break;
        case 'setCode':
          groupKey = cardEdition.cardNumber;
          break;
        case 'cardName':
        default:
          groupKey = cardEdition.name;
          break;
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          groupKey,
          totalCount: 0,
          cards: [],
        });
      }

      const group = groupMap.get(groupKey);
      if (!group) {
        throw new Error(`Group with key "${groupKey}" not found in groupMap.`);
      }
      group.totalCount += typedUserCard.count;
      group.cards.push({
        id: cardEdition.id,
        cardNumber: cardEdition.cardNumber,
        cardSetName: cardEdition.cardSetName,
        name: cardEdition.name,
        rarities: cardEdition.rarities || [],
        cardId: cardEdition.cardId,
        count: typedUserCard.count,
        type: cardEdition.cards.type,
        desc: cardEdition.cards.desc,
        race: cardEdition.cards.race,
        imageUrl: cardEdition.cards.imageUrl,
        typeline: cardEdition.cards.typeline,
        atk: cardEdition.cards.atk,
        def: cardEdition.cards.def,
        level: cardEdition.cards.level,
        attribute: cardEdition.cards.attribute,
        linkval: cardEdition.cards.linkval,
        marketURL: cardEdition.marketURL,
        linkmarkers: cardEdition.cards.linkmarkers,
        pend_desc: cardEdition.cards.pend_desc,
        monster_desc: cardEdition.cards.monster_desc,
        scale: cardEdition.cards.scale,
        humanReadableCardType: cardEdition.cards.humanReadableCardType,
        frameType: cardEdition.cards.frameType,
        archetype: cardEdition.cards.archetype,
      });
    });

    const groups = Array.from(groupMap.values());

    groups.sort((a, b) => {
      let comparison = 0;
      switch (orderBy) {
        case 'count':
          comparison = a.totalCount - b.totalCount;
          break;
        case 'setName':
          comparison = (a.cards[0]?.cardSetName || '').localeCompare(
            b.cards[0]?.cardSetName || '',
          );
          break;
        case 'setCode':
          comparison = (a.cards[0]?.cardNumber || '').localeCompare(
            b.cards[0]?.cardNumber || '',
          );
          break;
        case 'cardName':
        default:
          comparison = a.groupKey.localeCompare(b.groupKey);
          break;
      }
      return sortType === 'ASC' ? comparison : -comparison;
    });

    const totalGroups = groups.length;
    const paginatedGroups = groups.slice(offset, offset + limit);
    const hasMore = offset + limit < totalGroups;

    const result = {
      groups: paginatedGroups,
      totalGroups,
      hasMore,
    };

    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  async addCardToWishlist(
    cardSetCode: string,
    quantity: number,
    userId: number,
  ): Promise<void> {
    const cardEdition = await this.cardEditionsRepository.findOneOrFail({
      where: { cardNumber: cardSetCode },
    });
    if (!cardEdition) {
      throw new HttpException('Card not found', 404);
    }

    const existingItem = await this.wishlistRepository.findOne({
      where: { userId, cardEditionId: cardEdition.id },
    });

    if (existingItem && quantity === 0) {
      await this.wishlistRepository.delete({ id: existingItem.id });
      // Clear cache
      const cardSetCacheKey = `card-set:${userId}:${cardEdition.cardSetName}`;
      await this.cacheService.del(cardSetCacheKey);
      return;
    }

    if (existingItem) {
      existingItem.count = quantity;
      await this.wishlistRepository.save(existingItem);
      // Clear cache
      const cardSetCacheKey = `card-set:${userId}:${cardEdition.cardSetName}`;
      await this.cacheService.del(cardSetCacheKey);
      return;
    }

    const wishlistItem = this.wishlistRepository.create({
      userId,
      cardEditionId: cardEdition.id,
      count: quantity,
    });

    await this.wishlistRepository.save(wishlistItem);

    // Clear cache
    const cardSetCacheKey = `card-set:${userId}:${cardEdition.cardSetName}`;
    await this.cacheService.del(cardSetCacheKey);
  }

  async removeCardFromWishlist(
    cardSetCode: string,
    userId: number,
  ): Promise<void> {
    const cardEdition = await this.cardEditionsRepository.findOneOrFail({
      where: { cardNumber: cardSetCode },
    });
    await this.wishlistRepository.delete({
      userId,
      cardEditionId: cardEdition.id,
    });

    // Clear cache
    const cardSetCacheKey = `card-set:${userId}:${cardEdition.cardSetName}`;
    await this.cacheService.del(cardSetCacheKey);
  }
}
