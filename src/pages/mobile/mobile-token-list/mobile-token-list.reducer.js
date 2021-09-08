const prefix = 'MobileTokenList_'

const defaultConfigure = {
  /* token table */
  tokenTableSpinning: true,
  tokenTableRequesting: true,

  srcToken: 'FO',

  tableData: [],

  npriceSort: false,
  dayRateSort: false,

  /* search table */
  isSearching: false,
  searchValue: undefined,

  searchTableSpinning: false,
  searchTableRequesting: false,
  searchData: [],
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
        tableData: [...action.data],
      }
    }
    case `${prefix}requestForSearchData`: {
      return {
        ...state,
        searchData: [...action.data],
      }
    }
    case `${prefix}changeSorters`: {
      switch (action.key) {
        case 'uniswapPriceBN':
          return {
            ...state,
            npriceSort: action.data,
            dayRateSort: false,
          }

        case 'dayRate':
          return {
            ...state,
            npriceSort: false,
            dayRateSort: action.data,
          }

        case 'quantitys':
          return {
            ...state,
            npriceSort: false,
            dayRateSort: false,
          }

        default:
          return {
            ...state,
            npriceSort: false,
            dayRateSort: false,
          }
      }
    }
    default: {
      return state
    }
  }
}
