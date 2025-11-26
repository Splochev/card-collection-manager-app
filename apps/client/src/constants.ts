const BACKEND_URL =
  import.meta.env.VITE_REACT_LOCAL_BACKEND_URL || 'http://localhost:8080';
const LOGTO_RESOURCE = import.meta.env.VITE_LOGTO_RESOURCE;
const LOGTO_ENDPOINT = import.meta.env.VITE_LOGTO_ENDPOINT;
const LOGTO_APP_ID = import.meta.env.VITE_LOGTO_APP_ID;
const LOGTO_REDIRECT_URI = import.meta.env.VITE_LOGTO_REDIRECT_URI;
const LOGTO_POST_LOGOUT_REDIRECT_URI = import.meta.env
  .VITE_LOGTO_POST_LOGOUT_REDIRECT_URI;

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

const ICON_SIZE_MAP = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-12',
  xlarge: 'h-24',
};

const t = {
  p: {
    body1: {
      variant: 'body1' as const,
      component: 'p' as const,
    },
    body2: {
      variant: 'body2' as const,
      component: 'p' as const,
    },
    h6: {
      variant: 'h6' as const,
      component: 'p' as const,
    },
  },
  span: {
    body2: {
      variant: 'body2' as const,
      component: 'span' as const,
    },
  },
  h5: {
    variant: 'h5' as const,
    component: 'h5' as const,
  },
  h6:{
    variant: 'h6' as const,
    component: 'h6' as const,
  }
};

export {
  BACKEND_URL,
  LOGTO_RESOURCE,
  LOGTO_ENDPOINT,
  LOGTO_APP_ID,
  LOGTO_REDIRECT_URI,
  LOGTO_POST_LOGOUT_REDIRECT_URI,
  CARD_SET_CODE_REGEX,
  BREAKPOINTS,
  ELEMENT_IDS,
  ICON_SIZE_MAP,
  t,
};
