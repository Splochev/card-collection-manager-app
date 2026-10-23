import { useDispatch, useSelector } from 'react-redux';
import { useCardsManager } from '../../contexts/SDKContext';
import { useParams } from 'react-router-dom';
import { useCardSearch } from '../../hooks/useCardSearch';
import { act, renderHook } from '@testing-library/react';
import { setSelectedCardNumber } from '../../stores/cardSlice';
import type { ICard } from '@card-collection-manager-app/shared';

jest.mock('../../constants', () => ({
  CARD_SET_CODE_REGEX: /^[A-Z0-9]{3,6}-[A-Z0-9]{3,6}$/i,
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../contexts/SDKContext', () => ({
  useCardsManager: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('useCardActions', () => {
  const mockCard = { cardNumber: 'RA04-EN016' } as unknown as ICard;
  const mockDispatch = jest.fn();
  const mockSelector = jest.fn();
  const mockCardsManager = {
    getCardsBySetCode: jest.fn().mockResolvedValue(undefined),
    findCardSets: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockReturnValue(mockSelector);
    (useCardsManager as unknown as jest.Mock).mockReturnValue(mockCardsManager);
    (useParams as unknown as jest.Mock).mockReturnValue({
      cardNumber: '',
    });
  });

  describe('syncs selected card number with store', () => {
    it('when cardNumber is empty', async () => {
      renderHook(() => useCardSearch());
      expect(mockDispatch).toHaveBeenCalledWith(setSelectedCardNumber(null));
    });

    it('when searchedCard is set to a card object', async () => {
      const { result } = renderHook(() => useCardSearch());
      act(() => result.current.setSearchedCard(mockCard));
      expect(mockDispatch).toHaveBeenCalledWith(
        setSelectedCardNumber(mockCard.cardNumber),
      );
    });
    it('when searchedCard is set to null', async () => {
      const { result } = renderHook(() => useCardSearch());
      act(() => result.current.setSearchedCard(null));
      expect(mockDispatch).toHaveBeenCalledWith(setSelectedCardNumber(null));
    });

    it('when searchedCard is set to null and then to a card object', async () => {
      const { result } = renderHook(() => useCardSearch());
      act(() => result.current.setSearchedCard(mockCard));
      expect(mockDispatch).toHaveBeenCalledWith(
        setSelectedCardNumber(mockCard.cardNumber),
      );
      act(() => result.current.setSearchedCard(null));
      expect(mockDispatch).toHaveBeenCalledWith(setSelectedCardNumber(null));
    });
  });
});
