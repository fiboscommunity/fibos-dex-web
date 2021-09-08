import { getPrecision } from 'Utils'

const checkTokenData = data => {
  if (data && data.id && Object.prototype.toString.call(data.id) === '[object String]') {
    const tmpId = data.id

    const tmpStrArray = tmpId.split('@') || []

    const [tmpSymbol, tmpContract] = tmpStrArray

    let tmpDslName = null
    if (tmpContract === 'eosio') {
      tmpDslName = tmpSymbol
    } else {
      tmpDslName = tmpId
    }

    let tmpPrecision = null
    if (data.precision) {
      tmpPrecision = getPrecision(data.precision)
    }

    let tmpSupply = null
    if (data.supply) {
      tmpSupply = data.supply
    }

    let tmpReserveSupply = null
    if (data.reserve_supply) {
      tmpReserveSupply = data.reserve_supply
    }

    let tmpCreated = null
    if (data.created) {
      tmpCreated = data.created
    }

    let tmpPosition = 0
    if (data.position) {
      tmpPosition = data.position
    }

    let tmpIsSmart = false
    if (data.connector_weight) {
      tmpIsSmart = parseFloat(data.connector_weight) > 0
    }

    let tmpCwToken = null
    if (data.cw_name) {
      tmpCwToken = data.cw_name
    }

    return {
      dslName: tmpDslName,
      id: tmpId,
      symbol: tmpSymbol || null,
      contract: tmpContract || null,
      pre: tmpPrecision,

      supply: tmpSupply,
      reserve_supply: tmpReserveSupply,
      created: tmpCreated,

      position: tmpPosition,
      isSmart: tmpIsSmart,
      cwToken: tmpCwToken,
    }
  }

  return {
    dslName: null,
    id: null,
    symbol: null,
    contract: null,
    pre: 0,

    supply: null,
    reserve_supply: null,
    created: null,

    position: 0,
    isSmart: false,
    cwToken: null,
  }
}

function TokenClass(tokenData) {
  const data = checkTokenData(tokenData)

  Object.defineProperty(this, 'data', {
    get: () => ({ ...tokenData }),
    set: () => {},
  })

  Object.defineProperty(this, 'dslName', {
    value: data.dslName,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'id', {
    value: data.id,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'tokenSymbol', {
    value: data.symbol,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'tokenContract', {
    value: data.contract,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'tokenPre', {
    value: data.pre,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'supply', {
    value: data.supply,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'reserve_supply', {
    value: data.reserve_supply,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'created', {
    value: data.created,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'position', {
    value: data.position,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'isSmart', {
    value: data.isSmart,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  Object.defineProperty(this, 'cwToken', {
    value: data.cwToken,
    writable: false,
    enumerable: true,
    configurable: false,
  })
}

export default TokenClass
