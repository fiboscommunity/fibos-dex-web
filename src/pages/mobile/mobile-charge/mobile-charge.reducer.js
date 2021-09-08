import { Token } from 'Datasets'

const prefix = 'MobileCharge_'

const defaultConfigure = {
  isSelecting: false,
  selectingToken: 'dst',

  requestingTokensForSelect: false,
  searchValue: undefined,
  tokensForSelect: [],
  tokensForSelectMap: {},

  ironmanReady: false,
  requestingAvailable: false,
  tableRowOfAccounts: {},

  requestingTemporayAddPairAvailable: false,
  temporayAddPairAvailable: false,

  requestingAddPair: false,

  addPairDstToken: new Token(),
  addPairDstTokenInput: undefined,
  addPairDstTokenInputObj: {},

  addPairSrcToken: new Token(),
  addPairSrcTokenInput: undefined,
  addPairSrcTokenInputObj: {},

  // eslint-disable-next-line no-dupe-keys
  // isSelecting: true,
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
    case `${prefix}requestForTokensForSelect`: {
      return {
        ...state,

        tokensForSelect: action.data,
        tokensForSelectMap: action.map,
      }
    }
    case `${prefix}checkTemporayPairAvailable`: {
      return {
        ...state,

        temporayAddPairAvailable: action.data,
      }
    }
    case `${prefix}resetSelectToken`: {
      return {
        ...state,
        isSelecting: false,
        selectingToken: 'dst',

        requestingTokensForSelect: false,
        searchValue: undefined,
        tokensForSelect: [],
        tokensForSelectMap: {},
      }
    }
    case `${prefix}resetAddPairs`: {
      return {
        ...state,

        requestingTokensForSelect: false,
        tokensForSelect: [],
        tokensForSelectMap: {},

        requestingTemporayAddPairAvailable: false,
        temporayAddPairAvailable: false,

        requestingAddPair: false,

        addPairDstToken: new Token(),
        addPairDstTokenInput: undefined,

        addPairSrcToken: new Token(),
        addPairSrcTokenInput: undefined,
      }
    }
    default: {
      return state
    }
  }
}
