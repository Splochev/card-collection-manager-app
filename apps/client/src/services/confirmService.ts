import type { ReactNode } from 'react';

type Resolver = { resolve: (v: boolean) => void };

/**
 * ConfirmService - Manages confirmation dialog resolvers and custom content.
 * Designed as a class to enable easy testing through instance creation.
 */
export class ConfirmService {
  private resolvers = new Map<string, Resolver>();
  private customContent = new Map<string, ReactNode>();

  /**
   * Registers a resolver for a confirmation dialog.
   */
  registerResolver(id: string, resolve: (v: boolean) => void): void {
    this.resolvers.set(id, { resolve });
  }

  /**
   * Registers custom content for a confirmation dialog.
   */
  registerCustom(key: string, node: ReactNode): void {
    this.customContent.set(key, node);
  }

  /**
   * Gets custom content by key.
   */
  getCustom(key: string | null): ReactNode | null {
    if (!key) return null;
    return this.customContent.get(key) ?? null;
  }

  /**
   * Clears custom content by key.
   */
  clearCustom(key: string | null): void {
    if (!key) return;
    this.customContent.delete(key);
  }

  /**
   * Resolves a confirmation dialog with the given value.
   */
  resolveConfirm(id: string | null, value: boolean): void {
    if (!id) return;
    const r = this.resolvers.get(id);
    if (r) {
      try {
        r.resolve(value);
      } finally {
        this.resolvers.delete(id);
      }
    }
  }

  /**
   * Checks if a resolver exists for the given id.
   */
  hasResolver(id: string): boolean {
    return this.resolvers.has(id);
  }

  /**
   * Clears all resolvers and custom content. Useful for testing.
   */
  reset(): void {
    this.resolvers.clear();
    this.customContent.clear();
  }
}

// Default singleton instance for production use
export const confirmService = new ConfirmService();

// Export convenience functions that use the singleton
export const registerResolver = (
  id: string,
  resolve: (v: boolean) => void
): void => confirmService.registerResolver(id, resolve);

export const registerCustom = (key: string, node: ReactNode): void =>
  confirmService.registerCustom(key, node);

export const getCustom = (key: string | null): ReactNode | null =>
  confirmService.getCustom(key);

export const clearCustom = (key: string | null): void =>
  confirmService.clearCustom(key);

export const resolveConfirm = (id: string | null, value: boolean): void =>
  confirmService.resolveConfirm(id, value);

export default confirmService;
