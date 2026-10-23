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
 * Authentication is cookie based: the Logto access token is handed to the
 * backend once via `startSession`, which stores it in an httpOnly cookie.
 * The SDK never keeps the token itself.
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
 *  await sdkSingleton.startSession('logto-access-token');
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

  public readonly systemUrl: string;

  private readonly storage: IStorage;

  private readonly httpClient: IHttpClient;

  constructor(systemUrl: string, deps?: Partial<SDKDependencies>) {
    this.systemUrl = systemUrl;
    this.storage = deps?.storage ?? storageService;
    this.httpClient = deps?.httpClient ?? createHttpClient(systemUrl);
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
   * Sends the access token to the backend, which stores it in an httpOnly cookie.
   * Call again whenever the token is refreshed.
   */
  public async startSession(token: string): Promise<void> {
    await this.httpClient.post('/auth/set-token', { token });
  }

  /**
   * Asks the backend to clear the httpOnly auth cookie.
   */
  public async endSession(): Promise<void> {
    await this.httpClient.post('/auth/logout');
  }
}
