import { Box, Typography, CardContent, Button, Paper } from '@mui/material';
import {
  Launch as LaunchIcon,
  ShoppingCart as ShoppingCartIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import type { ICard } from '@card-collection-manager-app/shared';
import SDK from '../../../sdk/SDK';
import {
  BACKEND_URL,
  body1TypographyProps,
  body2TypographyProps,
} from '../../../constants';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateCardCount } from '../../../stores/collectionSlice';
import { useNavigate } from 'react-router-dom';
import CoreNumber from '../../molecules/CoreNumber';

const sdk = SDK.getInstance(BACKEND_URL);

const STYLES = {
  paper0: {
    display: 'flex',
    alignItems: 'stretch',
    marginBottom: 1,
  },
  image: {
    height: 150,
    objectFit: 'cover',
    flexShrink: 0,
    '@media (max-width: 970px)': {
      height: 180,
    },
    '@media (max-width: 750px)': {
      height: 190,
    },
    '@media (max-width: 720px)': {
      height: 205,
    },
    '@media (max-width: 555px)': {
      height: 225,
    },
    '@media (max-width: 500px)': {
      height: 310,
    },
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 2,
    gap: 2,
    '&:last-child': { paddingBottom: 2 },
  },
  row0: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1.5,
    '@media (max-width: 750px)': {
      flexDirection: 'column-reverse',
      alignItems: 'flex-start',
    },
  },
  actionsWrapper: {
    display: 'flex',
    gap: 1,
    width: '265px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    '@media (max-width: 750px)': {
      width: 'fit-content',
    },
    '@media (max-width: 500px)': {
      flexDirection: 'column',
      alignItems: 'flex-end',
      width: '100%',
    },
  },
  cardTitle: {
    fontWeight: 'bold',
    flex: 1,
    fontSize: 18,
  },
  buttonStyle: {
    minWidth: 0,
    padding: 0,
    width: 'fit-content',
    height: 'fit-content',
    borderRadius: 1.5,
  },
  iconPaper: { padding: 0.5, borderRadius: 1.5 },
  cardQuantity: {
    color: 'primary.main',
    fontWeight: 'bold',
    fontSize: 20,
    whiteSpace: 'nowrap',
    padding: '0 8px',
    textAlign: 'center',
  },
  cardDetails: {
    color: 'text.secondary',
    fontSize: 14,
  },
  rarityAndCardTypeWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rarity: {
    color: 'primary.main',
    fontSize: 14,
  },
  cardType: {
    color: 'text.secondary',
    fontSize: 14,
  },
  coreNumberWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '@media (max-width: 500px)': {
      justifyContent: 'space-between',
      width: '130px',
    },
  },
  buttonsWrapper: {
    display: 'flex',
    gap: 1,
    '@media (max-width: 500px)': {
      justifyContent: 'space-between',
      width: '130px',
    },
  },
};

const iconPaperProps = {
  elevation: 4,
  sx: STYLES.iconPaper,
};

const CollectionCardListItem = ({
  card,
  onZoomIn,
}: {
  card: ICard;
  onZoomIn: (card: ICard | null) => void;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [localCount, setLocalCount] = useState(card.count);
  const [visibleCount, setVisibleCount] = useState(card.count);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/cards/${card.cardNumber}`);
  };

  useEffect(() => {
    setLocalCount(card.count);
  }, [card.count]);

  useEffect(() => {
    const updateCard = async () => {
      if (localCount !== card.count) {
        try {
          await sdk.cardsManager.addCardToCollection(
            card.cardNumber,
            localCount,
          );
          dispatch(
            updateCardCount({
              cardId: card.id,
              cardNumber: card.cardNumber,
              newCount: localCount,
            }),
          );

          if (localCount === 0) {
            toast.info(`Removed ${card.name} from collection`);
          } else {
            toast.success(`Updated ${card.name} to ${localCount}x`);
          }
        } catch (error) {
          console.error('Error updating card count:', error);
          toast.error('Failed to update card count');
          setLocalCount(card.count);
        }
      }
    };
    updateCard();
  }, [localCount, card.count, card.cardNumber, card.id, card.name, dispatch]);

  const buttons = [
    {
      props: {
        sx: STYLES.buttonStyle,
        href: card.marketURL,
        component: 'a',
        target: '_blank',
      },
      icon: <ShoppingCartIcon />,
      isVisible: true,
    },
    {
      props: {
        sx: STYLES.buttonStyle,
        component: 'a',
        href: `/cards/${card.cardNumber}`,
        onClick: handleNavigate,
      },
      icon: <LaunchIcon />,
      isVisible: true,
    },
    {
      props: {
        sx: STYLES.buttonStyle,
        onClick: () => onZoomIn(card),
        'aria-label': 'Zoom in',
      },
      icon: <ZoomInIcon />,
    },
  ];

  return (
    <Paper elevation={4} sx={STYLES.paper0}>
      <Box
        component="img"
        src={card.imageUrl || ''}
        alt={card.name}
        sx={STYLES.image}
      />
      <CardContent sx={STYLES.cardContent}>
        <Box sx={STYLES.row0}>
          <Typography
            {...body2TypographyProps}
            sx={STYLES.cardTitle}
            title={card.name}
          >
            {card.name}
          </Typography>
          <Box sx={STYLES.actionsWrapper}>
            <Box sx={STYLES.coreNumberWrapper}>
              <CoreNumber
                min={0}
                max={100}
                value={localCount}
                setValue={(value: number | '') => setLocalCount(Number(value))}
                variant="incrementAndDecrementOnly"
                externalOnChange={(value) => setVisibleCount(Number(value))}
                iconPaperProps={iconPaperProps}
              >
                <Typography {...body1TypographyProps} sx={STYLES.cardQuantity}>
                  {visibleCount}x
                </Typography>
              </CoreNumber>
            </Box>
            <Box sx={STYLES.buttonsWrapper}>
              {buttons.map(({ props, icon }, index) => (
                <Button key={index} {...props}>
                  <Paper {...iconPaperProps}>{icon}</Paper>
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
        <Typography {...body2TypographyProps} sx={STYLES.cardDetails}>
          {card.cardNumber} - {card.cardSetName}
        </Typography>
        <Box sx={STYLES.rarityAndCardTypeWrapper}>
          {card.rarities && card.rarities.length > 0 && (
            <Typography {...body2TypographyProps} sx={STYLES.rarity}>
              {card.rarities.join(', ')}
            </Typography>
          )}
          {card.humanReadableCardType && (
            <Typography variant="caption" sx={STYLES.cardType}>
              {card.humanReadableCardType}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Paper>
  );
};

export default CollectionCardListItem;
