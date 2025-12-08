import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../constants';
import SearchCardSetFinished from '../components/toasts/SearchCardSetFinished';

export interface UseSocketOptions {
  /**
   * The backend URL to connect to.
   * @default BACKEND_URL from constants
   */
  url?: string;
  /**
   * The namespace to connect to.
   * @default '/card-manager'
   */
  namespace?: string;
  /**
   * Whether to enable the socket connection.
   * @default true
   */
  enabled?: boolean;
}

export interface UseSocketResult {
  /**
   * The current socket ID, or empty string if not connected.
   */
  socketId: string;
  /**
   * Ref containing the current socket ID (for use in callbacks).
   */
  socketIdRef: React.RefObject<string>;
}

export interface SearchCardSetFinishedPayload {
  collectionName: string;
  cardSetCode: string;
}

/**
 * Hook to manage WebSocket connection for real-time updates.
 * Extracts socket logic from PageLayout for better testability.
 *
 * @example
 * const { socketId, socketIdRef } = useSocket();
 * // Use socketIdRef.current in callbacks
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketResult {
  const {
    url = BACKEND_URL,
    namespace = '/card-manager',
    enabled = true,
  } = options;

  const socketIdRef = useRef<string>('');
  const socketRef = useRef<Socket | null>(null);

  const handleSearchCardSetFinished = useCallback(
    (payload: SearchCardSetFinishedPayload) => {
      toast.success(
        <SearchCardSetFinished
          collectionName={payload.collectionName}
          cardSetCode={payload.cardSetCode}
        />,
        { autoClose: 8000 }
      );
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket: Socket = io(`${url}${namespace}`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socketIdRef.current = socket.id ?? '';
    });

    socket.on('disconnect', () => {
      socketIdRef.current = '';
    });

    socket.on('searchCardSetFinished', handleSearchCardSetFinished);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, namespace, enabled, handleSearchCardSetFinished]);

  return {
    socketId: socketIdRef.current,
    socketIdRef,
  };
}

export default useSocket;
