export const tradeTypeMap = {
  bancor: {
    list: [
      {
        key: 'market',
        intl: 'MARKET_TRADE',
      },
    ],
    defaultValue: 'market',
    defaultCardValue: 'market_of_buy',
  },
  uniswap: {
    list: [
      {
        key: 'price_limit',
        intl: 'PRICE_LIMIT',
      },
      {
        key: 'market',
        intl: 'MARKET_TRADE',
      },
      {
        key: 'lower_hold',
        intl: 'LOWER_HOLD',
      },
    ],
    defaultValue: 'price_limit',
    defaultCardValue: 'price_limit_of_buy',
    fee: {
      market: {
        buy: '0.1 % ~ 0.3 %',
        sell: '0.1 % ~ 0.3 %',
      },
      lower_hold: {
        charge: '0 %',
        extract: '0.1 %',
      },
      price_limit: {
        buy: '0.1 % ~ 0.3 %',
        sell: '0.1 % ~ 0.3 %',
      },
    },
  },
  default: {
    list: [
      {
        key: 'market',
        intl: 'MARKET_TRADE',
      },
    ],
    defaultValue: 'market',
    defaultCardValue: 'market_of_buy',
  },
}

export const defaultSrcTokens = 'FO@eosio'

export const reversedPricePre = 16

export const contractPrecision = 16

export const producitonCount = 4

export const ordersConfig = {
  map: [
    {
      key: 'current',
      labelKey: 'CURRENT',
    },
    {
      key: 'history',
      labelKey: 'HISTORY',
    },
    {
      key: 'deals',
      labelKey: 'DEALS',
    },
  ],
  default: 'current',
}

export const repoToolPageHref = 'ABS_Repurchase_Address'

export const queryStr =
  '["FO@eosio", "FOUSDT@eosio", "FODAI@eosio", "FOETH@eosio", "FOUSDK@eosio", "AEXFO@testfibos111", "LBKFO@testfibos111", "ZGFO@testfibos111", "CTFO@testfibos111", "DEXFO@testfibos111", "USDT@testfibos111"]'

export const queryList = [
  'FO@eosio',
  'FOUSDT@eosio',
  'FODAI@eosio',
  'FOETH@eosio',
  'FOUSDK@eosio',

  'AEXFO@testfibos111',
  'LBKFO@testfibos111',
  'ZGFO@testfibos111',
  'CTFO@testfibos111',
  'DEXFO@testfibos111',
  'USDT@testfibos111',
]

export const sortMap = {
  'FO@eosio/FOUSDT@eosio': 0,
  'FO@eosio/FODAI@eosio': 1,
  'FODAI@eosio/FOUSDT@eosio': 2,
  'FO@eosio/FOETH@eosio': 3,
  'FOETH@eosio/FOUSDT@eosio': 4,
  'FO@eosio/FOUSDK@eosio': 5,
  'FOETH@eosio/FOUSDK@eosio': 6,

  'AEXFO@testfibos111/USDT@testfibos111': 7,
  'LBKFO@testfibos111/USDT@testfibos111': 8,
  'ZGFO@testfibos111/USDT@testfibos111': 9,
  'CTFO@testfibos111/USDT@testfibos111': 10,
  'DEXFO@testfibos111/USDT@testfibos111': 11,
}

export const pairMap = {
  'FO@eosio': {
    map: ['FOUSDT@eosio', 'FODAI@eosio', 'FOETH@eosio', 'FOUSDK@eosio'],
  },
  'FODAI@eosio': {
    map: ['FOUSDT@eosio'],
  },
  'FOETH@eosio': {
    map: ['FOUSDT@eosio', 'FOUSDK@eosio'],
  },

  'AEXFO@testfibos111': {
    map: ['USDT@testfibos111'],
  },
  'LBKFO@testfibos111': {
    map: ['USDT@testfibos111'],
  },
  'ZGFO@testfibos111': {
    map: ['USDT@testfibos111'],
  },
  'CTFO@testfibos111': {
    map: ['USDT@testfibos111'],
  },
  'DEXFO@testfibos111': {
    map: ['USDT@testfibos111'],
  },
}

export const rankMenuList = [
  {
    key: 'rank',
    intlKey: 'LOWER_HOLD_RANK',
  },
  {
    key: 'total',
    intlKey: 'LOWER_HOLD_RANK_TOTAL',
  },
]

export const mobilePathConfig = {
  tokenlist: {
    value: 'exchange',
    intl: 'TOKENLIST_TITLE',
  },
  createpair: {
    value: 'exchange',
    intl: 'CHARGE_TITLE',
  },
  reactivationpair: {
    value: 'exchange',
    intl: 'REACTIVATION_TITLE',
  },
  markets: {
    value: 'markets',
  },
  exchange: {
    value: 'exchange',
  },
  deals: {
    value: 'deals',
  },
  default: 'markets',
}

export const appPathConfig = {
  tokenlist: {
    value: 'exchange',
    intl: 'MOBILE_EXCHANGE',
  },
  createpair: {
    value: 'exchange',
    intl: 'CHARGE_TITLE',
  },
  reactivationpair: {
    value: 'exchange',
    intl: 'REACTIVATION_TITLE',
  },
  markets: {
    value: 'markets',
  },
  exchange: {
    value: 'exchange',
  },
  deals: {
    value: 'deals',
    intl: 'MOBILE_DEALS',
  },
  default: 'markets',
}

export const colorMap = {
  buy: '#41b37d',
  sell: '#d74e5a',
}

export const mobileTitleNavHeight = 44
