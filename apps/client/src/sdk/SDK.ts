import CardsManager from './CardsManager';
import {
  type IHttpClient,
  createHttpClient,
} from '../services/httpClient';
import {
  type IStorage,
  storageService,
} from '../services/storage';

/**
 * SDK Dependencies interface for dependency injection.
 * Enables easier testing by allowing mock implementations.
 */
export interface SDKDependencies {
  storage: IStorage;
  httpClient: IHttpClient;
}

/**
 * SDK - Main class to manage authentication, users, and cards.
 *
 * This class can be used both as a regular class and as a singleton.
 * Dependencies can be injected for testing purposes.
 *
 * When used as a singleton, it ensures that only one instance of the class is created and shared throughout the application.
 * When used as a normal class, a new instance can be created with custom configurations.
 *
 * @example
 *
 * 1. Normal Instantiation (Creates a new instance):
 *  const systemUrl = 'https://example.com';
 *  const sdk = new SDK(systemUrl);  // Creates a new instance with default dependencies
 *
 * 2. Singleton Instantiation (Always gets the same instance):
 *  const systemUrl = 'https://example.com';
 *  const sdkSingleton = SDK.getInstance(systemUrl);  // Returns the Singleton instance
 *  sdkSingleton.setTokens('your-auth-token');
 *
 * 3. Testing with mock dependencies:
 *  const mockStorage = new InMemoryStorage();
 *  const mockHttpClient = createMockHttpClient();
 *  const sdk = new SDK(systemUrl, { storage: mockStorage, httpClient: mockHttpClient });
 *
 * @param {string} systemUrl - The base URL for the system backend.
 * @param {Partial<SDKDependencies>} deps - Optional dependencies for testing.
 */
export default class SDK {
  private static instance: SDK | null = null;

  public cardsManager: CardsManager;

  private token: string | null = null;

  public readonly systemUrl: string;

  private readonly storage: IStorage;

  private readonly httpClient: IHttpClient;

  constructor(systemUrl: string, deps?: Partial<SDKDependencies>) {
    this.systemUrl = systemUrl;
    this.storage = deps?.storage ?? storageService;
    this.httpClient = deps?.httpClient ?? createHttpClient(systemUrl);
    this.initToken();
    this.cardsManager = new CardsManager(this);
  }

  /**
   * Static method to get the singleton instance of SDK.
   * Note: For testing, prefer creating new instances with mock dependencies.
   */
  public static getInstance(
    systemUrl: string,
    deps?: Partial<SDKDependencies>
  ): SDK {
    if (!SDK.instance) {
      SDK.instance = new SDK(systemUrl, deps);
    }
    SDK.instance.initToken();
    return SDK.instance;
  }

  /**
   * Resets the singleton instance. Useful for testing.
   */
  public static resetInstance(): void {
    SDK.instance = null;
  }

  /**
   * Gets the HTTP client for making requests.
   */
  public getHttpClient(): IHttpClient {
    return this.httpClient;
  }

  /**
   * Gets the storage service.
   */
  public getStorage(): IStorage {
    return this.storage;
  }

  /**
   * Sets the authentication token for all managers.
   */
  public setTokens(token: string): void {
    this.token = token;
    this.httpClient.setAuthToken(token);
  }

  /**
   * Retrieves the current authentication token.
   */
  public getToken(): string | null {
    return this.token || this.initToken();
  }

  /**
   * Clears the authentication token.
   */
  public clearTokens(): void {
    this.token = null;
    this.httpClient.clearAuthToken();
  }

  private initToken(): string | null {
    const tokenJson = this.storage.getItem('accessToken');
    const token = tokenJson ? JSON.parse(tokenJson) : null;
    if (token) {
      this.setTokens(token);
    } else {
      this.clearTokens();
    }
    return token;
  }
}
