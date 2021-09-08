import { tradeTypeMap, defaultSrcTokens } from 'Config'
import { Token } from 'Datasets'

const prefix = 'MobileExchange_'

const pairs = []
// const pairs = {}

// Object.keys(srcTokensMap).forEach(item => {
//   pairs[item] = []
// })

const defaultConfigure = {
  ironmanReady: false,
  /* main page */
  pairId: undefined,
  requestDataOfCurrentpair: false,
  dstToken: new Token(),
  srcToken: new Token({
    id: 'FO@eosio',
    precision: 4,
    position: 1,
  }),
  needToReverse: null,
  tableRowOfAccounts: {},

  /* main page */
  tradingType: undefined,

  showTradePanel: false,
  tradingPanelTab: tradeTypeMap.uniswap.defaultValue,
  mobileCurrenTradeCard: tradeTypeMap.uniswap.defaultCardValue,

  /* mobile version */
  mobileTabKey: 'record',

  requestingContract: false,

  /* pairs */
  spinningPairs: false,
  requestingPairs: false,
  selectedSrcToken: defaultSrcTokens,
  pairs,
  pairsDropList: [],

  /* add pairs */
  addPairModalShow: false,
  addPairType: 'create',

  requestingTokensForSelect: false,
  tokensForSelect: [],

  requestingTemporayAddPairAvailable: false,
  temporayAddPairAvailable: false,

  requestingAddPair: false,

  addPairDstToken: new Token(),
  addPairDstTokenName: undefined,
  addPairDstTokenInput: undefined,

  addPairSrcToken: new Token(),
  addPairSrcTokenName: undefined,
  addPairSrcTokenInput: undefined,

  /* rank */
  spinningRank: true,
  requestingRank: false,
  rankData: [],

  transPairDetail: {
    uniswapPrice: undefined,
    tokenxQuantity: null,
    tokenxName: null,
    tokenyQuantity: null,
    tokenyName: null,
  },
  accountPairData: {},

  /* handicap */
  spinningHandicap: true,
  requestingHandicap: false,
  handicapData: [],
  lastPrice: undefined,

  /* info */
  spinningInfoData: true,
  requestingInfoData: false,
  infoData: {
    issuer: '',
    symbol: '',
    contract: '',
    max_supply: '',
    max_exchange: '',
    connector_balance: '',
    connector_balance_issuer: '',
    connector_weight: '',
    reserve_connector_balance: '',
    reserve_supply: '',
    supply: '',
    buy_fee: 0,
    sell_fee: 0,

    created: null,
    price: '',
  },

  /* delegate */
  spinningDelegate: false,
  requestingDelegate: false,
  onlyCurrent: true,
  delegateData: [],
  delegateDataTotal: 0,
  delegateDataPage: 1,
  delegateDataPageSize: 10,

  /* record */
  recordPanelTab: 'record',

  spinningRecord: true,
  requestingRecord: false,
  recordData: [],
  recordDataTotal: 0,
  recordDataPage: 1,
  recordDataPageSize: 10,

  spinningRepo: true,
  requestingRepo: false,
  repoData: [],
  repoDataTotal: 0,
  repoDataPage: 1,
  repoDataPageSize: 10,

  /* trade panel */
  spinningTradingPanel: false,
  requestingTradingPanel: false,

  /* bancor/uniswap market */
  toBuyInputValueBottom: undefined,
  toBuyInputValueBottomObj: {},
  toBuySliderValue: 0,

  toSellInputValueBottom: undefined,
  toSellInputValueBottomObj: {},
  toSellSliderValue: 0,

  /* uniswap */
  spinningUniswapAvailable: false,
  requestingUniswapAvailable: false,
  uniswapAvailableSrcToken: undefined,
  uniswapAvailableDstToken: undefined,

  /* lower hold */
  toChargeInputValueTop: undefined,
  toChargeInputValueTopBigNumber: undefined,
  toChargeInputValueTopObj: {},

  toChargeInputValueBottom: undefined,
  toChargeInputValueBottomBigNumber: undefined,
  toChargeInputValueBottomObj: {},

  extractInputValueTop: undefined,
  extractInputValueTopObj: {},

  extractInputValueBottom: undefined,
  extractInputValueBottomObj: {},

  extractSliderValue: 0,

  /* price limit */
  priceLimitBuyPrice: undefined,
  priceLimitBuyPriceObj: {},
  priceLimitBuyAmount: undefined,
  priceLimitBuyAmountObj: {},
  priceLimitBuyQunitity: undefined,
  priceLimitBuySliderValue: 0,

  priceLimitSellPrice: undefined,
  priceLimitSellPriceObj: {},
  priceLimitSellAmount: undefined,
  priceLimitSellAmountObj: {},
  priceLimitSellQunitity: undefined,
  priceLimitSellSliderValue: 0,

  /* one day kline data */
  spinningKDataOfPair: true,
  requestingKDataOfPair: false,
  oneDayKdata: {},

  /* token detail */
  spinningProductionData: true,
  requestingProductionData: false,
  tokenPairDetail: {
    id: undefined,
    name: undefined,
    token: {},
    imghash: undefined,
    status: undefined,
    description: undefined,
    amount: undefined,
    company: undefined,
    attributes: {},
    repoplan: {},
    hasrepoplan: 'no',
  },
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}destroy`: {
      return {
        ...state,

        ...defaultConfigure,
      }
    }
    case `${prefix}resetAvailable`: {
      return {
        ...state,

        ironmanReady: false,
        tableRowOfAccounts: {},
      }
    }
    case `${prefix}resetPair`: {
      return {
        ...state,

        spinningPairs: false,
        requestingPairs: false,
        selectedSrcToken: defaultSrcTokens,
        pairs,
        pairsDropList: [],

        transPairDetail: {
          uniswapPrice: undefined,
          tokenxQuantity: null,
          tokenxName: null,
          tokenyQuantity: null,
          tokenyName: null,
        },
        accountPairData: {},
      }
    }
    case `${prefix}resetTokenPairDetail`: {
      return {
        ...state,

        tokenPairDetail: {
          id: undefined,
          name: undefined,
          token: {},
          imghash: undefined,
          status: undefined,
          description: undefined,
          amount: undefined,
          company: undefined,
          attributes: {},
          repoplan: {},
        },
      }
    }
    case `${prefix}resetPairsDropList`: {
      return {
        ...state,

        pairsDropList: [],
      }
    }
    case `${prefix}resetAddPairs`: {
      return {
        ...state,

        addPairModalShow: false,
        addPairType: 'create',

        requestingTokensForSelect: false,
        tokensForSelect: [],

        requestingTemporayAddPairAvailable: false,
        temporayAddPairAvailable: false,

        requestingAddPair: false,

        addPairDstToken: {
          symbol: '',
          contract: '',
          tokenName: '',
          position: 0,
          pre: 0,
        },
        addPairDstTokenName: undefined,
        addPairDstTokenInput: undefined,

        addPairSrcToken: {
          symbol: '',
          contract: '',
          tokenName: '',
          position: 0,
          pre: 0,
        },
        addPairSrcTokenName: undefined,
        addPairSrcTokenInput: undefined,
      }
    }
    case `${prefix}resetPanelFormData`: {
      return {
        ...state,

        spinningTradingPanel: false,
        requestingTradingPanel: false,

        /* bancor/uniswap market */
        toBuyInputValueBottom: undefined,
        toBuyInputValueBottomObj: {},
        toBuySliderValue: 0,

        toSellInputValueBottom: undefined,
        toSellInputValueBottomObj: {},
        toSellSliderValue: 0,

        /* uniswap */
        spinningUniswapAvailable: false,
        requestingUniswapAvailable: false,
        uniswapAvailableSrcToken: undefined,
        uniswapAvailableDstToken: undefined,

        /* lower hold */
        toChargeInputValueTop: undefined,
        toChargeInputValueTopBigNumber: undefined,
        toChargeInputValueTopObj: {},

        toChargeInputValueBottom: undefined,
        toChargeInputValueBottomBigNumber: undefined,
        toChargeInputValueBottomObj: {},

        extractInputValueTop: undefined,
        extractInputValueTopObj: {},

        extractInputValueBottom: undefined,
        extractInputValueBottomObj: {},

        extractSliderValue: 0,

        /* price limit */
        priceLimitBuyPrice: undefined,
        priceLimitBuyPriceObj: {},
        priceLimitBuyAmount: undefined,
        priceLimitBuyAmountObj: {},
        priceLimitBuyQunitity: undefined,
        priceLimitBuySliderValue: 0,

        priceLimitSellPrice: undefined,
        priceLimitSellPriceObj: {},
        priceLimitSellAmount: undefined,
        priceLimitSellAmountObj: {},
        priceLimitSellQunitity: undefined,
        priceLimitSellSliderValue: 0,
      }
    }
    case `${prefix}resetRecord`: {
      return {
        ...state,

        /* record */
        recordPanelTab: 'record',

        spinningRecord: true,
        requestingRecord: false,
        recordData: [],
        recordDataTotal: 0,
        recordDataPage: 1,
        recordDataPageSize: 10,

        spinningRepo: true,
        requestingRepo: false,
        repoData: [],
        repoDataTotal: 0,
        repoDataPage: 1,
        repoDataPageSize: 10,
      }
    }
    case `${prefix}resetPanelReqData`: {
      return {
        ...state,

        /* uniswap */
        spinningUniswapAvailable: false,
        requestingUniswapAvailable: false,
        uniswapAvailableSrcToken: undefined,
        uniswapAvailableDstToken: undefined,
      }
    }
    case `${prefix}resetDelegate`: {
      return {
        ...state,

        /* uniswap */
        spinningDelegate: false,
        requestingDelegate: false,

        onlyCurrent: true,
        delegateData: [],
        delegateDataTotal: 0,
        delegateDataPage: 1,
        delegateDataPageSize: 10,
      }
    }
    case `${prefix}requestForTokensForSelect`: {
      return {
        ...state,

        tokensForSelect: action.data,
      }
    }
    case `${prefix}getHandicapData`: {
      return {
        ...state,

        handicapData: action.data,
        lastPrice: action.lastPrice,
        handicapAmountMax: action.handicapAmountMax,
      }
    }
    case `${prefix}requestForTableDataOfDelegate`: {
      return {
        ...state,

        delegateData: action.data,
      }
    }
    case `${prefix}requestForTableDataOfRecord`: {
      return {
        ...state,

        recordData: action.data,
      }
    }
    case `${prefix}requestForTableDataTotalOfRecord`: {
      return {
        ...state,

        recordDataTotal: action.data,
      }
    }
    case `${prefix}requestForTableDataOfRepo`: {
      return {
        ...state,

        repoData: action.data,
      }
    }
    case `${prefix}requestForTableDataTotalOfRepo`: {
      return {
        ...state,

        repoDataTotal: action.data,
      }
    }
    case `${prefix}getTokenDetails`: {
      return {
        ...state,

        infoData: { ...action.data },
      }
    }
    case `${prefix}requestForTableDataOfPairs`: {
      return {
        ...state,

        pairs: [...action.data],
      }
    }
    case `${prefix}requestForSearchingPairs`: {
      return {
        ...state,

        pairsDropList: [...action.data],
      }
    }
    case `${prefix}checkTemporayPairAvailable`: {
      return {
        ...state,

        temporayAddPairAvailable: action.data,
      }
    }
    case `${prefix}getSwapRank`: {
      return {
        ...state,

        rankData: [...action.rank],
        transPairDetail: { ...action.pairDetail },
        accountPairData: { ...action.accountPairData },
      }
    }
    case `${prefix}getUniswapAvailable`: {
      return {
        ...state,

        ...action.data,
      }
    }
    case `${prefix}requestForProductionData`: {
      return {
        ...state,

        tokenPairDetail: {
          ...action.data,
        },
      }
    }
    default: {
      return state
    }
  }
}
