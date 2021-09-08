const prefix = 'Productions_'

const defaultConfigure = {
  /* token table */
  productionsTableSpinning: true,
  productionsTableRequesting: true,

  loadedPrice: false,
  loadedQuantity: false,

  tableData: [],

  productionsDataTotal: 0,
  productionsDataPage: 1,
  productionsDataPageSize: 10,
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}requestForTableDataTotalOfProductions`: {
      return {
        ...state,

        productionsDataTotal: action.data,
      }
    }
    case `${prefix}requestForProductionsTableData`: {
      return {
        ...state,
        tableData: [...action.data],
        loadedPrice: action.loadedPrice,
        loadedQuantity: action.loadedQuantity,
      }
    }
    default: {
      return state
    }
  }
}
