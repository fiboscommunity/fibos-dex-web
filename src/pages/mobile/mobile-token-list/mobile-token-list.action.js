import moment from 'moment'
import BigNumber from 'bignumber.js'

import { queryList, queryStr, sortMap, pairMap } from 'Config'
import { getPrecision, getStrWithPrecision, commonErrorHandler, req, errorHandler } from 'Utils'

const prefix = 'MobileTokenList_'

export const changeFieldValue = (field, value) => dispatch => {
  dispatch({
    type: `${prefix}changeFieldValue`,
    field,
    value,
  })
}

export const destroy = () => dispatch => {
  dispatch({
    type: `${prefix}destroy`,
  })
}

export const changeSorters = (key, data) => dispatch => {
  dispatch({
    type: `${prefix}changeSorters`,
    key,
    data,
  })
}

export const requestForTableData = cbs => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
      or: [{
        tokenx_id:{
          in: ${queryStr || []}
        }
      },{
        tokeny_id:{
          in: ${queryStr || []}
        }
      }]
  `

  const reqMessage = `
  {
    find_tokenpair(
      where:{${filterStr}
      },
      order: "-created"
    ){
      id,
      tokenx {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
        createdAt,
        updatedAt,
      },
      tokeny {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
        createdAt,
        updatedAt,
      }
      type,
      created,
    }
  }`

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_tokenpair) {
      const tmp = reponse.data.data.find_tokenpair || []

      const kdataReqParamsArr = []
      const tokenArr = []

      tmp.forEach(item => {
        if (queryList.indexOf(item.tokenx.id) >= 0 && queryList.indexOf(item.tokeny.id) >= 0) {
          let tmpTokenx = ''
          let tmpTokenxPre = ''
          let tmpTokeny = ''
          let tmpTokenyPre = ''
          let tmpNeedToReverse = false

          if (pairMap[item.tokeny.id] && pairMap[item.tokeny.id].map.indexOf(item.tokenx.id) >= 0) {
            tmpNeedToReverse = true
          }

          if (tmpNeedToReverse) {
            tmpTokenx = item.tokeny.id
            tmpTokenxPre = item.tokeny.precision
            tmpTokeny = item.tokenx.id
            tmpTokenyPre = item.tokenx.precision
          } else {
            tmpTokenx = item.tokenx.id
            tmpTokenxPre = item.tokenx.precision
            tmpTokeny = item.tokeny.id
            tmpTokenyPre = item.tokeny.precision
          }

          // tmpTokenx = item.tokenx.id
          // tmpTokenxPre = item.tokenx.precision
          // tmpTokeny = item.tokeny.id
          // tmpTokenyPre = item.tokeny.precision

          const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
          const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

          const tmpData = {
            tokenxName: tmpTokenx,
            tokenxSymbol,
            tokenxContract,
            tokenxPre: getPrecision(tmpTokenxPre),

            tokenyName: tmpTokeny,
            tokenySymbol,
            tokenyContract,
            tokenyPre: getPrecision(tmpTokenyPre),

            needToReverse: tmpNeedToReverse,
          }

          const tmpIndex = `${tmpTokenx}/${tmpTokeny}`

          if (tmpIndex in sortMap) {
            kdataReqParamsArr.push(tmpIndex)

            tokenArr.push(tmpData)
          }
        }
      })

      const now = moment(new Date())
      const nowVal = now.valueOf()

      const kdataReqParams = {
        duration: '24h',
        token_names: kdataReqParamsArr,
        stime: now.subtract(1, 'days').valueOf(),
        etime: nowVal,
      }

      req
        .callApi('/1.0/app/deal/kdata', 'post', kdataReqParams)
        .then(res => {
          const tmpResult = res.data.map((item, index) => {
            const tmpDateLists = item.dateLists ? item.dateLists['24h'] || {} : {}

            return {
              ...tmpDateLists,
              ...tokenArr[index],
            }
          })

          req
            .callApi('/1.0/app/tokenpair/batchgetSwapRankOnChain', 'post', {
              tokenpairs: kdataReqParamsArr,
            })
            .then(onChainRes => {
              if (
                onChainRes.data &&
                Object.prototype.toString.call(onChainRes.data) === '[object Array]'
              ) {
                onChainRes.data.forEach((onChainResItem, onChainResIndex) => {
                  let tmpResultItem = tmpResult[onChainResIndex]

                  let uniswapPriceBN = new BigNumber(0)
                  let uniswapPricePre = 0
                  if (Object.prototype.toString.call(onChainResItem.data) === '[object Array]') {
                    const tmpTotal = onChainResItem.data.pop()

                    const currentIndex = `${tmpTotal.tokenx}/${tmpTotal.tokeny}`
                    const reverseCurrentIndex = `${tmpTotal.tokeny}/${tmpTotal.tokenx}`
                    if (kdataReqParamsArr.indexOf(currentIndex) >= 0) {
                      uniswapPriceBN = new BigNumber(tmpTotal.tokeny_quantity).div(
                        tmpTotal.tokenx_quantity,
                      )
                      uniswapPricePre = getPrecision(tmpTotal.tokeny_quantity)
                    } else if (kdataReqParamsArr.indexOf(reverseCurrentIndex) >= 0) {
                      uniswapPriceBN = new BigNumber(tmpTotal.tokenx_quantity).div(
                        tmpTotal.tokeny_quantity,
                      )
                      uniswapPricePre = getPrecision(tmpTotal.tokenx_quantity)
                    }

                    tmpResultItem = {
                      ...tmpResultItem,
                      uniswapPriceBN,
                      uniswapPrice: getStrWithPrecision(uniswapPriceBN, uniswapPricePre, true),
                    }
                  }

                  const { oprice, nprice } = tmpResultItem
                  let dayChangeNumber = new BigNumber(NaN)

                  if (oprice && oprice !== 'Infinity' && nprice && nprice !== 'Infinity') {
                    dayChangeNumber = new BigNumber(nprice).minus(oprice)
                  }

                  if (!dayChangeNumber.isNaN()) {
                    const dayRateDrection = dayChangeNumber.isNegative() ? 'down' : 'up'
                    const dayRateBN = dayChangeNumber.div(oprice).times(100)

                    tmpResult[onChainResIndex] = {
                      ...tmpResultItem,
                      dayRateBN,
                      dayRate: dayRateBN.abs().toFixed(2, 1),
                      dayRateDrection,
                      dayChangeNumber,
                    }
                  } else {
                    tmpResult[onChainResIndex] = {
                      ...tmpResultItem,
                      dayRateBN: new BigNumber(0),
                      dayRate: '0.00',
                      dayRateDrection: 'up',
                      dayChangeNumber: '0',
                    }
                  }
                })

                const result = []

                tmpResult.forEach(item => {
                  const tmpIndex = `${item.tokenxName}/${item.tokenyName}`
                  if (tmpIndex in sortMap) {
                    result[sortMap[`${item.tokenxName}/${item.tokenyName}`]] = { ...item }
                  }
                })

                dispatch({
                  type: `${prefix}requestForTableData`,
                  data: [...result],
                })

                if (successCallback) {
                  try {
                    successCallback()
                  } catch (err) {
                    errorHandler(err)
                  }
                } else if (failCallback) {
                  try {
                    failCallback()
                  } catch (err) {
                    errorHandler(err)
                  }
                }
              }
            })
            .catch(failFuc)
        })
        .catch(failFuc)
    }
  }

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForSearchData = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''
  if (!!filter && !!filter.search) {
    filterStr += `
        or: [{
          tokenx_id:{
            like: "%${filter.search || ''}%"
          },
          status: {
            eq: "online"
          }
        },{
          tokeny_id:{
            like: "%${filter.search || ''}%"
          },
          status: {
            eq: "online"
          }
        }]
        `
  } else {
    filterStr += `
        status: {
          eq: "online"
        }
        `
  }

  const reqMessage = `
  {
    find_tokenpair(
      where:{${filterStr}
      },
      order: "-created"
    ){
      id,
      tokenx {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
        createdAt,
        updatedAt,
      },
      tokeny {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
        createdAt,
        updatedAt,
      }
      type,
      created,
    }
  }`

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_tokenpair) {
      const tmp = reponse.data.data.find_tokenpair || []

      const kdataReqParamsArr = []
      const tokenArr = []

      tmp.forEach(item => {
        let tmpTokenx = ''
        let tmpTokenxPre = ''
        let tmpTokeny = ''
        let tmpTokenyPre = ''
        let tmpNeedToReverse = false

        if (
          item.tokenx.id.toLowerCase().indexOf(filter.search.toLowerCase()) < 0 &&
          item.tokeny.id.toLowerCase().indexOf(filter.search.toLowerCase()) >= 0
        ) {
          tmpNeedToReverse = true
        }

        if (tmpNeedToReverse) {
          tmpTokenx = item.tokeny.id
          tmpTokenxPre = item.tokeny.precision
          tmpTokeny = item.tokenx.id
          tmpTokenyPre = item.tokenx.precision
        } else {
          tmpTokenx = item.tokenx.id
          tmpTokenxPre = item.tokenx.precision
          tmpTokeny = item.tokeny.id
          tmpTokenyPre = item.tokeny.precision
        }

        // tmpTokenx = item.tokenx.id
        // tmpTokenxPre = item.tokenx.precision
        // tmpTokeny = item.tokeny.id
        // tmpTokenyPre = item.tokeny.precision

        const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
        const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

        const tmpData = {
          tokenxName: tmpTokenx,
          tokenxSymbol,
          tokenxContract,
          tokenxPre: getPrecision(tmpTokenxPre),

          tokenyName: tmpTokeny,
          tokenySymbol,
          tokenyContract,
          tokenyPre: getPrecision(tmpTokenyPre),

          needToReverse: tmpNeedToReverse,
        }

        const tmpIndex = `${tmpTokenx}/${tmpTokeny}`

        kdataReqParamsArr.push(tmpIndex)
        tokenArr.push(tmpData)
      })

      const now = moment(new Date())
      const nowVal = now.valueOf()

      const kdataReqParams = {
        duration: '24h',
        token_names: kdataReqParamsArr,
        stime: now.subtract(1, 'days').valueOf(),
        etime: nowVal,
      }

      req
        .callApi('/1.0/app/deal/kdata', 'post', kdataReqParams)
        .then(res => {
          const tmpResult = res.data.map((item, index) => {
            const tmpDateLists = item.dateLists ? item.dateLists['24h'] || {} : {}

            return {
              ...tmpDateLists,
              ...tokenArr[index],
            }
          })

          req
            .callApi('/1.0/app/tokenpair/batchgetSwapRankOnChain', 'post', {
              tokenpairs: kdataReqParamsArr,
            })
            .then(onChainRes => {
              if (
                onChainRes.data &&
                Object.prototype.toString.call(onChainRes.data) === '[object Array]'
              ) {
                onChainRes.data.forEach((onChainResItem, onChainResIndex) => {
                  let tmpResultItem = tmpResult[onChainResIndex]

                  const { tokenxName, tokenyName, needToReverse } = tmpResultItem

                  let uniswapPriceBN = new BigNumber(0)
                  let uniswapPricePre = 0
                  if (Object.prototype.toString.call(onChainResItem.data) === '[object Array]') {
                    const tmpTotal = onChainResItem.data.pop()

                    const currentIndex = `${tokenxName}/${tokenyName}`
                    const reverseCurrentIndex = `${tokenyName}/${tokenxName}`

                    const getPairPrice = (toReverse = false) => {
                      const tmpUniswapPriceBN = toReverse
                        ? new BigNumber(tmpTotal.tokenx_quantity).div(tmpTotal.tokeny_quantity)
                        : new BigNumber(tmpTotal.tokeny_quantity).div(tmpTotal.tokenx_quantity)
                      const tmpUniswapPricePre = toReverse
                        ? getPrecision(tmpTotal.tokenx_quantity)
                        : getPrecision(tmpTotal.tokeny_quantity)

                      return {
                        priceBN: tmpUniswapPriceBN,
                        pricePre: tmpUniswapPricePre,
                      }
                    }

                    let priceObj = null

                    if (kdataReqParamsArr.indexOf(currentIndex) >= 0) {
                      if (needToReverse) {
                        priceObj = getPairPrice(true)
                      } else {
                        priceObj = getPairPrice()
                      }
                    } else if (kdataReqParamsArr.indexOf(reverseCurrentIndex) >= 0) {
                      if (needToReverse) {
                        priceObj = getPairPrice()
                      } else {
                        priceObj = getPairPrice(true)
                      }
                    }

                    if (priceObj) {
                      uniswapPriceBN = priceObj.priceBN
                      uniswapPricePre = priceObj.pricePre
                    }
                  }

                  tmpResultItem = {
                    ...tmpResultItem,
                    uniswapPriceBN,
                    uniswapPrice: getStrWithPrecision(uniswapPriceBN, uniswapPricePre, true),
                  }

                  const { oprice, nprice } = tmpResultItem
                  let dayChangeNumber = new BigNumber(NaN)

                  if (oprice && oprice !== 'Infinity' && nprice && nprice !== 'Infinity') {
                    dayChangeNumber = new BigNumber(nprice).minus(oprice)
                  }

                  if (!dayChangeNumber.isNaN()) {
                    const dayRateDrection = dayChangeNumber.isNegative() ? 'down' : 'up'
                    const dayRateBN = dayChangeNumber.div(new BigNumber(oprice)).times(100)

                    tmpResult[onChainResIndex] = {
                      ...tmpResultItem,
                      dayRateBN,
                      dayRate: dayRateBN.abs().toFixed(2, 1),
                      dayRateDrection,
                      dayChangeNumber,
                    }
                  } else {
                    tmpResult[onChainResIndex] = {
                      ...tmpResultItem,
                      dayRateBN: new BigNumber(0),
                      dayRate: '0.00',
                      dayRateDrection: 'up',
                      dayChangeNumber: '0',
                    }
                  }
                })

                const result = [...tmpResult]

                dispatch({
                  type: `${prefix}requestForSearchData`,
                  data: [...result],
                })

                if (successCallback) {
                  try {
                    successCallback()
                  } catch (err) {
                    errorHandler(err)
                  }
                } else if (failCallback) {
                  try {
                    failCallback()
                  } catch (err) {
                    errorHandler(err)
                  }
                }
              }
            })
            .catch(failFuc)
        })
        .catch(failFuc)
    }
  }

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}
