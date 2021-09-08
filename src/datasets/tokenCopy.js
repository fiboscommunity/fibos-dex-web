import { getPrecision } from 'Utils'

const checkTokenData = data => {
  let tmpName = null
  let tmpSymbol = null
  let tmpContract = null
  let tmpPrecision = 0

  if (data && data.name && data.precision) {
    tmpName = data.name

    const tmpStrArray = tmpName.split('@')

    tmpSymbol = tmpStrArray[0]
    tmpContract = tmpStrArray[1]

    tmpPrecision = getPrecision(data.precision)
  }

  return {
    tokenName: tmpName,
    symbol: tmpSymbol,
    contract: tmpContract,
    pre: tmpPrecision,
  }
}

function Token(tokenData) {
  const data = checkTokenData(tokenData)

  Object.defineProperty(this, '__data', {
    get: () => data,
    set: () => {},
  })

  Object.defineProperty(this, 'tokenName', {
    get: () => data.tokenName,
    set: () => {},
  })

  Object.defineProperty(this, 'tokenSymbol', {
    get: () => data.symbol,
    set: () => {},
  })

  Object.defineProperty(this, 'tokenContract', {
    get: () => data.contract,
    set: () => {},
  })

  Object.defineProperty(this, 'tokenPre', {
    get: () => data.pre,
    set: () => {},
  })
}

export default Token
