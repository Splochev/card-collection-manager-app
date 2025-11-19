import type { ICard } from '../interfaces/card.interface';
import axios from 'axios';
import type SDK from './SDK';

/**
 * CardsManager - A class to handle card-related operations.
 */
export default class CardsManager {
  private systemUrl: string;
  private sdk: SDK;

  constructor(systemUrl: string, sdk: SDK) {
    this.systemUrl = systemUrl;
    this.sdk = sdk;
  }

  /**
   * Retrieves cards by card set code.
   */
  async getCardsBySetCode(cardSetCode: string): Promise<ICard[]> {
    const token = this.sdk.getToken();

    const { data } = await axios.get<ICard[]>(
      `${this.systemUrl}/cards/${cardSetCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }

  /**
   * Searches card sets by name.
   */
  async findCardSets(
    body: { cardSetNames: string[]; cardSetCode: string },
    socketId?: string,
  ): Promise<void> {
    const headers: Record<string, string> = {};
    const token = this.sdk.getToken();
    if (socketId) headers['x-socket-id'] = socketId;

    await axios.post<void>(`${this.systemUrl}/scrape`, body, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Adds a card to the user's collection with the specified quantity.
   */
  async addCardToCollection(
    cardSetCode: string,
    quantity: number,
  ): Promise<void> {
    const token = this.sdk.getToken();
    await axios.post(
      `${this.systemUrl}/cards`,
      { cardSetCode, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  /**
   * Updates the wishlist quantity for a specific card.
   */
  async onWishlistChange(
    cardSetCode: string,
    quantity?: number,
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
    quantity: number,
  ): Promise<void> {
    const token = this.sdk.getToken();
    await axios.post(
      `${this.systemUrl}/cards/wishlist`,
      { cardSetCode, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  /**
   * Removes a card from the user's wishlist.
   */
  async removeCardFromWishlist(cardSetCode: string): Promise<void> {
    const token = this.sdk.getToken();
    await axios({
      method: 'delete',
      url: `${this.systemUrl}/cards/wishlist`,
      data: { cardSetCode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    const token = this.sdk.getToken();
    const { data } = await axios.get<{
      groups: Array<{
        groupKey: string;
        totalCount: number;
        cards: ICard[];
      }>;
      totalGroups: number;
      hasMore: boolean;
    }>(`${this.systemUrl}/cards/collection/all`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    const token = this.sdk.getToken();
    const { data } = await axios.get<string>(
      `${this.systemUrl}/cards/${cardSetCode}/marketplace-url`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }
}
