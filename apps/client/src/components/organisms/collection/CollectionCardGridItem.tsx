import {
  Box,
  Typography,
  CardContent,
  Button,
  Paper,
  useMediaQuery,
} from '@mui/material';
import {
  Launch as LaunchIcon,
  ShoppingCart as ShoppingCartIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import type { ICard } from '@card-collection-manager-app/shared';
import { t } from '../../../constants';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import CoreNumber from '../../molecules/CoreNumber';
import { useCollectionCardCount } from '../../../hooks/useCollectionCardCount';

const STYLES = {
  paper0: {
    width: 200,
    '@media (max-width: 475px)': {
      width: '48%',
    },

    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    borderRadius: 1,
    '@media (min-width: 475px)': {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    },
  },
  imageWrapper: {
    position: 'relative',
    paddingTop: '146%',
    backgroundColor: 'action.hover',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cardContentWrapper: { padding: 1, '&:last-child': { paddingBottom: 1 } },
  cardTitle: {
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 20,
  },
  cardNumberAndQuantityWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0.5,
  },
  cardNumber: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    color: 'text.secondary',
    fontSize: 16,
  },
  cardQuantity: {
    color: 'primary.main',
    fontWeight: 'bold',
    marginLeft: 1,
    fontSize: 20,
  },
  actionsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
    '@media (max-width: 475px)': {
      justifyContent: 'space-around',
    },
    '@media (max-width: 445px)': {
      flexDirection: 'column',
    },
  },
  buttonStyle: {
    minWidth: 0,
    padding: 0,
    width: 'fit-content',
    height: 'fit-content',
    borderRadius: 1.5,
  },
  iconPaper: { padding: 0.5, borderRadius: 1.5 },
  mobileActionsWrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    mb: 1.5,
  },
};

const iconPaperProps = {
  elevation: 4,
  sx: STYLES.iconPaper,
};

const WrappedBox = ({ children }: { children: React.ReactNode }) => (
  <Box sx={STYLES.mobileActionsWrapper}>{children}</Box>
);

const CollectionCardGridItem = ({
  card,
  onZoomIn,
}: {
  card: ICard;
  onZoomIn: (card: ICard | null) => void;
}) => {
  const navigate = useNavigate();
  const { localCount, setLocalCount, visibleCount, setVisibleCount } =
    useCollectionCardCount(card);
  const isMobile = useMediaQuery('(max-width:445px)');
  const Wrapper = isMobile ? WrappedBox : Fragment;
  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/cards/${card.cardNumber}`);
  };

  const buttons = [
    {
      props: {
        sx: STYLES.buttonStyle,
        href: card.marketURL,
        component: 'a',
        target: '_blank',
      },
      icon: <ShoppingCartIcon />,
    },
    {
      props: {
        sx: STYLES.buttonStyle,
        component: 'a',
        href: `/cards/${card.cardNumber}`,
        onClick: handleNavigate,
      },
      icon: <LaunchIcon />,
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
    <Paper elevation={6} sx={STYLES.paper0}>
      <Box sx={STYLES.imageWrapper}>
        <Box
          component="img"
          src={card.imageUrl || ''}
          alt={card.name}
          sx={STYLES.cardImage}
        />
      </Box>
      <CardContent sx={STYLES.cardContentWrapper}>
        <Typography
          {...t.p.body2}
          sx={STYLES.cardTitle}
          title={card.name}
        >
          {card.name}
        </Typography>
        <Box sx={STYLES.cardNumberAndQuantityWrapper}>
          <Typography
            variant="caption"
            sx={STYLES.cardNumber}
            title={card.cardNumber}
          >
            {card.cardNumber}
          </Typography>
          {!isMobile && (
            <Typography  {...t.p.body1}  sx={STYLES.cardQuantity}>
              {visibleCount}x
            </Typography>
          )}
        </Box>
        <Box sx={STYLES.actionsWrapper}>
          <Wrapper>
            <CoreNumber
              min={0}
              max={100}
              value={localCount}
              setValue={(value: number | '') => setLocalCount(Number(value))}
              variant="incrementAndDecrementOnly"
              externalOnChange={(value) => setVisibleCount(Number(value))}
              iconPaperProps={iconPaperProps}
            >
              {isMobile && (
                <Typography  {...t.p.body1}  sx={STYLES.cardQuantity}>
                  {visibleCount}x
                </Typography>
              )}
            </CoreNumber>
          </Wrapper>
          <Wrapper>
            {buttons.map(({ props, icon }, index) => (
              <Button key={index} {...props}>
                <Paper {...iconPaperProps}>{icon}</Paper>
              </Button>
            ))}
          </Wrapper>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default CollectionCardGridItem;
