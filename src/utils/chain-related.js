import BigNumber from 'bignumber.js'

export const clearDefault = true

// const test = sortTokens('FO@eosio', 4, 'FOUSDT@eosio', 6)
export const sortTokens = (a, ap, b, bp) => {
  const charToSymbol = c => {
    if (c >= 97 && c <= 122) return c - 97 + 6
    if (c >= 49 && c <= 53) return c - 49 + 1
    // if (c >= 65 && c <= 90) return (c - 65) + 2
    return 0
  }

  const stringToName = str => {
    const len = str.length

    let value = new BigNumber(0)

    for (let i = 0; i <= 12; i += 1) {
      let c = 0
      if (i < len && i <= 12) {
        c = charToSymbol(str.charCodeAt(i))
      }

      if (i < 12) {
        // eslint-disable-next-line no-bitwise
        c &= 0x1f
        let bC = new BigNumber(c)

        bC = bC.times(new BigNumber(2).pow(64 - 5 * (i + 1)))
        value = value.plus(bC)
      } else {
        // eslint-disable-next-line no-bitwise
        c &= 0x0f
        value = value.plus(c)
      }
    }

    return value.toFixed()
  }

  const stringToSymbol = (precision, str) => {
    let result = new BigNumber(0)

    for (let i = 0, len = str.length; i < len; i += 1) {
      const c = str.charCodeAt(i)
      const bC = new BigNumber(c)

      if (str[i] < 'A' || str[i] > 'Z') {
        // ERRORS?
      } else {
        result = result.plus(bC.times(new BigNumber(2).pow(8 * (1 + i))))
      }
    }

    result = result.plus(precision)

    return result.toFixed()
  }

  const x = a.split('@')
  const y = b.split('@')

  if (new BigNumber(stringToSymbol(ap, x[0])).gt(stringToSymbol(bp, y[0]))) {
    return [a, b]
  }

  if (
    new BigNumber(stringToSymbol(ap, x[0])).eq(stringToSymbol(bp, y[0])) &&
    new BigNumber(stringToName(x[1]), stringToName(y[1]))
  ) {
    return [a, b]
  }

  return [b, a]
}
