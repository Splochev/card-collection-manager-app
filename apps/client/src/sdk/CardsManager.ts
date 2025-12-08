import type { ICard } from '@card-collection-manager-app/shared';
import type SDK from './SDK';
import type { IHttpClient } from '../services/httpClient';

/**
 * CardsManager - A class to handle card-related operations.
 * Uses the SDK's HTTP client for making requests.
 */
export default class CardsManager {
  private sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  /**
   * Gets the HTTP client from SDK.
   */
  private get httpClient(): IHttpClient {
    return this.sdk.getHttpClient();
  }

  /**
   * Gets the system URL from SDK.
   */
  private get systemUrl(): string {
    return this.sdk.systemUrl;
  }

  /**
   * Retrieves cards by card set code.
   */
  async getCardsBySetCode(cardSetCode: string): Promise<ICard[]> {
    const { data } = await this.httpClient.get<ICard[]>(
      `${this.systemUrl}/cards/${cardSetCode}`
    );
    return data;
  }

  /**
   * Searches card sets by name.
   */
  async findCardSets(
    body: { cardSetNames: string[]; cardSetCode: string },
    socketId?: string
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (socketId) headers['x-socket-id'] = socketId;

    await this.httpClient.post<void>(`${this.systemUrl}/scrape`, body, {
      headers,
    });
  }

  /**
   * Adds a card to the user's collection with the specified quantity.
   */
  async addCardToCollection(
    cardSetCode: string,
    quantity: number
  ): Promise<void> {
    await this.httpClient.post(`${this.systemUrl}/cards`, {
      cardSetCode,
      quantity,
    });
  }

  /**
   * Updates the wishlist quantity for a specific card.
   */
  async onWishlistChange(
    cardSetCode: string,
    quantity?: number
  ): Promise<void> {
    if (quantity && quantity > 0) {
      await this.addCardToWishlist(cardSetCode, quantity);
    } else {
      await this.removeCardFromWishlist(cardSetCode);
    }
  }

  /**
   * Adds a card to the user's wishlist with the specified quantity.
   */
  async addCardToWishlist(
    cardSetCode: string,
    quantity: number
  ): Promise<void> {
    await this.httpClient.post(`${this.systemUrl}/cards/wishlist`, {
      cardSetCode,
      quantity,
    });
  }

  /**
   * Removes a card from the user's wishlist.
   */
  async removeCardFromWishlist(cardSetCode: string): Promise<void> {
    await this.httpClient.delete(`${this.systemUrl}/cards/wishlist`, {
      data: { cardSetCode },
    });
  }

  /**
   * Gets the user's collection with grouping, sorting, and pagination.
   */
  async getMyCollection(params: {
    filter?: string;
    limit?: number;
    offset?: number;
    groupBy?: string;
    orderBy?: string;
    sortType?: string;
  }): Promise<{
    groups: Array<{
      groupKey: string;
      totalCount: number;
      cards: ICard[];
    }>;
    totalGroups: number;
    hasMore: boolean;
  }> {
    const { data } = await this.httpClient.get<{
      groups: Array<{
        groupKey: string;
        totalCount: number;
        cards: ICard[];
      }>;
      totalGroups: number;
      hasMore: boolean;
    }>(`${this.systemUrl}/cards/collection/all`, {
      params,
    });
    return data;
  }

  /**
   * Gets the marketplace URL for a specific card set code.
   * @param cardSetCode - The card set code to retrieve the marketplace URL for.
   * @returns The marketplace URL for the specified card set code.
   *
   * @example
   * const url = await cardsManager.getCardMarketplaceUrl('RA04-EN016');
   * url ---> https://www.cardmarket.com/en/YuGiOh/Products/Singles/Quarter-Century-Stampede/Black-Metal-Dragon-V1-Super-Rare?language=1&minCondition=4
   */
  async getCardMarketplaceUrl(cardSetCode: string): Promise<string> {
    const { data } = await this.httpClient.get<string>(
      `${this.systemUrl}/cards/${cardSetCode}/marketplace-url`
    );
    return data;
  }
}
