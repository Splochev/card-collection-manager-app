import CardSearchIcon from './components/icons/CardSearchIcon';
import CollectionIcon from './components/icons/CollectionIcon';
import FavoriteIcon from '@mui/icons-material/Favorite';

const BACKEND_URL =
  import.meta.env.VITE_REACT_LOCAL_BACKEND_URL || 'http://localhost:8080';

const ROUTES_MAP = {
  CARDS: '/cards',
  COLLECTION: '/collection',
};

const PAGES = [
  {
    label: 'Cards',
    index: 0,
    route: ROUTES_MAP.CARDS,
    icon: CardSearchIcon,
    searchLabel: 'Find cards by set number',
  },
  {
    label: 'Collection',
    index: 1,
    route: ROUTES_MAP.COLLECTION,
    icon: CollectionIcon,
    searchLabel:
      'Find cards in collection by card name, set number or set name',
  },
  {
    label: 'Wishlist',
    index: 2,
    route: '/wishlist',
    icon: FavoriteIcon,
    searchLabel: 'Find cards in wishlist by card name, set number or set name',
  },
];

const CARD_SET_CODE_REGEX = /^[A-Z0-9]{3,6}-[A-Z0-9]{3,6}$/i;

const BREAKPOINTS = {
  WIDE_SCREEN: '(min-width:1631px)',
  SMALL_DOWN: '(max-width:970px)',
  NOT_WIDER_THAN_900: '(max-width:900px)',
} as const;

const ELEMENT_IDS = {
  CARD_SEARCH_INPUT: 'Find cards by set number',
  CARD_SET_NAME_INPUT:
    'Card Set Name (e.g. Metal Raiders, Alliance Insight, etc...)',
  CARD_FILTER_INPUT: 'card-filter',
} as const;

export {
  BACKEND_URL,
  ROUTES_MAP,
  PAGES,
  CARD_SET_CODE_REGEX,
  BREAKPOINTS,
  ELEMENT_IDS,
};
