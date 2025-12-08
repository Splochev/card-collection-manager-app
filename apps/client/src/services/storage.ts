/**
 * Storage interface for abstracting localStorage operations.
 * This enables easier testing by allowing mock implementations.
 */
export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Default localStorage implementation.
 */
export class LocalStorageService implements IStorage {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

/**
 * In-memory storage implementation for testing.
 */
export class InMemoryStorage implements IStorage {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Default instance for production use
export const storageService: IStorage = new LocalStorageService();

export default storageService;
