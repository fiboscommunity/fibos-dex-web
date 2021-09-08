import { producitonCount } from 'Config'

const prefix = 'Markets_'

const defaultConfigure = {
  /* token table */
  tokenTableSpinning: true,
  tokenTableRequesting: true,

  srcToken: 'FO',

  tableData: {
    FO: [],
    FOUSDT: [],
  },

  npriceSort: false,
  dayRateSort: false,
  quantitysSort: false,

  /* production grid */
  productionGridSpinning: true,
  productionGridRequesting: true,

  gridData: Array(producitonCount)
    .fill(undefined)
    .map(() => ({})),

  gridDataTotal: 0,
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}requestForTableData`: {
      return {
        ...state,
        tableData: {
          ...state.tableData,
          [action.srcTokenName]: [...action.data],
        },
      }
    }
    case `${prefix}changeSorters`: {
      switch (action.key) {
        case 'uniswapPriceBN':
          return {
            ...state,
            npriceSort: action.data,
            dayRateSort: false,
            quantitysSort: false,
          }

        case 'dayRate':
          return {
            ...state,
            npriceSort: false,
            dayRateSort: action.data,
            quantitysSort: false,
          }

        case 'quantitys':
          return {
            ...state,
            npriceSort: false,
            dayRateSort: false,
            quantitysSort: action.data,
          }

        default:
          return {
            ...state,
            npriceSort: false,
            dayRateSort: false,
            quantitysSort: false,
          }
      }
    }
    case `${prefix}requestForProductionData`: {
      return {
        ...state,

        gridData: [...action.data],
      }
    }
    case `${prefix}requestForTotalOfProductionData`: {
      return {
        ...state,

        gridDataTotal: action.data,
      }
    }
    default: {
      return state
    }
  }
}
