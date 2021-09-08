import moment from 'moment'
import BigNumber from 'bignumber.js'

import { reversedPricePre } from 'Config'

export const getPrecision = data => {
  const snumber = `${data}`
  const dotIndex = snumber.indexOf('.')

  const result = dotIndex === -1 ? 0 : snumber.substring(dotIndex + 1).length

  return result
}

export const getStrWithPrecision = (data, precision, isRoundHalfUp = false) => {
  // ROUND_DOWN 1 截取
  // ROUND_HALF_UP 4 四舍五入

  if (typeof data !== 'string') {
    // throw 'Data type error'
  }
  const tmp = new BigNumber(`${data}`)
  const res = tmp.toFixed(precision, isRoundHalfUp ? 4 : 1)
  return res
}

export const getReversedPrice = price => {
  const tmp = new BigNumber(1).div(`${price}`)

  const res = getStrWithPrecision(tmp, reversedPricePre)

  return res
}

export const getDataListFromDataForCal = array => {
  const currentDateObj = moment(new Date())

  const tmpFilteredDateLists = []

  array.forEach(dataItem => {
    if (dataItem.datatime <= currentDateObj.valueOf()) {
      const tmpDatatime = moment(dataItem.datatime)

      if (
        tmpDatatime.dayOfYear() !== currentDateObj.dayOfYear() ||
        tmpDatatime.isoWeekYear() !== currentDateObj.isoWeekYear()
      ) {
        tmpFilteredDateLists.push(dataItem)
      }
    }
  })

  return tmpFilteredDateLists
}

export const getMiddlehandicap = (originData, isdec = false, dataindex = 'sum_quantity') => {
  if (originData.length === 0) {
    throw new Error('handcap list is empty!')
  }

  const handleDataFuc = toBeHandledData => {
    const tmpArray = [...toBeHandledData]
    const tmpMax = isdec
      ? new BigNumber(toBeHandledData[0][dataindex])
      : new BigNumber(toBeHandledData[toBeHandledData.length - 1][dataindex])

    if (tmpArray.length > 1) tmpArray.shift()
    if (tmpArray.length > 1) tmpArray.shift()
    if (tmpArray.length > 1) tmpArray.pop()
    if (tmpArray.length > 1) tmpArray.pop()

    const tmpLength = tmpArray.length

    let tmpSum = new BigNumber(0)

    tmpArray.forEach(item => {
      tmpSum = tmpSum.plus(item[dataindex])
    })

    let result = tmpSum.div(tmpLength).times(2)

    // if (result.gt(tmpMax)) result = tmpMax
    if (result.gt(tmpMax)) {
      if (tmpArray.length > 1) {
        result = getMiddlehandicap(tmpArray, isdec, dataindex)
      } else {
        result = parseFloat(tmpArray[0][dataindex])
      }
    }

    return new BigNumber(result).toNumber()
  }

  return handleDataFuc(originData)
}
