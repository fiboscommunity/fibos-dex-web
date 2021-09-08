import { ordersConfig } from 'Config'

const prefix = 'MobileDeals_'

const defaultConfigure = {
  tableType: ordersConfig.default,

  requestingContract: false,

  /* pairs */
  pairId: undefined,
  searchVal: undefined,
  pairsDropList: [],

  /* current order */
  currentOrderTableSpinning: true,
  currentOrderTableRequesting: true,

  currentOrderTableData: [],

  currentOrderDataTotal: 0,
  currentOrderDataPage: 1,
  currentOrderDataPageSize: 10,

  /* history order */
  historyOrderTableSpinning: true,
  historyOrderTableRequesting: true,

  historyOrderTableData: [],

  historyOrderDataTotal: 0,
  historyOrderDataPage: 1,
  historyOrderDataPageSize: 10,

  /* deals */
  dealsTableSpinning: true,
  dealsTableRequesting: true,

  dealsTableData: [],

  dealsDataTotal: 0,
  dealsDataPage: 1,
  dealsDataPageSize: 10,
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}resetPairsDropList`: {
      return {
        ...state,

        pairsDropList: [],
      }
    }
    case `${prefix}requestForSearchingPairs`: {
      return {
        ...state,

        pairsDropList: [...action.data],
      }
    }
    case `${prefix}requestForTotalOfCurrentOrder`: {
      return {
        ...state,

        currentOrderDataTotal: action.data,
      }
    }
    case `${prefix}requestForDataOfCurrentOrder`: {
      return {
        ...state,

        currentOrderTableData: [...action.data],
      }
    }
    case `${prefix}requestForTotalOfHistoryOrder`: {
      return {
        ...state,

        historyOrderDataTotal: action.data,
      }
    }
    case `${prefix}requestForDataOfHistoryOrder`: {
      return {
        ...state,

        historyOrderTableData: [...action.data],
      }
    }
    case `${prefix}requestForTotalOfDeals`: {
      return {
        ...state,

        dealsDataTotal: action.data,
      }
    }
    case `${prefix}requestForDataOfDeals`: {
      return {
        ...state,

        dealsTableData: [...action.data],
      }
    }
    default: {
      return state
    }
  }
}
