import { Token } from 'Datasets'

const prefix = 'MobileProductionDetail_'

const defaultConfigure = {
  chartTab: 'price',

  requestingProduction: true,
  spinningProduction: true,

  id: undefined,
  name: undefined,
  token: new Token(),
  imghash: undefined,
  status: undefined,
  description: [],
  amount: undefined,
  company: undefined,
  attributes: {},
  repoplan: {},

  issueRecord: [],

  uniswapPrice: undefined,
  swapData: {},

  sevenDaysAverage: 0,

  priceMonthlyData: [],
  priceMonthlyDataTimeStamp: new Date().valueOf(),
  earningMonthlyData: [],
  earningMonthlyDataTimeStamp: new Date().valueOf(),
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
        ...defaultConfigure,
      }
    }
    case `${prefix}requestForProductionData`: {
      return {
        ...state,
        ...action.data,
      }
    }
    case `${prefix}requestForTokenData`: {
      return {
        ...state,
        token: {
          ...action.data,
        },
      }
    }
    case `${prefix}requestForTokenPairData`: {
      return {
        ...state,
        token: {
          ...action.data,
        },
      }
    }
    case `${prefix}requestForIssueRecordData`: {
      return {
        ...state,

        issueRecord: [...action.data],
      }
    }
    case `${prefix}getSwapRankTotal`: {
      return {
        ...state,

        swapData: { ...action.data },
      }
    }
    case `${prefix}getPriceMonthly`: {
      return {
        ...state,

        priceMonthlyData: [...action.data],
        priceMonthlyDataTimeStamp: action.timestamp,
      }
    }
    case `${prefix}getEarningMonthly`: {
      return {
        ...state,

        earningMonthlyData: [...action.data],
        earningMonthlyDataTimeStamp: action.timestamp,
      }
    }
    default: {
      return state
    }
  }
}
