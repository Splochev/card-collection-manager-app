import { useDispatch } from 'react-redux';
import { useCardsManager } from '../../contexts/SDKContext';
import { renderHook, act } from '@testing-library/react';
import { useCardActions } from '../../hooks/useCardActions';
import type { ICard } from '@card-collection-manager-app/shared';
import { updateCardWishlist } from '../../stores/cardSlice';
import { toast } from 'react-toastify';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../contexts/SDKContext', () => ({
  useCardsManager: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useCardActions', () => {
  const mockDispatch = jest.fn();
  const mockCardsManager = {
    addCardToCollection: jest.fn().mockResolvedValue(undefined),
    removeCardFromWishlist: jest.fn().mockResolvedValue(undefined),
    addCardToWishlist: jest.fn().mockResolvedValue(undefined),
  };
  const mockSetSearchedCard = jest.fn();
  let mockSearchedCard = undefined as unknown as ICard;

  beforeEach(() => {
    jest.clearAllMocks();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useCardsManager as unknown as jest.Mock).mockReturnValue(mockCardsManager);
    mockSearchedCard = {
      id: 1,
      name: 'Test Card',
      cardNumber: 'RA04-EN016',
      count: 7, // ← count is 0, so the hook should set quantity to 1
    } as unknown as ICard;
  });

  it('updates the searched card quantity to 1', () => {
    mockSearchedCard.count = 0;
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );

    expect(result.current.quantity).toBe(1);
  });

  it('does not update the searched card quantity', () => {
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );

    expect(result.current.quantity).toBe(7);
  });

  it('keeps initial quantity when searchedCard is undefined', () => {
    mockSearchedCard = undefined as unknown as ICard;

    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );

    expect(result.current.quantity).toBe(1);
  });

  it('updates quantity when setQuantity is called', async () => {
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );

    await act(() => {
      result.current.setQuantity(3);
    });
    expect(result.current.quantity).toBe(3);
  });

  it('does not perform any actions when searchedCard is undefined', async () => {
    mockSearchedCard = undefined as unknown as ICard;

    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );
    await act(() => {
      result.current.handleAddToWishlist(3);
    });

    expect(mockSetSearchedCard).toHaveBeenCalledTimes(0);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
    expect(mockCardsManager.addCardToWishlist).toHaveBeenCalledTimes(0);

    expect(() => {
      result.current.handleAddToWishlist(3);
    }).not.toThrow();
  });

  it('calls setSearchedCard with updated wishlistCount when handleAddToWishlist is called', async () => {
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );
    await act(async () => {
      await result.current.handleAddToWishlist(3);
    });

    expect(mockSetSearchedCard).toHaveBeenCalledWith({
      ...mockSearchedCard,
      wishlistCount: 3,
    } as unknown as ICard);
  });

  it('calls cardsManager.addCardToWishlist with updated wishlistCount when handleAddToWishlist is called', async () => {
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );
    await act(async () => {
      await result.current.handleAddToWishlist(3);
    });

    expect(mockCardsManager.addCardToWishlist).toHaveBeenCalledWith(
      mockSearchedCard.cardNumber,
      3,
    );
  });

  it("calls reducer's updateCardWishlist with updated wishlistCount when handleAddToWishlist is called", async () => {
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );
    await act(async () => {
      await result.current.handleAddToWishlist(3);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      updateCardWishlist({
        cardNumber: mockSearchedCard.cardNumber,
        wishlistCount: 3,
      }),
    );
  });

  it('shows success toast with correct message', async () => {
    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );
    await act(async () => {
      await result.current.handleAddToWishlist(3);
    });

    expect(toast.success).toHaveBeenCalledWith(
      `Added to wishlist: ${3} x ${mockSearchedCard.name}`,
    );
  });

  it('shows error toast on failure', async () => {
    mockCardsManager.addCardToWishlist.mockRejectedValueOnce(
      new Error('API error'),
    );

    const { result } = renderHook(() =>
      useCardActions({
        searchedCard: mockSearchedCard,
        setSearchedCard: mockSetSearchedCard,
      }),
    );
    await act(async () => {
      await result.current.handleAddToWishlist(3);
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to add card to wishlist. Please try again.',
    );

    // Add these to ensure state isn't corrupted:
    expect(mockSetSearchedCard).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
