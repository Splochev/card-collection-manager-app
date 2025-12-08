import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import SDK, { type SDKDependencies } from '../sdk/SDK';
import { BACKEND_URL } from '../constants';

const SDKContext = createContext<SDK | null>(null);

export interface SDKProviderProps {
  children: ReactNode;
  /**
   * Optional custom SDK instance for testing.
   * If not provided, uses the singleton instance.
   */
  sdk?: SDK;
  /**
   * Optional dependencies to pass to SDK.
   * Only used when sdk prop is not provided.
   */
  deps?: Partial<SDKDependencies>;
  /**
   * Optional custom system URL.
   * Defaults to BACKEND_URL from constants.
   */
  systemUrl?: string;
}

/**
 * Provider component that makes SDK available to the component tree.
 *
 * @example
 * // Production usage
 * <SDKProvider>
 *   <App />
 * </SDKProvider>
 *
 * @example
 * // Testing usage with mock SDK
 * const mockSdk = new SDK('http://test', { storage: mockStorage, httpClient: mockHttpClient });
 * <SDKProvider sdk={mockSdk}>
 *   <ComponentUnderTest />
 * </SDKProvider>
 */
export function SDKProvider({
  children,
  sdk,
  deps,
  systemUrl = BACKEND_URL,
}: SDKProviderProps) {
  const sdkInstance = useMemo(() => {
    if (sdk) {
      return sdk;
    }
    return SDK.getInstance(systemUrl, deps);
  }, [sdk, systemUrl, deps]);

  return (
    <SDKContext.Provider value={sdkInstance}>{children}</SDKContext.Provider>
  );
}

/**
 * Hook to access the SDK instance from context.
 *
 * @throws Error if used outside of SDKProvider
 *
 * @example
 * const sdk = useSDK();
 * const cards = await sdk.cardsManager.getCardsBySetCode('SET-001');
 */
export function useSDK(): SDK {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error('useSDK must be used within an SDKProvider');
  }
  return sdk;
}

/**
 * Hook to access just the CardsManager from SDK.
 *
 * @example
 * const cardsManager = useCardsManager();
 * const cards = await cardsManager.getCardsBySetCode('SET-001');
 */
export function useCardsManager() {
  const sdk = useSDK();
  return sdk.cardsManager;
}

export default SDKContext;
