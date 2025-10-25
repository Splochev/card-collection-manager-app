/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { CardEntity } from '../../database/entities/card.entity';
import { CardEditions } from '../../database/entities/card-editions.entity';
import { UserCards } from '../../database/entities/users-cards.entity';
import { Wishlist } from '../../database/entities/wishlist.entity';
import { ScrapeGateway } from '../websocket/scrape.gateway';
import { CacheService } from '../cache';
import {
  CardApiResponse,
  ICard,
  ScrapeCardDto,
} from '../../interfaces/cards/CardApiResponse.interface';
import { CardDto } from './dto/card.dto';
import { CardQueryDto } from './dto/cardQuery.interface';
import { RARITIES } from './constants';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(CardEditions)
    private readonly cardEditionsRepository: Repository<CardEditions>,
    @InjectRepository(UserCards)
    private readonly userCardsRepository: Repository<UserCards>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly httpService: HttpService,
    private readonly scrapeGateway: ScrapeGateway,
    private readonly cacheService: CacheService,
  ) {}

  async getAllCardEditions({
    cardSetCode,
    marketUrlFilter,
  }: {
    cardSetCode?: string;
    marketUrlFilter?: 'with' | 'without' | 'all';
  } = {}): Promise<CardEditions[]> {
    return await this.cardEditionsRepository.find({
      where: {
        ...(cardSetCode ? { cardNumber: cardSetCode } : {}),
        ...(marketUrlFilter === 'with' && { marketURL: Not(IsNull()) }),
        ...(marketUrlFilter === 'without' && { marketURL: IsNull() }),
        ...(marketUrlFilter === 'all' && {
          marketURL: In([null, Not(null)]),
        }),
      },
    });
  }

  async updateCardEditionMarketUrl(
    cardSetCode: string,
    marketUrl: string,
  ): Promise<void> {
    await this.cardEditionsRepository.update(
      { cardNumber: cardSetCode },
      { marketURL: marketUrl },
    );
  }

  async upsertCardsFromSet(cardSetName: string) {
    const response: AxiosResponse<CardApiResponse> =
      await this.httpService.axiosRef.get(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encodeURIComponent(
          cardSetName,
        )}`,
      );

    const placeHolders: string[] = [];
    const values: any[] = [];

    response.data.data.map((card: ICard) => {
      const formattedCard = this.formatCardData(card, {
        cardSet: cardSetName,
        id: card.id.toString(),
        cardSetNames: [cardSetName],
      });

      values.push(
        formattedCard.name,
        formattedCard.cardSetNames,
        formattedCard.type,
        formattedCard.desc,
        formattedCard.race,
        formattedCard.cardId,
        formattedCard.imageUrl,
        formattedCard.typeline,
        formattedCard.atk,
        formattedCard.def,
        formattedCard.level,
        formattedCard.attribute,
        formattedCard.linkval,
        formattedCard.linkmarkers,
        formattedCard.pend_desc,
        formattedCard.monster_desc,
        formattedCard.scale,
        formattedCard.humanReadableCardType,
        formattedCard.frameType,
        formattedCard.archetype,
      );

      placeHolders.push(
        `($${values.length - 19}, $${values.length - 18}, $${values.length - 17}, $${values.length - 16}, $${values.length - 15}, $${values.length - 14}, $${values.length - 13}, $${values.length - 12}, $${values.length - 11}, $${values.length - 10}, $${values.length - 9}, $${values.length - 8}, $${values.length - 7}, $${values.length - 6}, $${values.length - 5}, $${values.length - 4}, $${values.length - 3}, $${values.length - 2}, $${values.length - 1}, $${values.length})`,
      );
    });

    values.push(cardSetName);

    await this.cardRepository.query(
      `
        INSERT INTO "cards" ("name", "cardSetNames", "type", "desc", "race", "cardId", "imageUrl", "typeline", "atk", "def", "level", "attribute", "linkval", "linkmarkers", "pend_desc", "monster_desc", "scale", "humanReadableCardType", "frameType", "archetype")
        VALUES ${placeHolders.join(', ')}
        ON CONFLICT ("name") DO UPDATE
          SET "cardSetNames" = array_append("cards"."cardSetNames", $${values.length})
      `,
      values,
    );
  }

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

  formatCardData(card: ICard, cardQuery: CardQueryDto): CardDto {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id,
      name,
      type,
      desc,
      race,
      imageUrl,
      typeline,
      atk,
      def,
      level,
      attribute,
      linkval,
      linkmarkers,
      pend_desc,
      monster_desc,
      scale,
      humanReadableCardType,
      frameType,
      archetype,
      ...rest
    } = card;

    const parsedCard = {
      name,
      type,
      desc,
      race,
      imageUrl:
        imageUrl ||
        (rest['card_images'] as { image_url?: string }[] | undefined)?.[0]
          ?.image_url,
      typeline,
      atk,
      def,
      level,
      attribute,
      linkval,
      linkmarkers,
      pend_desc,
      monster_desc,
      scale,
      humanReadableCardType,
      frameType,
      archetype,
      cardId: cardQuery.id,
      cardSet: cardQuery.cardSet,
      cardSetNames: cardQuery.cardSetNames || [],
    };

    return parsedCard as CardDto;
  }

  async saveCards(
    collectionName: string,
    cards: ScrapeCardDto[],
    cardSetCode?: string,
    socketId?: string,
  ) {
    const missingCards: ScrapeCardDto[] = [];

    try {
      await this.upsertCardsFromSet(collectionName);
      const names = cards.map((card) => card.Name);
      const cardsFromDb = await this.cardRepository.find({
        where: { name: In(names) },
        order: { name: 'ASC' },
      });

      const cardsMap: Record<string, number> = {};
      cardsFromDb.forEach((card) => {
        cardsMap[card.name] = card.id;
      });

      const cardEditions: CardEditions[] = [];
      cards.forEach((cardEdition) => {
        let rarity = cardEdition['Rarity'] || '';

        const rarities: string[] = [];
        const sortedRarities = RARITIES.sort((a, b) => b.length - a.length);
        for (const _rarity of sortedRarities) {
          if ((rarity || '').includes(_rarity)) {
            rarities.push(_rarity);
            rarity = rarity.replace(_rarity, '').trim();
          }
        }

        const obj = {
          cardNumber: cardEdition['Card Number'] || cardEdition['Set number'],
          cardSetName: cardEdition['Collection Name'],
          name: cardEdition['Name'],
          cardId: cardsMap[cardEdition['Name']],
          rarities,
        } as CardEditions;

        if (
          !obj.cardNumber ||
          !obj.cardSetName ||
          !obj.name ||
          !obj.rarities?.length ||
          !obj.cardId
        ) {
          missingCards.push(cardEdition);
          return;
        }

        cardEditions.push(this.cardEditionsRepository.create(obj));
      });

      await this.cardEditionsRepository
        .createQueryBuilder()
        .insert()
        .into(CardEditions)
        .values(cardEditions)
        .orIgnore()
        .execute();
    } catch (e: any) {
      if (
        !e?.response?.data?.error &&
        typeof !e?.response?.data?.error === 'string' &&
        !e?.response?.data?.error?.includes('No card matching your query')
      ) {
        const collectionNameWithNoSpecialChars = collectionName.replace(
          /[^\w\s]/gi,
          '',
        );
        const seedFilePath = path.join(
          __dirname,
          `../../../../src/logs/${collectionNameWithNoSpecialChars}.json`,
        );

        fs.writeFileSync(
          seedFilePath,
          JSON.stringify({
            collectionName,
            error: JSON.stringify(e, null, 2),
            cards: cards.map((card) => ({
              name: card.Name,
              cardNumber: card['Card Number'],
            })),
          }),
        );
      }
    }

    if (missingCards.length) {
      const seedFilePath = path.join(
        __dirname,
        `../../../../src/logs/missingCards.json`,
      );

      let existingData: ScrapeCardDto[] = [];
      if (fs.existsSync(seedFilePath)) {
        const fileContent = fs.readFileSync(seedFilePath, 'utf-8');
        try {
          existingData = JSON.parse(fileContent);
        } catch {
          existingData = [];
        }
      }

      const updatedData = [...existingData, ...missingCards];
      fs.writeFileSync(seedFilePath, JSON.stringify(updatedData, null, 2));
    }

    try {
      const payload = { collectionName, count: cards.length, cardSetCode };
      this.scrapeGateway?.notifySearchFinished(payload, socketId);
    } catch {
      // ignore errors emitting websocket notifications
    }
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
