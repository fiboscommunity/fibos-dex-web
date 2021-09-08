const prefix = 'Capital_'

const defaultConfigure = {
  /* capital */
  capitalTableData: [],
  expandedRowKeys: [],
  tokenmap: [],
  chargeModalVisible: false,
  addressModalVisible: false,
  overTimeNotificationVisible: true,

  identifycode: null,
  expiredTime: null,
  capitalSpinning: true,
  formType: 'draw',
  qrcodeType: 'bind',
  selectToken: null,
  latestVerifyCode: null,
  inputValue: ['0'],
  tokenFilter: '',

  chargeAmount: 0,
  chargeAmountDec: 0,

  ethAddress: [],
  ethAddressAccessible: null,
  requestingAsset: false,
  requestingContract: false,
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}getAsset`: {
      return {
        ...state,
        capitalTableData: action.data,
        ethAddress: action.ethAddress,
        ethAddressAccessible: action.ethAddressAccessible,
      }
    }
    case `${prefix}getVerifyCode`: {
      return {
        ...state,
        latestVerifyCode: action.data,
      }
    }
    default: {
      return {
        ...state,
      }
    }
  }
}
